import tpl from './machineData.html';
import tp2 from './machineDataDetail.html';
import './machineData.less';
import Waterfall from '../../../../static/responsive_waterfall.js';
import toastTpl from '../../../../common/directives/restartBle-toast.html';
import cellTpl from './machineDataCell.html';

angular.module('app').component('machineData', {
    template: tpl,
    controller: machineDataCtrl,
    controllerAs: 'machineData'
}).component('machineDataDetail', {
    template: tp2,
    controller: machineDataDetailCtrl,
    controllerAs: 'detail'
}).filter('validData', function (item) {
    // 篩出需要的資料: 單筆及已選取的連續型資料
    return !item.IsRepeated || (item.IsRepeated && item.IsSelected);
});

machineDataCtrl.$inject = ['$scope', '$rootScope', 'SettingService', 'machineDataService', '$stateParams', '$mdDialog', '$state', 'showMessage', 'nfcService', '$filter'];

function machineDataCtrl(
    $scope,
    $rootScope,
    SettingService,
    machineDataService,
    $stateParams,
    $mdDialog,
    $state,
    showMessage,
    nfcService,
    $filter
) {

    const self = this;
    const stateHeaderId = $stateParams.headerId;
    const statePatientId = $stateParams.patientId;
    const currentUserInfo = SettingService.getCurrentUser();

    let $translate = $filter('translate');

    self.serviceData = null;
    self.lastAccessTime = moment();

    $scope.$on('machineDataRefresh', () => {
        self.refresh();
    });

    self.$onInit = function onInit() {
        self.loading = true;
        self.getList(stateHeaderId, false);

        // summary card 不需監聽
        if (cordova.platformId !== 'browser' && $state.current.name === 'machineData') {
            // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
            nfcService.listenTag(_searchByRfid);
            nfcService.listenNdef(_searchByRfid);
        }
        // ui-grid init
        self.gridOptions = {
            angularCompileRows: true,
            defaultColDef: {
                width: 100,
                resizable: true,
                // cellStyle: {
                //     'white-space': 'normal',
                //     'word-break': 'break-all' // 英文字才會斷行
                // }
            },
            // onColumnResized: onColumnResized,
            // enableColumnMenus: false,   // https://stackoverflow.com/questions/32671202/remove-sorting-menu-from-ui-grid-column-header
            // enableSorting: false,
            // excessRows: 20,
            // rowHeight: 70,
            // headerCellClass: 'text-center'


            // ui-grid header
            columnDefs: [
                {
                    field: 'DialysisTime',
                    headerName: $translate('machineData.machineDataDetail.time'),
                    width: 140,
                    pinned: 'left',
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'bloodPressure',
                    headerName: $translate('machineData.machineData.bloodPressure'),
                    width: 110,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'BloodFlowRate',
                    headerName: $translate('machineData.machineData.BloodFlowRate'),
                    width: 110,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'VenousPressure',
                    headerName: $translate('machineData.machineData.VenousPressure'),
                    width: 110,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'TMP',
                    headerName: $translate('machineData.machineData.TMP'),
                    width: 110,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'UFRate',
                    headerName: $translate('machineData.machineData.UFRate'),
                    width: 110,
                    autoHeight: true,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    field: 'AssessmentItems',
                    headerName: $translate('machineData.machineData.assessment '),
                    width: 220,
                    cellRenderer: cellRenderer,
                    // cellTemplate: cellTpl
                },
                {
                    // 複製 刪除
                    field: 'Status',
                    headerName: '',
                    width: 110,
                    // cellTemplate: cellTpl
                    cellRenderer: cellRenderer,
                }
            ]

        };
    };
    function onColumnResized() {
        self.gridOptions.api.resetRowHeights();
    }

    function cellRenderer(params) {
        params.$scope.del = del;
        params.$scope.checkCanAccess = checkCanAccess;
        params.$scope.goto = $scope.goto;
        function avoidEmptyStr(value) {
            return value || '';
        }
        function avoidEmptyStr1(value) {
            let split = value.split('[""]');
            return split;
        }
        switch (params.colDef.field) {
            case 'bloodPressure':
                return `<div style="width:100%;height:100%;" ng-click="goto('${params.data.Id}')" layout="column"
                layout-align="center center">${avoidEmptyStr(params.data.BPS)}/${avoidEmptyStr(params.data.BPD)}</div>`;
            case 'Status':
                return `<div style="width:100%;height:100%;" layout="row" layout-align="start center">
                <md-icon class="md-secondary" ng-show="checkCanAccess('${params.data.CreatedUserId}','${params.data.Status}','${params.data.ModifiedUserId}')"
                    ng-click="del('${params.data.Id}')" md-svg-icon="static/img/svg/ic_delete_black_24px.svg"></md-icon>
            </div> `;
            case 'AssessmentItems':
                return `
                <div style="width:100%;height:100%;" ng-click="goto('${params.data.Id}')">
                    <div ng-repeat="(k, v) in data.AssessmentItems" layout="column" style="display: block;
                    overflow: hidden; text-overflow: ellipsis;"
                    layout-align="center center">{{::k}}：{{::v.join('，')}}</div>
                </div>
                `;
            default:
                return `<div style="width:100%;height:100%;" ng-click="goto('${params.data.Id}')" layout="column"
                layout-align="center center">${avoidEmptyStr(params.value)}</div>`;

        }
    }

    // 取得列表資料
    self.getList = function getList(id, isForce) {
        machineDataService.getByHeaderId(id, isForce).then((q) => {
            // console.log('洗中 q', q);
            self.serviceData = q.data;
            console.log('aaa', self.serviceData);
            if (Array.isArray(q.data) && q.data.length > 0) {
                q.data.map(item => {
                    item.DialysisTime = moment(item.DialysisTime).format('YYYY-MM-DD HH:mm');
                    if (item.BPD != null || item.BPS != null) {
                        item.bloodPressure = `${item.BPS}/${item.BPD}`;
                    }
                    // if (item.BPD == null && item.BPS == null) {
                    //     item.bloodPressure = '';
                    // }
                    // if (item.BPD == null) {
                    //     item.BPD = '';
                    // }
                    // if (item.BPS == null) {
                    //     item.BPS = '';
                    // }
                });
            }
            self.lastAccessTime = machineDataService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
            // $scope.gridOptions.data = prepareData(self.serviceData);
            self.gridOptions.api.setRowData(self.serviceData);
            setTimeout(() => {
                self.gridOptions.api.resetRowHeights();
            }, 0);
        }, (reason) => {
            self.loading = false;
            self.isError = true;
        });
    };

    //過濾需要的資料並排序
    function prepareData(data) {
        if (!data || data.length < 1) {
            return [];
        }

        return _.orderBy(_.filter(data, (item) => {
            return !item.IsRepeated || (item.IsRepeated && item.IsSelected);
        }), ['DialysisTime', 'CreatedTime'], ['desc', 'desc']);
    }

    function _searchByRfid(rfid) {
        if (rfid.Data) {
            self.loading = true;
            self.goto('create', rfid.Data);
            self.loading = false;
        }
    }
    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        self.serviceData = [];
        self.getList(stateHeaderId, true);
    };

    // 刪除
    function del(id) {
        const confirm = $mdDialog.confirm()
            .title($translate('machineData.machineData.component.confirmDelete'))
            .clickOutsideToClose(true)
            .textContent('')
            .ok($translate('machineData.machineData.component.deleteOk'))
            .cancel($translate('machineData.machineData.component.deleteCancel'));

        $mdDialog.show(confirm).then(() => {
            // 讓畫面 loading
            self.loading = true;

            // 若為連續性資料應用 update 修改 isSelected 的 flag，並將 DialysisId 清空
            let index = _.findIndex(self.serviceData, { Id: id });
            if (self.serviceData[index].IsSelected) {
                self.serviceData[index].IsSelected = false;
                self.serviceData[index].DialysisId = '';
                self.serviceData[index].ModifiedUserId = currentUserInfo.Id;
                self.serviceData[index].ModifiedUserName = currentUserInfo.Name;
                self.serviceData[index].ModifiedTime = moment();
                machineDataService.put(self.serviceData[index]).then((res) => {
                    self.loading = false;
                    if (res.status === 200) {
                        console.log('aaa', res);
                        showMessage($translate('machineData.machineData.component.deleteSuccess'));
                        self.getList(stateHeaderId, false);
                    } else {
                        showMessage($translate('machineData.machineData.component.deleteFail', { statusText: res.statusText }));
                    }
                }, (err) => {
                    self.loading = false;
                    showMessage($translate('machineData.machineData.component.deleteFail', { statusText: err.statusText }));
                });

            } else {
                machineDataService.delete(
                    id,
                    currentUserInfo.Id)
                    .then((res) => {
                        self.loading = false;
                        if (res.status === 200) {
                            showMessage($translate('machineData.machineData.component.deleteSuccess'));
                            self.getList(stateHeaderId, false);
                        } else {
                            showMessage($translate('machineData.machineData.component.deleteFail', { statusText: res.statusText }));
                        }
                    }, (err) => {
                        self.loading = false;
                        showMessage($translate('machineData.machineData.component.deleteFail', { statusText: err.statusText }));
                    });
            }
        }, () => {
            // do nothing
        });
    };

    self.title = 'this is machineData component page';

    // 確認權限是否能修改
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    }

    self.goback = function goback() {
        // $rootScope.$emit('stateGoBack');
        history.go(-1);
    };

    // 移至透析機資料
    $scope.goto = function goto(value, mac) {
        $state.go('machineDataDetail', {
            patientId: statePatientId,
            headerId: stateHeaderId,
            machineDataId: value,
            macId: mac
        });
    };

}

machineDataDetailCtrl.$inject = ['$mdToast', 'SettingService', 'machineDataService', 'bleService', 'raspberryPiService', 'machineService', 'dialysisService', '$stateParams', '$state', 'showMessage', '$timeout', '$mdDialog', 'nfcService', '$filter', '$mdSidenav', 'cursorInput', 'PatientService', 'assessmentService', '$q', 'OverViewService'];
function machineDataDetailCtrl($mdToast, SettingService, machineDataService, bleService, raspberryPiService, machineService, dialysisService, $stateParams, $state, showMessage, $timeout, $mdDialog, nfcService, $filter, $mdSidenav, cursorInput, PatientService, assessmentService, $q, OverViewService) {


    const self = this;

    let $translate = $filter('translate');

    self.iosNFCSupport = false;
    const currentUserInfo = SettingService.getCurrentUser();
    self.prescription = null;   // 新增時需要處方的資料; 比對目前資料，若不同則給警示
    self.canAccess = true;  // 供 template 判斷是否為唯讀

    // 提示相關，供畫面判斷是否要顯示提示
    // TargetUF v.s. DehydrationSetting; DialysateTemperature v.s. DialysateTemperature; DialysisateFlowRate v.s. DialysateFlowRate; UFTime v.s. Duration.Hours:Duration.Minutes
    self.errMsg = {
        BloodFlowRate: false,
        TargetUF: false,
        DialysateTemperature: false,
        DialysisateFlowRate: false,
        UFTime: false
    };
    self.machineDataId = $stateParams.machineDataId;
    self.loading = true;
    self.serviceData = {};
    self.hours = [];
    for (let i = 0; i < 24; i++) {
        self.hours.push(('0' + i).slice(-2));
    }
    self.minutes = [];
    for (let i = 0; i < 60; i++) {
        self.minutes.push(('0' + i).slice(-2));
    }
    self.uftimehours = [];
    for (let i = 0; i < 5; i++) {
        self.uftimehours.push(('0' + i).slice(-2));
    }
    // 預設時間格式
    self.datetimepickerOption = {
        format: 'YYYY-MM-DD HH:mm',
        sideBySide: true
    };
    self.timepickerOption = {
        format: 'HH:mm'
    };

    let previousData; // 存取上一筆透析機資料

    self.bleStatus = $translate('machineData.machineDataDetail.component.bleConnecting');

    // pi 相關
    let scanPiSec = raspberryPiService.getScanPiSec();
    let scanPiBufferTime = raspberryPiService.getScanPiBufferTime();

    let isCreatedTimeChecked = false;   // 判斷新增是否已確認過表單時間，因為會有兩種方式進入此頁(靠卡及一般進入)

    // 洗中評估
    // 洗中評估內容
    self.assessmentItems = {};
    self.showMesoAssessment = false; // 顯示洗中評估全卡


    // 初始值
    self.$onInit = function onInit() {

        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getModuleFunctions();

        // 取得病人資料, 顯示於畫面上方標題列
        // PatientService.getById($stateParams.patientId).then((res) => {
        //     self.patient = res.data;
        // });

        nfcService.listenNdef(_readNDEF);
        document.addEventListener('volumeupbutton', self.scanBarCode);
        document.addEventListener('volumedownbutton', self.scanBarCode);
        document.addEventListener('deviceready', onDeviceReady);

        // check whether ble is enabled or not.
        switch (cordova.platformId) {
            case 'android':
                // 若為讀資料:
                // 1. 先讓提示畫面出來
                // 2. 給確認 location 完後的 callback
                let locationCallback = null;
                if ($stateParams.macId) {
                    // 先確認新增時間是否為今日表單
                    isCreatedTimeChecked = true;
                    self.showReading = true;
                    checkDialysisHeaderIsTodayAndShowAlert().then(() => {
                        locationCallback = () => { self.read($stateParams.macId); };
                        bleService.isEnabled().then(() => {
                            // android 可不 scan 因此不需要定位權限
                            // bleService.checkLocationPermissionAndExecute(locationCallback);
                            locationCallback();
                        }).catch(() => {
                            // enable
                            bleService.setEnableCallback(() => {
                                // android 可不 scan 因此不需要定位權限
                                // bleService.checkLocationPermissionAndExecute(locationCallback);
                                locationCallback();
                            });
                            bleService.enableWithoutAlert((err) => {
                                /*
                                    若藍牙已開啟會回：
                                        error:"disable"
                                        message:"Bluetooth not disabled"
                                */
                                if (err && err.message && err.message.toLowerCase() !== 'bluetooth not disabled') {
                                    showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                                }
                            });
                        });
                    }, () => {
                        history.go(-1);
                    });
                } else {
                    bleService.isEnabled().then(() => {
                        // android 可不 scan 因此不需要定位權限
                        // bleService.checkLocationPermissionAndExecute(locationCallback);
                    }).catch(() => {
                        // enable
                        bleService.setEnableCallback(() => {
                            // android 可不 scan 因此不需要定位權限
                            // bleService.checkLocationPermissionAndExecute(locationCallback);
                        });
                        bleService.enableWithoutAlert((err) => {
                            /*
                                若藍牙已開啟會回：
                                    error:"disable"
                                    message:"Bluetooth not disabled"
                            */
                            if (err && err.message && err.message.toLowerCase() !== 'bluetooth not disabled') {
                                showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                            }
                        });
                    });
                }

                break;
            case 'ios':
                bleService.isEnabled(() => {
                    if ($stateParams.macId) {
                        self.read($stateParams.macId);
                    } else {
                        // self.scanPi();
                    }
                }, () => {
                    showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                });
                break;
            default:
                break;
        }

        if (self.machineDataId !== 'create') {
            // 修改
            machineDataService.get(self.machineDataId).then((q) => {
                console.log('修改 一開始透析機資料 q ', q);
                self.serviceData = q.data;

                // 修改時需再確認權限
                checkCanAccess(self.serviceData.CreatedUserId, self.serviceData.ModifiedUserId);

                self.date = moment(self.serviceData.DialysisTime).millisecond(0).toDate();
                self.hour = moment(self.serviceData.DialysisTime).format('HH');
                self.minute = moment(self.serviceData.DialysisTime).format('mm');

                // 判斷 Mode，決定要顯示或隱藏欄位
                self.checkMode(self.serviceData.HDFType);

                // 剩餘時間資料庫只存HH:mm ，所以要將它轉換成時間格式
                // if (self.serviceData.UFTime) {
                //    self.serviceData.UFTime = moment(`${moment().format('YYYY-MM-DD')} ${self.serviceData.UFTime}`);
                // }

                // slice if there is MacAddress
                // for 畫面顯示的 mac address，避免影響之後要上傳的資料
                // 判斷資料來源: 手動 -> 無 Mac, 單筆 -> IsRepeated == false, 連續型 -> IsRepeated == true
                if (self.serviceData.MacAddress) {
                    self.macAddr = self.serviceData.MacAddress.slice(-6);
                    if (self.serviceData.IsRepeated) {
                        self.dataSource = $translate('machineData.machineDataDetail.component.continuous');
                    } else {
                        self.dataSource = $translate('machineData.machineDataDetail.component.single');
                    }
                    // self.serviceData.MacAddress = self.serviceData.MacAddress.slice(-6);
                } else {
                    self.dataSource = $translate('machineData.machineDataDetail.component.manual');
                }

                // 剩餘時間改成兩個 input
                if (self.serviceData.UFTime && self.serviceData.UFTime.includes(':')) {
                    self.uftimehour = self.serviceData.UFTime.split(':')[0];
                    self.uftimeminute = self.serviceData.UFTime.split(':')[1];
                }

                // 取得洗中評估：依照透析機資料內的評估版本號，取得相對應的評估問題 AssessmentVersion
                if (self.serviceData.AssessmentVersion !== null) {
                    getMesoAssessmentByVersion(self.serviceData.AssessmentVersion).then(() => {
                        // 處理洗中評估
                        if (!_.isEmpty(q.data.AssessmentItems)) {
                            // 有值時，自動打開評估表
                            self.openMesoAssessment();
                            self.assessmentItems = q.data.AssessmentItems;
                            // Other 不是最後一個就是倒數第二個
                            _.forEach(self.assessmentItems, function (value, key) {
                                for (let i = value.length - 1; i >= 0; i--) {
                                    if (value[i] === 'Other') {
                                        // console.log('有 other', key);
                                        // 如果 other 的下一位有值 -> OtherInput
                                        if (value[i + 1]) {
                                            let otherInputValue = value[i + 1];
                                            // 先刪掉再加入，否則會重複
                                            value.pop();
                                            self.assessmentItems[key]['OtherInput'] = otherInputValue;
                                        }
                                        return;
                                    }
                                }
                            });
                        }
                        // console.log('1處理洗中評估', self.assessmentItems);
                    }, () => {
                        self.loading = false;
                        self.isError = true;
                    });
                } else {
                    // 沒有評估版本號AssessmentVersion，取得最後一筆洗中評估問題
                    getMesoAssessment();
                }
                self.loading = false;
                self.isError = false; // 顯示伺服器連接失敗的訊息
            }, (reason) => {
                self.loading = false;
                self.isError = true;
            });
        } else {
            // 新增
            // 取得洗中評估
            getMesoAssessment();
            if (!isCreatedTimeChecked) {
                isCreatedTimeChecked = true;
                checkDialysisHeaderIsTodayAndShowAlert().then(() => {
                    createInitData();
                }, () => {
                    history.go(-1);
                });
                return;
            }
            createInitData();

        }
    };

    function createInitData() {
        // 取得透析機資料，來判斷是否要顯示 ditto 的按鈕
        machineDataService.getByHeaderId($stateParams.headerId, false).then((q) => {
            self.isDitto = q.data.length > 0;
            self.serviceData = {
                DialysisTime: new Date()
            };
            self.date = moment().millisecond(0).toDate();
            self.hour = moment().format('HH');
            self.minute = moment().format('mm');

            // 剩餘時間改成兩個 input
            if (self.serviceData.UFTime && self.serviceData.UFTime.includes(':')) {
                self.uftimehour = self.serviceData.UFTime.split(':')[0];
                self.uftimeminute = self.serviceData.UFTime.split(':')[1];
            }

            // 新增透析機資料時，透析液濃度預設值及模式從處方中帶入
            OverViewService.getByHeaderId($stateParams.headerId).then((res) => {

                console.log('透析機表頭 res', res);

                if (res.data.DehydrationSetting) {
                    self.dehydrationSetting = res.data.DehydrationSetting;   // 設定脫水量 kg
                }
                if (res.data.Prescription) {
                    self.prescription = res.data.Prescription;
                    console.log('machineDataDetail prescription', self.prescription);
                    if (self.prescription.Dialysate) {
                        self.serviceData.DialysateA = self.prescription.Dialysate;
                    }
                    if (self.prescription.DialysisMode && self.prescription.DialysisMode.Name) {
                        self.serviceData.HDFType = self.prescription.DialysisMode.Name;
                        // 判斷 Mode，決定要顯示或隱藏欄位
                        self.checkMode(self.serviceData.HDFType);
                    }
                }
            }, () => { });

            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息

            // 取得上一筆以供 ditto 時使用及比對 MacAddress 時使用
            machineDataService.getLastByHeaderId($stateParams.headerId).then((res) => {
                previousData = angular.copy(res.data);
            }, () => { });

        }, (reason) => {
            self.loading = false;
            self.isError = true;
        });
    }

    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    }

    // HDFType 改變時，確認是否要顯示相關欄位
    self.checkMode = function (mode) {
        // 符合 CRRT 模式的條件
        // if (mode && mode.match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/i)) {
        //     console.log('isCRRTMode');
        //     self.isCRRT = true;
        // } else {
        self.isCRRT = false;
        // }

        // 是否要 show volume /sub volume -> CVVH 及 F 結尾
        if (mode && mode.match(/(^cvvh$)|(f$)/i)) {
            self.showVolume = true;
        } else {
            self.showVolume = false;
        }

    };

    // 洗中評估：卡片的開關
    self.openMesoAssessment = function openMesoAssessment() {
        self.showMesoAssessment = !self.showMesoAssessment;
        $timeout(() => {
            var waterfall = new Waterfall({ minBoxWidth: 200 });
        }, 500);
    };

    // 新增時 洗中評估：取得最後一筆洗中評估問題
    function getMesoAssessment() {
        const deferred = $q.defer();
        let type = 'in'; // 洗中評估 type
        assessmentService.getByType(type).then((q) => {
            // console.log('new 取得洗中評估 q', q);
            self.questions = q.data.Items;
            self.Revision = q.data.Revision; // 評估資料內的版本號，之後要帶入透析機資料
            self.loading = false;
            deferred.resolve();
        }, () => {
            self.loading = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
            deferred.reject();
        });
        return deferred.promise;
    }


    // 修改時 洗中評估：依評估版本號取得洗中評估問題
    function getMesoAssessmentByVersion(version) {
        const deferred = $q.defer();
        let type = 'in'; // 洗中評估 type
        assessmentService.getTypeByVersion(type, version).then((q) => {
            // console.log('update 取得洗中評估 q', q);
            self.questions = q.data.Items;
            self.loading = false;
            deferred.resolve();
        }, () => {
            self.loading = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
            deferred.reject();
        });
        return deferred.promise;
    }

    // 洗中評估：勾選內容
    self.toggle = function (title, item) {
        // check if the object exists, if not create an object with an empty array
        if (!self.assessmentItems[title]) {
            self.assessmentItems[title] = [];
        }
        // find the index of the item in the array
        let idx = self.assessmentItems[title].indexOf(item);
        if (idx > -1) {
            // remove the item from the array if it's found
            self.assessmentItems[title].splice(idx, 1);
        } else {
            // add the item into the array
            self.assessmentItems[title].push(item);
        }
        // console.log('toggle', self.assessmentItems);
    };
    // check if item exists and set the checkbox status
    self.exists = function (title, item) {
        if (self.assessmentItems[title]) {
            return self.assessmentItems[title].indexOf(item) > -1;
        }
    };

    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
        // nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', self.scanBarCode);
        document.removeEventListener('volumedownbutton', self.scanBarCode);
        document.removeEventListener('deviceready', onDeviceReady);

        // 離開此頁時，重新開啟藍牙 android & card only
        if (cordova.platformId === 'android') {
            // 隱藏 toast
            if (document.getElementById('restart-ble-toast')) {
                $mdToast.hide();
            }
            // 重新開啟藍牙
            console.log('onDestroy disconnect start');
            bleService.disconnect().then(() => {
                bleService.setDisableCallback(() => {
                    bleService.enableWithoutAlert();
                });
                bleService.disable();
            });
        }
    };

    // 確認目前新增所在的表單是否為 6 小時內的
    function checkDialysisHeaderIsTodayAndShowAlert() {
        return new Promise((resolve, reject) => {
            console.log('CheckDialysisHeaderIsToday');
            // 107.05.18 惠珊說本來 24 小時太長，應改為 6 小時
            dialysisService.getCreatedTimeByHeaderId($stateParams.patientId, $stateParams.headerId).then((res) => {
                if ((res && moment().diff(moment(res), 'hours') < 6) || isDestroyed) {
                    resolve();
                    return;
                }

                // 設定對話視窗參數
                const confirm = $mdDialog.confirm()
                    .title($translate('machineData.machineDataDetail.component.checkDialysisHeaderIsTodayTitle'))
                    .textContent($translate('machineData.machineDataDetail.component.checkDialysisHeaderIsToday', { dialysisTime: moment(res).format('MM/DD-HH:mm'), nowTime: moment().format('MM/DD-HH:mm') }))
                    .ok($translate('machineData.machineDataDetail.component.create'))
                    .cancel($translate('customMessage.cancel'));

                // 呼叫對話視窗
                $mdDialog.show(confirm).then(() => {
                    resolve();
                }, () => {
                    reject();
                });
            }, () => {
                resolve();
            });
        });
    }

    self.connectPi = function (macStr) {
        $timeout(() => {
            self.reading = true;
            self.showReading = true;
        }, 0);
        let macAddr = '';
        for (let i = 0; i < macStr.length;) {
            macAddr += macStr.slice(i, i += 2);
            if (i !== 12) {
                macAddr += ':';
            }
        }
        bleService.connectPi(macAddr, {
            workType: 'GETSINGLE',
            callback: playConnectedSound
        }).then((data) => {
            self.disconnect();
            self.serviceData.MacAddress = macStr;
            self.macAddr = self.serviceData.MacAddress.slice(-6);
            self.serviceData.DialysisSystem = data.DialysisSystem;
            assignBleDataToDialysisData(data);
        }, (err) => {
            handleScanPiError(err);
        });
    };

    function handleScanPiError(err) {
        self.showReading = false;
        // ble plugin 給的
        if (err.message) {
            console.error('error message', err);
            showMessage(err);
            self.disconnect();
        } else if (err.includes('scanPi')) {
            console.error('scanPi error', err);
            // 沒掃到再繼續掃
            // self.scanPi();
        } else {
            showMessage(raspberryPiService.convertPiErr(err));
            self.disconnect();
        }
    }

    function onDeviceReady() {
        // check ios version
        // if it's iPhone 7, 7+ and ios version greater than 11.0
        // Model Ex. iPhone9,1 -> 9.1
        if (cordova.platformId !== 'browser') {
            let modelNum = Number(device.model.substring(6).replace(',', '.'));
            if (device.platform === 'iOS' && device.version >= '11.0' && modelNum > 9) {
                // if(device.platform == 'iOS'  && device.version <= '11.0') {
                self.iosNFCSupport = true;
            }
            // to listen pause and resume to stop or start ble scan
            // document.addEventListener('resume', onResume, false);
            // document.addEventListener('pause', onPause, false);
        }
    }

    // begin ios nfc session
    self.iosNfcScan = function iosNfcScan() {
        nfc.beginSession((success) => {
            // success
            nfcService.listenNdef(_readNDEF);
        }, (failure) => {
            // fail
        });
    };

    // nfcService 回傳物件 {Id:'', Data:'...'}
    let lastMac = '';   // for 重試藍牙連線時使用
    function _readNDEF(ndef) {
        console.log('_readNDEF');
        if (!ndef.Data) {
            showMessage($translate('machineData.machineDataDetail.component.invalidCard'));
            return;
        }

        if (!ndef.Data.includes('**') && !ndef.Data.includes('B827EB')) {
            // showMessage(`儀器卡片內容有誤 -> ${ndef.Data}`);
            showMessage($translate('machineData.machineDataDetail.component.cardError', { data: ndef.Data }));
        }

        // bleService.checkLocationPermissionAndExecute(self.read(ndef.Data));
        self.read(ndef.Data);
    }
    self.scanBarCode = function () {
        console.log('scanBarCode() in machinedata component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    if (!result.text.includes('**') && !result.text.includes('B827EB')) {
                        // showMessage('條碼內容有誤 -> ' + result.text);
                        showMessage($translate('machineData.machineDataDetail.component.barCodeError', { errText: result.text }));
                    }
                    // bleService.checkLocationPermissionAndExecute(self.read(result.text));
                    self.read(result.text);
                }
            },
            function (error) {
                alert('login Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('machineData.machineDataDetail.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };

    // 儲存
    self.isSaving = false;
    self.submit = function submit() {
        self.isSubmit = true;
        self.isSaving = true;

        // dialysisTime 會存到秒, 所以要把秒及毫秒設為 0
        self.serviceData.DialysisTime = moment(self.date).millisecond(0);

        // 剩餘時間資料庫只存HH:mm
        // 若 uftimeminute / uftimehour 有值，若 uftimehour / uftimeminute 無值則預設為 00
        if (self.uftimeminute || self.uftimehour) {
            self.uftimeminute = self.uftimeminute || '00';
            self.uftimehour = self.uftimehour || '00';
        }
        if (self.uftimehour && self.uftimeminute) {
            self.serviceData.UFTime = self.uftimehour + ':' + self.uftimeminute;
        } else {
            self.serviceData.UFTime = null;
        }

        // finalAssessmentItems 要上傳的物件，deep copy 一份出來，避免處理資料時影響前端顯示
        // deep copy原因：因為self.assessmentItems是一個含有不同型別內容的陣列，要 deep copy 才可完整複製
        let finalAssessmentItems = $.extend(true, {}, self.assessmentItems); // $.extend(deep Boolean, target object, object1, objectN)
        // 處理洗中評估 other/otherInput
        if (finalAssessmentItems) {
            _.forEach(finalAssessmentItems, (value, key) => {
                // key：title  value：[.....]
                // console.log('處理洗中評估 value.OtherInput', value.OtherInput);
                // 檢查是否有 Other
                let otherIndex = value.indexOf('Other');
                if (otherIndex > -1) {
                    // 有 Other
                    // 移動到最後一個位置
                    value.splice(otherIndex, 1); // 先刪除原位置的
                    value.push('Other'); // push到最後位置
                } else {
                    // 沒有 Other
                    // 但有 OtherInut 要先刪除 OtherInut
                    if (value.OtherInput) {
                        delete value.OtherInput;
                    }
                }
                // 有 Other，且有 OtherInut 取出值 塞入陣列中的最後一個
                if (value.OtherInput) {
                    value.push(value.OtherInput);
                    // 刪除 OtherInut object
                    delete value.OtherInput;
                }
                // 如果整個陣列皆為空直接刪除整個物件
                if (_.isEmpty(value)) {
                    delete finalAssessmentItems[key];
                }
                // console.log('處理洗中評估 單一陣列 value', value);
            });
            // console.log('處理洗中評估 finalArray', finalAssessmentItems);
        }
        // 洗中評估 內容
        self.serviceData.AssessmentItems = finalAssessmentItems;

        // Update or Create
        if ($stateParams.machineDataId !== 'create') {
            self.serviceData.ModifiedUserId = currentUserInfo.Id;
            self.serviceData.ModifiedUserName = currentUserInfo.Name;
            // 修改時間由前端給
            self.serviceData.ModifiedTime = moment();

            // 如果沒有AssessmentVersion，表示之前沒有填過評估，記得要再存入最新的評估版本號
            if (self.serviceData.AssessmentVersion === null) {
                self.serviceData.AssessmentVersion = self.Revision;
            }

            console.log('修改 最終', self.serviceData);
            // 修改
            machineDataService.put(self.serviceData).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('machineData.machineDataDetail.component.editSuccess'));
                    self.gotoList();
                    self.isSaving = false;
                } else {
                    showMessage($translate('machineData.machineDataDetail.component.editFail'));
                }
            }, (err) => {
                showMessage($translate('machineData.machineDataDetail.component.serverError'));
                self.gotoList();
            });
        } else {
            self.serviceData.HospitalId = currentUserInfo.HospitalId;
            self.serviceData.CreatedUserId = currentUserInfo.Id;
            self.serviceData.CreatedUserName = currentUserInfo.Name;
            // 建立時間由前端給
            self.serviceData.CreatedTime = moment();

            self.serviceData.DialysisId = $stateParams.headerId;
            self.serviceData.PatientId = $stateParams.patientId;

            // 洗中評估 將評估版本號存入透析機資料內的AssessmentVersion 只有新增透析機資料時需存入，修改時不需再存入
            self.serviceData.AssessmentVersion = self.Revision;
            console.log('新增 最終', self.serviceData);

            // 新增
            machineDataService.post(self.serviceData).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('machineData.machineDataDetail.component.createSuccess'));
                    self.gotoList();
                    self.isSaving = false;
                } else {
                    showMessage($translate('machineData.machineDataDetail.component.createFail'));
                }
            }, () => {
                // 儲存至 localStorage
                showMessage($translate('machineData.machineDataDetail.component.serverError'));
                self.gotoList();
            });

        }
    };

    // 回列表
    self.gotoList = function gotoList() {
        history.go(-1);
    };

    // 帶入最後一筆
    self.ditto = function ditto() {

        self.serviceData = angular.copy(previousData);
        // ditto 上一筆時, 要把上一筆的MAC Address 及財產相關資訊清除, 因為這一筆算是手抄的
        delete self.serviceData.MacAddress;
        delete self.serviceData.DialysisSystem;
        delete self.serviceData.MachineModel;
        delete self.serviceData.MachineSerialNumber;
        delete self.serviceData.MachinePropertyNumber;
        delete self.serviceData.MachineBrand;

        self.date = moment().millisecond(0).toDate();
        self.hour = moment().format('HH');
        self.minute = moment().format('mm');

        // 智慧計算下一次的剩餘時間, 應減去上一筆到現在的經過時間
        if (self.serviceData.UFTime) { // 前一筆資料有可能沒有剩餘時間可計算
            let now = moment();
            let durationPass = now.subtract(now.second(), 's').subtract(now.millisecond(), 'ms').diff(moment(self.serviceData.DialysisTime));
            let newDuration = moment.duration({
                hours: parseInt(self.serviceData.UFTime.split(':')[0]),
                minutes: parseInt(self.serviceData.UFTime.split(':')[1])
            }).subtract(durationPass);
            if (newDuration.as('m') > 0) {
                self.uftimehour = ('0' + newDuration.hours()).slice(-2);
                self.uftimeminute = ('0' + newDuration.minutes()).slice(-2);
            }
        }

        // 有些值是不需要一併帶入的
        self.serviceData.DialysisTime = new Date();
        self.serviceData.CreatedTime = new Date();
        self.serviceData.CreatedUserId = null;
        self.serviceData.CreatedUserName = null;
        self.serviceData.ModifiedUserId = null;
        self.serviceData.ModifiedUserName = null;
        self.serviceData.ModifiedTime = null;
        delete self.serviceData.Id;

        // 剩餘時間資料庫只存HH:mm ，所以要將它轉換成時間格式
        if (self.serviceData.UFTime) {
            self.serviceData.UFTime = moment(`${moment().format('YYYY-MM-DD')} ${self.serviceData.UFTime}`);
        }

    };

    // 不要用 ble 的名字, 會跟 cordova plugin 名稱衝突
    // let blemanager = new bleManager();
    self.read = function read(ndef) {
        if (self.reading) {
            return;
        }
        // 隱藏 toast
        if (document.getElementById('restart-ble-toast')) {
            $mdToast.hide();
        }

        // addBackbuttonEventListenser();
        if (!ndef) {
            ndef = '5C313E472ABB**fresenius';
        }

        // pi
        let actionName = '';
        if (ndef.includes('B827EB')) {
            actionName = 'GETSINGLE';
        } else {
            actionName = '';
        }

        lastMac = ndef;
        // 等待 stop scan pi 有回應後再連藍牙取值
        bleService.stopScanPi().then(() => {
            $timeout(() => {
                getData(ndef, {
                    workType: actionName,
                    callback: playConnectedSound
                });
            }, scanPiBufferTime);
        }, () => {

        });
    };

    // 單次靠卡連藍牙
    function getData(ndef, options) {
        $timeout(() => {
            self.reading = true;
            self.showReading = true;
            self.bleStatus = $translate('machineData.machineDataDetail.component.bleConnecting');
        }, 0);

        // 確定取消正在 count scanPi 的 timer
        // cancelScanPiTimer();
        bleService.getData(ndef, options)
            .then((data) => {
                console.log('success -> ', data);
                lastMac = '';
                self.disconnect();

                let device = ndef.split('**')[1] ? ndef.split('**')[1] : data.DialysisSystem;
                // 先確認目前讀的是來自洗腎機還是血壓機
                if (bleService.isBPMonitor(device)) {
                    // 目前讀的資料為來自血壓機
                    assignBleDataToBPData(data);
                } else {
                    // 目前讀的資料來自洗腎機
                    self.serviceData.MacAddress = ndef.split('**')[0];
                    self.macAddr = self.serviceData.MacAddress.slice(-6);
                    self.serviceData.DialysisSystem = device;
                    assignBleDataToDialysisData(data);
                }

            }, (result) => {
                let msg = result.message ? result.message : result;

                // TODO Android only 連線錯誤訊息才需顯示重啟藍牙後自動連線傳輸的 toast
                if (cordova.platformId === 'android' && (/BT_CONNECT_TIMEOUT/i.test(msg) || /BT_RETRYCONNECT/i.test(msg))) {
                    $mdToast.show({
                        hideDelay: 0,
                        controller: 'restartBleToastCtrl',
                        controllerAs: '$ctrl',
                        bindToController: true,
                        locals: {
                            callback: (mac) => { self.read(mac); },
                            mac: lastMac
                        }, // lastMac
                        template: toastTpl
                    }).then((res) => {
                        console.log(res);
                        if (res === 'restart_ble') {
                            $timeout(() => {
                                self.showReading = true;
                                self.bleStatus = $translate('bluetooth.btRestarting');
                            }, 0);
                        }
                    }).catch((error) => {
                        console.error('Custom toast failure:', error);
                    });
                    self.disconnect();
                    return;
                }

                if (result.message) {
                    showMessage(bleService.errorParser(result.message));
                } else {
                    showMessage(raspberryPiService.convertPiErr(result));
                }
                self.disconnect();
            });
    }

    function playConnectedSound() {
        $timeout(() => {
            self.bleStatus = $translate('machineData.machineDataDetail.component.dataTransfering');
        }, 0);
        document.getElementById('piConnectedSound').play();
    }

    function playDisconnectedSound() {
        document.getElementById('piDisconnectedSound').play();
    }

    // 將由藍牙接受到的解譯完洗腎機資料塞進前端顯示
    function assignBleDataToDialysisData(data) {
        self.serviceData.DialysisTime = moment();

        // 如果有 MacAddress 再與後台產編比對
        machineService.getByBleNum(self.serviceData.MacAddress).then((res) => {
            if (res.data) {
                self.serviceData.MachineModel = res.data.Model;
                self.serviceData.MachineSerialNumber = res.data.SerialNumber;
                self.serviceData.MachinePropertyNumber = res.data.PropertyNumber;
                self.serviceData.MachineBrand = res.data.Brand;
            }
        });

        // 剩餘時間, bind 到畫面上，回傳的值為分鐘
        let UFTimeInMin = 0;
        if ((self.serviceData.DialysisSystem.toUpperCase() === 'NIKKISO' || self.serviceData.DialysisSystem.toUpperCase().search(/(\bTR)/g) > -1) && self.prescription && self.prescription.Duration) {
            let totalMinutes = self.prescription.Duration.Hours * 60 + self.prescription.Duration.Minutes;
            UFTimeInMin = (totalMinutes - parseInt(data.UFTime)) > 0 ? totalMinutes - parseInt(data.UFTime) : 0;
        } else {
            UFTimeInMin = parseInt(data.UFTime);
        }
        self.uftimehour = ('0' + parseInt(UFTimeInMin / 60)).slice(-2);
        self.uftimeminute = ('0' + (UFTimeInMin % 60)).slice(-2);
        self.serviceData.UFTime = self.uftimehour + ':' + self.uftimeminute;

        self.serviceData.BloodFlowRate = data.ArterialBloodFlow || data.BloodFlowRate;
        self.serviceData.VenousPressure = data.VenousPressure;
        self.serviceData.TMP = data.TMP;
        self.serviceData.UFRate = data.UFRate;
        self.serviceData.TotalUF = data.TotalUF;
        self.serviceData.HeparinDeliveryRate = data.HeparinDeliveryRate;
        self.serviceData.DialysisateFlowRate = data.DialysisateFlowRateSet || data.DialysisateFlowRate;
        self.serviceData.DialysateA = data.DialysateDensity || self.serviceData.DialysateA;
        self.serviceData.DialysateTemperature = data.DialysateTemperature;
        self.serviceData.DialysateTemperatureSet = data.DialysateTemperatureSet || data.TargetTemperature;
        self.serviceData.DialysateConductivity = data.DialysateConductivity;
        self.serviceData.UFProfile = data.UFProfile;
        self.serviceData.TargetSodium = data.TargetSodium;
        self.serviceData.NaProfile = data.NaProfile;
        self.serviceData.HDFType = data.HDFType || self.serviceData.HDFType;
        self.serviceData.Volume = data.Volume;
        self.serviceData.SubVolume = data.SubVolume;
        self.serviceData.TotalBloodFlowVolume = data.TotalBloodFlowVolume;
        self.serviceData.BloodLeak = data.BloodLeak;
        self.serviceData.TargetUF = data.TargetUF;
        self.serviceData.HeparinOriginal = data.HeparinOriginal;
        self.serviceData.HeparinAccumulatedVolume = data.HeparinAccumulatedVolume;
        self.serviceData.BPS = data.BPS || self.serviceData.BPS;
        self.serviceData.BPD = data.BPD || self.serviceData.BPD;
        self.serviceData.Pulse = data.Pulse || self.serviceData.Pulse;

        // 異常警告
        self.serviceData.IsDialysateTemperatureAlarm = data.IsDialysateTemperatureAlarm;
        self.serviceData.IsConductivityAlarm = data.IsConductivityAlarm;
        self.serviceData.IsConcentrationAlarm = data.IsConcentrationAlarm;
        self.serviceData.IsVenousPressureAlarm = data.IsVenousPressureAlarm;
        self.serviceData.IsDialysatePressureAlarm = data.IsDialysatePressureAlarm;
        self.serviceData.IsTMPAlarm = data.IsTMPAlarm;
        self.serviceData.IsAirBubbleDetectorAlarm = data.IsAirBubbleDetectorAlarm;
        self.serviceData.IsBloodLeakAlarm = data.IsBloodLeakAlarm;
        self.serviceData.IsArterialPressureAlarm = data.IsArterialPressureAlarm;
        self.serviceData.IsBloodPressureAlarm = data.IsBloodPressureAlarm;
        self.serviceData.IsPulseAlarm = data.IsPulseAlarm;

        // CRRT mode only
        self.serviceData.ArterialPressure = data.ArterialPressure;
        self.serviceData.FilterPressure = data.FilterPressure;
        self.serviceData.EffluentPressure = data.EffluentPressure;
        self.serviceData.PressureDrop = data.PressureDrop;
        // self.serviceData.ACT = data.ACT; // 機器抓不到
        // self.serviceData.HeaterTemperature = data.HeaterTemperature;   // 機器抓不到

        // 確認是否顯示 CRRT 欄位
        self.checkMode(self.serviceData.HDFType);

        self.checkTargetUF();
        self.checkWithPrescription();

        // "與上一筆的 MacAddress 比對，若不同則跳出警告，只比前一筆，否則比不完" said by Andy 20170606
        if (!previousData || !previousData.MacAddress) {
            return;
        }
        if (previousData.MacAddress !== self.serviceData.MacAddress) {
            // 設定對話視窗參數
            const alert = $mdDialog.alert()
                .title($translate('machineData.machineDataDetail.component.warning'))
                .textContent($translate('machineData.machineDataDetail.component.differentData'))
                .ok($translate('machineData.machineDataDetail.component.understand'));

            // 呼叫對話視窗
            $mdDialog.show(alert);
        }
    }

    // 將由藍牙接受到的解譯完血壓機資料塞進前端顯示
    function assignBleDataToBPData(data) {
        self.serviceData.BPS = data.BPS || self.serviceData.BPS;
        self.serviceData.BPD = data.BPD || self.serviceData.BPD;
        self.serviceData.Pulse = data.Pulse || self.serviceData.Pulse;
    }

    // 與處方比對若不同給提醒
    // name: 需要比對的項目，若沒給則全部比對
    self.checkWithPrescription = function (name = null) {
        // 第一筆透析機資料才需比對
        if (previousData || !self.prescription) {
            return;
        }

        switch (name) {
            case 'DialysateTemperature':
                // 處方與設定值比較
                self.errMsg.DialysateTemperature = Number(self.serviceData.DialysateTemperatureSet) !== Number(self.prescription.DialysateTemperature);
                break;
            case 'DialysisateFlowRate':
                self.errMsg.DialysisateFlowRate = Number(self.serviceData.DialysisateFlowRate) !== Number(self.prescription.DialysateFlowRate);
                break;
            case 'UFTime':
                // 若剩餘時間大於處方的預計時間則跳提醒
                // 先判斷處方有無此欄位若無則不需再比
                if (self.prescription.Duration && (self.prescription.Duration.Hours || self.prescription.Duration.Minutes)) {
                    // 將時間統一轉成分鐘在比較
                    let currentUFTimeInMin = (Number(self.uftimehour) * 60) + Number(self.uftimeminute);
                    let prescriptionUFTimeInMin = (Number(self.prescription.Duration.Hours) * 60) + Number(self.prescription.Duration.Minutes);
                    self.errMsg.UFTime = currentUFTimeInMin > prescriptionUFTimeInMin;
                }
                break;
            case 'BloodFlowRate':
                self.errMsg.BloodFlowRate = Number(self.serviceData.BloodFlowRate) !== Number(self.prescription.BF);
                break;
            default:
                // 若機器回傳無該欄位也不需比較
                // 透析液溫度
                if (self.serviceData.DialysateTemperatureSet != null) {
                    self.errMsg.DialysateTemperature = Number(self.serviceData.DialysateTemperatureSet) !== Number(self.prescription.DialysateTemperature);
                }
                // 透析液流速
                if (self.serviceData.DialysisateFlowRate != null) {
                    self.errMsg.DialysisateFlowRate = Number(self.serviceData.DialysisateFlowRate) !== Number(self.prescription.DialysateFlowRate);
                }
                // 血液流速
                if (self.serviceData.BloodFlowRate != null) {
                    self.errMsg.BloodFlowRate = Number(self.serviceData.BloodFlowRate) !== Number(self.prescription.BF);
                }

                // 若剩餘時間大於處方的預計時間則跳提醒
                // 先判斷處方有無此欄位若無則不需再比
                if (self.prescription.Duration && (self.prescription.Duration.Hours || self.prescription.Duration.Minutes)) {
                    // 將時間統一轉成分鐘在比較
                    let currentUFTimeInMin = (Number(self.uftimehour) * 60) + Number(self.uftimeminute);
                    let prescriptionUFTimeInMin = (Number(self.prescription.Duration.Hours) * 60) + Number(self.prescription.Duration.Minutes);
                    self.errMsg.UFTime = currentUFTimeInMin > prescriptionUFTimeInMin;
                }
                break;
        }
    };

    // TargetUF blur 後需再檢查
    self.checkTargetUF = function () {
        // 目前 TargetUF 單位 L: 1L = 1Kg
        // 第一筆透析機資料才需比對
        if (previousData) {
            return;
        }
        self.errMsg.TargetUF = Number(self.serviceData.TargetUF) !== Number(self.dehydrationSetting);
    };

    self.disconnect = function () {
        console.log('self.disconnet');
        bleService.disconnect()
            .then((result) => {
                // showMessage(result);
                // 成功的話不用顯示
                console.log(result);

                // disconnect 後, 設定變數不會 apply 到前端畫面,
                // 需要透析 $timeout 來執行 $scope.$apply
                // 或者要直接 $scope.$apply 也可以
                $timeout(() => {
                    self.reading = false;
                    self.showReading = false;
                    console.log('self.reading -> ' + self.reading);
                    self.bleStatus = $translate('machineData.machineDataDetail.component.bleConnecting');
                    // 繼續掃 pi
                    // self.scanPi();
                }, 0);
            }, (result) => {
                showMessage(result);
                $timeout(() => {
                    self.reading = false;
                    self.showReading = false;
                    console.log('self.reading -> ' + self.reading);
                    self.bleStatus = $translate('machineData.machineDataDetail.component.bleConnecting');
                    // 繼續掃 pi
                    // self.scanPi();
                }, 0);
            });
        playDisconnectedSound();
    };
    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        console.log('machineData memo', self.serviceData.Memo);
        //$mdSidenav('rightPhrase').close();
    };
}

import tpl from "./summary.html";
import "./summary.less";
import formDialog from "./dialysisForm/dialysisForm.html";
import './dialysisForm/dialysisForm.less';
import '../dialysis/highRiskFaller/highRiskFallerHD.less';
import '../summary/reportDialysis/reportDialysisHD.less';


angular.module("app").component("summary", {
    template: tpl,
    controller: SummaryController
});

SummaryController.$inject = [
    '$q',
    "$state",
    "$stateParams",
    "$timeout",
    "$mdSidenav",
    "dialysisService",
    "PatientService",
    "SettingService",
    "$mdMedia",
    "$scope",
    "$filter",
    '$interval',
    '$mdDialog',
    'PatientListxxxService',
    '$sessionStorage',
    'showMessage',
    'epoExecutionService',
    'allExecutionRecordService',
    'SessionStorageService'
];

function SummaryController(
    $q,
    $state,
    $stateParams,
    $timeout,
    $mdSidenav,
    dialysisService,
    PatientService,
    SettingService,
    $mdMedia,
    $scope,
    $filter,
    $interval,
    $mdDialog,
    PatientListxxxService,
    $sessionStorage,
    showMessage,
    epoExecutionService,
    allExecutionRecordService,
    SessionStorageService
) {
    console.log("enter summary component");
    const self = this;

    // 使用者習慣
    const LIST_TAB = SettingService.getUISettingParams().SUMMARYLISTTAB;
    const PATIENT_INFO = SettingService.getUISettingParams().SUMMARYPATIENTINFO;
    const PRESCRIPTIONTAG = SettingService.getUISettingParams().PRESCRIPTIONTAG;

    // routing-related
    // home page
    const homePage = 'allPatients';
    // 強制歷次功能列表上一頁為 summary
    const previousIsSummaryState = [
        'photoList', 'albumList',
        'allDialysisRecords', 'allMedicationRecords', 'allNursingRecords',
        'prescriptionTabPage', 'annualEpo', 'apo',
        'labexamChart', 'labexamTable', 'labexamWeekTable',
        'monthlyDialysisRecords',
        'abnormalVesselAssessment', 'vesselassessment', 'vesselAssessmentProblemsList',
        'yearCalendarReport'
    ];
    // patientInfo 不須列印的功能
    const noPrintPatientInfoStates = ['printRDHD'];

    // 要在 tab 加上未執行筆數及定時讀取未執行筆數
    let notificationInterval;

    // loading
    self.loading = false;   // 整頁
    self.patientInfoLoading = false;    // 病人資料讀取
    self.overviewLoading = false;   // 總覽資料

    // 伺服器錯誤
    self.serverErrorRecord = false; // 表單資料取得錯誤
    self.serverErrorPatient = false; // 病人資料取得錯誤

    // const patientId = $stateParams.patientId;
    self.patientId = $stateParams.patientId;

    const $translate = $filter("translate");

    // 切表單
    $scope.$on('changeHeaderId', (event, res, month) => {
        console.log('changeHeaderId', res, month);

        // 需在 $timeout 裡，router 才會變
        $timeout(() => {
            if (!isDestroyed) {
                if (res === 'same') {
                    res = $stateParams.headerId;
                }
                $state.go('summary', { headerId: res, month }, { location: 'replace' });
            }
        }, 500);
    });

    $scope.$on('overview-dataChanged', (event) => {
        console.log('overview-dataChanged');
        getOverviewData(true);
    });

    $scope.$on('patient-dataChanged', (event) => {
        console.log('patient-dataChanged');
        getPatientInfoAndMyPatients();
    });

    // 更換 toolbar title
    $scope.$on('summaryTitle', (event, res) => {
        console.log('summaryTitle', res);
        self.summaryTitle = res;
    });

    // 監聽EPO及開藥，為了要重新計算未執行筆數，但目前只有執行刪除才有用到，
    // 因新增/修改不是在 dialysisTabView 的子層，存檔後會重新執行此 component，
    // 但程式有加，放著備用
    // 參數說明: type-要重新計算的類別
    $scope.$on('tabCount', (event, args) => {
        if (args.type === 'epo') {
            _readEPOCount();
        }

        if (args.type === 'allExecute') {
            _readExecuteCount();
        }
    });

    // watch for screen sizes
    $scope.$watch(
        function () {
            return $mdMedia("(max-width: 600px)");
        },
        function (big) {
            self.smallScreen = big;
            console.log("$scope.smallScreen", self.smallScreen);
        }
    );

    let previousState = '';
    self.$doCheck = function () {
        // 於 android 裝置，若為 summary 頁才需監聽音量鍵來掃 barcode 的功能
        if (cordova.platformId === 'android') {
            document.removeEventListener('volumeupbutton', scanBarCode);
            document.removeEventListener('volumedownbutton', scanBarCode);
            if ($state.current.name === 'summary') {
                document.addEventListener('volumeupbutton', scanBarCode);
                document.addEventListener('volumedownbutton', scanBarCode);
            }
        }
        if (previousState !== $state.current.name) {
            document.removeEventListener("backbutton", backToHome);
            previousState = $state.current.name;
            $timeout(() => {
                // 檢查是否要顯示 detail 頁及置換 toolbar 的字
                if ($state.current.name !== 'summary') {
                    if ($state.current.name === 'dialysisForm') {
                        self.showContent = false;
                        self.showWholeScreen = true;
                        return;
                    }
                    changeToolbarTitle();
                    self.showContent = true;
                    self.showWholeScreen = false;
                    self.patientInfoNoPrint = noPrintPatientInfoStates.indexOf($state.current.name) > -1;
                } else {
                    self.summaryTitle = '';
                    self.showContent = false;
                    self.showWholeScreen = false;
                    document.addEventListener("backbutton", backToHome);
                }
                self.currentState = $state.current.name;
            });
        }
    };

    // 實體鍵與程式裡的 goback 一致
    function backToHome() {
        console.log('backToHome');
        // 若為 scan 則不做下面的事情
        if (isScanCanceled) {
            isScanCanceled = false;
            return;
        }

        self.goback();
    }

    // 取得所有通知
    function getNotifications() {
        _readEPOCount();
        _readExecuteCount();
    }
    // EPO 未執行筆數
    function _readEPOCount() {
        epoExecutionService.getTodoCount($stateParams.patientId).then((q) => {
            self.tabEpoCount = q.data;
        });
    }
    // 執行用藥 未執行筆數
    function _readExecuteCount() {
        allExecutionRecordService.loadRecordList($stateParams.patientId, $stateParams.headerId, true).then((res) => {
            $timeout(() => {
                console.log('TAB 執行列表 res', res);
                console.log('TAB 執行列表 res.data', res.data);
                self.tabExecuteCount = res.ExecuteCount;
            }, 0);
        })
            .catch((err) => {
                console.log('readExecuteCount err', err);
            });
    }

    self.$onInit = function () {

        // 取得使用者習慣
        self.showPatientInfo = SettingService.getUISettingByKey(PATIENT_INFO) == null ? true : SettingService.getUISettingByKey(PATIENT_INFO);  // 若結果為 null or undefined 預設為開
        self.hideFunctionTab = SettingService.getUISettingByKey(LIST_TAB);

        // TODO tab 收合時應顯示的 notification 數目，先依角色區分
        self.loginRole = SettingService.getCurrentUser().Role;

        // TODO 確認目前登入者的角色
        // 護理人員：overview-處方、overview-體重、overview-生理徵象、交班事項、評估、透析機、連續型透析機、執行紀錄、EPO、護理紀錄
        // 醫生：歷次處方、檢驗檢查、開藥紀錄/處置、病情摘要

        // 取 patient 相關資料
        getPatientInfoAndMyPatients();

        // console.log('lastDialysisId in summary', $state.lastDialysisId);
        // 若 $stateParams.headerId 為空 取最新的表單 id
        getDialysisRecord();

        if (!angular.isDefined(notificationInterval)) {
            notificationInterval = $interval(getNotifications, 60000); // 執行定時讀取 EPO 未執行筆數
        }
        getNotifications();

        if (cordova.platformId === 'android') {
            document.addEventListener('volumeupbutton', scanBarCode);
            document.addEventListener('volumedownbutton', scanBarCode);
        }
    };

    let isScanCanceled = false;
    function scanBarCode() {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    if (!result.text.includes('**') && !result.text.includes('B827EB')) {
                        // showMessage('條碼內容有誤 -> ' + result.text);
                        showMessage($translate('machineData.machineDataDetail.component.barCodeError', { errText: result.text }));
                        return;
                    }
                    // bleService.checkLocationPermissionAndExecute(self.read(result.text));
                    $state.go('machineDataDetail', {
                        machineDataId: 'create',
                        macId: result.text
                    });
                } else {
                    isScanCanceled = true;
                }
            },
            function (error) {

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
    }

    // 取得目前病人資料及今日病人
    function getPatientInfoAndMyPatients() {
        let exeAry = [];
        // 取 patient 的基本資料
        exeAry.push(PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
        }));

        // 取得今日病人的清單
        exeAry.push(PatientService.getMyPatients(SettingService.getCurrentUser().Id).then((d) => {
            self.patients = PatientService.orderPatients(d.data);
        }));

        self.patientInfoLoading = true;
        $q.all(exeAry).then(() => {
            // 依剩餘時間排序，null代表尚未洗排最上面
            if (self.patients && self.patients.length > 0) {
                // 若目前選擇的病人沒在我的病人清單裡則新增
                if (!_.find(self.patients, { Id: self.currentPatient.Id })) {
                    self.patients.push(self.currentPatient);
                }
                self.patients = PatientService.orderPatients(self.patients);
            } else {
                self.patients.push(self.currentPatient);
            }
            console.log('self.patients', self.patients);
            self.patientErr = false;
        }).catch((err) => {
            self.patientErr = true;
            console.error('get patients error', err);
        }).finally(() => {
            self.patientInfoLoading = false;
        });
    }

    // 卡片頁面
    function getDialysisRecord(isForce = false) {
        self.headerId = $stateParams.headerId;
        self.loading = true;
        if (!$stateParams.headerId || $stateParams.headerId === 'last') {

            dialysisService.getLastHeaderId($stateParams.patientId, isForce).then((res) => {
                self.serverErrorRecord = false;
                // 若無表單 data 為 null from service.js
                if (res.data && !isDestroyed) {
                    let headerId = res.data;
                    self.noDialysisRecord = false;
                    $state.go("summary", { headerId }, {
                        notify: false,
                        reload: false,
                        location: "replace"
                    });
                } else if (!res.data) {
                    // 尚未有任何表單
                    self.noDialysisRecord = true;
                    checkCanCreate();
                }
            }).catch((err) => {
                if (err.status == 400) {
                    // 表單已不存在
                    self.errMsg = '表單不存在，請選擇其他表單';
                } else {
                    self.errMsg = '';
                }
                console.error('getLast', err);
                self.serverErrorRecord = true;
            }).finally(() => {
                self.loading = false;
            });
        } else {
            // 依 headerId 取得資料
            getOverviewData(isForce);
        }

        // TODO 先使用護理師排序即可
        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getModuleFunctions();
        arrangeTabs(SettingService.getCurrentUser().Role);
        arrangeCards(SettingService.getCurrentUser().Role);

        self.tabEpoCount = 0;
        self.tabExecuteCount = 0;
        _readEPOCount();
        _readExecuteCount();
    }

    // 取得總覽卡片需要的資料
    function getOverviewData(isForce) {
        self.overviewLoading = true;

        // 依 headerId 取得資料
        dialysisService.getByIdForSummary(
            $stateParams.patientId,
            $stateParams.headerId,
            isForce
        ).then((res) => {
            self.serverErrorRecord = false;

            // 需多判斷表單是否仍存在，可有 StartTime 判斷
            if (res.data.Count == 0) {
                self.noDialysisRecord = true;
                self.errMsg = '';
                return;
            }
            if (!res.data.StartTime) {
                self.errMsg = '表單不存在，請選擇其他表單';
                self.serverErrorRecord = true;
                return;
            }
            self.currentData = res.data;

            // 表單日期顯示
            // 判斷同一日期第幾次
            let count = '';
            if (self.currentData.Numbers && self.currentData.Numbers.all) {
                let splitResult = self.currentData.Numbers.all.split('-');
                if (splitResult.length > 1) {
                    count = ` - ${splitResult[1]}`;
                }
            }

            // 是否為今日
            self.isToday = moment(self.currentData.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD');
            self.recordDateTitle = moment(self.currentData.StartTime).format('YYYY-MM-DD(dd)') + count;
            self.toolbarDateTitle = moment(self.currentData.StartTime).format('MM/DD') + count;
            checkCanCreate();
        }).catch((err) => {
            if (err.status == 400) {
                // 表單已不存在
                self.errMsg = '表單不存在，請選擇其他表單';
            } else {
                self.errMsg = '';
            }

            self.serverErrorRecord = true;
        }).finally(() => {
            self.overviewLoading = false;
            self.loading = false;

            // 重新整理後，需在這裏才取得到 summary-toolbar 的 title
            $timeout(() => {
                changeToolbarTitle();
            });
        });

    }

    function changeToolbarTitle() {
        let summaryTitleElement = document.querySelector('#summary-content-container #summary-content summary-toolbar span');
        self.summaryTitle = summaryTitleElement ? summaryTitleElement.innerText : '';
    }

    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
        document.removeEventListener("backbutton", backToHome);

        if (cordova.platformId === 'android') {
            document.removeEventListener('volumeupbutton', scanBarCode);
            document.removeEventListener('volumedownbutton', scanBarCode);
        }
        // 清空 interval
        if (angular.isDefined(notificationInterval)) {
            $interval.cancel(notificationInterval);
        }
    };

    self.changePatient = function () {
        $state.go('summary', { patientId: self.currentPatient.Id, headerId: 'last' }, { location: 'replace' });
    };

    self.openAssessmentMenu = function ($mdMenu, $event) {
        $mdMenu.open($event);
    };

    // 整頁重整
    self.refresh = function () {
        getPatientInfoAndMyPatients();
        getDialysisRecord(true);
    };

    // TODO 重整病人資料
    self.refreshPatientInfo = function () {
        getPatientInfoAndMyPatients();
    };

    // 切換不同天的表單
    self.changeDate = function (index) {
        console.log('index', index);
        self.toolbarDateTitle = '';
        self.loading = true;
        // 用 index 取得 headerId
        dialysisService.getByIndex($stateParams.patientId, index).then((res) => {
            if (!isDestroyed) {
                $state.go('summary', { headerId: res.data }, { location: 'replace' });
            }
            self.serverErrorRecord = false;
        }).catch((err) => {
            if (err.status == 400) {
                // 表單已不存在
                self.errMsg = '表單不存在，請選擇其他表單';
            } else if (err.data === 'NO_DATA') {
                self.noDialysisRecord = true;
                self.errMsg = '';
            } else {
                self.errMsg = '';
            }
            self.serverErrorRecord = true;
        }).finally(() => {
            self.loading = false;
        });
    };

    // card
    function arrangeCards(role) {
        let allCardsArray = _.filter(SettingService.getSummaryTabsArrayByRole(role), { type: 'card' });

        // 依照 index排序 由小到大
        self.allCardsArray = allCardsArray.sort((a, b) => a.index - b.index);
    }

    // tab
    function arrangeTabs(role) {
        // 所有tab內容 -> type == listTab
        let allTabsArray = _.filter(SettingService.getSummaryTabsArrayByRole(role), { type: 'listTab' });
        // 依照 index排序 由小到大
        self.allTabs = allTabsArray.sort((a, b) => a.index - b.index);

    }

    // 病人更多資料(重要記事)
    self.togglePatientInfo = function () {
        setShowPatientInfo(!self.showPatientInfo);
    };
    function setShowPatientInfo(value) {
        self.showPatientInfo = value;

        // 記得使用者習慣
        SettingService.setUISetting({ name: PATIENT_INFO, value });
    }

    // 其他功能入口
    self.toggleFunctionTab = function () {
        setFunctionTab(!self.hideFunctionTab);
    };
    function setFunctionTab(value) {
        self.hideFunctionTab = value;

        // 記得使用者習慣
        SettingService.setUISetting({ name: LIST_TAB, value });
    }

    // 判斷是否要顯示新增按鈕 (根據最後一筆是否有 EndTime 及 開表是否為今日)
    function checkCanCreate() {
        // 若都無表單可新增
        if (self.noDialysisRecord) {
            self.canCreate = true;
            return;
        }
        // 取最後一筆
        dialysisService.getLast($stateParams.patientId).then((res) => {
            if (!res.data.DialysisHeader.EndTime && moment(res.data.DialysisHeader.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                self.canCreate = false;
            } else {
                self.canCreate = true;
            }
        });

        if (self.serviceData && self.serviceData.length > 0 && !self.serviceData[0].EndTime && moment(self.serviceData[0].StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            self.canCreate = false;
        } else {
            self.canCreate = true;
        }
    }

    // 新增透析紀錄單
    self.createRecord = function () {
        self.canCreate = false;
        self.loading = true;
        dialysisService.getCreateCheck(self.patientId).then((res) => {
            let createCheck;
            if (res.status === 200) {
                createCheck = res.data;
                // 當 DialysisPrescriptionCount > 0 && VesselAssessmentCount > 0 就開表
                if (createCheck.DialysisPrescriptionCount > 0 && createCheck.VesselAssessmentCount > 0) {
                    postDialysis();
                } else {
                    $mdDialog.show({
                        controller: ['$mdDialog', handleCreateDialogController],
                        templateUrl: 'confirm.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controllerAs: 'vm'
                    }).then(() => { }, () => {
                        self.loading = false;
                        self.canCreate = true;
                    });
                }
            } else {
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };
    // 新增一筆透析紀錄
    function postDialysis() {
        self.loading = true;
        dialysisService.post(self.patientId).then((q) => {
            if (q.status === 200) {
                showMessage($translate('allDialysisRecords.component.formCreateSuccess'));
                $state.go('summary', { patientId: $stateParams.patientId, headerId: 'last' }, { notify: true, reload: true, location: 'replace' });
            } else {
                self.loading = false;
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('allDialysisRecords.component.formCreateFail'));
        });
    }
    function handleCreateDialogController(mdDialog) {
        const vm = this;
        vm.hide = function hide() {
            mdDialog.hide();
        };

        vm.cancel = function cancel() {
            mdDialog.cancel();
        };

        vm.ok = function ok() {
            postDialysis();
            mdDialog.hide();
        };
    }

    // 小畫面
    // 由於有可能透過 nfc 靠卡換病人或是切換今日病人造成 router 很亂，因此於 summary 頁固定上一頁就是回首頁
    self.goback = function goback() {
        // 若有任何 dialog 則為關閉 dialog
        if (document.getElementsByTagName('md-dialog').length > 0) {
            $mdDialog.cancel();
            return;
        }

        if ($state.current.name === 'summary') {
            let stateName = SessionStorageService.getItem('homeStateName') ? SessionStorageService.getItem('homeStateName') : homePage;
            $state.go(stateName);
            SessionStorageService.deleteItem('homeStateName'); // 返回後刪除
            return;
        }

        // 若為歷次功能的列表頁，上一頁直接回 summary 頁
        if (_.indexOf(previousIsSummaryState, $state.current.name) > -1) {
            $state.go('summary', { headerId: $stateParams.headerId });
            return;
        }

        history.go(-1);
    };

    // 顯示表單
    self.print = function () {
        // 顯示表單 dialog
        $mdDialog.show({
            controller: formDialogCtrl,
            controllerAs: '$ctrl',
            template: formDialog,
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            fullscreen: $mdMedia('xs') || $mdMedia('sm')
        });
    };
    function formDialogCtrl() {
        const vm = this;

        vm.currentPatient = self.currentPatient;
        vm.isBrowser = cordova.platformId === 'browser';
        vm.sheetTemplate = self.sheetTemplate;

        function prepareFormData() {
            if (vm.currentData.DialysisHeader.Prescription && vm.currentData.DialysisHeader.Prescription.DialysisMode) {
                self.DialysisMode = self.currentData.DialysisHeader.Prescription.DialysisMode.Name;
                if (self.DialysisMode !== null) {

                    // 符合 CRRT 模式的條件
                    if (self.DialysisMode && self.DialysisMode.match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/i)) {
                        // if (self.Mode.substring(0, 3).toUpperCase() === 'CVV' || self.Mode.substring(0, 3).toUpperCase() === 'IVV' || self.Mode.substring(0, 3).toUpperCase() === 'CAV' || self.Mode.substring(0, 4).toUpperCase() === 'SCUF' || self.Mode.substring(0, 4).toUpperCase() === 'SLED') {
                        vm.modeForm = self.DialysisMode;
                    } else {
                        vm.modeForm = null;
                    }
                }
            }

            checkShowNoDataWarning(vm.currentData.DialysisHeader.CreatedTime, vm.currentData.DialysisHeader.Id);

            // get last access time for the current index
            vm.lastAccessTime = vm.currentData.lastAccessTime;
            // 護理紀錄依時間正序排
            vm.currentData.NursingRecord = _.orderBy(
                vm.currentData.NursingRecord, ["NursingTime"], ["asc"]
            );

            // 血管通路
            vm.catheter = {};
            // 單位
            vm.catheter.unit = $translate("summary.component.unitTimes");
            if (vm.currentData.DialysisHeader.VesselAssessments.length > 0) {
                if (
                    vm.currentData.DialysisHeader.VesselAssessments[0].Data &&
                    (vm.currentData.DialysisHeader.VesselAssessments[0].Data
                        .CatheterType === "Permanent" ||
                        vm.currentData.DialysisHeader.VesselAssessments[0].Data
                            .CatheterType === "DoubleLumen")
                ) {
                    vm.catheter.unit = $translate("summary.component.unitCC");
                }
            }
            // 管路名稱替換
            if (
                vm.currentData.DialysisHeader.VesselAssessments.length > 0 &&
                vm.currentData.DialysisHeader.VesselAssessments[0].Data &&
                vm.currentData.DialysisHeader.VesselAssessments[0].Data
                    .CatheterType != null
            ) {
                switch (
                vm.currentData.DialysisHeader.VesselAssessments[0].Data
                    .CatheterType
                ) {
                    case "AVFistula":
                        vm.catheter.typeName = $translate(
                            "summary.component.AVFistula"
                        );
                        break;
                    case "AVGraft":
                        vm.catheter.typeName = $translate(
                            "summary.component.AVGraft"
                        );
                        break;
                    case "Permanent":
                        vm.catheter.typeName = $translate(
                            "summary.component.Permanent"
                        );
                        break;
                    case "DoubleLumen":
                        vm.catheter.typeName = $translate(
                            "summary.component.DoubleLumen"
                        );
                        break;
                    default:
                        vm.catheter.typeName = $translate(
                            "summary.component.unknownType"
                        );
                        break;
                }
            }

            // 計算偏差 => 理想體重有沒有大於透析前體重
            if (vm.currentData.DialysisHeader) {
                vm.deviation = '';
                // 確認透析前後真的有值
                if (
                    _.isNumber(vm.currentData.DialysisHeader.PredialysisWeight) &&
                    _.isNumber(vm.currentData.DialysisHeader.WeightAfterDialysis)
                ) {
                    // 透析前體重 - 透析後體重 or 透析後體重 - 透析前體重 取絕對值
                    if (
                        _.isNumber(vm.currentData.DialysisHeader.StandardWeight)
                    ) {
                        vm.deviation = Math.abs(
                            vm.currentData.DialysisHeader.PredialysisWeight -
                            vm.currentData.DialysisHeader.WeightAfterDialysis
                        ).toFixed(2);
                    } else if (
                        vm.currentData.DialysisHeader.Dehydration !== null &&
                        vm.currentData.DialysisHeader.DehydrationTarget !== null
                    ) {
                        vm.deviation = (
                            vm.currentData.DialysisHeader.Dehydration -
                            vm.currentData.DialysisHeader.DehydrationTarget
                        ).toFixed(2);
                    }
                }
            }
        }

        vm.cancel = function () {
            $mdDialog.cancel();
        };

        vm.loading = true;
        // get dialysisRecord by HeaderId
        dialysisService.getByHeaderId(
            $stateParams.patientId,
            $stateParams.headerId,
            true
        ).then((res) => {
            vm.currentData = res.data;
            prepareFormData();
        }).finally(() => {
            vm.loading = false;
        });
    }


    self.isBrowser = cordova.platformId === "browser";
    self.share = function () {
        window.plugins.socialsharing.share(
            null,
            null,
            null,
            SettingService.getServerUrl() + "/" + location.hash
        );
    };

    self.gotoPatientDetail = function gotoPatientListDetail(pid) {
        $state.go("patientDetail", {
            patientId: pid
        });
    };

    self.gotoDialysisForm = function gotoDialysisForm() {
        $sessionStorage.currentHeader = {
            headerId: $stateParams.headerId,
            recordDateTitle: self.recordDateTitle
        };
        $state.go("dialysisForm", {
            patientId: $stateParams.patientId
        });
    };

    // toggle sidenav
    self.toggleSideNav = function () {
        if (SettingService.getSideNavStatus(SettingService.getCurrentUser().Id) === true) {
            // set the status to false
            SettingService.setSideNavStatus(SettingService.getCurrentUser().Id, false);
        } else {
            // set the status to true
            SettingService.setSideNavStatus(SettingService.getCurrentUser().Id, true);
        }
        $scope.$emit('toggleNav');
    };

    self.openMenu = function openMenu() {
        $mdSidenav("rightNav").toggle();
    };

    self.openLeftMenu = function openLeftMenu() {
        $mdSidenav("left").toggle();
    };

    // 去特定頁面
    self.gotoState = function (stateName, option = {}) {
        $state.go(stateName, option);
        $mdSidenav("rightNav").close();
    };

    // 開表時間 24 小時內才需判斷是否要出現沒有透析機資料的提示
    function checkShowNoDataWarning(createdTime, dialysisId) {
        self.noDataWarning = false;
        if (moment().diff(moment(createdTime), 'hours') < 24) {
            dialysisService.getDialysisDataByDialysisId(dialysisId).then(
                res => {
                    console.log(
                        "DialysisHeader diff from now in hours",
                        moment().diff(
                            moment(self.currentData.DialysisHeader.CreatedTime),
                            "hours"
                        )
                    );
                    // 若無透析機資料(包含連續型)，則須給提示
                    if (res.data === 0) {
                        self.noDataWarning = true;
                        return;
                    }
                    self.noDataWarning = false;
                },
                () => {
                    self.noDataWarning = false;
                }
            );
        }
    }
}

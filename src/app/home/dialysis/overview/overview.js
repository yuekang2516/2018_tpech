import tpl from './overview.html';
import './overview.less';
import Waterfall from '../../../../static/responsive_waterfall.js';
import bloodPressureChartTpl from './bloodPressureChart.html';

angular.module('app').component('overview', {
    template: tpl,
    controller: overviewCtrl
});

overviewCtrl.$inject = ['$q', '$state', '$rootScope', '$window', 'OverViewService', 'wardService', '$stateParams', 'SettingService', '$mdDialog', '$mdMedia', '$interval', 'showMessage', '$timeout', '$filter', 'userService', 'nfcService', 'PatientService', 'infoService', 'dialysisService', 'checkStaffService'];

function overviewCtrl($q, $state, $rootScope, $window, OverViewService, wardService, $stateParams,
    SettingService, $mdDialog, $mdMedia, $interval, showMessage, $timeout, $filter, userService, nfcService, PatientService, infoService, dialysisService, checkStaffService) {
    const self = this;

    let $translate = $filter('translate');

    self.headerId = $stateParams.headerId; // 表頭Id
    self.PatientId = $stateParams.patientId; // 病人Id
    self.time = 10000; // 設定檢查時間
    let timer;
    // 通知預設值初始化
    self.notificationisDataShow = false; // 通知開關
    self.notificationisRead = false; // 已讀是否
    // 處方數量
    self.prescriptionLength = 0;
    // 生理徵象
    // self.PreVitalSign = []; // 生理徵象 透析前
    // self.PostVitalSign = []; // 生理徵象 透析後
    self.vitalSign = {
        PreVitalSign: [],  // 生理徵象 透析前
        PostVitalSign: []  // 生理徵象 透析後
    };
    // 體重計算相關
    self.dehydrationSetting = 0; // 預設計算的設定脫水量
    self.customDehydrationSetting = false; // 是否自訂脫水量 (預設自動帶入計算)
    // AV
    self.vesselAssessments = []; // 血管通路評估資料
    self.headerVesselAssessments = [];
    // 檢驗
    self.labItemNames = ['生化(AC)', '生化(PC)', 'CBC', 'i-PTH', 'HBsAg', 'Anti-Hcv', 'BUN(post)', 'Fe,TIBC,Ferritin', 'HCT', 'eyetone', 'CA/P'];
    self.checkItems = [];
    self.labItems = {};
    self.ArteryPositionInput = [];
    self.VeinPositionInput = [];
    // 皮膚檢查
    self.skinAssessmentItem1 = null;
    self.skinAssessmentItem2 = null;
    self.skinAssessmentItem3 = null;
    self.skinAssessmentItem4 = null;
    self.skinAssessmentItem5 = null;
    self.skinAssessmentItem6 = null;

    self.clinic = $translate('overview.component.clinic');
    self.emergency = $translate('overview.component.emergency');
    self.hospitalized = $translate('overview.component.hospitalized');

    self.dialysisHeader = null; // data bind
    self.user = SettingService.getCurrentUser(); // 目前user

    // Patient Source options
    // self.patientSourceOptions = ['門診', '急診', '住院'];
    self.patientSourceOptions = [
        $translate('overview.component.clinic'),
        $translate('overview.component.emergency'),
        $translate('overview.component.hospitalized')
    ];
    self.patientSource = $translate('overview.component.clinic');

    let vitalSignObj = {
        BPS: '',
        BPD: '',
        BloodPressurePosture: '臥',
        Temperature: null,
        Pulse: null,
        Respiration: null,
        RecordTime: new Date(moment().format('YYYY/MM/DD HH:mm')) // 預設是今天日期
    };

    // 結束後情況
    let afterSituation = [];    //  目前選擇的
    self.afterSituationOther = [];  // 其他另外處理
    self.afterSituationTitle = ['良好', '痙攣', '頭痛', '嘔吐'];    //  '其他'由 html 處理

    // let headerVesselAssessmentsObj = {
    //     Data: {
    //         Id: '',
    //     },
    //     ArteryCatheter: '',
    //     VeinCatheter: ''
    // };

    // 血管通路上針部位
    self.NeedlePositionObj = {
        '外側': 'outside',
        '內側': 'inside',
        '前臂': 'forearm',
        '上臂': 'upperarm'
    };

    let headerVesselAssessmentsObj = {
        Data: {
            Id: '',
        },
        ArteryPosition: '',
        VeinPosition: '',
        Thrill: '',
        Favorable: '',
        ShowArteryInput: false, // 是否顯示 Artery 其他的 input
        ShowVeinInput: false // 是否顯示 Vein 其他的 input
    };

    self.searchStr = '';
    self.allSignNurses = []; // 核對簽章的護士清單
    self.nursesList = [];
    self.iosNFCSupport = false; // 確認ios手機是否支援nfc
    self.showSelect = false; // 網頁版 簽章下拉選單
    self.showNfcBtn = false; // 手機版 簽章nfc按鈕
    self.signNurse = ''; // 簽章者
    self.preSignNurse = ''; // 前一個存檔過的簽章者 for web

    self.clearbuttonShow = []; // 若血管通路有選是否出現清除按鈕及選項
    self.isSelector = false;

    // let lastDialysisData;
    self.lastCatheterLengthError = false; // 取得前次導管資料是否失敗

    // 取得上一筆透析資料：前次導管長
    self.lastCatheterLength = [];

    self.dialysisStartTime; // 透析日期

    // api loading
    self.$onInit = function onInit() {

        console.log('目前登入者', SettingService.getCurrentUser());
        // document.addEventListener('deviceready', checkIosVersion);
        // 如果有簽章護理師 self.showSelect = false; 沒有 self.showSelect = true;
        self.showSelect = true;
        self.showNfcBtn = true;

        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getModuleFunctions();

        // self.isBrowser = cordova.platformId === 'browser';
        switch (cordova.platformId) {
            case 'browser':
                console.log('是 網頁版');
                self.isSelector = true; // 核對簽章：顯示下拉選單 isSelector
                break;
            case 'android':
                console.log('是 android');
                self.isSelector = false;
                break;
            case 'ios':
                console.log('是 ios');
                // 確認ios手機是否支援nfc
                checkIosVersion().then((qdata) => {
                    if (self.iosNFCSupport) {
                        // 有支援nfc
                        self.isSelector = false;

                    } else {
                        // 沒有支援nfc
                        self.isSelector = true; // 核對簽章：顯示下拉選單 isSelector
                    }
                }, (err) => {

                });
                break;
            default:
                break;

        }

        console.log('self.isSelector', self.isSelector);


        // 取表頭資料，因為此頁會依 modifiedtime 判斷是否須從 server 重撈，為避免使用者看到 loading 畫面，將 self.loading = true 拉至 getByHeaderId 方法外
        self.loading = true;

        console.log('是網頁版 self.isBrowser', self.isBrowser);
        // 網頁版
        // 先取得所有使用者下拉式清單  isForce = false, firstTime = false
        let isForce = false;
        let firstTime = false;

        // $q.all執行的陣列
        let executeArray = [];
        // executeArray.push();
        // 1.簽章護理師清單  2.採血品項清單  3.前次導管長  4.總資料 dialysisHeader
        executeArray.push(getNurses()); // 1.簽章護理師清單
        executeArray.push(getBloodCollectionAndFiberChamber()); // 2.採血品項清單 及 透析後AK的Fiber Chamber
        executeArray.push(getLastCatheterLength());// 3.前次導管長

        $q.all(executeArray).then(() => {
            getByHeaderId(false, true); // 4.總資料 dialysisHeader
        }).catch(() => {
            console.log('q.all catch');
            // for 取得前次導管資料是否失敗
            self.lastCatheterLengthError = true;
            // 因為總攬資料讀取失敗但之前有成功過，因前端沒有重整按鈕，所以讀取失敗後重新讀取資料一次
            let isApiReady = false;
            if (isForce && !firstTime && !isApiReady) {
                startCheckModifiedTime();
            }
            showMessage($translate('customMessage.serverError')); // lang.ComServerError

        }).finally(() => {
            self.loading = false;
        });
        // $timeout(() => {
        //     var waterfall = new Waterfall({ minBoxWidth: 200 });
        // }, 500);
    };

    self.changeWard = function (wardId) {
        getBedNosByWard(wardId);
    };

    // 取得後台的床組、床號
    self.bedGroups = [];
    self.notExistBedNo = '';  // 供 html 標記用
    function getBedNosByWard(wardId) {
        self.bedNoMsg = '取得床位資料中...';
        self.notExistBedNo = '';
        // 讀取該透析室中所有的床位
        wardService.getById(wardId).then((res) => {
            console.log('wardService patient', res);
            self.bedNoMsg = '';
            if (res.data && Array.isArray(res.data.BedNos) && res.data.BedNos.length > 0) {
                // 先比對目前的病人資料裡的床號是否仍在後台設定裡，若已不再則須 push 到選項裡並給個標記
                if (self.dialysisHeader.BedNo) {
                    let idx = res.data.BedNos.indexOf(self.dialysisHeader.BedNo);
                    // 已不存在
                    if (idx < 0) {
                        self.notExistBedNo = self.dialysisHeader.BedNo;
                    }
                }

                // 重新組 BedGroups 因為沒分組的不在裡面，需多一組 Name 為 ''的  [{Name:'B', BedNos:['1', '2']}, {Name:'C', BedNos:['3', '4']}]
                let bedGroups = res.data.BedGroups;
                _.forEach(res.data.BedGroups, (value) => {
                    // 砍掉對應到的 BedNo
                    _.forEach(value.BedNos, (bedNo) => {
                        let idx = res.data.BedNos.indexOf(bedNo);
                        if (idx > -1) {
                            res.data.BedNos.splice(idx, 1);
                        }
                    });
                });
                // 若有剩下的塞進 name 為 '' 的物件裡
                if (res.data.BedNos.length > 0) {
                    bedGroups.push({ Name: '未分類', BedNos: res.data.BedNos });
                }
                // 處理已不存在的床號
                if (self.notExistBedNo) {
                    bedGroups.push({ Name: '已不存在', BedNos: [self.notExistBedNo] });
                }

                self.bedGroups = bedGroups;
            }
        }).catch(() => {
            self.bedNoMsg = '取得透析室床號失敗，請重取';
            // showMessage('取得透析室床號失敗'); // lang.ComServerError
        }).finally(() => {

        });
    }

    // 1.簽章護理師清單
    function getNurses() {
        const deferred = $q.defer();

        checkStaffService.getNurseStaff().then((q) => {
            console.log('取得簽章人員清單 overview q', q);
            self.hasStaffList = true;
            // 核對簽章清單
            // self.onUserAllStaff = angular.copy(q);
            // self.offUserAllStaff = angular.copy(q);
            // 處方的核對簽章
            self.prescriptionAllStaff = angular.copy(q);
            deferred.resolve();
        }, () => {
            console.log('取得簽章人員清單 err');
            deferred.reject();
        });

        return deferred.promise;
    }

    // 2.採血品項清單：處理採血品項自定義，要從infoService get
    function getBloodCollectionAndFiberChamber() {
        const deferred = $q.defer();
        infoService.get().then((q) => {
            console.log('採血品項自定義 q', q.data);
            if (!q.data.DefinitionSetting || !q.data.DefinitionSetting.Records.Categories) {
                // 都沒有設定選項
                // 後台參數設定處採血品項沒有內容，顯示警示字樣
                self.showBloodCollectionText = true; // 採血品項
                self.showFiberText = true; // 結束 Hollow Fiber
                self.showChamberText = true; // 結束 Chamber

            } else {
                // 採血品項
                if (!q.data.DefinitionSetting.Records.Categories.BloodCollection ||
                    (q.data.DefinitionSetting.Records.Categories.BloodCollection &&
                        q.data.DefinitionSetting.Records.Categories.BloodCollection.length === 1 &&
                        q.data.DefinitionSetting.Records.Categories.BloodCollection[0] === ''
                    )
                ) {
                    // 後台參數設定處採血品項沒有內容，顯示警示字樣
                    self.showBloodCollectionText = true;
                } else {
                    self.showBloodCollectionText = false; // 不顯示警示字樣
                    // 採血品項清單
                    self.dialysisExsanguinateContent = angular.copy(q.data.DefinitionSetting.Records.Categories.BloodCollection);
                    // self.dialysisExsanguinateContent.unshift(null);
                }

                // 透析後AK的 Fiber
                if (!q.data.DefinitionSetting.Records.Categories.EndHollowFiber ||
                    (q.data.DefinitionSetting.Records.Categories.EndHollowFiber &&
                        q.data.DefinitionSetting.Records.Categories.EndHollowFiber.length === 1 &&
                        q.data.DefinitionSetting.Records.Categories.EndHollowFiber[0] === ''
                    )
                ) {
                    // 後台參數設定沒有內容，顯示警示字樣
                    self.showFiberText = true;
                } else {
                    self.showFiberText = false; // 不顯示警示字樣
                    // 採血品項清單
                    self.endHollowFiberContent = angular.copy(q.data.DefinitionSetting.Records.Categories.EndHollowFiber);
                    // self.endHollowFiberContent.unshift(null);
                }

                // 透析後AK的 Chamber
                if (!q.data.DefinitionSetting.Records.Categories.EndChamber ||
                    (q.data.DefinitionSetting.Records.Categories.EndChamber &&
                        q.data.DefinitionSetting.Records.Categories.EndChamber.length === 1 &&
                        q.data.DefinitionSetting.Records.Categories.EndChamber[0] === ''
                    )
                ) {
                    // 後台參數設定沒有內容，顯示警示字樣
                    self.showChamberText = true;
                } else {
                    self.showChamberText = false; // 不顯示警示字樣
                    // 採血品項清單
                    self.endChamberContent = angular.copy(q.data.DefinitionSetting.Records.Categories.EndChamber);
                    // self.endChamberContent.unshift(null);
                }
            }
            deferred.resolve();
        }, (err) => {
            deferred.reject();
        });
        return deferred.promise;
    }

    // 3.前次導管長：取得上一筆透析資料
    function getLastCatheterLength() {
        const deferred = $q.defer();
        // self.lastCatheterLength = [];
        dialysisService.getLastByPatientAndHeaderId(self.PatientId, self.headerId).then((q) => {
            self.lastCatheterLengthError = false; // 取得前次導管資料是否失敗
            if (!q.data || !q.data.VesselAssessments) {
                self.noLastCatheterLength = true; // 此病人完全沒有任何前次資料
                deferred.resolve();
                return;
            }
            console.log('取得上一筆透析資料 q', q);
            // console.log('取得上一筆透析資料 q', q.data.VesselAssessments);
            for (let i = 0; i < q.data.VesselAssessments.length; i++) {
                let lastVesselAssessments = q.data.VesselAssessments[i];
                // console.log('取得上一筆透析資料 lastVesselAssessments', lastVesselAssessments.CatheterLength);
                self.lastCatheterLength[i] = lastVesselAssessments.CatheterLength;
            }
            deferred.resolve();
        }, (err) => {
            deferred.reject();
        });
        return deferred.promise;
    }

    // 血壓趨勢圖
    self.showBloodPressureChart = function showBloodPressureChart() {
        let data = {
            dialysisStartTime: self.dialysisStartTime,
            patientId: $stateParams.patientId
        };
        $mdDialog.show({
            controller: 'bloodPressureChartController',
            controllerAs: 'dialog',
            bindToController: true,
            template: bloodPressureChartTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            multiple: true,
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok');
            $mdDialog.cancel();

        }, (cancel) => {
            console.log('dialog cancel');
            $mdDialog.cancel();
        });

    };

    // // 生理徵象(最多3筆)：透析前 加一筆
    // self.addPreVitalSign = function addPreVitalSign() {
    //     if (self.PreVitalSign.length < 3) {
    //         self.PreVitalSign.push(angular.copy(vitalSignObj));
    //         console.log('前 vitalSign：加一筆', self.PreVitalSign);
    //     }
    // }
    // // 生理徵象：透析前 減一筆
    // self.deletePreVitalSign = function deletePreVitalSign(index) {
    //     self.PreVitalSign.splice(index, 1);
    // }

    // // 生理徵象(最多3筆)：透析後 加一筆
    // self.addPostVitalSign = function addPostVitalSign() {
    //     if (self.PostVitalSign.length < 3) {
    //         self.PostVitalSign.push(angular.copy(vitalSignObj));
    //         console.log('後 vitalSign：加一筆', self.PostVitalSign);
    //     }
    // }
    // // 生理徵象：透析後 減一筆
    // self.deletePostVitalSign = function deletePostVitalSign(index) {
    //     self.PostVitalSign.splice(index, 1);
    // }

    // 血管通路(最多2筆)：加一筆
    self.addVesselAssessments = function addVesselAssessments() {
        if (self.headerVesselAssessments.length < 2) {
            self.headerVesselAssessments.push(angular.copy(headerVesselAssessmentsObj));
            console.log('血管通路：加一筆', self.headerVesselAssessments);
        }
    };
    // 血管通路：減一筆
    self.deleteVesselAssessments = function deleteVesselAssessments(index) {
        self.headerVesselAssessments.splice(index, 1);
        console.log('deleteVesselAssessments', self.headerVesselAssessments)
    };
    // 血管通路清除按鈕
    self.deleteVesselAssessmentsContent = function deleteVesselAssessmentsContent(index) {
        // self.headerVesselAssessments[index] = [];
        self.headerVesselAssessments[index].ArteryPosition = null;
        self.headerVesselAssessments[index].VeinPosition = null;
        self.headerVesselAssessments[index].Thrill = null;
        self.headerVesselAssessments[index].Favorable = null;
        self.headerVesselAssessments[index].SourceId = '';
        self.clearbuttonShow[index] = false;
    };


    // 核對簽章 - 現在登入者不可為核對者 (手機版：按下按鈕靠卡感應, Web版：下拉式選單，有搜尋功能)
    // 確認ios手機是否支援nfc
    function checkIosVersion() {
        const deferred = $q.defer();
        // if it's iPhone 7, 7+ and ios version greater than 11.0
        // Model Ex. iPhone9,1 -> 9.1
        // 避免 device not defined 的問題
        try {
            console.log('確認ios手機是否支援nfc', device);
            let modelNum = Number(device.model.substring(6).replace(',', '.'));
            if (device.platform == 'iOS' && device.version >= '11.0' && modelNum > 9) {
                // if(device.platform == 'iOS'  && device.version <= '11.0') {
                self.iosNFCSupport = true;
            }
            deferred.resolve('checkFinish');
        } catch (error) {
            // console.log('nfc check error!!!!!!!!!!!!!');
        }

        return deferred.promise;
    }

    // isForce: 是否要重新至伺服器要資料; firstTime: 供判斷是否為第一次進入此頁面，第一次進入頁面需馬上確認是否為最新資料並更新，但不跳提示訊息
    function getByHeaderId(isForce = false, firstTime = false) {
        OverViewService.getByHeaderId(self.headerId, isForce).then((q) => {
            console.log('self.dialysisHeader', angular.copy(q.data));
            if (q.status === 200) {
                // 避免直接操作 service 的 data，會造成未儲存，回到這頁仍是修改後的數值
                self.dialysisHeader = angular.copy(q.data);

                // 多存電子病歷的狀況，修改失敗時才有機會回復按鈕的狀態
                self.emrStatus = self.dialysisHeader.IsWaitingToUpload;

                getBedNosByWard(self.dialysisHeader.WardId);

                // 結束後情況
                // 與其他區隔開
                if (Array.isArray(self.dialysisHeader.AfterSituation)) {
                    let idx = self.dialysisHeader.AfterSituation.indexOf('其他');
                    if (idx > -1) {
                        self.afterSituationOther = self.dialysisHeader.AfterSituation.splice(idx, 2);
                        afterSituation = self.dialysisHeader.AfterSituation;
                    } else {
                        afterSituation = self.dialysisHeader.AfterSituation;
                    }
                }

                // 透析日期
                self.dialysisStartTime = angular.copy(self.dialysisHeader.StartTime);

                // 有報到日顯示，沒有報到日不顯示
                if (self.dialysisHeader.CheckInTime) {
                    self.dialysisHeader.CheckInTime = new Date(self.dialysisHeader.CheckInTime);
                }
                // if (self.dialysisHeader.CheckInTime) {
                //     self.dialysisHeader.CheckInTime = new Date(self.dialysisHeader.CheckInTime);
                // } else {
                //     // 沒有CheckInTime者，預設CheckInTime為CreatedTime
                //     self.dialysisHeader.CheckInTime = new Date(self.dialysisHeader.CreatedTime);
                // }

                // 處理上機時間/下機時間
                if (self.dialysisHeader.DialysisDataFirstTime) {
                    self.dialysisHeader.DialysisDataFirstTime = new Date(self.dialysisHeader.DialysisDataFirstTime);
                }
                if (self.dialysisHeader.DialysisDataLastTime) {
                    self.dialysisHeader.DialysisDataLastTime = new Date(self.dialysisHeader.DialysisDataLastTime);
                }

                console.log('表頭資料 self.dialysisHeader', self.dialysisHeader);

                console.log('self.dialysisHeader.CheckStaff', self.dialysisHeader.CheckStaff);

                // 處理核對簽章 - 共用簽章
                $timeout(() => {
                    // 處方的核對簽章
                    initPrescriptionUser(self.dialysisHeader.CheckStaff, self.prescriptionAllStaff);
                }, 0);

                // 生理徵象：pre物件
                if (self.dialysisHeader.PreVitalSign.length > 0) {
                    // 有資料
                    // 20190503 新開表時會自動產生一組 preVitalSign，為了時間顯示需要多此判斷
                    if (self.dialysisHeader.PreVitalSign.length === 1) {
                        // 判斷是否為自動產生的
                        if (self.dialysisHeader.PreVitalSign[0].BPD === null &&
                            self.dialysisHeader.PreVitalSign[0].BPS === null &&
                            self.dialysisHeader.PreVitalSign[0].BloodPressurePosture === null &&
                            self.dialysisHeader.PreVitalSign[0].Pulse === null &&
                            self.dialysisHeader.PreVitalSign[0].Respiration === null &&
                            self.dialysisHeader.PreVitalSign[0].Temperature === null &&
                            self.dialysisHeader.PreVitalSign[0].RecordTime === null) {
                            self.dialysisHeader.PreVitalSign[0].RecordTime = new Date(moment().format('YYYY/MM/DD HH:mm'));
                        }
                    }

                    // 先處理測量時間
                    for (let i = 0; i < self.dialysisHeader.PreVitalSign.length; i++) {
                        if (self.dialysisHeader.PreVitalSign[i].RecordTime) {
                            self.dialysisHeader.PreVitalSign[i].RecordTime = new Date(self.dialysisHeader.PreVitalSign[i].RecordTime);
                        }
                    }
                    self.vitalSign.PreVitalSign = self.dialysisHeader.PreVitalSign;
                    // self.PreVitalSign = self.dialysisHeader.PreVitalSign;
                } else {
                    // 沒資料：初始化一組
                    self.vitalSign.PreVitalSign = [
                        angular.copy(vitalSignObj)
                    ];
                    // self.PreVitalSign = [
                    //     angular.copy(vitalSignObj)
                    // ];
                }
                // 生理徵象：post物件
                if (self.dialysisHeader.PostVitalSign.length > 0) {
                    // 有資料
                    // 先處理測量時間
                    for (let i = 0; i < self.dialysisHeader.PostVitalSign.length; i++) {
                        if (self.dialysisHeader.PostVitalSign[i].RecordTime) {
                            self.dialysisHeader.PostVitalSign[i].RecordTime = new Date(self.dialysisHeader.PostVitalSign[i].RecordTime);
                        }
                    }
                    self.vitalSign.PostVitalSign = self.dialysisHeader.PostVitalSign;
                    // self.PostVitalSign = self.dialysisHeader.PostVitalSign;
                } else {
                    // 沒資料：初始化一組
                    self.vitalSign.PostVitalSign = [
                        angular.copy(vitalSignObj)
                    ];
                    // self.PostVitalSign = [
                    //     angular.copy(vitalSignObj)
                    // ];
                }

                // 離院方式
                if (self.dialysisHeader.Leaving != null && self.dialysisHeader.Leaving.match('other')) {
                    self.LeavingInput = self.dialysisHeader.Leaving.substring(5);
                    self.dialysisHeader.Leaving = self.dialysisHeader.Leaving.substring(0, 5);
                }
                // 血管通路
                if (self.dialysisHeader.VesselAssessments.length > 0) {
                    // 有資料
                    self.headerVesselAssessments = self.dialysisHeader.VesselAssessments;
                    for (let i = 0; i < self.dialysisHeader.VesselAssessments.length; i++) {
                        // 標記是否出現血管通路選後的選項
                        if (q.data.VesselAssessments[i].SourceId != '') {
                            self.clearbuttonShow[i] = true;
                        }
                        else {
                            self.clearbuttonShow[i] = false;
                        }

                        // ArteryPosition 字串轉陣列
                        if (self.headerVesselAssessments[i].ArteryPosition != null) {
                            self.headerVesselAssessments[i].ArteryPosition = self.headerVesselAssessments[i].ArteryPosition.split('@@');

                            // ['abc', 'xyz', 'otherxxx']
                            if (self.headerVesselAssessments[i].ArteryPosition.length > 0) {
                                for (let j = 0; j < self.headerVesselAssessments[i].ArteryPosition.length; j++) {

                                    if (self.headerVesselAssessments[i].ArteryPosition[j].includes('other')) {
                                        // 陣列裡有other
                                        self.headerVesselAssessments[i].ShowArteryInput = true; // 是否顯示 其他的 input
                                        self.headerVesselAssessments[i].ArteryPositionInput = self.dialysisHeader.VesselAssessments[i].ArteryPosition[j].substring(5);
                                        self.headerVesselAssessments[i].ArteryPosition[j] = self.dialysisHeader.VesselAssessments[i].ArteryPosition[j].substring(0, 5); // other
                                    } else {
                                        // 陣列裡沒有other
                                        self.headerVesselAssessments[i].ArteryPositionInput = null;
                                        self.headerVesselAssessments[i].ShowArteryInput = false; // 是否顯示 其他的 input
                                    }
                                }
                            }
                        } else {
                            self.headerVesselAssessments[i].ArteryPosition = [];
                            self.headerVesselAssessments[i].ArteryPositionInput = null;
                            self.headerVesselAssessments[i].ShowArteryInput = false; // 是否顯示 其他的 input
                        }
                        // if (self.headerVesselAssessments[i].ArteryPosition != null && self.headerVesselAssessments[i].ArteryPosition.match('other')) {
                        //     // for (let i = 0; i < self.dialysisHeader.VesselAssessments.length; i++) {
                        //     self.ArteryPositionInput[i] = self.dialysisHeader.VesselAssessments[i].ArteryPosition.substring(5);
                        //     self.headerVesselAssessments[i].ArteryPosition = self.dialysisHeader.VesselAssessments[i].ArteryPosition.substring(0, 5);
                        // } else if (self.ArteryPositionInput[i] == null || self.ArteryPositionInput[i] == undefined) {
                        //     self.ArteryPositionInput[i] == '';
                        // }
                    }
                    for (let i = 0; i < self.dialysisHeader.VesselAssessments.length; i++) {
                        if (q.data.VesselAssessments[i].SourceId != '') {
                            self.clearbuttonShow[i] = true;
                        }
                        else {
                            self.clearbuttonShow[i] = false;
                        }

                        // VeinPosition 字串轉陣列
                        if (self.headerVesselAssessments[i].VeinPosition != null) {
                            self.headerVesselAssessments[i].VeinPosition = self.headerVesselAssessments[i].VeinPosition.split('@@');

                            // ['abc', 'xyz', 'otherxxx']
                            if (self.headerVesselAssessments[i].VeinPosition.length > 0) {
                                for (let j = 0; j < self.headerVesselAssessments[i].VeinPosition.length; j++) {

                                    if (self.headerVesselAssessments[i].VeinPosition[j].includes('other')) {
                                        // 陣列裡有other
                                        self.headerVesselAssessments[i].ShowVeinInput = true; // 是否顯示 其他的 input
                                        self.headerVesselAssessments[i].VeinPositionInput = self.dialysisHeader.VesselAssessments[i].VeinPosition[j].substring(5);
                                        self.headerVesselAssessments[i].VeinPosition[j] = self.dialysisHeader.VesselAssessments[i].VeinPosition[j].substring(0, 5); // other
                                    } else {
                                        // 陣列裡沒有other
                                        self.headerVesselAssessments[i].VeinPositionInput = null;
                                        self.headerVesselAssessments[i].ShowVeinInput = false; // 是否顯示 其他的 input
                                    }
                                }
                            }
                        } else {
                            self.headerVesselAssessments[i].VeinPosition = [];
                            self.headerVesselAssessments[i].VeinPositionInput = null;
                            self.headerVesselAssessments[i].ShowVeinInput = false; // 是否顯示 其他的 input
                        }
                        // if (self.headerVesselAssessments[i].VeinPosition != null && self.headerVesselAssessments[i].VeinPosition.match('other')) {
                        //     self.VeinPositionInput[i] = self.dialysisHeader.VesselAssessments[i].VeinPosition.substring(5);
                        //     self.headerVesselAssessments[i].VeinPosition = self.dialysisHeader.VesselAssessments[i].VeinPosition.substring(0, 5);
                        // }
                    }
                    // for(let i = 0; i < self.dialysisHeader.VesselAssessments.length; i++) {
                    //     self.headerVesselAssessments[i] = angular.extend(self.headerVesselAssessments[i], self.dialysisHeader.VesselAssessments[i]);
                    // }
                } else {
                    // 沒資料：初始化一組
                    self.headerVesselAssessments = [
                        angular.copy(headerVesselAssessmentsObj)
                    ];
                }
                // console.log('血管通路 self.headerVesselAssessments', self.headerVesselAssessments);

                // 病人來源，若從未選過預設為門診
                if (self.dialysisHeader.PatientSource) {
                    switch (self.dialysisHeader.PatientSource) {
                        case 'emergency':
                            self.patientSource = $translate('overview.component.emergency');
                            break;
                        case 'inpatient':
                            self.patientSource = $translate('overview.component.hospitalized');
                            break;
                        default:
                            self.patientSource = $translate('overview.component.clinic');
                            break;
                    }
                }

                // 透析室選單，若使用者為 admin 則顯示該醫院的所有透析室，若為一般則顯示該使用者負責的透析室
                if (SettingService.getCurrentUser().Access === 99) {
                    self.wards = {};
                    wardService.get().then((res) => {
                        // 組 key(Id) and value(Name)
                        _.forEach(res.data, (item) => {
                            self.wards[item.Id] = item.Name;
                        });
                        self.keys = Object.keys(self.wards);

                        // 若透析室只有一個，WardId & WardName 直接賦值
                        if (self.keys.length === 1) {
                            self.dialysisHeader.WardId = self.keys[0];
                            self.dialysisHeader.WardName = self.wards[self.keys[0]];
                        }

                    }, () => {
                        self.wardErr = true;
                    });
                } else {
                    self.wards = SettingService.getCurrentUser().Ward;
                    self.keys = Object.keys(self.wards);

                    // 若透析室只有一個，WardId & WardName 直接賦值
                    if (self.keys.length === 1) {
                        self.dialysisHeader.WardId = self.keys[0];
                        self.dialysisHeader.WardName = self.wards[self.keys[0]];
                    }
                }

                // 是否有處方
                self.prescriptionLength = q.data.Prescription === null ? 0 : Object.keys(q.data.Prescription).length;

                // 有處方才有模式次數
                // 處理模式次數：依照透析處方中顯示的模式，取相同模式之次數
                if (self.prescriptionLength !== 0 && Object.getOwnPropertyNames(self.dialysisHeader.Numbers).length > 0) {
                    _.forEach(self.dialysisHeader.Numbers, function (value, key) {
                        console.log('模式', key);
                        if (Object.hasProperty(self.dialysisHeader, 'Prescription.DialysisMode.Name') && key === self.dialysisHeader.Prescription.DialysisMode.Name) {
                            self.modeTimes = value;
                        }
                    });
                }

                self.anticoagulantsLength = q.data.Prescription === null || q.data.Prescription.Anticoagulants === null ? 0 : Object.keys(q.data.Prescription.Anticoagulants).length;

                // 檢驗判斷
                self.dialysisHeader.LabItems = self.dialysisHeader.LabItems || {};

                // lab, 把資料組畫面
                let keys = Object.keys(self.dialysisHeader.LabItems);
                for (var i = 0; i < keys.length; i++) {
                    self.checkItems[self.labItemNames.indexOf(keys[i])] = true;
                    self.labItems[keys[i]] = self.dialysisHeader.LabItems[keys[i]];
                }

                // 皮膚檢查
                self.dialysisHeader.SkinAssessment = self.dialysisHeader.SkinAssessment || [];
                self.skinAssessmentItem1 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.normal'));
                self.skinAssessmentItem2 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.redness'));
                self.skinAssessmentItem3 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.wound'));
                self.skinAssessmentItem4 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.Cyanosis'));
                self.skinAssessmentItem5 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.rednessAndSore'));
                self.skinAssessmentItem6 = self.dialysisHeader.SkinAssessment.some(x => x === $translate('overview.component.brokenSkin'));

                // 防止 textarea 展不開 這方法沒用
                // self.dialysisHeader.LastShiftIssues === null ? ' ' : self.dialysisHeader.LastShiftIssues;
                // self.dialysisHeader.ShiftIssues === null ? ' ' : self.dialysisHeader.ShiftIssues;
                // self.dialysisHeader.ChiefComplaint === null ? ' ' : self.dialysisHeader.ChiefComplaint;

                // 抓取血管通路
                if (q.data.StartTime) {
                    OverViewService.getBypatientidforselectoption(self.PatientId).then((d) => {
                        if (d.status === 200) {
                            console.log('抓取血管通路資料 d', d);
                            // self.vesselAssessments = d.data;
                            catheterTypeOption(d.data);
                        }
                    });
                }

                // 通知 start
                let unread = 0; // 未讀比數
                let isRead; // 是否已讀
                let i; // for loop
                let max; // for loop
                let ii; // for loop
                let maxii; // for loop
                // 取得通知訊息
                OverViewService.getNotification(self.headerId).then((n) => {
                    unread = 0;
                    if (n.data.length) {
                        max = n.data.length;
                        for (i = 0; i < max; i += 1) {
                            if (!n.data[i].ReadUsers.length) {
                                unread += 1;
                            } else {
                                isRead = false;
                                maxii = n.data[i].ReadUsers.length;

                                for (ii = 0; ii < maxii; ii += 1) {
                                    if (isRead) {
                                        break;
                                    } else if (n.data[i].ReadUsers[ii].Id === self.user.Id) {
                                        isRead = true;
                                    }
                                }

                                if (!isRead) {
                                    unread += 1;
                                }
                            }
                        }
                    }
                    self.notifications = _.orderBy(n.data, ['CreatedTime'], ['desc']); // 通知bind
                    self.notificationunread = unread; // 幾封未讀
                    self.notificationisRead = isRead; // 是否讀取？
                });
            }

            // 強制重整後，須重啟計時器
            // isForce
            if (isForce && !firstTime) {
                startCheckModifiedTime();
            }

            // 第一次進入時，檢查是否有重複，但不會跳對話框
            if (firstTime) {
                handleCheckModifiedTime(false);
            }

            // 讓 tab 切過來時，畫面 render 不必等太久 (只有 loading 畫面)
            self.loading = false;
            // $timeout(() => {
            //     var waterfall = new Waterfall({ minBoxWidth: 300 });
            // }, 0);
        }, () => {
            self.loading = false;
            // 因為總攬資料讀取失敗但之前有成功過，因前端沒有重整按鈕，所以讀取失敗後重新讀取資料一次
            if (isForce && !firstTime) {
                startCheckModifiedTime();
            }

            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // check 結束後情況
    self.afterSituationExists = function (item) {
        // 其他的判斷
        if (item === '其他') {
            return self.afterSituationOther[0] === '其他';
        }
        return afterSituation.indexOf(item) > -1;
    };
    self.afterSituationChange = function (item) {
        // 其他的判斷
        if (item === '其他') {
            if (self.afterSituationOther[0] === '其他') {
                self.afterSituationOther[0] = '';
            } else {
                self.afterSituationOther[0] = '其他';
                if (self.afterSituationOther.length < 2) {
                    self.afterSituationOther.push('');
                }
            }
            return;
        }

        var idx = afterSituation.indexOf(item);
        if (idx > -1) {
            afterSituation.splice(idx, 1);
        } else {
            afterSituation.push(item);
        }
    };

    // isAfter: false(採血前), true(採血後)
    self.checkExsanguinate = function (result, isAfter = false) {
        switch (result) {
            case '有':
            case '其他':
                // 預帶目前使用者
                if (isAfter) {
                    if (!self.dialysisHeader.AfterBloodTransfusionPerson) {
                        self.dialysisHeader.AfterBloodTransfusionPerson = self.user.Name;
                    }
                } else {
                    if (!self.dialysisHeader.BeforeBloodTransfusionPerson) {
                        self.dialysisHeader.BeforeBloodTransfusionPerson = self.user.Name;
                    }
                }
                break;
            case '無':
                // 清空相關欄位
                if (isAfter) {
                    self.dialysisHeader.AfterDISExsanguinateContent = null;
                    self.dialysisHeader.AfterBloodTransfusionPerson = null;
                } else {
                    self.dialysisHeader.BeforeDISExsanguinateContent = null;
                    self.dialysisHeader.BeforeBloodTransfusionPerson = null;
                }
                break;
            default:
                break;
        }
    };

    // 清空 Aranesp 的選擇
    self.clearAranesp = function () {
        self.dialysisHeader.Aranesp = null;
        self.dialysisHeader.Path = null;
    }

    // 清空 透析後資料 的選擇
    self.clearAfterDialysisOptions = function () {
        self.dialysisHeader.EndHollowFiber = null;
        self.dialysisHeader.EndChamber = null;
    }

    // 通知我知道了展開
    self.handleNotificationisDataShow = function handleNotificationisDataShow() {
        if (!self.loading && self.notifications.length > 0) {
            self.notificationisDataShow = !self.notificationisDataShow;
        }
    };
    // 點擊我知道了
    self.handleNotificationisDataSetRead = function handleNotificationisDataSetRead() {
        if (!self.loading && self.notifications.length > 0 && self.notificationunread) {
            OverViewService.putNotificationtoSetread(self.headerId).then((q) => {
                if (q.status === 200) {
                    self.notificationisDataShow = false;
                    self.notificationunread = 0;
                    self.notificationisRead = true;
                }
            });
        }
    };
    // 判斷資料是否已被其他使用者修改，預設會跳提示
    function handleCheckModifiedTime(showConfirmMsg = true) {
        if (self.headerId && self.dialysisHeader) {
            OverViewService.getByCheckModifiedTime(self.headerId).then((q) => {
                if (q.data && q.status === 200) {
                    // 保險起見，將時間字串皆轉成 moment 比較
                    if (moment(q.data).format('YYYYMMDDHHmmss') !== moment(self.dialysisHeader.ModifiedTime).format('YYYYMMDDHHmmss')) {
                        if (showConfirmMsg) {
                            // 確認是否仍在此頁面，若在才顯示警告並更新資料
                            if (!isDestroyed) {
                                confirmDataReLoad();
                            }
                        } else {
                            console.log('Need Updated silently');
                            getByHeaderId(true);
                        }
                    } else {
                        startCheckModifiedTime();
                    }
                }
            }, (res) => {
                startCheckModifiedTime();
            });
        }
    }

    // 啟動計時器確定是否為最新資料
    function startCheckModifiedTime() {
        // 先停止再啟動
        stopCheckModifiedTime();

        // 確認是否仍在此頁才啟動，否則會有多餘的 timer
        if (isDestroyed) {
            console.log('startCheckModifiedTime block it!!!!!!!!!', isDestroyed);
            return;
        }

        timer = $timeout(() => {
            handleCheckModifiedTime();
        }, self.time);
    }

    // 停止確定是否為最新資料的計時器
    function stopCheckModifiedTime() {
        if (timer) {
            $timeout.cancel(timer);
        }
    }

    // 重整確認
    function confirmDataReLoad() {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'confirmDataReLoad.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController() {
            const vm = this;
            vm.ok = function ok() {
                getByHeaderId(true);
                $mdDialog.hide();
            };
        }
    };

    // 帶入上次交班事項，如果有值的話
    self.ditto = function ditto() {
        if (self.dialysisHeader.LastShiftIssues) {
            self.dialysisHeader.ShiftIssues = self.dialysisHeader.LastShiftIssues;
        }
    };

    // 組 AV 血管通路選單資料
    function catheterTypeOption(vesselAssessments) {
        let vsa = false;
        console.log('血管通路選單資料', angular.copy(vesselAssessments));
        self.allVesselAssessments = vesselAssessments;
        self.vesselAssessments = vesselAssessments.map((va) => {
            if (va.StartDate) {
                if ((Date.parse(moment(va.StartDate).format('YYYY-MM-DD'))).valueOf() <= (Date.parse(moment(self.dialysisHeader.StartTime).format('YYYY-MM-DD'))).valueOf() &&
                    (!va.EndDate || (va.EndDate && (Date.parse(moment(va.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(moment(self.dialysisHeader.StartTime).format('YYYY-MM-DD'))).valueOf()))) {
                    vsa = true;
                }
            } else if (!va.EndDate || (va.EndDate && (Date.parse(moment(va.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(moment(self.dialysisHeader.StartTime).format('YYYY-MM-DD'))).valueOf())) {
                vsa = true;
            }
            if (vsa) {
                return {
                    Id: va.Id,
                    Text: `${va.StartDate ? moment(va.StartDate).format('YYYY-MM-DD') + '-' : ''}${self.handleTransformCatheterType(va.CatheterType)} ${$translate('vesselAssessment.vesselAssessment.' + va.CatheterPosition.Side)} ${$translate('vesselAssessment.vesselAssessment.' + va.CatheterPosition.Position)}`
                };
            }
            return null;
        });

        console.log('self.vesselAssessments', self.vesselAssessments);
    }
    // 拼出 CatheterType 和 VesselAssessment 資料
    self.vesselAssessmentFunction = (index) => {
        let data = self.headerVesselAssessments[index];
        console.log('拼出vesselAssessment SourceId: ', data.SourceId);
        if (data.SourceId != "") {
            self.clearbuttonShow[index] = true;
        } else {
            self.clearbuttonShow[index] = false;
        }
        if (self.headerVesselAssessments.length === 0 || !data.SourceId) {
            // TODO: -> 清空資料？
            self.headerVesselAssessments[index].ArteryPosition = null;
            self.headerVesselAssessments[index].VeinPosition = null;
            self.headerVesselAssessments[index].Thrill = null;
            self.headerVesselAssessments[index].Favorable = null;
            return;
        }
        // if (self.dialysisHeader.VesselAssessments.length === 0 || !data.Id) {
        //     return;
        // }
        let vesselAssessments = self.allVesselAssessments.filter(x => x !== undefined);
        // data.CatheterType = vesselAssessments.find(y => y.Id === data.Id).CatheterType;
        // data = vesselAssessments.find(y => y.Id === data.Id);
        // self.headerVesselAssessments[index].Data.Id = data.Id;
        // 新的 Data
        self.headerVesselAssessments[index].Data = angular.copy(vesselAssessments.find(y => y.Id === data.SourceId));

        console.log('拼出vesselAssessment 新資料 1', self.headerVesselAssessments[index].Data);

        // 預帶值 -> 清空資料？
        // TODO: 北市醫 動脈端上針部位
        // TODO: 北市醫 靜脈端上針部位
        self.headerVesselAssessments[index].ArteryPosition = null;
        self.headerVesselAssessments[index].VeinPosition = null;
        self.headerVesselAssessments[index].Thrill = null;
        self.headerVesselAssessments[index].Favorable = null;

        self.headerVesselAssessments[index].ArteryCatheter = '1';
        self.headerVesselAssessments[index].VeinCatheter = '1';
        self.headerVesselAssessments[index].CatheterLength = self.headerVesselAssessments[index].Data.CatheterType === 'Permanent' || self.headerVesselAssessments[index].Data.CatheterType === 'DoubleLumen' ? '15' : '';
        console.log('拼出vesselAssessment 新資料 2 self.headerVesselAssessments: ', self.headerVesselAssessments);
    };
    self.handleTransformCatheterType = function handleTransformCatheterType(catheterType) {
        let catheterTypeTC;

        switch (catheterType) {
            case 'AVFistula':
                catheterTypeTC = $translate('overview.component.AVFistula');
                break;
            case 'AVGraft':
                catheterTypeTC = $translate('overview.component.AVGraft');
                break;
            case 'Permanent':
                catheterTypeTC = $translate('overview.component.Permanent');
                break;
            case 'DoubleLumen':
                catheterTypeTC = $translate('overview.component.DoubleLumen');
                break;
            default:
                catheterTypeTC = $translate('overview.component.typeError');
        }

        return catheterTypeTC;
    };

    // 檢驗 ngChange
    self.handleChangeData = function handleChangeData(bool, key) {
        if (bool) {
            if (key === 'HCT') {
                self.dialysisHeader.LabItems[key] = self.labItemValue1;
            } else if (key === 'eyetone') {
                self.dialysisHeader.LabItems[key] = self.labItemValue2;
            } else {
                self.dialysisHeader.LabItems[key] = null;
            }
        } else {
            delete self.dialysisHeader.LabItems[key];
        }
    };

    // 皮膚評估 ngChange
    self.handleChangeSkinAssessment = function handleChangeSkinAssessment(bool, key) {
        if (bool) {
            self.dialysisHeader.SkinAssessment.push(key);
        } else {
            const i = self.dialysisHeader.SkinAssessment.indexOf(key);
            if (i >= 0) {
                self.dialysisHeader.SkinAssessment.splice(i, 1);
            }
        }
    };
    // 關表
    self.handleDialysisFinish = function handleDialysisFinish(event, datetime) {
        $mdDialog.show({
            locals: {
                startDate: datetime
            },
            controller: ['$mdDialog', 'startDate', dialysisFinish],
            templateUrl: 'confirmModal.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'c'
        }).then((closeDateTime) => {
            self.dialysisHeader.EndTime = closeDateTime;

            // 'true': 等待上傳; 'done': 已完成
            self.emrStatus = 'true';
            self.dialysisHeader.UploadUserId = SettingService.getCurrentUser().Id;
            self.dialysisHeader.ClickTime = moment();
            self.dialysisHeader.IsWaitingToUpload = self.emrStatus;
            self.submit();
        });

        function dialysisFinish(mdDialog, startDate) {
            const c = this;
            c.closeDatetime = new Date(moment().format('YYYY/MM/DD HH:mm:ss')); // 一開始先把今天丟給UI去顯示
            // let result = moment();

            // // 當日期或時間有修改時
            // c.dateChanged = function (date) {
            //     let y = moment(date).year();
            //     let m = moment(date).month();
            //     let d = moment(date).date();
            //     result = moment(result).year(y).month(m).date(d);
            // };
            // c.timeChanged = function (time) {
            //     let h = moment(time).hour();
            //     let m = moment(time).minute();
            //     result = moment(result).hour(h).minute(m).second(0);
            // };

            c.hide = function hide() {
                mdDialog.hide();
            };

            c.cancel = function cancel() {
                mdDialog.cancel();
            };

            // 按下確定關表的按鈕後, 回傳所選的日期&時間回上層 controller
            c.ok = function ok() {
                mdDialog.hide(c.closeDatetime);
            };
        }
    };

    let isDestroyed = false;
    self.$onDestroy = function $onDestroy() {
        isDestroyed = true;
        stopCheckModifiedTime();
        // document.removeEventListener('deviceready', checkIosVersion);
    };

    // null, undefined, '' -> true; 0 -> false
    function isNullOrEmpty(value) {
        return value == null || value === '';
    }
    // 存檔時確認vitalSign是否有空物件，空物件要刪除
    // 生理徵象內容一組五項項皆為空時不塞:比對陣列
    let emptyArray = ['BPS', 'BPD', 'Temperature', 'Pulse', 'Respiration'];
    function isEmptyVitalSignObj(vitalSignObj) {
        if (typeof vitalSignObj != 'object') {
            return true;
        }
        let result = true;
        _.forEach(emptyArray, (item) => {
            if (!isNullOrEmpty(vitalSignObj[item])) {
                result = false;
                return false;
            }
        });
        return result;
    }


    self.isSaving = false;
    self.submit = function submit() {
        self.isSaving = true;

        // if()
        // 須先停止正在 checkModifiedTime 的 timer 避免會有誤差
        stopCheckModifiedTime();

        if (self.dialysisHeader.AbnormalWeight === false) {
            self.dialysisHeader.AbnormalWeightReason = '';
        }

        if (self.dialysisHeader.VACR === '無') {
            if (self.dialysisHeader.VACRcontent) {
                delete self.dialysisHeader.VACRcontent;
            }
        }

        // 檢查是否關表
        if (self.dialysisHeader.EndTime !== null) {
            self.dialysisHeader.OffUserId = self.user.Id;
            self.dialysisHeader.OffUserName = self.user.Name;
        }
        // self.dialysisHeader.CatheterType
        self.dialysisHeader.ModifiedUserId = self.user.Id;
        self.dialysisHeader.ModifiedUserName = self.user.Name;

        // convert patient source to english
        switch (self.patientSource) {
            case $translate('overview.component.clinic'):
                self.dialysisHeader.PatientSource = 'outpatient';
                break;
            case $translate('overview.component.emergency'):
                self.dialysisHeader.PatientSource = 'emergency';
                break;
            default: // 住院
                self.dialysisHeader.PatientSource = 'inpatient';
                break;
        }

        // 將 labdata 組成上傳格式
        self.dialysisHeader.LabItems = {};
        for (let i = 0; i < self.checkItems.length; i++) {
            // 有选取的话, 将數值寫入
            if (self.checkItems[i]) {
                self.dialysisHeader.LabItems[self.labItemNames[i]] = self.labItems[self.labItemNames[i]];
            }
        }

        // 模式次數
        if (self.prescriptionLength !== 0 && Object.getOwnPropertyNames(self.dialysisHeader.Numbers).length > 0 && Object.hasProperty(self.dialysisHeader, 'Prescription.DialysisMode.Name')) {
            self.dialysisHeader.Numbers[self.dialysisHeader.Prescription.DialysisMode.Name] = self.modeTimes;
        }


        // 處理核對者-處方 - 共用簽章
        console.log('核對者 處方', self.prescriptionUser);
        if (self.prescriptionUser) {
            self.dialysisHeader.CheckStaff = {}; // 先清空
            self.dialysisHeader.CheckStaff[self.prescriptionUser.Id] = self.prescriptionUser.Name;
        } else {
            self.dialysisHeader.CheckStaff = {};
        }

        // 生理徵象內容一組六項皆為空時不塞:比對物件
        let emptyObj = {
            BPS: null,
            BPD: null,
            BloodPressurePosture: null,
            Temperature: null,
            Pulse: null,
            Respiration: null
            // RecordTime: null // 不比，因為預設會有今天日期，或是使用者有調過時間，但是依然未填其他數值
        };
        // 與emptyObj比較的物件
        let vitalSignObj = {};
        // 透析前
        self.dialysisHeader.PreVitalSign = [];
        let oneEmptyPreVitalSign = false; // 辨識是否 只有一個且為空值

        _.forEach(self.vitalSign.PreVitalSign, function (value, key) {
            vitalSignObj = angular.copy(value); // copy出來避免影響到真正要上傳的物件，因要刪除測量時間後再比對
            delete vitalSignObj.RecordTime; // 不比對測量時間
            // 比對是否有空的vitalSign
            let isEmpty = isEmptyVitalSignObj(vitalSignObj);
            // 跟空物件比對，如果六項皆為空時不塞
            if (!isEmpty) {
                // 不是空的
                self.vitalSign.PreVitalSign[key].isDeleted = false; // 標記不刪除
                self.dialysisHeader.PreVitalSign.push(value);
            } else if (isEmpty && self.vitalSign.PreVitalSign.length > 1) {
                // 是空的且不是只剩一個物件時
                // 最終要關掉顯示
                self.vitalSign.PreVitalSign[key].isDeleted = true; // 標記刪除
            } else if (isEmpty && self.vitalSign.PreVitalSign.length === 1) {
                self.vitalSign.PreVitalSign[key].isDeleted = false; // 標記不刪除
                oneEmptyPreVitalSign = true;
            }
            // 處理 RecordTime 不得儲存 null，否則存到後端時間格式會有問題，造成前端下次存檔時會失敗
            if (self.vitalSign.PreVitalSign[key].RecordTime == null) {
                self.vitalSign.PreVitalSign[key].RecordTime = new Date(moment().format('YYYY/MM/DD HH:mm'));
            }
        });
        // console.log('透析前 為空則不塞 最終 self.PreVitalSign', self.PreVitalSign);
        // 控制畫面顯示：有標記要刪除者刪除
        self.vitalSign.PreVitalSign = _.filter(self.vitalSign.PreVitalSign, function (o) {
            return !o.isDeleted;
        });
        self.vitalSign.PreVitalSign = _.forEach(self.vitalSign.PreVitalSign, function (o) {
            delete o.isDeleted;
            return true;
        });
        if (self.vitalSign.PreVitalSign.length === 1 && oneEmptyPreVitalSign) {
            // 只有一個且為空值
            self.dialysisHeader.PreVitalSign = [];
        } else {
            // 真正上傳資料
            self.dialysisHeader.PreVitalSign = self.vitalSign.PreVitalSign;
        }

        if (self.dialysisHeader.Leaving == 'other') {
            self.dialysisHeader.Leaving += self.LeavingInput;
        }

        // 透析後
        self.dialysisHeader.PostVitalSign = [];
        let oneEmptyPostVitalSign = false; // 辨識是否 只有一個且為空值
        _.forEach(self.vitalSign.PostVitalSign, function (value, key) {
            vitalSignObj = angular.copy(value); // copy出來避免影響到真正要上傳的物件，因要刪除測量時間後再比對
            delete vitalSignObj.RecordTime; // 不比對測量時間
            let isEmpty = isEmptyVitalSignObj(vitalSignObj);
            // 跟空物件比對，如果六項皆為空時不塞
            if (!isEmpty) {
                // 不是空的
                self.vitalSign.PostVitalSign[key].isDeleted = false; // 標記不刪除
                self.dialysisHeader.PostVitalSign.push(value);
            } else if (isEmpty && self.vitalSign.PostVitalSign.length > 1) {
                // 是空的且不是只剩一個物件時
                // 最終要關掉顯示
                self.vitalSign.PostVitalSign[key].isDeleted = true; // 標記刪除
                // self.deletePostVitalSign(key);
            } else if (isEmpty && self.vitalSign.PostVitalSign.length === 1) {
                self.vitalSign.PostVitalSign[key].isDeleted = false; // 標記不刪除
                oneEmptyPostVitalSign = true;
            }
            // 處理 RecordTime 不得儲存 null，否則存到後端時間格式會有問題，造成前端下次存檔時會失敗
            if (self.vitalSign.PostVitalSign[key].RecordTime == null) {
                self.vitalSign.PostVitalSign[key].RecordTime = new Date(moment().format('YYYY/MM/DD HH:mm'));
            }
        });
        // 控制畫面顯示：有標記要刪除者刪除
        self.vitalSign.PostVitalSign = _.filter(self.vitalSign.PostVitalSign, function (o) {
            return !o.isDeleted;
        });
        self.vitalSign.PostVitalSign = _.forEach(self.vitalSign.PostVitalSign, function (o) {
            delete o.isDeleted;
            return true;
        });
        if (self.vitalSign.PostVitalSign.length === 1 && oneEmptyPostVitalSign) {
            // 真正上傳資料
            self.dialysisHeader.PostVitalSign = [];
        } else {
            // 真正上傳資料
            self.dialysisHeader.PostVitalSign = self.vitalSign.PostVitalSign;
        }

        // 血管通路
        // 若選擇的血管通路 Id 為空則不塞
        self.dialysisHeader.VesselAssessments = [];
        console.log('若選擇的血管通路 Id 為空則不塞 self.headerVesselAssessments', self.headerVesselAssessments);
        // let newHeaderVesselAssessments = angular.copy(self.headerVesselAssessments);
        let oneEmptyVesselAssessments = false; // 辨識是否 只有一個且為空值
        _.forEach(self.headerVesselAssessments, (vessel, key) => {
            // 先找到other，將 ArteryPositionInput 串在一起
            // 先將other移到陣列最後一位，再將other與input串在一起
            // 動脈
            if (vessel.ArteryPosition && vessel.ArteryPosition.length > 0 && vessel.ArteryPosition.indexOf('other') > -1) {
                // 有 other
                vessel.ArteryPosition.splice(vessel.ArteryPosition.indexOf('other'), 1);
                let otherStr = 'other';
                otherStr = vessel.ArteryPositionInput ? otherStr.concat(vessel.ArteryPositionInput) : otherStr;
                vessel.ArteryPosition.push(otherStr);
            }
            // 前端使用，後台不會存取
            delete vessel.ArteryPositionInput;
            delete vessel.ShowArteryInput;
            // 靜脈
            if (vessel.VeinPosition && vessel.VeinPosition.length > 0 && vessel.VeinPosition.indexOf('other') > -1) {
                // 有 other
                vessel.VeinPosition.splice(vessel.VeinPosition.indexOf('other'), 1);
                let otherStr = 'other';
                otherStr = vessel.VeinPositionInput ? otherStr.concat(vessel.VeinPositionInput) : otherStr;
                vessel.VeinPosition.push(otherStr);
            }
            // 前端使用，後台不會存取
            delete vessel.VeinPositionInput;
            delete vessel.ShowVeinInput;
            // // 動脈
            // for (let i = vessel.ArteryPosition.length - 1; i >= 0; i--) {
            //     if (vessel.ArteryPosition[i] === 'other') {
            //         vessel.ArteryPosition[i] =  vessel.ArteryPosition[i].concat(vessel.ArteryPositionInput);
            //     }
            // }
            // // 靜脈
            // for (let i = vessel.VeinPosition.length - 1; i >= 0; i--) {
            //     if (vessel.VeinPosition[i] === 'other') {
            //         vessel.VeinPosition[i] =  vessel.VeinPosition[i].concat(vessel.VeinPositionInput);
            //     }
            // }
            // delete vessel.VeinPositionInput; // 前端使用，後台不會存取
            // 先將陣列轉字串
            vessel.ArteryPosition = vessel.ArteryPosition && vessel.ArteryPosition.length > 0 ? vessel.ArteryPosition.join('@@') : null; // 動脈
            vessel.VeinPosition = vessel.VeinPosition && vessel.VeinPosition.length > 0 ? vessel.VeinPosition.join('@@') : null; // 靜脈

            // if (vessel.ArteryPosition == 'other' && self.ArteryPositionInput[key] != null) {
            //     vessel.ArteryPosition += self.ArteryPositionInput[key];
            //     console.log('self.ArteryPosition1', self.ArteryPositionInput[key]);
            // }
            // if (vessel.VeinPosition == 'other' && self.VeinPositionInput[key] != null) {
            //     vessel.VeinPosition += self.VeinPositionInput[key];
            // }

            // console.log('!! ArteryPositionInput', vessel.ArteryPositionInput);
            // console.log('!! ArteryPositionInput', vessel.ArteryPositionInput);
            // console.log('!! vessel', vessel);

            if (vessel.Data && vessel.Data.Id && vessel.SourceId) {
                vessel.isDeleted = false; // 標記不刪除
                self.dialysisHeader.VesselAssessments.push(vessel);
            } else if (!vessel.Data.Id && self.headerVesselAssessments.length > 1) {
                // 最終要關掉顯示
                vessel.isDeleted = true; // 標記刪除
                // self.deleteVesselAssessments(key);
            } else if (!vessel.Data.Id && self.headerVesselAssessments.length === 1) {
                // 只有一個且為空值
                vessel.isDeleted = false; // 標記不刪除
                oneEmptyVesselAssessments = true;
            } else if (vessel.Data.Id && !vessel.SourceId) {
                vessel.isDeleted = true; // 標記刪除
            }
        });

        // 控制畫面顯示：有標記要刪除者刪除
        self.headerVesselAssessments = _.filter(self.headerVesselAssessments, function (o) {
            return !o.isDeleted;
        });
        self.headerVesselAssessments = _.forEach(self.headerVesselAssessments, function (o) {
            // 拿掉isDeleted欄位
            delete o.isDeleted;
            return true;
        });
        console.log('若選擇的血管通路 最終 self.headerVesselAssessments', self.headerVesselAssessments);
        // 真正上傳資料
        if (self.headerVesselAssessments.length === 1 && oneEmptyVesselAssessments) {
            // 只有一個且為空值
            self.dialysisHeader.VesselAssessments = [];
        } else {
            self.dialysisHeader.VesselAssessments = self.headerVesselAssessments;
        }

        // wardName
        self.dialysisHeader.WardName = self.wards[self.dialysisHeader.WardId];
        console.log('submit dialysisHeader', self.dialysisHeader);

        // 結束後情況
        self.dialysisHeader.AfterSituation = self.afterSituationOther[0] === '其他' ? afterSituation.concat(self.afterSituationOther) : afterSituation;

        OverViewService.put(self.dialysisHeader).then((res) => {
            if (res.status === 200) {
                // 回傳值是時間
                self.dialysisHeader.ModifiedTime = res.data;
                setTimeout(() => {
                    self.isSaving = false;
                }, 3000);
                getByHeaderId(true);
                showMessage($translate('overview.component.editSuccess'));
            }
        }, () => {
            // 回復原本的電子病歷狀態
            self.emrStatus = self.dialysisHeader.IsWaitingToUpload;
            setTimeout(() => {
                self.isSaving = false;
            }, 3000);
            getByHeaderId(false);
            startCheckModifiedTime();
            showMessage($translate('overview.component.editFail'));
        });
    };

    self.uploadEMR = function () {
        // 'true': 等待上傳; 'done': 已完成
        self.emrStatus = 'true';
        self.dialysisHeader.UploadUserId = SettingService.getCurrentUser().Id;
        self.dialysisHeader.ClickTime = moment();
        self.dialysisHeader.IsWaitingToUpload = self.emrStatus;

        self.submit();
    };

    self.patientSourceChange = function (patientSource) {
        switch (patientSource) {
            case $translate('overview.component.clinic'):
                if (self.dialysisHeader.AdmissionNumber) {
                    delete self.dialysisHeader.AdmissionNumber;
                }
                if (self.dialysisHeader.ESItriage) {
                    delete self.dialysisHeader.ESItriage;
                }
                break;
            case $translate('overview.component.emergency'):
                self.dialysisHeader.ESItriage = 0;
                if (self.dialysisHeader.AdmissionNumber) {
                    delete self.dialysisHeader.AdmissionNumber;
                }
                break;
            case $translate('overview.component.hospitalized'):
                if (self.dialysisHeader.ESItriage) {
                    delete self.dialysisHeader.ESItriage;
                }
                break;
        }
    };


    // 初始化處方的核對簽章
    function initPrescriptionUser(checkStaffObj, allStaff) {
        if (checkStaffObj !== null && _.size(checkStaffObj) > 0) {
            // 有簽章
            console.log('self.dialysisHeader.CheckStaff 有簽章', _.keys(checkStaffObj)[0]);
            // 有簽章
            let findNurse = _.filter(allStaff, function (o) {
                // console.log('處理核對簽章 o', o.Id, o.Name, _.keys(self.dialysisHeader.CheckStaff)[0]);
                return o.Id === _.keys(checkStaffObj)[0];
            });
            console.log('有簽章 findNurse', findNurse);
            // 如果在清單中已找不到，自行push上去

            if (!findNurse[0]) {
                // console.log('自行push上去 id', _.keys(self.dialysisHeader.CheckStaff)[0]);
                // console.log('自行push上去 name', _.values(self.dialysisHeader.CheckStaff)[0]);
                allStaff.unshift({ Name: _.values(checkStaffObj)[0], Id: _.keys(checkStaffObj)[0] });
                // 新加的要加在第一筆
                findNurse[0] = allStaff[0];
                // 新增的在最後一筆
                // findNurse[0] = allStaff[allStaff.length - 1];
            }
            self.prescriptionUser = findNurse[0];
            self.prePrescriptionUser = findNurse[0]; // 前一個存檔過的簽章者 for web
            self.showSelectForPrescription = false; // 網頁版 簽章下拉選單
            self.showNfcBtnForPrescription = false; // 手機版 簽章nfc按鈕

        } else {
            // 沒簽章
            console.log('沒簽章 處方');
            self.dialysisHeader.CheckStaff = {}; // 初始化 object
            self.prescriptionUser = '';
            self.prePrescriptionUser = ''; // 前一個存檔過的簽章者 for web                   
            self.showSelectForPrescription = true; // 網頁版 簽章下拉選單      
            self.showNfcBtnForPrescription = true; // 手機版 簽章nfc按鈕
        }
    }


    // 血管通路：上針部位勾選內容
    self.toggle = function (vesselType, vessel, item) {
        if (vesselType === 'Artery') {
            // 動脈
            // check if the object exists, if not create an object with an empty array
            if (!vessel.ArteryPosition) {
                vessel.ArteryPosition = [];
            }
            // find the index of the item in the array
            let idx = vessel.ArteryPosition.indexOf(item);
            if (idx > -1) {
                // remove the item from the array if it's found
                vessel.ArteryPosition.splice(idx, 1);
                // 控制其他input顯示
                if (item == 'other') {
                    vessel.ShowArteryInput = false;
                }
            } else {
                // add the item into the array
                vessel.ArteryPosition.push(item);
                if (item == 'other') {
                    vessel.ShowArteryInput = true;
                }
            }
        } else {
            // 靜脈
            // check if the object exists, if not create an object with an empty array
            if (!vessel.VeinPosition) {
                vessel.VeinPosition = [];
            }
            // find the index of the item in the array
            let idx = vessel.VeinPosition.indexOf(item);
            if (idx > -1) {
                // remove the item from the array if it's found
                vessel.VeinPosition.splice(idx, 1);
                if (item == 'other') {
                    vessel.ShowVeinInput = false;
                }
            } else {
                // add the item into the array
                vessel.VeinPosition.push(item);
                if (item == 'other') {
                    vessel.ShowVeinInput = true;
                }
            }
        }
        console.log('toggle ArteryPosition', vessel.ArteryPosition);
        console.log('toggle VeinPosition', vessel.VeinPosition);
    };

    // check if item exists and set the checkbox status
    self.exists = function (vesselType, vessel, item) {
        if (vesselType === 'Artery') {
            // 動脈
            if (vessel.ArteryPosition) {
                return vessel.ArteryPosition.indexOf(item) > -1;
            }
        } else {
            // 靜脈
            if (vessel.VeinPosition) {
                return vessel.VeinPosition.indexOf(item) > -1;
            }
        }
    };

    self.goback = function goback() {
        $window.history.back();
    };

}
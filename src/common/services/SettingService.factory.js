
angular
    .module('app')
    .factory('SettingService', SettingService);

SettingService.$inject = ['$state', '$q', '$localStorage', '$sessionStorage', '$http', '$filter'];

function SettingService($state, $q, $localStorage, $sessionStorage, $http, $filter) {

    const setting = {
        setLoginExpireTime,
        getLoginExpireTime,
        getStore,
        setStore,
        setCurrentUser,
        getCurrentUser,
        setCurrentHospital,
        getCurrentHospital,
        setHospitalSettings,
        getHospitalSettings,
        setServerUrl,
        getServerUrl,
        setCenterUser,
        getCenterUser,
        setCenterLoginExpireTime,
        getCenterLoginExpireTime,
        setLanguage,
        getLanguage,
        setIsOnline,
        isOnline,
        checkIsOnline,
        getSideNavStatus,
        setSideNavStatus,
        setUISetting,
        getUISettingByKey,
        getUISettingParams,
        getSummaryTabsArrayByRole,
        getTabIndexObj,
        checkAccessible,
        getModuleFunctions,
        checkDemoModeAndGetDataAsync,
        setCallback
    };

    let showSideNav = true;
    let sideNavObj = {};

    const $translate = $filter('translate');

    // 目前系統有記的設定，手動維護
    const UISettingParams = {
        ARRANGEBEDWARD: 'arrangeBedWard',
        TODAYBED: 'todayBed',
        SHOWDAYOFF: 'showDayoff',
        SUMMARYLISTTAB: 'summaryListTab',
        SUMMARYPATIENTINFO: 'summaryPatientInfo',
        PRESCRIPTIONTAG: 'prescriptionTag',
        DIALYSISFORM: 'dialysisFormQueryCondition'
    };

    // 僅醫師或管理員有的權限 病情摘要、處方、開藥
    const doctorOnly = ['doctornote', 'medicine', 'prescription'];

    // 角色群
    const nurseGroup = [null, undefined, '', 'other', 'nurse'];
    const docterGroup = ['doctor'];
    // 全域可用的方法
    // 判斷物件屬性是否存在(更深層的)
    Object.hasProperty = function (obj, key) {
        return key.split('.').every((x) => {
            if (typeof obj != 'object' || obj == null || !x in obj) {
                return false;
            }
            obj = obj[x];
            return true;
        });
    };


    function getUISettingParams() {
        return UISettingParams;
    }

    function getSideNavStatus(userId) {
        if (!_.isEmpty($localStorage.SIDENAV)) {
            sideNavObj = $localStorage.SIDENAV;
        }
        // if current id exists
        if ($localStorage.SIDENAV && $localStorage.SIDENAV.hasOwnProperty(userId)) {
            return $localStorage.SIDENAV[userId];
        }
        setSideNavStatus(userId, showSideNav);
        return showSideNav;
    }

    function setSideNavStatus(userId, status) {
        sideNavObj[userId] = status;
        $localStorage.SIDENAV = sideNavObj;

        showSideNav = status;
    }

    // 處理 tab 的 indexObj
    function getTabIndexObj(loginRole) {
        let finalIndexObj = {};
        // 原始版本的順序
        let originalIndexObj = {
            overview: 0,
            shiftIssues: 1,
            assessment: 2,
            highRiskFaller: 3,
            machineData: 4,
            continuousMachineData: 5,
            allExecutionRecord: 6,
            nursingRecord: 7,
            prescribingRecord: 8,
            doctorNote: 9,
            bloodTransfusion: 10,
            charge: 11,
            epo: 12,
        };
        // 醫生的tab排序
        let doctorIndexObj = {
            overview: 0,
            doctorNote: 1,
            prescribingRecord: 2,
            prescription: 3,
            labexam: 4,
            epo: 5,
            shiftIssues: 6,
            assessment: 7,
            machineData: 8,
            continuousMachineData: 9,
            allExecutionRecord: 10,
            nursingRecord: 11,
            bloodTransfusion: 12,
            charge: 13,
            highRiskFaller: 14
        };
        // 護理師的tab排序
        let nurseIndexObj = {
            overview: 0,
            shiftIssues: 1,
            assessment: 2,
            highRiskFaller: 3,
            machineData: 4,
            continuousMachineData: 5,
            allExecutionRecord: 6,
            epo: 7,
            nursingRecord: 8,
            bloodTransfusion: 9,
            charge: 10,
            prescribingRecord: 11,
            doctorNote: 12,
        };
        switch (loginRole) {
            case 'doctor':
                finalIndexObj = doctorIndexObj;
                break;
            case 'nurse':
                finalIndexObj = nurseIndexObj;
                break;
            case 'other':
                finalIndexObj = originalIndexObj;
                break;
            default:
                finalIndexObj = originalIndexObj;
                break;
        }
        return finalIndexObj;
    }

    // 取得所有 summary 裡有可能需要顯示的功能 array
    function getSummaryTabsArrayByRole(loginRole) {
        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        let ModuleFunctions = getModuleFunctions();

        // 取得角色的 indexObj
        let indexObj = getTabIndexObj(loginRole);

        // 找是不是顯示一樣但不同角色
        let isNurseGroup = nurseGroup.indexOf(loginRole) > -1;
        let isDoctorGroup = docterGroup.indexOf(loginRole) > -1;

        // 會有三個地方需要用到此陣列，可依 type 分類：card(summary 顯示的卡片), listTab(summary 右下的更多), null(前兩個地方不需顯示)
        return [
            // 表單功能
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.overview,
                label: $translate('dialysisTabView.overview'),
                isClassForDoctor: false, // class="for-doctor"  true -> 藍色字
                ngShowLabelCount: false, // 控制是否顯示count
                active: 'overview',
                uiSref: 'overview',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/overview.svg',
                ngIf: true,
                flex: '100',
                flexGtLg: '100',
                flexGtSm: '100'
            },
            {
                type: (isNurseGroup || isDoctorGroup) ? 'card' : 'listTab',
                index: indexObj.shiftIssues,
                // htmlId: 'shiftIssues',
                label: $translate('dialysisTabView.shiftIssue'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'shiftIssues',
                uiSref: 'shiftIssues',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/handover.svg',
                ngIf: true,
                add: () => {
                    $state.go('shiftIssue', { Id: '' });
                },
                flex: '100',
                flexGtLg: loginRole === 'doctor' ? '100' : '33',
                flexGtSm: loginRole === 'doctor' ? '100' : '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.assessment,
                // htmlId: 'assessment',
                label: $translate('dialysisTabView.assessment'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'assessment',
                uiSref: 'assessment',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/evaluation.svg',
                ngIf: ModuleFunctions === null || ModuleFunctions.Assessment === '1',
                add: (type) => {
                    $state.go('assessmentDetail', { Id: '', type });
                },
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.highRiskFaller,
                // htmlId: 'epo',
                label: '跌倒評估',
                isClassForDoctor: false,
                uiSref: 'highRiskFallerHD',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/fall.svg',
                ngIf: true,
                add: () => {
                    addCallbacks.createhighRiskFaller();
                },
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.machineData,
                // htmlId: 'machineData',
                label: $translate('dialysisTabView.machine'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'machineData',
                uiSref: 'machineData',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/dialysis.svg',
                ngIf: true,
                add: () => {
                    $state.go('machineDataDetail', { machineDataId: 'create' });
                },
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.continuousMachineData,
                // htmlId: 'continuousMachineData',
                label: $translate('dialysisTabView.machineContinuous'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'continuousMachineData',
                uiSref: 'continuousMachineData',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/continue.svg',
                ngIf: ModuleFunctions === null || ModuleFunctions.MachineType === '1',
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.allExecutionRecord,
                // htmlId: 'execute',
                label: $translate('dialysisTabView.executionRecord'),
                isClassForDoctor: false,
                ngShowLabelCount: true,
                active: 'allExecutionRecord',
                uiSref: 'allExecutionRecord',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/executionRecord.svg',
                ngIf: true,
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.nursingRecord,
                // htmlId: 'nursingRecord',
                label: $translate('dialysisTabView.nursingRecord'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'nursingRecord',
                uiSref: 'nursingRecord',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/nursingRecord.svg',
                ngIf: true,
                add: () => {
                    $state.go('nursingRecordDetail', { nursingRecordId: '' });
                },
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isNurseGroup ? 'card' : 'listTab',
                index: indexObj.nursingRecord,
                // htmlId: 'nursingRecord',
                label: '護理指導',
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'allNursingGuide',
                uiSref: 'allNursingGuide',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/teach.svg',
                ngIf: true,
                add: () => {
                    $state.go('nursingGuide', { nursingGuideId: 'create' });
                },
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            {
                type: isDoctorGroup ? 'card' : 'listTab',
                index: indexObj.prescribingRecord,
                // htmlId: 'prescribingRecord',
                label: $translate('dialysisTabView.prescribingRecord'),   // summary 中開藥紀錄顯示期限內的
                subTitle: `(${$translate('prescribingRecord.prescribingRecord.validDrug')})`,
                isClassForDoctor: true, // class="for-doctor" 藍色字
                ngShowLabelCount: false,
                uiSref: 'prescribingRecord',
                uiSrefOpts: '{location: "replace"}',
                option: '{listDate: "~"}',
                icon: 'static/img/svg/doctor.svg',
                ngIf: true,
                add: () => {
                    $state.go('medicineRecord');
                },
                flex: '100',
                flexGtLg: '100',
                flexGtSm: '100'
            },
            {
                type: isDoctorGroup ? 'card' : 'listTab',
                index: indexObj.doctorNote,
                // htmlId: 'doctorNote',
                label: $translate('dialysisTabView.doctorNote'),
                isClassForDoctor: true, // class="for-doctor" 藍色字
                ngShowLabelCount: false,
                uiSref: 'doctorNote',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/doctorlist.svg',
                ngIf: true,
                add: () => {
                    $state.go('doctorNoteDetail', { doctorNoteId: null });
                },
                flex: '100',
                flexGtLg: '100',
                flexGtSm: '100'
            },
            {
                type: 'listTab',
                index: indexObj.bloodTransfusion,
                // htmlId: 'bloodTransfusion',
                label: $translate('dialysisTabView.bloodTransfusion'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                uiSref: 'bloodTransfusion',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/drop.svg',
                ngIf: ModuleFunctions === null || ModuleFunctions.BloodTransfusion === '1',
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            // {
            //     type: 'listTab',
            //     index: indexObj.charge,
            //     // htmlId: 'charge',
            //     label: $translate('dialysisTabView.charge'),
            //     isClassForDoctor: false,
            //     ngShowLabelCount: false,
            //     uiSref: 'charge',
            //     uiSrefOpts: '{location: "replace"}',
            //     icon: 'static/img/svg/dollar.svg',
            //     ngIf: ModuleFunctions === null || ModuleFunctions.Charge === '1',
            //     flex: '100',
            //     flexGtLg: '33',
            //     flexGtSm: '50'
            // },
            {
                type: 'listTab',
                index: indexObj.epo,
                // htmlId: 'epo',
                label: $translate('dialysisTabView.EPO'),
                isClassForDoctor: false,
                ngShowLabelCount: true,
                uiSref: 'epo',
                uiSrefOpts: '{location: "replace"}',
                icon: 'static/img/svg/epo.svg',
                ngIf: true,
                flex: '100',
                flexGtLg: '33',
                flexGtSm: '50'
            },
            // 歷次功能，不需顯示在 listTab
            {
                type: isDoctorGroup ? 'card' : null,
                index: indexObj.prescription,
                label: $translate('summary.prescription'),
                isClassForDoctor: false,
                ngShowLabelCount: true,
                uiSref: 'allPrescriptions',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true,
                add: (index) => {
                    const prescriptionType = ['HD', 'HDF', 'SLEDD-f', 'INTERIM'];
                    $state.go('prescriptionDetail', { prescriptionId: 'add', tag: prescriptionType[index] });
                },
                flex: '100',
                flexGtLg: '100',
                flexGtSm: '100'
            },
            {
                type: isDoctorGroup ? 'card' : null,
                label: $translate('summary.inspection'),
                index: indexObj.labexam,
                subTitle: `${$translate('labexam.labexam.threeMonth')}`,
                isClassForDoctor: false,
                ngShowLabelCount: true,
                uiSref: 'labexam',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true,
                add: () => {
                    $state.go('createLabexam', {
                        labexamId: null
                    });
                },
                flex: '100',
                flexGtLg: '100',
                flexGtSm: '100'
            }

        ];
    }

    let addCallbacks = {};
    function setCallback(key, callback) {
        if (typeof callback === 'function') {
            addCallbacks[key] = callback;
        }
    }

    // show/hide refresh buttons and zoom buttons

    function setDefault() {
        if (!$localStorage.serverUrl) {
            /*
            $localStorage.serverUrl = 'http://dialysissystem.azurewebsites.net';
            $localStorage.serverUrl = 'http://localhost:10082';
            */
            if (DEVELOPMENT) {
                $localStorage.serverUrl = 'http://distaipeihospital.azurewebsites.net';
            } else {
                $localStorage.serverUrl = '';
            }
        }
        if (!$localStorage.loginExpireMinutes) {
            $localStorage.loginExpireMinutes = 1440; // 單位: Minute
        }
        if (!$sessionStorage.loginExpireTime) {
            $sessionStorage.loginExpireTime = new Date();
        }
        if (!$sessionStorage.centerLoginExpireTime) {
            $sessionStorage.centerLoginExpireTime = new Date();
        }
        if (!$localStorage.labExamSetting) {
            $localStorage.labExamSetting = {};
        }

        // 存使用者習慣, summary 顯示列表還是表單...
        if (!$localStorage.uiSetting) {
            $localStorage.uiSetting = {};
        }
    }
    setDefault();

    function setLoginExpireTime(expire) {
        let _now = new Date();
        if (expire) {
            _now = expire;
        } else {
            _now.setMinutes(_now.getMinutes() + $localStorage.loginExpireMinutes);
        }

        if (cordova.platformId !== 'browser') {
            $sessionStorage.loginExpireTime = _now;
        } else {
            $localStorage.loginExpireTime = _now;
        }
    }

    function getLoginExpireTime() {
        if (cordova.platformId !== 'browser') {
            return $sessionStorage.loginExpireTime;
        }

        return $localStorage.loginExpireTime;
    }

    // setter and getter for language
    function setLanguage(language) {
        // save language to local storage
        $localStorage.language = language;
    }

    function getLanguage() {
        let language = '';
        switch ($localStorage.language) {
            case 'en-us':
            case 'zh-tw':
            case 'zh-cn':
                language = $localStorage.language;
                break;
            default:
                // defualt language set to 'zh-tw'
                language = 'zh-tw';
                break;
        }
        return language;
    }

    function getStore(setName) {
        return $localStorage[setName];
    }

    // set to localStorage
    function setStore(setName, setValue) {
        $localStorage[setName] = setValue;
    }

    // after login, login service will save current user info to local storage
    function setCurrentUser(user) {
        if (!$localStorage.currentUser) {
            $localStorage.currentUser = user;
            return;
        }
        $localStorage.currentUser = angular.extend($localStorage.currentUser, user);
    }

    function getCurrentUser() {
        return $localStorage.currentUser;
    }

    // after login, login service will save current hospital info to local storage
    function setCurrentHospital(hospital) {
        if (!$localStorage.currentHospital) {
            $localStorage.currentHospital = hospital;
            return;
        }
        $localStorage.currentHospital = angular.extend($localStorage.currentHospital, hospital);
    }

    function getCurrentHospital() {
        return $localStorage.currentHospital;
    }

    function getModuleFunctions() {
        if (getCurrentHospital().ModuleFunctions && Object.keys(getCurrentHospital().ModuleFunctions).length > 0) {
            return getCurrentHospital().ModuleFunctions;
        }
        return null;
    }

    // after login, login service will save hospital settings (array) info to local storage
    function setHospitalSettings(settings) {
        if (!$localStorage.currentHospitalSettings) {
            $localStorage.currentHospitalSettings = settings;
            return;
        }
        $localStorage.currentHospitalSettings = angular.extend($localStorage.currentHospitalSettings, settings);
    }

    function getHospitalSettings() {
        return $localStorage.currentHospitalSettings;
    }

    function setServerUrl(serverUrl) {
        $localStorage.serverUrl = serverUrl;
    }

    function getServerUrl() {
        return $localStorage.serverUrl;
    }

    // after login, login service will save current user info to local storage
    function setCenterUser(user) {
        if (!$localStorage.centerUser) {
            $localStorage.centerUser = user;
            return;
        }
        $localStorage.centerUser = angular.extend($localStorage.centerUser, user);
    }

    function getCenterUser() {
        return $localStorage.centerUser;
    }

    function setCenterLoginExpireTime(expire) {
        console.log('setCenterLoginExpireTime');
        let _now = new Date();
        if (expire) {
            _now = expire;
        } else {
            _now.setMinutes(_now.getMinutes() + $localStorage.loginExpireMinutes);
        }
        $sessionStorage.centerLoginExpireTime = _now;
    }

    function getCenterLoginExpireTime() {
        console.log('getCenterLoginExpireTime');
        return $sessionStorage.centerLoginExpireTime;
    }

    // 設定目前登入者習慣
    // 傳入 { name: xx, value: xx }
    function setUISetting(options = { name: '', value: null }) {
        if (!options.name) {
            return;
        }

        // 確認是否有目前使用者的設定值
        if (!$localStorage.uiSetting[getCurrentUser().Id]) {
            $localStorage.uiSetting[getCurrentUser().Id] = {};
        }

        $localStorage.uiSetting[getCurrentUser().Id][options.name] = options.value;
    }

    // 取得目前登入者習慣
    function getUISettingByKey(name) {
        let result = $localStorage.uiSetting[getCurrentUser().Id] ? $localStorage.uiSetting[getCurrentUser().Id][name] : null;
        console.log('getUISettingByKey', name, result);
        return result;
    }

    // 網路連線相關
    let isOnlineFlag = true; // 網路連線狀態，預設為 true
    function setIsOnline(value) {
        if (typeof (value) === 'boolean') {
            isOnlineFlag = value;
        }
        console.log('isOnline', isOnlineFlag);
    }

    function isOnline() {
        return isOnlineFlag;
    }
    // 當斷線時，每秒發一次 request ，若有回應且失敗的話再繼續下一次 request
    function checkIsOnline() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${getServerUrl()}/api/Hospital/hostName`,
            timeout: 5000
        }).then((res) => {
            deferred.resolve(res);
        }, (err) => {
            console.log('checkIsOnline', err);
            if (err.status === -1) {
                deferred.reject(err);
            } else {
                deferred.resolve(err);
            }
        });

        return deferred.promise;
    }

    // 確認是否有權限能做事情
    // 護理記錄、病情摘要、執行紀錄、開藥紀錄、透析機資料、透析處方、交班紀錄 只有創建者及管理者可修改、刪除
    // 病情摘要、處方、開藥醫師及管理者才能執行
    // params: createdUserId 創立者, dataStatus 資料的狀態刪除或正常, 功能的名字決定是否要依角色判斷
    function checkAccessible({ createdUserId, dataStatus, name, modifiedId }) {
        // 若資料狀態不為 delete 或未傳 dataStatus 才需判斷權限，否則皆唯讀
        if (!dataStatus || (dataStatus && dataStatus.toLowerCase() !== 'deleted')) {
            // 先判斷權限，若為管理者則皆有權限
            if (getCurrentUser().Access == 99) {
                return true;
            }
            if (createdUserId == null && modifiedId != null && modifiedId != getCurrentUser().Id) {
                return false;
            }

            // 再判斷目前功能是否為醫師僅有的
            let isDoctorOnly = doctorOnly.indexOf(name) > -1;
            if (isDoctorOnly) {
                return getCurrentUser().Role === 'doctor' && (createdUserId == null ? true : createdUserId === getCurrentUser().Id);
            }

            return createdUserId == null ? true : createdUserId === getCurrentUser().Id;
        }
        return false;
    }

    // defer: parent 中的 $q
    function checkDemoModeAndGetDataAsync(data, defer, isReady = false) {
        if (!isReady && defer) {
            defer.resolve({
                status: 200,
                data: angular.copy(data)
            });
            return defer.promise;
        }
    }

    return setting;
}
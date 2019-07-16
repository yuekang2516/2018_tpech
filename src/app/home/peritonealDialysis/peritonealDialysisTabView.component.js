import tpl from './peritonealDialysisTabView.html';
import "./peritonealDialysisTabView.less";

angular.module('app').component('peritonealDialysisTabView', {
    template: tpl,
    controller: peritonealDialysisTabViewCtrl
});

peritonealDialysisTabViewCtrl.$inject = [
    '$localStorage',
    'OverViewService',
    'PatientListxxxService',
    '$rootScope',
    '$state',
    '$stateParams',
    '$window',
    'PatientService',
    'dialysisService',
    '$interval',
    'epoExecutionService',
    '$scope',
    '$mdDialog',
    '$mdSidenav',
    'allExecutionRecordService',
    '$timeout',
    'SettingService',
    '$filter',
    '$mdMedia'
];
function peritonealDialysisTabViewCtrl(
    $localStorage,
    OverViewService,
    PatientListxxxService,
    $rootScope,
    $state,
    $stateParams,
    $window,
    PatientService,
    dialysisService,
    $interval,
    epoExecutionService,
    $scope,
    $mdDialog,
    $mdSidenav,
    allExecutionRecordService,
    $timeout,
    SettingService,
    $filter,
    $mdMedia
) {
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;

    const PATIENT_INFO = SettingService.getUISettingParams().SUMMARYPATIENTINFO;
    // 要在 tab 加上未執行筆數及定時讀取未執行筆數
    let interval;
    self.tabEpoCount = 0; // EPO
    let executeInterval;
    self.tabExecuteCount = 0; // 執行紀錄
    let currentUserId = $localStorage.currentUser.Id;
    let startDate = null;
    let endDate = null;
    self.loading = true;
    self.patientInfoLoading = false;    // 病人資料讀取
    self.blockHide = false;
    self.isBrowser = cordova.platformId === "browser";
    // 目前使用者
    self.currentUser = SettingService.getCurrentUser();
    console.log("CurrentUser", self.currentUser);

    self.$onInit = function onInit() {
        self.loading = false;

        // 取得使用者習慣
        self.showPatientInfo = SettingService.getUISettingByKey(PATIENT_INFO);


        if (self.currentUser.Role !== null && self.currentUser.Role === "doctor") {
            switch ($state.current.name) {
                case 'orderLR':
                    self.selectedIndex = 0;
                    break;
                case 'pdPrescribingRecord':
                    self.selectedIndex = 1;
                    break;
                case 'treatRecord':
                    self.selectedIndex = 2;
                    break;
                case 'frequencyImplantation':
                    self.selectedIndex = 3;
                    break;
                case 'apdSetting':
                    self.selectedIndex = 4;
                    break;
                case 'quantityEvaluate':
                    self.selectedIndex = 5;
                    break;
                case 'complication':
                    self.selectedIndex = 6;
                    break;
                case 'peritonitis':
                    self.selectedIndex = 7;
                    break;
                case 'catheterInfect':
                    self.selectedIndex = 8;
                    break;
                case 'nursingAssessmentForm':
                    self.selectedIndex = 9;
                    break;
                case 'highRiskFaller':
                    self.selectedIndex = 10;
                    break;
                case 'selfCare':
                    self.selectedIndex = 11;
                    break;
                case 'orderST':
                    self.selectedIndex = 12;
                    break;
                // case 'capdTraining':
                //     self.selectedIndex = 14;
                //     break;
                case 'pdAllExecutionRecord':
                    self.selectedIndex = 13;
                    break;
                case 'pdAllMedicationRecords':
                    self.selectedIndex = 14;
                    break;
                case 'pdAllNursingRecords':
                    self.selectedIndex = 15;
                    break;
                case 'pdAllReferralSheetList':
                    self.selectedIndex = 16;
                    break;
                case 'visitHome':
                    self.selectedIndex = 17;
                    break;
                case 'visitPhone':
                    self.selectedIndex = 18;
                    break;
                case 'reportDialysis':
                    self.selectedIndex = 19;
                    break;
                default:
                    break;
            }
        } else {
            switch ($state.current.name) {
                case 'frequencyImplantation':
                    self.selectedIndex = 0;
                    break;
                case 'treatRecord':
                    self.selectedIndex = 1;
                    break;
                case 'apdSetting':
                    self.selectedIndex = 2;
                    break;
                case 'quantityEvaluate':
                    self.selectedIndex = 3;
                    break;
                case 'complication':
                    self.selectedIndex = 4;
                    break;
                case 'peritonitis':
                    self.selectedIndex = 5;
                    break;
                case 'catheterInfect':
                    self.selectedIndex = 6;
                    break;
                case 'nursingAssessmentForm':
                    self.selectedIndex = 7;
                    break;
                case 'highRiskFaller':
                    self.selectedIndex = 8;
                    break;
                case 'selfCare':
                    self.selectedIndex = 9;
                    break;
                case 'orderLR':
                    self.selectedIndex = 10;
                    break;
                case 'orderST':
                    self.selectedIndex = 11;
                    break;
                // case 'capdTraining':
                //     self.selectedIndex = 14;
                //     break;
                case 'pdPrescribingRecord':
                    self.selectedIndex = 12;
                    break;
                case 'pdAllExecutionRecord':
                    self.selectedIndex = 13;
                    break;
                case 'pdAllMedicationRecords':
                    self.selectedIndex = 14;
                    break;
                case 'pdAllNursingRecords':
                    self.selectedIndex = 15;
                    break;
                case 'pdAllReferralSheetList':
                    self.selectedIndex = 16;
                    break;
                case 'visitHome':
                    self.selectedIndex = 17;
                    break;
                case 'visitPhone':
                    self.selectedIndex = 18;
                    break;
                case 'reportDialysis':
                    self.selectedIndex = 19;
                    break;
                default:
                    break;
            }
        }

        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        // self.ModuleFunctions = SettingService.getCurrentHospital().ModuleFunctions ? SettingService.getCurrentHospital().ModuleFunctions : null;

        // 取得登入者角色，決定tab順序
        // self.loginRole = SettingService.getCurrentUser().Role;
        // console.log('取得登入者角色 self.loginRole', self.loginRole);


        // 取 patient 相關資料
        getPatientInfo();
    };

    self.$onDestroy = function () {
        // 清空 interval
        // if (angular.isDefined(interval)) {
        //     $interval.cancel(interval);
        // }
        // if (angular.isDefined(executeInterval)) {
        //     $interval.cancel(executeInterval);
        // }
    };

    self.goback = function () {
        $state.go('allPdPatients');
    };

    self.gotoState = function goto(routeName) {
        $state.go(routeName, null, {
            location: 'replace'
        });
    };

    var previousSelectedIndex;
    self.$doCheck = function () {
        var currentSelectedIndex = self.selectedIndex && self.selectedIndex.valueOf();
        if (previousSelectedIndex !== currentSelectedIndex) {

            if (self.currentUser.Role !== null && self.currentUser.Role === "doctor") {
                switch (currentSelectedIndex) {
                    case 0:
                        $state.go('pdPrescribingRecord', { patientId: self.patientId });
                        break;
                    case 1:
                        $state.go('pdDoctorNote', { patientId: self.patientId, headerId: "5c9080ae20c32b17a4c56a3a" });
                        break;
                    case 2:
                        self.gotoState('treatRecord');
                        break;
                    case 3:
                        self.gotoState('frequencyImplantation');
                        break;
                    case 4:
                        self.gotoState('apdSetting');
                        break;
                    case 5:
                        self.gotoState('quantityEvaluate');
                        break;
                    case 6:
                        self.gotoState('complication');
                        break;
                    case 7:
                        self.gotoState('peritonitis');
                        break;
                    case 8:
                        self.gotoState('catheterInfect');
                        break;
                    case 9:
                        // 護理評估nursingAssessmentForm
                        self.gotoState('nursingAssessmentForm');
                        break;
                    case 10:
                        self.gotoState('highRiskFaller');
                        break;
                    case 11:
                        // 自我照護
                        self.gotoState('selfCare');
                        break;
                    case 12:
                        $state.go('pdLabexam', { patientId: self.patientId });
                        break;
                    // case 14:
                    //     self.gotoState('capdTraining');
                    //     break;
                    case 13:
                        $state.go('pdAllExecutionRecord', { patientId: self.patientId });
                        break;
                    case 14:
                        $state.go('pdAllMedicationRecords', { patientId: self.patientId });
                        break;
                    case 15:
                        $state.go('pdAllNursingRecords', { patientId: self.patientId });
                        break;
                    case 16:
                        $state.go('pdAllReferralSheetList', { patientId: self.patientId });
                        break;
                    case 17:
                        self.gotoState('visitHome');
                        break;
                    case 18:
                        self.gotoState('visitPhone');
                        break;
                    case 19:
                        self.gotoState('reportDialysis');
                        break;
                    default:
                        break;
                }
            } else {
                switch (currentSelectedIndex) {
                    case 0:
                        self.gotoState('frequencyImplantation');
                        break;
                    case 1:
                        self.gotoState('treatRecord');
                        break;
                    case 2:
                        self.gotoState('apdSetting');
                        break;
                    case 3:
                        self.gotoState('quantityEvaluate');
                        break;
                    case 4:
                        self.gotoState('complication');
                        break;
                    case 5:
                        self.gotoState('peritonitis');
                        break;
                    case 6:
                        self.gotoState('catheterInfect');
                        break;
                    case 7:
                        // 護理評估nursingAssessmentForm
                        self.gotoState('nursingAssessmentForm');
                        break;
                    case 8:
                        self.gotoState('highRiskFaller');
                        break;
                    case 9:
                        // 自我照護
                        self.gotoState('selfCare');
                        break;
                    case 10:
                        $state.go('pdDoctorNote', { patientId: self.patientId, headerId: "5c9080ae20c32b17a4c56a3a" });
                        break;
                    case 11:
                        $state.go('pdLabexam', { patientId: self.patientId });
                        break;
                    // case 14:
                    //     self.gotoState('capdTraining');
                    //     break;
                    case 12:
                        $state.go('pdPrescribingRecord', { patientId: self.patientId });
                        break;
                    case 13:
                        $state.go('pdAllExecutionRecord', { patientId: self.patientId });
                        break;
                    case 14:
                        $state.go('pdAllMedicationRecords', { patientId: self.patientId });
                        break;
                    case 15:
                        $state.go('pdAllNursingRecords', { patientId: self.patientId });
                        break;
                    case 16:
                        $state.go('pdAllReferralSheetList', { patientId: self.patientId });
                        break;
                    case 17:
                        self.gotoState('visitHome');
                        break;
                    case 18:
                        self.gotoState('visitPhone');
                        break;
                    case 19:
                        self.gotoState('reportDialysis');
                        break;
                    default:
                        break;
                }
            }
            previousSelectedIndex = currentSelectedIndex;
        }
    };

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
    const sleep = ( ms ) => {
        const end = +(new Date()) + ms;
        while( +(new Date()) < end ){ } 
    }
    $mdSidenav('left').close();
    self.openLeftMenu = function openLeftMenu() {
        $mdSidenav("left").toggle();
    };
    self.toggleSideNav = function () {
         // if the toggle nav status is true
        if (SettingService.getSideNavStatus(currentUserId) === true) {
            // set the status to false
            SettingService.setSideNavStatus(currentUserId, false);
        } else {
            // set the status to true
            SettingService.setSideNavStatus(currentUserId, true);
        }
        // emit to parent
        $scope.$emit('toggleNav');
    };
    angular.element(document).ready(function () {
        sleep(180);
        angular.element('md-tabs md-tab-item')[self.selectedIndex].click();
    });
    //$stateChangeSuccess 
    $rootScope.$watch('$stateChangeSuccess', function() {
        //畫面載完
       // console.log('dafsdfsafasdfs',angular.element('#btn2'));
    });
    $rootScope.$watch('$viewContentLoaded', function() {
        //view 全部載完
        
        //console.log('1xxddd',angular.element('#btn2'));
        //angular.element('#btn2').triggerHandler('click');
    });
    $scope.$watch('$ctrl.selectedIndex', function(n,o){ 
        //新舊tab索引
        //console.log('n',n);
        //console.log('o',o);
        self.selectedIndex = n;
    }); 
    // 病人更多資料(重要記事)
    self.togglePatientInfo = function () {
        setShowPatientInfo(!self.showPatientInfo);
    };
    function setShowPatientInfo(value) {
        self.showPatientInfo = value;

        // 記得使用者習慣
        SettingService.setUISetting({ name: PATIENT_INFO, value });
    }

    // 取得目前病人資料
    function getPatientInfo() {
        self.patientInfoLoading = true;

        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
            if (self.currentPatient.Memo == null) {
                self.blockHide = false;
            } else {
                self.blockHide = true;
            }
            self.patientErr = false;
        }, (err) => {
            console.log('self.patients', self.patients);
            self.patientErr = true;
        }).finally(() => {
            self.patientInfoLoading = false;
        });
    }

    // 重整病人資料
    self.refreshPatientInfo = function () {
        getPatientInfo();
    };

    self.gotoPatientDetail = function gotoPatientListDetail(pid) {
        $state.go("patientDetail", {
            patientId: pid
        });
    };
}
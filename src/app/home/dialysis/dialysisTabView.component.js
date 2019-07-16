import tpl from './dialysisTabView.html';


angular.module('app').component('dialysisTabView', {
    template: tpl,
    controller: dialysisTabViewCtrl
});

dialysisTabViewCtrl.$inject = ['OverViewService', 'PatientListxxxService', '$rootScope', '$state', '$stateParams', '$window', 'PatientService', 'dialysisService', '$interval', 'epoExecutionService', '$scope', '$mdDialog', '$mdSidenav', 'allExecutionRecordService', '$timeout', 'SettingService', '$filter'];
function dialysisTabViewCtrl(OverViewService, PatientListxxxService, $rootScope, $state, $stateParams, $window, PatientService, dialysisService, $interval, epoExecutionService, $scope, $mdDialog, $mdSidenav, allExecutionRecordService, $timeout, SettingService, $filter) {
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    const dialysisId = $stateParams.headerId;

    // 要在 tab 加上未執行筆數及定時讀取未執行筆數
    let interval;
    self.tabEpoCount = 0; // EPO
    let executeInterval;
    self.tabExecuteCount = 0; // 執行紀錄

    let startDate = null;
    let endDate = null;
    self.loading = true;

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

    // 偵測目前是否有對話框存在，若有，使用者按上一頁時 state 不 change 並取消當前對話框
    $scope.$on('$locationChangeStart', function ($event) {
        // Check if there is a dialog active
        if (angular.element(document).find('md-dialog').length > 0) {
            $event.preventDefault(); // Prevent route from changing
            $mdDialog.cancel();  // Cancel the active dialog
        }
    });

    self.$onInit = function onInit() {

        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getCurrentHospital().ModuleFunctions ? SettingService.getCurrentHospital().ModuleFunctions : null;

        // 取得登入者角色，決定tab順序
        self.loginRole = SettingService.getCurrentUser().Role;
        console.log('取得登入者角色 self.loginRole', self.loginRole);

        if (!angular.isDefined(interval)) {
            interval = $interval(_readEPOCount, 60000); // 執行定時讀取 EPO 未執行筆數
        }
        if (!angular.isDefined(executeInterval)) {
            executeInterval = $interval(_readExecuteCount, 60000); // 執行定時讀取 EPO 未執行筆數
        }
        _readEPOCount(); // 一進來就先讀 EPO 未執行筆數顯示在 tab 上
        _readExecuteCount(); // 一進來就先讀用藥未執行筆數顯示在 tab 上

        // 處理tab順序
        arrangeTabs(getTabIndexObj(self.loginRole));

        // 取得病人及透析表資料, 顯示於畫面上方標題列
        PatientService.getById(self.patientId).then((res) => {
            self.patient = res.data;
        });
        OverViewService.getByHeaderId(dialysisId).then((res) => {
            self.dialysisRecord = res.data;
        });
        getStartAndEndDates();

        // 控制tab底線的移動
        // self.currentName = $state.current.name;

        // switch ($state.current.name) {
        //     case 'overview':
        //         self.currentName = 'overview';
        //         break;
        //     case 'shiftIssues':
        //         self.currentName = 'shiftIssues';
        //         break;
        //     case 'assessment':
        //         self.currentName = 'assessment';
        //         break;
        //     case 'machineData':
        //         self.currentName = 'machineData';
        //         break;
        //     case 'continuousMachineData':
        //         self.currentName = 'continuousMachineData';
        //         break;
        //     case 'allExecutionRecord':
        //         self.currentName = 'allExecutionRecord';
        //         break;
        //     case 'nursingRecord':
        //         self.currentName = 'nursingRecord';
        //         break;
        //     case 'prescribingRecord':
        //         self.currentName = 'prescribingRecord';
        //         break;
        //     case 'doctorNote':
        //         self.currentName = 'doctorNote';
        //         break;
        //     case 'bloodTransfusion':
        //         self.currentName = 'bloodTransfusion';
        //         break;
        //     case 'charge':
        //         self.currentName = 'charge';
        //         break;
        //     case 'epo':
        //         self.currentName = 'epo';
        //         break;
        //     default:
        //         break;
        // }

        // switch ($state.current.name) {
        //     case 'overview':
        //         self.selectedIndex = 0;
        //         break;
        //     case 'shiftIssues':
        //         self.selectedIndex = 1;
        //         break;
        //     case 'assessment':
        //         self.selectedIndex = 2;
        //         break;
        //     case 'machineData':
        //         self.selectedIndex = 3;
        //         break;
        //     case 'continuousMachineData':
        //         self.selectedIndex = 4;
        //         break;
        //     case 'allExecutionRecord':
        //         self.selectedIndex = 5;
        //         break;
        //     case 'nursingRecord':
        //         self.selectedIndex = 6;
        //         break;
        //     case 'prescribingRecord':
        //         self.selectedIndex = 7;
        //         break;
        //     case 'doctorNote':
        //         self.selectedIndex = 8;
        //         break;
        //     case 'bloodTransfusion':
        //         self.selectedIndex = 9;
        //         break;
        //     case 'charge':
        //         self.selectedIndex = 10;
        //         break;
        //     case 'epo':
        //         self.selectedIndex = 11;
        //         break;
        //     default:
        //         break;
        // }

    };
    // get the latest two months
    function getStartAndEndDates() {

        // get the latest record month
        dialysisService.getLast(self.patientId, true).then((res) => {
            startDate = moment(res.data.DialysisHeader.CreatedTime).subtract(1, 'month').format('YYYY-MM') + '-01';
            endDate = moment(res.data.DialysisHeader.CreatedTime).format('YYYY-MM') + '-' + moment(res.data.DialysisHeader.CreatedTime, 'YYYY-MM').daysInMonth();
        }).then(() => {
            dialysisService.getByDate(self.patientId, startDate, endDate).then((records) => {
                // debugger;
                self.dialysisRecords = records.data
                    .sort((a, b) => {
                        return moment(b.CreatedTime).diff(moment(a.CreatedTime));
                    })
                    .map((x) => {
                        x.CreatedString = moment(x.CreatedTime).format('MM/DD(dd)');
                        return x;
                    });
                console.log('self.dialysisRecords', self.dialysisRecords);
                self.loading = false;
            });
        });
    }

    self.$onChanges = function (changesObj) { };

    self.openMenu = function openMenu() {
        $mdSidenav('right').toggle();
    };

    self.switchPatient = function () {
        console.log('lakjdslfks');
        PatientListxxxService.showMyPatientDialog();
    };

    // 寫在doCheck，在表單點擊時，tab底線才會移動
    let previousState = null;
    self.$doCheck = function () {
        if (previousState !== $state.current.name) {
            // 控制tab底線的移動
            self.currentName = $state.current.name;
            previousState = $state.current.name;
        }
    };
    // var previousSelectedIndex;
    // var previousSelectedRoute;
    // self.$doCheck = function () {
    //     var currentSelectedIndex = self.selectedIndex && self.selectedIndex.valueOf();
    //     var currentSelectedRoute = $state.current.name;
    //     // var currentSelectedRoute = self.currentName;

    //     console.log('先前tab $state.current.name', $state.current.name);
    //     console.log('先前tab previousSelectedRoute', previousSelectedRoute);
    //     console.log('先前tab currentSelectedRoute', currentSelectedRoute);


    //     if (previousSelectedRoute !== currentSelectedRoute) {
    //         switch ($state.current.name) {
    //             case 'overview':
    //                 self.selectedIndex = 0;
    //                 break;
    //             case 'shiftIssues':
    //                 self.selectedIndex = 1;
    //                 break;
    //             case 'assessment':
    //                 self.selectedIndex = 2;
    //                 break;
    //             case 'machineData':
    //                 self.selectedIndex = 3;
    //                 break;
    //             case 'continuousMachineData':
    //                 self.selectedIndex = 4;
    //                 break;
    //             case 'allExecutionRecord':
    //                 self.selectedIndex = 5;
    //                 break;
    //             case 'nursingRecord':
    //                 self.selectedIndex = 6;
    //                 break;
    //             case 'prescribingRecord':
    //                 self.selectedIndex = 7;
    //                 break;
    //             case 'doctorNote':
    //                 self.selectedIndex = 8;
    //                 break;
    //             case 'bloodTransfusion':
    //                 self.selectedIndex = 9;
    //                 break;
    //             case 'charge':
    //                 self.selectedIndex = 10;
    //                 break;
    //             case 'epo':
    //                 self.selectedIndex = 11;
    //                 break;
    //             default:
    //                 break;
    //         }
    //         previousSelectedRoute = currentSelectedRoute;
    //     }


    //     if (previousSelectedIndex !== currentSelectedIndex) {

    //         switch (currentSelectedIndex) {
    //             case 0:
    //                 self.goto('overview');
    //                 break;
    //             case 1:
    //                 self.goto('shiftIssues');
    //                 break;
    //             case 2:
    //                 self.goto('assessment');
    //                 break;
    //             case 3:
    //                 self.goto('machineData');
    //                 break;
    //             case 4:
    //                 self.goto('continuousMachineData');
    //                 break;
    //             case 5:
    //                 self.goto('allExecutionRecord');
    //                 break;
    //             case 6:
    //                 self.goto('nursingRecord');
    //                 break;
    //             case 7:
    //                 self.goto('prescribingRecord');
    //                 break;
    //             case 8:
    //                 self.goto('doctorNote');
    //                 break;
    //             case 9:
    //                 self.goto('bloodTransfusion');
    //                 break;
    //             case 10:
    //                 self.goto('charge');
    //                 break;
    //             case 11:
    //                 self.goto('epo');
    //                 break;
    //         }
    //         previousSelectedIndex = currentSelectedIndex;
    //     }
    // };


    self.$onDestroy = function () {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
        if (angular.isDefined(executeInterval)) {
            $interval.cancel(executeInterval);
        }
    };
    self.$postLink = function () { };

    self.back = function back() {
        console.log('$state.previousStateName', $state.previousStateName);
        // $state.go('summary', { PatientId: patientId });
        if ($state.previousStateName) {
            history.go(-1);
        } else {
            $state.go('allPatients');
        }
    };

    // self.goto = function goto(routeName) {
    //     $state.go(routeName, null, { location: 'replace' });
    // };

    self.changeDialysisDate = function (record) {
        console.log(record);
        $state.go($state.current.name, {
            patientId: self.patientId,
            headerId: record.Id
        }, {
                reload: true,
                location: 'replace'
            });
    };

    // EPO 未執行筆數
    function _readEPOCount() {
        epoExecutionService.getTodoCount(self.patientId).then((q) => {
            self.tabEpoCount = q.data;
        });
    }

    // 執行用藥 未執行筆數
    function _readExecuteCount() {
        allExecutionRecordService.loadRecordList(self.patientId, dialysisId, true).then((res) => {
            $timeout(() => {
                self.tabExecuteCount = 0;
                console.log('TAB 執行列表 res', res);
                console.log('TAB 執行列表 res.data', res.data);
                self.tabExecuteCount = res.ExecuteCount;
            }, 0);
        })
            .catch((err) => {
                console.log('readExecuteCount err', err);
            });
    }


    // 處理 tab 的 indexObj
    function getTabIndexObj(loginRole) {
        let finalIndexObj = {};
        // 原始版本的順序
        let originalIndexObj = {
            overview: 0,
            shiftIssues: 1,
            assessment: 2,
            machineData: 3,
            continuousMachineData: 4,
            allExecutionRecord: 5,
            nursingRecord: 6,
            prescribingRecord: 7,
            doctorNote: 8,
            bloodTransfusion: 9,
            charge: 10,
            epo: 11
        };
        // 醫生的tab排序
        let doctorIndexObj = {
            overview: 0,
            doctorNote: 1,
            prescribingRecord: 2,
            epo: 3,
            shiftIssues: 4,
            assessment: 5,
            machineData: 6,
            continuousMachineData: 7,
            allExecutionRecord: 8,
            nursingRecord: 9,
            bloodTransfusion: 10,
            charge: 11
        };
        // 護理師的tab排序
        let nurseIndexObj = {
            overview: 0,
            shiftIssues: 1,
            assessment: 2,
            machineData: 3,
            continuousMachineData: 4,
            allExecutionRecord: 5,
            epo: 6,
            nursingRecord: 7,
            bloodTransfusion: 8,
            charge: 9,
            prescribingRecord: 10,
            doctorNote: 11
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


    // tab
    function arrangeTabs(indexObj) {
        // 所有tab內容
        let allTabsArray = [
            {
                index: indexObj.overview,
                // htmlId: 'overview',
                label: $translate('dialysisTabView.overview'),
                isClassForDoctor: false, // class="for-doctor"  true -> 藍色字
                ngShowLabelCount: false, // 控制是否顯示count
                active: 'overview',
                uiSref: 'overview',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.shiftIssues,
                // htmlId: 'shiftIssues',
                label: $translate('dialysisTabView.shiftIssue'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'shiftIssues',
                uiSref: 'shiftIssues',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.assessment,
                // htmlId: 'assessment',
                label: $translate('dialysisTabView.assessment'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'assessment',
                uiSref: 'assessment',
                uiSrefOpts: '{location: "replace"}',
                ngIf: self.ModuleFunctions === null || self.ModuleFunctions.Assessment === '1'
            },
            // {
            //     index: indexObj.postAssessment,
            //     // htmlId: 'postAssessment',
            //     label: $translate('dialysisTabView.postAssessment'),
            //     isClassForDoctor: false,
            //     ngShowLabelCount: false,
            //     active: 'postAssessment',
            //     uiSref: 'postAssessment',
            //     uiSrefOpts: '{location: "replace"}',
            //     ngIf: self.ModuleFunctions === null || self.ModuleFunctions.PostAssessment === '1'
            // },
            {
                index: indexObj.machineData,
                // htmlId: 'machineData',
                label: $translate('dialysisTabView.machine'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'machineData',
                uiSref: 'machineData',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.continuousMachineData,
                // htmlId: 'continuousMachineData',
                label: $translate('dialysisTabView.machineContinuous'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'continuousMachineData',
                uiSref: 'continuousMachineData',
                uiSrefOpts: '{location: "replace"}',
                ngIf: self.ModuleFunctions === null || self.ModuleFunctions.MachineType === '1'
            },
            {
                index: indexObj.allExecutionRecord,
                // htmlId: 'execute',
                label: $translate('dialysisTabView.executionRecord'),
                isClassForDoctor: false,
                ngShowLabelCount: true,
                active: 'allExecutionRecord',
                uiSref: 'allExecutionRecord',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.nursingRecord,
                // htmlId: 'nursingRecord',
                label: $translate('dialysisTabView.nursingRecord'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'nursingRecord',
                uiSref: 'nursingRecord',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.prescribingRecord,
                // htmlId: 'prescribingRecord',
                label: $translate('dialysisTabView.prescribingRecord'),
                isClassForDoctor: true, // class="for-doctor" 藍色字
                ngShowLabelCount: false,
                active: 'prescribingRecord',
                uiSref: 'prescribingRecord',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.doctorNote,
                // htmlId: 'doctorNote',
                label: $translate('dialysisTabView.doctorNote'),
                isClassForDoctor: true, // class="for-doctor" 藍色字
                ngShowLabelCount: false,
                active: 'doctorNote',
                uiSref: 'doctorNote',
                uiSrefOpts: '{location: "replace"}',
                ngIf: true
            },
            {
                index: indexObj.bloodTransfusion,
                // htmlId: 'bloodTransfusion',
                label: $translate('dialysisTabView.bloodTransfusion'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'bloodTransfusion',
                uiSref: 'bloodTransfusion',
                uiSrefOpts: '{location: "replace"}',
                ngIf: self.ModuleFunctions === null || self.ModuleFunctions.BloodTransfusion === '1'
            },
            {
                index: indexObj.charge,
                // htmlId: 'charge',
                label: $translate('dialysisTabView.charge'),
                isClassForDoctor: false,
                ngShowLabelCount: false,
                active: 'charge',
                uiSref: 'charge',
                uiSrefOpts: '{location: "replace"}',
                ngIf: self.ModuleFunctions === null || self.ModuleFunctions.Charge === '1'
            },
            {
                index: indexObj.epo,
                // htmlId: 'epo',
                label: $translate('dialysisTabView.EPO'),
                isClassForDoctor: false,
                ngShowLabelCount: true,
                active: 'epo',
                uiSref: 'epo',
                uiSrefOpts: '{location: "replace"}',
                ngIf: self.ModuleFunctions === null || self.ModuleFunctions.Epo === '1'
            }
        ];
        // 依照 index排序 由小到大
        self.allTabs = allTabsArray.sort((a, b) => a.index - b.index);

    }

}


/*
 * {
        index: indexObj.xxx.index,
        // htmlId: 'xxx',
        label: $translate('dialysisTabView.xxx'),
        isClassForDoctor: false,
        ngShowLabelCount: false,
        active: 'xxx',
        uiSref: 'xxx',
        uiSrefOpts: '{location: "replace"}',
        ngIf: indexObj.xxx.ngIf
    }
 */

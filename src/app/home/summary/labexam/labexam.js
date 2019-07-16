import lab from './labexam.html';

angular
    .module('app')
    .component('labexam', {
        template: lab,
        controller: labCtrl,
        bindings: {
            isCard: '<'
        }
    }).filter('labexamQueryName', ['$filter', () => {
        return function (queryType) {
            switch (queryType) {
                case 'times':
                    return '天數';
                case 'duration':
                    return '期間';
                default:
                    return '';
            }
        };
    }]).filter('labexamTimes', ['$filter', ($filter) => {
        return function (queryType) {
            const $translate = $filter('translate');
            switch (queryType) {
                case '30':
                    return $translate('labexam.labexam.oneMonth');
                case '60':
                    return $translate('labexam.labexam.twoMonth');
                case '90':
                    return $translate('labexam.labexam.threeMonth');
                case '180':
                    return $translate('labexam.labexam.sixMonth');
                case '365':
                    return $translate('labexam.labexam.oneYear');
                case '720':
                    return $translate('labexam.labexam.twoYear');
                default:
                    return '';
            }
        };
    }]);

labCtrl.$inject = [
    '$state',
    '$stateParams',
    '$mdDialog',
    '$scope',
    'SettingService',
    'PatientService',
    '$mdMedia',
    'showMessage',
    '$interval',
    'labexamService',
    '$timeout',
    '$filter',
    'SessionStorageService',
    '$mdSidenav'
];

function labCtrl($state, $stateParams, $mdDialog, $scope, SettingService,
    PatientService, $mdMedia, showMessage, $interval, labexamService, $timeout, $filter, SessionStorageService, $mdSidenav) {
    const self = this;
    self.user = SettingService.getCurrentUser();
    // 預設狀態
    // self.loading = true;
    self.lastAccessTime = null;

    let $translate = $filter('translate');
    // 辨識系統別: HD/PD
    self.stateName = $state.current.name;

    // tab 相關
    self.allTabs = [
        {
            label: $translate('labexam.labexam.table'),
            active: 'labexamTable',
            uiSref: 'labexamTable',
            uiSrefOpts: '{location: "replace"}'
        },
        {
            label: $translate('labexam.labexam.chart'),
            active: 'labexamChart',
            uiSref: 'labexamChart',
            uiSrefOpts: '{location: "replace"}'
        }
    ];
    // tab 相關
    self.allPdTabs = [
        {
            label: $translate('labexam.labexam.table'),
            active: 'pdLabexamTable',
            uiSref: 'pdLabexamTable',
            uiSrefOpts: '{location: "replace"}'
        },
        {
            label: $translate('labexam.labexam.chart'),
            active: 'pdLabexamChart',
            uiSref: 'pdLabexamChart',
            uiSrefOpts: '{location: "replace"}'
        }
    ];

    // 查詢條件相關
    // 次數、期限、主頁正在查看的紀錄
    self.conditionTypes = {
        times: {
            name: 'times',
            conditions: ['30', '60', '90', '180', '365', '720'],
            value: '30'
        },
        // TODO 等 API
        duration: {   // 時間區間
            name: 'duration',
            value: {
                startDate: new Date(moment().add(-7, 'day')),
                endDate: new Date()
            }
        }
    };

    $scope.currentName = $state.current.name;

    // 只有瀏覽器且為表格的 state 才需要有 export excel 功能
    self.excelExportButtonShow = cordova.platformId === 'browser' && ($scope.currentName === 'labexamTable' || $scope.currentName === 'labexamWeekTable');

    // 聽取資料筆數的變動
    $scope.$on('labDataLength', (event, dataLength) => {
        console.log('labexam dataLength', dataLength);
        self.dataLength = dataLength;
    });

    // 切換頁面時，資料數目、更新時間需要清空
    $scope.$watch('currentName', () => {
        console.log('currentName changed', $scope.currentName);
        // 只有瀏覽器且為表格的 state 才需要有 export excel 功能
        self.excelExportButtonShow = cordova.platformId === 'browser' && ($scope.currentName === 'labexamTable' || $scope.currentName === 'labexamWeekTable');
        initState();
    }, true);

    // Export excel & 重新整理相關功能：lastAccessTime, refresh function
    $scope.$on('labFn', (event, fn) => {
        if (fn.refresh && typeof fn.refresh === 'function') {
            self.refresh = fn.refresh;
        }
        if (fn.exportExcel && typeof fn.exportExcel === 'function') {
            self.export = fn.exportExcel;
        }
    });
    $scope.$on('labLastAccessTime', (event, lastAccessTime) => {
        console.log('labLastAccessTime', lastAccessTime);
        self.lastAccessTime = lastAccessTime;
    });

    // 聽取labTable是否有資料，決定 印表紐是否 disabled
    self.showPrintBtn = true;
    $scope.$on('labPrintDisabled', (event, showData) => {
        self.showPrintBtn = showData;
    });

    const needStoreQueryStates = ['updateLabexam', 'createLabexam', 'pdCreateLabexam'];
    // 初始化
    self.$onInit = () => {
        // 預設為系統日往前七天
        // self.queryCondition = self.conditionTypes.duration;
        // query condition 記在 local 端，以 userId 當 key，記住每個 user 的使用習慣

        // 若為從 summary 頁來的固定取 90 天
        if (self.isCard) {
            self.queryCondition = {
                name: 'times',
                value: '90'
            };
            return;
        }
        if (needStoreQueryStates.indexOf($state.previousState.name) > -1) {
            self.queryCondition = labexamService.getPreviousQueryConditionByUserId(self.user.Id) ? labexamService.getPreviousQueryConditionByUserId(self.user.Id) : self.conditionTypes.duration;
        } else {
            self.queryCondition = self.conditionTypes.duration;
            labexamService.setPreviousQueryConditionByUserId(self.user.Id, self.queryCondition);
        }

        if ($scope.currentName === 'labexam') {
            $state.go('labexamTable');
        }
        // for PD
        if ($scope.currentName === 'pdLabexam') {
            $state.go('pdLabexamTable');
        }

        // PatientService
        //     .getById($stateParams.patientId)
        //     .then((d) => {
        //         self.patient = d.data;
        //         self.loading = false;
        //         self.isError = false;
        //         // loadingData();
        //     }, () => {
        //         self.loading = false;
        //         self.isError = true;
        //     });


        console.log('$state.current.name', $state.current.name);

        // document.addEventListener("backbutton", onBackKeyDown);
    };

    // 於 parent summary 頁有埋 admin-file 的 component 因此可以呼叫出來
    self.openFiles = function () {
        console.log('openFiles');
        $mdSidenav('rightFile').toggle();
    };

    self.changeQueryDate = function () {
        // 處理 起始日結束日
        if (self.queryCondition.name === 'duration' && moment(self.queryCondition.value.endDate).isBefore(moment(self.queryCondition.value.startDate))) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            self.queryCondition.value.endDate = new Date(moment(self.queryCondition.value.startDate));
        }
    };

    self.changeQueryCondition = function () {
        console.log('broadcast', self.queryCondition);
        labexamService.setPreviousQueryConditionByUserId(self.user.Id, self.queryCondition);
        self.changeQueryDate();
        initState();
        $scope.$broadcast('queryCondition', self.queryCondition);
    };

    // 資料筆數、更新時間初始化
    function initState() {
        self.dataLength = null;
        self.lastAccessTime = null;
    }

    // 寫在doCheck，在表單點擊時，tab底線才會移動
    let previousState = null;
    self.$doCheck = function () {
        if (previousState !== $state.current.name) {
            // 控制tab底線的移動
            $scope.currentName = $state.current.name;
            previousState = $state.current.name;
        }
    };

    self.addLabexam = (labexamId = null) => {
        if ($state.current.name.substr(0, 2) === 'pd') {
            // for PD
            $state.go('pdCreateLabexam', {
                patientId: $stateParams.patientId,
                labexamId
            });
        } else {
            $state.go('createLabexam', {
                patientId: $stateParams.patientId,
                labexamId
            });
        }
    };

    // function onBackKeyDown() {
    //     $state.go('summary', {
    //         patientId: $stateParams.patientId,
    //         headerId: $stateParams.headerId
    //     }, {
    //             location: 'replace'
    //         });
    // }

    // 前往列印頁
    self.gotoPrintPage = function () {

        if ($state.current.name.substr(0, 2) === "pd") {
            $state.go('pdLabexamTablePrint', { patientId: $stateParams.patientId });
        } else {
            $state.go('labexamTablePrint', { patientId: $stateParams.patientId });
        }
    };


    self.goback = function goback() {
        SessionStorageService.deleteItem('labexamTableData');
        $state.go('summary', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId
        }, {
                location: 'replace'
            });
        // history.back();
    };

    // self.$onDestroy = () => {
    //     // document.removeEventListener("backbutton", onBackKeyDown);
    // };
}

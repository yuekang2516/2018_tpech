import vesselAssessmentProblemsList from './vesselAssessmentProblemsList.html';

angular
    .module('app')
    .component('vesselAssessmentProblemsList', {
        template: vesselAssessmentProblemsList,
        controller: vesselAssessmentProblemsListCtrl,
        controllerAs: '$ctrl'
    });

vesselAssessmentProblemsListCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'vesselAssessmentProblemsService',
    '$mdToast',
    '$mdMedia',
    '$interval',
    'PatientService',
    '$timeout'
];

function vesselAssessmentProblemsListCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    vesselAssessmentProblemsService, $mdToast, $mdMedia, $interval, PatientService, $timeout) {
    const self = this;

    self.serviceData = [];
    // 預設狀態
    // self.status = 'Deleted';
    self.loading = true;
    self.lastRecords = [];
    self.header = {};
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;
    const interval = $interval(calculateRefreshTime, 60000);

    self.$onInit = function $onInit() {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                vesselAssessmentProblemsService
                    // .get($stateParams.patientId)
                    .getByPatientid($stateParams.patientId)
                    .then((q) => {
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = vesselAssessmentProblemsService.getLastAccessTime();
                        calculateRefreshTime();
                        self.loading = false;
                        self.isError = false;
                    }, () => {
                        self.loading = false;
                        self.isError = true;
                    });
            }, (error) => {
                console.error('vesselAssessmentProblemsService', error);
                self.loading = false;
                self.isError = true;
            });
    };

    self.$onDestroy = function $onDestroy() {
        // 離開網頁時, 清空 interval, 以免
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };

    function calculateRefreshTime() {
        $timeout(() => {
            self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
        }, 0);
    }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        PatientService
            .getById($stateParams.patientId, true)
            .then((d) => {
                self.patient = d.data;
                vesselAssessmentProblemsService
                    // .get($stateParams.patientId)
                    .getByPatientid($stateParams.patientId, true)
                    .then((q) => {
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = vesselAssessmentProblemsService.getLastAccessTime();
                        calculateRefreshTime();
                        self.loading = false;
                        self.isError = false;
                    }, () => {
                        self.loading = false;
                        self.isError = true;
                    });
            }, (error) => {
                console.error('vesselAssessmentProblemsService', error);
                self.loading = false;
                self.isError = true;
            });
    };

    // 排序記錄時間, 用在 ng-repeat 上
    self.sortRecord = function sortRecord(record) {
        console.log('fff',record);
        const date = new Date(record.RecordDate);
        return date;
    };

    self.goto = function goto(Id = null) {
        $state.go('vesselAssessmentProblemsDetail', {
            vesselAssessmentProblemsId: Id,
            patientId: $stateParams.patientId });
    };


    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: [
                '$mdDialog', DialogController
            ],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: !$mdMedia('gt-sm'),
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                // console.log('data.id from list : ' + data.Id);
                vesselAssessmentProblemsService
                    .del(data.Id)
                    .then((q) => {
                        if (q.status === 200) {
                            self.refresh();
                        }
                    });
                mdDialog.hide(data);
            };
        }
    };

    self.goback = function goback() {
        // $state.go('summary', {}, { location: 'replace' });
        history.back();
    };

}

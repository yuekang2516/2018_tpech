import shiftIssue from './shiftIssue.html';
import shiftIssues from './shiftIssues.html';
import './shiftIssues.less';

angular.module('app').component('shiftIssue', {
    template: shiftIssue,
    controller: shiftIssueCtrl,
    contrllerAs: '$ctrl'
}).component('shiftIssues', {
    template: shiftIssues,
    controller: shiftIssuesCtrl,
    contrllerAs: '$ctrl'
});
// shift issues (list)
shiftIssuesCtrl.$inject = ['$mdDialog', 'shiftIssueService', '$timeout', '$document', '$window', '$stateParams', '$scope', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', '$filter'];
function shiftIssuesCtrl($mdDialog, shiftIssueService, $timeout, $document, $window, $stateParams, $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, $filter) {

    let $translate = $filter('translate');
    const self = this;

    // initialize data
    self.shiftIssueData = [];
    self.loading = true;
    self.lastAccessTime = moment();
    console.log('lastAccessTime', self.lastAccessTime);
    self.deletedItemsLength = -1;

    $scope.$on('shiftIssue-dataChanged', () => {
        self.refresh();
    });

    self.$onInit = function $onInit() {
        getIssuesList(false);
    };

    function getIssuesList(isForce) {
        shiftIssueService.getByPatientId($stateParams.patientId, isForce).then((res) => {
            self.shiftIssueData = res.data;
            self.lastAccessTime = shiftIssueService.getLastAccessTime();
            // get deleted item count
            self.deletedItemsLength = _.filter(res.data, { 'Status': 'Deleted' }).length;
            console.log('self.shiftIssueData', self.shiftIssueData);
            self.isError = false;
        }, (err) => {
            self.isError = true;
            console.log('error: ' + JSON.stringify(err));
        }).finally(() => {
            self.loading = false;
        });
    }

    // // 確認權限是否能刪除
    // self.checkAccessible = function (createdUserId) {
    //     return !createdUserId || SettingService.checkAccessible(createdUserId);
    // };
    // 確認權限是否能修改
    self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
        return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    };

    self.refresh = function refresh() {
        self.loading = true;
        self.shiftIssueData = [];
        getIssuesList(true);
    };

    self.goback = function () {
        history.go(-1);
    };

    // show delete dialog
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', dialogCtrl],
            templateUrl: 'shiftdialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function dialogCtrl(mdDialog) {
            const vm = this;

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                mdDialog.hide();
                self.loading = true;
                console.log('delete');
                shiftIssueService.del(data.Id).then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('shiftIssues.shiftIssues.component.deleteSuccess'));
                        getIssuesList(false);
                    }
                }, (err) => {
                    console.log('error: ' + JSON.stringify(err));
                    showMessage($translate('shiftIssues.shiftIssues.component.deleteFail'));
                }).finally(() => {
                    self.loading = false;
                });
            };
        }
    };

    // if Id is not given then it's create
    self.goto = function goto(Id = '') {
        // $state.go('shiftIssue', {
        //     patientId: $stateParams.patientId,
        //     headerId: $stateParams.headerId,
        //     Id
        // });
        console.log('goto compose.shiftIssue');
        $state.go('shiftIssue', { Id });
    };
}
// shift issue (detail)
shiftIssueCtrl.$inject = ['$mdSidenav', 'cursorInput', '$filter', 'showMessage', 'shiftIssueService', '$scope', '$window', '$state', '$stateParams', '$mdDialog', '$mdToast', 'dialysisService', '$interval', 'SettingService', 'PatientService'];
function shiftIssueCtrl($mdSidenav, cursorInput, $filter, showMessage, shiftIssueService, $scope, $window, $state, $stateParams, $mdDialog, $mdToast, dialysisService, $interval, SettingService, PatientService) {

    const $translate = $filter('translate');
    const self = this;

    self.Id = $stateParams.Id;
    // form data
    self.shiftIssueForm = {};
    // load user info
    self.user = SettingService.getCurrentUser();
    // loading
    self.loading = true;
    self.canAccess = true;

    self.$onInit = function $onInit() {
        // 更換 summary-card title
        if (!self.Id) {
            self.title = $translate('shiftIssues.shiftIssue.createShiftIssue');
        } else if (self.shiftIssueForm.Status !== 'Deleted') {
            self.title = $translate('shiftIssues.shiftIssue.editShiftIssue');
        } else {
            self.title = $translate('shiftIssues.shiftIssue.showDeleted');
        }

        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            self.patient = res.data;
            self.isError = false;
        }, () => {
            self.isError = true;
        });
        // edit shift issue
        if ($stateParams.Id) {

            shiftIssueService.getByRecordId(self.Id).then((res) => {
                self.shiftIssueForm = res.data;
                //修改再確認權限
                checkCanAccess(self.shiftIssueForm.CreatedUserId, self.shiftIssueForm.Status, self.shiftIssueForm.ModifiedUserId);
                self.shiftIssueForm.RecordTime = moment(self.shiftIssueForm.RecordTime).second(0).millisecond(0).toDate();
                self.isError = false;
            }, (err) => {
                console.log('error: ' + JSON.stringify(err));
                self.isError = true;
            }).finally(() => {
                self.loading = false;
                console.log('self.shiftIssueForm', self.shiftIssueForm);
            });
        } else {
            // new shift issue
            self.shiftIssueForm = {
                RecordTime: moment().second(0).millisecond(0).toDate(),
                PatientId: $stateParams.patientId,
                HeaderId: $stateParams.headerId,
                HospitalId: self.user.HospitalId,
                DialysisId: $stateParams.headerId
            };
            self.loading = false;
        }
    };

    // // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //     if ($stateParams.Id) {
    //         // 等確定有值才需判斷是否能編輯
    //         return !createdUserId || SettingService.checkAccessible(createdUserId);
    //     }
    //     return true;
    // };
    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    }

    self.submit = function submit() {
        //self.loading = true;
        self.isSaving = true;
        // edit
        if ($stateParams.Id) {
            self.shiftIssueForm.ModifiedUserId = self.user.Id;
            self.shiftIssueForm.ModifiedUserName = self.user.Name;
            shiftIssueService.putRecord(self.shiftIssueForm).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('shiftIssues.shiftIssue.component.editSuccess'));
                    history.go(-1);
                }
            }, (err) => {
                console.log('error: ' + JSON.stringify(err));
                showMessage($translate('shiftIssues.shiftIssue.component.editFail'));
            }).finally(() => {
                //self.loading = false;
                self.isSaving = false;
            });
            //console.log('self.shiftIssueForm', self.shiftIssueForm);
        } else {
            // new
            self.shiftIssueForm.CreatedUserId = self.user.Id;
            self.shiftIssueForm.CreatedUserName = self.user.Name;

            shiftIssueService.postRecord(self.shiftIssueForm).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('shiftIssues.shiftIssue.component.createSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                console.log('error: ' + JSON.stringify(err));
                showMessage($translate('shiftIssues.shiftIssue.component.createFail'));
            }).finally(() => {
                //self.loading = false;
                self.isSaving = false;
            });
        }
    };

    // go back to previous page
    self.goback = function goback() {
        history.go(-1);
    };

    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#content'), e);
        //$mdSidenav('rightPhrase').close();
    };

}


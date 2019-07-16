/* global $*/
import tpl from './healthProblem.html';
import './healthProblem.less';

angular.module('app').component('healthProblem', {
    template: tpl,
    controller: healthProblemCtrl,
});

healthProblemCtrl.$inject = ['$window', '$stateParams', 'allHealthProblemService', '$scope', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', '$filter', 'cursorInput', 'PatientService'];
function healthProblemCtrl($window, $stateParams, allHealthProblemService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, $filter, cursorInput, PatientService) {
    const self = this;

    let $translate = $filter('translate');

    self.healthProblemId = $stateParams.healthProblemId;
    self.user = SettingService.getCurrentUser();
    self.regForm = {};
    self.canAccess = true;

    // loading
    self.loading = true;

    self.lastAccessTime = moment();

    // 預設畫面
    self.$onInit = function $onInit() {
        if ($stateParams.healthProblemId) {
            self.loading = true;
            allHealthProblemService.getById($stateParams.healthProblemId).then((q) => {
                self.loading = false;
                self.regForm = q.data;
                //修改再確認權限
                checkCanAccess(self.regForm.CreatedUserId, self.regForm.Status, self.regForm.ModifiedUserId);
                self.isError = false; // 顯示伺服器連接失敗的訊息
                self.regForm.RecordTime = moment(self.regForm.RecordTime).second(0).millisecond(0).toDate();
            }, () => {
                self.loading = false;
                self.isError = true; // 顯示伺服器連接失敗的訊息
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
        } else { // 預設
            self.regForm = {
                RecordTime: moment().second(0).millisecond(0).toDate(),
                Content: '',
                PatientId: $stateParams.patientId,
                RelativeId: $stateParams.headerId,
                HospitalId: self.user.HospitalId
            };
            self.loading = false;
        }
    };

    // // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //   if (self.nursingRecordId) {
    //     // 等確定有值才需判斷是否能編輯
    //     return !createdUserId || SettingService.checkAccessible(createdUserId);
    //   }
    //   return true;
    // };
    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    }

    // 當日期或時間有修改時
    let selectedDate = {};
    let selectedTime = {};
    self.dateChanged = function (date) {
        selectedDate = date;
    };
    self.timeChanged = function (time) {
        selectedTime = time;
    };

    // 修改提交
    self.isSaving = false;
    self.submit = function submit(event) {
        self.isSaving = true;
        if (event) {
            event.currentTarget.disabled = true;
        }

        // // 把日期選擇器時間寫入 nursingTime
        // self.regForm.NursingTime = new Date(self.regForm.NursingTime);
        if (typeof (self.regForm.Id) === 'undefined') {
            self.regForm.CreatedUserId = self.user.Id;
            self.regForm.CreatedUserName = self.user.Name;

            allHealthProblemService.post(self.regForm).then((res) => {
                showMessage($translate('nursingRecord.nursingRecord.component.createSuccess'));
                history.go(-1);
            }).catch((err) => {
                showMessage($translate('nursingRecord.nursingRecord.component.creaeFail'));
            }).finally(() => {
                self.isSaving = false;
            });

        } else {
            self.regForm.ModifiedUserId = self.user.Id;
            self.regForm.ModifiedUserName = self.user.Name;

            console.log('put',self.user.Id);
            console.log('put',self.user.Name);
            allHealthProblemService.put(self.regForm).then((res) => {
                if (res.status === 200) {
                    console.log('put',self.regForm);
                    showMessage($translate('nursingRecord.nursingRecord.component.editSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                console.log('err',err);
                showMessage($translate('nursingRecord.nursingRecord.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    // 回上一頁
    self.goback = function goback(routeName) {
        history.go(-1);
    };
    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        //$mdSidenav('rightPhrase').close();
    };
}

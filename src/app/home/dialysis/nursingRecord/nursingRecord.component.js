/* global $*/
import nursingRecords from './nursingRecords.html';
import nursingRecord from './nursingRecord.html';
import './nursingRecord.less';

angular.module('app').component('nursingRecord', {
  template: nursingRecords,
  controller: nursingRecordCtrl,
  controllerAs: '$ctrl'
}).component('nursingRecordDetail', {
  template: nursingRecord,
  controller: nursingRecordContentCtrl,
  controllerAs: '$ctrl'
});

nursingRecordCtrl.$inject = ['$scope', '$window', '$state', 'SettingService', 'NursingRecordService', '$stateParams', '$mdDialog', '$mdToast', 'OverViewService', '$interval', '$timeout'];

function nursingRecordCtrl($scope, $window, $state, SettingService, NursingRecordService, $stateParams,
  $mdDialog, $mdToast, OverViewService, $interval, $timeout) {
  const self = this;

  self.serviceData = [];

  // 預設狀態
  // self.loading = true;
  self.lastDialysisId = '';
  self.lastRecords = [];
  self.header = {};
  self.lastAccessTime = moment();
  self.deletedItemsLength = -1;

  $scope.$on('nursingRecord-dataChanged', () => {
    self.refresh();
  });

  self.$onInit = function $onInit() {
    OverViewService.getByHeaderId($stateParams.headerId).then((res) => {
      self.header = res.data;
    }, () => {
      self.loading = false;
      self.isError = true; // 顯示伺服器連接失敗的訊息
    });

    // 依表頭 id 取得陣列
    NursingRecordService.getByHeaderId($stateParams.headerId, true).then((q) => {
      self.serviceData = q.data;
      console.log(self.serviceData);
      self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
      self.lastAccessTime = NursingRecordService.getLastAccessTime();
      self.loading = false;
      self.isError = false;
    }, () => {
      self.loading = false;
      self.isError = true;
    });
  };

  function _calculateDeletedItemLength() {
    return self.serviceData.filter(item => item.Status === 'Deleted').length;
  }

  // 使用者按右上角重整按鈕時
  self.refresh = function refresh() {
    self.loading = true;
    NursingRecordService.getByHeaderId($stateParams.headerId, true).then((q) => {
      self.serviceData = q.data;
      self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
      self.lastAccessTime = NursingRecordService.getLastAccessTime();
      self.loading = false;
      self.isError = false;
    }, () => {
      self.loading = false;
      self.isError = true;
    });
  };

  // add or edit
  self.goto = function goto(nursingRecordId = '') {
    $state.go('nursingRecordDetail', {
      patientId: $stateParams.patientId,
      headerId: $stateParams.headerId,
      nursingRecordId
    });
  };

  // // 確認權限是否能修改
  // self.checkAccessible = function (createdUserId) {
  //   // 等確定有值才需判斷是否能編輯
  //   return !createdUserId || SettingService.checkAccessible(createdUserId);
  // };
  self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
    return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
  };

  // 刪除詢問
  self.showDialog = function showDialog(event, data) {
    $mdDialog.show({
      controller: ['$mdDialog', DialogController],
      templateUrl: 'nursingdialog.html',
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: true,
      fullscreen: false,
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
        NursingRecordService.del(data.Id).then((q) => {
          if (q.status === 200) {
            // 依表頭 id 取得陣列
            NursingRecordService.getByHeaderId($stateParams.headerId).then((q) => {
              self.serviceData = q.data;
              self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
              self.lastAccessTime = NursingRecordService.getLastAccessTime();
              self.loading = false;
            });
          }
        });
        $mdDialog.hide(data);
      };
    }
  };

  self.goback = function goback() {
    history.back();
  };

}

nursingRecordContentCtrl.$inject = ['$window', '$stateParams', 'NursingRecordService', '$scope', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', '$filter', 'cursorInput', 'PatientService'];

function nursingRecordContentCtrl($window, $stateParams, NursingRecordService,
  $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, $filter, cursorInput, PatientService) {
  const self = this;

  let $translate = $filter('translate');

  self.nursingRecordId = $stateParams.nursingRecordId;
  self.user = SettingService.getCurrentUser();
  self.regForm = {};
  self.canAccess = true;

  // 預設畫面
  self.$onInit = function $onInit() {
    // 取得病人資料, 顯示於畫面上方標題列
    // PatientService.getById($stateParams.patientId).then((res) => {
    //   self.patient = res.data;
    // });
    if ($stateParams.nursingRecordId) {
      self.loading = true;
      NursingRecordService.getById($stateParams.nursingRecordId).then((q) => {
        self.loading = false;
        self.regForm = q.data;
        console.log('nursingdetail', self.regForm);
        //修改再確認權限
        checkCanAccess(self.regForm.CreatedUserId, self.regForm.Status, self.regForm.ModifiedUserId);
        self.isError = false; // 顯示伺服器連接失敗的訊息
        self.regForm.NursingTime = moment(self.regForm.NursingTime).second(0).millisecond(0).toDate();
      }, () => {
        self.loading = false;
        self.isError = true; // 顯示伺服器連接失敗的訊息
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
      });
    } else { // 預設
      self.regForm = {
        NursingTime: moment().second(0).millisecond(0).toDate(),
        Content: '',
        PatientId: $stateParams.patientId,
        RelativeId: $stateParams.headerId,
        HospitalId: self.user.HospitalId
      };
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
    // 判斷有無event，避免其他隻 function 呼叫
    self.isSaving = true;
    if (event) {
      event.currentTarget.disabled = true;
    }

    // 把日期選擇器時間寫入 nursingTime
    self.regForm.NursingTime = new Date(self.regForm.NursingTime);
    if ($stateParams.nursingRecordId) {
      self.regForm.ModifiedUserId = self.user.Id;
      self.regForm.ModifiedUserName = self.user.Name;

      NursingRecordService.put(self.regForm).then((res) => {
        if (res.status === 200) {
          showMessage($translate('nursingRecord.nursingRecord.component.editSuccess'));
          history.go(-1);
        }
      }).catch((err) => {
        showMessage($translate('nursingRecord.nursingRecord.component.editFail'));
      }).finally(() => {
        self.isSaving = false;
      });
    } else {
      self.regForm.CreatedUserId = self.user.Id;
      self.regForm.CreatedUserName = self.user.Name;

      NursingRecordService.post(self.regForm).then((res) => {
        if (res.status === 200) {
          showMessage($translate('nursingRecord.nursingRecord.component.createSuccess'));
          history.go(-1);
        }
      }).catch((err) => {
        showMessage($translate('nursingRecord.nursingRecord.component.creaeFail'));
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

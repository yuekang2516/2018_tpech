import nursingRecords from './nursingRecords.html';
import nursingRecord from './nursingRecord.html';
import './nursingRecord.less';

angular.module('app')
  .component('allNursingRecords', {
    template: nursingRecords,
    controller: allNursingRecordsCtrl,
    controllerAs: '$ctrl'
  })
  .component('allNursingRecordDetail', {
    template: nursingRecord,
    controller: allNursingRecordContentCtrl,
    controllerAs: '$ctrl'
  });

allNursingRecordsCtrl.$inject = ['$state', 'SettingService', 'NursingRecordService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage', '$filter', '$scope'];

function allNursingRecordsCtrl($state, SettingService, NursingRecordService, $stateParams,
  $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage, $filter, $scope) {
  const self = this;
  self.serviceData = null;
  self.totalCnt = 0;
  let page = 1;
  let maxpage = 0;
  let limit = 50;

  let $translate = $filter('translate');

  self.stateName = $state.current.name;

  // 預設狀態
  self.loading = false;
  self.lastApoId = '';
  self.lastAccessTime = moment();
  // self.deletedItemsLength = -1;
  $scope.$on('nursingRecord-dataChanged', () => {
    self.refresh();
  });

  self.loadRecords = function loadRecords(isForce = false) {
    self.loading = true;
    PatientService.getById($stateParams.patientId).then((d) => {
      self.patient = d.data;
      NursingRecordService.getByIdPage($stateParams.patientId, page, limit, isForce).then((q) => {
        // debugger;
        // self.serviceData = q.data;
        self.totalCnt = q.data.Total;
        maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
        if (q.data.Total % limit === 0) {
          maxpage -= 1;
        }
        // console.log(maxpage);
        if (q.data.Total > 0) {
          self.serviceData = q.data.Results;
          // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
        } else {
          self.serviceData = null;
        }
        self.lastAccessTime = NursingRecordService.getLastAccessTime();
        self.loading = false;
        self.isError = false; // 顯示伺服器連接失敗的訊息
      }, () => {
        self.loading = false;
        self.isError = true;
      });
    }, () => {
      self.loading = false;
      self.isError = true;
    });
  };

  self.$onInit = function $onInit() {
    self.loadRecords(true);
  };

  // scroll 至底時呼叫
  self.loadMore = function loadMore() {
    if (self.loading) {
      return;
    }
    self.loading = true;
    page += 1;
    if (page > maxpage) {
      self.loading = false;
      return;
    }
    // 呼叫取得NursingRecord的Service
    NursingRecordService.getByIdPage($stateParams.patientId, page, limit).then((q) => {
      console.log(q);
      // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
      self.serviceData = q.data.Results;
      // for (let i = 0; i < q.data.Results.length; i++) {
      //     self.serviceData.push(q.data.Results[i]);
      // }
      // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      self.loading = false;
      self.isError = true;
      // showMessage(lang.ComServerError);
    });
  };

  // // 確認權限是否能修改
  // self.checkAccessible = function (createdUserId) {
  //   return !createdUserId || SettingService.checkAccessible(createdUserId);
  // };
  // 確認權限是否能修改
  self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
    return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
  };

  // 使用者按右上角重整按鈕時
  self.refresh = function refresh() {
    page = 1;

    // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
    self.serviceData = null;

    self.loadRecords(true);
  };

  // add or edit
  // self.goto = function goto(id) {
  self.goto = function goto(nursingRecordId = null) {
    if ($state.current.name.substr(0, 2) === "pd") {
      $state.go('pdAllNursingRecordDetail', { nursingRecordId: nursingRecordId });
    } else {
      $state.go('allNursingRecordDetail', { nursingRecordId: nursingRecordId });
    }
  };
  // 刪除詢問
  self.showDialog = function showDialog(event, data) {
    $mdDialog.show({
      controller: ['$mdDialog', DialogController],
      templateUrl: 'allnursingRecordDialog.html',
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
            showMessage($translate('allNursingRecord.nursingRecords.component.deleteSuccess'));
          }
        });
        mdDialog.hide(data);
      };
    }
  };
  self.back = function back() {
    history.go(-1);
  };
}

allNursingRecordContentCtrl.$inject = ['$stateParams', 'NursingRecordService', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', '$filter', 'cursorInput'];

function allNursingRecordContentCtrl($stateParams, NursingRecordService,
  $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage,
  PatientService, $filter, cursorInput) {
  const self = this;

  let $translate = $filter('translate');

  self.nursingRecordId = $stateParams.nursingRecordId;
  self.user = SettingService.getCurrentUser();
  self.canAccess = true;

  self.stateName = $state.current.name;

  // 預設時間格式
  self.datetimepickerOption = {
    format: 'YYYY-MM-DD HH:mm'
  };

  self.$onInit = function $onInit() {
    self.loading = true;
    if ($stateParams.nursingRecordId) {
      // 預設畫面
      PatientService
        .getById($stateParams.patientId)
        .then((d) => {
          self.patient = d.data;
          NursingRecordService.getById(self.nursingRecordId).then((q) => {
            self.loading = false;
            self.regForm = q.data;
            //修改再確認權限
            checkCanAccess(self.regForm.CreatedUserId, self.regForm.Status, self.regForm.ModifiedUserId);
            // retrieve NursingTime
            self.regForm.NursingTime = new Date(moment(self.regForm.NursingTime).format('YYYY-MM-DD HH:mm:ss'));
            self.isError = false;
          }, () => {
            self.loading = false;
            self.isError = true;
          });
        }, () => {
          self.loading = false;
          self.isError = true;
        });
    } else {
      // 預設
      PatientService
        .getById($stateParams.patientId)
        .then((d) => {
          self.patient = d.data;
          self.loading = false;
          self.regForm = {
            NursingTime: moment().second(0).millisecond(0).toDate(),
            Content: '',
            PatientId: $stateParams.patientId,
            RelativeId: $stateParams.headerId,
            HospitalId: self.user.HospitalId
          };
        });
    }
  };

  // 當日期或時間有修改時
  let selectedDate = {};
  let selectedTime = {};
  self.dateChanged = function (date) {
    selectedDate = date;
  };
  self.timeChanged = function (time) {
    selectedTime = time;
  };

  // // 確認權限是否能修改
  // self.checkAccessible = function (createdUserId) {
  //   if ($stateParams.nursingRecordId) {
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

  // 修改提交
  self.isSaving = false;
  self.submit = function submit($event) {
    $event.currentTarget.disabled = true;

    self.isSaving = true;
    // 把日期選擇器時間寫入 nursingTime
    self.regForm.NursingTime = new Date(moment(self.regForm.NursingTime).format('YYYY-MM-DD HH:mm:ss'));

    if ($stateParams.nursingRecordId) {
      self.regForm.ModifiedUserId = self.user.Id;
      self.regForm.ModifiedUserName = self.user.Name;

      NursingRecordService.put(self.regForm).then((res) => {
        if (res.status === 200) {
          showMessage($translate('allNursingRecord.nursingRecord.component.editSuccess'));
          history.back(-1);
        }
      }).catch((err) => {
        showMessage($translate('allNursingRecord.nursingRecord.component.editFail'));
      }).finally(() => {
        self.isSaving = false;
      });
    } else {
      self.regForm.CreatedUserId = self.user.Id;
      self.regForm.CreatedUserName = self.user.Name;

      NursingRecordService.post(self.regForm).then((res) => {
        if (res.status === 200) {
          showMessage($translate('allNursingRecord.nursingRecord.component.createSuccess'));
          history.back(-1);
        }
      }).catch((err) => {
        showMessage($translate('allNursingRecord.nursingRecord.component.createFail'));
      }).finally(() => {
        self.isSaving = false;
      });
    }
  };


  // 回上一頁
  self.goback = function goback() {
    history.back(-1);
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

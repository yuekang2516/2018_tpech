import tpl from './executionRecord.html';
import tpl2 from './executionDetail.html';
import './executionRecord.less';

angular.module('app').component('executionRecord', {
  template: tpl,
  controller: executionRecordCtrl
}).component('executionDetail', {
  template: tpl2,
  controller: executionDetailCtrl
});

executionRecordCtrl.$inject = ['$rootScope', 'ExecutionRecordService', '$stateParams', '$state', '$interval', '$timeout'];

function executionRecordCtrl($rootScope, ExecutionRecordService, $stateParams, $state, $interval, $timeout) {
  const self = this;
  const statePatientId = $stateParams.patientId;
  const stateHeaderId = $stateParams.headerId;
  const interval = $interval(_calculateRefreshTime, 60000);

  self.serviceData = null;
  self.loading = true;
  self.lastAccessTime = moment();

  // 初始值
  self.$onInit = function $onInit() {
    self.getList(statePatientId, stateHeaderId, false);
  };

  // 離開網頁時，所需的動作
  self.$onDestroy = function onDestroy() {
    // 清空 interval
    if (angular.isDefined(interval)) {
      $interval.cancel(interval);
    }
  };

  // 列表
  self.getList = function getList(patientId, headerId, isForce) {
    ExecutionRecordService.getSTRecord(patientId, headerId, isForce).then((q) => {
      self.serviceData = q.data;
      self.lastAccessTime = ExecutionRecordService.getLastAccessTime();
      _calculateRefreshTime();
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息
    }, (reason) => {
      self.loading = false;
      self.isError = true;
    });
  };

  // 點選執行/不執行
  self.submit = function submit(type, id) {
    if (type === 'Performed' || type === 'Neglect') {
      $state.go('executionDetail', {
        patientId: statePatientId,
        headerId: stateHeaderId,
        executionId: id,
        mode: type
      });
    }
  };

  self.title = 'this is executionRecord component page';

  self.goback = function goback() {
    $rootScope.$emit('stateGoBack');
  };

  // 計算最後更新時間
  function _calculateRefreshTime() {
    $timeout(() => {
      self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    }, 0);
  }

  // 使用者按右上角重整按鈕時
  self.refresh = function refresh() {
    self.loading = true;
    self.getList(statePatientId, stateHeaderId, true);
  };
}


executionDetailCtrl.$inject = ['$timeout', '$rootScope', 'ExecutionRecordService', '$stateParams', '$state', 'showMessage', '$scope', '$filter'];

function executionDetailCtrl(
  $timeout,
  $rootScope,
  ExecutionRecordService,
  $stateParams,
  $state,
  showMessage,
  $scope,
  $filter
) {
  const self = this;

  let $translate = $filter('translate');

  self.loading = true;

  // self.ProcessTime = null; // 執行時間
  self.timeMessage = ''; // 操作訊息

  self.$onInit = function $onInit() {
    ExecutionRecordService.getDetail($stateParams.executionId).then((q) => {
      self.serviceData = q.data;
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息
      self.serviceData.OrderMode = $stateParams.mode;
      self.checkCreatedTime = new Date(self.serviceData.CreatedTime); // 比對執行時間用

      if (!self.serviceData.ProcessTime) {
        self.serviceData.ProcessTime = new Date(moment(self.serviceData.StartTime).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm'));
      } else {
        self.serviceData.ProcessTime = new Date(self.serviceData.ProcessTime);
      }
      compareProcessTime();

      if (!self.serviceData.ActualQuantity && $stateParams.mode === 'Performed') {
        self.serviceData.ActualQuantity = self.serviceData.Quantity;
      }
    }, (reason) => {
      console.error(reason);
      self.loading = false;
      self.isError = true;
    });
  };

  // 比對執行時間
  function compareProcessTime() {
    if (moment(self.serviceData.ProcessTime).diff(self.checkCreatedTime) < 0) {
      // self.timeMessage = '請注意，執行時間比建立時間(' + moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') + ')早。';
      self.timeMessage = $translate('executionRecord.executionDetail.component.timeEarlier', { createdTime: moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') });
    } else if (moment(self.serviceData.ProcessTime).diff(moment()) > 0) {
      self.timeMessage = $translate('executionRecord.executionDetail.component.timeLater');
    } else {
      self.timeMessage = '';
    }
  }

  // 當日期或時間有修改時
  self.dateChanged = function () {
    compareProcessTime();
  };

  // 資料更新
  self.submit = function submit() {
    self.serviceData.DialysisId = $stateParams.headerId;

    ExecutionRecordService.put(self.serviceData).then((res) => {
      if (res.status === 200) {
        showMessage($translate('executionRecord.executionDetail.component.editSuccess'));
        // 即時重讀未執行筆數(放著備用)
        $scope.$emit('tabCount', { type: 'execute' });
        history.go(-1);
      } else {
        showMessage($translate('executionRecord.executionDetail.component.editFail'));
      }
    });
  };

  // 回上頁
  self.goback = function goback() {
    history.go(-1);
  };
}

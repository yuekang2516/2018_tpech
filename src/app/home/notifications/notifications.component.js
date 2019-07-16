import notif from './notifications.html';

angular.module('app').component('notifications', {
  template: notif,
  controller: notificationsCtrl
});

// 最新通知列表
notificationsCtrl.$inject = ['notificationService', 'SettingService', '$mdDialog', '$interval', '$mdSidenav', '$timeout', '$filter'];

function notificationsCtrl(notificationService, SettingService, $mdDialog, $interval, $mdSidenav, $timeout, $filter) {
  const self = this;
  const userInfo = SettingService.getCurrentUser();
  const interval = $interval(_calculateRefreshTime, 60000);

  let $translate = $filter('translate');

  self.loading = true;
  self.lastAccessTime = moment();

  self.$onInit = function onInit() {
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    self.readData(userInfo.Id, false);
  };

  // 離開網頁時，所需的動作
  self.$onDestroy = function onDestroy() {
    // 清空 interval
    if (angular.isDefined(interval)) {
      $interval.cancel(interval);
    }
  };

  // 讀取資料
  self.readData = function readData(userId, isForce) {
    notificationService.getCarePatientsByUserId(userId, isForce).then((q) => {
      self.serviceData = q.data;
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息
      self.lastAccessTime = notificationService.getLastAccessTime();
      _calculateRefreshTime();
    }, (reason) => {
        self.loading = false;
        self.isError = true;
    });
  };

  // 使用者按右上角重整按鈕時
  self.refresh = function refresh() {
    self.loading = true;
    self.readData(userInfo.Id, true);
  };

  // 設定已讀
  self.openDialog = function openDialog(ev, item) {

    // 寫入讀取人員及最後讀取時間
    notificationService.setRead(item.Id, userInfo.Id).then(() => {});

    $mdDialog.show(
      $mdDialog.alert()
      .parent(angular.element(document.querySelector('#popupContainer')))
      .clickOutsideToClose(true)
      .title(item.Name)
      .textContent(item.Content)
      .ariaLabel('Alert Dialog Demo')
      .ok($translate('notifications.component.ok'))
      .targetEvent(ev)
    );
  };

  self.openLeftMenu = function openLeftMenu() {
    $mdSidenav('left').toggle();
  };

  // 計算最後更新時間
  function _calculateRefreshTime() {
    $timeout(() => {
      self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    }, 0);
  }
}
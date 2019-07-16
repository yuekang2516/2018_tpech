import tpl from './ward.html';

angular.module('app').component('ward', {
  template: tpl,
  controller: wardCtrl,
  controllerAs: 'vm'
});

wardCtrl.$inject = ['$mdSidenav', '$state', 'wardService', 'showMessage', '$filter'];
function wardCtrl($mdSidenav, $state, wardService, showMessage, $filter) {
  const vm = this;
  let $translate = $filter('translate');

  // 有可能是手機點進來的, 所以要把左側選單收起來
  // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
  $mdSidenav('left').close();
  vm.openLeftMenu = function openLeftMenu() {
    $mdSidenav('left').toggle();
  };

  // 初始載入區
  vm.$onInit = function onInit() {
    // 更改讀取狀態
    vm.loading = true;

    // 取得透析室資料
    wardService.get().then((resp) => {
      vm.wards = resp.data;
      vm.totalItems = resp.data.length;
      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      vm.loading = false;
      vm.isError = true;
      showMessage($translate('customMessage.serverError')); // lang.ServerError
    });
  };

  // 進入編輯透析室頁面
  vm.gotoWardData = function gotoWardData(data) {
    $state.go('wardDetail', { id: data.Id });
  };

  // 進入新增透析室頁面
  vm.gotoCreate = function gotoCreate() {
    $state.go('wardDetail', { id: 'create' });
  };
}

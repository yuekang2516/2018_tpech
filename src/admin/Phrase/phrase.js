import tpl from './phrase.html';

angular.module('app').component('systemPhrase', {
  template: tpl,
  controller: SystemPhraseCtrl,
  controllerAs: 'vm'
});

SystemPhraseCtrl.$inject = ['$mdSidenav', '$state', 'wardService', 'showMessage', '$filter'];
function SystemPhraseCtrl($mdSidenav, $state, wardService, showMessage, $filter) {
  const vm = this;
  let $translate = $filter('translate');

  // 有可能是手機點進來的, 所以要把左側選單收起來
  // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
  $mdSidenav('left').close();
  vm.openLeftMenu = function () {
    $mdSidenav('left').toggle();
  };

  // 初始載入區
  vm.$onInit = function onInit() {
    // 更改讀取狀態
    vm.loading = true;

    // 取得透析室資料
    wardService.get().then((resp) => {
      vm.wards = resp.data;
      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      vm.loading = false;
      vm.isError = true;
      showMessage($translate('customMessage.serverError')); // lang.ComServerError
    });
  };

  // 進入個人片語頁面
  vm.gotoPersonalPhrase = function gotoPersonalPhrase() {
    $state.go('phraseDetail', { wardId: 'personalphrase', categoryId: 'home', phraseKind: 'personalphrase' });
  };

  // 進入系統片語頁面
  vm.gotoSystemPhrase = function gotoSystemPhrase() {
    $state.go('phraseDetail', { wardId: 'systemphrase', categoryId: 'home', phraseKind: 'systemphrase' });
  };

  // 進入各透析室片語頁面
  vm.gotoPhrase = function gotoPhrase(Id) {
    $state.go('phraseDetail', { wardId: Id, categoryId: 'home', phraseKind: '' });
  };
}

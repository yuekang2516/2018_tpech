import tpl from './hospital.html';

angular.module('app').component('hospital', {
  template: tpl,
  controller: hospitalCtrl,
  controllerAs: 'vm'
});

hospitalCtrl.$inject = ['$mdSidenav', '$state', 'hospitalService', 'showMessage'];
function hospitalCtrl($mdSidenav, $state, hospitalService, showMessage) {
  const vm = this;

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

    // 取得醫院資料
    hospitalService.get().then((resp) => {
      console.log(resp);
      vm.hospitals = resp.data;
      vm.totalItems = resp.data.length;
      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      vm.loading = false;
      vm.isError = true;
      showMessage(lang.ServerError);
    });
  };

  // 進入編輯透析室頁面
  vm.gotoHospitalData = function gotoHospitalData(data) {
    $state.go('hospitalDetail', { id: data.Id });
  };

  // 進入新增透析室頁面
  vm.gotoCreate = function gotoCreate() {
    $state.go('hospitalDetail', { id: 'create' });
  };
}

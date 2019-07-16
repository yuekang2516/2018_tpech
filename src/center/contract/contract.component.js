import tpl from './contract.html';

angular.module('app').component('contract', {
    template: tpl,
    controller: ContractCtrl,
    controllerAs: 'vm'
});

ContractCtrl.$inject = ['$mdSidenav', '$window', '$state', 'contractService', 'showMessage'];
function ContractCtrl($mdSidenav, $window, $state, contractService, showMessage) {
    const vm = this;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    // 初始載入區
    vm.$onInit = function onInit() {
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        // 更改讀取狀態
        vm.loading = true;

        contractService.get().then((resp) => {
            vm.contracts = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage(lang.ComServerError);
        });
    };

    // 切換到編輯CENTER使用者頁面
    vm.gotoContractDetail = function (id) {
        $state.go('contractDetail', { id });
    };

    // 切換到新增CENTER使用者頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('contractDetail', { id: 'create' });
    };
}

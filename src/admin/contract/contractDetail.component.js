import tpl from './contractDetail.html';

angular.module('app').component('contractDetail', {
    template: tpl,
    controller: ContractDetailCtrl,
    controllerAs: 'vm'
});

ContractDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'contractService', 'showMessage', '$filter'];

function ContractDetailCtrl($scope, $state, $stateParams, $sessionStorage, contractService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    vm.readonly = false;
    vm.editMode = false;

    // 取得合約資料
    vm.loadContract = function loadContract() {
        vm.type = 'edit';
        vm.editMode = true;
        // 編輯時讀取合約資料
        contractService.getById($stateParams.id).then((resp) => {
            vm.contract = resp.data;
            vm.formData = angular.copy(resp.data);
            vm.formData.StartDate = new Date(vm.contract.StartDate);
            vm.formData.EndDate = new Date(vm.contract.EndDate);
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ServerError
        });
    };

    // 初始化頁面時載入合約資料
    vm.$onInit = function onInit() {
        // 讀取狀態參數
        vm.loading = true;
        // 先初始化一個空物件
        vm.formData = {};
        vm.loadContract();
    };

    vm.$onDestroy = function () {
    };

    vm.back = function () {
        history.go(-1);
    };

    vm.showMethod = function showMethod(method) {
        let sMethod = '';
        if (method === 'rent') {
            sMethod = $translate('payment.rent'); // '月租'
        } else if (method === 'usage') {
            sMethod = $translate('payment.usage'); // '用量';
        } else {
            sMethod = method;
        }
        return sMethod;
    };
}

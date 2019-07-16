import tpl from './contractList.html';
import './contractList.less';

angular.module('app').component('contractList', {
    template: tpl,
    controller: ContractListCtrl,
    controllerAs: 'contractList'
});

ContractListCtrl.$inject = ['$window', '$state', 'contractService', 'showMessage', '$stateParams'];

function ContractListCtrl($window, $state, contractService, showMessage, $stateParams) {
    const vm = this;
    let statehospitalId;

        // 初始載入區
        vm.$onInit = function onInit() {
            statehospitalId = $stateParams.id;
            // 進入此頁面後拉到最頂
            $window.scrollTo(0, 0);
            // 更改讀取狀態
            vm.loading = true;
            vm.search = 'Normal';
            contractService.getHospitalAll($stateParams.id).then((resp) => {
                vm.contracts = resp.data;
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                vm.loading = false;
                vm.isError = true;
                showMessage(lang.ComServerError);
            });
        };

        // 切換到編輯合約頁面
        vm.gotoContractDetail = function (eid) {
            $state.go('contractListDetail', {
                id: eid,
                hospitalId: statehospitalId
            });
        };

        // 切換到新增合約頁面
        vm.gotoCreate = function gotoCreate() {
            $state.go('contractListDetail', {
                id: 'create',
                hospitalId: statehospitalId
            });
        };

        // 顯示刪除項目切換:為了左上角顯示出正確的筆數
        vm.changeSearch = function changeSearch() {
            if (vm.showDelete) {
                vm.search = '';
            } else {
                vm.search = 'Normal';
            }
        };
    }

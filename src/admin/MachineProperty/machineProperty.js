import tpl from './machineProperty.html';
import './machineProperty.less';

angular.module('app').component('machineProperty', {
    template: tpl,
    controller: SystemMachinePropertyCtrl,
    controllerAs: 'vm'
});

SystemMachinePropertyCtrl.$inject = ['$mdSidenav', '$state', '$timeout', 'machineService', 'showMessage', '$filter'];
function SystemMachinePropertyCtrl($mdSidenav, $state, $timeout, machineService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    // infinite scroll 相關
    let dataEnd = false; // 判斷資料使否已完全 push 至顯示用的陣列裡
    let dataNumOnce = 20; // 一次 push 多少筆資料
    let timeoutPromise;

    // 初始載入區
    vm.$onInit = function () {
        getAllMachines();
    };

    function getAllMachines() {
        // 更改讀取狀態
        vm.loading = true;
        machineService.get().then((resp) => {
            console.log(resp);
            vm.machines = resp.data;
            initForScroll();
            vm.loadMore();
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // 初始化 infinite scroll 相關參數 (一次顯示多個)
    function initForScroll() {
        dataEnd = false;
        vm.showMachines = [];
    }

    // scroll 至底時呼叫
    vm.loadMore = function () {
        vm.loading = true;
        vm.search = 'Normal';
        if (dataEnd || !vm.machines) {
            vm.loading = false;
            return;
        }
        let lastIndex = vm.showMachines.length - 1;
        let dataNum;
        // 判斷是否將為資料底
        if ((lastIndex + dataNumOnce) >= vm.machines.length - 1) {
            dataEnd = true;
            dataNum = vm.machines.length - lastIndex;
        } else {
            dataNum = dataNumOnce + 1;
        }
        for (let i = 1; i < dataNum; i++) {
            vm.showMachines.push(vm.machines[lastIndex + i]);
        }
        vm.loading = false;
    };

    // 進入財產編輯頁面
    vm.go = function go(med) {
        $state.go('machinePropertyDetail', { id: med.Id });
    };

    // 進入財產新增頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('machinePropertyDetail', { id: 'create' });
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

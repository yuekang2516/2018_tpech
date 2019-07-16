import tpl from './labexamItem.html';
import './labexamItem.less';

angular.module('app').component('labexamItem', {
    template: tpl,
    controller: SystemLabexamItemCtrl,
    controllerAs: 'vm'
});

SystemLabexamItemCtrl.$inject = ['$mdSidenav', '$state', '$timeout', 'labexamSettingService', 'showMessage', '$filter'];
function SystemLabexamItemCtrl($mdSidenav, $state, $timeout, labexamSettingService, showMessage, $filter) {
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
    // let timeoutPromise;

    // 初始載入區
    vm.$onInit = function () {
        getAllLabexams();
    };

    function getAllLabexams() {
        // 更改讀取狀態
        vm.loading = true;
        labexamSettingService.get().then((resp) => {
            console.log(resp);
            vm.labexams = resp.data;
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
        vm.showLabexams = [];
    }

    // scroll 至底時呼叫
    vm.loadMore = function () {
        vm.loading = true;
        if (dataEnd || !vm.labexams) {
            vm.loading = false;
            return;
        }
        let lastIndex = vm.showLabexams.length - 1;
        let dataNum;
        // 判斷是否將為資料底
        if ((lastIndex + dataNumOnce) >= vm.labexams.length - 1) {
            dataEnd = true;
            dataNum = vm.labexams.length - lastIndex;
        } else {
            dataNum = dataNumOnce + 1;
        }
        for (let i = 1; i < dataNum; i++) {
            vm.showLabexams.push(vm.labexams[lastIndex + i]);
        }
        vm.loading = false;
    };

    vm.showGender = function showGender(sex) {
        let sGender = '';
        if (sex === 'O') {
            sGender = $translate('customMessage.Common'); // '通用';
        }
        if (sex === 'F') {
            sGender = $translate('customMessage.Female'); // lang.Female;
        }
        if (sex === 'M') {
            sGender = $translate('customMessage.Male'); // lang.Male;
        }
        return sGender;
    };

    // 進入財產編輯頁面
    vm.go = function go(med) {
        $state.go('labexamItemDetail', { id: med.Id });
    };

    // 進入財產新增頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('labexamItemDetail', { id: 'create' });
    };
}

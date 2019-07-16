import tpl from './centeruser.html';
import './centeruserDetail.less';

angular.module('app').component('centeruser', {
    template: tpl,
    controller: CenterUserCtrl,
    controllerAs: 'vm'
});

CenterUserCtrl.$inject = ['$mdSidenav', '$window', '$state', 'centerUserService', 'showMessage'];
function CenterUserCtrl($mdSidenav, $window, $state, centerUserService, showMessage) {
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
        vm.search = 'Normal';

        centerUserService.get().then((resp) => {
            console.log(resp);
            vm.centerusers = resp.data;
            // vm.filterUsers = vm.users;
            // console.log(resp.data);
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage(lang.ComServerError);
        });
    };

    // 切換到編輯CENTER使用者頁面
    vm.gotoUserDetail = function (id) {
        console.log(id);
        $state.go('centeruserDetail', { id });
    };

    // 切換到新增CENTER使用者頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('centeruserDetail', { id: 'create' });
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

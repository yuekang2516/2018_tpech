import tpl from './user.html';
import './userDetail.less';

angular.module('app').component('user', {
    template: tpl,
    controller: SystemUserCtrl,
    controllerAs: 'vm'
});

SystemUserCtrl.$inject = ['$mdSidenav', '$window', '$state', 'userService', 'showMessage', '$filter'];
function SystemUserCtrl($mdSidenav, $window, $state, userService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.isBrowser = cordova.platformId === 'browser';

    // 初始載入區
    vm.$onInit = function onInit() {
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        // 更改讀取狀態
        vm.loading = true;

        userService.get().then((resp) => {
            vm.users = resp.data;
            vm.filterUsers = vm.users;
            // vm.filterUsers = vm.users;
            // console.log(resp.data);
            console.log(vm.filterUsers);
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 切換到編輯使用者頁面
    vm.gotoUserDetail = function (id) {
        $state.go('userDetail', { id });
    };

    // 切換到新增使用者頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('userDetail', { id: 'create' });
    };


    vm.searchUser = function () {
        // debugger;
        if (!vm.loading) {
            if (!vm.search && vm.searchA === '-1' && vm.searchR === '') {
                vm.filterUsers = vm.users;
                return;
            }
            vm.filterUsers = vm.users;
            if (vm.search) {
             vm.filterUsers = vm.filterUsers.filter((item) => {
                 return (item.Name && item.Name.includes(vm.search)) || (item.Account && item.Account.includes(vm.search)) || (item.EmployeeId && item.EmployeeId.includes(vm.search));
             });
             }
             if (vm.searchA !== '-1') {
                 vm.filterUsers = vm.filterUsers.filter((item) => {
                     return (item.Access.toString() === vm.searchA);
                 });
             }
             if (vm.searchR !== '') {
                 vm.filterUsers = vm.filterUsers.filter((item) => {
                     return (item.Role === vm.searchR);
                 });
             }
        }
    };

    // 權限下拉清單選項
    vm.optAccess = [{
        value: -1,
        name: 'ALL'
    },
    {
        value: 1,
        name: $translate('customMessage.AccessNormal') // lang.AccessNormal
    },
    {
        value: 99,
        name: $translate('customMessage.AccessAdmin') // lang.AccessAdmin
    },
    {
        value: 0,
        name: $translate('customMessage.AccessDisable') // lang.AccessDisable
    }
    ];

    // 角色下拉清單選項
    vm.optRole = [{
        value: '',
        name: 'ALL'
    },
    {
        value: 'doctor',
        name: $translate('user.component.role1') // 醫師
    },
    {
        value: 'nurse',
        name: $translate('user.component.role2') // 護理師
    },
    {
        value: 'other',
        name: $translate('user.component.role3') // 其他
    }
    ];

}

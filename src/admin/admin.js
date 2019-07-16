import tpl from './admin.html';
import './admin.less';
import '../app/app.less';

angular.module('app').component('admin', {
    template: tpl,
    controller: AdminCtrl,
    controllerAs: 'admin'
});

AdminCtrl.$inject = ['$state', '$mdSidenav', '$sessionStorage', 'SettingService', 'infoService', 'showMessage', 'LoginService', '$filter'];

function AdminCtrl($state, $mdSidenav, $sessionStorage, SettingService, infoService, showMessage, LoginService, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    vm.importarea = false;

    // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
    vm.ModuleFunctions = SettingService.getModuleFunctions();
    
    if (!LoginService.isLogin()) {
        window.location = '/';
        return;
    }

    vm.currentUser = SettingService.getCurrentUser();

    // 從前端service載入基本資料到暫用的sessionStorage
    $sessionStorage.UserInfo = SettingService.getCurrentUser();
    $sessionStorage.HospitalInfo = SettingService.getCurrentHospital();
    $sessionStorage.HospitalSettings = SettingService.getHospitalSettings();

    vm.currentHospital = SettingService.getCurrentHospital();

    // 需使用最新的 hospital setting，因此要重整
    // 需使用最新的 hospital setting，因此要重整
    infoService.reload().then(() => { }, () => { showMessage($translate('customMessage.serverError')); }); // lang.ComServerError

    vm.isBrowser = cordova.platformId === 'browser';

    // 修改active項目後改變state(切換到其他頁面)
    vm.back = function back() {
        location.href = './index.html';
    };

    vm.gotoProfile = function () {
        location.href = './index.html#/profile';
    };

    vm.openLeftMenu = function openLeftMenu() {
        $mdSidenav('left').toggle();
    };

    vm.openclose = function openclose() {
        vm.importarea = !vm.importarea;
    };
}

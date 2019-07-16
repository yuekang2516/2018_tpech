import stpl from './home.html';
import './home.less';
import '../app/app.less';

angular.module('app').component('home', {
    template: stpl,
    controller: homeCtrl,
    controllerAs: 'home'
});

homeCtrl.$inject = ['$state', '$mdSidenav', '$sessionStorage', 'SettingService', 'infoService', 'showMessage', 'LoginService'];

function homeCtrl($state, $mdSidenav, $sessionStorage, SettingService, infoService, showMessage, LoginService) {
    const vm = this;

    if (!LoginService.isCenterLogin()) {
        window.location = '/center.html';
        return;
    }
    // if (!LoginService.isLogin()) {
    //     $state.go('login', {
    //         location: 'replace'
    //     });
    //     return;
    // }

    vm.currentUser = SettingService.getCurrentUser();

    // 從前端service載入基本資料到暫用的sessionStorage
    $sessionStorage.UserInfo = SettingService.getCurrentUser();
    $sessionStorage.HospitalInfo = SettingService.getCurrentHospital();
    $sessionStorage.HospitalSettings = SettingService.getHospitalSettings();

    vm.currentHospital = SettingService.getCurrentHospital();

    // 需使用最新的 hospital setting，因此要重整
    // 需使用最新的 hospital setting，因此要重整
    infoService.reload().then(() => { }, () => { showMessage(lang.ComServerError); });

    vm.isBrowser = cordova.platformId === 'browser';

    vm.logout = function () {
        LoginService.centerlogout();
    };

    // vm.gotoProfile = function () {
    //     location.href = './index.html#/profile';
    // };

    vm.openLeftMenu = function openLeftMenu() {
        $mdSidenav('left').toggle();
    };
}

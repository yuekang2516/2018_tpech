import homeHtml from './home.html';
import './home.less';

angular.module('app').component('home', {
    template: homeHtml,
    controller: HomeController,
    controllerAs: 'vm'
});

HomeController.$inject = ['$scope', '$mdSidenav', '$rootScope', '$state', 'LoginService', 'SettingService', '$interval', 'notificationService', 'roProcessService', '$window', '$filter'];

function HomeController($scope, $mdSidenav, $rootScope, $state, LoginService, SettingService, $interval, notificationService, roProcessService, $window, $filter) {
    console.log('enter home controller');
    let $translate = $filter('translate');
    const vm = this;
    let interval;

    // 讀取使用者名稱, 顯示在左上角
    vm.currentUser = SettingService.getCurrentUser();

    // 讀取目前醫院
    vm.currentHospital = SettingService.getCurrentHospital();
    // vm.loading = true;
    vm.hideSidenav = false;
    // get the status of the toggle nav
    vm.lockLeft = SettingService.getSideNavStatus(vm.currentUser.Id);

    // listen for emit from child
    $scope.$on('toggleNav', (event, args) => {
        // get the status of the toggle nav
        vm.lockLeft = SettingService.getSideNavStatus(vm.currentUser.Id);
    });

    vm.$onInit = function () {
        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        vm.ModuleFunctions = SettingService.getModuleFunctions();
        // 加入 rootscape 監看式, 最新通知筆數若有異動, 更新 toolbar 上的數字
        $rootScope.$watch('home_notificationCount', () => {
            vm.notificationCount = $rootScope.home_notificationCount;
        });

        $rootScope.$on('roAbnormalCount', (event, count) => {
            console.log('roAbnormalCount', count);
            vm.roAbnormalCount = count;
        });

        if (!angular.isDefined(interval)) {
            interval = $interval(_readNotificationCount, 60000); // 最新通知筆數
        }
        _readNotificationCount();

        // 判斷是否為 ios，以調整畫面 (畫面不被狀態列擋住)
        if (cordova.platformId === 'ios') {
            vm.isIOS = true;
        }

    };

    vm.$onDestroy = function () {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };
    vm.selectIndex = null;

    vm.state = $state.current.name;

    vm.selectListItem = function selectListItem(idx) {
        vm.selectIndex = idx;
    };

    vm.openLeftMenu = function openLeftMenu() {
        $mdSidenav('left').toggle();
    };

    vm.gotoAdmin = function gotoAdmin() {
        location.href = './admin.html';
        $mdSidenav('left').toggle();
    };

    vm.logout = function () {
        LoginService.logout();
    };

    vm.openDashboard = function openDashboard() {
        const url = './dashboard.html'; // 與 app, admin 同層
        // plugin InAppBrowser 在deploy時，會影響原生的 window.open，所以要多加判斷
        if (cordova.InAppBrowser) {
            // cordova
            cordova.InAppBrowser.open(url, '_system', 'location=yes');
            // $window.open(url, '_system', 'location=yes'); // 寫這樣也可以，應該是_blank會衝突
            console.log('cordova browser');
        } else {
            // browser
            $window.open(url, '_blank');
            console.log('一般browser');
        }
    };

    // 取得未讀取的最新通知筆數及未處理的 ro 異常紀錄
    function _readNotificationCount() {
        notificationService.getUnreadCount(SettingService.getCurrentUser().Id).then((q) => {
            // 因改成監聽的方式，直接在 factory 給值，這邊就不需要重給一次
            // vm.notificationCount = q.data.Count;
            // $rootScope.notificationCount = q.data.Count;
        });
    }

    vm.isBrowser = cordova.platformId === 'browser';
}

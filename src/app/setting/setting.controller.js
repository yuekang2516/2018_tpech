angular
    .module('app')
    .controller('SettingController', SettingController);

// angular.module('app').component('setting', {
//   templateUrl: 'setting.html',
//   controller: SettingController,
//   controllerAs: 'vm'
// });

SettingController.$inject = ['$state', 'SettingService', 'showMessage', 'basicSettingService'];
function SettingController($state, SettingService, showMessage, basicSettingService) {
    const vm = this;

    vm.serverUrl = SettingService.getServerUrl();

    vm.save = function () {
        if (vm.serverUrl && vm.serverUrl.substring(0, 7).toLowerCase() !== 'http://') {
            vm.serverUrl = 'http://' + vm.serverUrl;
        }
        // 去掉空白
        vm.serverUrl = vm.serverUrl.replace(/ /g, '');
        
        SettingService.setServerUrl(vm.serverUrl);
        basicSettingService.setServerUrl(vm.serverUrl);
        showMessage('儲存成功');
    };

    vm.back = () => {
        // $state.go('login');
        history.go(-1);
    };
}


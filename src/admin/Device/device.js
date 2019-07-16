import tpl from './device.html';

angular.module('app').component('device', {
    template: tpl,
    controller: SystemDeviceCtrl,
    controllerAs: 'vm'
});

SystemDeviceCtrl.$inject = ['$mdSidenav', '$state', '$stateParams', '$mdToast', 'deviceService', '$filter'];
function SystemDeviceCtrl($mdSidenav, $state, $stateParams, $mdToast, deviceService, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    // ���i��O����I�i�Ӫ�, �ҥH�n�⥪����榬�_��
    // �p�G�O�e�e���I�i�Ӫ�, ���_�ӵL�ҿ�, �e���W�٬O�|�s�b
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };


    deviceService.get('/api/machine').then((list) => {
        vm.devices = list.data;
    }, () => {
        $mdToast.show($mdToast.simple().content($translate('customMessage.serverError')).hideDelay(3000)); // lang.ComServerError
    });
}

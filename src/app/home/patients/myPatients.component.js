const tpl = require('./myPatients.html');

angular.module('app').component('myPatients', {
    template: tpl,
    controller: MyPatientsController,
    controllerAs: 'vm'
});

MyPatientsController.$inject = ['$rootScope', '$state', '$mdSidenav', 'PatientService', 'SettingService'];
function MyPatientsController($rootScope, $state, $mdSidenav, PatientService, SettingService) {
    console.log('enter mypatients controller');
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();

    const vm = this;
    vm.patients = [];

    vm.$onInit = function () {
        // 加入 rootscape 監看式, 最新通知筆數若有異動, 更新 toolbar 上的數字
        $rootScope.$watch('notificationCount', () => {
            vm.notificationCount = $rootScope.notificationCount;
        });

        getMyPatients();
    };

    function getMyPatients() {
        vm.loading = true;
        PatientService.getMyPatients(SettingService.getCurrentUser().Id).then((d) => {
            // 依剩餘時間排序，null代表尚未洗排最上面
            vm.patients = PatientService.orderPatients(d.data);
            vm.isError = false;
        }).catch(() => {
            vm.isError = true;
        }).finally(() => {
            vm.loading = false;
        });
    }

    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.goToDialysis = function (item) {
        $state.go('dialysis', { PatientId: item.Id, obj: item });
    };

    vm.goToPatientListAdd = function (routeName) {
        $state.go(routeName);
    };

    vm.refresh = function () {
        getMyPatients();
    };
}

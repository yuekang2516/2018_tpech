import tpl from './other.html';

angular.module('app').component('other', {
    template: tpl,
    controller: SystemOtherCtrl,
    controllerAs: 'vm'
});

SystemOtherCtrl.$inject = ['$mdSidenav', '$mdToast', '$mdDialog', 'otherService'];
function SystemOtherCtrl($mdSidenav, $mdToast, $mdDialog, otherService) {
    const vm = this;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };


    vm.loading = false;

    vm.clearTags = function clearTags(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        const confirm = $mdDialog.confirm()
            .title('您確定要刪除病人標籤?')
            .content('')
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok('確定')
            .cancel('取消');
        $mdDialog.show(confirm).then(() => {
            vm.loading = true;

            // widas新版已沒有此API
            otherService.put('/api/patient/cleartags/beforetoday').then(() => {
                vm.message = '完成';
                vm.loading = false;
            }, () => {
                vm.message = '失敗';
                vm.loading = false;
            });
        }, () => {
            // do nothing
        });
    };
}

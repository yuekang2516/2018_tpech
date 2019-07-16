import tpl from './bedsContent.html';
import summaryTpl from '../../dashboard/summaryContentDialog/summaryContentDialog.html';

angular.module('app').component('bedsContent', {
    template: tpl,
    controller: bedsContentController,
    controllerAs: 'vm',
    bindings: {
        data: '<',
        readonly: '<'
    }
});

bedsContentController.$inject = ['$filter', '$scope', '$state', 'bedService', '$mdDialog', 'SessionStorageService'];
function bedsContentController($filter, $scope, $state, bedService, $mdDialog, SessionStorageService) {
    const self = this;
    self.shifts = bedService.getShifts();    // 目前排床的班別名稱
    let $translate = $filter('translate');

    self.gotoPatient = function gotoPatient(patient) {
        if (!self.readonly) {
            SessionStorageService.setItem('homeStateName', 'beds'); // 紀錄由今日床位到summary，由summary返回上一頁時要回到今日床位
            $state.go('summary', { patientId: patient.PatientId });
        } else {
            // show summaryContent dialog for 電子白板
            $mdDialog.show({
                controller: 'summaryContentCtrl',
                controllerAs: '$ctrl',
                locals: {
                    patientId: patient.PatientId
                },
                bindToController: true,
                template: summaryTpl,
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false
            });
        }
    };

}

import tpl from './dialysisPrescription.html';

angular.module('app').component('dialysisPrescription', {
    template: tpl,
    controller: dialysisPrescriptionCtrl,
    bindings: {
        data: '=',
        prescriptionLength: '<',
    }
});

dialysisPrescriptionCtrl.$inject = [];
function dialysisPrescriptionCtrl(dialysisService) {
    const self = this;
    self.dialysisHeader = self.data;
    console.log('dialysisPrescriptionCtrl', self.dialysisHeader);
}

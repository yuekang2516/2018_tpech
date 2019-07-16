import tpl from './patientName.html';

/*
    name: 要顯示的病人姓名 ( < 單向綁定)
    medicalId: 病人編號 ( < 單向綁定)
*/

angular
    .module('app')
    .component('patientName', {
    template: tpl,

    bindings: {
        name: '<',
        medicalId: '<'
    }

});

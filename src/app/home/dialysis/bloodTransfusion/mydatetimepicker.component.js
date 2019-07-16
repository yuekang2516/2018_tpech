import tpl from './mydatetimepicker.html';

angular.module('app').component('mydatetimepicker', {
    template: tpl,
    bindings: {
        tag: '<',
        date: '<',
        dateTitle: '<',
        timeTitle: '<'
    },
    controller: function () {
        console.log('enter patient tag component');
    }
});

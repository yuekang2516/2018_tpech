
(function () {
    'use strict';

    let tpl = require('./loading.html');

    angular
        .module('app')
        .component('loading', {
            template: tpl,
        });

})();

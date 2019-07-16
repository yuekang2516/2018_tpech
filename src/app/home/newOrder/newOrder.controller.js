
(function () {
    'use strict';

    angular
        .module('app')
        .controller('customController', ['$scope', customController]);

    function customController($scope) {
        var vm = this;

        vm.title = '';

        activate();

        function activate() { }
    }
})();

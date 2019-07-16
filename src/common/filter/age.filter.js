
(function () {
    'use strict';

    angular.
        module('app').
        filter('age', function () {
            return function (birthday) {
                return ((new Date()).getFullYear() - moment(birthday).year());
            };
        });

})();

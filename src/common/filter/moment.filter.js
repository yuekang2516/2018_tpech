
(function () {
    'use strict';

    angular.
        module('app').
        filter('moment', function () {
            return function (date, format) {
                if (date) {
                    return moment(date).format(format);
                }
            };
        });

})();

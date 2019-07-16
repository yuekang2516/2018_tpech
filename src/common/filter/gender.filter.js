
(function () {
    'use strict';

    angular.
        module('app').
        filter('gender', ['$sce', function ($sce) {
            return function (gender) {
                if (gender && (gender.toLowerCase() === 'f' || gender.toLowerCase() === 'female' || gender.toLowerCase() === "女")) {
                    return $sce.trustAsHtml('女');
                } else {
                    return $sce.trustAsHtml('男');
                }
            };
        }]);

})();

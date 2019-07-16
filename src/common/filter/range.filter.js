(function () {
    'use strict';

    angular.
        module('app').
        filter('range', function () {
            return function (input, total, startIndex) {
                // console.log(input, total, startIndex);
                total = parseInt(total);

                for (let i = startIndex; i <= total; i++) {
                    input.push(i);
                }

                return input;
            };
        });
})();

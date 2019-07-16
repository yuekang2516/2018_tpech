
(function () {
    'use strict';

    angular
        .module('app')
        .factory('WardService', ['$q', '$http', 'SettingService', WardService]);

    function WardService($q, $http, SettingService) {
        var service = {
            getById: getById
        };

        function getById(id) {
            const deferred = $q.defer();
            $http({
                method: 'GET',
                url: SettingService.getServerUrl() + '/api/Ward/' + id
            }).then((res) => {
                deferred.resolve(res);
            }, (res) => {
                deferred.reject(res);
            });

            return deferred.promise;
        }

        return service;
    }
})();

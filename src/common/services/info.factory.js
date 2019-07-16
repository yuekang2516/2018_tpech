import dialysisinfo from '../fakeData/info/ApiDialysisInfoGet.fake.json';

infoService.$inject = ['SettingService', '$http', '$q'];

function infoService(SettingService, $http, $q) {
    const rest = {};

    rest.get = function get() {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisinfo, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisinfo, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisinfo`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.put = function put(user) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/dialysisinfo`,
            data: user
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.reload = function reload() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisinfo/formatLogin`
        }).then((res) => {
            SettingService.setHospitalSettings(res.data);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('infoService', infoService);

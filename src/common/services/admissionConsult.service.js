// fake data
import admissionConsult from '../fakeData/admissionConsult/admissionConsult.fake.json';

angular.module('app').factory('admissionConsultService', admissionConsultService);
admissionConsultService.$inject = ['SettingService', '$http', '$q', '$rootScope'];
function admissionConsultService(SettingService, $http, $q, $rootScope) {

    const rest = {};

    rest.get = function get() {
        const deferred = $q.defer();
        // if (SettingService.checkDemoModeAndGetDataAsync(admissionConsult, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(admissionConsult, deferred);
        // }
        return deferred.promise;
    };
    return rest;
}

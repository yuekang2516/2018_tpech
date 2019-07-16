angular.module('app').factory('labexamSettingService', labexamSettingService);

labexamSettingService.$inject = ['SettingService', '$http', '$q'];

function labexamSettingService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    rest.get = function get() {
        // 先處理url
        let serverUrl = `${SettingService.getServerUrl()}/api/LabExamSetting/list`;

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: serverUrl
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/LabExamSetting/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.post = function post(labexam) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/LabExamSetting`,
            data: labexam
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.put = function put(labexam) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/LabExamSetting`,
            data: labexam
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.delete = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/LabExamSetting/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

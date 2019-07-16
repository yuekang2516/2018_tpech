angular.module('app').factory('capdTrainingService', capdTrainingService);

capdTrainingService.$inject = ['$http', '$q', 'SettingService'];

function capdTrainingService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getList
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/CAPD_Patient_Training/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(putData) {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putData,
            url: `${serverApiUrl}/api/CAPD_Patient_Training/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOne(id) {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop
        console.log("WT DEBUG serverApiUrl", serverApiUrl);

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/CAPD_Patient_Training/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getList() {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/CAPD_Patient_Training/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return service;
}

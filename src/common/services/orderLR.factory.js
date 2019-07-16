angular.module('app').factory('orderLRService', orderLRService);

orderLRService.$inject = ['$http', '$q', 'SettingService'];

function orderLRService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getList,
        getListByPatientID
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop  http://localhost:53495

        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Tracking_MED_Exhort_Long/CreateNew`
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
            url: `${serverApiUrl}/api/Tracking_MED_Exhort_Long/Update`
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
            url: `${serverApiUrl}/api/Tracking_MED_Exhort_Long/GetOne?Id=${id}`
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
            url: `${serverApiUrl}/api/Tracking_MED_Exhort_Long/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    
    function getListByPatientID(Patientid) {
        serverApiUrl = "http://118.163.208.29:9007"; // For Develop
        console.log("WT DEBUG serverApiUrl", serverApiUrl);
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Tracking_MED_Exhort_Long/GetListByPatientid?Patientid=${Patientid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    return service;
}

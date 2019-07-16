angular.module('app').factory('selfCareService', selfCareService);

selfCareService.$inject = ['$http', '$q', 'SettingService'];

function selfCareService($http, $q, SettingService) {
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

        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,                                  
            url: `${serverApiUrl}/api/Patient_Selfcare_Evaluate/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(putData) {     
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putData,
            url: `${serverApiUrl}/api/Patient_Selfcare_Evaluate/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOne(id) {        
        console.log("WT DEBUG serverApiUrl", serverApiUrl);

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Patient_Selfcare_Evaluate/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getList() {        
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Patient_Selfcare_Evaluate/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    
    function getListByPatientID(Patientid,spiltMax = 0,pageNo = 0,Status = "") {
        
        console.log("WT DEBUG serverApiUrl", serverApiUrl);
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Patient_Selfcare_Evaluate/GetListByPatientid?Patientid=${Patientid}&spiltMax=${spiltMax}&pageNo=${pageNo}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    return service;
}

angular.module('app').factory('peritonitisService', peritonitisService);

peritonitisService.$inject = ['$http', '$q', 'SettingService'];

function peritonitisService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getAll,
        getInfectionRecord,
        getGermsByInfectionId,
        postGerm,
        putGerm
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Infection_Record_All/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/Infection_Record_All/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    function getOne(Id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Infection_Record_All/GetOne?Id=${Id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    function getAll() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Infection_Record_All/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getInfectionRecord(medicalId,Status = "") {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Infection_Record_All/GetInfectionRecord?Infection_Category=PERITONITIS&MedicalId=${medicalId}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getGermsByInfectionId(infectionId,Status = "") {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Infection_Germs_Record/GetListByInfectionRecordId?InfectionRecordId=${infectionId}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 新增
    function postGerm(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Infection_Germs_Record/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function putGerm(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/Infection_Germs_Record/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return service;
}

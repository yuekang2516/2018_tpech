angular.module('app').factory('pdTreatService', pdTreatService);

pdTreatService.$inject = ['$http', '$q', 'SettingService'];

function pdTreatService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getList,
        getLastList,
        postPotions,
        putPotions,
        getPotions,
        postDetail,
        putDetail,
        getDetailList,
        GetListByDateRange,
        getListByPatientDateRange
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Treatment_Prescription/CreateNew`
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
            url: `${serverApiUrl}/api/Treatment_Prescription/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOne(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Treatment_Prescription/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getList(ptId,Status = "") {
        // serverApiUrl = "http://118.163.208.29:9007"; // For Develop
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Treatment_Prescription/GetListByPatientid?Patientid=${ptId}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getLastList(ptId) {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Treatment_Prescription/GetLastOneByPatientid?Patientid=${ptId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
           deferred.reject(res);
        });

        return deferred.promise;
    }

    function GetListByDateRange(startTime,endTime,Status=""){
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Treatment_Prescription/GetListByDateRange?startTime=${startTime}&endTime=${endTime}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
           deferred.reject(res);
        });
        return deferred.promise;
    }

    function getListByPatientDateRange(startTime, endTime, ptId, Status="Normal"){
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Treatment_Prescription/GetListByDateRange?startTime=${startTime}&endTime=${endTime}&patientid=${ptId}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
           deferred.reject(res);
        });
        return deferred.promise;
    }

    // 新增
    function postPotions(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Potions_Used_Record/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function putPotions(putData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putData,
            url: `${serverApiUrl}/api/Potions_Used_Record/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getPotions(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Potions_Used_Record/GetListByPrescriptionid?Prescriptionid=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    // Detail 新增
    function postDetail(postDetailData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postDetailData,
            url: `${serverApiUrl}/api/Liquid_Exchange_Record/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }
    // Detail 瀏覽
    function getDetailList(PrescriptionID,Status = "") {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Liquid_Exchange_Record/GetListByPrescriptionid?Prescriptionid=${PrescriptionID}&Status=${Status}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    // Detail 修改
    function putDetail(putDetailData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putDetailData,
            url: `${serverApiUrl}/api/Liquid_Exchange_Record/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    return service;
}

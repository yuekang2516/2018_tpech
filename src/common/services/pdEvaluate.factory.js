angular.module('app').factory('pdEvaluateService', pdEvaluateService);

pdEvaluateService.$inject = ['$http', '$q', 'SettingService'];

function pdEvaluateService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getList
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        // serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Peritoneal_Evaluation_Record/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(putData) {
        // serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putData,
            url: `${serverApiUrl}/api/Peritoneal_Evaluation_Record/Update`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOne(id) {
        // serverApiUrl = "http://118.163.208.29:9007"; // For Develop
        
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Peritoneal_Evaluation_Record/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getList(ptId) {
        // serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Peritoneal_Evaluation_Record/GetListByPatientid?Patientid=${ptId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
           deferred.reject(res);
        });

        // let res = {};
        // let fakeData = {};
        // fakeData.Recorddate = new Date();
        // fakeData.Pet_H = "High";
        // fakeData.Kt_V_Total = "1234";
        // fakeData.Kt_V_P = "1234";
        // fakeData.Kt_V_R = "1234";
        // fakeData.Wcc_Total = "1234";
        // fakeData.Wcc_P = "1234";
        // fakeData.Wcc_R = "1234";
        // fakeData.Npcr = "1234";

        // res.data = [];
        // res.data.push(fakeData);
        // deferred.resolve(res);


        return deferred.promise;
    }

    return service;
}

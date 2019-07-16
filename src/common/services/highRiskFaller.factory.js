angular.module('app').factory('highRiskFallerService', highRiskFallerService);

highRiskFallerService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function highRiskFallerService($http, $q, $rootScope, SettingService) {
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
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop  http://localhost:53495

        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/High_Risk_Group_Faller/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('highRiskFaller-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(putData) {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: putData,
            url: `${serverApiUrl}/api/High_Risk_Group_Faller/Update`
        }).then((res) => {
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('highRiskFaller-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOne(id) {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop
        console.log("WT DEBUG serverApiUrl", serverApiUrl);

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/High_Risk_Group_Faller/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getList() {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/High_Risk_Group_Faller/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getListByPatientID(Patientid, headerId, sysType) {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/High_Risk_Group_Faller/GetListByPatientid?Patientid=${Patientid}&Header_Id=${headerId}&Sys_Type=${sysType}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        // let res = {};
        // let fakeData = {};
        // fakeData.Record_Date = new Date();
        // fakeData.Age_Over_65 = "Y";
        // fakeData.Have_Fallen_Before = "N";
        // fakeData.Can_Not_Walk_Myself = "N";
        // fakeData.Limb_Dysfunction = "N";
        // fakeData.Unconsciousness_Or_MCI = "Y";
        // fakeData.Malnutrition_Or_Dizziness = "N";
        // fakeData.Percent25_Anemia_Hct = "Y";
        // fakeData.Blood_Pressure_Instability = "N";
        // fakeData.Blurred_Vision_Or_Blindness = "N";
        // fakeData.Take_Drugs_Affect_Conscious = "N";
        // fakeData.Total = "3";

        // res.data = [];
        // res.data.push(fakeData);
        // deferred.resolve(res);

        return deferred.promise;
    }


    return service;
}

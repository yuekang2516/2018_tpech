angular.module('app').factory('vtPhoneService', vtPhoneService);
 
vtPhoneService.$inject = ['$http', '$q', 'SettingService'];

function vtPhoneService($http, $q, SettingService) {
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
            url: `${serverApiUrl}/api/Tracking_Med_Exhort_Temp/CreateNew`
        }).then((res) => {
            deferred.resolve(res);
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
            url: `${serverApiUrl}/api/Tracking_Med_Exhort_Temp/Update`
        }).then((res) => {
            deferred.resolve(res);
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
            url: `${serverApiUrl}/api/Tracking_Med_Exhort_Temp/GetOne?Id=${id}`
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
            url: `${serverApiUrl}/api/Tracking_Med_Exhort_Temp/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    
    function getListByPatientID(Patientid) {
        //serverApiUrl = "http://118.163.208.29:9007"; // For Develop

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Tracking_Med_Exhort_Temp/GetListByPatientid?Patientid=${Patientid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        // let res = {};
        // let fakeData = {};
        // fakeData.Visit_Method = "Visit_Phone";
        // fakeData.Record_Date = new Date();
        // fakeData.Disease_Diagnosis = "text";
        // fakeData.Patient_History = "text";
        // fakeData.Visit_Doctor_Advice = "text";
        // fakeData.Catheter_Skin_Assessment = "text";
        // fakeData.Catheter_Infection = "text";
        // fakeData.Catheter_Wound = "text";
        // fakeData.Assessment_Edema = "text";
        // fakeData.Assessment_Skin_Condition = "2019-04-29";
        // fakeData.Assessment_Thoracic_Cavity = "text";
        // fakeData.Assessment_Muscles = "text";
        // fakeData.Assessment_Stomach = "text";
        // fakeData.Daily_Assessment_Dietary_Info = "text";
        // fakeData.Daily_Assessment_Exercise = "text";
        // fakeData.Daily_Assessment_Dietary = "text";
        // fakeData.Daily_Assessment_Dietary2 = "text";

        // res.data = [];
        // res.data.push(fakeData);
        //deferred.resolve(res);

        return deferred.promise;
    }


    return service;
}

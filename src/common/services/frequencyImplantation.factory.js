angular.module('app').factory('frequencyImplantationService', frequencyImplantationService);

frequencyImplantationService.$inject = ['$http', '$q', 'SettingService'];

function frequencyImplantationService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getAll,
        GetListByPatientid,
        GetLastOneByPatientid,
        GetDialysisInfo
    };
    let serverApiUrl = SettingService.getServerUrl();
    
    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Peritoneal_Dialysis_History/CreateNew`
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
            url: `${serverApiUrl}/api/Peritoneal_Dialysis_History/Update`
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
            url: `${serverApiUrl}/api/Peritoneal_Dialysis_History/GetAll`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function GetListByPatientid(Patientid) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Peritoneal_Dialysis_History/GetListByPatientid?Patientid=${Patientid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        // let res = {};
        // let fakeData = {};        
        // fakeData.Id = "5cde24f640dd7126a43822w2";
        // fakeData.Patientid = "cc1723d2e27663c2428a80e";
        // fakeData.Frequency_Implantation = 1;
        // fakeData.Catheter_Implantation_Date = new Date();
        // fakeData.Catheter_Type = "測試用";
        // fakeData.Doctor_Name = "text";
        // fakeData.Anesthesia_Mode = "全身";
        // fakeData.Operative_Method = "text";
        // fakeData.Catheter_Outlet = "text";
        // fakeData.Catheter_Type = "text";
        // fakeData.Early_Complications_Surgery = "text";
        // fakeData.Pd_Date = new Date();
        // fakeData.Liquid_Exchange_System = "text";
        // fakeData.Pet_Date = new Date();
        // fakeData.Pet_Results = "text";
        // fakeData.Treatment_Termination_Date = new Date();
        // fakeData.Termination_Reasons = "text";
        // fakeData.Extubation_Date = new Date();
        // fakeData.Transhemodialysis_Reasons = "text";
        // fakeData.Death_Reasons = "text";
        // fakeData.CreatedTime = new Date();
        // fakeData.CreatedUserId = "Test";
        // fakeData.CreatedUserName = "Test";
        // fakeData.ModifiedTime = new Date();
        // fakeData.ModifiedUserId = "Swagger";
        // fakeData.ModifiedUserName = "Swagger";
        // res.data = [];
        // res.data.push(fakeData);
        // deferred.resolve(res);

        return deferred.promise;
    }
    
    function GetLastOneByPatientid(Patientid) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Peritoneal_Evaluation_Record/GetLastOneByPatientid?Patientid=${Patientid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }
    
    function GetDialysisInfo() {
        //http://dialysissystem.azurewebsites.net
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/DialysisInfo`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }


    return service;
}

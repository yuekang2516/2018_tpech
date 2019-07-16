angular.module('app').factory('PatientFromColumnService', PatientFromColumnService);

PatientFromColumnService.$inject = ['$http', '$q', 'SettingService'];

function PatientFromColumnService($http, $q, SettingService) {
    const service = {
        post,
        put,
        getOne,
        getAllByFromId
    };
    let serverApiUrl = SettingService.getServerUrl();

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/Patient_From_Column/CreateNew`
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
            url: `${serverApiUrl}/api/Patient_From_Column/Update`
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
            url: `${serverApiUrl}/api/Patient_From_Column/GetOne?Id=${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getAllByFromId(FrmId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Patient_From_Column/GetListByFormId?FormId=${FrmId}`
        }).then((res) => {
            // let fakeData = {};
            // fakeData.Record_Date = new Date();
            // fakeData.Body_Weight = "80";
            // fakeData.Dialysate_Weight = "1234";
            // fakeData.Clothes_Weight = "1234";
            // fakeData.Wheelchair_weight = "1234";
            // fakeData.Net_body_weight = "1234";
            // fakeData.Blood_Pressure = "1234";
            // fakeData.Temperature = "36";
            // fakeData.catheter_outlet_evaluate = "正常";
            // fakeData.catheter_outlet_times = 1;
            // fakeData.Secretion_YN = "Y";
            // fakeData.Secretion_trait = "膿性";
            // fakeData.Secretion_colour = "無色";
            // fakeData.Secretion_volume = "少";
            // fakeData.Description_infection_status = "紅";
            // fakeData.fluid_eval_properties = "清澈";
            // fakeData.fluid_eval_avg_dehydrate = "1234";
            // fakeData.fluid_eval_times = 1;
            // fakeData.fluid_eval_color = "淡黃色";
            // fakeData.Edema_eval_degree = "無";
            // fakeData.Edema_eval_site = "全身";
            // fakeData.Respiratory_status_evaluate = "胸悶";
            // fakeData.Skin_eval_appearance = "正常";
            // fakeData.Skin_eval_color = "發紅";
            // fakeData.Skin_eval_complete = "是";
            // fakeData.Skin_eval_completeness = "破皮";
            // fakeData.Skin_eval_damaged_site = "全身";
            // fakeData.High_Risk_Fall_Eval_Score = "1234";
            // fakeData.GI_eval_appetite = "不佳";
            // fakeData.GI_eval_excretion = "正常";
            // fakeData.Self_Guid_Catheter_YN = "Y";
            // fakeData.Self_Guid_Catheter = "保持乾燥";
            // fakeData.Self_Guid_Fluid_Check_YN = "Y";
            // fakeData.Self_Guid_Fluid_Check = "1234";
            // fakeData.Self_Guid_water_ctrl_YN = "Y";
            // fakeData.Self_Guid_water_ctrl = "1234";
            // fakeData.Self_Guid_Diet_YN = "Y";
            // fakeData.Self_Guid_Diet = "高蛋白";
            // fakeData.Self_Guid_DailyLife_YN = "Y";
            // fakeData.Self_Guid_DailyLife = "預防跌倒";
            // fakeData.Self_Guid_Record_Book_eval_YN = "Y";
            // fakeData.Self_Guid_Record_Book_eval = "病人未記錄";
            // fakeData.Self_Guid_Immediate_Treatment = "text";
            // fakeData.Self_Guid_Other = "text";
            // fakeData.Nursing_Records = "text";

            // res.data.push(fakeData);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return service;
}

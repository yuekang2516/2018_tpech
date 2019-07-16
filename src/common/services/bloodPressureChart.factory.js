angular.module('app').factory('bloodPressureChartService', bloodPressureChartService);

bloodPressureChartService.$inject = ['SettingService', '$http', '$q'];

function bloodPressureChartService(SettingService, $http, $q) {
    const rest = {};
    // const serverApiUrl = SettingService.getServerUrl();

    // 血壓趨勢圖資料
    rest.getBloodPressureChartData = function getBloodPressureChartData(patientId, dialysisTime, currentLanguage) {
        const deferred = $q.defer();

        // fake data
        // const serviceData = {};
        // serviceData.data = {
        //     "TodayBPS": -0.001282051282051282,
        //     "MaxBPS": 0.0000032064470419790957,
        //     "MinBPS": 0, // 0, -0.0055272064470419790957
        //     "TodayBPD": -0.007653457653457653,
        //     "MaxBPD": 0.00285714285714285,
        //     "MinBPD": -0.004119850187265918,
        //     "TodayVitalsignValues": [
        //         { "DialysisTime": "2018-09-28T03:10:00Z", "BPD": "112", "BPS": "133" },
        //         { "DialysisTime": "2018-09-28T03:50:00Z", "BPD": "90", "BPS": "120" },
        //         { "DialysisTime": "2018-09-28T03:40:00Z", "BPD": "101", "BPS": "132" }
        //     ],
        //     "AllVitalsignValues": [
        //         { "DialysisTime": "2018-08-28T07:18:00Z", "BPD": "111", "BPS": "222" }
        //     ]
        // };
        // deferred.resolve(serviceData);

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/GetSlopeByPatientId/${patientId}?sDate=${dialysisTime}&type=${currentLanguage}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };


    return rest;
}


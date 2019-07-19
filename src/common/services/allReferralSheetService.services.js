
import referralSheetGetByPatientId from '../fakeData/allReferralSheet/ApiReferralSheetGetByPatientId.fake.json';
// import referralSheetGetLastDialysisRecordByPatientId from '../fakeData/allReferralSheet/ApiReferralSheetGetLastDialysisRecordByPatientId.fake.json';
// import referralSheetLabexamCheck from '../fakeData/allReferralSheet/ApiReferralSheetLabexamCheck.fake.json';
// import referralSheetLabexamCheckHospital from '../fakeData/allReferralSheet/ApiReferralSheetLabexamCheckHospital.fake.json';

// import referralSheetDrugCheckHospital from '../fakeData/allReferralSheet/ApiReferralSheetDrugCheckHospital.fake.json';
// import referralSheetSurgeryCheckHospital from '../fakeData/allReferralSheet/ApiReferralSheetSurgeryCheckHospital.fake.json';

// import { $IsStateFilter } from 'angular-ui-router/lib/stateFilters';

angular.module('app').factory('ReferralSheetService', ReferralSheetService);

ReferralSheetService.$inject = ['$http', '$q', '$rootScope', 'SettingService', '$timeout', '$sessionStorage'];

function ReferralSheetService($http, $q, $rootScope, SettingService, $timeout, $sessionStorage) {
    const rest = {
        getByPatientId,
        getByHeaderId,
        getByReferralId,
        post,
        put,
        del,
        getLastAccessTime,
        getLastDialysisHeaderByPatientId,
        getLabExam,
        getLastDialysisRecordByPatientId,
        getLastLabDataByPatientId,
        getComorbidityList,
        setReferralSheetData,
        getReferralSheetData,
        getCheckedData, // getCheckedLabexamData
        setCheckedData, // setCheckedLabexamData
        getSurgeryCheckItems,
        getLabCheckItems,
        getDrugCheckItems,
        getAverageBloodPressure
    };
    const serverApiUrl = SettingService.getServerUrl();
    // const user = SettingService.getCurrentUser();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    // let lastRecords = [];
    let lastAccessTime = new Date();
    // let lastDialysisId = '';
    // let lastAllRecords = [];
    // let lastAllDialysisId = ''

    // 依 病患ID 取得 ReferralSheet 資料
    function getByPatientId(id) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred);
        // }
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/MedicalRecordSummary/PateintId/${id}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                // lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 用表頭Id 取得單筆 PatientIssuesRecord 資料
    function getByHeaderId(id) {

        const deferred = $q.defer();
        // let referralSheetGetByPatientIdFind = referralSheetGetByPatientId.find((item) => {
        //     return item.Id === id;
        // });
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientIdFind, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientIdFind, deferred);
        // }

        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/ReferralSheet/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 取得上次使用時間
    function getLastAccessTime() {
        return lastAccessTime;
    }


    // 用表頭Id 取得單筆 PatientIssuesRecord 資料
    function getByReferralId(id) {

        const deferred = $q.defer();
       
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/MedicalRecordSummary/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 新增
    function post(postData) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred);
        // }
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/MedicalRecordSummary`
        }).then((res) => {
            // lastRecords.push(res.data);
            $rootScope.$emit('referralSheet');

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(referralSheetGetByPatientId, deferred);
        // }
        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/MedicalRecordSummary`
        }).then((res) => {

            $rootScope.$emit('referralSheet');
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            // if (lastRecords) {
            //     for (let i = 0; i < lastRecords.length; i++) {
            //         if (lastRecords[i].Id === postData.Id) {
            //             lastRecords[i] = postData;
            //         }
            //     }
            // }

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 刪除
    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${serverApiUrl}/api/MedicalRecordSummary/${id}`
        }).then((res) => {

            $rootScope.$emit('referralSheet');
            // for (let i = 0; i < lastRecords.length; i += 1) {
            //     if (lastRecords[i].Id === id) {
            //         lastRecords[i].Status = 'Deleted';
            //         break;
            //     }
            // }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }


    //  用病患ID 取得最後一次的透析表單  DialysisHeader
    function getLastDialysisHeaderByPatientId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/dialysisheader/getLastByPatientId/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 用病患ID 取得最後一次的檢驗值
    function getLabExam(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/LabExam/patient/${id}/referralsheet`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    //  用病患ID 取得最後一次的  DialysisRecord
    function getLastDialysisRecordByPatientId(id) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(referralSheetGetLastDialysisRecordByPatientId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(referralSheetGetLastDialysisRecordByPatientId, deferred);
        // }

        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/dialysisrecord/getLast/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 取得所有labexam，各項的最後一筆
    function getLastLabDataByPatientId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/LabExam/getLastLabDataByPatientId/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;

    }

    // 取得共病選項，尚未有Api
    function getComorbidityList() {
        const deferred = $q.defer();

        let listObj = {
            '1': '共病選項 1',
            '2': '共病選項 2',
            '3': '共病選項 3'
        };

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(listObj, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listObj, deferred);
        // }

        // $http({
        //     method: 'GET',
        //     url: `${serverApiUrl}/api/LabExam/getLastLabDataByPatientId/${id}`
        // }).then((res) => {
        //     deferred.resolve(res);
        // }, (res) => {
        //     deferred.reject(res);
        // });

        return deferred.promise;
    }

    // Ditto 病歷摘要複製data
    function setReferralSheetData(data) {
        $sessionStorage.referralSheetData = data;
    }
    function getReferralSheetData() {
        return $sessionStorage.referralSheetData;
    }

    // 病摘勾選單資料 CheckedData
    function setCheckedData(whichData, data) {
        // whichData
        // 檢驗報告 labexam
        // 用藥明細 drug
        // 手術歷程 surgery
        if (!$sessionStorage.referralCheckedData) {
            $sessionStorage.referralCheckedData = {};
        }
        $sessionStorage.referralCheckedData[whichData] = data;
    }
    function getCheckedData() {
        return $sessionStorage.referralCheckedData;
    }

    // 取得病人的所有的 用藥明細 資料
    function getSurgeryCheckItems(startDate, endDate) {
        const deferred = $q.defer();

        // TODO: 要給 起始日 結束日 referralSheetSurgeryCheckHospital
        // TODO: demo timeout最後要拿掉 referralSheetSurgeryCheckHospital
        // $timeout(() => {
        //     if (SettingService.checkDemoModeAndGetDataAsync(referralSheetSurgeryCheckHospital, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(referralSheetSurgeryCheckHospital, deferred);
        //     }
        // }, 1000);
        // $http({
        //     method: 'GET',
        //     url: `${serverApiUrl}/api/LabExam/getLastLabDataByPatientId/${id}`
        // }).then((res) => {
        //     deferred.resolve(res);
        // }, (res) => {
        //     deferred.reject(res);
        // });
        return deferred.promise;
    }

    // 取得病人的所有的檢驗資料
    function getLabCheckItems(startDate, endDate) {
        const deferred = $q.defer();

        // TODO: 要給 起始日 結束日 referralSheetLabexamCheck
        // TODO: demo timeout最後要拿掉 referralSheetLabexamCheckHospital
        // $timeout(() => {
        //     if (SettingService.checkDemoModeAndGetDataAsync(referralSheetLabexamCheckHospital, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(referralSheetLabexamCheckHospital, deferred);
        //     }
        // }, 1000);
        // $http({
        //     method: 'GET',
        //     url: `${serverApiUrl}/api/LabExam/getLastLabDataByPatientId/${id}`
        // }).then((res) => {
        //     deferred.resolve(res);
        // }, (res) => {
        //     deferred.reject(res);
        // });
        return deferred.promise;
    }

    // 取得病人的所有的 用藥明細 資料
    function getDrugCheckItems(startDate, endDate) {
        const deferred = $q.defer();

        // TODO: 要給 起始日 結束日 referralSheetDrugCheckHospital
        // TODO: demo timeout最後要拿掉 referralSheetDrugCheckHospital
        // $timeout(() => {
        //     if (SettingService.checkDemoModeAndGetDataAsync(referralSheetDrugCheckHospital, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(referralSheetDrugCheckHospital, deferred);
        //     }
        // }, 1000);

        // $http({
        //     method: 'GET',
        //     url: `${serverApiUrl}/api/LabExam/getLastLabDataByPatientId/${id}`
        // }).then((res) => {
        //     deferred.resolve(res);
        // }, (res) => {
        //     deferred.reject(res);
        // });
        return deferred.promise;
    }

    // // 檢驗報告 data
    // function setCheckedLabexamData(data) {
    //     $sessionStorage.checkedLabexamData = data;
    // }
    // function getCheckedLabexamData() {
    //     return $sessionStorage.checkedLabexamData;
    // }

    
    // 取得透析前後血壓 xx天平均值
    function getAverageBloodPressure(patientId, baseTime, days) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/MedicalRecordSummary/getAverage/${patientId}/${baseTime}/${days}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    
    return rest;
}

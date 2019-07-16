import doctorNotePatientByIdByPageGet from '../fakeData/doctorNote/ApiDoctorNotePatientByIdByPageGet.fake.json';

angular.module('app').factory('DoctorNoteService', DoctorNoteService);

DoctorNoteService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function DoctorNoteService($http, $q, $rootScope, SettingService) {
    const rest = {
        getById,
        getLastAccessTime,
        put,
        post,
        getByIdPage,
        del,
        getByHeaderId
    };
    const serverApiUrl = SettingService.getServerUrl();
    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    let lastAllRecords = [];
    let lastPatientId = '';


    function getById(id, isForce) {
        const deferred = $q.defer();
        let doctorNotePatientByIdByPageGetfilter = doctorNotePatientByIdByPageGet.Results.find((item) => {
            return item.Id === id;
        });
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGetfilter, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGetfilter, deferred);
        // }

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
        lastDialysisId = id;
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/doctorNote/${id}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 取得最後取得資料的時間
    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred);
        // }

        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/doctorNote`
        }).then((res) => {
            if (lastRecords) {
                for (let i = 0; i < lastRecords.length; i++) {
                    if (lastRecords[i].Id === postData.Id) {
                        lastRecords[i] = postData;
                    }
                }
            }
            deferred.resolve(res);
            // broadcast when data has changed
            $rootScope.$broadcast('doctornote_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred);
        // }
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/doctorNote`
        }).then((res) => {
            lastRecords.push(res.data);
            deferred.resolve(res);
            // broadcast when data has changed
            $rootScope.$broadcast('doctornote_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 依病人代碼及頁碼取得護理記錄 , GET /api/DoctorNote/patient/{id}/{page}
    function getByIdPage(id, page, limit, isForce) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(doctorNotePatientByIdByPageGet, deferred);
        // }

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            lastRecords = [];
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/DoctorNote/patient/${id}/${page}?limit=${limit}`
        }).then((res) => {
            // if (res.data) {
            //     lastAccessTime = Date.now();
            //     // 以 RecordTime 排序，若相同再以 CreatedTime 比
            //     res.data.Results = _.orderBy(res.data.Results, ['RecordTime', 'CreatedTime'], ['desc', 'desc']);

            //     // 歷次護理暫存
            //     if (lastRecords.length > 0 && lastPatientId === id) {
            //         if (page > lastPage) {
            //             lastRecords = lastRecords.concat(res.data.Results);
            //         }
            //         lastPage = page;
            //         res.data.Results = lastRecords;
            //     } else {
            //         lastRecords = res.data.Results;
            //         lastPatientId = id;
            //     }
            // }
            lastAccessTime = Date.now();
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
            url: `${SettingService.getServerUrl()}/api/DoctorNote/${id}`
        }).then((res) => {
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
            // broadcast when data has changed
            $rootScope.$broadcast('doctornote_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }


    // for 病歷摘要，先取得所有doctorNote
    function getByHeaderId(headerId) {
        const deferred = $q.defer();
       
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/DoctorNote/dialysis/${headerId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    return rest;
}

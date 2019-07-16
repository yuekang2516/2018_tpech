angular.module('app').factory('NursingProblemService', NursingProblemService);

NursingProblemService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function NursingProblemService($http, $q, $rootScope, SettingService) {
    const rest = {
        getByHealthproblems,
        getByHealthproblemsDetail,
        getByIdPage,
        getByPatientId,
        getById,
        getMeasuresByNursingProblemId,
        post,
        put,
        del,
        getLastAccessTime
    };
    const serverApiUrl = SettingService.getServerUrl();
    const user = SettingService.getCurrentUser();
    // const vghtpeHealthProblemsURL = 'http://10.121.11.180:8080';  // 北榮測試網址
    const vghtpeHealthProblemsURL = 'http://10.97.235.18:9080';  // 北榮正式網址
    const companyid = 'YKHM'; // 公司代號


    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    let lastPageRecords = {
        Total: 0, // 供前端綁定 '共幾筆'，因為不能直接由 Records 的 length 得知，且有新增功能，須及時操作 Total 的數量
        Records: []
    };

    let lastAllRecords = [];
    let lastAllDialysisId = '';

    let lastNursingProblems = [];   // 暫存護理問題

    // 查詢護理健康問題項目
    function getByHealthproblems() {
        const deferred = $q.defer();

        if (lastNursingProblems.length > 0) {
            const res = {};
            res.data = lastNursingProblems;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/NursingProblemSetting/list`
        }).then((res) => {
            lastNursingProblems = res.data;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 查詢單一護理健康問題細項內容(護理措施)
    function getByHealthproblemsDetail(healthProblemsId) {

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/NursingProblemSetting/key/${healthProblemsId}`
        }).then((res) => {
            deferred.resolve(res);
            //  deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依病人代碼及頁碼取得護理記錄 , GET /api/NursingProblem/patient/{id}/{page}
    function getByIdPage(id, page, limit, isForce) {
        const deferred = $q.defer();

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            lastPageRecords.Records = [];
        }

        $http({
            method: 'GET',
            // url: `${serverApiUrl}/api/nursingrecord/patient/${id}/${page}`
            url: `${SettingService.getServerUrl()}/api/NursingProblem/patient/${id}/${page}?limit=${limit}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                lastPageRecords.Total = res.data.Total;
                if (lastPageRecords.Records && lastAllDialysisId === id) {
                    lastPageRecords.Records = lastPageRecords.Records.concat(res.data.Results);
                } else {
                    lastPageRecords.Records = res.data.Results;
                    lastAllDialysisId = id;
                }
            }
            deferred.resolve(lastPageRecords);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 用病人ID讀取N筆
    function getByPatientId(id, isForce) {
        const deferred = $q.defer();
        if (lastAllDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastAllRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/NursingProblem/patient/${id}/50`
        }).then((res) => {
            if (res.data) {
                // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
                lastAllDialysisId = id;
                lastAccessTime = Date.now();
                lastAllRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依 NursingProblem.Id 取得單筆 NursingProblem 資料
    function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/NursingProblem/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依問題代碼取得對應的護理措施
    function getMeasuresByNursingProblemId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/NursingProblemSetting/key/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/NursingProblem`
        }).then((res) => {
            lastPageRecords.Total++;
            lastPageRecords.Records.unshift(res.data);   // 加在陣列最前面(時間倒序排列)
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
            url: `${SettingService.getServerUrl()}/api/NursingProblem/`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastPageRecords.Records) {
                for (let i = 0; i < lastPageRecords.Records.length; i++) {
                    if (lastPageRecords.Records[i].Id === postData.Id) {
                        lastPageRecords.Records[i] = postData;
                    }
                }
            }

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
            url: `${SettingService.getServerUrl()}/api/NursingProblem/${id}`
        }).then((res) => {
            for (let i = 0; i < lastAllRecords.length; i += 1) {
                if (lastAllRecords[i].Id === id) {
                    lastAllRecords[i].Status = 'Deleted';
                    break;
                }
            }

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }
    return rest;
}

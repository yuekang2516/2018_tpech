
import listData from '../fakeData/bloodtransfusion/bloodtransfusionlist.fake.json';

BloodTransfusionService.$inject = ['$http', '$q', '$rootScope', '$stateParams', 'SettingService'];

angular.module('app').factory('BloodTransfusionService', BloodTransfusionService);

function BloodTransfusionService($http, $q, $rootScope, $stateParams, SettingService) {
    const rest = {
        get,
        getUsers,
        post,
        put,
        getById,
        del,
        getLastAccessTime
    };
    const serverApiUrl = SettingService.getServerUrl();
    // const user = SettingService.getCurrentUser();
    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';
    // 用戶搜尋
    let searchById = '';
    let searchUser = [];

    function get(id, isForce, patientId) {
        const deferred = $q.defer();
        let pId = patientId || $stateParams.patientId;  // 已傳進來的為主，電子白板不會有 $stateParams.patientId

        // if (SettingService.checkDemoModeAndGetDataAsync(listData, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listData, deferred);
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

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/bloodTransfusion/list/${pId}/${id}`
        }).then((res) => {
            // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
            lastDialysisId = id;

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

    // 讀取使用人員
    function getUsers(id) {
        const deferred = $q.defer();
        if (searchById === id) {
            const res = {};
            res.data = searchUser;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/user/match/`,
            params: { search: id }
        }).then((res) => {
            if (res.data) {
                searchById = id;
                searchUser = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        // if (SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred);
        // }

        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/bloodTransfusion`
        }).then((res) => {
            lastRecords.push(res.data);
            $rootScope.$broadcast('dataChanged', res);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改一筆
    function put(postData) {
        const deferred = $q.defer();
        // if (SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred);
        // }

        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/bloodTransfusion`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastRecords) {
                for (let i = 0; i < lastRecords.length; i += 1) {
                    if (lastRecords[i].Id === postData.Id) {
                        lastRecords[i] = postData;
                    }
                }
            }
            $rootScope.$broadcast('dataChanged', res);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 依 bloodTransfusion.Id 取得單筆 bloodTransfusion 資料
    function getById(id, isForce) {
        const deferred = $q.defer();
        // if (SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred);
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
            url: `${SettingService.getServerUrl()}/api/bloodTransfusion/${id}`
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

    // 刪除
    function del(id) {
        const deferred = $q.defer();
        // if (SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(listData[0], deferred);
        // }

        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/bloodTransfusion/delete/${id}`
        }).then((res) => {
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            $rootScope.$broadcast('dataChanged', res);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }


    return rest;
}

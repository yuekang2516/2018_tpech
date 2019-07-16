// fake data
import shiftissuesByIdGet from '../fakeData/shiftissues/ApiShiftIssuesByIdGet.fake.json';
import shiftIssuesPatientByIdGet from '../fakeData/shiftissues/ApiShiftIssuesPatientByIdGet.fake.json';

angular.module('app').factory('shiftIssueService', shiftIssueService);
shiftIssueService.$inject = ['SettingService', '$http', '$q', '$rootScope'];

function shiftIssueService(SettingService, $http, $q, $rootScope) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    // shiftIssues Record api

    // 單筆修改
    // shiftIssues update Record
    rest.putRecord = function putRecord(postData) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred);
        // }

        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/ShiftIssues`
        }).then((res) => {
            // success

            if (lastRecords) {
                for (let i = 0; i < lastRecords.length; i++) {
                    if (lastRecords[i].Id === postData.Id) {
                        lastRecords[i] = postData;
                    }
                }
            }

            deferred.resolve(res);

            // 通知首頁更新
            $rootScope.$broadcast('shiftIssue-dataChanged');
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 依病人代碼取得交班事項(包含已刪除)
    rest.getByPatientId = function getByPatientId(id, isForce) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(shiftIssuesPatientByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(shiftIssuesPatientByIdGet, deferred);
        // }

        if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/ShiftIssues/patient/${id}`
        }).then((res) => {
            // success
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (err) => {
            // fail
            deferred.reject(err);
        });
        return deferred.promise;
    };

    // 取得單筆交班事項
    // shiftIssues get record by Id
    rest.getByRecordId = function getByRecordId(id) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/ShiftIssues/${id}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 單筆新增
    // shiftIssues post record (Create)
    rest.postRecord = function postRecord(Data) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(shiftissuesByIdGet, deferred);
        // }

        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/ShiftIssues/`,
            data: Data
        }).then((res) => {
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('shiftIssue-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 依透析表單代碼取得交班事項(不包含已刪除)
    // shiftIssues getByHeaderId/Dialysis Id
    rest.getByDialysisId = function getByDialysisId(id, isForce) {
        const deferred = $q.defer();
        
        if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/ShiftIssues/dialysis/${id}`
        }).then((res) => {
            // success
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            //fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 刪除單筆(只更新資料庫的 Status = Deleted)
    // ShiftIssues delete record by id
    rest.del = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/ShiftIssues/${id}`
        }).then((res) => {
            //success
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('shiftIssue-dataChanged');
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // Assessment get access time
    rest.getLastAccessTime = function getLastAccessTime() {
        return lastAccessTime;
    };
    return rest;
}

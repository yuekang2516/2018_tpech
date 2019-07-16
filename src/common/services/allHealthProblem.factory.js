// fake data
import allHealthProblem from '../fakeData/allHealthProblem/allHealthProblem.fake.json';

angular
    .module('app')
    .factory('allHealthProblemService', allHealthProblemService);

allHealthProblemService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function allHealthProblemService($http, $q, $rootScope, SettingService) {
    const serverApiUrl = SettingService.getServerUrl();
    const rest = {
        getById,
        getByIdPage,
        getLastAccessTime,
        post,
        put,
        del,
        getHealthProblem
    };
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastAllDialysisId = '';

    function getById(patientId) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/healthproblem/${patientId}`
        }).then((res) => {
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

    function getByIdPage(patientId, page, isForce) {
        const deferred = $q.defer();
        if (isForce) {
            lastRecords = [];
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/healthproblem/patient/${patientId}/${page}`
        }).then((res) => {
            lastAccessTime = Date.now();
            lastRecords = res.data.Results;
            lastAllDialysisId = patientId;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });


        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/healthproblem`
        }).then((res) => {
            lastRecords.push(res.data);
            deferred.resolve(res);
            // broadcast when data has changed
            $rootScope.$broadcast('healthProblem_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;

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
            url: `${SettingService.getServerUrl()}/api/healthproblem`
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
            $rootScope.$broadcast('healthProblem_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/healthproblem/delete/${id}`
        }).then((res) => {
            // success
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('healthProblem_dataChanged');

        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    //健康問題
    function getHealthProblem(pId, sDate, eDate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            //url: `${SettingService.getServerUrl()}/api/healthproblem/patient/${pId}/dateInterval/${sDate}/${eDate}`
            url: `${SettingService.getServerUrl()}/api/healthproblem/patient/${pId}/dateInterval/${sDate}/${eDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    return rest;
}

// fake data
import assessmentRecordDialysisByIdGet from '../fakeData/assessment/ApiAssessmentRecordDialysisByIdGet.fake.json';
import assessmentSettingByTypeLastGetPre from '../fakeData/assessment/ApiAssessmentSettingByTypeLastGetPre.fake.json';
import assessmentSettingByTypeLastGetPost from '../fakeData/assessment/ApiAssessmentSettingByTypeLastGetPost.fake.json';
import assessmentSettingByTypeLastGetMeso from '../fakeData/assessment/ApiAssessmentSettingByTypeLastGetMeso.fake.json';

angular.module('app').factory('assessmentService', assessmentService);
assessmentService.$inject = ['SettingService', '$http', '$q', '$rootScope'];

function assessmentService(SettingService, $http, $q, $rootScope) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    // Assessment Record api

    // Assessment update Record
    rest.putRecord = function putRecord(postData) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred);
        // }
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/AssessmentRecord`
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
            $rootScope.$broadcast('assessment-dataChanged');
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // Assessment get record by Id
    rest.getByRecordId = function getByRecordId(id) {
        const deferred = $q.defer();
        let assessmentRecordDialysisByIdGetfilter = assessmentRecordDialysisByIdGet.find((item) => {
            return item.Id === id;
        });
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGetfilter, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGetfilter, deferred);
        // }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentRecord/${id}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Assessment post record (Create)
    rest.postRecord = function postRecord(assessmentData) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred);
        // }

        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/AssessmentRecord/`,
            data: assessmentData
        }).then((res) => {
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('assessment-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Assessment getByHeaderId/Dialysis Id
    rest.getByDialysisId = function getByDialysisId(id, isForce) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(assessmentRecordDialysisByIdGet, deferred);
        // }

        if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentRecord/dialysis/${id}`
        }).then((res) => {
            // success
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Assessment delete record by id
    rest.del = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/AssessmentRecord/${id}`
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
            $rootScope.$broadcast('assessment-dataChanged');
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
    // Assessment Setting api ================================================
    rest.get = function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/last/`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };
    rest.getByVersion = function getByVersion(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/version/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    rest.post = function post(assessment) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/`,
            data: assessment
        }).then((res) => {
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('assessment-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    rest.put = function put(assessment) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/`,
            data: assessment
        }).then((res) => {
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('assessment-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // get type by version number
    rest.getTypeByVersion = function (type, id) {
        const deferred = $q.defer();
        // if (type === "pre") {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPre, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPre, deferred);
        //     }
        // } else if (type == 'in') {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetMeso, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetMeso, deferred);
        //     }
        // } else {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPost, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPost, deferred);
        //     }
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/${type}/version/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 依照 洗前pre 洗中in 洗後post 不同的type，來取得不同評估內容
    rest.getByType = function getByType(type) {
        const deferred = $q.defer();
        // if (type === "pre") {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPre, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPre, deferred);
        //     }
        // } else if (type == 'in') {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetMeso, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetMeso, deferred);
        //     }
        // } else {
        //     // demo
        //     if (SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPost, deferred)) {
        //         return SettingService.checkDemoModeAndGetDataAsync(assessmentSettingByTypeLastGetPost, deferred);
        //     }
        // }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssessmentSetting/${type}/last/`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    return rest;
}

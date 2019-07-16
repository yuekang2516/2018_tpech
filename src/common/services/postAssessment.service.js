angular.module('app').factory('postAssessmentService', postAssessmentService);
postAssessmentService.$inject = ['SettingService', '$http', '$q'];

function postAssessmentService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    // Post asessment Record api

    // Post asessment update Record
    rest.putRecord = function putRecord(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/PostDialysisAssessment`
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
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // Post asessment get record by Id
    rest.getByRecordId = function getByRecordId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/PostDialysisAssessment/${id}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Post asessment post record (Create)
    rest.postRecord = function postRecord(assessmentData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/PostDialysisAssessment/`,
            data: assessmentData
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Post asessment getByHeaderId/Dialysis Id
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
            url: `${SettingService.getServerUrl()}/api/PostDialysisAssessment/dialysis/${id}`
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
    // Post asessment delete record by id
    rest.del = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/PostDialysisAssessment/${id}`
        }).then((res) => {
            // success
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };
    // Post asessment get access time
    rest.getLastAccessTime = function getLastAccessTime() {
        return lastAccessTime;
    };

    return rest;
}

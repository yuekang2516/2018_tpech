angular.module('app').factory('fixedBedService', fixedBedService);
fixedBedService.$inject = ['SettingService', '$http', '$q'];

function fixedBedService(SettingService, $http, $q) {
    const rest = {
        getByWardId,
        getById,
        putRecord,
        postRecord,
        deleteRecord,
        convertNoToWeekday,
        convertWeekdayToNo
    };
    const serverApiUrl = SettingService.getServerUrl();

    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';

    // get record by ward id
    function getByWardId(wardId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/FixedBed/ward/${wardId}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // get record by id
    function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/FixedBed/${id}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // update record
    function putRecord(fixedBedData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: fixedBedData,
            url: `${serverApiUrl}/api/FixedBed/`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // create record
    function postRecord(fixedBedData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/FixedBed/multi/`,
            data: fixedBedData
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // delete record
    function deleteRecord(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/FixedBed/${id}`
        }).then((res) => {
            // success
            deferred.resolve(res);
        }, (res) => {
            // fail
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function convertNoToWeekday(No) {
        const weekdayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (No >= 0 || No < 7) {
            return weekdayName[No];
        }

        return '';
    }

    function convertWeekdayToNo(weekday) {
        const weekdayMap = {
            'monday': 0,
            'tuesday': 1,
            'wednesday': 2,
            'thursday': 3,
            'friday': 4,
            'saturday': 5,
            'sunday': 6
        };
        return weekdayMap[weekday];
    }

    return rest;
}

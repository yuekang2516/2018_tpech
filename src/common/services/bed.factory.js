angular.module('app').factory('bedService', bedService);

bedService.$inject = ['SettingService', '$http', '$q', '$localStorage'];

function bedService(SettingService, $http, $q, $localStorage) {
    const serverApiUrl = SettingService.getServerUrl();
    const rest = {
        getAssignBedByBed,
        getAssignBedByPatientId,
        saveAssignBed,
        editAssignBed,
        deleteAssignBed,
        getAssignBedByWardAndMonth,
        getPatientDaysByWardId,
        getPatientDaysByWardIdAndDate,
        getBedAssignedPeopleCount,
        getBedAssignedPeopleCountByDate,
        getTodayAssignBedByWard,
        getAssignBedByDateAndWard,
        copyFixedBed,
        getShifts,
        getEmptyAssignRecord
    };

    // 目前排床的班次
    const shifts = ['morning', 'afternoon', 'evening', 'night', 'temp'];
    const emptyAssignRecord = {
        Id: '',
        PatientId: '',
        PatientName: '',
        MedicalId: '',
        Gender: '',
        Doctor: {},
        Nurses: {},
        DialysisMode: '',
        Type: '',
        Memo: ''
    };

    function getAssignBedByBed(startDate, endDate, wardId, bed) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/date/${startDate}/${endDate}/byBed/${wardId}/${bed}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getEmptyAssignRecord() {
        return emptyAssignRecord;
    }

    function getAssignBedByPatientId(startDate, endDate, patientId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/date/${startDate}/${endDate}/byPatientId/${patientId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function saveAssignBed(assignBed) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/AssignBed`,
            data: assignBed
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function editAssignBed(assignBed) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/AssignBed`,
            data: assignBed
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function deleteAssignBed(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/AssignBed/delete/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getShifts() {
        return shifts;
    }

    function getAssignBedByWardAndMonth(wardId, startDate, endDate) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/dateRange/${startDate}/${endDate}/wardId/${wardId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getPatientDaysByWardId(wardId, month, year) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/patientDaysByWardId/${wardId}/month/${year}/${month}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getPatientDaysByWardIdAndDate(wardId, startDate, endDate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/patientDaysByWardId/${wardId}/dateRange/${startDate}/${endDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getBedAssignedPeopleCount(wardId, month, year) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/patientMemberByWardId/${wardId}/month/${year}/${month}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getBedAssignedPeopleCountByDate(wardId, startDate, endDate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/patientMemberByWardId/${wardId}/dateRange/${startDate}/${endDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getTodayAssignBedByWard(wardId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/todayByWardId/${wardId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getAssignBedByDateAndWard(date, wardId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/date/${date}/wardId/${wardId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;

    }

    // 將固定班表寫入排床
    function copyFixedBed(wardId, startDate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignBed/copyFixed/${wardId}/${startDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return rest;
}

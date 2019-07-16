import data from '../../app/home/wardCalendar/event.fake.json';
import data2 from '../../app/home/wardCalendar/event.2.fake.json';

angular
.module('app')
.factory('CalendarEventsService', CalendarEventsService);

CalendarEventsService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function CalendarEventsService($http, $q, $rootScope, SettingService) {

    const rest = {
        getWardEventJSON,
        getPatientEvent,
        getAllYearPlans,
        postYearPlans,
        postEvent,
        putEvent,
        deleteEvent,
        getIsYearPlanDirty
    };

    let isYearPlanDirty = false;


    // 取得透析室記事
    function getWardEventJSON(wardId) {
        const deferred = $q.defer();

        if (wardId === '56fcc9eb4ead7870942f61c4') {
            deferred.resolve(data);
        } else {
            deferred.resolve(data2);
        }

        return deferred.promise;
    }


    // 取得病人記事，包含該病人的年度計畫
    function getPatientEvent(patientId, startDate, endDate) {
        const deferred = $q.defer();
        console.log('取得病人記事 service', startDate, endDate);
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Calendar/eventId/${patientId}/interval/${startDate}/${endDate}`
        }).then((res) => {
            deferred.resolve(res);
            isYearPlanDirty = false;
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }


    // 取得年度計畫
    function getAllYearPlans(patientId, year, type) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Calendar/${patientId}/year/${year}?type=${type}`
        }).then((res) => {

            deferred.resolve(res);

        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    function postYearPlans(yearPlan) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/Calendar/plans`,
            data: yearPlan
        }).then((res) => {
            deferred.resolve(res);
            isYearPlanDirty = true;
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增記事
    function postEvent(event) {
        const deferred = $q.defer();

        console.log('記事新增 service postEvent', event);

        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/Calendar/multi`,
            data: event
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 修改記事
    function putEvent(event) {
        const deferred = $q.defer();

        console.log('記事修改 service putEvent', event);

        $http({
          method: 'PUT',
          url: `${SettingService.getServerUrl()}/api/Calendar`,
          data: event
        }).then((res) => {
          deferred.resolve(res);
        }, (res) => {
          deferred.reject(res);
        });

        return deferred.promise;
    }


    // 刪除單筆記事
    function deleteEvent(id) {
        const deferred = $q.defer();

        console.log('刪除單筆記事 service id', id);

        $http({
          method: 'DELETE',
          url: `${SettingService.getServerUrl()}/api/Calendar/${id}`
        }).then((res) => {
          
          deferred.resolve(res);
        }, (res) => {
          deferred.reject(res);
        });

        return deferred.promise;
    }

    function getIsYearPlanDirty() {
        return isYearPlanDirty;
    }


    return rest;
}


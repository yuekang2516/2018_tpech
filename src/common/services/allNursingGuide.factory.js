// fake data
import allNursingGuide from '../fakeData/allNursingGuide/allNursingGuide.fake.json';

angular
    .module('app')
    .factory('allNursingGuideService', allNursingGuideService);

    allNursingGuideService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function allNursingGuideService($http, $q, $rootScope, SettingService) {
    const serverApiUrl = SettingService.getServerUrl();
    const rest = {
        getById,
        getNursingGuide,
        getByIdPage,
        put,
        post,
        getLastAccessTime,
        del
    };

    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastAllDialysisId = '';

    function getById(patientId) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/nursingguide/${patientId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getByIdPage(patientId, page, isForce) {
        const deferred = $q.defer();

          if (isForce) {
            lastRecords = [];
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/nursingguide/Patient/${patientId}/${page}`
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

    // 取得最後取得資料的時間
    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/nursingguide`
        }).then((res) => {
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('nursingGuide_dataChanged');
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
      url: `${SettingService.getServerUrl()}/api/nursingguide/delete/${id}`
    }).then((res) => {
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Id === id) {
          lastRecords[i].Status = 'Deleted';
          break;
        }
      }
      deferred.resolve(res);
      // 通知首頁更新
            $rootScope.$broadcast('nursingGuide_dataChanged');
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
            url: `${serverApiUrl}/api/nursingguide`
        }).then((res) => {
           
            lastRecords.push(res.data);
            deferred.resolve(res);
            // 通知首頁更新
            $rootScope.$broadcast('nursingGuide_dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    //護理指導
    function getNursingGuide(pId, sDate, eDate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            //url: `${SettingService.getServerUrl()}/api/nursingguide/patient/${pId}/dateInterval/${sDate}/${eDate}`
            url: `${SettingService.getServerUrl()}/api/nursingguide/patient/${pId}/dateInterval/${sDate}/${eDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    return rest;
}

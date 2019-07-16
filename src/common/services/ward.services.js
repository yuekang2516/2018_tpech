import dashboardWardGetById from '../fakeData/dashboard/ApiDashboardWardGetById.fake.json';

angular.module('app').factory('wardService', wardService);
wardService.$inject = ['SettingService', '$http', '$q'];

function wardService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Ward/`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.getById = function get(id) {
    const deferred = $q.defer();

  // demo
  // if (SettingService.checkDemoModeAndGetDataAsync(dashboardWardGetById, deferred)) {
  //     return SettingService.checkDemoModeAndGetDataAsync(dashboardWardGetById, deferred);
  // }


    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Ward/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.post = function post(ward) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/Ward/`,
      data: ward
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.put = function put(ward) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/Ward/`,
      data: ward
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}


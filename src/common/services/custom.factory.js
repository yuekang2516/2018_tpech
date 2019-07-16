customService.$inject = ['SettingService', '$http', '$q'];

function customService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/systemphrase`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.post = function post(custom) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/systemphrase`,
      data: custom
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.put = function put(custom) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/systemphrase`,
      data: custom
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('customService', customService);

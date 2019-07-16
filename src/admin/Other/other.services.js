otherService.$inject = ['SettingService', '$http', '$q'];

function otherService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get(url) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: serverApiUrl + url
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.post = function post(url, other) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: serverApiUrl + url,
      data: other
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.put = function put(url, other) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: serverApiUrl + url,
      data: other
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.delete = function del(url) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: serverApiUrl + url
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('otherService', otherService);

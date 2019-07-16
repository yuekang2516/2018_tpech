userService.$inject = ['$rootScope', '$http', '$q'];

function userService($rootScope, $http, $q) {
  const rest = {};
  const serverApiUrl = $rootScope.serverApiUrl;

  rest.get = function get(url) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: serverApiUrl + url
    }).then((res) => {
      const t = setTimeout(() => {
        deferred.resolve(res);
        clearTimeout(t);
      }, 1000);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.post = function post(url, device) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: serverApiUrl + url,
      data: device
    }).then((res) => {
      const t = setTimeout(() => {
        deferred.resolve(res);
        clearTimeout(t);
      }, 1000);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.put = function put(url, device) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: serverApiUrl + url,
      data: device
    }).then((res) => {
      const t = setTimeout(() => {
        deferred.resolve(res);
        clearTimeout(t);
      }, 1000);
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
      const t = setTimeout(() => {
        deferred.resolve(res);
        clearTimeout(t);
      }, 1000);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('userService', userService);

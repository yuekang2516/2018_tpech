angular.module('app').factory('hospitalService', hospitalService);
hospitalService.$inject = ['SettingService', '$http', '$q'];

function hospitalService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Hospital/`
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
        url: `${SettingService.getServerUrl()}/api/Hospital/${id}`
    }).then((res) => {
        deferred.resolve(res);
    }, (res) => {
        deferred.reject(res);
    });

    return deferred.promise;
};

rest.post = function post(hospital) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/Hospital/`,
      data: hospital
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.put = function put(hospital) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/Hospital/`,
      data: hospital
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

logService.$inject = ['SettingService', '$http', '$q'];

function logService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get(datetime1, datetime2, str1, str2, page, limit) {
    // 先處理搜尋字串部分
    let queryString = '';
    if (datetime1) {
      queryString += `&startDate=${datetime1}`;
    }
    if (datetime2) {
      queryString += `&endDate=${datetime2}`;
    }
    if (str1) {
      queryString += `&uName=${str1}`;
    }
    if (str2) {
      queryString += `&pName=${str2}`;
    }
    if (limit) {
      queryString += `&limit=${limit}`;
    }

    const deferred = $q.defer();
    $http({
      method: 'GET',
      // url: `http://172.30.1.177:8000/api/log?intPage=${page}${queryString}`
      // url: `${SettingService.getServerUrl()}/api/log?intPage=${page}${queryString}`
      url: `${SettingService.getServerUrl()}/api/log?page=${page}${queryString}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('logService', logService);

statisticService.$inject = ['SettingService', '$http', '$q'];

function statisticService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.get = function get(startDate, endDate) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/trans/dialysisheader?startdate=${moment(startDate).format('YYYY-MM-DD')}&enddate=${moment(endDate).format('YYYY-MM-DD')}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('statisticService', statisticService);

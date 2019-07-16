// fake data
import ePOListGet from '../fakeData/epoExecution/ApiEPOListGet.fake.json';

angular.module('app').factory('epoService', epoService);

epoService.$inject = ['SettingService', '$http', '$q'];

function epoService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  // 系統後台列表
  rest.getList = function getList() {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ePOListGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ePOListGet, deferred);
    // }
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epo/list`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依 EPO 代碼取得資料
  rest.getById = function getById(id) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epo/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 新增
  rest.post = function post(medicine) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/epo`,
      data: medicine
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 修改
  rest.put = function put(medicine) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/epo`,
      data: medicine
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 刪除
  rest.delete = function del(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/epo/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}


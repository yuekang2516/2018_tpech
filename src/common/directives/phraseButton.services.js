PhraseButtonService.$inject = ['$http', '$q', 'SettingService'];

function PhraseButtonService($http, $q, SettingService) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();
  // const user = $rootScope.UserInfo;

  // 讀取N筆
  rest.get = function get(apiAddress) {
    const deferred = $q.defer();

    $http({
      method: 'GET',
      url: serverApiUrl + apiAddress
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 新增目錄
  rest.postCategory = function postCategory(postData) {
    const deferred = $q.defer();

    // 新增帶 CreatedUser
    postData.CreatedUserId = SettingService.getCurrentUser().Id;
    postData.CreatedUserName = SettingService.getCurrentUser().Name;
    $http({
      method: 'POST',
      data: postData,
      url: `${serverApiUrl}/api/phraseCategory`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  // 修改目錄
  rest.putCategory = function putCategory(postData) {
    const deferred = $q.defer();
    // 帶 ModifiedUser
    postData.ModifiedUserId = SettingService.getCurrentUser().Id;
    postData.ModifiedUserName = SettingService.getCurrentUser().Name;
    $http({
      method: 'PUT',
      data: postData,
      url: `${serverApiUrl}/api/phraseCategory`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  // 新增片語
  rest.postPhrase = function postPhrase(postData) {
    const deferred = $q.defer();
    // 新增帶 CreatedUser
    postData.CreatedUserId = SettingService.getCurrentUser().Id;
    postData.CreatedUserName = SettingService.getCurrentUser().Name;
    $http({
      method: 'POST',
      data: postData,
      url: `${serverApiUrl}/api/phrase`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  // 修改片語
  rest.putPhrase = function putPhrase(postData) {
    const deferred = $q.defer();
    // 帶 ModifiedUser
    postData.ModifiedUserId = SettingService.getCurrentUser().Id;
    postData.ModifiedUserName = SettingService.getCurrentUser().Name;
    $http({
      method: 'PUT',
      data: postData,
      url: `${serverApiUrl}/api/phrase`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  // 刪除
  rest.del = function del(delUrl, postData) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      data: postData,
      url: delUrl
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  return rest;
}


angular.module('app').factory('PhraseButtonService', PhraseButtonService);

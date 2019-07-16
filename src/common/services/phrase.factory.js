phraseService.$inject = ['SettingService', '$http', '$q'];

function phraseService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.getByWardId = function getByWardId(id, userid) {
    const deferred = $q.defer();
    let urlpath = '';
    if (userid) {
      if (id === 'personalphrase') {
        urlpath = `${SettingService.getServerUrl()}/api/phraseCategory/getbywardid/personalphrase?userId=${userid}`;
      } else {
        urlpath = `${SettingService.getServerUrl()}/api/phraseCategory/getbywardid/systemphrase`;
      }
    } else {
      urlpath = `${SettingService.getServerUrl()}/api/PhraseCategory/getbywardid/${id}`;
    }

    $http({
      method: 'GET',
      url: urlpath
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.getByCategoryId = function getByCategoryId(id) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/PhraseCategory/getbycategoryid/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.getBreadcrumb = function getBreadcrumb(wardId, categoryId) {
    // 先處理url
    let serverUrl = `${SettingService.getServerUrl()}/api/PhraseCategory/getbreadcrumb?ward_id=${wardId}`;
    if (categoryId !== 'home') {
      serverUrl += `&id=${categoryId}`;
    }

    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: serverUrl
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.savePhrase = function savePhrase(phrase) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/phrase`,
      data: phrase
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.editPhrase = function editPhrase(phrase) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/phrase`,
      data: phrase
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.savePhraseCategory = function savePhraseCategory(phraseCategory) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/PhraseCategory`,
      data: phraseCategory
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.editPhraseCategory = function editPhraseCategory(phraseCategory) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/PhraseCategory`,
      data: phraseCategory
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.deletePhrase = function deletePhrase(phrase) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/Phrase/delete`,
      data: phrase
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.deletePhraseCategory = function deletePhraseCategory(phraseCategory) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/PhraseCategory/delete`,
      data: phraseCategory
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.revertPhrase = function revertPhrase(phrase) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/Phrase/revertphrase`,
      data: phrase
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.revertPhraseCategory = function revertPhraseCategory(phraseCategory) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/PhraseCategory/revert`,
      data: phraseCategory
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

angular.module('app').factory('phraseService', phraseService);

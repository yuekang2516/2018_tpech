angular.module('app').factory('ExecutionRecordService', ExecutionRecordService);
ExecutionRecordService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function ExecutionRecordService($http, $q, $rootScope, SettingService) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  // 記錄前次呼叫 api 時的 id 及 array
  // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
  // 可提升使用者體驗
  let lastRecords = [];
  let lastAccessTime = new Date();
  let lastDialysisId = '';
  let isDirty = false;

  // 依病人代碼及表頭代碼取得需執行的用藥
  rest.getRecord = function getRecord(patientId, headerId, isForce) {

    const deferred = $q.defer();

    // 如果之前讀取過的 id 相同,
    // 而且在5 分鐘內, 則直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastDialysisId === headerId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isDirty) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/orderrecord/bypatientid/' + patientId + '/headerid/' + headerId
    }).then((res) => {

      // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
      // 成功時才給值，以免下次進來時會進入暫存的判斷式裡而回傳資料
      lastDialysisId = headerId;
      if (res.data) {
        lastAccessTime = Date.now();
        lastRecords = res.data;
      }
      isDirty = false;
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依病人代碼及表頭代碼取得需執行的用藥
  rest.getSTRecord = function getSTRecord(patientId, headerId, isForce) {

    const deferred = $q.defer();

    // 如果之前讀取過的 id 相同,
    // 而且在5 分鐘內, 則直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastDialysisId === headerId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isDirty) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/orderrecord/bypatientid/' + patientId + '/headerid/' + headerId + '/ST'
    }).then((res) => {

      // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
      // 成功時才給值，以免下次進來時會進入暫存的判斷式裡而回傳資料
      lastDialysisId = headerId;
      if (res.data) {
        lastAccessTime = Date.now();
        lastRecords = res.data;
      }
      isDirty = false;
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依執行用藥代碼取得資料
  rest.getDetail = function getDetail(id) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/orderrecord/' + id
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 儲存執行用藥
  rest.put = function put(oData) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      data: oData,
      url: SettingService.getServerUrl() + '/api/orderrecord'
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      // 以利回到上一頁時可以直接取用整個陣列
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', oData.Id]);
        lastRecords[index] = res.data;
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依頁碼取得用藥資訊
  rest.getRecordsForPage = function getRecordsForPage(patientId, offset, limit) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/orderrecord/bypatientid/' + patientId + '?offset=' + offset + '&limit=' + limit
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 取得最後取得資料的時間
  rest.getLastAccessTime = function getLastAccessTime() {
    return lastAccessTime;
  };

  // 未執行筆數
  rest.getTodoCount = function getTodoCount(patientId, headerId) {
    const deferred = $q.defer();

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/orderrecord/bypatientid/${patientId}/headerid/${headerId}/todoCount`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 未執行ST筆數
  rest.getTodoSTCount = function getTodoSTCount(patientId, headerId) {
    const deferred = $q.defer();

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/orderrecord/bypatientid/${patientId}/headerid/${headerId}/todoSTCount`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 設定資料是否要重讀
  rest.setDirty = function setDirty(value) {
    isDirty = value;
  };

  return rest;
}

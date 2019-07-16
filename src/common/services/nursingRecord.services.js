// fake data
import nursingrecordByDialysisHeaderIdByIdByNGet from '../fakeData/nursingRecord/ApiNursingrecordByDialysisHeaderIdByIdByNGet.fake.json';
import nursingrecordPatientByIdByPageGet from '../fakeData/nursingRecord/ApiNursingrecordPatientByIdByPageGet.fake.json';

angular.module('app').factory('NursingRecordService', NursingRecordService);

NursingRecordService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function NursingRecordService($http, $q, $rootScope, SettingService) {
  const rest = {
    getByIdPage,
    getByPatientId,
    getByHeaderId,
    getById,
    post,
    put,
    del,
    getLastAccessTime
  };
  const serverApiUrl = SettingService.getServerUrl();
  const user = SettingService.getCurrentUser();

  // 記錄前次呼叫 api 時的 id 及 array
  // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
  // 可提升使用者體驗
  let lastRecords = [];
  let lastAccessTime = new Date();
  let lastDialysisId = '';

  let lastAllRecords = [];
  let lastAllDialysisId = '';

  // 依病人代碼及頁碼取得護理記錄 , GET /api/nursingrecord/patient/{id}/{page}
  function getByIdPage(id, page, limit, isForce) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred);
    // }

    // 強迫重新整理，清空暫存陣列
    if (isForce) {
      lastAllRecords = [];
    }

    $http({
      method: 'GET',
      // url: `${serverApiUrl}/api/nursingrecord/patient/${id}/${page}`
      url: `${SettingService.getServerUrl()}/api/nursingrecord/patient/${id}/${page}?limit=${limit}`
    }).then((res) => {
      if (res.data) {
        lastAccessTime = Date.now();
        // 歷次護理暫存
        if (lastAllRecords && lastAllDialysisId === id) {
          lastAllRecords = lastAllRecords.concat(res.data.Results);
          res.data.Results = lastAllRecords;
        } else {
          lastAllRecords = res.data.Results;
          lastAllDialysisId = id;
        }
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  }

  // 用病人ID讀取N筆
  function getByPatientId(id, isForce) {
    const deferred = $q.defer();
    if (lastAllDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
      const res = {};
      res.data = lastAllRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/nursingrecord/bypatientid/${id}/50`
    }).then((res) => {
      if (res.data) {
        // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
        lastAllDialysisId = id;
        lastAccessTime = Date.now();
        lastAllRecords = res.data;
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  }

  // 用表頭Id讀取N筆
  function getByHeaderId(id, isForce) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(nursingrecordByDialysisHeaderIdByIdByNGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(nursingrecordByDialysisHeaderIdByIdByNGet, deferred);
    // }

    // 如果之前讀取過的 id 相同,
    // 而且在5 分鐘內, 則直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/nursingrecord/bydialysisheaderid/${id}/0`
    }).then((res) => {
      // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
      lastDialysisId = id;

      if (res.data) {
        lastAccessTime = Date.now();
        lastRecords = res.data;
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  }

  // 依 NursingRecord.Id 取得單筆 NursingRecord 資料
  function getById(id) {
    const deferred = $q.defer();
    // let nursingrecordPatientByIdByPageGetfilter = nursingrecordPatientByIdByPageGet.Results.find((item) => {
    //   return item.Id === id;
    // });
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGetfilter, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGetfilter, deferred);
    // }


    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/nursingrecord/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  }

  function getLastAccessTime() {
    return lastAccessTime;
  }

  // 新增
  function post(postData) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred);
    // }

    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/nursingrecord`
    }).then((res) => {
      lastRecords.push(res.data);
      deferred.resolve(res);
      // 通知首頁更新
      $rootScope.$broadcast('nursingRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 修改
  function put(postData) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(nursingrecordPatientByIdByPageGet, deferred);
    // }

    $http({
      method: 'PUT',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/nursingrecord`
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      // 以利回到上一頁時可以直接取用整個陣列
      if (lastRecords) {
        for (let i = 0; i < lastRecords.length; i++) {
          if (lastRecords[i].Id === postData.Id) {
            lastRecords[i] = postData;
          }
        }
      }

      // for 歷次護理紀錄
      if (lastAllRecords) {
        for (let i = 0; i < lastAllRecords.length; i++) {
          if (lastAllRecords[i].Id === postData.Id) {
            lastAllRecords[i] = postData;
          }
        }
      }
      deferred.resolve(res);
      // 通知首頁更新
      $rootScope.$broadcast('nursingRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  }

  // 刪除
  function del(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/nursingrecord/delete/${id}`
    }).then((res) => {
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Id === id) {
          lastRecords[i].Status = 'Deleted';
          break;
        }
      }

      // for 歷次護理紀錄
      for (let i = 0; i < lastAllRecords.length; i += 1) {
        if (lastAllRecords[i].Id === id) {
          lastAllRecords[i].Status = 'Deleted';
          break;
        }
      }

      deferred.resolve(res);
      // 通知首頁更新
      $rootScope.$broadcast('nursingRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }
  return rest;
}

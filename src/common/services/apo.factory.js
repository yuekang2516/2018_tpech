angular.module('app').factory('ApoService', ApoService);

ApoService.$inject = ['$http', '$q', '$rootScope', 'SettingService', '$filter'];

function ApoService($http, $q, $rootScope, SettingService, $filter) {
  const rest = {
    getHospitalAll,
    getByPatientId,
    getByTime,
    del,
    delNew,
    getById,
    put,
    putNew,
    post,
    postNew,
    getLastAccessTime
  };
  const serverApiUrl = SettingService.getServerUrl();
  const user = SettingService.getCurrentUser();

  // 記錄前次呼叫 api 時的 id 及 array
  // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
  // 可提升使用者體驗
  let lastRecords = [];
  let lastAccessTime = new Date();
  let lastPatientId = '';

  // 撈出透析室項目 目的是取出異常項目和子類別
  function getHospitalAll() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Ward`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 用病人ID讀取列表
  function getByPatientId(id, isForce) {
    const deferred = $q.defer();
    // 如果之前讀取過的 id 相同,
    // 而且在5 分鐘內, 則直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastPatientId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
    lastPatientId = id;

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/apo/bypatientid/${id}`
    }).then((res) => {
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

  // 用異常時間取資料
  function getByTime(id, time, status) {
    const deferred = $q.defer();

    // if (SettingService.checkDemoModeAndGetDataAsync([], deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync([], deferred);
    // }

    if (time === null && status === null) {
      $http({
        method: 'GET',
        url: `${SettingService.getServerUrl()}/api/apo/GetByPateintIdGroupbyTime/${id}`
        // url: `http://172.30.1.177:8000/api/apo/GetByPateintIdGroupbyTime/${id}`
      }).then((res) => {
        if (res.data) {
          lastAccessTime = Date.now();
          lastRecords = res.data;
        }
        deferred.resolve(res);
      }, (res) => {
        deferred.reject(res);
      });
    } else {
      $http({
        method: 'GET',
        url: `${SettingService.getServerUrl()}/api/apo/GetByPateintIdGroupbyTime/${id}?date=${time}&&status=${status}`
        // url: `http://172.30.1.177:8000/api/apo/GetByPateintIdGroupbyTime/${id}?date=${time}&&status=${status}`
      }).then((res) => {
        deferred.resolve(res);
      }, (res) => {
        deferred.reject(res);
      });
    }

    return deferred.promise;
  }

  // 刪除
  function del(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/apo/delete/${id}`
    }).then((res) => {
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Id === id) {
          lastRecords[i].Status = 'Deleted';
          break;
        }
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 刪除 new
  function delNew(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/apo/delete/${id}`
    }).then((res) => {
      let tempRecord = {};
      for (let i = 0; i < lastRecords.length; i += 1) {
        // if (lastRecords[i].Id === id) {
        //   lastRecords[i].Status = 'Deleted';
        //   break;
        // }
        for (let j = 0; j < lastRecords[i].Id.length; j++) {
          if (lastRecords[i].Id[j] === id) {
            lastRecords[i].Id.splice(j, 1);
            tempRecord = lastRecords[i];
          }
        }
      }
      // 把刪除的項目變成Deleted
      let delFind = -1;
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Time === tempRecord.Time && lastRecords[i].Status === 'Deleted') {
          lastRecords[i].Id.push(id);
          delFind = i;
        }
      }
      if (delFind === -1) {
        let newDelData = {};
        let newid = [];
        newid.push(id);
        newDelData.Time = tempRecord.Time;
        newDelData.Shift = tempRecord.Shift;
        newDelData.Id = newid;
        newDelData.PatientId = tempRecord.PatientId;
        newDelData.PatientName = tempRecord.PatientName;
        newDelData.Status = 'Deleted';
        lastRecords.push(newDelData);
      }
      // 把空資料拿掉
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Id.length === 0) {
          lastRecords.splice(i, 1);
        }
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 讀取一筆
  function getById(id) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/apo/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 修改一筆
  function put(postData) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/apo`
    }).then((res) => {
      if (lastRecords) {
        for (let i = 0; i < lastRecords.length; i += 1) {
          if (lastRecords[i].Id === postData.Id) {
            lastRecords[i] = postData;
          }
        }
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 修改一筆 new
  function putNew(postData) {
    const deferred = $q.defer();
    $http({
      method: 'PUT',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/apo`
    }).then((res) => {
      let postTime = $filter('date')(postData.Time, 'yyyy-MM-ddTHH:mm:ss+08:00');
      if (lastRecords) {
        for (let i = 0; i < lastRecords.length; i += 1) {
          // if (lastRecords[i].Id === postData.Id) {
          //   lastRecords[i] = postData;
          // }
          for (let j = 0; j < lastRecords[i].Id.length; j++) {
            if (lastRecords[i].Id[j] === postData.Id && lastRecords[i].Status === res.data.Status) {
              lastRecords[i].Shift = postData.Shift;
              lastRecords[i].Time = postTime;
            }
          }
        }
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 新增一筆
  function post(postData) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/apo`
    }).then((res) => {
      lastRecords.push(res.data);
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 新增一筆 new
  function postNew(postData) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/apo`
    }).then((res) => {
      // lastRecords.push(res.data);
      let postTime = $filter('date')(postData.Time, 'yyyy-MM-ddTHH:mm:ss+08:00');
      let timeFlag = 0;
      for (let i = 0; i < lastRecords.length; i += 1) {
        if (lastRecords[i].Time === postTime && lastRecords[i].Status === res.data.Status) {
          lastRecords[i].Id.push(res.data.Id);
          lastRecords[i].Shift = postData.Shift;
          lastRecords[i].Time = postTime;
          timeFlag = 1;
        }
      }
      if (timeFlag === 0) {
        let newData = {};
        let newid = [];
        newid.push(res.data.Id);
        newData.Time = postTime; // res.data.Time
        newData.Shift = res.data.Shift;
        newData.Id = newid;
        newData.PatientId = res.data.PatientId;
        newData.PatientName = postData.PatientName;
        newData.Status = res.data.Status;
        lastRecords.push(newData);
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  function getLastAccessTime() {
    return lastAccessTime;
  }

  return rest;
}

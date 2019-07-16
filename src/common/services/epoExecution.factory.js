// fake data
import ePOExecutionPatientByIdDateBySetDateGet from '../fakeData/epoExecution/ApiEPOExecutionPatientByIdDateBySetDateGet.fake.json';
import ePOExecutionByIdGet from '../fakeData/epoExecution/ApiEPOExecutionByIdGet.fake.json';

angular.module('app').factory('epoExecutionService', epoExecutionService);

epoExecutionService.$inject = ['SettingService', '$http', '$q'];

function epoExecutionService(SettingService, $http, $q) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  let lastRecords = []; // 當月的資料
  let lastAccessTime = new Date(); // 最後更新的資料
  let lastIdMonth = ''; // 病人Id + 最後的月份

  // 依病人代碼及月份取得開立EPO資訊
  rest.getListByMonth = function getListByMonth(patientId, value, isForce) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred)) {
    //       return SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred);
    // }
    // 如果月份相同, 而且在 5 分鐘內，直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastIdMonth === (patientId + moment(value).format('YYYY-MM')) && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    // 如果月份不相同者, 則先換掉, 以免下次進來時月份還在前一筆
    lastIdMonth = patientId + moment(value).format('YYYY-MM');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epoexecution/patient/${patientId}/date/${value}`
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
  };

  // 依執行代碼取得資料
  rest.getById = function getById(id) {
    const deferred = $q.defer();


    let ePOExecutionPatientByIdDateBySetDateGetfind = ePOExecutionPatientByIdDateBySetDateGet.find((item) => {
      return item.Id === id;
    });
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGetfind, deferred)) {
    //     return SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGetfind, deferred);
    // }
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epoexecution/${id}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 新增
  rest.post = function post(postData) {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred);
    // }

    postData.CreatedUserName = SettingService.getCurrentUser().Name;
    postData.CreatedUserId = SettingService.getCurrentUser().Id;
    $http({
      method: 'POST',
      url: `${SettingService.getServerUrl()}/api/epoexecution`,
      data: postData
    }).then((res) => {
      // 暫存的月份相同時，新增至 lastRecords
      if (lastIdMonth === postData.PatientId + moment(postData.StartDate).format('YYYY-MM')) {
        lastRecords.push(res.data);
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 單筆修改
  rest.put = function put(obj) {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ePOExecutionPatientByIdDateBySetDateGet, deferred);
    // }
    obj.ModifiedUserName = SettingService.getCurrentUser().Name;
    obj.ModifiedUserId = SettingService.getCurrentUser().Id;
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/epoexecution`,
      data: obj
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', obj.Id]);
        if (index > -1) lastRecords[index] = res.data;
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 單筆修改
  rest.putExecute = function putExecute(obj) {
    const deferred = $q.defer();
    obj.ModifiedUserName = SettingService.getCurrentUser().Name;
    obj.ModifiedUserId = SettingService.getCurrentUser().Id;
    $http({
      method: 'PUT',
      url: `${SettingService.getServerUrl()}/api/epoexecution/execute`,
      data: obj
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', obj.Id]);
        if (index > -1) lastRecords[index] = res.data;
      }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 單筆刪除
  rest.delete = function del(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/epoexecution/${id}`
    }).then((res) => {
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', id]);
        if (index > -1) lastRecords.splice(index, 1);
      }
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

  // 依病人代碼取得未執行的筆數
  rest.getTodoCount = function getTodoCount(patientId) {
    const deferred = $q.defer();

    // if (SettingService.checkDemoModeAndGetDataAsync(1, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(1, deferred);
    // }

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epoexecution/todoCount/${patientId}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依病人代碼及年度取得統計資料
  rest.getExecutionEPOByYear = function getExecutionEPOByYear(patientId, year) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/epoexecution/execution/${patientId}/year/${year}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}


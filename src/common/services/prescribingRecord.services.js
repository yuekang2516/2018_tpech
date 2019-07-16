// fake data
import ordermasterByPatientIdByIdDateBySetDateGet from '../fakeData/prescribingRecord/ApiOrdermasterByPatientIdByIdDateBySetDateGet.fake.json';
import ordermasterByPatientIdEffectiveByDialysisTimeGet from '../fakeData/prescribingRecord/ApiOrdermasterByPatientIdEffectiveByDialysisTimeGet.fake.json';
import medicineByIdGet from '../fakeData/prescribingRecord/ApiMedicineByIdGet.fake.json';

angular.module('app').factory('PrescribingRecordService', PrescribingRecordService);
PrescribingRecordService.$inject = ['$http', '$q', '$rootScope', 'SettingService', 'allExecutionRecordService'];

function PrescribingRecordService($http, $q, $rootScope, SettingService, allExecutionRecordService) {
  const rest = {};

  let lastRecords = []; // 當月的資料
  let lastAccessTime = new Date(); // 最後更新的資料
  let lastIdMonth = ''; // 病人Id + 最後的月份

  // 讀取每月的藥品列表
  rest.getMonthExecution = function getMonthExecution(patientId, value, isForce) {
    const deferred = $q.defer();
    // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdByIdDateBySetDateGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdByIdDateBySetDateGet, deferred);
    // }

    // 如果月份相同, 而且在 5 分鐘內，直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
    if (lastIdMonth === (patientId + moment(value).format('YYYY-MM')) && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
      const res = {};
      res.data = lastRecords;
      deferred.resolve(res);
      return deferred.promise;
    }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/ordermaster/bypatientid/' + patientId + '/date/' + value
    }).then((res) => {
      // 如果月份不相同者, 則先換掉, 以免下次進來時月份還在前一筆
      lastIdMonth = patientId + moment(value).format('YYYY-MM');

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


  // 依病人代碼及表頭代碼取得所有有效醫囑
  rest.getAllValidRecord = function getAllValidRecord(patientId, dialysisTime) {
    const deferred = $q.defer();
    // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
    // }

    console.log('有效醫囑 patientId', patientId);
    console.log('有效醫囑 dialysisTime', dialysisTime);
    // mode 區分是執行紀錄(execute)或是開藥清單(list)
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/ordermaster/' + patientId + '/effective/' + dialysisTime + '?mode=list'
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // 讀取每月過濾 ST 的藥品列表
  rest.getFilterSTMonthExecution = function getFilterSTMonthExecution(patientId, value) {
    const deferred = $q.defer();

    // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
    // }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/ordermaster/bypatientid/' + patientId + '/date/' + value + '/filterST'
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 讀取藥品列表
  rest.getMedicines = function getMedicines() {
    const deferred = $q.defer();

    // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
    // }


    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/medicine/list'
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 讀取藥品類別
  rest.getMedicineCategories = function getMedicineCategories() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/medicine/categorynamelist'
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 讀取單筆用藥
  rest.getPrescribing = function getPrescribing(value) {
    const deferred = $q.defer();
    // let ordermasterByPatientIdEffectiveByDialysisTimeGetfind = ordermasterByPatientIdEffectiveByDialysisTimeGet.find((item) => {
    //     return item.Id === value;
    // });
    // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
    // }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/ordermaster/' + value
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 新增用藥
  rest.post = function post(postData) {
    const deferred = $q.defer();

    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }

    $http({
      method: 'POST',
      data: postData,
      url: SettingService.getServerUrl() + '/api/ordermaster'
    }).then((res) => {
      // 暫存的月份相同時，新增至 lastRecords
      if (lastIdMonth === postData.PatientId + moment(postData.StartDate).format('YYYY-MM')) {
        lastRecords.push(res.data);
      }

      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);

      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 修改用藥
  rest.put = function put(postData) {
    const deferred = $q.defer();
    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }

    $http({
      method: 'put',
      data: postData,
      url: SettingService.getServerUrl() + '/api/ordermaster'
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', postData.Id]);
        if (index > -1) lastRecords[index] = res.data;
      }

      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);
      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 刪除用藥
  rest.delete = function del(id, userId) {
    const deferred = $q.defer();
    $http({
      method: 'delete',
      url: `${SettingService.getServerUrl()}/api/ordermaster/delete/${id}`
    }).then((res) => {
      if (lastRecords) {
        const index = _.findIndex(lastRecords, ['Id', id]);
        if (index > -1) lastRecords.splice(index, 1);
      }

      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);
      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 讀取單筆藥品
  rest.getMedicine = function getMedicine(value) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }

    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/medicine/' + value
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 匯入上次透析的 ST 用藥
  rest.ImportST = function ImportST(headerId, userId, userName) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }


    $http({
      method: 'Post',
      url: SettingService.getServerUrl() + '/api/ordermaster/addpreviousst/' + headerId + '/' + userId + '/' + userName
    }).then((res) => {
      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);
      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 依選取的用藥匯入
  rest.ImportMaster = function ImportMaster(postData) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }

    $http({
      method: 'Post',
      data: postData,
      url: SettingService.getServerUrl() + '/api/ordermaster/importrecords'
    }).then((res) => {
      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);
      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  // 取得最後取得資料的時間
  rest.getLastAccessTime = function getLastAccessTime() {
    return lastAccessTime;
  };

  // 新增自訂藥物
  rest.postCustomMedicine = function postCustomMedicine(postData) {
    console.log('新增自訂藥物 postData', postData);
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(medicineByIdGet, deferred);
    // }

    $http({
      method: 'POST',
      data: postData,
      url: SettingService.getServerUrl() + '/api/ordermaster/custom'
    }).then((res) => {
      // 暫存的月份相同時，新增至 lastRecords
      if (lastIdMonth === postData.PatientId + moment(postData.StartDate).format('YYYY-MM')) {
        lastRecords.push(res.data);
      }

      // 設定執行紀錄的筆數需要重讀
      allExecutionRecordService.setDirty(true);

      deferred.resolve(res);
      // 通知summary更新顯示資料
      $rootScope.$broadcast('allExecutionRecord-dataChanged');
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

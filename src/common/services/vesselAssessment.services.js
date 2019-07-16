// fake data
import ApiVesselassessmentByPatientIdByIdGet from '../fakeData/vesselAssessment/ApiVesselassessmentByPatientIdByIdGet.fake.json';


angular.module('app').factory('VesselAssessmentService', VesselAssessmentService);

VesselAssessmentService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function VesselAssessmentService($http, $q, $rootScope, SettingService) {
  const rest = {
    get,
    del,
    getById,
    put,
    post,
    getImages,
    postImages,
    getLastAccessTime
  };
  const serverApiUrl = SettingService.getServerUrl();
  const user = SettingService.getCurrentUser();

  // 記錄前次呼叫 api 時的 id 及 array
  // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
  // 可提升使用者體驗
  // let lastRecords = [];
  let lastAccessTime = new Date();
  let lastvesselassessmentId = '';

  // 讀取列表
  function get(id, isForce) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred)) {
    //       return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred);
    // }
    // 如果之前讀取過的 id 相同,
    // 而且在5 分鐘內, 則直接回傳前一次的陣列
    // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次

    // if (lastvesselassessmentId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
    //   const res = {};
    //   res.data = lastRecords;
    //   deferred.resolve(res);
    //   return deferred.promise;
    // }
    // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
    // lastvesselassessmentId = id;

    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/vesselassessment/bypatientid/${id}`
    }).then((res) => {
      if (res.data) {
        lastAccessTime = Date.now();
        // lastRecords = res.data;
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

  // 刪除
  function del(id) {
    const deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: `${SettingService.getServerUrl()}/api/vesselassessment/delete/${id}`
    }).then((res) => {
      // for (let i = 0; i < lastRecords.length; i += 1) {
      //   if (lastRecords[i].Id === id) {
      //     lastRecords[i].Status = 'Deleted';
      //     break;
      //   }
      // }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 讀取一筆
  function getById(id) {
    const deferred = $q.defer();

    let ApiVesselassessmentByPatientIdByIdGetfind = ApiVesselassessmentByPatientIdByIdGet.find((item) => {
      return item.Id === id;
    });
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGetfind, deferred)) {
    //     return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGetfind, deferred);
    // }
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/vesselassessment/${id}`
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

    // demo
    //     if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred)) {
    //       return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred);
    // }
    $http({
      method: 'PUT',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/vesselassessment`
    }).then((res) => {
      // 如果現有陣列中己經有該筆資料了, 則換掉
      // 以利回到上一頁時可以直接取用整個陣列
      // if (lastRecords) {
      //   for (let i = 0; i < lastRecords.length; i += 1) {
      //     if (lastRecords[i].Id === postData.Id) {
      //       lastRecords[i] = postData;
      //     }
      //   }
      // }
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 新增一筆
  function post(postData) {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred);
    // }
    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/vesselassessment`
    }).then((res) => {
      // lastRecords.push(res.data);
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 讀取照片
  function getImages(postData) {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred);
    // }
    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/vesselassessment/getimages`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  // 新增照片
  function postImages(postData) {
    const deferred = $q.defer();

    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred)) {
    //   return SettingService.checkDemoModeAndGetDataAsync(ApiVesselassessmentByPatientIdByIdGet, deferred);
    // }
    $http({
      method: 'POST',
      data: postData,
      url: `${SettingService.getServerUrl()}/api/vesselassessment/addimage`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  }

  return rest;
}

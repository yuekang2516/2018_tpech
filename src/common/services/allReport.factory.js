import consumableFakeData from '../fakeData/consumableReport/ApiConsumableReport.fake.json';
import machineFakeData from '../fakeData/machineManagement/ApiMachineManagement.fake.json';


angular.module('app').factory('allReportService', allReportService);

allReportService.$inject = ['SettingService', '$http', '$q'];

function allReportService(SettingService, $http, $q) {
  const serverApiUrl = SettingService.getServerUrl();
  const rest = {};
  let lastLabexamDate = '';

  // getAllChargeReportContent
  rest.getAllChargeByWardYearMonth = function getAllChargeByWardYearMonth(strWardId, strYearMonth) {
    const deferred = $q.defer();
    // console.log('getAllChargeByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Reports/charge/ward/${strWardId}/date/${strYearMonth}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // getAllEPOReportContent
  rest.getAllEPOByWardYearMonth = function getAllEPOByWardYearMonth(strYearMonth) {
    const deferred = $q.defer();
    // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Reports/execution/date/${strYearMonth}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // getAllVisitReportContent
  rest.getAllVisitByWardYearMonth = function getAllVisitByWardYearMonth(strWardId, strYearMonth) {
    const deferred = $q.defer();
    // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/reports/visit/ward/${strWardId}/date/${strYearMonth}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // getdemographyReportContent
  rest.getDemographyByWardYear = function getDemographyByWardYear(strYear) {
    const deferred = $q.defer();
    // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Reports/demography/date/${strYear}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // getserviceQualityReportContent
  rest.getServiceQualityByWardYear = function getServiceQualityByWardYear(strYear) {
    const deferred = $q.defer();
    // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
    $http({
      method: 'GET',
      url: `${SettingService.getServerUrl()}/api/Reports/serviceQuality/date/${strYear}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


    rest.getAllApoByWardYearMonth = function getAllApoByWardYearMonth(strWardId, strYearMonth) {
        const deferred = $q.defer();
        // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Reports/apo/wardId/${strWardId}/date/${strYearMonth}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 指定年月取所有病人最新檢驗檢查記錄
    rest.getByPatientIdDate = function getByPatientIdDate(strYearMonth, doctor) {
      const deferred = $q.defer();
      // console.log('getAllEPOByWardYearMonth factory : \n strWardId : ' + strWardId + '\n strYearMonth = ' + strYearMonth + '\n');
      $http({
          method: 'GET',
          // url: `http://172.30.1.177:8000/api/Reports/GetDataByDate/sDate/${strYearMonth}`
          url: `${SettingService.getServerUrl()}/api/Reports/GetDataByDate/sDate/${strYearMonth}?attendingPhysician=${doctor}`
      }).then((res) => {
          deferred.resolve(res);
      }, (res) => {
          deferred.reject(res);
      });

      return deferred.promise;
    };


    // getPreparationReport  備料報表
   rest.getPreparationReport = function getPreparationReport(wardId, startDate, endDate, shift) {
    const deferred = $q.defer();
    // console.log('getWardMonthlyReportContent factory : \n strWardId : ' + wardId + '\n strYearMonth = ' + startDate + '\n');

    $http({
      method: 'GET',
      url: `${serverApiUrl}/api/Reports/preparation/ward/${wardId}/date/${startDate}/${endDate}?shift=${shift}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };


  // 取得耗材報表資料
  rest.getConsumableReport = function getConsumableReport(startDate, endDate) {

    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(consumableFakeData, deferred)) {
    //     return SettingService.checkDemoModeAndGetDataAsync(consumableFakeData, deferred);
    // }
    $http({
      method: 'GET',
      url: `${serverApiUrl}/api/Reports/consumable/date/${startDate}/${endDate}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;

  };


  // 取得透析機報表資料 by medicalId
  rest.getMachineManagementReportByMedicalId = function getMachineManagementReportByMedicalId(medicalId, startDate, endDate) {
    const deferred = $q.defer();
    // demo
    // if (SettingService.checkDemoModeAndGetDataAsync(machineFakeData, deferred)) {
    //     return SettingService.checkDemoModeAndGetDataAsync(machineFakeData, deferred);
    // }
    $http({
      method: 'GET',
      url: `${serverApiUrl}/api/Reports/dialysisData/medicalId/${medicalId}/date/${startDate}/${endDate}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;

  };

  // 取得透析機報表資料 by machineNumber
  rest.getMachineManagementReportByMachineNumber = function getMachineManagementReportByMachineNumber(machineNumber, startDate, endDate) {
    const deferred = $q.defer();
  
    $http({
      method: 'GET',
      url: `${serverApiUrl}/api/Reports/dialysisData/machineNumber/${machineNumber}/date/${startDate}/${endDate}`
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;

  };

  return rest;
}

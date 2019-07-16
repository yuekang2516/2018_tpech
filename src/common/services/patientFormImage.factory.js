angular.module('app').factory('patientFormImageService', patientFormImageService);

patientFormImageService.$inject = ['$http', '$q', 'SettingService'];

function patientFormImageService($http, $q, SettingService) {
    const service = {
        AddImage,
        UpdateImage,
        DeleteImage,
        getListByFormId
    };
    let serverApiUrl = SettingService.getServerUrl();
    //serverApiUrl = "http://118.163.208.29:9007"

    // 新增
    function AddImage(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${serverApiUrl}/api/Patient_Form_Image/AddImage`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function UpdateImage(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${serverApiUrl}/api/Patient_Form_Image/UpdateImage`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getListByFormId(formId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Patient_Form_Image/GetListByFormId?FormId=${formId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    function DeleteImage(formId) {
      const deferred = $q.defer();
      $http({
          method: 'POST',
          url: `${serverApiUrl}/api/Patient_Form_Image/DeleteImage?Form_Id=${formId}`
      }).then((res) => {
          deferred.resolve(res);
      }, (res) => {
          deferred.reject(res);
      });

      return deferred.promise;
  }
    return service;
}

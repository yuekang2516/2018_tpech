angular.module('app').factory('PatientListxxxService', PatientListService);

PatientListService.$inject = ['$mdDialog', '$http', '$q', 'SettingService'];
function PatientListService($mdDialog, $http, $q, SettingService) {
  const rest = {};
  const serverApiUrl = SettingService.getServerUrl();

  rest.getIdentifierIdAdd = function (identifierid) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/patient?$count=true&$top=0&$inlinecount=allpages&$filter=IdentifierId eq tolower(\'' + identifierid + '\') and Module eq \'dialysis\''
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  rest.getIdentifierIdEdit = function (identifierid, patientId) {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: SettingService.getServerUrl() + '/api/patient?$count=true&$top=0&$inlinecount=allpages&$filter=Id ne \'' + patientId + '\' and IdentifierId eq tolower(\'' + identifierid + '\') and Module eq \'dialysis\''
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });
    return deferred.promise;
  };

  rest.checkIsduplicate = function (postData) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      data: postData,
      url: SettingService.getServerUrl() + '/api/patient/isduplicate'
    }).then((res) => {
      deferred.resolve(res);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  rest.showMyPatientDialog = function () {
    $('#menu').hide();
    let myPatientsTemplate = `<div layout="column" style="height:89%">
                                    <my-patients ng-click="$ctrl.close()" layout-fill></my-patients>
                                    <md-button ng-click="$ctrl.close()"><span>{{'summary.service.close' | translate}}</span></md-button>
                                 </div>`;
    $mdDialog.show(
      $mdDialog.alert({
        controller: myPatientController,
        controllerAs: '$ctrl',
        template: myPatientsTemplate,
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        title: 'test'
      })
    );

    function myPatientController() {
      const vm = this;

      angular.element(document).ready(() => {
        $('#menu').hide();
        $('md-dialog').css('height', '100%');
      });

      vm.close = function () {
        $mdDialog.hide();
      };
    }
  };

  return rest;
}

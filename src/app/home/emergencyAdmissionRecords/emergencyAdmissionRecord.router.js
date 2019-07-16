angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'home',
        name: 'emergencyAdmissionRecord',
        url: '/emergencyAdmissionRecord',
        component: 'emergencyAdmissionRecord',
        //template: '<ui-view layout-fill layout="column"><my-patient layout-fill layout="column"></my-patient></ui-view>'
      }, { keepOriginalNames: true });
    }]);
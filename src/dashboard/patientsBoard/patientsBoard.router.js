angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'patientsBoard',
        url: '/ward/:wardId/patientsBoard',
        component: 'patientsBoard'
      }, { keepOriginalNames: true });
    }]);

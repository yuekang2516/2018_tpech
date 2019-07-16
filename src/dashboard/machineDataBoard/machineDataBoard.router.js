angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'machineDataBoard',
        url: '/ward/:wardId/machineDataBoard',
        component: 'machineDataBoard'
      }, { keepOriginalNames: true });
    }]);

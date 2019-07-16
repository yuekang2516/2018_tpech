angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'shiftsBoard',
        url: '/ward/:wardId/shiftsBoard',
        component: 'shiftsBoard'
      }, { keepOriginalNames: true });
    }]);
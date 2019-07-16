angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'bedsBoard',
        url: '/ward/:wardId/bedsBoard',
        component: 'bedsBoard'
      }, { keepOriginalNames: true });
    }]);
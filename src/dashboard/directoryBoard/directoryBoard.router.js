angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'directoryBoard',
        url: '/ward/:wardId/directoryBoard',
        component: 'directoryBoard'
      }, { keepOriginalNames: true });
    }]);

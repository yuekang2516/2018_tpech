angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'dashboard',
        name: 'whiteBoard',
        url: '/whiteBoard',
        component: 'whiteBoard'
      }, { keepOriginalNames: true });
    }]);

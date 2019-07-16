angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      name: 'dashboard',
      url: '/dashboard',
      component: 'dashboard'
    });
  }]);

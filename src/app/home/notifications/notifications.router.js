angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'home',
      name: 'notifications',
      url: '/notifications',
      component: 'notifications'
    }, {
      keepOriginalNames: true
    });
  }
]);
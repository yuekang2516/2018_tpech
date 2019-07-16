angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'overview',
      url: '/overview',
      component: 'overview'
    }, { keepOriginalNames: true });
  }]);


angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'charge',
      url: '/charge',
      component: 'charge'
    }, { keepOriginalNames: true }).state({
      parent: 'summary',
      name: 'chargeCreate',
      url: '/chargeCreate',
      component: 'chargeCreate'
    }, { keepOriginalNames: true });
  }]);

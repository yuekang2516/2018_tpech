angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'executionRecord',
      url: '/executionRecord',
      component: 'executionRecord'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'executionDetail',
      url: '/executionDetail/:executionId/:mode',
      component: 'executionDetail'
    }, {
      keepOriginalNames: true
    });
  }
]);
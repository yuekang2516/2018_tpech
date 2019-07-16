angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'allDialysisRecords',
      url: '/allDialysisRecords',
      component: 'allDialysisRecords'
    }, { keepOriginalNames: true });
  }]);

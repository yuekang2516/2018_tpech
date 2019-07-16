angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'nursingRecord',
      url: '/nursingRecord',
      component: 'nursingRecord'
    }, { keepOriginalNames: true }).state({
      parent: 'summary',
      name: 'nursingRecordDetail',
      url: '/nursingRecord/:nursingRecordId',
      component: 'nursingRecordDetail'
    }, { keepOriginalNames: true });
  }
]);

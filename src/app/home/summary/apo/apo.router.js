require('./apo.less');

angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'apo',
      url: '/apo',
      component: 'apo'
    }, { keepOriginalNames: true }).state({
      parent: 'apo',
      name: 'apoDetail',
      url: '/:apoId?:apoStatus',
      component: 'apoDetail'
    }, { keepOriginalNames: true });
  }
]);

angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'continuousMachineData',
      url: '/continuousMachineData',
      component: 'continuousMachineData'
    }, {
      keepOriginalNames: true
    });
  }
]);
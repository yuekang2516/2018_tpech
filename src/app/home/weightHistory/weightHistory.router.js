angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'home',
        name: 'weightHistory',
        url: '/weightHistory',
        component: 'weightHistory',
        //template: '<ui-view layout-fill layout="column"><my-patient layout-fill layout="column"></my-patient></ui-view>'
      }, { keepOriginalNames: true });
    }]);

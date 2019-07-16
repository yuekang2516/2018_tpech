angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'summary',
        name: 'admissionConsult',
        url: '/admissionConsult',
        component: 'admissionConsult'
      }, { keepOriginalNames: true });
    }
  ]);

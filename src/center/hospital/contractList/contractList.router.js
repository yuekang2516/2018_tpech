angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'hospitalDetail',
        name: 'contractList',
        url: '/contractList',
        component: 'contractList'
      }, {
        keepOriginalNames: true
      }).state({
        parent: 'home',
        name: 'contractListDetail',
        // url: '/hospital/:hospitalId/contractListDetail/:contractId?:cId',
        url: '/contractList/:id?:hospitalId',
        component: 'contractListDetail'
      }, {
        keepOriginalNames: true
      });
    }
  ]);

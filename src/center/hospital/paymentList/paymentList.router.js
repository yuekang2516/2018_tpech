angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'hospitalDetail',
        name: 'paymentList',
        url: '/paymentList',
        component: 'paymentList'
      }, {
        keepOriginalNames: true
      }).state({
        parent: 'home',
        name: 'paymentListDetail',
        // url: '/hospital/:hospitalId/paymentListDetail/:paymentId?:cId',
        url: '/contractList/:id?:hospitalId',
        component: 'paymentListDetail'
      }, {
        keepOriginalNames: true
      });
    }
  ]);

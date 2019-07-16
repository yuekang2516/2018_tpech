angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'allExecutionRecord',
      url: '/allExecutionRecord',
      component: 'allExecutionRecord'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'allExecutionDetail',
      url: '/allExecutionDetail/:masterId/mode/:mode/event/:event',
      component: 'allExecutionDetail',
      params: {
        dialysisTime: {
          dynamic: true,
          value: ''
        }
      }
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdAllExecutionRecord',
      url: '/pdAllExecutionRecord',
      component: 'allExecutionRecord'
    }, {
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdAllExecutionDetail',
      url: '/pdAllExecutionDetail/:masterId/mode/:mode/event/:event',
      component: 'allExecutionDetail',
      params: {
        dialysisTime: {
          dynamic: true,
          value: ''
        }
      }
    }, {
      keepOriginalNames:true
    });
  }
]);


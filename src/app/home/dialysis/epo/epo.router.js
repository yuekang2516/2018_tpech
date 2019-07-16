angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'epo',
      url: '/epoRecord/:listDate',
      params: {
        listDate: {
          value: moment().format('YYYY-MM-DD'),
          squash: '~'
        }
      },
      component: 'epoRecord'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'epoAdd',
      url: '/epoAdd/:epoId',
      component: 'epoAdd'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'epoExecute',
      url: '/epoExecute/:executionId/mode/:mode',
      component: 'epoExecute'
    }, {
      keepOriginalNames: true
    });
  }
]);
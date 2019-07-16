angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'annualEpo',
      url: '/annualEpo/:year',
      params: {
        year: {
          value: moment().format('YYYY'),
          squash: '~'
        }
      },
      component: 'annualEpoReport'
    }, { keepOriginalNames: true });
  }
]);

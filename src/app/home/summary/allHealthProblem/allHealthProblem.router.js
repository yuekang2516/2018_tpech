
angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'allHealthProblem',
      url: '/allHealthProblem',
      component: 'allHealthProblem'
    }, { keepOriginalNames: true }).state({
      parent: 'allHealthProblem',
      name: 'healthProblem',
      url: '/:healthProblemId',
      component: 'healthProblem'
    }, { keepOriginalNames: true });
  }
]);

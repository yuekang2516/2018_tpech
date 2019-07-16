require('./nursingRecord.less');

angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'allNursingRecords',
      url: '/allNursingRecords',
      component: 'allNursingRecords'
    }, { keepOriginalNames: true }).state({
      parent: 'allNursingRecords',
      name: 'allNursingRecordDetail',
      url: '/:nursingRecordId',
      component: 'allNursingRecordDetail'
    }, { keepOriginalNames: true }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdAllNursingRecords',
      url: '/pdAllNursingRecords',
      component: 'allNursingRecords'
    }, {keepOriginalNames:true}).state({
      parent: 'pdAllNursingRecords',
      name: 'pdAllNursingRecordDetail',
      url: '/:nursingRecordId',
      component: 'allNursingRecordDetail'
    }, {keepOriginalNames:true});
  }
]);

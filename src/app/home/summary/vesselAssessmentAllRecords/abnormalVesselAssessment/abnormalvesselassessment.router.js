require('./abnormalvesselassessment.less');

angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      // parent: 'home',
      parent: 'vesselAssessmentAllRecords',
      name: 'abnormalVesselAssessment',
      url: '/abnormalVesselAssessment',
      component: 'abnormalVesselAssessment'
    }, { keepOriginalNames: true }).state({
      // parent: 'abnormalVesselAssessment',
      parent: 'summary',
      name: 'abnormalVesselAssessmentDetail',
      // url: '/:abnormalVesselAssessmentId',
      url: '/vesselAssessmentAllRecords/abnormalVesselAssessment/:abnormalVesselAssessmentId',
      component: 'abnormalVesselAssessmentDetail'
    }, { keepOriginalNames: true });
  }
]);

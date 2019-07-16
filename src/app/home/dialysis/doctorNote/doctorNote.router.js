angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'doctorNote',
      url: '/doctorNote',
      component: 'doctorNote'
    }, { keepOriginalNames: true }).state({
        parent: 'summary',
        name: 'doctorNoteDetail',
        url: '/doctorNote/:doctorNoteId',
        component: 'doctorNoteDetail'
    }, { keepOriginalNames: true }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdDoctorNote',
      url: '/doctorNote',
      component: 'doctorNote'
    }, {keepOriginalNames:true}).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdDoctorNoteDetail',
      url: '/doctorNote/:doctorNoteId',
      component: 'doctorNoteDetail'
  }, {keepOriginalNames:true});
  }]);

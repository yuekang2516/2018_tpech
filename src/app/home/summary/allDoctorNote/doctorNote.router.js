require('./doctorNote.less');

angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'allDoctorNoteList',
      url: '/allDoctorNoteList',
      component: 'allDoctorNoteList'
    }, { keepOriginalNames: true }).state({
      parent: 'allDoctorNoteList',
      name: 'allDoctorNoteDetail',
      url: '/:doctorNoteId',
      component: 'allDoctorNoteDetail'
    }, { keepOriginalNames: true });
  }
]);

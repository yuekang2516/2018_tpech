require('./vesselAssessment.less');

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
      name: 'vesselassessment',
      url: '/vesselAssessment',
      component: 'vesselassessment',
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          // you can lazy load files for an existing module
          // 長按、短按功能
          return $ocLazyLoad.load(['hammer.js', 'ng_file_upload.js', 'tableExport.js']);
        }]
      }
    }, { keepOriginalNames: true }).state({
      // parent: 'vesselassessment',
      parent: 'summary',
      name: 'vesselassessmentDetail',
      // url: '/:vesselassessmentId',
      url: '/vesselAssessmentAllRecords/vesselAssessment/:vesselassessmentId',
      component: 'vesselassessmentDetail',
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          // you can lazy load files for an existing module
          // 長按、短按功能
          return $ocLazyLoad.load(['hammer.js', 'ng_file_upload.js', 'tableExport.js']);
        }]
      }
    }, { keepOriginalNames: true });
  }
]);

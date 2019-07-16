require('./vesselAssessmentAllRecords.less');

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'vesselAssessmentAllRecords',
            // url: '/:vesselAssessmentRecords',
            // url: '/:patientId/:vesselAssessmentRecordsId/vesselAssessmentRecordsDetail',
            url: '/vesselAssessmentAllRecords',
            component: 'vesselAssessmentAllRecords',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('ng_file_upload.js');
                }]
            }
        }, { keepOriginalNames: true });
    }
]);

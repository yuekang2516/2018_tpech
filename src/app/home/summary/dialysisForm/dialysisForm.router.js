
angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            // parent: 'home',
            name: 'dialysisFormForPdf',
            url: '/patient/:patientId/:headerId/dialysisFormForPdf/:formName',
            component: 'dialysisForm',
            // resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
            //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //         // you can lazy load files for an existing module
            //         return $ocLazyLoad.load('fullcalendar.js');
            //     }]
            // }
        }, { keepOriginalNames: true }).state({
            parent: 'summary',
            name: 'dialysisForm',
            url: '/patient/:patientId/dialysisForm',
            component: 'dialysisForm',
            views: {
                'wholeScreen': {
                    component: 'dialysisForm'
                }
            }
            // resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
            //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //         // you can lazy load files for an existing module
            //         return $ocLazyLoad.load('fullcalendar.js');
            //     }]
            // }
        }, { keepOriginalNames: true });
    }
]);

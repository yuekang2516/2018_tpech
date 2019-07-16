angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'home',
            name: 'peritonealDialysisTabView',
            url: '/patient/:patientId/peritonealDialysis',
            component: 'peritonealDialysisTabView',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('tableExport.js');
                }]
            }
        }, { keepOriginalNames: true });
    }]);

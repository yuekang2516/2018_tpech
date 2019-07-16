angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'monthlyDialysisRecords',
            url: '/monthlyDialysisRecords?:date?:isSummary',
            component: 'monthlyDialysisRecords',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('fullcalendar.js');
                }]
            },
            reloadOnSearch: false
        }, { keepOriginalNames: true });
    }]);

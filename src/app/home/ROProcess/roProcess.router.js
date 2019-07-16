angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            abstact: true,
            parent: 'home',
            name: 'roProcess',
            url: '/roProcess',
            component: 'roProcess',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['hammer.js']);
                }]
            }
        }, {
            keepOriginalNames: true
        }).state({
            parent: 'roProcess',
            name: 'roProcessPending',
            url: '/roProcessPending',
            component: 'roProcessPending',
        }, {
            keepOriginalNames: true
        }).state({
            parent: 'roProcess',
            name: 'roProcessResolved',
            url: '/roProcessResolved/month?:month',
            component: 'roProcessResolved',
            reloadOnSearch: true
        }, {
            keepOriginalNames: true
        });
    }
]);
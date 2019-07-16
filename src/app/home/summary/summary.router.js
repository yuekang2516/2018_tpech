angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider,
    ) => {
        stateHelperProvider.state({
            parent: 'home',
            name: 'summary',
            url: '/patient/:patientId/summary/:headerId?/:month?',
            component: 'summary',
            views: {
                '': {
                    component: 'summary'
                },
                'wholeScreen': {
                    // component: 'dialysisForm'
                }
            },
            // reloadOnSearch: false,
            // make param dynamic so it does not reload the whole page
            // https://github.com/angular-ui/ui-router/issues/2679
            // https://ui-router.github.io/ng1/docs/latest/interfaces/params.paramdeclaration.html#dynamic
            params: {
                headerId: {
                    dynamic: false,
                    value: ''
                },
                month: {
                    dynamic: true,
                    value: ''
                },
                searchStr: {
                    dynamic: true,
                    value: ''
                }
            },
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    // labexam need
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, { keepOriginalNames: true });
    }]);

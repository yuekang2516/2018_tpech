import './labexam.less';

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider,
        stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'labexam',
            url: '/labexam',
            component: 'labexam',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, { keepOriginalNames: true }).state({
            parent: 'labexam',
            name: 'labexamChart',
            url: '/labexamChart',
            component: 'labexamChart',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, { keepOriginalNames: true }).state({
            parent: 'labexam',
            name: 'labexamTable',
            url: '/labexamTable',
            component: 'labexamTable',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, { keepOriginalNames: true }).state({
            parent: 'home',
            name: 'labexamTablePrint',
            url: '/labexam/labexamTable/labexamTablePrint/patient/:patientId',
            component: 'labexamTablePrint'
        }, { keepOriginalNames: true }).state({
            parent: 'summary',
            name: 'updateLabexam',
            url: '/labexam/:labexamId',
            component: 'updateLabexam'
        }, { keepOriginalNames: true }).state({
            parent: 'summary',
            name: 'createLabexam',
            url: '/labexam/add',
            component: 'createLabexam'
        }, { keepOriginalNames: true }).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdLabexam',
            url: '/pdLabexam',
            component: 'labexam',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, {keepOriginalNames: true}).state({
            parent: 'pdLabexam',
            name: 'pdLabexamChart',
            url: '/pdLabexamChart',
            component: 'labexamChart',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, {keepOriginalNames:true}).state({
            parent: 'pdLabexam',
            name: 'pdLabexamTable',
            url: '/pdLabexamTable',
            component: 'labexamTable',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['echarts.js', 'hammer.js']);
                }]
            }
        }, {keepOriginalNames:true}).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdUpdateLabexam',
            url: '/pdLabexam/:labexamId',
            component: 'updateLabexam'
        }, {keepOriginalNames:true}).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdCreateLabexam',
            url: '/pdLabexam/add',
            component: 'createLabexam'
        }, {keepOriginalNames:true}).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdLabexamTablePrint',
            url: '/labexam/labexamTable/labexamTablePrint/patient/:patientId',
            component: 'labexamTablePrint'
        }, {keepOriginalNames:true});
    }
]);

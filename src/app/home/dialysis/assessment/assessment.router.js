angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'assessment',
            url: '/assessment',
            component: 'assessment'
        }, { keepOriginalNames: true })
            .state({
                parent: 'summary',
                name: 'assessmentDetail',
                url: '/assessment/:type/:Id',
                component: 'assessmentDetail'
            }, { keepOriginalNames: true });
    }
]);

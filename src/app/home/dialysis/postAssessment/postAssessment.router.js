angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'postAssessment',
            url: '/postAssessment',
            component: 'postAssessment'
        }, { keepOriginalNames: true });
    }
]);

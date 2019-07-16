angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'dialysisTabView',
            url: '',
            component: 'dialysisTabView',
            abstract: true
        }, { keepOriginalNames: true });
    }]);

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'allApo',
            url: '/allApo',
            component: 'allApo'
        }, { keepOriginalNames: true });
    }]);
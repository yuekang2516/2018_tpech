angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'allEpo',
            url: '/allEpo',
            component: 'allEpo'
        }, { keepOriginalNames: true });
    }]);

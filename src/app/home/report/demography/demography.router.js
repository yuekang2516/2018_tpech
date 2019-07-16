angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'demography',
            url: '/demography',
            component: 'demography'
        }, { keepOriginalNames: true });
    }]);

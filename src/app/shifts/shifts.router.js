angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            name: 'shifts',
            url: '/shifts',
            component: 'shifts'
        });
    }
]);

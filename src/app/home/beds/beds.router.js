angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'home',
            name: 'beds',
            url: '/beds',
            component: 'beds'
        }, { keepOriginalNames: true });
    }]);


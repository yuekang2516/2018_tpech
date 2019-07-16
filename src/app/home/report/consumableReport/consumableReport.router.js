angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'consumableReport',
            url: '/consumableReport',
            component: 'consumableReport'
        }, { keepOriginalNames: true });
    }]);

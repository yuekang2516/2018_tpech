angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'machineManagement',
            url: '/machineManagement',
            component: 'machineManagement'
        }, { keepOriginalNames: true });
    }]);

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'preparationReport',
            url: '/preparationReport',
            component: 'preparationReport'
        }, { keepOriginalNames: true });
    }]);

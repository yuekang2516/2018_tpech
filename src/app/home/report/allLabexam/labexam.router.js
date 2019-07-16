angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'allLabexam',
            url: '/allLabexam',
            component: 'allLabexam'
        }, { keepOriginalNames: true });
    }]);
angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'allCharge',
            url: '/allCharge',
            component: 'allCharge'
        }, { keepOriginalNames: true });
    }]);

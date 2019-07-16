angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'allVisit',
            url: '/allVisit',
            component: 'allVisit'
        }, { keepOriginalNames: true });
    }]);

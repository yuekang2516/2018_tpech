angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'reports',
            name: 'serviceQuality',
            url: '/serviceQuality',
            component: 'serviceQuality'
        }, { keepOriginalNames: true });
    }]);

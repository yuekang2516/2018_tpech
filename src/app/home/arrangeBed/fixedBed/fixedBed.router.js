
angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            // parent: 'home',
            name: 'fixedBed',
            url: '/fixedBed',
            component: 'fixedBed'
        }, { keepOriginalNames: true });
    }
]);
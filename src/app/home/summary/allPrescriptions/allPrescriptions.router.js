angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'allPrescriptions',
            url: '/allPrescriptions',
            component: 'allPrescriptions'
        }, { keepOriginalNames: true, siblingTraversal: true });
    }]);

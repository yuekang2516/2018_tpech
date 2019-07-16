angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'orderLR',
            url: '/orderLR',
            component: 'orderLR'
        }, { keepOriginalNames: true });
    }]);

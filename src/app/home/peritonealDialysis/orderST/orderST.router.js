angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'orderST',
            url: '/orderST',
            component: 'orderST'
        }, { keepOriginalNames: true });
    }]);

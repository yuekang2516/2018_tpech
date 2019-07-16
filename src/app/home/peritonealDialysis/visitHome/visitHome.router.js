angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'visitHome',
            url: '/visitHome',
            component: 'visitHome'
        }, { keepOriginalNames: true });
    }]);

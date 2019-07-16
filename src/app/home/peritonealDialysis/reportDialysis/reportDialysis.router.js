angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'reportDialysis',
            url: '/reportDialysis',
            component: 'reportDialysis'
        }, { keepOriginalNames: true });
    }]);

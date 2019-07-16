angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'highRiskFaller',
            url: '/highRiskFaller',
            component: 'highRiskFaller'
        }, { keepOriginalNames: true });
    }]);

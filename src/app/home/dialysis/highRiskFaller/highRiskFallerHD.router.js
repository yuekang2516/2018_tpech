angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'highRiskFallerHD',
            url: '/highRiskFaller',
            component: 'highRiskFaller'
        }, { keepOriginalNames: true });
    }]);

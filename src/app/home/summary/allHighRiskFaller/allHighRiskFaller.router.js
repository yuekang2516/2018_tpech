angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'allHighRiskFallerHD',
            url: '/allHighRiskFaller',
            component: 'highRiskFaller'
        }, { keepOriginalNames: true });
    }]);
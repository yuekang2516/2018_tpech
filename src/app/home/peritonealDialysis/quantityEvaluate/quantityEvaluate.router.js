angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'quantityEvaluate',
            url: '/quantityEvaluate',
            component: 'quantityEvaluate'
        }, { keepOriginalNames: true });
    }]);

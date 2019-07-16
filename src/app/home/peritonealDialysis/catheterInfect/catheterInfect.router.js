angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'catheterInfect',
            url: '/catheterInfect',
            component: 'catheterInfect'
        }, { keepOriginalNames: true });
    }]);

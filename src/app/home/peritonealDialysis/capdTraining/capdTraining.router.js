angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'capdTraining',
            url: '/capdTraining',
            component: 'capdTraining'
        }, { keepOriginalNames: true });
    }]);

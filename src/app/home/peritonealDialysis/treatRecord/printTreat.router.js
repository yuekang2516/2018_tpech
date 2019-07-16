angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            //parent: 'peritonealDialysisTabView',
            name: 'printTreat',
            url: '/printTreat',
            params: {
                item: null
            },
            component: 'printTreat'
        }, { keepOriginalNames: true });
    }]);

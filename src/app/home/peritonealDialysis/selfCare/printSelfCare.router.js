angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            //parent: 'peritonealDialysisTabView',
            name: 'printSelfCare',
            url: '/printSelfCare',
            params: {
                item: null
            },
            component: 'printSelfCare'
        }, { keepOriginalNames: true });
    }]);

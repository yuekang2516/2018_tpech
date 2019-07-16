angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            //parent: 'peritonealDialysisTabView',
            name: 'printApd',
            url: '/printApd',
            params: {
                item: null
            },
            component: 'printApd'
        }, { keepOriginalNames: true });
    }]);

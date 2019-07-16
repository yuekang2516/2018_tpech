angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'visitPhone',
            url: '/visitPhone',
            component: 'visitPhone'
        }, { keepOriginalNames: true });
    }]);

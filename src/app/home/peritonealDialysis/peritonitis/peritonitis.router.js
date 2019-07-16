angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'peritonitis',
            url: '/peritonitis',
            component: 'peritonitis'
        }, { keepOriginalNames: true });
    }]);

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'selfCare',
            url: '/selfCare',
            component: 'selfCare'
        }, { keepOriginalNames: true });
    }]);

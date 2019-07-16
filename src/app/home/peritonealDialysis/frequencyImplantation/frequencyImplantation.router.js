angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'frequencyImplantation',
            url: '/frequencyImplantation',
            component: 'frequencyImplantation'
        }, { keepOriginalNames: true });
    }]);

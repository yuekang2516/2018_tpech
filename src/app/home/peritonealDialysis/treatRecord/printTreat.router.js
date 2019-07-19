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
        }, { keepOriginalNames: true }).state({
            name: 'printTreatAPD',
            url: '/printTreatAPD',
            params: {
                item: null
            },
            component: 'printTreatAPD'
        }, { keepOriginalNames: true });
    }]);

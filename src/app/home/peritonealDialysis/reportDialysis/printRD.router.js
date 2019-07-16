angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            //parent: 'peritonealDialysisTabView',
            name: 'printRD',
            url: '/printRD',
            params: {
                PatientId:null,
                item: null
            },
            component: 'printRD'
        }, { keepOriginalNames: true });
    }]);

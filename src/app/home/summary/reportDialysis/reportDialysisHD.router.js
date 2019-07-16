angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'reportDialysisHD',
            url: '/reportDialysis',
            component: 'reportDialysis'
        }, { keepOriginalNames: true }).state({
            parent: 'summary',
            name: 'printRDHD',
            params: {
                PatientId:null,
                item: null
            },
            url: '/printRD',
            component: 'printRD'
        }, { keepOriginalNames: true });
    }]);

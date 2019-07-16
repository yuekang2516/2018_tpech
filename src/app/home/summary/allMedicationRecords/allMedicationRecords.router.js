angular.module('app').config(['$urlRouterProvider', 'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'allMedicationRecords',
            url: '/allMedicationRecords',
            component: 'allMedicationRecords'
        }, { keepOriginalNames: true }).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdAllMedicationRecords',
            url: '/pdAllMedicationRecords',
            component: 'allMedicationRecords'
        }, {keepOriginalNames:true});
    }
]);
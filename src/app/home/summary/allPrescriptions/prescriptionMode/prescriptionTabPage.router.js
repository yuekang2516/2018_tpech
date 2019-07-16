angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'allPrescriptions',
            name: 'prescriptionTabPage',
            url: '/prescriptionTabPage/tag/:tag',
            component: 'prescriptionTabPage'
        }, { keepOriginalNames: true }).state({
            // parent: 'prescriptionTabPage',
            parent: 'summary',
            name: 'prescriptionDetail',
            url: '/prescriptionDetail/prescription/:prescriptionId/tag/:tag',
            component: 'prescriptionDetail'
        }, { keepOriginalNames: true }).state({
            // parent: 'prescriptionTabPage',
            parent: 'peritonealDialysisTabView',
            name: 'pdPrescriptionDetail',
            url: '/prescriptionDetail/prescription/:prescriptionId/tag/:tag',
            component: 'prescriptionDetail'
        }, { keepOriginalNames: true }).state({
            name: 'prescriptionForPdf',
            url: '/patient/:patientId/prescription/:prescriptionId/',
            component: 'prescriptionDetail'
        }, { keepOriginalNames: true });
    }]);
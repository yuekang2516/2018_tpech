require('./allReferralSheet.less');

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            // parent: 'allReferralSheetList',
            name: 'referralSheetFormForPdf',
            url: '/patient/:patientId/referralSheetId/:referralSheetId/referralSheetFormForPdf',
            component: 'allReferralSheetForm'
        }, { keepOriginalNames: true }).state({
            parent: 'home',
            name: 'allReferralSheetList',
            url: '/patient/:patientId/allReferralSheetList',
            component: 'allReferralSheetList'
        }, { keepOriginalNames: true }).state({
            parent: 'allReferralSheetList',
            name: 'allReferralSheetForm', // 20181221 新的form
            url: '/:patientId/:referralSheetId/allReferralSheetForm',
            component: 'allReferralSheetForm'
        }, { keepOriginalNames: true }).state({
            parent: 'allReferralSheetForm',
            name: 'labexamCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/labexamCheck',
            component: 'labexamCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'allReferralSheetForm',
            name: 'drugCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/drugCheck',
            component: 'drugCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'allReferralSheetForm',
            name: 'surgeryCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/surgeryCheck',
            component: 'surgeryCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'allReferralSheetForm',
            name: 'diseaseCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/diseaseCheck',
            component: 'diseaseCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdAllReferralSheetList',
            url: '/patient/:patientId/allReferralSheetList',
            component: 'allReferralSheetList'
        }, { keepOriginalNames: true }).state({
            parent: 'pdAllReferralSheetList',
            name: 'pdAllReferralSheetForm', // 20181221 新的form
            url: '/:patientId/:referralSheetId/allReferralSheetFormPd',
            component: 'allReferralSheetFormPd'
        }, { keepOriginalNames: true }).state({
            parent: 'pdAllReferralSheetForm',
            name: 'pdLabexamCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/labexamCheck',
            //url: '/:patientId/:referralSheetId/allReferralSheetForm/labexamCheck',
            component: 'labexamCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'pdAllReferralSheetForm',
            name: 'pdDrugCheck',
            url: '/:patientId/:referralSheetId/:medicalId/:patientName/allReferralSheetForm/drugCheck',
            //url: '/:patientId/:referralSheetId/allReferralSheetForm/drugCheck',
            component: 'drugCheck'
        }, { keepOriginalNames: true }).state({
            parent: 'pdAllReferralSheetForm',
            name: 'pdOrderCheck',
            url: '/:patientId/allReferralSheetForm/orderCheck',
            component: 'orderCheck'
        }, { keepOriginalNames: true });
    }
]);

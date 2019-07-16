require('./vesselAssessmentProblems.less');

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            // parent: 'home',
            parent: 'vesselAssessmentAllRecords',
            name: 'vesselAssessmentProblemsList',
            url: '/vesselAssessmentProblemsList',
            component: 'vesselAssessmentProblemsList'
        }, { keepOriginalNames: true }).state({
            // parent: 'vesselAssessmentProblemsList',
            parent: 'summary',
            name: 'vesselAssessmentProblemsDetail',
            // url: '/:vesselAssessmentProblemsId/vesselAssessmentProblemsDetail',
            url: '/vesselAssessmentAllRecords/vesselAssessmentProblemsList/:vesselAssessmentProblemsId',
            component: 'vesselAssessmentProblemsDetail'
        }, { keepOriginalNames: true });
    }
]);

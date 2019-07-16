angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'allNursingGuide',
            url: '/allNursingGuide',
            component: 'allNursingGuide'
        }, { keepOriginalNames: true }).state({
            parent: 'summary',
            name: 'nursingGuide',
            url: '/:nursingGuideId',
            component: 'nursingGuide'
          }, { keepOriginalNames: true });
}]);
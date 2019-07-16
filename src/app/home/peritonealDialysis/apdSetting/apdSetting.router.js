angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'apdSetting',
            url: '/apdSetting',
            component: 'apdSetting'
        }, { keepOriginalNames: true });
    }]);

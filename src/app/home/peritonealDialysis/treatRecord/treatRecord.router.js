angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'peritonealDialysisTabView',
            name: 'treatRecord',
            url: '/treatRecord',
            component: 'treatRecord'
        }, { keepOriginalNames: true });
    }]);

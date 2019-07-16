angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'shiftIssues',
            url: '/shiftIssues',
            component: 'shiftIssues'
        }, { keepOriginalNames: true }).state({
                parent: 'summary',
                name: 'shiftIssue',
                url: '/shiftIssue/:Id',
                component: 'shiftIssue'
            }, { keepOriginalNames: true, siblingTraversal: true });
    }
]);

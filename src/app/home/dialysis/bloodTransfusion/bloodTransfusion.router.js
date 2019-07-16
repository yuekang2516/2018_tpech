angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider,
     stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'bloodTransfusion',
            url: '/bloodTransfusion',
            component: 'bloodTransfusion'
        }, {keepOriginalNames: true}).state({
            parent: 'summary',
            name: 'bloodTransfusionDetail',
            url: '/bloodTransfusion/:bloodTransfusionId',
            component: 'bloodTransfusionDetail'
        }, {keepOriginalNames: true});
    }]);

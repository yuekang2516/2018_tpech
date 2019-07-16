angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'machineData',
            url: '/machineData',
            component: 'machineData'
        }, {
                keepOriginalNames: true
            }).state({
                parent: 'summary',
                name: 'machineDataDetail',
                url: '/machineDataDetail/:machineDataId?:macId',
                component: 'machineDataDetail'
            }, {
                    keepOriginalNames: true
                });
    }
]);
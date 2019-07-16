let tpl = require('./setting.html');

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider, stateHelperProvider) => {
        stateHelperProvider.state({
            name: 'setting',
            url: '/setting',
            template: tpl,
            controller: 'SettingController',
            controllerAs: 'setting'
        });
    }]);

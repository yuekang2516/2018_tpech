angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'home',
            name: 'allPatients',
            url: '/allPatients/',
            component: 'allPatients',
            //template: '<ui-view layout-fill layout="column"><patient-list layout-fill layout="column"></patient-list></ui-view>',
        }, { keepOriginalNames: true }).state({
            parent: 'home',
            name: 'allPatientsSearch',
            url: '/allPatients/search?:str',
            component: 'allPatients',
            reloadOnSearch: false,
            params: {
                isScanBarcode: {
                    dynamic: true,
                    value: ''
                }
            }
            // template: '<ui-view layout-fill layout="column"><patient-list layout-fill layout="column"></patient-list></ui-view>',
        }, { keepOriginalNames: true });
    }]);

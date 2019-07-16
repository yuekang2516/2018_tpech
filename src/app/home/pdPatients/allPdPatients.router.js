angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({
            parent: 'home',
            name: 'allPdPatients',
            url: '/allPdPatients/',
            component: 'allPdPatients',
            //template: '<ui-view layout-fill layout="column"><patient-list layout-fill layout="column"></patient-list></ui-view>',
        }, { keepOriginalNames: true }).state({
            parent: 'home',
            name: 'allPdPatientsSearch',
            url: '/allPdPatientsSearch/search?:str',
            component: 'allPdPatients',
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

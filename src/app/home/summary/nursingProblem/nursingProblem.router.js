require('./nursingProblem.less');

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
        $urlRouterProvider,
        stateHelperProvider
    ) => {
        stateHelperProvider.state({  // 透析護理問題處置紀錄表
            parent: 'summary',
            name: 'nursingProblemList',
            url: '/nursingProblemList',
            component: 'nursingProblemList'
        }, { keepOriginalNames: true }).state({   // 透析護理問題處置紀錄表 護理問題列表
            parent: 'nursingProblemList',
            name: 'nursingProblemItem',
            url: '/:nursingProblemId/nursingProblemItem',
            component: 'nursingProblemItem'
        }, { keepOriginalNames: true }).state({   // 透析護理問題處置紀錄表 表單本身
            parent: 'nursingProblemList',
            name: 'nursingProblemDetail',
            url: '/:nursingProblemId',
            component: 'nursingProblemDetail'
        }, { keepOriginalNames: true });
        // .state({  // 透析護理問題處置紀錄表 護理措施列表
        //     parent: 'nursingProblemItem',
        //     name: 'nursingProblemItemDetail',
        //     url: '/:nursingProblemItemId/:nursingProblemItemName',
        //     component: 'nursingProblemItemDetail'
        // }, { keepOriginalNames: true });
    }
]);

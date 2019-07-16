angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    (
      $urlRouterProvider,
      stateHelperProvider
    ) => {
      stateHelperProvider.state({
        parent: 'home',
        name: 'hygieneWork',
        url: '/hygieneWork',
        component: 'hygieneWork',
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                // you can lazy load files for an existing module
                return $ocLazyLoad.load(['ng_file_upload.js']);
            }]
        }
      }, { keepOriginalNames: true }).state({
        parent: 'home',
        name: 'hygieneWorkInFolder',
        url: '/hygieneWork/folders/:folderId',
        component: 'hygieneWork',
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                // you can lazy load files for an existing module
                return $ocLazyLoad.load(['ng_file_upload.js']);
            }]
        }
      }, { keepOriginalNames: true });
    }
  ]);

import './album.less';

angular.module('app').config([
    '$urlRouterProvider',
    'stateHelperProvider',
    ($urlRouterProvider,
     stateHelperProvider) => {
        stateHelperProvider.state({
            parent: 'summary',
            name: 'album',
            url: '/album',
            component: 'album',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['hammer.js', 'ng_file_upload.js']);
                }]
            }
        }, {keepOriginalNames: true}).state({
            parent: 'album',
            name: 'photoList',
            url: '/photoList',
            component: 'photoList',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('hammer.js');
                }]
            }
        }, {keepOriginalNames: true}).state({
            parent: 'album',
            name: 'albumList',
            url: '/albumList',
            component: 'albumList',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('hammer.js');
                }]
            }
        }, {keepOriginalNames: true}).state({
            parent: 'peritonealDialysisTabView',
            name: 'pdAlbum',
            url: '/album',
            component: 'album',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load(['hammer.js', 'ng_file_upload.js']);
                }]
            }
        }, {keepOriginalNames: true}).state({
            parent: 'pdAlbum',
            name: 'pdPhotoList',
            url: '/photoList',
            component: 'photoList',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('hammer.js');
                }]
            }

        }, {keepOriginalNames:true}).state({
            parent: 'pdAlbum',
            name: 'pdAlbumList',
            url: '/albumList',
            component: 'albumList',
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('hammer.js');
                }]
            }
        }, {keepOriginalNames:true});
    }
]);

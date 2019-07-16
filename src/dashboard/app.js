
// require('./app.less');
require('../languages/en-US.translations');
require('../languages/zh-TW.translations');
require('../languages/zh-CN.translations');

angular
    .module('app', [
        'ngMaterial',
        'ngSanitize',
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ui.router',
        'ui.router.stateHelper',
        'ngMessages',
        'ngStorage',
        'angularMoment',
        'SignalR',
        'ui.tinymce',
        'pascalprecht.translate'
    ])
    .config(AppConfig)
    .run(AppRun)
    .controller('AppController', AppController);

AppRun.$inject = ['$transitions', '$state', '$localStorage', 'SettingService', 'LoginService', '$window', '$mdToast'];
function AppRun($transitions, $state, $localStorage, SettingService, LoginService, $window, $mdToast) {
    $transitions.onEnter({ to: '*' }, (trans, stat) => {
        console.log('transition enter');

        // 檢查登入狀態
        // if (stat.name !== 'login' && !LoginService.isLogin()) {
        //     location.href = '/';
        // }

        return true;
    });

    document.addEventListener("deviceready", () => {
        console.log('app.js deviceready');

        $window.addEventListener("offline", () => {
            // 提示使用者檢查網路
            $mdToast.show(
                $mdToast.simple()
                    .textContent('網路已斷線，請檢查網路')
                    .hideDelay(false)
            );
        }, false);

        $window.addEventListener("online", () => {
            $mdToast.hide();
        }, false);
    }, false);

    let lang = navigator.language || navigator.userLanguages;

    moment.locale(SettingService.getLanguage());
}

AppConfig.$inject = [
    '$compileProvider',
    '$mdThemingProvider',
    '$mdGestureProvider',
    '$stateProvider',
    '$urlRouterProvider',
    '$mdIconProvider',
    '$mdAriaProvider',
    '$httpProvider',
    '$mdDateLocaleProvider',
    '$translateProvider'
];
function AppConfig(
    $compileProvider,
    $mdThemingProvider,
    $mdGestureProvider,
    $stateProvider,
    $urlRouterProvider,
    $mdIconProvider,
    $mdAriaProvider,
    $httpProvider,
    $mdDateLocaleProvider,
    $translateProvider
) {
    // Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;

    // Remove the header used to identify ajax call  that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // 登入完後, 伺服器會送回 cookie (.ASPXAUTH),
    // 這裡可以將每次的 http request 發出去前 intercept 認證資料包含cookie 在裡面
    // 以模擬 broswer 每次 request 送出 cookie 的行為
    // 後台就可以拿這個 cookie 判斷是否為己登入的使用者
    $httpProvider.defaults.withCredentials = true;

    // no cache
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

    // fix datepacker bug for angular 1.6.*
    // $compileProvider.preAssignBindingsEnabled(true);

    $mdThemingProvider.theme('default').primaryPalette('green').accentPalette('blue');

    // 關掉aria提醒
    $mdAriaProvider.disableWarnings();

    // 預設 md-datepicker 日期格式
    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('YYYY-MM-DD');
    };

    // 預設路由
    $urlRouterProvider.when(/^$/, '/dashboard');
    $urlRouterProvider.otherwise('/dashboard');

    $translateProvider.translations('en-us', en_us_translations);
    $translateProvider.translations('zh-tw', zh_tw_translations);
    $translateProvider.translations('zh-cn', zh_cn_translations);
    // sets the default language
    $translateProvider.preferredLanguage('zh-tw');

}

AppController.$inject = ['$scope', '$rootScope', '$mdToast', '$translate', 'SettingService'];
function AppController($scope, $rootScope, $mdToast, $translate, SettingService) {

    this.$onInit = function () {
        // get browser language
        // let lang = navigator.language || navigator.userLanguages;

        // console.log('lang: ' + lang);
        // $translate.use(lang.toLowerCase());
        $translate.use(SettingService.getLanguage());

        // 於 app 一開啟時，檢查網路狀態
        if (!navigator.onLine) {
            // 提示使用者檢查網路
            $mdToast.show(
                $mdToast.simple()
                    .textContent('網路已斷線，請檢查網路')
                    .hideDelay(false)
            );
        }
    };

}

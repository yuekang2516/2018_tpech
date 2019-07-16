require('./app.less');
require('../languages/en-US.translations');
require('../languages/zh-TW.translations');
require('../languages/zh-CN.translations');

let FastClick = require('fastclick');

agGrid.initialiseAgGridWithAngular1(angular);

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
        'infinite-scroll',
        'oc.lazyLoad',
        'pascalprecht.translate',
        'ui.grid',
        'ui.grid.pinning',
        'ui.grid.resizeColumns',
        'ui.grid.exporter',
        'ui.grid.autoResize',
        'ui.grid.infiniteScroll',
        'agGrid'
    ])
    .config(AppConfig)
    .run(AppRun)
    .controller('AppController', AppController);

AppRun.$inject = ['basicSettingService', '$timeout', '$transitions', '$state', '$localStorage', 'SettingService', 'LoginService', '$window', '$mdToast', 'nfcService', 'PatientService', 'showMessage', '$filter', '$rootScope'];
function AppRun(basicSettingService, $timeout, $transitions, $state, $localStorage, SettingService, LoginService, $window, $mdToast, nfcService, PatientService, showMessage, $filter, $rootScope) {
    FastClick.attach(document.body);

    let $translate = $filter('translate');

    let currentUser = {};

    // 需要自己 NFC 功能的頁面
    const noNeedNfcCallbackStates = ['machineData', 'machineDataDetail', 'bloodTransfusionDetail', 'patientDetail', 'profile'];

    // for 電子簽章繞掉 login
    const forPdfState = ['dialysisFormForPdf', 'referralSheetFormForPdf', 'prescriptionForPdf'];

    // parent 中 child history.go(-1) 不會跑 onEnter，因此多註冊 onSuccess
    $transitions.onSuccess({}, (trans) => {
        console.log('onSuccess', $state, trans);

        const currentState = trans.to();
        // 記錄前一個 url routing 狀態的名稱
        // onSuccess 會跑在 onDestroy 之後
        $state.previousStateNameForDestroy = currentState.name;

        // 若為 summary 及子頁面且不為清單中的頁面
        if ((currentState.parent && currentState.parent !== 'home' && _.indexOf(noNeedNfcCallbackStates, currentState.name) === -1) || currentState.name === 'summary') {
            console.log('onSuccess, nfcService');
            nfcService.listenNdef(PatientService.searchPatientOrGetMachineData);
            nfcService.listenTag(PatientService.searchPatientOrGetMachineData);
        }

    });

    $transitions.onEnter({ to: '*' }, (trans, stat) => {
        console.log('conflict test2');

        // 記錄前一個 url routing 狀態的名稱
        $state.previousStateName = trans.from().name;
        $state.previousState = trans.from();

        // 如果為設定頁, 則跳過
        if (stat.name === 'setting') {
            return true;
        }

        // 檢查登入狀態
        if (stat.name !== 'login' && !LoginService.isLogin() && forPdfState.indexOf(stat.name) < 0) {
            return $state.target('login');
        }

        function checkIsLogin(resolve) {
            // 還在登入狀態就延長登出時間
            if (LoginService.isLogin()) {
                console.log('its logged in!!!');
                SettingService.setLoginExpireTime();

                currentUser = SettingService.getCurrentUser();

                console.log('current state name', stat.name);

                // don't read patient nfc tag for the following:
                if (_.indexOf(noNeedNfcCallbackStates, stat.name) === -1) {
                    nfcService.listenNdef(PatientService._searchByRfid);
                    nfcService.listenTag(PatientService._searchByRfid);
                }
                // if (stat.name === 'machineData' || stat.name === 'machineDataDetail' || stat.name === 'continuousMachineData') {
                //     return true;
                // }
                // nfcService.listenNdef(PatientService._searchByRfid);
                // nfcService.listenTag(PatientService._searchByRfid);

                // console.log('current state', stat);
            } else {
                // if not logged in
                console.log('is not logged in!!!');
                nfcService.listenTag(_loginByRfid);
                nfcService.listenNdef(_loginByRfid);
            }

            if (typeof resolve !== 'function') {
                return true;
            } else {
                resolve();
            }
        }

        if (stat.name === 'login') {
            if (!SettingService.getCurrentHospital()) {
                return new Promise((resolve, reject) => {
                    // 若第一次登入會沒有醫院資訊，須從 server 撈
                    basicSettingService.getHospitalInfo().then((res) => {
                        SettingService.setCurrentHospital(res.data);
                        // $localStorage.hospitalInfo = res.data;
                        checkIsLogin(resolve);
                    }, () => {
                        checkIsLogin(resolve);
                    });
                });
            }
            checkIsLogin();
            return true;
        }

        if (forPdfState.indexOf(stat.name) < 0) {
            checkIsLogin();
        }

    });

    // Login callback
    function _loginByRfid(rfid) {
        console.log('login by rfid');

        // send loading status broadcast
        let loading = true;
        $rootScope.$broadcast('loading', loading);
        // 與掃 barcode 共用，若沒有 Id 欄位表示為 barcode
        let code = '';
        if (rfid.Id) {
            code = rfid.Id;
        } else {
            code = rfid;
        }
        LoginService.loginByRfid(code).then((res) => {
            if (res.data.Result) {
                $state.go('allPatients');
            } else {
                console.log('customMessage', res.data.Message);
                showMessage($translate('customMessage.' + res.data.Message));
            }
            loading = false;
            $rootScope.$broadcast('loading', loading);
        }, (result) => {
            console.log('rfid login failed');
            console.log(result);
            loading = false;
            $rootScope.$broadcast('loading', loading);
            showMessage(result);
            // showMessage(LoginService.httpStatusMessage(result.status));
        });
    }

    document.addEventListener("deviceready", () => {
        console.log('app.js deviceready');

        // 於 app 一開啟時，檢查網路狀態
        if (!navigator.onLine) {
            // 提示使用者檢查網路
            $mdToast.show(
                $mdToast.simple()
                    .textContent($translate('customMessage.OFFLINE'))
                    .hideDelay(false)
            );

            // check server is alive or not
            $timeout.cancel(checkIsOnline);
            checkIsOnline();
        }

        if (cordova.platformId === 'android' || cordova.platformId === 'ios') {
            // hide splash screen
            navigator.splashscreen.hide();
            nfcService.checkNfcAndInit();
        }

        document.addEventListener('resume', () => {
            if (cordova.platformId === 'android' || cordova.platformId === 'ios') {
                nfcService.checkNfcAndInit();
                return;
            }

            // browser 才需檢查目前登入狀態或登入者是否已變更
            // 仍為登入狀態，使用者變更或是目前在登入畫面，則直接重新整理
            if (LoginService.isLogin()) {
                // 因為可能關閉其他分頁會縮短有效時間，因此 resume 時須先再加長 expire time
                SettingService.setLoginExpireTime();

                if ($state.current.name === 'login') {
                    location.reload();
                } else if (currentUser.Id !== SettingService.getCurrentUser().Id) {
                    // 若在病人清單則重新整理，若否則幫忙轉到病人清單，避免不同使用者會看到別人負責的病人
                    if ($state.current.name === 'allPatients') {
                        location.reload();
                    } else {
                        // 變更使用者就回首頁
                        $state.go('allPatients').then(() => {
                            location.reload();
                        });
                    }

                }
                return;
            }

            // 已非登入狀態
            if ($state.current.name !== 'login') {
                location.reload();
            }

            // check nfc
        }, false);

        $window.addEventListener("offline", () => {
            // 提示使用者檢查網路
            // 若為 login 頁面，有可能是因為伺服器位置設錯，須給另外的提示
            let statusMsg = '';
            if ($state.current.name === 'login') {
                statusMsg = $translate('customMessage.OFFLINE_OR_SERVERERR');
            } else {
                statusMsg = $translate('customMessage.OFFLINE');
            }

            $mdToast.show(
                $mdToast.simple()
                    .textContent(statusMsg)
                    .hideDelay(false)
            );

            // check server is alive or not
            $timeout.cancel(checkIsOnline);
            checkIsOnline();

        }, false);

        // beforeunload -> browser
        if (cordova.platformId === 'browser') {
            $window.addEventListener("beforeunload", (e) => {
                console.log('Bye Bye!', window.performance.navigation.type);
  
                // 因為無法區別重新整理或是關閉，於關閉時將 expireTime 變為距離現在只剩 60 s -> 若設太短，有些網路環境不佳的狀況重新整理還是會超過有效期限導致登出，先抓 60 s
                if (LoginService.isLogin()) {
                    localStorage.setItem('ngStorage-loginExpireTime', JSON.stringify(moment().add(60, 's').format('YYYY/MM/DD HH:mm:ss')));
                }
  
            });
        }

    }, false);

    // 因為會有網路已連線但 navigator.onLine 仍為 false 的情形，改成一斷線就固定 call api 確定網路狀態
    // https://bugs.chromium.org/p/chromium/issues/detail?id=678075
    let checkOnlineTimer = null;    // 確認網路狀態的 timer
    function checkIsOnline() {
        SettingService.checkIsOnline().then(() => {
            console.log('checkIsOnline isOnline');
            SettingService.setIsOnline(true);
            $timeout.cancel(checkOnlineTimer);
            $mdToast.hide();
        }, (err) => {
            SettingService.setIsOnline(false);
            // 繼續 check 網路是否有通
            checkOnlineTimer = $timeout(() => {
                checkIsOnline();
            }, 1000);
        });
    }

    let lang = navigator.language || navigator.userLanguages;

    // if no language is stored in local storage
    // save system language in local storage
    if (!SettingService.getLanguage()) {
        SettingService.setLanguage(lang.toLowerCase());
    }
    moment.locale(SettingService.getLanguage());
    console.log(moment.locale());
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
    '$ocLazyLoadProvider',
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
    $ocLazyLoadProvider,
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
    $urlRouterProvider.when(/^$/, '/login');
    $urlRouterProvider.otherwise('/login');

    // $urlRouterProvider.deferIntercept();
    // lazy load 初始設定
    $ocLazyLoadProvider.config({
        debug: true
    });

    $translateProvider.translations('en-us', en_us_translations);
    $translateProvider.translations('zh-tw', zh_tw_translations);
    $translateProvider.translations('zh-cn', zh_cn_translations);
}

AppController.$inject = ['$scope', '$rootScope', '$mdToast', '$localStorage', '$translate', 'SettingService', 'bleService', 'LoginService'];
function AppController($scope, $rootScope, $mdToast, $localStorage, $translate, SettingService, bleService, LoginService) {

    this.$onInit = function () {

        $translate.use(SettingService.getLanguage());

        // 藍牙 init for 重開藍牙功能 (android only)
        if (cordova.platformId === 'android') {
            bleService.bleInit();
        }
    };

    // system message use snackbar
    $rootScope.$on('snackbar', (event, args) => {
        /*
          args 參數結構
          args = {
            type: 字串(必要: simple 或 action ) ,
            actionTxt: 字串(選擇性) ,
            msg: 字串(必要),
            callback: 函式(選擇性)
          }
        */
        const toast = $mdToast.simple().textContent(args.msg).position('bottom');

        if (args.type === 'simple') {
            toast.hideDelay(1000);
        }

        if (args.type === 'action') {
            toast.action(args.actionTxt).highlightAction(true).highlightClass('md-accent').hideDelay(3000);
        }

        $mdToast.show(toast).then((response) => {
            if (args.callback && response === 'ok') {
                args.callback();
            }
        });
    });

}

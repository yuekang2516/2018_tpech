require('../languages/en-US.admintranslations');
require('../languages/zh-TW.admintranslations');
require('../languages/zh-CN.admintranslations');

angular.module('app', [
  'ngMaterial',
  'ngAnimate',
  'ngCookies',
  'ui.router',
  'ui.router.stateHelper',
  'ngMessages',
  'ngStorage',
  'angularMoment',
  'infinite-scroll',
  'ngFileUpload',
  'pascalprecht.translate'
]).run(AppRun).config(AppConfig).controller('AppController', AppController);

AppRun.$inject = ['SettingService', '$transitions', 'LoginService', '$state'];
function AppRun(SettingService, $transitions, LoginService, $state) {

  let currentUser = {};

  $transitions.onEnter({ to: '*' }, (trans, stat) => {
    console.log('transition enter');
    console.log('stat', stat);

    // // 檢查登入狀態
    // if (stat.name !== 'login' && !LoginService.isLogin()) {
    //     location.href = '/';
    // }

      function checkIsLogin(resolve) {
          // 還在登入狀態就延長登出時間
          if (LoginService.isLogin()) {
              //console.log('its logged in!!!');
              SettingService.setLoginExpireTime();

              currentUser = SettingService.getCurrentUser();

              console.log('current state name', stat.name);

              // // don't read patient nfc tag for the following:
              // if (_.indexOf(noNeedNfcCallbackStates, stat.name) === -1) {
              //     nfcService.listenNdef(PatientService._searchByRfid);
              //     nfcService.listenTag(PatientService._searchByRfid);
              // }
              // // if (stat.name === 'machineData' || stat.name === 'machineDataDetail' || stat.name === 'continuousMachineData') {
              // //     return true;
              // // }
              // // nfcService.listenNdef(PatientService._searchByRfid);
              // // nfcService.listenTag(PatientService._searchByRfid);

              // // console.log('current state', stat);
          } else {
              // if not logged in
              console.log('is not logged in!!!');
              // nfcService.listenTag(_loginByRfid);
              // nfcService.listenNdef(_loginByRfid);
          }

          if (typeof resolve !== 'function') {
              return true;
          } else {
              resolve();
          }
      }

      checkIsLogin();

      return true;
});

// document.addEventListener("deviceready", () => {

  document.addEventListener('resume', () => {
    // if (cordova.platformId === 'android' || cordova.platformId === 'ios') {
    //     // hide splash screen
    //     navigator.splashscreen.hide();
    //     nfcService.checkNfcAndInit();
    //     return;
    // }

    // browser 才需檢查目前登入狀態或登入者是否已變更
    // 仍為登入狀態，使用者變更或是目前在登入畫面，則直接重新整理
    if (LoginService.isLogin()) {
        // 因為可能關閉其他分頁會縮短有效時間，因此 resume 時須先再加長 expire time
        SettingService.setLoginExpireTime();

        if ($state.current.name === 'login') {
            location.reload();
        } else if (currentUser.Id !== SettingService.getCurrentUser().Id) {
            // 若在病人清單則重新整理，若否則幫忙轉到病人清單，避免不同使用者會看到別人負責的病人
            if ($state.current.name === 'basicSetting') {
                location.reload();
            } else {
                // 變更使用者就回首頁
                $state.go('basicSetting').then(() => {
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
// }, false);

  console.log("L1=" + navigator.language);
  console.log("L2=" + navigator.userLanguages);
  let lang = navigator.language || navigator.userLanguages;
      // if no language is stored in local storage
      // save system language in local storage
      console.log("Language=" + SettingService.getLanguage());
      if (!SettingService.getLanguage()) {
          SettingService.setLanguage(lang.toLowerCase());
      }
      // // 更改moment語系設定
      // moment.locale('zh-tw');
      moment.locale(SettingService.getLanguage());
      // console.log(moment.locale());
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
  'stateHelperProvider',
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
  stateHelperProvider,
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

  // fix datepacker bug for angular 1.6.*
  // $compileProvider.preAssignBindingsEnabled(true);

  $mdThemingProvider.theme('default').primaryPalette('green').accentPalette('blue');

  // 設定日期格式
  $mdDateLocaleProvider.formatDate = function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  };

  // 關掉aria提醒
  $mdAriaProvider.disableWarnings();

  // 路由設定
  const adminCfg = {
    name: 'admin',
    url: '',
    component: 'admin',
    children: [{
        name: 'basicSetting',
        url: '/basicSetting',
        component: 'basicSetting'
      },
      {
        name: 'user',
        url: '/user',
        component: 'user'
      },
      {
        name: 'userDetail',
        url: '/user/:id',
        component: 'userDetail'
      },
      {
        name: 'phrase',
        url: '/phrase',
        component: 'systemPhrase'
      },
      {
        name: 'phraseDetail',
        url: '/phrase/:wardId/:categoryId/:phraseKind',
        component: 'phraseDetail'
      },
      {
        name: 'ward',
        url: '/ward',
        component: 'ward',
        children: [{
          name: 'wardDetail',
          url: '/:id',
          component: 'wardDetail'
        }]
      },
      {
        name: 'assessment',
        url: '/assessment',
        component: 'assessment',
        children: [{
          name: 'assessmentDetail',
          url: '/:id/:type',
          component: 'assessmentDetail'
        }]
      },
      {
        name: 'charge',
        url: '/charge?:wardId',
        component: 'charge',
        reloadOnSearch: false
      },
      {
        name: 'chargeDetail',
        url: '/charge/:wardId/:Id',
        component: 'chargeDetail'
      },
      {
        name: 'device',
        url: '/device',
        component: 'device'
      },
      {
        name: 'medicine',
        url: '/medicine',
        component: 'medicine'
      },
      {
        name: 'medicineDetail',
        url: '/medicine/:id',
        component: 'medicineDetail'
      },
      {
        name: 'custom',
        url: '/custom',
        component: 'custom'
      },
      {
        name: 'kidit',
        url: '/kidit',
        component: 'kidit'
      },
      {
        name: 'labexamImport',
        url: '/labexamImport',
        component: 'labexamImport'
      },
      {
        name: 'medicationExport',
        url: '/medicationExport',
        component: 'medicationExport'
      },
      {
        name: 'medicationImport',
        url: '/medicationImport',
        component: 'medicationImport'
      },
      {
        name: 'machineProperty',
        url: '/machineProperty',
        component: 'machineProperty'
      },
      {
        name: 'machinePropertyDetail',
        url: '/machineProperty/:id',
        component: 'machinePropertyDetail'
      },
      {
        name: 'machinePropertyImport',
        url: '/machinePropertyImport',
        component: 'machinePropertyImport'
      },
      {
        name: 'labexamItem',
        url: '/labexamItem',
        component: 'labexamItem'
      },
      {
        name: 'labexamItemDetail',
        url: '/labexamItem/:id',
        component: 'labexamItemDetail'
      },
      {
        name: 'other',
        url: '/other',
        component: 'other'
      },
      {
        name: 'log',
        url: '/log',
        component: 'log'
      },
      {
        name: 'info',
        url: '/info',
        component: 'info'
      },
      {
        name: 'statistic',
        url: '/statistic',
        component: 'statistic'
      },
      {
        name: 'epo',
        url: '/epo',
        component: 'epo'
      },
      {
        name: 'epoDetail',
        url: '/epo/:id',
        component: 'epoDetail'
      },
      {
        name: 'contract',
        url: '/contract',
        component: 'contract'
      },
      {
        name: 'contractDetail',
        url: '/contract/:id',
        component: 'contractDetail'
      },
      {
        name: 'payment',
        url: '/payment',
        component: 'payment'
      },
      {
        name: 'paymentDetail',
        url: '/payment/:id',
        component: 'paymentDetail'
      },
      {
        name: 'adminFile',
        url: '/adminFile',
        component: 'adminFile'
      },
    ]
  };

  stateHelperProvider.state(adminCfg, {
    keepOriginalNames: true
  });

  // 預設路由
    if (cordova.platformId === 'browser') {
  $urlRouterProvider.when(/^$/, '/basicSetting');
  $urlRouterProvider.otherwise('/basicSetting');
    } else {
        $urlRouterProvider.when(/^$/, '/user');
        $urlRouterProvider.otherwise('/user');
    }

    $translateProvider.translations('en-us', en_us_translations);
    $translateProvider.translations('zh-tw', zh_tw_translations);
    $translateProvider.translations('zh-cn', zh_cn_translations);
  }

AppController.$inject = ['SettingService', 'showMessage', '$translate'];

function AppController(SettingService, showMessage, $translate) {
    $translate.use(SettingService.getLanguage());
    // 如果不是管理者就導回首頁
    if (SettingService.getCurrentUser().Access !== 99) {
        location.href = '/';
        showMessage('現在身分非管理者，請使用管理者身分進入後台管理介面');
    }
}

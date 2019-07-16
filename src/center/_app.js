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

  function AppRun() {
    // 更改moment語系設定
    moment.locale('zh-tw');
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
    const homeCfg = {
      name: 'home',
      url: '',
      component: 'home',
       children: [{
           name: 'hospital',
           url: '/hospital',
           component: 'hospital'
         },
         {
           name: 'hospitalDetail',
           url: '/hospital/:id',
           component: 'hospitalDetail'
         },
        {
          name: 'centeruser',
          url: '/centeruser',
          component: 'centeruser'
        },
        {
           name: 'centeruserDetail',
           url: '/centeruser/:id',
           component: 'centeruserDetail'
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
         } // ,
    //     {
    //       name: 'phrase',
    //       url: '/phrase',
    //       component: 'systemPhrase'
    //     },
    //     {
    //       name: 'phraseDetail',
    //       url: '/phrase/:wardId/:categoryId',
    //       component: 'phraseDetail'
    //     },
    //     {
    //       name: 'ward',
    //       url: '/ward',
    //       component: 'ward',
    //       children: [{
    //         name: 'wardDetail',
    //         url: '/:id',
    //         component: 'wardDetail'
    //       }]
    //     },
    //     {
    //       name: 'assessment',
    //       url: '/assessment',
    //       component: 'assessment',
    //       children: [{
    //         name: 'assessmentDetail',
    //         url: '/:id',
    //         component: 'assessmentDetail'
    //       }]
    //     },
    //     {
    //       name: 'charge',
    //       url: '/charge?:wardId',
    //       component: 'charge',
    //       reloadOnSearch: false
    //     },
    //     {
    //       name: 'chargeDetail',
    //       url: '/charge/:wardId/:Id',
    //       component: 'chargeDetail'
    //     },
    //     {
    //       name: 'device',
    //       url: '/device',
    //       component: 'device'
    //     },
    //     {
    //       name: 'medicine',
    //       url: '/medicine',
    //       component: 'medicine'
    //     },
    //     {
    //       name: 'medicineDetail',
    //       url: '/medicine/:id',
    //       component: 'medicineDetail'
    //     },
    //     {
    //       name: 'custom',
    //       url: '/custom',
    //       component: 'custom'
    //     },
    //     {
    //       name: 'kidit',
    //       url: '/kidit',
    //       component: 'kidit'
    //     },
    //     {
    //       name: 'labexamImport',
    //       url: '/labexamImport',
    //       component: 'labexamImport'
    //     },
    //     {
    //       name: 'medicationExport',
    //       url: '/medicationExport',
    //       component: 'medicationExport'
    //     },
    //     {
    //       name: 'other',
    //       url: '/other',
    //       component: 'other'
    //     },
    //     {
    //       name: 'log',
    //       url: '/log',
    //       component: 'log'
    //     },
    //     {
    //       name: 'info',
    //       url: '/info',
    //       component: 'info'
    //     },
    //     {
    //       name: 'statistic',
    //       url: '/statistic',
    //       component: 'statistic'
    //     },
    //     {
    //       name: 'epo',
    //       url: '/epo',
    //       component: 'epo'
    //     },
    //     {
    //       name: 'epoDetail',
    //       url: '/epo/:id',
    //       component: 'epoDetail'
    //     }
       ]
    };

    stateHelperProvider.state(homeCfg, {
      keepOriginalNames: true
    });

    // 預設路由
    $urlRouterProvider.when(/^$/, '/login');
    $urlRouterProvider.otherwise('/login');
  }

  AppController.$inject = ['SettingService', 'showMessage'];

  function AppController(SettingService, showMessage) {
    // // 如果不是管理者就導回首頁
    // if (SettingService.getCurrentUser().Access !== 99) {
    //   location.href = '/';
    //   showMessage('現在身分非管理者，請使用管理者身分進入後台管理介面');
    // }
  }

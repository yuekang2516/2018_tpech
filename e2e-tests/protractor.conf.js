// jshint strict: false
var moment = require('moment');
let SpecReporter = require('jasmine-spec-reporter').SpecReporter;
exports.config = {

  allScriptsTimeout: 11000,
  directConnect: true,
  getPageTimeout: 10000,
  
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
    browser.driver.manage().window().maximize();
    protractor.appPageObjectPath = __dirname + '/pageObjects/app';
    protractor.adminPageObjectPath = __dirname + '/pageObjects/admin';

    //global variables
    global.dateTime = moment().format('MMDDmmss');
    //toast messages
    global.toastMessage = {
      saveSuccess: '新增成功',
      createRecordSuccess: '開表成功',
      cantFindUser: '無此使用者'
    };
  },

  //test suites 
  suites: {
    login: 'spec/app/login.spec.js',
    dialysis: 'spec/app/dialysis/*.spec.js',
    summary: 'spec/app/summary/*.spec.js',
    app: 'spec/app/**/*.spec.js',
    admin: 'spec/admin/*.spec.js',
    addPatient: 'spec/app/patient.spec.js',
    allPatients: 'spec/app/allPatients.spec.js',
    test: 'spec/app/dialysis/doctorNote.spec.js'
  },

  specs: [
    // '*.js'
    'spec/app/login.spec.js',
    'spec/app/**/*.spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8321/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 50000,
    showTiming: true,
    showColors: true
  }

};

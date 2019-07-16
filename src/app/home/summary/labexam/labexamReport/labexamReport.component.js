import tpl from './labexamReport.html';


angular
    .module('app')
    .component('labexamReport', {
        template: tpl,
        controller: labexamReportCtrl
    });

labexamReportCtrl.$inject = [
    '$state',
    '$stateParams',
    '$mdDialog',
    '$mdToast',
    'SettingService',
    'PatientService',
    'showMessage',
    '$interval',
    '$sessionStorage',
    'labexamService',
    '$timeout',
    'labexamSettingService',
    '$filter'
];


function labexamReportCtrl($state, $stateParams, $mdDialog, $mdToast, SettingService,
    PatientService, showMessage, $interval, $sessionStorage, labexamService, $timeout, labexamSettingService, $filter) {
    let self = this;

    let $translate = $filter('translate');

    self.loading = true;
    
    self.user = SettingService.getCurrentUser();
    self.labexamId = $stateParams.labexamId;
    // self.platform = cordova.platformId;
    self.isBrowser = cordova.platformId === 'browser';

   
    // 初始化
    self.$onInit = () => {
        self.loading = false;
        
    };


    


    self.goback = () => {
        history.go(-1);
    };

    
}

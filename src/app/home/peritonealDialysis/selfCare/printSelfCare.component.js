import tpl from './printSelfCare.html';
//import './printSelfCare.less';
angular.module('app').component('printSelfCare', {
    template: tpl,
    controller: printSelfCareCtrl
});

printSelfCareCtrl.$inject = [
    '$stateParams', 'SettingService', 'PatientService', 'summaryReportService', '$mdMedia', '$filter', 'showMessage','$state'];
function printSelfCareCtrl(
    $stateParams, SettingService, PatientService, summaryReportService, $mdMedia, $filter, showMessage,$state) {
    //console.log('is item--',item);
    const self = this;
    
    let _PrintData = $stateParams.item;
    self.sCareDataObj = _PrintData; //自我照護表資料
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.loading = true;
    self.isBrowser = cordova.platformId === 'browser';
    self.reportHospitaArea = "";
    let Hospitalist = [
        { "Value":"G","Text":"中興院區"}, //G
        { "Value":"Q","Text":"忠孝院區"}, //Q
        { "Value":"H","Text":"和平院區"}, //H
        { "Value":"F","Text":"仁愛院區"}, //F
        { "Value":"M","Text":"陽明院區"}  //M
    ]
    self.$onInit = function onInit() {
        if(_.isEmpty($stateParams.item)) {
            history.go(-1);
        }
        self.getList();
        self.loading = false;
    
    };
    
    self.getList = function () {
        self.loading = true;
        PatientService.getById(self.sCareDataObj.Patientid).then((res) => {
            self.currentPatient = res.data;            
            console.log("self.currentPatient--",self.currentPatient);
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });
        self.currentHospital = SettingService.getCurrentHospital();
        let filterHosp = Hospitalist.filter(e =>{
            return e.Value == self.currentHospital.SystemCode
        });
        if(filterHosp.length > 0){
            self.reportHospitaArea = filterHosp[0].Text;
        }
        ///患者基本資料
        // orderSTService.getListByPatientID(self.patientId).then((res) => {
        //     console.log("orderSTService getList Success", res);
        //     self.sCareList = res.data;
        //     console.log("orderSTList--",self.orderSTList);
        //     //self.print();
        //     self.loading = false;
        // }, (res) => {
        //     console.log("orderSTService getList Fail", res);

        // });
    };


    
    self.$onDestroy = function () {

    };

    self.saveData = function () {

    };
    self.gotoState = function goto(routeName) {
        history.go(-1);
        // $state.go(routeName, null, {
        //     location: 'replace'
        // });
    };


    self.print = function(){    
        // window.onafterprint = function(e){
        //     $(window).off('mousemove', window.onafterprint);
        //     console.log('Print Dialog Closed..');
        //     //self.gotoState('selfCare');
        // };
    
        window.print();
    
        // setTimeout(function(){
        //     $(window).on('mousemove', window.onafterprint);
        // }, 1);       
    }

}
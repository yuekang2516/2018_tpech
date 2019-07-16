import tpl from './printApd.html';


angular.module('app').component('printApd', {
    template: tpl,
    controller: printApdCtrl
});
 
printApdCtrl.$inject = [
    '$stateParams', 'SettingService', 'apdSettingService',
    '$mdDialog', '$mdMedia', 'PatientService', '$filter', 'showMessage', '$state'];
function printApdCtrl(
    $stateParams, SettingService, apdSettingService,
    $mdDialog, $mdMedia, PatientService, $filter, showMessage, $state) {

    const self = this;
    let $translate = $filter('translate');

    let _PrintData = $stateParams.item;
    self.printApdObj = _PrintData; //自我照護表資料

    console.log("self.printApdObj--",self.printApdObj);

    self.patientId = $stateParams.patientId;
    self.currentPatient = [];
    self.loading = true;
    // List Data Array
    self.apdList = [];
    self.reportHospitaArea = "";
    let Hospitalist = [
        { "Value":"G","Text":"中興院區"}, //G
        { "Value":"Q","Text":"忠孝院區"}, //Q
        { "Value":"H","Text":"和平院區"}, //H
        { "Value":"F","Text":"仁愛院區"}, //F
        { "Value":"M","Text":"陽明院區"}  //M
    ]

    console.log("self.patientId--", self.patientId);

    self.$onInit = function onInit() {
        if(_.isEmpty($stateParams.item)) {
            history.go(-1);
        }
        self.getList();
        self.loading = false;
    };

    self.gotoState = function goto(routeName) {
        history.go(-1);
    };

    self.getList = function () {
        self.currentHospital = SettingService.getCurrentHospital();
        let filterHosp = Hospitalist.filter(e =>{
            return e.Value == self.currentHospital.SystemCode
        });
        if(filterHosp.length > 0){
            self.reportHospitaArea = filterHosp[0].Text;
        }
        self.loading = true;

        //總治療量  
        self.printApdObj.Total_Therapeutic_Dose = self.printApdObj.Total_Therapeutic_Dose == "其他" ? self.printApdObj.TotalTherapeuticDoseOther : self.printApdObj.Total_Therapeutic_Dose;                
        // 注入量 self.fillVolOptions = ['1000', '1500', '2000', '2500', '其他'];  
        self.printApdObj.Injection_Volume = self.printApdObj.Injection_Volume == "其他" ? self.printApdObj.InjectionVolumeOther : self.printApdObj.Injection_Volume;        
        // 最末注入量   self.lastFillVolOptions = ['1000', '1500', '2000', '2500', '其他'];  
        self.printApdObj.Last_Injection_Volume = self.printApdObj.Last_Injection_Volume == "其他" ? self.printApdObj.LastInjectionVolumeOther : self.printApdObj.Last_Injection_Volume;        
        // 病人體重     self.patientWeightOptions = ['40', '50', '60', '70', '80', '其他'];
        self.printApdObj.Patient_Weight = self.printApdObj.Patient_Weight == "其他" ? self.printApdObj.PatientWeightOther : self.printApdObj.Patient_Weight;                
        // 0 週期引流警訊     self.iDrainAlarmOptions = ['1000', '1500', '2000', '2500', '其他']; 
        self.printApdObj.Zero_Cycle_Drainage_Warning = self.printApdObj.Zero_Cycle_Drainage_Warning == "其他" ? self.printApdObj.ZeroCycleDrainageWarningOther : self.printApdObj.Zero_Cycle_Drainage_Warning;                
        // 週期數     self.cyclesOptions = ['2', '3', '4', '5', '其他'];   
        self.printApdObj.Cycle_Number = self.printApdObj.Cycle_Number == "其他" ? self.printApdObj.CycleNumberOther : self.printApdObj.Cycle_Number;                
        // 總脫水目標    self.ufTargetOptions = ['1000', '1500', '2000', '2500', '其他'];
        self.printApdObj.Final_Manual_Drainage = self.printApdObj.Final_Manual_Drainage == "其他" ? self.printApdObj.FinalManualDrainageOther : self.printApdObj.Final_Manual_Drainage;                
        // 週期最小引流量     self.minDrainVolOptions = ['60', '70', '80', '85', '其他'];   
        self.printApdObj.Minimum_Periodic_Drainage =  self.printApdObj.Minimum_Periodic_Drainage == "其他" ? self.printApdObj.MinimumPeriodicDrainageOther : self.printApdObj.Minimum_Periodic_Drainage;                

        //最末袋葡萄糖濃度
        self.printApdObj.Last_Glucose_Concentration = self.printApdObj.Last_Glucose_Concentration == "same" ? "相同" : "不同";
        //最末手控引流
        //self.printApdObj.Isfinal_Manual_Drainage = self.printApdObj.Isfinal_Manual_Drainage == "Y" ? "是" : "否";
        
        PatientService.getById(self.printApdObj.Patientid).then((res) => {
            self.currentPatient = res.data;
            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });

        apdSettingService.getListByPatientID(self.patientId).then((res) => {
            console.log("apdSettingService getList Success", res);
            self.apdList = res.data;
            console.log("apdList--", self.apdList);
            self.loading = false;

            if (res.data.length > 0) {
                let i = 0;
                res.data.forEach((res) => {
                    //self.apdList[i].no = i+1;
                    i++;
                });
            }
        }, (res) => {
            console.log("apdSettingService getList Fail", res);
        });
        console.log("apdListNo", self.apdList.no);
    };

    self.print = function(){
        window.print();
    }


    self.$onDestroy = function () {
        // 清空 interval
        // if (angular.isDefined(interval)) {
        //     $interval.cancel(interval);
        // }
        // if (angular.isDefined(executeInterval)) {
        //     $interval.cancel(executeInterval);
        // }
    };



}
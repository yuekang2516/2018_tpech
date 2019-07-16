
angular
    .module('app')
    .controller('apdEditController', apdEditController);

apdEditController.$inject = [
    '$stateParams', 'PatientService', '$mdDialog', 'showMessage', 'SettingService',
    'apdSettingService', '$filter', 'apdItem','$rootScope','pdTreatService'];
function apdEditController(
    $stateParams, PatientService, $mdDialog, showMessage, SettingService,
    apdSettingService, $filter, apdItem,$rootScope,pdTreatService) {

    const self = this;
    const $translate = $filter('translate');

    self.patientId = $stateParams.patientId;
    self.isBrowser = cordova.platformId === 'browser';
    // APD Setting 資料物件

    //self.isCreate = apdItem === null;
    self.apdDataObj = [];    
    self.apdDataObj = angular.copy(apdItem);

    console.log("apdEdit sapdDataObj---",self.apdDataObj);

    let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    //#region UI 預設選項
    
    self.TreatmentMethod = ["CCPD","IPD","TPD"];
    // 總治療量 Options
    self.TotalTherapeuticDose = ['5000', '7500', '10000', '12000', '其他'];
    //治療時間
    self.TreatmentTimeHh = ['0','8','10','12','其他'];
    self.TreatmentTimeMm = ['0','5','10','15','20','25','30','35','40','45','50','55','其他'];
    //留置時間
    self.RetentionTimeHh = ['0','1','2','3','4','5','6','7','8','9','10','11','12','其他'];
    self.RetentionTimeMm = ['0','5','10','15','20','25','30','35','40','45','50','55','其他'];
    // 注入量 Options
    self.InjectionVolume = ['1000', '1500', '2000', '2500', '其他'];
    // 最末袋注入量 Options
    self.LastInjectionVolume = ['1000', '1500', '2000', '2500', '其他'];
    // 病人體重 Options
    self.PatientWeight = ['40', '50', '60', '70', '80', '其他'];
    // 0週期引流警訊 Options
    self.ZeroCycleDrainageWarning = ['1000', '1500', '2000', '2500', '其他'];
    // 週期數 Options
    self.CycleNumber = ['2', '3', '4', '5', '其他'];    
    // 設定透析液溫度 Options
    self.DialysateTemperatureSetting = ['35', '36', '37', '其他'];
    // 總脫水目標
    self.FinalManualDrainage = ['1000', '1500', '2000', '2500', '其他'];
    // 週期最小引流量
    self.MinimumPeriodicDrainage = ['60', '70', '80', '85', '其他'];
    //#endregion
    //#endregion

    PatientService.getById(self.patientId).then((res) => {
        self.currentPatient = res.data;
        console.log("self.currentPatient--", self.currentPatient);
    }, (res) => {
        console.log("apdSettingService getList Fail", res);
    });
    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    // save
    self.ok = function ok() {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        //#region 整理 Data Object
        //#region 基本資料
        self.apdDataObj.Record_Date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));;
        self.apdDataObj.Patientid = self.patientId;
        self.apdDataObj.HospitalId = SettingService.getCurrentHospital().Id;
        self.apdDataObj.Status = "Normal";
        //#endregion
        //總治療量   number Total_Therapeutic_Dose 0
        if(self.apdDataObj.Total_Therapeutic_Dose == "0" || self.apdDataObj.Total_Therapeutic_Dose == null){
            self.apdDataObj.Total_Therapeutic_Dose = 0;
        }else if(self.apdDataObj.Total_Therapeutic_Dose == "其他"){
            self.apdDataObj.Total_Therapeutic_Dose = parseInt("-999"+self.apdDataObj.TotalTherapeuticDoseOther);
        }else{
            self.apdDataObj.Total_Therapeutic_Dose = self.apdDataObj.Total_Therapeutic_Dose
        }        
        console.log("Total_Therapeutic_Dose-2-",self.apdDataObj.Total_Therapeutic_Dose);
        // 注入量 number  Injection_Volume 0
        if(self.apdDataObj.Injection_Volume == "0" || self.apdDataObj.Injection_Volume == null){
            self.apdDataObj.Injection_Volume = 0;
        }else if(self.apdDataObj.Injection_Volume == "其他"){
            self.apdDataObj.Injection_Volume = parseInt("-999"+self.apdDataObj.InjectionVolumeOther);
        }else{
            self.apdDataObj.Injection_Volume = self.apdDataObj.Injection_Volume
        }
        // 
        // 最末注入量   number Last_Injection_Volume 0
        if(self.apdDataObj.Last_Injection_Volume == "0" || self.apdDataObj.Last_Injection_Volume == null){
            self.apdDataObj.Last_Injection_Volume = 0;
        }else if(self.apdDataObj.Last_Injection_Volume == "其他"){
            self.apdDataObj.Last_Injection_Volume = parseInt("-999"+self.apdDataObj.LastInjectionVolumeOther);
        }else{
            self.apdDataObj.Last_Injection_Volume = self.apdDataObj.Last_Injection_Volume
        }
        // 病人體重     number Patient_Weight 0
        if(self.apdDataObj.Patient_Weight == "0" || self.apdDataObj.Patient_Weight == null){
            self.apdDataObj.Patient_Weight = 0;
        }else if(self.apdDataObj.Patient_Weight == "其他"){
            self.apdDataObj.Patient_Weight = parseInt("-999"+self.apdDataObj.PatientWeightOther);
        }else{
            self.apdDataObj.Patient_Weight = self.apdDataObj.Patient_Weight
        }
        // 0 週期引流警訊     number Zero_Cycle_Drainage_Warning 0
        if(self.apdDataObj.Zero_Cycle_Drainage_Warning == "0" || self.apdDataObj.Zero_Cycle_Drainage_Warning == null){
            self.apdDataObj.Zero_Cycle_Drainage_Warning = 0;
        }else if(self.apdDataObj.Zero_Cycle_Drainage_Warning == "其他"){
            self.apdDataObj.Zero_Cycle_Drainage_Warning = parseInt("-999"+self.apdDataObj.ZeroCycleDrainageWarningOther);
        }else{
            self.apdDataObj.Zero_Cycle_Drainage_Warning = self.apdDataObj.Zero_Cycle_Drainage_Warning
        }
        // 週期數     number Cycle_Number 0
        if(self.apdDataObj.Cycle_Number == "0" || self.apdDataObj.Cycle_Number == null){
            self.apdDataObj.Cycle_Number = 0;
        }else if(self.apdDataObj.Cycle_Number == "其他"){
            self.apdDataObj.Cycle_Number = parseInt("-999"+self.apdDataObj.CycleNumberOther);
        }else{
            self.apdDataObj.Cycle_Number = self.apdDataObj.Cycle_Number
        }
        //設定透析液溫度number Dialysate_Temperature_Setting 0
        if(self.apdDataObj.Dialysate_Temperature_Setting == "0" || self.apdDataObj.Dialysate_Temperature_Setting == null){
            self.apdDataObj.Dialysate_Temperature_Setting = 0;
        }else if(self.apdDataObj.Dialysate_Temperature_Setting == "其他"){
            self.apdDataObj.Dialysate_Temperature_Setting = parseInt("-999"+self.apdDataObj.DialysateTemperatureSettingOther);
        }else{
            self.apdDataObj.Dialysate_Temperature_Setting = self.apdDataObj.Dialysate_Temperature_Setting
        }
        // 總脫水目標    number Final_Manual_Drainage 0
        if(self.apdDataObj.Final_Manual_Drainage == "0" || self.apdDataObj.Final_Manual_Drainage == null){
            self.apdDataObj.Final_Manual_Drainage = 0;
        }else if(self.apdDataObj.Final_Manual_Drainage == "其他"){
            self.apdDataObj.Final_Manual_Drainage = parseInt("-999"+self.apdDataObj.FinalManualDrainageOther);
        }else{
            self.apdDataObj.Final_Manual_Drainage = self.apdDataObj.Final_Manual_Drainage
        }
        // 週期最小引流量     number Minimum_Periodic_Drainage  0
        if(self.apdDataObj.Minimum_Periodic_Drainage == "0" || self.apdDataObj.Minimum_Periodic_Drainage == null){
            self.apdDataObj.Minimum_Periodic_Drainage = 0;
        }else if(self.apdDataObj.Minimum_Periodic_Drainage == "其他"){
            self.apdDataObj.Minimum_Periodic_Drainage = parseInt("-999"+self.apdDataObj.MinimumPeriodicDrainageOther);
        }else{
            self.apdDataObj.Minimum_Periodic_Drainage = self.apdDataObj.Minimum_Periodic_Drainage
        }
        // 治療時間 TherapyTime
        //留置時間
        if(self.apdDataObj.Treatment_Time_Hh == "0" || self.apdDataObj.Treatment_Time_Hh == null){
            self.apdDataObj.Treatment_Time_Hh = "0";
        }else if(self.apdDataObj.Treatment_Time_Hh == "其他"){
            if(typeof(self.apdDataObj.TreatmentTimeHhOther) == 'undefined'){
                self.apdDataObj.Treatment_Time_Hh = "oher_";
            }else{
                self.apdDataObj.Treatment_Time_Hh = "oher_"+self.apdDataObj.TreatmentTimeHhOther;
            }
        }else{
            self.apdDataObj.Treatment_Time_Hh = self.apdDataObj.Treatment_Time_Hh
        }
        if(self.apdDataObj.Treatment_Time_Mm == "0" || self.apdDataObj.Treatment_Time_Mm == null){
            self.apdDataObj.Treatment_Time_Mm = "0";
        }else if(self.apdDataObj.Treatment_Time_Mm == "其他"){
            if(typeof(self.apdDataObj.TreatmentTimeHhOther) == 'undefined'){
                self.apdDataObj.Treatment_Time_Mm = "oher_";
            }else{
                self.apdDataObj.Treatment_Time_Mm = "oher_"+self.apdDataObj.TreatmentTimeMmOther;
            }
        }else{
            self.apdDataObj.Treatment_Time_Mm = self.apdDataObj.Treatment_Time_Mm
        }
        if(self.apdDataObj.Retention_Time_Hh == "0" || self.apdDataObj.Retention_Time_Hh == null){
            self.apdDataObj.Retention_Time_Hh = "0";
        }else if(self.apdDataObj.Retention_Time_Hh == "其他"){

            if(typeof(self.apdDataObj.Retention_Time_Hh) == 'undefined'){
                self.apdDataObj.Retention_Time_Hh = "oher_";
            }else{
                self.apdDataObj.Retention_Time_Hh = "oher_"+self.apdDataObj.RetentionTimeHhOther;
            }
            
        }else{
            self.apdDataObj.Retention_Time_Hh = self.apdDataObj.Retention_Time_Hh
        }
        if(self.apdDataObj.Retention_Time_Mm == "0" || self.apdDataObj.Retention_Time_Mm == null){
            self.apdDataObj.Retention_Time_Mm = "0";
        }else if(self.apdDataObj.Retention_Time_Mm == "其他"){
            if(typeof(self.apdDataObj.Retention_Time_Hh) == 'undefined'){
                self.apdDataObj.Retention_Time_Mm = "oher_";
            }else{
                self.apdDataObj.Retention_Time_Mm = "oher_"+self.apdDataObj.RetentionTimeMmOther;
            }
        }else{
            self.apdDataObj.Retention_Time_Mm = self.apdDataObj.Retention_Time_Mm
        }
        //#endregion

        //治療方式
        self.apdDataObj.Treatment_Method = self.apdDataObj.Treatment_Method;
        //最末袋葡萄糖濃度
        self.apdDataObj.Last_Glucose_Concentration = self.apdDataObj.Last_Glucose_Concentration;
        
        //最末手控引流-是否
        self.apdDataObj.Isfinal_Manual_Drainage = self.apdDataObj.Isfinal_Manual_Drainage;
        //總脫水目標
        self.apdDataObj.Total_Dehydration_Target = self.apdDataObj.Total_Dehydration_Target;
        //最末手控引流-警訊
        self.apdDataObj.Islast_Manual_Drainage_Warn = self.apdDataObj.Islast_Manual_Drainage_Warn;
        //備註事項
        self.apdDataObj.Notes = self.apdDataObj.Notes;

        if(self.apdDataObj.isCopy == true){
            //self.apdDataObj.Id = "";
        }
        console.log("APDSetting Data Object", self.apdDataObj);

        if(self.apdDataObj.isCreate == true || self.apdDataObj.isCopy == true){
            
            self.apdDataObj.CreatedTime = toDay;
            self.apdDataObj.CreatedUserId = SettingService.getCurrentUser().Id;
            self.apdDataObj.CreatedUserName = SettingService.getCurrentUser().Name;

            self.apdDataObj.Patientid = self.currentPatient.Id;
            self.apdDataObj.Patient_Name = self.currentPatient.Name;
            self.apdDataObj.Medicalid = self.currentPatient.MedicalId;
            self.apdDataObj.Hospitalid = self.currentPatient.HospitalId;
            self.apdDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;

            apdSettingService.post(self.apdDataObj).then((res) => {
                console.log("APDSetting Post Success", res);
                showMessage($translate('apdSetting.dialog.createSuccess'));   
                $rootScope.$emit("apdSettingRefreshEvent", "");
                self.apdDataObj.isCopy = false;

            }, (res) => {
                console.log("APDSetting Post Fail", res);
                showMessage($translate('apdSetting.dialog.createFail'));   
                $rootScope.$emit("apdSettingRefreshEvent", "");
                
            });        
        }else{
            self.apdDataObj.ModifiedTime = toDay;
            self.apdDataObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.apdDataObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            apdSettingService.put(self.apdDataObj).then((res) => {
                console.log("APDSetting Put Success", res);
                showMessage($translate('apdSetting.dialog.editSuccess'));   
                $rootScope.$emit("apdSettingRefreshEvent", "");

            }, (res) => {
                console.log("APDSetting Put Fail", res);
                showMessage($translate('apdSetting.dialog.editFail'));   
                $rootScope.$emit("apdSettingRefreshEvent", "");
    
            });
        }

        $mdDialog.hide();
    };    
    
    self.getLastList = function(){
        pdTreatService.getLastList($stateParams.patientId).then((res) => {
            console.log("pdTreatService getLastList SUCCESS", res);
            self.treatList = res.data;
            console.log("res.data.length--get-",self.treatList.Id);
            
            self.apdDataObj.Treatment_Method = self.treatList.Machine_Type;
            if(self.treatList.Id !== null){           
                self.apdDataObj.Treatment_Time_Hh = self.treatList.Pd_Treatment_Time_Hh.toString();     
                if(self.treatList.Treatment_Time_Hh !== null){ 
                    if (self.apdDataObj.Treatment_Time_Hh.indexOf("oher_") >= 0) {
                        self.apdDataObj.TreatmentTimeHhOther = self.apdDataObj.Treatment_Time_Hh.substr(5);
                        self.apdDataObj.Treatment_Time_Hh = "其他";
                    }else{
                        self.apdDataObj.Treatment_Time_Hh = self.apdDataObj.Treatment_Time_Hh;
                    }
                }else{
                    self.apdDataObj.Treatment_Time_Hh = "0";
                }
                self.apdDataObj.Treatment_Time_Mm = self.treatList.Pd_Treatment_Time_Mm.toString();
                if(self.apdDataObj.Treatment_Time_Mm !== null){ 
                    if (self.apdDataObj.Treatment_Time_Mm.indexOf("oher_") >= 0) {
                        self.apdDataObj.TreatmentTimeMmOther = self.apdDataObj.Treatment_Time_Mm.substr(5);
                        self.apdDataObj.Treatment_Time_Mm = "其他";
                    }else{
                        self.apdDataObj.Treatment_Time_Mm = self.apdDataObj.Treatment_Time_Mm;
                    }
                }else{
                    self.apdDataObj.Treatment_Time_Mm = "0";
                }
                self.apdDataObj.Retention_Time_Hh = self.treatList.Machine_Stay_Time_Hh.toString();
                if(self.apdDataObj.Retention_Time_Hh !== null){ 
                    if (self.apdDataObj.Retention_Time_Hh.indexOf("oher_") >= 0) {
                        self.apdDataObj.RetentionTimeHhOther = self.apdDataObj.Retention_Time_Hh.substr(5);
                        self.apdDataObj.Retention_Time_Hh = "其他";
                    }else{
                        self.apdDataObj.Retention_Time_Hh = self.apdDataObj.Retention_Time_Hh;
                    }
                }else{
                    self.apdDataObj.Retention_Time_Hh = "0";
                }  
                self.apdDataObj.Retention_Time_Mm = self.treatList.Machine_Stay_Time_Mm.toString();
                if(self.apdDataObj.Retention_Time_Mm !== null){ 
                    if (self.apdDataObj.Retention_Time_Mm.indexOf("oher_") >= 0) {
                        self.apdDataObj.RetentionTimeMmOther = self.apdDataObj.Retention_Time_Mm.substr(5);
                        self.apdDataObj.Retention_Time_Mm = "其他";
                    }else{
                        self.apdDataObj.Retention_Time_Mm = self.apdDataObj.Retention_Time_Mm;
                    }
                }else{
                    self.apdDataObj.Retention_Time_Mm = "0";
                }
                //總治療量   number Total_Therapeutic_Dose
                self.apdDataObj.Total_Therapeutic_Dose = self.treatList.Pd_Total_Treatment_Volume;   
                if(self.apdDataObj.Total_Therapeutic_Dose !== 0){        
                    self.apdDataObj.Total_Therapeutic_Dose = self.apdDataObj.Total_Therapeutic_Dose.toString();
                    if (self.apdDataObj.Total_Therapeutic_Dose.indexOf("-999") >= 0) {
                        self.apdDataObj.TotalTherapeuticDoseOther = parseInt(self.apdDataObj.Total_Therapeutic_Dose.substr(4));
                        self.apdDataObj.Total_Therapeutic_Dose = "其他";
                    }else{
                        self.apdDataObj.Total_Therapeutic_Dose = self.apdDataObj.Total_Therapeutic_Dose.toString();
                    }
                }else{
                    self.apdDataObj.Total_Therapeutic_Dose = "0";
                }
                // 注入量 number  Injection_Volume
                self.apdDataObj.Injection_Volume = self.treatList.Pd_Injection_Volume;   
                if(self.apdDataObj.Injection_Volume !== 0){          
                    self.apdDataObj.Injection_Volume = self.apdDataObj.Injection_Volume.toString();
                    if (self.apdDataObj.Injection_Volume.indexOf("-999") >= 0) {
                        self.apdDataObj.InjectionVolumeOther = parseInt(self.apdDataObj.Injection_Volume.substr(4));
                        self.apdDataObj.Injection_Volume = "其他";
                    }else{
                        self.apdDataObj.Injection_Volume = self.apdDataObj.Injection_Volume.toString();
                    }
                }else{
                    self.apdDataObj.Injection_Volume = "0";
                } 

                // 最末注入量   number Last_Injection_Volume
                self.apdDataObj.Last_Injection_Volume = self.treatList.Pd_Last_Bag_Injection_Volume;  
                if(self.apdDataObj.Last_Injection_Volume !== 0){     
                    self.apdDataObj.Last_Injection_Volume = self.apdDataObj.Last_Injection_Volume.toString();
                    if (self.apdDataObj.Last_Injection_Volume.indexOf("-999") >= 0) {
                        self.apdDataObj.LastInjectionVolumeOther = parseInt(self.apdDataObj.Last_Injection_Volume.substr(4));
                        self.apdDataObj.Last_Injection_Volume = "其他";
                    }else{
                        self.apdDataObj.Last_Injection_Volume = self.apdDataObj.Last_Injection_Volume.toString();
                    }
                }else{
                    self.apdDataObj.Last_Injection_Volume = "0";
                }            

                //末袋濃度是否相同
                self.apdDataObj.Last_Glucose_Concentration = self.treatList.Pd_Ismatch_Last_Bag_Concn; 
                // 病人體重     number Patient_Weight
                self.apdDataObj.Patient_Weight = self.treatList.Machine_Patientweight;
                if(self.apdDataObj.Patient_Weight !== 0){         
                    self.apdDataObj.Patient_Weight = self.apdDataObj.Patient_Weight.toString();
                    if (self.apdDataObj.Patient_Weight.indexOf("-999") >= 0) {
                        self.apdDataObj.PatientWeightOther = parseInt(self.apdDataObj.Patient_Weight.substr(4));
                        self.apdDataObj.Patient_Weight = "其他";
                    }else{
                        self.apdDataObj.Patient_Weight = self.apdDataObj.Patient_Weight.toString();
                    }
                }else{
                    self.apdDataObj.Patient_Weight = "0";
                }        

                // 0 週期引流警訊     number Zero_Cycle_Drainage_Warning
                self.apdDataObj.Zero_Cycle_Drainage_Warning = self.treatList.Machine_Zero_Period_Warning;
                if(self.apdDataObj.Zero_Cycle_Drainage_Warning !== 0){    
                    self.apdDataObj.Zero_Cycle_Drainage_Warning = self.apdDataObj.Zero_Cycle_Drainage_Warning.toString();
                    if (self.apdDataObj.Zero_Cycle_Drainage_Warning.indexOf("-999") >= 0) {
                        self.apdDataObj.ZeroCycleDrainageWarningOther = parseInt(self.apdDataObj.Zero_Cycle_Drainage_Warning.substr(4));
                        self.apdDataObj.Zero_Cycle_Drainage_Warning = "其他";
                    }else{
                        self.apdDataObj.Zero_Cycle_Drainage_Warning = self.apdDataObj.Zero_Cycle_Drainage_Warning.toString();
                    }
                }else{
                    self.apdDataObj.Zero_Cycle_Drainage_Warning = "0";
                }  
                
                // 週期數     number Cycle_Number
                self.apdDataObj.Cycle_Number = self.treatList.Pd_Period_Number;  
                if(self.apdDataObj.Cycle_Number !== 0){     
                    self.apdDataObj.Cycle_Number = self.apdDataObj.Cycle_Number.toString();
                    if (self.apdDataObj.Cycle_Number.indexOf("-999") >= 0) {
                        self.apdDataObj.CycleNumberOther = parseInt(self.apdDataObj.Cycle_Number.substr(4));
                        self.apdDataObj.Cycle_Number = "其他";
                    }else{
                        self.apdDataObj.Cycle_Number = self.apdDataObj.Cycle_Number.toString();
                    }
                }else{
                    self.apdDataObj.Cycle_Number = "0";
                }      

                //設定透析液溫度number Dialysate_Temperature_Setting
                self.apdDataObj.Dialysate_Temperature_Setting = self.treatList.Machine_Dialysate_Temperature;
                if(self.apdDataObj.Dialysate_Temperature_Setting !== 0){ 
                    self.apdDataObj.Dialysate_Temperature_Setting = self.apdDataObj.Dialysate_Temperature_Setting.toString();
                    if (self.apdDataObj.Dialysate_Temperature_Setting.indexOf("-999") >= 0) {
                        self.apdDataObj.DialysateTemperatureSettingOther = parseInt(self.apdDataObj.Dialysate_Temperature_Setting.substr(4));
                        self.apdDataObj.Dialysate_Temperature_Setting = "其他";
                    }else{
                        self.apdDataObj.Dialysate_Temperature_Setting = self.apdDataObj.Dialysate_Temperature_Setting.toString();
                    }
                }else{
                    self.apdDataObj.Dialysate_Temperature_Setting = "0";
                } 

                //最末手控引流
                self.apdDataObj.Isfinal_Manual_Drainage = self.treatList.Machine_Isfinal_Drainage;

                // 總脫水目標    number Final_Manual_Drainage
                self.apdDataObj.Final_Manual_Drainage = self.treatList.Machine_Tot_Dehydrate_Target;
                if(self.apdDataObj.Final_Manual_Drainage !== 0 ){   
                    self.apdDataObj.Final_Manual_Drainage = self.apdDataObj.Final_Manual_Drainage.toString();
                    if (self.apdDataObj.Final_Manual_Drainage.indexOf("-999") >= 0) {
                        self.apdDataObj.FinalManualDrainageOther = parseInt(self.apdDataObj.Final_Manual_Drainage.substr(4));
                        self.apdDataObj.Final_Manual_Drainage = "其他";
                    }else{
                        self.apdDataObj.Final_Manual_Drainage = self.apdDataObj.Final_Manual_Drainage.toString();
                    }
                }else{
                    self.apdDataObj.Final_Manual_Drainage = "0";
                }         
                //警訊
                self.apdDataObj.Islast_Manual_Drainage_Warn = self.treatList.Machine_Isalarm;

                // 週期最小引流量     number Minimum_Periodic_Drainage
                self.apdDataObj.Minimum_Periodic_Drainage = self.treatList.Machine_Period_Min_Drainage; 
                if(self.apdDataObj.Minimum_Periodic_Drainage !== 0){ 
                    self.apdDataObj.Minimum_Periodic_Drainage = self.apdDataObj.Minimum_Periodic_Drainage.toString();
                    if (self.apdDataObj.Minimum_Periodic_Drainage.indexOf("-999") >= 0) {
                        self.apdDataObj.MinimumPeriodicDrainageOther = parseInt(self.apdDataObj.Minimum_Periodic_Drainage.substr(4));
                        self.apdDataObj.Minimum_Periodic_Drainage = "其他";
                    }else{
                        self.apdDataObj.Minimum_Periodic_Drainage = self.apdDataObj.Minimum_Periodic_Drainage.toString();
                    }
                }else{
                    self.apdDataObj.Minimum_Periodic_Drainage = "0";
                }
            }else{
                self.apdDataObj.Treatment_Method = "CCPD";
                self.apdDataObj.Record_Date = toDay;
                self.apdDataObj.Retention_Time_Hh = "0";
                self.apdDataObj.Retention_Time_Mm = "0";
                self.apdDataObj.Treatment_Time_Hh = "0";
                self.apdDataObj.Treatment_Time_Mm = "0";
                self.apdDataObj.Machine_Stay_Time_Hh = "0";
                self.apdDataObj.Machine_Stay_Time_Mm = "0";
                self.apdDataObj.Total_Therapeutic_Dose = "0";
                self.apdDataObj.Injection_Volume = "0";
                self.apdDataObj.Last_Injection_Volume = "0";
                self.apdDataObj.Patient_Weight = "0";
                self.apdDataObj.Cycle_Number = "0";
                self.apdDataObj.Zero_Cycle_Drainage_Warning = "0";
                self.apdDataObj.Dialysate_Temperature_Setting = "0";
                self.apdDataObj.Final_Manual_Drainage = "0";
                self.apdDataObj.Minimum_Periodic_Drainage = "0";
                // 最末袋葡萄糖濃度
                self.apdDataObj.Last_Glucose_Concentration = 'Y';
                self.apdDataObj.Isfinal_Manual_Drainage = 'Y';       
                // 警訊
                self.apdDataObj.Islast_Manual_Drainage_Warn = 'Y';   
                console.log("self.apdDataObj-else-",self.apdDataObj);
            }
            console.log("pdTreatService self.treatList SUCCESS", self.treatList);
        }, (res) => {
            console.log("pdTreatService getList FAIL", res);
        });
    };
    self.initialUI = function () {    
        if (self.apdDataObj.isCreate == true) {
            self.getLastList();      
        }else{
            if(self.apdDataObj.isCopy){
                self.apdDataObj.Record_Date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
            }
            // 治療方式
            self.apdDataObj.Treatment_Method = self.apdDataObj.Treatment_Method;
            //總治療量 Total_Therapeutic_Dose TotalTherapeuticDoseOther
            // 注入量 InjectionVolumeOther Injection_Volume        
            //最末注入量 Last_Injection_Volume LastInjectionVolumeOther        
            // 病人體重PatientWeightOther Patient_Weight         
            // 0 週期引流警訊ZeroCycleDrainageWarningOther Zero_Cycle_Drainage_Warning        
            // 週期數CycleNumberOther Cycle_Number        
            // 總脫水目標 FinalManualDrainageOther Final_Manual_Drainage        
            // 週期最小引流量MinimumPeriodicDrainageOther Minimum_Periodic_Drainage        
            // 最末袋葡萄糖濃度
            self.apdDataObj.Last_Glucose_Concentration = self.apdDataObj.Last_Glucose_Concentration == '相同' ? 'Y' : 'N';
            // 設定透析液溫度self.DialysateTemperatureSetting = ['35', '36', '37'];
            self.apdDataObj.Dialysate_Temperature_Setting = self.apdDataObj.Dialysate_Temperature_Setting;
            self.apdDataObj.Isfinal_Manual_Drainage = self.apdDataObj.Isfinal_Manual_Drainage == '是' ? 'Y' : 'N';       
            // 警訊
            self.apdDataObj.Islast_Manual_Drainage_Warn = self.apdDataObj.Islast_Manual_Drainage_Warn == '是' ? 'Y' : 'N';        
            // 備註
            self.apdDataObj.Notes = self.apdDataObj.Notes;



        }
        console.log("apdlication apdItem", apdItem);
        console.log("apdlication selfCompDataObj", self.apdDataObj);    
        
    };
    self.initialUI();

}

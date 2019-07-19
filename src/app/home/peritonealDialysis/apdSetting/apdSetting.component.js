import tpl from './apdSetting.html';
import dialog from './apdEdit.dialog.html';


angular.module('app').component('apdSetting', {
    template: tpl,
    controller: apdSettingCtrl
});

apdSettingCtrl.$inject = [
    '$stateParams', 'SettingService', 'apdSettingService','$rootScope', 'pdTreatService', 
    '$mdDialog', '$mdMedia', 'PatientService', '$filter', 'showMessage', '$state'];
function apdSettingCtrl(
    $stateParams, SettingService, apdSettingService,$rootScope, pdTreatService, 
    $mdDialog, $mdMedia, PatientService, $filter, showMessage, $state) {

    const self = this;
    let $translate = $filter('translate');

    self.patientId = $stateParams.patientId;
    self.currentPatient = [];
    self.loading = true;
    // List Data Array
    self.apdList = [];
    //刪除狀態
    self.showDeleted = false;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    console.log("self.patientId--", self.patientId);

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };    

    self.lastAccessTime = moment();
    $rootScope.$on("apdSettingRefreshEvent", function (event, data) {
        console.log("$rootScope $on apdSettingRefreshEvent");
        self.getList();
    });
    
    self.refresh = function(){ 
        page = 1;
        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)        
        self.getList();
        self.lastAccessTime = moment();
    }

    self.switchShowDeleted = function(showDeleted){
        // && $ctrl.fiList.Status !== 'Deleted'
        self.showDeleted = !showDeleted;
        console.log("self.showDeleted--",self.showDeleted);
        self.getList();
    }

    self.getList = function () {
        self.loading = true;
        PatientService.getById(self.patientId).then((res) => {
            self.currentPatient = res.data;
            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("apdSettingService getList Fail", res);
        });
        apdSettingService.getListByPatientID(self.patientId).then((res) => {
            console.log("apdSettingService getList Success", res);
            self.apdList = [];
            self.apdList = angular.copy(res.data);
            self.apdList = $filter('orderBy')(self.apdList,'-CreatedTime');
            let Total = self.apdList.length;            
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            } 
            if (Total > 0) {
                self.deletedItemsLength = self.apdList.filter(e =>{
                    return (e.Status == "Deleted" || e.Status == "tempDeleted")
                }).length;

                self.apdList = self.apdList;
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.apdList = [];
            }
            console.log("apdList--", self.apdList);
            self.loading = false;   
            if (self.apdList.length > 0) {
                let i = 0;
                self.apdList.forEach((res) => {        
                    // if(self.apdList[i].Status !== 'Deleted'){
                    //     self.apdList[i].StatusData = 'ViewData';
                    // }
                    //self.apdList[i].Treatment_Time_Hh = self.apdList[i].Treatment_Time_Hh;
                    if(self.apdList[i].Treatment_Time_Hh !== null && self.apdList[i].Treatment_Time_Hh !== ""){ 
                        if (self.apdList[i].Treatment_Time_Hh.indexOf("oher_") >= 0) {
                            self.apdList[i].TreatmentTimeHhOther = self.apdList[i].Treatment_Time_Hh.substr(5);
                            self.apdList[i].Treatment_Time_Hh = "其他";
                        }
                    }     
                    //self.apdList[i].Treatment_Time_Mm = self.apdList[i].Treatment_Time_Mm;
                    if(self.apdList[i].Treatment_Time_Mm !== null && self.apdList[i].Treatment_Time_Mm !== ""){
                        if (self.apdList[i].Treatment_Time_Mm.indexOf("oher_") >= 0) {
                            self.apdList[i].TreatmentTimeMmOther = self.apdList[i].Treatment_Time_Mm.substr(5);
                            self.apdList[i].Treatment_Time_Mm = "其他";
                        }
                    } 
                    //self.apdList[i].Retention_Time_Hh = self.apdList[i].Retention_Time_Hh;
                    if(self.apdList[i].Retention_Time_Hh !== null && self.apdList[i].Retention_Time_Hh !== ""){ 
                        if (self.apdList[i].Retention_Time_Hh.indexOf("oher_") >= 0) {
                            self.apdList[i].RetentionTimeHhOther = self.apdList[i].Retention_Time_Hh.substr(5);
                            self.apdList[i].Retention_Time_Hh = "其他";
                        }
                    } 
                    //self.apdList[i].Retention_Time_Mm = self.apdList[i].Retention_Time_Mm;
                    if(self.apdList[i].Retention_Time_Mm !== null && self.apdList[i].Retention_Time_Mm !== ""){ 
                        if (self.apdList[i].Retention_Time_Mm.indexOf("oher_") >= 0) {
                            self.apdList[i].RetentionTimeMmOther = self.apdList[i].Retention_Time_Mm.substr(5);
                            self.apdList[i].Retention_Time_Mm = "其他";
                        }
                    }  
                    //總治療量   
                    //alert(self.apdList[i].Total_Therapeutic_Dose);
                    self.apdList[i].Total_Therapeutic_Dose = self.apdList[i].Total_Therapeutic_Dose.toString();
                    if(self.apdList[i].Total_Therapeutic_Dose !== "0"){ 
                        //alert(self.apdList[i].Total_Therapeutic_Dose);
                        if (self.apdList[i].Total_Therapeutic_Dose.indexOf("-999") >= 0) {
                            self.apdList[i].TotalTherapeuticDoseOther = parseInt(self.apdList[i].Total_Therapeutic_Dose.substr(4));
                            self.apdList[i].Total_Therapeutic_Dose = "其他";
                        }else{
                            self.apdList[i].Total_Therapeutic_Dose = self.apdList[i].Total_Therapeutic_Dose;
                        }
                    } 
                    // 注入量 self.fillVolOptions = ['1000', '1500', '2000', '2500', '其他'];           
                    self.apdList[i].Injection_Volume = self.apdList[i].Injection_Volume.toString();
                    if(self.apdList[i].Injection_Volume !== "0"){ 
                        if (self.apdList[i].Injection_Volume.indexOf("-999") >= 0) {
                            self.apdList[i].InjectionVolumeOther = parseInt(self.apdList[i].Injection_Volume.substr(4));
                            self.apdList[i].Injection_Volume = "其他";
                        }else{
                            self.apdList[i].Injection_Volume = self.apdList[i].Injection_Volume;
                        }
                    } 
                    // // 最末注入量   self.lastFillVolOptions = ['1000', '1500', '2000', '2500', '其他'];      
                    // self.apdList[i].Last_Injection_Volume = self.apdList[i].Last_Injection_Volume.toString();  
                    // if(self.apdList[i].Last_Injection_Volume !== "0"){  
                    //     if (self.apdList[i].Last_Injection_Volume.indexOf("-999") >= 0) {
                    //         self.apdList[i].LastInjectionVolumeOther = parseInt(self.apdList[i].Last_Injection_Volume.substr(4));
                    //         self.apdList[i].Last_Injection_Volume = "其他";
                    //     }else{
                    //         self.apdList[i].Last_Injection_Volume = self.apdList[i].Last_Injection_Volume;
                    //     }
                    // } 
                    // 病人體重     self.patientWeightOptions = ['40', '50', '60', '70', '80', '其他'];      
                    self.apdList[i].Patient_Weight = self.apdList[i].Patient_Weight.toString();
                    if(self.apdList[i].Patient_Weight !== "0"){   
                        if (self.apdList[i].Patient_Weight.indexOf("-999") >= 0) {
                            self.apdList[i].PatientWeightOther = parseInt(self.apdList[i].Patient_Weight.substr(4));
                            self.apdList[i].Patient_Weight = "其他";
                        }else{
                            self.apdList[i].Patient_Weight = self.apdList[i].Patient_Weight;
                        }
                    } 
                    // 0 週期引流警訊     self.iDrainAlarmOptions = ['1000', '1500', '2000', '2500', '其他'];     
                    self.apdList[i].Zero_Cycle_Drainage_Warning = self.apdList[i].Zero_Cycle_Drainage_Warning.toString();
                    if(self.apdList[i].Zero_Cycle_Drainage_Warning !== "0"){  
                        if (self.apdList[i].Zero_Cycle_Drainage_Warning.indexOf("-999") >= 0) {
                            self.apdList[i].ZeroCycleDrainageWarningOther = self.apdList[i].Zero_Cycle_Drainage_Warning.substr(4);
                            self.apdList[i].Zero_Cycle_Drainage_Warning = "其他";
                        }else{
                            self.apdList[i].Zero_Cycle_Drainage_Warning = self.apdList[i].Zero_Cycle_Drainage_Warning.toString();
                        }
                    } 
                    // 週期數     self.cyclesOptions = ['2', '3', '4', '5', '其他'];   
                    self.apdList[i].Cycle_Number = self.apdList[i].Cycle_Number.toString(); 
                    if(self.apdList[i].Cycle_Number !== "0"){    
                        if (self.apdList[i].Cycle_Number.indexOf("-999") >= 0) {
                            self.apdList[i].CycleNumberOther = parseInt(self.apdList[i].Cycle_Number.substr(4));
                            self.apdList[i].Cycle_Number = "其他";
                        }else{
                            self.apdList[i].Cycle_Number = self.apdList[i].Cycle_Number;
                        }
                    }
                    // 總脫水目標    self.ufTargetOptions = ['1000', '1500', '2000', '2500', '其他'];    
                    self.apdList[i].Final_Manual_Drainage = self.apdList[i].Final_Manual_Drainage.toString();
                    if(self.apdList[i].Final_Manual_Drainage !== "0" ){ 
                        if (self.apdList[i].Final_Manual_Drainage.indexOf("-999") >= 0) {
                            self.apdList[i].FinalManualDrainageOther = parseInt(self.apdList[i].Final_Manual_Drainage.substr(4));
                            self.apdList[i].Final_Manual_Drainage = "其他";
                        }else{
                            self.apdList[i].Final_Manual_Drainage = self.apdList[i].Final_Manual_Drainage;
                        }
                    } 
                    // 週期最小引流量     self.minDrainVolOptions = ['60', '70', '80', '85', '其他'];   
                    self.apdList[i].Minimum_Periodic_Drainage = self.apdList[i].Minimum_Periodic_Drainage.toString(); 
                    if(self.apdList[i].Minimum_Periodic_Drainage !== "0"){ 
                        if (self.apdList[i].Minimum_Periodic_Drainage.indexOf("-999") >= 0) {
                            self.apdList[i].MinimumPeriodicDrainageOther = parseInt(self.apdList[i].Minimum_Periodic_Drainage.substr(4));
                            self.apdList[i].Minimum_Periodic_Drainage = "其他";
                        }else{
                            self.apdList[i].Minimum_Periodic_Drainage = self.apdList[i].Minimum_Periodic_Drainage;
                        }
                    } 
                    //設定透析液溫度
                    self.apdList[i].Dialysate_Temperature_Setting = self.apdList[i].Dialysate_Temperature_Setting.toString();
                    if(self.apdList[i].Dialysate_Temperature_Setting !== "0"){ 
                        if (self.apdList[i].Dialysate_Temperature_Setting.indexOf("-999") >= 0) {
                            self.apdList[i].DialysateTemperatureSettingOther = self.apdList[i].Dialysate_Temperature_Setting.substr(4);
                            self.apdList[i].Dialysate_Temperature_Setting = "其他";
                        }else{
                            self.apdList[i].Dialysate_Temperature_Setting = self.apdList[i].Dialysate_Temperature_Setting.toString();
                        }
                    } 
                    //最末袋葡萄糖濃度 Last_Glucose_Concentration
                    self.apdList[i].Last_Glucose_Concentration = self.apdList[i].Last_Glucose_Concentration == "Y" ? "相同" : "不同";
                    //最末手控引流Isfinal_Manual_Drainage
                    self.apdList[i].Isfinal_Manual_Drainage = self.apdList[i].Isfinal_Manual_Drainage == "Y" ? "是" : "否";
                    //警訊Islast_Manual_Drainage_Warn
                    self.apdList[i].Islast_Manual_Drainage_Warn = self.apdList[i].Islast_Manual_Drainage_Warn == "Y" ? "是" : "否";
                    i++;
                });
            }
        }, (res) => {
            console.log("apdSettingService getList Fail", res);
        });
        console.log("apdListNo", self.apdList.no);

        // PatientService.getById($stateParams.patientId).then((res) => {
        //     self.currentPatient = res.data;

        //     console.log("self.currentPatient--", self.currentPatient);
        // }, (res) => {
        //     console.log("apdSettingService getList Fail", res);
        // });

    };

    self.openCreateDialog = function () {
        let apdItem = {};
        apdItem.isCreate = true;
        apdItem.Record_Date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        $mdDialog.show({
            controller: 'apdEditController',
            template: dialog,
            locals: {
                apdItem: apdItem
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });
    };

    self.openEditDialog = function (apdItem, isCopy) {
        console.log("apdEditController openEditDialog");
        let _apdItem = angular.copy(apdItem);
        _apdItem.Record_Date = new Date(moment(_apdItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        _apdItem.isCopy = isCopy;
        if(isCopy){
            _apdItem.CreatedTime = null;
            _apdItem.CreatedUserName = null;
            _apdItem.ModifiedTime = null;
            _apdItem.ModifiedUserName = null;
        }

        console.log("apdItem", _apdItem);
        $mdDialog.show({
            controller: 'apdEditController',
            template: dialog,
            locals: {
                apdItem: _apdItem
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    // 刪除    
    self.deleteOne = function (ev, apdItem) {
        var tempApdItem = {};
        const confirm = $mdDialog.confirm()
            .title($translate('apdSetting.component.confirmDelete')) // '刪除確認'
            .textContent($translate('apdSetting.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('apdSetting.component.deleteOk')) // '刪除'
            .cancel($translate('apdSetting.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            let tempItem = [];
            apdSettingService.getListByPatientID(self.patientId).then((res) => {
                console.log("apdSettingService getList Success", res);
                for(let i=0;i<res.data.length;i++){
                    if(res.data[i].Id == apdItem.Id){
                        tempItem = res.data[i];
                    }   
                }
                console.log("tempItem--",tempItem);

                // //最末袋葡萄糖濃度 Last_Glucose_Concentration
                // apdItem.Last_Glucose_Concentration = apdItem.Last_Glucose_Concentration == "相同" ? "Y" : "N";
                // //最末手控引流Isfinal_Manual_Drainage
                // apdItem.Isfinal_Manual_Drainage = apdItem.Isfinal_Manual_Drainage == "是" ? "Y" : "N";
                // //警訊Islast_Manual_Drainage_Warn
                // apdItem.Islast_Manual_Drainage_Warn = apdItem.Islast_Manual_Drainage_Warn == "是" ? "Y" : "N";
                // apdItem.Total_Therapeutic_Dose = parseInt(apdItem.Total_Therapeutic_Dose);
                // apdItem.Injection_Volume = parseInt(apdItem.Injection_Volume);
                // apdItem.Last_Injection_Volume = parseInt(apdItem.Last_Injection_Volume);
                // apdItem.Patient_Weight = parseInt(apdItem.Patient_Weight);
                // apdItem.Zero_Cycle_Drainage_Warning = parseInt(apdItem.Zero_Cycle_Drainage_Warning);
                // apdItem.Cycle_Number = parseInt(apdItem.Cycle_Number);
                // apdItem.Dialysate_Temperature_Setting = parseInt(apdItem.Dialysate_Temperature_Setting);
                // apdItem.Final_Manual_Drainage = parseInt(apdItem.Final_Manual_Drainage);
                // apdItem.Minimum_Periodic_Drainage = parseInt(apdItem.Minimum_Periodic_Drainage);

                tempItem.Status = "Deleted";
                // tempApdItem.Id = apdItem.Id;           
                // tempApdItem.Status = "Deleted";
                // tempApdItem.Hospitalid = apdItem.Hospitalid;
                // tempApdItem.Patientid = apdItem.Patientid;

                console.log("deleteOne", tempItem);
                apdSettingService.put(tempItem).then((res) => {
                    console.log("apdSetting update success", res);
                    showMessage($translate('apdSetting.component.deleteSuccess'));     
                    $rootScope.$emit("apdSettingRefreshEvent", "");
                }, (res) => {
                    console.log("apdSetting update fail", res);
                    showMessage($translate('apdSetting.component.deleteFail'));   
                    $rootScope.$emit("apdSettingRefreshEvent", "");
                });
                self.getList();
                $mdDialog.hide();

            }, (res) => {
                console.log("apdSetting update fail", res);
                showMessage($translate('apdSetting.component.deleteFail'));   
                $rootScope.$emit("apdSettingRefreshEvent", "");
            });

        }, () => {
            $mdDialog.hide();
        });
    };

    self.printPaper = function(ev,apdItem){
        console.log("ev--",ev);
        console.log("apdItem--",apdItem);
        $state.go('printApd',{'item':angular.copy(apdItem)});
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
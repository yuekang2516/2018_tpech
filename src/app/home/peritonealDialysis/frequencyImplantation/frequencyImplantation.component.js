
import './frequencyImplantation.less';
import dialog from './fiListEdit.dialog.html';

const tpl = require('./frequencyImplantation.html');

angular.module('app').component('frequencyImplantation', {
    template: tpl,
    controller: frequencyImplantationCtrl
});

frequencyImplantationCtrl.$inject = [
    '$stateParams', '$mdDialog', 'PatientService','SettingService', 'showMessage',
     '$filter', '$mdMedia', 'frequencyImplantationService', 
    '$rootScope'
    ];

function frequencyImplantationCtrl(
    $stateParams, $mdDialog, PatientService, SettingService, showMessage,
    $filter, $mdMedia, frequencyImplantationService, 
    $rootScope
    ) {

    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    //刪除狀態
    self.showDeleted = false;
    
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    self.lastAccessTime = moment();
    self.loading = true;
    //目前病人
    self.currentPatient = [];
    // 資料庫資料 腹透植管
    self.fiList = [];

    // 呈現用 腹透植管
    self.showFIList = [];

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };

    $rootScope.$on("frequencyImplantationRefreshEvent", function (event, data) {
        console.log("$rootScope $on frequencyImplantationRefreshEvent");
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

    self.getList = function(){
        self.peritonitisList = {};
        self.showPEList = {};
        self.fiList = [];
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;

            console.log("currentPatient Success", self.currentPatient);
            console.log("MedicalId--",self.currentPatient.MedicalId);
            frequencyImplantationService.GetListByPatientid($stateParams.patientId).then((res) => {
                console.log("frequencyImplantationService getAll Success", res);
                self.fiList = res.data;           
                self.fiList = $filter('orderBy')(self.fiList,'-Catheter_Implantation_Date');                                   
                // self.fiList = self.fiList.filter(e =>{
                //     return e.Status != "Deleted";
                // });
                //self.fiList = $filter('orderBy')(self.fiList,'Status');  
                let Total = self.fiList.length;            
                self.totalCnt = Total;
                maxpage = parseInt(Total / limit) + 1; // 總頁數
                if (Total% limit === 0) {
                    maxpage -= 1;
                } 
                if (Total > 0) {
                    self.deletedItemsLength = _.filter(self.fiList, { 'Status': 'Deleted' }).length;
                    self.fiList = self.fiList;
                    // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                } else {
                    self.fiList = [];
                }  
                // 整理清單
                if (res.data.length > 0) {
                    let i=0;
                    res.data.forEach((res)=>{                        
                        let timesItem = self.fiList[i];  
                        // //植管醫院select
                        // timesItem.Frequency_Implanate_Hospital = timesItem.Frequency_Implanate_Hospital !== "0" ? timesItem.Frequency_Implanate_Hospital : "";                        
                        // //終止原因select
                        // timesItem.Termination_Reasons = timesItem.Termination_Reasons !== "0" ? timesItem.Termination_Reasons : "";                        
                        // //轉血液透析原因select
                        // timesItem.Transhemodialysis_Reasons = timesItem.Transhemodialysis_Reasons !== "0" ? timesItem.Transhemodialysis_Reasons : "";                        
                        // //死亡原因select
                        // timesItem.Death_Reasons = timesItem.Death_Reasons !== "0" ? timesItem.Death_Reasons : "";
                        // //死亡地點select
                        // timesItem.Death_Location = timesItem.Death_Location !== "0" ? timesItem.Death_Location : "";
                        //判斷刪除的資料
                        //死亡地點select
                        if(timesItem.Status !== 'Deleted'){
                            timesItem.StatusData = 'ViewData';
                        }
                        if(timesItem.Death_Location != null){
                            if(timesItem.Death_Location.indexOf("oher_") >= 0){
                                timesItem.DeathLocationOther = timesItem.Death_Location.substr(5);
                                timesItem.Death_Location = '其他';
                            }
                        }
                        //植管醫院select TranshemodialysisReasonsOther Transhemodialysis_Reasons                        
                        if(timesItem.Frequency_Implanate_Hospital != null){
                            if(timesItem.Frequency_Implanate_Hospital.indexOf("oher_") >= 0){
                                timesItem.FrequencyImplanateHospitalOther = timesItem.Frequency_Implanate_Hospital.substr(5);
                                timesItem.Frequency_Implanate_Hospital = 'Other';
                            }
                        }
                        //轉血液透析原因select TranshemodialysisReasonsOther Transhemodialysis_Reasons                        
                        if(timesItem.Transhemodialysis_Reasons != null){
                            if(timesItem.Transhemodialysis_Reasons.indexOf("oher_") >= 0){
                                timesItem.TranshemodialysisReasonsOther = timesItem.Transhemodialysis_Reasons.substr(5);
                                timesItem.Transhemodialysis_Reasons = '其他';
                            }
                        }
                        //終止原因select TerminationReasonsOther Termination_Reasons
                        if(timesItem.Termination_Reasons !== null){
                            if(timesItem.Termination_Reasons.indexOf("oher_") >= 0){
                                timesItem.TerminationReasonsOther = timesItem.Termination_Reasons.substr(5);
                                timesItem.Termination_Reasons = '其他';
                            }
                        }
                        //植入位置radio ImplantationLocationOther Implantation_Location
                        if(timesItem.Implantation_Location !== null){
                            if(timesItem.Implantation_Location.indexOf("oher_") >= 0){
                                timesItem.ImplantationLocationOther = timesItem.Implantation_Location.substr(5);
                                timesItem.Implantation_Location = '其他';
                            }
                        }
                        //導管型式(種類)radio CatheterTypeOther Catheter_Type
                        if(timesItem.Catheter_Type !== null){
                            if(timesItem.Catheter_Type.indexOf("oher_") >= 0){
                                timesItem.CatheterTypeOther = timesItem.Catheter_Type.substr(5);
                                timesItem.Catheter_Type = '其他';
                            }
                        }
                        //前端型態radio FrontTypeOther Front_Type
                        if(timesItem.Front_Type !== null){
                            if(timesItem.Front_Type.indexOf("oher_") >= 0){
                                timesItem.FrontTypeOther = timesItem.Front_Type.substr(5);
                                timesItem.Front_Type = '其他';
                            }
                        }
                        //手術方式radio OperativeMethodOther Operative_Method
                        if(timesItem.Operative_Method !== null){
                            if(timesItem.Operative_Method.indexOf("oher_") >= 0){
                                timesItem.OperativeMethodOther = timesItem.Operative_Method.substr(5);
                                timesItem.Operative_Method = '其他';
                            }
                        }
                        //首次透析模式radio LiquidExchangeSystemOther Liquid_Exchange_System
                        if(timesItem.Liquid_Exchange_System !== null){
                            if(timesItem.Liquid_Exchange_System.indexOf("oher_") >= 0){
                                timesItem.LiquidExchangeSystemOther = timesItem.Liquid_Exchange_System.substr(5);
                                timesItem.Liquid_Exchange_System = '其他';
                            }
                        }
                        //死亡原因select DeathReasonsOther Death_Reasons
                        if(timesItem.Death_Reasons !== null){
                            switch(timesItem.Death_Reasons){
                                case "心肺系統": 
                                    if(timesItem.Death_Reasons_Detail != "選擇死亡原因細項"){
                                        timesItem.Death_Reasons_CardiopulmonarySystem = timesItem.Death_Reasons_Detail;
                                    }
                                break;
                                case "中樞神經系統":
                                    if(timesItem.Death_Reasons_Detail != "選擇死亡原因細項"){
                                        timesItem.Death_Reasons_CentralNervousSystem = timesItem.Death_Reasons_Detail;
                                    }
                                break;
                                case "感染":
                                    if(timesItem.Death_Reasons_Detail !== null){
                                        //感染
                                        if(timesItem.Death_Reasons_Detail.indexOf("Death_Infection_") >= 0){
                                            timesItem.DeathReasonsInfectionOther = timesItem.Death_Reasons_Detail.substr(16);
                                            timesItem.Death_Reasons_Infection = '其它之感染症';
                                        }else{
                                            timesItem.Death_Reasons_Infection = timesItem.Death_Reasons_Detail;
                                        }
                                    }
                                break;
                                case "胃腸及肝膽系統":
                                    timesItem.Death_Reasons_Detail = "選擇死亡原因細項";
                                    timesItem.DeathReasonsInfectionOther = "";
                                    timesItem.DeathReasonsMalignantTumorOther = "";
                                    timesItem.DeathReasonsOtherOther = "";
                                break;
                                case "惡性腫瘤":
                                    if(timesItem.Death_Reasons_Detail !== null){
                                        //惡性腫瘤
                                        if(timesItem.Death_Reasons_Detail.indexOf("Death_MT_") >= 0){
                                            timesItem.DeathReasonsMalignantTumorOther = timesItem.Death_Reasons_Detail.substr(9);
                                            timesItem.Death_Reasons_MalignantTumor = '其他惡性腫瘤';
                                        }else{
                                            timesItem.Death_Reasons_MalignantTumor = timesItem.Death_Reasons_Detail;
                                        }
                                    }
                                break;
                                case "其他":
                                    if(timesItem.Death_Reasons_Detail !== null){
                                        //其他
                                        if(timesItem.Death_Reasons_Detail.indexOf("Dath_Other_") >= 0){
                                            timesItem.DeathReasonsOtherOther = timesItem.Death_Reasons_Detail.substr(11);
                                            timesItem.Death_Reasons_Other = '其他';
                                        }else{
                                            timesItem.Death_Reasons_Other = timesItem.Death_Reasons_Detail;
                                        }
                                    }
                                break;
                            }
                        }

                        //checkbox
                        if(timesItem.Implantation_Complications !== null){
                            let tmpAry = [];
                            let tmpStr = "";
                            tmpAry = timesItem.Implantation_Complications.split(",");
                            //新增其他輸入
                            for(let tmpItem in tmpAry){
                                if(tmpAry[tmpItem].indexOf("oher_") >= 0){
                                    timesItem.ImplantationComplicationsCheckOther = tmpAry[tmpItem].substr(5);
                                }else{
                                    timesItem.ImplantationComplicationsCheckOther = "";
                                    tmpStr += tmpAry[tmpItem] + ",";
                                }
                            }
                            if(timesItem.ImplantationComplicationsCheckOther != ""){
                                tmpStr += timesItem.ImplantationComplicationsCheckOther;
                            }                            
                            timesItem.Implantation_Complications = tmpStr;
                            //console.log("tmpStr-Implantation_Complications-",timesItem.Implantation_Complications);                            
                        }
                        if(timesItem.Re_Implantation_Reason !== null){
                            let tmpAry = [];
                            let tmpStr = "";
                            tmpAry = timesItem.Re_Implantation_Reason.split(",");
                            //新增其他輸入
                            for(let tmpItem in tmpAry){
                                if(tmpAry[tmpItem].indexOf("oher_") >= 0){
                                    timesItem.ReImplantationReasonCheckOther = tmpAry[tmpItem].substr(5);
                                }else{
                                    timesItem.ReImplantationReasonCheckOther = "";
                                    tmpStr += tmpAry[tmpItem] + ",";
                                }
                            }
                            if(timesItem.ReImplantationReasonCheckOther != ""){
                                tmpStr += timesItem.ReImplantationReasonCheckOther;
                            }                            
                            timesItem.Re_Implantation_Reason = tmpStr;
                            //console.log("tmpStr-Re_Implantation_Reason-",timesItem.Re_Implantation_Reason);                            
                        }
                        if(timesItem.Early_Complications_Surgery !== null){
                            let tmpAry = [];
                            let tmpStr = "";
                            tmpAry = timesItem.Early_Complications_Surgery.split(",");
                            //新增其他輸入
                            for(let tmpItem in tmpAry){
                                if(tmpAry[tmpItem].indexOf("oher_") >= 0){
                                    timesItem.EarlyComplicationsSurgeryCheckOther = tmpAry[tmpItem].substr(5);
                                }else{
                                    timesItem.EarlyComplicationsSurgeryCheckOther = "";
                                    tmpStr += tmpAry[tmpItem] + ",";
                                }
                            }
                            if(timesItem.EarlyComplicationsSurgeryCheckOther != ""){
                                tmpStr += timesItem.EarlyComplicationsSurgeryCheckOther;
                            }                            
                            timesItem.Early_Complications_Surgery = tmpStr;
                            //console.log("tmpStr-Early_Complications_Surgery-",timesItem.Early_Complications_Surgery);                            
                        }
                        if(timesItem.Anesthesia_Mode !== null){
                            let tmpAry = [];
                            let tmpStr = "";
                            tmpAry = timesItem.Anesthesia_Mode.split(",");
                            //新增其他輸入
                            for(let tmpItem in tmpAry){
                                if(tmpAry[tmpItem].indexOf("oher_") >= 0){
                                    timesItem.AnesthesiaModeOther = tmpAry[tmpItem].substr(5);
                                }else{
                                    timesItem.AnesthesiaModeOther = "";
                                    tmpStr += tmpAry[tmpItem] + ",";
                                }
                            }
                            if(timesItem.AnesthesiaModeOther != ""){
                                tmpStr += timesItem.AnesthesiaModeOther;
                            }                            
                            timesItem.Anesthesia_Mode = tmpStr;
                            //console.log("tmpStr-Anesthesia_Mode-",timesItem.Anesthesia_Mode);                            
                        } 
                        i++;
                    });
                }

            }, (res) => {
                console.log("frequencyImplantationService getAll Fail", res);
            });


        }, (res) => {
            console.log("frequencyImplantationService getList Fail", res);
        });
    };

    self.openCreateDialog = function () {
        console.log("Frequency_Implantation openCreateDialog");
        let fiDataAry = [];
        let tmpFiData = {};

        tmpFiData.MedicalId = self.currentPatient.MedicalId;
        let notDelfiList = self.fiList.filter( e=>{
            return e.Status != 'Deleted'
        });
        tmpFiData.Frequency_Implantation = Object.keys(notDelfiList).length + 1;    
        
        tmpFiData.isCreate = true;
        fiDataAry.push(tmpFiData);

        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        $mdDialog.show({
            controller: 'fiListEditController',
            template: dialog,
            locals: {
                fiListItem: fiDataAry,
                fiListPatientId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    self.openEditDialog = function (fiListItem) { 
        let fiDataAry = [];
        //導管植入日期
        fiListItem.Catheter_Implantation_Date = new Date(moment(fiListItem.Catheter_Implantation_Date).format("YYYY-MM-DD HH:mm:ss"));
        //PD開始日期
        fiListItem.Pd_Date = new Date(moment(fiListItem.Pd_Date).format("YYYY-MM-DD HH:mm:ss"));
        //PET日期
        fiListItem.Pet_Date = new Date(moment(fiListItem.Pet_Date).format("YYYY-MM-DD HH:mm:ss"));
        //終止治療日期
        fiListItem.Treatment_Termination_Date = new Date(moment(fiListItem.Treatment_Termination_Date).format("YYYY-MM-DD HH:mm:ss"));
        //拔管日期
        fiListItem.Extubation_Date = new Date(moment(fiListItem.Extubation_Date).format("YYYY-MM-DD HH:mm:ss"));
        //併發症日期
        fiListItem.Complications_Date = new Date(moment(fiListItem.Complications_Date).format("YYYY-MM-DD HH:mm:ss"));
        //重新植管日期
        fiListItem.Re_Implantation_Date = new Date(moment(fiListItem.Re_Implantation_Date).format("YYYY-MM-DD HH:mm:ss"));


        fiListItem.isCreate = false;
        fiDataAry.push(fiListItem);

        console.log("frequencyImplantationService openEditDialog",fiDataAry);       
        
        $mdDialog.show({
            controller: 'fiListEditController',
            template: dialog,
            locals: {
                fiListItem: fiDataAry,
                fiListPatientId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {            
            self.getList();
        });

    };

    
    // 刪除    
    self.deleteOne = function (ev, fiListItem) {
        console.log("deleteOne ev--",ev);
        console.log("deleteOne fiListItem--",fiListItem);
        const confirm = $mdDialog.confirm()
            .title($translate('orderLR.component.confirmDelete')) // '刪除確認'
            .textContent($translate('orderLR.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('orderLR.component.deleteOk')) // '刪除'
            .cancel($translate('orderLR.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            fiListItem.Status = "Deleted";
            console.log("deleteOne", fiListItem);
            frequencyImplantationService.put(fiListItem).then((res) => {
                console.log("orderLR update success", res);
                showMessage($translate('orderLR.component.deleteSuccess'));

                //$rootScope.$emit("frequencyImplantationListRefreshEvent", "");
                self.getList();
            }, (res) => {
                console.log("orderLR update fail", res);
                showMessage($translate('orderLR.component.deleteFail'));
            });
            $mdDialog.hide();

        }, () => {
            $mdDialog.hide();
        });
        // $rootScope.$emit("frequencyImplantationListRefreshEvent", "");
    };

    self.$onDestroy = function () {

    };
    self.back = function back() {
        // $state.go('allPatients');
    };



}
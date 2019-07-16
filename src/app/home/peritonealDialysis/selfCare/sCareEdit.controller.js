
angular
.module('app')
.controller('sCareEditController', sCareEditController);

sCareEditController.$inject = [
    '$stateParams','PatientService',
    '$mdDialog', 'showMessage', 'SettingService', 'selfCareService', '$filter', 'sCareItem','$state'];
function sCareEditController(
    $stateParams, PatientService,
    $mdDialog, showMessage, SettingService, selfCareService, $filter, sCareItem,$state) {
console.log("sCareEditController Edit/Create Dialog", sCareItem);

const self = this;
const $translate = $filter('translate');
let other_list = ['Environment_Target','Knowdialysis_Target','Selfcontrol_Target','Correct_User','Living_Target','Diet_Target','Outhosp_Target'];
//self.isCreate = sCareItem === null;
let _sCareItem = angular.copy(sCareItem);
self.sCareDataObj = _sCareItem;

console.log("selfsCareDataObj--",self.sCareDataObj);
console.log("sCareItem--",sCareItem);

self.patientId = $stateParams.patientId;
//病患基本資料
PatientService.getById($stateParams.patientId).then((res) => {
    self.currentPatient = res.data;
    console.log("self.currentPatient--",self.currentPatient);
}, (res) => {
    console.log("complicationService getList Fail", res);
});
//get ID or Name
let CurrentUser = function getLocalOrOnlineUser(){
    let hostName = document.location.hostname;
    let UserId = "";
    let UserName = "";
    if( hostName == "localhost" || hostName == "127.0.0.1" ){
        UserId = "Swagger";
        UserName = "Swagger";
    }else{
        UserId = SettingService.getCurrentUser().Id;;
        UserName = SettingService.getCurrentUser().Name;
    }
    return {"UserId":UserId,"UserName":UserName};
}

self.Edit_Other = function(item,other_lab){
    //item.str.search("_else"); 
    if(item === null) return;
    
    if(item.indexOf("其他") > -1){
        let split_length = item.split('|').length;
        console.log('split_length',split_length);
        self.sCareDataObj[other_lab] = "其他";
        if(split_length > 1){
            self.sCareDataObj[other_lab +"_Other"] = item.split('|')[1];
        }
    }
}
self.Other_StrMage = function(other_lab){
    let mmm = self.sCareDataObj[other_lab +"_Other"] ;
    let value = self.sCareDataObj[other_lab];
    if(value =="其他"){
        if(!_.isEmpty(mmm)){
            self.sCareDataObj[other_lab] = "其他|" + mmm;
        }
    }
}
self.LoadData = function () {
    let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    if (self.sCareDataObj.isCreate == true) {
        self.sCareDataObj.Record_Date = toDay;
        self.sCareDataObj.Environment_User = CurrentUser().UserName;
        
    }else{
        if(self.sCareDataObj.isCopy){
            //Copy
            self.sCareDataObj.Record_Date = toDay;
            self.sCareDataObj.isCreate  = true;
            self.sCareDataObj.Environment_User = CurrentUser().UserName;
            self.sCareDataObj.CreatedUserId = "";
            self.sCareDataObj.CreatedUserName = "";
            self.sCareDataObj.ModifiedUserId = "";
            self.sCareDataObj.ModifiedUserName = "";
            self.sCareDataObj.ModifiedTime = null;
            self.sCareDataObj.Id = "";
        }else{
            //編輯
            self.sCareDataObj.Record_Date = new Date(self.sCareDataObj.Record_Date);
        }
        other_list.forEach( e =>{
            self.Edit_Other(self.sCareDataObj[e],e);
        });
    }
}

self.LoadData();

self.CopyPer = function(){
    selfCareService.getListByPatientID(self.patientId,0,0,'Normal').then((res) => {            
            if(res.data.length > 0 ){
                let filter_list = self.fiList = $filter('orderBy')(res.data,'-Record_Date');
                if(self.sCareDataObj.isCopy){
                    let Record_Date_flg = false;
                    filter_list = filter_list.filter(e =>{                    
                        if(moment(e.Record_Date).format('YYYY-MM-DD HH:mm:ss') == moment(sCareItem.Record_Date).format('YYYY-MM-DD HH:mm:ss')){
                            Record_Date_flg = true
                            console.log('Record_Date_flg',Record_Date_flg);
                        }
                        return new Date(e.Record_Date) <= new Date(sCareItem.Record_Date);
                    });
                    console.log('filter_list',filter_list);
                    console.log('Record_Date_flg',Record_Date_flg);
                    if(filter_list.length > 1 && Record_Date_flg){
                        filter_list = filter_list.slice(1);
                    }
                }
                let per_sCareList = filter_list[0];
                let _Record_Date = moment(per_sCareList.Record_Date).format('YYYY/MM/DD(dd) HH:mm');
                self.CopyMessage = `複製於 ${_Record_Date} `; 
                self.sCareDataObj = angular.copy(per_sCareList);
                self.sCareDataObj.isCreate  = true;
                self.sCareDataObj.Record_Date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
                self.sCareDataObj.Environment_User = CurrentUser().UserName;
                self.sCareDataObj.CreatedUserId = "";
                self.sCareDataObj.CreatedUserName = "";
                self.sCareDataObj.ModifiedUserId = "";
                self.sCareDataObj.ModifiedUserName = "";
                self.sCareDataObj.ModifiedTime = null;
                self.sCareDataObj.Id = "";
            }
    }, (res) => {
        
    });
    
}

// cancel
self.cancel = function cancel() {
    $mdDialog.cancel();
};

self.printPaper = function(){ 
    //$state.go("auctions", {"product": auction.product, "id": auction.id}); 
    $mdDialog.hide();
    $state.go('printSelfCare',{"item":self.sCareDataObj});
}

// save
self.ok = function ok() {
    //patient 基本資料
    self.sCareDataObj.Patientid = self.currentPatient.Id;
    self.sCareDataObj.Patient_Name = self.currentPatient.Name;
    self.sCareDataObj.Medicalid = self.currentPatient.MedicalId;
    self.sCareDataObj.Hospitalid = self.currentPatient.HospitalId;
    self.sCareDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
    //self.sCareDataObj.Record_Date.setHours(new Date(self.sCareDataObj.Record_Date).getHours()-8);
    /* 整理整理 other */
    other_list.forEach( e =>{
        self.Other_StrMage(e);
    });
    if(self.sCareDataObj.isCreate){
        console.log("isCreate-sCareDataObj", self.sCareDataObj);

        self.sCareDataObj.CreatedUserId = CurrentUser().UserId;
        self.sCareDataObj.CreatedUserName = CurrentUser().UserName;

        selfCareService.post(self.sCareDataObj).then((res) => {
            console.log("odLRData createOne success", res);
            showMessage($translate('orderLR.dialog.createSuccess'));
        }, (res) => {
            console.log("odLRData createOne fail", res);
            showMessage($translate('orderLR.dialog.createFail'));
        });
    }else{
        console.log("RecordDate--",self.sCareDataObj);
        //self.sCareDataObj.ModifiedUserId = CurrentUser().UserId;
        //self.sCareDataObj.ModifiedUserName = CurrentUser().UserName;
        self.sCareDataObj.ModifiedUserId = CurrentUser().UserId;
        self.sCareDataObj.ModifiedUserName = CurrentUser().UserName;
        self.sCareDataObj.ModifiedTime = moment(new Date());

        selfCareService.put(self.sCareDataObj).then((res) => {
            console.log("odLRData update success", res);
            showMessage($translate('orderLR.dialog.editSuccess'));
        }, (res) => {
            console.log("odLRData update fail", res);
            showMessage($translate('orderLR.dialog.editFail'));
        });
    }

    $mdDialog.hide();
};
}

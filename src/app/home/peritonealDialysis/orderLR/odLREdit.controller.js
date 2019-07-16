
angular
.module('app')
.controller('odLREditController', odLREditController);

odLREditController.$inject = [
    '$stateParams','PatientService',
    '$mdDialog', 'showMessage', 'SettingService', 'orderLRService', '$filter', 'odLRItem'];
function odLREditController(
    $stateParams, PatientService,
    $mdDialog, showMessage, SettingService, orderLRService, $filter, odLRItem) {

console.log("odLREditController Edit/Create Dialog", odLRItem);

const self = this;
const $translate = $filter('translate');

//self.isCreate = odLRItem === null;

self.odLRDataObj = [];
self.odLRDataObj = odLRItem;
console.log("selfodLRDataObj--",self.odLRDataObj);
console.log("odLRItem--",odLRItem);

let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
if (odLRItem.isCreate == "True") {        
    self.odLRDataObj.Record_Date = toDay;
}


self.patientId = $stateParams.patientId;
PatientService.getById($stateParams.patientId).then((res) => {
    self.currentPatient = res.data;
    console.log("self.currentPatient--",self.currentPatient);
}, (res) => {
    console.log("complicationService getList Fail", res);
});

// cancel
self.cancel = function cancel() {
    $mdDialog.cancel();
};

// save
self.ok = function ok() {
    //patient 基本資料
    self.odLRDataObj.Patientid = self.currentPatient.Id;
    self.odLRDataObj.Patient_Name = self.currentPatient.Name;
    self.odLRDataObj.Medicalid = self.currentPatient.MedicalId;
    self.odLRDataObj.Hospitalid = self.currentPatient.HospitalId;
    
    //self.odLRDataObj.Record_Date = moment(new Date(self.odLRDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
    self.odLRDataObj.Record_Date.setHours(self.odLRDataObj.Record_Date.getHours()+8);
    console.log("click OK odLRDataObj",self.odLRDataObj);
    
    if(odLRItem.isCreate == "True"){
        console.log("isCreate-odLRDataObj", self.odLRDataObj);
        orderLRService.post(self.odLRDataObj).then((res) => {
            console.log("odLRData createOne success", res);
            showMessage($translate('orderLR.dialog.createSuccess'));
        }, (res) => {
            console.log("odLRData createOne fail", res);
            showMessage($translate('orderLR.dialog.createFail'));
        });
    }else{
        console.log("RecordDate--",self.odLRDataObj);
        orderLRService.put(self.odLRDataObj).then((res) => {
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

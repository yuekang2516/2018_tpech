
angular
.module('app')
.controller('odSTEditController', odSTEditController);

odSTEditController.$inject = [
    '$stateParams','PatientService',
    '$mdDialog', 'showMessage', 'SettingService', 'orderSTService', '$filter', 'odSTItem'];
function odSTEditController(
    $stateParams, PatientService,
    $mdDialog, showMessage, SettingService, orderSTService, $filter, odSTItem) {
console.log("odSTEditController Edit/Create Dialog", odSTItem);

const self = this;
const $translate = $filter('translate');

//self.isCreate = odSTItem === null;
self.odSTDataObj = odSTItem;

console.log("selfodSTDataObj--",self.odSTDataObj);
console.log("odSTItem--",odSTItem);

self.patientId = $stateParams.patientId;
PatientService.getById($stateParams.patientId).then((res) => {
    self.currentPatient = res.data;
    console.log("self.currentPatient--",self.currentPatient);
}, (res) => {
    console.log("complicationService getList Fail", res);
});

let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
if (odSTItem.isCreate == "True") {        
    self.odSTDataObj.Record_Date = toDay;
}

// cancel
self.cancel = function cancel() {
    $mdDialog.cancel();
};

// save
self.ok = function ok() {
    //patient 基本資料
    self.odSTDataObj.Patientid = self.currentPatient.Id;
    self.odSTDataObj.Patient_Name = self.currentPatient.Name;
    self.odSTDataObj.Medicalid = self.currentPatient.MedicalId;
    self.odSTDataObj.Hospitalid = self.currentPatient.HospitalId;

    //self.odSTDataObj.Record_Date = moment(new Date(self.odSTDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
    self.odSTDataObj.Record_Date.setHours(self.odSTDataObj.Record_Date.getHours()+8);
    
    if(odSTItem.isCreate == "True"){
        console.log("isCreate-odSTDataObj", self.odSTDataObj);

        orderSTService.post(self.odSTDataObj).then((res) => {
            console.log("odLRData createOne success", res);
            showMessage($translate('orderLR.dialog.createSuccess'));
        }, (res) => {
            console.log("odLRData createOne fail", res);
            showMessage($translate('orderLR.dialog.createFail'));
        });
    }else{
        console.log("RecordDate--",self.odSTDataObj);
        orderSTService.put(self.odSTDataObj).then((res) => {
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

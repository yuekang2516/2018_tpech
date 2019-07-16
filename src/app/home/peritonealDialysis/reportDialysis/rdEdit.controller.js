
angular
.module('app')
.controller('rdEditController', rdEditController);

rdEditController.$inject = [
    '$stateParams','PatientService','userService',
    '$mdDialog', 'showMessage', 'SettingService', 'reportDialysisService', '$filter', 'rdItem'];
function rdEditController(
    $stateParams, PatientService,userService,
    $mdDialog, showMessage, SettingService, reportDialysisService, $filter, rdItem) {

console.log("rdEditController Edit/Create Dialog", rdItem);

const self = this;
const $translate = $filter('translate');

//self.isCreate = rdItem === null;

self.rdDataObj = [];
self.rdDataObj = rdItem;
console.log("selfrdDataObj--",self.rdDataObj);
console.log("rdItem--",rdItem);

let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
self.toDay = toDay;


self.Notification_Book = [
    { Text: "長期腹膜透析", Check: false },
    { Text: "長期血液透析", Check: false },
    { Text: "腎移植", Check: false },
    { Text: "轉安寧治療", Check: false }
]; 
self.Else = false;
//取得人員
userService.get().then((res) => {
    self.people = res.data;
        //讀取醫生
        self.sel_doctor = '';
        self.doctors = self.people.filter( item =>{
            return item.Role == "doctor"
        }).map( item =>{
            return {"EmployeeId": item.EmployeeId, "Account": item.Account, "Name": item.Name };
        });
        //讀取護理人員
        self.sel_nurse = '';
        self.nurses = self.people.filter( item =>{
            return item.Role == "nurse"
        }).map( item =>{
            return {"EmployeeId": item.EmployeeId, "Account": item.Account, "Name": item.Name };
        });
}, (res) => {
    console.log("current state name user Fail", res);
});

self.LoadData = function () {
    if (self.rdDataObj) {        
        self.rdDataObj.Record_Date = toDay;
        self.rdDataObj.Book_Consent_Phone = self.currentPatient.Phone[0];
        self.rdDataObj.Book_Consent_Address = self.currentPatient.CurrentAddress;
        self.rdDataObj.Book_Consent_Id = self.currentPatient.IdentifierId;
        self.rdDataObj.Book_Consent_Name = self.currentPatient.Name;
        self.rdDataObj.Book_Consent_Relation = "";
    }
}

let SelectCheckBox_ToString = function (list) {
    if (typeof list != "undefined") {
        var result = [];
        list.filter(item => item.Check == true)
            .forEach(item => {
                result.push(item.Text)
            })
        return _.join(result, ',');
    } else {
        return '';
    }
}
self.checkTheBox = function (name, index) {
    //選取陣列
    let SelCheckBoxItem = self[name][index];

    if (SelCheckBoxItem.Check) {
        self[name][index].Check = false;
    } else {
        self[name][index].Check = true;
    }
}
self.patientId = $stateParams.patientId;
PatientService.getById($stateParams.patientId).then((res) => {
    self.currentPatient = res.data;
    console.log("self.currentPatient--",self.currentPatient);
    self.LoadData();
}, (res) => {
    console.log("PatientService getList Fail", res);
});

// cancel
self.cancel = function cancel() {
    $mdDialog.cancel();
};


// self.printPaper = function(){
//     window.print();
// }

// save
self.ok = function ok() {
    //patient 基本資料
    self.rdDataObj.Patientid = self.currentPatient.Id;
    self.rdDataObj.Patient_Name = self.currentPatient.Name;
    self.rdDataObj.Medicalid = self.currentPatient.MedicalId;
    self.rdDataObj.Hospitalid = self.currentPatient.HospitalId;
    self.rdDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
    //self.rdDataObj.Record_Date = moment(new Date(self.rdDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
    //self.rdDataObj.Record_Date.setHours(self.rdDataObj.Record_Date.getHours()+8);
    console.log("click OK rdDataObj",self.rdDataObj);
    
    if(self.rdDataObj){
        self.rdDataObj.Notification_Book = SelectCheckBox_ToString(self.Notification_Book); 

        console.log("isCreate-rdDataObj", self.rdDataObj);
        reportDialysisService.post(self.rdDataObj).then((res) => {
            console.log("rdData createOne success", res);
            showMessage($translate('orderLR.dialog.createSuccess'));
        }, (res) => {
            console.log("rdData createOne fail", res);
            showMessage($translate('orderLR.dialog.createFail'));
        });
    }

    $mdDialog.hide();
};
}

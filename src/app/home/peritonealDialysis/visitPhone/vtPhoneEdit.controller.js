
angular
.module('app')
.controller('vtPhoneEditController', vtPhoneEditController);

vtPhoneEditController.$inject = [
    '$stateParams','PatientService',
    '$mdDialog', 'showMessage', 'SettingService', 
    'vtPhoneService', '$filter', 'vtPhoneItem'];
function vtPhoneEditController(
    $stateParams, PatientService,
    $mdDialog, showMessage, SettingService, 
    vtPhoneService, $filter, vtPhoneItem) {
console.log("vtPhoneEdit Edit/Create Dialog", vtPhoneItem);

const self = this;
const $translate = $filter('translate');

self.vtPhoneDataObj = angular.copy(vtPhoneItem);

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

self.patientId = $stateParams.patientId;
//取病患基本資料
PatientService.getById($stateParams.patientId).then((res) => {
    self.currentPatient = res.data;
    console.log("self.currentPatient--",self.currentPatient);
}, (res) => {
    console.log("complicationService getList Fail", res);
});

self.initialUI = function () {
    //操作問題
    self.Operational_Problems = [
        { Text: "居家換液操作問題", Check: false, disabled: false },
        { Text: "APD問題", Check: false, disabled: false },
        { Text: "引流問題", Check: false, disabled: false },
        { Text: "脫水問題", Check: false, disabled: false },
    ];
    //導管出口
    self.Catheter_Outlet = [
        { Text: "正常", Check: false, disabled: false },
        { Text: "疼痛", Check: false, disabled: false },
        { Text: "滲出物", Check: false, disabled: false }        
    ];
}

self.initialUI();

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

let StringTo_SelectCheckBox = function (s, list) {
    console.log(s);
    _.split(s, ',').forEach(_s => {
        list.forEach(item => {
            if (item.Text == _s) {
                item.Check = true;
            }
        })
    });    
}
let OneSelect_All_disabled_View = function (name) {
    //選取陣列
    let SelCheckBoxItem = self[name][0];
    if (SelCheckBoxItem.Check) {            
        self[name].slice(1).forEach(_t => {
            _t.disabled = true;
            _t.Check = false;
        })
        
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

self.OneSelect_All_disabled_Check = function (name, index) {
    //選取陣列
    let SelCheckBoxItem = self[name][index];

    if (SelCheckBoxItem.Check) {
        self[name][index].Check = false;
    } else {
        self[name][index].Check = true;
    }
    if (index == 0) {
        let _disabled = false;
        if (SelCheckBoxItem.Check) {
            _disabled = true
        }        
        self[name].slice(1).forEach(_t => {
            _t.disabled = _disabled;
            _t.Check = false;
        })
    }
}

function create_Record_Date(){
    
    return new Date(moment(self.date).format('YYYY-MM-DD') + " " + moment(self.time).format('HH:mm') );
}
//let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));

self.LoadData = function(){
    //編輯
    if(self.vtPhoneDataObj.isCreate){
        self.date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));
        self.time = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm')); 
        self.vtPhoneDataObj.Appointment_Date = new Date(moment(self.vtPhoneDataObj.Appointment_Date).format('YYYY-MM-DD HH:mm'));
    }
    //複製
    if(self.vtPhoneDataObj.isCopy){
        self.date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));
        self.time = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm')); 

        self.vtPhoneDataObj.isCreate = true;
        self.vtPhoneDataObj.CreatedUserId = null;
        self.vtPhoneDataObj.CreatedUserName = null;
        self.vtPhoneDataObj.ModifiedUserId = null;
        self.vtPhoneDataObj.ModifiedUserName = null;
        self.vtPhoneDataObj.ModifiedTime = null;
        self.vtPhoneDataObj.Id = null;
    }
    //編輯
    if(!self.vtPhoneDataObj.isCreate){
        self.date = new Date(moment(new Date(self.vtPhoneDataObj.Record_Date)).format('YYYY-MM-DD HH:mm'));
        self.time = new Date(moment(new Date(self.vtPhoneDataObj.Record_Date)).format('YYYY-MM-DD HH:mm')); 
        StringTo_SelectCheckBox(self.vtPhoneDataObj.Operational_Problems, self.Operational_Problems);
        StringTo_SelectCheckBox(self.vtPhoneDataObj.Catheter_Outlet, self.Catheter_Outlet);
        OneSelect_All_disabled_View('Catheter_Outlet');
        self.vtPhoneDataObj.Appointment_Date = new Date(moment(self.vtPhoneDataObj.Appointment_Date).format('YYYY-MM-DD HH:mm'));
    }
}
self.LoadData();


// cancel
self.cancel = function cancel() {
    $mdDialog.cancel();
};

// save
self.ok = function ok() {

    //patient 基本資料
    self.vtPhoneDataObj.Patientid = self.currentPatient.Id;
    self.vtPhoneDataObj.Patient_Name = self.currentPatient.Name;
    self.vtPhoneDataObj.Medicalid = self.currentPatient.MedicalId;
    self.vtPhoneDataObj.Hospitalid = self.currentPatient.HospitalId;
    self.vtPhoneDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
    //self.vtPhoneDataObj.Record_Date = moment(new Date(self.vtPhoneDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
    //self.vtPhoneDataObj.Record_Date.setHours(self.vtPhoneDataObj.Record_Date.getHours()+8);
    //整理寫入資料
    let chkboxToStrings = ['Operational_Problems', 'Catheter_Outlet'];
    chkboxToStrings.forEach(name => {
        self.vtPhoneDataObj[name] = SelectCheckBox_ToString(self[name]);
    });
    self.vtPhoneDataObj.Record_Date = create_Record_Date();
    if(self.vtPhoneDataObj.isCreate || self.vtPhoneDataObj.isCopy){
        self.vtPhoneDataObj.CreatedUserId = CurrentUser().UserId;
        self.vtPhoneDataObj.CreatedUserName = CurrentUser().UserName;

        //console.log("isCreate-vtPhoneDataObj", self.vtPhoneDataObj);
        vtPhoneService.post(self.vtPhoneDataObj).then((res) => {
            console.log("vtPhoneData createOne success", res);
            showMessage($translate('visitPhone.dialog.createSuccess'));
        }, (res) => {
            console.log("vtPhoneData createOne fail", res);
            showMessage($translate('visitPhone.dialog.createFail'));
        });
    }else{
        console.log("RecordDate--",self.vtPhoneDataObj);
        self.vtPhoneDataObj.ModifiedUserId = CurrentUser().UserId;
        self.vtPhoneDataObj.ModifiedUserName = CurrentUser().UserName;
        //self.vtPhoneDataObj.ModifiedUserId = "test";
        //self.vtPhoneDataObj.ModifiedUserName = "test";
        self.vtPhoneDataObj.ModifiedTime = moment(new Date());

        vtPhoneService.put(self.vtPhoneDataObj).then((res) => {
            console.log("vtPhoneData update success", res);
            showMessage($translate('visitPhone.dialog.editSuccess'));
        }, (res) => {
            console.log("vtPhoneData update fail", res);
            showMessage($translate('visitPhone.dialog.editFail'));
        });
    }

    $mdDialog.hide();
};
}

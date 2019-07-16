import tpl from './printRD.html';
import './printRD.less';

angular.module('app').component('printRD', {
    template: tpl,
    controller: printRDCtrl
});

printRDCtrl.$inject = [
    '$stateParams', 'userService','SettingService', 'reportDialysisService', '$mdDialog', 'PatientService',
    '$mdMedia', '$filter', 'showMessage','$state'];
function printRDCtrl(
    $stateParams, userService, SettingService, reportDialysisService, $mdDialog, PatientService,
    $mdMedia, $filter, showMessage,$state) {

    const self = this;
    if($stateParams.item == null){
        history.go(-1);
    }
    let _Record_Date = new Date($stateParams.item.Record_Date);
    let _rdDataObj = angular.copy($stateParams.item);
    self.rdDataObj = _rdDataObj;
    self.rdDataObj.Record_Date = _Record_Date;
    let $translate = $filter('translate');
    self.reportHospitaArea = "";
    let Hospitalist = [
        { "Value":"G","Text":"中興院區"}, //G
        { "Value":"Q","Text":"忠孝院區"}, //Q
        { "Value":"H","Text":"和平院區"}, //H
        { "Value":"F","Text":"仁愛院區"}, //F
        { "Value":"M","Text":"陽明院區"}  //M
    ]
    self.Notification_Book = [
        { Text: "長期腹膜透析", Check: false },
        { Text: "長期血液透析", Check: false },
        { Text: "腎移植", Check: false },
        { Text: "轉安寧治療", Check: false }
    ];
    self.Else = false;
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
    let StringTo_SelectCheckBox = function (s, list) {
        _.split(s, ',').forEach(_s => {
            list.forEach(item => {
                if (item.Text == _s) {
                    item.Check = true;
                }
            })
        });
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
    // 區分 HD or PD
    self.headerId = $stateParams.headerId;
    if(typeof self.rdDataObj.Patientid == "undefined"){
        self.Patientid = self.rdDataObj.patientId;
    }else{
        self.Patientid = self.rdDataObj.Patientid;
    }
    self.loading = true;
    self.isBrowser = cordova.platformId === 'browser';
    // List Data Array
    self.reportList = [];

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
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
        }).then(()=>{
            PatientService.getById(self.Patientid).then((res) => {
                self.currentPatient = res.data;
                console.log("self.currentPatient--",self.currentPatient);
            }, (res) => {
                console.log("PatientService getList Fail", res);
            });
        }).then(()=>{
            if(self.rdDataObj.isCreate){
                let toDay = new Date();
                self.rdDataObj.Record_Date = toDay;
                self.rdDataObj.Book_Consent_Phone = self.currentPatient.Phone[0];
                self.rdDataObj.Book_Consent_Address = self.currentPatient.CurrentAddress;
                self.rdDataObj.Book_Consent_Id = self.currentPatient.IdentifierId;
                self.rdDataObj.Book_Consent_Name = self.currentPatient.Name;
                self.rdDataObj.Book_Consent_Relation = null;
            }else{
                if(self.rdDataObj.Book_Consent_Relation.indexOf('病人之|') > -1){
                    self.Book_Consent_RelationElse = self.rdDataObj.Book_Consent_Relation.replace('病人之|','')
                    self.rdDataObj.Book_Consent_Relation = '病人之';
                }
                //StringTo_SelectCheckBox(self.rdDataObj.Notification_Book, self.Notification_Book);
                self.rdDataObj.Record_Date = new Date(self.rdDataObj.Record_Date);
                if(_.isEmpty(self.rdDataObj.Notification_Book_Name)){
                    self.Else = false;
                }else{
                    self.Else = true;
                }
            }
        });
    };
    self.Save = function(){
        //patient 基本資料
            self.rdDataObj.Patientid = self.currentPatient.Id;
            self.rdDataObj.Patient_Name = self.currentPatient.Name;
            self.rdDataObj.Medicalid = self.currentPatient.MedicalId;
            self.rdDataObj.Hospitalid = self.currentPatient.HospitalId;
            if(!_.isEmpty(self.rdDataObj.Book_Consent_Relation)){
                if(self.rdDataObj.Book_Consent_Relation.indexOf('病人之') > -1){
                    self.rdDataObj.Book_Consent_Relation = '病人之|' + self.Book_Consent_RelationElse
                }
            }
            console.log('save data',self.rdDataObj);
            
        if(self.rdDataObj.isCreate){
            //self.rdDataObj.Notification_Book = SelectCheckBox_ToString(self.Notification_Book); 
            self.rdDataObj.CreatedUserId = CurrentUser().UserId;
            self.rdDataObj.CreatedUserName = CurrentUser().UserName;

            reportDialysisService.post(self.rdDataObj).then((res) => {
                console.log("rdData createOne success", res);

                showMessage($translate('orderLR.dialog.createSuccess'),200);
                res.data['isCreate'] = false;

                // 利用有無 headerId 判斷是腹透或是血透
                if (!$stateParams.headerId) {
                    $state.go('printRD',{ item:res.data });
                } else {
                    history.go(-1);
                }
            }, (res) => {
                console.log("rdData createOne fail", res);
                showMessage($translate('orderLR.dialog.createFail'));
            });

        }else{
            if(self.rdDataObj.Notification_Book !='其他'){
                self.rdDataObj.Notification_Book_Name ="";
            }
            // if(!self.Else){
            //     self.rdDataObj.Notification_Book_Name = "";
            // }
            self.rdDataObj.ModifiedUserId = CurrentUser().UserId;
            self.rdDataObj.ModifiedUserName = CurrentUser().UserName;
            self.rdDataObj.ModifiedTime = moment(new Date());
            
            //self.rdDataObj.Notification_Book = SelectCheckBox_ToString(self.Notification_Book); 
            self.rdDataObj.Record_Date = new Date( self.rdDataObj.Record_Date);
            self.rdDataObj.Record_Date.setHours(new Date(self.rdDataObj.Record_Date).getHours());
            reportDialysisService.put(self.rdDataObj).then((res) => {
                console.log("rdData createOne success", res);
                showMessage($translate('reportDialysis.dialog.editSuccess'),200);
                
                // 利用有無 headerId 判斷是腹透或是血透
                if (!$stateParams.headerId) {
                    $state.go('reportDialysis',{ patientId: self.Patientid },{
                        location: 'replace'
                    });
                } else {
                    history.go(-1);
                }
            }, (res) => {
                console.log("rdData createOne fail", res);
                showMessage($translate('reportDialysis.dialog.editFail'));
            });
        }
        
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

    self.back = function back() {
        event.preventDefault();

        // 利用有無 headerId 判斷是腹透或是血透
        if (!$stateParams.headerId) {
            $state.go('reportDialysis',{ patientId: self.Patientid },{
                location: 'replace',
                notify: true
            });
        } else {
            history.go(-1);
        }
    };
    
    self.print = function(){
        // self.setValue();
        // // self.prints_tatus = false;
        // window.onafterprint = function(e){
        //     $(window).off('mousemove', window.onafterprint);
        //     console.log('Print Dialog Closed..');
        //     self.prints_tatus = true;
        // };
        //self.Save();
        window.print();
        
        // setTimeout(function(){
        //     $(window).on('mousemove', window.onafterprint);
        // }, 1);
    };
}

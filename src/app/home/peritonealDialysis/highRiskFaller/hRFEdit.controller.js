angular
    .module('app')
    .controller('hRFEditController', hRFEditController);

hRFEditController.$inject = [
    '$stateParams', 'PatientService', '$mdDialog', 'showMessage', 'SettingService',
    'highRiskFallerService', '$filter', 'hRFItem', 'headerId','ageFilter','labexamService','PatientFromColumnService',
    'nursingAssessmentService','NursingRecordService'
];

function hRFEditController(
    $stateParams, PatientService, $mdDialog, showMessage, SettingService,
    highRiskFallerService, $filter, hRFItem, headerId,ageFilter,labexamService,PatientFromColumnService,
    nursingAssessmentService,NursingRecordService) {

    console.log("vtPhoneEdit Edit/Create Dialog", hRFItem, headerId);

    const self = this;
    const $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    
    //self.isCreate = hRFItem === null;
    self.hRFDataObj = [];
    self.hRFDataObj = angular.copy(hRFItem);
    let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    self.View = {};
    let Scores = {}
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
    //UI 建置
    self.initialUI = function () {
        /// 【年齡大於65歲】
        self.View.Age_Over_65 =[
            {Text:"是", Value :"Y",Score: 1},
            {Text:"否", Value :"N",Score: 0}
        ];
        /// 【上次透析後至今天是否有發生跌倒上次透析後至今天是否有發生跌倒】
        self.View.Have_Fallen_Before =[
            {Text:"是", Value:"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];
        /// 【步態不穩、使用輔助助行器、軟弱需他人扶持】
        self.View.Can_Not_Walk_Myself = [
            {Text:"是", Value:"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];
        /// 【肢體功能障礙】        
        self.View.Limb_Dysfunction =[
            {Text:"是", Value:"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];
        /// 【意識不清或認知障礙】
        self.View.Unconsciousness_Or_Mci =[
            {Text:"是", Value :"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];       
        /// 【營養不良、頭暈、暈眩】        
        self.View.Malnutrition_Or_Dizziness =[
            {Text:"是", Value:"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];
        /// 【貧血(hct-25%)】
        self.View.Percent25_Anemia_Hct =[
            {Text:"是", Value:"Y",Score:1},
            {Text:"否", Value:"N",Score: 0}
        ];
        /// 【血壓不穩或姿位性低血壓】
        self.View.Blood_Pressure_Instability =[
            {Text:"是", Value:"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];       
        /// 【視力模糊或失明        
        self.View.Blurred_Vision_Or_Blindness =[
            {Text:"是", Value :"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];       
        /// 【服用影響意識活動之藥物】    
        self.View.Take_Drugs_Affect_Conscious =[
            {Text:"是", Value :"Y",Score: 1},
            {Text:"否", Value:"N",Score: 0}
        ];
    }
    self.initialUI();

    self.setTotal = function setTotal(item,name){
        let _total = 0;
        if(name != "Add")
            Scores[name] = item.Score;
        
        for (const [key, value] of Object.entries(Scores)) {
            _total += value;
        }
        self.hRFDataObj.Total =  _total;
    }
    function create_Record_Date(){
        return new Date(moment(self.date).format('YYYY-MM-DD') + " " + moment(self.time).format('HH:mm') );
    }
    PatientService.getById($stateParams.patientId).then((res) => {
        self.currentPatient = res.data;
        self.loadData();
        console.log("self.currentPatient--", self.currentPatient);
    }, (res) => {
        console.log("highRiskFallerService getList Fail", res);
    });
    function Load_HB(){
        self.lab_HB_Value = "";
        self.lab_HB_CheckTime = "";
        if(self.hRFDataObj.isCreate || self.hRFDataObj.isCopy){
            labexamService.getByPatientIdAndNameAndLessDate($stateParams.patientId,"HB").then((res) => {
                console.log('getByPatientIdAndNameAndLessDate',res);
                if(res.data != ""){
                    //貧血（Hb<8.5mg/dl）
                    let hb_value = _.toNumber(res.data.Value);
                    if(_.isNumber(hb_value)){
                        self.lab_HB_Value = res.data.Value;
                        self.lab_HB_item = " 檢驗值：" + res.data.Value;
                        self.lab_HB_CheckTime = moment(res.data.CheckTime).format('YYYY-MM-DD');
                        if(hb_value < 8.5){
                            self.lab_HB_Style ={"color": "crimson"};
                            self.hRFDataObj.Percent25_Anemia_Hct = "Y";    
                        }else{
                            self.hRFDataObj.Percent25_Anemia_Hct = "N";
                            self.lab_HB_Style ={"color": "green"};
                        }
                    }
                }
            }, (res) => {
                console.log("lab getByPatientIdAndNameAndLessDate Fail", res);
            });
        }else{
            PatientFromColumnService.getAllByFromId(self.hRFDataObj.Id).then((res) => {
                if(res.data != null){
                    self.Patient_HB = _.filter(res.data, { 'Record_Name': 'HB' });
                    if(self.Patient_HB.length > 0){
                        self.Patient_HB = self.Patient_HB[0];
                        //貧血（Hb<8.5mg/dl）
                        let hb_value = _.toNumber(self.Patient_HB.Record_Value);
                        if(_.isNumber(hb_value)){
                            self.lab_HB_Value = self.Patient_HB.Record_Value;
                            self.lab_HB_item = " 檢驗值：" + self.Patient_HB.Record_Value;
                            self.lab_HB_CheckTime = moment(self.Patient_HB.Record_Time).format('YYYY-MM-DD');
                            if(hb_value < 8.5){
                                self.lab_HB_Style ={"color": "crimson"};
                                self.hRFDataObj.Percent25_Anemia_Hct = "Y";    
                            }else{
                                self.hRFDataObj.Percent25_Anemia_Hct = "N";
                                self.lab_HB_Style ={"color": "green"};
                            }
                        }
                    }
                }

                console.log("HBSign success", res);
            }, (res) => {
                console.log("HBSign", res);
            });
        }
        
    }
    
    //基本資料設定
    self.loadData = function(){
        Load_HB();
        if(self.hRFDataObj.isCreate){
            self.RecordDate_disabled = false;
            self.date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));
            self.time = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm')); 
            for (const [key, value] of Object.entries(self.View)) {
                self.hRFDataObj[key] = "N"
                Scores[key] = 0;
            }
            let age = ageFilter(self.currentPatient.Birthday);
            self.hRFDataObj['Age_Over_65'] = age >= 65 ? 'Y' : 'N';
            Scores['Age_Over_65'] = age >= 65 ? 1 : 0;
            self.setTotal({},"Add");
        }else{
            if(self.hRFDataObj.isCopy){
                self.RecordDate_disabled = false;
                self.date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));
                self.time = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm')); 
                self.hRFDataObj.CreatedUserId = "";
                self.hRFDataObj.CreatedUserName = "";
                self.hRFDataObj.ModifiedUserId = "";
                self.hRFDataObj.ModifiedUserName = "";
                self.hRFDataObj.ModifiedTime = null;
                self.hRFDataObj.Id = "";
            }else{
                self.RecordDate_disabled = true;
                self.date = new Date(moment(new Date(self.hRFDataObj.Record_Date)).format('YYYY-MM-DD HH:mm'));
                self.time = new Date(moment(new Date(self.hRFDataObj.Record_Date)).format('YYYY-MM-DD HH:mm')); 
            }
            for (const [key, value] of Object.entries(self.View)) {
                Scores[key]  = (self.hRFDataObj[key] == "Y") ? 1 : 0;                
            }
        }
    }
    
    console.log("self.hRFDataObj-", self.hRFDataObj);
    console.log("hRFItem-", hRFItem);

    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };
    //新增護理紀錄
    function InsertNur(){
        //如果評分>=3 hRFDataObj.Total
        //上次透析後至今天是否有發生跌倒打勾 $ctrl.hRFDataObj.Have_Fallen_Before
        //當天一筆
        //新增護理評估
        if(self.hRFDataObj.Total >= 3 || self.hRFDataObj.Have_Fallen_Before =='Y'){
            switch(self.hRFDataObj.sys_Type){
                case "PD":
                        nursingAssessmentService.getAllByPatientId(self.currentPatient.Id,"NORMAL").then((res) => {
                            let fiter_array = res.data.filter(e =>{
                                return moment(new Date(e.Record_Date)).format('YYYY-MM-DD') == moment(new Date(self.hRFDataObj.Record_Date)).format('YYYY-MM-DD');
                            });
                            if(fiter_array.length == 0){
                                let nAFDataObj = {};
                                nAFDataObj.Record_Date = new Date(self.hRFDataObj.Record_Date);
                                nAFDataObj.Patientid = self.currentPatient.Id;
                                nAFDataObj.Patient_Name = self.currentPatient.Name;
                                nAFDataObj.Medicalid = self.currentPatient.MedicalId;
                                nAFDataObj.Hospitalid = self.currentPatient.HospitalId;
                                nAFDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
                                nAFDataObj.CreatedUserId = CurrentUser().UserId;
                                nAFDataObj.CreatedUserName = CurrentUser().UserName;
                                nAFDataObj.Nursing_Records = "給予預防跌倒的護理指導";
                                nAFDataObj.High_Risk_Fall_Eval_Score = self.hRFDataObj.Total;
                                nAFDataObj.High_Risk_Fall_Eval_Date = new Date(self.hRFDataObj.Record_Date);
                                nursingAssessmentService.post(nAFDataObj).then((res) => {
                                    console.log('新增護理紀錄成功！',res.data.id);
                                },(res) =>{
                                    console.log('新增護理紀錄失敗！')
                                });
                            }else{
                                //fiter_array
                                fiter_array = $filter('orderBy')(fiter_array, '-Record_Date');
                                fiter_array = fiter_array[0];
                                console.log('fiter_array',fiter_array);
                                nursingAssessmentService.getOne(fiter_array.Id).then((res) => {
                                    let nuritem = res.data;
                                    //更新
                                    nuritem.High_Risk_Fall_Eval_Score = self.hRFDataObj.Total;
                                    nuritem.High_Risk_Fall_Eval_Date = new Date(self.hRFDataObj.Record_Date);
                                    
                                    if(_.isEmpty(nuritem.Nursing_Records)){
                                        nuritem.Nursing_Records = "給予預防跌倒的護理指導";
                                    }else{
                                        if(nuritem.Nursing_Records.indexOf('給予預防跌倒的護理指導') == -1){
                                            nuritem.Nursing_Records += "給予預防跌倒的護理指導";
                                        }
                                    }
            
                                    
                                    nuritem.ModifiedUserId = CurrentUser().UserId;
                                    nuritem.ModifiedUserName = CurrentUser().UserName;
                                    nuritem.ModifiedTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                                    nursingAssessmentService.put(nuritem).then((res) => {
            
                                    }, (res) =>{
            
                                    });
                                }, (res) =>{
            
                                });
                            }
                        }, (res) => {
                            
                        });
                    break;
                case "HD":
                        let postData ={
                            "NursingTime": new Date(),
                            "Content":"給予預防跌倒的護理指導",
                            "PatientId":self.currentPatient.Id,
                            "Hospitalid": self.currentPatient.HospitalId,
                            "SourceType": 'DialysisData'
                        }
                        NursingRecordService.post(postData).then((res) => {
                            if (res.status === 200) {
                            }
                        }).catch((err) => {
                        }).finally(() => {
                        });
                    break;
            }
        }
    }
    // save
    self.ok = function ok() {
        let hostName = document.location.hostname;
        //patient 基本資料
        self.hRFDataObj.Patientid = self.currentPatient.Id;
        self.hRFDataObj.Patient_Name = self.currentPatient.Name;
        self.hRFDataObj.Medicalid = self.currentPatient.MedicalId;
        self.hRFDataObj.Hospitalid = self.currentPatient.HospitalId;
        self.hRFDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
        console.log("self.hRFDataObj--", self.hRFDataObj);

        // 判斷是否為 HD，若是要多帶 Header_Id & sys_Type
        if ($stateParams.headerId) {
            self.hRFDataObj.Header_Id = $stateParams.headerId;
            self.hRFDataObj.sys_Type = 'HD';
        }else{
            self.hRFDataObj.Header_Id = "";
            self.hRFDataObj.sys_Type = 'PD';
        }
        
        self.hRFDataObj.Record_Date = create_Record_Date();
        if (self.hRFDataObj.isCreate || self.hRFDataObj.isCopy) {
            self.hRFDataObj.CreatedUserId = CurrentUser().UserId;
            self.hRFDataObj.CreatedUserName = CurrentUser().UserName;

            console.log("isCreate-hRFDataObj", self.hRFDataObj);
            highRiskFallerService.post(self.hRFDataObj).then((res) => {
                if(self.lab_HB_Value != ""){
                    //跌倒評估ID
                    let _Form_Id = res.data.Id;
                    let _tmpobj ={
                        "Form_Id":_Form_Id,
                        "Record_Index": 0,
                        "Record_Time": self.lab_HB_CheckTime == "" ? "" : new Date(self.lab_HB_CheckTime),
                        "Record_Name": 'HB',
                        "Record_Value": self.lab_HB_Value,
                        "Medicalid": self.currentPatient.MedicalId,
                        "Patientid": self.currentPatient.Id,
                        "Hospitalid": self.currentPatient.HospitalId
                    }
                    // //新增跌倒紀錄HB項目
                    PatientFromColumnService.post(_tmpobj).then((res) => {
                        console.log("HBSign success", res);
                    }, (res) => {
                        console.log("HBSign", res);
                    });
                }
                InsertNur();
                console.log("highRiskFaller createOne success", res);
                showMessage($translate('visitHome.dialog.createSuccess'));
            }, (res) => {
                console.log("highRiskFaller createOne fail", res);
                showMessage($translate('visitHome.dialog.createFail'));
            });
        } else {
            self.hRFDataObj.ModifiedUserId = CurrentUser().UserId;
            self.hRFDataObj.ModifiedUserName = CurrentUser().UserName;
            self.hRFDataObj.ModifiedTime = moment(new Date());
            console.log("Edit hRFDataObj--", self.hRFDataObj);
            highRiskFallerService.put(self.hRFDataObj).then((res) => {
                console.log("highRiskFaller update success", res);
                InsertNur();
                showMessage($translate('visitHome.dialog.editSuccess'));
            }, (res) => {
                console.log("highRiskFaller update fail", res);
                showMessage($translate('visitHome.dialog.editFail'));
            });
        }

        $mdDialog.hide();
    };
}
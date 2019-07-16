
angular
.module('app')
.controller('vtHomeEditController', vtHomeEditController);
//pdTreatService     處方 api
//peritonitisService 腹膜炎api

vtHomeEditController.$inject = [
    '$stateParams','PatientService', '$mdDialog', 'showMessage', 'SettingService', 'pdTreatService','peritonitisService',
    'catheterInfectService','visitPeritonealDialysisService', '$filter', 'vtHomeItem','last_vtHomeItem'];
function vtHomeEditController(
    $stateParams, PatientService, $mdDialog, showMessage, SettingService, pdTreatService,peritonitisService,
    catheterInfectService,visitPeritonealDialysisService, $filter, vtHomeItem,last_vtHomeItem) {
console.log("vtPhoneEdit Edit/Create Dialog", vtHomeItem);

const self = this;
const $translate = $filter('translate');
self.isCreate = vtHomeItem === null;
self.vtHomeDataObj = angular.copy(vtHomeItem);

self.patientId = $stateParams.patientId;
console.log('last_vtHomeItem',last_vtHomeItem);
//self.vtHomeDataObj.Record_Date = undefined;
let s = ['Fluid_Xch_Ground_Cleaning',
    'Fluid_Xch_Pet_Raising',
    'Fluid_Xch_Carpet_Laying',
    'Fluid_Xch_Has_Fluid_Xch_Room',
    'Fluid_Xch_Env_Spec_Xch_Desk',
    'Fluid_Xch_Env_No_Redundancy',
    'Fluid_Xch_Env_Close_To_Door',
    'Fluid_Xch_Env_Ashless_Ceiling',
    'Fluid_Xch_Env_Air_Cooler',
    'Fluid_Xch_Env_Neat_Decoration',
    'Fluid_Xch_Env_Curtain_No_Dust',
    'Fluid_Xch_Env_Wall_Clean_Dry',
    'Fluid_Xch_Env_Containers_Bags',
    'Fluid_Xch_Env_Close_Washstand',
    'Fluid_Xch_Env_Clean_Washstand',
    'Prepare_Env_Close_Doors',
    'Prepare_Env_Turnoff_Air_Mach',
    'Prepare_Env_Material_Complete',
    'Xch_Tech_Clean_Desk',
    'Xch_Tech_Handwash_Faucet',
    'Xch_Tech_Wash_Hands_Step',
    'Xch_Tech_Closefaucet_Usepaper',
    'Xch_Tech_All_Man_Wear_Masks',
    'Xch_Tech_Examinate_Fluids_5',
    'Xch_Tech_Aseptic_Technology',
    'Xch_Tech_Standard_Xch_Steps',
    'Xch_Tech_Correct_Heating_Step',
    'Aftercare_Drainage_Bag_Weigh',
    'Aftercare_Poured_Into_Toilet',
    'Aftercare_Correct_Rehabilitat',
    'Record_Each_Drainage',
    'Record_Glucose_Concentration',
    'Record_Daily_Blood_Pressure',
    'Record_Daily_Weight',
    'Record_Abnormal_Conditions',
    'Catheter_Nurse_Adequate_Light',
    'Catheter_Nurse_Daily_Excute_1',
    'Catheter_Nurse_Check_Catheter',
    'Catheter_Nurse_Disinfecte',
    'Catheter_Nurse_Fix_Catheter',
    'Catheter_Nurse_After_Shower',
    'Storage_Mode_Ventilation',
    'Storage_Mode_Avoid_Dampness',
    'Storage_Mode_No_Bugs',
    'Compliance_Overstock_Oraldrug',
    'Compliance_Phosphorus_Binders',
    'Compliance_Correct_Xch_Times',
    'Compliance_Overstock_Dialys',
    'Compliance_Hypotensive_Drug',
    'Compliance_Use_Epo'];
let chk_list =[
    'Now_Status_Action_Degree','Now_Status_Consciousness','Fluid_Xch_Exchanger','Fluid_Xch_Add_Drug_Status','Live_Cond_Rehabilitation',
    'Live_Cond_Family_Interact','Live_Cond_Sleep_Habits','Live_Cond_Dietary_Types','Live_Cond_Appetite','Live_Cond_Defecation'
];
let other_list =[
    'Fluid_Xch_Exchanger_Other',
    'Fluid_Xch_Add_Drug_Other',
    'Live_Cond_Therapy_Other',
    'Live_Cond_Dietary_Other',
    'Live_Cond_Defecation_Other'
]
    //處方清單
    self.treatDetailTypes = {
        CAPD:{
            Treat:[] //換液處方
        },
        APD:{
            Machine:[], //機器處方
            ListBage:[], //最末袋處方
            TwinBage:[] //雙連袋
        },
        Dialysis_Type:'',
        Prescription_Startdate:'',
        Count:0,
        ESA:[] //ESA清單
    };
    //給付條件
    self.PaymentconditionsCheck = [
        { Value: "HighPET", Text: "High PET", Check: false, Type: "Extraneal" },
        { Value: "HighConc", Text: "High Conc. > 1/2", Check: false, Type: "Extraneal" },
        { Value: "UFFailure", Text: "UF Failure", Check: false, Type: "Extraneal" },
        { Value: "DMwithA1C", Text: "A1c > 7%", Check: false, Type: "Extraneal" },
        { Value: "Peritonitis", Text: "Peritonitis", Check: false, Type: "Extraneal" },
        { Value: "HA25", Text: "HA + 2.5%", Check: false, Type: "Extraneal" },
        { Value: "Alb", Text: "Alb ≦ 3.5", Check: false, Type: "Nutrineal" }, //Alb &lt;= 3.5
        { Value: "nPNA", Text: "nPNA < 0.9", Check: false, Type: "Nutrineal" },
        //nPNA &lt; 0.9
    ];
    self.ListBage_PaymentconditionsCheck = angular.copy(self.PaymentconditionsCheck);
    self.TwinBage_PaymentconditionsCheck = angular.copy(self.PaymentconditionsCheck);

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
self.initialUI = function(){
    self.Now_Status_Action_Degree = [
        { Text: "正常", Check: false, disabled: false },
        { Text: "需人扶持", Check: false, disabled: false },
        { Text: "輪椅", Check: false, disabled: false },
        { Text: "助行器", Check: false, disabled: false },
        { Text: "長期臥床", Check: false, disabled: false }
    ];
    self.Now_Status_Consciousness = [
        { Text: "清醒", Check: false, disabled: false },
        { Text: "嗜睡", Check: false, disabled: false },
        { Text: "混亂", Check: false, disabled: false },
        { Text: "昏迷", Check: false, disabled: false }
    ];
    self.Fluid_Xch_Exchanger =[
        { Text: "病人本人", Check: false, disabled: false },
        { Text: "父母", Check: false, disabled: false },
        { Text: "兄弟姊妹", Check: false, disabled: false },
        { Text: "兒女", Check: false, disabled: false },
        { Text: "孫子女", Check: false, disabled: false },
        { Text: "其他親戚", Check: false, disabled: false },
        { Text: "朋友", Check: false, disabled: false }
    ];
    self.Fluid_Xch_Exchanger_Other = false;
    self.Fluid_Xch_Add_Drug_Status =[
        { Text: "無", Check: false, disabled: false },
        { Text: "胰島素", Check: false, disabled: false },
        { Text: "肝素", Check: false, disabled: false },
        { Text: "抗生素", Check: false, disabled: false }
    ];
    self.Fluid_Xch_Add_Drug_Other = false;
    self.Live_Cond_Rehabilitation =[
        { Text: "全職工作", Check: false, disabled: false },
        { Text: "兼職工作", Check: false, disabled: false },
        { Text: "家管", Check: false, disabled: false },
        { Text: "學生", Check: false, disabled: false }
    ];
    self.Live_Cond_Therapy_Other = false;
    self.Live_Cond_Family_Interact =[
        { Text: "好", Check: false, disabled: false },
        { Text: "尚可", Check: false, disabled: false },
        { Text: "不好", Check: false, disabled: false }
    ];
    self.Live_Cond_Sleep_Habits =[
        { Text: "正常", Check: false, disabled: false },
        { Text: "失眠(有使用安眠藥)", Check: false, disabled: false },
        { Text: "失眠(無使用安眠藥)", Check: false, disabled: false },
    ];
    self.Live_Cond_Dietary_Types =[
        { Text: "一般", Check: false, disabled: false },
        { Text: "素食", Check: false, disabled: false },
        { Text: "軟質", Check: false, disabled: false },
        { Text: "流質", Check: false, disabled: false }    
    ];
    self.Live_Cond_Dietary_Other = false;
    self.Live_Cond_Appetite =[
        { Text: "佳", Check: false, disabled: false },
        { Text: "尚可", Check: false, disabled: false },
        { Text: "不好", Check: false, disabled: false }
    ];
    self.Live_Cond_Defecation =[
        { Text: "正常", Check: false, disabled: false },
        { Text: "便秘", Check: false, disabled: false },
        { Text: "腹瀉", Check: false, disabled: false }
    ];
    self.Live_Cond_Defecation_Other = false;
    //留置時間
    self.RetentionTimeHh = ['0','1','2','3','4','5','6','7','8','9','10','11','12','其他'];
    self.RetentionTimeMm = ['0','5','10','15','20','25','30','35','40','45','50','55','其他'];

}
self.initialUI();
//處方明細 start
self.getDetailList_load = true;
function getDetailList(){
    //取病患紀錄（頭）
    self.treatDetailList = [];
    if(self.vtHomeDataObj.isCreate){
        pdTreatService.getList(self.patientId,"NORMAL").then((res) => {
            let tp_desc = $filter('orderBy')(res.data, '-Prescription_Startdate'); //排序
            //取最後一筆
            console.log("tp_desc--",tp_desc);
            if(tp_desc.length > 0){
                let treatList = tp_desc[0];
                self.vtHomeDataObj.Prescription_Id = treatList.Id;
                self.vtHomeDataObj.Dialysis_Type = treatList.Dialysis_Type;
                arrageTreatDetail(treatList);
                self.treatDetailTypes.Count = treatList.length;
                self.treatDetailTypes.Dialysis_Type = treatList.Dialysis_Type;
                self.treatDetailTypes.Prescription_Startdate = new Date(treatList.Prescription_Startdate);
                self.getDetailList_load = false;
            }
        }).then((res)=>{
            self.getDetailList_load = false;
        });
    }else{
        pdTreatService.getOne(self.vtHomeDataObj.Prescription_Id).then((res) => {
            if(res.data != null){
                //Prescription_Startdate 一開例日期排序最後一筆
                let treatList = res.data;
                //設定Prescription_Id
                self.vtHomeDataObj.Prescription_Id = treatList.Id;

                self.vtHomeDataObj.Dialysis_Type = treatList.Dialysis_Type;
                arrageTreatDetail(treatList);
                self.treatDetailTypes.Count = treatList.length;
                self.treatDetailTypes.Dialysis_Type = treatList.Dialysis_Type;
                self.treatDetailTypes.Prescription_Startdate = new Date(treatList.Prescription_Startdate);
            }
        }).then(()=>{
            self.getDetailList_load = false;
        });      
    }

}

//整理Dianeal
function arrangeDianealata(Dialysis_Type,TreatType){
    //if(self.treatDataObj.Dialysis_Type == "CAPD"){
        console.log(Dialysis_Type,TreatType)
        let templist = self.treatDetailTypes[Dialysis_Type][TreatType];
        let p = null;
        switch(TreatType){
            case 'ListBage':
                    p = self[TreatType + '_PaymentconditionsCheck'];
                break;
            case 'TwinBage':
                    p = self[TreatType + '_PaymentconditionsCheck'];
                break;
            case 'Treat':
                    p = self.PaymentconditionsCheck;
                break;
        }
        templist.forEach(e =>{
            e.BaglitreOther = "";
            e.Esa_Dose_U = _.toNumber(e.Esa_Dose_U);
            if(e.Baglitre != null){
                if(e.Baglitre.indexOf('其他|') > -1){
                    let tempVal = e.Baglitre.split('|');
                    e.BaglitreOther = _.toNumber(tempVal[1]);
                    e.Baglitre = tempVal[0];
                }
            }
            e.Esa_Dose_Ug = e.Esa_Dose_Ug == "false" ? false : true;
            if(e.Paymentconditions != null){
                e.Paymentconditions.split(',').forEach( x =>{
                    p.forEach( element =>{
                        if(element.Value == x){
                            element.Check = true;
                        }
                    });
                })
            }
        });
        if(templist.length > 0){
            self.treatDetailTypes[Dialysis_Type][TreatType] = _.orderBy(templist, ['Sequence'], ['asc']);
        }
    //}
}
function arrageTreatDetail(treatList){
        pdTreatService.getDetailList(treatList.Id,"NORMAL").then((res) => {
            console.log("pdTreatService getDetailList SUCCESS", res);
            let treatDetailList = res.data;
            //ESA
            self.treatDetailTypes.ESA = treatDetailList.filter(e =>{
                return e.Fluidchangetime == "ESA";
            });
            if(treatList.Dialysis_Type == "CAPD"){
                self.treatDetailTypes.CAPD.Treat = treatDetailList.filter(e =>{
                    return e.Fluidchangetime == "Treat";
                });
                //整理Dianeal
                arrangeDianealata(treatList.Dialysis_Type,'Treat');
                CalculationCAPDTreat();
            }
            if(treatList.Dialysis_Type == "APD"){
                //每次注入量
                self.Pd_Injection_Volume = String(treatList.Pd_Injection_Volume);

                if(self.Pd_Injection_Volume.indexOf(-999) > -1 ){
                    self.PdInjectionVolumeOther = _.toNumber(self.Pd_Injection_Volume.replace('-999',''))/1000;
                    self.Pd_Injection_Volume = -999;
                }
                //週期數
                self.Pd_Period_Number = String(treatList.Pd_Period_Number);

                if(self.Pd_Period_Number.indexOf(-999) > -1 ){
                    self.PdPeriodNumberOther = _.toNumber(self.Pd_Period_Number.replace('-999',''));
                    self.Pd_Period_Number = -999;
                }

                self.treatDetailTypes.APD.Machine = treatDetailList.filter(e =>{
                    return e.Fluidchangetime == "Machine";
                });
                self.treatDetailTypes.APD.ListBage = treatDetailList.filter(e =>{
                    return e.Fluidchangetime == "ListBage";
                });
                self.treatDetailTypes.APD.TwinBage = treatDetailList.filter(e =>{
                    return e.Fluidchangetime == "TwinBage";
                });
                arrangeDianealata(treatList.Dialysis_Type,'Machine');
                arrangeDianealata(treatList.Dialysis_Type,'ListBage');
                arrangeDianealata(treatList.Dialysis_Type,'TwinBage');

                if(self.treatDetailTypes.APD.ListBage.length > 0){
                    self.LastBagShow = true;
                    self.Pd_Ismatch_Last_Bag_Concn = treatList.Pd_Ismatch_Last_Bag_Concn
                    if(self.Pd_Ismatch_Last_Bag_Concn == 'N'){
                        let Dianeallen = self.treatDetailTypes.APD.ListBage.filter( e =>{
                            return e.Potiontypes == "Dianeal";
                        }).length;
                        let Extraneallen = self.treatDetailTypes.APD.ListBage.filter( e =>{
                            return e.Potiontypes == "Extraneal";
                        }).length;
                        console.log('Dianeallen',Dianeallen)
                        console.log('Extraneallen',Extraneallen)
                        if(Dianeallen > 0){
                            self.LastBageConcnSelect = "Dianeal";
                        }
                        if(Extraneallen > 0){
                            self.LastBageConcnSelect = "Extraneal";
                        }
                    }
                }else{
                    self.LastBagShow = false;
                }
                //self.treatDetailTypes.APD['TwinBageDianealCount'] = CalculationDianealCount('TwinBage','Dianeal');
                //self.treatDetailTypes.APD['TwinBageExtranealCount'] = CalculationDianealCount('TwinBage','Extraneal');
                CalculationAPDTreat();
            }

        }, (res) => {
            console.log("pdTreatService getDetailList FAIL", res);
        }).then(()=>{
            self.getDetailList_load = false;
        });

}

//CAPD 計算換液處方
function CalculationCAPDTreat (){
    self.Daily_Changed_Bag_Times = 0; //每日換袋次數
    self.CAPD_Total_Treatment = 0;
    self.CAPD_Total_Prescription = 0;
    //每日換袋次數
    //所有處方袋數加總，PRN不計入
    //總治療量
    //每次注入量(L)*袋數加總，PRN不計入
    //總處方量
    //藥水體積*袋數的總計，不含PRN
    self.treatDetailTypes.CAPD.Treat.forEach( e =>{
        if(!e.Esa_Dose_Ug){
            //每日換袋次數
            let Bagnumber = _.toNumber(e.Bagnumber);
            if(_.isNumber(Bagnumber)){
                self.Daily_Changed_Bag_Times += Bagnumber;
            }
            //總治療量
            let Esa_Dose_U = _.toNumber(e.Esa_Dose_U);

            let Baglitre = (e.Baglitre == '其他') ? _.toNumber(e.BaglitreOther) : _.toNumber(e.Baglitre) ;

            if(_.isNumber(Esa_Dose_U)){

                self.CAPD_Total_Treatment = _.toNumber((self.CAPD_Total_Treatment + (Bagnumber * Esa_Dose_U)).toFixed(2));
            }

            //總處方量
            if(_.isNumber(Baglitre)){
                self.CAPD_Total_Prescription = _.toNumber((self.CAPD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));

            }
            console.log('self.CAPD_Total_Prescription',self.CAPD_Total_Prescription)
        }
    });
}
//APD 計算
function CalculationAPDTreat (){
    self.APD_Total_Treatment = 0;
    self.APD_Total_Prescription = 0;
    let DialysisOsmotic = [];
    //Machine:[], //機器處方
    //ListBage:[], //最末袋處方
    //TwinBage:[], //雙連袋
    //總處方量
    //藥水體積*袋數的總計，不含PRN
    self.treatDetailTypes.APD.Machine.forEach( e=>{
        if(!e.Esa_Dose_Ug){
            //每日換袋次數
            let Bagnumber = _.toNumber(e.Bagnumber);
            //總處方量
            let Baglitre = (e.Baglitre == '其他') ? _.toNumber(e.BaglitreOther) : _.toNumber(e.Baglitre) ;
            // if(_.isNumber(Baglitre)){
            //     self.APD_Total_Prescription += (Bagnumber * Baglitre);
            // }
            //總處方量
            if(_.isNumber(Baglitre)){
                self.APD_Total_Prescription = _.toNumber((self.APD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));
                // self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
            }

        }
        if(DialysisOsmotic.indexOf(e.Potiontypes) == -1){
            DialysisOsmotic.push(e.Potiontypes);
        }
    });
    //總治療量
    //藥水體積(L) * 週期數
    let Pd_Injection_Volume = (self.Pd_Injection_Volume == -999) ? _.toNumber(self.PdInjectionVolumeOther) : _.toNumber(self.Pd_Injection_Volume/1000); 

    let Pd_Period_Number = (self.Pd_Period_Number == -999) ? _.toNumber(self.PdPeriodNumberOther) : _.toNumber(self.Pd_Period_Number);

    if(_.isNumber(Pd_Injection_Volume) && _.isNumber(Pd_Period_Number)){
        self.APD_Total_Treatment = Pd_Injection_Volume * Pd_Period_Number;
    }

    self.treatDetailTypes.APD.ListBage.forEach( e=>{
        if(!e.Esa_Dose_Ug){
            let Esa_Dose_U = _.toNumber(e.Esa_Dose_U);
            if(_.isNumber(Esa_Dose_U) && !isNaN(Esa_Dose_U)){
                self.APD_Total_Treatment += Esa_Dose_U;
            }

            //每日換袋次數
            let Bagnumber = _.toNumber(e.Bagnumber);
            //總處方量
            let Baglitre = _.toNumber(e.Baglitre);
            
            //總處方量
            if(_.isNumber(Baglitre)){
                self.APD_Total_Prescription = _.toNumber((self.APD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));
                // self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
            }

            // if(_.isNumber(Baglitre)){
            //     self.APD_Total_Prescription += (Bagnumber * Baglitre);
            // }
        }
        if(DialysisOsmotic.indexOf(e.Potiontypes) == -1){
            DialysisOsmotic.push(e.Potiontypes);
        }
    });

    self.treatDetailTypes.APD.TwinBage.forEach( e=>{
        if(!e.Esa_Dose_Ug){
            let Esa_Dose_U = _.toNumber(e.Esa_Dose_U);
            let Baglitre = (e.Baglitre == '其他') ? _.toNumber(e.BaglitreOther) : _.toNumber(e.Baglitre) ;
            self.APD_Total_Treatment += Esa_Dose_U;

            //每日換袋次數
            let Bagnumber = _.toNumber(e.Bagnumber);
            //總處方量
            if(_.isNumber(Baglitre)){
                self.APD_Total_Prescription = _.toNumber((self.APD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));
                // self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
            }
            //總處方量
            // if(_.isNumber(Baglitre)){
            //     self.APD_Total_Prescription += (Bagnumber * Baglitre);
            // }
        }
    });
}
//處方 end

//腹膜炎清單
self.getPeritonitisList_load = true;
function getPeritonitisList(){
    if(self.vtHomeDataObj.isCreate){
        peritonitisService.getInfectionRecord(self.currentPatient.MedicalId,"NORMAL").then((res) => {
            self.last_peritonitis_item = null;
            console.log("peritonitisService getAll Success", res);
            if(res.data.length > 0){
                let tp_desc = $filter('orderBy')(res.data, '-Treatment_Date');
                if(tp_desc.length > 0){
                    self.last_peritonitis_item = tp_desc[0];
                    if(self.last_peritonitis_item.Occurrence != null){
                        self.Occurrence = self.last_peritonitis_item.Occurrence.replace('OTHER_', '其他:')
                    }else{
                        self.Occurrence = "";
                    }
                    
                    self.vtHomeDataObj.Peritonitis_Id = self.last_peritonitis_item.Id;
                    //菌種清單
                    peritonitisService.getGermsByInfectionId(self.last_peritonitis_item.Id,"NORMAL").then((res) => {
                        console.log("peritonitisService getGermsByInfectionId success", res);
                        let germAry = [];
                        res.data.forEach(item =>{
                            germAry.push(item.Culture_Strain);
                        })
                        self.germArystr = germAry.join(',');
                    }, (res) => {
                        console.log("peritonitisService getGermsByInfectionId fail", res);
                    }).then(()=>{
                        self.getPeritonitisList_load = false;
                    });
                }
                
            }

        }, (res) => {
            console.log("peritonitisService getAll Fail", res);
        }).then(()=>{
            self.getPeritonitisList_load = false;
        });
    }else{
        peritonitisService.getOne(self.vtHomeDataObj.Peritonitis_Id).then((res) => {
            if(res.data != ""){
                self.last_peritonitis_item = res.data;
                if(self.last_peritonitis_item.Occurrence != null){
                    self.Occurrence = self.last_peritonitis_item.Occurrence.replace('OTHER_', '其他:');
                }else{
                    self.Occurrence ="";
                }
                //菌種清單
                peritonitisService.getGermsByInfectionId(self.vtHomeDataObj.Peritonitis_Id,"NORMAL").then((res) => {
                    console.log("peritonitisService getGermsByInfectionId success", res);
                    let germAry = [];
                    res.data.forEach(item =>{
                        germAry.push(item.Culture_Strain);
                    })
                    self.germArystr = germAry.join(',');
                }, (res) => {
                    console.log("peritonitisService getGermsByInfectionId fail", res);
                }).then(()=>{
                    self.getPeritonitisList_load = false;
                });
            }                
        }, (res) => {
            console.log("peritonitisService getAll Fail", res);
        }).then(()=>{
            self.getPeritonitisList_load = false;
        });
    }

}
//導管出口感染
self.getCatheterinfectList_load = true;
function getCatheterinfectList(){
    self.catheterList = [];
    if(self.vtHomeDataObj.isCreate){
        catheterInfectService.getInfectionRecord(self.currentPatient.MedicalId,"NORMAL").then((res) => {
            self.last_catheter_item  = null;
            if(res.data.length > 0){
                let tp_desc = $filter('orderBy')(res.data, '-Treatment_Date');
                if(tp_desc.length > 0){
                    self.last_catheter_item = tp_desc[0];
                    self.caOccurrence = self.last_catheter_item.Occurrence;
                    self.vtHomeDataObj.Catheter_Id = self.last_catheter_item.Id;
                    //self.germAry = [];
                    catheterInfectService.getGermsByInfectionId(self.last_catheter_item.Id,"NORMAL").then((res) => {
                        console.log("catheterInfectService getGermsByInfectionId success", res);
                        let germAry = [];
                        res.data.forEach(item =>{
                            germAry.push(item.Culture_Strain);
                        })
                        self.catheterstr = germAry.join(',');
                        //self.germAry = res.data;
                    }).then(()=>{
                        self.getCatheterinfectList_load = false;
                    }); 
                }
            }
        }, (res) => {
            console.log("catheterInfectService getAll Fail", res);
        }).then(()=>{
            self.getCatheterinfectList_load = false;
        });
    }else{
        catheterInfectService.getOne(self.vtHomeDataObj.Catheter_Id).then((res) => {
            if(res.data != ""){
                self.last_catheter_item = res.data;
                self.caOccurrence = self.last_catheter_item.Occurrence;
                catheterInfectService.getGermsByInfectionId(self.vtHomeDataObj.Catheter_Id,"NORMAL").then((res) => {
                    console.log("catheterInfectService getGermsByInfectionId success", res);
                    let germAry = [];
                    res.data.forEach(item =>{
                        germAry.push(item.Culture_Strain);
                    })
                    self.catheterstr = germAry.join(',');
                    //self.germAry = res.data;
                }).then(()=>{
                    self.getCatheterinfectList_load = false;
                });  
            }   
        }, (res) => {
            console.log("catheterInfectService getAll Fail", res);
        }).then(()=>{
            self.getCatheterinfectList_load = false;
        });
    }
}
//畫面行為動作
self.checkTheBox = function (name, index) {
    //選取陣列
    let SelCheckBoxItem = self[name][index];

    if (SelCheckBoxItem.Check) {
        self[name][index].Check = false;
    } else {
        self[name][index].Check = true;
    }
}

self.setTotal = function setTotal(){
    let _total = 0;
    
    for(let i = 0,len = s.length; i <= len; i++){
        if(!_.isEmpty(self.vtHomeDataObj[s[i]])){
            _total += parseInt(self.vtHomeDataObj[s[i]]);
        }    
    }
    self.vtHomeDataObj.Total_Score =  _total;
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
let StringTo_SelectCheckBox = function (s, list) {
    _.split(s, ',').forEach(_s => {
        list.forEach(item => {
            if (item.Text == _s) {
                item.Check = true;
            }
        })
    });    
}
function Add_Arrange_nAFDataobj() {
    

    chk_list.forEach( item_name =>{        
        self.vtHomeDataObj[item_name] = SelectCheckBox_ToString(self[item_name]);
    });

}
function create_Record_Date(){
    
    return new Date(moment(self.date).format('YYYY-MM-DD') + " " + moment(self.time).format('HH:mm') );
}
function Edit_Other(item,other_lab){
    //item.str.search("_else"); 
    if(item === null) return;
    
    if(item.indexOf("其他") > -1){
        let split_length = item.split('|').length;
        console.log('split_length',split_length);
        self.vtHomeDataObj[other_lab] = "其他";
        if(split_length > 1){
            self.vtHomeDataObj[other_lab +"_Other"] = item.split('|')[1];
        }
    }
}
function Other_StrMage(other_lab){
    let mmm = self.vtHomeDataObj[other_lab +"_Other"] ;
    let value = self.vtHomeDataObj[other_lab];
    if(value =="其他"){
        if(!_.isEmpty(mmm)){
            self.vtHomeDataObj[other_lab] = "其他|" + mmm;
        }
    }
}
self.LoadData = function () {
    PatientService.getById(self.patientId).then((res) => {
        self.currentPatient = res.data;
        console.log("self.currentPatient--",self.currentPatient)
        self.currentPatient.FirstPDDate = new Date(self.currentPatient.FirstPDDate);
    }, (res) => {
        console.log("complicationService getList Fail", res);
    }).then(()=> {
            getDetailList();
    }).then(()=>{
            getPeritonitisList();
    }).then(()=>{
            getCatheterinfectList();
    });
    //self.Calculation_Net_Body_Weight();
    //getPeritonitisList();
    let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    if (self.vtHomeDataObj.isCreate) {
        console.log('last_vtHomeItem.Number_Of_Visits',last_vtHomeItem.Number_Of_Visits);
        if(typeof last_vtHomeItem.Number_Of_Visits != "undefined"){
            self.vtHomeDataObj.Number_Of_Visits = parseInt(last_vtHomeItem.Number_Of_Visits) + 1;
        }else{
            self.vtHomeDataObj.Number_Of_Visits = 1;
        }
        self.Record_Date_disabled = false;
        self.date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm'));
        self.time = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm')); 
        //self.vtHomeDataObj.Record_Date = toDay;
        self.vtHomeDataObj.Visit_Date = toDay;
    }
    //編輯的時候
    if (self.vtHomeDataObj.isCreate == false) {
        self.Record_Date_disabled = true;
        self.date = new Date(moment(new Date(self.vtHomeDataObj.Record_Date)).format('YYYY-MM-DD HH:mm'));
        self.time = new Date(moment(new Date(self.vtHomeDataObj.Record_Date)).format('YYYY-MM-DD HH:mm')); 

        console.log('self.vtHomeDataObj.Record_Date',self.vtHomeDataObj.Record_Date)
        chk_list.forEach( item_name =>{    
            StringTo_SelectCheckBox(self.vtHomeDataObj[item_name], self[item_name]);
        });
        //Edit_load_nAFDataobj()
        other_list.forEach(item_name =>{
            self[item_name] = _.isEmpty(self.vtHomeDataObj[item_name]) ? false : true;
        });
        self.vtHomeDataObj.Visit_Date = new Date(self.vtHomeDataObj.Visit_Date);
        self.vtHomeDataObj.Peritonitis_Sdate = new Date(self.vtHomeDataObj.Peritonitis_Sdate);
        ['Using_System'].forEach( e =>{
            Edit_Other(self.vtHomeDataObj[e],e);
        });
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
    self.vtHomeDataObj.Patientid = self.currentPatient.Id;
    self.vtHomeDataObj.Patient_Name = self.currentPatient.Name;
    self.vtHomeDataObj.Medicalid = self.currentPatient.MedicalId;
    self.vtHomeDataObj.Hospitalid = self.currentPatient.HospitalId;
    self.vtHomeDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
    //self.vtHomeDataObj.Record_Date = moment(new Date(self.vtHomeDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
    //self.vtHomeDataObj.Record_Date.setHours(self.vtHomeDataObj.Record_Date.getHours()+8);
    self.vtHomeDataObj.Visit_Method = "Visit_Home";
    //整理資料
    Add_Arrange_nAFDataobj();
    /* 整理整理 other */
    ['Using_System'].forEach( e =>{
        Other_StrMage(e);
    });
    self.vtHomeDataObj.Record_Date = create_Record_Date();
    if(self.vtHomeDataObj.isCreate){
        self.vtHomeDataObj.CreatedUserId = CurrentUser().UserId;
        self.vtHomeDataObj.CreatedUserName = CurrentUser().UserName;
        self.vtHomeDataObj.Evaluator = CurrentUser().UserName//評估者
        self.vtHomeDataObj.Assessor = CurrentUser().UserName//考核人
        self.vtHomeDataObj.Visit_Date = new Date();
        console.log("isCreate-vtHomeDataObj", self.vtHomeDataObj);
        
        visitPeritonealDialysisService.post(self.vtHomeDataObj).then((res) => {
            console.log("vtPhoneData createOne success", res);
            showMessage($translate('visitHome.dialog.createSuccess'));
        }, (res) => {
            console.log("vtPhoneData createOne fail", res);
            showMessage($translate('visitHome.dialog.createFail'));
        });
    }else{
        console.log("RecordDate--",self.vtHomeDataObj);
        self.vtHomeDataObj.ModifiedUserId = CurrentUser().UserId;
        self.vtHomeDataObj.ModifiedUserName = CurrentUser().UserName;
        self.vtHomeDataObj.ModifiedTime = moment(new Date());

        visitPeritonealDialysisService.put(self.vtHomeDataObj).then((res) => {
            console.log("vtPhoneData update success", res);
            showMessage($translate('visitHome.dialog.editSuccess'));
        }, (res) => {
            console.log("vtPhoneData update fail", res);
            showMessage($translate('visitHome.dialog.editFail'));
        });
    }

    $mdDialog.hide();
};
}
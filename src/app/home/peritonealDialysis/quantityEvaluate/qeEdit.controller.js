
angular
    .module('app')
    .controller('qeEditController', qeEditController);

qeEditController.$inject = [
    '$mdDialog', 'showMessage', 'SettingService', 'pdEvaluateService', '$rootScope', 
    '$filter', 'qeItem', 'ptId','pdTreatService','$stateParams','PatientService'];
function qeEditController(
    $mdDialog, showMessage, SettingService, pdEvaluateService, $rootScope, 
    $filter, qeItem, ptId,pdTreatService,$stateParams,PatientService) {
    console.log("quantityEvaluate Edit/Create Dialog", qeItem);
    const self = this;
    const $translate = $filter('translate');
    //self.isCreate = qeItem === null;
    
    self.qeDataObj = angular.copy(qeItem);
    self.currentHospital = SettingService.getCurrentHospital();
    self.View = {};

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

    let patientId = $stateParams.patientId;

    //病患基本資料
    PatientService.getById(patientId).then((res) => {
        self.currentPatient = res.data;
        self.LoadData();
        self.getLastList();
        console.log("self.currentPatient--",self.currentPatient);
    }, (res) => {
        console.log("complicationService getList Fail", res);
    });
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
    //處方明細
    //self.getDetailList_load = true;
    self.getLastList = function(){
        if (self.qeDataObj.isCreate == true) {
            pdTreatService.getList(patientId,"NORMAL").then((res) => {
                let tp_desc = $filter('orderBy')(res.data, '-Prescription_Startdate'); //排序
                //取最後一筆
                console.log("tp_desc--",tp_desc);
                if(tp_desc.length > 0){
                    let treatList = tp_desc[0];
                    self.qeDataObj.Prescription_Id = treatList.Id;
                    self.qeDataObj.Dialysis_Type = treatList.Dialysis_Type;
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
            pdTreatService.getOne(self.qeDataObj.Prescription_Id).then((res) => {
                if(res.data != null){
                    //Prescription_Startdate 一開例日期排序最後一筆
                    let treatList = res.data;
                    //設定Prescription_Id
                    self.qeDataObj.Prescription_Id = treatList.Id;

                    self.qeDataObj.Dialysis_Type = treatList.Dialysis_Type;
                    arrageTreatDetail(treatList);
                    self.treatDetailTypes.Count = treatList.length;
                    self.treatDetailTypes.Dialysis_Type = treatList.Dialysis_Type;
                    self.treatDetailTypes.Prescription_Startdate = new Date(treatList.Prescription_Startdate);
                }
            }).then(()=>{
                self.getDetailList_load = false;
            });

        }
        //
    };

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

        // self.treatDetailTypes.APD.TwinBage.forEach( e=>{
        //     if(!e.Esa_Dose_Ug){
        //         let Esa_Dose_U = _.toNumber(e.Esa_Dose_U);
        //         let Baglitre = (e.Baglitre == '其他') ? _.toNumber(e.BaglitreOther) : _.toNumber(e.Baglitre) ;
        //         self.APD_Total_Treatment += Esa_Dose_U;

        //         //每日換袋次數
        //         let Bagnumber = _.toNumber(e.Bagnumber);
        //         //總處方量
        //         if(_.isNumber(Baglitre)){
        //             self.APD_Total_Prescription = _.toNumber((self.APD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));
        //             // self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
        //         }
        //         //總處方量
        //         // if(_.isNumber(Baglitre)){
        //         //     self.APD_Total_Prescription += (Bagnumber * Baglitre);
        //         // }
        //     }
        // });
    }

    self.initialUI = function(){
        self.Glucose_D0_Hour_4_Result =[
            {"Value":"1","Text":"1 低:0.61-0.50"},
            {"Value":"2","Text":"2 低平均:0.49-0.39"},
            {"Value":"3","Text":"3 高平均:0.38-0.27"},
            {"Value":"4","Text":"4 高:0.26-0.12"}
        ];
        self.Creatinine_Dp_Hour_4_Result =[
            {"Value":"1","Text":"1 高:1.03-0.82"},
            {"Value":"2","Text":"2 高平均:0.81-0.66"},
            {"Value":"3","Text":"3 低平均:0.65-0.51"},
            {"Value":"4","Text":"4 低:0.50-0.35"}
        ];
    }
    self.initialUI();

    self.LoadData = function () {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        self.View.Weight = self.currentPatient.Weight;
        self.View.Height = self.currentPatient.Height;

        if (self.qeDataObj.isCreate == true) {
            self.qeDataObj.Recorddate = toDay;

        }else{
            self.View.Weight = self.qeDataObj.Pet
            let tonumberList =[
                'Body_Area',
                'Correction_Factor',
                'Serum_Glucose_Hour_2',
                'Serum_Creatinine_Hour_2',
                'Dialysate_Glucose_Hour_0',
                'Dialysate_Glucose_Hour_2',
                'Dialysate_Glucose_Hour_4',
                'Dialysate_Creatinine_Hour_0',
                'Dialysate_Creatinine_Hour_2',
                'Dialysate_Creatinine_Hour_4',
                'Glucose_D0_Hour_0',
                'Glucose_D0_Hour_2',
                'Glucose_D0_Hour_4',
                'Creatinine_Dp_Hour_0',
                'Creatinine_Dp_Hour_2',
                'Creatinine_Dp_Hour_4',
                'Inflow_Vol',
                'Outflow_Vol',
                'Net_Vol',
                'Bun',
                'Serumcreatinine',
                'Dialysate_Total_Hour_24',
                'Urea_Total_Hour_24',
                'Dialysate_Urea_Hour_24',
                'Urea_Nitrogen_Hour_24',
                'Dialysate_Creatinine_Hour_24',
                'Creatinine_Hour_24',
                'Una',
                'Wcc_Total',
                'Npcr'
            ];
            tonumberList.forEach( e =>{
                self.qeDataObj[e] = (self.qeDataObj[e] != null) ? _.toNumber(self.qeDataObj[e]): null;
            });
            self.setAutoValue();
            self.Net_VolTotal();
        }
    }
    self.setAutoValue = function (){
        // self.currentPatient.Gender  性別 F 女、Ｍ 男
        let age = $filter('age')(self.currentPatient.Birthday);
        //BH:身高,BW:體重
        let BH = _.toNumber(self.View.Height)
        let BW = _.toNumber(self.View.Weight)
        
        if (_.isNumber(BH) && _.isNumber(BW) && _.isNumber(age) ) {
            let TBW = null;
            if(self.currentPatient.Gender == "M"){
                TBW = 2.447 + 0.3362 * BW + 0.1074 * BH - 0.09516 * age
            }
            if(self.currentPatient.Gender == "F"){
                TBW = 0 - 2.097 + 0.2466 * BW +  0.1069 * BH
            }
            if(!_.isNumber(TBW)){
                return;
            }
            let A1 = _.toNumber(self.qeDataObj.Bun)  //BUN
            let B1 = _.toNumber(self.qeDataObj.Serumcreatinine) //血清肌酸酐(mg/dl)
            let C1 = _.toNumber(self.qeDataObj.Dialysate_Total_Hour_24) //24小時透析液總量
            let D1 = _.toNumber(self.qeDataObj.Urea_Total_Hour_24) //24小時尿液總量
            let E1 = _.toNumber(self.qeDataObj.Dialysate_Urea_Hour_24) //24小時透析液尿素氮
            let F1 = _.toNumber(self.qeDataObj.Urea_Nitrogen_Hour_24) //24小時尿液尿素氮
            let G1 = _.toNumber(self.qeDataObj.Dialysate_Creatinine_Hour_24) //24小時透析液肌酸酐
            let H1 = _.toNumber(self.qeDataObj.Creatinine_Hour_24) //24小時尿液肌酸酐
            let UNA = _.toNumber(self.qeDataObj.Una);
            self.View.KTV1 = Rounding((E1 / A1 * C1 * 7) / TBW);  //腹膜 Kt/V
            self.View.KTV2 = Rounding((F1 / A1 * D1 * 7) / TBW); //殘餘腎功能Kt/V
            self.View.KTV3 = Rounding(self.View.KTV1 + self.View.KTV2); //總和Kt/V
            self.View.CCR1 = Rounding(G1/B1 * C1 * 7); //腹膜廓清率（升/星期）
            self.View.CCR2 = Rounding(H1/B1 * D1 * 7); //殘餘腎功能（升/星期）
            self.View.CCRSUM = Rounding(self.View.CCR1 + self.View.CCR2); //總和廓清率（升/星期）
            
            if(self.qeDataObj.Una != null){
                self.View.Pna = Rounding(10.76 * (0.69 * UNA + 1.46));
                self.View.Npna = Rounding(self.View.Pna / BW);
            }
        }


        //男女TBW
    }
    self.Net_VolTotal = function (){
        let Inflow_Vol = _.toNumber(self.qeDataObj.Inflow_Vol);
        let Outflow_Vol = _.toNumber(self.qeDataObj.Outflow_Vol);

        if(_.isNumber(Inflow_Vol) && _.isNumber(Outflow_Vol) ){
            self.qeDataObj.Net_Vol = Outflow_Vol - Inflow_Vol;
            self.qeDataObj.Net_Vol = Rounding(self.qeDataObj.Net_Vol);
        }
    }
    //四捨五入
    function Rounding(value){
        if(_.isNumber(value)){
            return Math.round(value * 100) / 100
        }
        return;
    }
    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
        // $rootScope.$emit("quantityEvaluateRefreshEvent", "");
    };

    // save
    self.ok = function ok() {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        self.qeDataObj.Recorddate = new Date(self.qeDataObj.Recorddate);
        //self.qeDataObj.Recorddate.setHours(self.qeDataObj.Recorddate.getHours()+8);
        self.qeDataObj.PatientId = ptId;
        self.qeDataObj.HospitalId = self.currentHospital.Id;
        self.qeDataObj.Patient_Name = self.currentPatient.Name;
        self.qeDataObj.Medicalid = self.currentPatient.MedicalId;
        self.qeDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
        self.qeDataObj.Pet = self.View.Weight;
        console.log(self.View.Weight,self.qeDataObj.Pet);
        self.qeDataObj.Status = "Normal";

        if(self.qeDataObj.isCreate){
            console.log('self.qeDataObj',self.qeDataObj);
            self.qeDataObj.CreatedTime = toDay;
            self.qeDataObj.CreatedUserId = SettingService.getCurrentUser().Id;
            self.qeDataObj.CreatedUserName = SettingService.getCurrentUser().Name;

            pdEvaluateService.post(self.qeDataObj).then((res) => {
                console.log("quantityEvaluate createOne success", res);
                showMessage($translate('quantityEvaluate.dialog.createSuccess'));

                $rootScope.$emit("quantityEvaluateRefreshEvent", "");

            }, (res) => {
                console.log("quantityEvaluate createOne fail", res);
                showMessage($translate('quantityEvaluate.dialog.createFail'));
            });
        }else{
            self.qeDataObj.ModifiedTime = toDay;
            self.qeDataObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.qeDataObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            pdEvaluateService.put(self.qeDataObj).then((res) => {
                console.log("quantityEvaluate update success", res);
                showMessage($translate('quantityEvaluate.dialog.editSuccess'));

                $rootScope.$emit("quantityEvaluateRefreshEvent", "");

            }, (res) => {
                console.log("quantityEvaluate update fail", res);
                showMessage($translate('quantityEvaluate.dialog.editFail'));
            });
        }

        $mdDialog.hide();
    };



}

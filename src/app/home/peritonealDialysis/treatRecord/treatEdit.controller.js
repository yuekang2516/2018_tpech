import dialog from './treatEdit.dialog.html';
import './treatRecord.less';

angular
    .module('app')
    .controller('treatEditController', treatEditController);

treatEditController.$inject = [
    '$mdDialog', 'showMessage', 'SettingService', '$filter', 'epoService', 'infoService', '$rootScope',
    'treatItem', 'ptId', '$mdMedia', 'pdTreatService','apdSettingService',
    '$compile', '$scope', 'PatientService', '$sessionStorage', '$state', '$q','$timeout'];

function treatEditController(
    $mdDialog, showMessage, SettingService, $filter, epoService, infoService, $rootScope,
    treatItem, ptId, $mdMedia, pdTreatService,apdSettingService,
    $compile, $scope, PatientService, $sessionStorage, $state, $q, $timeout) {

    const self = this;
    const $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();

    //主表資料
    self.treatDataObj = {};
    //明細表資料
    let SaveDetailObj = [];
    let SaveTreatDataObj = {};
    self.treatDetailTypes = {
        CAPD:{
            Treat:[], //換液處方
            TreatDianealCount: 0,
            TreatExtranealCount:1
        },
        APD:{
            Machine:[], //機器處方
            ListBage:[], //最末袋處方
            TwinBage:[], //雙連袋
            MachineDianealCount: 0,
            TwinBageDianealCount: 0,
            TwinBageExtranealCount:1
        },
        ESA:[] //ESA清單
    };
    //排序Obj
    self.treatDetailSortObj = [];
    let old_treatItem = angular.copy(treatItem);
    self.treatDataObj = treatItem;
    console.log("treatment Edit/Create Dialog", treatItem);
    console.log("self.treatDataObj----", self.treatDataObj);
    console.log("treatDetailList----", self.treatDetailList);

    self.editViewMode = false;
    //ESA種類 EpoeptinAEprex EpoeptinBRecommon DarbepoepinAAranesp GlycolEpoetinBMircera
    self.ESATypesByEpo = [];
    self.ESATypesByEpo = self.treatDataObj.ESATypesByEpo;
    //畫面初始值
    function initialUI() {
        //藥水種類 Dianeal Nutrineal Extraneal
        self.DialysisCategory = self.treatDataObj.DialysisCategory;
        self.DialysisType = self.treatDataObj.DialysisType;
        self.DialysisEsSystem = self.treatDataObj.DialysisEsSystem;
        self.DialysisSystem = self.treatDataObj.DialysisSystem;
        self.Concentration_Bd = self.treatDataObj.Concentration_Bd;
        self.Calcium = self.treatDataObj.Calcium;
        self.Quantity = self.treatDataObj.Quantity;
        self.Concentration_GLC = self.treatDataObj.Concentration_GLC;
        //計算使用頻率
        self.treatDataObj.Frequencyquanity = 0;
        //明細資料編輯畫面顯示
        self.isEditDetail = false;
        //明細資料是否Create
        self.isCreateDetail = false;

        //
        // 總治療量 Options
        self.PdTotalTreatmentVolume = ['5000', '7500', '10000', '12000', '其他'];

        //治療時間
        self.therapyTimeStHr = ['0','8', '10', '12', '其他'];
        self.therapyTimeStMM = ['0','5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '其他'];

        //留置時間
        self.MachineStayTimeHr = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '其他'];
        self.MachineStayTimeMM = ['0','5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '其他'];
        // 注入量 Options
        self.PdInjectionVolume = [
            {"Text":"1.0","Value":1000},
            {"Text":"1.5","Value":1500},
            {"Text":"2.0","Value":2000},
            {"Text":"2.5","Value":2500},
            {"Text":"其他","Value":-999}
        ];
        // 最末袋注入量 Options
        self.PdLastBagInjectionVolume = ['1000', '1500', '2000', '2500', '其他'];
        // 病人體重 Options
        self.MachinePatientweight = ['40', '50', '60', '70', '80', '其他'];
        // 0週期引流警訊 Options
        self.MachineZeroPeriodWarning = ['1000', '1500', '2000', '2500', '其他'];
        // 週期數 Options
        self.PdPeriodNumber = [
            {"Text":'2',"Value":2},
            {"Text":'3',"Value":3},
            {"Text":'4',"Value":4},
            {"Text":'5',"Value":5},
            {"Text":'其他',"Value":-999}
        ];
        // 設定透析液溫度 Options
        self.MachineDialysateTemperature = ['35', '36', '37', '其他'];
        // 總脫水目標
        self.MachineTotDehydrateTarget = ['1000', '1500', '2000', '2500', '其他'];
        // 週期最小引流量
        self.MachinePeriodMinDrainage = ['60', '70', '80', '85', '其他'];
        self.trNoArr = ["1", "2", "3", "4"];
        //換液系統
        self.LiquidExchangeSystem = ["PAC-Xtra", "HomeChoice", "Sleep safe", "其他"];
        //給付條件 ExtranealCheck
        self.ExtranealCheck = [
            { Value: "HighPET", Text: "High PET", Check: false },
            { Value: "HighConc", Text: "High Conc. > 1/2", Check: false },
            { Value: "UFFailure", Text: "UF Failure", Check: false },
            { Value: "A1C7", Text: "A1c > 7%", Check: false },
            { Value: "Peritonitis", Text: "Peritonitis", Check: false }
        ];
        //給付條件 Nutrineal
        self.NutrinealCheck = [
            { Value: "Alb", Text: "Alb ≦ 3.5", Check: false }, //Alb &lt;= 3.5
            { Value: "nPNA", Text: "nPNA < 0.9", Check: false } //nPNA &lt; 0.9
        ];
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
        //Frequency
        self.FrequencyBaseData = [
            { Value: "QDPC", Text: "QDPC-每日1次(餐後)" },
            { Value: "QN", Text: "QN-每晚1次" },
            { Value: "QOD", Text: "QOD-每隔1日1次" },
            { Value: "HS", Text: "HS-每晚睡前半小時1次" },
            { Value: "TID", Text: "TID-每日3次(早、午、晚)" },
            { Value: "TIDAC", Text: "TIDAC-每日3餐半小時前" },
            { Value: "TIDPC", Text: "TIDPC-每日3餐後" },
            { Value: "BID", Text: "BID-每日2次(早上、晚上)" },
            { Value: "BIDACBefore", Text: "BIDAC-每日早晚(用餐半小時前)" },
            { Value: "BIDPCAfter", Text: "BIDPC-每日早晚(餐後)" },
            { Value: "STAT", Text: "ST-立刻使用" },
            { Value: "QID", Text: "QID-每日4次" },
            { Value: "Q2W", Text: "Q2W-每2週1次" },
            { Value: "QD", Text: "QD-每日1次(每日固定時間)" },
            { Value: "QW1", Text: "QW1-每週1次(星期一)" },
            { Value: "QW2", Text: "QW2-每週1次(星期二)" },
            { Value: "QW3", Text: "QW3-每週1次（星期三)" },
            { Value: "QW4", Text: "QW4-每週1次(星期四)" },
            { Value: "QW5", Text: "QW5-每週1次(星期五)" },
            { Value: "QW6", Text: "QW6-每週1次(星期六)" },
            { Value: "QW7", Text: "QW7-每週1次(星期日)" },
            { Value: "QW135", Text: "QW135-每週3次(一、三、五)" },
            { Value: "QW1357", Text: "QW1357-每週4次(一、三、五、日)" },
            { Value: "QW246", Text: "QW246-每週3次(二、四、六)" },
            { Value: "QW2467", Text: "QW2467-每週4次(二、四、六、日)" },
            { Value: "PRN", Text: "PRN-需要時使用" },
            { Value: "BIW15", Text: "BIW15-每週2次(一、五)" },
            { Value: "BIW26", Text: "BIW26-每週2次(二、六)" },
            { Value: "QW136", Text: "QW136-每週3次(一、三、六)" },
            { Value: "QW146", Text: "QW146-每週3次(一、四、六)" },
            { Value: "TIW", Text: "TIW-每週3次" },
            { Value: "BIW", Text: "BIW-每週2次" },
            { Value: "QW", Text: "QW- 每週1次" },
            { Value: "QM", Text: "QM- 一個月一次" }
        ];

        //主要換袋者
        self.MajorBagChangers = ["病人", "配偶", "其他家屬", "外傭"];

        //藥水使用方式
        self.PotionsMode = [
            { Value: "DryDay", Text: "Dry Day", Type: "CAPD" },
            { Value: "DryNight", Text: "Dry Night", Type: "CAPD" },
            { Value: "DryAll", Text: "All Day", Type: "CAPD" },
            { Value: "LastBag", Text: "Last Bag", Type: "APD" },
            { Value: "TwinBag", Text: "Twin Bag", Type: "APD" }
        ];
        //雙連袋選擇□ Dianeal □Extraneal □ Nutrineal
        self.TwinBagChklist =[
            { Value: "Dianeal", Text: "Dianeal", Check: false },
            { Value: "Nutrineal", Text: "Nutrineal", Check: false },
            { Value: "Extraneal", Text: "Extraneal", Check: false }
        ];
        self.ChangChklist = angular.copy(self.TwinBagChklist);

        //鹼基
        self.AlkaliBase = [
            "Acetate", "Bicarbonate", "Lactate"
        ];
        //透析液滲透物質
        self.DialysisOsmoticSubstanceCheck = [
            { Value: 'Glucose', Text: 'Glucose', Check: false,'Potiontypes':'Dianeal' }, //Dianeal
            { Value: 'GlucosePolymer', Text: 'Glucose polymer', Check: false,'Potiontypes':'Extraneal' },//Extraneal
            { Value: 'AminoAcid', Text: 'Amino acid', Check: false,'Potiontypes':'Nutrineal' },//Nutrineal
            { Value: 'Other', Text: '其他', Check: false }
        ];

        self.MachineType = ["CCPD", "IPD", "TPD"];
    }
    initialUI();
    //私有function 設定 start
    //建立處方清單
    function getNewListObj(TreatType,Potiontypes){
        
        /*  欄位備註*/
        let obj = {
            "Id" : "", //'GUID唯一key';
            "Prescription_Id" : "",//'處方id';
            "Dialysis_Type" : "",//'腹膜透析類型';
            "Fluidchangetime" : "",//'換液時間點';
            "Potiontypes" : "",//'藥水種類(腹膜透析液)';
            "Calciumconcentration" : "",//'鈣離子濃度';
            "Bagnumber" : "",//'袋數';
            "Glucoseconcentration" : "",//'葡萄糖濃度';
            "Baglitre" : "",//'每袋升數,藥水體積';
            "Paymentconditions" : "",//'給付條件';
            "Remark" : "",//'備註';
            "Esa_Types" : "",//'ESA種類';
            "Esa_Dose_U" : "",//'ESA劑量U',每次注入量,注入量;
            "Esa_Dose_Ug" : "",//'EPO 劑量 ug,PRN';
            "Frequency" : "",//'頻率';
            "Used_Days" : "",//'使用天數';
            "Total_Dose" : "",//'總劑量';
            "Sequence" : "",//'順序';
            "showTooltip":false,
            "BaglitreOther":"",
            "Sequence":0
        }
        obj.Dialysis_Type = self.treatDataObj.Dialysis_Type;
        obj.Fluidchangetime = TreatType;
        
        ['Dianeal','Extraneal','Nutrineal'].forEach(e =>{
            if(Potiontypes.indexOf(e) > -1){
                obj.Potiontypes = e;
                return;
            }
        });
        //obj.Potiontypes = Potiontypes;
        obj.Esa_Dose_Ug = false;
        if(TreatType == "ESA"){
            obj.Used_Days = 28;
        }

        switch(Potiontypes){
            case 'Dianeal':
                obj.Esa_Dose_U = 0;
                obj.Glucoseconcentration = "2.50";
                obj.Calciumconcentration = "2.5";
                obj.Baglitre = "2.0";
                obj.Bagnumber = 2;
                break;
            case 'Extraneal':
                obj.Glucoseconcentration = 7.5;
                obj.Calciumconcentration = 3.5;
                obj.Esa_Dose_U = 2.0;
                obj.Baglitre = "2.0";
                obj.Bagnumber = 1;
                break;
            case 'Nutrineal':
                obj.Glucoseconcentration = 1.10;
                obj.Calciumconcentration = 2.5;
                obj.Esa_Dose_U = 2.0;
                obj.Baglitre = "2.0";
                obj.Bagnumber = 1;
                break;
            case 'ListBage_Dianeal_Concn_Y':
                obj.Bagnumber = 1;
                break;
            case 'ListBage_Dianeal_Concn_N':
                obj.Glucoseconcentration = "2.50";
                obj.Calciumconcentration = "3.5";
                obj.Baglitre = 2.5;
                obj.Bagnumber = 1;
                break;
            case 'ListBage_Extraneal_Concn_N':
                    obj.Glucoseconcentration = "7.5";
                    obj.Calciumconcentration = "3.5";
                    obj.Baglitre = "2.0";
                    obj.Bagnumber = 1;
                    break;
        }
        return obj;
    }
    //計算Dianeal數量
    function CalculationDianealCount (TreatType,Potiontypes){
        let Count = 0;
        if(self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].length > 0){
            Count = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].filter( e =>{
                return e.Potiontypes == Potiontypes;
            }).length
        }
        return Count;
    }
    function Esa_Dose_U_auto_Baglitre (value){
        //≦2.0=>2.0
        //≧2.01,≦2.5=>2.5
        if(value <= 2.0){
            return "2.0";
        }
        if(value >= 2.01 && value <= 2.5){
            return "2.5"
        }
        return '其他';
    }
    //私有function 設定 end
    //畫面動作function start
    //透析系統變化
    //腹膜透析類別更動
    self.ChangMedicineLiquidKind = function(){
        self.treatDetailTypes = {
            CAPD:{
                Treat:[], //換液處方
                TreatDianealCount: 0,
            },
            APD:{
                Machine:[], //機器處方
                ListBage:[], //最末袋處方
                TwinBage:[], //雙連袋
                MachineDianealCount: 0,
                TwinBageDianealCount: 0
            },
            ESA:[] //ESA清單
        };
        self.LastBagShow = false;
        self.treatDataObj.Pd_Ismatch_Last_Bag_Concn = "Y";
        self.LastBageConcnSelect = null;
        switch(self.treatDataObj.Dialysis_Type){
            case 'APD':
                    self.treatDataObj.Liquid_Exchange_System = "HomeChoice";
                    ['PaymentconditionsCheck','ChangChklist'].forEach(
                        e =>{
                            self[e].forEach(x =>{
                                x.Check = false;
                            });
                    });
                    self.CalculationAPDTreat();
                break;
            default:
                    self.treatDataObj.Liquid_Exchange_System = "";
                break;
        }
        ['ListBage_PaymentconditionsCheck','TwinBagChklist','TwinBage_PaymentconditionsCheck'].forEach(
            e =>{
                self[e].forEach(x =>{
                    x.Check = false;
                });
        });
    }
    //換液系統更新
    self.Exchange_systemChang = function(){
        switch(self.treatDataObj.Liquid_Exchange_System){
            case 'HomeChoice':
                    self.treatDataObj.Dialysis_System = "Baxter";
                break;
            case 'Sleep safe':
                    self.treatDataObj.Dialysis_System = "Fresenius";
                break;
        }
    }

    self.add_ESA = function(){
        let esa_item = getNewListObj('ESA','');
        self.treatDetailTypes.ESA.push(esa_item);
    }
    self.del_ESA = function(index){
        self.treatDetailTypes.ESA.splice(index, 1);
    }
    self.add_Extraneal = function(TreatType){
        let item = getNewListObj(TreatType,'Extraneal');
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].push(item);
        if(['Treat','Machine','TwinBage'].indexOf(TreatType) > -1){
            if(self.treatDataObj.Dialysis_Type == "CAPD"){self.CalculationCAPDTreat();}
            if(self.treatDataObj.Dialysis_Type == "APD"){self.CalculationAPDTreat();}
            self.treatDetailTypes[self.treatDataObj.Dialysis_Type][ TreatType + 'ExtranealCount'] = CalculationDianealCount(TreatType,'Extraneal')
        }
    }
    self.del_Extraneal = function(TreatType,index){
        
        let Extraneals = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].filter( e =>{
            return e.Potiontypes == 'Extraneal';
        });
        let NotExtraneals = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].filter( e =>{
            return e.Potiontypes != 'Extraneal';
        });
        Extraneals.splice(index, 1);
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType + 'ExtranealCount'] = Extraneals.length;
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType] = Extraneals.concat(NotExtraneals);
        if(self.treatDataObj.Dialysis_Type == "CAPD"){self.CalculationCAPDTreat();}
        if(self.treatDataObj.Dialysis_Type == "APD"){self.CalculationAPDTreat();}
    }
    self.add_Dianeal = function(TreatType){
        let item = getNewListObj(TreatType,'Dianeal');
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].push(item);
        if(['Treat','Machine','TwinBage'].indexOf(TreatType) > -1){
            if(self.treatDataObj.Dialysis_Type == "CAPD"){self.CalculationCAPDTreat();}
            if(self.treatDataObj.Dialysis_Type == "APD"){self.CalculationAPDTreat();}
            self.treatDetailTypes[self.treatDataObj.Dialysis_Type][ TreatType + 'DianealCount'] = CalculationDianealCount(TreatType,'Dianeal')
        }
    }
    self.del_Dianeal = function(TreatType,index){
        let Dianeals = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].filter( e =>{
            return e.Potiontypes == 'Dianeal';
        });
        let NotDianeals = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType].filter( e =>{
            return e.Potiontypes != 'Dianeal';
        });
        Dianeals.splice(index, 1);
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType + 'DianealCount'] = Dianeals.length;
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType] = Dianeals.concat(NotDianeals);
        if(self.treatDataObj.Dialysis_Type == "CAPD"){self.CalculationCAPDTreat();}
        if(self.treatDataObj.Dialysis_Type == "APD"){self.CalculationAPDTreat();}
    }
    //有無最末袋
    self.LastBagChang= function(){
        self.treatDetailTypes.APD.ListBage = [];
        self.LastBageConcnSelect = null;
        if(self.LastBagShow){
            //新增最末袋
            self.treatDataObj.Pd_Ismatch_Last_Bag_Concn = "Y";
            let lastBagItem = getNewListObj('ListBage','ListBage_Dianeal_Concn_Y');
            self.treatDetailTypes.APD.ListBage.push(lastBagItem);
        }else{
            self.treatDetailTypes.APD.ListBage = [];
        }
        self.CalculationAPDTreat();
    }
    //濃度不同項目選擇
    self.LastBageConcnChang = function(){
        self.treatDetailTypes.APD.ListBage = [];
        let lastBagItem = null;
        if(self.treatDataObj.Pd_Ismatch_Last_Bag_Concn =='Y'){
            self.LastBagChang();
        }else{
            //Dianeal
            //Extraneal
            if(self.LastBageConcnSelect == "Dianeal"){
                lastBagItem = getNewListObj('ListBage','ListBage_Dianeal_Concn_N');
            }
            if(self.LastBageConcnSelect == "Extraneal"){
                lastBagItem = getNewListObj('ListBage','ListBage_Extraneal_Concn_N');
            }
            self.treatDetailTypes.APD.ListBage.push(lastBagItem);
            self.CalculationAPDTreat();
        }
        console.log('self.treatDetailTypes.APD.ListBage--',self.treatDetailTypes.APD.ListBage);
    }
    self.checkTheBox = function checkTheBox(blockName, index) {
        let Checkitem = self[blockName][index];

        if(Checkitem.Check){
            Checkitem.Check = false;
        }else{
            Checkitem.Check = true;
        }
    };

    self.checkTheDetail = function(blockName,index){
        //ChangChklist
        //TwinBag,Treat
        let itemobj = null;
        let pusharry = null;

        if(self.treatDataObj.Dialysis_Type == "APD"){
            pusharry = "TwinBage";
        }else if(self.treatDataObj.Dialysis_Type == "CAPD"){
            pusharry = "Treat";
        }
        itemobj = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][pusharry];
        if(itemobj != null){
            let Checkitem = self[blockName][index];

            if(Checkitem.Check){
                Checkitem.Check = false;
            }else{
                Checkitem.Check = true;
            }
            if(Checkitem.Check){
                itemobj.push(getNewListObj(pusharry,Checkitem.Value))
            }else{
                self.treatDetailTypes[self.treatDataObj.Dialysis_Type][pusharry] = itemobj.filter(e =>{
                    return e.Potiontypes != Checkitem.Value;
                });
            }
        }
        self.treatDetailTypes[self.treatDataObj.Dialysis_Type][pusharry + 'DianealCount']  = CalculationDianealCount(pusharry,'Dianeal');
        self.CalculationCAPDTreat();
        self.CalculationAPDTreat();
    }

    //CAPD 計算換液處方
    self.CalculationCAPDTreat = function(CalType ='',_item =''){
        self.Daily_Changed_Bag_Times = 0; //每日換袋次數
        self.CAPD_Total_Treatment = 0;
        self.CAPD_Total_Prescription = 0;
        //每日換袋次數
        //所有處方袋數加總，PRN不計入
        //總治療量
        //每次注入量(L)*袋數加總，PRN不計入
        //總處方量
        //藥水體積*袋數的總計，不含PRN
        let DialysisOsmoticSubstanceCheck = angular.copy(self.DialysisOsmoticSubstanceCheck);
        DialysisOsmoticSubstanceCheck.forEach( dos =>{
            dos.Check = false;
        });
        if(CalType != '' && _item != ''){
            let Esa_Dose_U = _.toNumber(_item.Esa_Dose_U);
            let Baglitre = _.toNumber(_item.Baglitre);
            switch(CalType){
                case 'Esa_Dose_U':
                        _item.Baglitre = Esa_Dose_U_auto_Baglitre(_item.Esa_Dose_U)
                    break;
            }
        }
        console.log('self.treatDetailTypes.CAPD.Treat',self.treatDetailTypes.CAPD.Treat);


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
                    console.log('(Bagnumber * Esa_Dose_U)',(Bagnumber * Esa_Dose_U),Bagnumber,Esa_Dose_U);

                    self.CAPD_Total_Treatment = _.toNumber((self.CAPD_Total_Treatment + (Bagnumber * Esa_Dose_U)).toFixed(2));
                }
                console.log('self.CAPD_Total_Treatment',self.CAPD_Total_Treatment);
                
                //總處方量
                if(_.isNumber(Baglitre)){
                    self.CAPD_Total_Prescription = _.toNumber((self.CAPD_Total_Prescription + (Bagnumber * Baglitre)).toFixed(2));
                    // self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
                }
                
            }
            //透析液滲透物質
            DialysisOsmoticSubstanceCheck.forEach( dos =>{
                if(dos.Potiontypes == e.Potiontypes){
                    dos.Check = true;
                    //console.log('dos',dos);
                }
            });
        });
        self.DialysisOsmoticSubstanceCheck = DialysisOsmoticSubstanceCheck;
    }
    self.CalculationAPDTreat = function(CalType ='',_item ='',Source=''){
        self.APD_Total_Treatment = 0;
        self.APD_Total_Prescription = 0;
        let DialysisOsmotic = [];
        //Machine:[], //機器處方
        //ListBage:[], //最末袋處方
        //TwinBage:[], //雙連袋
        //總處方量
        //藥水體積*袋數的總計，不含PRN
        let DialysisOsmoticSubstanceCheck = angular.copy(self.DialysisOsmoticSubstanceCheck);
        DialysisOsmoticSubstanceCheck.forEach( dos =>{
            dos.Check = false;
        });
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
        let Pd_Injection_Volume = (self.treatDataObj.Pd_Injection_Volume == -999) ? _.toNumber(self.PdInjectionVolumeOther) : _.toNumber(self.treatDataObj.Pd_Injection_Volume/1000); 

        let Pd_Period_Number = (self.treatDataObj.Pd_Period_Number == -999) ? _.toNumber(self.PdPeriodNumberOther) : _.toNumber(self.treatDataObj.Pd_Period_Number);

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

        if(Source == 'TwinBage'){
            if(CalType != '' && _item != ''){
                let Esa_Dose_U = _.toNumber(_item.Esa_Dose_U);
                let Baglitre = _.toNumber(_item.Baglitre);
                switch(CalType){
                    case 'Esa_Dose_U':
                            _item.Baglitre = Esa_Dose_U_auto_Baglitre(_item.Esa_Dose_U)
                        break;
                }
            }
        }
        //透析液滲透物質
        DialysisOsmotic.forEach( e =>{
            DialysisOsmoticSubstanceCheck.forEach( dos =>{
                if(dos.Potiontypes == e){
                    dos.Check = true;
                }
            });
        });
        self.DialysisOsmoticSubstanceCheck = DialysisOsmoticSubstanceCheck;
    }
    function loadAPD_ElseData(col,else_col,type){
        let _col = String(self.treatDataObj[col]);
        let _else_col = self.treatDataObj[else_col];
        switch(type){
            case "String":
                    if (_col.indexOf("oher_") >= 0) {
                        _else_col = _col.substr(5);
                        _col = "其他";
                    }
                break;
            case "Int":
                    if (_col.indexOf("-999") >= 0) {
                        _else_col = parseInt(_col.substr(4));
                        _col = "其他";
                    }
                break;
        }
        self.treatDataObj[col] = _col;
        self.treatDataObj[else_col] = _else_col;
    }
    //畫面動作function end

    function loadData() {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        if (self.treatDataObj.isCreate) {
            self.CAPD_TreatCount = 0;
            // 初始化資料 Object
            //APD 濃度
            self.treatDataObj.Pd_Ismatch_Last_Bag_Concn = "Y";
            //是否有最末袋
            self.LastBagShow = false;
            // //兼做血液透析次/月(HD) number
            // "Monthly_Hemodialysis_Times": 0,
            self.treatDataObj.Monthly_Hemodialysis_Times = 0;
            self.treatDataObj.Monthly_Hemodialysis_Times = parseInt(self.treatDataObj.Monthly_Hemodialysis_Times);
            self.treatDataObj.Esa_Dose_Ug = 0;
            self.treatDataObj.Esa_Dose_Ug = parseInt(self.treatDataObj.Esa_Dose_Ug);
            //白天換袋次數
            // //白天換袋次數   
            // "Day_Changed_Bag_Times": 0,
            self.treatDataObj.Day_Changed_Bag_Times = 0;
            self.treatDataObj.Day_Changed_Bag_Times = parseInt(self.treatDataObj.Day_Changed_Bag_Times);
            //每日換袋次數
            // //每日換袋次數  
            // "Daily_Changed_Bag_Times": 0,
            //self.treatDataObj.Daily_Changed_Bag_Times = 0;
            //self.treatDataObj.Daily_Changed_Bag_Times = parseInt(self.treatDataObj.Daily_Changed_Bag_Times);
            //每日換液量(ml)
            // //每日換液量(ml)
            // "Daily_Total_Litres": 0,
            //self.treatDataObj.Daily_Total_Litres = 0;
            //self.treatDataObj.Daily_Total_Litres = parseInt(self.treatDataObj.Daily_Total_Litres);
            //夜間總治療時間(hr)
            // //夜間總治療時間(hr)
            // "Night_Total_Treatment_Time": 0,
            self.treatDataObj.Night_Total_Treatment_Time = 0;
            self.treatDataObj.Night_Total_Treatment_Time = parseInt(self.treatDataObj.Night_Total_Treatment_Time);
            //灌注量(L)
            // //灌注量(L)
            // "Night_Perfusion_Volume": 0,
            self.treatDataObj.Night_Perfusion_Volume = 0;
            self.treatDataObj.Night_Perfusion_Volume = parseInt(self.treatDataObj.Night_Perfusion_Volume);
            //換液次數
            // //換液次數
            // "Night_Liquid_Exchange_Times": 0,
            self.treatDataObj.Night_Liquid_Exchange_Times = 0;
            self.treatDataObj.Night_Liquid_Exchange_Times = parseInt(self.treatDataObj.Night_Liquid_Exchange_Times);
            //->總治療量
            // //總治療量
            // "Pd_Total_Treatment_Volume": 0,
            self.treatDataObj.Pd_Total_Treatment_Volume = 0;
            self.treatDataObj.Pd_Total_Treatment_Volume = parseInt(self.treatDataObj.Pd_Total_Treatment_Volume);
            //->注入量
            // //注入量
            // "Pd_Injection_Volume": 0,
            self.treatDataObj.Pd_Injection_Volume = 0;
            self.treatDataObj.Pd_Injection_Volume = parseInt(self.treatDataObj.Pd_Injection_Volume);
            //->末袋注入量
            // //最末袋注入量
            // "Pd_Last_Bag_Injection_Volume": 0,
            self.treatDataObj.Pd_Last_Bag_Injection_Volume = 0;
            self.treatDataObj.Pd_Last_Bag_Injection_Volume = parseInt(self.treatDataObj.Pd_Last_Bag_Injection_Volume);
            //->週期數
            // //週期數
            // "Pd_Period_Number": 0,
            self.treatDataObj.Pd_Period_Number = 0;
            self.treatDataObj.Pd_Period_Number = parseInt(self.treatDataObj.Pd_Period_Number);
            //->零週期引流警訊
            // //0週期引流警訊
            // "Machine_Zero_Period_Warning": 0,
            self.treatDataObj.Machine_Zero_Period_Warning = 0;
            self.treatDataObj.Machine_Zero_Period_Warning = parseInt(self.treatDataObj.Machine_Zero_Period_Warning);
            //->體重
            // //病人體重
            // "Machine_Patientweight": 0,
            self.treatDataObj.Machine_Patientweight = 0;
            //self.treatDataObj.Machine_Patientweight = parseInt(self.treatDataObj.Machine_Patientweight / 100);
            //->透析液溫度
            // //透析液溫度
            // "Machine_Dialysate_Temperature": 0,
            // self.treatDataObj.Machine_Dialysate_Temperature = 0;
            // self.treatDataObj.Machine_Dialysate_Temperature = parseInt(self.treatDataObj.Machine_Dialysate_Temperature);

            //->總脫水目標
            // //總脫水目標
            // "Machine_Tot_Dehydrate_Target": 0,
            self.treatDataObj.Machine_Tot_Dehydrate_Target = 0;
            self.treatDataObj.Machine_Tot_Dehydrate_Target = parseInt(self.treatDataObj.Machine_Tot_Dehydrate_Target);
            //->週期最小引流量
            // //週期最小引流量
            // "Machine_Period_Min_Drainage": 0,
            self.treatDataObj.Machine_Period_Min_Drainage = 0;
            self.treatDataObj.Machine_Period_Min_Drainage = parseInt(self.treatDataObj.Machine_Period_Min_Drainage);
            //頻率
            //self.treatDataObj.Frequency = 0;
            //使用天數
            //self.treatDataObj.Used_Days = 0;
            //總劑量
            //self.treatDataObj.Total_Dose = 0;
            //checkmedicationtotal();
            //*處方日期
            self.treatDataObj.Prescription_Startdate = toDay;
            //停止日期
            self.treatDataObj.Prescriptioncessationdate = toDay;
            //腹膜透析類別
            self.treatDataObj.Dialysis_Type = "CAPD";
            //換液系統
            self.treatDataObj.Liquid_Exchange_System = "HomeChoice";
            //透析液系統
            //透析液系統
            self.treatDataObj.Dialysis_System = "Baxter";
            //self.treatDataObj.Dialysate_System = "Baxter";
            //是否兼做血液透析
            self.treatDataObj.Is_With_Hemodialysis = "N";
            //HD
            self.treatDataObj.Hd = "";
            //主要換袋者
            self.treatDataObj.Major_Bag_Changers = "";

            //ESA種類 ESA=IU劑量*天數*頻率=總劑量(IU單位)->對照特殊醫囑欄位            
            self.treatDataObj.Esa_Types = "0";
            //ESA劑量單位 IU->ESA劑量單位
            self.treatDataObj.esaUnit = "";
            //μg->數量單位
            self.treatDataObj.ugUnit = "";

            //藥水使用方式
            self.treatDataObj.Potions_Mode = "DryAll";
            //self.treatDataObj.Potions_Mode

            //以下請填寫夜間換液狀況

            //鹼基//鹼基
            self.treatDataObj.Alkali_Base = "Bicarbonate";
            console.log("self.LiquidExchangeSystem---", self.LiquidExchangeSystem);
            //self.treatDataObj.Alkali_Base
            //透析液滲透物質
            //透析液滲透物質
            self.treatDataObj.DialysisOsmoticSubstanceCheckOther = "";
            self.treatDataObj.Dialysis_Osmotic_Substance = "";
            //APD /處方 - PD 醫囑
            //->治療時間  小時  分鐘
            //治療時間
            self.treatDataObj.Pd_Treatment_Time_Hh = '0';
            self.treatDataObj.Pd_Treatment_Time_Mm = '0';
            self.treatDataObj.PdTreatmentTimeHhOther = "";
            self.treatDataObj.PdTreatmentTimeMmOther = "";
            //->留置時間 小時 分鐘
            self.treatDataObj.Machine_Stay_Time_Hh = '0';
            self.treatDataObj.Machine_Stay_Time_Mm = '0';
            self.treatDataObj.MachineStayTimeHhOther = "";
            self.treatDataObj.MachineStayTimeMmOther = "";
            //->末袋濃度是否相同
            //self.treatDataObj.Pd_Ismatch_Last_Bag_Concn = "N";
            //APD /處方 - 機器設定 1
            self.treatDataObj.Machine_Type = "CCPD";
            //APD /處方 - 機器設定 2
            //->最末手控引流
            self.treatDataObj.Machine_Isfinal_Drainage = "N";
            //->警訊
            self.treatDataObj.Machine_Isalarm = "N";
            //self.treatDataObj.Machine_Isalarm

            console.log("self.treatDataObj---", self.treatDataObj);

        } else {
            self.treatDataObj.Prescription_Startdate = new Date(self.treatDataObj.Prescription_Startdate);
            getDetailList();
            [
                {col:"Pd_Treatment_Time_Hh",else_col:"PdTreatmentTimeHhOther",type:"String"}, //治療時間(小時)
                {col:"Pd_Treatment_Time_Mm",else_col:"PdTreatmentTimeMmOther",type:"String"}, //治療時間(分鐘)
                {col:"Machine_Zero_Period_Warning",else_col:"MachineZeroPeriodWarningOther",type:"Int"}, //0週期引流警訊
                {col:"Machine_Stay_Time_Hh",else_col:"MachineStayTimeHhOther",type:"String"}, //留置時間(小時)
                {col:"Machine_Stay_Time_Mm",else_col:"MachineStayTimeMmOther",type:"String"}, //留置時間(分鐘)
                {col:"Machine_Dialysate_Temperature",else_col:"MachineDialysateTemperatureOther",type:"Int"}, //透析液溫度
                {col:"Machine_Tot_Dehydrate_Target",else_col:"MachineTotDehydrateTargetOther",type:"Int"}, //總脫水目標
                {col:"Machine_Period_Min_Drainage",else_col:"MachinePeriodMinDrainageOther",type:"Int"} //週期最小引流量
            ].forEach(e =>{
                loadAPD_ElseData(e.col,e.else_col,e.type);
            })

            // //如果是複製的
            if(self.treatDataObj.isCopy){
                self.treatDataObj.CreatedTime = "";
                self.treatDataObj.CreatedUserId = "";
                self.treatDataObj.CreatedUserName = "";
                self.treatDataObj.Prescription_Startdate = toDay;
                self.treatDataObj.ModifiedTime = null;
                self.treatDataObj.ModifiedUserId = "";
                self.treatDataObj.ModifiedUserName = "";
            }
        }
    }
    loadData();

    //血液透析
    PatientService.getById(ptId).then((res) => {
        self.currentPatient = res.data;
        console.log("self.currentPatient--", self.currentPatient);
    }, (res) => {
        console.log("complicationService getList Fail", res);
    });
    let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));

    function chkeModelData(){
        //判斷日期
        let d = moment(self.treatDataObj.Prescription_Startdate).format('YYYY-MM-DD HH:mm:ss');
        let date = moment(d, 'YYYY-MM-DD HH:mm:ss');
        
        if(!date.isValid()){
            showMessage("[處方日期]格式錯誤，請檢查。",500);
            return false ;
        }
        //總治療量<=總處方量
        //總治療量 總處方量
        if(self.CAPD_Total_Treatment > self.CAPD_Total_Prescription){
            showMessage("[總治療量(L)]不可以大於[總處方量(L)]!!",1500);
            return false;
        }
        if(self.APD_Total_Treatment > self.APD_Total_Prescription){
            showMessage("[機器總治療量(L))不可以大於[機器總處方量(L)]!!",1500);
            return false;
        }
        // //判定 白天換袋次數 self.treatDataObj.Day_Changed_Bag_Times
        // let chekcInt =   /^(0|[1-9][0-9]*)$/　　//正整數
        // if(!chekcInt.test(self.treatDataObj.Day_Changed_Bag_Times)){
        //     showMessage("[白天換袋次數]格式錯誤，請檢查是否為數字(不可有小數點)。",500);
        //     return false;
        // }
        // if(!chekcInt.test(self.treatDataObj.Night_Liquid_Exchange_Times)){
        //     showMessage("[換液次數]格式錯誤，請檢查是否為數字(不可有小數點)。",500);
        //     return false;
        // }

        return true;

    }
    //整理ESA資料
    function arrangeESAData(){
        self.treatDetailTypes.ESA.forEach((e,index) =>{
            self.setESAType(e.Esa_Types,index);
        });
    }
    //整理Dianeal
    function arrangeDianealata(TreatType){
        //if(self.treatDataObj.Dialysis_Type == "CAPD"){
            let templist = self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType];
            console.log(TreatType + 'templist',templist);
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
                self.treatDetailTypes[self.treatDataObj.Dialysis_Type][TreatType] = _.orderBy(templist, ['Sequence'], ['asc']);
            }
        //}
    }
    //整理儲存資料
    function arrangeData(){
        //清單整理
        self.treatDetailTypes.ESA.forEach( e =>{
            SaveDetailObj.push(e);
        });

        if(self.treatDataObj.Dialysis_Type =="CAPD"){
            let DianealSequence = 1;
            self.treatDetailTypes[self.treatDataObj.Dialysis_Type].Treat.forEach( e =>{
                let item = angular.copy(e);
                //e.Esa_Dose_Ug = e.Esa_Dose_Ug ? 'Y':'N';
                //換液處方-付款條件
                if(item.Baglitre == '其他'){
                    item.Baglitre = '其他|' + item.BaglitreOther;
                }
                if(item.Potiontypes != "Dianeal"){
                    let PotiontypesPayList = []
                    self.PaymentconditionsCheck.forEach( payitem =>{
                        if(payitem.Check == true && payitem.Type == e.Potiontypes){
                            PotiontypesPayList.push(payitem.Value);
                        }
                    });
                    item.Paymentconditions = PotiontypesPayList.join(',');
                }else{
                    item.Sequence = DianealSequence;
                    DianealSequence = DianealSequence +1;
                }
                SaveDetailObj.push(item);
            });
        }

        if(self.treatDataObj.Dialysis_Type =="APD"){
            let DianealSequence = 1;
            self.treatDetailTypes[self.treatDataObj.Dialysis_Type].Machine.forEach( e =>{
                let item = angular.copy(e);
                //e.Esa_Dose_Ug = e.Esa_Dose_Ug ? 'Y':'N';
                //換液處方-付款條件
                if(item.Baglitre == '其他'){
                    item.Baglitre = '其他|' + item.BaglitreOther;
                }
                item.Sequence = DianealSequence;
                DianealSequence = DianealSequence +1;
                SaveDetailObj.push(item);
            });

            self.treatDetailTypes[self.treatDataObj.Dialysis_Type].ListBage.forEach( e =>{
                let item = angular.copy(e);
                if(item.Potiontypes != "Dianeal"){
                    let PotiontypesPayList = []
                    self.ListBage_PaymentconditionsCheck.forEach( payitem =>{
                        if(payitem.Check == true && payitem.Type == e.Potiontypes){
                            PotiontypesPayList.push(payitem.Value);
                        }
                    });
                    item.Paymentconditions = PotiontypesPayList.join(',');
                }
                SaveDetailObj.push(item);
            });
            DianealSequence = 1;
            self.treatDetailTypes[self.treatDataObj.Dialysis_Type].TwinBage.forEach( e =>{
                let item = angular.copy(e);
                //e.Esa_Dose_Ug = e.Esa_Dose_Ug ? 'Y':'N';
                //換液處方-付款條件
                if(item.Baglitre == '其他'){
                    item.Baglitre = '其他|' + item.BaglitreOther;
                }
                if(item.Potiontypes != "Dianeal"){
                    let PotiontypesPayList = []
                    self.TwinBage_PaymentconditionsCheck.forEach( payitem =>{
                        if(payitem.Check == true && payitem.Type == e.Potiontypes){
                            PotiontypesPayList.push(payitem.Value);
                        }
                    });
                    item.Paymentconditions = PotiontypesPayList.join(',');
                }else{
                    item.Sequence = DianealSequence;
                    DianealSequence = DianealSequence +1;
                }
                SaveDetailObj.push(item);
            });
            //項目整理
            //每次注入量
            SaveTreatDataObj.Pd_Injection_Volume = String(SaveTreatDataObj.Pd_Injection_Volume);

            if(SaveTreatDataObj.Pd_Injection_Volume.indexOf(-999) >-1 ){
                if(self.PdInjectionVolumeOther != null && _.isNumber(_.toNumber(self.PdInjectionVolumeOther))){
                    SaveTreatDataObj.Pd_Injection_Volume = '-999' + self.PdInjectionVolumeOther * 1000
                }
            }
            SaveTreatDataObj.Pd_Injection_Volume = _.toNumber(SaveTreatDataObj.Pd_Injection_Volume);
            //週期數
            SaveTreatDataObj.Pd_Period_Number = String(SaveTreatDataObj.Pd_Period_Number);
            if(SaveTreatDataObj.Pd_Period_Number.indexOf(-999) >-1 ){
                if(self.PdPeriodNumberOther != null && _.isNumber(_.toNumber(self.PdPeriodNumberOther))){
                    SaveTreatDataObj.Pd_Period_Number = SaveTreatDataObj.Pd_Period_Number + String(self.PdPeriodNumberOther)
                }
            }
            SaveTreatDataObj.Pd_Period_Number = _.toNumber(SaveTreatDataObj.Pd_Period_Number);
            //體重
            
            SaveTreatDataObj.Machine_Patientweight = SaveTreatDataObj.Machine_Patientweight * 1000;
            
            //體溫
            console.log('SaveTreatDataObj.Machine_Patientweight',SaveTreatDataObj.Machine_Dialysate_Temperature);
            if(SaveTreatDataObj.Machine_Dialysate_Temperature == '其他'){
                SaveTreatDataObj.Machine_Dialysate_Temperature = SaveTreatDataObj.MachineDialysateTemperatureOther * 1000;
            }else{
                SaveTreatDataObj.Machine_Dialysate_Temperature = SaveTreatDataObj.Machine_Dialysate_Temperature * 1000;
            }
            console.log('self.treatDataObj.Machine_Patientweight',SaveTreatDataObj.Machine_Dialysate_Temperature);
        }

        [
            {col:"Pd_Treatment_Time_Hh",else_col:"PdTreatmentTimeHhOther",type:"String"}, //治療時間(小時)
            {col:"Pd_Treatment_Time_Mm",else_col:"PdTreatmentTimeMmOther",type:"String"}, //治療時間(分鐘)
            {col:"Machine_Zero_Period_Warning",else_col:"MachineZeroPeriodWarningOther",type:"Int"}, //0週期引流警訊
            {col:"Machine_Stay_Time_Hh",else_col:"MachineStayTimeHhOther",type:"String"}, //留置時間(小時)
            {col:"Machine_Stay_Time_Mm",else_col:"MachineStayTimeMmOther",type:"String"}, //留置時間(分鐘)
            {col:"Machine_Dialysate_Temperature",else_col:"MachineDialysateTemperatureOther",type:"Int"}, //透析液溫度
            {col:"Machine_Tot_Dehydrate_Target",else_col:"MachineTotDehydrateTargetOther",type:"Int"}, //總脫水目標
            {col:"Machine_Period_Min_Drainage",else_col:"MachinePeriodMinDrainageOther",type:"Int"} //週期最小引流量
        ].forEach(e =>{
            if(e.type == "String"){
                SaveTreatDataObj[e.col] = SaveTreatDataObj[e.col] === "其他" ? "oher_" + SaveTreatDataObj[e.else_col] : SaveTreatDataObj[e.col];
            }
            if(e.type == "Int"){
                SaveTreatDataObj[e.col] = SaveTreatDataObj[e.col] === "其他" ? parseInt("-999" + SaveTreatDataObj[e.else_col]) : SaveTreatDataObj[e.col];
            }
        })
    }
    //儲存異動比對
    function SaveDataChangContent(){
        //old_treatItem 異動前的資料
        //腹膜透析類別 =>APD 會跳出換液系統 Liquid_Exchange_System ，藥水使用方式 Potions_Mode
        //標準體重(D.W)由空值變更成50.0, 臨時脫水量由空值變更成0, BF(ml/min)由空值變更成12.0, Na由空值變更成140.0, 透析液溫度由空值變更成30.0, 透析液流速由空值變更成0.0
        let Content = [];
        let CheckItemList =[
            {'Value':'Dialysis_Type','Text':'腹膜透析類別',Type:"String"},
            {'Value':'Liquid_Exchange_System','Text':'換液系統',Type:"String"},
            {'Value':'Dialysis_System','Text':'透析液系統',Type:"String"},
            {'Value':'Is_With_Hemodialysis','Text':'兼做血液透析',Type:"String"},
            {'Value':'Monthly_Hemodialysis_Times','Text':'次/月(HD)',Type:"Number"},
            {'Value':'Major_Bag_Changers','Text':'主要換袋者',Type:"String"},
            {'Value':'Esa_Types','Text':'ESA種類',Type:"String"},
            {'Value':'Frequency','Text':'ESA頻率',Type:"String"},
            {'Value':'Esa_Dose_U','Text':'ESA劑量',Type:"Number"},
            {'Value':'Used_Days','Text':'ESA使用天數',Type:"Number"},
            {'Value':'Total_Dose','Text':'ESA總劑量',Type:"Number"},
            {'Value':'Potions_Mode','Text':'ESA藥水使用方式',Type:"String"},
            {'Value':'Day_Changed_Bag_Times','Text':'白天換袋次數',Type:"Number"},
            {'Value':'Daily_Changed_Bag_Times','Text':'每日換袋次數',Type:"Else"},
            {'Value':'Daily_Total_Litres','Text':'每日換液量',Type:"Else"},
            {'Value':'Night_Total_Treatment_Time','Text':'夜間總治療時間',Type:"Number"},
            {'Value':'Night_Perfusion_Volume','Text':'灌注量',Type:"Number"},
            {'Value':'Night_Liquid_Exchange_Times','Text':'換液次數',Type:"Number"}
        ].forEach(e =>{
            let OldValue = old_treatItem[e.Value];
            let NewValue = self.treatDataObj[e.Value];
            switch(e.Value){
                case "Daily_Changed_Bag_Times":
                case "Daily_Total_Litres":
                        NewValue = self[e.Value];
                    break;
            }
            switch(e.Type){
                case "String":
                    OldValue = _.isEmpty(old_treatItem[e.Value]) ? "空值" : old_treatItem[e.Value];
                    NewValue = _.isEmpty(self.treatDataObj[e.Value]) ? "空值" : self.treatDataObj[e.Value];
                break;
                case "Number":
                    OldValue = (old_treatItem[e.Value] == null || old_treatItem[e.Value]=='') ? "空值" : old_treatItem[e.Value];
                    NewValue = (self.treatDataObj[e.Value] == null ||
                                self.treatDataObj[e.Value]=='' ||
                                isNaN(self.treatDataObj[e.Value])
                    ) ? "空值" : self.treatDataObj[e.Value];
                break;
            }
            if(OldValue != NewValue ){
                switch(e.Value){
                    case 'Frequency':
                        if(OldValue == 0 && NewValue == "空值"){
                            break;
                        }
                    default:
                        let msg = `${e.Text}由${OldValue}變更成${NewValue}`;
                        Content.push(msg);
                }
            }
        });
        return Content;
    }
    self.ok = function (isSort, isMainEdit) {
        console.log('is ok self.treatDataObj',self.treatDataObj);
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        self.treatDataObj.Patientid = ptId;
        self.treatDataObj.Hospitalid = self.currentHospital.Id;
        self.treatDataObj.Patient_Name = self.currentPatient.Name;
        self.treatDataObj.Medicalid = self.currentPatient.MedicalId;
        self.treatDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
        self.treatDataObj.Status = "Normal";

        SaveDetailObj = [];
        //整理儲存資料
        SaveTreatDataObj = angular.copy(self.treatDataObj);
        console.log('SaveTreatDataObj',SaveTreatDataObj);

        arrangeData();

        let DataChkFlg = chkeModelData();
        if(!DataChkFlg){
            return ;
        }
        
        if (self.treatDataObj.isCreate || self.treatDataObj.isCopy) {
            self.treatDataObj.Id= "";
            self.treatDataObj.CreatedTime = toDay;
            self.treatDataObj.CreatedUserId = SettingService.getCurrentUser().Id;
            self.treatDataObj.CreatedUserName = SettingService.getCurrentUser().Name;
            //108.6.4 要發通知
            self.treatDataObj.Status = "Notify";
            self.treatDataObj.Content = "增加腹膜透析處方";
            pdTreatService.post(SaveTreatDataObj).then((res) => {
                console.log("treatRecord createOne success", res);
                self.treatDataObj.Id = res.data.Id;
                let promises = [];

                SaveDetailObj.forEach( e =>{
                    e.Id = "";
                    e.Prescription_Id = res.data.Id
                    promises.push(
                        pdTreatService.postDetail(e).then((res) => {
                            //console.log("treatRecord Detail createOne success", res);
                        }, (res) => {
                            //console.log("treatRecord Detail createOne fail", res);
                            showMessage($translate('treatRecord.dialog.createDetailFail'));
                        })
                    );
                });
                //如果是APD 新增
                if(self.treatDataObj.Dialysis_Type == "APD"){
                    let PostAPDobj = {
                        "Treatment_Method": self.treatDataObj.Machine_Type, //治療方式 v
                        "Total_Therapeutic_Dose": self.APD_Total_Treatment * 1000, //總治療量 v
                        "Treatment_Time_Hh":self.treatDataObj.Pd_Treatment_Time_Hh,//治療時間h v
                        "Treatment_Time_Mm":self.treatDataObj.Pd_Treatment_Time_Mm,//治療時間m v
                        "Injection_Volume":_.toNumber(self.treatDataObj.Pd_Injection_Volume),//注入量 v
                        "Last_Injection_Volume" : 0,//最末袋注入量 $ctrl.treatDetailTypes.APD.ListBage.Esa_Dose_U v
                        "Last_Glucose_Concentration":self.treatDataObj.Pd_Ismatch_Last_Bag_Concn, //最末袋葡萄糖濃度 v
                        "Zero_Cycle_Drainage_Warning":self.treatDataObj.Machine_Zero_Period_Warning, //0週期引流警訊 v
                        "Cycle_Number":_.toNumber(self.treatDataObj.Pd_Period_Number), //週期數 v
                        "Retention_Time_Hh":self.treatDataObj.Machine_Stay_Time_Hh,//留置時間h v
                        "Retention_Time_Mm":self.treatDataObj.Machine_Stay_Time_Mm,//留置時間m v
                        "Dialysate_Temperature_Setting":self.treatDataObj.Machine_Dialysate_Temperature, //設定透析液溫度 v
                        "Isfinal_Manual_Drainage":self.treatDataObj.Machine_Isfinal_Drainage, //最末手控引流v
                        "Final_Manual_Drainage":self.treatDataObj.Machine_Tot_Dehydrate_Target, //總脫水目標v
                        "Islast_Manual_Drainage_Warn":self.treatDataObj.Machine_Isalarm, //警訊
                        "Minimum_Periodic_Drainage":self.treatDataObj.Machine_Period_Min_Drainage //週期最小引流量(%)v
                    }
                        PostAPDobj.Record_Date = new Date(moment(new Date(self.treatDataObj.Prescription_Startdate)).format('YYYY-MM-DD HH:mm:ss'));;
                        PostAPDobj.Patientid = self.patientId;
                        PostAPDobj.HospitalId = SettingService.getCurrentHospital().Id;
                        PostAPDobj.Status = "Normal";
                        PostAPDobj.CreatedTime = toDay;
                        PostAPDobj.CreatedUserId = SettingService.getCurrentUser().Id;
                        PostAPDobj.CreatedUserName = SettingService.getCurrentUser().Name;
                        PostAPDobj.Patientid = self.currentPatient.Id;
                        PostAPDobj.Patient_Name = self.currentPatient.Name;
                        PostAPDobj.Medicalid = self.currentPatient.MedicalId;
                        PostAPDobj.Pat_Seq = self.currentPatient.PAT_SEQ;
                        //注入量
                        if(PostAPDobj.Injection_Volume == -999){
                            PostAPDobj.Injection_Volume = parseInt("-999"+self.PdInjectionVolumeOther*1000);
                        }
                        //最末袋注入量
                        if(self.treatDetailTypes.APD.ListBage.length > 0){
                            let item = self.treatDetailTypes.APD.ListBage[0];
                            PostAPDobj.Last_Injection_Volume = parseInt(item.Esa_Dose_U);
                        }
                        //治療時間
                        if(PostAPDobj.Treatment_Time_Hh == "其他"){
                            PostAPDobj.Treatment_Time_Hh = "oher_"+self.treatDataObj.PdTreatmentTimeHhOther;
                        }
                        if(PostAPDobj.Treatment_Time_Mm == "其他"){
                            PostAPDobj.Treatment_Time_Mm = "oher_"+self.treatDataObj.PdTreatmentTimeMmOther;
                        }
                        //留置時間
                        if(PostAPDobj.Retention_Time_Hh == "其他"){
                            PostAPDobj.Retention_Time_Hh = "oher_"+self.treatDataObj.PdTreatmentTimeHhOther;
                        }
                        if(PostAPDobj.Treatment_Time_Mm == "其他"){
                            PostAPDobj.Treatment_Time_Mm = "oher_"+self.treatDataObj.PdTreatmentTimeMmOther;
                        }
                        //0週期引流警訊
                        if(PostAPDobj.Zero_Cycle_Drainage_Warning == "其他" ){
                            PostAPDobj.Zero_Cycle_Drainage_Warning  = parseInt("-999"+self.treatDataObj.MachineZeroPeriodWarningOther);
                        }
                        //週期數
                        if(PostAPDobj.Cycle_Number == -999){
                            PostAPDobj.Cycle_Number = parseInt("-999"+self.PdPeriodNumberOther);
        
                        }
                        //透析溫度
                        if(PostAPDobj.Dialysate_Temperature_Setting == '其他'){
                            PostAPDobj.Dialysate_Temperature_Setting = parseInt("-999"+self.treatDataObj.MachineDialysateTemperatureOther);
                        }
                        //總脫水目標
                        if(PostAPDobj.Final_Manual_Drainage == '其他'){
                            PostAPDobj.Final_Manual_Drainage = parseInt("-999"+self.treatDataObj.MachineTotDehydrateTargetOther);
                        }
                        //週期最小引流量
                        if(PostAPDobj.Minimum_Periodic_Drainage =='其他'){
                            PostAPDobj.Minimum_Periodic_Drainage = parseInt("-999"+self.treatDataObj.MachinePeriodMinDrainageOther);
                        }
                        console.log('PostAPDobj',PostAPDobj);
                        promises.push(
                            apdSettingService.post(PostAPDobj).then((res) => {
                                console.log("APDSetting Post Success", res);
                            }, (res) => {
                                console.log("APDSetting Post Fail", res);
                            })
                        );
                }
                Promise.all(promises).then(() => {});


                showMessage($translate('treatRecord.dialog.createSuccess'));
                $rootScope.$emit("treatRecordRefreshEvent", "");
            }, (res) => {
                console.log("treatRecord createOne fail", res);
                showMessage($translate('treatRecord.dialog.createFail'));
            });
        }else {
            let ContentAry = SaveDataChangContent();
            let Content = ContentAry.join(',');
            
            SaveTreatDataObj.ModifiedTime = toDay;
            SaveTreatDataObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            SaveTreatDataObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            //如果是當天的修改才要呈現
            let chkdate = moment(new Date()).format('YYYY-MM-DD');
            let psdate = moment(new Date(SaveTreatDataObj.Prescription_Startdate)).format('YYYY-MM-DD');
            if(chkdate == psdate && ContentAry.length > 0){
                SaveTreatDataObj.Status = "Notify";
                SaveTreatDataObj.Content = Content;
            }
            console.log('SaveTreatDataObj',SaveTreatDataObj);
            pdTreatService.put(SaveTreatDataObj).then((res) => {
                let promises = [];
                //取處方取消
                pdTreatService.getDetailList(SaveTreatDataObj.Id,"Normal").then((res2) => {
                    res2.data.forEach(e =>{
                        e.Status = "Deleted";
                        promises.push(
                            pdTreatService.putDetail(e).then((res) => {
                                //console.log("treatRecord Detail createOne success", res);
                            }, (res) => {
                                //console.log("treatRecord Detail createOne fail", res);
                                showMessage($translate('treatRecord.dialog.createDetailFail'));
                            })
                        );
                    });
                    //insert
                    SaveDetailObj.forEach( e =>{
                        e.Id = "";
                        e.Prescription_Id = res.data.Id
                        promises.push(
                            pdTreatService.postDetail(e).then((res) => {
                                //console.log("treatRecord Detail createOne success", res);
                            }, (res) => {
                                //console.log("treatRecord Detail createOne fail", res);
                                showMessage($translate('treatRecord.dialog.createDetailFail'));
                            })
                        );
                    });
                    Promise.all(promises).then(() => {});
                });
                showMessage($translate('treatRecord.dialog.editSuccess'));
            }, (res) => {
                console.log("treatRecord update fail", res);
                showMessage($translate('treatRecord.dialog.editFail'));
            });
        }
         $mdDialog.hide();
    };

    function getDetailList() {
        self.treatDetailList = [];
        pdTreatService.getDetailList(self.treatDataObj.Id,"Normal").then((res) => {
            console.log("pdTreatService getDetailList SUCCESS", res);
            let treatDetailList = res.data;
           //ESA
            self.treatDetailTypes.ESA = treatDetailList.filter(e =>{
                return e.Fluidchangetime == "ESA";
            });
            //整理ESA
            arrangeESAData();
            if(self.treatDataObj.Dialysis_Type == "CAPD"){
                self.treatDetailTypes.CAPD.Treat = treatDetailList.filter(e =>{
                    return e.Fluidchangetime == "Treat";
                });
                self.treatDetailTypes.CAPD['TreatDianealCount'] = CalculationDianealCount('Treat','Dianeal');
                self.treatDetailTypes.CAPD['TreatExtranealCount'] = CalculationDianealCount('Treat','Extraneal');
                //ChangChklist check true
                self.ChangChklist.forEach(e =>{
                    let filterCount = self.treatDetailTypes.CAPD.Treat.filter( x =>{ return x.Potiontypes == e.Value}).length;
                    if(filterCount > 0){
                        e.Check = true
                    }
                });
                //整理Dianeal
                arrangeDianealata('Treat');
                
                self.CalculationCAPDTreat();
            }
            if(self.treatDataObj.Dialysis_Type == "APD"){
                //每次注入量
                self.treatDataObj.Pd_Injection_Volume = String(self.treatDataObj.Pd_Injection_Volume);

                if(self.treatDataObj.Pd_Injection_Volume.indexOf(-999) > -1 ){
                    self.PdInjectionVolumeOther = _.toNumber(self.treatDataObj.Pd_Injection_Volume.replace('-999',''))/1000;
                    self.treatDataObj.Pd_Injection_Volume = -999;
                }
                //週期數
                self.treatDataObj.Pd_Period_Number = String(self.treatDataObj.Pd_Period_Number);

                if(self.treatDataObj.Pd_Period_Number.indexOf(-999) > -1 ){
                    self.PdPeriodNumberOther = _.toNumber(self.treatDataObj.Pd_Period_Number.replace('-999',''));
                    self.treatDataObj.Pd_Period_Number = -999;
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
                arrangeDianealata('Machine');
                arrangeDianealata('ListBage');
                arrangeDianealata('TwinBage');
                
                if(self.treatDetailTypes.APD.ListBage.length > 0){
                    self.LastBagShow = true;
                    if(self.treatDataObj.Pd_Ismatch_Last_Bag_Concn == 'N'){
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
                self.treatDetailTypes.APD['TwinBageDianealCount'] = CalculationDianealCount('TwinBage','Dianeal');
                self.treatDetailTypes.APD['TwinBageExtranealCount'] = CalculationDianealCount('TwinBage','Extraneal');
                self.TwinBagChklist.forEach(e =>{
                    let filterCount = self.treatDetailTypes.APD.TwinBage.filter( x =>{ return x.Potiontypes == e.Value}).length;
                    if(filterCount > 0){
                        e.Check = true
                    }
                });
                //體重
                self.treatDataObj.Machine_Patientweight = self.treatDataObj.Machine_Patientweight / 1000;
                //溫度
                if(self.MachineDialysateTemperature.indexOf(String(self.treatDataObj.Machine_Dialysate_Temperature /1000)) == -1){
                    self.treatDataObj.MachineDialysateTemperatureOther = self.treatDataObj.Machine_Dialysate_Temperature / 1000;
                    self.treatDataObj.Machine_Dialysate_Temperature = '其他';
                }else{
                    self.treatDataObj.Machine_Dialysate_Temperature = self.treatDataObj.Machine_Dialysate_Temperature / 1000;
                }
                self.CalculationAPDTreat();
            }

        }, (res) => {
            console.log("pdTreatService getDetailList FAIL", res);
        });
    }

    self.cancel = function () {
        $mdDialog.cancel();
        //$rootScope.$emit("treatRecordRefreshEvent", ""); 
    };


    self.changePotionsMode = function (potionsMode) {
        self.treatDataObj.Pd_Ismatch_Last_Bag_Concn = potionsMode === "LastBag" ? "N" : "Y";
    };


    //ESA種類 寫入ESA劑量、ESA劑量單位、數量、數量單位、頻率
    self.tempFrequencyValue = self.treatDataObj.Esa_Types;

    self.setESAType = function setESAType(Value,index) {

        let filterEsaItem = _.filter(self.ESATypesByEpo, { 'Value': Value});

        if(filterEsaItem.length > 0){
            filterEsaItem = filterEsaItem[0];
            let _item_Esa = self.treatDetailTypes.ESA[index]
            //對應頻率
            let viewFrequency = [];
            filterEsaItem.Frequencys.forEach( e =>{
                if(_.filter(self.FrequencyBaseData,{Value:e}).length > 0){
                    viewFrequency.push(_.filter(self.FrequencyBaseData,{Value:e})[0]);
                }
            });
            _item_Esa.viewFrequency = viewFrequency;
            _item_Esa.Frequency = filterEsaItem.Frequency;
            _item_Esa.Esa_Dose_U = filterEsaItem.esaCount; //ESA劑量
            _item_Esa.esaUnit = filterEsaItem.esaUnit;
            //計算總量
            self.calculationTotal('setESAType',_item_Esa);
        }
    }
    self.calculationTotal = function(source,item) {
        // if (event) { event.preventDefault(); }
        let medicationtotal = 0;
        let quantity = item.Esa_Dose_U ? item.Esa_Dose_U : null;
        let days = item.Used_Days ? item.Used_Days : null;
        let frequency = item.Frequency ? item.Frequency : null;
        //預設都是28
        if(source !='Used_Days' && source !='setESAType'){
            item.Used_Days = 28;
            days = 28;
        }
        // 立即使用，固定天數 1 天
        if (frequency === 'ST' || frequency === 'STAT') {
            item.Used_Days = 1;
        }

        if (quantity > 0 && frequency !== '') {
            let startTime = moment(new Date()); // 依當下開立的日期為第一天
            const endTime = moment(startTime).add(days, 'd');
            let count = 0;
            const weekDay = {
                QW: moment(startTime).weekday(),
                QW1: 1,
                QW2: 2,
                QW3: 3,
                QW4: 4,
                QW5: 5,
                QW6: 6,
                QW7: 0
            };

            switch (frequency) {
                //每個月一次
                case 'QM':
                        let months = endTime.diff(startTime, 'months') + 1;
                        medicationtotal = months * quantity;
                    break;
                // 每週4次
                case 'QID':
                    medicationtotal = days * quantity * 4;
                    break;

                // 每天3次
                case 'TID':
                case 'TIDAC':
                case 'TIDPC':
                    medicationtotal = days * quantity * 3;
                    break;

                // 每天2次
                case 'BID':
                case 'BIDAC':
                case 'BIDPC':
                case 'BIDACBefore':
                case 'BIDPCAfter':
                    medicationtotal = days * quantity * 2;
                    break;

                // 每天1次
                case 'QDPC':
                case 'QN':
                case 'HS':
                case 'QD':
                    medicationtotal = days * quantity;
                    break;

                // 時間區間必要時
                case 'PRN':
                    medicationtotal = days * quantity;
                    break;

                // 每隔一天1次
                case 'QOD':
                    medicationtotal = Math.ceil(days / 2) * quantity;
                    break;

                // 依星期每天1次
                case 'QW':
                case 'QW1':
                case 'QW2':
                case 'QW3':
                case 'QW4':
                case 'QW5':
                case 'QW6':
                case 'QW7':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay[frequency]) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 依星期135每天1次
                case 'QW135':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW3 ||
                            moment(startTime).weekday() === weekDay.QW5) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 依星期246每天1次
                case 'QW246':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW2 ||
                            moment(startTime).weekday() === weekDay.QW4 ||
                            moment(startTime).weekday() === weekDay.QW6) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 依星期135日每天1次
                case 'QW135日':
                case 'QW1357':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW3 ||
                            moment(startTime).weekday() === weekDay.QW5 ||
                            moment(startTime).weekday() === weekDay.QW7) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 依星期246日每天1次
                case 'QW246日':
                case 'QW2467':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW2 ||
                            moment(startTime).weekday() === weekDay.QW4 ||
                            moment(startTime).weekday() === weekDay.QW6 ||
                            moment(startTime).weekday() === weekDay.QW7) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 當天使用
                case 'ST':
                case 'STAT':
                    medicationtotal = 1 * quantity;
                    break;

                // 每週3次
                case 'TIW':
                    while (startTime < endTime) {
                        count += 3;
                        startTime = moment(startTime).add(7, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 每週2次
                case 'BIW':
                    while (startTime < endTime) {
                        count += 2;
                        startTime = moment(startTime).add(7, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;

                // 每2週1次
                case 'Q2W':
                    while (startTime < endTime) {
                        count += 1;
                        startTime = moment(startTime).add(14, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;
                // 每週2次(1、5)
                case 'BIW15':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW5) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }

                    medicationtotal = quantity * count;
                    break;
                // 每週2次(2、6)
                case 'BIW26':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW2 ||
                            moment(startTime).weekday() === weekDay.QW6) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }

                    medicationtotal = quantity * count;
                    break;
                // 每週2次(1、3)
                case 'BIW13':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW3) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }

                    medicationtotal = quantity * count;
                    break;
                // 每週2次(2、4)
                case 'BIW24':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW2 ||
                            moment(startTime).weekday() === weekDay.QW4) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }

                    medicationtotal = quantity * count;
                    break;
                // 依星期136每天1次
                case 'QW136':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW3 ||
                            moment(startTime).weekday() === weekDay.QW6) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;
                // 依星期146每天1次
                case 'QW146':
                    while (startTime < endTime) {
                        if (moment(startTime).weekday() === weekDay.QW1 ||
                            moment(startTime).weekday() === weekDay.QW4 ||
                            moment(startTime).weekday() === weekDay.QW6) {
                            count += 1;
                        }
                        startTime = moment(startTime).add(1, 'd');
                    }
                    medicationtotal = quantity * count;
                    break;
                default:
                    // nothing
                    break;
            }
        }
        item.Total_Dose = medicationtotal;
    };
    // function checkmedicationtotal(){

    //     if(self.treatDataObj.Esa_Dose_U == null || self.treatDataObj.Used_Days == null){
    //         self.treatDataObj.Total_Dose = null;
    //     }
    // }
    //#endregion

    self.changePotiontypes = function (PotiontypesName) {
        if (PotiontypesName == "Extraneal") {
            for (let i = 0; i < self.PaymentconditionsCheck.length; i++) {
                //清除Extraneal以外的Check
                if (self.PaymentconditionsCheck[i].Type !== "Extraneal") {
                    self.PaymentconditionsCheck[i].Check = false;
                }
            }
        }
        if (PotiontypesName == "Nutrineal") {
            for (let i = 0; i < self.PaymentconditionsCheck.length; i++) {
                //清除Nutrineal以外的Check
                if (self.PaymentconditionsCheck[i].Type !== "Nutrineal") {
                    self.PaymentconditionsCheck[i].Check = false;
                }
            }
        }
        if (PotiontypesName !== "Extraneal" && PotiontypesName !== "Nutrineal") {
            for (let i = 0; i < self.PaymentconditionsCheck.length; i++) {
                self.PaymentconditionsCheck[i].Check = false;
            }
        }
    }
}
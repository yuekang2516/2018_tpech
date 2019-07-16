import tpl_CAPD from './printCAPDtreat.html';

angular
.module('app')
.component('printTreat', {
    template: tpl_CAPD,
    controller: printTreatController
});

printTreatController.$inject = [
    '$stateParams','PatientService',
    'SettingService', 'selfCareService', '$filter','$state','pdTreatService','epoService'];
function printTreatController(
    $stateParams, PatientService,
    SettingService, selfCareService, $filter,$state,pdTreatService,epoService
    ) {
        const self = this;
        self.printDatetime = moment(new Date()).format('YYYY-MM-DD HH:mm');
        let _treatitem = $stateParams.item;
        self.treatitem = _treatitem;
        self.ESATypesByEpo = [];
        self.reportHospitaArea = "";
        let Hospitalist = [
            { "Value":"G","Text":"中興院區"}, //G
            { "Value":"Q","Text":"忠孝院區"}, //Q
            { "Value":"H","Text":"和平院區"}, //H
            { "Value":"F","Text":"仁愛院區"}, //F
            { "Value":"M","Text":"陽明院區"}  //M
        ];
        self.treatDetailTypes = {
            CAPD:{
                Treat:[], //換液處方
            },
            ESA:[] //ESA清單
        };
        self.getEpoServiceList = function(){
            epoService.getList().then((res) => {
                self.ESATypesByEpo = res.data;
                console.log("epoService ESATypesByEpo",res);
                for(let i=0;i<res.data.length;i++){
                    self.ESATypesByEpo[i].Value = res.data[i].Name;
                    self.ESATypesByEpo[i].Text = res.data[i].Name;
                    self.ESATypesByEpo[i].ugCount = res.data[i].Quantity;
                    self.ESATypesByEpo[i].ugUnit = res.data[i].QuantityUnit;
                    self.ESATypesByEpo[i].esaCount = res.data[i].Dose;
                    self.ESATypesByEpo[i].esaUnit = res.data[i].DoseUnit;   
                    self.ESATypesByEpo[i].Frequency = res.data[i].Frequencys[0];
                    //self.checkViewFrequency(res.data[i].Frequencys);            
                }
                // let tempEsa = {};
                // tempEsa.Value = "Epoeptin-a(Eprex)";
                // tempEsa.Text = "Epoeptin-a(Eprex)";
                // tempEsa.ugCount = "10";
                // tempEsa.ugUnit = "mg";
                // tempEsa.esaCount = "10";
                // tempEsa.esaUnit = "mg";
                // tempEsa.Frequency = ["QDPC"];
                // self.ESATypesByEpo.push(tempEsa);
                console.log("self.ESATypesByEpo--", self.ESATypesByEpo);        
                console.log("epoService getList success", res); 
            }, (res) => {
                console.log("epoService getList Fail", res);
            });
        }
        //給付條件
        self.PaymentconditionsCheck = [
            { Value: "HighPET", Text: "High PET", Check: false, Type: "Extraneal" },
            { Value: "HighConc", Text: "High Conc. > 1/2", Check: false, Type: "Extraneal" },
            { Value: "UFFailure", Text: "UF Failure", Check: false, Type: "Extraneal" },
            { Value: "DMwithA1C", Text: "A1c > 7%", Check: false, Type: "Extraneal" },
            { Value: "Peritonitis", Text: "Peritonitis", Check: false, Type: "Extraneal" },
            { Value: "Alb", Text: "Alb ≦ 3.5", Check: false, Type: "Nutrineal" }, //Alb &lt;= 3.5
            { Value: "nPNA", Text: "nPNA < 0.9", Check: false, Type: "Nutrineal" } //nPNA &lt; 0.9
        ];
        self.$onInit = function onInit() {
            if(_.isEmpty(_treatitem)) {
                history.go(-1);
            }
            self.getList();
            self.loading = false;
        };
        self.getList = function () {
            self.getEpoServiceList();
            self.currentHospital = SettingService.getCurrentHospital();
            let filterHosp = Hospitalist.filter(e =>{
                return e.Value == self.currentHospital.SystemCode
            });
            if(filterHosp.length > 0){
                self.reportHospitaArea = filterHosp[0].Text;
            }
            PatientService.getById(_treatitem.Patientid).then((res) => {
                self.currentPatient = res.data;
                console.log("self.currentPatient--", self.currentPatient);
                getDetailList();
            }, (res) => {
                console.log("complicationService getList Fail", res);
            });
            self.loading = false;
        }

        function getDetailList() {
            self.treatDetailList = [];
            pdTreatService.getDetailList(_treatitem.Id,"Normal").then((res) => {
                console.log("pdTreatService getDetailList SUCCESS", res);
                let treatDetailList = res.data;
               //ESA
                self.treatDetailTypes.ESA = treatDetailList.filter(e =>{
                    let filterEsaItem = _.filter(self.ESATypesByEpo, { 'Value': e.Esa_Types});
                    e.esaUnit = filterEsaItem.esaUnit;
                    return e.Fluidchangetime == "ESA";
                });
                //整理ESA
                arrangeESAData();
                console.log('self.treatDetailTypes.ESA',self.treatDetailTypes.ESA);
                if(_treatitem.Dialysis_Type == "CAPD"){
                    self.treatDetailTypes.CAPD.Treat = treatDetailList.filter(e =>{
                        return e.Fluidchangetime == "Treat";
                    });
                    //整理Dianeal
                    arrangeDianealata('Treat');
                    self.CalculationCAPDTreat();
                }
            }, (res) => {
                console.log("pdTreatService getDetailList FAIL", res);
            });
        }
        //整理ESA資料
        function arrangeESAData(){
            self.treatDetailTypes.ESA.forEach((e,index) =>{
                self.setESAType(e.Esa_Types,index);
            });
        }
        //整理Dianeal
        function arrangeDianealata(TreatType){
                let templist = self.treatDetailTypes.CAPD['Treat'];
                let p = self.PaymentconditionsCheck;

                templist.forEach(e =>{
                    e.BaglitreOther = "";
                    e.Esa_Dose_U = _.toNumber(e.Esa_Dose_U);
                    if(e.Baglitre.indexOf('其他|') > -1){
                        let tempVal = e.Baglitre.split('|');
                        e.BaglitreOther = _.toNumber(tempVal[1]);
                        e.Baglitre = tempVal[0];
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
                    self.treatDetailTypes.CAPD[TreatType] = _.orderBy(templist, ['Sequence'], ['asc']);
                }
            //}
        }

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
            const quantity = item.Esa_Dose_U ? item.Esa_Dose_U : null;
            const days = item.Used_Days ? item.Used_Days : null;
            const frequency = item.Frequency ? item.Frequency : null;
            //預設都是28
            if(source !='Used_Days'){
                item.Used_Days = 28;
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
            self.treatDetailTypes.CAPD.Treat.forEach( e=>{
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
                        self.CAPD_Total_Treatment += (Bagnumber * Esa_Dose_U);
                    }
                    //總處方量
                    if(_.isNumber(Baglitre)){
                        self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
                    }
                }
            });
        }
        self.gotoState = function goto(routeName) {
            history.go(-1);
        };
        self.print = function(){
            window.print();
        }
    
    }


// printTreatCtrl.$inject = [
//     '$stateParams', 'SettingService', 'PatientService', 'summaryReportService', '$mdMedia', '$filter', 'showMessage','$state'];
// function printTreatCtrl(
//     $stateParams, SettingService, PatientService, summaryReportService, $mdMedia, $filter, showMessage,$state) {
//     //console.log('is item--',item);
//     const self = this;
    
//     let _PrintData = $stateParams.item;
//     self.sCareDataObj = _PrintData; //自我照護表資料
//     let $translate = $filter('translate');
//     self.patientId = $stateParams.patientId;
//     self.loading = true;
//     self.isBrowser = cordova.platformId === 'browser';
//     self.reportHospitaArea = "";
//     let Hospitalist = [
//         { "Value":"G","Text":"中興院區"}, //G
//         { "Value":"Q","Text":"忠孝院區"}, //Q
//         { "Value":"H","Text":"和平院區"}, //H
//         { "Value":"F","Text":"仁愛院區"}, //F
//         { "Value":"M","Text":"陽明院區"}  //M
//     ]
//     self.$onInit = function onInit() {
//         if(_.isEmpty($stateParams.item)) {
//             history.go(-1);
//         }
//         self.getList();
//         self.loading = false;
    
//     };
    
//     self.getList = function () {
//         self.loading = true;
//         PatientService.getById(self.sCareDataObj.Patientid).then((res) => {
//             self.currentPatient = res.data;            
//             console.log("self.currentPatient--",self.currentPatient);
//         }, (res) => {
//             console.log("complicationService getList Fail", res);
//         });
//         self.currentHospital = SettingService.getCurrentHospital();
//         let filterHosp = Hospitalist.filter(e =>{
//             return e.Value == self.currentHospital.SystemCode
//         });
//         if(filterHosp.length > 0){
//             self.reportHospitaArea = filterHosp[0].Text;
//         }
//         ///患者基本資料
//         // orderSTService.getListByPatientID(self.patientId).then((res) => {
//         //     console.log("orderSTService getList Success", res);
//         //     self.sCareList = res.data;
//         //     console.log("orderSTList--",self.orderSTList);
//         //     //self.print();
//         //     self.loading = false;
//         // }, (res) => {
//         //     console.log("orderSTService getList Fail", res);

//         // });
//     };


    
//     self.$onDestroy = function () {

//     };

//     self.saveData = function () {

//     };
//     self.gotoState = function goto(routeName) {
//         history.go(-1);
//         // $state.go(routeName, null, {
//         //     location: 'replace'
//         // });
//     };


//     self.print = function(){    
//         // window.onafterprint = function(e){
//         //     $(window).off('mousemove', window.onafterprint);
//         //     console.log('Print Dialog Closed..');
//         //     //self.gotoState('selfCare');
//         // };
    
//         window.print();
    
//         // setTimeout(function(){
//         //     $(window).on('mousemove', window.onafterprint);
//         // }, 1);       
//     }

// }

angular
    .module('app')
    .controller('fiListEditController', fiListEditController);

fiListEditController.$inject = [
    '$stateParams', '$mdDialog', 'showMessage', 'SettingService', '$filter', 'fiListItem', 'infoService',
    'fiListPatientId', '$mdMedia', 'frequencyImplantationService', 'PatientService', '$rootScope', '$scope'];
function fiListEditController(
    $stateParams, $mdDialog, showMessage, SettingService, $filter, fiListItem, infoService,
    fiListPatientId, $mdMedia, frequencyImplantationService, PatientService, $rootScope, $scope) {
    console.log("frequencyImplantation-cathListEdit Edit/Create Dialog", fiListItem);
    const self = this;
    const $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();
    self.quantityEvaluateData = {};

    //editTable腹透植管資料
    self.fiDataObj = {};
    self.fiDataObj = fiListItem;
    self.fiDataObj = self.fiDataObj[0];

    //植管醫院
    self.fiHospital = [];
    //植管醫師
    self.DoctorName = ["外科醫師", "內科醫師"];
    //植管方式
    self.ImplantationMethod = ["Open surgery", "Laparascope", "SIPD"];
    //植入位置
    self.ImplantationLocation = ["Paramedian", "Median", "其他"];
    //CUFF數
    self.CuffAmount = ["One Cuff", "Two Cuff"];
    //Front_Type
    self.FrontType = ["直型", "彎曲", "其他"];

    // 麻醉方式radio
    self.AnesthesiaModeCheck = [
        // id: 'IDNumber',
        // value: $translate('patientDetail.component.IDNumber')
        // {id:'All',value:'全身'}, 
        // {id:'Partial',value:'局部'}, 
        // {id:'LumbarSpine',value:'腰椎'}
        { Value: '全身', Text: '全身', Check: false },
        { Value: '局部', Text: '局部', Check: false },
        { Value: '腰椎', Text: '腰椎', Check: false },
        { Value: '靜脈', Text: '靜脈', Check: false }
    ];
    // 手術方式radio
    self.OperativeMethod = [
        // {id:'AbdominalMidline',value:'腹中線'}, 
        // {id:'AbdominalSide',value:'腹側線'}
        //'腹中線','腹側線','腹腔鏡'
        '傳統手術', '腹腔鏡手術', '其他'
    ];
    // 導管出口radio
    self.CatheterOutlet = [
        // {id:'Left',value:'左側'}, 
        // {id:'Right',value:'右側'}
        '左側', '右側'
    ];
    // 導管型式select
    self.CatheterType = [
        // {id:'Tenckhoff',value:'Tenckhoff'}, 
        // {id:'Coile',value:'Coile'}, 
        // {id:'SwanNack',value:'Swan nack'}
        'Tenckhoff', 'Coile', 'Swan nack', '其他'
    ];
    // 手術初期合併症check
    self.EarlyComplicationsSurgeryCheck = [
        // {id:'Ache',value:'疼痛'}, 
        // {id:'Blocking',value:'阻塞'}, 
        // {id:'Bleeding',value:'出血'}, 
        // {id:'IncorrectPosition',value:'位置不正'}, 
        // {id:'Leakage',value:'滲漏'}, 
        // {id:'Peritonitis',value:'腹膜炎'}, 
        // {id:'OrganPerforation',value:'器官穿孔'}
        { Value: '疼痛', Text: '疼痛', Check: false },
        { Value: '阻塞', Text: '阻塞', Check: false },
        { Value: '出血', Text: '出血', Check: false },
        { Value: '位置不正', Text: '位置不正', Check: false },
        { Value: '滲漏', Text: '滲漏', Check: false },
        { Value: '腹膜炎', Text: '腹膜炎', Check: false },
        { Value: '器官穿孔', Text: '器官穿孔', Check: false },
        { Value: '其他', Text: '其他', Check: false }
    ];
    // 換液系統select
    self.LiquidExchangeSystem = [
        // {id:'Twinbag',value:'Twinbag'}, 
        // {id:'HomeChoice',value:'Home choice'}, 
        // {id:'Quanturm',value:'Quanturm'}
        'CAPD', 'APD', '其他'
    ];
    // PET結果select
    self.PETResults = [
        // {id:'High',value:'High'}, 
        // {id:'HighAverage',value:'High Average'}, 
        // {id:'Low',value:'Low'}, 
        // {id:'LowAverage',value:'Low Average'}
        'High', 'High Average', 'Low Average', 'Low'
    ];
    // 終止原因select
    self.TerminationReasons = [
        // {id:'Die',value:'死亡'}, 
        // {id:'Transfer',value:'轉院'}, 
        // {id:'TransferHemodialysis',value:'轉血液透析'}, 
        // {id:'KidneyTransplant',value:'腎移植'}, 
        // {id:'Unknown',value:'去向不明'}, 
        // {id:'Other',value:'其他自填'}
        '死亡', '轉院', '轉血液透析', '腎移植', '去向不明', '轉安寧治療', '其他'
    ];
    // 轉血液透析原因select
    self.TranshemodialysisReasons = [
        // {id:'Peritonitis',value:'腹膜炎'}, 
        // {id:'LackOfDialysis',value:'透析不足'}, 
        // {id:'InsufficientFiltering',value:'超過瀘不足'}, 
        // {id:'CatheterObstruction',value:'導管阻塞'}, 
        // {id:'CatheterShift',value:'導管移位'}, 
        // {id:'Malnutrition',value:'營養不良'}, 
        // {id:'Other',value:'其他自填'}
        '腹膜炎', '透析不足', '超過瀘不足', '導管阻塞', '導管移位', '營養不良', '其他'
    ];
    //死亡原因
    self.DeathReasons = [
        "心肺系統", "中樞神經系統", "感染", "胃腸及肝膽系統", "惡性腫瘤", "其他"
    ];
    //死亡原因-心肺系統
    self.DeathReasonsCardiopulmonarySystem = [
        "選擇死亡原因細項", "心包膜炎", "肺水腫", "心肌炎", "心肌梗塞", "心肌病變", "肺血栓、栓塞", "致命性心律不整", "其它原因之心衰竭",
        "原因不明之心性休克及心衰竭", "原因不明之突然死", "氣喘", "慢性阻塞性肺疾病", "其他原因之呼吸衰竭", "不明原因之呼吸衰竭"
    ];
    //死亡原因-中樞神經系統
    self.DeathReasonsCentralNervousSystem = [
        "選擇死亡原因細項", "腦血管出血", "腦血管梗塞", "高血壓性腦症", "透析性腦症", "原因不明之腦病變"
    ];
    //死亡原因-感染
    self.DeathReasonsInfection = [
        "選擇死亡原因細項", "肺炎、肺膿傷", "尿路感染", "中樞神經感染", "血管通路感染", "肝膽系統感染", "結核", "腹膜炎",
        "機會性感染(伺機性感染)", "敗血症、菌血症", "其它之感染症"
    ];
    //死亡原因-惡性腫瘤
    self.DeathReasonsMalignantTumor = [
        "選擇死亡原因細項", "肺惡性腫瘤", "肝惡性腫瘤", "消化道惡性腫瘤", "泌尿道惡性腫瘤",
        "女性生器惡性腫瘤", "男性生器惡性腫瘤", "乳房惡性腫瘤", "血液性惡性腫瘤", "其他惡性腫瘤"
    ];
    //死亡原因-其他
    self.DeaReroule = [
        "選擇死亡原因細項", "高血鉀猝死", "其它出血導致休克死亡", "自殺", "拒絕透析", "意外事件死亡",
        "不明原因死亡", "災害死亡", "其他"
    ];
    //死亡地點
    self.DeathAddress = [
        "醫院", "透析單位", "家中", "其他"
    ];
    //植管併發症
    self.ImplantationComplicationsCheck = [
        { Value: '無', Text: '無', Check: false, disabled: false },
        { Value: '導管移位', Text: '導管移位', Check: false, disabled: false },
        { Value: '網膜包覆', Text: '網膜包覆', Check: false, disabled: false },
        { Value: '導管阻塞', Text: '導管阻塞', Check: false, disabled: false },
        { Value: '皮下血腫/膿傷', Text: '皮下血腫/膿傷', Check: false, disabled: false },
        { Value: '透析液滲漏', Text: '透析液滲漏', Check: false, disabled: false },
        { Value: '灌入或引流困難', Text: '灌入或引流困難', Check: false, disabled: false },
        { Value: '腸穿孔/膀胱穿孔', Text: '腸穿孔/膀胱穿孔', Check: false, disabled: false },
        { Value: '術後腹膜炎', Text: '術後腹膜炎', Check: false, disabled: false },
        { Value: '術後傷口感染', Text: '術後傷口感染', Check: false, disabled: false },
        { Value: '部分覆位', Text: '部分覆位', Check: false, disabled: false },
        { Value: '其他', Text: '其他', Check: false, disabled: false }
    ];
    //重新植管原因
    self.ReImplantationReasonCheck = [
        { Value: '無', Text: '無', Check: false },
        { Value: '腹膜炎', Text: '腹膜炎', Check: false },
        { Value: '導管出口處感染', Text: '導管出口處感染', Check: false },
        { Value: '隧道感染', Text: '隧道感染', Check: false },
        { Value: '導管移位', Text: '導管移位', Check: false },
        { Value: '導管引流困難', Text: '導管引流困難', Check: false },
        { Value: '導管阻塞', Text: '導管阻塞', Check: false },
        { Value: '導管破裂', Text: '導管破裂', Check: false },
        { Value: '其他', Text: '其他', Check: false },
    ];
    console.log("self.fiDataAry-fiListItem--", self.fiDataObj);

    // watch for screen sizes
    $scope.$watch(
        function () {
            return $mdMedia("(max-width: 600px)");
        },
        function (big) {
            self.smallScreen = big;
            // console.log("$scope.smallScreen", self.smallScreen);
        }
    );


    self.patientId = $stateParams.patientId;
    PatientService.getById(self.patientId).then((res) => {
        self.currentPatient = res.data;
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        //self.fiDataObj.Pd_Date = toDay;
        //new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); 
        //首次腹透日期
        if (self.currentPatient.FirstPDDate !== null) {
            self.fiDataObj.Pd_Date = new Date(moment(self.currentPatient.FirstPDDate).format('YYYY-MM-DD HH:mm:ss'));
        } else {
            //self.fiDataObj.Pd_Date = toDay;
        }
        console.log("self.currentPatient--", self.currentPatient);
        frequencyImplantationService.GetLastOneByPatientid(self.patientId).then((res) => {
            self.quantityEvaluateData = res.data;
            //PET結果
            if (self.quantityEvaluateData.Pet !== null) {
                self.fiDataObj.Pet_Results = self.quantityEvaluateData.Pet;
            } else {
                self.fiDataObj.Pet_Results = "High";
            }
            //PET日期  
            if (self.quantityEvaluateData.Pet_Date !== null) {
                //self.fiDataObj.Pet_Date = new Date(moment(self.quantityEvaluateData.Recorddate).format("YYYY-MM-DD HH:mm:ss"));;
            } else {
                //self.fiDataObj.Pet_Date = toDay;
            }
            //    參數設定--'植管醫院(造管醫院)'         
            frequencyImplantationService.GetDialysisInfo().then((res) => {
                self.DialysisInfo = res.data;
                self.fiHospital = res.data.DialysisSetting.Records.CatheterHospitals;

                console.log("self.DialysisInfo Success--", self.DialysisInfo);
            }, (res) => {
                console.log("self.DialysisInfo Fail--", self.DialysisInfo);
            });

            console.log("self.quantityEvaluateData--", self.quantityEvaluateData);
        }, (res) => {
            console.log("self.quantityEvaluateData--", self.quantityEvaluateData);
        });

    }, (res) => {
        console.log("complicationService getList Fail", res);
    });


    // 參數設定--'植管醫院(造管醫院)'  

    // infoService.get().then((resp) => {
    //     console.log(resp);
    //     self.hospital = resp.data;
    //     if (resp.data.DialysisSetting) {
    //         self.hospitalSetting = angular.copy(resp.data.DialysisSetting.Records);
    //         // 資料讀取出來後就先進行分行動作，之後回寫時要進行合併回array動作
    //         let temStr = "";
    //         if (self.hospitalSetting !== null) {
    //             _.forEach(self.category3, (value) => {
    //                 //self.hospitalSetting[value.key] = self.hospitalSetting[value.key].join('\n');
    //                 //temStr += self.hospitalSetting[value.key] + ",";
    //                 self.fiHospital = self.hospitalSetting[value.key];
    //             });
    //             // temStr = temStr.substr(0, temStr.length - 1);
    //             // self.fiHospital = temStr;
    //         }
    //     } else {
    //         self.hospitalSetting = null;
    //     }    
    //     console.log("self.fiHospital-----",self.fiHospital );

    // }, () => {
    //     self.loading = false;
    //     self.isError = true;
    //     showMessage($translate('customMessage.DataReadFailure')); // lang.DataReadFailure
    // });
    // console.log("cathList-peDataAry",self.peDataAry);

    if (self.fiDataObj.isCreate) {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        // 整理 editFrom UI 初始值  

        //腹透植管次數
        self.fiDataObj.Frequency_Implantation = self.fiDataObj.Frequency_Implantation;

        //checkbox
        self.fiDataObj.Re_Implantation_Reason = "";
        //checkbox
        self.fiDataObj.Implantation_Complications = "";
        //手術初期合併症checkbox
        self.fiDataObj.Early_Complications_Surgery = "";
        //麻醉方式checkbox
        self.fiDataObj.Anesthesia_Mode = "";
        //其他
        self.fiDataObj.EarlyComplicationsSurgeryCheckOther = "";
        self.fiDataObj.AnesthesiaModeCheckOther = "";
        self.fiDataObj.ReImplantationReasonCheckOther = "";
        self.fiDataObj.ImplantationComplicationsCheckOther = "";

        //植管醫師科別
        self.fiDataObj.Doctor_Section = "";
        //植管方式
        self.fiDataObj.Implantation_Method = "";
        //植入位置
        self.fiDataObj.Implantation_Location = "";
        // 導管出口radio
        self.fiDataObj.Catheter_Outlet = '左側';
        //導管型式radio
        self.fiDataObj.Catheter_Type = "Tenckhoff";
        //CUFF數
        self.fiDataObj.Cuff_Amount = "Two Cuff";
        //前端型態
        self.fiDataObj.Front_Type = "";
        // 手術方式radio
        self.fiDataObj.Operative_Method = '腹腔鏡手術';
        //首次透析模式
        self.Liquid_Exchange_System = "";

        //首次透析模式radio
        self.fiDataObj.LiquidExchangeSystemOther = "";
        //植入位置radio 其他
        self.fiDataObj.ImplantationLocationOther = "";
        //導管型式(種類)radio 其他
        self.fiDataObj.CatheterTypeOther = "";
        //前端型態radio 其他
        self.fiDataObj.FrontTypeOther = "";
        //手術方式radio 其他
        self.fiDataObj.OperativeMethodOther = "";
        //終止原因select 其他
        self.fiDataObj.TerminationReasonsOther = "";
        //轉血液透析原因select 其他
        self.fiDataObj.TranshemodialysisReasonsOther = "";
        //死亡原因select 
        self.fiDataObj.DeathReasonsOtherOther = "";
        //死亡原因細項
        self.fiDataObj.Death_Reasons_Detail = "";
        //死亡原因-心肺系統 Death_CIS Death_Reasons_CardiopulmonarySystem
        self.fiDataObj.Death_Reasons_CardiopulmonarySystem = "選擇死亡原因細項";
        //死亡原因-中樞神經系統 Death_CNS Death_Reasons_CentralNervousSystem
        self.fiDataObj.Death_Reasons_CentralNervousSystem = "選擇死亡原因細項";
        //死亡原因-感染 Death_Infection Death_Reasons_Infection
        self.fiDataObj.Death_Reasons_Infection = "選擇死亡原因細項";
        //死亡原因-惡性腫瘤 Death_MT Death_Reasons_MalignantTumor
        self.fiDataObj.Death_Reasons_MalignantTumor = "選擇死亡原因細項";
        //死亡原因-其他 Dath_Other Death_Reasons_Other
        self.fiDataObj.Death_Reasons_Other = "選擇死亡原因細項";

        //Death_Reasons == '感染' DeathReasonsInfectionOther
        self.fiDataObj.DeathReasonsInfectionOther = "";
        //Death_Reasons == '惡性腫瘤' DeathReasonsMalignantTumorOther
        self.fiDataObj.DeathReasonsMalignantTumorOther = "";
        //Death_Reasons == '其他' DeathReasonsOtherOther
        self.fiDataObj.DeathReasonsOtherOther = "";

        //導管植入日期
        self.fiDataObj.Catheter_Implantation_Date = toDay;
        //併發症日期
        //self.fiDataObj.Complications_Date = toDay;
        //重新植管日期
        //self.fiDataObj.Re_Implantation_Date = toDay;
        //PD開始日期 ->currentPatient

        //終止治療日期
        //self.fiDataObj.Treatment_Termination_Date = toDay;
        //拔管日期
        //self.fiDataObj.Extubation_Date = toDay;

        //植管醫院select
        self.fiDataObj.Frequency_Implanate_Hospital = "0";
        //終止原因select
        self.fiDataObj.Termination_Reasons = "0";
        //轉血液透析原因select
        self.fiDataObj.Transhemodialysis_Reasons = "0";
        //死亡原因select
        self.fiDataObj.Death_Reasons = "0";



        console.log("frequencyImplantation object", self.fiDataObj);

    } else {
        //植管醫院select
        //終止原因select
        //轉血液透析原因select
        //死亡原因select

    }

    self.initialUI = function initialUI() {

        self.sortinData("ImplantationComplications");
        self.sortinData("ReImplantationReason");
        self.sortinData("AnesthesiaMode");
        self.sortinData("EarlyComplicationsSurgery");

        self.category3 = [
            {
                key: 'CatheterHospitals',
                name: $translate('info.component.catheterHospitals') // '造管醫院'
            }
        ];
    };

    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
        $rootScope.$emit("frequencyImplantationListRefreshEvent", "");
    };


    // initial 整理 資料庫資料 => 畫面上 Checkbox
    self.sortinData = function (blockName) {
        switch (blockName) {
            case "ImplantationComplications":
                if (self.fiDataObj.Implantation_Complications !== null) {
                    let tmpAry = [];
                    tmpAry = self.fiDataObj.Implantation_Complications.split(",");
                    //新增其他輸入
                    for (let tmpItem in tmpAry) {
                        if (tmpAry[tmpItem].indexOf("oher_") >= 0) {
                            self.fiDataObj.ImplantationComplicationsCheckOther = tmpAry[tmpItem].substr(5);
                        } else {
                            self.fiDataObj.ImplantationComplicationsCheckOther = self.fiDataObj.ImplantationComplicationsCheckOther !== "" ? self.fiDataObj.ImplantationComplicationsCheckOther : "";
                        }
                    }
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.ImplantationComplicationsCheck.length; i++) {
                            let si = self.ImplantationComplicationsCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.ImplantationComplicationsCheck[i] = si;
                                break;
                            }
                        }
                    }

                    if (self.ImplantationComplicationsCheck[0].Check) {
                        for (let i = 1; i < (self.ImplantationComplicationsCheck.length - 1); i++) {
                            self.ImplantationComplicationsCheck[i].disabled = true;
                        }
                    } else {
                        for (let i = 1; i < (self.ImplantationComplicationsCheck.length - 1); i++) {
                            self.ImplantationComplicationsCheck[i].disabled = false;
                        }
                    }

                    break;
                }
            case "ReImplantationReason":
                if (self.fiDataObj.Re_Implantation_Reason !== null) {
                    let tmpAry = [];
                    tmpAry = self.fiDataObj.Re_Implantation_Reason.split(",");
                    //新增其他輸入
                    for (let tmpItem in tmpAry) {
                        if (tmpAry[tmpItem].indexOf("oher_") >= 0) {
                            self.fiDataObj.ReImplantationReasonCheckOther = tmpAry[tmpItem].substr(5);
                        } else {
                            self.fiDataObj.ReImplantationReasonCheckOther = self.fiDataObj.ReImplantationReasonCheckOther !== "" ? self.fiDataObj.ReImplantationReasonCheckOther : "";
                        }
                    }
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.ReImplantationReasonCheck.length; i++) {
                            let si = self.ReImplantationReasonCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.ReImplantationReasonCheck[i] = si;
                                break;
                            }
                        }
                    }

                    if (self.ReImplantationReasonCheck[0].Check) {
                        for (let i = 1; i < (self.ReImplantationReasonCheck.length - 1); i++) {
                            self.ReImplantationReasonCheck[i].disabled = true;
                        }
                    } else {
                        for (let i = 1; i < (self.ReImplantationReasonCheck.length - 1); i++) {
                            self.ReImplantationReasonCheck[i].disabled = false;
                        }
                    }

                    break;
                }
            case "AnesthesiaMode":
                if (self.fiDataObj.Anesthesia_Mode !== null) {
                    let tmpAry = [];
                    tmpAry = self.fiDataObj.Anesthesia_Mode.split(",");
                    //新增其他輸入
                    for (let tmpItem in tmpAry) {
                        if (tmpAry[tmpItem].indexOf("oher_") >= 0) {
                            self.fiDataObj.AnesthesiaModeCheckOther = tmpAry[tmpItem].substr(5);
                        } else {
                            self.fiDataObj.AnesthesiaModeCheckOther = self.fiDataObj.AnesthesiaModeCheckOther !== "" ? self.fiDataObj.AnesthesiaModeCheckOther : "";
                        }
                    }
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.AnesthesiaModeCheck.length; i++) {
                            let si = self.AnesthesiaModeCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.AnesthesiaModeCheck[i] = si;
                                break;
                            }
                        }
                    }

                    if (self.AnesthesiaModeCheck[0].Check) {
                        for (let i = 1; i < (self.AnesthesiaModeCheck.length - 1); i++) {
                            self.AnesthesiaModeCheck[i].disabled = true;
                        }
                    } else {
                        for (let i = 1; i < (self.AnesthesiaModeCheck.length - 1); i++) {
                            self.AnesthesiaModeCheck[i].disabled = false;
                        }
                    }

                    break;
                }
            case "EarlyComplicationsSurgery":
                if (self.fiDataObj.Early_Complications_Surgery !== null) {
                    let tmpAry = [];
                    tmpAry = self.fiDataObj.Early_Complications_Surgery.split(",");
                    //新增其他輸入
                    for (let tmpItem in tmpAry) {
                        if (tmpAry[tmpItem].indexOf("oher_") >= 0) {
                            self.fiDataObj.EarlyComplicationsSurgeryCheckOther = tmpAry[tmpItem].substr(5);
                        } else {
                            self.fiDataObj.EarlyComplicationsSurgeryCheckOther = self.fiDataObj.EarlyComplicationsSurgeryCheckOther !== "" ? self.fiDataObj.EarlyComplicationsSurgeryCheckOther : "";
                        }
                    }
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.EarlyComplicationsSurgeryCheck.length; i++) {
                            let si = self.EarlyComplicationsSurgeryCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.EarlyComplicationsSurgeryCheck[i] = si;
                                break;
                            }
                        }
                    }

                    if (self.EarlyComplicationsSurgeryCheck[0].Check) {
                        for (let i = 1; i < (self.EarlyComplicationsSurgeryCheck.length - 1); i++) {
                            self.EarlyComplicationsSurgeryCheck[i].disabled = true;
                        }
                    } else {
                        for (let i = 1; i < (self.EarlyComplicationsSurgeryCheck.length - 1); i++) {
                            self.EarlyComplicationsSurgeryCheck[i].disabled = false;
                        }
                    }
                    break;
                }
        }
    };
    // 儲存button -> 整理 畫面上 Checkbox => 資料庫資料
    self.sortoutData = function (blockName) {
        let tmpStr = "";
        let treCnt = "";
        switch (blockName) {
            case "ImplantationComplications":
                //麻醉方式 treatmentResultCheck cynthia 新增其他輸入
                treCnt = self.ImplantationComplicationsCheck.length;
                if (self.fiDataObj.ImplantationComplicationsCheckOther !== "") {
                    self.ImplantationComplicationsCheck[treCnt] =
                        {
                            "Text": "oher_" + self.fiDataObj.ImplantationComplicationsCheckOther,
                            "Check": true
                        };
                }
                tmpStr = "";
                for (let si in self.ImplantationComplicationsCheck) {
                    if (self.ImplantationComplicationsCheck[si].Check) {
                        tmpStr += self.ImplantationComplicationsCheck[si].Text + ",";
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                //if(self.compDataObj.length < 1){
                //self.compDataObj[0].treatmentResult = tmpStr;
                //}
                self.fiDataObj.Implantation_Complications = tmpStr;
                // for (let i = 0; i < Object.keys(self.compDataObj).length; i++) {
                //     self.compDataObj[i].treatmentResult = tmpStr;
                // }
                break;
            case "ReImplantationReason":
                treCnt = self.ReImplantationReasonCheck.length;
                if (self.fiDataObj.ReImplantationReasonCheckOther !== "") {
                    self.ReImplantationReasonCheck[treCnt] =
                        {
                            "Text": "oher_" + self.fiDataObj.ReImplantationReasonCheckOther,
                            "Check": true
                        };
                }
                tmpStr = "";
                for (let si in self.ReImplantationReasonCheck) {
                    if (self.ReImplantationReasonCheck[si].Check) {
                        tmpStr += self.ReImplantationReasonCheck[si].Text + ",";
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                //if(self.compDataObj.length < 1){
                //self.compDataObj[0].treatmentResult = tmpStr;
                //}
                self.fiDataObj.Re_Implantation_Reason = tmpStr;
                // for (let i = 0; i < Object.keys(self.compDataObj).length; i++) {
                //     self.compDataObj[i].treatmentResult = tmpStr;
                // }
                break;
            case "AnesthesiaMode":
                treCnt = self.AnesthesiaModeCheck.length;
                if (self.fiDataObj.AnesthesiaModeCheckOther !== "") {
                    self.AnesthesiaModeCheck[treCnt] =
                        {
                            "Text": "oher_" + self.fiDataObj.AnesthesiaModeCheckOther,
                            "Check": true
                        };
                }
                tmpStr = "";
                for (let si in self.AnesthesiaModeCheck) {
                    if (self.AnesthesiaModeCheck[si].Check) {
                        tmpStr += self.AnesthesiaModeCheck[si].Text + ",";
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                //if(self.compDataObj.length < 1){
                //self.compDataObj[0].treatmentResult = tmpStr;
                //}
                self.fiDataObj.Anesthesia_Mode = tmpStr;
                // for (let i = 0; i < Object.keys(self.compDataObj).length; i++) {
                //     self.compDataObj[i].treatmentResult = tmpStr;
                // }
                break;
            case "EarlyComplicationsSurgery":
                treCnt = self.EarlyComplicationsSurgeryCheck.length;
                if (self.fiDataObj.EarlyComplicationsSurgeryCheckOther !== "") {
                    self.EarlyComplicationsSurgeryCheck[treCnt] =
                        {
                            "Text": "oher_" + self.fiDataObj.EarlyComplicationsSurgeryCheckOther,
                            "Check": true
                        };
                }
                tmpStr = "";
                for (let si in self.EarlyComplicationsSurgeryCheck) {
                    if (self.EarlyComplicationsSurgeryCheck[si].Check) {
                        tmpStr += self.EarlyComplicationsSurgeryCheck[si].Text + ",";
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                //if(self.compDataObj.length < 1){
                //self.compDataObj[0].treatmentResult = tmpStr;
                //}
                self.fiDataObj.Early_Complications_Surgery = tmpStr;
                // for (let i = 0; i < Object.keys(self.compDataObj).length; i++) {
                //     self.compDataObj[i].treatmentResult = tmpStr;
                // }
                break;
        }

    };

    self.checkTheBox = function (blockName, index) {
        switch (blockName) {
            case "ImplantationComplications":
                self.ImplantationComplicationsCheck[index].Check = !self.ImplantationComplicationsCheck[index].Check;
                if (self.ImplantationComplicationsCheck[0].Check) {
                    for (let i = 1; i < (self.ImplantationComplicationsCheck.length); i++) {
                        self.ImplantationComplicationsCheck[i].Check = false;
                        self.ImplantationComplicationsCheck[i].disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.ImplantationComplicationsCheck.length); i++) {
                        self.ImplantationComplicationsCheck[i].disabled = false;
                    }
                }
                break;
            case "ReImplantationReason":
                self.ReImplantationReasonCheck[index].Check = !self.ReImplantationReasonCheck[index].Check;
                if (self.ReImplantationReasonCheck[0].Check) {
                    for (let i = 1; i < (self.ReImplantationReasonCheck.length); i++) {
                        self.ReImplantationReasonCheck[i].Check = false;
                        self.ReImplantationReasonCheck[i].disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.ReImplantationReasonCheck.length); i++) {
                        self.ReImplantationReasonCheck[i].disabled = false;
                    }
                }
                break;
            case "AnesthesiaMode":
                self.AnesthesiaModeCheck[index].Check = !self.AnesthesiaModeCheck[index].Check;
                if (self.AnesthesiaModeCheck[0].Check) {
                    for (let i = 1; i < (self.AnesthesiaModeCheck.length - 1); i++) {
                        self.AnesthesiaModeCheck[i].disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.AnesthesiaModeCheck.length - 1); i++) {
                        self.AnesthesiaModeCheck[i].disabled = false;
                    }
                }
                break;
            case "EarlyComplicationsSurgery":
                self.EarlyComplicationsSurgeryCheck[index].Check = !self.EarlyComplicationsSurgeryCheck[index].Check;
                if (self.EarlyComplicationsSurgeryCheck[0].Check) {
                    for (let i = 1; i < (self.EarlyComplicationsSurgeryCheck.length - 1); i++) {
                        self.EarlyComplicationsSurgeryCheck[i].disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.EarlyComplicationsSurgeryCheck.length - 1); i++) {
                        self.EarlyComplicationsSurgeryCheck[i].disabled = false;
                    }
                }
                break;
        }
    };

    //讀取時判斷死亡原因細項

    //儲存時設定死亡原因細項
    self.setDeathReasons = function (strDeathReasons) {
        //死亡原因-心肺系統 Death_CIS Death_Reasons_CardiopulmonarySystem
        //死亡原因-中樞神經系統 Death_CNS Death_Reasons_CentralNervousSystem
        //死亡原因-感染 Death_Infection Death_Reasons_Infection
        //死亡原因-惡性腫瘤 Death_MT Death_Reasons_MalignantTumor
        //死亡原因-其他 Dath_Other Death_Reasons_Other

        //Death_Reasons == '感染' DeathReasonsInfectionOther
        //Death_Reasons == '惡性腫瘤' DeathReasonsMalignantTumorOther
        //Death_Reasons == '其他' DeathReasonsOtherOther

        //寫入死亡原因細項
        // for(let j = 0;j<self.DeathReasons.length;j++){
        //     if(self.DeathReasons == )
        // }
        switch (strDeathReasons) {
            case "心肺系統":
                if (self.fiDataObj.Death_Reasons_CardiopulmonarySystem !== "選擇死亡原因細項") {
                    self.fiDataObj.Death_Reasons_Detail = self.fiDataObj.Death_Reasons_CardiopulmonarySystem;
                } else {
                    self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                }
                break;
            case "中樞神經系統":
                if (self.fiDataObj.Death_Reasons_CentralNervousSystem !== "選擇死亡原因細項") {
                    self.fiDataObj.Death_Reasons_Detail = self.fiDataObj.Death_Reasons_CentralNervousSystem;
                } else {
                    self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                }
                break;
            case "感染":
                if (self.fiDataObj.Death_Reasons_Infection !== "選擇死亡原因細項") {
                    if (self.fiDataObj.Death_Reasons_Infection == '其它之感染症') {
                        //if(self.fiDataObj.DeathReasonsInfectionOther != "" ){
                        self.fiDataObj.Death_Reasons_Detail = "Death_Infection_" + self.fiDataObj.DeathReasonsInfectionOther;
                        //}
                    } else {
                        self.fiDataObj.Death_Reasons_Detail = self.fiDataObj.Death_Reasons_Infection;
                    }
                } else {
                    self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                }
                break;
            case "胃腸及肝膽系統":
                self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                self.fiDataObj.DeathReasonsInfectionOther = "";
                self.fiDataObj.DeathReasonsMalignantTumorOther = "";
                self.fiDataObj.DeathReasonsOtherOther = "";
                break;
            case "惡性腫瘤":
                if (self.fiDataObj.Death_Reasons_MalignantTumor !== "選擇死亡原因細項") {
                    if (self.fiDataObj.Death_Reasons_MalignantTumor == '其他惡性腫瘤') {
                        self.fiDataObj.Death_Reasons_Detail = "Death_MT_" + self.fiDataObj.DeathReasonsMalignantTumorOther;
                    } else {
                        self.fiDataObj.Death_Reasons_Detail = self.fiDataObj.Death_Reasons_MalignantTumor;
                    }
                    // if(self.fiDataObj.DeathReasonsMalignantTumorOther != ""){
                    //     
                    // }

                } else {
                    self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                }
                break;
            case "其他":
                if (self.fiDataObj.Death_Reasons_Other !== "選擇死亡原因細項") {
                    if (self.fiDataObj.Death_Reasons_Other == '其他') {
                        //if(self.fiDataObj.DeathReasonsOtherOther != ""){
                        self.fiDataObj.Death_Reasons_Detail = "Dath_Other_" + self.fiDataObj.DeathReasonsOtherOther;
                        //}
                    } else {
                        self.fiDataObj.Death_Reasons_Detail = self.fiDataObj.Death_Reasons_Other;
                    }
                } else {
                    self.fiDataObj.Death_Reasons_Detail = "選擇死亡原因細項";
                }
                break;
        }
        console.log("self.fiDataObj.DeathReasonsOtherOther---", self.fiDataObj.DeathReasonsOtherOther);
        console.log("self.fiDataObj.Death_Reasons_Detail---", self.fiDataObj.Death_Reasons_Detail);

    };

    // save
    self.ok = function ok() {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        //patient 基本資料
        self.fiDataObj.Patientid = self.currentPatient.Id;
        self.fiDataObj.Patient_Name = self.currentPatient.Name;
        self.fiDataObj.Medicalid = self.currentPatient.MedicalId;
        self.fiDataObj.Hospitalid = self.currentPatient.HospitalId;
        self.fiDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
        self.fiDataObj.Status = "Normal";
        console.log("self.fiDataObj.Catheter_Implantation_Date create--", self.fiDataObj.Catheter_Implantation_Date);

        // 整理畫面資料

        // //導管植入日期
        // self.fiDataObj.Catheter_Implantation_Date.setHours(self.fiDataObj.Catheter_Implantation_Date.getHours()+8);
        // //併發症日期
        // self.fiDataObj.Complications_Date.setHours(self.fiDataObj.Complications_Date.getHours()+8);
        // //重新植管日期
        // self.fiDataObj.Re_Implantation_Date.setHours(self.fiDataObj.Re_Implantation_Date.getHours()+8);
        // //PD開始日期
        // self.fiDataObj.Pd_Date.setHours(self.fiDataObj.Pd_Date.getHours()+8);
        // //PET日期
        // self.fiDataObj.Pet_Date.setHours(self.fiDataObj.Pet_Date.getHours()+8);
        // //終止治療日期
        // self.fiDataObj.Treatment_Termination_Date.setHours(self.fiDataObj.Treatment_Termination_Date.getHours()+8);
        // //拔管日期
        // self.fiDataObj.Extubation_Date.setHours(self.fiDataObj.Extubation_Date.getHours()+8);

        //轉血液透析原因select
        self.fiDataObj.Transhemodialysis_Reasons = self.fiDataObj.Transhemodialysis_Reasons === "其他" ? "oher_" + self.fiDataObj.TranshemodialysisReasonsOther : self.fiDataObj.Transhemodialysis_Reasons;

        //終止原因select
        self.fiDataObj.Termination_Reasons = self.fiDataObj.Termination_Reasons === "其他" ? "oher_" + self.fiDataObj.TerminationReasonsOther : self.fiDataObj.Termination_Reasons;

        //植入位置radio
        self.fiDataObj.Implantation_Location = self.fiDataObj.Implantation_Location === "其他" ? "oher_" + self.fiDataObj.ImplantationLocationOther : self.fiDataObj.Implantation_Location;
        //導管型式(種類)radio
        self.fiDataObj.Catheter_Type = self.fiDataObj.Catheter_Type === "其他" ? "oher_" + self.fiDataObj.CatheterTypeOther : self.fiDataObj.Catheter_Type;

        //前端型態radio
        self.fiDataObj.Front_Type = self.fiDataObj.Front_Type === "其他" ? "oher_" + self.fiDataObj.FrontTypeOther : self.fiDataObj.Front_Type;

        //手術方式radio
        self.fiDataObj.Operative_Method = self.fiDataObj.Operative_Method === "其他" ? "oher_" + self.fiDataObj.OperativeMethodOther : self.fiDataObj.Operative_Method;
        //手術初期合併症checkbox
        //首次透析模式radio
        self.fiDataObj.Liquid_Exchange_System = self.fiDataObj.Liquid_Exchange_System === "其他" ? "oher_" + self.fiDataObj.LiquidExchangeSystemOther : self.fiDataObj.Liquid_Exchange_System;
        //死亡原因select        
        if (self.fiDataObj.Death_Reasons !== '0') {
            self.setDeathReasons(self.fiDataObj.Death_Reasons);
        }
        //死亡地點select
        self.fiDataObj.Death_Location = self.fiDataObj.Death_Location === "其他" ? "oher_" + self.fiDataObj.DeathLocationOther : self.fiDataObj.Death_Location;
        //植管醫院select
        self.fiDataObj.Frequency_Implanate_Hospital = self.fiDataObj.Frequency_Implanate_Hospital === "Other" ? "oher_" + self.fiDataObj.FrequencyImplanateHospitalOther : self.fiDataObj.Frequency_Implanate_Hospital;

        // 整理畫面資料
        self.sortoutData("ImplantationComplications");
        self.sortoutData("ReImplantationReason");
        self.sortoutData("AnesthesiaMode");
        self.sortoutData("EarlyComplicationsSurgery");

        // self.fiDataObj.CreatedUserID = "5acc7d6c4dc00e032c2762c6";
        // self.fiDataObj.CreatedUserName = "管理者";
        // self.fiDataObj.CreatedUserID = self.fiDataObj.CreatedUserID.substr(0, 30);
        // self.fiDataObj.ModifiedUserId = "5acc7d6c4dc00e032c2762c6";
        // self.fiDataObj.ModifiedUserName = "管理者";
        // self.fiDataObj.ModifiedUserId = self.fiDataObj.ModifiedUserId.substr(0,30);

        console.log("self.fiDataObj----", self.fiDataObj);

        if (self.fiDataObj.isCreate) {

            self.fiDataObj.CreatedTime = toDay;
            self.fiDataObj.CreatedUserId = SettingService.getCurrentUser().Id;
            self.fiDataObj.CreatedUserName = SettingService.getCurrentUser().Name;

            console.log("self.fiDataObj create--", self.fiDataObj);
            frequencyImplantationService.post(self.fiDataObj).then((res) => {
                console.log("frequencyImplantationService createOne success", res);
                showMessage($translate('frequencyImplantation.dialog.createSuccess'));
                $rootScope.$emit("frequencyImplantationRefreshEvent", "");
                self.fiDataObj.isCreate = false;
            }, (res) => {
                console.log("frequencyImplantationService createOne fail", res);
                showMessage($translate('frequencyImplantation.dialog.createFail'));
            });

        } else {
            self.fiDataObj.ModifiedTime = toDay;
            self.fiDataObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.fiDataObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            console.log("Edit fiDataObj--", self.fiDataObj);
            frequencyImplantationService.put(self.fiDataObj).then((res) => {
                console.log("frequencyImplantationService update success", res);
                showMessage($translate('frequencyImplantation.dialog.editSuccess'));
                $rootScope.$emit("frequencyImplantationRefreshEvent", "");
            }, (res) => {
                console.log("frequencyImplantationService update fail", res);
                showMessage($translate('frequencyImplantation.dialog.editFail'));
            });

        }

        $rootScope.$emit("frequencyImplantationRefreshEvent", "");
        $mdDialog.hide();
    };

    // 開啟治療記錄編輯 Dialog
    self.openEditDialog = function (cathDetailItem) {
        // self.isUpdate = true;
        // self.isUpdateCreate = false;
        // console.log("openEditDialog", cathDetailItem);

        // self.petDataObj = cathDetailItem;
        // console.log("petDataObj--", self.petDataObj);  
    };

    self.calculateDays = function (treatItem) {

    };

    self.initialUI();


}

import { $IsStateFilter } from "angular-ui-router/lib/stateFilters";
import './nAFEdit.less';
angular
    .module('app')
    .controller('nAFEditController', nAFEditController);

nAFEditController.$inject = [
    '$stateParams', 'PatientService','PatientFromColumnService','highRiskFallerService',
    'patientFormImageService','$mdDialog', 'showMessage', 'SettingService', 'nursingAssessmentService',
    'Upload','$timeout','$filter', 'nAFItem', '$mdSidenav', 'cursorInput','$http'];
function nAFEditController(
    $stateParams, PatientService,PatientFromColumnService,highRiskFallerService,
    patientFormImageService,$mdDialog, showMessage, SettingService, nursingAssessmentService, 
    Upload,$timeout,$filter, nAFItem, $mdSidenav, cursorInput,$http) {
    console.log("nAFEditController Edit/Create Dialog", nAFItem);

    const self = this;
    const $translate = $filter('translate');
    //圖片有沒有變動
    self.ChangImage = false;
    //self.isCreate = nAFItem === null;
    let _nAFItem = angular.copy(nAFItem);
    self.nAFDataObj = _nAFItem;

    self.patientId = $stateParams.patientId;
    PatientService.getById(self.patientId).then((res) => {
        self.currentPatient = res.data;
        console.log("self.currentPatient--", self.currentPatient);
    }, (res) => {
        console.log("complicationService getList Fail", res);
    }).then((res) =>{
        //讀取生理量測資料

    });
    //get ID or Name
    let CurrentUser = function getLocalOrOnlineUser(){
        
        let hostName = document.location.hostname;
        let UserId = "";
        let UserName = "";
        if( hostName == "localhost" || hostName == "127.0.0.1" ){
            UserId = "Swagger";
            UserName = "Swagger";
        }else{
            UserId = SettingService.getCurrentUser().Account;
            UserName = SettingService.getCurrentUser().Name;
        }
        return {"UserId":UserId,"UserName":UserName};
    }
    let vitalSignObj = {
        BPS: '',
        BPD: '',
        BloodPressurePosture: '',
        Temperature: null,
        Pulse: null,
        Respiration: null,
        RecordTime: new Date(moment().format('YYYY/MM/DD HH:mm')) // 預設是今天日期
    };

    //照片
    // get by picture
    self.imagesData = [];
    self.O_imagesPostData = [];
    self.imagesPostData = [];
    self.loadingPicture = false;
    self.isFabOpen = false;

    // 辨識環境
    self.device = cordova.platformId === 'browser';

    let pictureSource;  // 设定图片来源
    let destinationType; // 选择返回数据的格式

    if (!self.device) {
        document.addEventListener('deviceready', onDeviceReady, false);
    }

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    self.nAFDataObj.PostVitalSign = [];
    //#region UI 預設選項
    self.initialUI = function () {    
        self.nAFDataObj.PostVitalSign.push(vitalSignObj);
        //體重
        // self.nAFDataObj.Body_Weight = "" //體重計傳輸器上傳
        // self.nAFDataObj.Dialysate_Weight = "" //透析液
        // self.nAFDataObj.Clothes_Weight = "" //衣服
        // self.nAFDataObj.Wheelchair_Weight = "" //輪椅
        // self.nAFDataObj.Net_Body_Weight = "" //淨體重
        // self.nAFDataObj.Blood_Pressure = "" //血壓
        // self.nAFDataObj.Temperature = "" //體溫
        // 症狀
        // ---------導管出口評估---------
        self.CatheterEvaluates = [
            { Text: "正常", Check: false, disabled: false },
            { Text: "結痂", Check: false, disabled: false },
            { Text: "出血", Check: false, disabled: false },
            { Text: "息肉", Check: false, disabled: false },
            { Text: "感染", Check: false, disabled: false }
        ]
        //self.nAFDataObj.Catheter_Evaluate = []; //(資料傳送)
        //self.Catheter_Outlet_Times = null // 導管出口評估感染-次數
        self.CatheterEvaluates_Other = false;
        //self.nAFDataObj.Catheter_Evaluate_Other = "" //其他
        // ----------------------------
        // ---------分泌物、性狀---------
        //self.nAFDataObj.Secretion_Yn =  "" //分泌物-有無
        self.Secretion_Y_Other = false;
        self.SecretionVolume = [
            { Text: "量多", Check: false },
            { Text: "量少", Check: false }
        ] //分泌物-量
        //self.nAFDataObj.Secretion_Volume = []; //分泌物-量(資料傳送)
        self.SecretionTrait = [
            { Text: "膿性", Check: false },
            { Text: "漿性", Check: false }
        ] //分泌物-性狀
        //self.nAFDataObj.Secretion_Trait = []; //分泌物-性狀(資料傳送)
        // ----------------------------
        //顏色
        self.SecretionColor = [
            { Text: "無色", Check: false, disabled: false },
            { Text: "白色", Check: false, disabled: false },
            { Text: "黃色", Check: false, disabled: false },
            { Text: "紅色", Check: false, disabled: false },
            { Text: "褐色", Check: false, disabled: false }
        ]; //分泌物-顏色
        self.SecretionColor_Other_Chk = false
        //self.nAFDataObj.Secretion_Color_Other = "";
        // ----------------------------
        // ---------感染狀態描述---------
        self.DescriptionInfectionStatus = [
            { Text: "紅", Check: false },
            { Text: "腫", Check: false },
            { Text: "熱", Check: false },
            { Text: "痛", Check: false },
            { Text: "化膿", Check: false },
            { Text: "Cuff脫出", Check: false },
            { Text: "隧道炎", Check: false }
        ]
        self.Description_Infection_Status_Othe_Chk = false;
        //self.nAFDataObj.Description_Infection_Status = [];//感染狀態描述-性狀(資料傳送)
        // ----------------------------
        //透析液評估
        //性質
        self.FluidEvalProperties1 = [
            { Text: "清澈", Check: false },
            { Text: "無Fiber", Check: false },
            { Text: "有Fiber", Check: false },
            { Text: "平均每日脫水量", Check: false }
        ];
        self.FluidEvalProperties2 = [
            { Text: "混濁", Check: false },
            { Text: "出血", Check: false },
            { Text: "乳糜液", Check: false },
            { Text: "腹膜炎感染", Check: false }
        ];
        //self.nAFDataObj.Fluid_Eval_Properties =[];
        //顏色
        self.FluidEvalColor = [
            { Text: "淡黃色", Check: false },
            { Text: "黃色", Check: false },
            { Text: "紅色", Check: false },
            { Text: "茶褐色", Check: false }
        ];
        //self.nAFDataObj.Fluid_Eval_Color =[];
        self.Fluid_Eval_Color_Other_Chk = false;
        //水腫評估
        //程度
        self.EdemaEvalDegree = [
            { Text: "無", Check: false, disabled: false },
            { Text: "±", Check: false, disabled: false },
            { Text: "+", Check: false, disabled: false },
            { Text: "++", Check: false, disabled: false },
            { Text: "+++", Check: false, disabled: false },
            { Text: "++++", Check: false, disabled: false }
        ];
        //部位
        self.EdemaEvalSite = [
            { Text: "右上肢", Check: false },
            { Text: "右下肢", Check: false },
            { Text: "左上肢", Check: false },
            { Text: "左下肢", Check: false },
            { Text: "臉部", Check: false },
            { Text: "腹部", Check: false },
            { Text: "全身", Check: false }
        ];
        //呼吸狀況評估
        self.RespiratoryStatusEvaluate = [
            { Text: "正常", Check: false, disabled: false },
            { Text: "胸悶", Check: false, disabled: false },
            { Text: "咳嗽", Check: false, disabled: false },
            { Text: "有痰", Check: false, disabled: false },
            { Text: "喘", Check: false, disabled: false }
        ];
        //皮膚狀況評估
        //外觀
        self.SkinEvalAppearance = [
            { Text: "正常", Check: false, disabled: false },
            { Text: "乾燥", Check: false, disabled: false },
            { Text: "癢", Check: false, disabled: false }
        ];
        //顏色      
        self.SkinEvalColor = [
            { Text: "蒼白", Check: false },
            { Text: "發紅", Check: false },
            { Text: "黃疸", Check: false },
            { Text: "發紺", Check: false }
        ];
        self.SkinEvalCompleteness = [
            { Text: "破皮", Check: false },
            { Text: "紅疹", Check: false },
            { Text: "褥瘡", Check: false }
        ];
        self.Skin_Eval_Complete_Other = false;
        //受損部位      
        self.SkinEvalDamagedSite = [
            { Text: "右上肢", Check: false },
            { Text: "右下肢", Check: false },
            { Text: "左上肢", Check: false },
            { Text: "左下肢", Check: false },
            { Text: "臉部", Check: false },
            { Text: "腹部", Check: false },
            { Text: "全身", Check: false }
        ];
        //高危險跌倒評估總分
        //self.nAFDataObj.High_Risk_Fall_Eval_Score = "";
        //腸胃導評估
        //食慾      
        self.GiEvalAppetite = [
            { Text: "正常", Check: false, disabled: false },
            { Text: "不佳", Check: false, disabled: false },
            { Text: "噁心", Check: false, disabled: false },
            { Text: "嘔吐", Check: false, disabled: false },
            { Text: "差", Check: false, disabled: false }
        ];
        //self.nAFDataObj.Gi_Eval_Appetite =[]//腸胃道評估-食慾
        //排泄      
        self.GiEvalExcretion = [
            { Text: "正常", Check: false, disabled: false },
            { Text: "便祕", Check: false, disabled: false },
            { Text: "腹瀉", Check: false, disabled: false },
            { Text: "脹氣", Check: false, disabled: false }
        ];
        //self.nAFDataObj.Gi_Eval_Excretion = [];//腸胃道評估-排泄
        //腸胃道評估-排泄
        //自我照顧指導
        //護理指導
        self.Self_Guid_Catheter_Yn = false; //護理指導-導管出口照護-是否
        self.SelfGuidCatheter = [
            { Text: "保持乾燥", Check: false },
            { Text: "及早發現感染徵兆", Check: false },
            { Text: "正確換藥", Check: false },
            { Text: "適當固定導管", Check: false }
        ];
        //self.Self_Guid_Catheter = []; //自我照顧指導-導管出口照護
        //透析液檢查
        self.Self_Guid_Fluid_Check_Yn = false;
        //透析液加heparin
        //self.Self_Guid_Fluid_Heparin_Yn = false; //自我照顧指導-透析液加heparin-是否
        //self.nAFDataObj.Self_Guid_Fluid_Heparin = ""; //自我照顧指導-透析液加heparin
        //水分攝取控制
        self.Self_Guid_Water_Ctrl_Yn = false;//自我照顧指導-水分攝取控制-是否
        //self.nAFDataObj.Self_Guid_Water_Ctrl = ""; //自我照顧指導-水分攝取控制
        //飲食
        self.Self_Guid_Diet_Yn = false;//自我照顧指導-飲食-是否       
        self.SelfGuidDiet = [
            { Text: "低磷", Check: false },
            { Text: "低脂", Check: false },
            { Text: "高鉀", Check: false },
            { Text: "低鉀", Check: false },
            { Text: "高鈣", Check: false },
            { Text: "低鈣", Check: false },
            { Text: "高蛋白", Check: false },
            { Text: "含鐵質", Check: false },
            { Text: "含高vit-C", Check: false }
        ];
        //self.nAFDataObj.Self_Guid_Diet = []; //自我照顧指導-飲食
        self.Self_Guid_Dailylife_Yn = false;  //自我照顧指導-常生活是否
        //自我照顧指導-日常生活
        self.SelfGuidDailylife = [
            { Text: "預防跌倒", Check: false },
            { Text: "皮膚照護", Check: false },
            { Text: "運動方法", Check: false },
            { Text: "透析用藥", Check: false },
            { Text: "個人沐浴衛生", Check: false },
            { Text: "居家環境設備", Check: false },
            { Text: "水分攝取控制", Check: false}
            
        ];
        //self.nAFDataObj.Self_Guid_Dailylife = []; //自我照顧指導-日常生活
        //self.Self_Guid_Record_Book_Eval_Yn = false; //自我照顧指導-透析記錄本評值-是否
        //透析記錄本評值      
        self.SelfGuidRecordBookEval = [
            { Text: "病人忘記帶", Check: false },
            { Text: "病人未記錄", Check: false }
        ];        
        //指導對象
        self.Targetpersontype = [
            { Text: "本人", Check: false, disabled: false } ,
            { Text: "子女", Check: false, disabled: false } ,
            { Text: "配偶", Check: false, disabled: false } ,
            { Text: "外傭", Check: false, disabled: false } 
        ];
        self.Targetpersontype_Chk = false;
        //指導方式
        self.Guideways = [
            { Text:"手冊", Check: false, disabled: false } ,
            { Text:"單張", Check: false, disabled: false } ,
            { Text:"影片", Check: false, disabled: false } ,
            { Text:"示範",Check: false, disabled: false },
            { Text:"口頭指導", Check: false, disabled: false } 
        ];
        //評估結果
        self.Answers = [
            { Text:'暸解', Check: false, disabled: false } ,
            { Text:'部分暸解', Check: false, disabled: false } 
        ];
        //self.nAFDataObj.Self_Guid_Record_Book_Eval = [];
        //self.Self_Guid_Immediate_Treatment = false //自我照顧指導-需立即就醫情況
        //self.nAFDataObj.Self_Guid_Other = ""; //自我照顧指導-其他
        //self.nAFDataObj.Nursing_Records = ""; //自我照顧指導-護理紀錄
    }
    self.initialUI();
    
    //特殊function
    self.Calculation_Net_Body_Weight = function () {
        let Body_Weight = _.toNumber(self.nAFDataObj.Body_Weight)
        let Dialysate_Weight = _.toNumber(self.nAFDataObj.Dialysate_Weight)
        let Clothes_Weight = _.toNumber(self.nAFDataObj.Clothes_Weight)
        let Wheelchair_Weight = _.toNumber(self.nAFDataObj.Wheelchair_Weight)

        //淨體重 = 體重 - 透析液 - 衣服 - 輪椅
        // Net_Body_Weight = Body_Weight - Dialysate_Weight - Clothes_Weight - Wheelchair_Weight
        if (_.isNumber(Body_Weight)) {
            if (_.isNumber(Dialysate_Weight)) {
                Dialysate_Weight = Dialysate_Weight;
            }
            if (_.isNumber(Clothes_Weight)) {
                Clothes_Weight = Clothes_Weight;
            }
            if (_.isNumber(Wheelchair_Weight)) {
                Wheelchair_Weight = Wheelchair_Weight;
            }
            self.nAFDataObj.Net_Body_Weight = Body_Weight - Dialysate_Weight - Clothes_Weight - Wheelchair_Weight;
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
    let StringTo_SelectCheckBox = function (s, list) {
        _.split(s, ',').forEach(_s => {
            list.forEach(item => {
                if (item.Text == _s) {
                    item.Check = true;
                }
            })
        });    
    }
    let imageUpload = () => {
        if (self.data.Photo) {
            self.ChangImage = true;
            $timeout(() => {
                self.loadingPicture = true;
            });
            Upload.base64DataUrl(self.data.Photo).then(
                (x) => {
                    // 因為是多筆上傳，這裡用for
                    for (let ime of x) {
                        let filteritem = self.imagesPostData.filter((d)=>{
                            return d.Image == ime.split(',')[1];
                        });
                        if (filteritem.length == 0){
                            const photo = {
                                //Image: ime.split(',')[1]
                                Image: ime
                            };
                            self.imagesData.push(photo);
                            self.imagesPostData.push({Id:"",Image: ime.split(',')[1]});
                        }else{
                            console.log('圖片已經存在！！')
                        }
                    }
                    self.loadingPicture = false;
                }
            );
        }
    };
    //整理生理量測資料
    let Arrange_PostVitalSignList = function(_Form_Id){  
        console.log('into InsertPostVitalSignToDataBase');
        let PostVitalSignList = [];
        let index = 0;
        self.nAFDataObj.PostVitalSign.forEach(item =>{
            for (const [key, value] of Object.entries(item)) {
                let _RecordTime ="";
                if(key == "RecordTime"){
                    _RecordTime = moment(new Date(value)).format('YYYY-MM-DD HH:mm:ss');
                }
                let _tmpobj ={
                    "Form_Id":_Form_Id,
                    "Record_Index": index,
                    "Record_Time": new Date(),
                    "Record_Name": key,
                    "Record_Value": (key == "RecordTime") ? _RecordTime : value,
                    "Medicalid": self.currentPatient.MedicalId,
                    "Patientid": self.currentPatient.Id,
                    "Hospitalid": self.currentPatient.HospitalId
                }
                PostVitalSignList.push(_tmpobj);
            }
            index += 1;    
        });
        return PostVitalSignList;
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
            if (name == "CatheterEvaluates") {
                self.Catheter_Outlet_Times_disabled = _disabled
            }
            self[name].slice(1).forEach(_t => {
                _t.disabled = _disabled;
                _t.Check = false;
            })
        }
    }
    self.OneSelect_All_disabled_View = function (name) {
        //選取陣列
        let SelCheckBoxItem = self[name][0];
        if (SelCheckBoxItem.Check) {            
            if (name == "CatheterEvaluates") {
                self.Catheter_Outlet_Times_disabled = true
                
            }
            self[name].slice(1).forEach(_t => {
                _t.disabled = true;
                _t.Check = false;
            })
            
        }
    }
    // 生理徵象：透析前 減一筆
    self.deletePreVitalSign = function deletePreVitalSign(index) {
        self.nAFDataObj.PreVitalSign.splice(index, 1);
    };

    // 生理徵象(最多3筆)：透析後 加一筆
    self.addPostVitalSign = function addPostVitalSign() {
        if (self.nAFDataObj.PostVitalSign.length < 3) {
            self.nAFDataObj.PostVitalSign.push(angular.copy(vitalSignObj));
            console.log('後 vitalSign：加一筆', self.nAFDataObj.PostVitalSign);
        }
    };
    // 生理徵象：透析後 減一筆
    self.deletePostVitalSign = function deletePostVitalSign(index) {
        self.nAFDataObj.PostVitalSign.splice(index, 1);
    };
    // 上傳圖片
    self.uploadImage = function uploadImage() {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.DATA_URL,
                sourceType: pictureSource.CAMERA,
                correctOrientation: true
            });
        } else {
            imageUpload();
        }
    };
    // 刪除照片
    self.deleteImage = function deleteImage(index) {
        self.imagesData.splice(index, 1);
        self.imagesPostData.splice(index, 1);
        self.ChangImage = true;
    };
    self.saveImage = function saveImage(_nAFDataObj){
        if(self.ChangImage){
            //全部刪掉
            
            patientFormImageService.DeleteImage(_nAFDataObj.Id).then((res) => {
                console.log("Sucess", res);
            },(res) => {
                console.log("Fail", res);
            });
            
            for(let i = 0,len = self.imagesPostData.length; i < len; i++){
                self.imagesPostData[i].Id = _nAFDataObj.Id;
                //console.log('self.imagesPostData.length[i]',self.imagesPostData[i])
                patientFormImageService.AddImage(self.imagesPostData[i]).then((res) => {
                    console.log("patientFormImageService AddImage Success", res);
                }, (res) => {        
                    console.log("patientFormImageService AddImage Fail", res);
                });
            };
        }
    }
    /*  add 資料整理 */
    function Add_Arrange_nAFDataobj() {
        if (self.Catheter_Outlet_Times == null || self.Catheter_Outlet_Times == "") {
            self.nAFDataObj.Catheter_Outlet_Times = 0;
        } else {
            self.nAFDataObj.Catheter_Outlet_Times = self.Catheter_Outlet_Times;
        }
        /* 轉換成陣列 */
        self.nAFDataObj.Catheter_Evaluate = SelectCheckBox_ToString(self.CatheterEvaluates); //導管出口評估
        self.nAFDataObj.Secretion_Volume = SelectCheckBox_ToString(self.SecretionVolume);//分泌物-量
        self.nAFDataObj.Secretion_Trait = SelectCheckBox_ToString(self.SecretionTrait);//分泌物-性狀
        self.nAFDataObj.Secretion_Color = SelectCheckBox_ToString(self.SecretionColor);//分泌物-顏色
        self.nAFDataObj.Description_Infection_Status = SelectCheckBox_ToString(self.DescriptionInfectionStatus);//分泌物-感染狀態描述
        //透析液評估-性質
        let tmpe_FEParray = self.FluidEvalProperties1.concat(self.FluidEvalProperties2)
        self.nAFDataObj.Fluid_Eval_Properties = SelectCheckBox_ToString(tmpe_FEParray);
        self.nAFDataObj.Fluid_Eval_Color = SelectCheckBox_ToString(self.FluidEvalColor);
        self.nAFDataObj.Edema_Eval_Site = SelectCheckBox_ToString(self.EdemaEvalSite);
        self.nAFDataObj.Respiratory_Status_Evaluate = SelectCheckBox_ToString(self.RespiratoryStatusEvaluate);
        self.nAFDataObj.Skin_Eval_Appearance = SelectCheckBox_ToString(self.SkinEvalAppearance);
        self.nAFDataObj.Skin_Eval_Color = SelectCheckBox_ToString(self.SkinEvalColor);
        self.nAFDataObj.Skin_Eval_Completeness = SelectCheckBox_ToString(self.SkinEvalCompleteness);//完整
        self.nAFDataObj.Skin_Eval_Damaged_Site = SelectCheckBox_ToString(self.SkinEvalDamagedSite);//受損部位   
        //腸胃導評估
        self.nAFDataObj.Gi_Eval_Appetite = SelectCheckBox_ToString(self.GiEvalAppetite);//食慾 
        self.nAFDataObj.Gi_Eval_Excretion = SelectCheckBox_ToString(self.GiEvalExcretion);//食慾
        //護理指導
        self.nAFDataObj.Self_Guid_Catheter = SelectCheckBox_ToString(self.SelfGuidCatheter);//護理指導-導管出口照護 
        self.nAFDataObj.Self_Guid_Diet = SelectCheckBox_ToString(self.SelfGuidDiet);//護理指導-飲食 
        self.nAFDataObj.Self_Guid_Dailylife = SelectCheckBox_ToString(self.SelfGuidDailylife);//護理指導-日常生活
        //透析記錄本評值
        self.nAFDataObj.Self_Guid_Record_Book_Eval = SelectCheckBox_ToString(self.SelfGuidRecordBookEval);//護理指導-日常生活 
        //程度
        //self.nAFDataObj.Edema_Eval_Degree = SelectCheckBox_ToString(self.EdemaEvalDegree);
        //指導對象
        self.nAFDataObj.Targetpersontype =SelectCheckBox_ToString(self.Targetpersontype);
        //指導方式
        self.nAFDataObj.Guideways =SelectCheckBox_ToString(self.Guideways);
        //評值結果
        self.nAFDataObj.Answers =SelectCheckBox_ToString(self.Answers);
        /* true => Y */
        self.nAFDataObj.Self_Guid_Catheter_Yn = self.Self_Guid_Catheter_Yn ? 'Y' : 'N';

        self.nAFDataObj.Self_Guid_Fluid_Check_Yn = self.Self_Guid_Fluid_Check_Yn ? 'Y' : 'N';

        //self.nAFDataObj.Self_Guid_Fluid_Heparin_Yn = self.Self_Guid_Fluid_Heparin_Yn;

        self.nAFDataObj.Self_Guid_Water_Ctrl_Yn = self.Self_Guid_Water_Ctrl_Yn ? 'Y' : 'N';

        self.nAFDataObj.Self_Guid_Diet_Yn = self.Self_Guid_Diet_Yn ? 'Y' : 'N';

        self.nAFDataObj.Self_Guid_Dailylife_Yn = self.Self_Guid_Dailylife_Yn ? 'Y' : 'N';

        //self.nAFDataObj.Self_Guid_Record_Book_Eval_Yn = self.Self_Guid_Record_Book_Eval_Yn ? 'Y' : 'N';
        //self.nAFDataObj.Self_Guid_Immediate_Treatment = self.Self_Guid_Immediate_Treatment ? 'Y' : 'N';
        //透析液加Heparin
        if(self.nAFDataObj.Self_Guid_Fluid_Heparin_Yn == 'Y'){
            let temparray = [self.Self_Guid_Fluid_Heparin,''];
                if(moment(new Date(self.Capd_Rder_Date)).format('YYYY-MM-DD') == '1970-01-01' || moment(new Date(self.Capd_Rder_Date)).format('YYYY-MM-DD') =='Invalid date'){
                    temparray[1] = '';
                }else{
                    temparray[1] = moment(new Date(self.Capd_Rder_Date)).format('YYYY-MM-DD');
                }
            self.nAFDataObj.Self_Guid_Fluid_Heparin =temparray.join('|');
        }else{
            self.nAFDataObj.Self_Guid_Fluid_Heparin ='';
        }
    }
    function Edit_load_nAFDataobj() {
        if(self.nAFDataObj.Self_Guid_Fluid_Heparin != null){
            let tempValue = self.nAFDataObj.Self_Guid_Fluid_Heparin.split('|');
            self.Self_Guid_Fluid_Heparin = tempValue[0];
            if(tempValue[1] != ""){
                self.Capd_Rder_Date = new Date(tempValue[1]);
            }else{
                self.Capd_Rder_Date =  null;
            }
        }
        //self.nAFDataObj.Self_Guid_Fluid_Heparin = 

        self.nAFDataObj.Capd_Rder_Date = new Date(self.nAFDataObj.Capd_Rder_Date);
        
        self.nAFDataObj.High_Risk_Fall_Eval_Date = self.nAFDataObj.High_Risk_Fall_Eval_Date == null ? null : new Date(self.nAFDataObj.High_Risk_Fall_Eval_Date);
        self.nAFDataObj.Capd_Rder_Date = new Date(self.nAFDataObj.Capd_Rder_Date);
        if (self.nAFDataObj.Catheter_Outlet_Times == 0 || _.isEmpty(self.nAFDataObj.Catheter_Outlet_Times) == false) {
            self.Catheter_Outlet_Times = null
        } else {
            self.Catheter_Outlet_Times = self.nAFDataObj.Catheter_Outlet_Times;
        }
        /* 轉換成陣列 */
        StringTo_SelectCheckBox(self.nAFDataObj.Catheter_Evaluate, self.CatheterEvaluates);
        StringTo_SelectCheckBox(self.nAFDataObj.Secretion_Volume, self.SecretionVolume);
        StringTo_SelectCheckBox(self.nAFDataObj.Secretion_Trait, self.SecretionTrait);
        StringTo_SelectCheckBox(self.nAFDataObj.Secretion_Color, self.SecretionColor);
        StringTo_SelectCheckBox(self.nAFDataObj.Description_Infection_Status, self.DescriptionInfectionStatus);
        StringTo_SelectCheckBox(self.nAFDataObj.Fluid_Eval_Properties, self.FluidEvalProperties1);
        StringTo_SelectCheckBox(self.nAFDataObj.Fluid_Eval_Properties, self.FluidEvalProperties2);
        StringTo_SelectCheckBox(self.nAFDataObj.Fluid_Eval_Color, self.FluidEvalColor);
        StringTo_SelectCheckBox(self.nAFDataObj.Edema_Eval_Site, self.EdemaEvalSite);
        StringTo_SelectCheckBox(self.nAFDataObj.Respiratory_Status_Evaluate, self.RespiratoryStatusEvaluate);
        StringTo_SelectCheckBox(self.nAFDataObj.Skin_Eval_Appearance, self.SkinEvalAppearance);
        StringTo_SelectCheckBox(self.nAFDataObj.Skin_Eval_Color, self.SkinEvalColor);
        StringTo_SelectCheckBox(self.nAFDataObj.Skin_Eval_Completeness, self.SkinEvalCompleteness);
        StringTo_SelectCheckBox(self.nAFDataObj.Skin_Eval_Damaged_Site, self.SkinEvalDamagedSite);
        StringTo_SelectCheckBox(self.nAFDataObj.Gi_Eval_Appetite, self.GiEvalAppetite);
        StringTo_SelectCheckBox(self.nAFDataObj.Gi_Eval_Excretion, self.GiEvalExcretion);
        StringTo_SelectCheckBox(self.nAFDataObj.Self_Guid_Catheter, self.SelfGuidCatheter);
        StringTo_SelectCheckBox(self.nAFDataObj.Self_Guid_Diet, self.SelfGuidDiet);
        StringTo_SelectCheckBox(self.nAFDataObj.Self_Guid_Dailylife, self.SelfGuidDailylife);
        StringTo_SelectCheckBox(self.nAFDataObj.Self_Guid_Record_Book_Eval, self.SelfGuidRecordBookEval);
        //StringTo_SelectCheckBox(self.nAFDataObj.Edema_Eval_Degree, self.EdemaEvalDegree);
        StringTo_SelectCheckBox(self.nAFDataObj.Targetpersontype,self.Targetpersontype);
        StringTo_SelectCheckBox(self.nAFDataObj.Guideways,self.Guideways);
        StringTo_SelectCheckBox(self.nAFDataObj.Answers,self.Answers);
        /* CheckBox 第一個選取後面反灰畫面*/
        let OneSelect_All_disabled_list = ['CatheterEvaluates', 'SecretionColor', 'RespiratoryStatusEvaluate', 'SkinEvalAppearance', 'GiEvalAppetite', 'GiEvalExcretion'];

        OneSelect_All_disabled_list.forEach(item => {
            self.OneSelect_All_disabled_View(item);
        })
        //self.Self_Guid_Fluid_Heparin_Yn = self.nAFDataObj.Self_Guid_Fluid_Heparin_Yn;
        // /* true => Y */
        self.Self_Guid_Catheter_Yn = self.nAFDataObj.Self_Guid_Catheter_Yn == 'Y' ? true : false;
        self.Self_Guid_Fluid_Check_Yn = self.nAFDataObj.Self_Guid_Fluid_Check_Yn == 'Y' ? true : false;
        self.Self_Guid_Water_Ctrl_Yn = self.nAFDataObj.Self_Guid_Water_Ctrl_Yn == 'Y' ? true : false;
        self.Self_Guid_Diet_Yn = self.nAFDataObj.Self_Guid_Diet_Yn == 'Y' ? true : false;
        self.Self_Guid_Dailylife_Yn = self.nAFDataObj.Self_Guid_Dailylife_Yn == 'Y' ? true : false;
        //self.Self_Guid_Record_Book_Eval_Yn = self.nAFDataObj.Self_Guid_Record_Book_Eval_Yn == 'Y' ? true : false;
        //self.Self_Guid_Immediate_Treatment = self.nAFDataObj.Self_Guid_Immediate_Treatment == 'Y' ? true : false;
        //Other
        self.CatheterEvaluates_Other = _.isEmpty(self.nAFDataObj.Catheter_Evaluate_Other) ? false : true;
        self.Secretion_Y_Other = _.isEmpty(self.nAFDataObj.Secretion_Y_Other) ? false : true;
        self.Secretion_Color_Other_Chk = _.isEmpty(self.nAFDataObj.Secretion_Color_Other) ? false : true;
        self.Description_Infection_Status_Othe_Chk = _.isEmpty(self.nAFDataObj.Description_Infection_Other) ? false : true;
        self.Fluid_Eval_Color_Other_Chk = _.isEmpty(self.nAFDataObj.Fluid_Eval_Color_Other) ? false : true;
        self.Skin_Eval_Complete_Other = _.isEmpty(self.nAFDataObj.Skin_Eval_Complete_Other) ? false : true;
        self.Self_Guid_Other_Yn = _.isEmpty(self.nAFDataObj.Self_Guid_Other) ? false : true;
        self.Targetpersontype_Chk = _.isEmpty(self.nAFDataObj.Targetpersontype_Other) ? false : true;
        //讀取跌倒紀錄
        highRiskFallerService.getListByPatientID(self.patientId, "", "PD").then((res) => {
            let hRfList = res.data
            if(res.data.length > 0){
                let hrf_filter = hRfList.filter(el=>{
                    return el.Status !="Deleted" &&  moment(new Date(el.Record_Date)).format('YYYY-MM-DD') == moment(new Date(self.nAFDataObj.Record_Date)).format('YYYY-MM-DD') && el.Sys_Type =='PD';
                })
                hrf_filter = $filter('orderBy')(hrf_filter, 'Record_Date',true);
                console.log('hrf_filter',hrf_filter)
                //Total,Record_Date
                if(hrf_filter.length > 0){
                    let hRf = hrf_filter[hrf_filter.length - 1];
                    
                    self.nAFDataObj.High_Risk_Fall_Eval_Score = hRf.Total;
                    self.nAFDataObj.High_Risk_Fall_Eval_Date = new Date(hRf.Record_Date);

                    if(hRf.Total >= 3 || hRf.Have_Fallen_Before =='Y'){
                        if(_.isEmpty(self.nAFDataObj.Nursing_Records)){
                            self.nAFDataObj.Nursing_Records = "給予預防跌倒的護理指導";
                        }else{
                            if(self.nAFDataObj.Nursing_Records.indexOf('給予預防跌倒的護理指導') == -1){
                                self.nAFDataObj.Nursing_Records += "給予預防跌倒的護理指導";
                            }
                        }
                    }
                }else{
                    self.nAFDataObj.High_Risk_Fall_Eval_Score = "";
                    self.nAFDataObj.High_Risk_Fall_Eval_Date = ""
                }
            }
        }, (res) => {
            console.log("highRiskFallerService getList Fail", res);
        });


    }
    function Edit_load_PostVitalSignlist(){
        console.log('into Edit_load_PostVitalSignlist');
        PatientFromColumnService.getAllByFromId(self.nAFDataObj.Id).then((res) => {
            let postVitalSignKeyValue = res.data;
            ["0","1","2"].forEach(index =>{
               let _filterlist =  postVitalSignKeyValue.filter(pop => {
                   //pop.Status = "Deleted";
                    return pop.Status != "Deleted" && pop.Record_Index == index;
                });
                //整理
                if(_filterlist.length > 0){
                    let t = angular.copy(vitalSignObj)
                    for(let i = 0,len = _filterlist.length; i < len; i++){
                        let keyval = _filterlist[i];
                        if(keyval.Record_Name == "RecordTime"){
                            t[keyval.Record_Name] =new Date(keyval.Record_Value);
                        }else{
                            t[keyval.Record_Name] = keyval.Record_Value;
                        }
                    }
                    self.nAFDataObj.PostVitalSign.push(t);
                }
            });

            self.temp_PostVitalSign = angular.copy(postVitalSignKeyValue);//複製給刪除用的要註記掉
            
        }, (res) => {
            console.log("PostVitalSignListfail", res);
        }).then(() =>{
            if(self.nAFDataObj.PostVitalSign.length == 0 ){
                self.addPostVitalSign();
            }
        });

    }
    function Edit_load_FormImage(){
        patientFormImageService.getListByFormId(self.nAFDataObj.Id).then((res) => {
            res.data.forEach(d => {
                let photo ={
                    Image:"data:image/jpg;base64," + d.Img_O
                }
                self.imagesData.push(photo);
                self.O_imagesPostData.push(d);
                self.imagesPostData.push({Id:d.Form_Id,Image: d.Img_O});   
            });

        }, (res) => {
            console.log("patientFormImageService getList Fail", res);
        });

    }
    self.LoadData = function () {
        self.Calculation_Net_Body_Weight();
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));        
        if (self.nAFDataObj.isCreate == true) {
            self.Record_Date_disabled = false;
            self.nAFDataObj.Record_Date = toDay;
            //取最後一筆跌倒紀錄
            //取得清單
            highRiskFallerService.getListByPatientID(self.patientId, "", "PD").then((res) => {
                let hRfList = $filter('orderBy')(res.data, 'Record_Date',true);
                if(res.data.length > 0){
                    let hrf_filter = hRfList.filter(el=>{
                        return el.Status !="Deleted" &&  moment(new Date(el.Record_Date)).format('YYYY-MM-DD') == moment(new Date(self.nAFDataObj.Record_Date)).format('YYYY-MM-DD') && el.Sys_Type =='PD';
                    })
                    //Total,Record_Date
                    if(hrf_filter.length > 0){
                        let hRf = hrf_filter[0];
                        self.nAFDataObj.High_Risk_Fall_Eval_Score = hRf.Total;
                        self.nAFDataObj.High_Risk_Fall_Eval_Date = new Date(hRf.Record_Date);

                        if(_.isEmpty(self.nAFDataObj.Nursing_Records)){
                            self.nAFDataObj.Nursing_Records = "給予預防跌倒的護理指導";
                        }else{
                            if(self.nAFDataObj.Nursing_Records.indexOf('給予預防跌倒的護理指導') == -1){
                                self.nAFDataObj.Nursing_Records += "給予預防跌倒的護理指導";
                            }
                        }
                    }
                }
            }, (res) => {        
                console.log("highRiskFallerService getList Fail", res);
            });
        }
        //編輯的時候
        if (nAFItem.isCreate == false) {
                        
            Edit_load_nAFDataobj()
            self.nAFDataObj.PostVitalSign = [];
            Edit_load_PostVitalSignlist();
            Edit_load_FormImage();
            if(nAFItem.isCopy){
                self.nAFDataObj.Id = "";
                self.nAFDataObj.Record_Date = toDay;
                self.nAFDataObj.ModifiedUserId = "";
                self.nAFDataObj.ModifiedUserName = "";
                self.nAFDataObj.ModifiedTime = null;
                self.nAFDataObj.CreatedUserId = "";
                self.nAFDataObj.CreatedUserName = "";
                self.nAFDataObj.Emr_Modify_Time_Nurse = null;
                self.nAFDataObj.Emr_Modify_Userid_Nurse = "";
            }else{
                self.Record_Date_disabled = true;
            }

        }
    }

    self.LoadData();


    //新增、修改、刪除
    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    function chkeModelData(){
        //判斷日期
        let d = moment(self.nAFDataObj.Record_Date).format('YYYY-MM-DD HH:mm:ss');
        let date = moment(d, 'YYYY-MM-DD HH:mm:ss');
        
        if(!date.isValid()){
            showMessage("記錄日期格式錯誤，請檢查。",500);
            return false ;
        }
        return true;

    }

    self.exportEMR = function exportEMR(event,EncodingType){
        if (event) {
            event.currentTarget.disabled = true;
        }
        let postModel ={
            "FormId": self.nAFDataObj.Id,
            "Emr_Modify_Userid": CurrentUser().UserId,
            "EncodingType": EncodingType
        }
        nursingAssessmentService.ExportEMR(postModel).then((res) => {
            console.log("exportEMR sucess", res);

            let serverApiUrl = SettingService.getServerUrl();
            console.log("url",serverApiUrl);
            console.log("腹膜透析紀錄-XML",
            `${serverApiUrl}/api/Nurse_Assessment_Record_CAPD/GetDs_Content?FormId=${self.nAFDataObj.Id}`);
            console.log("腹膜透析紀錄-PDF",
            `${serverApiUrl}/api/Nurse_Assessment_Record_CAPD/DownloadPdf_File?FormId=${self.nAFDataObj.Id}`);
            showMessage($translate('nursingAssessmentForm.dialog.exportEMRSuccess'));
            
            event.currentTarget.disabled = false;
            //更新 Nurse_Assessment_Record_CAPD
            self.nAFDataObj.Emr_Modify_Time_Nurse = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            self.nAFDataObj.Emr_Modify_Userid_Nurse = CurrentUser().UserName;
            nursingAssessmentService.put(self.nAFDataObj).then((res) => {
                console.log('Emr_Modify_Time_Nurse update sucess!',self.nAFDataObj.Emr_Modify_Time_Nurse)
            }), (res) => {
                event.currentTarget.disabled = false;
            };
        }, (res) => {
            console.log("exportEMR fail", res);
            showMessage($translate('nursingAssessmentForm.dialog.exportEMRFail'));
            event.currentTarget.disabled = false;
        });

    }
    // save
    self.ok = function ok() {
        //patient 基本資料
        self.nAFDataObj.Patientid = self.currentPatient.Id;
        self.nAFDataObj.Patient_Name = self.currentPatient.Name;
        self.nAFDataObj.Medicalid = self.currentPatient.MedicalId;
        self.nAFDataObj.Hospitalid = self.currentPatient.HospitalId;        
        self.nAFDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;

        let DataChkFlg = chkeModelData();
        if(!DataChkFlg){
            return ;
        }
        /*  資料整理 */
        Add_Arrange_nAFDataobj();
        if (self.nAFDataObj.isCreate == true || self.nAFDataObj.isCopy == true) {

            //建立人員(取現在登入的人)
            self.nAFDataObj.CreatedUserId = CurrentUser().UserId;
            self.nAFDataObj.CreatedUserName = CurrentUser().UserName;
            //建立日期
            //self.nAFDataObj.Record_Date = moment(new Date(self.nAFDataObj.Record_Date)).format('YYYY-MM-DD HH:mm:ss');
            nursingAssessmentService.post(self.nAFDataObj).then((res) => {
                console.log("odLRData createOne success", res);
                //儲存Image....
                self.saveImage(res.data);
                //新增身理量測資料
                let PostVitalSignList =  Arrange_PostVitalSignList(res.data.Id);
                for(let i = 0,len = PostVitalSignList.length; i < len; i++){
                    PatientFromColumnService.post(PostVitalSignList[i]).then((res) => {
                        console.log("PostVitalSignList success", res);
                    }, (res) => {
                        console.log("PostVitalSignListfail", res);
                    })
                }
                showMessage($translate('orderLR.dialog.createSuccess'));
            }, (res) => {
                console.log("odLRData createOne fail", res);
                showMessage($translate('orderLR.dialog.createFail'));
            });
        }
        if (self.nAFDataObj.isCreate == false) {
            //建立人員(取現在登入的人)
            self.nAFDataObj.ModifiedUserId = CurrentUser().UserId;
            self.nAFDataObj.ModifiedUserName = CurrentUser().UserName;
            self.nAFDataObj.ModifiedTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            nursingAssessmentService.put(self.nAFDataObj).then((res) => {
                //儲存Image....
                self.saveImage(self.nAFDataObj);
                //先註記刪除全部
                for(let i = 0,len = self.temp_PostVitalSign.length; i < len; i++){
                    self.temp_PostVitalSign[i].Status = "Deleted"
                    PatientFromColumnService.put(self.temp_PostVitalSign[i]).then((res) => {
                        //console.log("PostVitalSignList success", res);
                    }, (res) => {
                       // console.log("PostVitalSignListfail", res);
                    })
                }
                //再新增進去
                let PostVitalSignList =  Arrange_PostVitalSignList(res.data.Id);
                for(let i = 0,len = PostVitalSignList.length; i < len; i++){
                    
                    PatientFromColumnService.post(PostVitalSignList[i]).then((res) => {
                        //console.log("PostVitalSignList success", res);
                    }, (res) => {
                        //console.log("PostVitalSignListfail", res);
                    })
                }
                showMessage($translate('nursingAssessmentForm.dialog.editSuccess'));
            }, (res) => {
                console.log("odLRData createOne fail", res);
                showMessage($translate('nursingAssessmentForm.dialog.editFail'));
            });
        }
        
        $mdDialog.hide();
    };

    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        //$mdSidenav('rightPhrase').close();
    };

}

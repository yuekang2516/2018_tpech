import './catheterInfect.less';
angular
    .module('app')
    .controller('cathListEditController', cathListEditController);

cathListEditController.$inject = [
    '$stateParams','$mdDialog', 'showMessage', 'SettingService', '$filter', 'cathItem',
    'cathPatientId', '$mdMedia', 'catheterInfectService', 'PatientService', '$rootScope', '$state', 'allExecutionRecordService', 'labexamService', '$scope', '$timeout', 'tpechService'];
function cathListEditController(
    $stateParams,$mdDialog, showMessage, SettingService, $filter, cathItem,
    cathPatientId, $mdMedia, catheterInfectService, PatientService, $rootScope, $state, allExecutionRecordService, labexamService, $scope, $timeout, tpechService) {

    console.log("catheterInfect-cathListEdit Edit/Create Dialog", cathItem);
    const self = this;
    const $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();

    self.cathItem = angular.copy(cathItem);
    self.Old_germAry = [];
    self.germAry = [];
    self.isCreate = cathItem.Memo === "CREATE";
    // 感染記錄 form / 感染菌種記錄 form
    self.formType = "catheter";

    // 症狀-其他
    self.symptonCheck = [
        { Text: "其他", Check: false, Type: "CIFCheck" }
    ];
    // 症狀-導管出口評估
    self.CatheterOutletEvaluateCheck = [
        { Text: "正常", Check: false, Type: "Coe", Disabled: false },
        { Text: "結痂", Check: false, Type: "Coe", Disabled: false },
        { Text: "出血", Check: false, Type: "Coe", Disabled: false },
        { Text: "息肉", Check: false, Type: "Coe", Disabled: false },
        { Text: "感染", Check: false, Type: "Coe", Disabled: false },
        { Text: "其他", Check: false, Type: "CoeOther" }//其他欄位標註
    ];
    // 症狀-分泌物、性狀
    self.SecretionTraitCheck = [
        { Text: "量多", Check: false, Type: "St" },
        { Text: "量少", Check: false, Type: "St" },
        { Text: "膿性", Check: false, Type: "St" },
        { Text: "漿性", Check: false, Type: "St" },
        { Text: "其他", Check: false, Type: "StOther" }//其他欄位標註
    ];
    // 症狀-顏色
    self.SecretionColorCheck = [
        { Text: "無色", Check: false, Type: "Color", Disabled: false },
        { Text: "白色", Check: false, Type: "Color", Disabled: false },
        { Text: "黃色", Check: false, Type: "Color", Disabled: false },
        { Text: "紅色", Check: false, Type: "Color", Disabled: false },
        { Text: "褐色", Check: false, Type: "Color", Disabled: false },
        { Text: "其他", Check: false, Type: "ColorOther" }//其他欄位標註
    ];
    // 症狀-感染狀態描述
    self.DescriptionInfectionStatusCheck = [
        { Text: "紅", Check: false, Type: "Dis" },
        { Text: "腫", Check: false, Type: "Dis" },
        { Text: "熱", Check: false, Type: "Dis" },
        { Text: "痛", Check: false, Type: "Dis" },
        { Text: "化膿", Check: false, Type: "Dis" },
        { Text: "Cuff脫出", Check: false, Type: "Dis" },
        { Text: "隧道炎", Check: false, Type: "Dis" },
        { Text: "其他", Check: false, Type: "DisOther" }//其他欄位標註
    ];
    // 發生原因
    self.occurrenceCheck = [
        { Text: "未洗手/洗手不確實", Check: false },
        { Text: "未戴口罩", Check: false },
        { Text: "未用腹帶固定", Check: false },
        { Text: "搔抓出口污染", Check: false },
        { Text: "不慎拉扯受傷", Check: false },
        { Text: "換藥技術不正確", Check: false },
        { Text: "出口潮濕未立即換藥", Check: false },
        { Text: "未每日更換生理食鹽水", Check: false },
        { Text: "免疫力降低 / 伺機性感染", Check: false },
        { Text: "短期外傭未確實每日換藥", Check: false },
        { Text: "無特殊原因", Check: false },
        { Text: "其他", Check: false, Type: "occOther" }
    ];

    // 護理措施
    self.nursingMeasureCheck = [
        { Text: "換液技術再回覆示教", Check: false },
        { Text: "協商家屬介入協助", Check: false },
        { Text: "加強日常生活自我照顧指導", Check: false },
        { Text: "出口換藥技術再指導", Check: false },
        { Text: "其他", Check: false, Type: "NmOther" }
    ];

    // 治療結果//轉血液透析
    self.treatmentResultCheck = [
        { Text: "治療痊癒", Check: false },
        { Text: "拔管", Check: false },
        { Text: "重新植管", Check: false },
        { Text: "其他", Check: false, Type: "TrOther" }
    ];
    // 評值結果
    self.evaluationResultCheck = [
        { Text: "換液技術正確", Check: false },
        { Text: "改由家屬換液", Check: false },
        { Text: "可說出自我照顧注意事項至少5項", Check: false },
        { Text: "無法配合", Check: false },
        { Text: "其他", Check: false, Type: "ErOther" }
    ];

    self.checkTheBox = function (blockName, index) {
        switch (blockName) {
            case "CatheterOutletEvaluate":
                self.CatheterOutletEvaluateCheck[index].Check = !self.CatheterOutletEvaluateCheck[index].Check;
                //判斷正常
                if (self.CatheterOutletEvaluateCheck[0].Check) {
                    for (let i = 1; i < (self.CatheterOutletEvaluateCheck.length - 1); i++) {
                        self.CatheterOutletEvaluateCheck[i].Disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.CatheterOutletEvaluateCheck.length - 1); i++) {
                        self.CatheterOutletEvaluateCheck[i].Disabled = false;
                    }
                }
                break;
            case "SecretionTrait":
                self.SecretionTraitCheck[index].Check = !self.SecretionTraitCheck[index].Check;
                break;
            case "SecretionColor":
                self.SecretionColorCheck[index].Check = !self.SecretionColorCheck[index].Check;
                //判斷無色
                if (self.SecretionColorCheck[0].Check) {
                    for (let i = 1; i < (self.SecretionColorCheck.length - 1); i++) {
                        self.SecretionColorCheck[i].Disabled = true;
                    }
                } else {
                    for (let i = 1; i < (self.SecretionColorCheck.length - 1); i++) {
                        self.SecretionColorCheck[i].Disabled = false;
                    }
                }
                break;
            case "DescriptionInfectionStatus":
                self.DescriptionInfectionStatusCheck[index].Check = !self.DescriptionInfectionStatusCheck[index].Check;
                break;
            case "occurrence":
                self.occurrenceCheck[index].Check = !self.occurrenceCheck[index].Check;
                break;
            case "nursingMeasure":
                self.nursingMeasureCheck[index].Check = !self.nursingMeasureCheck[index].Check;
                break;
            case "treatmentResult":
                self.treatmentResultCheck[index].Check = !self.treatmentResultCheck[index].Check;
                break;
            case "evaluationResult":
                self.evaluationResultCheck[index].Check = !self.evaluationResultCheck[index].Check;
                break;
        }
    };

    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    // save
    self.ok = function ok(event) {
        if (event) {
            event.currentTarget.disabled = true;
        }

        let ct = parseInt(self.cathItem.Times);
        
        if(_.isEmpty(String(self.cathItem.Times)) ||  self.cathItem.Times == 0 ||
            isNaN(ct)
        ){
            showMessage('感染記錄次數，請輸入數字。',800);
            event.currentTarget.disabled = false;
            return;
        }
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        // 整理畫面資料
        self.sortoutData("CatheterOutletEvaluate");
        self.sortoutData("SecretionTrait");
        self.sortoutData("SecretionColor");
        self.sortoutData("DescriptionInfectionStatus");
        self.sortoutData("occurrence");
        self.sortoutData("nursingMeasure");
        self.sortoutData("treatmentResult");
        self.sortoutData("evaluationResult");
        self.cathItem.Status = "Normal";
        self.cathItem.PatientId = cathPatientId;
        self.cathItem.HospitalId = self.currentHospital.Id;
        self.cathItem.Patient_Name = self.currentPatient.Name;
        self.cathItem.Medicalid = self.currentPatient.MedicalId;
        self.cathItem.Pat_Seq = self.currentPatient.PAT_SEQ;
        if (self.isCreate) {
            
            console.log("CreateObj", self.cathItem);
            // if (self.isEdit) {
            //     catheterInfectService.put(self.cathItem).then((res) => {
            //         console.log("catheterInfectService update success", res);
            //         showMessage($translate('catheterInfect.dialog.saveSuccess'));
            //         self.isEdit = false;
            //         $rootScope.$emit("catheterInfectListRefreshEvent", "");
            //         $mdDialog.hide();

            //     }, (res) => {
            //         console.log("catheterInfectService update fail", res);
            //         showMessage($translate('catheterInfect.dialog.saveFail'));
            //     });
            // } else {
                self.cathItem.CreatedTime = toDay;
                self.cathItem.CreatedUserId = SettingService.getCurrentUser().Id;
                self.cathItem.CreatedUserName = SettingService.getCurrentUser().Name;
    
                catheterInfectService.post(self.cathItem).then((res) => {
                    console.log("catheterInfectService createOne success", res);
                    let promises = [];

                    self.germAry.forEach( e =>{
                        e.Infection_Record_Id = res.data.Id;
                        e.Infection_Category ="CATHETER"
                        promises.push(
                            catheterInfectService.postGerm(e).then((res) => {
                                //console.log("treatRecord Detail createOne success", res);
                            }, (res) => {
                                //console.log("treatRecord Detail createOne fail", res);
                                showMessage($translate('treatRecord.dialog.createDetailFail'));
                            })
                        );
                    });
                    Promise.all(promises).then(() => {});


                    showMessage($translate('catheterInfect.dialog.createSuccess'));
                    $rootScope.$emit("catheterInfectListRefreshEvent", "");
                    $mdDialog.hide();

                }, (res) => {
                    console.log("catheterInfectService createOne fail", res);
                    showMessage($translate('catheterInfect.dialog.createFail'));
                });
            //}
        } else {
            self.cathItem.ModifiedTime = toDay;
            self.cathItem.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.cathItem.ModifiedUserName = SettingService.getCurrentUser().Name;
            console.log("ModifyObj", self.cathItem);
            catheterInfectService.put(self.cathItem).then((res) => {
                console.log("catheterInfectService update success", res);
                let promises = [];
                //刪除
                console.log('Old_germAry',self.Old_germAry)
                self.Old_germAry.forEach( e =>{
                    e.Infection_Record_Id = res.data.Id;
                    e.Status = "Deleted";
                    promises.push(
                        catheterInfectService.putGerm(e).then((res) => {
                            //console.log("treatRecord Detail createOne success", res);
                        }, (res) => {
                            //console.log("treatRecord Detail createOne fail", res);
                            showMessage($translate('treatRecord.dialog.createDetailFail'));
                        })
                    );
                });
                Promise.all(promises).then(() => {});
                promises = [];
                //新增
                self.germAry.forEach( e =>{
                    e.Infection_Record_Id = res.data.Id;
                    e.Infection_Category ="CATHETER"
                    promises.push(
                        catheterInfectService.postGerm(e).then((res) => {
                            //console.log("treatRecord Detail createOne success", res);
                        }, (res) => {
                            //console.log("treatRecord Detail createOne fail", res);
                            showMessage($translate('treatRecord.dialog.createDetailFail'));
                        })
                    );
                });
                Promise.all(promises).then(() => {});
                showMessage($translate('catheterInfect.dialog.editSuccess'));
                $rootScope.$emit("catheterInfectListRefreshEvent", "");
                $mdDialog.hide();

            }, (res) => {
                console.log("catheterInfectService update fail", res);
                showMessage($translate('catheterInfect.dialog.editSuccess'));
            });
        }

    };

    // 整理 資料庫資料 => 畫面上 Checkbox
    self.sortinData = function (blockName) {
        let tmpAry = [];

        switch (blockName) {
            case "CatheterOutletEvaluate":
                if (self.cathItem.Catheter_Outlet_Evaluate !== null && self.cathItem.Catheter_Outlet_Evaluate !== "") {
                    tmpAry = self.cathItem.Catheter_Outlet_Evaluate.split(",");

                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.CatheterOutletEvaluateCheck.length; i++) {
                            let si = self.CatheterOutletEvaluateCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.CatheterOutletEvaluateCheck[i] = si;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 6) === "INFECT") {
                            let infectAry = tmpAry[tmpItem].split("_");
                            self.CatheterOutletTimes = infectAry[1];

                            let si = self.CatheterOutletEvaluateCheck[self.CatheterOutletEvaluateCheck.length - 2];
                            si.Check = true;
                            self.CatheterOutletEvaluateCheck[self.CatheterOutletEvaluateCheck.length - 2] = si;
                        }
                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.CatheterOutletEvaluateCheckOther = otherAry[1];

                            let si = self.CatheterOutletEvaluateCheck[self.CatheterOutletEvaluateCheck.length - 1];
                            si.Check = true;
                            self.CatheterOutletEvaluateCheck[self.CatheterOutletEvaluateCheck.length - 1] = si;
                        }
                    }
                    break;
                }
            case "SecretionTrait":
                if (self.cathItem.Secretion_Trait !== null && self.cathItem.Secretion_Trait !== "") {
                    self.SecretionTraitRadio = "Y";
                    tmpAry = self.cathItem.Secretion_Trait.split(",");

                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.SecretionTraitCheck.length; i++) {
                            let si = self.SecretionTraitCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.SecretionTraitCheck[i] = si;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.SecretionTraitCheckOther = otherAry[1];

                            let si = self.SecretionTraitCheck[self.SecretionTraitCheck.length - 1];
                            si.Check = true;
                            self.SecretionTraitCheck[self.SecretionTraitCheck.length - 1] = si;
                        }
                    }
                } else {
                    self.SecretionTraitRadio = "N";
                }
                break;
            case "SecretionColor":
                if (self.cathItem.Secretion_Color !== null && self.cathItem.Secretion_Color !== "") {
                    tmpAry = self.cathItem.Secretion_Color.split(",");
        
                    //症狀-顏色
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.SecretionColorCheck.length; i++) {
                            let si = self.SecretionColorCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.SecretionColorCheck[i] = si;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.SecretionColorCheckOther = otherAry[1];
                            let si = self.SecretionColorCheck[self.SecretionColorCheck.length - 1];
                            
                            si.Check = true;
                            self.SecretionColorCheck[self.SecretionColorCheck.length - 1] = si;
                        }
                    }
                    break;
                }
            case "DescriptionInfectionStatus":
                if (self.cathItem.Description_Infection_Status !== null && self.cathItem.Description_Infection_Status !== "") {
                    tmpAry = self.cathItem.Description_Infection_Status.split(",");
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.DescriptionInfectionStatusCheck.length; i++) {
                            let si = self.DescriptionInfectionStatusCheck[i];
                            if (tmpAry[tmpItem] === si.Text) {
                                si.Check = true;
                                self.DescriptionInfectionStatusCheck[i] = si;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.DescriptionInfectionStatusCheckOther = otherAry[1];

                            let si = self.DescriptionInfectionStatusCheck[self.DescriptionInfectionStatusCheck.length - 1];
                            si.Check = true;
                            self.DescriptionInfectionStatusCheck[self.DescriptionInfectionStatusCheck.length - 1] = si;
                        }
                    }
                    break;
                }
            case "occurrence":
                if (self.cathItem.Occurrence !== null && self.cathItem.Occurrence !== "") {
                    tmpAry = self.cathItem.Occurrence.split(",");
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.occurrenceCheck.length; i++) {
                            let oi = self.occurrenceCheck[i];
                            if (tmpAry[tmpItem] === oi.Text) {
                                oi.Check = true;
                                self.occurrenceCheck[i] = oi;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.occurrenceCheckOther = otherAry[1];

                            let oi = self.occurrenceCheck[self.occurrenceCheck.length - 1];
                            oi.Check = true;
                            self.occurrenceCheck[self.occurrenceCheck.length - 1] = oi;
                        }
                    }
                    break;
                }
            case "nursingMeasure":
                if (self.cathItem.Nursing_Measures !== null && self.cathItem.Nursing_Measures !== "") {
                    tmpAry = self.cathItem.Nursing_Measures.split(",");
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.nursingMeasureCheck.length; i++) {
                            let ni = self.nursingMeasureCheck[i];
                            if (tmpAry[tmpItem] === ni.Text) {
                                ni.Check = true;
                                self.nursingMeasureCheck[i] = ni;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.nursingMeasureCheckOther = otherAry[1];

                            let ni = self.nursingMeasureCheck[self.nursingMeasureCheck.length - 1];
                            ni.Check = true;
                            self.nursingMeasureCheck[self.nursingMeasureCheck.length - 1] = ni;
                        }
                    }
                    break;
                }
            case "treatmentResult":
                if (self.cathItem.Treatment_Result !== null && self.cathItem.Treatment_Result !== "") {
                    tmpAry = self.cathItem.Treatment_Result.split(",");
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.treatmentResultCheck.length; i++) {
                            let ti = self.treatmentResultCheck[i];
                            if (tmpAry[tmpItem] === ti.Text) {
                                ti.Check = true;
                                self.treatmentResultCheck[i] = ti;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.treatmentResultCheckOther = otherAry[1];

                            let ti = self.treatmentResultCheck[self.treatmentResultCheck.length - 1];
                            ti.Check = true;
                            self.treatmentResultCheck[self.treatmentResultCheck.length - 1] = ti;
                        }
                    }
                    break;
                }
            case "evaluationResult":
                if (self.cathItem.Evaluation_Result !== null && self.cathItem.Evaluation_Result !== "") {
                    tmpAry = self.cathItem.Evaluation_Result.split(",");
                    for (let tmpItem in tmpAry) {
                        for (let i = 0; i < self.evaluationResultCheck.length; i++) {
                            let ei = self.evaluationResultCheck[i];
                            if (tmpAry[tmpItem] === ei.Text) {
                                ei.Check = true;
                                self.evaluationResultCheck[i] = ei;
                                break;
                            }
                        }

                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let otherAry = tmpAry[tmpItem].split("_");
                            self.evaluationResultCheckOther = otherAry[1];

                            let ei = self.evaluationResultCheck[self.evaluationResultCheck.length - 1];
                            ei.Check = true;
                            self.evaluationResultCheck[self.evaluationResultCheck.length - 1] = ei;
                        }
                    }
                    break;
                }
        }
    };

    // ok->整理 畫面上 Checkbox => 資料庫資料
    self.sortoutData = function (blockName) {
        let tmpStr = "";
        let tmpCnt = "";
        switch (blockName) {
            //症狀-導管出口評估
            case "CatheterOutletEvaluate":
                // 症狀
                tmpStr = "";
                for (let si in self.CatheterOutletEvaluateCheck) {
                    if (self.CatheterOutletEvaluateCheck[si].Check) {
                        if (self.CatheterOutletEvaluateCheck[si].Text === "其他") {
                            tmpStr += "OTHER_" + self.CatheterOutletEvaluateCheckOther + ",";
                        } else if (self.CatheterOutletEvaluateCheck[si].Text === "感染") {
                            tmpStr += "INFECT_" + self.CatheterOutletTimes + ",";
                        } else {
                            tmpStr += self.CatheterOutletEvaluateCheck[si].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Catheter_Outlet_Evaluate = tmpStr;
                break;
            case "SecretionTrait":
                if (self.SecretionTraitRadio === "Y") {
                    // 症狀
                    tmpStr = "";
                    for (let si in self.SecretionTraitCheck) {
                        if (self.SecretionTraitCheck[si].Check) {
                            if (self.SecretionTraitCheck[si].Text === "其他") {
                                tmpStr += "OTHER_" + self.SecretionTraitCheckOther + ",";
                            } else {
                                tmpStr += self.SecretionTraitCheck[si].Text + ",";
                            }
                        }
                    }
                    tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                    self.cathItem.Secretion_Trait = tmpStr;
                } else {
                    self.cathItem.Secretion_Trait = "";
                }
                break;
            case "SecretionColor":
                // 症狀
                tmpStr = "";
                for (let si in self.SecretionColorCheck) {
                    if (self.SecretionColorCheck[si].Check) {
                        if (self.SecretionColorCheck[si].Text === "其他") {
                            tmpStr += "OTHER_" + self.SecretionColorCheckOther + ",";
                        } else {
                            tmpStr += self.SecretionColorCheck[si].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Secretion_Color = tmpStr;
                break;
            case "DescriptionInfectionStatus":
                // 症狀
                tmpStr = "";
                for (let si in self.DescriptionInfectionStatusCheck) {
                    if (self.DescriptionInfectionStatusCheck[si].Check) {
                        if (self.DescriptionInfectionStatusCheck[si].Text === "其他") {
                            tmpStr += "OTHER_" + self.DescriptionInfectionStatusCheckOther + ",";
                        } else {
                            tmpStr += self.DescriptionInfectionStatusCheck[si].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Description_Infection_Status = tmpStr;
                break;
            case "occurrence":
                // 發生原因
                tmpStr = "";
                for (let oi in self.occurrenceCheck) {
                    if (self.occurrenceCheck[oi].Check) {
                        if (self.occurrenceCheck[oi].Text === "其他") {
                            tmpStr += "OTHER_" + self.occurrenceCheckOther + ",";
                        } else {
                            tmpStr += self.occurrenceCheck[oi].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Occurrence = tmpStr;
                break;
            case "nursingMeasure":
                // 護理措施
                tmpStr = "";
                for (let ni in self.nursingMeasureCheck) {
                    if (self.nursingMeasureCheck[ni].Check) {
                        if (self.nursingMeasureCheck[ni].Text === "其他") {
                            tmpStr += "OTHER_" + self.nursingMeasureCheckOther + ",";
                        } else {
                            tmpStr += self.nursingMeasureCheck[ni].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Nursing_Measures = tmpStr;
                break;
            case "treatmentResult":
                // 治療結果
                tmpStr = "";
                for (let ti in self.treatmentResultCheck) {
                    if (self.treatmentResultCheck[ti].Check) {
                        if (self.treatmentResultCheck[ti].Text === "其他") {
                            tmpStr += "OTHER_" + self.treatmentResultCheckOther + ",";
                        } else {
                            tmpStr += self.treatmentResultCheck[ti].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Treatment_Result = tmpStr;
                break;
            case "evaluationResult":
                // 評值結果
                tmpStr = "";
                for (let ei in self.evaluationResultCheck) {
                    if (self.evaluationResultCheck[ei].Check) {
                        if (self.evaluationResultCheck[ei].Text === "其他") {
                            tmpStr += "OTHER_" + self.evaluationResultCheckOther + ",";
                        } else {
                            tmpStr += self.evaluationResultCheck[ei].Text + ",";
                        }
                    }
                }
                tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                self.cathItem.Evaluation_Result = tmpStr;
                break;
        }

    };

    // 開啟治療記錄編輯 Dialog
    self.openEditDialog = function (cathDetailItem,index) {
        // self.isUpdate = true;
        // self.isUpdateCreate = false;
        console.log("openEditDialog", cathDetailItem);

        //取第幾個index
        self.petDataIndex = index
        self.petDataObj = angular.copy(cathDetailItem);

        //self.petDataObj = cathDetailItem;
        //console.log("petDataObj--", self.petDataObj);

        self.isCreateGerm = false;
        self.formType = "germ";
        self.initialGermUI();

        //alert(self.petDataObj[0]);
        //update修改改到dialog內
        // $mdDialog.show({
        //     controller: 'cathDetailEditController',
        //     template: dialog,
        //     locals: {
        //         cathDetailItem: cathDetailItem,
        //         cathPatientId: cathPatientId
        //     },
        //     parent: angular.element(document.body),
        //     clickOutsideToClose: true,
        //     fullscreen: $mdMedia('xs'),
        //     controllerAs: '$ctrl'
        // }).then((result) => {

        // });
        //update修改改到dialog內
    };

    self.calculateDays = function (treatItem) {
        let days = 0;

        let firstStr = moment(treatItem.Startdate).format("YYYY-MM-DD");
        let nowStr = moment(treatItem.Recorddate).format("YYYY-MM-DD");

        let firstLong = (new Date(firstStr + " 00:00:00")).valueOf();
        let nowLong = (new Date(nowStr + " 00:00:00")).valueOf();
        let diffLong = nowLong - firstLong;
        days = Math.ceil(diffLong / (24 * 60 * 60 * 1000));

        return days + 1;
    };

    self.initialUI = function () {
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });
        if (self.isCreate) {
            // 借用的欄位，使用完後，交還
            self.cathItem.Memo = "";

            //畫面上 Checkbox多其他輸入
            self.CatheterOutletEvaluateCheckOther = "";
            self.SecretionTraitCheckOther = "";
            self.SecretionColorCheckOther = "";
            self.DescriptionInfectionStatusCheckOther = "";
            self.occurrenceCheckOther = "";
            self.nursingMeasureCheckOther = "";
            self.treatmentResultCheckOther = "";
            self.evaluationResultCheckOther = "";
            self.CatheterOutletTimes = "";
        } else {
            // 整理 資料庫資料 => 畫面上 Checkbox
            self.sortinData("CatheterOutletEvaluate");
            self.sortinData("SecretionTrait");
            self.sortinData("SecretionColor");
            self.sortinData("DescriptionInfectionStatus");
            self.sortinData("occurrence");
            self.sortinData("nursingMeasure");
            self.sortinData("treatmentResult");
            self.sortinData("evaluationResult");

            self.germAry = [];
            catheterInfectService.getGermsByInfectionId(self.cathItem.Id,"NORMAL").then((res) => {
                console.log("peritonitisService getGermsByInfectionId success", res);
                self.Old_germAry = angular.copy(res.data);
                self.germAry = res.data;
            });
        }
    };
    self.initialUI();

    self.exportExcel = function () {
        let excelTable = "";
        excelTable += "<table id='excelTable'>";
        excelTable += "<thead><tr>";
        excelTable += "<th>感染記錄次數</th>";
        excelTable += "<th>天數</th>";
        excelTable += "<th>開始日期</th>";
        excelTable += "<th>記錄日期</th>";
        excelTable += "<th>治療記錄</th>";
        excelTable += "<th>Cell Count</th>";
        excelTable += "<th>Culture 菌種</th>";
        excelTable += "<th>備註</th>";
        excelTable += "<th>症狀-導管出口評估</th>";
        excelTable += "<th>症狀-分泌物、性狀</th>";
        excelTable += "<th>症狀-顏色</th>";
        excelTable += "<th>症狀-感染狀態描述</th>";
        excelTable += "<th>症狀-其他</th>";
        excelTable += "<th>發生原因</th>";
        excelTable += "<th>護理措施</th>";
        excelTable += "<th>治療結果-日期</th>";
        excelTable += "<th>治療結果</th>";
        excelTable += "<th>評值結果-日期</th>";
        excelTable += "<th>評值結果</th>";
        excelTable += "</tr></thead>";
        excelTable += "<tbody>";

        for (let gi = 0; gi < self.germAry.length; gi++) {
            excelTable += "<tr>";
            excelTable += "<td>" + self.cathItem.Times + "</td>";
            excelTable += "<td>" + self.calculateDays(self.germAry[gi]) + "</td>";
            excelTable += "<td>" + moment(self.germAry[gi].Startdate).format("YYYY-MM-DD") + "</td>";
            excelTable += "<td>" + moment(self.germAry[gi].Recorddate).format("YYYY-MM-DD") + "</td>";
            excelTable += "<td>" + (self.germAry[gi].Treatment_Record === null ? "" : self.germAry[gi].Treatment_Record) + "</td>";
            excelTable += "<td>" + (self.germAry[gi].Cell_Count === null ? "" : self.germAry[gi].Cell_Count) + "</td>";
            excelTable += "<td>" + (self.germAry[gi].Culture_Strain === null ? "" : self.germAry[gi].Culture_Strain) + "</td>";
            excelTable += "<td>" + (self.germAry[gi].Memo === null ? "" : self.germAry[gi].Memo) + "</td>";

            excelTable += "<td>" + (self.cathItem.Catheter_Outlet_Evaluate === null ? "" : self.cathItem.Catheter_Outlet_Evaluate.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + (self.cathItem.Secretion_Trait === null ? "" : self.cathItem.Secretion_Trait.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + (self.cathItem.Secretion_Color === null ? "" : self.cathItem.Secretion_Color.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + (self.cathItem.Description_Infection_Status === null ? "" : self.cathItem.Description_Infection_Status.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + (self.cathItem.Symptoms === null ? "" : self.cathItem.Symptoms) + "</td>";
            excelTable += "<td>" + (self.cathItem.Occurrence === null ? "" : self.cathItem.Occurrence.replace('OTHER_','')) + "</td>";
            excelTable += "<td>" + (self.cathItem.Nursing_Measures === null ? "" : self.cathItem.Nursing_Measures.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + moment(cathItem.Treatment_Date).format("YYYY-MM-DD") + "</td>";
            excelTable += "<td>" + (self.cathItem.Treatment_Result === null ? "" : self.cathItem.Treatment_Result.replace('OTHER_','其他:')) + "</td>";
            excelTable += "<td>" + moment(self.cathItem.Evaluation_Date).format("YYYY-MM-DD") + "</td>";
            excelTable += "<td>" + (self.cathItem.Evaluation_Result === null ? "" : self.cathItem.Evaluation_Result.replace('OTHER_','其他:')) + "</td>";
            excelTable += "</tr>";
        }

        excelTable += "</tbody>";
        excelTable += "<table>";

        $('#excelDiv').append(excelTable);
        let MyTabel = $('#excelTable');
        MyTabel.tableExport({
            fileName: 'catheterInfect'
        });
        $('#excelTable').remove();
    };

    //#region 感染菌種記錄 form 控制function
    self.newGermObjInitial = function () {
        let newPetObj = {};
        newPetObj.Infection_Category = "CATHETER";//導管出口感染記錄
        newPetObj.Infection_Record_Id = self.cathItem.Id;
        newPetObj.MedicalId = self.cathItem.Medicalid;
        newPetObj.Times = self.cathItem.Times;
        newPetObj.Startdate = new Date();
        newPetObj.Recorddate = new Date();
        newPetObj.Treatment_Record = "";
        newPetObj.Cell_Count = "";
        newPetObj.Culture_Strain = "";
        newPetObj.Memo = "";
        //#endregion

        self.petDataObj = newPetObj;
        self.isCreateGerm = true;
        self.formType = "germ";
    }
    // 開啟新增治療記錄 Dialog
    self.createOneTreat = function () {
        //#region 建立新的治療記錄物件
        // if (self.isCreate) {
        //     // showMessage("請先完成新增此感染記錄(主表)，再前往新增感染菌種記錄(附表)。");
        //     // return;
        //     if (!self.isEdit) {
        //         catheterInfectService.post(self.cathItem).then((res) => {
        //             console.log("catheterInfectService createOne success", res);
        //             //showMessage($translate('catheterInfect.dialog.createSuccess'));
        //             self.cathItem.Id = res.data.Id;
        //             self.newGermObjInitial();
        //             self.isEdit = true;
        //         }, (res) => {
        //             console.log("catheterInfectService createOne fail", res);
        //             showMessage($translate('catheterInfect.dialog.createFail'));
        //         });
        //     }
        // }
        self.newGermObjInitial();
        self.initialGermUI();

        // $mdDialog.show({
        //     controller: 'cathDetailEditController',
        //     template: dialog,
        //     locals: {
        //         cathDetailItem: newPetObj,
        //         cathPatientId: cathPatientId
        //     },
        //     parent: angular.element(document.body),
        //     clickOutsideToClose: true,
        //     fullscreen: $mdMedia('xs'),
        //     controllerAs: '$ctrl'
        // }).then((result) => {

        // });
        //update修改改到dialog內

    };

    self.deleteOneTreat = function (cathDetailItem,index) {
        console.log("deleteOneTreat", cathDetailItem);
        self.germAry.splice(index, 1);
    }
    // cancel
    self.cancelGerm = function cancelGerm() {
        self.formType = "catheter";
    };

    // save
    self.okGerm = function okGerm() {
        if (self.petDataObj.Recorddate < self.petDataObj.Startdate) {
            showMessage("開始日期應早於記錄日期");
            return;
        }

        self.petDataObj.PatientId = cathPatientId;
        self.petDataObj.HospitalId = self.currentHospital.Id;

        console.log("self.petDataObj---", self.petDataObj);
        
        if(self.isCreateGerm){
            self.germAry.push(self.petDataObj);
        }else{
            self.germAry[self.petDataIndex] = self.petDataObj
        }
        self.formType = "catheter";
    };

    self.initialGermUI = function () {
        let tmpStr = "";
        tmpStr = self.petDataObj.Startdate;
        self.petDataObj.Startdate = new Date(tmpStr);

        tmpStr = self.petDataObj.Recorddate;
        self.petDataObj.Recorddate = new Date(tmpStr);
    };

    self.useMedicineLoading = false;
    self.isErrorUseMedicine = false;
    self.useMedicineData = [];
    const dataLimit = 50;
    let odata = [];
    let dataNumber = 0;

        //用藥紀錄查詢 start
        function loadingMedicineData(){
        
            // 初始化時間區間
            self.MedicineStartDate = new Date(moment());
            self.MedicineEndDate = new Date(moment());
            let columnTitle = [{
                headerName: "項目",
                field: "ODR_NAME",
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                width: 250,
                suppressSizeToFit: true,
                suppressMovable: true,
                lockPosition: true,
                cellClass: ['font-15px']
            },
            {
                headerName: "代碼",
                field: "ODR_CODE",
                cellClass: ['font-15px']
            },
            {
                headerName: "起始日", // NewStartDate 民國轉西元
                field: "START_DATE",
                cellClass: ['font-15px']
            }, 
            {
                headerName: "結束日", // NewEndDate 民國轉西元
                field: "END_DATE",
                cellClass: ['font-15px']
            }, 
            {
                headerName: "途徑",
                field: "ROUTE_CODE",
                cellClass: ['font-15px']
            },
            {
                headerName: "頻率",
                field: "FREQ_CODE",
                cellClass: ['font-15px']
            },
            {
                headerName: "劑量", // 劑量+單位 字串 DOSE + DOSE_UNIT
                field: "NewDoseUnit",
                cellClass: ['font-15px']
            }, 
            {
                headerName: "天數",
                field: "DAYS",
                cellClass: ['font-15px']
            },
            {
                headerName: "備註",
                field: "NOTES",
                cellClass: ['font-15px']
            }
        ];
            
            // 先初始化 ag-grid：開始長 grid
            self.gridOptionsMedicine = {
                columnDefs: columnTitle, // grid 標題設定
                rowData: self.drugData, // data
                angularCompileRows: true,
                defaultColDef: {
                    resizable: true, // shift 可拉開標題長度
                    sortable: true // 全部欄位皆開放排序
                    // width: 200
                },
                pagination: true, // 分頁
                paginationAutoPageSize: true, // 每頁筆數自動以頁高為限
                onFirstDataRendered: sizeToFit, // 初始時縮放 grid
                colResizeDefault: 'shift', // 移動內部欄位時 grid resize
                suppressRowClickSelection: true,
                rowSelection: 'multiple', // 多選
                domLayout: 'normal', // autoHeight normal
                overlayLoadingTemplate: '<span class="ag-overlay-loading-center" style="font-size: 15px;">資料下載中，請稍等...</span>',
                overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow; font-size: 15px;">暫無資料，請使用 "時間區間" 查詢</span>'
            };
            
            self.getCheckMedicineItems();
        }
        self.viewUseMedicine = function () {
            self.formType = "usemedicine";
            loadingMedicineData();
        };
        // 控制日期
        self.dateChange = function () {
            // 處理 起始日結束日
            if (moment(self.MedicineEndDate).isBefore(self.MedicineStartDate)) {
                // 結束日 < 起始日 -> 結束日改為與起始日同一天
                console.log('結束日 < 起始日');
                self.MedicineEndDate = new Date(moment(self.MedicineStartDate));
            }
        };
        // 取得病人的所有的用藥資料
        self.getCheckMedicineItems = function () {
            self.isMedicineError = false;
            // grid 在 init 時就長好了
            //self.gridOptionsMedicine.api.showLoadingOverlay();
            // self.loading = true;
            // 取得病人的所有的用藥資料 ReferralSheetService.getDrugCheckItems(self.StartDate, self.EndDate)
            tpechService.getAllMedicine(self.currentPatient.MedicalId, self.MedicineStartDate, self.MedicineEndDate).then((q) => {
                // self.loading = false;
                // 先處理資料
    
                console.log('取得病人的所有的用藥資料 q', q);
                if (q.data && q.data.length > 0) {
                    // 依 項目 日期 排序
                    self.drugData = _.sortBy(angular.copy(q.data).map((v) => {
    
                        // 處理 用藥 起始日 結束日
                        v['NewStartDate'] = getRealDateTimeStr(v['START_DATE'], null, false);
                        v['NewEndDate'] = getRealDateTimeStr(v['END_DATE'], null, false);
    
                        // 處理數值單位：DOSE DOSE_UNIT string
                        let unit = v['DOSE_UNIT'] ? v['DOSE_UNIT'] : '';
                        v['NewDoseUnit'] = v['DOSE'] ? v['DOSE'].toString().concat(' ', unit) : '-';
    
                        // 處理 null -> '-'
                        v['ODR_NAME'] = v['ODR_NAME'] ? v['ODR_NAME'] : '-';
                        v['ODR_CODE'] = v['ODR_CODE'] ? v['ODR_CODE'] : '-';
                        v['START_DATE'] = v['START_DATE'] ? v['START_DATE'] : '-';
                        v['END_DATE'] = v['END_DATE'] ? v['END_DATE'] : '-';
                        v['ROUTE_CODE'] = v['ROUTE_CODE'] ? v['ROUTE_CODE'] : '-';
                        v['FREQ_CODE'] = v['FREQ_CODE'] ? v['FREQ_CODE'] : '-';
                        v['DAYS'] = v['DAYS'] ? v['DAYS'] : '-';
                        v['NOTES'] = v['NOTES'] ? v['NOTES'] : '-';
    
                        return v;
                    }), ['ODR_NAME', 'NewStartDate', 'NewEndDate']);
    
                    console.log('用藥項目總資料 self.drugData', self.drugData);
    
                    $timeout(() => {
                        self.gridOptionsMedicine.api.setRowData(self.drugData);
                    },0 );
                    // 等待 grid 長好後再執行
                    // self.gridOptions.onGridReady =  function(event) { 
                    //     console.log('the grid is now ready!!'); 
                    //     self.gridOptions.api.hideOverlay();
                    //     self.gridOptions.api.setRowData(self.drugData);
                    // };
                } else {
                    self.gridOptionsMedicine.api.showNoRowsOverlay();
                }
            }, (err) => {
                self.gridOptionsMedicine.api.showNoRowsOverlay();
                // self.loading = false;
                self.isMedicineError = true;
            });
        };
        // 搜尋功能
        self.onQuickFilterMediciChanged = function () {
            // self.gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
            self.gridOptionsMedicine.api.setQuickFilter(self.searchText);
        };
        // 勾選完畢儲存
        self.saveMediciChecked = function () {
            // 勾選好的資料會成陣列
            // selectedRows 就是用藥項目原始資料物件
            let selectedRows = self.gridOptionsMedicine.api.getSelectedRows();
            // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
            let selectedNodes = self.gridOptionsMedicine.api.getSelectedNodes();

            // 勾選完先排序
            let sortData = _.sortBy(selectedRows, ['REP_TYPE_NAME', 'NewStartDate', 'NewEndDate']);
            console.log('勾選完畢先排序 sortData', angular.copy(sortData));
            // 處理成字串
            let selectedRowsString = '';
            sortData.forEach(function (selectedRow, index) {
                // let symbol = ''; // '◈'
                selectedRowsString += selectedRow.ODR_NAME.concat('/', selectedRow.NewDoseUnit, '/', selectedRow.ROUTE_CODE, '/', selectedRow.FREQ_CODE, '/共', selectedRow.DAYS, '天/', '(', selectedRow.START_DATE, '~', selectedRow.END_DATE, ')/', selectedRow.NOTES, '; ');
            });
    
            // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
            console.log('勾選完畢儲存 selectedRows', selectedRows);
            console.log('勾選完畢儲存 selectedNodes', selectedNodes);
            console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);
    
            // 帶資料回前一頁：字串
            if (selectedRows && selectedRows.length > 0) {
                // 有勾選
                //ReferralSheetService.setCheckedData('drug', selectedRowsString);
                self.petDataObj.Treatment_Record += selectedRowsString;
            } else {
                // 無勾選
                //ReferralSheetService.setCheckedData('drug', '');
            }
            self.cancelUseMedicine();
            //self.goback();
    
        };
    
        //用藥紀錄查詢 end
        self.cancelUseMedicine = function () {
            self.formType = "germ";
        };

       //#region 檢驗記錄查詢
       self.user = SettingService.getCurrentUser();
       let queryCondition = labexamService.getPreviousQueryConditionByUserId(self.user.Id);
       // 依照檢驗項目排序及統一名稱，後台設定尚未做，先寫死
       let orderRegExArray = [
           // 血液相關
           { showName: 'WBC', upperName: 'WBC', regex: /^(WBC)$/i, groupName: '血液相關' },
           { showName: 'Hgb', upperName: 'HGB', regex: /^(HGB)$/i, groupName: '血液相關' },
           { showName: 'Hct', upperName: 'HCT', regex: /^((HCT)|(Hematocrit))$/i, groupName: '血液相關' },
           { showName: 'MCV', upperName: 'MCV', regex: /^(MCV)$/i, groupName: '血液相關' },
           { showName: 'PLT', upperName: 'PLT', regex: /^(PLT)$/i, groupName: '血液相關' },
           { showName: 'Iron', upperName: 'IRON', regex: /^(IRON)$/i, groupName: '血液相關' },
           { showName: 'TIBC', upperName: 'TIBC', regex: /^(TIBC)$/i, groupName: '血液相關' },
           { showName: 'Ferritin', upperName: 'FERRITIN', regex: /^(FERRITIN)$/i, groupName: '血液相關' },
           { showName: 'TSAT', upperName: 'TSAT', regex: /^(TSAT)$/i, groupName: '血液相關' },
           { showName: 'Stool OB', upperName: 'STOOL OB', regex: /^(STOOL OB)$/i, groupName: '血液相關' },
           // 營養與代謝
           { showName: 'Albumin', upperName: 'ALBUMIN', regex: /^(ALBUMIN)$/i, groupName: '營養與代謝' },
           { showName: 'T.Protein', upperName: 'T.PROTEIN', regex: /^(T.Protein)$/i, groupName: '營養與代謝' },
           { showName: 'nPCR', upperName: 'NPCR', regex: /^(NPCR)$/i, groupName: '營養與代謝' },
           { showName: 'AC', upperName: 'AC', regex: /^(AC)$/i, groupName: '營養與代謝' },
           { showName: 'A1C', upperName: 'A1C', regex: /^(A1C)$/i, groupName: '營養與代謝' },
           { showName: 'T.Cho', upperName: 'T.CHO', regex: /^(T.CHO)$/i, groupName: '營養與代謝' },
           { showName: 'TG', upperName: 'TG', regex: /^(TG)$/i, groupName: '營養與代謝' },
           { showName: 'Uric Acid', upperName: 'URIC ACID', regex: /^(Uric Acid)$/i, groupName: '營養與代謝' },
           // 透析清除指標
           { showName: 'BUN', upperName: 'BUN', regex: /^(BUN)$/i, groupName: '透析清除指標' },
           { showName: 'Cr', upperName: 'CR', regex: /^(Cr)$/i, groupName: '透析清除指標' },
           { showName: 'kt/V', upperName: 'KT/V', regex: /^(KT\/V)$/i, groupName: '透析清除指標' },
           { showName: 'URR', upperName: 'URR', regex: /^(URR)$/i, groupName: '透析清除指標' },
           { showName: 'TAC', upperName: 'TAC', regex: /^(TAC)$/i, groupName: '透析清除指標' },
           // 生化
           { showName: 'Na', upperName: 'NA', regex: /^(NA)$/i, groupName: '生化' },
           { showName: 'K', upperName: 'K', regex: /^(K)$/i, groupName: '生化' },
           { showName: 'Al', upperName: 'AL', regex: /^(Al)$/i, groupName: '生化' },
           { showName: 'Mg', upperName: 'MG', regex: /^(MG)$/i, groupName: '生化' },
           { showName: 'CRP', upperName: 'CRP', regex: /^(CRP)$/i, groupName: '生化' },
           // 肝臟相關
           { showName: 'AST', upperName: 'AST', regex: /^(AST)$/i, groupName: '肝臟相關' },
           { showName: 'ALT', upperName: 'ALT', regex: /^(ALT)$/i, groupName: '肝臟相關' },
           { showName: 'Alk-P', upperName: 'ALK-P', regex: /^(ALK-P)$/i, groupName: '肝臟相關' },
           { showName: 'T.Bil', upperName: 'T.BIL', regex: /^(T.BIL)$/i, groupName: '肝臟相關' },
           { showName: 'HBsAg', upperName: 'HBSAG', regex: /^(HBSAG)$/i, groupName: '肝臟相關' },
           { showName: 'Anti-HBs', upperName: 'ANTI-HBS', regex: /^(ANTI-HBS)$/i, groupName: '肝臟相關' },
           { showName: 'Anti-HCV', upperName: 'ANTI-HCV', regex: /^(ANTI-HCV)$/i, groupName: '肝臟相關' },
           // 鈣磷相關
           { showName: 'Ca', upperName: 'CA', regex: /^((CA)|(Calcium))$/i, groupName: '鈣磷相關' },
           { showName: 'P', upperName: 'P', regex: /^(P)$/i, groupName: '鈣磷相關' },
           { showName: 'iPTH', upperName: 'IPTH', regex: /^(IPTH)$/i, groupName: '鈣磷相關' },
           // 心臟相關
           { showName: 'CT Ratio', upperName: 'CT RATIO', regex: /^(CT RATIO)$/i, groupName: '心臟相關' }
       ];
   
       // ag-grid 統一設定
       // https://www.ag-grid.com/best-angularjs-data-grid/
       $scope.gridOptions = {
           angularCompileRows: true
       };
   
       // custom cell for ag-grid
       function cellRenderFunc(params) {
           params.$scope.cellClicked = cellClicked;
           params.$scope.cellPressed = cellPressed;
           let value = params.value || '';
           // 項目 id
           let item = _.find(params.data.data, { Name: params.colDef.field });
           // eslint-disable-next-line one-var
           let itemId,
               itemNormalDown,
               itemNormaUpper,
               itemCheckTime = '';
           if (item) {
               itemId = item.Id;
               itemNormalDown = item.NormalDown;
               itemNormaUpper = item.NormalUpper;
               itemCheckTime = item.CheckTime;
           }
   
           return `<div title="正常範圍 ${itemNormalDown}~${itemNormaUpper}&#013;
                   ${itemCheckTime}" hm-tap="cellClicked('${itemId}')" hm-press="cellPressed('${itemId}')">${value}</div>`;
       }
   
       function cellClicked(value) {
           $state.go('updateLabexam', {
               patientId: $stateParams.patientId,
               labexamId: value
           });
       }
       function cellPressed(value) {
           $mdDialog.show({
               controller: [
                   '$mdDialog', DialogController
               ],
               templateUrl: 'dialog.html',
               parent: angular.element(document.body),
               targetEvent: event,
               clickOutsideToClose: true,
               fullscreen: false,
               controllerAs: 'vm'
           });
   
           function DialogController(mdDialog) {
               const vm = this;
               vm.hide = function hide() {
                   mdDialog.hide();
               };
   
               vm.cancel = function cancel() {
                   mdDialog.cancel();
               };
   
               vm.ok = function ok() {
                   labexamService
                       .del(value)
                       .then((q) => {
                           if (q.status === 200) {
                               self.refresh();
                           }
                       });
                   mdDialog.hide(value);
               };
           }
       }
   
       function calculateDays_lab (treatItem) {
           let days = 0;
           let firstStr = moment(treatItem.startDate).format("YYYY-MM-DD");
           let nowStr = moment(treatItem.endDate).format("YYYY-MM-DD");
   
           let firstLong = (new Date(firstStr + " 00:00:00")).valueOf();
           let nowLong = (new Date(nowStr + " 00:00:00")).valueOf();
           let diffLong = nowLong - firstLong;
           days = Math.ceil(diffLong / (24 * 60 * 60 * 1000));
   
           return days + 1;
       };
   
       //#endregion
       //可點選檢驗檢查清單設定 grid start
       // 初始化檢驗檢查
       // 查詢條件相關
       self.conditionTypes = {
           times: {
               name: 'times',
               conditions: ['30', '60', '90', '180', '365', '720'],
               value: {
                   days: '30',
                   startDate: new Date(moment()),
                   endDate: new Date(moment())
               }
               // value: '30'
           },
           duration: {   // 時間區間
               name: 'duration',
               value: {
                   startDate: new Date(moment().add(-7, 'day')), // 預設7天
                   endDate: new Date()
               }
           }
       };
   
       function loadingData(){
           self.queryCondition = self.conditionTypes.duration;
           self.queryCondition.value.startDate = new Date(moment().add(-7, 'day'));
           self.queryCondition.value.endDate =  new Date();
           self.labData = [];
           // grid 標題
           let columnTitle = [{
               headerName: "項目",
               field: "LAB_NAME",
               headerCheckboxSelection: true,
               headerCheckboxSelectionFilteredOnly: true,
               checkboxSelection: true,
               width: 150,
               suppressSizeToFit: true,
               suppressMovable: true,
               lockPosition: true,
               cellClass: ['font-15px']
           },
           {
               headerName: "檢驗日期",
               field: "Date",
               cellClass: ['font-15px']
           },
           {
               headerName: "檢驗時間",
               field: "Time",
               cellClass: ['font-15px']
           },
           {
               headerName: "檢驗數值",
               field: "ResultUnit",
               cellClass: ['font-15px']
           }
           ];
           self.gridOptions = {
               columnDefs: columnTitle, // grid 標題設定
               rowData: self.labData, // data
               angularCompileRows: true,
               defaultColDef: {
                   resizable: true, // shift 可拉開標題長度
                   sortable: true // 全部欄位皆開放排序
                   // width: 200
               },
               pagination: true, // 分頁
               paginationAutoPageSize: true, // 每頁筆數自動以頁高為限
               onFirstDataRendered: sizeToFit, // 初始時縮放 grid
               colResizeDefault: 'shift', // 移動內部欄位時 grid resize
               suppressRowClickSelection: true,
               rowSelection: 'multiple', // 多選
               domLayout: 'normal', // autoHeight normal
               overlayLoadingTemplate: '<span class="ag-overlay-loading-center" style="font-size: 15px;">資料下載中，請稍等...</span>',
               overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow; font-size: 15px;">暫無資料，請使用 "時間區間" 查詢</span>'
           };
           self.gridOptions.onGridReady = function (event) {
               console.log('the grid is now ready!!');
               sizeToFit();
           };
           self.getCheckItems();
           // 先初始化 ag-grid：開始長 grid
       }
       // 取得病人的所有的檢驗資料
       self.getCheckItems = function () {
           // grid 在 init 時就長好了
           //self.gridOptions.api.showLoadingOverlay();
           // self.loading = true;
           // 取得病人的所有的檢驗資料 ReferralSheetService.getLabCheckItems(self.StartDate, self.EndDate)
           // 處理時間 天數 -> 日期
           if (self.queryCondition.name === 'times'){
               // 天數
               // 結束日預設今天
               self.queryCondition.value.endDate = moment();
               // 換算成日期 conditions: ['30', '60', '90', '180', '365', '720'],
               switch (self.queryCondition.value.days) {
                   case '30': // 1個月
                       self.queryCondition.value.startDate = moment().subtract(1, 'M'); // 今天 - 1個月
                       break;
                   case '60': // 2個月
                       self.queryCondition.value.startDate = moment().subtract(2, 'M'); // 今天 - 2個月
                       break;
                   case '90': // 3個月
                       self.queryCondition.value.startDate = moment().subtract(3, 'M'); // 今天 - 3個月
                       break;
                   case '180': // 6個月
                       self.queryCondition.value.startDate = moment().subtract(6, 'M'); // 今天 - 6個月
                       break;
                   case '365': // 1年
                       self.queryCondition.value.startDate = moment().subtract(1, 'y'); // 今天 - 1年
                       break;
                   case '720': // 2年
                       self.queryCondition.value.startDate = moment().subtract(2, 'y'); // 今天 - 2年
                       break;
                   default:
                       break;
               }
           }
           tpechService.getLabResult(self.currentPatient.MedicalId, self.queryCondition.value.startDate, self.queryCondition.value.endDate).then((q) => {
               self.loading = false;
               console.log('取得病人的所有的檢驗資料 q', q,q.data,q.data.length);
               if (q.data && q.data.length > 0) {
                   // 依 項目 日期 排序
                   self.labData = _.sortBy(angular.copy(q.data).map((v) => {
                       // 處理日期時間：DateTime string
                       v['DateTime'] = getRealDateTimeStr(v['REPORT_DATE'], v['REPORT_TIME']); // 排序用
                       // 顯示民國
                       v['Date'] = v['REPORT_DATE'] ? v['REPORT_DATE'] : '-';
                       v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                       if (v['Date']) {
                           v['TaiwanDate'] = v['Time'] != '-' ? v['Date'].concat(' ', v['Time']) : '-';
                       } else {
                           // 沒有 Date
                           v['TaiwanDate'] =  '-';
                       }
                       // 顯示西元
                       // v['Date'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('YYYY/MM/DD') : '-';
                       // v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                       // 處理數值單位：ResultUnit string
                       let unit = v['UNIT'] ? v['UNIT'] : '';
                       v['ResultUnit'] = v['RESULT'] ? v['RESULT'].concat(' ', unit) : '-';
   
                       // 不需要的欄位不需要上傳
                       delete v['PAT_NO'];
                       delete v['ODR_CODE'];
                       delete v['LAB_CODE'];
                       // delete v['LAB_NAME']; // 病摘頁需要
                       delete v['RESULT'];
                       delete v['UNIT'];
                       delete v['HIGH_LIMIT'];
                       delete v['LOW_LIMIT'];
                       delete v['RES_SW'];
                       delete v['REP_TYPE_CODE'];
                       delete v['REP_TYPE_NAME'];
                       delete v['REPORT_DATE'];
                       delete v['REPORT_TIME'];
                       delete v['HDEPT_NAME'];
                       delete v['DateTime'];
                       // delete v['Date']; // 勾選單頁需要
                       // delete v['Time']; // 勾選單頁需要
                       // delete v['TaiwanDate']; // 病摘頁需要
                       // delete v['ResultUnit']; // 病摘頁需要
   
                       return v;
                   }), ['LAB_NAME', 'DateTime']);
                   // _.forEach(self.labData, (v) => {
                   //     // 處理日期時間：DateTime string
                   //     v['DateTime'] = getRealDateTimeStr(v['REPORT_DATE'], v['REPORT_TIME']);
                   //     // 處理數值單位：ResultUnit string
                   //     let unit = v['UNIT'] ? v['UNIT'] : '';
                   //     v['ResultUnit'] = v['RESULT'] ? v['RESULT'].concat(' ', unit) : '-';
                   // })
                   console.log('檢驗項目總資料 self.labData', self.labData);
                   $timeout(() => {
                       self.gridOptions.api.setRowData(self.labData);
                       // $scope.gridOptions.api.setRowData(rows);
                   }, 0);
                   
   
                   // 等待 grid 長好後再執行
                   // self.gridOptions.onGridReady =  function(event) { 
                   //     console.log('the grid is now ready!!'); 
                   //     self.gridOptions.api.hideOverlay();
                   //     self.gridOptions.api.setRowData(self.labData);
                   // };
               } else {
                   //self.gridOptions.api.showNoRowsOverlay();
               }
           }, (err) => {
               self.loading = false;
               self.islabError = true;
           });
       };
       // 搜尋功能
       self.onQuickFilterChanged = function () {
           // self.gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
           self.gridOptions.api.setQuickFilter(self.searchText);
       };
       // 處理民國年與時間 -> 轉成 西元時間字串
       function getRealDateTimeStr(dateStr, timeStr) {
           // 1060301 990301
           // 先確認年份是二位還是三位
           let year = null;
           let newDateStr = null;
           let time = null;
           let newTimeStr = null;
           let finalStr = null;
           let finalMoment = null; // 回傳moment物件
           // 處理日期
           if (dateStr) {
               if (dateStr.length >= 7) {
                   // 7位：1060301
                   // 拆前3位
                   year = parseInt(dateStr.substring(0, 3)) ? parseInt(dateStr.substring(0, 3)) + 1911 : null;
                   newDateStr = year.toString().concat(dateStr.substring(3, 7)); // 20170301
               } else {
                   // 6位：990301
                   // 拆前2位
                   year = parseInt(dateStr.substring(0, 2)) ? parseInt(dateStr.substring(0, 2)) + 1911 : null;
                   newDateStr = year.toString().concat(dateStr.substring(2, 6)); // 20100301
               }
           }
           // 處理時間
           if (timeStr) {
               if (timeStr && timeStr.length === 4) {
                   // 0830 -> 08:30
                   time = timeStr.substring(0, 2); // 08
                   newTimeStr = time.concat(':', timeStr.substring(2, 4)); // 08:30
               }
           }
   
           finalStr = newDateStr && newTimeStr ? newDateStr.concat(' ', newTimeStr) : null;
           finalMoment = finalStr ? moment(finalStr, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm') : '-';
   
           // console.log('年月日時 finalStr', finalStr);
           // console.log('年月日時 finalMoment', finalMoment);
           return finalMoment;
       }
       // 勾選完畢儲存
       self.saveChecked = function () {
           // 勾選好的資料會成陣列
           // selectedRows 就是檢驗項目原始資料物件
           let selectedRows = self.gridOptions.api.getSelectedRows();
           // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
           let selectedNodes = self.gridOptions.api.getSelectedNodes();
   
           // let selectedRowsString = '';
           // selectedRows.forEach(function (selectedRow, index) {
           //     if (index !== 0) {
           //         selectedRowsString += ', ';
           //     }
           //     selectedRowsString += selectedRow.make;
           // });
   
           // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
           console.log('勾選完畢儲存 selectedRows', selectedRows);
           console.log('勾選完畢儲存 selectedNodes', selectedNodes);
           // console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);
   
           // 帶資料回前一頁
           if (selectedRows && selectedRows.length > 0) {
               let labexamItem = [];
               if(!_.isEmpty(self.petDataObj.Culture_Strain)){
                   labexamItem = self.petDataObj.Culture_Strain.split(',');
               }
               selectedRows.forEach(element => {
                   labexamItem.push(`${element.LAB_NAME}：${element.ResultUnit}`)
               });
               console.log('labexamItem',labexamItem);
               
               self.petDataObj.Culture_Strain = labexamItem.join(',');
               
               
               // 有勾選
               // ReferralSheetService.setCheckedLabexamData(selectedRows);
               //ReferralSheetService.setCheckedData('labexam', selectedRows);
               // $sessionStorage.checkedLabexamData = selectedRows;
           } else {
               // 無勾選
               //ReferralSheetService.setCheckedData('labexam', []);
               // $sessionStorage.checkedLabexamData = [];
           }
           //console.log('勾選完畢儲存 $sessionStorage.referralCheckedData', $sessionStorage.referralCheckedData);
           
           self.cancelLabexam();
   
       };
       // 監聽 window 大小縮放 grid
       window.addEventListener("resize", sizeToFit);
   
       function sizeToFit() {
           $timeout(() => {
               self.gridOptions.api.sizeColumnsToFit();
           }, 0);
       }
   
   //可點選檢驗檢查清單設定 end
   
       self.viewLabexam = function (qtype) {
           self.formType = "labexam";
           loadingData();
       };

    self.cancelLabexam = function () {
        self.formType = "germ";
    };
    // 監聽 window 大小縮放 grid
    window.addEventListener("resize", sizeToFit);

    function sizeToFit() {
        $timeout(() => {
            self.gridOptions.api.sizeColumnsToFit();
        }, 0);
    }
    //#endregion
    //#endregion

    //#region 查看微生物報告
    self.mrStDate = new Date(moment(new Date()).add(-7, 'days'));
    self.mrEdDate =  new Date();
    

    self.viewMicroResult = function () {
        self.formType = "microresult";
        self.mrStDate = new Date(moment(new Date()).add(-7, 'days'));
        self.mrEdDate =  new Date();
        self.mrClass = "ALL";
        self.checkMicroResult();
    };

    self.boxMicroResultClass = [];
    self.boxMicroResultShow = [];
    self.boo = true;
    self.toggleFunc = function(index){
        let newClassName = "box-wrap box-close"
        self.boxMicroResultShow[index] = false;
        //box = document.querySelector('.box-wrap');
        if (self.boxMicroResultClass[index].match(/box-close/)) {
            newClassName = "box-wrap box-open";
            self.boxMicroResultShow[index] = true;
        }
        self.boxMicroResultClass[index] = newClassName;
    }


    self.checkMicroResult = function(){
        self.mrLoading = true;
        let stDate = self.mrStDate
        let stYear = stDate.getFullYear();
        stYear = stYear - 1911;
        let stDateTW = stYear.toString() + moment(self.mrStDate).format("MMDD");

        let edDate = self.mrEdDate
        let edYear = edDate.getFullYear();
        edYear = edYear - 1911;
        let edDateTW = edYear.toString() + moment(self.mrEdDate).format("MMDD");

        self.microResultAry = [];
        
        tpechService.getMicroResult(self.currentPatient.MedicalId, stDateTW, edDateTW).then((res) => {
            console.log("tpechService getMicroResult success", res);
            let temptitle = "|抗生素                |      1      |抗生素                |      1      |";
            let temptitle2 = `|抗生素                 |      1      |抗生素                 |      1      |`;

            //篩選體液、微生物
            let perData = [];
            if(res.data.length > 0 && self.mrClass != 'ALL'){
                for(let i=0,j=res.data.length ;i<j;i++){
                    if(res.data[i].REP_TYPE_CODE == String(self.mrClass)){
                        perData.push(res.data[i]);
                    }
                }
                res.data = perData;
            }
            
            for(let resItem in res.data){
                let mrItem = {};
    
                let itemYear = res.data[resItem].REPORT_DATE.substr(0, 3);
                let itemMD = res.data[resItem].REPORT_DATE.substr(3, 4);
    
                mrItem.REPORT_TIME = (Number(itemYear) + 1911).toString() + itemMD + " " + res.data[resItem].REPORT_TIME;
                mrItem.RES_SW = res.data[resItem].RES_SW;
                mrItem.REP_TYPE_CODE = res.data[resItem].REP_TYPE_CODE;
                mrItem.REP_TYPE_NAME = res.data[resItem].REP_TYPE_NAME;
                mrItem.HDEPT_NAME = res.data[resItem].HDEPT_NAME;
                
                if(res.data[resItem].RESULT.indexOf(temptitle) > -1){
                    
                    res.data[resItem].RESULT = res.data[resItem].RESULT.replace(temptitle,temptitle2);
                    
                }
                mrItem.RESULT = res.Data[resItem].RESULT;
                self.boxMicroResultClass.push('box-close');
                self.boxMicroResultShow.push(true);
                self.microResultAry.push(mrItem);
            }
            self.mrLoading = false;
        }, (res) => {
            self.mrLoading = false;
            console.log("tpechService getMicroResult fail", res);
        });
    };

    self.cancelMicroResult = function () {
        self.formType = "germ";
    };

    //#endregion

}

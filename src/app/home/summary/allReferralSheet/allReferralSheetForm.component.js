import allReferralSheetForm from './allReferralSheetForm.html';
import './allReferralSheet.less';

angular.module('app')
    .component('allReferralSheetForm', {
        template: allReferralSheetForm,
        controller: allReferralSheetFormCtrl,
        controllerAs: '$ctrl'
    });

allReferralSheetFormCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$mdDialog', 'tpechService', 'DoctorNoteService', 'userService', 'pdTreatService'];

function allReferralSheetFormCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $mdDialog, tpechService, DoctorNoteService, userService, pdTreatService) {
    const self = this;
    self.referralSheetId = $stateParams.referralSheetId;
    self.user = SettingService.getCurrentUser();
    self.currentPatient = {};

    self.isError = false;

    // 上傳物件
    self.referralSheetForm = {};

    // 檢驗報告
    let LABEXAM_CHECK = 'labexamCheck';
    // 上傳用：檢驗報告表格原始資料
    self.referralSheetForm.LabCheckedData = [];
    // 顯示用：檢驗報告表格整理過的資料
    self.finalTableCheckData = [];
    // 用藥明細
    let DRUG_CHECK = 'drugCheck';
    // 手術歷程
    let SURGERY_CHECK = 'surgeryCheck';
    // 治療醫囑
    let ORDER_CHECK = 'orderCheck';
    // 其他共病
    let DISEASE_CHECK = 'diseaseCheck';

    self.stateName = $state.current.name;

    // 原發病大類 primaryDisease
    self.primaryDiseaseList = {
        A: 'A 腎臟實質疾病',
        B: 'B 系統性疾病',
        C: 'C 阻塞性腎病變及泌尿系統疾病',
        D: 'D 腎血管病變',
        E: 'E 遺傳性疾病',
        F: 'F 其他已知原因腎衰竭',
        G: 'G 不明原因之腎衰竭',
        H: 'H 中毒',
        I: 'I 其他'
    };

    // 原發病細類 primaryDiseaseDetail
    self.primaryDiseaseDetailList = {
        'A-01A': 'A-01A 慢性腎絲球腎炎(臨床診斷，未有病理切片者)',
        'A-01B': 'A-01B 慢性腎絲球腎炎(有病理切片診斷者)',
        'A-01B-a': 'A-01B-a A型免疫球蛋白腎炎',
        'A-01B-b': 'A-01B-b 局部腎絲球硬化症',
        'A-01B-c': 'A-01B-c 膜性腎病變',
        'A-01B-d': 'A-01B-d 膜性增生性腎炎',
        'A-01B-e': 'A-01B-e 間質增生性腎炎',
        'A-01B-f': 'A-01B-f 微小變化型腎病變',
        'A-01B-g': 'A-01B-g 半月狀腎絲球腎炎',
        'A-01B-h': 'A-01B-h 鏈球菌感染後腎絲球腎炎',
        'A-01B-i': 'A-01B-i 腎小管組織腎炎',
        'A-01B-j': 'A-01B-j 止痛劑性腎病變',
        'A-01B-k': 'A-01B-k 其他型腎絲球腎炎',
        'A-02A': 'A-02A 快速進行性腎絲球腎炎(臨床診斷，未有病理切片者)',
        'A-02B': 'A-02B 快速進行性腎絲球腎炎(有病理切片診斷者)',
        'A-03A': 'A-03A 慢性腎間質性腎炎(臨床診斷，未有病理切片者)',
        'A-03A-a': 'A-03A-a 中藥引起之慢性腎間質性腎炎(臨床診斷，未有病理切片者)',
        'A-03B': 'A-03B 慢性腎間質性腎炎(有病理切片診斷者)',
        'A-03B-a': 'A-03B-a 中藥引起之慢性腎間質性腎炎(有病理切片診斷者)',
        'A-04': 'A-04 慢性腎孟腎炎',
        'A-05': 'A-05 急性腎衰竭(未恢復)',
        'A-06': 'A-06 其他腎實質疾病',
        'B-01': 'B-01 腎硬化症（缺血性腎病變）',
        'B-02': 'B-02 惡性高血壓',
        'B-03': 'B-03 糖尿病',
        'B-04': 'B-04 紅斑性狼瘡',
        'B-05': 'B-05 類澱粉腎病變',
        'B-06': 'B-06 硬皮症',
        'B-07': 'B-07 多發性骨髓病',
        'B-08': 'B-08 痛風性腎病變',
        'B-09': 'B-09 肝硬化',
        'B-10': 'B-10 心衰竭',
        'B-11': 'B-11 妊娠毒血症',
        'B-12': 'B-12 其他代謝異常引起的腎衰竭',
        'B-13': 'B-13 其他系統性疾病引起之腎衰竭',
        'B-14': 'B-14 敗血症',
        'C-01': 'C-01 結石',
        'C-02': 'C-02 腎結核',
        'C-03': 'C-03 腎尿路惡性腫瘤',
        'C-04': 'C-04 其他惡性腫病導致之尿路阻塞',
        'C-05': 'C-05 逆流性腎病變',
        'C-06': 'C-06 其他原因引起之阻塞性腎病變',
        'D-01': 'D-01 腎梗塞',
        'D-02': 'D-02 腎動脈栓塞',
        'D-03': 'D-03 腎靜脈血栓症',
        'D-04': 'D-04 溶血性尿毒症候群',
        'D-05': 'D-05 其他腎血管疾病',
        'E-01': 'E-01 多囊腎',
        'E-02': 'E-02 其他腎囊腫性疾病',
        'E-03': 'E-03 遺傳性腎炎',
        'E-04': 'E-04 腎形成不全',
        'E-05': 'E-05 其他遺傳性疾病導致腎衰竭',
        'F': 'F 其他已知原因腎衰竭',
        'G': 'G 不明原因之腎衰竭',
        'H-01': 'H-01 一般藥物中毒',
        'H-02': 'H-02 農藥中毒',
        'H-03': 'H-03 化學製劑中毒',
        'H-04': 'H-04 其他中毒',
        'I-01': 'I-01 其他'
    };

    // for 電子簽章，須繞掉取 localStorage 的部分
    self.isForPdf = $state.current.name === 'referralSheetFormForPdf';

    // 預設畫面
    self.$onInit = function $onInit() {
        self.loading = true;
        // 取得登入者角色，醫生才可以刪除
        // 電子簽章須繞掉
        if (!self.isForPdf) {
            self.loginRole = SettingService.getCurrentUser().Role;
        }

        // 新增修改共用資料：$q.all執行的陣列
        let executeArray = [];
        executeArray.push(getDoctorList()); // 0. 醫生資料
        // 1. 病患相關資料 病摘不會存，所以修改時也需要
        executeArray.push(getPatientData());

        // load 已存在表單
        if ($stateParams.referralSheetId) {
            // 修改
            self.loading = true;

            $q.all(executeArray).then(() => {

                ReferralSheetService.getByReferralId($stateParams.referralSheetId).then((q) => {
                    self.loading = false;

                    console.log('修改 轉診病摘 init q', angular.copy(q));
                    angular.extend(self.referralSheetForm, q.data);

                    angular.extend(self.referralSheetForm, {
                        // 處理日期
                        Birthday: self.referralSheetForm.Birthday ? moment(self.referralSheetForm.Birthday).format('YYYY/MM/DD') : '-', // 生日 new Date(moment(self.referralSheetForm.Birthday).format('YYYY-MM-DD'))
                        FirstDialysisDate: self.referralSheetForm.FirstDialysisDate ? new Date(self.referralSheetForm.FirstDialysisDate) : null,  // 初次透析日
                        LastDialysisDate: self.referralSheetForm.LastDialysisDate ? new Date(self.referralSheetForm.LastDialysisDate) : null, // 最後透析日
                        // VesselAccessCreationDate: self.referralSheetForm.VesselAccessCreationDate ? new Date(self.referralSheetForm.VesselAccessCreationDate) : null, // 瘻管 (人工血管) 手術日期
                        // VenousCatheterInsertionDate: self.referralSheetForm.VenousCatheterInsertionDate ? new Date(self.referralSheetForm.VenousCatheterInsertionDate) : null, // Permanent, DoubleLumen 造管日
                        LabexamDate: self.referralSheetForm.LabexamDate ? new Date(self.referralSheetForm.LabexamDate) : null, // 檢驗檢查日期 任意取一筆有日期的檢驗項目日期顯示
                        RecordDate: self.referralSheetForm.RecordDate ? new Date(self.referralSheetForm.RecordDate) : null  // 記錄日期
                    });

                    console.log('修改 init self.referralSheetForm' + self.referralSheetForm);
                    // 20190426 為了刷新時還可以有暫存sessionStorage的資料，目前先不開放，刷新時只有顯示最原始有的資料
                    // appendLabexamCheckedData(); // 確認是否有需要再append資料

                    // 組出符合檢驗表格的資料 self.finalTableCheckData
                    setLabTableFinalCheckData();

                }, (err) => {
                    self.loading = false;
                    self.isError = true;
                    showMessage(lang.ComServerError);
                });
            }).catch(() => {
                console.log('q.all catch');
                self.isError = true;
                showMessage(lang.ComServerError);
            }).finally(() => {
                self.loading = false;
            });

        } else {
            // 新增
            console.log('新增 轉診病摘 init');
            // 設定初始值
            // 2. 透析相關資料
            executeArray.push(getDialysisData());
            $q.all(executeArray).then(() => {
                if ($sessionStorage.referralSheetData) {
                    // 從複製鈕過來的
                    console.log('從複製鈕過來的 init', ReferralSheetService.getReferralSheetData());
                    angular.extend(self.referralSheetForm, ReferralSheetService.getReferralSheetData());
                    // 處理日期相關
                    angular.extend(self.referralSheetForm, {
                        // 處理日期
                        Birthday: self.referralSheetForm.Birthday ? moment(self.referralSheetForm.Birthday).format('YYYY/MM/DD') : '-', // 生日
                        FirstDialysisDate: self.referralSheetForm.FirstDialysisDate ? new Date(self.referralSheetForm.FirstDialysisDate) : null,  // 初次透析日
                        LastDialysisDate: self.referralSheetForm.LastDialysisDate ? new Date(self.referralSheetForm.LastDialysisDate) : null // 最後透析日
                    });
                    // 組出符合檢驗表格的資料 self.finalTableCheckData
                    setLabTableFinalCheckData();
                    // 要刪除修改一些欄位
                    delete self.referralSheetForm.Id;
                    delete self.referralSheetForm.Revision;
                    delete self.referralSheetForm.Status;
                    delete self.referralSheetForm.CreatedTime;
                    delete self.referralSheetForm.ModifiedTime;
                    self.referralSheetForm.CreatedUserId = null;
                    self.referralSheetForm.CreatedUserName = null;
                    self.referralSheetForm.ModifiedUserId = null;
                    self.referralSheetForm.ModifiedUserName = null;
                    self.referralSheetForm.RecordDate = new Date(moment());// 記錄日期
                } else {
                    // 從新增鈕過來的
                    // 20190426 為了刷新時還可以有暫存sessionStorage的資料，目前先不開放，刷新時只有顯示最原始有的資料
                    // appendLabexamCheckedData();

                    // 組出符合檢驗表格的資料 self.finalTableCheckData
                    setLabTableFinalCheckData();

                    // 處理主治醫生 self.doctorList
                    let doctor = {};
                    if (self.currentPatient.AttendingPhysician) {
                        doctor = _.find(self.doctorList, function (o) {
                            // return o.Role === 'doctor' && o.Access !== '0';
                            return o.Id === self.currentPatient.AttendingPhysician;
                        });
                    }
                    console.log('主治醫生 doctor', doctor);
                    // 主治醫生 VisitingStaff
                    self.referralSheetForm.AttendingDoctor = _.size(doctor) > 0 ? doctor.Name : '-';
                }
            }).catch(() => {
                console.log('q.all catch');
                self.isError = true;
                showMessage(lang.ComServerError);

            }).finally(() => {
                self.loading = false;
            });
        }
    };

    // 接收從勾選單回來的資料，append 到 table 或 字串 裡
    $scope.$on('checkedData', function (event, o) {
        console.log('接收從勾選單回來的資料 event', event);
        console.log('接收從勾選單回來的資料 o', o);
        console.log('接收從勾選單回來的資料 o.fromStateName', o.fromStateName);
        // 手術歷程：從勾選頁回來
        if (o.fromStateName === SURGERY_CHECK) {
            // 有勾選資料才需要 append
            appendSurgeryCheckedData();
        }
        // 治療處方 : 從勾選頁回來
        if (o.fromStateName === ORDER_CHECK) {
            // 有勾選資料才需要呈現
            appendOrderCheckedData();
        }
        // 其他共病：從勾選頁回來
        if (o.fromStateName === DISEASE_CHECK) {
            // 有勾選資料才需要 append
            appendDiseaseCheckedData();
        }
        // 檢驗報告
        if (o.fromStateName === LABEXAM_CHECK) {
            // 有勾選資料才需要 append
            appendLabexamCheckedData();
            // 組出符合檢驗表格的資料 self.finalTableCheckData
            setLabTableFinalCheckData();
        }
        // 用藥明細
        if (o.fromStateName === DRUG_CHECK) {
            // 有勾選資料才需要 append
            appendDrugCheckedData();
        }
        // 刷新時不要幫他暫留資料
        delete $sessionStorage.referralCheckedData;
    });


    // 手術歷程
    // 如果 $sessionStorage 有值，要 append 到 self.referralSheetForm.SurgeryCheckedData 裡
    function appendSurgeryCheckedData() {
        let surgeryData = ReferralSheetService.getCheckedData() ? ReferralSheetService.getCheckedData().surgery : null;

        console.log('手術歷程 self.referralSheetForm.SurgeryCheckedData', self.referralSheetForm.SurgeryCheckedData);

        if (surgeryData && surgeryData != "") {
            if (self.referralSheetForm.SurgeryCheckedData == "-" || self.referralSheetForm.SurgeryCheckedData == null) {
                self.referralSheetForm.SurgeryCheckedData = "";
            }
            self.referralSheetForm.SurgeryCheckedData = self.referralSheetForm.SurgeryCheckedData.concat(surgeryData);
        }
    }

    // PD 治療處方
    function appendOrderCheckedData() {
        let orderData = ReferralSheetService.getCheckedData() ? ReferralSheetService.getCheckedData().order[0] : null;

        if (orderData && orderData != "") {
            console.log("ORDER DATA", orderData);

            pdTreatService.getDetailList(orderData.Id, "Normal").then((res) => {
                console.log("pdTreatService.getDetailList", res);
                self.pdEsaAry = [];
                self.pdDianealAry = [];
                self.pdNutrinealAry = [];
                self.pdExtranealAry = [];
                self.Daily_Changed_Bag_Times = 0; //每日換袋次數
                self.CAPD_Total_Treatment = 0; //總治療量(L)
                self.CAPD_Total_Prescription = 0; //總處方量(L)

                for (var oi in res.data) {
                    if (res.data[oi].Fluidchangetime === "ESA") {
                        self.pdEsaAry.push(angular.copy(res.data[oi]));
                    } else if (res.data[oi].Fluidchangetime === "Treat") {
                        if (res.data[oi].Potiontypes === "Dianeal") {
                            self.pdDianealAry.push(angular.copy(res.data[oi]));
                        } else if (res.data[oi].Potiontypes === "Nutrineal") {
                            self.pdNutrinealAry.push(angular.copy(res.data[oi]));
                        } else if (res.data[oi].Potiontypes === "Extraneal") {
                            self.pdExtranealAry.push(angular.copy(res.data[oi]));
                        }
                    }

                    //每日換袋次數
                    let Bagnumber = _.toNumber(res.data[oi].Bagnumber);
                    if (_.isNumber(Bagnumber)) {
                        self.Daily_Changed_Bag_Times += Bagnumber;
                    }
                    //總治療量
                    let Esa_Dose_U = _.toNumber(res.data[oi].Esa_Dose_U);

                    let Baglitre = (res.data[oi].Baglitre == '其他') ? _.toNumber(res.data[oi].BaglitreOther) : _.toNumber(res.data[oi].Baglitre);
                    if (_.isNumber(Esa_Dose_U)) {
                        self.CAPD_Total_Treatment += (Bagnumber * Esa_Dose_U);
                    }
                    //總處方量
                    if (_.isNumber(Baglitre)) {
                        self.CAPD_Total_Prescription += (Bagnumber * Baglitre);
                    }
                }
            });
        }
    }

    // 其他共病
    // 如果 $sessionStorage 有值，要 append 到 self.referralSheetForm.DiseaseCheckedData 裡
    function appendDiseaseCheckedData() {
        let diseaseData = ReferralSheetService.getCheckedData() ? ReferralSheetService.getCheckedData().disease : null;

        console.log('其他共病 self.referralSheetForm.Comorbidity', self.referralSheetForm.Comorbidity);

        if (diseaseData && diseaseData != "") {
            if (self.referralSheetForm.Comorbidity == "-" || self.referralSheetForm.Comorbidity == null) {
                self.referralSheetForm.Comorbidity = "";
            }
            self.referralSheetForm.Comorbidity = self.referralSheetForm.Comorbidity.concat(diseaseData);
        }
    }

    // 檢驗報告
    // 如果 $sessionStorage 有值，要 append 到 self.referralSheetForm.LabCheckedData 裡
    function appendLabexamCheckedData() {
        // let data = ReferralSheetService.getCheckedLabexamData();
        let labexamData = ReferralSheetService.getCheckedData() ? ReferralSheetService.getCheckedData().labexam : [];
        if (labexamData && labexamData.length > 0) {
            self.referralSheetForm.LabCheckedData = _.concat(self.referralSheetForm.LabCheckedData, labexamData);
        }
    }

    // 用藥明細
    // 如果 $sessionStorage 有值，要 append 到 self.referralSheetForm.DrugCheckedData 裡
    function appendDrugCheckedData() {
        let drugData = ReferralSheetService.getCheckedData() ? ReferralSheetService.getCheckedData().drug : null;

        console.log('用藥明細 drugData', drugData);

        if (drugData && drugData != "") {
            if (self.referralSheetForm.DrugCheckedData == "-" || self.referralSheetForm.DrugCheckedData == null) {
                self.referralSheetForm.DrugCheckedData = "";
            }
            self.referralSheetForm.DrugCheckedData = self.referralSheetForm.DrugCheckedData.concat(drugData);
        }
    }

    self.deleteLabexam = function () {
        // 跳警示
        $mdDialog.show({
            controller: ['$mdDialog', deleteLabDialogController],
            templateUrl: 'deleteLabDialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });
        function deleteLabDialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };
            vm.cancel = function cancel() {
                mdDialog.cancel();
            };
            vm.ok = function ok() {
                // 刪除畫面上的檢驗報告table
                self.finalTableCheckData = [];
                self.referralSheetForm.LabCheckedData = []; // 修改時拉下來的資料
                mdDialog.hide();
            };
        }
    };

    // 0. 取得醫生選項
    function getDoctorList() {
        const deferred = $q.defer();
        userService.get().then((q) => {
            console.log('取得所有使用者 q', q);
            self.doctorList = _.filter(q.data, function (o) {
                // return o.Role === 'doctor' && o.Access !== '0';
                return o.Role === 'doctor';
            });
            deferred.resolve();
        }, (err) => {
            deferred.reject();
        });
        return deferred.promise;
    }

    // 1. 病患相關資料
    function getPatientData() {
        const deferred = $q.defer();

        // 41081049  $stateParams.patientId  ReferralSheetService.getByPatientId  tpechService.getPatient
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = angular.copy(res.data);
            console.log('目前病患 self.currentPatient', angular.copy(res.data));
            // 病患相關欄位資料：設定部分病患欄位資料
            angular.extend(self.referralSheetForm, {
                Name: self.currentPatient.Name,  // 病患姓名
                MedicalId: self.currentPatient.MedicalId ? self.currentPatient.MedicalId : '-', // 病歷號
                IdentifierId: self.currentPatient.IdentifierId ? self.currentPatient.IdentifierId : '-', // 身分證號
                Gender: self.currentPatient.Gender ? self.currentPatient.Gender : '-',  // 性別
                Birthday: self.currentPatient.Birthday ? moment(self.currentPatient.Birthday).format('YYYY/MM/DD') : '-', // 生日 new Date(moment(self.currentPatient.Birthday).format('YYYY-MM-DD'))
                Age: self.currentPatient.Birthday ? (moment().format('YYYY')) - (moment(self.currentPatient.Birthday).format('YYYY')) : '-', // 年齡
                FirstDialysisDate: self.currentPatient.FirstDialysisDate ? new Date(self.currentPatient.FirstDialysisDate) : null, // 初次透析日
                // 原發病 大類 細項 第一組預帶
                PrimaryDisease1: self.currentPatient.PrimaryDisease ? self.currentPatient.PrimaryDisease : null, // 原發病 大類
                PrimaryDiseaseDetail1: self.currentPatient.PrimaryDiseaseDetail ? self.currentPatient.PrimaryDiseaseDetail : null, // 原發病 細項
                // 其他共病
                Comorbidity: self.currentPatient.Comorbidity ? self.currentPatient.Comorbidity : null, // 其他共病
                // VesselAccessCreationDate: self.currentPatient.VesselAccessSurgeryDate ? new Date(self.currentPatient.VesselAccessSurgeryDate) : null, // 瘻管 (人工血管) 手術日期
                // 20190213過敏史只取病患資料過敏史的藥物, 增加病患資料"血液傳染標記"
                // Allergy: allergyDrug === '-' ? '-' : allergyDrug, // 過敏史
                // Allergy: allergyDrug === '-' && HepatitisMarker === '-' ? '-' : allergyStr.concat(allergyDrug, HepatitisMarker), // 過敏史
                // AntiBlood: HepatitisMarker === '' ? '-' : HepatitisMarker, // 血液傳染標記
                // ClinicalDiagnosis: self.currentPatient.ClinicalDiagnosis ? self.currentPatient.ClinicalDiagnosis : '-', // 臨床診斷
                // ProfessionalNurse: self.currentPatient.NurseSignatures ? self.currentPatient.NurseSignatures : '-' // 權責護理師
                // HBsAg: self.currentPatient.HepatitisMarker.HBSaG,
                // AntiHCV: self.currentPatient.HepatitisMarker.AntiHCV,
                // AntiHIV: self.currentPatient.HepatitisMarker.HIVcombo
            });
            deferred.resolve();

        }, (err) => {
            console.log('病患相關資料 err', err);
            deferred.reject();
        });

        return deferred.promise;
    }


    // 2. 透析相關資料
    function getDialysisData() {
        const deferred = $q.defer();

        // 透析相關欄位資料：取得最後一次的透析所有相關資料
        ReferralSheetService.getLastDialysisRecordByPatientId($stateParams.patientId).then((q) => {
            console.log('最後一次的透析相關資料 self.LastDialysisRecord', angular.copy(q.data));
            // console.log('最後一次的透析相關資料 Prescription', angular.copy(q.data.DialysisHeader.Prescription));
            self.dialysisRecord = angular.copy(q.data);
            // 總覽 overview ------------
            // BPs (PreBloodPressure)
            let preBloodPressureBPSstr = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.PreVitalSign && self.dialysisRecord.DialysisHeader.PreVitalSign.length > 0 && self.dialysisRecord.DialysisHeader.PreVitalSign[0].BPS ? self.dialysisRecord.DialysisHeader.PreVitalSign[0].BPS.toString() : '-';
            let preBloodPressureBPDstr = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.PreVitalSign && self.dialysisRecord.DialysisHeader.PreVitalSign.length > 0 && self.dialysisRecord.DialysisHeader.PreVitalSign[0].BPD ? self.dialysisRecord.DialysisHeader.PreVitalSign[0].BPD.toString() : '-';
            let postBloodPressureBPSstr = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.PostVitalSign && self.dialysisRecord.DialysisHeader.PostVitalSign.length > 0 && self.dialysisRecord.DialysisHeader.PostVitalSign[0].BPS ? self.dialysisRecord.DialysisHeader.PostVitalSign[0].BPS.toString() : '-';
            let postBloodPressureBPDstr = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.PostVitalSign && self.dialysisRecord.DialysisHeader.PostVitalSign.length > 0 && self.dialysisRecord.DialysisHeader.PostVitalSign[0].BPD ? self.dialysisRecord.DialysisHeader.PostVitalSign[0].BPD.toString() : '-';
            let beforePulseStr = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Pulse && self.dialysisRecord.DialysisHeader.Pulse[0] ? self.dialysisRecord.DialysisHeader.Pulse[0].toString() : '-';
            // 透析血管通路/建立日期：造管手術日：要寫在 "overview 血管通路" 之前，因為血管通路會將日期拆出即是"造管手術日"
            // self.vesselAccessCreationDate = null; // AVFistula, AVGraft
            // self.venousCatheterInsertionDate = null; // Permanent, DoubleLumen
            // overview 血管通路
            let vesselAessessmentsArray = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.VesselAssessments && self.dialysisRecord.DialysisHeader.VesselAssessments.length !== 0 ? self.dialysisRecord.DialysisHeader.VesselAssessments : null;
            self.vesselAessessmentsStr1 = ''; // 第一組管路
            self.vesselAessessmentsStr2 = ''; // 第二組管路
            setOverviewVesselStr(vesselAessessmentsArray);
            // 血液透析醫囑 (處方) ------------ self.dialysisRecord.DialysisHeader.Prescription
            // 透析時數 duration
            let durationObj = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Duration ? self.dialysisRecord.DialysisHeader.Prescription.Duration : {};
            // 透析頻率 Frequency
            let frequency = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Frequency ? self.dialysisRecord.DialysisHeader.Prescription.Frequency : '-';
            // 人工腎臟 Dialyzer
            let ak = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.ArtificialKidney ? self.dialysisRecord.DialysisHeader.Prescription.ArtificialKidney : '-';
            // 穿刺針號
            // let punctureNeedleStr1 = '';
            // let punctureNeedleStr2 = '';
            // let route1 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Route ? self.dialysisRecord.DialysisHeader.Prescription.Route : '-';
            // let needleObj1 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Needle ? self.dialysisRecord.DialysisHeader.Prescription.Needle : {};
            // let needleA1 = _.size(needleObj1) > 0 && needleObj1.ArteryLength ? needleObj1.ArteryLength : '-';
            // let needleV1 = _.size(needleObj1) > 0 && needleObj1.VeinLength ? needleObj1.VeinLength : '-';
            // let catheterLength1 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.CatheterLength ? self.dialysisRecord.DialysisHeader.Prescription.CatheterLength : '-';

            // let isPerm1 = route1 !== '-' ? checkPerm(route1) : false;
            // let catheterLengthStr1 = isPerm1 ? '長度:' + catheterLength1 : '';
            // let unit1 = isPerm1 ? 'cc' : 'G';

            // let route2 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Route2 ? self.dialysisRecord.DialysisHeader.Prescription.Route2 : '-';
            // let needleObj2 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Needle2 ? self.dialysisRecord.DialysisHeader.Prescription.Needle2 : {};
            // let needleA2 = _.size(needleObj2) > 0 && needleObj2.ArteryLength ? needleObj2.ArteryLength : '-';
            // let needleV2 = _.size(needleObj2) > 0 && needleObj2.VeinLength ? needleObj2.VeinLength : '-';
            // let catheterLength2 = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.CatheterLength2 ? self.dialysisRecord.DialysisHeader.Prescription.CatheterLength2 : '-';

            // let isPerm2 = route2 !== '-' ? checkPerm(route2) : false;
            // let catheterLengthStr2 = isPerm2 ? '長度:' + catheterLength2 + 'cm' : '';
            // let unit2 = isPerm2 ? 'cc' : 'G';
            // punctureNeedleStr1 = route1 !== '-' ? route1.concat(' ', 'A:', needleA1, unit1, ' ', 'V:', needleV1, unit1, ' ', catheterLengthStr1) : '-';
            // punctureNeedleStr2 = route2 !== '-' ? route2.concat(' ', 'A:', needleA2, unit2, ' ', 'V:', needleV2, unit2, ' ', catheterLengthStr2) : '-';
            // 乾體重
            let dryWeight = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.StandardWeight ? self.dialysisRecord.DialysisHeader.Prescription.StandardWeight.toString().concat('kg') : '-';
            // 脫水量
            let dehydration = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Dehydration ? self.dialysisRecord.DialysisHeader.Dehydration.toString().concat('L') : '-';
            // 血液流速
            let bloodFlow = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.BF ? self.dialysisRecord.DialysisHeader.Prescription.BF.toString().concat('ml/min') : '-';
            // 透析液流速
            // let dialysateFlow = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.DialysateFlowRate ? self.dialysisRecord.DialysisHeader.Prescription.DialysateFlowRate.toString().concat('ml/min') : '-';
            // 透析液(Ca)
            let dialysate = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Dialysate ? self.dialysisRecord.DialysisHeader.Prescription.Dialysate.toString().concat('mEq/L') : '-';
            // 透析液溫度
            // let dialysateTemperature = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.DialysateTemperature ? self.dialysisRecord.DialysisHeader.Prescription.DialysateTemperature.toString().concat('℃') : '-';
            // 肝素
            let anticoagulantsObj = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Prescription && self.dialysisRecord.DialysisHeader.Prescription.Anticoagulants ? self.dialysisRecord.DialysisHeader.Prescription.Anticoagulants : {};

            // 用藥 OrderRecord
            // let orderRecordArray = self.dialysisRecord.OrderRecord && self.dialysisRecord.OrderRecord.length > 0 ? self.dialysisRecord.OrderRecord : [];

            // 護理摘要 NursingRecord
            // let nursingRecordArray = self.dialysisRecord.NursingRecord && self.dialysisRecord.NursingRecord.length > 0 ? self.dialysisRecord.NursingRecord : [];

            // 主治醫生 VisitingStaff
            // let attendingDoctor = self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.VisitingStaff ? self.dialysisRecord.DialysisHeader.VisitingStaff : '-';

            angular.extend(self.referralSheetForm, {
                // 總覽 overview ------------
                OverviewVessel1: self.vesselAessessmentsStr1 ? self.vesselAessessmentsStr1 : '-', // overview 血管通路1
                OverviewVessel2: self.vesselAessessmentsStr2 ? self.vesselAessessmentsStr2 : '-', // overview 血管通路2
                PreBloodPressure: preBloodPressureBPSstr === '-' && preBloodPressureBPDstr === '-' ? '-' : preBloodPressureBPSstr.concat('/', preBloodPressureBPDstr, ' mmHg'), // 透析前血壓
                PostBloodPressure: postBloodPressureBPSstr === '-' && postBloodPressureBPDstr === '-' ? '-' : postBloodPressureBPSstr.concat('/', postBloodPressureBPDstr, ' mmHg'), // 透析後血壓
                // BeforePulse: beforePulseStr === '-' ? '-' : beforePulseStr.concat(' beats/min'), // 脈搏
                // VesselAccessCreationDate: self.vesselAccessCreationDate ? new Date(self.vesselAccessCreationDate) : null, // AVFistula, AVGraft 造管日
                // VenousCatheterInsertionDate: self.venousCatheterInsertionDate ? new Date(self.venousCatheterInsertionDate) : null, // Permanent, DoubleLumen 造管日
                // 最後透析日
                LastDialysisDate: self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.StartTime ? new Date(self.dialysisRecord.DialysisHeader.StartTime) : null,
                // 血液透析醫囑 (處方) ------------
                Duration: getDurationStr(durationObj), // 透析時數 duration
                Frequency: frequency, // 透析頻率
                DryWeight: dryWeight, // 乾體重
                UltraFiltration: dehydration, // 脫水量 總覽的Dehydration
                Dialyzer: ak, // 人工腎臟
                Dialysate: dialysate, // 透析液 (Ca / K)
                BloodFlow: bloodFlow, // 血液流速
                HeparinLoading: getAnticoagulantsStr(anticoagulantsObj), // 肝素 目前只使用一個欄位 HeparinLoading
                // AttendingDoctor: attendingDoctor, // 主治醫生
                // PunctureNeedle1: punctureNeedleStr1, // 穿刺針號1
                // PunctureNeedle2: punctureNeedleStr2, // 穿刺針號2
                // DialysateFlow: dialysateFlow, // 透析液流速
                // DialysateTemperature: dialysateTemperature, // 透析液溫度
                // Medication: getOrderRecordStr(orderRecordArray), // 用藥 OrderRecord
                // NursingSummary: getNursingRecordStr(nursingRecordArray), // 護理摘要 NursingRecord

            });

            // 新增：設定表格部分欄位初始資料
            angular.extend(self.referralSheetForm, {
                PatientId: $stateParams.patientId,
                RecordDate: new Date(moment())  // 記錄日期 預帶今天
            });

            if (self.dialysisRecord.DialysisHeader && self.dialysisRecord.DialysisHeader.Id) {
                getProblemsDoctorNote(self.dialysisRecord.DialysisHeader.Id).then((q) => {
                    deferred.resolve();
                }, (err) => {
                    console.log('現況問題 doctorNote err', err);
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }

        }, (err) => {
            console.log('最後一次的透析相關資料 err', err);
            deferred.reject();
        });

        return deferred.promise;
    }


    // 3. 現況問題 -> 預帶 最後一筆病情摘要 doctorNote
    function getProblemsDoctorNote(headerId) {
        const deferred = $q.defer();
        DoctorNoteService.getByHeaderId(headerId).then((q) => {
            console.log('現況問題 doctorNote q', headerId, q);
            // 排序取出最新一筆
            let sort = _.orderBy(angular.copy(q.data), ['RecordTime'], ['desc']);
            console.log('現況問題 sort', sort);
            // 排序後第一筆即是最新
            if (sort && sort.length > 0) {
                let noteTime = sort[0].RecordTime ? moment(sort[0].RecordTime).format('YYYY/MM/DD') : null;
                let noteContent = sort[0].Content ? sort[0].Content : '-';
                let str = noteTime ? noteTime.concat(':') : '';
                str = noteContent ? str.concat(noteContent) : '-';
                self.referralSheetForm.Problems = str;

            } else {
                self.referralSheetForm.Problems = ''; // '-'
            }
            deferred.resolve();
        }, (err) => {
            console.log('現況問題 doctorNote err', err);
            deferred.reject();
        });
        return deferred.promise;
    }

    // 中文翻譯
    // 左右手
    function translateHandSite(str) {
        switch (str) {
            case 'right':
                return '右';
            case 'left':
                return '左';
            default:
                return '-';
        }
    }
    // 處理管路名稱
    function translateCatheterType(catheterType) {
        let catheterTypeTC;
        switch (catheterType) {
            case 'AVFistula':
                catheterTypeTC = '自體動靜脈瘻管';
                break;
            case 'AVGraft':
                catheterTypeTC = '人工動靜脈瘻管';
                break;
            case 'Permanent':
                catheterTypeTC = 'PermCath或其他長期導管';
                break;
            case 'DoubleLumen':
                catheterTypeTC = '其他短期導管(Double Lumen)';
                break;
            default:
                catheterTypeTC = '造管種類錯誤';
                break;
        }
        return catheterTypeTC;
    }
    // 管路位置
    function translateVesselPosition(position) {
        switch (position) {
            case 'forearm':
                return '前臂';
            case 'upperArm':
                return '上臂';
            case 'thigh':
                return '大腿';
            case 'calf':
                return '小腿';
            case 'IJV':
                return '內頸靜脈';
            case 'SV':
                return '鎖骨下靜脈';
            case 'FV':
                return '股靜脈';
            default:
                return '-';
        }
    }
    // 上針部位
    function translateNeedlePosition(position) {
        switch (position) {
            case 'outside':
                return '外側';
            case 'inside':
                return '內側';
            case 'other':
                return '其他';
            default:
                return '-';
        }
    }
    // 通路功能評估－Thrill
    function translateThrill(str) {
        switch (str) {
            case 'yes':
                return '有';
            case 'none':
                return '無';
            default:
                return '-';
        }
    }
    // 通路功能評估－順暢
    function translateFavorable(str) {
        switch (str) {
            case 'yes':
                return '是';
            case 'no':
                return '否';
            default:
                return '-';
        }
    }
    // 處理血管通路
    function setOverviewVesselStr(vesselAessessmentsArray) {
        if (vesselAessessmentsArray) {
            _.forEach(vesselAessessmentsArray, (value, key) => {
                console.log('血管通路 key', key);
                console.log('血管通路 value', value);
                // 處理管路名稱
                let startDate = ''; // 建立日期
                startDate = value.Data.StartDate ? moment(value.Data.StartDate).format('YYYY/MM/DD') + '-' : '';
                // 管路名稱
                let catheterType = translateCatheterType(value.Data.CatheterType);
                // 左右
                let side = value.Data.CatheterPosition && value.Data.CatheterPosition.Side ? translateHandSite(value.Data.CatheterPosition.Side) : '-';

                // 位置
                let position = value.Data.CatheterPosition && value.Data.CatheterPosition.Position ? translateVesselPosition(value.Data.CatheterPosition.Position) : '-';
                // 動脈端上針位置
                let artery = value.ArteryPosition ? translateNeedlePosition(value.ArteryPosition) : '-';
                // 靜脈端上針位置
                let vein = value.VeinPosition ? translateNeedlePosition(value.VeinPosition) : '-';
                // 通路功能評估－Thrill
                let thrill = value.Thrill ? translateThrill(value.Thrill) : '-';
                // 通路功能評估－順暢
                let favorable = value.Favorable ? translateFavorable(value.Favorable) : '-';

                if (key === 0) {
                    // 第一組管路
                    self.vesselAessessmentsStr1 = self.vesselAessessmentsStr1.concat(startDate, catheterType, '/', side, position, '/動脈:', artery, '/靜脈:', vein, '/Thrill:', thrill, '/順暢:', favorable);
                } else {
                    // 第二組管路
                    // console.log('第二組管路 permCath', permCath);
                    self.vesselAessessmentsStr2 = self.vesselAessessmentsStr2.concat(startDate, catheterType, '/', side, position, '/動脈:', artery, '/靜脈:', vein, '/Thrill:', thrill, '/順暢:', favorable);
                }
            });
        }
        // console.log('血管通路 vesselAessessmentsStr 1', self.vesselAessessmentsStr1);
        // console.log('血管通路 vesselAessessmentsStr 2', self.vesselAessessmentsStr2);
    }

    // 每週透析次數 時數 duration
    function getDurationStr(durationObj) {
        console.log('時數 obj', durationObj);
        let durationStr = null;
        if (_.size(durationObj) !== 0) {
            let hours = durationObj.Hours == 0 ? '0' : durationObj.Hours;
            hours = hours ? hours.toString().concat('時') : '';
            let min = durationObj.Minutes == 0 ? '0' : durationObj.Minutes;
            min = min ? min.toString().concat('分') : '';
            if (hours == '' && min == '') {
                durationStr = '-';
            } else {
                durationStr = hours.concat(min);
            }
        } else {
            durationStr = '-';
        }
        console.log('時數 str', durationStr);
        return durationStr;
    }


    // 肝素(抗凝劑)
    function getAnticoagulantsStr(anticoagulantsObj) {
        let anticoagulantsStr = '';
        if (_.size(anticoagulantsObj) > 0) {
            _.forEach(anticoagulantsObj, (value, key) => {
                let startValue = value && value[0] ? value[0] : '-';
                let maintainValue = value && value[1] ? value[1] : '-';

                anticoagulantsStr = anticoagulantsStr.concat(key, ' 起始量:', startValue, 'U 維持量:', maintainValue, 'U/hr', ', ');

            });
        }
        anticoagulantsStr = anticoagulantsStr !== '' ? anticoagulantsStr : '-';
        return anticoagulantsStr;
    }

    // 檢驗項目
    // 處理 finalData
    function setLabTableFinalCheckData() {
        // 先計算從勾選單送回來的資料有幾筆
        let checkDataCount = self.referralSheetForm.LabCheckedData ? self.referralSheetForm.LabCheckedData.length : 0;
        if (checkDataCount > 0) {
            // 平均分成2組，計算每個 table 會有幾列
            const totalTableCount = 2; // 總table數量：2組
            let columnNum = Math.round(checkDataCount / totalTableCount); // 因為是除以2所以可以使用四捨五入
            // self.referralSheetForm.LabCheckedData 先依照 項目 日期 排序
            self.referralSheetForm.LabCheckedData = _.sortBy(self.referralSheetForm.LabCheckedData, ['LAB_NAME', 'DateTime']);

            // 開始塞入 table 1 及 table 2
            self.finalTableCheckData = _.chunk(self.referralSheetForm.LabCheckedData, columnNum);

            console.log('處理finalCheckData last', _.last(self.finalTableCheckData));

            // 如果 最後一個 tableArray length < columnNum -> tableArray 需要補 空物件
            if (_.last(self.finalTableCheckData).length < columnNum) {
                // 計算需要補幾個空物件
                let objCount = columnNum - _.last(self.finalTableCheckData).length;
                for (let i = 0; i < objCount; i++) {
                    _.last(self.finalTableCheckData).push({});
                }
            }
            // const totalTableCount = 2; // 總table數量：2組
            // let columnNum = Math.round(checkDataCount / totalTableCount); // 因為是除以2所以可以使用四捨五入
            // let nextSliceNum = 0;
            // for (let i = 0; i < totalTableCount; i++) {
            //     let tableArray = [];
            //     tableArray.push(_.slice(self.referralSheetForm.LabCheckedData, nextSliceNum, nextSliceNum + columnNum));
            //     nextSliceNum = nextSliceNum + columnNum;
            //     // 如果 最後一個 tableArray length < columnNum -> tableArray 需要補 空物件
            //     if (i == totalTableCount - 1) {
            //         if (tableArray.length < columnNum) {
            //             // 計算需要補幾個空物件
            //             let objCount = columnNum - tableArray.length;
            //         }
            //     }
            //     self.finalTableCheckData.push(tableArray);
            //     console.log('處理finalData tableArray', tableArray);
            // }
            console.log('處理finalCheckData columnNum', columnNum);
            console.log('處理finalCheckData self.finalTableCheckData', self.finalTableCheckData);
        }
    }

    // 修改提交
    self.submit = function submit(event) {
        // 判斷有無event，避免其他隻 function 呼叫
        if (event) {
            event.currentTarget.disabled = true;
        }
        if ($stateParams.referralSheetId) {
            // 修改
            self.referralSheetForm.ModifiedUserId = self.user.Id;
            self.referralSheetForm.ModifiedUserName = self.user.Name;
            console.log('上傳 修改 self.referralSheetForm :', self.referralSheetForm);

            ReferralSheetService.put(self.referralSheetForm).then((res) => {
                if (res.status === 200) {
                    showMessage('修改成功!');
                    history.go(-1);
                }
            }, (err) => {
                console.log('上傳 修改 失敗');
                event.currentTarget.disabled = false;
                showMessage('修改失敗，請重新儲存');
            });
        } else {
            // TODO: 假資料
            // self.referralSheetForm.LabCheckedData = [
            //     {"PAT_NO":"61171874","ODR_CODE":"09038","LAB_CODE":"9038","LAB_NAME":"Alb","RESULT":"2.9","UNIT":"g/dL","HIGH_LIMIT":"5.2","LOW_LIMIT":"3.5","RES_SW":"L","REP_TYPE_CODE":"44","REP_TYPE_NAME":"聯檢化","REPORT_DATE":"1080518","REPORT_TIME":"0912","HDEPT_NAME":"洗腎","DateTime":"2019/05/18 09:12","Date":"1080518","Time":"09:12","TaiwanDate":"1080518 09:12","ResultUnit":"2.9 g/dL"},
            //     {"PAT_NO":"61171874","ODR_CODE":"09015","LAB_CODE":"9002X","LAB_NAME":"B/C","RESULT":"10.58","UNIT":null,"HIGH_LIMIT":null,"LOW_LIMIT":null,"RES_SW":null,"REP_TYPE_CODE":"44","REP_TYPE_NAME":"聯檢化","REPORT_DATE":"1080518","REPORT_TIME":"0912","HDEPT_NAME":"洗腎","DateTime":"2019/05/18 09:12","Date":"1080518","Time":"09:12","TaiwanDate":"1080518 09:12","ResultUnit":"10.58"},
            //     {"PAT_NO":"61171874","ODR_CODE":"09015","LAB_CODE":"9002X","LAB_NAME":"B/C","RESULT":"10.58","UNIT":null,"HIGH_LIMIT":null,"LOW_LIMIT":null,"RES_SW":null,"REP_TYPE_CODE":"44","REP_TYPE_NAME":"聯檢化","REPORT_DATE":"1080518","REPORT_TIME":"0912","HDEPT_NAME":"洗腎","DateTime":"2019/05/18 09:12","Date":"1080518","Time":"09:12","TaiwanDate":"1080518 09:12","ResultUnit":"10.58"}
            // ];
            // self.referralSheetForm.LabCheckedData = [
            //     {"LAB_NAME":"Alb","TaiwanDate":"1080518 09:12","ResultUnit":"2.9 g/dL"},
            //     {"LAB_NAME":"B/C","RESULT":"10.58","TaiwanDate":"1080518 09:12","ResultUnit":"10.58"},
            //     {"LAB_NAME":"B/C","TaiwanDate":"1080518 09:12","ResultUnit":"10.58"}
            // ];

            self.referralSheetForm.CreatedUserId = self.user.Id;
            self.referralSheetForm.CreatedUserName = self.user.Name;

            console.log('上傳 新增 self.referralSheetForm :', self.referralSheetForm);

            ReferralSheetService.post(self.referralSheetForm).then((res) => {
                if (res.status === 200) {
                    showMessage('新增成功!');
                    history.go(-1);
                }
            }, (err) => {
                console.log('上傳 新增 失敗');
                event.currentTarget.disabled = false;
                showMessage('新增失敗，請重新儲存');
            });
        }
    };


    // 回上一頁
    self.goback = function goback(routeName) {
        history.go(-1);
        // 刪掉從勾選單回來的資料
        // delete $sessionStorage.checkedLabexamData;
    };



    self.isBrowser = cordova.platformId === 'browser';
    // Todo 無法吃到相對路徑的 CSS
    self.print = function () {
        if (self.isBrowser) {
            window.print();
        }
        // else {

        //     // let page = location.href;
        //     // console.log(page);
        //     // cordova.plugins.printer.print(page, 'Dialysis.html');
        //     let page = document.body;
        //     // console.log(page);
        //     cordova.plugins.printer.print(page, 'Dialysis.html');
        // }
    };

    self.gotoHomePage = function () {
        if (self.loginRole === 'doctor') {
            // 醫生返回'今日床位'
            $state.go('beds');
        } else {
            // 護理師及其他角色及null回'我的病患'
            $state.go('myPatients');
        }
    };

    // 手術歷程勾選單
    self.gotoSurgeryCheck = function () {
        $state.go('surgeryCheck', {
            patientId: $stateParams.patientId,
            referralSheetId: $stateParams.referralSheetId,
            medicalId: self.currentPatient.MedicalId,
            patientName: self.currentPatient.Name
        });
    };

    // 其他共病勾選單
    self.gotoDiseaseCheck = function () {
        $state.go('diseaseCheck', {
            patientId: $stateParams.patientId,
            referralSheetId: $stateParams.referralSheetId,
            medicalId: self.currentPatient.MedicalId,
            patientName: self.currentPatient.Name
        });
    };

    // PD 治療處方勾選單
    self.gotoOrderCheck = function () {
        $state.go('pdOrderCheck', {
            patientId: $stateParams.patientId
        });
    };

    // 檢驗項目勾選單
    self.gotoLabexamCheck = function () {
        if ($state.current.name.substr(0, 2) === "pd") {
            $state.go('pdLabexamCheck', {
                patientId: $stateParams.patientId,
                referralSheetId: $stateParams.referralSheetId,
                medicalId: self.currentPatient.MedicalId,
                patientName: self.currentPatient.Name
            });
        } else {
            $state.go('labexamCheck', {
                patientId: $stateParams.patientId,
                referralSheetId: $stateParams.referralSheetId,
                medicalId: self.currentPatient.MedicalId,
                patientName: self.currentPatient.Name
            });
        }
    };

    // 用藥明細勾選單
    self.gotoDrugCheck = function () {
        if ($state.current.name.substr(0, 2) === "pd") {
            $state.go('pdDrugCheck', {
                patientId: $stateParams.patientId,
                referralSheetId: $stateParams.referralSheetId,
                medicalId: self.currentPatient.MedicalId,
                patientName: self.currentPatient.Name
            });
        } else {
            $state.go('drugCheck', {
                patientId: $stateParams.patientId,
                referralSheetId: $stateParams.referralSheetId,
                medicalId: self.currentPatient.MedicalId,
                patientName: self.currentPatient.Name
            });
        }
    };

    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        console.log('machineData Probldms', self.referralSheetForm.Probldms);
        //$mdSidenav('rightPhrase').close();
    };


    self.$onDestroy = function onDestroy() {
        // 刪掉從勾選單回來的資料
        // delete $sessionStorage.checkedLabexamData;
        delete $sessionStorage.referralCheckedData;

        // 複製過來的會有資料
        if ($sessionStorage.referralSheetData) {
            delete $sessionStorage.referralSheetData;
        }
    };

}


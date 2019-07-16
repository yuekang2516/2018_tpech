import ks806 from './ks806.component.html'; // 國軍806表單
import './ks806.component.less';

angular.module('app').component('ks806Report', {
    bindings: {
        data: '<',
        deviation: '<',
        catheter: '<',
        clicked: '=',
        columnTd: '=',
        whiteframe: '=?',
        patient: '<',
        headerId: '<'
    },
    template: ks806,
    controller: ks806Controller
});

ks806Controller.$inject = ['$filter', '$state', '$stateParams', 'SettingService', 'shiftIssueService', 'labexamService', 'assessmentService', '$mdDialog', 'dialysisService', 'showMessage', '$scope', 'epoExecutionService', 'BloodTransfusionService', 'summaryReportService'];

function ks806Controller($filter, $state, $stateParams, SettingService, shiftIssueService, labexamService, assessmentService, $mdDialog, dialysisService, showMessage, $scope, epoExecutionService, BloodTransfusionService, summaryReportService) {
    console.log('enter summary content component ks806Report');
    const self = this;
    // console.log('data', self.data);
    console.log('patient', self.patient);
    console.log('headerId', self.headerId);

    let $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();
    const patientId = self.patient.Id; // $stateParams.patientId
    $stateParams.patientId = patientId;
    // let headerId = $stateParams.headerId;
    self.whiteframe = true;

    // 表單標題
    self.dialysisRecordTable = SettingService.getCurrentHospital().FormTitle;

    document.getElementsByTagName('body')[0].onafterprint = function () {
        self.whiteframe = true;
    };

    let sheetTemplateName = SettingService.getCurrentHospital().SheetTemplate ? SettingService.getCurrentHospital().SheetTemplate.toUpperCase() : ''; // 轉大寫

    self.$onInit = function $onInit() {
        prepareData();
    };

    function prepareData() {
        self.loading = true;
        summaryReportService.getCommonSummaryData($stateParams.patientId, self.headerId).then((res) => {
            self.data = res.data;
            console.log('data:', self.data);
            self.catheter = res.catheter;
            self.deviation = res.deviation;

            if (self.data.DialysisHeader.CheckStaff) {
                self.checkStaff = Object.keys(self.data.DialysisHeader.CheckStaff)[0];
            }
    
            // 血管通路 組合成字串:self.VesselAssessmentStr
            if (self.data.DialysisHeader.VesselAssessments.length > 0) {
                let va = self.data.DialysisHeader.VesselAssessments[0];
                let vsa = false;
                if (va.StartDate) {
                    if ((Date.parse(moment(va.StartDate).format('YYYY-MM-DD'))).valueOf() <= (Date.parse(self.data.dialysisHeader.StartTime)).valueOf() &&
                        (!va.EndDate || (va.EndDate && (Date.parse(moment(va.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(self.data.dialysisHeader.StartTime)).valueOf()))) {
                        vsa = true;
                    }
                } else if (!va.EndDate || (va.EndDate && (Date.parse(moment(va.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(self.data.dialysisHeader.StartTime)).valueOf())) {
                    vsa = true;
                }
                if (vsa) {
                    self.VesselAssessmentStr = handleTransformCatheterType(va.Data.CatheterType) + ' ' + $translate('vesselAssessment.vesselAssessment.' + va.Data.CatheterPosition.Side) + ' ' + $translate('vesselAssessment.vesselAssessment.' + va.Data.CatheterPosition.Position);
                    console.log('result:', self.VesselAssessmentStr);
                }
            }



    // 開始血壓：{{$ctrl.data.DialysisHeader.PreVitalSign[0].BloodPressurePosture === '臥' ? $ctrl.data.DialysisHeader.PreVitalSign[0].BPS : '　　'}} / {{$ctrl.data.DialysisHeader.PreVitalSign[0].BloodPressurePosture === '臥' ? $ctrl.data.DialysisHeader.PreVitalSign[0].BPD : '　'}} 臥<br>
    // <span style="visibility: hidden;">開始血壓：</span>{{$ctrl.data.DialysisHeader.PreVitalSign[0].BloodPressurePosture === '坐' ? $ctrl.data.DialysisHeader.PreVitalSign[0].BPS : '　　'}} / {{$ctrl.data.DialysisHeader.PreVitalSign[0].BloodPressurePosture === '坐' ? $ctrl.data.DialysisHeader.PreVitalSign[0].BPD : '　'}} 坐
    // <br>
    // 結束血壓：{{$ctrl.data.DialysisHeader.PostVitalSign[0].BloodPressurePosture === '臥' ? $ctrl.data.DialysisHeader.PostVitalSign[0].BPS : '　　'}} / {{$ctrl.data.DialysisHeader.PostVitalSign[0].BloodPressurePosture === '臥' ? $ctrl.data.DialysisHeader.PostVitalSign[0].BPD : '　'}} 臥<br>
    // <span style="visibility: hidden;">開始血壓：</span>{{$ctrl.data.DialysisHeader.PostVitalSign[0].BloodPressurePosture === '坐' ? $ctrl.data.DialysisHeader.PostVitalSign[0].BPS : '　　'}} / {{$ctrl.data.DialysisHeader.PostVitalSign[0].BloodPressurePosture === '坐' ? $ctrl.data.DialysisHeader.PostVitalSign[0].BPD : '　'}} 坐

    self.VitalSign = {};
    self.VitalSign.PreVitalSign1 = {};
    self.VitalSign.PreVitalSign1.BPS = '';
    self.VitalSign.PreVitalSign1.BPD = '';
    self.VitalSign.PreVitalSign1.Posture = '';
    self.VitalSign.PreVitalSign2 = {};
    self.VitalSign.PreVitalSign2.BPS = '';
    self.VitalSign.PreVitalSign2.BPD = '';
    self.VitalSign.PreVitalSign2.Posture = '';
    self.VitalSign.PostVitalSign1 = {};
    self.VitalSign.PostVitalSign1.BPS = '';
    self.VitalSign.PostVitalSign1.BPD = '';
    self.VitalSign.PostVitalSign1.Posture = '';
    self.VitalSign.PostVitalSign2 = {};
    self.VitalSign.PostVitalSign2.BPS = '';
    self.VitalSign.PostVitalSign2.BPD = '';
    self.VitalSign.PostVitalSign2.Posture = '';

    // for (let i = 0; i < self.data.DialysisHeader.PreVitalSign.length; i++) {
        if (self.data.DialysisHeader.PreVitalSign.length > 0) {
            self.VitalSign.PreVitalSign1.BPS = self.data.DialysisHeader.PreVitalSign[0].BPS;
            self.VitalSign.PreVitalSign1.BPD = self.data.DialysisHeader.PreVitalSign[0].BPD;
            self.VitalSign.PreVitalSign1.Posture = self.data.DialysisHeader.PreVitalSign[0].BloodPressurePosture;
        }
        if (self.data.DialysisHeader.PreVitalSign.length > 1) {
            self.VitalSign.PreVitalSign2.BPS = self.data.DialysisHeader.PreVitalSign[1].BPS;
            self.VitalSign.PreVitalSign2.BPD = self.data.DialysisHeader.PreVitalSign[1].BPD;
            self.VitalSign.PreVitalSign2.Posture = self.data.DialysisHeader.PreVitalSign[1].BloodPressurePosture;
        }
    // }
    // for (let i = 0; i < self.data.DialysisHeader.PostVitalSign.length; i++) {
        if (self.data.DialysisHeader.PostVitalSign.length > 0) {
            self.VitalSign.PostVitalSign1.BPS = self.data.DialysisHeader.PostVitalSign[0].BPS;
            self.VitalSign.PostVitalSign1.BPD = self.data.DialysisHeader.PostVitalSign[0].BPD;
            self.VitalSign.PostVitalSign1.Posture = self.data.DialysisHeader.PostVitalSign[0].BloodPressurePosture;
        }
        if (self.data.DialysisHeader.PostVitalSign.length > 1) {
            self.VitalSign.PostVitalSign2.BPS = self.data.DialysisHeader.PostVitalSign[1].BPS;
            self.VitalSign.PostVitalSign2.BPD = self.data.DialysisHeader.PostVitalSign[1].BPD;
            self.VitalSign.PostVitalSign2.Posture = self.data.DialysisHeader.PostVitalSign[1].BloodPressurePosture;
        }
    // }

    // 抗凝劑 Heparin 初劑量 200, 維持量 250
    self.Anticoagulants = [];
    if (self.data.DialysisHeader.Prescription !== null) {
        for (let i = 0; i < Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants).length; i++) {
            let key = Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants)[i];
            // console.log('key:', key);
            // console.log('0:', self.data.DialysisHeader.Prescription.Anticoagulants[key][0]);
            // console.log('1:', self.data.DialysisHeader.Prescription.Anticoagulants[key][1]);
            self.Anticoagulants.push(key + ' 初劑量 ' + self.data.DialysisHeader.Prescription.Anticoagulants[key][0] + ', 維持量 ' + self.data.DialysisHeader.Prescription.Anticoagulants[key][1]);
        }
    }

    // // EPO, 依日期取得當月的資料
    // self.epoData = self.data.EPOExecutions.filter(item => item.Status !== 'Deleted');
    // console.log('epo:', self.epoData);
    // epoExecutionService.getListByMonth(patientId, moment(self.data.DialysisHeader.StartTime).format('YYYY-MM-DD'), true).then((q) => {
    //     self.epoData = q.data.filter(item => item.Status !== 'Deleted');
    // });

    // 輸血  $stateParams.headerId
    self.bloodData = [];
    if (self.data.BloodTransfusions.length > 0) {
        self.bloodData = self.data.BloodTransfusions.filter(item => item.Status !== 'Deleted');
    }
    // BloodTransfusionService.get(self.headerId).then((q) => {
    //     console.log('BloodTransfusion q:', q);
    //     if (q.data.length > 0) {
    //         self.bloodData = q.data.filter(item => item.Status !== 'Deleted');
    //         // console.log('blood:', self.bloodData);
    //     }
    // });

    // 透析機資料
    self.columnTd2 = [];
    if (self.data.DialysisData.length <= 9) {
        self.columnTd2 = Array.from(Array(9 - self.data.DialysisData.length).keys());
    }

    // 洗中評估
    self.AssessmentItems = [];
    for (let i = 0; i < self.data.DialysisData.length; i++) {
        if (self.data.DialysisData[i].Status !== 'Deleted' && Object.keys(self.data.DialysisData[i].AssessmentItems).length > 0) {
            for (let j = 0; j < Object.keys(self.data.DialysisData[i].AssessmentItems).length; j++) {
                let key = Object.keys(self.data.DialysisData[i].AssessmentItems)[j];
                // console.log('key:', key);
                // console.log('cont', self.data.DialysisData[i].AssessmentItems[key]);
                self.AssessmentItems.push(self.data.DialysisData[i].AssessmentItems[key]);
            }
        } else {
            self.AssessmentItems.push([]);
        }
    }

    // 洗前評估+洗後評估
    self.AssessmentRecords = [];
    // console.log(self.data.AssessmentRecords);
    for (let i = 0; i < self.data.AssessmentRecords.length; i++) {
        if (self.data.AssessmentRecords[i].Status !== 'Deleted') {
            let AssessmentRecordsItem = {};
            let asStr = moment(self.data.AssessmentRecords[i].RecordTime).format('HH:mm') + ' ';
            for (let j = 0; j < Object.keys(self.data.AssessmentRecords[i].Items).length; j++) {
                let key = Object.keys(self.data.AssessmentRecords[i].Items)[j];
                // console.log('key:', key);
                // console.log('cont', self.data.AssessmentRecords[i].Items[key].toString());
                asStr += key + '：' + self.data.AssessmentRecords[i].Items[key].toString() + '　';
            }
            AssessmentRecordsItem.cont = asStr;
            AssessmentRecordsItem.CreatedUserName = self.data.AssessmentRecords[i].CreatedUserName;
            AssessmentRecordsItem.ModifiedUserName = self.data.AssessmentRecords[i].ModifiedUserName;
            self.AssessmentRecords.push(AssessmentRecordsItem);
        }
    }

    // 交班事項
    self.shiftIssueData = [];
    shiftIssueService.getByPatientId(patientId, false).then((res) => {
        res.data.forEach((x) => {
            if (x.Status !== 'Deleted' && moment(self.data.DialysisHeader.StartTime).format('YYYY-MM-DD') === moment(x.RecordTime).format('YYYY-MM-DD')) {
            // if (x.Status !== 'Deleted' && moment(x.RecordTime).format('YYYY-MM-DD') === '2018-04-17') {
                self.shiftIssueData.push(x);
            }
        });
    });

    // 給藥紀錄
    self.columnTd1 = [];
    if (self.data.OrderRecord.length <= 4) {
        self.columnTd1 = Array.from(Array(4 - self.data.OrderRecord.length).keys());
    }


            self.isError = false;
        }).catch((err) => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });





        // dialysisService.getLast(patientId, true).then((res) => {
        //     self.serviceData = res.data;
        //     console.log('serviceData:', self.serviceData);
        // });
    }

    self.refresh = function () {
        prepareData();
    };

    function handleTransformCatheterType(catheterType) {
        let catheterTypeTC;
        switch (catheterType) {
            case 'AVFistula':
                catheterTypeTC = $translate('overview.component.AVFistula');
                break;
            case 'AVGraft':
                catheterTypeTC = $translate('overview.component.AVGraft');
                break;
            case 'Permanent':
                catheterTypeTC = $translate('overview.component.Permanent');
                break;
            case 'DoubleLumen':
                catheterTypeTC = $translate('overview.component.DoubleLumen');
                break;
            default:
                catheterTypeTC = $translate('overview.component.typeError');
        }
        return catheterTypeTC;
    }


//     // 透析後AK
//     self.EndHollowFiber = handleTransformAK(self.data.DialysisHeader.EndHollowFiber);
//     self.EndChamber = handleTransformAK(self.data.DialysisHeader.EndChamber);
//     function handleTransformAK(Type) {
//         let AKTypeTC;
//         switch (Type) {
//             case '-':
//                 AKTypeTC = '&#8722';
//                 break;
//             case '+-':
//                 AKTypeTC = '&#177;';
//                 break;
//             case '+':
//                 AKTypeTC = '&#43;';
//                 break;
//             case '++':
//                 AKTypeTC = '&#43;&#43;';
//                 break;
//             case '+++':
//                 AKTypeTC = '&#43;&#43;&#43;';
//                 break;
//             case 'clot':
//                 AKTypeTC = 'clot';
//                 break;
//             default:
//                 AKTypeTC = $translate('overview.component.typeError');
//         }
//         return AKTypeTC;
// }

    // console.log(self.data.DialysisHeader.Prescription.Anticoagulants[0][0]);
    // console.log(self.data.DialysisHeader.Prescription.Anticoagulants[0][1]);
    // console.log(self.data.DialysisHeader.Prescription.Anticoagulants[1][0]);
    // console.log(self.data.DialysisHeader.Prescription.Anticoagulants[1][1]);

    // console.log('Heparin:', self.data.DialysisHeader.Prescription.Anticoagulants.Fragmin[0]);
    // self.data.DialysisHeader.Prescription.Anticoagulants.forEach((x) => {
    //     console.log('x:', x);
    // });

    // self.yearold = new Date(self.patient.Birthday).toLocaleDateString(); //  moment().format('YYYY-MM-DD')   self.patient.Birthday

    // let timeDiff = Math.abs(moment().getTime() - new Date(self.patient.Birthday).getTime());
    // self.yearold = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // self.yearold = Math.round((moment() - new Date(self.patient.Birthday)) / 1000 / 60 / 60 / 24 / 365);



    // function checkCanCreate() {
    //     if (self.serviceData && !self.serviceData.DialysisHeader.EndTime && moment(self.serviceData.DialysisHeader.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
    //         self.canCreate = false;
    //     } else {
    //         self.canCreate = true;
    //     }
    // }

    // self._handleCreateCheck = function _handleCreateCheck(event) {
    //     self.canCreate = false;
    //     $scope.$emit('loadSummaryContent', true);
    //     self.loading = true;
    //     dialysisService.getCreateCheck(patientId).then((res) => {
    //         let createCheck;
    //         if (res.status === 200) {
    //             createCheck = res.data;
    //             // debugger;
    //             // 當 DialysisPrescriptionCount > 0 && VesselAssessmentCount > 0 就開表
    //             if (createCheck.DialysisPrescriptionCount > 0 && createCheck.VesselAssessmentCount > 0) {
    //                 postDialysis();
    //             } else {
    //                 $mdDialog.show({
    //                     controller: ['$mdDialog', handleCreateDialogController],
    //                     templateUrl: 'confirm.html',
    //                     parent: angular.element(document.body),
    //                     targetEvent: event,
    //                     clickOutsideToClose: true,
    //                     fullscreen: false,
    //                     controllerAs: 'vm'
    //                 }).then(() => { }, () => {
    //                     self.loading = false;
    //                     self.canCreate = true;
    //                 });
    //             }
    //         } else {
    //             self.canCreate = true;
    //             showMessage($translate('allDialysisRecords.component.formCreateFail'));
    //         }
    //     }, () => {
    //         self.loading = false;
    //         self.canCreate = true;
    //         showMessage($translate('customMessage.serverError')); // lang.ComServerError
    //     });
    // };

    // function handleCreateDialogController(mdDialog) {
    //     const vm = this;
    //     vm.hide = function hide() {
    //         mdDialog.hide();
    //     };

    //     vm.cancel = function cancel() {
    //         mdDialog.cancel();
    //     };

    //     vm.ok = function ok() {
    //         postDialysis();
    //         mdDialog.hide();
    //     };
    // }

    // function postDialysis() {
    //     self.loading = true;
    //     dialysisService.post(patientId).then((q) => {
    //         if (q.status === 200) {
    //             showMessage($translate('allDialysisRecords.component.formCreateSuccess'));
    //             // $state.go('overview', { patientId: self.patientId, headerId: q.data.Id }, { reload: true });
    //             // go to summary with the latest result
    //             // TODO: check for bugs
    //             // dialysisService.getLast(self.patientId, false).then((res) => {
    //             //     if (res.data.Count > 0) {
    //             //         return res.data.DialysisHeader.Id;
    //             //     }
    //             //     return 'none';
    //             // }).then((headerId) => {
    //             //     $state.go('summary', { patientId: self.patientId, headerId }, { notify: true, reload: true, location: 'replace' });
    //             // });
    //             $state.go('summary', { patientId, headerId: 'last' }, { notify: true, reload: true, location: 'replace' });
    //         } else {
    //             self.loading = false;
    //             self.canCreate = true;
    //             showMessage($translate('allDialysisRecords.component.formCreateFail'));
    //         }
    //     }, () => {
    //         self.loading = false;
    //         self.canCreate = true;
    //         showMessage($translate('allDialysisRecords.component.formCreateFail'));
    //     });
    // }

    // self.columnTd = 0;
    // // 算出欄位，是否有少於8欄
    // if (self.data.DialysisData.length <= 8) {
    //     let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
    //     self.columnTd = range;
    // }

    // // self.columnTd2 = 0;
    // // // 算出欄位，是否有少於13欄
    // // if (self.data.DialysisData.length <= 13) {
    // //     let range2 = Array.from(Array(13 - self.data.DialysisData.length).keys());
    // //     self.columnTd2 = range2;
    // // }

    // // 20181108改:分頁顯示
    // // 算頁數
    // // Math.ceil(5/2) 向上取整數(有小數就+1)
    // let pageCntTotal = 0;
    // self.CRRTTable = [];
    // let CRRTItem = {};
    // if (self.data.DialysisData.length > 0) {
    //     pageCntTotal = Math.ceil(self.data.DialysisData.length / 13); // 總頁數
    //     for (let i = 0; i < pageCntTotal; i++) {
    //         CRRTItem = {};
    //         CRRTItem.pageNo = i + 1;
    //         CRRTItem.DialysisData = [];
    //         let j = 0;
    //         self.data.DialysisData.forEach((x) => {
    //             j += 1;
    //             if (j >= ((i * 13) + 1) && j <= ((i * 13) + 13)) {
    //                 CRRTItem.DialysisData.push(x);
    //             }
    //         });
    //         if (i === pageCntTotal - 1) {
    //             CRRTItem.columnTd2 = Array.from(Array((13 * pageCntTotal) - self.data.DialysisData.length).keys());
    //         } else {
    //             CRRTItem.columnTd2 = [];
    //         }
    //         self.CRRTTable.push(CRRTItem);
    //     }
    // } else {
    //     CRRTItem.pageNo = 1;
    //     CRRTItem.DialysisData = self.data.DialysisData;
    //     CRRTItem.columnTd2 = Array.from(Array(13 - self.data.DialysisData.length).keys());
    //     self.CRRTTable.push(CRRTItem);
    // }
    // console.log('CRRTTable', self.CRRTTable);

    // self.columnTd3 = 0;
    // // 算出欄位，是否有少於18欄
    // if (self.data.DoctorNotes.length <= 18) {
    //     let range3 = Array.from(Array(18 - self.data.DoctorNotes.length).keys());
    //     self.columnTd3 = range3;
    // }

    // // 血管通路
    // self.VesselAssessment = '';
    // if (self.data.DialysisHeader.VesselAssessments.length > 0) {
    //     if (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterType === 'AVFistula' || self.data.DialysisHeader.VesselAssessments[0].Data.CatheterType === 'AVGraft') {
    //         switch (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position) {
    //             case 'forearm':
    //                 self.VesselAssessment = '前臂(含腕部)';
    //                 break;
    //             case '1':
    //                 self.VesselAssessment = '前臂(含腕部)';
    //                 break;
    //             case 'upperArm':
    //                 self.VesselAssessment = '上臂(含肘部)';
    //                 break;
    //             case '2':
    //                 self.VesselAssessment = '上臂(含肘部)';
    //                 break;
    //             case 'thigh':
    //                 self.VesselAssessment = '大腿';
    //                 break;
    //             case '3':
    //                 self.VesselAssessment = '大腿';
    //                 break;
    //             case 'calf':
    //                 self.VesselAssessment = '小腿';
    //                 break;
    //             case '4':
    //                 self.VesselAssessment = '小腿';
    //                 break;
    //             case 'IJV':
    //                 self.VesselAssessment = '內頸靜脈';
    //                 break;
    //             case 'SV':
    //                 self.VesselAssessment = '鎖股下靜脈';
    //                 break;
    //             case 'FV':
    //                 self.VesselAssessment = '股靜脈';
    //                 break;
    //             default:
    //                 self.VesselAssessment = self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position;
    //                 break;
    //             }
    //     } else {
    //         switch (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position) {
    //             case 'forearm':
    //                 self.VesselAssessment = '前臂(含腕部)';
    //                 break;
    //             case 'upperArm':
    //                 self.VesselAssessment = '上臂(含肘部)';
    //                 break;
    //             case 'thigh':
    //                 self.VesselAssessment = '大腿';
    //                 break;
    //             case 'calf':
    //                 self.VesselAssessment = '小腿';
    //                 break;
    //             case 'IJV':
    //                 self.VesselAssessment = '內頸靜脈';
    //                 break;
    //             case '1':
    //                 self.VesselAssessment = '內頸靜脈';
    //                 break;
    //             case 'SV':
    //                 self.VesselAssessment = '鎖股下靜脈';
    //                 break;
    //             case '2':
    //                 self.VesselAssessment = '鎖股下靜脈';
    //                 break;
    //             case 'FV':
    //                 self.VesselAssessment = '股靜脈';
    //                 break;
    //             case '3':
    //                 self.VesselAssessment = '股靜脈';
    //                 break;
    //             default:
    //                 self.VesselAssessment = self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position;
    //                 break;
    //             }
    //     }
    // }

    // self.CatheterType = '';

    // // 洗前評估
    // // when it has assessment records
    // self.preAssessment = [];
    // if (self.data.AssessmentRecords.length > 0) {
    //     // sort records by record time
    //     self.data.AssessmentRecords = _.sortBy(self.data.AssessmentRecords, function (o) { return o.RecordTime; });

    //     // 洗前評估
    //     // filter out pre-assessment records
    //     let preAssessmentRecords = _.filter(self.data.AssessmentRecords, {
    //         'Type': 'pre'
    //     });
    //     let preAssessmentCount = preAssessmentRecords.length;
    //     // console.log('preAssessmentRecords:', preAssessmentRecords);
    //     // console.log('preAssessmentCount:', preAssessmentCount);
    //     // initialize pre assessment object
    //     // self.preAssessment = {};
    //     let assItem = '';

    //     // if there is pre assessment record
    //     if (preAssessmentCount > 0) {

    //         // 取得評估資料--洗前
    //         assessmentService.getByType('pre').then((resp1) => {
    //             console.log('resp1:', resp1);
    //             self.assessments_pre = resp1.data.Items;
    //             self.assessments_pre.forEach((i) => {
    //                 // console.log(i.Item);
    //                 if (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item]) {
    //                     if (i.Item === 'ECMO') {
    //                         self.CatheterType = 'V ECMO';
    //                     } else {
    //                         assItem = i.Item + ' : ' + (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item] ? preAssessmentRecords[preAssessmentCount - 1].Items[i.Item].toString() : '');
    //                         self.preAssessment.push(assItem);
    //                     }
    //                 }
    //             });
    //             // 文字性評估描述欄
    //             console.log('Description:', preAssessmentRecords[preAssessmentCount - 1].Description);
    //             if (preAssessmentRecords[preAssessmentCount - 1].Description !== null) {
    //                 self.preAssessment.push(preAssessmentRecords[preAssessmentCount - 1].Description);
    //             }
    //         });
    //         // // // get the latest record
    //         // // self.preAssessment.Previous = 'Bleeding : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['Bleeding'] ? preAssessmentRecords[preAssessmentCount - 1].Items['Bleeding'][0] : '');
    //         // // self.preAssessment.Current = 'Bruit : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['Bruit'] ? preAssessmentRecords[preAssessmentCount - 1].Items['Bruit'][0] : '');
    //         // // self.preAssessment = preAssessmentRecords[preAssessmentCount - 1].Items;
    //         // assItem = '前次透析後狀況 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'].toString() : '');
    //         // self.preAssessment.push(assItem);
    //         // assItem = '外觀 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['外觀'] ? preAssessmentRecords[preAssessmentCount - 1].Items['外觀'].toString() : '');
    //         // self.preAssessment.push(assItem);
    //         // assItem = '本次透析前狀況 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'].toString() : '');
    //         // self.preAssessment.push(assItem);
    //         // assItem = '血流量 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['血流量'] ? preAssessmentRecords[preAssessmentCount - 1].Items['血流量'].toString() : '');
    //         // self.preAssessment.push(assItem);
    //         // // // debugger;
    //         // // // self.preAssessment = preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'];
    //         console.log('preAssessment:', self.preAssessment);
    //     }
    // }

    // // 檢驗檢查
    // self.labexamData = [];
    // // self.labexamDataArray = [];
    // labexamService.getByPatientId(patientId, 90, false)
    // .then((q) => {
    //     console.log('檢驗檢查 q.data', q.data);
    //     self.labexamData = q.data.filter(x => x.Status === 'Normal');
    //     // self.deletedItemsLength = q.data.filter(x => x.Status === 'Deleted').length;
    //     // 抓取全部日期，只到日期 [2017-10-22, 2017-09-16, 2017-09-14]
    //     self.checkTimeList = self.labexamData.sort((a, b) => {
    //         if (a.CheckTime < b.CheckTime) return 1;
    //         return -1;
    //     }).map(i => moment(i.CheckTime).format('YYYY/MM/DD HH:mm')).filter((item, pos, ary) => {
    //         return !pos || item !== ary[pos - 1];
    //     });
    //     // console.log('checkTimeList', self.checkTimeList);

    //     // let cellstr = 'BUN,Cr,Na,K,Cl,P,Hct,Hb,Plate';
    //     let cellstr = 'Bun,Creatinine,Na(Sodium),K(Potassium),Cl(Chloride),Inorganic P,Hematocrit,Hemoglobin,Platelets';
    //     let cellArray = cellstr.split(',');

    //     self.tArray = []; // 先宣告一維
    //     for (let k = 0; k < 4; k++) { // 一維長度為i,i為變數，可以根據實際情況改變
    //         self.tArray[k] = []; // 宣告二維，每一個一維陣列裡面的一個元素都是一個陣列；
    //         for (let j = 0; j < 9; j++) { // 一維陣列裡面每個元素陣列可以包含的數量p，p也是一個變數；
    //             self.tArray[k][j] = getLabexamData(self.checkTimeList[k], cellArray[j]); // 這裡將變數初始化，我這邊統一初始化為空，後面在用所需的值覆蓋裡面的值
    //         }
    //     }
    //     console.log('tArray', self.tArray);
    // });

    // function getLabexamData(ind, item) {
    //     let t = '';
    //     if (self.labexamData.length > 0) {
    //         self.labexamData.forEach((j) => {
    //             let newDate = new Date(j.CheckTime);
    //             let indDate = new Date(ind);
    //             if (newDate.toLocaleDateString().substring(0, 10) === indDate.toLocaleDateString().substring(0, 10) && j.Name.toUpperCase() === item.toUpperCase()) {
    //                 t = j.Value;
    //             }
    //         });
    //     }
    //     return t;
    // }



    // // 呼吸機最後一筆資料 且 totalUF != null
    // self.lastRecord = null;
    // self.data.DialysisData.forEach((x) => {
    //     if (x.TotalUF !== null) {
    //         self.lastRecord = x;
    //     }
    // });
    // console.log('呼吸機最後一筆資料 且 totalUF != null', self.lastRecord);

    // // 實際脫水量
    // if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
    //     self.realUF = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
    // }

    // // 結束體重
    // if (self.data.DialysisHeader && (self.data.DialysisHeader.StandardWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
    //     self.WeightAfter = Math.round((self.data.DialysisHeader.WeightAfterDialysis - self.data.DialysisHeader.StandardWeight) * 100) / 100;
    // }

    // // 透析後脫水誤差
    // if (self.lastRecord && self.lastRecord.TotalUF) {
    //     self.diffUF = Math.round((self.lastRecord.TotalUF - self.realUF) * 100) / 100;
    // }

    // // Weight loss 透析前體重 - 透析後體重
    // if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
    //     self.Weightloss = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
    // }

    // // 實際透析時間 = 開始 - 結束
    // self.dialysisRealTime = null;
    // if (self.data.DialysisHeader.DialysisDataLastTime && self.data.DialysisHeader.DialysisDataFirstTime) {
    //     let diff = moment(self.data.DialysisHeader.DialysisDataLastTime).diff(self.data.DialysisHeader.DialysisDataFirstTime);
    //     let duration = moment.duration(diff);
    //     self.dialysisRealTime = duration.hours() + '時' + duration.minutes() + '分';
    // }

    // // Weight gain 透析前體重 - 處方的標準體重
    // self.WeightGain = null;
    // if (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.StandardWeight) {
    //     self.WeightGain = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.Prescription.StandardWeight) * 100) / 100;
    // }

    // // Hct filter last CheckTime Value
    // if (self.data.LabExams.length > 0) {
    //     self.Hct = null;
    //     self.Hb = null;
    //     let hct = self.data.LabExams.filter(x => x.Name === 'Hct').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
    //     if (hct.length > 0) {
    //         self.Hct = hct.reduce(x => x);
    //     }
    //     let hb = self.data.LabExams.filter(x => x.Name === 'Hb').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
    //     if (hb.length > 0) {
    //         self.Hb = hb.reduce(x => x);
    //     }
    // }
    // // 抓異常項目子集合
    // self.AbnormalItems = [];
    // if (self.data.APOs && self.data.APOs.some(x => x.AbnormalItem)) {
    //     self.data.APOs.map(x => {
    //         self.AbnormalItems.push(x.AbnormalItem);
    //     });
    // }

    // // piyavate
    // // get the catheter volume when catheter type is 'Permanent' or 'DoubleLumen'
    // function getCatheterVolume() {
    //     // get vessel assessment record count
    //     let vesselAssessmentCount = self.data.DialysisHeader.VesselAssessments.length;
    //     // if vessel assessment record is greater than 0
    //     if (vesselAssessmentCount > 0) {
    //         // get the latest vessel assessment record
    //         let lastVesselAssessmentRecord = self.data.DialysisHeader.VesselAssessments[vesselAssessmentCount - 1];
    //         // get the catheter type (Permanent, DoubleLumen, AVFistula, Avgraft)
    //         let catheterType = lastVesselAssessmentRecord.Data.CatheterType;
    //         // check if catheterType = Permanent or DoubleLumen (unit in ml)
    //         if (catheterType === 'Permanent' || catheterType === 'DoubleLumen') {
    //             return {
    //                 'ArteryCatheter': lastVesselAssessmentRecord.ArteryCatheter,
    //                 'VeinCatheter': lastVesselAssessmentRecord.VeinCatheter
    //             };
    //         }
    //         return 0;
    //     }
    //     return 0;
    // }

    // // if it contains 'Other' then change it to '其它'
    // function checkForOther(assessmentArray, otherValue = '') {
    //     if (assessmentArray) {
    //         // if it contains 'Other'
    //         if (assessmentArray.includes('Other')) {
    //             let indexOfOther = assessmentArray.indexOf('Other');

    //             // 'Other' is in the second last position
    //             if (indexOfOther !== assessmentArray.length - 1) {
    //                 assessmentArray[indexOfOther] = otherValue === '' ? '其它：' + assessmentArray[assessmentArray.length - 1] : '異常：' + assessmentArray[assessmentArray.length - 1];
    //                 assessmentArray.splice(assessmentArray.length - 1, 1);
    //             } else {
    //                 // 'Other' is in last position
    //                 assessmentArray[indexOfOther] = otherValue === '' ? '其它' : '異常';
    //             }
    //         }
    //     }
    // }

    // let arr = self.data.DialysisData.filter(x => x.MacAddress).map(x => x.MacAddress);
    // if (arr.length > 0) {
    //     self.lastMacAddress = arr[arr.length - 1].slice(-6);
    // }

    // self.calculateActualTime = function () {
    //     if (self.data.StartTime && self.data.EndTime) {
    //         moment(self.data.EndTime).diff(self.data.StartTime).format('HH:mm');
    //     }
    // };

    // self.gotoOverview = function goto() {
    //     $state.go('overview', { headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoNursingRecords = function goto() {
    //     $state.go('nursingRecord', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoAssessment = function goto() {
    //     $state.go('assessment', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoMachineData = function goto() {
    //     $state.go('machineData', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoDoctorNote = function goto(event) {
    //     if (event && typeof event.stopPropagation === 'function') {
    //         event.stopPropagation();
    //     }
    //     $state.go('doctorNote', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };

    // self.gotoBloodTransfusion = function () {
    //     $state.go('bloodTransfusion').then(() => {
    //         self.clicked = true;
    //     });
    // };

    // self.gotoPrescription = function () {
    //     $state.go('allPrescriptions').then(() => {
    //         self.clicked = true;
    //     });
    // };

    // self.gotoExecutionRecord = function () {
    //     $state.go('allExecutionRecord').then(() => {
    //         self.clicked = true;
    //     });
    // };


}

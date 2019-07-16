import jiade from './jiade.component.html'; // 佳德表單
import './jiade.component.less';

angular.module('app').component('jiadeReport', {
    bindings: {
        // data: '<',
        patient: '<',
        headerId: '<'
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: jiade,
    controller: jiadeController
});

jiadeController.$inject = ['$filter', '$state', '$stateParams', 'SettingService', 'shiftIssueService', 'labexamService', 'assessmentService', '$mdDialog', 'dialysisService', 'showMessage', 'BloodTransfusionService', 'summaryReportService'];

function jiadeController($filter, $state, $stateParams, SettingService, shiftIssueService, labexamService, assessmentService, $mdDialog, dialysisService, showMessage, BloodTransfusionService, summaryReportService) {
    console.log('enter summary content component jiadeReport');
    const self = this;
    console.log('self.headerId', self.headerId);
    console.log('patient', self.patient);

    let $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();

    // 表單標題
    self.dialysisRecordTable = SettingService.getCurrentHospital().FormTitle;

    self.$onInit = function () {
        prepareData();
    };

    function prepareData() {
        self.loading = true;
        summaryReportService.getCommonSummaryData($stateParams.patientId, self.headerId).then((res) => {
            self.data = res.data;
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

            // 抗凝劑 Heparin 初劑量 200, 維持量 250
            self.Anticoagulants = [];
            if (self.data.DialysisHeader.Prescription !== null) {
                for (let i = 0; i < Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants).length; i++) {
                    let key = Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants)[i];
                    // console.log('key:', key);
                    // console.log('0:', self.data.DialysisHeader.Prescription.Anticoagulants[key][0]);
                    // console.log('1:', self.data.DialysisHeader.Prescription.Anticoagulants[key][1]);
                    self.Anticoagulants.push(key + '：' + self.data.DialysisHeader.Prescription.Anticoagulants[key][0] + 'u / ' + self.data.DialysisHeader.Prescription.Anticoagulants[key][1] + 'u');
                }
            }

            // 照護者
            self.careUser = [];
            if (self.data.DialysisHeader.CareUsers !== null) {
                for (let i = 0; i < Object.keys(self.data.DialysisHeader.CareUsers).length; i++) {
                    let key = Object.keys(self.data.DialysisHeader.CareUsers)[i];
                    self.careUser.push(self.data.DialysisHeader.CareUsers[key]);
                }
            }

            // Total UF
            self.TotalUF = '';
            if (self.data.DialysisData.length > 0) {
                self.TotalUF = self.data.DialysisData[self.data.DialysisData.length - 1].TotalUF;
            }

            // // EPO, 依日期取得當月的資料
            // self.epoData = self.data.EPOExecutions.filter(item => item.Status !== 'Deleted');
            // console.log('epo:', self.epoData);
            // epoExecutionService.getListByMonth(patientId, moment(self.data.DialysisHeader.StartTime).format('YYYY-MM-DD'), true).then((q) => {
            //     self.epoData = q.data.filter(item => item.Status !== 'Deleted');
            // });

            // 輸血
            BloodTransfusionService.get($stateParams.headerId).then((q) => {
                self.bloodData = q.data.filter(item => item.Status !== 'Deleted');
            });

            // 透析機資料
            self.columnTd2 = [];
            if (self.data.DialysisData.length <= 9) {
                self.columnTd2 = Array.from(Array(9 - self.data.DialysisData.length).keys());
            }

            // 洗中評估
            self.AssessmentItems = [];
            for (let i = 0; i < self.data.DialysisData.length; i++) {
                if (self.data.DialysisData[i].Status !== 'Deleted' && Object.keys(self.data.DialysisData[i].AssessmentItems).length > 0) {
                    let AssessmentStr = "";
                    for (let j = 0; j < Object.keys(self.data.DialysisData[i].AssessmentItems).length; j++) {
                        let key = Object.keys(self.data.DialysisData[i].AssessmentItems)[j];
                        console.log('key:', key);
                        console.log('cont', self.data.DialysisData[i].AssessmentItems[key]);
                        AssessmentStr += key + ":" + self.data.DialysisData[i].AssessmentItems[key].join(',') + ",";
                        // self.AssessmentItems.push(self.data.DialysisData[i].AssessmentItems[key]);
                    }
                    self.AssessmentItems.push(AssessmentStr);
                    console.log('self.AssessmentItems:', self.AssessmentItems);
                } else {
                    self.AssessmentItems.push("");
                }
            }

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

    // // 洗前評估+洗後評估
    // self.AssessmentRecords = [];
    // // console.log(self.data.AssessmentRecords);
    // for (let i = 0; i < self.data.AssessmentRecords.length; i++) {
    //     if (self.data.AssessmentRecords[i].Status !== 'Deleted') {
    //         let AssessmentRecordsItem = {};
    //         let asStr = moment(self.data.AssessmentRecords[i].RecordTime).format('HH:mm') + ' ';
    //         for (let j = 0; j < Object.keys(self.data.AssessmentRecords[i].Items).length; j++) {
    //             let key = Object.keys(self.data.AssessmentRecords[i].Items)[j];
    //             // console.log('key:', key);
    //             // console.log('cont', self.data.AssessmentRecords[i].Items[key].toString());
    //             asStr += key + '：' + self.data.AssessmentRecords[i].Items[key].toString() + '　';
    //         }
    //         AssessmentRecordsItem.cont = asStr;
    //         AssessmentRecordsItem.CreatedUserName = self.data.AssessmentRecords[i].CreatedUserName;
    //         AssessmentRecordsItem.ModifiedUserName = self.data.AssessmentRecords[i].ModifiedUserName;
    //         self.AssessmentRecords.push(AssessmentRecordsItem);
    //     }
    // }

    // // 交班事項
    // self.shiftIssueData = [];
    // shiftIssueService.getByPatientId(patientId, false).then((res) => {
    //     res.data.forEach((x) => {
    //         if (x.Status !== 'Deleted' && moment(self.data.DialysisHeader.StartTime).format('YYYY-MM-DD') === moment(x.RecordTime).format('YYYY-MM-DD')) {
    //         // if (x.Status !== 'Deleted' && moment(x.RecordTime).format('YYYY-MM-DD') === '2018-04-17') {
    //             self.shiftIssueData.push(x);
    //         }
    //     });
    // });

    // self.gotoOverview = function goto() {
    //     $state.go('overview', { headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoMachineData = function goto() {
    //     $state.go('machineData', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoNursingRecords = function goto() {
    //     $state.go('nursingRecord', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };
    // self.gotoDoctorNote = function goto(event) {
    //     if (event && typeof event.stopPropagation === 'function') {
    //         event.stopPropagation();
    //     }
    //     $state.go('doctorNote', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
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

    // self.gotoAssessment = function goto() {
    //     $state.go('assessment', { patientId, headerId: self.data.DialysisHeader.Id });
    //     self.clicked = true;
    // };

    // self.gotoBloodTransfusion = function () {
    //     $state.go('bloodTransfusion').then(() => {
    //         self.clicked = true;
    //     });
    // };
}

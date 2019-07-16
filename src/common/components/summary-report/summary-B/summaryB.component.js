import templateB from './summaryB.component.html'; // 系統設定 選項C 圖檔 formB.jpg
import './summaryB.component.less';

angular.module('app').component('summaryB', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: templateB,
    controller: SummaryBController
})
    .filter('rhMode', ['$filter', $filter => function rhMode(value) { // RH 轉
        const $translate = $filter('translate');
        switch (value) {
            case '+':
                return $translate('summaryContent.RHPos');
            case '-':
                return $translate('summaryContent.RHNeg');
            default:
                return $translate('summaryContent.RHUnknown');
        }
    }])
    .filter('catheterSide', ['$filter', ($filter) => {
        return (side) => {
            const $translate = $filter('translate');

            switch (side) {
                case 'right':
                    return $translate('vesselAssessment.vesselAssessment.right');
                case 'left':
                    return $translate('vesselAssessment.vesselAssessment.left');
                default:
                    return side;

            }
        };
    }])
    .filter('catheterPosition', ['$filter', ($filter) => {
        return (position) => {
            const $translate = $filter('translate');

            switch (position) {
                case 'forearm':
                    return $translate('vesselAssessment.vesselAssessment.forearm');
                case 'upperArm':
                    return $translate('vesselAssessment.vesselAssessment.upperArm');
                case 'thigh':
                    return $translate('vesselAssessment.vesselAssessment.thigh');
                case 'calf':
                    return $translate('vesselAssessment.vesselAssessment.calf');
                case 'IJV':
                    return $translate('vesselAssessment.vesselAssessment.IJV');
                case 'SV':
                    return $translate('vesselAssessment.vesselAssessment.SV');
                case 'FV':
                    return $translate('vesselAssessment.vesselAssessment.FV');
                default:
                    return position;
            }
        };
    }]);

SummaryBController.$inject = ['$filter', '$state', '$stateParams', 'dialysisService', 'showMessage', 'SettingService', 'summaryReportService'];

function SummaryBController($filter, $state, $stateParams, dialysisService, showMessage, SettingService, summaryReportService) {
    console.log('enter summary content component');
    const self = this;
    console.log('data', self.data);
    console.log('patient', self.patient);

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

            self.columnTd = 0;
            // 算出欄位，是否有少於8欄
            if (self.data.DialysisData.length <= 8) {
                let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
                self.columnTd = range;
            }

            // summaryContent EPO rows
            if (self.data.EPOExecutions.length <= 3) {
                let range = Array.from(Array(3 - self.data.EPOExecutions.length).keys());
                self.epoRows = range;
            }

            // 呼吸機最後一筆資料 且 totalUF != null
            self.lastRecord = null;
            self.data.DialysisData.forEach((x) => {
                if (x.TotalUF !== null) {
                    self.lastRecord = x;
                }
            });
            console.log('呼吸機最後一筆資料 且 totalUF != null', self.lastRecord);

            // 實際脫水量
            if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
                self.realUF = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
            }

            // 結束體重
            if (self.data.DialysisHeader && (self.data.DialysisHeader.StandardWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
                self.WeightAfter = Math.round((self.data.DialysisHeader.WeightAfterDialysis - self.data.DialysisHeader.StandardWeight) * 100) / 100;
            }

            // 透析後脫水誤差
            if (self.lastRecord && self.lastRecord.TotalUF) {
                self.diffUF = Math.round((self.lastRecord.TotalUF - self.realUF) * 100) / 100;
            }

            // Weight loss 透析前體重 - 透析後體重
            if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
                self.Weightloss = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
            }

            // 實際透析時間 = 開始 - 結束
            self.dialysisRealTime = null;
            if (self.data.DialysisHeader.DialysisDataLastTime && self.data.DialysisHeader.DialysisDataFirstTime) {
                let diff = moment(self.data.DialysisHeader.DialysisDataLastTime).diff(self.data.DialysisHeader.DialysisDataFirstTime);
                let duration = moment.duration(diff);
                self.dialysisRealTime = duration.hours() + '時' + duration.minutes() + '分';
            }

            // Weight gain 透析前體重 - 處方的標準體重
            self.WeightGain = null;
            if (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.StandardWeight) {
                self.WeightGain = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.Prescription.StandardWeight) * 100) / 100;
            }

            // Hct filter last CheckTime Value
            if (self.data.LabExams.length > 0) {
                self.Hct = null;
                self.Hb = null;
                let hct = self.data.LabExams.filter(x => x.Name === 'Hct').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
                if (hct.length > 0) {
                    self.Hct = hct.reduce(x => x);
                }
                let hb = self.data.LabExams.filter(x => x.Name === 'Hb').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
                if (hb.length > 0) {
                    self.Hb = hb.reduce(x => x);
                }
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
}

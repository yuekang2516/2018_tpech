import ansn from './ansn.component.html'; // 安慎表單
import './ansn.component.less';

angular.module('app').component('ansnReport', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: ansn,
    controller: ansnController
})
    .filter('AnticoagulantValue', () => function AnticoagulantValue(value) { // 抗凝劑
        return value.join('/');
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
    .filter('TdRange', () => function range(n) {
        return _.range(0, n);
    })
    .filter('catheterType', ['$filter', ($filter) => {
        return (catheterType) => {
            const $translate = $filter('translate');

            switch (catheterType) {
                case 'AVFistula':
                    return $translate('overview.component.AVFistula');
                case 'AVGraft':
                    return $translate('overview.component.AVGraft');
                case 'Permanent':
                    return $translate('overview.component.Permanent');
                case 'DoubleLumen':
                    return $translate('overview.component.DoubleLumen');
                default:
                    return $translate('overview.component.typeError');
            }
        };
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

ansnController.$inject = ['$filter', '$state', '$stateParams', 'SettingService', 'summaryReportService'];

function ansnController($filter, $state, $stateParams, SettingService, summaryReportService) {
    console.log('enter summary content component');
    const self = this;
    console.log('data', self.data);
    console.log('patient', self.patient);

    let $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();

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
            // 表單標題
            self.dialysisRecordTable = SettingService.getCurrentHospital().FormTitle;
        
            document.getElementsByTagName('body')[0].onafterprint = function () {
                self.whiteframe = true;
            };
        
            self.columnTd = 0;
            // 算出欄位，是否有少於8欄
            if (self.data.DialysisData.length <= 8) {
                let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
                self.columnTd = range;
            }
        
            console.log('進安慎表單邏輯!!!');
            // 偏差邏輯：偏差＝TotalUF - 實際脫水量;  實際脫水量＝ |洗前體重- 洗後體重|
            self.deviation = '';
            console.log('透析機資料 self.data.DialysisData.length', self.data.DialysisData.length);
        
            // 有透析機資料，取得最後一筆資料的TotalUF
            if (self.data.DialysisData.length !== 0 && _.last(self.data.DialysisData).TotalUF) {
                // 有TotalUF
                if (
                    !isNaN(Number(_.last(self.data.DialysisData).TotalUF)) &&
                    !isNaN(Number(self.data.DialysisHeader.PredialysisWeight)) &&
                    !isNaN(Number(self.data.DialysisHeader.WeightAfterDialysis))
                ) {
                    // 實際脫水量 realDehydration
                    let realDehydration = Math.abs(
                        self.data.DialysisHeader.PredialysisWeight -
                        self.data.DialysisHeader.WeightAfterDialysis
                    ).toFixed(2);
                    self.deviation = _.last(self.data.DialysisData).TotalUF - realDehydration;
                } else {
                    // 有數值不是數字時，無法計算
                    self.deviation = '';
                }
            } else {
                // 無TotalUF
                self.deviation = '';
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

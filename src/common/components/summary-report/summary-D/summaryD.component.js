import templateD from './summaryD.component.html'; // 系統設定 選項A 圖檔 formD.jpg
import './summaryD.component.less';

angular.module('app').component('summaryD', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: templateD,
    controller: SummaryDController
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

SummaryDController.$inject = ['$filter', '$stateParams', 'SettingService', 'summaryReportService'];

function SummaryDController($filter, $stateParams, SettingService, summaryReportService) {
    console.log('enter summary content component');
    const self = this;
    console.log('data', self.data);
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

            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    self.refresh = function () {
        prepareData();
    };
}

import tpl from './overview-card.html';
import './overview-card.less';

angular.module('app').component('overviewCard', {
    template: tpl,
    controller: overviewCardCtrl
}).filter('prescriptionType', function ($filter) {
    return function (item) {
        const self = this;
        const $translate = $filter('translate');
        return item === 'LongTerm' ? $translate('overview.longTerm') : $translate('overview.temporary');
    };
});

overviewCardCtrl.$inject = ['$stateParams', 'OverViewService', '$filter'];

function overviewCardCtrl($stateParams, OverViewService, $filter) {
    const self = this;
    const $translate = $filter('translate');

    self.$onInit = function () {
        prepareData(true);
    };

    function prepareData(isForce) {
        self.loading = true;
        OverViewService.getByHeaderId($stateParams.headerId, isForce).then((res) => {
            self.dialysisHeader = res.data;
            // 透析日期
            self.dialysisStartTime = self.dialysisHeader.StartTime;

            // 有報到日顯示，沒有報到日不顯示
            if (self.dialysisHeader.CheckInTime) {
                self.dialysisHeader.CheckInTime = new Date(self.dialysisHeader.CheckInTime);
            }

            // 處理上機時間/下機時間
            if (self.dialysisHeader.DialysisDataFirstTime) {
                self.dialysisHeader.DialysisDataFirstTime = new Date(self.dialysisHeader.DialysisDataFirstTime);
            }
            if (self.dialysisHeader.DialysisDataLastTime) {
                self.dialysisHeader.DialysisDataLastTime = new Date(self.dialysisHeader.DialysisDataLastTime);
            }

            console.log('表頭資料 self.dialysisHeader', self.dialysisHeader);

            console.log('self.dialysisHeader.CheckStaff', self.dialysisHeader.CheckStaff);

            // 生理徵象合併，並排序 (日期)
            self.vitalSigns = [];
            if (self.dialysisHeader.PreVitalSign.length > 0) {
                self.dialysisHeader.PreVitalSign.map((o) => {
                    // 供前端判別透析前或是透析後
                    o.Type = 'pre';
                    return o;
                });
                self.vitalSigns = self.vitalSigns.concat(self.dialysisHeader.PreVitalSign);
            }
            if (self.dialysisHeader.PostVitalSign.length > 0) {
                self.dialysisHeader.PostVitalSign.map((o) => {
                    // 供前端判別透析前或是透析後
                    o.Type = 'post';
                    return o;
                });
                self.vitalSigns = self.vitalSigns.concat(self.dialysisHeader.PostVitalSign);
            }
            self.vitalSigns = _.sortBy(self.vitalSigns, ['RecordTime']);
            console.log('overviewCardCtrl vitalSigns', self.vitalSigns);

            // 病人來源，若從未選過預設為門診
            if (self.dialysisHeader.PatientSource) {
                switch (self.dialysisHeader.PatientSource) {
                    case 'emergency':
                        self.patientSource = $translate('overview.component.emergency');
                        break;
                    case 'inpatient':
                        self.patientSource = $translate('overview.component.hospitalized');
                        break;
                    default:
                        self.patientSource = $translate('overview.component.clinic');
                        break;
                }
            }

            // 是否有處方
            self.prescriptionLength = self.dialysisHeader.Prescription === null ?
                0 : Object.keys(self.dialysisHeader.Prescription).length;

            // 有處方才有模式次數
            // 處理模式次數：依照透析處方中顯示的模式，取相同模式之次數
            if (self.prescriptionLength !== 0 && Object.getOwnPropertyNames(self.dialysisHeader.Numbers).length > 0) {
                _.forEach(self.dialysisHeader.Numbers, function (value, key) {
                    console.log('模式', key);
                    if (Object.hasProperty(self.dialysisHeader, 'Prescription.DialysisMode.Name') && key === self.dialysisHeader.Prescription.DialysisMode.Name) {
                        self.modeTimes = value;
                    }
                });
            }

            self.anticoagulantsLength = self.dialysisHeader.Prescription === null ?
                0 : Object.keys(self.dialysisHeader.Prescription.Anticoagulants).length;

            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    self.refresh = function () {
        prepareData(true);
    };
}

import tpl from './vitalSignsCard.html';
import bloodPressureChartTpl from '../bloodPressureChart.html';

angular.module('app').component('vitalSignsCard', {
    template: tpl,
    controller: vitalSignsCardCtrl,
    bindings: {
        // preVitalSign: '=',
        // postVitalSign: '=',
        data: '=',
        dialysisStartTime: '<',
        showbpModule: '<'
    }
});

vitalSignsCardCtrl.$inject = ['$mdDialog', '$stateParams', '$mdMedia'];
function vitalSignsCardCtrl($mdDialog, $stateParams, $mdMedia) {
    const self = this;
    let vitalSignObj = {
        BPS: '',
        BPD: '',
        BloodPressurePosture: '臥',
        Temperature: null,
        Pulse: null,
        Respiration: null,
        RecordTime: new Date(moment().format('YYYY/MM/DD HH:mm')) // 預設是今天日期
    };

    // self.PreVitalSign = self.preVitalSign;
    // self.PostVitalSign = self.postVitalSign;

    // 血壓趨勢圖
    self.showBloodPressureChart = function showBloodPressureChart() {
        let data = {
            dialysisStartTime: self.dialysisStartTime,
            patientId: $stateParams.patientId
        };
        $mdDialog.show({
            controller: 'bloodPressureChartController',
            controllerAs: 'dialog',
            bindToController: true,
            template: bloodPressureChartTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            multiple: true,
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok');
            $mdDialog.cancel();

        }, (cancel) => {
            console.log('dialog cancel');
            $mdDialog.cancel();
        });
    
    };

    // 生理徵象(最多3筆)：透析前 加一筆
    self.addPreVitalSign = function addPreVitalSign() {
        if (self.data.PreVitalSign.length < 3) {
            self.data.PreVitalSign.push(angular.copy(vitalSignObj));
            console.log('前 vitalSign：加一筆', self.data.PreVitalSign);
        }
    };
    // 生理徵象：透析前 減一筆
    self.deletePreVitalSign = function deletePreVitalSign(index) {
        self.data.PreVitalSign.splice(index, 1);
    };

    // 生理徵象(最多3筆)：透析後 加一筆
    self.addPostVitalSign = function addPostVitalSign() {
        if (self.data.PostVitalSign.length < 3) {
            self.data.PostVitalSign.push(angular.copy(vitalSignObj));
            console.log('後 vitalSign：加一筆', self.data.PostVitalSign);
        }
    };
    // 生理徵象：透析後 減一筆
    self.deletePostVitalSign = function deletePostVitalSign(index) {
        self.data.PostVitalSign.splice(index, 1);
    };

}

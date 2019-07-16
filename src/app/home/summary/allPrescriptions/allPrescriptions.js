import allPrescriptions from './allPrescriptions.html';
import './allPrescriptions.less';

angular
    .module('app')
    .component('allPrescriptions', {
        template: allPrescriptions,
        controller: allPrescriptionsCtrl,
        controllerAs: '$ctrl'
    });


allPrescriptionsCtrl.$inject = [
    '$state',
    '$stateParams',
    'SettingService',
    'PatientService'
];

function allPrescriptionsCtrl($state, $stateParams, SettingService, PatientService) {

    const self = this;
    const PRESCRIPTIONTAG = SettingService.getUISettingParams().PRESCRIPTIONTAG;
    self.patientId = $stateParams.patientId;
    // console.log('$stateParams.patientId:' + $stateParams.patientId);
    // self.CatheterHospitals = SettingService.getHospitalSettings();

    self.selectedIndex = -1;    // 需給預設值，若不給，會自動給 0 導致跑兩次

    // init
    self.$onInit = function onInit() {
        console.log('previous state', $state.previousState);
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                // self.patient = d.data;
                self.currentPatient = d.data;
                self.loading = false;

            }, (error) => {
                console.error('PatientService', error);
                self.loading = false;
                self.isError = true;
            });


        console.log('目前的 page name', $state.current.name);
        console.log('目前的 page name $state', $state);

        // 取得使用者之前閱覽的 tag
        let page = '';
        page = SettingService.getUISettingByKey(PRESCRIPTIONTAG) || 'HD';

        // https://github.com/angular/material2/issues/1692
        // fixes previous page problem
        setTimeout(() => {
            switch (page) {
                case 'allPrescriptions':  // HD
                case 'HD':
                    self.selectedIndex = 0;
                    break;
                case 'HDF':
                    self.selectedIndex = 1;  // HDF
                    break;
                case 'SLEDD-f':
                    self.selectedIndex = 2; // SLEDD-f
                    break;
                case 'INTERIM':  // 臨時
                    self.selectedIndex = 3;
                    break;
            }
        }, 0);
    };

    let previousSelectedIndex;
    self.$doCheck = function () {
        // 若是已在歷次透析處方此頁，而使用者又再次點選menu內的歷次透析處方時，會讓tab又回到第0個位置
        // if ($state.current.name === 'allPrescriptions') {
        //     self.selectedIndex = 0;
        //     previousSelectedIndex = -1;
        // }
        let currentSelectedIndex = self.selectedIndex && self.selectedIndex.valueOf();
        if (previousSelectedIndex !== currentSelectedIndex) {

            switch (currentSelectedIndex) {
                case 0:
                    self.goto('prescriptionTabPage', 'HD'); // HD
                    SettingService.setUISetting({ name: PRESCRIPTIONTAG, value: 'HD' });
                    break;
                case 1:
                    self.goto('prescriptionTabPage', 'HDF');  // HDF
                    SettingService.setUISetting({ name: PRESCRIPTIONTAG, value: 'HDF' });
                    break;
                case 2:
                    self.goto('prescriptionTabPage', 'SLEDD-f');  // SLEDD-f
                    SettingService.setUISetting({ name: PRESCRIPTIONTAG, value: 'SLEDD-f' });
                    break;
                case 3:
                    self.goto('prescriptionTabPage', 'INTERIM');  // 臨時
                    SettingService.setUISetting({ name: PRESCRIPTIONTAG, value: 'INTERIM' });
                    break;
            }
            previousSelectedIndex = currentSelectedIndex;
        }
    };


    self.back = function back() {
        // console.log($stateParams.PatientId);
        // $state.go('summary', { PatientId: patientId });
        if ($state.previousStateName) {
            history.go(-1);
        } else {
            $state.go('allPatients');
        }
    };

    self.goto = function goto(routeName, tag) {
        $state.go(routeName, { tag: tag }, { location: 'replace' });
    };


    self.goback = function goback() {
        history.go(-1);

    };

}


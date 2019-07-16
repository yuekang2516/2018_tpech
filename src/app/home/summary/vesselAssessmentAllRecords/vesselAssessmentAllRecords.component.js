import vesselAssessmentAllRecords from './vesselAssessmentAllRecords.html';

angular
    .module('app')
    .component('vesselAssessmentAllRecords', {
        template: vesselAssessmentAllRecords,
        controller: vesselAssessmentAllRecordsCtrl,
        controllerAs: '$ctrl'
    });


vesselAssessmentAllRecordsCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    '$mdToast',
    'SettingService',
    '$mdMedia',
    'showMessage',
    'PatientService',
    'Upload',
    'infoService',
    '$scope'
];

function vesselAssessmentAllRecordsCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    $mdToast, SettingService, $mdMedia, showMessage, PatientService,
    Upload, infoService, $scope) {

    const self = this;
    self.patientId = $stateParams.patientId;
   // console.log('$stateParams.patientId:' + $stateParams.patientId);
    // self.CatheterHospitals = SettingService.getHospitalSettings();


    // 偵測目前是否有對話框存在，若有，使用者按上一頁時 state 不 change 並取消當前對話框
    $scope.$on('$locationChangeStart', function ($event) {
        // Check if there is a dialog active
        if (angular.element(document).find('md-dialog').length > 0) {
            $event.preventDefault(); // Prevent route from changing
            $mdDialog.cancel();  // Cancel the active dialog
        }
    });

    // init
    self.$onInit = function onInit() {

        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                self.loading = false;

            }, (error) => {
                console.error('PatientService', error);
                self.loading = false;
                self.isError = true;
            });

        switch ($state.current.name) {
            case 'vesselAssessmentAllRecords':
            case 'vesselassessment':  // 血管通路紀錄
                self.selectedIndex = 0;
                break;
            case 'vesselAssessmentProblemsList':
                self.selectedIndex = 1;  // 血管通路問題
                break;
            case 'abnormalVesselAssessment':  // 血管異常處置紀錄
                self.selectedIndex = 2;
                break;
        }
    };

    let previousSelectedIndex;
    self.$doCheck = function () {
        let currentSelectedIndex = self.selectedIndex && self.selectedIndex.valueOf();
        if (previousSelectedIndex !== currentSelectedIndex) {

            switch (currentSelectedIndex) {
                case 0:
                    self.goto('vesselassessment', self.patientId); // 血管通路紀錄
                    break;
                case 1:
                    self.goto('vesselAssessmentProblemsList', self.patientId);  // 血管異常處置紀錄
                    break;
                case 2:
                    self.goto('abnormalVesselAssessment', self.patientId);  // 血管異常處置紀錄
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

    self.goto = function goto(routeName) {
        $state.go(routeName, { patientId: self.patientId }, { location: 'replace' });
    };


    self.goback = function goback() {
        $window
            .history
            .back();
    };

}


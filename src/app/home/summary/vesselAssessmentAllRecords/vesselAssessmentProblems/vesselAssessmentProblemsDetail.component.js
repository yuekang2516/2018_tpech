import vesselAssessmentProblemsDetail from './vesselAssessmentProblemsDetail.html';

angular
    .module('app')
    .component('vesselAssessmentProblemsDetail', {
        template: vesselAssessmentProblemsDetail,
        controller: vesselAssessmentProblemsDetailCtrl,
        controllerAs: '$ctrl'
    });

vesselAssessmentProblemsDetailCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'vesselAssessmentProblemsService',
    '$mdToast',
    'SettingService',
    '$mdMedia',
    'showMessage',
    'PatientService',
    'infoService',
    '$timeout',
    '$filter'
];

function vesselAssessmentProblemsDetailCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    vesselAssessmentProblemsService, $mdToast, SettingService, $mdMedia, showMessage, PatientService,
    infoService, $timeout, $filter) {
    const self = this;

    let $translate = $filter('translate');

    self.user = SettingService.getCurrentUser();
    console.log('self.user:' + self.user);
    self.today = moment().format('YYYY-MM-DDT23:59:59');

    self.useHospitalKeyIn = '';
    self.vesselAssessmentProblemsId = $stateParams.vesselAssessmentProblemsId;
    console.log('self.vesselAssessmentProblemsId:' + self.vesselAssessmentProblemsId);
    self.CatheterHospitals = SettingService.getHospitalSettings();
    console.log('self.CatheterHospitals:' + self.CatheterHospitals);

    // init
    self.$onInit = function $onInit() {
        // 需使用最新的 hospital setting，因此要重整
        infoService.reload().then(() => { }, () => { showMessage($translate('customMessage.serverError')); }); // lang.ComServerError

        if ($stateParams.vesselAssessmentProblemsId) {  // load 舊資料
            self.loading = true;
            PatientService.getById($stateParams.patientId, true)
                .then((p) => {
                    self.patient = p.data;
                    vesselAssessmentProblemsService
                        .getById($stateParams.vesselAssessmentProblemsId)
                        .then((q) => {
                            self.data = angular.copy(q.data);
                            if (typeof q.data === 'object') {
                                self.data.RecordDate = new Date(moment(self.data.RecordDate).format('YYYY/MM/DD HH:mm'));
                            }
                            self.loading = false;
                            self.isError = false;
                        }, () => {
                            self.loading = false;
                            self.isError = true;
                        });
                }, () => {
                    self.loading = false;
                    self.isError = true;
                });
        } else { // 新增
            PatientService
                .getById($stateParams.patientId, true)
                .then((p) => {
                    self.patient = p.data;
                });

            self.data = {
                PatientId: $stateParams.patientId,
                RecordDate: new Date(moment().format('YYYY/MM/DD HH:mm'))
            };

        }
    };


    self.isSaving = false;
    self.submit = function submit(e) {
        self.isSaving = true;
        if (e) {
            e.currentTarget.disabled = true;
        }

        if (self.data.CatheterHospital === 'none') {
            self.data.CatheterHospital = self.useHospitalKeyIn;
        }

        if ($stateParams.vesselAssessmentProblemsId) {  // 修改表單
            self.data.ModifiedUserId = self.user.Id;
            self.data.ModifiedUserName = self.user.Name;

            vesselAssessmentProblemsService
                .put(self.data)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('vesselAssessmentProblems.problemsDetail.component.editSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('vesselAssessmentProblems.problemsDetail.component.editFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
        } else {    // 新增表單
            self.data.PatientId = $stateParams.patientId;
            self.data.HospitalId = self.user.HospitalId;
            self.data.CreatedUserId = self.user.Id;
            self.data.CreatedUserName = self.user.Name;

            vesselAssessmentProblemsService
                .post(self.data)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('vesselAssessmentProblems.problemsDetail.component.createSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('vesselAssessmentProblems.problemsDetail.component.createFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
        }
    };

    self.goback = function goback() {
        $window
            .history
            .back();
    };

    self.plus = function plus(type) {
        self.data[type] = self.data[type] != null ? self.data[type] + '+' : '+';
    };

    self.minus = function minus(type) {
        self.data[type] = self.data[type] != null ? self.data[type] + '-' : '-';
    };
}

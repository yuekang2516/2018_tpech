import './summaryContentDialog.less';

angular
.module('app')
.controller('summaryContentCtrl', summaryContentCtrl);

summaryContentCtrl.$inject = ['$q', 'patientId', '$mdDialog', 'PatientService', 'dialysisService', 'showMessage', 'summaryReportService', '$filter'];

function summaryContentCtrl($q, patientId, $mdDialog, PatientService, dialysisService, showMessage, summaryReportService, $filter) {
    const self = this;
    let $translate = $filter('translate');
    function getPatientAndDialysisData() {
        self.loading = true;
        let exeAry = [getPatientData()];

        // 依據查詢條件撈資料
        exeAry.push(getLastDialysisData());

        $q.all(exeAry).then(() => {
            // prepareFormData();
            self.isErr = false;
        }).catch(() => {
            self.isErr = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    function getPatientData() {
        const defer = $q.defer();
        PatientService.getById(patientId).then((res) => {
            self.currentPatient = res.data;
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });

        return defer.promise;
    }

    function getLastDialysisData() {
        const defer = $q.defer();
        dialysisService.getLast(patientId, true).then((res) => {
            // self.currentData = res.data.DialysisHeader;
            self.headerId = res.data.DialysisHeader.Id;
            defer.resolve();
        }).catch((err) => {
            defer.reject(err);
        });

        return defer.promise;
    }

    getPatientAndDialysisData();

    self.cancel = function () {
        $mdDialog.cancel();
    };
}

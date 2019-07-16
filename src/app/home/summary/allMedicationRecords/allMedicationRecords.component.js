import tpl from './allMedicationRecords.html';
import './allMedicationRecords.less';

angular.module('app').component('allMedicationRecords', {
    template: tpl,
    controller: allMedicationRecordsCtrl
});

allMedicationRecordsCtrl.$inject = ['$state', '$rootScope', '$stateParams', 'PatientService', 'allExecutionRecordService'];
function allMedicationRecordsCtrl($state, $rootScope, $stateParams, PatientService, allExecutionRecordService) {
    console.log('all medication records controller');
    const self = this;
    const dataLimit = 50;
    let odata = [];
    let dataNumber = 0;
    let dataEnd = false;
    self.loading = false;
    // 辨識系統別: HD/PD
    self.stateName = $state.current.name;

    self.serviceData = null;

    self.$onInit = function $onInit() {
        PatientService
        .getById($stateParams.patientId)
        .then((d) => {
            self.patient = d.data;
        });
    };

    // 取得用藥資料
    self.getList = function getList(patientId, offset, limit) {
        allExecutionRecordService.getRecordsForPage(patientId, offset, limit).then((q) => {
            if (q.data.length > 0) {
                dataNumber += q.data.length;
                odata = odata.concat(q.data);
                odata.map((o) => {
                    o.SortTime = moment(o.ProcessTime).format('YYYY/MM/DD');
                    return o;
                });
                self.serviceData = _.orderBy(_.groupBy(odata, 'SortTime'), 'desc');
            } else {
                dataEnd = true;
            }
            self.loading = false;
            self.isError = false;
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // scroll 拉到底時再取之後的值
    self.myPagingFunction = function myPagingFunction() {
        if (self.loading || self.isError) return;
        self.loading = true;

        if (!dataEnd) {
            self.getList($stateParams.patientId, dataNumber, dataLimit);
        } else {
            self.loading = false;
        }
    };

    self.title = 'this is previousMedicationRecords component page';

    self.back = function goback() {
        history.go(-1);
    };

    // 取得時間差
    self.DateDifference = function (a, b, type) {
        return moment(b).diff(a, type);
    };

}
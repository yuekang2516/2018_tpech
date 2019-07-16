import nursingProblemItemDetail from './nursingProblemItemDetail.html';
import './nursingProblem.less';

angular.module('app')
    .component('nursingProblemItemDetail', {
        template: nursingProblemItemDetail,
        controller: nursingProblemItemDetailCtrl,
        bindings: {
            data: '<'
        }
    });

nursingProblemItemDetailCtrl.$inject = ['$http', '$mdDialog', '$stateParams', 'NursingProblemService', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', '$filter'];

function nursingProblemItemDetailCtrl($http, $mdDialog, $stateParams, NursingProblemService,
    $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage,
    PatientService, $filter) {
    const self = this;
    self.nursingProblemId = self.data.nursingProblemId;
    self.user = SettingService.getCurrentUser();

    let $translate = $filter('translate');

    // 護理措施
    self.nursingProblemItemDetailList = self.data.nursingProblem.Items;

    self.$onInit = function $onInit() {
        self.loading = true;
        console.log('nursingProblem dialog', self.data);
        if (self.nursingProblemId !== 'create') {
            // load 已存的表單
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patient = d.data;
                    NursingProblemService.getById(self.nursingProblemId).then((q) => {
                        // nursingProblemItemDetailService.getByHealthproblemsDetail($stateParams.issuesId).then((q) => {
                        self.loading = false;
                        self.nursingProblemItemDetail = q.data;
                        console.log('q.data', q.data);
                        console.log('self.nursingProblemItemDetail:', self.nursingProblemItemDetail);
                        
                        // 判斷護理問題是否有變，若有則清空 Measures
                        if (self.nursingProblemItemDetail.ItemId !== self.data.nursingProblemItemId) {
                            self.nursingProblemItemDetail.Measures = {};
                        }
                        
                        // retrieve NursingTime
                        angular.extend(self.nursingProblemItemDetail, {
                            StartDate: new Date(moment(self.nursingProblemItemDetail.StartDate)),
                            ResolveDate: new Date(moment(self.nursingProblemItemDetail.ResolveDate)),
                            ItemId: self.data.nursingProblemItemId,  // 目前選取的護理問題項目ID
                            ItemName: self.data.nursingProblemItemName // 目前選取的護理問題項目名稱
                        });

                    });

                });

        } else {
            // 預設 新增
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patient = d.data;
                    // NursingProblemService.getByHealthproblemsDetail($stateParams.nursingProblemItemId).then((q) => {
                    //     // nursingProblemItemDetailService.getByHealthproblemsDetail($stateParams.issuesId).then((q) => {
                    self.loading = false;

                    self.nursingProblemItemDetail = {
                        StartDate: new Date(),
                        ItemId: self.data.nursingProblemItemId,  // 護理問題項目ID
                        ItemName: self.data.nursingProblemItemName, // 護理問題項目名稱
                        PatientId: $stateParams.patientId,
                        Measures: {},
                        // RelativeId: $stateParams.headerId,
                        HospitalId: self.user.HospitalId
                    };

                });
        }
    };

    self.exists = function (key, list) {
        // 填入的值，若有對應的 value 才打勾
        if (list && list[key]) {
            return true;
        }
        return false;
    };

    self.toggle = function (key, list) {
        if (list[key]) {
            delete list[key];
        } else {
            list[key] = self.nursingProblemItemDetailList[key];
        }
    };

    // 修改提交
    self.submit = function submit($event) {
        $event.currentTarget.disabled = true;

        if ($stateParams.nursingProblemId !== 'create') {
            self.nursingProblemItemDetail.ModifiedUserId = self.user.Id;
            self.nursingProblemItemDetail.ModifiedUserName = self.user.Name;
            console.log('修改 nursingProblem', self.nursingProblemItemDetail);
            NursingProblemService.put(self.nursingProblemItemDetail).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('nursingProblem.nursingProblemItemDetail.component.editSuccess'));
                    $mdDialog.hide(res);
                    // self.goto('nursingProblemList');
                }
            });
        } else { // 新增
            self.nursingProblemItemDetail.CreatedUserId = self.user.Id;
            self.nursingProblemItemDetail.CreatedUserName = self.user.Name;
            console.log(self.nursingProblemItemDetail);
            NursingProblemService.post(self.nursingProblemItemDetail).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('nursingProblem.nursingProblemItemDetail.component.createSuccess'));
                    $mdDialog.hide(res);
                    // self.goto('nursingProblemList');
                }
            });
        }
    };

}

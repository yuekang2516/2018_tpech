import nursingProblemDetail from './nursingProblemDetail.html';
import './nursingProblem.less';

angular.module('app')
    .component('nursingProblemDetail', {
        template: nursingProblemDetail,
        controller: nursingProblemDetailCtrl
    });

nursingProblemDetailCtrl.$inject = ['$scope', '$mdDialog', '$stateParams', 'NursingProblemService', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', '$filter'];

function nursingProblemDetailCtrl($scope, $mdDialog, $stateParams, NursingProblemService,
    $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage,
    PatientService, $filter) {
    const self = this;

    let $translate = $filter('translate');

    self.nursingProblemId = $stateParams.nursingProblemId;
    self.user = SettingService.getCurrentUser();

    self.loading = true;

    self.$onInit = function $onInit() {
        self.loading = true;

        // 進到這一頁不會有新增的情形
        if ($stateParams.nursingProblemId !== 'create') {
            // 修改
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patient = d.data;
                    console.log('self.nursingProblemId:' + self.nursingProblemId);
                    NursingProblemService.getById(self.nursingProblemId).then((q) => {
                        self.loading = false;
                        self.nursingProblemDetail = q.data;

                        angular.extend(self.nursingProblemDetail, {
                            StartDate: self.nursingProblemDetail.StartDate ? new Date(moment(self.nursingProblemDetail.StartDate).format('YYYY-MM-DD')) : null,
                            ResolveDate: self.nursingProblemDetail.ResolveDate ? new Date(moment(self.nursingProblemDetail.ResolveDate).format('YYYY-MM-DD')) : null
                        });

                    }, () => {

                    });
                }, (error) => {

                });
        }
    };

    // 修改提交
    self.submit = function submit($event) {
        $event.currentTarget.disabled = true;

        if ($stateParams.nursingProblemId !== 'create') {
            self.nursingProblemDetail.ModifiedUserId = self.user.Id;
            self.nursingProblemDetail.ModifiedUserName = self.user.Name;

            NursingProblemService.put(self.nursingProblemDetail).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('nursingProblem.nursingProblemDetail.component.editSuccess'));
                    history.go(-1);
                }
            });
        }
    };

    self.changeNursingProblemItem = function changeNursingProblemItem() {  // 修改護理問題
        $state.go('nursingProblemItem', {
            nursingProblemId: $stateParams.nursingProblemId
        });
    };

    self.changeNursingProblemItemDetail = function changeNursingProblemItemDetail() {  // 修改護理措施
        $scope.data = {};

        // 依問題代碼取得護理措施
        NursingProblemService.getMeasuresByNursingProblemId(self.nursingProblemDetail.ItemId).then((res) => {
            $scope.data.nursingProblem = self.nursingProblemDetail;
            $scope.data.nursingProblem.Items = res.data.Items;
            $scope.data.nursingProblemId = $stateParams.nursingProblemId;
            $scope.data.nursingProblemItemId = self.nursingProblemDetail.ItemId;
            $scope.data.nursingProblemItemName = self.nursingProblemDetail.ItemName;
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            // show measure dialog
            $mdDialog.show({
                parent: angular.element(document.body),
                template:
                `
                <md-toolbar>
                    <div class="md-toolbar-tools">
                        <h3>
                            <span ng-show="data.nursingProblemId != 'create'" translate>{{'nursingProblem.nursingProblemDetail.component.edit'}}</span>
                            <span translate>{{'nursingProblem.nursingProblemDetail.component.nursingMeasure'}}</span>
                        </h3>
                        <span flex></span>
                        <md-button class="md-icon-button" ng-click="cancel()">
                            <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                        </md-button>
                    </div>
                </md-toolbar>
                <md-dialog-content>
                    <nursing-problem-item-detail data="data"></nursing-problem-item-detail>
                </md-dialog-content>
                `,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
            }).then((res) => {
                self.nursingProblemDetail = res.data;
                angular.extend(self.nursingProblemDetail, {
                    StartDate: new Date(moment(self.nursingProblemDetail.StartDate).format('YYYY-MM-DD')),
                    ResolveDate: new Date(moment(self.nursingProblemDetail.ResolveDate).format('YYYY-MM-DD'))
                });
            }, () => {
                // cancel
            });
        }, () => {
            showMessage($translate('nursingProblem.nursingProblemDetail.component.retrieveError'));
        });

    };

    // 回上一頁
    self.goback = function goback() {
        history.back(-1);
    };

}

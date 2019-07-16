import nursingProblemItem from './nursingProblemItem.html';
import './nursingProblem.less';

angular.module('app')
    .component('nursingProblemItem', {
        template: nursingProblemItem,
        controller: nursingProblemItemCtrl
    });

nursingProblemItemCtrl.$inject = ['$scope', '$http', '$state', 'NursingProblemService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage'];

function nursingProblemItemCtrl($scope, $http, $state, NursingProblemService, $stateParams,
    $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage) {
    const self = this;

    self.lastAccessTime = moment();

    self.$onInit = function $onInit() {
        // self.loadRecords();
        self.patient = PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
        }, () => { // if PatientService false
            self.loading = false;
            self.isError = true;
        });

        loadProblemItems();

        document.addEventListener('keydown', keydown);
    };

    self.$onDestroy = function () {
        document.removeEventListener('keydown', keydown);
    };

    // add or edit
    self.goto = function goto(id = null, itemName = null) {
        $scope.data = {};
        $scope.data.nursingProblem = _.find(self.serviceData, { 'Key': id });
        $scope.data.nursingProblemId = $stateParams.nursingProblemId;
        $scope.data.nursingProblemItemId = id;
        $scope.data.nursingProblemItemName = itemName;
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
                        <span ng-show="data.nursingProblemId == 'create'" translate>{{'nursingProblem.nursingProblemItem.component.create'}}</span>
                        <span ng-show="data.nursingProblemId != 'create'" translate>{{'nursingProblem.nursingProblemItem.component.edit'}}</span>
                        <span translate>{{'nursingProblem.nursingProblemItem.component.nursingMeasure'}}</span>
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
        }).then(() => {
            history.go(-1);
        }, () => {
            // cancel
        });

    };

    function loadProblemItems() {
        self.loading = true;
        NursingProblemService.getByHealthproblems().then((res) => {
            self.serviceData = res.data;
            self.loading = false;
            self.isError = false;
        }, () => {
            // error
            self.loading = false;
            self.isError = true;
        });
    }

    function keydown(ev) {
        $('#search').focus();
    }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        loadProblemItems();
    };

    self.back = function back() {
        history.go(-1);
    };
}

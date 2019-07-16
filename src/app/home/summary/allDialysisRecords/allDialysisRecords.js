import tpl from './allDialysisRecords.html';
import './allDialysisRecords.less';

angular.module('app').component('allDialysisRecords', {
    template: tpl,
    controller: allDialysisRecordsCtrl
});

allDialysisRecordsCtrl.$inject = ['$scope', '$mdToast', '$mdDialog', '$state', 'SettingService', 'dialysisService', '$stateParams', '$window', 'showMessage', 'PatientService', '$mdMedia', '$interval', '$timeout', '$filter'];

function allDialysisRecordsCtrl($scope, $mdToast, $mdDialog, $state, SettingService,
    dialysisService, $stateParams, $window, showMessage, PatientService, $mdMedia, $interval, $timeout, $filter) {
    console.log('enter all records controller');
    const self = this;

    self.serviceData = null;
    self.patientId = $stateParams.patientId;
    self.deletedItemsLength = -1;
    self.totalCnt = 0;
    let page = 1;
    let maxpage = 0;
    let limit = 20;

    let $translate = $filter('translate');

    // refresh 相關
    self.lastAccessTime = moment();

    // 初始化
    self.$onInit = function onInit() {
        getData();
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = null;

        getData();
    };

    self.gotoMonthlyView = function () {
        $state.go('monthlyDialysisRecords', { patientId: self.patientId });
    };

    // 判斷是否要顯示新增按鈕 (根據最後一筆是否有 EndTime 及 開表是否為今日)
    function checkCanCreate() {
        if (self.serviceData && self.serviceData.length > 0 && !self.serviceData[0].EndTime && moment(self.serviceData[0].StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            self.canCreate = false;
        } else {
            self.canCreate = true;
        }
    }

    function getData() {
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            dialysisService.getByIdPage(self.patientId, page, limit).then((q) => {
                console.log(q);
                // debugger;
                // self.serviceData = q.data;
                self.totalCnt = q.data.Total;
                maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
                if (q.data.Total % limit === 0) {
                    maxpage -= 1;
                }
                // console.log(maxpage);
                if (q.data.Total > 0) {
                    self.serviceData = q.data.Results;
                } else {
                    self.serviceData = null;
                }
                self.lastAccessTime = dialysisService.getLastAccessTime();
                self.loading = false;
                self.isError = false;   // 顯示伺服器錯誤
                // 判斷是否要顯示新增按鈕 (根據最後一筆是否有 EndTime 及 開表是否為今日)
                checkCanCreate();
                console.log('self.serviceData', self.serviceData);
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        }, () => {
            checkCanCreate();
            self.loading = false;
            self.isError = true;
        });
    }

    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loading || self.loadingMore) {
            return;
        }
        page += 1;
        // for loadmore loading effect
        showLoading(page, true);

        if (page > maxpage) {
            self.loading = false;
            self.loadingMore = false;
            return;
        }

        // 呼叫取得NursingRecord的Service
        dialysisService.getByIdPage(self.patientId, page, limit).then((q) => {
            console.log(q);
            for (let i = 0; i < q.data.Results.length; i++) {
                self.serviceData.push(q.data.Results[i]);
            }
            showLoading(page, false);
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            showLoading(page, false);
            self.isError = true;
            // showMessage(lang.ComServerError);
        });
    };

    // 決定要 show 哪個 loading 效果：全頁 / 分頁
    function showLoading(pageNo, showOrHide) {
        if (pageNo > 1) {
            self.loadingMore = showOrHide;
        } else {
            self.loading = showOrHide;
        }
    }

    // function _calculateRefreshTime() {
    //   console.log('recalclate -> ');
    //   console.log(self.lastAccessTime);
    //   setTimeout(function() {
    //     self.lastRefreshTitle = '最後更新: ' + moment(self.lastAccessTime).fromNow();
    //   }, 0);
    // }

    // 刪除
    self.showDeleteDialog = function showDeleteDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template:
                `<md-dialog aria-label="刪除確認">
          <form ng-cloak>
              <md-toolbar>
                  <div class="md-toolbar-tools">
                      <h2 translate>{{'allDialysisRecords.component.confirmDelete'}}</h2>
                      <span flex></span>
                      <md-button class="md-icon-button" ng-click="vm.cancel()">
                          <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                      </md-button>
                  </div>
              </md-toolbar>

              <md-dialog-content>
                  <div class="md-dialog-content" translate>
                    {{'allDialysisRecords.component.deleteRecord'}}
                  </div>
              </md-dialog-content>

              <md-dialog-actions layout="row">
                  <md-button class="md-raised" ng-click="vm.cancel()">
                    {{'allDialysisRecords.component.deleteCancel' | translate}}
                  </md-button>
                  <md-button class="md-warn md-raised" ng-click="vm.ok()">
                    {{'allDialysisRecords.component.deleteOk' | translate}}
                  </md-button>
              </md-dialog-actions>
          </form>
      </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function showDialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                dialysisService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        // $state.go('allDialysisRecords', null, { reload: true });
                        // 刪除前端暫存資料中的此筆資料
                        const index = _.findIndex(self.serviceData, ['Id', data.Id]);
                        self.serviceData.splice(index, 1);
                        self.totalCnt -= 1; // 總計數目更新
                        self.loading = false;
                        self.isError = false;
                        // 判斷是否要顯示新增按鈕 (根據最後一筆是否有 EndTime 及 開表是否為今日)
                        checkCanCreate();
                        showMessage($translate('allDialysisRecords.component.deleteSuccess'));
                        // go to summary with the latest result
                        // TODO: check for bugs
                        $state.go('summary', { patientId: self.patientId }, { notify: true, reload: true, location: 'replace' });
                    }
                }, () => {
                    showMessage($translate('allDialysisRecords.component.deleteFail'));
                });
                mdDialog.hide(data);
            };
        }
    };

    // self.title = 'this is previousDialysisRecords component page';

    self.goto = function goto(id, idx, createdTime) {

        // $state.go('overview', { patientId: self.patientId, headerId: id });
        // go to summary with selected index
        console.log('createdTime', createdTime);

        // 為了不讓 router 增加，利用 notify 的方式通知 parent change state
        history.go(-1);
        $scope.$emit('changeHeaderId', id);

        // $state.go('summary', { patientId: self.patientId, headerId: id, month: createdTime }, { notify: false, reload: false, location: 'replace' });
        // $scope.$emit('month', createdTime);
    };

    self.goback = function goback() {
        $window.history.back();
    };

    // FIXME: error occurs when creating
    // 點選右下角+的按鈕開表
    self._handleCreateCheck = function _handleCreateCheck(event) {
        self.canCreate = false;
        self.loading = true;
        dialysisService.getCreateCheck(self.patientId).then((res) => {
            let createCheck;
            if (res.status === 200) {
                createCheck = res.data;
                // 當 DialysisPrescriptionCount > 0 && VesselAssessmentCount > 0 就開表
                if (createCheck.DialysisPrescriptionCount > 0 && createCheck.VesselAssessmentCount > 0) {
                    postDialysis();
                } else {
                    $mdDialog.show({
                        controller: ['$mdDialog', handleCreateDialogController],
                        templateUrl: 'confirm.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controllerAs: 'vm'
                    }).then(() => { }, () => {
                        self.loading = false;
                        self.canCreate = true;
                    });
                }
            } else {
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };
    // 新增一筆透析紀錄
    function postDialysis() {
        self.loading = true;
        dialysisService.post(self.patientId).then((q) => {
            if (q.status === 200) {
                showMessage($translate('allDialysisRecords.component.formCreateSuccess'));
                // $state.go('overview', { patientId: self.patientId, headerId: q.data.Id }, { reload: true });
                // go to summary with the latest result
                // TODO: check for bugs
                // dialysisService.getLast(self.patientId, false).then((res) => {
                //     if (res.data.Count > 0) {
                //         return res.data.DialysisHeader.Id;
                //     }
                //     return 'none';
                // }).then((headerId) => {
                //     $state.go('summary', { patientId: self.patientId, headerId }, { notify: true, reload: true, location: 'replace' });
                // });
                // 為了不讓 router 增加，利用 notify 的方式通知 parent change state
                history.go(-1);
                $scope.$emit('changeHeaderId', 'last');
                // $state.go('summary', { patientId: self.patientId, headerId: 'last' }, { notify: true, reload: true, location: 'replace' });
            } else {
                self.loading = false;
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('allDialysisRecords.component.formCreateFail'));
        });
    }

    function handleCreateDialogController(mdDialog) {
        const vm = this;
        vm.hide = function hide() {
            mdDialog.hide();
        };

        vm.cancel = function cancel() {
            mdDialog.cancel();
        };

        vm.ok = function ok() {
            postDialysis();
            mdDialog.hide();
        };
    }
}

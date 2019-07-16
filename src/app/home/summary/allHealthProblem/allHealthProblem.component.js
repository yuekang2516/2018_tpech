import tpl from './allHealthProblem.html';
import './allHealthProblem.less';

angular.module('app')
    .component('allHealthProblem', {
        template: tpl,
        controller: allHealthProblemCtrl,
        controllerAs: '$ctrl'
    });

allHealthProblemCtrl.$inject = ['$state', 'SettingService', 'allHealthProblemService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage', '$filter', '$scope'];

function allHealthProblemCtrl($state, SettingService, allHealthProblemService, $stateParams,
    $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage, $filter, $scope) {
    const self = this;
    self.serviceData = null;
    self.totalCnt = 0;
    let currentPage = 1;
    let maxpage = 0;
    let limit = 50;
    let $translate = $filter('translate');

    // 預設狀態
    self.loading = false;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    // self.deletedItemsLength = -1;


    $scope.$on('healthProblem_dataChanged', () => {
        self.refresh();
    });

    function getData(isForce = false) {
        // self.loading = true;
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            allHealthProblemService.getByIdPage($stateParams.patientId, currentPage, limit, isForce).then((res) => {

                self.serviceData = res.data;
                console.log('get', res.data);
                self.totalCnt = res.data.Total;
                maxpage = parseInt(res.data.Total / limit) + 1;
                if (res.data.Total % limit === 0) {
                    maxpage -= 1;
                }
                console.log('max', maxpage);
                if (res.data.Total > 0) {
                    // self.rawData = q.data.Results;

                    // setDataByIsShowDeleted($scope.showDeleted);
                    self.serviceData = res.data.Results;
                } else {
                    self.serviceData = null;
                }
                // self.serviceData = res.data.Results;
                self.lastAccessTime = allHealthProblemService.getLastAccessTime();
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
    }

    self.$onInit = function $onInit() {
        getData(true);
    };

    // 確認權限是否能修改
    self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
        return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        currentPage = 1;
        getData(true);
    };

    self.loadMore = function loadMore() {
        if (self.loadingMore) {
            return;
        }
        self.loadingMore = true;
        currentPage += 1;
        if (currentPage > maxpage) {
            self.loadingMore = false;
            return;
        }
        // 呼叫取得allHealthProblemService的Service
        allHealthProblemService.getByIdPage($stateParams.patientId, currentPage, limit).then((q) => {
            console.log('bbb', q);
            // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
            self.serviceData = self.serviceData.concat(q.data.Results);
            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            self.loadingMore = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loadingMore = false;
            self.isError = true;
            // showMessage(lang.ComServerError);
        });
    };

    // add or edit
    // self.goto = function goto(id) {
    self.goto = function goto(id = null) {
        $state.go('healthProblem', { healthProblemId: id });
    };
    // 刪除詢問
    self.showDialog = function del(event, data) {
        const confirm = $mdDialog.confirm()
            .title('刪除健康問題確認')
            .clickOutsideToClose(true)
            .textContent('確定要刪除此筆健康問題？')
            .ok('刪除')
            .cancel('取消');

        $mdDialog.show(confirm).then(() => {
            allHealthProblemService.del(data.Id).then((q) => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                self.loading = false;
                $state.go('allhealthProblem');
            });
        }, () => {
            // do nothing
            showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
            self.loading = false;
        });
    };
    self.back = function back() {
        history.go(-1);
    };
}

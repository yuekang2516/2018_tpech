import tpl from './allNursingGuide.component.html';
import './allNursingGuide.component.less';

angular.module('app').component('allNursingGuide', {
    template: tpl,
    controller: allNursingGuideCtrl
});

allNursingGuideCtrl.$inject = ['$scope', '$mdDialog', '$state', 'SettingService', 'allNursingGuideService', '$stateParams', 'showMessage', 'PatientService', '$mdMedia', '$interval', '$timeout', '$filter'];

function allNursingGuideCtrl($scope, $mdDialog, $state, SettingService, allNursingGuideService,
    $stateParams, showMessage, PatientService, $mdMedia, $interval, $timeout, $filter) {

    const self = this;

    // TODO checkAccess, api
    self.serviceData = null;
    self.patientId = $stateParams.patientId;
    self.deletedItemsLength = -1;
    self.totalCnt = 0;
    // refresh 相關
    self.lastAccessTime = moment();
    let $translate = $filter('translate');

    let currentPage = 1;
    let maxpage = 0;
    let limit = 50;

    $scope.$on('nursingGuide_dataChanged', () => {
        self.refresh();
    });

    // 初始化
    self.$onInit = function onInit() {
        getData(true);
    };

    function getData(isForce = false) {
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            allNursingGuideService.getByIdPage($stateParams.patientId, currentPage, limit, isForce).then((res) => {
                self.serviceData = res.data;
                console.log('nursingGuides', res.data);
                self.totalCnt = res.data.Total;
                maxpage = parseInt(res.data.Total / limit) + 1;
                if (res.data.Total % limit === 0) {
                    maxpage -= 1;
                }
                if (res.data.Total > 0) {
                    // self.rawData = q.data.Results;

                    // setDataByIsShowDeleted($scope.showDeleted);
                    self.serviceData = res.data.Results;
                } else {
                    self.serviceData = null;
                }
                self.serviceData = res.data.Results;
                self.lastAccessTime = allNursingGuideService.getLastAccessTime();
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

    self.showDialog = function del(event, data) {
        const confirm = $mdDialog.confirm()
            .title('刪除護理指導確認')
            .clickOutsideToClose(true)
            .textContent('確定要刪除此筆護理指導？')
            .ok('刪除')
            .cancel('取消');

        $mdDialog.show(confirm).then(() => {
            allNursingGuideService.del(data.Id).then((q) => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                self.loading = false;
                $state.go('allhealthProblem');
            });
        }, () => {
            // do nothing
            showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
            self.loading = false;

        }, () => {
            // do nothing
        });
    };

    self.back = function () {
        history.go(-1);
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
        allNursingGuideService.getByIdPage($stateParams.patientId, currentPage, limit).then((q) => {
            // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
            self.serviceData = self.serviceData.concat(q.data.Results);
            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            self.loadingMore = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loadingMore = false;
            self.isError = true;
        });
    };

    self.goto = function (id) {
        $state.go('nursingGuide', { nursingGuideId: id });
    };

}


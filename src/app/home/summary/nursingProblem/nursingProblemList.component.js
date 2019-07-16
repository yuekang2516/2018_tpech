import nursingProblemList from './nursingProblemList.html';
import './nursingProblem.less';

angular.module('app')
    .component('nursingProblemList', {
        template: nursingProblemList,
        controller: nursingProblemListCtrl
    });

nursingProblemListCtrl.$inject = ['$state', 'NursingProblemService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage', '$filter'];

function nursingProblemListCtrl($state, NursingProblemService, $stateParams,
    $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage, $filter) {
    const self = this;
    self.serviceData = null;
    self.totalCnt = 0;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    let $translate = $filter('translate');

    // 預設狀態
    self.loading = false;
    self.lastApoId = '';
    self.lastAccessTime = moment();

    self.loadRecords = function loadRecords(isForce = false) {
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            NursingProblemService.getByIdPage($stateParams.patientId, page, limit, isForce).then((q) => {
                console.log(q);
                maxpage = parseInt(q.Total / limit) + 1; // 總頁數
                if (q.Total % limit === 0) {
                    maxpage -= 1;
                }

                // 因為 detail 頁面為 child，回來此頁面不會再重新跑 onInit，因此一開始就須與 Service 的暫存綁定，從 child 回來資料才會更新
                self.serviceData = q;

                self.lastAccessTime = NursingProblemService.getLastAccessTime();
                self.loading = false;
                self.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    self.$onInit = function $onInit() {
        self.loadRecords(true); // 重新回到此頁，需強迫重撈，否則資料會重複
    };

    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loading) {
            return;
        }
        self.loading = true;
        page += 1;
        if (page > maxpage) {
            self.loading = false;
            return;
        }
        // 呼叫取得NursingRecord的Service
        NursingProblemService.getByIdPage($stateParams.patientId, page, limit).then((q) => {
            console.log(q);
            // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
            self.serviceData = q;
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
            // showMessage(lang.ComServerError);
        });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = null;

        self.loadRecords(true);
    };

    // add or edit
    // self.goto = function goto(id) {
    self.goto = function goto(id) {  // 新增
        if (id === 'create') { // 新增
            $state.go('nursingProblemItem', {
                // patientId: self.patient.Id,
                nursingProblemId: id
            });
        } else { // 編輯
            $state.go('nursingProblemDetail', {
                nursingProblemId: id
            });
        }
    };

    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                NursingProblemService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        showMessage($translate('nursingProblem.nursingProblemList.component.deleteSuccess'));
                    }
                });
                mdDialog.hide(data);
            };
        }
    };
    self.back = function back() {
        history.go(-1);
    };
}

import tpl from './nursingAssessmentForm.html';
import dialog from './nAFEdit.dialog.html';


angular.module('app').component('nursingAssessmentForm', {
    template: tpl,
    controller: nursingAssessmentFormCtrl
});

nursingAssessmentFormCtrl.$inject = [
    '$stateParams', 'SettingService', 'nursingAssessmentService', '$mdDialog', '$mdMedia', '$filter', 'showMessage'];
function nursingAssessmentFormCtrl(
    $stateParams, SettingService, nursingAssessmentService, $mdDialog, $mdMedia, $filter, showMessage) {
    
    const self = this;

    self.totalCnt = 0;
    let currentPage = 1;
    let maxpage = 0;
    let limit = 10;
    self.deletedItemsLength = -1;

    let $translate = $filter('translate');

    self.patientId = $stateParams.patientId;
    // 預設狀態
    self.lastAccessTime = moment();
    
    // List Data Array
    self.nAFList = [];

    self.$onInit = function onInit() {
        self.getList();
    };

    

    self.getList = function () {
        self.loading = true;

        nursingAssessmentService.getAllByPatientId(self.patientId).then((res) => {
            console.log("nursingAssessmentService getList Success", res);
            let Total = res.data.length;
        
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            }
           
            if (Total > 0) {
                self.nAFList = res.data;
                self.nAFList = $filter('orderBy')(self.nAFList,'-Record_Date'); 
                self.deletedItemsLength = _.filter(res.data, { 'Status': 'Deleted' }).length;
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.nAFList = [];
            }
            //self.lastAccessTime = NursingRecordService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
            console.log("nAFList--",self.nAFList);
            
        }, (res) => {
            console.log("nursingAssessmentService getList Fail", res);
            self.loading = false;
            self.isError = true;
        });
    };

    self.openCreateDialog = function () {
        console.log("nAFEditController openCreateDialog");
        let nAFItem = {};
        nAFItem.isCreate = true;
        $mdDialog.show({
            controller: 'nAFEditController',
            template: dialog,
            locals: {
                nAFItem: nAFItem
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    self.openEditDialog = function (nAFItem,isCopy) {

        nAFItem.Record_Date = new Date(moment(nAFItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        nAFItem.isCreate = false;
        nAFItem.isCopy = isCopy;
        $mdDialog.show({
            controller: 'nAFEditController',
            template: dialog,
            locals: {
                nAFItem: nAFItem
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {  
            self.getList();
        });

    };

    // 刪除    
    self.deleteOne = function (ev, nAFItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('orderST.component.confirmDelete')) // '刪除確認'
            .textContent($translate('orderST.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('orderST.component.deleteOk')) // '刪除'
            .cancel($translate('orderST.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            nAFItem.Status = "Deleted";
            console.log("deleteOne", nAFItem);

            nursingAssessmentService.put(nAFItem).then((res) => {
                console.log("orderST update success", res);
                self.getList();
                $mdDialog.hide();
                showMessage($translate('orderST.component.deleteSuccess'));
            }, (res) => {
                console.log("orderST update fail", res);
                showMessage($translate('orderST.component.deleteFail'));
            });
        }, () => {
            $mdDialog.hide();
        });
    };
    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        currentPage = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.nAFList = []
        self.getList();
        self.lastAccessTime = moment();
    };
    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        
        if (self.loadingMore) {
            return;
        }
        console.log('is more down222!!')
        self.loadingMore = true;
        currentPage += 1;
        if (currentPage > maxpage) {
            self.loadingMore = false;
            return;
        }
       
    };
    self.$onDestroy = function () {
        // 清空 interval
        // if (angular.isDefined(interval)) {
        //     $interval.cancel(interval);
        // }
        // if (angular.isDefined(executeInterval)) {
        //     $interval.cancel(executeInterval);
        // }
    };

    self.back = function back() {
        // $state.go('allPatients');
    };


}
import tpl from './reportDialysis.html';
import dialog from './rdEdit.dialog.html';
import './reportDialysis.less';

angular.module('app').component('reportDialysis', {
    template: tpl,
    controller: reportDialysis
});


reportDialysis.$inject = ['$state', '$rootScope', '$stateParams', 
'PatientService', 'reportDialysisService',
'$mdDialog', '$mdMedia', '$filter', 'showMessage'
];
function reportDialysis($state, $rootScope, $stateParams, PatientService, reportDialysisService,
    $mdDialog, $mdMedia, $filter, showMessage
    ) {

    const self = this;

    // 利用有無 headerId 判斷是腹透或是血透
    self.isHD = $stateParams.headerId;

    const limit = 50;
    let odata = [];
    let dataNumber = 0;
    let page = 1;
    let maxpage = 0;
    let dataEnd = false;
    let $translate = $filter('translate');
    self.lastAccessTime = moment();
    self.serviceData = [];

    self.$onInit = function $onInit() {
        PatientService
        .getById($stateParams.patientId)
        .then((d) => {
            self.patient = d.data;
        });
    };

    // 取得清單
    self.getList = function getList(patientId) {
        self.loading = true;
        reportDialysisService.getListByPatientID(patientId).then((res) => {
            console.log("reportDialysisService getList Success", res);
            let Total = res.data.length;
        
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            }
            
            if (Total > 0) {
                self.serviceData = res.data;
                self.serviceData = $filter('orderBy')(self.serviceData,'-Record_Date');
                self.deletedItemsLength = _.filter(self.serviceData, { 'Status': 'Deleted' }).length;
            } else {
                self.serviceData = [];
            }
            dataEnd = true; 
            console.log("reportList--",self.serviceData);
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
            self.getList($stateParams.patientId);
        } else {
            self.loading = false;
        }
    };
    self.printPaper = function(_item,isCreate){
        _item['isCreate'] = isCreate;
        if (self.isHD) {
            $state.go('printRDHD', { item: _item });
            return;
        }
        $state.go('printRD',{item:_item});
    };

    self.openCreateDialog = function () {
        let _item = {"patientId":$stateParams.patientId};
        self.printPaper(_item,true);
    };

    self.openEditDialog = function (rdItem) {

        console.log("rdEditController openEditDialog");
        //rdItem.Record_Date = new Date(moment(rdItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        
        $mdDialog.show({
            controller: 'rdEditController',
            template: dialog,
            locals: {
                rdItem: rdItem
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {            
            self.getList($stateParams.patientId);
        });

    };

    // 刪除    
    self.deleteOne = function (ev, rdItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('orderLR.component.confirmDelete')) // '刪除確認'
            .textContent($translate('orderLR.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('orderLR.component.deleteOk')) // '刪除'
            .cancel($translate('orderLR.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            rdItem.Status = "Deleted";
            console.log("deleteOne", rdItem);

            reportDialysisService.put(rdItem).then((res) => {
                console.log("orderLR update success", res);
                showMessage($translate('orderLR.component.deleteSuccess'));
                self.getList($stateParams.patientId);
                $mdDialog.hide();
            }, (res) => {
                console.log("orderLR update fail", res);
                showMessage($translate('orderLR.component.deleteFail'));
            });
        }, () => {
            $mdDialog.hide();
        });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = [];

        self.getList($stateParams.patientId);
        self.lastAccessTime = moment();
    };
    self.$onDestroy = function () {
    };

    self.back = function back() {
        history.go(-1);
    };


}
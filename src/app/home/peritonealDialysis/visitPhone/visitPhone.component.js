import tpl from './visitPhone.html';
import dialog from './vtPhoneEdit.dialog.html';


angular.module('app').component('visitPhone', {
    template: tpl,
    controller: visitPhoneCtrl
});


visitPhoneCtrl.$inject = ['$state', '$rootScope', '$stateParams', 
'PatientService','vtPhoneService','$mdDialog', '$mdMedia', '$filter', 'showMessage'
];
function visitPhoneCtrl($state, $rootScope, $stateParams, PatientService,vtPhoneService,
    $mdDialog, $mdMedia, $filter, showMessage
    ) {
    
    const self = this;
    const limit = 50; 
    let odata = [];
    let dataNumber = 0;
    let page = 1;
    let maxpage = 0;
    let dataEnd = false;
    let $translate = $filter('translate');
    self.lastAccessTime = moment();
    self.serviceData = [];
    self.myStyle = { right: '120px'}
    
    self.$onInit = function $onInit() {
        PatientService
        .getById($stateParams.patientId)
        .then((d) => {
            self.patient = d.data;
        });
    };

    // 取得清單
    self.getList = function getList(patientId) {
        vtPhoneService.getListByPatientID(patientId).then((res) => {
            console.log("vtPhoneService getList Success", res);
        

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
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.serviceData = [];
            }
            dataEnd = true; 
            console.log("homeList--",self.serviceData);
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

    
    self.refresh = function(){
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = []
        self.getList($stateParams.patientId);
        self.lastAccessTime = moment();
    }
    self.openCreateDialog = function () {
        console.log("vtPhoneEditController openCreateDialog");
        let vtPhoneItem = {};
        vtPhoneItem.isCreate = true;
        $mdDialog.show({
            controller: 'vtPhoneEditController',
            template: dialog,
            locals: {
                vtPhoneItem: vtPhoneItem
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList($stateParams.patientId);
        });

    };

    self.openEditDialog = function (vtPhoneItem,isCopy) {
        console.log("vtPhoneEditController openEditDialog");
        vtPhoneItem.Record_Date = new Date(moment(vtPhoneItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        vtPhoneItem.isCreate = false;
        vtPhoneItem.isCopy = isCopy;
        $mdDialog.show({
            controller: 'vtPhoneEditController',
            template: dialog,
            locals: {
                vtPhoneItem: vtPhoneItem
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {            
            self.getList($stateParams.patientId);
        });

    };

    // 刪除    
    self.deleteOne = function (ev, vtPhoneItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('visitPhone.component.confirmDelete')) // '刪除確認'
            .textContent($translate('visitPhone.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('visitPhone.component.deleteOk')) // '刪除'
            .cancel($translate('visitPhone.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            vtPhoneItem.Status = "Deleted";
            console.log("deleteOne", vtPhoneItem);

            vtPhoneService.put(vtPhoneItem).then((res) => {
                self.getList($stateParams.patientId);
                $mdDialog.hide();
                console.log("visitPhone update success", res);
                showMessage($translate('visitPhone.component.deleteSuccess'));
            }, (res) => {
                console.log("visitPhone update fail", res);
                showMessage($translate('visitPhone.component.deleteFail'));
            });
            $mdDialog.hide();
            
        }, () => {
            $mdDialog.hide();
        });
    };

    self.refresh = function(){
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = []
        self.getList($stateParams.patientId);
        self.lastAccessTime = moment();
    }

    self.back = function goback() {
        history.go(-1);
    };


}
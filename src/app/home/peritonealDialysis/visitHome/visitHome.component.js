import tpl from './visitHome.html';
import dialog from './vtHomeEdit.dialog.html';


angular.module('app').component('visitHome', {
    template: tpl,
    controller: visitHomeCtrl
});


visitHomeCtrl.$inject = ['$state', '$rootScope', '$stateParams', 
'PatientService', 'visitPeritonealDialysisService',
'$mdDialog', '$mdMedia', '$filter', 'showMessage'
];
function visitHomeCtrl($state, $rootScope, $stateParams, PatientService, visitPeritonealDialysisService,
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

    self.$onInit = function $onInit() {
        PatientService
        .getById($stateParams.patientId)
        .then((d) => {
            self.patient = d.data;
        });
    };

    // 取得清單
    self.getList = function getList(patientId) {
        visitPeritonealDialysisService.getListByPatientID(patientId).then((res) => {
            console.log("visitPeritonealDialysisService getList Success", res);
        
            let Visit_Homelist = res.data.filter( item => {
                return item.Visit_Method == "Visit_Home";
            })
            let Total = Visit_Homelist.length;
        
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            }
            
            if (Total > 0) {
                self.serviceData = Visit_Homelist;
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
    self.openCreateDialog = function () {
        console.log("vtPhoneEditController openCreateDialog");
        let vtHomeItem = {};
        vtHomeItem.isCreate = true;
        $mdDialog.show({
            controller: 'vtHomeEditController',
            template: dialog,
            locals: {
                vtHomeItem:vtHomeItem,
                last_vtHomeItem: (self.serviceData.filter(e =>{
                    return e.Status != "Deleted";
                }).length == 0) ? vtHomeItem : self.serviceData.filter(e =>{
                    return e.Status != "Deleted";
                })[0]
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

    self.openEditDialog = function (vtHomeItem) {
        console.log("vtPhoneEditController openEditDialog");
        vtHomeItem.Record_Date = new Date(moment(vtHomeItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        vtHomeItem.isCreate = false;
        $mdDialog.show({
            controller: 'vtHomeEditController',
            template: dialog,
            locals: {
                vtHomeItem: vtHomeItem,
                last_vtHomeItem : {}
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }
        ).then((result) => {
            self.getList($stateParams.patientId);
        });

    };

    // 刪除    
    self.deleteOne = function (ev, vtHomeItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('visitHome.component.confirmDelete')) // '刪除確認'
            .textContent($translate('visitHome.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('visitHome.component.deleteOk')) // '刪除'
            .cancel($translate('visitHome.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            vtHomeItem.Status = "Deleted";
            console.log("deleteOne", vtHomeItem);

            visitPeritonealDialysisService.put(vtHomeItem).then((res) => {
                console.log("visitHome update success", res);
                showMessage($translate('visitHome.component.deleteSuccess'));
                self.getList($stateParams.patientId);
                $mdDialog.hide();
            }, (res) => {
                console.log("visitHome update fail", res);
                showMessage($translate('visitHome.component.deleteFail'));
            });

            

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
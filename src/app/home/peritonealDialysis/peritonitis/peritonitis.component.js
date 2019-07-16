import tpl from './peritonitis.html';
import './peritonitis.less';
import dialog from './peEdit.dialog.html';


angular.module('app').component('peritonitis', {
    template: tpl,
    controller: peritonitisCtrl
});

peritonitisCtrl.$inject = ['$stateParams', '$mdDialog', 'SettingService', '$filter', 'showMessage',
'$mdMedia', 'peritonitisService', 'PatientService', '$rootScope'];
function peritonitisCtrl($stateParams, $mdDialog, SettingService, $filter, showMessage, 
$mdMedia, peritonitisService, PatientService, $rootScope) {
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.loading = true;
    // 資料庫資料 感染記錄
    self.peritonitisList = [];
    //刪除狀態
    self.showDeleted = false;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    self.$onInit = function onInit() {
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
            console.log("self.currentPatient--", self.currentPatient);
            self.getList();

            self.loading = false;
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });
    };

    self.$onDestroy = function () {
        // 只保留一個 $rootScope $on Event - peritonitisListRefreshEvent
        // $rootScope.$$listeners.peritonitisListRefreshEvent = $rootScope.$$listeners.peritonitisListRefreshEvent.splice(0, 1);
    };
    self.lastAccessTime = moment();

    self.refresh = function(){
        page = 1;
        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)        
        self.getList();
        self.lastAccessTime = moment();
    }
    $rootScope.$on("peritonitisListRefreshEvent", function (event, data) {
        console.log("$rootScope $on peritonitisListRefreshEvent");
        self.getList();
    });

    self.switchShowDeleted = function(showDeleted){
        // && $ctrl.fiList.Status !== 'Deleted'
        self.showDeleted = !showDeleted;
        console.log("self.showDeleted--",self.showDeleted);
        self.getList();
    }
    self.getList = function () {
        self.peritonitisList = [];
        peritonitisService.getInfectionRecord(self.currentPatient.MedicalId).then((res) => {
            console.log("peritonitisService getAll Success", res);            
            self.peritonitisList = $filter('orderBy')(res.data,'-Times');                                    
            // self.peritonitisList = self.peritonitisList.filter(e =>{
            //     return e.Status != "Deleted";
            // });
            let Total = self.peritonitisList.length;            
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            } 
            if (Total > 0) {
                self.deletedItemsLength = _.filter(self.peritonitisList, { 'Status': 'Deleted' }).length;
                self.peritonitisList = self.peritonitisList;
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.peritonitisList = [];
            }  
            // self.peritonitisList.sort((a, b) => {
            //     if(a.Times > b.Times){
            //         return 1;
            //     }
            //     if(a.Times < b.Times){
            //         return -1;
            //     }
            // });            
            // for(let i=0;i<self.peritonitisList.length;i++){        
            //     if(self.peritonitisList[i].Status !== 'Deleted'){
            //         self.peritonitisList[i].StatusData = 'ViewData';
            //     }
            // }  

        }, (res) => {
            console.log("peritonitisService getAll Fail", res);
        });
    };

    self.openCreateDialog = function () {
        console.log("PD peritonitis openCreateDialog");
        let tmpPE = {};
        tmpPE.Infection_Category = "PERITONITIS";
        tmpPE.MedicalId = self.currentPatient.MedicalId;

        tmpPE.Times = findNewTimes() + 1;
        tmpPE.StartDate = new Date();
        tmpPE.RecordDate = new Date();
        tmpPE.Symptoms = "";
        tmpPE.Occurrence = "";
        tmpPE.Nursing_Measures = "";
        tmpPE.Treatment_Date = new Date();
        tmpPE.Treatment_Result = "";
        tmpPE.Evaluation_Date = new Date();
        tmpPE.Evaluation_Result = "";
        tmpPE.Memo = "CREATE";

        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        $mdDialog.show({
            controller: 'peEditController',
            template: dialog,
            locals: {
                peItem: tmpPE,
                ptId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    function findNewTimes(){
        let maxTimes = 0;

        for(let i = 0; i< self.peritonitisList.length; i++){
            if( maxTimes < self.peritonitisList[i].Times){
                maxTimes = self.peritonitisList[i].Times;
            }
        }
        
        return maxTimes;
    }

    self.openEditDialog = function (peItem) {
        console.log("PD peritonitis openEditDialog", peItem);

        peItem.Treatment_Date = new Date(peItem.Treatment_Date);
        peItem.Evaluation_Date = new Date(peItem.Evaluation_Date);

        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        $mdDialog.show({
            controller: 'peEditController',
            template: dialog,
            locals: {
                peItem: peItem,
                ptId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    
    self.deleteOne = function (ev, delItem) {
        const confirm = $mdDialog.confirm()
            .title($translate('peritonitis.component.confirmDelete')) // '刪除確認'
            .textContent($translate('peritonitis.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('peritonitis.component.deleteOk')) // '刪除'
            .cancel($translate('peritonitis.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            console.log("deleteOne", delItem);

            delItem.Status = "Deleted";
            peritonitisService.put(delItem).then((res) => {
                console.log("peritonitis update success", res);
                showMessage($translate('peritonitis.component.deleteSuccess'));
                $rootScope.$emit("peritonitisListRefreshEvent", "");
            }, (res) => {
                console.log("peritonitis update fail", res);
                showMessage($translate('peritonitis.component.deleteFail'));
            });

            self.getList();
            $mdDialog.hide();
        }, () => {
            $mdDialog.hide();
        });
    };

}
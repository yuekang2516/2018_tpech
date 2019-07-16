
import './catheterInfect.less';
import dialog from './cathListEdit.dialog.html';

const tpl = require('./catheterInfect.html');

angular.module('app').component('catheterInfect', {
    template: tpl,
    controller: catheterInfectCtrl
});

catheterInfectCtrl.$inject = [
    '$stateParams', '$mdDialog', 'PatientService','SettingService', '$filter', '$mdMedia', 'catheterInfectService', 
    '$rootScope', 'showMessage'
    ];

function catheterInfectCtrl(
    $stateParams, $mdDialog, PatientService, SettingService, $filter, $mdMedia, catheterInfectService, 
    $rootScope, showMessage
    ) {
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;

    self.loading = true;
    //目前病人
    self.currentPatient = {};
    // 資料庫資料 感染記錄
    self.peritonitisList = [];
    //刪除狀態
    self.showDeleted = false;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };

    self.$onDestroy = function () {

    };
    self.lastAccessTime = moment();

    self.refresh = function(){
        page = 1;
        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)        
        self.getList();
        self.lastAccessTime = moment();
    }
    $rootScope.$on("catheterInfectListRefreshEvent", function (event, data) {
        console.log("$rootScope $on catheterInfectListRefreshEvent");
        self.getList();
    });

    self.switchShowDeleted = function(showDeleted){
        // && $ctrl.fiList.Status !== 'Deleted'
        self.showDeleted = !showDeleted;
        console.log("self.showDeleted--",self.showDeleted);
        self.getList();
    }

    self.getList = function(){
        self.peritonitisList = [];
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;

            console.log("currentPatient Success", self.currentPatient);
            console.log("MedicalId--",self.currentPatient.MedicalId);

            catheterInfectService.getInfectionRecord(self.currentPatient.MedicalId).then((res) => {
                console.log("catheterInfectService getAll Success", res);
                self.peritonitisList = angular.copy(res.data);   
                self.peritonitisList = $filter('orderBy')(self.peritonitisList,'-Times');             
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
                // for(let i=0;i<self.peritonitisList.length;i++){        
                //     if(self.peritonitisList[i].Status !== 'Deleted'){
                //         self.peritonitisList[i].StatusData = 'ViewData';
                //     }
                // }  
            }, (res) => {
                console.log("catheterInfectService getAll Fail", res);
            });
        }, (res) => {
            console.log("catheterInfectService getList Fail", res);
        });
    };
    
    self.openCreateDialog = function () {
        console.log("PD peritonitis openCreateDialog");
        let tmpPE = {};
        tmpPE.Infection_Category = "CATHETER";
        tmpPE.MedicalId = self.currentPatient.MedicalId;
        tmpPE.Times = findNewTimes() + 1;
        tmpPE.RecordDate = new Date();
        tmpPE.Memo = "CREATE"; // 借欄位
        tmpPE.Symptoms = "";
        tmpPE.Catheter_Outlet_Evaluate = "";
        tmpPE.Secretion_Trait = "";
        tmpPE.Secretion_Color = "";
        tmpPE.Description_Infection_Status = "";
        tmpPE.Occurrence = "";
        tmpPE.Nursing_Measures = "";
        tmpPE.Treatment_Date = new Date();
        tmpPE.Treatment_Result = "";
        tmpPE.Evaluation_Date = new Date();
        tmpPE.Evaluation_Result = "";

        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        $mdDialog.show({
            controller: 'cathListEditController',
            template: dialog,
            locals: {
                cathItem: tmpPE,
                cathPatientId: self.patientId
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

    self.openEditDialog = function (cathItem) {
        console.log("PD peritonitis openEditDialog", cathItem);

        cathItem.Treatment_Date = new Date(cathItem.Treatment_Date);
        cathItem.Evaluation_Date = new Date(cathItem.Evaluation_Date);
        cathItem.Memo = "";

        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        $mdDialog.show({
            controller: 'cathListEditController',
            template: dialog,
            locals: {
                cathItem: cathItem,
                cathPatientId: self.patientId
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
    self.deleteOne = function (ev, compItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('catheterInfect.component.confirmDelete')) // '刪除確認'
            .textContent($translate('catheterInfect.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('catheterInfect.component.deleteOk')) // '刪除'
            .cancel($translate('catheterInfect.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            compItem.Status = "Deleted";
            console.log("deleteOne", compItem);

            catheterInfectService.put(compItem).then((res) => {
                console.log("catheterInfect update success", res);
                showMessage($translate('catheterInfect.component.deleteSuccess'));
                $rootScope.$emit("catheterInfectListRefreshEvent", "");
            }, (res) => {
                console.log("catheterInfect update fail", res);
                showMessage($translate('catheterInfect.component.deleteFail'));
            });

            self.getList();
            $mdDialog.hide();

        }, () => {
            $mdDialog.hide();
        });
    };

}
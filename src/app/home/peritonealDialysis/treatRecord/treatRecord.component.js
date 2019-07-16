import tpl from './treatRecord.html';
import './treatRecord.less';
import dialog from './treatEdit.dialog.html';

angular.module('app').component('treatRecord', {
    template: tpl,
    controller: treatRecordCtrl
});

treatRecordCtrl.$inject = [
    '$stateParams', 'PatientService', '$mdDialog', '$mdSidenav', 'showMessage','$rootScope',  
    'SettingService', '$filter', 'pdTreatService', '$mdMedia','epoService','infoService','$state'];
function treatRecordCtrl(
    $stateParams, PatientService, $mdDialog, $mdSidenav, showMessage, $rootScope, 
    SettingService, $filter, pdTreatService, $mdMedia,epoService,infoService,$state) {
    const self = this;
    self.isBrowser = cordova.platformId === 'browser';
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.treatList = [];
    self.loading = true;
    let page = 1;
    let maxpage = 0;
    let limit = 50;
    self.myStyle = { right: '120px'}
    // self.isBrowser = cordova.platformId === 'browser';
    // if(self.isBrowser){
    //     self.myStyle = { right: '180px'}
    // }else{
    //     self.myStyle = { right: '120px'}
    // }
    //刪除狀態
    self.showDeleted = false;

    //腹膜透析類別
    self.DialysisType = [];
    //透析液系統
    self.DialysisSystem = [];
    //藥水種類
    self.DialysisCategory = [];
    self.DialysisCategoryAPD = [];
    //葡萄糖濃度
    self.Concentration_Bd = [];
    //鈣離子濃度
    self.Calcium = [];
    //每日袋數
    self.Quantity = [];

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
        self.getEpoServiceList();
        self.getInfoService();
    };

    self.lastAccessTime = moment();

    self.refresh = function(){
        $rootScope.$emit("treatRecordRefreshEvent", "");
        self.lastAccessTime = moment();
    }

    $rootScope.$on("treatRecordRefreshEvent", function (event, data) {
        console.log("$rootScope $on treatRecordRefreshEvent");
        self.getList();
    });

    self.switchShowDeleted = function(showDeleted){
        // && $ctrl.fiList.Status !== 'Deleted'
        self.showDeleted = !showDeleted;
        console.log("self.showDeleted--",self.showDeleted);
        self.getList();
    }

    self.$onDestroy = function () {

    };

    self.getList = function(){
        self.treatList = [];
        pdTreatService.getList(self.patientId).then((res) => {
            console.log("pdTreatService getList SUCCESS", res);
            self.treatList = angular.copy(res.data);
            self.treatList = $filter('orderBy')(self.treatList,'-Prescription_Startdate');
            // self.treatList = self.treatList.filter(e =>{
            //     return e.Status != "Deleted";
            // });
            let Total = self.treatList.length;            
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            } 
            if (Total > 0) {
                self.deletedItemsLength = _.filter(self.treatList, { 'Status': 'Deleted' }).length;
                self.treatList = self.treatList;
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.treatList = [];
            }

            //for(let i=0;i<Total;i++){    
                // if(self.treatList[i].Status !== 'Deleted'){
                //     self.treatList[i].StatusData = 'ViewData';
                // }
                
                //
                // //兼做血液透析次/月(HD) number
                // "Monthly_Hemodialysis_Times": 0,
                // //ESA劑量
                // "Esa_Dose_U": 0,
                // //數量
                // "Esa_Dose_Ug": 0,  
                // //白天換袋次數        
                // "Day_Changed_Bag_Times": 0,
                // //每日換袋次數
                // "Daily_Changed_Bag_Times": 0,
                // //每日換液量(ml)
                // "Daily_Total_Litres": 0,
                // //夜間總治療時間(hr)
                // "Night_Total_Treatment_Time": 0,
                // //灌注量(L)
                // "Night_Perfusion_Volume": 0,
                // //換液次數
                // "Night_Liquid_Exchange_Times": 0,
            //}
        }, (res) => {
            console.log("pdTreatService getList FAIL", res);
        });
    };

    self.getInfoService = function(){        
        self.infoServiceDataObj = [];
        infoService.get().then((resp) => {
            self.infoServiceDataObj = resp.data;
            ////藥水種類
            if (self.infoServiceDataObj.DefinitionSetting == null) {
                self.DialysisCategory = ["Dianeal LOW CALCIUM", "Nutrineal", "Extraneal"];
            } else {
                self.DialysisCategoryCAPD = self.infoServiceDataObj.DefinitionSetting.Records.Categories.MedicineLiquidKindCAPD;
                self.DialysisCategoryAPD = self.infoServiceDataObj.DefinitionSetting.Records.Categories.MedicineLiquidKindAPD;
                //預設
                self.DialysisCategory = self.DialysisCategoryCAPD;
            }
            //腹膜透析類別
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdKind !== null){
                self.DialysisType = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdKind;
            }
            //換液系統
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdLESys !== null){
                self.DialysisEsSystem = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdLESys;
            }
            //透析液系統
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdWaterSys !== null){
                self.DialysisSystem = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdWaterSys;
            }
            //葡萄糖濃度
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdGlucose !== null){
                self.Concentration_Bd = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdGlucose;
            }
            //鈣離子濃度
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdCalcium !== null){
                self.Calcium = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdCalcium;
            }
            //每日袋數
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdBagNum !== null){
                self.Quantity = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdBagNum;
            }
            //注入量
            if(self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdInjectNum !==null){
                self.Concentration_GLC = self.infoServiceDataObj.DefinitionSetting.Records.Categories.PdInjectNum;
            }
            console.log("self.infoServiceDataObj--", self.infoServiceDataObj);
            console.log("self.DialysisCategory--", self.DialysisCategory);
        }, (resp) => {
            showMessage($translate('customMessage.DataReadFailure')); // lang.DataReadFailure
            console.log("infoService getList Fail", resp);
        });
    }

    self.openCreateDialog = function () {
        console.log("PD treatment openCreateDialog");
        // fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        let treatItem = {};
        
        treatItem.DialysisCategory = self.DialysisCategory;
        treatItem.DialysisCategoryAPD = self.DialysisCategoryAPD;
        treatItem.DialysisCategoryCAPD = self.DialysisCategoryCAPD;
        treatItem.DialysisType = self.DialysisType
        treatItem.DialysisEsSystem = self.DialysisEsSystem;
        treatItem.DialysisSystem = self.DialysisSystem;
        treatItem.Concentration_Bd = self.Concentration_Bd;
        treatItem.Calcium = self.Calcium;
        treatItem.Quantity = self.Quantity;
        treatItem.Concentration_GLC = self.Concentration_GLC;

        treatItem.ESATypesByEpo = self.ESATypesByEpo;

        treatItem.isCreate = true;
        $mdDialog.show({
            controller: 'treatEditController',
            template: dialog,
            locals: {
                treatItem: treatItem,
                ptId: self.patientId
            },
            parent: angular.element(document.body),
            bindToController: true,
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
        
            self.getList();
        });
    };

    self.getEpoServiceList = function(){
        epoService.getList().then((res) => {
            self.ESATypesByEpo = res.data;
            console.log("epoService ESATypesByEpo",res);
            for(let i=0;i<res.data.length;i++){
                if(res.data[i].Frequencys.length > 0){
                    res.data[i].Frequencys = res.data[i].Frequencys.filter(e =>{
                        return e != 'ST';
                    })
                }
                self.ESATypesByEpo[i].Value = res.data[i].Name;
                self.ESATypesByEpo[i].Text = res.data[i].Name;
                self.ESATypesByEpo[i].ugCount = res.data[i].Quantity;
                self.ESATypesByEpo[i].ugUnit = res.data[i].QuantityUnit;
                self.ESATypesByEpo[i].esaCount = res.data[i].Dose;
                self.ESATypesByEpo[i].esaUnit = res.data[i].DoseUnit;   
                self.ESATypesByEpo[i].Frequency = res.data[i].Frequencys[0];
                //self.checkViewFrequency(res.data[i].Frequencys);            
            }
            // let tempEsa = {};
            // tempEsa.Value = "Epoeptin-a(Eprex)";
            // tempEsa.Text = "Epoeptin-a(Eprex)";
            // tempEsa.ugCount = "10";
            // tempEsa.ugUnit = "mg";
            // tempEsa.esaCount = "10";
            // tempEsa.esaUnit = "mg";
            // tempEsa.Frequency = ["QDPC"];
            // self.ESATypesByEpo.push(tempEsa);
            console.log("self.ESATypesByEpo--", self.ESATypesByEpo);        
            console.log("epoService getList success", res); 
        }, (res) => {
            console.log("epoService getList Fail", res);
        });
    }

    self.openEditDialog = function (treatItem,isCopy) {  
            let _treatItem = angular.copy(treatItem);
            _treatItem.DialysisCategory = self.DialysisCategory;
            _treatItem.DialysisCategoryAPD = self.DialysisCategoryAPD;
            _treatItem.DialysisCategoryCAPD = self.DialysisCategoryCAPD;
            _treatItem.DialysisType = self.DialysisType;
            _treatItem.DialysisEsSystem = self.DialysisEsSystem;
            _treatItem.DialysisSystem = self.DialysisSystem;
            _treatItem.Concentration_Bd = self.Concentration_Bd;
            _treatItem.Calcium = self.Calcium;
            _treatItem.Quantity = self.Quantity;
            _treatItem.Concentration_GLC = self.Concentration_GLC;  

            _treatItem.ESATypesByEpo = self.ESATypesByEpo;
            _treatItem.dialogFrequency = _treatItem.Frequency;
            _treatItem.isCreate = false;
            _treatItem.isCopy = isCopy;
            console.log("PD treatment openEditDialog", _treatItem);
            
            //fullscreen Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
            $mdDialog.show({
                controller: 'treatEditController',
                template: dialog,
                locals: {
                    treatItem: _treatItem,
                    ptId: self.patientId
                },
                parent: angular.element(document.body),
                bindToController: true,
                fullscreen: true,
                controllerAs: '$ctrl'
            }).then((result) => {
                
                self.getList();
            });

    };

    self.deleteOne = function (ev, treatItem) {
        const confirm = $mdDialog.confirm()
            .title($translate('treatRecord.component.confirmDelete')) // '刪除確認'
            .textContent($translate('treatRecord.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('treatRecord.component.deleteOk')) // '刪除'
            .cancel($translate('treatRecord.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            console.log("deleteOne", treatItem);

            treatItem.Status = "Deleted";
            pdTreatService.put(treatItem).then((res) => {
                console.log("treatRecord update success", res);
                showMessage($translate('treatRecord.component.deleteSuccess'));
                $rootScope.$emit("treatRecordRefreshEvent", "");
            }, (res) => {
                console.log("treatRecord update fail", res);
                showMessage($translate('treatRecord.component.deleteFail'));
            });

            self.getList();
            $mdDialog.hide();
        }, () => {
            $mdDialog.hide();
        });
    };

    self.printPaper = function(item){ 
        console.log('is item',item);
        //$state.go("auctions", {"product": auction.product, "id": auction.id}); 
        $state.go('printTreat',{"item":item});
    }

}
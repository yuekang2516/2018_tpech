import tpl from './selfCare.html';
import dialog from './sCareEdit.dialog.html';
import "./selfCare.less";

angular.module('app').component('selfCare', {
    template: tpl,
    controller: selfCareCtrl
});

selfCareCtrl.$inject = [
    '$stateParams', '$window','SettingService', 'selfCareService', '$mdDialog', '$mdMedia', '$filter', 'showMessage','$state'];
function selfCareCtrl(
    $stateParams,$window, SettingService, selfCareService, $mdDialog, $mdMedia, $filter, showMessage,$state) {

    const self = this;

    self.totalCnt = 0;
    self.deletedItemsLength = -1;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    let $translate = $filter('translate');
    // 預設狀態
    self.lastAccessTime = moment();
    

    self.patientId = $stateParams.patientId;
    self.isBrowser = cordova.platformId === 'browser';
    if(self.isBrowser){
        self.myStyle = { right: '180px'}
    }else{
        self.myStyle = { right: '120px'}
    }

    
    self.selfCareObject = {};

    self.$onInit = function onInit() {
        self.getList();
    };
    function chkTitleOK(chkdata){
        for (let i = chkdata.length; i--;) {
            let checkdata = chkdata[i];
            //腹膜透析環境介紹
            checkdata.EnvironmentFlg = TitleChk(['Environment_Target','Emergency_Exit'],checkdata);

            //腹膜透析認識
            checkdata.KnowdialysisFlg = TitleChk(['Knowdialysis_Target','Last_Renal_Fail','Pd_Treat_Principle','Catheter_Function'],checkdata);

            //腹膜透析液認識及自我管理
            checkdata.SelfcontrolFlg = TitleChk(['Selfcontrol_Target','Self_Pd_Treatment','Liquid_Save_Use','Liquid_Heat_Method',
                'Liquid_Check_Method','Antic_Situation'],checkdata);

            //正確操作腹膜透析技術
            checkdata.Correct_UserFlg = TitleChk(['Correct_User','Twinbag_Unsmooth','Emptybag_Drainage',
                'Auto_Change_Alarm','Catheter_Medicine','Artifical_Anus'],checkdata);

            //日常生活居家注意事項
            checkdata.LivingFlg = TitleChk(['Living_Target','Peritonitis_Prevent','Catheter_Care','Catheter_Fix_Method','Daily_Measure',
                'Anemia_Situation','Dialysis_Drug','Hygiene_Care','Suitable_Exercise',
                'Prevent_Faller','Back_Hosp_Situation','Hosp_Contact_Way'],checkdata);

            //腹膜透析飲食
            checkdata.DietFlg = TitleChk(['Diet_Target','Great_High_Protein','High_Phosphorous','High_Potassium','Irony_Food',
                'High_Vit_C_Food','Great_Cook_Oil','Water_Absorb'],checkdata);

            //出院準備
            checkdata.OuthospFlg = TitleChk(['Outhosp_Target','Pd_Back_Hosp','Home_Transport','Long_Pd_Govhelp'],checkdata);
            checkdata.chklength = (['EnvironmentFlg','KnowdialysisFlg','SelfcontrolFlg','Correct_UserFlg','LivingFlg','DietFlg','OuthospFlg'].filter(
                e=>{ return checkdata[e] == false; })).length;
        }

    }
    function TitleChk(itemAry,item){
        let flg = true;
        itemAry.forEach(e =>{
            if(item[e] == null){
                flg = false;
                return;
            }
        });
        return flg;
    }
    self.getList = function () {
        self.loading = true;

        selfCareService.getListByPatientID(self.patientId).then((res) => {
            let Total = res.data.length;
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            }
            // console.log(maxpage);
            if (Total > 0) {
                self.sCareList = res.data;
                chkTitleOK(self.sCareList);
                console.log('self.sCareList)',self.sCareList);
                self.deletedItemsLength = _.filter(res.data, { 'Status': 'Deleted' }).length;
            } else {
                self.sCareList = [];
            }
            //self.lastAccessTime = NursingRecordService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, (res) => {
            self.loading = false;
            self.isError = true;
        });
    };
    self.refresh = function(){
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.sCareList = []
        self.getList();
        self.lastAccessTime = moment();
    }
    self.$onDestroy = function () {

    };

    self.saveData = function () {

    };

    self.printPaper = function(item){ 
        console.log('is item',item);
        //$state.go("auctions", {"product": auction.product, "id": auction.id}); 
        $state.go('printSelfCare',{"item":item});
    }

    self.openCreateDialog = function () {
        console.log("sCareEditController openCreateDialog123");
        let sCareItem = {};
        sCareItem.isCreate = true;
        sCareItem.isCopy = false;
        //取最新的資料id
        $mdDialog.show({
            controller: 'sCareEditController',
            template: dialog,
            locals: {
                sCareItem: sCareItem
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

    self.openEditDialog = function(sCareItem,index,isCopy){
        sCareItem.isCreate = false;
        sCareItem.isCopy = isCopy;
        $mdDialog.show({
            controller: 'sCareEditController',
            template: dialog,
            locals: {
                sCareItem: sCareItem
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });


    }

    // 刪除    
    self.deleteOne = function (ev, selfCareItem) {
        const confirm = $mdDialog.confirm()
            .title($translate('selfCare.component.confirmDelete')) // '刪除確認'
            .textContent($translate('selfCare.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('selfCare.component.deleteOk')) // '刪除'
            .cancel($translate('selfCare.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            selfCareItem.Status = "Deleted";
            console.log("deleteOne", selfCareItem);
            selfCareService.put(selfCareItem).then((res) => {
                self.getList();
                $mdDialog.hide();
                console.log("selfCare update success", res);
                showMessage($translate('selfCare.component.deleteSuccess'));
            }, (res) => {
                console.log("selfCare update fail", res);
                showMessage($translate('selfCare.component.deleteFail'));
            });

            

        }, () => {
            $mdDialog.hide();
        });
    };

}
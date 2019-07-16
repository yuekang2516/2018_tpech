import tpl from './capdTraining.html';


angular.module('app').component('capdTraining', {
    template: tpl,
    controller: capdTrainingCtrl
});

capdTrainingCtrl.$inject = ['capdTrainingService', '$stateParams', '$filter', 'SettingService', 'showMessage','$window'];

function capdTrainingCtrl(capdTrainingService, $stateParams, $filter, SettingService, showMessage,$window) {
    
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.loading = true;
    self.isBrowser = cordova.platformId === 'browser';
    self.opMode = "CREATE";
    // APD Setting 資料物件
    self.capdDataObj = {};


    self.$onInit = function onInit() {

        self.loading = false;
        console.log("WT DEBUG capdTrainingCtrl");
        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        // self.ModuleFunctions = SettingService.getCurrentHospital().ModuleFunctions ? SettingService.getCurrentHospital().ModuleFunctions : null;

        // 取得登入者角色，決定tab順序
        // self.loginRole = SettingService.getCurrentUser().Role;
        // console.log('取得登入者角色 self.loginRole', self.loginRole);
        
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        //#region 取得舊有資料
        capdTrainingService.getOne("5c7cde846b21fa21ec2872a5").then((res) => {
            console.log("getOne Success", res);

            if (res.data !== "") {
                // Modify Mode
                self.opMode = "MODIFY";
                self.capdDataObj.Id = res.data.Id;

                //血壓控制
                self.capdDataObj.Blood_Pressure_Ctrl = res.data.Blood_Pressure_Ctrl;
                //CAPD原理
                self.capdDataObj.CAPD_Principle = res.data.Capd_Principle;
                //合併症處理方法
                self.capdDataObj.Treatment_Complications = res.data.Treatment_Complications;
                //體重測量
                self.capdDataObj.Weight_Meas = res.data.Weight_Meas;
                //血壓測量
                self.capdDataObj.Blood_Pressure_Meas = res.data.Blood_Pressure_Meas;
                //換液操作
                self.capdDataObj.Liquid_Exchange = res.data.Liquid_Exchange;
                //導管處理
                self.capdDataObj.Catheter_Handling = res.data.Catheter_Handling;
                //注意事項
                self.capdDataObj.Points_Attention = res.data.Points_Attention;
            }
        }, (res) => {
            console.log("getOne Fail", res);
        });
        //#endregion

    };

    self.saveData = function () {
        console.log("capdDataObj Data Object--", self.capdDataObj);
        console.log("selfOpMode--", self.opMode);

        if(self.opMode === "CREATE"){
            capdTrainingService.post(self.capdDataObj).then((res) => {
                console.log("capdTraining Post Success", res);
                showMessage($translate('capdTraining.component.createSuccess'));

            }, (res) => {
                console.log("capdTraining Post Fail", res);
                showMessage($translate('capdTraining.component.createFail'));
                
            });        
        }else{
            capdTrainingService.put(self.capdDataObj).then((res) => {
                console.log("capdTraining Put Success", res);
                showMessage($translate('capdTraining.component.editSuccess'));

            }, (res) => {
                console.log("capdTraining Put Fail", res);
                showMessage($translate('capdTraining.component.editFail'));
    
            });
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
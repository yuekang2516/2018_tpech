import tpl from './quantityEvaluate.html';
import dialog from './qeEdit.dialog.html';

angular.module('app').component('quantityEvaluate', {
    template: tpl,
    controller: quantityEvaluateCtrl
});

quantityEvaluateCtrl.$inject = ['$stateParams', 'SettingService', '$filter', 
'pdEvaluateService', '$mdDialog', '$mdMedia', 'showMessage','$rootScope','PatientService'];
function quantityEvaluateCtrl($stateParams, SettingService, $filter, 
pdEvaluateService, $mdDialog, $mdMedia, showMessage,$rootScope,PatientService) {
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.loading = true;
    // List Data Array
    self.evaluateList = [];
    self.ExportDataList = [];
    //刪除狀態
    self.showDeleted = false;
    let page = 1;
    let maxpage = 0;
    let limit = 50;
    let Glucose_D0_Hour_4_Result =[
        {"Value":"1","Text":"1 低:0.61-0.50"},
        {"Value":"2","Text":"2 低平均:0.49-0.39"},
        {"Value":"3","Text":"3 高平均:0.38-0.27"},
        {"Value":"4","Text":"4 高:0.26-0.12"}
    ];
    let Creatinine_Dp_Hour_4_Result =[
        {"Value":"1","Text":"1 高:1.03-0.82"},
        {"Value":"2","Text":"2 高平均:0.81-0.66"},
        {"Value":"3","Text":"3 低平均:0.65-0.51"},
        {"Value":"4","Text":"4 低:0.50-0.35"}
    ];
    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };

    self.lastAccessTime = moment();

    self.refresh = function(){
        page = 1;
        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)        
        self.getList();
        self.lastAccessTime = moment();
    }
    $rootScope.$on("quantityEvaluateRefreshEvent", function (event, data) {
        console.log("$rootScope $on quantityEvaluateRefreshEvent");
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

    self.getList = function () {
        self.evaluateList = [];
        self.loading = true;
        console.log("self.patientId--",self.patientId);
        pdEvaluateService.getList(self.patientId).then((res) => {
            console.log("pdEvaluate getList Success", res);
            //self.evaluateList = res.data;
            //self.evaluateList = $filter('orderBy')(self.evaluateList,'-Recorddate');
            // // self.evaluateList = self.evaluateList.filter(e =>{
            //     return e.Status != "Deleted";
            // });
            let Total = res.data.length;
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            } 
            if (Total > 0) {
                self.evaluateList = [];
                self.evaluateList = angular.copy(res.data);
                self.evaluateList = $filter('orderBy')(self.evaluateList,'-Recorddate'); 
                self.deletedItemsLength = _.filter(self.evaluateList, { 'Status': 'Deleted' }).length;
                Data_Append();
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.evaluateList = [];
            }  
            // for(let i=0;i<self.evaluateList.length;i++){        
            //     if(self.evaluateList[i].Status !== 'Deleted'){
            //         self.evaluateList[i].StatusData = 'ViewData';
            //     }
            // }  
            self.loading = false;
        }, (res) => {
            console.log("pdEvaluate getList Fail", res);

        });
    };
    function Data_Append(){
        PatientService.getById(self.patientId).then((res) => {
            self.currentPatient = res.data;
            self.ExportDataList = angular.copy(self.evaluateList)
            self.ExportDataList.forEach(element => {
                element.Weight = self.currentPatient.Weight;
                element.Height = self.currentPatient.Height;   
                let D0_item = _.filter(Glucose_D0_Hour_4_Result,{"Value":element.Glucose_D0_Hour_4_Result});
                let Dp_item = _.filter(Creatinine_Dp_Hour_4_Result,{"Value":element.Creatinine_Dp_Hour_4_Result});
                element.Glucose_D0_Hour_4_Result = (D0_item.length > 0)? D0_item[0].Text : "";
                element.Glucose_Dp_Hour_4_Result = (Dp_item.length > 0)? Dp_item[0].Text : "";
                setAutoValue(element);
            });
            self.ExportDataList = self.ExportDataList.filter(e =>{
                return e.Status != "Deleted";
            })
            console.log('self.ExportDataList',self.ExportDataList);
            
        }, (res) => {
            
        });
    }
    function setAutoValue (element){
        // self.currentPatient.Gender  性別 F 女、Ｍ 男
        let age = $filter('age')(self.currentPatient.Birthday);
        //BH:身高,BW:體重
        let BH = _.toNumber(self.currentPatient.Height)
        let BW = _.toNumber(self.currentPatient.Weight)
        
        if (_.isNumber(BH) && _.isNumber(BW) && _.isNumber(age) ) {
            let TBW = null;
            if(self.currentPatient.Gender == "M"){
                TBW = 2.447 + 0.3362 * BW + 0.1074 * BH - 0.09516 * age
            }
            if(self.currentPatient.Gender == "F"){
                TBW = 0 - 2.097 + 0.2466 * BW +  0.1069 * BH
            }
            if(!_.isNumber(TBW)){
                return;
            }
            let A1 = _.toNumber(element.Bun)  //BUN
            let B1 = _.toNumber(element.Serumcreatinine) //血清肌酸酐(mg/dl)
            let C1 = _.toNumber(element.Dialysate_Total_Hour_24) //24小時透析液總量
            let D1 = _.toNumber(element.Urea_Total_Hour_24) //24小時尿液總量
            let E1 = _.toNumber(element.Dialysate_Urea_Hour_24) //24小時透析液尿素氮
            let F1 = _.toNumber(element.Urea_Nitrogen_Hour_24) //24小時尿液尿素氮
            let G1 = _.toNumber(element.Dialysate_Creatinine_Hour_24) //24小時透析液肌酸酐
            let H1 = _.toNumber(element.Creatinine_Hour_24) //24小時尿液肌酸酐
            let UNA = _.toNumber(element.Una);
            element.KTV1 = Rounding((E1 / A1 * C1 * 7) / TBW);  //腹膜 Kt/V
            element.KTV2 = Rounding((F1 / A1 * D1 * 7) / TBW); //殘餘腎功能Kt/V
            element.KTV3 = Rounding(element.KTV1 + element.KTV2); //總和Kt/V
            element.CCR1 = Rounding(G1/B1 * C1 * 7); //腹膜廓清率（升/星期）
            element.CCR2 = Rounding(H1/B1 * D1 * 7); //殘餘腎功能（升/星期）
            element.CCRSUM = Rounding(element.CCR1 + element.CCR2); //總和廓清率（升/星期）
            element.Pna = Rounding(10.76 * (0.69 * UNA + 1.46));
            element.Npna = Rounding(element.Pna / BW);
        }


        //男女TBW
    }
    //四捨五入
    function Rounding(value){
        if(_.isNumber(value)){
            return Math.round(value * 100) / 100 
        }
        return;
    }

    self.openCreateDialog = function () {
        console.log("PD quantityEvaluate openCreateDialog");
        let qeItem = {};
        qeItem.Recorddate = new Date(moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        qeItem.isCreate = true;

        $mdDialog.show({
            controller: 'qeEditController',
            template: dialog,
            locals: {
                qeItem: qeItem,
                ptId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((res) => {
        });

    };

    self.openEditDialog = function (qeItem) {
        console.log("PD quantityEvaluate openEditDialog");
        let dialogQEItem = angular.copy(qeItem);
        dialogQEItem.Recorddate = new Date(moment(qeItem.Recorddate).format("YYYY-MM-DD"));
        $mdDialog.show({
            controller: 'qeEditController',
            template: dialog,
            locals: {
                qeItem: dialogQEItem,
                ptId: self.patientId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((res) => {
        });

    };

    self.deleteOne = function (ev, qeItem) {
        const confirm = $mdDialog.confirm()
            .title($translate('quantityEvaluate.component.confirmDelete')) // '刪除確認'
            .textContent($translate('quantityEvaluate.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('quantityEvaluate.component.deleteOk')) // '刪除'
            .cancel($translate('quantityEvaluate.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            console.log("deleteOne", qeItem);

            qeItem.Status = "Deleted";
            pdEvaluateService.put(qeItem).then((res) => {
                console.log("quantityEvaluate update success", res);
                showMessage($translate('quantityEvaluate.component.deleteSuccess'));
                $rootScope.$emit("quantityEvaluateRefreshEvent", "");
            }, (res) => {
                console.log("quantityEvaluate update fail", res);
                showMessage($translate('quantityEvaluate.component.deleteFail'));
            });

            // self.getList();
            $mdDialog.hide();
        }, () => {
            $mdDialog.hide();
        });
    };

    self.exportExcel = function () {
        // excel
        let MyTabel = $('#excelTable');

        MyTabel.tableExport({
            fileName: 'evaluate'
        });
    };
}

angular.module('app').directive('keepNumber', function() {
    var directiveDefinitionObject = {
        restrict: "A", //指令的使用方式，包括标签，属性，类，注释
        link: function postLink(scope, iElement, iAttrs) {
            console.log('scope',scope);
            console.log('iElement',iElement);
            //onkeydown="if(event.keyCode==13)event.keyCode=9" 
            //onkeypress="if ((event.keyCode<48 || event.keyCode>57)) event.returnValue=false"
            iElement.bind('keydown', function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    return event.keyCode=9;
                }
            });
            iElement.bind('keypress', function(event) {
                if (event.keyCode!=46 && event.keyCode!=45 && (event.keyCode<48 || event.keyCode>57))  {
                    event.preventDefault();
                    return false;
                }
            });
            console.log('iAttrs',iAttrs);
        }, //以编程的方式操作DOM，包括添加监听器等
    };
    return directiveDefinitionObject;
});
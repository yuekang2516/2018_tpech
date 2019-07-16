import tpl from './complication.html';
import dialog from './compEdit.dialog.html';


angular.module('app').component('complication', {
    template: tpl,
    controller: complicationCtrl
});

complicationCtrl.$inject = [
    '$stateParams', 'SettingService', 'complicationService', '$rootScope', 
    '$mdDialog', '$mdMedia', 'PatientService', '$filter', 'showMessage'];
function complicationCtrl(
    $stateParams, SettingService, complicationService, $rootScope, 
    $mdDialog, $mdMedia, PatientService, $filter, showMessage) {

    const self = this;
    let $translate = $filter('translate');

    self.patientId = $stateParams.patientId;
    self.currentPatient = [];
    self.loading = true;
    // List Data Array
    self.compList = [];
    //刪除狀態
    self.showDeleted = false;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    console.log("self.patientId--", self.patientId);

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
    $rootScope.$on("ComplicationRefreshEvent", function (event, data) {
        console.log("$rootScope $on ComplicationRefreshEvent");
        self.getList();
    });

    self.switchShowDeleted = function(showDeleted){
        // && $ctrl.fiList.Status !== 'Deleted'
        self.showDeleted = !showDeleted;
        console.log("self.showDeleted--",self.showDeleted);
        self.getList();
    }

    self.getList = function () {
        self.loading = true;
        self.compList = [];
        complicationService.getListByPatientID(self.patientId).then((res) => {
            console.log("complicationService getList Success", res);       
            self.loading = false; 
            self.compList = res.data;        
            self.compList = $filter('orderBy')(self.compList,'-Record_Date');              
            // self.compList = self.compList.filter(e =>{
            //     return e.Status != "Deleted";
            // });   
            let Total = self.compList.length;            
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            } 
            if (Total > 0) {
                self.deletedItemsLength = _.filter(self.compList, { 'Status': 'Deleted' }).length;
                self.compList = self.compList;
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.compList = [];
            }  
            if (self.compList.length > 0) {
                self.compList.sort((a, b) => {
                    if (a.Record_Date > b.Record_Date) {
                        return 1;
                    }
                    if (a.Record_Date < b.Record_Date) {
                        return -1;
                    }
                    if (a.Record_Date === b.Record_Date) {
                        return 0;
                    }
                });

                let i = 0;

                self.compList.forEach((res) => {
                    self.compList[i].no = i + 1;      
                    // if(self.compList[i].Status !== 'Deleted'){
                    //     self.compList[i].StatusData = 'ViewData';
                    // }
                    i++;
                });
            }
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });
        console.log("compListNo", self.compList.no);

        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;

            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });

    };

    self.openCreateDialog = function () {
        let tmpComp = {};
        tmpComp.isCreate = true;
        //tmpComp.Record_Date = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        tmpComp.Treatment_Treatment = "";
        tmpComp.Non_Infection_Complication = "";
        tmpComp.infectionKind = "peritonitis";

        $mdDialog.show({
            controller: 'compEditController',
            template: dialog,
            locals: {
                compItem: tmpComp
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

    self.openEditDialog = function (tmpItem) {
        console.log("vtPhoneEditController openEditDialog");
        //tmpItem.Record_Date = new Date(moment(tmpItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));

        $mdDialog.show({
            controller: 'compEditController',
            template: dialog,
            locals: {
                compItem: tmpItem
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

            .title($translate('complication.component.confirmDelete')) // '刪除確認'
            .textContent($translate('complication.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('complication.component.deleteOk')) // '刪除'
            .cancel($translate('complication.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            compItem.Status = "Deleted";
            console.log("deleteOne", compItem);

            complicationService.put(compItem).then((res) => {
                console.log("complication update success", res);
                showMessage($translate('complication.component.deleteSuccess'));
                $rootScope.$emit("ComplicationRefreshEvent", "");
            }, (res) => {
                console.log("complication update fail", res);
                showMessage($translate('complication.component.deleteFail'));
            });

            self.getList();
            $mdDialog.hide();

        }, () => {
            $mdDialog.hide();
        });
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

    self.exportExcel = function () {
        let excelTable = "";
        excelTable += "<table id='excelTable'>";
        excelTable += "<thead><tr>";
        excelTable += "<th>序號</th>";
        excelTable += "<th>日期</th>";
        excelTable += "<th>感染併發症</th>";
        excelTable += "<th>感染併發症-細項</th>";
        excelTable += "<th>非感染併發症</th>";
        excelTable += "<th>非感染併發症-細項</th>";
        excelTable += "<th>細菌培養結果</th>";
        excelTable += "<th>治療結果</th>";
        excelTable += "</tr></thead>";
        excelTable += "<tbody>";

        for (let ti = 0; ti < self.compList.length; ti++) {
            excelTable += "<tr>";
            excelTable += "<td>" + self.compList[ti].no + "</td>";
            excelTable += "<td>" + moment(self.compList[ti].Record_Date).format("YYYY-MM-DD HH:mm:ss") + "</td>";

            if (self.compList[ti].Infection_Complication === null) {
                excelTable += "<td></td>"; // Infection_Complication
                excelTable += "<td></td>"; // Infection_Complication_Detail
                excelTable += "<td></td>"; // Non_Infection_Complication
                excelTable += "<td></td>"; // Non_Infection_Detail
            } else {
                switch (self.compList[ti].Infection_Complication) {
                    case "noninfection":
                        excelTable += "<td>無</td>"; //Infection_Complication
                        excelTable += "<td></td>"; //Infection_Complication_Detail

                        if (self.compList[ti].Non_Infection_Complication === null || self.compList[ti].Non_Infection_Complication === "") {
                            excelTable += "<td></td>"; //Non_Infection_Complication
                            excelTable += "<td></td>"; //Non_Infection_Detail
                        } else {
                            switch (self.compList[ti].Non_Infection_Complication) {
                                case "BSD":
                                    excelTable += "<td>Blood-stained Dialysate</td>"; //Non_Infection_Complication
                                    break;
                                case "CM":
                                    excelTable += "<td>Catheter Malfunction</td>"; //Non_Infection_Complication
                                    break;
                                case "EPS":
                                    excelTable += "<td>Encapsulation Peritoneal Sclerosis</td>"; //Non_Infection_Complication
                                    break;
                                case "HER":
                                    excelTable += "<td>Hernia</td>"; //Non_Infection_Complication
                                    break;
                                case "LEAK":
                                    excelTable += "<td>Leak</td>"; //Non_Infection_Complication
                                    break;
                                case "PTY":
                                    excelTable += "<td>Parathyroidectomy</td>"; //Non_Infection_Complication
                                    break;
                                case "UF":
                                    excelTable += "<td>UF Failure</td>"; //Non_Infection_Complication
                                    break;
                                case "OTHER":
                                    excelTable += "<td>其他</td>"; //Non_Infection_Complication
                                    break;
                            }
                            excelTable += "<td>" + (self.compList[ti].Non_Infection_Detail === null ? "" : self.compList[ti].Non_Infection_Detail) + "</td>"; //Non_Infection_Detail
                        }
                        break;
                    case "peritonitis":
                        excelTable += "<td>腹膜炎</td>"; //Infection_Complication
                        excelTable += "<td>" + (self.compList[ti].Infection_Complication_Detail === null ? "" : self.compList[ti].Infection_Complication_Detail) + "</td>"; //Infection_Complication_Detail
                        excelTable += "<td></td>"; //Non_Infection_Complication
                        excelTable += "<td></td>"; //Non_Infection_Detail
                        break;
                    case "tunnelitis":
                        excelTable += "<td>隧道炎</td>"; //Infection_Complication
                        excelTable += "<td></td>"; //Infection_Complication_Detail
                        excelTable += "<td></td>"; //Non_Infection_Complication
                        excelTable += "<td></td>"; //Non_Infection_Detail
                        break;
                    case "export":
                        excelTable += "<td>出口感染</td>"; //Infection_Complication
                        excelTable += "<td></td>"; //Infection_Complication_Detail
                        excelTable += "<td></td>"; //Non_Infection_Complication
                        excelTable += "<td></td>"; //Non_Infection_Detail
                        break;
                }
            }
            excelTable += "<td>" + (self.compList[ti].Bacterial_Culture_Results === null ? "" : self.compList[ti].Bacterial_Culture_Results) + "</td>";
            excelTable += "<td>" + (self.compList[ti].Treatment_Treatment === null ? "" : self.compList[ti].Treatment_Treatment.replace('OTHER_', '其他:')) + "</td>";
            excelTable += "</tr>";
        }

        excelTable += "</tbody>";
        excelTable += "<table>";

        $('#excelDiv').append(excelTable);
        let MyTabel = $('#excelTable');
        MyTabel.tableExport({
            fileName: 'complication'
        });
        $('#excelTable').remove();
    };
}
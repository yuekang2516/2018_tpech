import tpl from './orderLR.html';
import dialog from './odLREdit.dialog.html';


angular.module('app').component('orderLR', {
    template: tpl,
    controller: orderLRCtrl
});

orderLRCtrl.$inject = [
    '$stateParams', 'SettingService', 'orderLRService', '$mdDialog', '$mdMedia', '$filter', 'showMessage'];
function orderLRCtrl(
    $stateParams, SettingService, orderLRService, $mdDialog, $mdMedia, $filter, showMessage) {
    
    const self = this;
    let $translate = $filter('translate');
    self.patientId = $stateParams.patientId;
    self.loading = true;
    // List Data Array
    self.orderLRList = [];

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };

    self.getList = function () {
        self.loading = true;

        orderLRService.getListByPatientID(self.patientId).then((res) => {
            console.log("orderLRService getList Success", res);
            self.orderLRList = res.data;
            console.log("orderLRList--",self.orderLRList);
            self.loading = false;
        }, (res) => {
            console.log("orderLRService getList Fail", res);

        });
    };

    self.openCreateDialog = function () {
        console.log("odLREditController openCreateDialog");
        let odLRItem = {};
        odLRItem.isCreate = "True";
        //odLRItem.Record_Date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

        $mdDialog.show({
            controller: 'odLREditController',
            template: dialog,
            locals: {
                odLRItem: odLRItem
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: $mdMedia('xs'),
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    self.openEditDialog = function (odLRItem) {
        console.log("odLREditController openEditDialog");
        odLRItem.Record_Date = new Date(moment(odLRItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));

        $mdDialog.show({
            controller: 'odLREditController',
            template: dialog,
            locals: {
                odLRItem: odLRItem
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            controllerAs: '$ctrl'
        }).then((result) => {            
            self.getList();
        });

    };

    // 刪除    
    self.deleteOne = function (ev, odLRItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('orderLR.component.confirmDelete')) // '刪除確認'
            .textContent($translate('orderLR.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('orderLR.component.deleteOk')) // '刪除'
            .cancel($translate('orderLR.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            odLRItem.Status = "Deleted";
            console.log("deleteOne", odLRItem);

            orderLRService.put(odLRItem).then((res) => {
                console.log("orderLR update success", res);
                showMessage($translate('orderLR.component.deleteSuccess'));
            }, (res) => {
                console.log("orderLR update fail", res);
                showMessage($translate('orderLR.component.deleteFail'));
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

    self.back = function back() {
        // $state.go('allPatients');
    };


}
import tpl from './orderST.html';
import dialog from './odSTEdit.dialog.html';


angular.module('app').component('orderST', {
    template: tpl,
    controller: orderSTCtrl
});

orderSTCtrl.$inject = [
    '$stateParams', 'SettingService', 'orderSTService', '$mdDialog', '$mdMedia', '$filter', 'showMessage'];
function orderSTCtrl(
    $stateParams, SettingService, orderSTService, $mdDialog, $mdMedia, $filter, showMessage) {
    
    const self = this;
    let $translate = $filter('translate');

    self.patientId = $stateParams.patientId;
    self.loading = true;
    // List Data Array
    self.orderSTList = [];

    self.$onInit = function onInit() {
        self.getList();
        self.loading = false;
    };

    self.getList = function () {
        self.loading = true;

        orderSTService.getListByPatientID(self.patientId).then((res) => {
            console.log("orderSTService getList Success", res);
            self.orderSTList = res.data;
            console.log("orderSTList--",self.orderSTList);
            self.loading = false;
        }, (res) => {
            console.log("orderSTService getList Fail", res);

        });
    };

    self.openCreateDialog = function () {
        console.log("odSTEditController openCreateDialog");
        let odSTItem = {};
        odSTItem.isCreate = "True";
        
        $mdDialog.show({
            controller: 'odSTEditController',
            template: dialog,
            locals: {
                odSTItem: odSTItem
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

    self.openEditDialog = function (odSTItem) {

        console.log("odSTEditController openEditDialog");
        odSTItem.Record_Date = new Date(moment(odSTItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));

        $mdDialog.show({
            controller: 'odSTEditController',
            template: dialog,
            locals: {
                odSTItem: odSTItem
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
    self.deleteOne = function (ev, odSTItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('orderST.component.confirmDelete')) // '刪除確認'
            .textContent($translate('orderST.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('orderST.component.deleteOk')) // '刪除'
            .cancel($translate('orderST.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            odSTItem.Status = "Deleted";
            console.log("deleteOne", odSTItem);

            orderSTService.put(odSTItem).then((res) => {
                console.log("orderST update success", res);
                showMessage($translate('orderST.component.deleteSuccess'));
            }, (res) => {
                console.log("orderST update fail", res);
                showMessage($translate('orderST.component.deleteFail'));
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
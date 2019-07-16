import tpl from './medicationExport.html';

angular.module('app').component('medicationExport', {
    template: tpl,
    controller: SystemMedicationExportCtrl,
    controllerAs: 'vm'
});

SystemMedicationExportCtrl.$inject = ['$mdSidenav', '$state', '$stateParams', 'medicineService', 'SettingService', 'showMessage', '$filter'];
function SystemMedicationExportCtrl($mdSidenav, $state, $stateParams,
    medicineService, SettingService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    const serverApiUrl = SettingService.getServerUrl();
    let idx;
    vm.loading = true;

    // 日期選單初始化
    vm.medicationExportStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.medicationExportEndDate = new Date();

    // 醫院代碼設定
    vm.systemCode = 'yuekang';

    vm.opts = {
        autoApply: true
    };

    // 切換勾選狀態
    vm.toggle = function toggle(item, list) {
        let checkbox = item;
        checkbox = isNaN(checkbox) ? checkbox : parseFloat(checkbox);
        idx = list.indexOf(checkbox);
        if (idx > -1) list.splice(idx, 1);
        else list.push(checkbox);
    };

    // 判斷群組內是否有勾選任何一個
    vm.exists = function exists(item, list) {
        if (!list || list.length === 0) {
            return false;
        }
        return list.indexOf(isNaN(item) ? item : parseFloat(item)) > -1;
    };

    // 取得所有的類別項目
    medicineService.getAllCategoryName().then((resp) => {
        vm.categories = resp.data;
        vm.loading = false;
    }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
    });

    vm.checkdcategories = [];
    vm.isDeleted = false;

    // 資料匯出
    vm.exportCSV = function exportCSV() {
        // 時間格式處理
        vm.medicationExportStartDateFormat = moment(vm.medicationExportStartDate).format('YYYY-MM-DD');
        vm.medicationExportEndDateFormat = moment(vm.medicationExportEndDate).format('YYYY-MM-DD');

        window.location = `${serverApiUrl}/api/kidit/ExportMedicationCSV?startDate=${vm.medicationExportStartDateFormat}&endDate=${vm.medicationExportEndDateFormat}&categories=${vm.checkdcategories}&isDeleted=${vm.isDeleted}&type=${SettingService.getLanguage()}`;
    };
}

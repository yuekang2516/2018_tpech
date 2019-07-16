import tpl from './epo.html';
import tp2 from './epoDetail.html';
import './epo.less';

angular.module('app').component('epo', {
    template: tpl,
    controller: SystemEPOCtrl,
    controllerAs: 'vm'
}).component('epoDetail', {
    template: tp2,
    controller: SystemEPODetailCtrl,
    controllerAs: 'vm'
});

// 列表
SystemEPOCtrl.$inject = ['$mdSidenav', '$state', '$timeout', 'epoService', 'showMessage', '$filter'];

function SystemEPOCtrl($mdSidenav, $state, $timeout, epoService, showMessage, $filter) {
    const vm = this;

    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.$onInit = function $onInit() {
        vm.loadEPOs();
    };

    // 取得藥品相關資料
    vm.loadEPOs = function loadEPOs() {
        vm.loading = true;

        epoService.getList().then((resp) => {
            vm.epos = resp.data;
            // vm.filterepos = vm.epos;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 進入藥品編輯頁面
    vm.go = function go(med) {
        $state.go('epoDetail', { id: med.Id });
    };

    // 進入藥品新增頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('epoDetail', { id: 'create' });
    };

    // vm.searchEPO = function () {
    //    if (!vm.search) {
    //        vm.filterepos = vm.epos;
    //        return;
    //    }
    //    vm.filterepos = vm.epos.filter((item) => {
    //        return (item.Name && item.Name.includes(vm.search))
    //            || (item.NHICode && item.NHICode.includes(vm.search))
    //            || (item.InternalCode && item.InternalCode.includes(vm.search));
    //    });
    // }
}

// 編輯頁
SystemEPODetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'epoService', 'showMessage', '$filter'];

function SystemEPODetailCtrl($state, $stateParams, $mdDialog, epoService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let idx;
    // 先初始化資料結構
    vm.formData = {};
    vm.formData.Routes = ['SC', 'IVD', 'IV', 'H'];
    vm.formData.Frequencys = [];

    vm.loading = false;
    vm.epo_id = $stateParams.id;

    // 用epo_id決定標題
    if (vm.epo_id === 'create') {
        vm.type = 'create';
        // vm.titleType = lang.AddDrugs;
    } else {
        vm.type = 'edit';
        // vm.titleType = lang.MedicationData;
    }

    // 選單預設值
    if (vm.epo_id !== 'create') {
        vm.loading = true;
        epoService.getById(vm.epo_id).then((resp) => {
            vm.formData = resp.data;
            //vm.formData.Frequencys = null; // 真的開欄位前暫放測試用
            if (vm.formData.Frequencys === null) {
                vm.formData.Frequencys = [];
            }
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // 畫面前台改變選取狀態的函數
    vm.toggle = function toggle(item, list) {
        const changedItem = isNaN(item) ? item : parseFloat(item);
        idx = list.indexOf(changedItem);
        if (idx > -1) list.splice(idx, 1);
        else list.push(changedItem);
    };

    // 檢查服法和頻率是否群組內至少有勾選一個以上
    vm.exists = function exists(item, list) {
        if (!list || list.length === 0) {
            return false;
        }

        return list.indexOf(isNaN(item) ? item : parseFloat(item)) > -1;
    };

    vm.Frequencys = {
        QDPC: $translate('medicine.component.MedQDPC'), // lang.MedQDPC,
        QN: $translate('medicine.component.MedQN'), // lang.MedQN,
        QOD: $translate('medicine.component.MedQOD'), // lang.MedQOD,
        HS: $translate('medicine.component.MedHS'), // lang.MedHS,
        TID: $translate('medicine.component.MedTID'), // lang.MedTID,
        TIDAC: $translate('medicine.component.MedTIDAC'), // lang.MedTIDAC,
        TIDPC: $translate('medicine.component.MedTIDPC'), // lang.MedTIDPC,
        BID: $translate('medicine.component.MedBID'), // lang.MedBID,
        BIDAC: $translate('medicine.component.MedBIDAC'), // lang.MedBIDAC,
        BIDPC: $translate('medicine.component.MedBIDPC'), // lang.MedBIDPC,
        STAT: $translate('medicine.component.MedST'), // lang.MedST,
        QID: $translate('medicine.component.MedQID'), // lang.MedQID,
        Q2W: $translate('medicine.component.MedQ2W'), // lang.MedQ2W,
        QD: $translate('medicine.component.MedQD'), // lang.MedQD,
        QW1: $translate('medicine.component.MedQW1'), // lang.MedQW1,
        QW2: $translate('medicine.component.MedQW2'), // lang.MedQW2,
        QW3: $translate('medicine.component.MedQW3'), // lang.MedQW3,
        QW4: $translate('medicine.component.MedQW4'), // lang.MedQW4,
        QW5: $translate('medicine.component.MedQW5'), // lang.MedQW5,
        QW6: $translate('medicine.component.MedQW6'), // lang.MedQW6,
        QW7: $translate('medicine.component.MedQW7'), // lang.MedQW7,
        QW135: $translate('medicine.component.MedQW135'), // lang.MedQW135,
        QW1357: $translate('medicine.component.MedQW1357'), // lang.MedQW1357,
        QW246: $translate('medicine.component.MedQW246'), // lang.MedQW246,
        QW2467: $translate('medicine.component.MedQW2467'), // lang.MedQW2467,
        PRN: $translate('medicine.component.MedPRN'), // lang.MedPRN,
        BIW15: $translate('medicine.component.MedBIW15'), // lang.MedBIW15,
        BIW26: $translate('medicine.component.MedBIW26'), // lang.MedBIW26,
        QW136: $translate('medicine.component.MedQW136'), // lang.MedQW136,
        QW146: $translate('medicine.component.MedQW146'), // lang.MedQW146,
        TIW: $translate('medicine.component.MedTIW'), // lang.MedTIW,
        BIW: $translate('medicine.component.MedBIW'), // lang.MedBIW,
        QW: $translate('medicine.component.Qw'), // lang.Qw,
        QM: $translate('medicine.component.QM') // lang.QM,
    };

    // 存檔
    vm.save = function save() {
        vm.isSaving = true;
        const epo = vm.formData;
        // 檢查服法頻率的勾選數量是否有大於一個以上
        if (epo.Routes.length === 0) {
            showMessage($translate('customMessage.CheckedRouteOrFrequency')); // lang.CheckedRouteOrFrequency
            vm.isSaving = false;
        }
        if (vm.epo_id === 'create') {
            // 呼叫儲存的service
            epoService.post(epo).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('epo');
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
        } else {
            // 呼叫編輯的service
            epoService.put(epo).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('epo');
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
        }
    };

    // 呼叫刪除對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
        .title($translate('epo.component.confirmDelete')) // '刪除藥品提示'
        .textContent($translate('epo.component.textContent')) // '請問是否要刪除此筆藥品資料?'
        .ariaLabel('delete confirm')
        .targetEvent(ev)
        .ok($translate('epo.component.deleteOk')) // '刪除'
        .cancel($translate('epo.component.deleteCancel')); // '取消'
        $mdDialog.show(confirm).then(() => {
            // 呼叫刪除的service
            epoService.delete(vm.epo_id).then(() => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                vm.isSaving = false;
                $state.go('epo');
            }, () => {
                showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
                vm.isSaving = false;
            });
        }, () => {
            vm.isSaving = false;
        });
    };

    vm.back = function () {
        history.go(-1);
    };
}

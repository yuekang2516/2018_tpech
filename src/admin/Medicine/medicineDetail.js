const tpl = require('./medicineDetail.html');

angular.module('app').component('medicineDetail', {
    template: tpl,
    controller: SystemMedicineDetailCtrl,
    controllerAs: 'vm'
});

SystemMedicineDetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'medicineService', 'showMessage', '$filter'];
function SystemMedicineDetailCtrl($state, $stateParams, $mdDialog, medicineService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let idx;
    // 先初始化資料結構
    vm.formData = {};
    vm.formData.Routes = [];
    vm.formData.Frequencys = [];
    vm.formData.Quantity = 0;

    vm.loading = false;
    vm.medicine_id = $stateParams.id;
    vm.keyinCategoryName = '';

    // 用medicine_id決定標題
    if (vm.medicine_id === 'create') {
        vm.type = 'create';
        // vm.titleType = lang.AddDrugs;
    } else {
        vm.type = 'edit';
        // vm.titleType = lang.MedicationData;
    }

    // 選單預設值
    if (vm.medicine_id !== 'create') {
        vm.loading = true;
        medicineService.getById(vm.medicine_id).then((resp) => {
            console.log(resp);
            // vm.formData = resp.data[0].medicine;
            // vm.categories = resp.data[0].categoryName;
            vm.formData = resp.data.medicine;
            vm.categories = resp.data.categoryName;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, (resp) => {
            vm.loading = false;
            vm.isError = true;
            // showMessage('1. ' + resp.data);
        });
    } else {
        vm.loading = true;
        medicineService.getAllCategoryName().then((resp) => {
            vm.categories = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, (resp) => {
            vm.loading = false;
            vm.isError = true;
            // showMessage('2. ' + resp.data);
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

    // 選單預設值 start
    vm.Routes = {
        PO: $translate('medicine.component.MedPO'), // lang.MedPO,
        SC: $translate('medicine.component.MedSC'), // lang.MedSC,
        SL: $translate('medicine.component.MedSL'), // lang.MedSL,
        IV: $translate('medicine.component.MedIV'), // lang.MedIV,
        IM: $translate('medicine.component.MedIM'), // lang.MedIM,
        IVD: $translate('medicine.component.MedIVD'), // lang.MedIVD,
        TOPI: $translate('medicine.component.MedTOPI'), // lang.MedTOPI,
        EXT: $translate('medicine.component.MedEXT'), // lang.MedEXT,
        AC: $translate('medicine.component.MedAC'), // lang.MedAC,
        PC: $translate('medicine.component.MedPC'), // lang.MedPC,
        Meal: $translate('medicine.component.MedMeal'), // lang.MedMeal
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
        QW: $translate('medicine.component.Qw') // lang.Qw,
    };

    // 存檔
    vm.save = function save() {
        vm.isSaving = true;
        console.log(vm.formData);
        const madicine = vm.formData;
        // 如果有選到自訂類別，就把輸入資料回填
        if (madicine.CategoryName === 'keyin') {
          madicine.CategoryName = vm.keyinCategoryName;
        }
        if (vm.formData.orderStatistics === null) {
            vm.formData.orderStatistics = 0;
        }

        // EPO項目處理(現在未使用)
        // if (madicine.CategoryName !== 'EPO') {
        //   madicine.EPODefaults = [];
        // } else {
        //   madicine.EPODefaults = vm.EPODefaultString.split('\n');
        // }

        // 檢查服法和頻率的勾選數量是否有大於一個以上
        if (madicine.Routes.length === 0 || madicine.Frequencys.length === 0) {
            if (madicine.Routes.length === 0 && madicine.Frequencys.length === 0) {
                showMessage($translate('medicine.component.message1')); // '途徑與服法(頻率)為必填, 請至少選一個'
            } else if (madicine.Routes.length === 0) {
                showMessage($translate('medicine.component.message2')); // '途徑為必填, 請至少選一個'
            } else {
                showMessage($translate('medicine.component.message3')); // '服法(頻率)為必填, 請至少選一個'
            }
            vm.isSaving = false;
            // showMessage(lang.CheckedRouteOrFrequency);
        } else if (vm.medicine_id === 'create') {
            // 呼叫儲存的service
            medicineService.post(madicine).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('medicine');
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
        } else {
            // 呼叫編輯的service
            medicineService.put(madicine).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('medicine');
            }, (a) => {
                // console.log(a);
                if (a.data === 'existed medicine code') {
                    showMessage($translate('customMessage.CodeDuplicate')); // '代碼欄資料重覆'
                } else {
                    showMessage($translate('customMessage.DatasFailure') + ' ' + a.data); // lang.DatasFailure
                }
                vm.isSaving = false;
            });
        }
    };

    // 呼叫刪除對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title($translate('medicine.component.confirmDelete')) // '刪除藥品提示'
            .textContent($translate('medicine.component.textContent')) // '請問是否要刪除此筆藥品資料?'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('medicine.component.deleteOk')) // '刪除'
            .cancel($translate('medicine.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            // 呼叫刪除的service
            medicineService.delete(vm.medicine_id).then(() => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                vm.isSaving = false;
                $state.go('medicine');
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

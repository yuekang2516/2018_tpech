import './chargePSWEditDialog.less';

angular
    .module('app')
    .controller('chargeEditController', chargeEditController);

chargeEditController.$inject = ['$state', '$stateParams', '$mdDialog', 'SettingService', 'chargeService', 'showMessage', 'recordItem', 'chargeItem', 'isEditable', '$filter', 'patient'];
function chargeEditController($state, $stateParams, $mdDialog, SettingService, chargeService, showMessage, recordItem, chargeItem, isEditable, $filter, patient) {
    const dvm = this;

    let $translate = $filter('translate');

    dvm.item = isEditable ? angular.copy(recordItem) : angular.copy(chargeItem);
    dvm.isEditable = isEditable;
    dvm.isLoading = false;   // 儲存或編輯時使用

    // 操作儲存按鈕 disabled or enabled
    dvm.isDeleted = false;
    if (dvm.item.Status === 'Deleted') {
        dvm.isDeleted = true;
    }
    
    // 載入資料到viewmodel讓前台顯示 (依據編輯或新增狀態)
    dvm.action = $translate('charge.chargePSWEditDialog.component.action');
    dvm.patient = patient;

    if (dvm.isEditable === true) {
        dvm.item.RecordDateTime = moment(dvm.item.RecordDateTime).second(0).millisecond(0).toDate();
        // 轉換中文標題、計算原來庫存
        dvm.oldStock = Number(dvm.item.Stock) + Number(dvm.item.Withdraw);
        dvm.oldQty = dvm.item.Withdraw;
        dvm.newStock = Number(dvm.oldStock) - Number(dvm.item.Withdraw);

        // 創建時間分為:日期 時:分:秒，預設為先前的使用時間
        // dvm.RecordDateTime = new Date(dvm.item.RecordDateTime);

        // 前台顯示文字處理
        dvm.oldStockText = `${dvm.oldStock}(${dvm.item.Unit})`;
        dvm.oldQtyText = `${dvm.oldQty}(${dvm.item.Unit})`;
        dvm.QtyText = `${dvm.item.Withdraw}(${dvm.item.Unit})`;
        dvm.SafetyStockText = `${dvm.item.SafetyStock}(${dvm.item.Unit})`;
        dvm.StockText = `${dvm.item.Stock}(${dvm.item.Unit})`;
        dvm.newStockText = dvm.newStock + '(' + dvm.item.Unit + ')';
    } else {
        // 把計價物件資料帶入計價記錄
        dvm.item.ItemName = chargeItem.Name;
        dvm.item.Unit = chargeItem.Unit;
        dvm.item.Price = chargeItem.Price;
        // 載入資料到viewmodel讓前台顯示
        dvm.newStock = dvm.item.Stock - 1;
        dvm.newStockText = `${dvm.item.Stock - 1}(${dvm.item.Unit})`;
        dvm.item.Withdraw = 1;

        // 創建時間分為:日期 時:分:秒，預設為當前時間
        // dvm.RecordDateTime = new Date();
        dvm.item.RecordDateTime = moment(dvm.item.RecordDateTime).second(0).millisecond(0).toDate();
    }
    dvm.TotalPrice = dvm.item.Price * dvm.item.Withdraw;

    dvm.cancel = function cancel() {
        $mdDialog.cancel();
    };

    dvm.plus = function plus() {
        dvm.item.Withdraw += 1;
        dvm.qtyChange();
    };

    // 最小值 1
    dvm.minus = function minus() {
        dvm.item.Withdraw -= 1;
        if (dvm.item.Withdraw < 1) {
            dvm.item.Withdraw = 1;
        }
        dvm.qtyChange();
    };

    // 計算數字變化, 計算總金額
    dvm.qtyChange = function qtyChange() {
        dvm.notEnough = false;
        // 原始庫存和數量組合計算新的庫存數量
        if (dvm.item.Withdraw !== undefined) {
            dvm.newStock = dvm.isEditable ? Number(dvm.oldStock) - Number(dvm.item.Withdraw) : Number(dvm.item.Stock) - Number(dvm.item.Withdraw);

            // 新庫存量低於庫存量
            if (dvm.newStock < 0) {
                dvm.notEnough = true;
            }

            // 計算完後更新畫面顯示文字
            if (dvm.isEditable) {
                dvm.QtyText = `${dvm.item.Withdraw}(${dvm.item.Unit})`;
                dvm.newStockText = `${dvm.newStock}(${dvm.item.Unit})`;
            } else {
                dvm.newStockText = `${dvm.newStock}(${dvm.item.Unit})`;
            }

        } else {
            // 如果是無法計算的文字，則用舊值畫面顯示文字
            dvm.item.Withdraw = 1;  // 若使用者給不合法的值，則變為 1
            if (dvm.isEditable) {
                dvm.QtyText = `(${dvm.item.Unit})`;
                dvm.newStockText = `${dvm.newStock}(${dvm.item.Unit})`;
            } else {
                dvm.newStockText = `${dvm.newStock}(${dvm.item.Unit})`;
            }
        }

        // 計算總金額
        dvm.TotalPrice = dvm.item.Price * dvm.item.Withdraw;
    };

    dvm.qtyChange();    // 一進來需先執行一次 (初始化)

    // 儲存計價項目
    dvm.save = function save() {
        let deposit;

        // 先檢查必填欄位
        if (dvm.validCheck() === false) {
            showMessage($translate('charge.chargePSWEditDialog.component.inputError'));
        } else {
            dvm.isLoading = true;

            // 計算withdraw, deposit
            deposit = 0;

            // 組資料
            if (dvm.isEditable) {
                // 修改
                dvm.item.Deposit = deposit; // 存入

                chargeService.editChargeWarehouse(dvm.item).then(() => {
                    showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                    $mdDialog.hide();
                    // $state.reload();
                }, (res) => {
                    // 在錯誤訊息顯示前，先把dialog關閉，可避免畫面閃爍情況
                    $mdDialog.hide();
                    console.log('計價已凍結 res', res);
                    if (res.data === 'CHARGE_INVENTORY' && res.status === 400) {
                        // 此物品已盤點，不可再異動
                        showMessage($translate('charge.chargePSWEditDialog.component.itemsChecked'));
                    } else {
                        showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                    }
                    // if (res.data === $translate('charge.chargePSWEditDialog.component.itemsChecked')) {
                    //     showMessage(res.data);
                    // } else {
                    //     showMessage(lang.DatasFailure);
                    // }
                });
            } else {
                // 新增
                dvm.item.ChargeId = chargeItem.Id;
                dvm.item.WardId = chargeItem.WardId;
                dvm.item.PatientId = $stateParams.patientId;
                dvm.item.RelativeType = 'Dialysis';
                dvm.item.RelativeId = $stateParams.headerId;
                dvm.item.Type = 'Use';
                dvm.item.Deposit = 0;
                delete dvm.item.Id;
                delete dvm.item.ObjectId;

                // 儲存庫存資料
                chargeService.saveChargeWarehouse(dvm.item).then(() => {
                    showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully

                    $mdDialog.hide();
                }, (res) => {
                    dvm.isLoading = false;
                    console.log('計價已凍結 res', res);
                    if (res.data === 'CHARGE_INVENTORY' && res.status === 400) {
                        // 此物品已盤點，不可再異動
                        showMessage($translate('charge.chargePSWEditDialog.component.itemsChecked'));
                    } else {
                        showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                    }
                });
            }

        }
    };

    dvm.validCheck = function validCheck() {
        // 先檢查庫存
        if (dvm.notEnough) {
            return false;
        }

        // 檢查數量與庫存關係，以及備註是否為必填，錯誤訊息前台的required關鍵字已經會顯示
        if (Number(dvm.item.Withdraw) < 0) {
            return false;
        }

        return true;
    };
}

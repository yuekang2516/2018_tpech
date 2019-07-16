import tpl from './charge.html';
import dtpl from './chargePSWEditDialog.html';
import './charge.less';
// import pswTpl from './chargePSWDialog.html';

angular.module('app').component('charge', {
    template: tpl,
    controller: ChargeCtrl,
    controllerAs: 'vm'
});

ChargeCtrl.$inject = ['$mdMedia', '$state', '$stateParams', '$mdDialog', 'SettingService', 'chargeService', 'showMessage', '$interval', '$timeout', '$filter', 'PatientService'];

function ChargeCtrl($mdMedia, $state, $stateParams, $mdDialog, SettingService, chargeService, showMessage, $interval, $timeout, $filter, PatientService) {
    const vm = this;

    let $translate = $filter('translate');

    // 預設狀態
    vm.deletedItemsLength = -1;
    vm.lastAccessTime = moment();

    // let ele = document.getElementById('charge-content');
    // $(ele).on('scroll', () => {
    //     // 判斷是否已 scroll 到最底，若是，則將 + 按鈕消失
    //     if (ele.scrollTop + ele.clientHeight > ele.scrollHeight - 10) {
    //         $('#gotoChargeBtn').addClass('end');
    //     } else {
    //         $('#gotoChargeBtn').removeClass('end');
    //     }
    // });

    // 載入時立即執行
    vm.$onInit = function onInit() {
        vm.loading = true;
        vm.isError = false; // 顯示伺服器錯誤
        // 取得病人資料, 顯示於畫面上方標題列
        // PatientService.getById($stateParams.patientId).then((res) => {
        //     vm.patient = res.data;
        // });
        // 增加按鈕監聽
        document.addEventListener('volumeupbutton', vm.scanBarCode);
        document.addEventListener('volumedownbutton', vm.scanBarCode);

        // 判斷若為手機才偵測
        if (cordova.platformId !== 'browser') {
            document.addEventListener('keypress', keypress);
        }

        // 取得所屬透析室計價物品清單, barcode 讀取時會用到 vm.chargeItems
        chargeService.getByPatientId($stateParams.patientId).then((resp) => {
            // 填入viewmodel用資料
            vm.chargeItems = resp.data;

            // 第一次進入畫面時, 取得該表單計價資料
            getChargeWarehouse();
            vm.isError = false;
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    vm.$onDestroy = function onDestroy() {
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', vm.scanBarCode);
        document.removeEventListener('volumedownbutton', vm.scanBarCode);
        document.removeEventListener('keypress', keypress);
    };

    // 掃描的 keypress 需要有 focus 才會有值 -> 用隱藏的 input 去取，待按下 enter 表這次輸入結束，若有相對應的項目再呼叫對話視窗
    // Todo 第一次進頁面，掃第一次只會 focus，值不會上去 -> RS-50(51) ReaderConfig / Data Output/ Keboard Emulation 改為 KeyEvent -> 會跟者輸入法變，不可行
    function keypress(ev) {
        if (ev.which === 13) {
            $('#barcode').select();
            Keyboard.hide();
            if (ev.target.value) {
                vm.showAddDialog(ev.target.value);
            }
        } else {
            $('#barcode').focus();
            Keyboard.hide();
        }
    }

    vm.scanBarCode = function scanBarCode() {
        console.log('scanBarCode() in charge component');

        cordova.plugins.barcodeScanner.scan(
            (result) => {
                if (!result.cancelled) {
                    vm.showAddDialog(result.text);
                }
            },
            (error) => {
                showMessage('charge Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: true, // Android, launch with the torch switched on (if available)
                prompt: $translate('charge.charge.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };

    // 第一次進入或刪除後, 重新整理畫面列表
    function getChargeWarehouse(isForce = false) {
        vm.loading = true;
        // 取得透析室計價資料
        chargeService.getChargeWarehouseByRelativeId($stateParams.headerId, isForce).then((resp) => {
            vm.chargeWarehouse = resp.data;
            vm.lastAccessTime = chargeService.getLastAccessTime();
            // 統計物品項目數量 計算總計費用
            vm.count = [];

            // 取得已刪除筆數的總數
            vm.deletedItemsLength = vm.chargeWarehouse.filter(item => item.Status === 'Deleted').length;
            vm.normalItemsLength = vm.chargeWarehouse.filter(item => item.Status === 'Normal').length;

            vm.totalPrice = 0; // 初始化 totalPrice
            _.forEach(vm.chargeWarehouse, (item) => {
                if (vm.count.indexOf(item.ItemName) < 0) {
                    vm.count.push(item.ItemName);
                }

                if (item.Price !== undefined && item.Status !== 'Deleted') {
                    vm.totalPrice += (item.Price * item.Withdraw);
                }
            });
            vm.loading = false;
        }, () => {
            vm.loading = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // 使用者按右上角重整按鈕時
    vm.refresh = function refresh() {
        getChargeWarehouse(true);
    };

    vm.goback = function () {
        history.go(-1);
    };

    // 刪除詢問
    vm.showDeleteDialog = function showDeleteDialog(event, data) {
        $mdDialog.show({
            controller: DeleteDialogController,
            template: `<md-dialog aria-label="刪除確認">
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 translate>{{'charge.charge.component.confirmDelete'}}</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="vmd.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" translate>
                        {{'charge.charge.component.deleteRecord'}}
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button class="md-raised" ng-click="vmd.cancel()">
                            {{'charge.charge.component.deleteCancel' | translate}}
                        </md-button>
                        <md-button class="md-warn md-raised" ng-click="vmd.ok()">
                            {{'charge.charge.component.deleteOk' | translate}}
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vmd'
        });

        function DeleteDialogController() {
            const vmd = this;
            vmd.hide = function hide() {
                $mdDialog.hide();
            };

            vmd.cancel = function cancel() {
                $mdDialog.cancel();
            };

            vmd.ok = function ok() {
                chargeService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        // 因為需要重新得知庫存，因此須從 server 重撈資料
                        vm.refresh();
                    }
                    $mdDialog.hide(data);
                }, (res) => {
                    if (res.data === 'CHARGE_INVENTORY' && res.status === 400) {
                        // 此物品已盤點，不可再異動
                        showMessage($translate('charge.chargePSWEditDialog.component.itemsChecked'));
                    } else {
                        showMessage($translate('customMessage.serverError')); // lang.ComServerError
                    }
                    $mdDialog.hide(data);
                });

            };
        }
    };

    // 編輯計價項目'使用'內容
    // 若為編輯: isEdit 為 true, 若為新增: isEdit 為 false
    vm.chargeEdit = function chargeEdit(ev, item, isEditStr) {
        $mdDialog.show({
            controller: 'chargeEditController',
            controllerAs: 'dvm',
            locals: {
                recordItem: item,
                chargeItem: null,
                isEditable: isEditStr,
                patient: vm.patient
            },
            template: dtpl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: !$mdMedia('gt-xs')
        })
            .then(() => {
                // 因為需要重新得知庫存，因此須從 server 重撈資料
                vm.refresh();
            });
    };
    // 上方Dialog的controller設定
    // function DialogController() {
    //     const dvm = this;
    //     dvm.isEdit = vm.isEdit;

    //     dvm.action = '使用';
    //     if (vm.isEdit === true) {
    //         dvm.title = vm.chargeWarehouse[vm.index].ItemName;
    //         // 轉換中文標題、計算原來庫存

    //         dvm.oldStock = Number(vm.chargeWarehouse[vm.index].Stock)
    //             + Number(vm.chargeWarehouse[vm.index].Withdraw);
    //         dvm.Qty = angular.copy(vm.chargeWarehouse[vm.index].Withdraw);
    //         dvm.oldQty = angular.copy(vm.chargeWarehouse[vm.index].Withdraw);
    //         dvm.newStock = Number(dvm.oldStock) - Number(dvm.Qty);
    //         dvm.Stock = vm.chargeWarehouse[vm.index].Stock;
    //         dvm.SafetyStock = vm.chargeWarehouse[vm.index].SafetyStock;
    //         dvm.Price = vm.chargeWarehouse[vm.index].Price;
    //         dvm.TotalPrice = dvm.Price * dvm.Qty;

    //         // 創建時間分為:日期 時:分:秒，預設為先前的使用時間
    //         dvm.CreatedDate = new Date(vm.chargeWarehouse[vm.index].RecordDateTime);

    //         // 前台顯示文字處理
    //         dvm.oldStockText = `${dvm.oldStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //         dvm.oldQtyText = `${dvm.oldQty}(${vm.chargeWarehouse[vm.index].Unit})`;
    //         dvm.QtyText = `${dvm.Qty}(${vm.chargeWarehouse[vm.index].Unit})`;
    //         dvm.SafetyStockText = `${dvm.SafetyStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //         dvm.StockText = `${dvm.Stock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //         dvm.newStockText = `${dvm.newStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //     } else {
    //         // 載入資料到viewmodel讓前台顯示
    //         dvm.title = vm.chargeItems[vm.index].Name;
    //         dvm.Stock = vm.chargeItems[vm.index].Stock;
    //         dvm.newStock = dvm.Stock - 1;
    //         dvm.newStockText = `${dvm.Stock - 1}(${vm.chargeItems[vm.index].Unit})`;
    //         dvm.SafetyStock = vm.chargeItems[vm.index].SafetyStock;
    //         dvm.Qty = 1;
    //         dvm.Price = vm.chargeItems[vm.index].Price;
    //         dvm.TotalPrice = dvm.Price * dvm.Qty;

    //         // 創建時間分為:日期 時:分:秒，預設為當前時間
    //         dvm.CreatedDate = new Date();
    //     }


    //     dvm.cancel = function cancel() {
    //         $mdDialog.cancel();
    //     };

    //     dvm.plus = function plus() {
    //         dvm.Qty += 1;
    //         dvm.qtyChange();
    //     };

    //     // 最小值 1
    //     dvm.minus = function minus() {
    //         dvm.Qty -= 1;
    //         if (dvm.Qty < 1) {
    //             dvm.Qty = 1;
    //         }
    //         dvm.qtyChange();
    //     };

    //     // 計算數字變化, 計算總金額
    //     dvm.qtyChange = function qtyChange() {
    //         dvm.notEnough = false;

    //         // 原始庫存和數量組合計算新的庫存數量
    //         if (dvm.Qty !== undefined) {
    //             dvm.newStock = dvm.isEdit ? Number(dvm.oldStock) - Number(dvm.Qty) : Number(dvm.Stock) - Number(dvm.Qty);

    //             // 新庫存量低於庫存量
    //             if (dvm.newStock < 0) {
    //                 dvm.notEnough = true;
    //             }

    //             // 計算完後更新畫面顯示文字

    //             if (dvm.isEdit) {
    //                 dvm.QtyText = `${dvm.Qty}(${vm.chargeWarehouse[vm.index].Unit})`;
    //                 dvm.newStockText = `${dvm.newStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //             } else {
    //                 dvm.newStockText = `${dvm.newStock}(${vm.chargeItems[vm.index].Unit})`;
    //             }

    //         } else {
    //             // 如果是無法計算的文字，則用舊值畫面顯示文字
    //             if (dvm.isEdit) {
    //                 dvm.QtyText = `(${vm.chargeWarehouse[vm.index].Unit})`;
    //                 dvm.newStockText = `${dvm.newStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //             } else {
    //                 dvm.newStockText = `${dvm.newStock}(${vm.chargeItems[vm.index].Unit})`;
    //             }
    //         }

    //         // 計算總金額
    //         dvm.TotalPrice = dvm.Price * dvm.Qty;
    //     };

    //     // 儲存計價項目
    //     dvm.save = function save() {
    //         console.log('a');
    //         // debugger;
    //         let withdraw;
    //         let deposit;

    //         // 先檢查必填欄位
    //         if (dvm.validCheck() === false) {
    //             showMessage('操作失敗, 輸入有誤!');
    //         } else {
    //             // 計算withdraw, deposit
    //             withdraw = dvm.Qty;
    //             deposit = 0;

    //             // 組資料
    //             if (dvm.isEdit) {
    //                 const obj = vm.chargeWarehouse[vm.index];
    //                 obj.Withdraw = withdraw; // 提出 存入提出擇一填值
    //                 obj.Deposit = deposit; // 存入
    //                 obj.Stock = dvm.newStock;
    //                 obj.ModifiedTime = moment();
    //                 obj.RecordDateTime = dvm.CreatedDate;

    //                 obj.ModifiedUserId = SettingService.getCurrentUser.Id;
    //                 obj.ModifiedUserName = SettingService.getCurrentUser.Name;

    //                 chargeService.editChargeWarehouse(obj).then(() => {
    //                     showMessage(lang.Datasuccessfully);

    //                     $mdDialog.hide();

    //                     $state.reload();
    //                 }, (res) => {
    //                     // 在錯誤訊息顯示前，先把dialog關閉，可避免畫面閃爍情況
    //                     $mdDialog.hide();

    //                     if (res.data === '物品已盤點') {
    //                         showMessage(res.data);
    //                     } else {
    //                         showMessage(lang.DatasFailure);
    //                     }
    //                 });
    //             } else {
    //                 const obj = {
    //                     CreatedUserId: SettingService.getCurrentUser().Id,
    //                     CreatedUserName: SettingService.getCurrentUser().Name,
    //                     HospitalId: SettingService.getCurrentHospital().Id,
    //                     ChargeId: vm.chargeItems[vm.index].Id,
    //                     ItemName: vm.chargeItems[vm.index].Name,
    //                     PatientId: $stateParams.patientId,
    //                     RelativeType: 'Dialysis',
    //                     RelativeId: $stateParams.headerId,
    //                     WardId: vm.chargeItems[vm.index].WardId,
    //                     Withdraw: withdraw, // 提出 存入提出擇一填值
    //                     Deposit: deposit, // 存入
    //                     Stock: dvm.newStock,
    //                     SafetyStock: dvm.SafetyStock,
    //                     Unit: vm.chargeItems[vm.index].Unit,
    //                     Memo: dvm.Memo || '',
    //                     Type: 'Use',
    //                     CreatedTime: moment(),
    //                     // RecordDateTime: moment(),
    //                     RecordDateTime: dvm.CreatedDate,
    //                     Price: vm.chargeItems[vm.index].Price // 新增的Price欄位，要請後臺增加此欄位
    //                 };

    //                 // 儲存庫存資料
    //                 chargeService.saveChargeWarehouse(obj).then(() => {
    //                     showMessage(lang.Datasuccessfully);

    //                     $mdDialog.hide();

    //                     history.go(-1);
    //                 }, () => {
    //                     showMessage(lang.DatasFailure);
    //                 });
    //             }

    //         }
    //     };

    //     dvm.validCheck = function validCheck() {
    //         // 先檢查庫存
    //         if (dvm.notEnough) {
    //             return false;
    //         }

    //         // 檢查數量與庫存關係，以及備註是否為必填，錯誤訊息前台的required關鍵字已經會顯示
    //         if (Number(dvm.Qty) < 0) {
    //             return false;
    //         }

    //         return true;
    //     };

    // }

    // 呼叫進銷存的對話視窗，這邊這個視窗要呼叫的順序是:
    // 1. 先開啟相機，掃描物品條碼
    // 2. 跟物品清單比對，如果有比對到才開啟視窗，沒有就跳提示訊息說無此物品條碼:XXX。
    vm.showAddDialog = function PSW(result) {
        // 和計價項目比對是否有符合的barcode
        vm.chargeItem = vm.chargeItems.filter((item) => {
            return item.BarCode === result;
        });

        if (vm.chargeItem.length > 0) {
            $mdDialog.show({
                controller: 'chargeEditController',
                controllerAs: 'dvm',
                locals: {
                    chargeItem: vm.chargeItem[0],
                    recordItem: null,
                    isEditable: false,
                    patient: vm.patient
                },
                template: dtpl,
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: !$mdMedia('gt-xs')
            });
            // $mdDialog.show({
            //     controller: PSWDialogController,
            //     controllerAs: 'dvm',
            //     template: pswTpl,
            //     parent: angular.element(document.body),
            //     clickOutsideToClose: true,
            //     fullscreen: vm.customFullscreen
            // });
        } else {
            // showMessage(`找不到符合的計價物品項目, 無此物品條碼: ${result}`);
            showMessage($translate('charge.charge.component.itemNotFound', { resultMsg: result }));
        }
    };

    // 上方進銷存對話視窗的controller
    // function PSWDialogController() {
    //     const dvm = this;

    //     // 載入資料到viewmodel讓前台顯示
    //     dvm.title = vm.chargeItem[0].Name;
    //     dvm.action = '使用';
    //     dvm.Stock = vm.chargeItem[0].Stock;
    //     dvm.NewStock = dvm.Stock - 1;
    //     dvm.NewStockText = `${dvm.Stock - 1}(${vm.chargeItem[0].Unit})`;
    //     dvm.SafetyStock = vm.chargeItem[0].SafetyStock;
    //     dvm.Qty = 1;
    //     dvm.CreatedTime = moment().format('YYYY-MM-DD HH:mm:ss');

    //     dvm.cancel = function cancel() {
    //         $mdDialog.cancel();
    //     };

    //     dvm.plus = function plus() {
    //         dvm.Qty += 1;
    //         dvm.qtyChange();
    //     };

    //     dvm.minus = function minus() {
    //         dvm.Qty -= 1;
    //         if (dvm.Qty < 0) {
    //             dvm.Qty = 0;
    //         }
    //         dvm.qtyChange();
    //     };

    //     // 計算進銷存數量用
    //     dvm.qtyChange = function qtyChange() {
    //         dvm.notEnough = false;

    //         // 原始庫存和數量組合計算新的庫存數量
    //         if (dvm.Qty !== undefined) {
    //             dvm.NewStock = Number(dvm.Stock) - Number(dvm.Qty);

    //             // 新庫存量低於庫存量
    //             if (dvm.NewStock < 0) {
    //                 dvm.notEnough = true;
    //             }

    //             dvm.NewStockText = `${dvm.NewStock}(${vm.chargeItem[0].Unit})`;
    //         } else {
    //             dvm.NewStockText = `(${vm.chargeItem[0].Unit})`;
    //         }
    //     };

    //     // 儲存計價項目
    //     dvm.save = function save() {
    //         console.log('b');
    //         // debugger;
    //         let withdraw;
    //         let deposit;

    //         // 先檢查必填欄位
    //         if (dvm.validCheck() === false) {
    //             showMessage('操作失敗, 輸入有誤!');
    //         } else {
    //             // 計算withdraw, deposit
    //             withdraw = dvm.Qty;
    //             deposit = 0;

    //             // 組資料
    //             const obj = {
    //                 CreatedUserId: SettingService.getCurrentUser().Id,
    //                 CreatedUserName: SettingService.getCurrentUser().Name,
    //                 HospitalId: SettingService.getCurrentHospital().Id,
    //                 ChargeId: vm.chargeItem[0].Id,
    //                 ItemName: vm.chargeItem[0].Name,
    //                 PatientId: $stateParams.patientId,
    //                 RelativeType: 'Dialysis',
    //                 RelativeId: $stateParams.headerId,
    //                 WardId: vm.chargeItem[0].WardId,
    //                 Withdraw: withdraw, // 提出 存入提出擇一填值
    //                 Deposit: deposit, // 存入
    //                 Stock: dvm.NewStock,
    //                 SafetyStock: dvm.SafetyStock,
    //                 Unit: vm.chargeItem[0].Unit,
    //                 Memo: dvm.Memo || '',
    //                 Type: 'Use',
    //                 CreatedTime: moment(), // CreatedTime 跟 RecordDateTime先用一樣的
    //                 RecordDateTime: moment()
    //             };

    //             // 儲存庫存資料
    //             chargeService.saveChargeWarehouse(obj).then(() => {
    //                 showMessage(lang.Datasuccessfully);

    //                 $mdDialog.hide();

    //                 history.go(-1);
    //             }, () => {
    //                 showMessage(lang.DatasFailure);
    //             });
    //         }
    //     };

    //     // 檢查項目內容
    //     dvm.validCheck = function validCheck() {
    //         // 先檢查庫存
    //         if (dvm.notEnough) {
    //             return false;
    //         }

    //         return true;
    //     };
    // }

    vm.gotoCharge = function gotoCharge() {
        $state.go('chargeCreate', { patientId: $stateParams.patientId, headerId: $stateParams.headerId });
    };

}

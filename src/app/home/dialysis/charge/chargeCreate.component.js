import tpl from './chargeCreate.html';
import dtpl from './chargePSWEditDialog.html';
import './charge.less';

angular.module('app').component('chargeCreate', {
    template: tpl,
    controller: ChargeCreateCtrl,
    controllerAs: 'vm'
});

ChargeCreateCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'SettingService', 'chargeService', 'showMessage', '$scope', '$mdMedia', '$filter', 'PatientService'];

function ChargeCreateCtrl($state, $stateParams, $mdDialog, SettingService, chargeService,
    showMessage, $scope, $mdMedia, $filter, PatientService) {
    const vm = this;
    let originalItems = [];

    let $translate = $filter('translate');

    // 初始化頁面時載入物品概況
    vm.$onInit = function onInit() {
        vm.loading = true;
        // 取得病人資料, 顯示於畫面上方標題列
        // PatientService.getById($stateParams.patientId).then((res) => {
        //     vm.patient = res.data;
        // });
        // 增加按鈕監聽
        document.addEventListener('volumeupbutton', vm.scanBarCode);
        document.addEventListener('volumedownbutton', vm.scanBarCode);
        document.addEventListener('keypress', keypress);

        // 由總覽表單的透析室代碼取得計價物品
        chargeService.getAllItemsByHeaderId($stateParams.headerId).then((resp) => {
            // 填入viewmodel用資料
            originalItems = resp.data;
            vm.filteredResult = originalItems;

            vm.loading = false;
        }, () => {
            vm.loading = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 偵測目前是否有對話框存在，若有，使用者按上一頁時 state 不 change 並取消當前對話框
    $scope.$on('$locationChangeStart', function($event) {
        // Check if there is a dialog active
        if (angular.element(document).find('md-dialog').length > 0) {
            $event.preventDefault(); // Prevent route from changing
            $mdDialog.cancel(); // Cancel the active dialog
        }
    });

    vm.$onDestroy = function onDestroy() {
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeuputton', vm.scanBarCode);
        document.removeEventListener('volumedownutton', vm.scanBarCode);
        document.removeEventListener('keypress', keypress);
    };

    function keypress(ev) {
        if (ev.which === 13) {
            $('#search').select();
        } else if (ev.which === 27) {
            vm.searchStr = '';
            vm.searchCharge();
        } else {
            $('#search').focus();
        }
    }

    vm.scanBarCode = function scanBarCode() {
        console.log('scanBarCode() in charge component');
        cordova.plugins.barcodeScanner.scan(
            (result) => {
                if (!result.cancelled) {
                    vm.searchStr = result.text;
                    vm.searchCharge();
                }
            },
            (error) => {
                showMessage('Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: true, // Android, launch with the torch switched on (if available)
                prompt: $translate('charge.chargeCreate.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };

    // 前端搜尋後
    vm.searchCharge = function searchCharge() {
        vm.filteredResult = originalItems.filter((charge) => {
            return ((charge.Name && (charge.Name.toLowerCase().search(vm.searchStr.toLowerCase() || '') > -1)) ||
                (charge.BarCode && (charge.BarCode.search(vm.searchStr.toLowerCase() || '') > -1)) ||
                (charge.Code && (charge.Code.search(vm.searchStr.toLowerCase() || '') > -1)));
        });
    };

    // 呼叫進銷存的對話視窗
    vm.PSW = function PSW(ev, item, isEditStr) {
        // 避免被因掃描器功能而註冊 keypress 事件影響，須先暫時不監聽，等此對話框結束再重新監聽
        document.removeEventListener('keypress', keypress);

        $mdDialog.show({
                controller: 'chargeEditController',
                controllerAs: 'dvm',
                locals: {
                    recordItem: null,
                    chargeItem: item,
                    isEditable: isEditStr,
                    patient: vm.patient
                },
                bindToController: true,
                template: dtpl,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: !$mdMedia('gt-xs')
            })
            .then(() => {
                // 需於 dialog show 完後呼叫，避免被偵測 $locationChangeStart 的事件擋掉 (preventDefault); mdDialog hide() 完後不會馬上消失仍會被找到
                history.go(-1);
            }).finally(() => {
                // 等此對話眶結束需把 keypress 事件加回，供掃描器使用
                document.addEventListener('keypress', keypress);
            });
    };

    // 上方進銷存對話視窗的controller
    // function PSWDialogController() {
    //   const dvm = this;

    //   // 載入資料到viewmodel讓前台顯示
    //   dvm.title = vm.chargeWarehouse[vm.index].Name;
    //   dvm.action = '使用';
    //   dvm.Stock = vm.chargeWarehouse[vm.index].Stock;
    //   dvm.NewStock = dvm.Stock - 1;
    //   dvm.NewStockText = `${dvm.Stock - 1}(${vm.chargeWarehouse[vm.index].Unit})`;
    //   dvm.SafetyStock = vm.chargeWarehouse[vm.index].SafetyStock;
    //   dvm.Qty = 1;
    //   dvm.Price = vm.chargeWarehouse[vm.index].Price;
    //   dvm.TotalPrice = dvm.Price * dvm.Qty;
    //   // dvm.CreatedTime = moment().format('YYYY-MM-DD HH:mm:ss');

    //   // 創建時間分為:日期 時:分:秒，預設為當前時間
    //   dvm.CreatedDate = new Date();

    //   dvm.cancel = function cancel() {
    //     $mdDialog.cancel();
    //   };

    //   dvm.plus = function plus() {
    //     dvm.Qty += 1;
    //     dvm.qtyChange();
    //   };

    //   dvm.minus = function minus() {
    //     dvm.Qty -= 1;
    //     if (dvm.Qty < 1) {
    //       dvm.Qty = 1;
    //     }
    //     dvm.qtyChange();
    //   };

    //   // 計算進銷存數量用，計算總金額
    //   dvm.qtyChange = function qtyChange() {
    //     dvm.notEnough = false;

    //     // 原始庫存和數量組合計算新的庫存數量
    //     if (dvm.Qty !== undefined) {
    //       dvm.NewStock = Number(dvm.Stock) - Number(dvm.Qty);

    //       // 新庫存量低於庫存量
    //       if (dvm.NewStock < 0) {
    //         dvm.notEnough = true;
    //       }

    //       dvm.NewStockText = `${dvm.NewStock}(${vm.chargeWarehouse[vm.index].Unit})`;
    //     } else {
    //       dvm.NewStockText = `(${vm.chargeWarehouse[vm.index].Unit})`;
    //     }

    //     // 計算總金額
    //     dvm.TotalPrice = dvm.Price * dvm.Qty;
    //   };

    //   // 儲存計價項目
    //   dvm.save = function save() {
    //     console.log('d');
    //     // debugger;
    //     let withdraw;
    //     let deposit;

    //     // 先檢查必填欄位
    //     if (dvm.validCheck() === false) {
    //       showMessage('操作失敗, 輸入有誤!');
    //     } else {
    //       // 計算withdraw, deposit
    //       withdraw = dvm.Qty;
    //       deposit = 0;

    //       // 組資料
    //       const obj = {
    //         CreatedUserId: SettingService.getCurrentUser().Id,
    //         CreatedUserName: SettingService.getCurrentUser().Name,
    //         HospitalId: SettingService.getCurrentHospital().Id,
    //         ChargeId: vm.chargeWarehouse[vm.index].Id,
    //         ItemName: vm.chargeWarehouse[vm.index].Name,
    //         PatientId: $stateParams.patientId,
    //         RelativeType: 'Dialysis',
    //         RelativeId: $stateParams.headerId,
    //         WardId: vm.chargeWarehouse[vm.index].WardId,
    //         Withdraw: withdraw, // 提出 存入提出擇一填值
    //         Deposit: deposit, // 存入
    //         Stock: dvm.NewStock,
    //         SafetyStock: dvm.SafetyStock,
    //         Unit: vm.chargeWarehouse[vm.index].Unit,
    //         Memo: dvm.Memo || '',
    //         Type: 'Use',
    //         CreatedTime: moment(),
    //         // RecordDateTime: moment(),
    //         RecordDateTime: dvm.CreatedDate,
    //         Price: vm.chargeWarehouse[vm.index].Price // 新增的Price欄位，要請後臺增加此欄位
    //       };

    //       // 儲存庫存資料
    //       chargeService.saveChargeWarehouse(obj).then(() => {
    //         showMessage(lang.Datasuccessfully);

    //         $mdDialog.hide();

    //         history.go(-1);
    //       }, () => {
    //         showMessage(lang.DatasFailure);
    //       });
    //     }
    //   };

    //   // 檢查項目內容
    //   dvm.validCheck = function validCheck() {
    //     // 先檢查庫存
    //     if (dvm.notEnough) {
    //       return false;
    //     }

    //     return true;
    //   };
    // }

    vm.goback = function goback() {
        history.back();
    };
}
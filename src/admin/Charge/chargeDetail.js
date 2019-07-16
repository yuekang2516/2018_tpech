import tpl from './chargeDetail.html';
import dtpl from './chargeDialog.html';
import pswTpl from './chargePSWDialog.html';
import pswEditTpl from './chargePSWEditDialog.html';

angular.module('app').component('chargeDetail', {
  template: tpl,
  controller: SystemChargeDetailCtrl,
  controllerAs: 'vm'
});

SystemChargeDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', '$mdDialog', '$http', '$timeout', 'Upload', 'chargeService', 'wardService', 'showMessage', '$filter'];
function SystemChargeDetailCtrl($scope, $state, $stateParams, $sessionStorage, $mdDialog, $http, $timeout, Upload, chargeService, wardService, showMessage, $filter) {
  const vm = this;
  let $translate = $filter('translate');

  // infinite scroll 相關
  let dataEnd = false; // 判斷資料使否已完全 push 至顯示用的陣列裡
  let dataNumOnce = 20; // 一次 push 多少筆資料

  // 取得物品概況
  vm.loadCharge = function loadCharge() {
    vm.loading = true;

    chargeService.getById($stateParams.Id).then((resp) => {
      // 填入viewmodel用資料
      console.log(resp.data);
      vm.charge = resp.data.charge;
      vm.title = vm.charge.Name;
      vm.Code = vm.charge.Code;
      vm.BarCode = vm.charge.BarCode;
      vm.Price = vm.charge.Price;
      vm.Stock = vm.charge.Stock;
      vm.SafetyStock = vm.charge.SafetyStock;
      vm.Unit = vm.charge.Unit;
      vm.photo = vm.charge.Photo;
      // vm.HospitalId = vm.charge.HospitalId;
      vm.chargeWarehouse = resp.data.chargewarehouse.slice();
      // 反向排序 : API中以CreateTime排序, 現改用前端的 filter : -RecordDateTime 來指定 RecordDateTime 反向排序
      // vm.chargeWarehouse = resp.data.chargewarehouse.slice().reverse();

      dataEnd = false;
      vm.showWarehouse = [];
      vm.loadMore();

      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      vm.loading = false;
      vm.isError = true;
      vm.photo = null;
    });
  };

  // 初始化頁面時載入物品概況
  vm.$onInit = function onInit() {
    vm.loadCharge();
  };

  // scroll 至底時呼叫
  vm.loadMore = function () {
    vm.loading = true;
    if (dataEnd || !vm.chargeWarehouse) {
        vm.loading = false;
        return;
    }
    let lastIndex = vm.showWarehouse.length - 1;
    let dataNum;
    // 判斷是否將為資料底
    if ((lastIndex + dataNumOnce) >= vm.chargeWarehouse.length - 1) {
      dataEnd = true;
      dataNum = vm.chargeWarehouse.length - lastIndex;
    } else {
      dataNum = dataNumOnce + 1;
    }
    for (let i = 1; i < dataNum; i++) {
      vm.showWarehouse.push(vm.chargeWarehouse[lastIndex + i]);
    }
    vm.loading = false;
  };

  // 編輯計價項目Dialog
  vm.edit = function edit(ev) {
    $mdDialog.show({
      controller: DialogController,
      controllerAs: 'dvm',
      template: dtpl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: vm.customFullscreen
    });
  };

  // 新增進銷存項目Dialog
  vm.PSW = function PSW(ev, action) {
    switch (action) {
      case '進貨':
        vm.action = $translate('charge.purchase');
        break;
      case '銷貨':
        vm.action = $translate('charge.sales');
        break;
      case '退貨':
        vm.action = $translate('charge.returns');
        break;
      case '盤點':
        vm.action = $translate('charge.inventory');
        break;
      default:
        break;
    }

    $mdDialog.show({
      controller: PSWDialogController,
      controllerAs: 'dvm',
      template: pswTpl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: vm.customFullscreen
    });
  };

  // 編輯進銷存項目Dialog (盤點無法修改所以不會呼叫到)
  vm.PSWEdit = function PSWEdit(ev, index) {
    vm.index = index;

    $mdDialog.show({
      controller: PSWEditDialogController,
      controllerAs: 'dvm',
      template: pswEditTpl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: vm.customFullscreen
    });
  };

  // 讓前台判斷如果是盤點或是使用則無法修改紀錄
  vm.checkInventory = function checkInventory(type) {
    if (type === 'Inventory' || type === 'Use') {
      return true;
    }

    return false;
  };

  // 編輯計價項目Dialog的controller設定
  function DialogController() {
    const dvm = this;
    dvm.title = $translate('charge.component.edittitle'); // '編輯'
    dvm.editMode = true;
    dvm.loading = true;
    // dvm.loadingPicture = false;

    // 取得透析室資料
    wardService.get().then((resp) => {
      dvm.loading = false;
      dvm.isError = false; // 顯示伺服器連接失敗的訊息
      // 載入資料到viewmodel讓前台顯示
      dvm.wards = resp.data;
      dvm.formData = angular.copy(vm.charge);
      console.log("透析室dvm.formData");
      console.log(dvm.formData);
      // dvm.formData.photo = null;
    }, () => {
      dvm.loading = false;
      dvm.isError = true;
    });

    dvm.addNotifyEmail = function addNotifyEmail(idx) {
      // 先檢查必填欄位
      if (dvm.isEmail(dvm.formData.NotifyEmails[idx]) === false) {
        dvm.formData.NotifyEmails.splice(idx, 1);
        showMessage($translate('charge.component.operatingfailure')); // '操作失敗, Email格式有誤!'
      }
    };

    dvm.addCompanyEmail = function addCompanyEmail(idx) {
      // 先檢查必填欄位
      if (dvm.isEmail(dvm.formData.CompanyEmail[idx]) === false) {
        dvm.formData.CompanyEmail.splice(idx, 1);
        showMessage($translate('charge.component.operatingfailure')); // '操作失敗, Email格式有誤!'
      }
    };

    // 檢查Email格式
    dvm.isEmail = function isEmail(email) {
      // var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      // var regex = /^\w+((-\w+)|(.\w+))\@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
      let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (!regex.test(email)) {
        return false;
      }
      return true;
    };

    dvm.cancel = function cancel() {
      $mdDialog.cancel();
    };

    // 儲存計價項目
    dvm.save = function save() {
      dvm.isSaving = true;
      // 先檢查必填欄位
      if (dvm.validCheck() === false) {
        showMessage($translate('charge.component.operatingfailureinput')); // '操作失敗, 輸入有誤!'
        dvm.isSaving = false;
      } else {
        console.log("dvm.formData");
        console.log(dvm.formData);
        // 呼叫service儲存編輯後資料
        chargeService.put(dvm.formData).then(() => {
          showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
          dvm.isSaving = false;
          $mdDialog.hide();

          // 儲存完後重新載入資料
          vm.loadCharge();
        }, () => {
          showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
          dvm.isSaving = false;
        });
      }
    };

    // 檢查必填欄位
    dvm.validCheck = function validCheck() {
      if (dvm.formData.Name && dvm.formData.Price &&
        dvm.formData.SafetyStock && dvm.formData.Unit && dvm.formData.Sort) {
        return true;
      }
      return false;
    };

    // 刪除計價項目, 顯示刪除確認對話視窗
    dvm.delete = function del(ev) {
      dvm.isSaving = true;
      const confirm = $mdDialog.confirm()
        .title($translate('charge.component.confirmDelete')) // '刪除確認'
        .textContent($translate('charge.component.textContent'), { name: vm.title }) // `您即將刪除${vm.title}，點擊確認後將會刪除此藥品內容!`
        .ariaLabel('delete confirm')
        .targetEvent(ev)
        .ok($translate('charge.component.deleteOk')) // '刪除'
        .cancel($translate('charge.component.deleteCancel')); // '取消'

      $mdDialog.show(confirm).then(() => {
        // 呼叫刪除的service
        chargeService.delete($stateParams.Id).then(() => {
          showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
          dvm.isSaving = false;
          $mdDialog.hide();
          $state.go('charge', { wardId: $stateParams.wardId }, { notify: false, reload: true, location: 'replace' });
        }, () => {
          showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
          dvm.isSaving = false;
        });
        $mdDialog.hide();
      }, () => {
        dvm.isSaving = false;
        $mdDialog.hide();
      });
    };

    // photo to base64
    dvm.handleChangeBase64 = function handleChangeBase64() {
        // debugger;
        $timeout(() => {
            dvm.loadingPicture = true;
        });
        if (dvm.formData.Photo) {
            Upload.base64DataUrl(dvm.formData.Photo).then(
                (x) => {
                    // dvm.patient.Photo = x;
                    dvm.formData.Photo = x;
                    dvm.loadingPicture = false;
                }
            );
        }
    };
  }

  // 新增進銷存項目Dialog的controller設定
  function PSWDialogController() {
    const dvm = this;

    // 載入資料到viewmodel讓前台顯示
    dvm.title = vm.title;
    dvm.action = vm.action;
    // dvm.actions = ['進貨', '銷貨', '退貨', '盤點'];
    dvm.actions = [$translate('charge.purchase'), $translate('charge.sales'), $translate('charge.returns'), $translate('charge.inventory')];
    dvm.Stock = vm.Stock;
    dvm.NewStockText = `${dvm.Stock}(${vm.Unit})`;
    dvm.SafetyStock = vm.SafetyStock;
    dvm.Qty = 0;
    dvm.CreatedTime = moment().format('YYYY-MM-DD HH:mm:ss');
    dvm.RecordDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // 如果是盤點，前台的memo欄位會變成必填
    dvm.inventoryChange = function inventoryChange() {
      if (dvm.action === $translate('charge.inventory')) {
        dvm.isInventory = true;
      } else {
        dvm.isInventory = false;
      }
    };
    dvm.inventoryChange();

    dvm.cancel = function cancel() {
      $mdDialog.cancel();
    };

    // 計算進銷存數量用
    dvm.QtyChange = function QtyChange(action) {
      dvm.notEnough = false;

      // 原始庫存和數量組合計算新的庫存數量
      if (dvm.Qty !== undefined) {
        switch (action) {
          case $translate('charge.purchase'): // '進貨'
            dvm.NewStock = Number(dvm.Stock) + Number(dvm.Qty);
            break;
          case $translate('charge.sales'): // '銷貨'
            dvm.NewStock = Number(dvm.Stock) - Number(dvm.Qty);
            break;
          case $translate('charge.returns'): // '退貨'
            dvm.NewStock = Number(dvm.Stock) - Number(dvm.Qty);
            break;
          case $translate('charge.inventory'): // '盤點'
            dvm.NewStock = Number(dvm.Qty);
            break;
          default:
            break;
        }
        // 新庫存量低於庫存量
        if (dvm.NewStock < 0) {
          dvm.notEnough = true;
        }
        dvm.NewStockText = `${dvm.NewStock}(${vm.Unit})`;
      } else {
        dvm.NewStockText = `(${vm.Unit})`;
      }
    };

    // 儲存新增的進銷存項目
    dvm.save = function save() {
      dvm.isSaving = true;
      let withdraw;
      let deposit;
      let difference;
      // 先檢查必填欄位
      if (dvm.validCheck() === false) {
        showMessage($translate('charge.component.operatingfailureinput')); // '操作失敗, 輸入有誤!'
        dvm.isSaving = false;
      } else {
        // 計算withdraw, deposit
        switch (dvm.action) {
          case $translate('charge.purchase'): // '進貨'
            withdraw = 0;
            deposit = dvm.Qty;
            break;
          case $translate('charge.sales'): // '銷貨'
          case $translate('charge.returns'): // '退貨'
            withdraw = dvm.Qty;
            deposit = 0;
            break;
          case $translate('charge.inventory'): // '盤點'
            // 計算差(原本庫存 - 盤點結果)
            difference = Number(dvm.Stock) - Number(dvm.Qty);
            // 盤點數量比庫存多
            if (difference < 0) {
              withdraw = 0;
              deposit = -difference;
              // 盤虧
            } else {
              withdraw = difference;
              deposit = 0;
            }
            break;
          default:
            return;
        }

        // 轉換action變成英文
        switch (dvm.action) {
          case $translate('charge.purchase'): // '進貨'
            dvm.type = 'Purchase';
            break;
          case $translate('charge.sales'): // '銷貨'
            dvm.type = 'Destroy';
            break;
          case $translate('charge.returns'): // '退貨'
            dvm.type = 'Return';
            break;
          case $translate('charge.inventory'): // '盤點'
            dvm.type = 'Inventory';
            break;
          case $translate('charge.use'): // '使用'
            dvm.type = 'Use';
            break;
          default:
            return;
        }

        // 組資料
        const obj = {
          CreatedUserId: $sessionStorage.UserInfo.Id,
          CreatedUserName: $sessionStorage.UserInfo.Name,
          HospitalId: $sessionStorage.HospitalInfo.Id,
          ChargeId: $stateParams.Id,
          ItemName: vm.title,
          WardId: $stateParams.wardId,
          Withdraw: withdraw, // 提出 存入提出擇一填值
          Deposit: deposit, // 存入
          Stock: dvm.NewStock,
          SafetyStock: dvm.SafetyStock,
          Unit: vm.Unit,
          Memo: dvm.Memo || '',
          Type: dvm.type, // Type(行為類別)  Purchase 進貨, Destroy 銷貨, Return 退貨, Inventory 盤點, Use 使用
          CreatedTime: moment(), // CreatedTime 跟 RecordDateTime先用一樣的
          RecordDateTime: dvm.RecordDateTime // moment()
        };
        // 儲存庫存資料
        chargeService.saveChargeWarehouse(obj).then(() => {
          showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
          dvm.isSaving = false;
          $mdDialog.hide();

          vm.loadCharge();
        }, (a) => {
          // console.log(a.data);
          // console.log(a);
          if (a.data === 'CHARGE_INVENTORY') {
            showMessage($translate('charge.component.DatasFailure')); // lang.DatasFailure
          } else {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
          }
          dvm.isSaving = false;
        });
      }
    };

    // 檢查項目內容
    dvm.validCheck = function validCheck() {
      // 先檢查庫存
      if (dvm.notEnough) {
        return false;
      }
      // 檢查數量與庫存關係，以及備註是否為必填
      if (dvm.action === $translate('charge.inventory')) { // '盤點'
        if (Number(dvm.Qty) < 0) {
          return false;
        }
        if (dvm.Memo === undefined) {
          return false;
        }
      } else if (Number(dvm.Qty) < 0) {
        return false;
      }
      return true;
    };
  }

  // 編輯進銷存項目Dialog的controller設定 (盤點無法修改所以不會呼叫到)
  function PSWEditDialogController() {
    const dvm = this;
    dvm.title = vm.title;
    vm.dataindex = Math.abs(vm.index - (vm.chargeWarehouse.length - 1));
    // 轉換中文標題、計算原來庫存
    switch (vm.showWarehouse[vm.dataindex].Type) {
      case 'Purchase':
        dvm.action = $translate('charge.purchase'); // '進貨'
        dvm.oldStock = Number(vm.Stock) - Number(vm.showWarehouse[vm.dataindex].Deposit);
        dvm.Qty = angular.copy(vm.showWarehouse[vm.dataindex].Deposit);
        dvm.oldQty = angular.copy(vm.showWarehouse[vm.dataindex].Deposit);
        dvm.newStock = Number(dvm.oldStock) + Number(dvm.Qty);
        break;
      case 'Destroy':
        dvm.action = $translate('charge.sales'); // '銷貨'
        dvm.oldStock = Number(vm.Stock) + Number(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.Qty = angular.copy(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.oldQty = angular.copy(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.newStock = Number(dvm.oldStock) - Number(dvm.Qty);
        break;
      case 'Return':
        dvm.action = $translate('charge.returns'); // '退貨'
        dvm.oldStock = Number(vm.Stock) + Number(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.Qty = angular.copy(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.oldQty = angular.copy(vm.showWarehouse[vm.dataindex].Withdraw);
        dvm.newStock = Number(dvm.oldStock) - Number(dvm.Qty);
        break;
      default:
        return;
    }

    dvm.Stock = vm.Stock;
    dvm.SafetyStock = vm.SafetyStock;
    dvm.price = vm.Price;
    dvm.CreatedTime = moment().format('YYYY-MM-DD HH:mm:ss');
    dvm.RecordDateTime = vm.RecordDateTime;
    dvm.IsFixed = angular.copy(vm.showWarehouse[vm.dataindex].IsFixed);
    if (vm.showWarehouse[vm.dataindex].Type === 'Inventory' || vm.showWarehouse[vm.dataindex].Type === 'Use') {
      dvm.IsFixed = true;
    }

    // 前台顯示文字處理
    dvm.oldStockText = `${dvm.oldStock}(${vm.Unit})`;
    dvm.oldQtyText = `${dvm.oldQty}(${vm.Unit})`;
    dvm.QtyText = `${dvm.Qty}(${vm.Unit})`;
    dvm.SafetyStockText = `${dvm.SafetyStock}(${vm.Unit})`;
    dvm.StockText = `${dvm.Stock}(${vm.Unit})`;
    dvm.newStockText = `${dvm.newStock}(${vm.Unit})`;

    dvm.cancel = function cancel() {
      $mdDialog.cancel();
    };

    // 計算數字變化
    dvm.QtyChange = function QtyChange() {
      dvm.notEnough = false;

      if (dvm.Qty !== undefined) {
        switch (dvm.action) {
          case $translate('charge.purchase'): // '進貨'
            dvm.newStock = Number(dvm.oldStock) + Number(dvm.Qty);
            break;
          case $translate('charge.sales'): // '銷貨'
            dvm.newStock = Number(dvm.oldStock) - Number(dvm.Qty);
            break;
          case $translate('charge.returns'): // '退貨'
            dvm.newStock = Number(dvm.oldStock) - Number(dvm.Qty);
            break;
          default:
            break;
        }

        // 新庫存量低於庫存量
        if (dvm.newStock < 0) {
          dvm.notEnough = true;
        }

        // 計算完後更新畫面顯示文字
        dvm.QtyText = `${dvm.Qty}(${vm.Unit})`;
        dvm.newStockText = `${dvm.newStock}(${vm.Unit})`;
      } else {
        // 如果是無法計算的文字，則用舊值畫面顯示文字
        dvm.QtyText = `(${vm.Unit})`;
        dvm.newStockText = `(${vm.Unit})`;
      }
    };

    // 儲存編輯的進銷存項目
    dvm.save = function save() {
      dvm.isSaving = true;
      let withdraw;
      let deposit;

      // 先檢查必填欄位
      if (dvm.validCheck() === false) {
        showMessage($translate('charge.component.operatingfailureinput')); // '操作失敗, 輸入有誤!'
        dvm.isSaving = false;
      } else {
        // 計算withdraw, deposit
        switch (dvm.action) {
          case $translate('charge.purchase'): // '進貨'
            withdraw = 0;
            deposit = dvm.Qty;
            break;
          case $translate('charge.sales'): // '銷貨'
          case $translate('charge.returns'): // '退貨'
            withdraw = dvm.Qty;
            deposit = 0;
            break;
          default:
            return;
        }

        // 組資料
        const obj = vm.showWarehouse[vm.dataindex];
        obj.Withdraw = withdraw; // 提出 存入提出擇一填值
        obj.Deposit = deposit; // 存入
        obj.Stock = dvm.newStock;
        // obj.ModifiedTime = moment();
        // obj.ModifiedUserId = '570600fdd53d3c61d6794f95';
        // obj.ModifiedUserName = '管理者';

        chargeService.editChargeWarehouse(obj).then(() => {
          showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
          dvm.isSaving = false;
          $mdDialog.hide();

          vm.loadCharge();
        }, (res) => {
          // 在錯誤訊息顯示前，先把dialog關閉，可避免畫面閃爍情況
          $mdDialog.hide();

          if (res.data === '物品已盤點') {
            showMessage(res.data);
          } else {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
          }
          dvm.isSaving = false;
        });
      }
    };

    // 檢查項目內容
    dvm.validCheck = function validCheck() {
      // 先檢查庫存
      if (dvm.notEnough) {
        return false;
      }

      // 檢查數量與庫存關係，以及備註是否為必填，錯誤訊息前台的required關鍵字已經會顯示
      if (Number(dvm.Qty) < 0) {
        return false;
      }

      return true;
    };
  }

    // 回計價管理清單
  vm.back = function () {
    $state.go('charge', { wardId: $stateParams.wardId }, { notify: false, reload: true, location: 'replace' });
  };
}

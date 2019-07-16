import tpl from './paymentDetail.html';
import '../../app/app.less';

angular.module('app').component('paymentDetail', {
    template: tpl,
    controller: PaymentDetailCtrl,
    controllerAs: 'vm'
});

PaymentDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'paymentService', 'showMessage', '$timeout', '$mdDialog', 'hospitalService'];

function PaymentDetailCtrl($scope, $state, $stateParams, $sessionStorage, paymentService, showMessage, $timeout, $mdDialog, hospitalService) {
    const vm = this;

    vm.readonly = false;
    vm.editMode = false;

    // 取得帳務資料
    vm.loadPayment = function loadPayment() {
        // 依照$stateParams.id判斷是新增還是編輯帳務
        if ($stateParams.id === 'create') {
            vm.type = 'create';
            vm.editMode = false;
            vm.loading = false;
        } else {
            vm.type = 'edit';
            vm.editMode = true;
            // 編輯時讀取帳務資料
            paymentService.getById($stateParams.id).then((resp) => {
                vm.payment = resp.data;
                vm.formData = angular.copy(resp.data);
                vm.formData.StartDate = new Date(vm.payment.StartDate);
                vm.formData.EndDate = new Date(vm.payment.EndDate);
                if (vm.payment.PostingDate !== null) {
                    vm.formData.PostingDate = new Date(vm.payment.PostingDate);
                }
                if (vm.formData.Status === 'Deleted') {
                    vm.readonly = true;
                }
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                vm.loading = false;
                vm.isError = true;
                showMessage(lang.ServerError);
            });
        }
        // 取得醫院資料
        hospitalService.get().then((resp) => {
            vm.hospitals = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage(lang.ServerError);
        });
    };

    // 初始化頁面時載入帳務資料
    vm.$onInit = function onInit() {
        // 讀取狀態參數
        vm.loading = true;
        // 先初始化一個空物件
        vm.formData = {};
        vm.loadPayment();
    };

    vm.$onDestroy = function () {
    };

    // 設定使用者存檔函數
    vm.save = function save() {
        vm.isSaving = true;
        if ($stateParams.id === 'create') {
            vm.formData.HospitalId = vm.Hospital.substr(0, vm.Hospital.indexOf('-'));
            vm.formData.HospitalName = vm.Hospital.substr(vm.Hospital.indexOf('-') + 1);
            // 新增帳務的post動作
            paymentService.post(vm.formData).then(() => {
                showMessage(lang.DataAddedSuccessfully);
                vm.isSaving = false;
                $state.go('payment', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
                vm.isSaving = false;
            });
        } else {
            // 儲存帳務的put動作
            paymentService.put(vm.formData).then(() => {
                showMessage(lang.Datasuccessfully);
                vm.isSaving = false;
                $state.go('payment', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
                vm.isSaving = false;
            });
        }
    };

    // 用檢查函數包住存檔方法，而存檔方法在上方已依不同需求設定
    vm.showSimpleToast = function showSimpleToast() {
        if ($scope.editForm.$valid) {
            vm.save();
            return;
        }
        showMessage('資料未填寫完全!');
    };

    // 刪除帳務 , 顯示刪除確認對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title('刪除確認')
            .textContent(`您即將刪除帳單:${vm.formData.Name}，點擊確認後將會刪除此帳務資料!`)
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok('刪除')
            .cancel('取消');
        $mdDialog.show(confirm).then(() => {
          // 呼叫刪除的service
          paymentService.delById($stateParams.id).then(() => {
            showMessage(lang.DataDeletedSuccess);
            vm.isSaving = false;
            $mdDialog.hide();
            history.go(-1);
            // $state.go('payment', {}, { notify: false, reload: true, location: 'replace' });
          }, () => {
            showMessage(lang.DataDeleteFailed);
            vm.isSaving = false;
          });
          $mdDialog.hide();
        }, () => {
          vm.isSaving = false;
          $mdDialog.hide();
        });
    };

    vm.recover = function recover() {
        vm.isSaving = true;
        // 復原刪除的service
        vm.formData.Status = 'Normal';
        vm.formData.Password = '';
        paymentService.put(vm.formData).then(() => {
            vm.readonly = false;
            $state.reload();
            showMessage('資料復原成功');
            vm.isSaving = false;
        }, (res) => {
            if (res.data !== undefined) {
                showMessage(res.data);
            } else {
                showMessage(lang.DatasFailure);
            }
            vm.isSaving = false;
        });
    };

    // 計價方式下拉清單選項 BillingMethod
    vm.Billing = [{
           value: '月租',
           name: '月租'
       },
       {
           value: '用量',
           name: '用量'
       }
    ];

    // 重新計算費用
    vm.recalculate = function recalculate() {
        vm.formData.TotalAmount = (vm.formData.Price * vm.formData.Quantity) - vm.formData.Discount;
    };

    // 關帳
    vm.closePayment = function closePayment(ev) {
        vm.isSaving = true;
        // 詢問是否確定關帳
        const confirm = $mdDialog.confirm()
        .title('關帳確認')
        .textContent(`您即將將帳單關帳:${vm.formData.Name}，點擊確認後將會進行關帳!`)
        .ariaLabel('close confirm')
        .targetEvent(ev)
        .ok('關帳')
        .cancel('取消');
        $mdDialog.show(confirm).then(() => {
            // 進行關帳相關處理
            // 目前沒做任何檢查, 直接設關帳
            vm.formData.State = 'Closed';
            paymentService.put(vm.formData).then(() => {
                showMessage(lang.Datasuccessfully);
                vm.isSaving = false;
                $state.go('payment', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
                vm.isSaving = false;
            });
            $mdDialog.hide();
        }, () => {
            vm.isSaving = false;
            $mdDialog.hide();
        });
    };

    vm.back = function () {
        history.go(-1);
    };
}

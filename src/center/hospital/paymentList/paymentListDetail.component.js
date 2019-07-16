import tpl from './paymentListDetail.html';
import '../../../app/app.less';

angular.module('app').component('paymentListDetail', {
    template: tpl,
    controller: PaymentListDetailCtrl,
    controllerAs: 'vm'
});

PaymentListDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'paymentService', 'showMessage', '$timeout', '$mdDialog', 'hospitalService'];

function PaymentListDetailCtrl($scope, $state, $stateParams, $sessionStorage, paymentService, showMessage, $timeout, $mdDialog, hospitalService) {
    const vm = this;

    vm.readonly = false;
    vm.editMode = false;

    // 取得帳務資料
    vm.loadPayment = function loadPayment() {
        // 依照$stateParams.id判斷是新增還是編輯帳務
        if ($stateParams.id === 'create') {
            vm.type = 'create';

            // 取醫院資訊
            hospitalService.getById($stateParams.hospitalId).then((resp) => {
                vm.hospital = angular.copy(resp.data);
                vm.formData.HospitalName = vm.hospital.HospitalName;
                vm.formData.HospitalId = $stateParams.hospitalId;
                console.log(vm.formData);
            });

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

    // 設定帳務存檔函數
    vm.save = function save() {
        if ($stateParams.id === 'create') {
            // 新增帳務的post動作
            vm.formData.HospitalId = $stateParams.hospitalId;
            paymentService.post(vm.formData).then(() => {
                showMessage(lang.DataAddedSuccessfully);
                history.go(-1);
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
            });
        } else {
            // 儲存帳務的put動作
            paymentService.put(vm.formData).then(() => {
                showMessage(lang.Datasuccessfully);
                history.go(-1);
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
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
        const confirm = $mdDialog.confirm()
            .title('刪除確認')
            .textContent(`您即將刪除帳務:${vm.formData.Name}，點擊確認後將會刪除此帳務資料!`)
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok('刪除')
            .cancel('取消');
        $mdDialog.show(confirm).then(() => {
          // 呼叫刪除的service
          paymentService.delById($stateParams.id).then(() => {
            showMessage(lang.DataDeletedSuccess);
            $mdDialog.hide();
            history.go(-1);
            // $state.go('paymentList', {}, { notify: false, reload: true, location: 'replace' });
          }, () => {
            showMessage(lang.DataDeleteFailed);
          });
          $mdDialog.hide();
        }, () => {
          $mdDialog.hide();
        });
    };

    vm.recover = function recover() {
        // 復原刪除的service
        vm.formData.Status = 'Normal';
        vm.formData.Password = '';
        paymentService.put(vm.formData).then(() => {
            vm.readonly = false;
            $state.reload();
            showMessage('資料復原成功');
        }, (res) => {
            if (res.data !== undefined) {
                showMessage(res.data);
            } else {
                showMessage(lang.DatasFailure);
            }
        });
    };

    // 計價方式下拉清單選項 BillingMethod
    vm.Billing = [{
        value: 'rent',
        name: '月租'
    },
    {
        value: 'usage',
        name: '用量'
    }
    ];

    // 重新計算費用
    vm.recalculate = function recalculate() {
        vm.formData.TotalAmount = (vm.formData.Price * vm.formData.Quantity) - vm.formData.Discount;
    };

    // 關帳
    vm.closePayment = function closePayment(ev) {
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
                $state.go('payment', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage(lang.DatasFailure);
                }
            });
            $mdDialog.hide();
        }, () => {
            $mdDialog.hide();
        });
    };

    vm.back = function () {
        history.go(-1);
    };
}

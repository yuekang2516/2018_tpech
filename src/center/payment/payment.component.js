import tpl from './payment.html';
import dtpl from './createPaymentDialog.html';

angular.module('app').component('payment', {
    template: tpl,
    controller: PaymentCtrl,
    controllerAs: 'vm'
});

PaymentCtrl.$inject = ['$mdSidenav', '$window', '$state', 'paymentService', 'showMessage', '$mdDialog', 'contractService', 'dialysisService'];
function PaymentCtrl($mdSidenav, $window, $state, paymentService, showMessage, $mdDialog, contractService, dialysisService) {
    const vm = this;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };


    // 初始載入區
    vm.$onInit = function onInit() {
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        // 更改讀取狀態
        vm.loading = true;
        vm.loadPayment();
    };

    vm.loadPayment = function loadPayment() {
        paymentService.get().then((resp) => {
            vm.payments = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage(lang.ComServerError);
        });
    };

    // 切換到編輯帳務資料頁面
    vm.gotoPaymentDetail = function (id) {
        $state.go('paymentDetail', { id });
    };

    // 切換到新增帳務資料頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('paymentDetail', { id: 'create' });
    };

    // 出帳功能Dialog
    vm.creatPayment = function creatPayment(ev) {
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

    // 出帳功能Dialog的controller設定
    function DialogController() {
        const dvm = this;
        dvm.loading = true;
        dvm.HospitalId = 'ALL';

        // 計算年月
        let now = new Date(); // Today
        let lastM = new Date(now.getFullYear().toString() + '/' + (now.getMonth() + 1).toString() + '/01') - 1;
        lastM = new Date(lastM); // 上個月最後一天
        dvm.Year = lastM.getFullYear();
        dvm.Month = lastM.getMonth() + 1;
        dvm.lastM01 = lastM.getFullYear().toString() + '-' + (lastM.getMonth() + 1).toString() + '-01';
        dvm.lastM31 = lastM.getFullYear().toString() + '-' + (lastM.getMonth() + 1).toString() + '-' + lastM.getDate().toString();

        // 取得年月有效合約資料
        contractService.getByDate(dvm.Year, dvm.Month).then((resp) => {
            dvm.contracts = resp.data;
            // 出帳checkbox, 勾選預設為 true
            angular.forEach(dvm.contracts, function (contract, ind) {
                contract.paycheck = 1;
            });
            dvm.loading = false;
            dvm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            dvm.loading = false;
            dvm.isError = true;
            showMessage(lang.ComServerError);
        });

        // 出帳checkbox
        dvm.toggle = function toggle(id) {
            angular.forEach(dvm.contracts, function (contract, ind) {
                if (contract.HospitalId === id) {
                    if (contract.paycheck === 1) {
                        contract.paycheck = 0;
                    } else {
                        contract.paycheck = 1;
                    }
                }
            });
        };

        // 變更年月重取有效合約資料
        dvm.hospitalReload = function hospitalReload() {
            // 先檢查必填欄位
            if (dvm.Year === '' || dvm.Month === '') {
                showMessage('出帳年月輸入不完整, 請檢查後重新執行重整!');
            } else {
                // 取得年月有效合約資料
                contractService.getByDate(dvm.Year, dvm.Month).then((resp) => {
                    dvm.contracts = resp.data;
                    // 出帳checkbox, 勾選預設為 true
                    angular.forEach(dvm.contracts, function (contract, ind) {
                        contract.paycheck = 1;
                    });
                });
                // 計算年月
                if (dvm.Month === '12') {
                    dvm.lastM01 = dvm.Year.toString() + '-' + dvm.Month.toString() + '-01';
                    dvm.lastM31 = dvm.Year.toString() + '-' + dvm.Month.toString() + '-31';
                } else {
                    lastM = new Date(dvm.Year.toString() + '/' + (parseInt(dvm.Month) + 1).toString() + '/01') - 1;
                    lastM = new Date(lastM); // 上個月最後一天
                    dvm.lastM01 = lastM.getFullYear().toString() + '-' + (lastM.getMonth() + 1) + '-01';
                    dvm.lastM31 = lastM.getFullYear().toString() + '-' + (lastM.getMonth() + 1).toString() + '-' + lastM.getDate().toString();
                }
            }
        };

        // 關閉Dialog
        dvm.cancel = function cancel() {
            $mdDialog.cancel();
        };

        // 出帳
        dvm.save = function save() {
            angular.forEach(dvm.contracts, function (contract, ind) {
                if (contract.paycheck === 1) {
                    dvm.createOnePayment(contract.HospitalId, contract);
                }
            });
            $mdDialog.hide();
            showMessage('出帳成功');
            // 儲存完後重新載入資料
            // vm.loadPayment();
        };

        // 執行出帳
        dvm.createOnePayment = function createOnePayment(hId, hcontract) {
            // 先初始化一個空物件
            vm.formData = {};
            paymentService.getHospitalAll(hId).then((resp2) => {
                let updatekind = 0;
                angular.forEach(resp2.data, function (matchpayment, ind) {
                    if (matchpayment.Name === dvm.Year + '年' + dvm.Month + '月帳單') {
                        if (matchpayment.State === 'Closed') {
                            updatekind = 2; // 已有帳單, 但已關帳
                        } else {
                            updatekind = 1; // 已有帳單, 更新
                            vm.formData = matchpayment;
                            vm.formData.Status = 'Normal';
                        }
                    }
                });
                vm.formData.HospitalId = hId; // 醫院Id
                vm.formData.HospitalName = hcontract.HospitalName; // 醫院名稱
                vm.formData.Name = dvm.Year + '年' + dvm.Month + '月帳單'; // 帳單名稱
                vm.formData.StartDate = dvm.lastM01; // 計價起日
                vm.formData.EndDate = dvm.lastM31; // 計價迄日
                vm.formData.PricingMethod = hcontract.BillingMethod; // 計價方式
                vm.formData.Price = hcontract.Price; // 單價
                vm.formData.Discount = 0; // 折扣金額
                vm.formData.State = ''; // 帳單狀態
                vm.formData.InvoiceNumber = ''; // 發票編號
                vm.formData.PostingDate = null; // 入帳日期
                // 取得透析表單數量
                dialysisService.getByHospitalDate(hId, dvm.lastM01, dvm.lastM31).then((resp1) => {
                    if (hcontract.BillingMethod === '月租') {
                        vm.formData.Quantity = 1; // 數量
                        vm.formData.TotalAmount = vm.formData.Price; // 總金額
                        vm.formData.Memo = '透析表單數量=' + resp1.data.toString(); // Memo
                    } else {
                        vm.formData.Quantity = parseInt(resp1.data); // 透析表單數量
                        vm.formData.TotalAmount = vm.formData.Price * vm.formData.Quantity; // 總金額
                    }
                    if (updatekind === 1) {
                        // 修改帳務put
                        paymentService.put(vm.formData).then(() => {
                            vm.loadPayment();
                        });
                    } else if (updatekind === 0) {
                        // 新增帳務post
                        paymentService.post(vm.formData).then(() => {
                            vm.loadPayment();
                        });
                    } else {
                        console.log(vm.formData.Name + ':已關帳,不處理');
                    }
                }, () => {
                   showMessage(lang.DatasFailure);
                });
            });
        };
    }
}

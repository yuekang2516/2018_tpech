import tpl from './payment.html';

angular.module('app').component('payment', {
    template: tpl,
    controller: PaymentCtrl,
    controllerAs: 'vm'
});

PaymentCtrl.$inject = ['$mdSidenav', '$window', '$state', 'paymentService', 'showMessage', '$mdDialog', 'contractService', 'dialysisService', 'SettingService', '$filter'];
function PaymentCtrl($mdSidenav, $window, $state, paymentService, showMessage, $mdDialog, contractService, dialysisService, SettingService, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    let currentHospital = SettingService.getCurrentHospital();

    // 初始載入區
    vm.$onInit = function onInit() {
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        // 更改讀取狀態
        vm.loading = true;
        vm.loadPayment();
    };

    vm.loadPayment = function loadPayment() {
        paymentService.getByHospitall(currentHospital.Id).then((resp) => {
            vm.payments = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 切換到檢視帳務資料頁面
    vm.gotoPaymentDetail = function (id) {
        $state.go('paymentDetail', { id });
    };

    vm.showMethod = function showMethod(method) {
        let sMethod = '';
        if (method === 'rent') {
            sMethod = $translate('payment.rent'); // '月租'
        } else if (method === 'usage') {
            sMethod = $translate('payment.usage'); // '用量';
        } else {
            sMethod = method;
        }
        return sMethod;
    };
}

import tpl from './paymentList.html';
import './paymentList.less';

angular.module('app').component('paymentList', {
    template: tpl,
    controller: PaymentListCtrl,
    controllerAs: 'paymentList'
});

PaymentListCtrl.$inject = ['$window', '$state', 'paymentService', 'showMessage', '$stateParams'];

function PaymentListCtrl($window, $state, paymentService, showMessage, $stateParams) {
    const vm = this;
    let statehospitalId;

    // 初始載入區
    vm.$onInit = function onInit() {
        statehospitalId = $stateParams.id;
        // 進入此頁面後拉到最頂
        $window.scrollTo(0, 0);

        // 更改讀取狀態
        vm.loading = true;
        vm.search = 'Normal';

        paymentService.getHospitalAll($stateParams.id).then((resp) => {
            vm.payments = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage(lang.ComServerError);
        });
    };

    // 切換到編輯帳務頁面
    vm.gotopaymentDetail = function (eid) {
        $state.go('paymentListDetail', {
            id: eid,
            hospitalId: statehospitalId
        });
    };

    // 切換到新增帳務頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('paymentListDetail', {
            id: 'create',
            hospitalId: statehospitalId
        });
    };

    // 顯示刪除項目切換:為了左上角顯示出正確的筆數
    vm.changeSearch = function changeSearch() {
        if (vm.showDelete) {
            vm.search = '';
        } else {
            vm.search = 'Normal';
        }
    };

    vm.showMethod = function showMethod(method) {
        let sMethod = '';
        if (method === 'rent') {
            sMethod = '月租';
        } else if (method === 'usage') {
            sMethod = '用量';
        } else {
            sMethod = method;
        }
        return sMethod;
    };
}

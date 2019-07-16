import tpl from './medicine.html';
import './medicine.less';

angular.module('app').component('medicine', {
    template: tpl,
    controller: SystemMedicineCtrl,
    controllerAs: 'vm'
});

SystemMedicineCtrl.$inject = ['$mdSidenav', '$state', '$timeout', 'medicineService', 'showMessage', '$filter'];
function SystemMedicineCtrl($mdSidenav, $state, $timeout, medicineService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    // infinite scroll 相關
    let dataEnd = false; // 判斷資料使否已完全 push 至顯示用的陣列裡
    let dataNumOnce = 20; // 一次 push 多少筆資料
    let timeoutPromise;

    // 初始載入區
    vm.$onInit = function () {
        getAllMedicines();
    };

    vm.searchMedicine = function searchMedicine(searchStr) {

        $timeout.cancel(timeoutPromise);
        timeoutPromise = $timeout(() => {
            vm.loading = true;
            // 搜尋時由於列表資料重新整理，與 infinite scroll 相關的參數需初始化
            // initForScroll();
            if (searchStr) {
                medicineService.get(vm.searchStr).then((resp) => {
                    vm.medicines = _.orderBy(resp.data[0].medicine, ['CategoryName']);
                    initForScroll();
                    vm.loadMore();
                    vm.loading = false;
                    vm.isError = false; // 顯示伺服器連接失敗的訊息
                }, () => {
                    vm.loading = false;
                    vm.isError = true;
                    showMessage('讀不到藥品資料, 請重新整理');
                });
            } else {
                // 若 searchStr 為空則吐回全部 Medicines
                getAllMedicines();
            }
        }, 1000);
    };

    function getAllMedicines() {
        // 更改讀取狀態
        vm.loading = true;
        medicineService.get().then((resp) => {
            vm.medicines = _.orderBy(resp.data[0].medicine, ['CategoryName']);
            initForScroll();
            vm.loadMore();
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // 初始化 infinite scroll 相關參數 (一次顯示多個)
    function initForScroll() {
        dataEnd = false;
        vm.showMedicines = [];
    }

    // scroll 至底時呼叫
    vm.loadMore = function () {
        vm.loading = true;
        if (dataEnd || !vm.medicines) {
            vm.loading = false;
            return;
        }
        let lastIndex = vm.showMedicines.length - 1;
        let dataNum;
        // 判斷是否將為資料底
        if ((lastIndex + dataNumOnce) >= vm.medicines.length - 1) {
            dataEnd = true;
            dataNum = vm.medicines.length - lastIndex;
        } else {
            dataNum = dataNumOnce + 1;
        }
        for (let i = 1; i < dataNum; i++) {
            vm.showMedicines.push(vm.medicines[lastIndex + i]);
        }
        vm.loading = false;
    };

//    // 取得藥品相關資料
//    vm.loadMedicines = function loadMedicines() {
//        medicineService.get(vm.searchStr).then((resp) => {
//            vm.medicines = resp.data[0].medicine;
//
//            vm.loading = false;
//        }, () => {
//            vm.loading = false;
//            showMessage(lang.ComServerError);
//        });
//    };

    // 進入藥品編輯頁面
    vm.go = function go(med) {
        $state.go('medicineDetail', { id: med.Id });
    };

    // 進入藥品新增頁面
    vm.gotoCreate = function gotoCreate() {
        $state.go('medicineDetail', { id: 'create' });
    };

    // // 如果搜尋列沒值直接載入頁面
    // if (!vm.searchStr || vm.searchStr === '') {
    //    vm.loadMedicines();
    // }

    // // 如果搜尋列有輸入值，就根據輸入資料重新加載關鍵字後搜尋
    // vm.searchMedicine = function searchMedicine() {
    //    vm.loading = true;
    //    // 這裡的動作是 1.先取消之前的timeout設定 2. 設定一秒後，如果輸入值沒有再次更新，就呼叫載入頁面的方法
    //    $timeout.cancel(timeoutPromise);
    //    timeoutPromise = $timeout(() => {
    //        vm.loadMedicines();
    //    }, 1000);
    // };

    // vm.searchMedicine = function () {
    //    if (!vm.search) {
    //        vm.filterMedicines = vm.medicines;
    //        return;
    //    }
    //    vm.filterMedicines = vm.medicines.filter((item) => {
    //        return (item.CategoryName && item.CategoryName.includes(vm.search))
    //            || (item.Name && item.Name.includes(vm.search))
    //            || (item.NHICode && item.NHICode.includes(vm.search))
    //            || (item.MedicineCode && item.MedicineCode.includes(vm.search));
    //    });
    // }
}

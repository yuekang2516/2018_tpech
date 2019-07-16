import tpl from './contractDetail.html';
import '../../app/app.less';

angular.module('app').component('contractDetail', {
    template: tpl,
    controller: ContractDetailCtrl,
    controllerAs: 'vm'
});

ContractDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'contractService', 'showMessage', '$mdDialog', 'hospitalService'];

function ContractDetailCtrl($scope, $state, $stateParams, $sessionStorage, contractService, showMessage, $mdDialog, hospitalService) {
    const vm = this;

    vm.readonly = false;
    vm.editMode = false;

    // 取得合約資料
    vm.loadContract = function loadContract() {
        // 依照$stateParams.id判斷是新增還是編輯合約
        if ($stateParams.id === 'create') {
            vm.type = 'create';
            vm.editMode = false;
            vm.loading = false;
        } else {
            vm.type = 'edit';
            vm.editMode = true;
            // 編輯時讀取合約資料
            contractService.getById($stateParams.id).then((resp) => {
                vm.contract = resp.data;
                vm.formData = angular.copy(resp.data);
                vm.formData.StartDate = new Date(vm.contract.StartDate);
                vm.formData.EndDate = new Date(vm.contract.EndDate);
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

    // 初始化頁面時載入合約資料
    vm.$onInit = function onInit() {
        // 讀取狀態參數
        vm.loading = true;
        // 先初始化一個空物件
        vm.formData = {};
        vm.loadContract();
    };

    vm.$onDestroy = function () {
    };

    // 設定合約存檔函數
    vm.save = function save() {
        vm.isSaving = true;
        if ($stateParams.id === 'create') {
            vm.formData.HospitalId = vm.Hospital.substr(0, vm.Hospital.indexOf('-'));
            vm.formData.HospitalName = vm.Hospital.substr(vm.Hospital.indexOf('-') + 1);
            // 新增合約的post動作
            contractService.post(vm.formData).then(() => {
                showMessage(lang.DataAddedSuccessfully);
                vm.isSaving = false;
                $state.go('contract', {}, {
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
            // 儲存合約的put動作
            contractService.put(vm.formData).then(() => {
                showMessage(lang.Datasuccessfully);
                vm.isSaving = false;
                $state.go('contract', {}, {
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

    // 刪除合約 , 顯示刪除確認對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title('刪除確認')
            .textContent(`您即將刪除合約:${vm.formData.Name}，點擊確認後將會刪除此合約資料!`)
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok('刪除')
            .cancel('取消');
        $mdDialog.show(confirm).then(() => {
          // 呼叫刪除的service
          contractService.delById($stateParams.id).then(() => {
            showMessage(lang.DataDeletedSuccess);
            vm.isSaving = false;
            $mdDialog.hide();
            $state.go('contract', {}, { notify: false, reload: true, location: 'replace' });
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

    vm.back = function () {
        history.go(-1);
    };
}

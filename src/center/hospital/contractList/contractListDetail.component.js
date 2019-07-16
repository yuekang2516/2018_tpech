import tpl from './contractListDetail.html';
import '../../../app/app.less';

angular.module('app').component('contractListDetail', {
    template: tpl,
    controller: ContractListDetailCtrl,
    controllerAs: 'vm'
});

ContractListDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'contractService', 'showMessage', '$mdDialog', 'hospitalService'];

function ContractListDetailCtrl($scope, $state, $stateParams, $sessionStorage, contractService, showMessage, $mdDialog, hospitalService) {
    const vm = this;

    vm.readonly = false;
    vm.editMode = false;

    // 取得合約資料
    vm.loadContract = function loadContract() {
        // 依照$stateParams.id判斷是新增還是編輯合約
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
            // 編輯時讀取合約資料
            contractService.getById($stateParams.id).then((resp) => {
                vm.contract = resp.data;
                console.log(vm.contract);
                vm.formData = angular.copy(resp.data);
                vm.formData.StartDate = new Date(vm.contract.StartDate);
                vm.formData.EndDate = new Date(vm.contract.EndDate);
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
        if ($stateParams.id === 'create') {
            // 新增合約的post動作
            // vm.formData.HospitalId = $stateParams.hospitalId;
            // vm.formData.hospitalName = hospitalName;
            contractService.post(vm.formData).then(() => {
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
            // 儲存合約的put動作
            contractService.put(vm.formData).then(() => {
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

    // 刪除合約 , 顯示刪除確認對話視窗
    vm.delete = function del(ev) {
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
            $mdDialog.hide();
            history.go(-1);
            // $state.go('contractList', {}, { notify: false, reload: true, location: 'replace' });
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
        contractService.put(vm.formData).then(() => {
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

    vm.back = function () {
        history.go(-1);
    };
}

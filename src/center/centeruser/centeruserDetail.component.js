import tpl from './centeruserDetail.html';
import '../../app/app.less';

angular.module('app').component('centeruserDetail', {
    template: tpl,
    controller: CenterUserDetailCtrl,
    controllerAs: 'vm'
});

CenterUserDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'SettingService', 'centerUserService', 'showMessage', 'nfcService', '$timeout', '$mdDialog'];

function CenterUserDetailCtrl($scope, $state, $stateParams, $sessionStorage, SettingService, centerUserService, showMessage, nfcService, $timeout, $mdDialog) {
    const vm = this;

    vm.readonly = false;
    vm.editMode = false;

    // 取得使用者資料
    vm.loadUser = function loadUser() {
        // 依照$stateParams.id判斷是新增還是編輯使用者
        if ($stateParams.id === 'create') {
            vm.type = 'create';
            vm.editMode = false;
            vm.loading = false;
        } else {
            vm.type = 'edit';
            vm.editMode = true;
            // 編輯時讀取使用者資料
            centerUserService.getById($stateParams.id).then((resp) => {
                vm.centeruser = resp.data;
                vm.formData = angular.copy(resp.data);
                if (vm.formData.Status === 'Deleted') {
                    vm.readonly = true;
                }
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                vm.loading = false;
                vm.isError = true;
            });
        }
    };

    // 初始化頁面時載入使用者資料
    vm.$onInit = function onInit() {
        // 同時listen tag & Ndef 事件，Ndef卡只會引發 Ndef 事件，因此也需監測 Ndef
        nfcService.listenTag(changeRfid);
        nfcService.listenNdef(changeRfid);

        // 讀取狀態參數
        vm.loading = true;
        // 先初始化一個空物件
        vm.formData = {};
        vm.loadUser();
    };

    vm.$onDestroy = function () {
        nfcService.stop();
    };

    function changeRfid(rfid) {
        if (rfid.Id) {
            $timeout(() => {
                vm.formData.RFID = rfid.Id;
            });
        }
    }

    // 設定使用者存檔函數
    vm.save = function save() {
        vm.isSaving = true;
        // 密碼如果沒有設定就給空值
        if (vm.password) {
            vm.formData.Password = vm.password;
        } else {
            vm.formData.Password = '';
        }

        if ($stateParams.id === 'create') {
            // 新增使用者的post動作
            centerUserService.post(vm.formData).then(() => {
                showMessage(lang.DataAddedSuccessfully);
                vm.isSaving = false;
                $state.go('centeruser', {}, {
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
            // 儲存使用者的put動作
            centerUserService.put(vm.formData).then(() => {
                // userService.put(vm.formData).then((res) => {
                // SettingService.setCurrentUser(res.data);
                showMessage(lang.Datasuccessfully);
                vm.isSaving = false;
                $state.go('centeruser', {}, {
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
        if ($scope.editForm.$valid && vm.passwordConfirm === vm.password) {
            if ((vm.type === 'create' && vm.password) || vm.type === 'edit') {
                vm.save();
                return;
            }
        }
        showMessage('資料未填寫完全!');
    };

    // 刪除使用者 , 顯示刪除確認對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title('刪除確認')
            .textContent(`您即將刪除Center使用者:${vm.formData.Name}，點擊確認後將會刪除此使用者帳號!`)
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok('刪除')
            .cancel('取消');
        $mdDialog.show(confirm).then(() => {
          // 呼叫刪除的service
          centerUserService.delById($stateParams.id).then(() => {
            showMessage(lang.DataDeletedSuccess);
            vm.isSaving = false;
            $mdDialog.hide();
            $state.go('centeruser', {}, { notify: false, reload: true, location: 'replace' });
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
        centerUserService.put(vm.formData).then(() => {
            vm.isSaving = false;
            vm.readonly = false;
            $state.reload();
            showMessage('資料復原成功');
        }, (res) => {
            if (res.data !== undefined) {
                showMessage(res.data);
            } else {
                showMessage(lang.DatasFailure);
            }
            vm.isSaving = false;
        });
    };
    // 性別下拉清單選項
    vm.optGender = [{
            value: 0,
            name: lang.Female
        },
        {
            value: 1,
            name: lang.Male
        }
    ];

    // 權限下拉清單選項
    vm.optAccess = [{
            value: 1,
            name: lang.AccessNormal
        },
        {
            value: 99,
            name: lang.AccessAdmin
        },
        {
            value: 0,
            name: lang.AccessDisable
        }
    ];

    vm.back = function () {
        history.go(-1);
    };
}

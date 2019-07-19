import tpl from './userDetail.html';
import addUserDialogTpl from './addUserDialog.html';

angular.module('app').component('userDetail', {
    template: tpl,
    controller: UserDetailCtrl,
    controllerAs: 'vm'
});

UserDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage', 'SettingService', 'userService', 'wardService', 'showMessage', 'nfcService', '$timeout', '$filter', '$mdDialog', 'tpechService'];

function UserDetailCtrl($scope, $state, $stateParams,
    $sessionStorage, SettingService, userService, wardService, showMessage, nfcService, $timeout, $filter, $mdDialog, tpechService) {
    const vm = this;

    let $translate = $filter('translate');


    self.user = SettingService.getCurrentUser();
    vm.readonly = false;
    vm.editMode = false;

    vm.isSmartEcare = false;

    // 取得使用者資料
    vm.loadUser = function loadUser() {
        // 載入模組
        // vm.newHospitalMods = angular.copy($sessionStorage.HospitalInfo.Modules);

        // 依照$stateParams.id判斷是新增還是編輯使用者
        if ($stateParams.id === 'create') {
            vm.type = 'create';
            vm.editMode = false;
            vm.loading = false;
            vm.isError = false;
        } else {
            vm.type = 'edit';
            vm.editMode = true;
            // 編輯時讀取使用者資料
            userService.getById($stateParams.id).then((resp) => {
                vm.user = resp.data;
                vm.formData = angular.copy(resp.data);
                console.log('user detail', vm.formData);
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
                // 對下拉選單內容決定是否要顯示
                _.forEach(vm.Wards, (item) => {
                    if (Object.keys(vm.formData.Ward).indexOf(item.Id) > -1) {
                        item.showItem = false;
                    }
                    vm.wardChips = Object.keys(vm.formData.Ward).map((key) => {
                        return vm.formData.Ward[key];
                    });
                });
                // 確認是否為 SmartEcare
                vm.checkSmartEcare();
                // // 如果有找到相同的醫院模組 就刪掉(不顯示)
                // _.forEach(vm.formData.Modules, (Module) => {
                //     const index = vm.newHospitalMods.indexOf(Module);
                //     if (index > -1) {
                //         vm.newHospitalMods.splice(index, 1);
                //     }
                // });
                // // vm.moduleChips = Object.values(vm.formData.Modules);
                // vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
                //     return vm.formData.Modules[key];
                // });
                // // 留存原始使用者資料，按取消時可從此資料復原
                // // vm.Tempuser = angular.copy(vm.user);
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
        // 取得透析室資料
        wardService.get().then((ward) => {
            vm.Wards = ward.data;
            // 設定透析室在下拉選單中顯示的參數
            vm.Wards.forEach((item) => {
                item.showItem = true;
            });
            // 載入使用者資料程式段獨立出來, 讓"取消"鈕可以呼叫
            vm.loadUser();
            // vm.isError = false; // 顯示伺服器連接失敗的訊息
            vm.loading = false;
            vm.isError = false;
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    vm.$onDestroy = function () {
        nfcService.stop();
    };

    // SmartEcare
    vm.checkSmartEcare = function () {
        if (vm.formData.PhoneNumber === '25162298' && vm.formData.Email === 'service@smart-ecare.com') {
            vm.isSmartEcare = true;
            console.log('悅康！！！！！');
        } else {
            vm.isSmartEcare = false;
            console.log('x 悅康！！！！！');
        }
    };

    function changeRfid(rfid) {
        if (rfid.Id) {
            $timeout(() => {
                vm.formData.RFID = rfid.Id;
            });
        }
    }

    // 檢查Email格式
    vm.isEmail = function isEmail(email) {
        // var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        // var regex = /^\w+((-\w+)|(.\w+))\@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
        let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regex.test(email)) {
            return false;
            // } else {
            //    return true;
        }
        return true;
    };

    // 設定使用者存檔函數
    vm.save = function save() {
        vm.isSaving = true;
        // 密碼如果沒有設定就給空值
        if (vm.password) {
            vm.formData.Password = vm.password;
        } else {
            vm.formData.Password = '';
        }

        // 先檢查
        if (vm.formData.Email && vm.formData.Email !== '') {
            if (vm.isEmail(vm.formData.Email) === false) {
                showMessage($translate('user.component.operatingfailure')); // '操作失敗, Email格式有誤!'
                vm.isSaving = false;
                return;
            }
        }

        if ($stateParams.id === 'create') {
            vm.formData.CreatedUserId = self.user.Id;
            vm.formData.CreatedUserName = self.user.Name;
            // 新增使用者的post動作
            userService.post(vm.formData).then(() => {
                showMessage($translate('customMessage.DataAddedSuccessfully')); // lang.DataAddedSuccessfully
                vm.isSaving = false;
                $state.go('user', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                }
                vm.isSaving = false;
            });
        } else {
            // 檢查透析室是否有輸入
            if (vm.formData.Ward.length === 0) {
                showMessage($translate('customMessage.WardNameUnfilled')); // lang.WardNameUnfilled
                vm.isSaving = false;
                return;
            }
            // // 檢查醫院模組是否有輸入
            // if (vm.formData.Modules.length === 0) {
            //     showMessage($translate('customMessage.ModulesNameUnfilled')); // lang.ModulesNameUnfilled
            //     vm.isSaving = false;
            //     return;
            // }

            vm.formData.ModifiedUserId = self.user.Id;
            vm.formData.ModifiedUserName = self.user.Name;
            console.log('最後上傳 vm.formData', vm.formData);
            // 儲存使用者的put動作
            userService.put(vm.formData).then(() => {
                // userService.put(vm.formData).then((res) => {
                // SettingService.setCurrentUser(res.data);
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('user', {}, {
                    location: 'replace'
                });
            }, (res) => {
                if (res.data !== undefined) {
                    showMessage(res.data);
                } else {
                    showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                }
                vm.isSaving = false;
            });
        }
    };

    // 用檢查函數包住存檔方法，而存檔方法在上方已依不同需求設定
    vm.showSimpleToast = function showSimpleToast() {
        // 檢查是否為空物件 {}
        let validation = false;
        _.forEach(vm.formData.Ward, () => {
            validation = true;
        });
        if (vm.isSmartEcare ) {
            // SmartEcare
            // 確認密碼
            if (vm.password == undefined) {
                vm.password = "";
            }
            if (vm.passwordConfirm == undefined) {
                vm.passwordConfirm = "";
            }
            if ($scope.editForm.$valid && (validation && vm.passwordConfirm === vm.password)) { //  && vm.formData.Modules.length !== 0
                if ((vm.type === 'create' && vm.password) || vm.type === 'edit') {
                    vm.save();
                    return;
                }
            }
        } else {
            if ($scope.editForm.$valid && validation) { //  && vm.formData.Modules.length !== 0
                vm.save();
                return;
            }
        }
        showMessage($translate('user.component.dataIncomplete')); // '資料未填寫完全!'
    };

    // 新增透析室動作
    vm.addWard = function addWard(ward) {
        // 把下拉選單的選項改為不顯示
        if (!vm.formData.Ward) vm.formData.Ward = {};
        ward.showItem = false;
        // 增加到下方顯示區

        vm.formData.Ward[ward.Id] = ward.Name;

        // Object.values unsupported in many browsers
        // vm.wardChips = Object.values(vm.formData.Ward);
        vm.wardChips = Object.keys(vm.formData.Ward).map((key) => {
            return vm.formData.Ward[key];
        });
        // // 清空選項
        // vm.Ward = '';
    };

    // 移除透析室動作--新
    vm.removeWard = function removeWard(idx) {
        // 把下拉選單的選項改為顯示
        let key = Object.keys(vm.formData.Ward)[idx];
        _.forEach(vm.Wards, (item) => {
            if (item.Id === key) {
                item.showItem = true;
            }
        });

        delete vm.formData.Ward[key];
        vm.wardChips = Object.keys(vm.formData.Ward).map((k) => {
            return vm.formData.Ward[k];
        });
        vm.Ward = '';
    };

    // // 新增模組動作
    // vm.addModule = function addModule(data) {
    //     // 初始化模組陣列
    //     if (!vm.formData.Modules) vm.formData.Modules = [];

    //     // 檢查如果不是傳進來一個空白 就新增到陣列中
    //     if (data !== '') {
    //         vm.formData.Modules.push(data);
    //         vm.newHospitalMods.splice(vm.newHospitalMods.indexOf(data), 1);
    //     }
    //     // vm.moduleChips = Object.values(vm.formData.Modules);
    //     vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
    //         return vm.formData.Modules[key];
    //     });
    // };

    // // 移除模組動作
    // vm.removeModule = function removeModule(idx) {
    //     // 將移除的模組 push 回原陣列
    //     vm.newHospitalMods.push(vm.formData.Modules[idx]);
    //     vm.selectedModule = '';
    //     vm.formData.Modules.splice(vm.formData.Modules.indexOf(vm.formData.Modules[idx]), 1);
    //     // vm.moduleChips = Object.values(vm.formData.Modules);
    //     vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
    //         return vm.formData.Modules[key];
    //     });
    // };

    // 復原使用者
    vm.recover = function recover() {
        vm.isSaving = true;
        vm.loadUser();
        // // 從原先的暫存使用者複製一份回現在使用者
        // vm.formData = angular.copy(vm.Tempuser);
        // // 對下拉選單內容決定是否要顯示
        // _.forEach(vm.Wards, (item) => {
        //    item.showItem = true;
        //    _.forEach(vm.formData.Ward, (Ward, Id) => {
        //        if (item.Id === Id) {
        //            item.showItem = false;
        //        }
        //    });
        // });
        // vm.wardChips = Object.values(vm.formData.Ward);
        showMessage($translate('user.component.recoverSuccess')); // '恢復使用者資料成功'
        vm.isSaving = false;
    };

    // 性別下拉清單選項
    vm.optGender = [{
        value: 0,
        name: $translate('customMessage.Female') // lang.Female
    },
    {
        value: 1,
        name: $translate('customMessage.Male') // lang.Male
    }
    ];

    // 權限下拉清單選項
    vm.optAccess = [{
        value: 1,
        name: $translate('customMessage.AccessNormal') // lang.AccessNormal
    },
    {
        value: 99,
        name: $translate('customMessage.AccessAdmin') // lang.AccessAdmin
    },
    {
        value: 0,
        name: $translate('customMessage.AccessDisable') // lang.AccessDisable
    }
    ];

    // 角色下拉清單選項
    vm.optRole = [{
        value: 'doctor',
        name: $translate('user.component.role1') // 醫師
    },
    {
        value: 'nurse',
        name: $translate('user.component.role2') // 護理師
    },
    {
        value: 'other',
        name: $translate('user.component.role3') // 其他
    }
    ];

    vm.back = function () {
        history.go(-1);
    };

    vm.addUser = function () {
        addUserDialog();
    };

    function addUserDialog() {
        $mdDialog.show({
            controller: addUserDialogController,
            controllerAs: '$ctrl',
            template: addUserDialogTpl,
            clickOutsideToClose: true
        }).then((result) => {
            vm.formData.Account = result.USER_ID;
            vm.formData.Name = result.USER_NAME;
            vm.formData.EmployeeId = result.USER_ID;
            vm.formData.Identifier = result.ID_NO;
            vm.formData.License = result.DR_LICENSE;
            // 判斷從HIS接過來的角色
            if (result.TYPE_SW == '1') {
                vm.formData.Role = 'doctor';
            } else if (result.TYPE_SW == '2') {
                vm.formData.Role = 'nurse';
            } else {
                vm.formData.Role = 'other';
            }

            // 判斷從HIS接過來的狀態
            if (result.STOP_FLAG == 'Y') {
                vm.formData.Access = 0;
            } else if (result.STOP_FLAG == 'N') {
                vm.formData.Access = 1;
            }
        });

        function addUserDialogController() {
            const self = this;

            setTimeout(() => {
                document.getElementById("addUser").focus();
            }, 0);
            self.getFocus = function () {
                vm.focus = true;
            };

            self.cancel = function () {
                $mdDialog.cancel();
            };
            self.ok = function () {
                vm.downloading = true;
                let addHISUser = {};
                tpechService.getUser(self.userId).then((res) => {
                    console.log('ddd', res.data);
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        addHISUser = res.data[0];
                        $mdDialog.hide(addHISUser);
                    } else {
                        showMessage('查無此人');
                    }
                }, (err) => {
                    showMessage(`取得資料失敗:${err}`);
                }).finally(() => {
                    vm.downloading = false;
                });
            };
        }
    }
}

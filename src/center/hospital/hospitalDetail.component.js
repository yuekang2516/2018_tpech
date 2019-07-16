import tpl from './hospitalDetail.html';

angular.module('app').component('hospitalDetail', {
    template: tpl,
    controller: hospitalDetailCtrl,
    controllerAs: 'vm'
});

hospitalDetailCtrl.$inject = ['$mdSidenav', '$state', '$stateParams', '$sessionStorage', 'hospitalService', 'showMessage', '$timeout', 'Upload'];

function hospitalDetailCtrl($mdSidenav, $state, $stateParams, $sessionStorage, hospitalService, showMessage, $timeout, Upload) {
    const vm = this;
    vm.readonly = false;
    vm.editMode = false;
    vm.loadingPicture = false;
    // vm.selectedIndex = 0; // tab 上選取的 index (zero based)

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.newHospitalMods = ['dialysis', 'respiration', 'vitalsign'];

    vm.ModuleFunctions = {};
    vm.ModuleFunctions['MachineType'] = '0';
    vm.ModuleFunctions['BloodTransfusion'] = '0';
    vm.ModuleFunctions['Charge'] = '0';
    vm.ModuleFunctions['Scheduling'] = '0';
    vm.ModuleFunctions['SettingBed'] = '0';
    vm.ModuleFunctions['ElectronicBoard'] = '0';
    vm.ModuleFunctions['Epo'] = '0';
    vm.ModuleFunctions['Assessment'] = '0';
    vm.ModuleFunctions['BloodPressure'] = '0';
    vm.ModuleFunctions['HealthEducation'] = '0';
    vm.ModuleFunctions['ROAlert'] = '0';
    vm.ModuleFunctions['PatientYearPlan'] = '0';
    vm.MachineType = false;
    vm.BloodTransfusion = false;
    vm.Charge = false;
    vm.Scheduling = false;
    vm.SettingBed = false;
    vm.ElectronicBoard = false;
    vm.Epo = false;
    vm.Assessment = false;
    vm.BloodPressure = false;
    vm.HealthEducation = false;
    vm.ROAlert = false;
    vm.PatientYearPlan = false;

    // 初始載入區
    vm.$onInit = function onInit() {
        // // 更改讀取狀態
        vm.loading = true;
        // 先初始化一個空物件
        vm.formData = {};
        vm.HostName = '';
        // 依照$stateParams.id判斷是新增還是編輯使用者
        if ($stateParams.id === 'create') {
            vm.type = 'create';
            vm.editMode = false;
            vm.loading = false;
        } else {
            vm.type = 'edit';
            vm.editMode = true;
            // 取醫院資訊
            hospitalService.getById($stateParams.id).then((resp) => {
                vm.formData = angular.copy(resp.data);
                if (resp.data.ModuleFunctions) {
                    vm.ModuleFunctions = resp.data.ModuleFunctions;

                    vm.MachineType = vm.ModuleFunctions['MachineType'] === '1' ? true : false;
                    vm.BloodTransfusion = vm.ModuleFunctions['BloodTransfusion'] === '1' ? true : false;
                    vm.Charge = vm.ModuleFunctions['Charge'] === '1' ? true : false;
                    vm.Scheduling = vm.ModuleFunctions['Scheduling'] === '1' ? true : false;
                    vm.SettingBed = vm.ModuleFunctions['SettingBed'] === '1' ? true : false;
                    vm.ElectronicBoard = vm.ModuleFunctions['ElectronicBoard'] === '1' ? true : false;
                    vm.Epo = vm.ModuleFunctions['Epo'] === '1' ? true : false;
                    vm.Assessment = vm.ModuleFunctions['Assessment'] === '1' ? true : false;
                    vm.BloodPressure = vm.ModuleFunctions['BloodPressure'] === '1' ? true : false;
                    vm.HealthEducation = vm.ModuleFunctions['HealthEducation'] === '1' ? true : false;
                    vm.ROAlert = vm.ModuleFunctions['ROAlert'] === '1' ? true : false;
                    vm.PatientYearPlan = vm.ModuleFunctions['PatientYearPlan'] === '1' ? true : false;
                }
                vm.HostName = vm.formData.HostName.join('\n');
                // 如果有找到相同的醫院模組 就刪掉(不顯示)
                _.forEach(vm.formData.Modules, (Module) => {
                    const index = vm.newHospitalMods.indexOf(Module);
                    if (index > -1) {
                        vm.newHospitalMods.splice(index, 1);
                    }
                });
                console.log(vm.formData);
                if (vm.formData.Modules != null) {
                // vm.moduleChips = Object.values(vm.formData.Modules);
                vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
                    return vm.formData.Modules[key];
                });
                }
                if (vm.formData.Type1 === '1') {
                    vm.Type1 = true;
                } else {
                    vm.Type1 = false;
                }

                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                vm.loading = false;
                vm.isError = true;
                // showMessage(lang.ServerError);
            });
        }

        switch ($state.current.name) {
            case 'contractList':
                vm.selectedIndex = 0;
                break;
            case 'paymentList':
                vm.selectedIndex = 1;
                break;
            default:
                break;
        }
    };

    let previousSelectedIndex;
    vm.$doCheck = function () {
        let currentSelectedIndex = vm.selectedIndex && vm.selectedIndex.valueOf();
        if (previousSelectedIndex !== currentSelectedIndex) {

            switch (currentSelectedIndex) {
                case 0:
                    vm.goto('contractList');
                    break;
                case 1:
                    vm.goto('paymentList');
                    break;
                default:
            }
            previousSelectedIndex = currentSelectedIndex;
        }
    };

    vm.goto = function goto(routeName) {
        $state.go(routeName, { hospitalId: $stateParams.id }, { location: 'replace' });
    };

    // 新增模組動作
    vm.addModule = function addModule(data) {
        // 初始化模組陣列
        if (!vm.formData.Modules) vm.formData.Modules = [];
        // 檢查如果不是傳進來一個空白 就新增到陣列中
        if (data !== '') {
            vm.formData.Modules.push(data);
            vm.newHospitalMods.splice(vm.newHospitalMods.indexOf(data), 1);
        }
        // vm.moduleChips = Object.values(vm.formData.Modules);
        vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
            return vm.formData.Modules[key];
        });
};

    // 移除模組動作
    vm.removeModule = function removeModule(idx) {
        // 將移除的模組 push 回原陣列
        vm.newHospitalMods.push(vm.formData.Modules[idx]);
        vm.selectedModule = '';
        vm.formData.Modules.splice(vm.formData.Modules.indexOf(vm.formData.Modules[idx]), 1);
        // vm.moduleChips = Object.values(vm.formData.Modules);
        vm.moduleChips = Object.keys(vm.formData.Modules).map((key) => {
            return vm.formData.Modules[key];
        });
};

    // 儲存編輯資料
    vm.save = function save() {
        vm.isSaving = true;
        vm.ModuleFunctions['MachineType'] = vm.MachineType === true ? '1' : '0';
        vm.ModuleFunctions['BloodTransfusion'] = vm.BloodTransfusion === true ? '1' : '0';
        vm.ModuleFunctions['Charge'] = vm.Charge === true ? '1' : '0';
        vm.ModuleFunctions['Scheduling'] = vm.Scheduling === true ? '1' : '0';
        vm.ModuleFunctions['SettingBed'] = vm.SettingBed === true ? '1' : '0';
        vm.ModuleFunctions['ElectronicBoard'] = vm.ElectronicBoard === true ? '1' : '0';
        vm.ModuleFunctions['Epo'] = vm.Epo === true ? '1' : '0';
        vm.ModuleFunctions['Assessment'] = vm.Assessment === true ? '1' : '0';
        vm.ModuleFunctions['BloodPressure'] = vm.BloodPressure === true ? '1' : '0';
        vm.ModuleFunctions['HealthEducation'] = vm.HealthEducation === true ? '1' : '0';
        vm.ModuleFunctions['ROAlert'] = vm.ROAlert === true ? '1' : '0';
        vm.ModuleFunctions['PatientYearPlan'] = vm.PatientYearPlan === true ? '1' : '0';

        // if (vm.Type1 === true) {
        //     vm.formData.Type1 = '1';
        // } else {
        //     vm.formData.Type1 = '0';
        // }

        vm.formData.HostName = vm.HostName.split('\n').filter((value) => { return value.trim() !== ''; });
        vm.formData.ModuleFunctions = vm.ModuleFunctions;
        console.log(vm.formData);
        if ($stateParams.id === 'create') {
            // 新增醫院 : post
            hospitalService.post(vm.formData).then(() => {
                showMessage(lang.DataAddedSuccessfully);
                vm.isSaving = false;
                $state.go('hospital', {}, {
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
            // 儲存醫院 : put
            hospitalService.put(vm.formData).then(() => {
                showMessage(lang.Datasuccessfully);
                vm.isSaving = false;
                $state.go('hospital', {}, {
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

    // photo to base64
    vm.handleChangeBase64 = function handleChangeBase64() {
        console.log('here');
        $timeout(() => {
            vm.loadingPicture = true;
        });
        if (vm.formData.Logo) {
            // Upload.base64DataUrl(vm.formData.Logo).then((z) => {
            //     console.log('z here:', z);
            //     vm.formData.Logo = z;
            //     vm.loadingPicture = false;
            // });

            Upload.imageDimensions(vm.formData.Logo).then((y) => {
                // console.log('y here:', y);
                let size;
                if (y.width > 200 || y.height > 200) {
                    if (y.width > y.height) {
                        size = {
                            width: '200'
                        };
                    } else {
                        size = {
                            height: '200'
                        };
                    }
                    Upload.resize(vm.formData.Logo, size).then((f) => {
                        Upload.base64DataUrl(f).then((x) => {
                            vm.formData.Logo = x;
                            vm.loadingPicture = false;
                        });
                    });
                } else {
                    Upload.base64DataUrl(vm.formData.Logo).then((x) => {
                        // console.log('x here:', x);
                        vm.formData.Logo = x;
                        vm.loadingPicture = false;
                    });
                }
            });
        }
    };

    // 回醫院列表
    vm.back = function () {
        history.go(-1);
    };
}

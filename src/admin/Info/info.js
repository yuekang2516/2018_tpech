import tpl from './info.html';

angular.module('app').component('info', {
    template: tpl,
    controller: SystemInfoCtrl,
    controllerAs: 'vm'
});

SystemInfoCtrl.$inject = ['$mdSidenav', '$mdDialog', 'infoService', 'showMessage', '$filter'];

function SystemInfoCtrl($mdSidenav, $mdDialog, infoService, showMessage, $filter) {
    const vm = this;
    let orialItem = '';

    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.loading = true;

    // 取得自訂項目資料
    vm.loadInfo = function loadInfo() {
        // 讀取資訊
        infoService.get().then((resp) => {
            console.log(resp);
            vm.hospital = resp.data;
            if (resp.data.DialysisSetting) {
                vm.hospitalSetting = angular.copy(resp.data.DialysisSetting.Records);
                // 資料讀取出來後就先進行分行動作，之後回寫時要進行合併回array動作
                if (vm.hospitalSetting !== null) {
                    _.forEach(vm.category, (value) => {
                        vm.hospitalSetting[value.key] = vm.hospitalSetting[value.key].join('\n');
                    });
                    _.forEach(vm.category3, (value) => {
                        vm.hospitalSetting[value.key] = vm.hospitalSetting[value.key].join('\n');
                    });
                }
            } else {
                vm.hospitalSetting = null;
                vm.hospital.DialysisSetting = {};
                vm.hospital.DialysisSetting.Module = "DialysisSetting"; // Module 一定要放最前面，避免後端無法辨識
                vm.hospital.DialysisSetting.Records = {};
            }
            if (resp.data.BloodSetting) {
                vm.bloodSetting = resp.data.BloodSetting.Records;
            } else {
                vm.bloodSetting = null;
            }
            if (resp.data.DeathReasonSetting && resp.data.DeathReasonSetting.Records && resp.data.DeathReasonSetting.Records.Items) {
                vm.DeathReasonSetting = angular.copy(resp.data.DeathReasonSetting.Records.Items).join('\n');
            } else {
                vm.DeathReasonSetting = "";
                vm.hospital.DeathReasonSetting = {};
                vm.hospital.DeathReasonSetting.Module = "DeathReasonSetting";
                vm.hospital.DeathReasonSetting.Records = {};
                //vm.hospital.DeathReasonSetting.Records.Items = []; 
            }
            if (resp.data.DefinitionSetting) {
            } else {
                // 空/null資料時, 先建一個"班別"??
                let createdef = {
                    "Module": 'DefinitionSetting',
                    "Records": {
                        //"_t" : "DefinitionSetting",
                        "Categories" : {
                           "Shifts" : []
                        }
                    }
                };
                vm.hospital.DefinitionSetting = createdef;
                console.log(vm.hospital);
            }
            vm.defSetting = angular.copy(resp.data.DefinitionSetting.Records.Categories);
            console.log(vm.defSetting);
            // 資料讀取出來後就先進行分行動作，之後回寫時要進行合併回array動作
            if (vm.defSetting !== null) {
                _.forEach(vm.defSetting, function (value, name) {
                    vm.defSetting[name] = vm.defSetting[name].join('\n');
                });
            }
            // 自訂項目給預設選項
            orialItem = '';
            vm.selfitem = 'Shifts';
            vm.selfitemChange(vm.selfitem);
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.DataReadFailure')); // lang.DataReadFailure
        });
    };

    // 初始化頁面
    vm.$onInit = function onInit() {
        // 設定類型
        vm.category = [
            {
                key: 'Anticoagulants',
                name: $translate('info.component.anticoagulants') // '抗凝劑'
            },
            {
                key: 'ArtificialKidneys',
                name: $translate('info.component.artificialKidneys') // '人工腎臟'
            },
            {
                key: 'DialysateFlowRates',
                name: $translate('info.component.dialysateFlowRates') // '透析液流速'
            },
            {
                key: 'Dialysates',
                name: $translate('info.component.dialysates') // '透析液'
            },
            {
                key: 'Frequencies',
                name: $translate('info.component.frequencies') // '頻率'
            },
            {
                key: 'NeedleArteries',
                name: $translate('info.component.needleArteries') // '針動脈'
            },
            {
                key: 'NeedleVeins',
                name: $translate('info.component.needleVeins') // '針靜脈'
            },
            {
                key: 'PrescriptionModes',
                name: $translate('info.component.prescriptionModes') // '處方Mode'
            },
            {
                key: 'Routes',
                name: $translate('info.component.routes') // '管路'
            }
        ];

        vm.category3 = [
            {
                key: 'CatheterHospitals',
                name: $translate('info.component.catheterHospitals') // '造管醫院'
            }
        ];

        vm.category2 = [
            {
                key: 'Shifts',
                name: $translate('info.component.shifts') // '排班班別'
            },
            {
                key: 'ShiftGroups',
                name: $translate('info.component.shiftGroups') // '排班組別'
            },
            {
                key: 'BloodCollection',
                name: $translate('info.component.bloodCollection') // '採血品項'
            },
            {
                key: 'EndHollowFiber',
                name: $translate('info.component.EndHollowFiber') // '結束 Hollow Fiber'
            },
            {
                key: 'EndChamber',
                name: $translate('info.component.EndChamber') // '結束 Chamber'
            },
            {
                key: 'MedicineLiquidKindCAPD',
                name: "腹膜透析藥水-CAPD" // 藥水種類
            },
            {
                key: 'MedicineLiquidKindAPD',
                name: "腹膜透析藥水-APD" // 藥水種類
            },
            {
                key: 'PdKind',
                name: "腹膜透析類別" // 腹膜透析類別
            },
            {
                key: 'PdLESys',
                name: "換液系統" // 換液系統
            },
            {
                key: 'PdWaterSys',
                name: "透析液系統" // 透析液系統
            },
            {
                key: 'PdGlucose',
                name: "葡萄糖濃度" // 葡萄糖濃度
            },
            {
                key: 'PdAminoacid',
                name: "胺基酸濃度" // 胺基酸濃度
            },
            {
                key: 'PdIcodextrin',
                name: "Icodextrin" // Icodextrin
            },
            {
                key: 'PdCalcium',
                name: "鈣離子濃度" // 鈣離子濃度
            },
            {
                key: 'PdBagNum',
                name: "每日袋數" // 每日袋數
            },
            {
                key: 'PdInjectNum',
                name: "注入量" // 注入量
            }
        ];

        // 載入資料程式段獨立出來, 讓"取消"鈕可以呼叫
        vm.loadInfo();
    };

    // 新增血品設定
    vm.addBloodSetting = function addBloodSetting(key, name) {
        vm.bloodSettingKey = null;
        vm.bloodSettingName = null;
        if (vm.bloodSetting === null) {
            vm.bloodSetting = {};
            vm.bloodSetting.PlasmaComponents = {};
            vm.bloodSetting.Module = "BloodSetting";
        }

        vm.bloodSetting.PlasmaComponents[key] = name;
    };

    // 刪除血品設定 , 顯示刪除確認對話視窗
    vm.removeBloodSetting = function removeBloodSetting(ev, key, value) {
        const confirm = $mdDialog.confirm()
            .title($translate('info.component.confirmDelete')) // '刪除確認'
            .textContent($translate('info.component.textContent', { bloodName: value })) // `您即將刪除血品設定:${value}，點擊確認後將會刪除此血品設定項目!`
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('info.component.deleteOk')) // '刪除'
            .cancel($translate('info.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            delete vm.bloodSetting.PlasmaComponents[key];
            $mdDialog.hide();
        }, () => {
            $mdDialog.hide();
        });
    };

    // 儲存自訂項目
    vm.edit = function edit() {
        vm.isSaving = true;
        // 存檔前組合回array
        if (vm.hospitalSetting !== null) {
            _.forEach(vm.category, (value) => {
                vm.hospital.DialysisSetting.Records[value.key] = _.split(vm.hospitalSetting[value.key], '\n');
            });
            _.forEach(vm.category3, (value) => {
                vm.hospital.DialysisSetting.Records[value.key] = _.split(vm.hospitalSetting[value.key], '\n');
            });
        }
        let DeathReason = vm.DeathReasonSetting.split('\n').filter((value) => { return value.trim() !== ''; });
        vm.hospital.DeathReasonSetting.Records.Items = DeathReason;

        if (vm.hospital.BloodSetting === null) {
            vm.hospital.BloodSetting = {};
            vm.hospital.BloodSetting.Module = "BloodSetting";
            if (vm.bloodSetting !== null) {
                vm.hospital.BloodSetting = vm.bloodSetting;
            } else {
                vm.hospital.BloodSetting.Records = {};
            }
        }
        
        // 目前畫面上的 data 也要存進去
        vm.defSetting[orialItem] = vm.selfdata;
        // 存檔前組合回array
        if (vm.defSetting !== null) {
            _.forEach(vm.defSetting, function (value, name) {
                vm.hospital.DefinitionSetting.Records.Categories[name] = _.split(vm.defSetting[name], '\n');
            });
        }
        console.log(vm.hospital);
        infoService.put(vm.hospital)
            .then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
    };

    vm.selfitemChange = function selfitemChange(idx1) {
        // console.log(idx1);
        // console.log(vm.defSetting[idx1]);
        if (orialItem !== idx1) {
            // console.log('idx1 = ' + idx1);
            // console.log('orialItem = ' + orialItem);
            // 先做資料儲存
            // console.log(vm.selfdata);
            if (orialItem !== '') {
                vm.defSetting[orialItem] = vm.selfdata;
            }
            // 再變更orialItem值
            orialItem = idx1;
            // 變更畫面呈現
            _.forEach(vm.category2, (value) => {
                // console.log(value.key);
                // console.log(value.name);
                if (value.key === idx1) {
                    vm.selfname = value.name;
                }
            });
            vm.selfdata = vm.defSetting[idx1];
        }
    };

    // 復原自訂項目
    vm.recover = function recover() {
        vm.isSaving = true;
        // 取得自訂項目資料
        vm.loadInfo();
        showMessage($translate('info.component.recoverSuccess')); // '恢復自訂項目資料成功'
        vm.isSaving = false;
    };
}

import tpl from './wardDetail.html';

angular.module('app').component('wardDetail', {
    template: tpl,
    controller: wardDetailCtrl,
    controllerAs: 'vm'
});

wardDetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'wardService', 'showMessage', '$filter']; // , 'infoService'

function wardDetailCtrl($state, $stateParams, $mdDialog, wardService, showMessage, $filter) { // , infoService
    const vm = this;
    let $translate = $filter('translate');

    // 透析室群組下拉清單選項
    // vm.optAccess = ['一般', 'B肝', 'C肝', 'B+C肝', 'HIV', '感染', '其他'];
    //vm.optAccess = [$translate('ward.component.opt1'), $translate('ward.component.opt2'), $translate('ward.component.opt3'), $translate('ward.component.opt4'), $translate('ward.component.opt5'), $translate('ward.component.opt6'), $translate('ward.component.opt7')];
    vm.optAccess = [$translate('ward.component.opt1'), $translate('ward.component.opt2'), $translate('ward.component.opt3'), $translate('ward.component.opt4')];
    vm.optAccessBed = [];
    let AccessBeds = [];
    let TAccessBeds = [];

    // 初始化頁面時載入透析室資料
    vm.$onInit = function onInit() {
        // 設定上方title
        if ($stateParams.id === 'create') {
            vm.type = 'create';
        } else {
            vm.type = 'edit';
        }
        vm.Ward = {};
        vm.Ward.AbnormalItems = [];
        vm.Ward.BedGroups = [];
        vm.Ward.BedNos = [];
        vm.count = 0;
        vm.showCreateAbnormalItem = false;
        vm.editMode = false;
        // 依照$stateParams.id判斷是新增還是修改
        if ($stateParams.id === 'create') {
            // 設定標題
            vm.editMode = false;
            vm.loading = false;
            // vm.BedNoArray = [];
            // 取得透析室範本
            wardService.get().then((ward) => {
                vm.WardTemplete = angular.copy(ward.data);
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                vm.isError = true;
                showMessage($translate('customMessage.serverError')); // lang.ServerError
            });
        } else {
            vm.editMode = true;
            vm.loading = true;
            // 載入透析室資料程式段獨立出來, 讓"取消"鈕可以呼叫
            // vm.loadInfo();
            vm.loadWard();
        }
    };

    // // 取得設定資料
    // vm.loadInfo = function loadInfo() {
    //     // 讀取資訊
    //     infoService.get().then((resp1) => {
    //         vm.info = resp1.data.DefinitionSetting.Records.Categories;
    //         console.log('vm.info:', vm.info);
    //         // // 消防群組下拉清單選項
    //         // vm.fireAccess = vm.info.FireGroups;
    //         // // 排班組別下拉清單選項
    //         // vm.shiftAccess = vm.info.ShiftGroups;
    //     });
    // };

    // 取得透析室資料
    vm.loadWard = function loadWard() {
        // 取得透析室範本後對透析室資料顯示先行處理
        wardService.getById($stateParams.id).then((resp) => {
            // 床號 array -> string
            vm.Ward = resp.data;
            console.log('vm.Ward:', vm.Ward);
            vm.bedsChange(); // 更新病床清單

            // vm.BedNoArray = resp.data.BedNos;
            // vm.BedNos = resp.data.BedNos.join('\n');
            // 透析室異常項目顯示
            _.forEach(vm.Ward.AbnormalItems, (item) => {
                item.editMode = false;
                _.forEach(vm.Ward.AbnormalItems, (subitem) => {
                    if (item.Id === subitem.ParentId) {
                        subitem.ParentName = item.Name;
                    }
                });
            });
            // // 留存原始透析室資料，按取消時可從此資料復原
            // vm.TempWard = angular.copy(vm.Ward);
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    // 刪掉一個床
    vm.bedsDel = function bedsDel(index) {
        console.log('delete index:', index);
        console.log(TAccessBeds[index + 1]);
        if (vm.Ward.BedGroups !== undefined && vm.Ward.BedGroups !== null) {
            vm.Ward.BedGroups.forEach((x) => {
                if (x.BedNos.indexOf(TAccessBeds[index + 1]) > -1) {
                    x.BedNos.splice(x.BedNos.indexOf(TAccessBeds[index + 1]), 1);
                }
            });
        }
        // if (vm.Ward.FireControlGroups !== undefined && vm.Ward.FireControlGroups !== null) {
        //     vm.Ward.FireControlGroups.forEach((x) => {
        //         if (x.BedNos.indexOf(TAccessBeds[index + 1]) > -1) {
        //             x.BedNos.splice(x.BedNos.indexOf(TAccessBeds[index + 1]), 1);
        //         }
        //     });
        // }
        // if (vm.Ward.AssignShiftGroups !== undefined && vm.Ward.AssignShiftGroups !== null) {
        //     vm.Ward.AssignShiftGroups.forEach((x) => {
        //         if (x.BedNos.indexOf(TAccessBeds[index + 1]) > -1) {
        //             x.BedNos.splice(x.BedNos.indexOf(TAccessBeds[index + 1]), 1);
        //         }
        //     });
        // }
        vm.bedsChange();
    };

    // 更新病床清單
    vm.bedsChange = function bedsChange() {
        TAccessBeds = []; // 為了讓透析室下拉式選項第一個是空白
        TAccessBeds.push('');
        vm.Ward.BedNos.forEach((x) => {
            TAccessBeds.push(x);
        });
        vm.itemChange('');
    };

    // 新增病床群組
    vm.addgroupitem = function addgroupitem() {
        if (vm.Ward.BedGroups === undefined || vm.Ward.BedGroups === null) {
            vm.Ward.BedGroups = [];
        }
        let BedGroupsItem = {
            Name: '',
            BedNos: []
            };
            vm.Ward.BedGroups.push(BedGroupsItem);
    };

    // 刪除病床群組 , 顯示刪除確認對話視窗
    vm.removegroupitem = function removegroupitem(ev, item, kind) {
      const confirm = $mdDialog.confirm()
        .title($translate('ward.component.confirmDelete')) // '刪除確認'
        .textContent($translate('ward.component.textContent', { name: item.Name })) // `您即將刪除病床群組:${item.Name}，點擊確認後將會刪除此病床群組內容!`
        .ariaLabel('delete confirm')
        .targetEvent(ev)
        .ok($translate('ward.component.deleteOk')) // '刪除'
        .cancel($translate('ward.component.deleteCancel')); // '取消'

      $mdDialog.show(confirm).then(() => {
        // vm.delete();
        if (kind === 'Bed') {
            vm.Ward.BedGroups.splice(vm.Ward.BedGroups.indexOf(item), 1);
            vm.itemChange('Bed');
        // } else if (kind === 'Fire') {
        //     vm.Ward.FireControlGroups.splice(vm.Ward.FireControlGroups.indexOf(item), 1);
        //     vm.itemChange('Fire');
        // } else {
        //     vm.Ward.AssignShiftGroups.splice(vm.Ward.AssignShiftGroups.indexOf(item), 1);
        //     vm.itemChange('Shift');
        }
        $mdDialog.hide();
      }, () => {
        $mdDialog.hide();
      });
    };

    // 調整待選病床選單內容
    vm.itemChange = function itemChange(kind) {
        if (kind === 'Bed' || kind === '') {
            AccessBeds = angular.copy(TAccessBeds);
            // AccessBeds.push('');
            if (vm.Ward.BedGroups !== undefined && vm.Ward.BedGroups !== null) {
                vm.Ward.BedGroups.forEach((x) => {
                    x.BedNos.forEach((x1) => {
                        AccessBeds.splice(AccessBeds.indexOf(x1), 1);
                    });
                });
            }
            vm.optAccessBed = angular.copy(AccessBeds);
        }
        // if (kind === 'Fire' || kind === '') {
        //     AccessBeds = angular.copy(TAccessBeds); // vm.Ward.BedNos
        //     // AccessBeds.push('');
        //     if (vm.Ward.FireControlGroups !== undefined && vm.Ward.FireControlGroups !== null) {
        //         vm.Ward.FireControlGroups.forEach((x) => {
        //             x.BedNos.forEach((x1) => {
        //                 AccessBeds.splice(AccessBeds.indexOf(x1), 1);
        //             });
        //         });
        //     }
        //     vm.fireAccessBed = angular.copy(AccessBeds);
        // }
        // if (kind === 'Shift' || kind === '') {
        //     AccessBeds = angular.copy(TAccessBeds); // vm.Ward.BedNos
        //     // AccessBeds.push('');
        //     if (vm.Ward.AssignShiftGroups !== undefined && vm.Ward.AssignShiftGroups !== null) {
        //         vm.Ward.AssignShiftGroups.forEach((x) => {
        //             x.BedNos.forEach((x1) => {
        //                 AccessBeds.splice(AccessBeds.indexOf(x1), 1);
        //             });
        //         });
        //     }
        //     vm.shiftAccesseBed = angular.copy(AccessBeds);
        // }
    };

    // 群組加入病床
    vm.addbed = function addbed(kind, index, selectIndex) {
        let test = document.getElementById(selectIndex).value;
        console.log('addbed', test);
        if (test !== '') {
            if (kind === 'Bed') {
                vm.Ward.BedGroups[index].BedNos.push(test);
                vm.itemChange('Bed');
            // } else if (kind === 'Fire') {
            //     vm.Ward.FireControlGroups[index].BedNos.push(test);
            //     vm.itemChange('Fire');
            // } else {
            //     vm.Ward.AssignShiftGroups[index].BedNos.push(test);
            //     vm.itemChange('Shift');
            }
        }
    };

    // 改變異常項目類別
    vm.selectItem = function selectItem(item) {
        if (item !== null) {
            vm.selectedParentId = item.Id;
            vm.selectedParentName = item.Name;
        } else {
            vm.selectedParentId = '';
            vm.selectedParentName = '';
        }
    };

    // 套用範本
    vm.changeTemplet = (ward) => {
        const selectAbnormalItems = JSON.parse(ward);

        // 複製一份範本資料到目前的異常項目
        if (selectAbnormalItems !== null) {
            vm.Ward.AbnormalItems = angular.copy(selectAbnormalItems.AbnormalItems);

            _.forEach(vm.Ward.AbnormalItems, (item) => {
                item.editMode = false;
                _.forEach(vm.Ward.AbnormalItems, (subitem) => {
                    if (item.Id === subitem.ParentId) {
                        subitem.ParentName = item.Name;
                    }
                });
            });
        } else {
            vm.Ward.AbnormalItems = [];
        }
    };

    // 儲存透析室
    vm.save = function save(Ward) { // , BedNos
        vm.isSaving = true;
        if (Ward.Name == null) {
            showMessage($translate('customMessage.WardNameUnfilled')); // lang.WardNameUnfilled
            vm.isSaving = false;
            return;
        }
        // // 把床號從 string 組合回 array
        // const BedNosList = [];
        // if (BedNos !== undefined) {
        //    BedNos.split('\n').forEach((item) => {
        //        if (item.trim() !== '') {
        //            BedNosList.push(item.trim());
        //        }
        //    });
        // }

        // 先排除空群繧, 再塞回透析室群組資料
        let ChkBedGroups = [];
        _.forEach(vm.Ward.BedGroups, (item) => {
            if (!(item.Name === '' || item.Name === null || item.Name === undefined) || !(item.BedNos === undefined || item.BedNos.length === 0)) {
                ChkBedGroups.push(item);
            }
        });
        vm.Ward.BedGroups = ChkBedGroups;

        // 20190328
        // let BedNosx = [];
        // let NameChk = false;
        // _.forEach(vm.Ward.BedGroups, (item) => {
        //     // 檢查群組名稱
        //     if (item.Name === '' || item.Name === null || item.Name === undefined || item.Name === '--請選擇--') {
        //         showMessage($translate('ward.component.groupNameEmpty')); // '透析室群組名稱不可空白'
        //         vm.isSaving = false;
        //         NameChk = true; // 為了中斷透析室儲存動作
        //         return;
        //     }
        //     // 把群組透析室的病床組成原病床的字串 BedNos
        //     if (item.BedNos !== []) {
        //         _.forEach(item.BedNos, (bed) => {
        //             BedNosx.push(bed);
        //         });
        //     }
        // });
        // // 資料不完整, 中斷透析室儲存動作
        // if (NameChk === true) {
        //     vm.isSaving = false;
        //     return;
        // }

        // // Ward.BedNos = BedNosList;
        // // Ward.BedNos = vm.BedNoArray;
        // Ward.BedNos = BedNosx;
        Ward.type = 'ward';
        console.log('Save Ward:', Ward);
        if ($stateParams.id === 'create') {
            // 新增透析室
            wardService.post(Ward).then((data) => {
                // 已有相同透析室名稱的訊息顯示，如果成功寫入則回到透析室列表
                if (data === $translate('customMessage.WardNameRepeat')) {
                    showMessage($translate('customMessage.WardNameRepeat')); // lang.WardNameRepeat
                    vm.isSaving = false;
                } else {
                    showMessage($translate('customMessage.DataAddedSuccessfully')); // lang.DataAddedSuccessfully
                    vm.isSaving = false;
                    $state.go('ward', {}, {
                        reload: true
                    });
                }
            }, () => {
                showMessage($translate('customMessage.DataAddedFail')); // lang.DataAddedFail
                vm.isSaving = false;
            });
        } else {
            // 修改透析室
            wardService.put(Ward).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('ward', {}, {
                    reload: true
                });
            }, () => {
                showMessage($translate('customMessage.EditFail')); // lang.EditFail
                vm.isSaving = false;
            });
        }
    };

    // 復原透析室
    vm.recover = function recover() {
        vm.isSaving = true;
        // 取得透析室資料
        vm.loadWard();
        // // 從原先的暫存透析室複製一份回現在透析室
        // vm.Ward = angular.copy(vm.TempWard);
        // //vm.BedNos = vm.Ward.BedNos.join('\n');
        // vm.BedNoArray = vm.Ward.BedNos;
        showMessage($translate('customMessage.RevertDataSuccess')); // lang.RecoveryWardDataSuccessfully
        vm.isSaving = false;
    };

    // 新增異常項目
    vm.createAbnormalItem = function createAbnormalItem(selectedParentId) {
        vm.count += 1;

        if (vm.item == null || vm.item === '' || vm.item === 'undefined') {
            // 新增父類別
            if (vm.itemCodeKeyIn != null && vm.itemKeyIn != null) {
                vm.abnormalItem = {
                    // Id: vm.count,
                    Name: vm.itemKeyIn,
                    Code: vm.itemCodeKeyIn,
                    ParentId: null,
                    editMode: false
                };

                vm.Ward.AbnormalItems.push(vm.abnormalItem);
                vm.itemCodeKeyIn = null;
                vm.itemKeyIn = null;
            }
        } else if (vm.subItemCodeKeyIn != null && vm.subItemKeyIn != null) {
            if (selectedParentId === undefined) {
                selectedParentId = vm.selectedParentName;
            }
            // 新增子類別
            vm.abnormalItem = {
                // Id: vm.count,
                Name: vm.subItemKeyIn,
                Code: vm.subItemCodeKeyIn,
                ParentId: selectedParentId,
                ParentName: vm.selectedParentName,
                editMode: false
            };

            vm.Ward.AbnormalItems.push(vm.abnormalItem);
            vm.subItemCodeKeyIn = null;
            vm.subItemKeyIn = null;
            vm.item = null;
        }

        // 取消新增模式
        vm.showCreateAbnormalItem = false;
    };

    // 刪除異常項目 , 顯示刪除確認對話視窗
    vm.deleteAbnormalItem = function deleteAbnormalItem(ev, item) {
      const confirm = $mdDialog.confirm()
        .title($translate('ward.component.confirmDelete')) // '刪除確認'
        .textContent($translate('ward.component.errorContent', { name: item.Name })) // `您即將刪除異常項目:${item.Name}，點擊確認後將會刪除此異常項目內容!`
        .ariaLabel('delete confirm')
        .targetEvent(ev)
        .ok($translate('ward.component.deleteOk')) // '刪除'
        .cancel($translate('ward.component.deleteCancel')); // '取消'

      $mdDialog.show(confirm).then(() => {
        // vm.delete();
        // 刪除父類別且仍有子類別時，無法刪除
        if (item.ParentId == null && _.some(vm.Ward.AbnormalItems, {
                ParentId: item.Id
            })) {
            showMessage($translate('customMessage.SubcategoryHasDataCantDelete')); // lang.SubcategoryHasDataCantDelete
        } else {
            vm.Ward.AbnormalItems.splice(vm.Ward.AbnormalItems.indexOf(item), 1);
        }
        $mdDialog.hide();
      }, () => {
        $mdDialog.hide();
      });
    };
    // showConfirm
    vm.removeAbnormalItem = function removeAbnormalItem(item) {
    };

    // 儲存異常類別
    vm.saveAbnormalItem = function saveAbnormalItem(item, Code, Name) {
        item.Code = Code;
        item.Name = Name;
        item.editMode = false;
    };

    // 編輯異常類別
    vm.editAbnormalItem = function editAbnormalItem(item) {
        _.forEach(vm.Ward.AbnormalItems, (item2) => {
            item2.editMode = false;
        });

        item.editMode = true;
        vm.Code = item.Code;
        vm.Name = item.Name;
        vm.Parent = item.ParentName;
    };

    // 回透析室列表
    vm.back = function () {
        history.go(-1);
    };
}

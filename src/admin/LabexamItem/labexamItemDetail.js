const tpl = require('./labexamItemDetail.html');

angular.module('app').component('labexamItemDetail', {
    template: tpl,
    controller: SystemLabexamItemDetailCtrl,
    controllerAs: 'vm'
});

SystemLabexamItemDetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'labexamSettingService', 'showMessage', '$filter'];
function SystemLabexamItemDetailCtrl($state, $stateParams, $mdDialog, labexamSettingService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let idx;
    // 先初始化資料結構
    vm.formData = {};
    vm.loading = false;
    vm.labexam_id = $stateParams.id;

    // 用labexam_id決定標題
    if (vm.labexam_id === 'create') {
        vm.type = 'create';
    } else {
        vm.type = 'edit';
    }

    // 選單預設值
    if (vm.labexam_id !== 'create') {
        vm.loading = true;
        labexamSettingService.getById(vm.labexam_id).then((resp) => {
            vm.formData = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => { // resp
            vm.loading = false;
            vm.isError = true;
            // showMessage(resp.data);
        });
    } else {
        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息
    }

    // 性別下拉清單選項
    vm.optGender = [{
            value: 'O',
            name: $translate('customMessage.Common') // '通用'
        },
        {
            value: 'F',
            name: $translate('customMessage.Female') // lang.Female
        },
        {
            value: 'M',
            name: $translate('customMessage.Male') // lang.Male
        }
    ];

    // 存檔
    vm.save = function save() {
        vm.isSaving = true;
        const labexam = vm.formData;

        if (vm.labexam_id === 'create') {
            // 呼叫儲存的service
            labexamSettingService.post(labexam).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('labexamItem');
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
        } else {
            // 呼叫編輯的service
            labexamSettingService.put(labexam).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('labexamItem');
            }, (a) => {
                // console.log(a);
                // if (a.data === 'existed machine code') {
                //     showMessage('代碼欄資料重覆');
                // } else {
                    showMessage($translate('customMessage.DatasFailure') + ' ' + a.data); // lang.DatasFailure
                    vm.isSaving = false;
                // }
            });
        }
    };

    // 呼叫刪除對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title($translate('labexamItem.component.confirmDelete')) // '刪除檢驗檢查項目提示'
            .textContent($translate('labexamItem.component.textContent')) // '請問是否要刪除此筆檢驗檢查項目資料?'
            .ariaLabel($translate('labexamItem.component.confirmTitle')) // '刪除檢驗檢查項目'
            .targetEvent(ev)
            .ok($translate('labexamItem.component.deleteOk')) // '刪除'
            .cancel($translate('labexamItem.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            // 呼叫刪除的service
            labexamSettingService.delete(vm.labexam_id).then(() => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                vm.isSaving = false;
                $state.go('labexamItem');
            }, () => {
                showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
                vm.isSaving = false;
            });
        }, () => {
            vm.isSaving = false;
        });
    };

    vm.back = function () {
        history.go(-1);
    };
}

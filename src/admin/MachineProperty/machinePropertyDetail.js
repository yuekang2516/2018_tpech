const tpl = require('./machinePropertyDetail.html');

angular.module('app').component('machinePropertyDetail', {
    template: tpl,
    controller: SystemMachinePropertyDetailCtrl,
    controllerAs: 'vm'
});

SystemMachinePropertyDetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'machineService', 'showMessage', 'nfcService', '$filter'];
function SystemMachinePropertyDetailCtrl($state, $stateParams, $mdDialog, machineService, showMessage, nfcService, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let idx;
    // 先初始化資料結構
    vm.formData = {};
    vm.loading = false;
    vm.readonly = false;
    vm.machine_id = $stateParams.id;
    let readCardData = '';

    vm.$onInit = function () {
        if (cordova.platformId === 'browser') {
            vm.notNFC = true;
        } else {
            nfc.enabled(() => { vm.notNFC = false; }, () => { vm.notNFC = true; });
        }
        nfcService.listenNdef(_readNDEF);
        document.addEventListener('volumeupbutton', self.scanBarCode);
        document.addEventListener('volumedownbutton', self.scanBarCode);
    };

    // 用machine_id決定標題
    if (vm.machine_id === 'create') {
        vm.type = 'create';
    } else {
        vm.type = 'edit';
    }

    // 選單預設值
    if (vm.machine_id !== 'create') {
        vm.loading = true;
        machineService.getById(vm.machine_id).then((resp) => {
            vm.formData = resp.data;
            if (vm.formData.Status === 'Deleted') {
                vm.readonly = true;
            }
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

    // 存檔
    vm.save = function save() {
        vm.isSaving = true;
        const machine = vm.formData;
        if (vm.machine_id === 'create') {
            // 呼叫儲存的service
            machineService.post(machine).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('machineProperty');
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                vm.isSaving = false;
            });
        } else {
            // 呼叫編輯的service
            machineService.put(machine).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('machineProperty');
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
            .title($translate('property.component.confirmDelete')) // '刪除財產提示'
            .textContent($translate('property.component.textContent')) // '請問是否要刪除此筆財產資料?'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('property.component.deleteOk')) // '刪除'
            .cancel($translate('property.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            // 呼叫刪除的service
            machineService.delete(vm.machine_id).then(() => {
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
                vm.isSaving = false;
                $state.go('machineProperty');
            }, () => {
                showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
                vm.isSaving = false;
            });
        }, () => {
            vm.isSaving = false;
        });
    };

    vm.recover = function recover() {
        // 復原刪除的service
        vm.isSaving = true;
        vm.formData.Status = 'Normal';
        machineService.put(vm.formData).then(() => {
            vm.readonly = false;
            $state.reload();
            showMessage($translate('customMessage.RevertDataSuccess')); // lang.RevertDataSuccess
            vm.isSaving = false;
        }, (res) => {
            if (res.data !== undefined) {
                // showMessage(res.data);
            } else {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            }
            vm.isSaving = false;
        });
    };

    vm.write = function write(ev) {
        if (vm.formData.BluetoothNumber === '' || (vm.formData.Brand === '' && vm.formData.Model === '')) {
            showMessage($translate('property.component.writeCardMsg')); // '資料不齊全, 請確認"藍芽棒編號"與"洗腎機廠牌"或"洗腎機型號"的正確性.'
        } else if (readCardData !== '' && readCardData.includes('**')) {
            // 先判斷卡片是否有值(且含**)
            const confirm = $mdDialog.confirm()
            .title($translate('property.component.confirmWrite')) // '卡片寫入提示'
            .textContent($translate('property.component.textWriteContent'), { data: readCardData }) // '卡片已有資料 ' + readCardData + ', 是否確定覆蓋?'
            .ariaLabel($translate('property.component.writeTitle')) // '卡片寫入'
            .targetEvent(ev)
            .ok($translate('property.component.writeOk')) // '寫入'
            .cancel($translate('property.component.writeCancel')); // '取消'

            $mdDialog.show(confirm).then(() => {
                let str = checkBN(vm.formData.BluetoothNumber) + '**' + ((vm.formData.Model !== '') ? vm.formData.Model.trim() : vm.formData.Brand.trim());
                writeTag(str);
            });
        } else {
            let str = checkBN(vm.formData.BluetoothNumber) + '**' + ((vm.formData.Model !== '') ? vm.formData.Model.trim() : vm.formData.Brand.trim());
            writeTag(str);
        }
    };

    // nfcService 回傳物件 {Id:'', Data:'...'}
    function _readNDEF(ndef) {
        if (!ndef.Data) {
            readCardData = '';
        } else {
            readCardData = ndef.Data;
        }
    }

    // 寫入卡片時排除 : 與 - 符號
    function checkBN(bn) {
        bn = bn.replace(/:/g, '');
        bn = bn.replace(/-/g, '');
        return bn;
    }

    function writeTag(data) {
        // ignore what's on the tag for now, just overwrite
        // let record = ndef.textRecord(data, 'en-US', []);
        let record = ndef.textRecord(data);
        nfc.write(
              [record],
              function () {
                showMessage($translate('property.component.writeSuccessfully')); // '卡片寫入成功.'
              },
              function (reason) {
                showMessage($translate('property.component.writeError')); // '卡片有誤? 或請靠上卡片重寫一次!'
              }
        );
    }

    self.$onDestroy = function () {
        nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', self.scanBarCode);
        document.removeEventListener('volumedownbutton', self.scanBarCode);
    };

    vm.back = function () {
        history.go(-1);
    };

    // nfc.addNdefListener(onNfc, () => { showMessage("Listening for NFC Messages"); }, () => { showMessage("Failed to add NDEF listener"); });
    // function onNfc(nfcEvent) {
    //     // display the tag as JSON
    //     showMessage(JSON.stringify(nfcEvent.tag));
    //     if (nfcEvent.tag.ndefMessage) {
    //         if (nfcEvent.tag.ndefMessage[0].payload[0] === 0x02) {
    //             nfcEvent.tag.ndefMessage[0].payload.splice(0, 3);
    //         }
    //         ndef.Data = String.fromCharCode.apply(null, nfcEvent.tag.ndefMessage[0].payload);
    //         readCardData = ndef.Data;
    //     } else {
    //         readCardData = '';
    //     }
    // }
}

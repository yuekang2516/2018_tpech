
angular.module('app').controller('restartBleToastCtrl', restartBleToastCtrl);

restartBleToastCtrl.$inject = ['$mdToast', '$filter', 'showMessage', 'bleService', 'callback', 'mac'];

// android only
// callback: 執行完重啓藍牙後要做的事情
function restartBleToastCtrl($mdToast, $filter, showMessage, bleService, callback, mac) {
    const self = this;
    const $translate = $filter('translate');
    const RESTART_BLE = 'restart_ble';
    console.log('restartBleToastCtrl');

    self.retartBleAndDoAction = function () {
        // 確認藍牙是否已開
        bleService.isEnabled().then(() => {
            // 先關閉藍牙
            bleService.setDisableCallback(() => {
                // 設重啟後要執行的 callback
                bleService.setEnableCallback(() => {
                    if (typeof callback !== 'function') {
                        return;
                    }
                    if (mac) {
                        callback(mac);
                    } else {
                        callback();
                    }
                });
                bleService.enableWithoutAlert((err) => {
                    /*
                    若藍牙已開啟會回：
                        error:"disable"
                        message:"Bluetooth not disabled"
                */
                    if (err && err.message && err.message.toLowerCase() !== 'bluetooth not disabled') {
                        showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                    }
                });
            });
            bleService.disable();

        }).catch(() => {
            // 設重啟後要執行的 callback
            bleService.setEnableCallback(() => {
                if (typeof callback !== 'function') {
                    return;
                }
                if (mac) {
                    callback(mac);
                } else {
                    callback();
                }
            });
            bleService.enableWithoutAlert((err) => {
                /*
                    若藍牙已開啟會回：
                        error:"disable"
                        message:"Bluetooth not disabled"
                */
                if (err && err.message && err.message.toLowerCase() !== 'bluetooth not disabled') {
                    showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                }
            });
        });

        $mdToast.hide(RESTART_BLE);
    };

    self.closeToast = function () {
        $mdToast.hide();
    };
}

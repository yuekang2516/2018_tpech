angular.module('app')
    .factory('raspberryPiService', raspberryPiService);

raspberryPiService.$inject = ['$localStorage', '$filter', 'bleService'];
function raspberryPiService($localStorage, $filter, bleService) {
    let $translate = $filter('translate');

    let defaultRssi = -45; // 預設距離藍牙的 db 值
    let scanPiSec = 10; // 預設幾秒掃一次 pi
    let scanPiBufferTime = 1000; // 預設藍牙掃描之間休息幾毫秒

    // 於本地建立 rssi 相關
    if (!$localStorage.piSetting) {
        $localStorage.piSetting = {
            rssiAry: [],    // rssi 存取達到三個才重寫 piRssi(取平均)
            rssiModifiedAry: [],    // 達到三次未連線才重寫 piRssi，避免距離參數設太近
            piRssi: defaultRssi
        };
    }
    console.log('prepare raspberryPiService!!', $localStorage.piSetting);

    const rest = {
        getPiSetting,
        getScanPiSec,
        getScanPiBufferTime,
        setScanPiSec,
        setScanPiBufferTime,
        modifyLocalPiRssiSetting,
        convertPiErr
    };

    function getPiSetting() {
        return $localStorage.piSetting;
    }

    function getScanPiSec() {
        return scanPiSec;
    }

    function setScanPiSec(sec) {
        scanPiSec = sec;
    }

    function getScanPiBufferTime() {
        return scanPiBufferTime;
    }

    function setScanPiBufferTime(ms) {
        scanPiBufferTime = ms;
    }

    // 給 scanPi 回傳 callback 使用，調整此手機的感應的藍牙距離
    function modifyLocalPiRssiSetting(rssi, isLowerPiRssi) {
        console.log('scanPiCallback', rssi);

        // rssi 存取達到三個才重寫 piRssi
        if ($localStorage.piSetting.rssiModifiedAry.length === 3) {
            // 若超過目前設定值三次則重設 piRssi，並清空陣列
            $localStorage.piSetting.piRssi = countRssiAryAvg($localStorage.piSetting.rssiModifiedAry);
            console.log('modifiedPiRssi!!', $localStorage.piSetting.piRssi);
            $localStorage.piSetting.rssiAry = [];
            $localStorage.piSetting.rssiModifiedAry = [];
            return;
        } else if (isLowerPiRssi) {
            // 若超過目前設定值存入 rssiModifiedAry，否則存入 rssiAry
            $localStorage.piSetting.rssiModifiedAry.push((rssi + $localStorage.piSetting.piRssi) / 2);
            console.log('scanPiCallback localStorage', $localStorage.piSetting);
            return;
        } else {
            // 維持 rssiAry 三個值
            if ($localStorage.piSetting.rssiAry.length === 3) {
                $localStorage.piSetting.rssiAry.shift();    // 將第一筆移除
            }
            // 存與設定值平均後的值
            $localStorage.piSetting.rssiAry.push((rssi + $localStorage.piSetting.piRssi) / 2); // 將最新一筆塞入陣列
        }
        // 寫入平均值至 piRssi
        $localStorage.piSetting.piRssi = countRssiAryAvg($localStorage.piSetting.rssiAry);
        console.log('piRssi', $localStorage.piSetting.piRssi);
        console.log('scanPiCallback localStorage', $localStorage.piSetting);
    }

    // RaspberryPi-related error
    function convertPiErr(str = '') {
        if (typeof str !== 'string') {
            str = str.toString();
        }
        str = str && str.toUpperCase();
        switch (str) {
            case 'SERVER_EMPTY':
            case 'UPLOADURL_EMPTY':
                return $translate('raspberryPi.serverEmpty');
            case 'METER_NOT_SUPPORT':
                return $translate('raspberryPi.meterNotSupport');
            case 'SYSTEM_ERROR':
                return $translate('raspberryPi.systemError');
            case 'CONNECT_METER_ERROR':
                return $translate('raspberryPi.connectMeterError');
            case 'READ_DATA_ERROR':
                return $translate('raspberryPi.readDataError');
            case 'SYNC_STATUS_ERROR':
                return $translate('raspberryPi.syncStatusError');
            default:
                // ex.CONNECT_SERVER_ERROR-404
                if (str && str.split('-')[0] === 'CONNECT_SERVER_ERROR') {
                    return $translate('raspberryPi.connectServerError') + '-' + str.split('-')[1];
                }
                return bleService.errorParser(str);
        }
    }

    function countRssiAryAvg(ary) {
        if (ary.length < 1) {
            return defaultRssi;
        }
        let avg = 0;
        for (let i = 0; i < ary.length; i++) {
            avg += ary[i];
        }
        avg /= ary.length;

        // 再將平均與目前設定 db 值平均，取整數
        return Math.round((avg + $localStorage.piSetting.piRssi) / 2);
    }

    return rest;
}

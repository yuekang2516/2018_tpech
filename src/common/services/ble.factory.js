/* global ble */
/* global bluetoothle */

// 引入不同洗腎機的 parser
import fresenius from '../../bleManager/fresenius';
import nikkiso from '../../bleManager/nikkiso';
import ak200 from '../../bleManager/AK200';
import ak98 from '../../bleManager/AK98';
import ak96 from '../../bleManager/AK96';
import ak95 from '../../bleManager/AK95';
import bbraun from '../../bleManager/bbraun';
import nipro from '../../bleManager/nipro';
import toray from '../../bleManager/toray';
import raspberryPi from '../../bleManager/raspberryPi';

// 引入不同血壓機的 parser
import v100 from '../../bleManager/V100';
import taidoc from '../../bleManager/Taidoc';

// 為了配合 bluetoothle 套件的使用，需維持只有一個 initial 的 callback，因此將此功能獨立寫成 service
angular.module('app')
    .factory('bleService', bleService);

bleService.$inject = ['$filter'];
function bleService($filter) {
    let $translate = $filter('translate');

    const rest = {
        setEnableCallback,
        setDisableCallback,
        enableWithoutAlert,
        isEnabled,
        isBPMonitor,
        disable,
        checkLocationPermissionAndExecute,
        disconnect,
        scanPi,
        connectPi,
        stopScanPi,
        getData,
        convertStrToMac,
        bleInit,
        errorParser
    };

    const BLECONNECTRETRYTIMES = 2; // 重試藍牙連線的次數
    const BLECONNECTRETRYTIMEOUT = 10000;   // 重試藍牙連線若超過十秒，也放棄這次(鴻申棒子曾發生重試連線的 callback 回來必須5秒以上，若要等他重試完三次會太久)
    const BLECONNECTTIMEOUT = 15000;    // 藍牙連線若超過 15 秒沒有 callback 回來就取消這次連線

    // error msg
    const RECEIVING_DATA_TIMEOUT = 'RECEIVING_DATA_TIMEOUT';
    const BT_WRITE_ERROR = 'BT_WRITE_ERROR';
    const BT_NOT_FOUND = 'BT_NOT_FOUND';
    const CANNOT_FIND_CORRESPONDING_MACHINE = 'CANNOT_FIND_CORRESPONDING_MACHINE';
    const BT_CONNECT_TIMEOUT = 'BT_CONNECT_TIMEOUT';
    const BT_RETRYCONNECT_TIMEOUT = 'BT_RETRYCONNECT_TIMEOUT';
    const BT_RETRYCONNECT_FAILED = 'BT_RETRYCONNECT_FAILED';
    const BT_CANNOT_RETURN_DATA = 'BT_CANNOT_RETURN_DATA';
    const BT_POWEROFF = 'BT_POWEROFF';
    const BT_DISCONNECT_FAIL = 'BT_DISCONNECT_FAIL';
    const DATA_FORMAT_WRONG = 'DATA_FORMAT_WRONG';
    const BT_CONNECT_LOSE = 'BT_CONNECT_LOSE';
    const BT_MAC_ERROR = 'BT_MAC_ERROR';

    // 各個藍芽棒的ble設定檔，前4碼為藍芽棒號碼，再讀入其UUID
    const deviceUUID = {
        '5C313E': {   // 鴻申
            SERVICE_UUID: 'FFF0',
            DEVICESETTING_UUID: 'FFF1',
            NOTIFY_UUID: 'FFF2',
            WRITE_UUID: 'FFF3'
        },
        '8CDE': {   // 禾展
            SERVICE_UUID: '49535343-FE7D-4AE5-8FA9-9FAFD205E455',
            NOTIFY_UUID: '49535343-1E4D-4BD9-BA61-23C647249616',
            WRITE_UUID: '49535343-8841-43F4-A8D4-ECBE34729BB3'
        },
        C026DA: {   // taidoc 藍牙棒
            SERVICE_UUID: 'FFF0',
            DEVICESETTING_UUID: 'FFF1',
            NOTIFY_UUID: 'FFF2',
            WRITE_UUID: 'FFF3'
        },
        C026DF: {   // taidoc D40b 血糖血壓機內建藍牙
            // todo 待確認
            SERVICE_UUID: '00001523-1212-efde-1523-785feabcd123',
            NOTIFY_UUID: '00001524-1212-efde-1523-785feabcd123',
            WRITE_UUID: '00001524-1212-efde-1523-785feabcd123'
        },
        B827EB: {  // Raspberrypi ex. B827EBFDD8B3
            SERVICE_UUID: 'FFF0',
            NOTIFY_UUID: 'FFF1',
            WRITE_UUID: 'FFF1'
        },
        '27EB': {   // Pi
            SERVICE_UUID: 'FFF0',
            NOTIFY_UUID: 'FFF1',
            WRITE_UUID: 'FFF1'
        }
    };

    let BLE_MTU = 20; // ble溝通傳入的bytes限制，超過20則會分兩次以上傳
    let macAddrWithoutColon = '';   //  目前正在連線的藍牙 mac address without ':'
    let macAddr = '';   // 藍牙 mac address
    let deviceBrandId = ''; // 目前使用的藍牙廠牌 id
    let bleRetryConnectCount = 0;  // 藍牙連線重試計數
    let parser = null;  // 依據機型決定解譯器
    let _tempData = []; // 暫存目前傳輸的資料
    let [workType, objectData] = ['', null]; // 外部傳進來欲進行的參數

    // ble service
    let [SERVICE_UUID, NOTIFY_UUID, WRITE_UUID, DEVICESETTING_UUID] = [];

    // timers
    let scanTimer = null;  // 一般在掃藍牙裝置的 timer (會掃十秒)
    let checkResultTimer = null;   // 藍牙傳輸中 check result 的 timer
    let bleActionDelayTimer = null; // 緩衝不同操作藍牙動作的 timer: 連線、成功啟動、成功關閉...
    let bleRetryConnectTimer = null;  // 重試藍牙連線的 timer
    let scanPiTimer = null;    // TODO 掃描 raspberry pi 用的 timer
    let bleConnectingTimer = null;  // 計時藍牙連線的 timer ，避免藍牙棒一直找不到 service 而沒有任何 callback 回來

    // callback
    let _enableCallback = null; // 藍牙功能成功開啟後執行的 callback
    let _disableCallback = null;   // 藍牙功能成功關閉後執行的 callback

    // flag
    let findDeviceSuccess = false;  // 判斷是否 scan 到欲連的裝置
    let isReading = false;  // 判斷是否正在傳輸資料中
    let connected = false;  // 供 retry connect 判斷藍牙是否已連線，已連線就不做後續動作
    let isRetryConnectTimeout = false;  // retry connect 是否已超過十秒
    let isBleConnectTimeout = false;
    let isDisconnecting = false;   // ver 1.2.2 若意外斷線也會 call connect fail callback 若剛好發生在斷線後，需判別避免 retryconnect

    // cordova-plugin-bluetoothle 才有藍牙 diable 功能且 enable 不會跳提示 (android only)
    // https://github.com/randdusing/cordova-plugin-bluetoothle#isinitialized
    // 需先 init 才能做其他事情
    function bleInit() {
        // 先確認是否已 initialize 過
        checkBleIsInit().then((isInitialized) => {
            console.log('bleIsInit -> ', isInitialized);
            if (isInitialized) {
                return false;
            }

            bluetoothle.initialize(bleStatusChangedCallback, { request: false, statusReceiver: true });
            return true;
        });
    }
    function checkBleIsInit() {
        return new Promise((resolve, reject) => {
            // Determine whether the adapter is initialized. No error callback. Returns true or false
            // ex. {"isInitialized": true}
            bluetoothle.isInitialized((isInitialized) => {
                resolve(isInitialized.isInitialized);
            });
        });
    }
    // bluetoothle plugin initialize 的 callback (ble enable, disable 會進去)
    function bleStatusChangedCallback(currentBleStatus) {
        console.log('ble status from bluetoothle plugin', currentBleStatus);
        // 會回傳物件 ex. { status: 'enabled' }
        switch (currentBleStatus.status.toLowerCase()) {
            case 'disabled':
                console.log('ble disabled!');

                // 避免再次開啟藍牙會執行之前的事情
                _enableCallback = null;

                clearAndSetBleActionDelayTimer(() => {
                    checkCallbackIsFunctionAndExecute(_disableCallback);
                }, 500);
                break;
            case 'enabled':
                console.log('ble enabled!');
                // 避免關閉藍牙會執行之前的事情
                _disableCallback = null;

                // delay 個幾秒，等 ble 穩定
                clearAndSetBleActionDelayTimer(() => {
                    checkCallbackIsFunctionAndExecute(_enableCallback);
                }, 500);
                break;
            default:
                break;
        }
    }

    // 為了確保 bleActionDelayTimer 只執行一種 callback，在設置之前先清掉之前的 timer
    function clearAndSetBleActionDelayTimer(callback, delayMilliSec) {
        clearTimeout(bleActionDelayTimer);
        checkCallbackIsFunctionAndExecute(() => {
            bleActionDelayTimer = setTimeout(callback, delayMilliSec);
        });
    }

    // 確保 callback 傳進來的是 function 才執行
    function checkCallbackIsFunctionAndExecute(callback) {
        if (typeof (callback) === 'function') {
            callback();
        }
    }

    function convertStrToMac(macStr) {
        // mac address 應為 12 碼
        if (macStr.length !== 12) {
            return '';
        }
        let mac = macStr.toUpperCase().replace(/(.{2})/g, "$1:");    // 每兩個字插一個 :
        return mac.slice(0, mac.length - 1); // 切掉最後一個 :
    }

    // android only 藍牙開啟(bluetoothle plugin) 只會有失敗的 callback，因此使用上還須先呼叫 setEnableCallback 方法
    function setEnableCallback(enableCallback) {
        _enableCallback = enableCallback;
    }

    // android only 藍牙關閉(bluetoothle plugin) 只會有失敗的 callback，因此使用上還須先呼叫 setDisableCallback 方法
    function setDisableCallback(disableCallback) {
        _disableCallback = disableCallback;
    }

    // android only 藍牙開啟(bluetoothle plugin) 只會有失敗的 callback，因此使用上還須先呼叫 setEnableCallback 方法
    function enableWithoutAlert(errCallback) {
        bluetoothle.enable(() => { }, (err) => {
            console.log('bluetoothle enable err -> ', err);
            checkCallbackIsFunctionAndExecute(errCallback);
        });
    }

    function isEnabled() {
        return new Promise((resolve, reject) => {
            ble.isEnabled(() => { resolve(); }, () => { reject(); });
        });
    }

    // 確認是否為血壓計，供前端判斷
    function isBPMonitor(device) {
        if (device && (device.toLowerCase() === 'v100' || device.toLowerCase() === '3261')) {
            return true;
        }
        return false;
    }

    // android only 藍牙關閉(bluetoothle plugin) 只會有失敗的 callback，因此使用上還須先呼叫 setDisableCallback 方法
    function disable(errCallback) {
        bluetoothle.disable(() => { }, (err) => {
            console.log('bluetoothle disable err -> ', err);
            checkCallbackIsFunctionAndExecute(errCallback);
        });
    }

    // android only ble scan 需要定位權限(enable 的時候就會問)且定位功能要開(需要用另外一個套件，會幫忙轉到開定位功能的設定頁面)
    function checkLocationPermissionAndExecute(successCallback, errorCallback) {
        return new Promise((resolve, reject) => {
            cordova.plugins.diagnostic.isLocationEnabled((enabled) => {
                console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
                if (enabled === false) {
                    cordova.plugins.diagnostic.switchToLocationSettings();
                    resolve();
                }
                checkCallbackIsFunctionAndExecute(successCallback);
                resolve();
            }, (error) => {
                console.error("The following error occurred: " + error);
                checkCallbackIsFunctionAndExecute(errorCallback);
            });
        });
    }

    /**
     * 由 parser 呼叫的common function
     * 幫忙解析要給機器的cmd(string to bytes)，並將值正式發給藍芽棒 -> 機器
     */
    // rarams: {type: 'WITHOUT_READ'}
    // rarams: {type: 'STOP', stop: 13}
    // rarams: {type: 'CHECK_STOP', stop: 13, checkStr: '/T'}
    // rarams: {type: 'START_STOP', start: 03, stop: 13}
    // rarams: {type: 'TIMEOUT', timeout: 2000} // unit: ms
    // rarams: {type: 'LENGTH', length: 500} //unit: bytes length
    // 最後會回傳 byte array
    function sendData(cmd, params) {
        return new Promise((resolve, reject) => {
            // cmd -> Array, write前需轉為Uint8Array
            let dataLength = cmd.length;
            // 輸入cmd bytes如果大於20，要分批傳，分(n / 20)次傳
            if (dataLength > BLE_MTU) {
                let _tmpCmdByRange = [];
                let result = null;
                cmd = Array.from(cmd);

                const exeWrite = () => {
                    _tmpCmdByRange = cmd.splice(0, dataLength > 20 ? 20 : dataLength);

                    result = new Uint8Array(_tmpCmdByRange);

                    // 傳入訊息至BLE
                    ble.write(macAddr, SERVICE_UUID, WRITE_UUID, result.buffer, (buffer) => {
                        // console.log('long data sendData ok', result, String.fromCharCode.apply(null, result));
                        console.log([`long data sendData ok 16 check result -> ${_tempData.map(value => value.toString(16)).join(' ')}`]);

                        dataLength = cmd.length;
                        if (dataLength > 0) {
                            exeWrite();
                        } else {
                            // this._tempData = [];
                            checkResult();
                        }
                    }, (err) => {
                        reject(err);
                        console.error('long data sendData error', err);
                    });
                };
                exeWrite();
            } else {
                const result = new Uint8Array(cmd);

                // 傳入訊息至BLE
                ble.write(macAddr, SERVICE_UUID, WRITE_UUID, result.buffer, (buffer) => {
                    console.log('short data sendData ok', result, String.fromCharCode.apply(null, result));
                    // this._tempData = [];
                    checkResult();
                }, (err) => {
                    reject(err);
                    console.error('short data sendData error', err);
                });
            }

            isReading = true;
            let checkCount = 0;
            const checkResult = () => {
                console.log('check result');
                checkCount += 1;
                switch (params.type.toUpperCase()) {
                    case 'WITHOUT_READ':
                        console.info('resolve WITHOUT_READ');
                        isReading = false;
                        resolve();
                        _tempData = [];
                        break;
                    case 'STOP':
                        if (_.indexOf(_tempData, params.stop) > -1) {
                            // 將 stop byte 後的 bytes 切掉
                            _tempData.splice(_.indexOf(_tempData, params.stop) + 1);

                            console.info('resolve STOP', _tempData, String.fromCharCode.apply(null, _tempData));
                            isReading = false;
                            resolve(_tempData);
                            _tempData = [];
                        }
                        break;
                    case 'CHECK_STOP':
                        // 確認是否包含 checkBytes 裡的內容且之後有個 stopcode
                        let stopcodeIdx = _.lastIndexOf(_tempData, params.stop);    // 目前資料裡最後一個出現的 stopcode
                        let checkStrIdx = String.fromCharCode.apply(null, _tempData).indexOf(params.checkStr);  // 我們需要包含資料的 index
                        if (stopcodeIdx > -1 && checkStrIdx > -1 && stopcodeIdx > checkStrIdx) {
                            // 取出我們要的字串後的部分
                            _tempData = _tempData.splice(checkStrIdx, _tempData.length);
                            // 將最後一個stopcode 後的 bytes 切掉
                            _tempData.splice(_tempData.indexOf(params.stop) + 1);
                            console.info('resolve CHECK_STOP RAW DATA', _tempData, String.fromCharCode.apply(null, _tempData));

                            // 取出最後一段要的資料
                            let result = [];
                            result.push(_tempData.pop());   // 先將最後一個 stopcode 加到結果陣列裡
                            let currentData;    // 紀錄目前欲加到結果陣列的值
                            let finishCount = _tempData.length;
                            for (let i = 0; i < finishCount; i++) {
                                currentData = _tempData.pop();
                                // 加到結果陣列第一個
                                result.unshift(currentData);
                            }
                            console.info('resolve CHECK_STOP', result, String.fromCharCode.apply(null, result));

                            isReading = false;
                            resolve(result);
                            _tempData = [];
                        }
                        break;
                    case 'CHECK_LENGTH':
                        // 確認是否包含 checkBytes 裡的內容且 checkBytes 之後資料的長度為大於等於 params.length
                        let checkStrIdx1 = String.fromCharCode.apply(null, _tempData).indexOf(params.checkStr);  // 我們需要包含資料的 index
                        let checkLength = _tempData.length - (checkStrIdx1 + 1);
                        if (checkStrIdx1 > -1 && checkLength >= params.length) {
                            // 取出我們要的字串後的部分
                            _tempData = _tempData.splice(checkStrIdx1, _tempData.length);
                            console.info('resolve CHECK_LENGTH RAW DATA', _tempData, String.fromCharCode.apply(null, _tempData));

                            // 取出最後一段要的資料
                            let result = [];
                            let finishCount = _tempData.length;
                            for (let i = 0; i < finishCount; i++) {
                                // 加到結果陣列第一個
                                result.unshift(_tempData.pop());
                            }
                            console.info('resolve CHECK_LENGTH', result, String.fromCharCode.apply(null, result));

                            isReading = false;
                            resolve(result);
                            _tempData = [];
                        }
                        break;
                    case 'START_STOP':
                        if (_.indexOf(_tempData, params.stop) > -1) {
                            while (_tempData.length > 0 && _tempData[0] !== params.start) {
                                _tempData.shift();
                            }

                            // 將 stop byte 後的 bytes 切掉
                            _tempData.splice(_.indexOf(_tempData, params.stop) + 1);

                            console.info('resolve START_STOP', _tempData, String.fromCharCode.apply(null, _tempData));
                            isReading = false;
                            resolve(_tempData);
                            _tempData = [];
                        }
                        break;
                    case 'LENGTH':
                        if (_tempData.length >= params.length) {
                            console.info('resolve LENGTH', _tempData, String.fromCharCode.apply(null, _tempData));
                            isReading = false;
                            resolve(_tempData);
                            _tempData = [];
                        }
                        break;
                    case 'TIMEOUT':
                        if (params.timeout || params.timeout === 0) {
                            console.info('resolve timeout');
                            isReading = false;
                            setTimeout(() => {
                                resolve(_tempData);
                                _tempData = [];
                            }, params.timeout);
                        }
                        break;
                    default:
                        break;
                }

                // 如果還在讀取當中, 下一個 100ms 再繼續檢查
                if (isReading) {
                    if (checkCount > 100) {
                        isReading = false;
                        console.error('讀取超過10秒');
                        reject(RECEIVING_DATA_TIMEOUT); // Receiving time exceeded 10 seconds
                        return;
                    }
                    clearTimeout(checkResultTimer);
                    checkResultTimer = setTimeout(() => {
                        checkResult();
                    }, 100);
                }
            };
            // checkResult();
        });
    }

    // 外部只要使用 var blemanager = new bleManager();
    // blemanager.getData('12345678**4008').then(success,failed);
    /*
    **  options 參數為一個物件，包含 pi 相關的資料:
    **      workType, objectData
    **      callback: 藍牙連線成功後，回傳的 function
    **  isConnected: 目前是否仍為連線中，若是則直接 getData
    */
    function getData(ndefText, options, isConnected) {
        return new Promise((resolve, reject) => {
            console.log('ble initialing...');

            // 若有傳入 options 參數，需賦值給相關的變數
            if (options) {
                [workType, objectData] = [options.workType, options.objectData];
            }
            /**
             * 初始化會帶進mac與callbackFunction
             * mac format : 8CDE567890**GE
             * callback function : 處理完成會回叫callback function
             */
            // 確保 ndefText 為沒有 : 的字串
            ndefText = ndefText.replace(/:/g, '');
            macAddrWithoutColon = ndefText.split('**')[0].toUpperCase(); // ex: 5C313E472ABB
            let device = ndefText.split('**')[1] ? ndefText.split('**')[1] : ''; // ex: fresenius
            // 透過讀入的前6碼判斷是什麼藍牙棒
            deviceBrandId = macAddrWithoutColon.slice(0, 6);
            setDeviceUUIDByBrandId();

            // 之前已連線且尚未斷線，可直接做機器要做的事且不需做以下初始化的動作
            if (isConnected) {
                parser.getData(workType, objectData).then((result) => {
                    resolve(result);
                }, (reason) => {
                    reject(reason);
                });
                return;
            }

            setParser(device);

            // android 不需 scan 即可直接用 mac 連，ios 仍需要 scan 以獲得 device uuid
            discoverBLEByPlatform(cordova.platformId, macAddrWithoutColon, resolve, reject, options);

        });
    }

    // 根據不同平台決定要連線的方式
    // android 不需 scan 即可直接用 mac address 連，ios 仍需要 scan 以獲得 device uuid [plugin ver 1.2.2]
    /*
    **  platformId: 裝置的平台 ex.ios or android
    **  idStr: 欲連藍牙棒的 mac address(無 ":")
    **  successCallback: 成功後要做的事情
    **  failureCallback: 失敗後要做的事情
    **  options: 參數為一個物件，包含 pi 相關的資料:
            workType, objectData
            callback: 藍牙連線成功後，回傳的 function 
     */
    //
    function discoverBLEByPlatform(platformId, idStr, successCallback, failureCallback, options) {
        switch (platformId) {
            case 'android':
                onDiscoverDeviceSuccess({ id: convertStrToMac(idStr) }, options.callback).then((result) => {
                    checkCallbackIsFunctionAndExecute(successCallback(result));
                }).catch((err) => {
                    checkCallbackIsFunctionAndExecute(failureCallback(err));
                });
                break;
            default:    // ios
                // ios 仍需要 scan 以獲得 device uuid 
                console.log('ble.start scan');

                // 10秒後沒反應就報錯
                ble.startScanWithOptions([], { reportDuplicates: false }, (device) => {
                    console.log('ble.scan', device);
                    // 把找到的device扔進onDiscoverDeviceSuccess function
                    onDiscoverDeviceSuccess(device, options.callback, true).then((result) => {
                        checkCallbackIsFunctionAndExecute(successCallback(result));
                    }).catch((err) => {
                        checkCallbackIsFunctionAndExecute(failureCallback(err));
                    });
                });

                // 如果10秒後還是沒scan到，就return false
                clearTimeout(scanTimer);
                scanTimer = setTimeout(() => {
                    console.log('scan timeout');
                    if (!findDeviceSuccess) {
                        // 10 secs 後仍沒找到就停止 scan
                        ble.stopScan(() => {
                            console.info('timeout 10 sec stop scan!!!!!!!!!!!!!!!!!!');
                        }, () => {
                            // do nothing
                        });
                        checkCallbackIsFunctionAndExecute(failureCallback(BT_NOT_FOUND));
                    }
                }, 10000);
                break;
        }
    }

    // 依據藍牙棒決定其對應的 uuid
    function setDeviceUUIDByBrandId() {
        try {
            [SERVICE_UUID, NOTIFY_UUID, WRITE_UUID] =
                [deviceUUID[deviceBrandId].SERVICE_UUID, deviceUUID[deviceBrandId].NOTIFY_UUID, deviceUUID[deviceBrandId].WRITE_UUID];
            BLE_MTU = deviceBrandId === 'B827EB' ? 9999 : 20;   // Gino說對樹莓派一次傳就好，不用分段送，所以改為9999超大的範圍才切斷分次上傳
            // 鴻申 & 泰博於 disconnect 前皆須回寫藍牙棒設定
            if (deviceBrandId === '5C313E' || deviceBrandId === 'C026DA') {
                DEVICESETTING_UUID = deviceUUID[deviceBrandId].DEVICESETTING_UUID;
            }
        } catch (e) {
            throw new Error(`不支援的藍牙棒編號 -> ${deviceBrandId}`);
        }
    }

    // 決定要用哪台洗腎機的 parser
    function setParser(device) {
        // 根據讀入的devicename,讓 parser 變為指定的機器
        switch (device.toLowerCase()) {
            case 'bbraun':
            case 'dialog+':
                parser = new bbraun({ sendData });
                break;
            case 'fresenius':
            case '4008':
            case '4008s':
            case '4008b':
            case '4008h':
            case 'fresenius_v1':
                parser = new fresenius({ sendData }, 'v1');
                break;
            case 'fresenius_v2':
                parser = new fresenius({ sendData }, 'v2');
                break;
            case 'nikkiso':
            case 'dbb27c':
                parser = new nikkiso({ sendData });
                break;
            case 'ak95':
                parser = new ak95({ sendData });
                break;
            case 'ak96':
            case 'ak96_p35':
                parser = new ak96({ sendData }, 'p35');
                break;
            case 'ak96_p42':
                parser = new ak96({ sendData }, 'p42');
                break;
            case 'ak98':
            case 'ak98_v1':
                parser = new ak98({ sendData }, 'v1');
                break;
            case 'ak98v2':
            case 'ak98_v2':
                parser = new ak98({ sendData }, 'v2');
                break;
            case 'ak200':
                parser = new ak200({ sendData });
                break;
            case 'nipro':
            case 'ncu-18':
                parser = new nipro({ sendData });
                break;
            case 'tr3000':
                parser = new toray({ sendData }, '3000');
                break;
            case 'tr8000':
                parser = new toray({ sendData }, '8000');
                break;
            case 'tr321':
                parser = new toray({ sendData }, '321');
                break;
            case 'yuekangiot':
            case '':
                parser = new raspberryPi({ sendData });
                break;
            case 'v100':    // 血壓
                parser = new v100({ sendData });
                break;
            case '3261':    // Taidoc 血壓
                parser = new taidoc({ sendData });
                break;
            default:
                throw new Error(CANNOT_FIND_CORRESPONDING_MACHINE);  // Cannot find corresponding machine
        }
    }

    function bleConnect(deviceId) {
        isDisconnecting = false; // init
        return new Promise((resolve, reject) => {
            connect(deviceId, resolve, reject);
        });
    }
    function connect(deviceId, resolve, reject) {
        ble.connect(deviceId, (peripheral) => {
            if (isBleConnectTimeout) {
                return;
            }
            clearTimeout(bleConnectingTimer);
            connected = true;
            bleRetryConnectCount = 0;
            clearTimeout(bleRetryConnectTimer);
            // saveMacAddr();
            resolve(peripheral);
        }, (err) => {
            if (isBleConnectTimeout || connected) {
                console.log('ble connect fail! ->', err);
                return;
            }

            // ble-central plugin ver 1.1.9 開始，若藍牙意外斷線也會吐 connect failure 的 callback回來 ->
            /*
                Err:
                {
                    errorMessage:"Peripheral Disconnected",
                    id:"C0:26:DA:00:02:17",
                    name:"HS SPPLE"
                }
             */
            if (err.errorMessage === 'Peripheral Disconnected' && isDisconnecting) {
                reject(BT_CONNECT_LOSE);
                return;
            }

            clearTimeout(bleConnectingTimer);
            console.log('ble connect fail! ->', err);
            // 連接Peripheral失敗
            // 重試固定次數的連線
            retryConnect(deviceId, resolve, reject);
        });
        clearTimeout(bleConnectingTimer);
        bleConnectingTimer = setTimeout(() => {
            isBleConnectTimeout = true;
            reject(BT_CONNECT_TIMEOUT);
        }, BLECONNECTTIMEOUT);

    }
    function retryConnect(deviceId, resolve, reject) {
        if (bleRetryConnectCount < BLECONNECTRETRYTIMES && !isRetryConnectTimeout) {
            clearAndSetBleActionDelayTimer(() => {
                if (connected) return;
                connect(deviceId, resolve, reject);
                bleRetryConnectCount++;
                // retry 若超過一定時間就放棄，不能馬上 reject 需等目前這次 callback 回來
                if (bleRetryConnectCount === 1) {
                    bleRetryConnectTimer = setTimeout(() => {
                        if (!connected) {
                            isRetryConnectTimeout = true;
                        }
                    }, BLECONNECTRETRYTIMEOUT);
                }
                console.log('ble retry connect times->', bleRetryConnectCount);
            }, 500);
        } else {
            bleRetryConnectCount = 0;
            if (isRetryConnectTimeout) {
                isRetryConnectTimeout = false;
                reject(BT_RETRYCONNECT_TIMEOUT);
            } else {
                reject(BT_RETRYCONNECT_FAILED);
            }
        }
    }

    function onDiscoverDeviceSuccess(device, callback, needStopScan = false) {
        console.log('onDiscoverDeviceSuccess');
        return new Promise((resolve, reject) => {
            // 比對傳進來的device name與macAddr，如果有找到就連接device且未連線中
            // 若用名稱對只對後10碼即可，配合樹莓派名稱只能寫10碼
            // 回傳的 name 欄位會與 advertising.kCBAdvDataLocalName 不一致 -> 改抓advertising.kCBAdvDataLocalName
            // 有時候 advertising.kCBAdvDataLocalName 會不見
            // 若為直接用 mac 連不會有 name 欄位
            if (!device.id) {
                reject(BT_MAC_ERROR);
            }
            let deviceName = '';
            if (device.advertising && device.advertising.kCBAdvDataLocalName) {
                deviceName = device.advertising.kCBAdvDataLocalName;
            } else if (device.name) {
                deviceName = device.name;
            }
            // if ((device.id.replace(/:/g, '') === macAddrWithoutColon || (device.name && device.name.slice(-10) === macAddrWithoutColon.slice(-10))) && !findDeviceSuccess) {
            if ((device.id.replace(/:/g, '') === macAddrWithoutColon || (deviceName && deviceName.slice(-10) === macAddrWithoutColon.slice(-10))) && !findDeviceSuccess) {   
                findDeviceSuccess = true;
                isBleConnectTimeout = false;
                macAddr = device.id;

                const bleconnect = () => {
                    bleConnect(macAddr).then((peripheral) => {
                        console.log('connect successfully! -> ', peripheral);
                        checkCallbackIsFunctionAndExecute(callback);    // 藍牙連線成功
                        return onPeripheralConnectSuccess(peripheral);
                    }, (err) => {
                        console.log('ble connect error', err);
                        // removeConnectFailMacAddr(macAddr);
                        reject(err);
                    }).then((result) => {
                        resolve(result);
                    }, (err) => {
                        console.log('ble onPeripheralConnect error', err);
                        reject(err);
                    });
                };

                if (!needStopScan) {
                    bleconnect();
                    return;
                }

                // 找到了就停止scan並停止 scanTimer
                clearTimeout(scanTimer);
                ble.stopScan(() => {
                    console.info('stop scan!!!!!!!!!!!!!!!!!!');
                    // 然後連接ble, ble連接成功會呼叫本檔案的onPeripheralConnectSuccess
                    bleconnect();
                }, (err) => { reject('stop scan error ->', err); });
            }
        });
    }

    function onPeripheralConnectSuccess(peripheral) {
        console.log(peripheral, 'onPeripheralConnectSuccess');
        // 連接到了deivce,會把device的peripheral仍進來，請依據藍芽棒的uuid做notify, write與start notification
        return new Promise((resolve, reject) => {
            // 泰博為避免藍牙棒 flow control 打開，造成先送資料會堵塞的問題，需先重新設定藍牙棒，等 0.5 秒再做以下動作。
            if (deviceBrandId === 'C026DA' && parser.getBaudrateSetting().baudrate) {
                // 先確認機型是否有藍牙設定相關參數，若有才進行重設的動作
                saveBleSetting().then(() => {
                    return startNotification();
                }).then((result) => {
                    // success
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                startNotification().then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    }

    // 啟動藍牙通知服務
    function startNotification() {
        return new Promise((resolve, reject) => {
            // 連接此NOTIFY_UUID，機器有回傳資料回來就會叫叫machine的onWriteSuccess，並把buffer(bytes)傳進去
            ble.startNotification(macAddr, SERVICE_UUID, NOTIFY_UUID, (buffer) => {
                let bytes = Array.from(new Uint8Array(buffer));
                _tempData = _tempData.concat(bytes);
                console.log([`${moment().format('YYYY-MM-DD HH:mm:ss:SSS')} check result -> ${_tempData.map(value => value.toString(16)).join(' ')}`]);
            }, (err) => {
                console.error('NOTIFY_UUID notification error ->', err);
                reject(BT_CANNOT_RETURN_DATA); // Bluetooth device connection failed, please try again.
            });

            ble.isEnabled(() => {
                // 開始進行取資料的動作
                console.log('start to getdata');

                parser.getData(workType, objectData).then((result) => {
                    resolve(result);
                }, (reason) => {
                    reject(reason);
                });
            }, (res) => {
                console.error(res, 'isEnable error');
                reject(BT_POWEROFF);   // Bluetooth device power off, please turn it on.
            });
        });
    }

    function disconnect() {
        // 已進入 disconnect 階段
        isDisconnecting = true;
        return new Promise((resolve, reject) => {
            // 鴻申可於 disconnect 前重新設定藍牙棒，沒有 flow control 的問題
            if (deviceBrandId === '5C313E' && parser.getBaudrateSetting().baudrate) {
                // 先確認機型是否有藍牙設定相關參數，若有才進行重設的動作
                saveBleSetting().then(() => {
                    return bleDisconnect();
                }).then((res) => {
                    resolve(res);
                    clearAllTimer();
                    flagAndSettingInit();
                }).catch((err) => {
                    reject(err);
                    clearAllTimer();
                    flagAndSettingInit();
                });
            } else {
                bleDisconnect().then((res) => {
                    resolve(res);
                    clearAllTimer();
                    flagAndSettingInit();
                })
                    .catch((err) => {
                        reject(err);
                        clearAllTimer();
                        flagAndSettingInit();
                    });
            }

        });
    }
    function clearAllTimer() {
        clearTimeout(scanTimer);
        clearTimeout(checkResultTimer);
        clearTimeout(bleActionDelayTimer);
        clearTimeout(bleRetryConnectTimer);
        clearTimeout(bleConnectingTimer);
        console.log('clearAllTimer!!');
    }
    function flagAndSettingInit() {
        // clear all flag
        [findDeviceSuccess, isReading, connected, isRetryConnectTimeout] = [false, false, false, false];

        [deviceBrandId, macAddrWithoutColon, macAddr, parser, bleRetryConnectCount, workType, objectData] = ['', '', '', null, 0, '', null];

        // init ble service
        [SERVICE_UUID, NOTIFY_UUID, WRITE_UUID, DEVICESETTING_UUID] = [];

        console.log('flagAndSettingInit');
    }

    // 泰博及鴻申的棒子依據洗腎機型重寫正確的設定
    // 不管有沒有寫成功皆繼續做後續動作
    function saveBleSetting() {
        return new Promise((resolve, reject) => {
            const cmd = getBaudrateCmd(parser.getBaudrateSetting());
            if (!macAddrWithoutColon) {
                resolve('deviceBrandId not set or not connected');
                return;
            }
            if (!connected) {
                resolve('deviceBrandId not set or not connected');
                return;
            }
            try {
                // 先確認藍牙是否仍連著，若無則 reject
                ble.isConnected(macAddr, () => {
                    ble.write(macAddr, SERVICE_UUID, DEVICESETTING_UUID, cmd.buffer, (buffer) => {
                        console.log('FFF1 sendData ok', cmd, String.fromCharCode.apply(null, cmd));

                        // 等待藍牙棒重置
                        setTimeout(() => {
                            resolve();
                        }, 500);
                    }, (err) => {
                        console.error('FFF1 sendData error', err);
                        reject(err);
                    });
                }, () => {
                    reject(BT_CONNECT_LOSE);
                });
            } catch (error) {
                console.error('save ble setting error', error);
                reject(error);
            }
        });
    }
    /*
        byte 1: 0x00 前置碼
        byte 2: 鴻申 0->1200, 1->2400, 2->4800, 3->9600, 4->14400, 5->19200, 6->38400
                泰博 0->1200, 1->2400, 2->4800, 3->9600, 4->14400, 5->19200, 6->28800, 7->38400
        byte 3: 0x00 -> 8N1
            bits: 0 -> 8bits 0x00
                    1 -> 9bits 0x80
            parity: 0 -> Odd (no) 0x00
                    1 -> Even 0x40
            stop bit: 0 -> 1 stop bit 0x00 
                        1 -> 2 stop bit 0x10
            flow control: 0 -> diable (0X00)
                            1 -> flow control (0X08)
    */
    function getBaudrateCmd(setting) {
        switch (setting.baudrate) {
            case 1200:
                return new Uint8Array([setting.byte1, 0, setting.byte3]);
            case 2400:
                return new Uint8Array([setting.byte1, 1, setting.byte3]);
            case 4800:
                return new Uint8Array([setting.byte1, 2, setting.byte3]);
            case 9600:
                return new Uint8Array([setting.byte1, 3, setting.byte3]);
            case 14400:
                return new Uint8Array([setting.byte1, 4, setting.byte3]);
            case 19200:
                return new Uint8Array([setting.byte1, 5, setting.byte3]);
            case 38400:
                if (macAddrWithoutColon.splice(0, 4) === '5C31') {
                    return new Uint8Array([setting.byte1, 6, setting.byte3]);
                }
                // 泰博
                return new Uint8Array([setting.byte1, 7, setting.byte3]);
            default:   // 9600
                return new Uint8Array([setting.byte1, 3, setting.byte3]);
        }
    }
    // 停止藍牙通知服務並停止連結
    function bleDisconnect() {
        return new Promise((resolve, reject) => {
            clearAllTimer();

            // 表示這次未連線成功
            if (!macAddr) {
                resolve('斷線成功');
                return;
            }

            ble.disconnect(macAddr, () => {
                console.log('ble 斷線成功');
                resolve('斷線成功');    // Disconnected!!
            }, (err) => {
                // plugin 1.2.2 若未連線並斷線會跑失敗，因此需判斷是否在連線的狀態斷線
                if (!connected) {
                    console.log('ble 未連線並斷線 ->', err);
                    resolve('斷線成功');
                    return;
                }

                console.log('ble 斷線失敗 ->', err);
                reject(BT_DISCONNECT_FAIL);  // Failed to disconnect. please restart app
            });
        });
    }

    // 統一錯誤資訊對應
    function errorParser(err) {
        switch (err) {
            case RECEIVING_DATA_TIMEOUT:
                return $translate('bluetooth.receivingDataTimeout');
            case BT_NOT_FOUND:
                return $translate('bluetooth.btNotFound', { macAddr: macAddrWithoutColon });
            case CANNOT_FIND_CORRESPONDING_MACHINE:
                return $translate('bluetooth.cannotFindCorrespondingMachine');
            case BT_POWEROFF:
                return $translate('bluetooth.btPoweroff');
            case BT_DISCONNECT_FAIL:
                return $translate('bluetooth.btDisconnectFail');
            case BT_CONNECT_TIMEOUT:
                return $translate('bluetooth.btConnectError');
            case DATA_FORMAT_WRONG:
                return $translate('bluetooth.dataFormatWrong');
            case BT_CONNECT_LOSE:
                return $translate('bluetooth.btConnectLose');
            case BT_RETRYCONNECT_TIMEOUT:
                return $translate('bluetooth.btRetryConnectError');
            case BT_MAC_ERROR:
                return $translate('bluetooth.btMacError');
            default:
                return $translate('bluetooth.btError', { errorCode: err });
        }
    }
    //#region RaspberryPi-related
    /* 掃藍牙確認周邊是否有 pi
    ** 參數:
        sec -> 幾秒掃一次，若為零則不須 stop
        options -> 為一個物件，傳入 pi 的相關參數，欄位如下:
            1. workType: 叫 pi 做不同的事，目前有:
                GETSETTING, CHANGESETTING, GETTASK, GETSINGLE, SETCONTINUOUS, STOPTASK,
                PAUSETASK, STARTTASK
            2. objectData: 帶入傳給 pi 的資料
            3. scanPiCallback: 掃到 pi 時的 callback，需傳出 rssi 及是否有超過目前設定值的 flag
            4. rssi: 本地目前設定的 db 值
    */
    // temp nfc 靠卡
    function scanPi(options, ndefData) {
        findDeviceSuccess = false;
        return new Promise((resolve, reject) => {
            clearAllTimer();
            // startScan stopScan 每秒掃一次看 db 值決定要連哪一台
            // Test B827EBFDD8B3 >= -50 db
            // report duplicate
            console.log('scanPi');
            if (options) {
                workType = options.workType;
                objectData = options.objectData;
            }

            // 暫存BLE回傳的資料
            _tempData = [];

            ble.startScanWithOptions([], { reportDuplicates: false }, (device) => {
                console.log('ble.scanPi', device);
                // 確認掃到的裝置是否為 pi 且符合連結的距離
                checkDeviceIsPi(device, ndefData).then((result) => {
                    resolve(result);
                });
            }, () => {
                reject('scanPi 與藍牙棒連線時發生錯誤');
            });

            // 如果數秒後還是沒scan到，就return false
            clearTimeout(scanPiTimer);
            scanPiTimer = setTimeout(() => {
                console.log('scan timeout');
                if (!findDeviceSuccess) {
                    // 10 secs 後仍沒找到就停止 scan
                    ble.stopScan(() => {
                        console.info('scan pi timer : stop scan pi!!!');
                    }, () => {
                        // do nothing
                    });
                    reject('scanPi 找不到樹莓派，請靠近樹莓派或請重開樹莓派');
                }
            }, 10000);

        });
    }
    // scanPi(sec, options) {
    //     this.findDeviceSuccess = false;
    //     return new Promise((resolve, reject) => {
    //         this.clearAllScanTimer();
    //         // startScan stopScan 每秒掃一次看 db 值決定要連哪一台
    //         // Test B827EBFDD8B3 >= -50 db
    //         // report duplicate
    //         console.log('scanPi', sec);
    //         let callback = null;
    //         let rssi = null;
    //         if (options) {
    //             this.workType = options.workType;
    //             this.objectData = options.objectData;
    //             callback = options.scanPiCallback;
    //             rssi = options.rssi;
    //         }

    //         // 暫存BLE回傳的資料
    //         this._tempData = [];

    //         ble.startScanWithOptions([], { reportDuplicates: true }, (device) => {
    //             console.log('ble.scanPi', device);
    //             // 確認掃到的裝置是否為 pi 且符合連結的距離
    //             this.checkDeviceIsPi(device, resolve, reject, callback, rssi);
    //         }, () => {
    //             reject('scanPi 與藍牙棒連線時發生錯誤');
    //         });

    //         if (sec) {
    //             // 如果數秒後還是沒scan到，就return false
    //             this.scanPiTimer = setTimeout(() => {
    //                 console.log('scan timeout');
    //                 if (!this.findDeviceSuccess) {
    //                     // 10 secs 後仍沒找到就停止 scan
    //                     ble.stopScan(() => {
    //                         console.info('scan pi timer : stop scan pi!!!');
    //                     }, () => {
    //                         // do nothing
    //                     });
    //                     reject('scanPi 找不到樹莓派，請靠近樹莓派或請重開樹莓派');
    //                 }
    //             }, (sec * 1000));
    //         }

    //     });
    // }

    function stopScanPi() {
        return new Promise((resolve, reject) => {
            // 取消掃描timer
            clearAllTimer();
            ble.stopScan(() => {
                console.log('stop scan Pi !!!!!!!!!!!!!!!');
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    // test for nfc
    function checkDeviceIsPi(device, ndefData) {
        return new Promise((resolve) => {
            macAddrWithoutColon = ndefData.split('**')[0].toUpperCase();
            // 若 Mac 號有符合 pi 的且 目前 rssi 比預設 rssi 還近，就進去判斷裡
            if (device.id.replace(/:/g, '') === macAddrWithoutColon && !findDeviceSuccess) {
                // 須將此 flag 設為 true 才不會進取消的 timer
                findDeviceSuccess = true;
                isBleConnectTimeout = false;
                clearTimeout(scanPiTimer);
                console.log('Find Pi!!!', device);
                macAddr = device.id;

                ble.stopScan(() => {
                    console.info(' checkDeviceIsPi stop scan!!!!!!!!!!!!!!!!!!');
                }, () => {
                    // do nothing
                });
                resolve(device);
            }
        });
    }

    // checkDeviceIsPi(device, resolve, reject, scanPiCallback, rssi) {
    //     let defaultRssi = -45;  // rssi 限制預設為 -45
    //     // for Pi, resolve/reject 表示已連接
    //     let rssiLimit = rssi ? rssi : defaultRssi;   // rssi 限制預設為 -45

    //     // 若 Mac 號有符合 pi 的且 目前 rssi 比預設 rssi 還近，就進去判斷裡
    //     if (device.id.replace(/:/g, '').slice(0, 6).toUpperCase() === RASPBERRYPIBRANDID && device.rssi >= defaultRssi) {

    //         console.log('Find Pi!!!', device);

    //         // 回傳 rssi 值及是否超過目前設定的距離，以利作接續動作
    //         if (typeof (scanPiCallback) === 'function') {
    //             scanPiCallback(device.rssi, device.rssi < rssiLimit);
    //         }

    //         // 以本地端存的 piRssi 為準，若目前 rssi 比本地算出來的設定 rssi 還近才會進行後續連結的動作
    //         if (device.rssi >= rssiLimit) {
    //             // 找到了就停止scan
    //             ble.stopScan(() => {
    //                 console.info(' checkDeviceIsPi stop scan!!!!!!!!!!!!!!!!!!');
    //             }, () => {
    //                 // do nothing
    //             });

    //             // 須將此 flag 設為 true 才不會進取消的 timer
    //             this.findDeviceSuccess = true;

    //             resolve(device);
    //         }
    //     }
    // }

    // options: workType, callback; isConnected: 目前是否仍為連線中，若是則直接 getData
    // ios 需先 scan pi 才能連
    // android 可直接叫用
    function connectPi(deviceId, options, isConnected) {
        clearAllTimer();
        // 暫存BLE回傳的資料
        _tempData = [];
        let callback = null;
        if (options) {
            workType = options.workType;
            callback = options.callback;
        }
        // macAddr = deviceId;
        macAddrWithoutColon = deviceId;
        parser = new raspberryPi({ sendData });
        let piId = deviceId.replace(/:/g, '').slice(0, 6).toUpperCase();
        [SERVICE_UUID, NOTIFY_UUID, WRITE_UUID] =
            [deviceUUID[piId].SERVICE_UUID, deviceUUID[piId].NOTIFY_UUID, deviceUUID[piId].WRITE_UUID];
        BLE_MTU = 9999; // Gino說對樹莓派一次傳就好，不用分段送，所以改為9999超大的範圍才切斷分次上傳

        return new Promise((resolve, reject) => {
            // 若之前已連接尚未斷開，直接叫 parser 做事情即可
            if (isConnected) {
                parser.getData(workType, objectData).then((result) => {
                    resolve(result);
                }, (reason) => {
                    reject(reason);
                });
                return;
            }

            discoverBLEByPlatform(cordova.platformId, macAddrWithoutColon, resolve, reject, options);

            // bleConnect(deviceId).then((peripheral) => {
            //     checkCallbackIsFunctionAndExecute(callback);
            //     return onPeripheralConnectSuccess(peripheral);
            // }, (err) => {
            //     console.log('ble connect error', err);
            //     // removeConnectFailMacAddr(macAddr);
            //     reject(err);
            // }).then((result) => {
            //     resolve(result);
            // }, (err) => {
            //     console.log('ble onPeripheralConnect error', err);
            //     reject(err);
            // });
        });
    }
    //#endregion RaspberryPi-related end

    return rest;
}

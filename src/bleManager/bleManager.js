/* global ble */
/* global bluetoothle */
/**
 * ==============這是BLE MANAGER的入口===============
 * 本專案建立在cordova plugin : cordova-plugin-ble-central 1.1.3
 *
 * author: Cyril Tan 其煜
 * line: smallseven1213
 * email: smallseven@gmail.com
 *
 * 機器註解我只寫V60, 其他細節都需參考儀器 Document
 */

// 以下這段，是引入各個呼吸器解析程式
// import machineV60 from './machineV60'
// import machineGE from './machineGE'
// import machineSERVOi from './machineSERVOi'
// import machineDrager500 from './machineDrager500'
// import machineDrager from './machineDrager'
// import machineHamilton from './machineHamilton'
import fresenius from './fresenius';
import nikkiso from './nikkiso';
import ak96 from './AK96';
import bbraun from './bbraun';
import nipro from './nipro';
import toray from './toray';
import raspberryPi from './raspberryPi';

// 各個藍芽棒的ble設定檔，前4碼為藍芽棒號碼，再讀入其UUID
const deviceUUID = {
    '5C31': {   // 鴻申
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
    C026: {   // taidoc
        SERVICE_UUID: 'FFF0',
        DEVICESETTING_UUID: 'FFF1',
        NOTIFY_UUID: 'FFF2',
        WRITE_UUID: 'FFF3'
    },
    B827EB: {  // Raspberrypi ex. B827EBFDD8B3
        SERVICE_UUID: 'FFF0',
        NOTIFY_UUID: 'FFF1',
        WRITE_UUID: 'FFF1'
    }
};

// ble溝通傳入的bytes限制，超過20則會分兩次以上傳
let BLE_MTU = 20;
const RASPBERRYPIBRANDID = 'B827EB';
const BLECONNECTRETRYTIMES = 3; // 重試藍牙連線的次數
const BLECONNECTRETRYTIMEOUT = 10000;   // 重試藍牙連線若超過十秒，也放棄這次(鴻申棒子曾發生重試連線的 callback 回來必須5秒以上，若要等他重試完三次會太久)

export default class bleManager {

    constructor() {
        this.deviceBrandId = '';    // 判斷目前藍牙的廠牌為何
        this.scanPiTimer = null;    // 掃描 raspberry pi 用的 timer
        this.scanTimer = null;  // 一般在掃藍牙裝置的 timer (會掃十秒)
        this.checkResultTimer = null;   // 藍牙傳輸中 check result 的 timer
        this.bleConnectDelayTimer = null;   //  緩衝藍牙連線的 timer
        this.bleRetryConnectTimer = null;   // 重試藍牙連線的 timer

        this._enableCallback = null;
        this._disableCallback = null;
        this.bleRetryConnectCount = 0;  // 藍牙連線重試計數
        this.connectSuccess = false;    // 供藍牙連線重試timer 判斷是否要放棄這次
    }

    // 重啟藍牙功能 android only
    // enableCallback: 若藍牙狀態為 enable 應做的事情
    // errCallback: 若藍牙啟動失敗應做的事情
    checkBleInit(enableCallback, disableCallback) {
        this._enableCallback = enableCallback;
        this._disableCallback = disableCallback;

        bluetoothle.isInitialized((isInitialized) => {
            if (!isInitialized.isInitialized) {
                // cordova-plugin-bluetoothle 才有 diable 且 enable 不會跳提示 (android only)
                // https://github.com/randdusing/cordova-plugin-bluetoothle#isinitialized
                // 需先 init 才能做其他事情
                bluetoothle.initialize((res) => {
                    console.log('bleInitialize', res);
                    switch (res.status.toLowerCase()) {
                        case 'disabled':
                            console.log('ble disabled!');

                            // 避免再次開啟藍牙會執行之前的事情
                            this._enableCallback = null;

                            setTimeout(() => {
                                if (typeof (this._disableCallback) === 'function') {
                                    this._disableCallback();
                                }
                            }, 500);

                            // setTimeout(() => {
                            //     bluetoothle.enable(() => {
                            //         // 成功不會有 callback，需在 initialize 監聽是否為 enable 成功
                            //         console.log('ble enable!!');
                            //     }, () => {
                            //         if (typeof (this._errCallback) === 'function') {
                            //             this._errCallback();
                            //         }
                            //     });
                            // }, 500);
                            break;
                        case 'enabled':
                            console.log('ble enabled!');
                            // 避免關閉藍牙會執行之前的事情
                            this._disableCallback = null;

                            // delay 個幾秒，等 ble 穩定
                            setTimeout(() => {
                                if (typeof (this._enableCallback) === 'function') {
                                    this._enableCallback();
                                }
                            }, 500);
                            break;
                        default:
                            break;
                    }
                }, {
                        request: false,
                        statusReceiver: true
                    });
            }
        });
    }

    // android only
    disable(errCallback) {
        bluetoothle.disable(() => {
            // 成功不會有 callback，需在 initialize 監聽是否為 disable 成功
        }, () => {
            if (typeof (errCallback) === 'function') {
                errCallback();
            }
        });
    }

    enable(errCallback) {
        bluetoothle.enable(() => {
            // 成功不會有 callback，需在 initialize 監聽是否為 enable 成功
        }, (err) => {
            if (typeof (errCallback) === 'function') {
                errCallback(err);
            }
        });
    }

    setEnableCallback(enableCallback) {
        this._enableCallback = enableCallback;
    }

    setDisableCallback(disableCallback) {
        this._disableCallback = disableCallback;
    }

    // 外部只要使用 var blemanager = new bleManager();
    // blemanager.getData('12345678**4008').then(success,failed);
    /*
    **  options 參數為一個物件，包含 pi 相關的資料:
    **      workType, objectData
    **      callback: 藍牙連線成功後，回傳的 function
    **  isConnected: 目前是否仍為連線中，若是則直接 getData
    */
    getData(ndefText, options, isConnected) {
        return new Promise((resolve, reject) => {
            console.log('ble initialing...');
            // 若有傳入 options 參數，需賦值給相關的變數
            if (options) {
                this.workType = options.workType;
                this.objectData = options.objectData;
            }
            /**
             * 初始化會帶進mac與callbackFunction
             * mac format : 8CDE567890**GE
             * callback function : 處理完成會回叫callback function
             */
            // 確保 ndefText 為沒有 : 的字串
            ndefText = ndefText.replace(/:/g, '');
            this.macAddr = ndefText.split('**')[0]; // ex: 5C313E472ABB
            this.device = ndefText.split('**')[1] ? ndefText.split('**')[1] : ''; // ex: fresenius
            // 透過讀入的前4碼判斷是什麼機器
            this.deviceBrandId = this.macAddr.slice(0, 4);
            try {
                this.SERVICE_UUID = deviceUUID[this.deviceBrandId].SERVICE_UUID;
                this.NOTIFY_UUID = deviceUUID[this.deviceBrandId].NOTIFY_UUID;
                this.WRITE_UUID = deviceUUID[this.deviceBrandId].WRITE_UUID;
                BLE_MTU = 20;
                // 鴻申 & 泰博於 disconnect 前皆須回寫藍牙棒設定
                if (this.deviceBrandId === '5C31' || this.deviceBrandId === 'C026') {
                    this.DEVICESETTING_UUID = deviceUUID[this.deviceBrandId].DEVICESETTING_UUID;
                }
            } catch (e) {
                // 失敗再檢查是否為樹莓派
                if (this.macAddr.slice(0, 6).toUpperCase() === RASPBERRYPIBRANDID) {
                    let piId = this.macAddr.slice(0, 6).toUpperCase();
                    this.SERVICE_UUID = deviceUUID[piId].SERVICE_UUID;
                    this.NOTIFY_UUID = deviceUUID[piId].NOTIFY_UUID;
                    this.WRITE_UUID = deviceUUID[piId].WRITE_UUID;
                    BLE_MTU = 9999; // Gino說對樹莓派一次傳就好，不用分段送，所以改為9999超大的範圍才切斷分次上傳
                } else {
                    reject(`不支援的藍牙棒編號 -> ${this.deviceBrandId}`);
                }

            }

            // 之前已連線且尚未斷線，可直接做機器要做的事且不需做以下初始化的動作
            if (isConnected) {
                this._machine.getData(this.workType, this.objectData).then((result) => {
                    resolve(result);
                }, (reason) => {
                    reject(reason);
                });
                return;
            }

            // 是否在掃瞄藍芽裝置中
            this.isScanning = false;

            this.findDeviceSuccess = false;

            this._deviceId = null;
            this._machine = null;

            // 暫存BLE回傳的資料
            this._tempData = [];

            // 掃瞄次數，累積達5次都找不到就中斷
            this.scanNumber = 0;

            // 根據讀入的devicename,讓this._machine變為指定的機器
            switch (this.device.toLowerCase()) {
                // case 'v60':
                //    this._machine = new machineV60(getDataCallback)
                //    break
                // case 'ge':
                //    this._machine = new machineGE(getDataCallback)
                //    break
                // case 'servoi':
                //    this._machine = new machineSERVOi(getDataCallback)
                //    break
                // case 'drager500':
                //    this._machine = new machineDrager500(getDataCallback)
                //    break
                // case 'drager':
                //    this._machine = new machineDrager(getDataCallback)
                //    break
                // case 'hamilton':
                //    this._machine = new machineHamilton(getDataCallback)
                //    break
                case 'bbraun':
                case 'dialog+':
                    this._machine = new bbraun(this);
                    break;
                case 'fresenius':
                case '4008':
                case '4008s':
                case '4008b':
                case '4008h':
                    this._machine = new fresenius(this);
                    break;
                case 'nikkiso':
                case 'dbb27c':
                    this._machine = new nikkiso(this);
                    break;
                case 'ak96':
                case 'ak96_p35':
                    this._machine = new ak96(this, 'p35');
                    break;
                case 'ak96_p42':
                    this._machine = new ak96(this, 'p42');
                    break;
                case 'nipro':
                case 'ncu-18':
                    this._machine = new nipro(this);
                    break;
                case 'tr3000':
                    this._machine = new toray(this, '3000');
                    break;
                case 'tr8000':
                    this._machine = new toray(this, '8000');
                    break;
                case 'tr321':
                    this._machine = new toray(this, '321');
                    break;
                default:
                    if (this.macAddr.slice(0, 6).toUpperCase() === RASPBERRYPIBRANDID) {
                        this._machine = new raspberryPi(this);
                    } else {
                        reject('找不到對應機器');
                    }
                    break;
            }

            this.isScanning = true;
            console.log('ble.start scan');

            // 10秒後沒反應就報錯
            ble.startScanWithOptions([], { reportDuplicates: false }, (device) => {
                console.log('ble.scan', device);
                // 把找到的device扔進onDiscoverDeviceSuccess function
                this.onDiscoverDeviceSuccess(device, resolve, reject, options.callback);

            }, () => {
                // 失敗
                reject('與藍牙棒連線時發生錯誤');
            });

            // 如果10秒後還是沒scan到，就return false
            this.scanTimer = setTimeout(() => {
                console.log('scan timeout');
                if (!this.findDeviceSuccess) {
                    // 10 secs 後仍沒找到就停止 scan
                    ble.stopScan(() => {
                        console.info('timeout 10 sec stop scan!!!!!!!!!!!!!!!!!!');
                    }, () => {
                        // do nothing
                    });
                    reject(`找不到藍牙棒 -> ${this.macAddr}, 請重開藍牙棒`);
                }
            }, 10000);
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            this.clearAllTimer();
            this.findDeviceSuccess = false;
            this.connectSuccess = false;
            // 鴻申可於 disconnect 前重新設定藍牙棒，沒有 flow control 的問題
            if (this.deviceBrandId === '5C31' && this._machine.getBaudrateSetting().baudrate) {
                // 先確認機型是否有藍牙設定相關參數，若有才進行重設的動作
                this.saveBLESetting().then(() => {
                    this.stopNotificationAndDisconnect(resolve, reject);
                });
            } else {
                this.stopNotificationAndDisconnect(resolve, reject);
            }
            this.deviceBrandId = '';
            this.macAddr = '';

        });
    }

    bleConnect(deviceId, callback, errCallback) {
        const self = this;
        ble.connect(deviceId, (peripheral) => {
            this.bleRetryConnectCount = 0;
            this.connectSuccess = true;
            if (typeof (callback) === 'function') {
                callback(peripheral);
            }
        }, (res) => {
            // 連接Peripheral失敗
            // 重試固定次數的連線
            if (this.bleRetryConnectCount < BLECONNECTRETRYTIMES) {
                self.bleConnectDelayTimer = setTimeout(() => {
                    this.bleConnect(deviceId, callback, errCallback);
                    this.bleRetryConnectCount++;
                    // retry 若超過一定時間就放棄
                    if (this.bleRetryConnectCount === 1) {
                        self.bleRetryConnectTimer = setTimeout(() => {
                            if (typeof (errCallback) === 'function' && !this.connectSuccess) {
                                errCallback(res);
                            }
                        }, BLECONNECTRETRYTIMEOUT);
                    }
                    console.log('ble retry connect times->', this.bleRetryConnectCount);
                }, 500);
            } else {
                this.bleRetryConnectCount = 0;
                if (typeof (errCallback) === 'function') {
                    errCallback(res);
                }
            }
        });
    }

    // 停止藍牙通知服務並停止連結
    stopNotificationAndDisconnect(resolve, reject) {
        ble.stopStateNotifications(() => {
            console.log('stopStateNotifications');
        }, () => {
            console.error('stopStateNotifications err');
        });

        setTimeout(() => {
            ble.disconnect(this._deviceId, () => {
                console.log('ble 斷線成功');
                resolve('讀取完成');
            }, () => {
                console.log('ble 斷線失敗');
                reject('無法中斷與藍牙棒的連線，請再試一次，如果還是不行，請將App滑掉重開。');
            });
        }, 300);
    }

    onDiscoverDeviceSuccess(device, resolve, reject, callback) {
        console.log('onDiscoverDeviceSuccess');

        // 比對傳進來的device name與macAddr，如果有找到就連接device且未連線中
        if ((device.id.replace(/:/g, '') === this.macAddr || device.name === this.macAddr) && !this.findDeviceSuccess) {
            this.findDeviceSuccess = true;
            this._deviceId = device.id;

            // 找到了就停止scan
            ble.stopScan(() => {
                this.isScanning = false;
                console.info('stop scan!!!!!!!!!!!!!!!!!!');
            }, () => {
                // do nothing
            });

            // 然後連接ble, ble連接成功會呼叫本檔案的onPeripheralConnectSuccess
            this.bleConnect(device.id, (peripheral) => {
                console.log('this.bleConnect Peripheral ->', peripheral);
                if (typeof (callback) === 'function') {
                    callback();
                }
                setTimeout(() => {
                    this.onPeripheralConnectSuccess(peripheral, resolve, reject, callback);
                }, 500);
            }, (res) => {
                // 連接Peripheral失敗
                console.error(res, 'ble connect failed');
                reject('與藍牙棒連線時發生錯誤');
            });

            // ble.connect(device.id, (peripheral) => {
            //     if (typeof (callback) === 'function') {
            //         callback();
            //     }
            //     this.onPeripheralConnectSuccess(peripheral, resolve, reject, callback);
            // }, (res) => {
            //     // 連接Peripheral失敗
            //     console.error(res, 'ble connect failed');
            //     reject('與藍牙棒連線時發生錯誤');
            // });
        }
    }

    onPeripheralConnectSuccess(peripheral, resolve, reject) {
        console.log(peripheral, 'onPeripheralConnectSuccess');
        // 連接到了deivce,會把device的peripheral仍進來，請依據藍芽棒的uuid做notify, write與start notification

        // 泰博為避免藍牙棒 flow control 打開，造成先送資料會堵塞的問題，需先重新設定藍牙棒，等 0.5 秒再做以下動作。
        if (this.deviceBrandId === 'C026' && this._machine.getBaudrateSetting().baudrate) {
            // 先確認機型是否有藍牙設定相關參數，若有才進行重設的動作
            this.saveBLESetting().then(() => {
                this.startNotification(resolve, reject);
            });
        } else {
            this.startNotification(resolve, reject);
        }
    }

    // 啟動藍牙通知服務
    startNotification(resolve, reject) {
        let error = false;
        // 連接此NOTIFY_UUID，機器有回傳資料回來就會叫叫machine的onWriteSuccess，並把buffer(bytes)傳進去
        ble.startNotification(this._deviceId, this.SERVICE_UUID, this.NOTIFY_UUID, (buffer) => {
            // this._machine.onDataReceive(buffer, resolve, reject)
            // let bytes = String.fromCharCode.apply(null, new Uint8Array(buffer)).toBytes();
            // const data = new Uint8Array(buffer);
            let bytes = Array.from(new Uint8Array(buffer));
            this._tempData = this._tempData.concat(bytes);
            // console.info(this._tempData);
            // console.info('current received result -> ' + String.fromCharCode.apply(null, this._tempData));
        }, (err) => {
            console.error('NOTIFY_UUID notification error ->', err);
            error = true;
            reject('藍牙無法回傳資料, 請重新操作');
            // throw new Error('藍牙無法回傳資料, 請重新操作');
        });

        // 若為 Taidoc 則須在多一個 FFF1 通道，測試此通道是否有通
        if (this.DEVICESETTING_UUID) {
            ble.startNotification(this._deviceId, this.SERVICE_UUID, this.DEVICESETTING_UUID, (buffer) => {
                // this._onDeviceData.onDeviceData(buffer, this.sendData)
                let bytes = Array.from(new Uint8Array(buffer));
                this._tempData = this._tempData.concat(bytes);
                console.log('DEVICESETTING_UUID notification success', this._tempData);
            }, (err) => {
                console.error(err, 'DEVICESETTING_UUID notification error');
            });
        }

        // 監控notification狀況
        ble.startStateNotifications((state) => {
            if (state === 'on') {
                // 避免 startNotification 有問題仍能進此 function 而出錯
                if (!error) {
                    this._machine.getData(this.workType, this.objectData).then((result) => {
                        resolve(result);
                    }, (reason) => {
                        reject(reason);
                    });
                }
            } else {
                console.log('startStateNotifications faield');
            }
        }, (res) => {
            console.error(res, 'startStateNotifications error');
            reject('藍牙有問題, 請重啟藍牙再試一次');
        });
    }

    /**
     * 由this._machine呼叫的common function
     * 幫忙解析要給機器的cmd(string to bytes)，並將值正式發給藍芽棒 -> 機器
     */
    // rarams: {type: 'WITHOUT_READ'}
    // rarams: {type: 'STOP', stop: 13}
    // rarams: {type: 'START_STOP', start: 03, stop: 13}
    // rarams: {type: 'TIMEOUT', timeout: 2000} // unit: ms
    // rarams: {type: 'LENGTH', length: 500} //unit: bytes length
    // 最後會回傳 byte array
    sendData(cmd, params) {
        const self = this;
        return new Promise((resolve, reject) => {
            // cmd -> Array, write前需轉為Uint8Array
            let dataLength = cmd.length;
            // 輸入cmd bytes如果大於20，要分批傳，分(n / 20)次傳
            if (dataLength > BLE_MTU) {
                const offset = 0;
                let _tmpCmdByRange = [];
                let result = null;
                const writing = false;   // 是否在寫入ble中
                cmd = Array.from(cmd);

                const exeWrite = () => {
                    _tmpCmdByRange = cmd.splice(0, dataLength > 20 ? 20 : dataLength);

                    result = new Uint8Array(_tmpCmdByRange);

                    // 傳入訊息至BLE
                    ble.write(this._deviceId, this.SERVICE_UUID, this.WRITE_UUID, result.buffer, (buffer) => {
                        console.log('long data sendData ok', result, String.fromCharCode.apply(null, result));

                        dataLength = cmd.length;
                        if (dataLength > 0) {
                            exeWrite();
                        } else {
                            // this._tempData = [];
                            checkResult();
                        }
                    }, (res) => {
                        console.error('long data sendData error', res);
                    });
                };
                exeWrite();
            } else {
                const result = new Uint8Array(cmd);

                // 傳入訊息至BLE
                ble.write(this._deviceId, this.SERVICE_UUID, this.WRITE_UUID, result.buffer, (buffer) => {
                    console.log('short data sendData ok', result, String.fromCharCode.apply(null, result));
                    // this._tempData = [];
                    checkResult();
                }, (res) => {
                    console.error('short data sendData error', res);
                });
            }

            this.isReading = true;
            let checkCount = 0;
            const checkResult = () => {
                console.log('check result');
                checkCount += 1;
                switch (params.type.toUpperCase()) {
                    case 'WITHOUT_READ':
                        console.info('resolve WITHOUT_READ');
                        this.isReading = false;
                        resolve();
                        this._tempData = [];
                        break;
                    case 'STOP':
                        if (_.indexOf(this._tempData, params.stop) > -1) {
                            // 將 stop byte 後的 bytes 切掉
                            this._tempData.splice(_.indexOf(this._tempData, params.stop) + 1);

                            console.info('resolve STOP', this._tempData, String.fromCharCode.apply(null, this._tempData));
                            this.isReading = false;
                            resolve(this._tempData);
                            this._tempData = [];
                        }
                        break;
                    case 'START_STOP':
                        if (_.indexOf(this._tempData, params.stop) > -1) {
                            while (this._tempData.length > 0 && this._tempData[0] !== params.start) {
                                this._tempData.shift();
                            }

                            // 將 stop byte 後的 bytes 切掉
                            this._tempData.splice(_.indexOf(this._tempData, params.stop) + 1);

                            console.info('resolve START_STOP', this._tempData, String.fromCharCode.apply(null, this._tempData));
                            this.isReading = false;
                            resolve(this._tempData);
                            this._tempData = [];
                        }
                        break;
                    case 'LENGTH':
                        if (this._tempData.length >= params.length) {
                            console.info('resolve LENGTH', this._tempData, String.fromCharCode.apply(null, this._tempData));
                            this.isReading = false;
                            resolve(this._tempData);
                            this._tempData = [];
                        }
                        break;
                    case 'TIMEOUT':
                        if (params.timeout || params.timeout === 0) {
                            console.info('resolve timeout');
                            this.isReading = false;
                            setTimeout(() => {
                                resolve(this._tempData);
                                this._tempData = [];
                            }, params.timeout);
                        }
                        break;
                    default:
                        break;
                }

                // 如果還在讀取當中, 下一個 100ms 再繼續檢查
                if (this.isReading) {
                    if (checkCount > 100) {
                        this.isReading = false;
                        console.error('讀取超過10秒');
                        reject('讀取超過10秒');
                    }
                    self.checkResultTimer = setTimeout(() => {
                        checkResult();
                    }, 100);
                }
            };
            // checkResult();
        });
    }

    // 依機型重設藍牙棒設定
    saveBLESetting() {
        return new Promise((resolve, reject) => {
            const cmd = this.getBaudrateCmd(this._machine.getBaudrateSetting());
            try {
                ble.write(this._deviceId, this.SERVICE_UUID, this.DEVICESETTING_UUID, cmd.buffer, (buffer) => {
                    console.log('FFF1 sendData ok', cmd, String.fromCharCode.apply(null, cmd));

                    // 等待藍牙棒重置
                    setTimeout(() => {
                        resolve();
                    }, 500);
                }, (res) => {
                    console.error('FFF1 sendData error', res);
                    resolve();
                });
            } catch (error) {
                console.error('save ble setting error', error);
                resolve();
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
    getBaudrateCmd(setting) {
        switch (setting.baudrate) {
            case 1200:
                return new Uint8Array([setting.byte1, 0, setting.byte2]);
            case 2400:
                return new Uint8Array([setting.byte1, 1, setting.byte2]);
            case 4800:
                return new Uint8Array([setting.byte1, 2, setting.byte2]);
            case 9600:
                return new Uint8Array([setting.byte1, 3, setting.byte2]);
            case 14400:
                return new Uint8Array([setting.byte1, 4, setting.byte2]);
            case 19200:
                return new Uint8Array([setting.byte1, 5, setting.byte2]);
            case 38400:
                if (this.deviceBrandId === '5C31') {
                    return new Uint8Array([setting.byte1, 6, setting.byte2]);
                }
                // 泰博
                return new Uint8Array([setting.byte1, 7, setting.byte2]);
            default:   // 9600
                return new Uint8Array([setting.byte1, 3, setting.byte2]);
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
    scanPi(options, ndefData) {
        this.findDeviceSuccess = false;
        return new Promise((resolve, reject) => {
            this.clearAllTimer();
            // startScan stopScan 每秒掃一次看 db 值決定要連哪一台
            // Test B827EBFDD8B3 >= -50 db
            // report duplicate
            console.log('scanPi');
            let callback = null;
            if (options) {
                this.workType = options.workType;
                this.objectData = options.objectData;
            }

            // 暫存BLE回傳的資料
            this._tempData = [];

            ble.startScanWithOptions([], { reportDuplicates: false }, (device) => {
                console.log('ble.scanPi', device);
                // 確認掃到的裝置是否為 pi 且符合連結的距離
                this.checkDeviceIsPi(device, resolve, reject, ndefData);
            }, () => {
                reject('scanPi 與藍牙棒連線時發生錯誤');
            });

            // 如果數秒後還是沒scan到，就return false
            this.scanPiTimer = setTimeout(() => {
                console.log('scan timeout');
                if (!this.findDeviceSuccess) {
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

    clearAllTimer() {
        console.log('clearAllScanTimer!!');
        clearTimeout(this.scanPiTimer);
        clearTimeout(this.scanTimer);
        console.log('checkResultTimer before clean', angular.copy(this.checkResultTimer));
        clearTimeout(this.checkResultTimer);
        console.log('checkResultTimer after clean', angular.copy(this.checkResultTimer));
        clearTimeout(this.bleConnectDelayTimer);
        clearTimeout(this.bleRetryConnectTimer);

    }

    stopScanPi() {
        return new Promise((resolve, reject) => {
            // 取消掃描timer
            this.clearAllTimer();
            ble.stopScan(() => {
                console.log('stop scan Pi !!!!!!!!!!!!!!!');
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    // test for nfc
    checkDeviceIsPi(device, resolve, reject, ndefData) {
        // 若 Mac 號有符合 pi 的且 目前 rssi 比預設 rssi 還近，就進去判斷裡
        if (device.id.replace(/:/g, '') === ndefData && !this.findDeviceSuccess) {
            // 須將此 flag 設為 true 才不會進取消的 timer
            this.findDeviceSuccess = true;
            console.log('Find Pi!!!', device);

            ble.stopScan(() => {
                console.info(' checkDeviceIsPi stop scan!!!!!!!!!!!!!!!!!!');
            }, () => {
                // do nothing
            });


            resolve(device);
        }
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
    // 需先 scan pi 才能連
    connectPi(deviceId, options, isConnected) {
        this.clearAllTimer();
        // 暫存BLE回傳的資料
        this._tempData = [];
        let callback = null;
        if (options) {
            this.workType = options.workType;
            callback = options.callback;
        }
        this._deviceId = deviceId;
        this._machine = new raspberryPi(this);
        let piId = deviceId.replace(/:/g, '').slice(0, 6).toUpperCase();
        this.SERVICE_UUID = deviceUUID[piId].SERVICE_UUID;
        this.NOTIFY_UUID = deviceUUID[piId].NOTIFY_UUID;
        this.WRITE_UUID = deviceUUID[piId].WRITE_UUID;
        BLE_MTU = 9999; // Gino說對樹莓派一次傳就好，不用分段送，所以改為9999超大的範圍才切斷分次上傳
        return new Promise((resolve, reject) => {
            if (isConnected) {
                this._machine.getData(this.workType, this.objectData).then((result) => {
                    resolve(result);
                }, (reason) => {
                    reject(reason);
                });
                return;
            }
            this.bleConnect(deviceId, (peripheral) => {
                this.onPeripheralConnectSuccess(peripheral, resolve, reject);
                if (typeof (callback) === 'function') {
                    callback();
                }
            }, (res) => {
                // 連接Peripheral失敗
                console.error(res, 'ble connect failed');
                reject('與藍牙棒連線時發生錯誤');
            });
            // ble.connect(deviceId, (peripheral) => {
            //     this.onPeripheralConnectSuccess(peripheral, resolve, reject);
            //     if (typeof (callback) === 'function') {
            //         callback();
            //     }
            // }, (res) => {
            //     // 連接Peripheral失敗
            //     console.error(res, 'ble connect failed');
            //     reject('與藍牙棒連線時發生錯誤');
            // });
        });
    }
    //#endregion RaspberryPi-related end

}

// extentions
String.prototype.toBytes = function () {
    let str = this,
        array = [];
    for (let i = 0, l = str.length; i < l; i++) {
        array[i] = str.charCodeAt(i);
    }
    return array;
};
import utf8 from 'utf8';

export default class raspberryPi {

    // new 的時候要把 blemanager 自己傳進來, 後續才能 senddata
    // 才能取得 senddata 回傳的 promise,
    // 也才能存取promise回傳的資料內容
    constructor(bleManager) {
        this.STX = 0x02; // start code
        this.ETX = 0x03; // stop code
        this.bleManager = bleManager;
    }

    getData(workType, objectData) {
        return new Promise((resolve, reject) => {
            console.time('raspberryPi Start');
            let byteArray = [];
            let bodyData = [];
            let concatData = [];
            let params = {
                // type: 'LENGTH',
                // length: 1
                type: 'START_STOP',
                start: this.STX,
                stop: this.ETX
            }; // 預設為單

            // (0x80) 取得目前設定 getSetting
            // (0x90) 更改設定 changeSetting
            // (0x81) 取得目前的任務 getTask
            // (0x91 單次) getSingle
            // (0x92 連續) setContinuous
            // (0x93) 停止任務 stopTask
            // (0x94) 暫停任務 pauseTask
            // (0x95) 重啟任務 startTask
            if (objectData) {
                bodyData = this.string2ByteArray(JSON.stringify(objectData));
                console.log('bodyData -> ' + JSON.stringify(objectData));
            }

            switch (workType.toUpperCase()) {
                case 'GETSETTING':
                    concatData.push(0x80); // (0x80) 取得目前設定 getSetting
                    break;
                case 'CHANGESETTING':
                    byteArray.push(0x90); // (0x90) 更改設定 changeSetting
                    concatData = byteArray.concat(bodyData);
                    break;
                case 'GETTASK':
                    concatData.push(0x81); // (0x81) 取得目前的任務 getTask
                    break;
                case 'GETSINGLE':
                    concatData.push(0x91); // (0x91 單次) getSingle
                    break;
                case 'SETCONTINUOUS':
                    byteArray.push(0x92);
                    concatData = byteArray.concat(bodyData); // (0x92 連續) setContinuous
                    break;
                case 'STOPTASK':
                    concatData.push(0x93); // (0x93) 停止任務 stopTask
                    break;
                case 'PAUSETASK':
                    concatData.push(0x94); // (0x94) 暫停任務 pauseTask
                    break;
                case 'STARTTASK':
                    concatData.push(0x95); // (0x95 重啟任務) startTask
                    break;
                default:
                    // todo: 
                    break;
            }

            let cmd = new Uint8Array(concatData);

            this.bleManager.sendData(cmd, params)
                .then((res) => {
                    // res 先去頭去尾
                    res.splice(0, 1);
                    res.splice(res.length - 1, res.length);

                    let result = utf8.decode(String.fromCharCode.apply(null, res));
                    console.info('raspberryPi Result String: ' + result);

                    try {
                        let data = JSON.parse(result); // 解析完的 data
                        console.log('raspberryPi Result object', JSON.stringify(data));
                        console.timeEnd('raspberryPi Start');
                        resolve(data);
                    } catch (error) {
                        console.timeEnd('raspberryPi Start');
                        // Todo 有可能是字串非 JSON 物件
                        reject(result);
                    }
                })
                .catch((reason) => {
                    console.error('senddata error -> ', reason);
                    console.timeEnd('raspberryPi Start');
                    reject(reason);
                });
        });
    }

    // 字串 -> byte array
    string2ByteArray(cmdString) {
        // 取得 byte array
        cmdString = utf8.encode(cmdString);
        let data = cmdString.split('').map((x) => { return x.charCodeAt(0); });
        return data;
    }
}

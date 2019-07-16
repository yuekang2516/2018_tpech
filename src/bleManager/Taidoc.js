// D40b 3261 內建藍牙
export default class Taidoc {
    constructor(bleManager) {
        this._header = 0x51;
        this.ReadStorageData = 0x26;
        this._stop = 0xA3;

        this.bleManager = bleManager;
    }

    getData() {
        return new Promise((resolve, reject) => {
            try {
                console.log('==================== Taidoc D40b 3261 Start ====================');

                let data = {};

                let cmd = this.createCmd();

                const params = {
                    type: 'LENGTH',
                    length: 8
                };

                this.bleManager.sendData(cmd, params).then((res) => {
                    data = this.parseBP(res);
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                });

            } catch (error) {
                console.error(error.toString());
                reject(error);
            }
        });
    }

    // 51 26 00 00 00 00 A3 1A
    createCmd() {
        let by = [];
        by[0] = this._header;
        by[1] = this.ReadStorageData;   // CommandType
        for (let i = 2; i < 6; i++) {
            by[i] = 0x00;
        }
        by[6] = this._stop;
        by[7] = this.checkSum(by);

        return by;
    }

    checkSum(ary) {
        let result = 0;
        for (let i = 0; i < ary.length; i++) {
            result += ary[i];
        }

        return result % 256;
    }

    // 51 26 68 00 4F 61 A5 34
    parseBP(source) {
        let data = {};
        if (source.length > 0) {
            // 收縮壓
            // data.Bps = source[2] & 0xff; // from Gino
            data.BPS = source[2] & 0xff;
            // 舒張壓
            // data.Bpd = source[4] & 0xff; // from Gino
            data.BPD = source[4] & 0xff;
            // 心跳
            // data.HeartBeat = source[5] & 0xff;   // from Gino
            data.Pulse = source[5] & 0xff;
        }

        return data;
    }
}

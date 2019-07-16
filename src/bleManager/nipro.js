export default class nipro {
    constructor(bleManager) {

        this.CR = 0x0D;
        this.DASH = 0x2D; // -

        const controlCmd = [0x43, 0x43];        // CC
        const stationNum = [0x30, 0x31];
        this.outputCmd = [0x4E, 0x43, 0x55];   // NCU

        // NCU01-00
        /*
            CCXX-YY 若要送出還須加上 data, checksum & CR
            XX: Station number (01-30)
            YY: Command No.
        */
        // read machine status
        this.no00 = [controlCmd[0], controlCmd[1], stationNum[0], stationNum[1], this.DASH, 0x30, 0x30]; // checksum: 0x34 + 0x0D

        // set machine status (send twice)
        this.no30 = [controlCmd[0], controlCmd[1], stationNum[0], stationNum[1], this.DASH, 0x33, 0x30];

        // patient info
        this.no31 = [controlCmd[0], controlCmd[1], stationNum[0], stationNum[1], this.DASH, 0x30, 0x31];

        // 最後的輸出結果
        this.data = {};

        console.log('constructor');
        this.bleManager = bleManager;
    }

   // baudrate setting: 38400 8 N 1
    /*
            byte 1: 0x00 前置碼
            byte 2: 0->1200, 1->2400, 2->4800, 3->9600, 4->14400, 5->19200, 6->38400
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
    getBaudrateSetting() {
        return {
            baudrate: 9600,
            byte1: 0x00,
            byte3: 0x00
        };
    }

    // 依順序取得需要的資料 No.00 -> No.30 -> No.31
    getData() {
        return new Promise((resolve, reject) => {
            try {
                console.log("==================== Nipro Start ====================");
                let data = {};
                let machine = '';
                data.DialysisSystem = 'Nipro';

                // No.00 read machine status
                let cmd = this.createCmd(this.no00);
                const params = {
                    type: 'START_STOP',
                    start: this.outputCmd[0],
                    stop: this.CR
                };

                this.bleManager.sendData(cmd, params)
                    .then((res) => {
                        console.log('No.00 : ' + res);

                        // parse No.00
                        Object.assign(data, this.parseData00(res));
                        resolve(data);
                    })
                    .catch((reason) => {
                        console.error('ble send command error', reason);
                        reject(reason);
                    });

            } catch (ex) {
                console.error(ex.toString());
                reject(ex);
            }
        });
    }

    createCmd(cmd) {
        // 計算 CheckSum & 加上 CR
        cmd.push(this.calculateCheckSum(cmd), this.CR);
        let result = new Uint8Array(cmd);

        return result;
    }

    parseData00(buffer) {
        const dialysis = {};

        let checksumAndCR = buffer.splice(buffer.length - 2, 2);

        // 確認回來的資料確實為 cmd No.00，且 Checksum 正確
        if (buffer[6] !== 0x30 || buffer[7] !== 0x30 || this.calculateCheckSum(buffer) !== checksumAndCR[0]) {
            return dialysis;
        }

        // UFTime - Dialysis remaining time (55, 128-131) 4:00 -> min
        let UFTime = this.decode(buffer, 128, 131);
        if (UFTime.includes(':')) {
            dialysis.UFTime = (UFTime.split(':')[0] * 60) + parseInt(UFTime.split(':')[1]);
        } else {
            dialysis.UFTime = 0;
        }

        // BloodFlowRate - Blood flow (mL/min) (19, 49-51)
        dialysis.BloodFlowRate = this.decode(buffer, 49, 51);

        // VenousPressure (12, 19-22)
        dialysis.VenousPressure = this.decode(buffer, 19, 22);

        // TMP (14, 27-30)
        dialysis.TMP = this.decode(buffer, 27, 30);

        // UFRate - UF speed (L/h) (15, 31-34)
        dialysis.UFRate = this.decode(buffer, 31, 34);

        // TotalUF - Current UF volume(L) (16, 35-39)
        dialysis.TotalUF = this.decode(buffer, 35, 39);

        // DialysisateFlowRate - Syringe flow(mL/h) (20, 52-55)
        dialysis.DialysisateFlowRate = this.decode(buffer, 52, 55);

        // DialysateA - Concentrationsetting Water+A(mEq/L) (31, 74-76)
        // 於前端目前是綁 DialysateDensity
        dialysis.DialysateDensity = this.decode(buffer, 74, 76);

        // DialysateTemperature - Dialysate temperature (degree C) (18, 45-48)
        dialysis.DialysateTemperature = this.decode(buffer, 45, 48);

        // DialysateConductivity - Conductivity (mS/cm) (61, 153-156)
        dialysis.DialysateConductivity = this.decode(buffer, 153, 156);

        // Profile - UF profile (40, 93)
        if (String.fromCharCode(buffer[93]) === '0') {
            dialysis.UFProfile = 'OFF';
        } else if (String.fromCharCode(buffer[93]) === '1') {
            dialysis.UFProfile = 'ON';
        }

        // TotalBloodFlowVolume - Blood accumulation volume (total) (L) (67, 186-191)
        dialysis.TotalBloodFlowVolume = this.decode(buffer, 186, 191);

        // TargetUF - Target UF volume (L) (17, 40-44)
        dialysis.TargetUF = this.decode(buffer, 40, 44);

        return dialysis;
    }

    decode(bytes, start, end) {
        let result = '';
        for (let i = start; i <= end; i++) {
            result += String.fromCharCode(bytes[i]);
        }
        return result.trim();
    }

    // byte[] bytes
    calculateCheckSum(bytes) {
        let CheckSum = 0;
        let i = 0;
        for (i = 0; i < bytes.length; i++) {
            CheckSum += bytes[i];
        }

        return (CheckSum % 16).toString(16).toUpperCase().charCodeAt(0);    // 取完 remainder 後還須轉為 ascii code ex.4 -> 0x34
    }
}

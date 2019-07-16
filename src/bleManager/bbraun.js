export default class bbraun {

    constructor(bleManager) {

        this.SOH = 0x01;
        this.STX = 0x02;
        this.ETX = 0x03;
        this.EOT = 0x04;
        this.ENQ = 0x05;
        this.ACK = 0x06;
        this.RS = 0x1E;
        let addressId = [0x30, 0x31];

        this.fast = [addressId[0], addressId[1], this.ENQ];
        this.gd = [addressId[0], addressId[1], 0x67, 0x64, this.ENQ];
        this.al = [addressId[0], addressId[1], 0x61, 0x6C, this.ENQ];
        this.sw = [addressId[0], addressId[1], 0x73, 0x77, this.ENQ];
        this.iw = [addressId[0], addressId[1], 0x69, 0x77, this.ENQ];
        this.xw = [addressId[0], addressId[1], 0x78, 0x77, this.ENQ];
        this.se = [addressId[0], addressId[1], 0x73, 0x65, this.ENQ];
        this.ACK_EOT = [addressId[0], addressId[1], this.ACK, this.EOT];
        // 最後的輸出結果
        this.data = {};

        // 計算剩餘時間所需的變數
        let requireTherapyTime = 0;
        let therapyTime = 0;
        console.log('constructor');
        this.bleManager = bleManager;
    }

    // baudrate setting: 9600 8N1
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
    /**
     * readData
     *
     * @return
     */
    getData() {
        return new Promise((resolve, reject) => {
            try {
                let data = {};
                let params = {
                    type: 'START_STOP',
                    start: this.STX,
                    stop: this.ETX
                };

                /**
                 * fast - fast call up (必須)
                 */
                let cmd = this.createCmd(this.fast);
                this.bleManager.sendData(cmd, params)
                    .then(() => {
                        // sendAck
                        params = {
                            type: 'TIMEOUT',
                            timeout: 100
                        };
                        cmd = this.createCmd(this.ACK_EOT);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((res) => {
                        params = {
                            type: 'START_STOP',
                            start: this.STX,
                            stop: this.ETX
                        };
                        cmd = this.createCmd(this.gd);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((res) => {
                        /**
                        * gd - equipment data (必須)
                        * 01 30 31 36 46 02 47 48 39 2E 31 32 20 20 20 20 20 1E 47 49 39 2E 31 32 20 20 20 20 20 1E 47 4A
                        * 4D 50 49 20 30 2E 31 33 1E 47 4B 50 41 52 35 2E 30 62 20 31 1E 47 4C 32 32 38 34 37 35 20 1E 47
                        * 4D 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 20 1E 47 4E 20 20 20
                        * 20 20 20 20 20 20 20 20 1E 47 4F 33 34 39 31 03 34 34 39 37 37 38
                        *  016F.GH9.12      GI9.12      GJMPI 0.13 GKPAR5.0b 1 GL228475  GM           GN         GO3491   449778
                        *
                        * GH: Dialog version
                        * GI: TLC version
                        * GJ: DCI data-set id
                        * GK: NIBP version num
                        * GL: Dialog serial number
                        * GM: Patient name
                        * GN: Patient id
                        * GO: Dialog state information
                        */
                        // 沒有 parse
                        // Todo Dialog serial number 需紀錄?，供醫工了解機器的使用狀況 by Vida 171016

                        // sendAck
                        params = {
                            type: 'TIMEOUT',
                            timeout: 100
                        };
                        cmd = this.createCmd(this.ACK_EOT);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((timeout) => {
                        params = {
                            type: 'START_STOP',
                            start: this.STX,
                            stop: this.ETX
                        };
                        cmd = this.createCmd(this.sw);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((res) => {
                        /**
                         * sw - set levels (設定值)
                         * 01 30 31 35 42 02 47 52 33 38 34 30 1E 47 53 30 37 64 30 1E 47 54 30 31 31 38 1E 47 55 30 30 30
                         * 30 30 30 30 30 1E 47 56 30 30 34 36 1E 48 47 30 30 34 36 1E 48 48 32 38 1E 48 49 32 38 1E 48 4A
                         * 35 30 1E 48 4B 64 63 1E 48 4C 32 38 1E 48 4D 38 32 1E 48 4E 32 38 1E 48 4F 63 38 03 45 38 43 41
                         * 33 35
                         *  015B GR3840 GS07d0 GT0118 GU0000000 GV0046 HG0046 HH28 HI28 HJ50 HKdc HL28 HM82 HN28 HOc8 E8CA35
                         *
                         * GR: Req. therapy-time
                         * GS: Req. UF-volume, 目標UF
                         * GT: Req. blood pump speed, 血液流速
                         * GU: Req. heparin rate, Volume = 肝素初次量
                         * GV: Min. art. pressure limit
                         * HG: Max. art. pressure limit
                         * HH: TMP low deviation limit
                         * HI: TMP high deviation
                         * HJ: NIBP alarm limit: min. syst. pres
                         * HK: NIBP alarm limit: max. syst. pres
                         * HL: NIBP alarm limit: min. dia. pres
                         * HM: NIBP alarm limit: max. dia. pres
                         * HN: NIBP alarm limit: min. pulse
                         * HO: NIBP alarm limit: max. pulse
                         */
                        Object.assign(data, this.parseSetting(this.parseResult(res)));

                        // sendAck
                        params = {
                            type: 'TIMEOUT',
                            timeout: 100
                        };
                        cmd = this.createCmd(this.ACK_EOT);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((timeout) => {
                        params = {
                            type: 'START_STOP',
                            start: this.STX,
                            stop: this.ETX
                        };
                        cmd = this.createCmd(this.iw);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((res) => {
                        /**
                         * iw - Actual levels (測量值)
                         * 01 30 31 37 33 02 48 50 30 30 30 30 1E 48 51 30 30 30 30 1E 48 52 30 30 30 30 1E 48 53 30 30 30
                         * 30 1E 48 54 30 30 30 30 30 30 30 30 1E 48 55 66 66 66 66 1E 48 56 30 30 35 35 1E 49 47 30 30 30
                         * 38 1E 49 48 30 31 36 36 1E 49 49 30 31 32 63 1E 49 4A 30 30 38 62 1E 49 4B 30 30 33 61 1E 49 4C
                         * 30 30 1E 49 4D 30 30 1E 49 4E 30 30 1E 49 4F 30 30 30 30 03 43 30 30 33 42 39
                         * 0173 HP0000 HQ0000 HR0000 HS0000 HT00000000 HUffff HV0055 IG0008 IH0166 II012c IJ008b IK003a IL00 IM00 IN00 IO0000 C003B9
                         *
                         * HP: Act. therapy time
                         * HQ: Act. UF removed(net), 累計UF
                         * HR: Act. UF-rate
                         * HS: Blood volume processed, 累積血流量
                         * HT: Act. heparin volume, Sub Volume
                         * HU: Act. arterial pressure
                         * HV: Act. venous pressure, 靜脈壓
                         * IG: Act. TMP
                         * IH: Act. dial. temperature
                         * II: Act. dial. flow
                         * IJ: Act. dial. final cond., 透析濃度
                         * IK: Act. dial. bic. cond.
                         * IL: NIBP systolic value, 有就填
                         * IM: NIBP diastolic value, 有就填
                         * IN: NIBP pulse
                         * IO: NIBP last reading time
                         */
                        Object.assign(data, this.parseMeasure(this.parseResult(res)));

                        // sendAck
                        params = {
                            type: 'TIMEOUT',
                            timeout: 100
                        };
                        cmd = this.createCmd(this.ACK_EOT);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((timeout) => {
                        console.log(data);
                        resolve(data);
                    })
                    .catch((reason) => {
                        console.error('ble send command error', reason);
                        reject(reason);
                    });

                /**
                 * xw - extended data
                 * 01 30 31 36 31 02 49 51 30 31 1E 49 52 30 30 30 30 1E 49 53 30 30 1E 49 54 30 30 30 30 1E 49 55
                 * 30 30 1E 49 56 30 30 37 38 1E 4A 47 30 30 30 30 1E 4A 48 30 30 30 30 1E 4A 49 30 30 30 30 1E 4A
                 * 4A 30 30 30 30 1E 4A 4B 30 30 30 30 1E 4A 4C 30 30 30 30 1E 4A 4D 30 30 30 30 1E 4A 4E 30 30 30
                 * 30 03 45 43 35 42 39 36
                 * 0161 IQ01 IR0000 IS00 IT0000 IU00 IV0078 JG0000 JH0000 JI0000 JJ0000 JK0000 JL0000 JM0000 JN0000 EC5B96
                 *
                 * IQ: Kt/V-UV correction mode
                 * IR: Actual Kt/V Equilibrated
                 * IS: Actual URR Equilibrated
                 * IT: Actual Kt/V Single pool
                 * IU: Actual URR Signal pool
                 * IV: Target Kt/V
                 * JG: Patient weight
                 * JH: Actual average blood flow
                 * JI: Actual average dialysate flow
                 * JJ: Actual HCT
                 * JK: Delta blood volume
                 * JL: Oxygen saturation
                 * JM: Recirculation
                 * IN: Initial HCT
                 */
                //        mBluetoothLeService.write(xw);
                //        byte xwResult[] = mBluetoothLeService.readByStartStop(STX, ETX);
                //        sendAck();
                //        parseExtendData(data, parseResult(xwResult));
            } catch (ex) {
                console.error(ex.toString());
                reject(ex);
            }
        });

    }

    createCmd(cmdAry) {
        console.log('cmd', new Uint8Array(cmdAry));
        // 取得 byte array
        return new Uint8Array(cmdAry);
    }

    parseSetting(data) {
        console.log('swResult String: ' + data);
        let dialysis = {};
        let tmp = data.split(',');
        _.forEach(tmp, (s) => {
            let code = s.substring(0, 2);
            let value = '0x' + s.substring(2, s.length);
            if (code.toLowerCase() === 'gr') {
                // 單位: 分鐘?
                this.requireTherapyTime = parseInt(value);
                console.log('Req. therapy-time: ' + parseInt(value));
            } else if (code.toLowerCase() === 'gs') {
                // dialysis.UFVolume = parseInt(value);
                // ml -> L
                dialysis.TargetUF = parseInt(value) / 1000;
                console.log('Req. UF-volume: ' + dialysis.UFVolume);
            } else if (code.toLowerCase() === 'gt') {
                dialysis.BloodFlowRate = parseInt(value);
                console.log('Req. blood pump speed: ' + parseInt(value));
            } else if (code.toLowerCase() === 'gu') {
                // dialysis.HeparinDeliveryRate = String.valueOf(Float.intBitsToFloat(Integer.valueOf(value, 16)));
                // dialysis.HeparinDeliveryRate = Number(value).toFixed(2);
                dialysis.HeparinOriginal = (Number(value) / 10).toFixed(2);
                console.log('Req. heparin rate: ' + dialysis.HeparinOriginal);
            } else if (code.toLowerCase() === 'gv') {
                console.log('Min. art. pressure limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hg') {
                console.log('Max. art. pressure limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hh') {
                console.log('TMP low deviation limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hi') {
                console.log('TMP high deviation limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hj') {
                console.log('Min. syst. pres. alarm limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hk') {
                console.log('Max. syst. pres. alarm limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hl') {
                console.log('Min. dia. pres. alarm limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hm') {
                console.log('Max. dia. pres. alarm limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hn') {
                console.log('Min. pulse alarm limit: ' + parseInt(value));
            } else if (code.toLowerCase() === 'ho') {
                console.log('Max. pulse alarm limit: ' + parseInt(value));
            }
        });

        console.log('parseSetting result', dialysis);
        return dialysis;
    }

    /**
     * parseMeasure
     *
     * @param dialysis
     * @param data
     */
    parseMeasure(data) {
        console.log('iwResult String: ' + data);
        let dialysis = {};
        let tmp = data.split(',');
        _.forEach(tmp, (s) => {
            let code = s.substring(0, 2);
            let value = '0x' + s.substring(2, s.length);
            if (code.toLowerCase() === 'hp') {
                this.therapyTime = parseInt(value);
                // 計算剩餘時間 RequireTherapyTime - TherapyTime (s) 需變為分鐘
                dialysis.UFTime = (this.requireTherapyTime - this.therapyTime) / 60;
                console.log('Act. therapy time: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hq') {
                // ml -> L
                dialysis.TotalUF = parseInt(value) / 1000;
                console.log('Act. UF removed: ' + parseInt(value));
            } else if (code.toLowerCase() === 'hr') {
                // dialysis.UFRate = String.valueOf(Integer.valueOf(value, 16));
                // ml/h -> L/h
                dialysis.UFRate = parseInt(value) / 1000;
                console.log('Act. UF-rate: ' + dialysis.UFRate);
            } else if (code.toLowerCase() === 'hs') {
                // console.log("Blood volume processed: " + String.valueOf(Double.valueOf(Integer.valueOf(value, 16)) / 100));
                dialysis.TotalBloodFlowVolume = (Number(value) / 100).toFixed(2);
                console.log('Blood volume processed: ' + (Number(value) / 100).toFixed(2));
            } else if (code.toLowerCase() === 'ht') {
                // dialysis.HeparinAccumulatedVolume = String.valueOf(Double.valueOf(Integer.valueOf(value, 16)) / 10);
                // dialysis.HeparinAccumulatedVolume = (Number(value) / 10).toFixed(2);
                // dialysis.SubVolume = (Number(value) / 10).toFixed(2);
                dialysis.HeparinDeliveryRate = (Number(value) / 10).toFixed(2);
                console.log('Act. heparin volume: ' + dialysis.HeparinDeliveryRate);
            } else if (code.toLowerCase() === 'hu') {
                dialysis.ArterialPressure = parseInt(value);
                console.log('Act. arterial pressure: ' + dialysis.ArterialPressure);
            } else if (code.toLowerCase() === 'hv') {
                dialysis.VenousPressure = parseInt(value);
                console.log('Act. venous pressure: ' + dialysis.VenousPressure);
            } else if (code.toLowerCase() === 'ig') {
                dialysis.TMP = parseInt(value);
                console.log('Act. TMP: ' + dialysis.TMP);
            } else if (code.toLowerCase() === 'ih') {
                // dialysis.DialysateTemperature = String.valueOf(Double.valueOf(Integer.valueOf(value, 16)) / 10);
                dialysis.DialysateTemperature = (Number(value) / 10).toFixed(2);
                console.log('Act. dial. temperature: ' + dialysis.DialysateTemperature);
            } else if (code.toLowerCase() === 'ii') {
                dialysis.DialysisateFlowRate = parseInt(value);
                console.log('Act. dial. flow: ' + dialysis.DialysisateFlowRate);
            } else if (code.toLowerCase() === 'ij') {
                // dialysis.DialysateDensity = (Number(value) / 10).toFixed(2);
                dialysis.DialysateConductivity = (Number(value) / 10).toFixed(2);
                console.log('Act. dial. final cond.: ' + (Number(value) / 10).toFixed(2));
            } else if (code.toLowerCase() === 'ik') {
                console.log('Act. dial. bic. cond.: ' + (Number(value) / 10).toFixed(2));
            } else if (code.toLowerCase() === 'il') {
                dialysis.BPS = parseInt(value);
                console.log('NIBP systolic value: ' + dialysis.BPS);
            } else if (code.toLowerCase() === 'im') {
                dialysis.BPD = parseInt(value);
                console.log('NIBP diastolic value: ' + dialysis.BPD);
            } else if (code.toLowerCase() === 'in') {
                dialysis.Pulse = parseInt(value);
                console.log('NIBP pulse value: ' + dialysis.Pulse);
            } else if (code.toLowerCase() === 'io') {
                console.log('NIBP last reading time: ' + parseInt(value));
            }
        });

        console.log('parseMeasure result', dialysis);
        return dialysis;
    }

    /**
     * parseExtendData
     *
     * @param dialysis
     * @param data
     */
    parseExtendData(data) {
        console.log('xwResult String: ' + data);
        let dialysis = {};
        let tmp = data.split(',');
        _.forEach(tmp, (s) => {
            let code = s.substring(0, 2);
            let value = s.substring(2, s.length);
            if (code.toLowerCase('IQ')) {
                console.log('Kt/V-UV correction mode: ' + parseInt(value));
            } else if (code.toLowerCase('IR')) {
                console.log('Actual Kt/V Equilibrated: ' + parseInt(value));
            } else if (code.toLowerCase('IS')) {
                console.log('Actual URR Equilibrated: ' + parseInt(value));
            } else if (code.toLowerCase('IT')) {
                console.log('Actual Kt/V Single pool: ' + parseInt(value));
            } else if (code.toLowerCase('IU')) {
                console.log('Actual URR Single pool: ' + parseInt(value));
            } else if (code.toLowerCase('IV')) {
                console.log('Target Kt/V: ' + parseInt(value));
            } else if (code.toLowerCase('JG')) {
                console.log('Patient weight: ' + parseInt(value));
            } else if (code.toLowerCase('JH')) {
                console.log('Actual average blood flow: ' + parseInt(value));
            } else if (code.toLowerCase('JH')) {
                console.log('Actual average dialysate flow: ' + parseInt(value));
            } else if (code.toLowerCase('JI')) {
                console.log('Actual average dialysate flow: ' + parseInt(value));
            } else if (code.toLowerCase('JJ')) {
                console.log('Actual HCT: ' + parseInt(value));
            } else if (code.toLowerCase('JK')) {
                console.log('Delta blood volume: ' + parseInt(value));
            } else if (code.toLowerCase('JL')) {
                console.log('Oxygen saturation: ' + parseInt(value));
            } else if (code.toLowerCase('JM')) {
                console.log('Recirculation: ' + parseInt(value));
            } else if (code.toLowerCase('JN')) {
                console.log('Initial HCT: ' + parseInt(value));
            }
        });

        return dialysis;
    }

    /**
     * source -> byte array
     * byte array 轉 string
     */
    parseResult(source) {
        if (source == null || source.length === 0) {
            console.log('source empty');
            return null;
        }
        for (let i = 0; i < source.length; i++) {
            // 將 0x1E -> ',' 方便 split
            if ((source[i] & 0xFF) === 0x1E) {
                source[i] = 0x2C;
            }

        }
        console.log('parseResult', String.fromCharCode.apply(null, source).substring(1, source.length - 1));
        return String.fromCharCode.apply(null, source).substring(1, source.length - 1);
    }

}

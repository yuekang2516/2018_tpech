
export default class fresenius {

    // new 的時候要把 blemanager 自己傳進來, 後續才能 senddata
    // 才能取得 senddata 回傳的 promise,
    // 也才能存取promise回傳的資料內容
    // meterType: v1 -> baudrate 2400; v2 -> baudrate 9600
    constructor(bleManager, meterType = 'v1') {

        this.meterType = meterType;
        this.STX = 0x02;
        this.CR = 0x0D;
        this.LF = 0x0A;
        this.ETX = 0x03;
        this.SYN = 0x16;
        this.CAN = 0x18;
        this.EOT = 0x04;
        this.ACK = 0x06;

        // 最後的輸出結果
        this.data = {};

        this.bleManager = bleManager;

        // 重試的次數
        this.RETRYTIMES = 5;
        this.retryCount = 0;
    }

    // baudrate setting: 2400 8N1
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
        // 軟體版本若較新 buadrate 必須設為 9600，因此藉由 metertype return 不同 baudrate
        if (this.meterType === 'v2') {
            return {
                baudrate: 9600,
                byte1: 0x00,
                byte3: 0x00
            };
        }
        return {
            baudrate: 2400,
            byte1: 0x00,
            byte3: 0x00
        };
    }

    getData() {
        return new Promise((resolve, reject) => {
            try {
                let data = {};
                let machine = '';
                let delayms = 300;

                // set address <SYN>/@1<EOT><ETX> 16,2F,40,31,04,03
                // byte[] response = null;
                let cmd = this.createCmd('/@1', false);
                const params = {
                    type: 'STOP',
                    stop: this.ETX
                };

                this.bleManager.sendData(cmd, params)
                    .then((res) => {
                        console.log('/@1 result : ' + res);

                        return this.delay(delayms);
                    })
                    .then(() => {
                        //* Set timeout (1/10 sec with leading 0)
                        cmd = this.createCmd('1T000050', false);
                        return this.bleManager.sendData(cmd, params);
                    })
                    .then((timeout) => {
                        console.log('timeOut value : ' + timeout);
                        return this.delay(delayms);
                    })
                    .then(() => {
                        this.gotMachine(data, machine, resolve, reject);
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

    delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('delay');
                resolve();
            }, ms);
        });
    }

    gotMachine(data, machine, resolve, reject) {
        this.bleManager.sendData(this.createCmd('/I', false), {
            type: 'CHECK_STOP',
            stop: this.ETX,
            checkStr: '/'
        }).then((result) => {
            machine = String.fromCharCode.apply(null, result);
            console.log('/I result : ' + machine);
            // js 版於 ble.factory 已將 syn 切掉，因此開頭會與 java 版差一
            if (machine.endsWith(String.fromCharCode(this.ETX))) {
                machine = machine.substring(0, machine.length - 2);
            }
            let arry = machine.split(' ')[1].split('"');
            if (arry.length >= 2) {
                data.DialysisSystem = arry[1];
            }
            this.gotCD(data, machine, resolve, reject);
        }).catch((reason) => {
            console.error('ble send command error', reason);
            reject(reason);
        });
    }

    gotCD(data, machine, resolve, reject) {
        this.bleManager.sendData(this.createCmd('1?CD', false), {
            type: 'CHECK_LENGTH',
            length: 147,
            checkStr: '1_CD'
        }).then((result) => {
            let res = String.fromCharCode.apply(null, result);
            console.log('1_CD ascci data : ' + res);

            res = res.substring(0, res.length - 2); // 改用長度判斷
            let pos = res.indexOf('1_CD');
            res = res.substring(pos + 4, res.length);
            Object.assign(data, this.parseData(res));
            this.gotHD(data, machine, resolve, reject);
        }).catch((reason) => {
            console.error('ble send command error', reason);
            reject(reason);
        });
    }

    gotHD(data, machine, resolve, reject) {
        this.bleManager.sendData(this.createCmd('1?HD', false), {
            type: 'CHECK_STOP',
            stop: this.ETX,
            checkStr: '1_HD'
        }).then((result) => {
            let res = String.fromCharCode.apply(null, result);
            console.log('1_HD ascci data : ' + res);
            // js 版於 ble.factory 已將 syn 切掉，因此開頭會與 java 版差一
            if (res.endsWith(String.fromCharCode.apply(this.ETX))) {
                res = res.substring(0, res.length - 2);
            }
            if (res.startsWith('1_HD')) {
                this.retryCount = 0;    // 重試次數歸零
                res = res.substring(4, res.length);
                let type = res.split(',');
                console.log('TYPE result : ' + type[0]);
                if (type[0] === 'TY0'
                    || type[0] === '0'
                    || type[0] === '00') {
                    data.HDFType = 'HD';
                } else {
                    data.HDFType = 'HDF';
                    try {
                        data.SubVolume = type[2].substring(2, type[2].length) / 100;
                        console.log('subVolume : ' + data.SubVolume);
                    } catch (e) {
                        console.log('subVolume exception : ' + e.toString());
                    }
                }
                resolve(data);
            } else {
                reject('DATA_FORMAT_WRONG');
            }
        }).catch((reason) => {
            console.error('ble send command error', reason);
            reject(reason);
        });
    }

    createCmd(cmdString, isCRC) {
        // 取得 byte array
        let data = cmdString.split('').map((x) => { return x.charCodeAt(0); });
        let size = 0;
        if (isCRC) {
            size = 4 + data.length;
        } else {
            size = 3 + data.length;
        }

        let result = new Uint8Array(size);
        result[0] = this.SYN;
        for (let i = 0; i < data.length; i += 1) {
            result[i + 1] = data[i];
        }
        if (isCRC) {
            let sum = 0;
            for (let i = 0; i < result.length - 2; i += 1) {
                sum += result[i];
            }
            result[size - 3] = sum % 256;
        }
        result[size - 2] = this.EOT;
        result[size - 1] = this.ETX;
        return result;
    }

    parseData(data) {
        const dialysis = {};

        // byte1
        if (data.substring(1, 2).toLowerCase() === 'k') {
            // byte2
            // 型號
            const code = data.substring(2, 3);
            console.log('Dialysis code : ' + code);
            if (code.toLowerCase() === '3') {
                dialysis.DialysisSystem = '4008';
            } else if (code.toLowerCase() === 'a') {
                dialysis.DialysisSystem = '2008A';
            } else if (code.toLowerCase() === 'b') {
                dialysis.DialysisSystem = '4008B';
            } else {
                dialysis.DialysisSystem = code;
            }
        }
        // byte3
        // 靜脈壓
        if (data.substring(3, 4).toLowerCase() === 'v') {
            // byte4~7
            dialysis.VenousPressure = data.substring(4, 8);
            try {
                dialysis.VenousPressure = dialysis.VenousPressure.replace('+', '');
                dialysis.VenousPressure = parseInt(dialysis.VenousPressure);
                // dialysis.VenousPressure = String.valueOf(Integer
                //     .valueOf(dialysis.VenousPressure));
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte8
        // 動脈壓
        if (data.substring(8, 9).toLowerCase() === 'a') {
            // byte9~12
            dialysis.ArterialPressure = data.substring(9, 13);
        }
        // byte13
        // 膜上壓
        if (data.substring(13, 14).toLowerCase() === 'u') {
            // byte14~17
            dialysis.TMP = data.substring(14, 18);
            try {
                dialysis.TMP = dialysis.TMP.replace('+', '');
                dialysis.TMP = parseInt(dialysis.TMP);
                // dialysis.TMP = String.valueOf(Integer.valueOf(dialysis.TMP));
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte18
        // 動脈血液流速
        if (data.substring(18, 19).toLowerCase() === 'b') {
            // byte19~22
            dialysis.ArterialBloodFlow = data.substring(19, 23);
            dialysis.ArterialBloodFlow = parseFloat(dialysis.ArterialBloodFlow);
            try {
                // dialysis.ArterialBloodFlow = String
                //    .valueOf(Util.decimalFormat.format(Float
                //        .valueOf(dialysis.ArterialBloodFlow)));
            } catch (ex) {
                console.log(ex);
            }
        }

        // byte23
        // Target Temperature (before Dialyzer)
        if (data.substring(23, 24).toLowerCase() === 's') {
            // byte24~27
            dialysis.DialysateTemperatureSet = data.substring(24, 28);
            dialysis.DialysateTemperatureSet = parseFloat(dialysis.DialysateTemperatureSet) / 10;
            try {
                // dialysis.DialysateTemperatureSet = String
                //    .valueOf(Util.decimalFormat.format(Float
                //        .valueOf(dialysis.DialysateTemperatureSet) / 10));
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte28
        // Actual Temperature (before Dialyzer)
        if (data.substring(28, 29).toLowerCase() === 't') {
            // byte29~32
            try {
                dialysis.DialysateTemperature = data.substring(29, 33);
                dialysis.DialysateTemperature = parseFloat(dialysis.DialysateTemperature) / 10;
                // dialysis.DialysateTemperature = String
                //    .valueOf(Util.decimalFormat.format(Float
                //        .valueOf(dialysis.DialysateTemperature) / 10));
            } catch (ex) {
                console.log(ex);
            }

        }
        // byte33 Conductivity 1/10 (mS/cm)
        if (data.substring(33, 34).toLowerCase('c')) {
            // byte34~37
            dialysis.DialysateConductivity = parseFloat(data.substring(34, 38)) / 10;
        }

        // byte38
        // UF - rate
        if (data.substring(38, 39).toLowerCase() === 'r') {
            // byte39~42
            try {
                dialysis.UFRate = data.substring(39, 43) / 1000;
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte43
        // UF Target
        if (data.substring(43, 44).toLowerCase() === 'g') {
            // byte44~47
            try {
                dialysis.TargetUF = data.substring(44, 48) / 1000;
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte48
        // UF Volume
        if (data.substring(48, 49).toLowerCase() === 'p') {
            // byte49~52
            try {
                dialysis.TotalUF = data.substring(49, 53) / 1000;
            } catch (ex) {
                console.log(ex);
            }
        }
        // byte53
        if (data.substring(53, 54).toLowerCase() === 'h') {
            // byte54~57
            dialysis.UFTime = data.substring(54, 58);
        }
        // byte58
        // 透析液流速(設定)
        if (data.substring(58, 59).toLowerCase() === 'f') {
            // byte59
            try {
                dialysis.DialysisateFlowRateSet = data.substring(59, 60) * 100;
            } catch (ex) {
                console.log(ex);
            }
        }

        // byte72
        // 透析液流速
        if (data.substring(72, 73).toLowerCase() === 'i') {
            // byte73~75
            dialysis.DialysisateFlowRate = data.substring(73, 76);
        }
        // byte76
        // 漏血
        if (data.substring(76, 77).toLowerCase() === 'l') {
            // byte77~78
            dialysis.BloodLeak = data.substring(77, 79);
            // byte79~80
            dialysis.CloudingVoltage = data.substring(79, 81);
        }
        // byte93
        // 導電度 Target Sodium 1/10 mmol
        if (data.substring(93, 94).toLowerCase() === 'n') {
            // byte94~97
            dialysis.TargetSodium = data.substring(94, 98);
            dialysis.TargetSodium = parseFloat(dialysis.TargetSodium) / 10;
            // if (dialysis.TargetSodium != null) {
            //    try {
            //        dialysis.TargetSodium = String
            //            .valueOf(Util.decimalFormat.format(Float
            //                .valueOf(dialysis.TargetSodium) / 100));
            //    } catch (Exception e) {
            //        dialysis.TargetSodium = String.valueOf(Float
            //            .valueOf(dialysis.TargetSodium) / 100);
            //    }
            // }
        }
        // byte98
        // 碳酸氫鹽調整
        if (data.substring(98, 99).toLowerCase() === 'b') {
            // byte99~100
            dialysis.BicarbonateAdjustment = data.substring(99, 101);
        }
        // byte101
        // 血液流速
        if (data.substring(101, 102).toLowerCase() === 'q') {
            // byte102~104
            dialysis.EffectiveBloodFlow = data.substring(102, 105);
            dialysis.BloodFlowRate = dialysis.EffectiveBloodFlow;
        }
        // byte105
        // 累積血流量
        if (data.substring(105, 106).toLowerCase() === 'y') {
            // byte106~108
            try {
                dialysis.TotalBloodFlowVolume = data.substring(106, 109) / 10;
            } catch (ex) {
                dialysis.TotalBloodFlowVolume = data.substring(106, 109);
            }

        }
        // byte 122
        // UF Profile
        // Sodium Profile
        if (data.substring(122, 123).toLowerCase() === 'p') {
            try {
                dialysis.UFProfile = data.substring(123, 124);
            } catch (ex) {
                console.log(ex);
            }
            try {
                dialysis.NaProfile = data.substring(124, 125);
            } catch (ex) {
                console.log(ex);
            }
        }

        // byte 125
        // 肝素
        if (data.substring(125, 126).toLowerCase() === 'r') {
            // byte126~128
            try {
                dialysis.HeparinDeliveryRate = data.substring(126, 129) / 10;
            } catch (ex) {
                dialysis.HeparinDeliveryRate = data.substring(126, 129);
            }

        }

        return dialysis;
    }
}

// final result
// ====================================
// ArterialBloodFlow:"0147"
// ArterialPressure:"+000"
// BicarbonateAdjustment:"+0"
// BloodFlowRate:"147"
// BloodLeak:"49"
// CloudingVoltage:"48"
// DialysateTemperature:"0370"
// DialysateTemperatureSet:"0370"
// DialysisSystem:"4008B"
// DialysisateFlowRate:"499"
// DialysisateFlowRateSet:500
// EffectiveBloodFlow:"147"
// HeparinDeliveryRate:0.4
// NaProfile:"0"
// TMP:"067"
// TargetSodium:"1450"
// TargetUF:1.8
// TotalBloodFlowVolume:38.7
// TotalUF:1.714
// UFProfile:"0"
// UFRate:0.515
// UFTime:"0010"
// VenousPressure:"075"
// ====================================

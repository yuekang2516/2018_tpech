export default class nikkiso {

    // new 的時候要把 blemanager 自己傳進來, 後續才能 senddata
    // 才能取得 senddata 回傳的 promise,
    // 也才能存取promise回傳的資料內容
    constructor(bleManager) {

        /**
         * Carriage Return
         */
        this.CR = 0x0D;

        /**
         * NL line feed, new line
         */
        this.LF = 0x0A;

        this.data = {};

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

    getData() {
        return new Promise((resolve, reject) => {
            // String res = "K2143A02.50B00.68C00.80D00250E002.0F036.5G014.4H 0170I 0153J 0061K00054L00500a0b0c0d0e0f0g0h0M1N0O00.00P00.00Q00.00R000.0S000/00T0000/U0000/V0000/i03b";

            let cmd = [0x4B, this.CR, this.LF];
            const params = {
                type: 'STOP',
                stop: this.LF
            };
            this.bleManager.sendData(cmd, params)
                .then((res) => {
                    let datastring = String.fromCharCode.apply(null, res);
                    console.info('Result String: ' + datastring);
                    if (datastring.startsWith('K') || datastring.startsWith('k')) {
                        Object.assign(this.data, this.parseData(datastring));
                    }
                    resolve(this.data);
                })
                .catch((reason) => {
                    console.error('senddata error -> ', reason);
                    reject(reason);
                });
        });
    }

    /**
     * parseData
     * KnLEN
     *
     * @param data
     * @return
     */
    parseData(data) {
        // 回傳的物件
        const dialysis = {};

        // KnLENXXXXXXXXXXXXXXXSUMCRLF
        // SUM
        dialysis.DialysisSystem = 'Nikkiso';

        // DATA 長度
        let len = parseInt(data.substring(2, 5));
        data = data.substring(5, len + 5);
        let position = -1;

        // 目標脫水量 (L)
        position = data.indexOf('A');
        if (position > -1) {
            try {
                dialysis.TargetUF = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.TargetUF = this.getFiveLenValue(data, position);
            }
            console.log('目標脫水量: ' + dialysis.TargetUF);
        }

        // 總脫水量 (L)
        position = data.indexOf('B');
        if (position > -1) {
            try {
                dialysis.TotalUF = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.TotalUF = this.getFiveLenValue(data, position);
            }
            console.log('總脫水量: ' + dialysis.TotalUF);
        }

        // 脫水速度 (L/hr)
        position = data.indexOf('C');
        if (position > -1) {
            try {
                dialysis.UFRate = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.UFRate = this.getFiveLenValue(data, position);
            }
            console.log('脫水速度: ' + dialysis.UFRate);
        }

        // 血液流量
        position = data.indexOf('D');
        if (position > -1) {
            try {
                dialysis.BloodFlowRate = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.BloodFlowRate = this.getFiveLenValue(data, position);
            }
            console.log('血液流量: ' + dialysis.BloodFlowRate);
        }

        // Syringe 流量(肝素)
        position = data.indexOf('E');
        if (position > -1) {
            try {
                dialysis.HeparinDeliveryRate = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.HeparinDeliveryRate = this.getFiveLenValue(data, position);
            }
            console.log('Syringe(肝素) 流量: ' + dialysis.HeparinDeliveryRate);
        }

        // 透析液溫度
        position = data.indexOf('F');
        if (position > -1) {
            try {
                dialysis.DialysateTemperature = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.DialysateTemperature = this.getFiveLenValue(data, position);
            }
            console.log('透析液溫度: ' + dialysis.DialysateTemperature);
        }

        // 透析液濃度 mS/cm -> 導電度
        position = data.indexOf('G');
        if (position > -1) {
            try {
                dialysis.DialysateConductivity = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.DialysateConductivity = this.getFiveLenValue(data, position);
            }
            console.log('透析液濃度: ' + dialysis.DialysateConductivity);
        }

        // 靜脈壓
        position = data.indexOf('H');
        if (position > -1) {
            try {
                dialysis.VenousPressure = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                console.log('靜脈壓: ' + dialysis.VenousPressure);
            }
        }

        // 透析液壓力
        position = data.indexOf('I');
        if (position > -1) {
            try {
                dialysis.DialysatePressure = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.DialysatePressure = this.getFiveLenValue(data, position);
            }
            console.log('透析液壓力: ' + dialysis.DialysatePressure);
        }

        // TMP
        position = data.indexOf('J');
        if (position > -1) {
            try {
                dialysis.TMP = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.TMP = this.getFiveLenValue(data, position);
            }
            console.log('TMP: ' + dialysis.TMP);
        }

        // 透析時間
        position = data.indexOf('K');
        if (position > -1) {
            dialysis.UFTime = this.getFiveLenValue(data, position);
            console.log('透析時間: ' + dialysis.UFTime);
        }

        // 透析液流量
        position = data.indexOf('L');
        if (position > -1) {
            try {
                dialysis.DialysisateFlowRate = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.DialysisateFlowRate = this.getFiveLenValue(data, position);
            }
            console.log('透析液流量: ' + dialysis.DialysisateFlowRate);
        }

        // 治療模式
        position = data.indexOf('N');
        if (position > -1) {
            let mode = this.getOneLenValue(data, position).trim();
            if (mode === '0') {
                dialysis.HDFType = 'HD';
            } else if (mode === '1') {
                dialysis.HDFType = 'ECUM';
            } else if (mode === '2') {
                dialysis.HDFType = 'HDF';
            } else if (mode === '3') {
                dialysis.HDFType = 'HF';
            } else if (mode === '4') {
                dialysis.HDFType = 'OHDF';

            } else {
                dialysis.HDFType = '';
            }

            console.log('治療模式: ' + dialysis.HDFType);
        }

        // 治療中標誌
        position = data.indexOf('M');
        if (position > -1) {
            let flag = this.getOneLenValue(data, position).trim();
            console.log('治療中標誌: ' + flag);
        }

        // 補液目標值
        position = data.indexOf('O');
        if (position > -1) {
            try {
                dialysis.Volume = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.Volume = this.getFiveLenValue(data, position);
            }
            console.log('補液目標值: ' + dialysis.Volume);
        }

        // 補液經過值
        position = data.indexOf('P');
        if (position > -1) {
            try {
                dialysis.SubVolume = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.SubVolume = this.getFiveLenValue(data, position);
            }
            console.log('補液經過值: ' + parseFloat(this.getFiveLenValue(data, position)));
        }

        // 補液速度
        position = data.indexOf('Q');
        if (position > -1) {
            console.log('補液速度: ' + this.getFiveLenValue(data, position));
        }

        // 補液濕度
        position = data.indexOf('R');
        if (position > -1) {
            console.log('補液濕度: ' + this.getFiveLenValue(data, position));
        }

        // 血壓測定時間
        position = data.indexOf('S');
        if (position > -1) {
            console.log('血壓測定時間: ' + this.getFiveLenValue(data, position));
        }

        // 最高血壓
        position = data.indexOf('T');
        if (position > -1) {
            try {
                console.log('最高血壓: ' + parseFloat(this.getFiveLenValue(data, position)));
                dialysis.BPS = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                console.log('最高血壓: ' + this.getFiveLenValue(data, position));
                dialysis.BPS = this.getFiveLenValue(data, position);
            }
        }

        // 最低血壓
        position = data.indexOf('U');
        if (position > -1) {
            try {
                console.log('最低血壓: ' + parseFloat(this.getFiveLenValue(data, position)));
                dialysis.BPD = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                console.log('最低血壓: ' + this.getFiveLenValue(data, position));
                dialysis.BPD = this.getFiveLenValue(data, position);
            }
        }

        // 脈搏
        position = data.indexOf('V');
        if (position > -1) {
            try {
                dialysis.Pulse = parseFloat(this.getFiveLenValue(data, position));
            } catch (e) {
                dialysis.Pulse = this.getFiveLenValue(data, position);
            }

            console.log('脈搏: ' + dialysis.Pulse);
        }

        // 液溫警報
        position = data.indexOf('a');
        if (position > -1) {
            console.log('液溫警報: ' + this.getOneLenValue(data, position));
        }

        // 濃度警報
        position = data.indexOf('b');
        if (position > -1) {
            console.log('濃度警報: ' + this.getOneLenValue(data, position));
        }

        // 靜脈壓警報
        position = data.indexOf('c');
        if (position > -1) {
            console.log('靜脈壓警報: ' + this.getOneLenValue(data, position));
        }

        // 液壓警報
        position = data.indexOf('d');
        if (position > -1) {
            console.log('液壓警報: ' + this.getOneLenValue(data, position));
        }

        // TMP 警報
        position = data.indexOf('e');
        if (position > -1) {
            console.log('TMP 警報: ' + this.getOneLenValue(data, position));
        }

        // 氣泡檢測警報
        position = data.indexOf('f');
        if (position > -1) {
            console.log('氣泡檢測警報: ' + this.getOneLenValue(data, position));
        }

        // 漏血警報
        position = data.indexOf('g');
        if (position > -1) {
            console.log('漏血警報: ' + this.getOneLenValue(data, position));
        }

        // 其他警報
        position = data.indexOf('h');
        if (position > -1) {
            console.log('其他警報: ' + this.getOneLenValue(data, position));
        }

        // 血壓警報
        position = data.indexOf('i');
        if (position > -1) {
            console.log('血壓警報: ' + this.getOneLenValue(data, position));
        }
        return dialysis;
    }


    /**
     * 長度5
     *
     * @param data
     * @param position
     * @return
     */
    getFiveLenValue(data, position) {
        try {
            return data.substring(position + 1, position + 6).trim();
        } catch (e) {
            return null;
        }

    }

    getOneLenValue(data, position) {
        try {
            return data.substring(position + 1, position + 2).trim();
        } catch (e) {
            return null;
        }
    }
}

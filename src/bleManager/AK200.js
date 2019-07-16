/* eslint no-bitwise: 'off' */
// 抓設定值
export default class AK200 {
    constructor(bleManager) {

        this.bleManager = bleManager;

        this.PLUS_BYTE = 0x20;
        this.STX = 0x02;
        this.EOT = 0x04;
        this.ACK = 0x06;
        this.NAK = 0x15; // 21
        this.ESC = 0x1B; // 27
        this.retry = 0;
        this.data = {};

        /**
         * Reset request
         */
        this.ResetRequestCmd = [0x02, 0x44, 0x00, 0x00, 0x00, 0x0E, 0x00, 0x42, 0x00,
            0x01, 0x01, 0xFF, 0x00, 0x01, 0x00, 0xE1, 0xD7, 0x4E, 0x04];

        this.controlBlock11 = [0x00, 0x00, 0xD6, 0x00, 0x42, 0x00, 0x0B, 0x01, 0xFF, 0x01, 0x0A, 0x00, 0xFF,
            0x21, 0x47, 0x00, 0x01, 0x33, 0x03, 0x01, 0x36, 0x03, 0x21, 0x10, 0x00, 0x01, 0x42, 0x00, 0x01, 0x45, 0x00, 0x11,
            0x74, 0x00, 0x01, 0x8F, 0x01, 0x11, 0x7E, 0x00, 0x11, 0x7B, 0x00, 0x11, 0x03, 0x00, 0x11, 0x01, 0x00, 0x11,
            0x01, 0x00, 0x41, 0x6D, 0x00, 0x01, 0xD8, 0x02, 0x01, 0xDB, 0x02, 0x41, 0x71, 0x00, 0x41, 0x72,
            0x00, 0x01, 0x26, 0x03, 0x21, 0x46, 0x00, 0x01, 0xB8, 0x02, 0x41, 0x2C, 0x00, 0x01, 0xF7, 0x00, 0x01,
            0xCA, 0x01, 0x01, 0x60, 0x01, 0x01, 0xF0, 0x01, 0x01, 0xEF, 0x01, 0x41, 0x11, 0x00, 0x41, 0x12, 0x00, 0x41,
            0x13, 0x00, 0x41, 0x14, 0x00, 0x11, 0x67, 0x00, 0x01, 0xDE, 0x02, 0x01, 0x11, 0x02, 0x01, 0xE0, 0x01,
            0x01, 0x9B, 0x02, 0x41, 0x62, 0x00, 0x42, 0x0A, 0x00, 0x42, 0x08, 0x00, 0x04, 0x67, 0x05, 0x04, 0x0E, 0x05,
            0x04, 0x64, 0x05, 0x04, 0xFF, 0x01, 0x04, 0x05, 0x00, 0x04, 0x52, 0x02, 0x04, 0xE4, 0x00, 0x04, 0x0C,
            0x06, 0x04, 0xA6, 0x05, 0x04, 0x98, 0x05, 0x04, 0x16, 0x03, 0x04, 0xDA, 0x05, 0x04, 0x35, 0x04,
            0x04, 0x85, 0x03, 0x04, 0x28, 0x02, 0x04, 0xA0, 0x04, 0x04, 0xD6, 0x05, 0x04, 0x89, 0x05,
            0x44, 0x2E, 0x01, 0x41, 0x20, 0x00, 0x01, 0x9C, 0x01, 0x01, 0x9F, 0x00, 0x01, 0xA0, 0x00, 0x01,
            0xA1, 0x00, 0x01, 0xA2, 0x00, 0x01, 0xA5, 0x00, 0x01, 0xA6, 0x00, 0xFF];

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
            let params = {
                type: 'STOP',
                // start: this.NAK,
                stop: this.EOT
            };
            console.log('==================== AK200 Start ====================');
            let data = {};
            let cmd;
            data.DialysisSystem = 'AK200';

            // isFinish 資料已解析完畢，為了確保 reset 成功多此 flag
            let sendInit = (isFinish = false) => {
                console.log('sendInit()');
                this.retry++;
                this.bleManager.sendData(this.ResetRequestCmd, params)
                    .then((result) => {
                        console.log('init result -> ', result);
                        let decode = this.decodeData(result);
                        console.log('init decode result -> ', decode);
                        // if ((decode[6] & 0xff) == 0x0E && (decode[8] & 0xff) == 0x46) {
                        if ((decode[decode.length - 14] & 0xff) === 0x0E && ((decode[decode.length - 12] & 0xff) === 0x42 || (decode[decode.length - 12] & 0xff) === 0x46)) {
                            console.log('Initialize Reset Communication Success');

                            this.bleManager.sendData([this.ACK], { type: 'WITHOUT_READ' })
                                .then(() => {
                                    if (!isFinish) {
                                        sendRequestCommand();   // 送取 Block cmd
                                    } else {
                                        // 資料已解析完
                                        resolve(this.data);
                                    }
                                });
                        } else {
                            console.log('Initialize Reset Communication error');
                            this.bleManager.sendData([this.ACK], { type: 'WITHOUT_READ' })
                                .then(() => {
                                    if (this.retry < 5 && !isFinish) {
                                        setTimeout(() => {
                                            sendInit();
                                        }, this.TIME_OUT);
                                    } else if (this.retry < 5 && !isFinish) {
                                        setTimeout(() => {
                                            sendInit(true);
                                        }, this.TIME_OUT);
                                    } else if (!isFinish) {
                                        reject('send Init failed');
                                    } else {
                                        this.retry = 0;
                                        resolve(this.data);
                                    }
                                });
                        }
                    })
                    .catch((reason) => {
                        console.error('ble send command error', reason);
                        reject(reason);
                    });
            };
            sendInit();

            let sendRequestCommand = () => {

                cmd = this.createRequestCmd(0x01, this.controlBlock11);
                console.log('createRequestCmd for AK200 ', cmd);

                this.bleManager.sendData(cmd, params)
                    .then((result) => {
                        let decode = this.decodeData(result);
                        console.log('createRequestCmd decode result -> ', decode);
                        sendACK();
                    })
                    .catch((reason) => {
                        console.error(reason);
                        reject(reason);
                    });
            };

            let sendACK = () => {
                this.bleManager.sendData([this.ACK], params)
                    .then((result) => {
                        if (result[0] === 0x06) {
                            result.shift();
                        }
                        let decode = this.decodeData(result);
                        console.log('sendack result -> ', decode);
                        if (decode[0] === this.NAK) {
                            sendInit();
                        } else if ((decode[5] & 0xff) === 0x0E && ((decode[decode.length - 12] & 0xff) === 0x42 || (decode[decode.length - 12] & 0xff) === 0x46)) {
                            console.log('收到 reset response, 重送 ack');
                            sendACK();
                        } else if (decode[8] === 0 && decode[9] === 11) {
                            // js 版跟 android 不一樣, 因為 js 版有時會回6開頭, 有時不會,
                            // 所以前幾行把6拿掉, 後面的個數計算會比 android 版本少一
                            console.log('重送 ack');
                            sendACK();
                        } else if (decode[8] === 1 && decode[9] === 11) {
                            console.log('got Data Block');
                            Object.assign(this.data, this.parserData11(decode));

                            this.retry = 0;

                            // 結束也需 reset，並確認成功
                            sendInit(true);
                            // this.bleManager.sendData(this.ResetRequestCmd, { type: 'WITHOUT_READ' })
                            //     .then(() => {
                            //         // do nothing
                            //     });
                            // resolve(this.data);
                        } else {
                            console.log('回傳格式有誤, 請重新操作');
                            reject('回傳格式有誤, 請重新操作');
                        }
                    })
                    .catch((reason) => {
                        reject(reason);
                    });
            };

        });
    }


    // int index, byte[] request
    createRequestCmd(index, request) {
        if (request === null) {
            return null;
        }

        let result = []; // new Uint8Array(request.length + 7);
        let size = this.calculateByteSize(request);
        request[2] = size[0];
        request[3] = size[1];

        let crc = this.calculate_CRC(request);
        // System.arraycopy(request, 0, result, 3, request.length);
        result[0] = 0x00; // 先給一個0, encode 之後再轉為 2
        result[1] = 0x44;
        result[2] = index;
        result = result.concat(request);
        result = result.concat([0, 0, 0, 0]);
        result[result.length - 4] = crc[0];
        result[result.length - 3] = crc[1];
        result[result.length - 2] = this.calculateCheckSum(result);
        result = this.encodeData(result);
        result[0] = 0x02;
        result[result.length - 1] = 0x04;
        return new Uint8Array(result);
    }

    // byte[] bytes
    calculateByteSize(bytes) {
        let length = bytes.length + 2;
        return [length & 0xff, (length >> 8) & 0xff];
    }

    // byte[] bytes
    calculate_CRC(bytes) {
        let crc = 0x00;          // initial value
        let polynomial = 0x1021;
        for (let index = 0; index < bytes.length; index++) {
            let b = bytes[index];
            for (let i = 0; i < 8; i++) {
                let bit = ((b >> (7 - i) & 1) === 1);
                let c15 = ((crc >> 15 & 1) === 1);
                crc <<= 1;
                if (c15 ^ bit) crc ^= polynomial;
            }
        }
        crc &= 0xffff;
        return [crc & 0xff, (crc >> 8) & 0xff];
    }

    // byte[] bytes
    calculateCheckSum(bytes) {
        let CheckSum = 0;
        let i = 0;
        for (i = 0; i < bytes.length; i++) {
            CheckSum += bytes[i] & 0xFF;
        }
        return CheckSum % 256;
    }

    // byte data[]
    encodeData(data) {
        let result = [];
        if (data === null) {
            return null;
        }

        for (let buffer in data) {
            if (data[buffer] === this.STX || data[buffer] === this.EOT || data[buffer] === this.ACK || data[buffer] === this.NAK || data[buffer] === this.ESC) {
                result.push(this.ESC);
                result.push(data[buffer] + this.PLUS_BYTE);
            } else {
                result.push(data[buffer]);
            }
        }
        return result;
    }

    // byte data[]
    decodeData(data) {
        if (data === null) {
            return null;
        }

        let result = [];
        let isSubtract = false;
        for (let buffer in data) {
            if (data[buffer] === this.ESC) {
                isSubtract = true;
            } else {
                if (isSubtract) {
                    result.push(data[buffer] - this.PLUS_BYTE);
                    isSubtract = false;
                } else {
                    result.push(data[buffer]);
                }
            }
        }

        return result;
    }

    // byte buffer[], Dialysis data
    parserData11(buffer) {
        let data = {};

        // 靜脈壓 Venous pressure PRI(PI_VPR)
        data.VenousPressure = ((buffer[12] & 0xff) + (buffer[13] << 8)) / 10;
        console.log('Venous pressure: ' + data.VenousPressure);

        // 靜脈壓上限 Venous pressure high limit ORI(OI_VPR$HL)
        console.log('Venous pressure high limit: ' + (((buffer[14] & 0xff) + (buffer[15] << 8)) / 10));

        // 靜脈壓下限 Venous pressure low limit ORI(OI_VPR$LL)
        console.log('Venous pressure low limit: ' + (((buffer[16] & 0xff) + (buffer[17] << 8)) / 10));

        // 動脈壓 Arterial pressure PRI(PI_ART$PR)
        data.ArterialPressure = ((buffer[18] & 0xff) + (buffer[19] << 8)) / 10;
        console.log('Arterial pressure: ' + data.ArterialPressure);

        // 動脈壓上限 Arterial pressure high limit ORI(OI_ART$PR$HL)
        console.log('Arterial pressure high limit: ' + (((buffer[20] & 0xff) + (buffer[21] << 8)) / 10));

        // 動脈壓下限 Arterial pressure pressure low limit ORI(OI_ART$PR$LL)
        console.log('Arterial pressure low limit: ' + (((buffer[22] & 0xff) + (buffer[23] << 8)) / 10));

        // 肝素累計量 Heparine volume BRI(BI_HEP$ACC)
        data.HeparinAccumulatedVolume = ((buffer[24] & 0xff) + (buffer[25] << 8)) / 10;
        console.log('Heparine volume: ' + data.HeparinAccumulatedVolume);

        // 肝素速率 Heparine rate ORI(OI_HEP$SET)
        data.HeparinDeliveryRate = ((buffer[26] & 0xff) + (buffer[27] << 8)) / 10;
        console.log('Heparine rate: ' + data.HeparinDeliveryRate);

        // Momentary blood flow in single needle mode, see ORL(O_SN$MODE$LMP$ON) BRI(BI_MEAN$BL$FL)
        console.log('Momentary blood flow in single needle mode: ' + (((buffer[28] & 0xff) + (buffer[29] << 8)) / 10));

        // 血液流速 Momentary blood flow BRI(BI_INST$ART$BL$FL)
        data.BloodFlowRate = ((buffer[30] & 0xff) + (buffer[31] << 8)) / 10;
        console.log('Momentary blood flow: ' + data.BloodFlowRate);

        // Accumulated blood volume in single needle mode, see ORL(O_SN$MODE$LMP$ON) BRI(BI_ACC$VEN$TMT$VOL)
        console.log('Accumulated blood volume in single needle mode: ' + (((buffer[32] & 0xff) + (buffer[33] << 8)) / 100));

        // 血液累計量 Accumulated blood volume BRI(BI_ACC$ART$TMT$VOL)
        data.TotalBloodFlowVolume = ((buffer[34] & 0xff) + (buffer[35] << 8)) / 100;
        console.log('Accumulated blood volume: ' + data.TotalBloodFlowVolume);

        // Tidal volume BRI(BRI(BI_TID$VOL)
        console.log('Tidal volume: ' + (((buffer[36] & 0xff) + (buffer[37] << 8)) / 100));

        // 跨膜壓 TMP FRI(FI_TMP)
        data.TMP = ((buffer[38] & 0xff) + (buffer[39] << 8)) / 10;
        console.log('TMP: ' + data.TMP);

        // 跨膜壓上限 TMP high limit ORI(OI_TMP$HL)
        console.log('TMP high limit: ' + (((buffer[40] & 0xff) + (buffer[41] << 8)) / 10));

        // 跨膜壓下限 TMP low limit ORI(OI_TMP$LL)
        console.log('TMP low limit: ' + (((buffer[42] & 0xff) + (buffer[43] << 8)) / 10));

        // 脫水率 UF rate FRI(FI_UF$RATE)
        data.UFRate = ((buffer[44] & 0xff) + (buffer[45] << 8)) / 1000;
        console.log('UF rate: ' + data.UFRate);

        // 脫水量 UF Volume FRI(FI_UF$VOL)
        data.TotalUF = ((buffer[46] & 0xff) + (buffer[47] << 8)) / 1000;
        console.log('UF Volume: ' + data.TotalUF);

        // 脫水量(設定值) UF Volume, set value ORI(OI_UF$VOL$SET)
        data.TargetUF = ((buffer[48] & 0xff) + (buffer[49] << 8)) / 1000;
        console.log('UF Volume, set value: ' + data.TargetUF);

        // 透析液溫度 Fluid temperature PRI(PI_TEMP$B)
        data.DialysateTemperature = ((buffer[50] & 0xff) + (buffer[51] << 8)) / 100;
        console.log('Fluid temperature: ' + data.DialysateTemperature);

        // 透析液溫度(設定值) Fluid temperature, set value ORI(OI_TEMP$SET)
        data.DialysateTemperatureSet = ((buffer[52] & 0xff) + (buffer[53] << 8)) / 100;
        console.log('Fluid temperature, set value: ' + data.DialysateTemperatureSet);

        // 導電度 Conductivity FRI(FI_COND)
        data.DialysateConductivity = ((buffer[54] & 0xff) + (buffer[55] << 8)) / 100;
        console.log('Conductivity: ' + data.DialysateConductivity);

        // Sodium set value in acetate mode, see ORL(O_AC$MODE$LMP$ON) ORI(OI_NA$AC$SET)
        console.log('Sodium set value in acetate mode: ' + (((buffer[56] & 0xff) + (buffer[57] << 8)) / 10));

        // 鈉設定量 Sodium set value in bicarbonate mode, see ORL(O_BC$MODE$LMP$ON) ORI(OI_NA$SET)
        console.log('Sodium set value in bicarbonate mode: ' + (((buffer[58] & 0xff) + (buffer[59] << 8)) / 10));

        // 重碳酸根設定量 Bicarbonate set value ORI(OI_HCO3$SET)
        console.log('Bicarbonate set value: ' + (((buffer[60] & 0xff) + (buffer[61] << 8)) / 10));

        // 輸注量(累計量) Accumulated infusion volume ORI(OI_HDF$INF$VOL)
        data.SubVolume = ((buffer[62] & 0xff) + (buffer[63] << 8)) / 100;
        console.log('Accumulated infusion volume: ' + data.SubVolume);

        // 輸注量(設定值) Infusion volume, set value ORI(OI_HDF$INF$VOL$SET)
        console.log('Infusion volume, set value: ' + (((buffer[64] & 0xff) + (buffer[65] << 8)) / 100));


        // 收縮壓 Systolic blood pressure FRI(FI_BPM$SYS)
        data.BPS = ((buffer[66] & 0xff) + (buffer[67] << 8));
        console.log('Systolic blood pressure: ' + data.BPS);

        // 舒張壓 Diastolic blood pressure FRI(FI_BPM$DIA)
        data.BPD = ((buffer[68] & 0xff) + (buffer[69] << 8));
        console.log('Diastolic blood pressure: ' + data.BPD);

        // 平均壓 Mean blood pressure FRI(FI_BPM$MEAN)
        console.log('Mean blood pressure: ' + ((buffer[70] & 0xff) + (buffer[71] << 8)));

        // 脈博 Heart rate FRI(FI_BPM$RATE)
        data.Pulse = ((buffer[72] & 0xff) + (buffer[73] << 8));
        console.log('Heart rate: ' + data.Pulse);

        // BVS value BRI(BI_BVS$REL$BV)
        console.log('BVS value: ' + (((buffer[74] & 0xff) + (buffer[75] << 8)) / 10));

        // 跨膜壓設定值 TMPset value ORI(OI_TMP$SET)
        console.log('TMPset value: ' + (((buffer[76] & 0xff) + (buffer[77] << 8)) / 10));

        // 經過時間 Passed time ORI(OI_PASSED$TIME)
        console.log('Passed time: ' + ((buffer[78] & 0xff) + (buffer[79] << 8)));

        // 無擴散作用時間 Non diffusion time ORI(OI_NON$DIFF$TIME)
        console.log('Non diffusion time: ' + ((buffer[80] & 0xff) + (buffer[81] << 8)));

        // 剩餘治療時間 Remaining treatment time ORI(OI_REMAIN$TIME)
        data.UFTime = ((buffer[82] & 0xff) + (buffer[83] << 8));
        console.log('Remaining treatment time: ' + data.UFTime);

        // 剩餘消毒時間
        console.log('Remaining disinfection time: ' + ((buffer[84] & 0xff) + (buffer[85] << 8)));

        // 序號
        console.log('Serial number: ' + ((buffer[86] & 0xff) + (buffer[87] << 8)));

        // 機器型號 Monitor type, AK 200 = 5, AK 200 ULTRA= 6, AK 200 S= 7, AK 200 S ULTRA= 8
        console.log('Monitor type: ' + ((buffer[88] & 0xff) + (buffer[89] << 8)));

        // Single needle mode on
        console.log('Single needle mode on: ' + buffer[90]);

        // UF profile on
        console.log('UF profile on: ' + buffer[91]);

        // Single needle/double pump mode on
        console.log('Single needle/double pump mode on: ' + buffer[92]);

        // Bicarbonate mode on
        console.log('Bicarbonate mode on: ' + buffer[93]);

        // Acetate mode on
        console.log('Acetate mode on: ' + buffer[94]);

        // General alarm
        console.log('General alarm: ' + buffer[95]);

        // Attention alarm
        console.log('Attention alarm: ' + buffer[96]);

        // Venous pressure alarm
        console.log('Venous pressure alarm: ' + buffer[97]);

        // TMP alarm
        console.log('TMP alarm: ' + buffer[98]);

        // Temperature alarm
        console.log('Temperature alarm: ' + buffer[99]);

        // Conductivity alarm
        console.log('Conductivity alarm: ' + buffer[100]);

        // UF Volume alarm
        console.log('UF Volume alarm: ' + buffer[101]);

        // Air detector alarm
        console.log('Air detector alarm: ' + buffer[102]);

        // Arterial pressure alarm
        console.log('Arterial pressure alarm: ' + buffer[103]);

        // Blood leakage
        console.log('Blood leakage: ' + buffer[104]);

        // pH alarm
        console.log('pH alarm: ' + buffer[105]);

        // UF Rate alarm
        console.log('UF Rate alarm: ' + buffer[106]);

        // Technical alarm
        console.log('Technical alarm: ' + buffer[107]);

        // Low level water alarm
        console.log('Low level water alarm: ' + buffer[108]);

        // 透析液流速
        data.DialysisateFlowRate = ((buffer[109] & 0xff) + (buffer[110] << 8)) / 10;
        console.log('Dialysis fluid flow: ' + data.DialysisateFlowRate);

        // 肝素停止時間
        console.log('Heparine stop limit: ' + ((buffer[111] & 0xff) + (buffer[112] << 8)));

        // 收縮壓上限
        console.log('Systolic blood pressure, high limit: ' + ((buffer[113] & 0xff) + (buffer[114] << 8)));

        // 收縮壓下限
        console.log('Systolic blood pressure, low limit: ' + ((buffer[115] & 0xff) + (buffer[116] << 8)));

        // 舒張壓上限
        console.log('Diastolic blood pressure, high limit: ' + ((buffer[117] & 0xff) + (buffer[118] << 8)));

        // 舒張壓下限
        console.log('Diastolic blood pressure, low limit: ' + ((buffer[119] & 0xff) + (buffer[120] << 8)));

        // 脈搏 上限
        console.log('Pulse, high limit: ' + ((buffer[121] & 0xff) + (buffer[122] << 8)));

        // 脈搏 下限
        console.log('Pulse, low limit: ' + ((buffer[123] & 0xff) + (buffer[124] << 8)));

        return data;
    }
}

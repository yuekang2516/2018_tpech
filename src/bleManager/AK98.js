/* eslint no-bitwise: 'off' */
// 抓設定值
export default class AK98 {

    /** AK98 Communication flow
     * init -> 若有 0x0E / 0x46 表 reset 成功 -> 25 block -> 回 ACK。若回 0x01 / 0x19 表為要的資料，需解析 -> init 否則機器會一直吐資料
     * 從機器有收到資料都須回 ACK
     */
    // AK98 分兩種版本，送的 cmd 不同
    constructor(bleManager, meterType = 'v1') {

        this.TIME_OUT = 1500;

        this.bleManager = bleManager;
        this.meterType = meterType;

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
        this.ResetRequestCmd = [0x02, 0x44, 0x00, 0x00, 0x00, 0x1B, 0x2E, 0x00, 0x42,
            0x00, 0x1B, 0x21, 0x1B, 0x21, 0xFF, 0x00, 0x1B, 0x21, 0x00, 0xE1, 0xD7, 0x4E, 0x04];

        this.BlockControl_V1 = [0x00, 0x00, 0x6A, 0x00, 0x46, 0x00, 0x0B, 0x01, 0x00, 0x01, 0x0A, 0x00, 0xFF, 0x24, 0x55,
            0x0E, 0x24, 0x25, 0x0E, 0x14, 0x2A, 0x16, 0x11, 0xBA, 0x15, 0x11, 0xB0, 0x15, 0x11, 0xAC, 0x15, 0x01, 0x27, 0x09,
            0x14, 0x3D, 0x16, 0x11, 0xA6, 0x15, 0x11, 0xB6, 0x15, 0x11, 0xB7, 0x15, 0x41, 0x51, 0x10, 0x41, 0x58, 0x10, 0x11,
            0xA5, 0x15, 0x41, 0x32, 0x10, 0x01, 0x62, 0x09, 0x41, 0x29, 0x10, 0x01, 0x31, 0x09, 0x01, 0x2D, 0x09, 0x01, 0x23,
            0x09, 0x01, 0x37, 0x09, 0x01, 0x36, 0x09, 0x01, 0x52, 0x09, 0x42, 0x4C, 0x15, 0x42, 0x4D, 0x15, 0x42, 0x4E, 0x15,
            0x42, 0x4F, 0x15, 0x41, 0x05, 0x10, 0x01, 0x70, 0x09, 0x22, 0x27, 0x1F, 0xFF];

        this.BlockControl_V2 = [0x00, 0x00, 0x6A, 0x00, 0x46, 0x00, 0x0B, 0x01, 0x00, 0x01, 0x0A, 0x00, 0xFF, 0x24, 0x6E,
            0x0E, 0x24, 0x3E, 0x0E, 0x14, 0x51, 0x16, 0x11, 0xE1, 0x15, 0x11, 0xD7, 0x15, 0x11, 0xD3, 0x15, 0x01, 0x27, 0x09,
            0x14, 0x64, 0x16, 0x11, 0xCD, 0x15, 0x11, 0xDD, 0x15, 0x11, 0xDE, 0x15, 0x41, 0x71, 0x10, 0x41, 0x78, 0x10, 0x11, 0xCC,
            0x15, 0x41, 0x52, 0x10, 0x01, 0x62, 0x09, 0x41, 0x49, 0x10, 0x01, 0x31, 0x09, 0x01, 0x2D, 0x09, 0x01, 0x23, 0x09, 0x01,
            0x37, 0x09, 0x01, 0x36, 0x09, 0x01, 0x52, 0x09, 0x42, 0x73, 0x15, 0x42, 0x74, 0x15, 0x42, 0x75, 0x15, 0x42, 0x76, 0x15,
            0x41, 0x25, 0x10, 0x01, 0x70, 0x09, 0x22, 0x51, 0x1F, 0xFF];

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
            console.log('==================== AK98 Start ====================', this.meterType);
            let data = {};
            let cmd;
            data.DialysisSystem = 'AK98';

            // isFinish 資料已解析完畢，為了確保 reset 成功多此 flag
            // 06 02 44 01 00 00 0E 00 42 00 01 01 00 00 01 00 42 9C 76 04
            let sendInit = (isFinish = false) => {
                console.log('sendInit()');
                this.retry++;
                this.bleManager.sendData(this.ResetRequestCmd, params)
                    .then((result) => {
                        console.log('init result -> ', result);
                        let decode = this.decodeData(result);
                        console.log('init decode result -> ', decode);
                        // if ((decode[6] & 0xff) == 0x0E && (decode[8] & 0xff) == 0x46) {
                        if ((decode[decode.length - 14] & 0xff) === 0x0E && (decode[decode.length - 12] & 0xff) === 0x42) {
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
                // STEP_FIRST_CONTROL_BLOCK
                // 根據 meterType 送相應的 cmd
                if (this.meterType.toLowerCase() === 'v1') {
                    cmd = this.createRequestCmd(0x01, this.BlockControl_V1);
                } else {
                    cmd = this.createRequestCmd(0x01, this.BlockControl_V2);
                }
                console.log('createRequestCmd for AK98 ', cmd, this.meterType);

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
                        } else if ((decode[5] & 0xff) === 0x0E && (decode[7] & 0xff) === 0x42) {
                            console.log('收到 reset response, 重送 ack');
                            sendACK();
                        } else if (decode[8] === 0 && decode[9] === 11) {
                            // js 版跟 android 不一樣, 因為 js 版有時會回6開頭, 有時不會,
                            // 所以前幾行把6拿掉, 後面的個數計算會比 android 版本少一
                            console.log('重送 ack');
                            sendACK();
                        } else if (decode[8] === 1 && decode[9] === 11) {
                            console.log('got Data Block');
                            Object.assign(this.data, this.parserData1(decode));

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

            // initialize
            // this.bleManager.sendData(this.ResetRequestCmd, params)
            //     .then((result) => {
            //         console.log('init result -> ', result);
            //         let decode = this.decodeData(result);
            //         console.log('init decode result -> ', decode);
            //         if ((decode[6] & 0xff) == 0x0E && (decode[8] & 0xff) == 0x46) {
            //             console.log('Initialize Reset Communication Success');

            //             let retry = 0;
            //             // STEP_FIRST_CONTROL_BLOCK
            //             if (this.meterType.toLowerCase() === 'p42') {
            //                 cmd = this.createRequestCmd(0x01, this.BlockControl25_P42);
            //                 console.log('createRequestCmd for p42 ', cmd);
            //             } else { // P35版本
            //                 cmd = this.createRequestCmd(0x01, this.BlockControl25_P35);
            //                 console.log('createRequestCmd for p35 ', cmd);
            //             }

            //             return this.bleManager.sendData([this.ACK], { type: 'WITHOUT_READ' });
            //         }
            //         throw new Error('Init Error, 6 <> 0xff');
            //     })
            //     .then((result) => {
            //         return this.bleManager.sendData(cmd, params);
            //     })
            //     .then((result) => {
            //         console.log('result of createRequestCmd: ', result, String.fromCharCode.apply(null, result));
            //         let decode = this.decodeData(result);
            //         if (decode[9] === 0 && decode[10] === 25) {
            //             console.log('Control Block for 25 Result: ' + String.fromCharCode.apply(null, decode));
            //             params = {
            //                 type: 'START_STOP',
            //                 start: this.STX,
            //                 stop: this.EOT
            //             };
            //             cmd = this.createACKcmd();
            //             return this.bleManager.sendData(cmd, params);
            //         }
            //         throw new Error('create Request command error');
            //     })
            //     .then((result) => {
            //         // STEP = STEP_FIRST_DATA_BLOCK;
            //         let decode = this.decodeData(result);
            //         console.log('Data Block for 25 Result: ' + String.fromCharCode.apply(null, decode));
            //         if (decode[8] === 1 && decode[9] === 25) {
            //             if (this.meterType.toLowerCase() === 'p42') {
            //                 Object.assign(this.data, this.parserData25_42(decode));
            //             } else { // P35版本
            //                 Object.assign(this.data, this.parserData25_35(decode));
            //             }
            //         }

            //         resolve(this.data);
            //         console.log('==================== AK96 End ====================');
            //     })
            //     .catch((reason) => {
            //         console.error('senddata error -> ', reason);
            //         reject(reason);
            //     });

            // saveBaudRateSetting
            // saveBleSetting();

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
    parserData1(buffer) {
        let data = {};

        // PRL(P_PRIMDETBLOOD)
        console.log('12 - PRL(P_PRIMDETBLOOD): ' + (buffer[12] & 0xff));

        // PRL(P_BLPUMPCOVEROPEN)
        console.log('13 - PRL(P_BLPUMPCOVEROPEN): ' + (buffer[13] & 0xff));

        // BRL(B_HepPumpOvldAlarm)
        console.log('14 - BRL(B_HepPumpOvldAlarm): ' + (buffer[14] & 0xff));

        // BRI(BI_VENPR): VenousPressure
        data.VenousPressure = ((buffer[15] & 0xff) + (buffer[16] << 8)) / 10;
        console.log('15~16 - BRI(BI_VENPR) - VenousPressure: ' + data.VenousPressure);

        // BRI(BI_MEASVOL): HeparinAccumulatedVolume
        data.HeparinAccumulatedVolume = ((buffer[17] & 0xff) + (buffer[18] << 8)) / 10;
        console.log('17~18 - BRI(BI_MEASVOL) - HeparinAccumulatedVolume: ' + data.HeparinAccumulatedVolume);

        // BRI(BI_ESTACC)
        console.log('19~20 - BRI(BI_ESTACC): ' + ((buffer[19] & 0xff) + (buffer[20] << 8)));

        // ORI(OI_HEPSET): HeparinDeliveryRate
        data.HeparinDeliveryRate = ((buffer[21] & 0xff) + (buffer[22] << 8)) / 10;
        console.log('21~22 - ORI(OI_HEPSET) - HeparinDeliveryRate: ' + data.HeparinDeliveryRate);

        // BRL(B_VENCLAMPCLOSED)
        console.log('23 - BRL(B_VENCLAMPCLOSED): ' + (buffer[23] & 0xff));

        // BRI(BI_BLOODFL): BloodFlowRate
        data.BloodFlowRate = ((buffer[24] & 0xff) + (buffer[25] << 8)) / 10;
        console.log('24~25 - BRI(BI_BLOODFL) - BloodFlowRate: ' + data.BloodFlowRate);

        // BRI(BI_SNACTARTPHTIME)
        console.log('26~27 - BRI(BI_SNACTARTPHTIME): ' + ((buffer[26] & 0xff) + (buffer[27] << 8)));

        // BRI(BI_SNACTVENPHTIME)
        console.log('28~29 - BRI(BI_SNACTVENPHTIME): ' + ((buffer[28] & 0xff) + (buffer[29] << 8)));

        // FRI(FI_UFRATE): UFRate
        data.UFRate = ((buffer[30] & 0xff) + (buffer[31] << 8)) / 1000;
        console.log('30~31 - FRI(FI_UFRATE) - UFRate: ' + data.UFRate);

        // FRI(FI_UFVOL): TotalUF
        data.TotalUF = ((buffer[32] & 0xff) + (buffer[33] << 8)) / 1000;
        console.log('32~33 - FRI(FI_UFVOL) - TotalUF: ' + data.TotalUF);

        // BRI(BI_BLOODACCVOL): TotalBloodFlowVolume
        data.TotalBloodFlowVolume = ((buffer[34] & 0xff) + (buffer[35] << 8)) / 100;
        console.log('34~35 - BRI(BI_BLOODACCVOL) - TotalBloodFlowVolume: ' + data.TotalBloodFlowVolume);

        // FRI(FI_MM90CONDTEMPB): DialysateTemperature
        data.DialysateTemperature = ((buffer[36] & 0xff) + (buffer[37] << 8)) / 100;
        console.log('36~37 - FRI(FI_MM90CONDTEMPB) - DialysateTemperature: ' + data.DialysateTemperature);

        // ORI(OI_TEMPSET)
        console.log('38~39 - ORI(OI_TEMPSET): ' + ((buffer[38] & 0xff) + (buffer[39] << 8)));

        // FRI(FI_MM90CONDB): DialysateConductivity
        data.DialysateConductivity = ((buffer[40] & 0xff) + (buffer[41] << 8)) / 100;
        console.log('40~41 - FRI(FI_MM90CONDB) - DialysateConductivity: ' + data.DialysateConductivity);

        // ORI(OI_NAACSET)
        console.log('42~43 - ORI(OI_NAACSET): ' + (((buffer[42] & 0xff) + (buffer[43] << 8)) / 10));

        // ORI(OI_NASET)
        console.log('44~45 - ORI(OI_NASET): ' + ((buffer[44] & 0xff) + (buffer[45] << 8)));

        // ORI(OI_HCO3SET)
        console.log('46~47 - ORI(OI_HCO3SET): ' + ((buffer[46] & 0xff) + (buffer[47] << 8)));

        // ORI(OI_PASSEDTIME)
        console.log('48~49 - ORI(OI_PASSEDTIME): ' + ((buffer[48] & 0xff) + (buffer[49] << 8)));

        // ORI(OI_NONDIFFTIME)
        console.log('50~51 - ORI(OI_NONDIFFTIME): ' + ((buffer[50] & 0xff) + (buffer[51] << 8)));

        // ORI(OI_REMAINTIMEDIFF)v: UFTime
        data.UFTime = (buffer[52] & 0xff) + (buffer[53] << 8);
        console.log('52~53 - ORI(OI_REMAINTIMEDIFF) - UFTime: ' + data.UFTime);

        // FRW(FW_REMCHEMDWELLTIME)
        console.log('54~55 - FRW(FW_REMCHEMDWELLTIME): ' + ((buffer[54] & 0xff) + (buffer[55] << 8)));

        // FRW(FW_REMFILLUPTIME)
        console.log('56~57 - FRW(FW_REMFILLUPTIME): ' + ((buffer[56] & 0xff) + (buffer[57] << 8)));

        // FRW(FW_REMHEATTIME)
        console.log('58~59 - FRW(FW_REMHEATTIME): ' + ((buffer[58] & 0xff) + (buffer[59] << 8)));

        // FRW(FW_REMRINSETIME)
        console.log('60~61 - FRW(FW_REMRINSETIME): ' + ((buffer[60] & 0xff) + (buffer[61] << 8)));

        // FRI(FI_CH1RATE): DialysisateFlowRate
        data.DialysisateFlowRate = ((buffer[62] & 0xff) + (buffer[63] << 8)) / 10;
        console.log('62~63 - FRI(FI_CH1RATE) - DialysisateFlowRate: ' + data.DialysisateFlowRate);

        // ORI(OI_UfVolSetIsolAndDiff),: TargetUF
        data.TargetUF = ((buffer[64] & 0xff) + (buffer[65] << 8)) / 1000;
        console.log('64~65 - ORI(OI_UfVolSetIsolAndDiff),: ' + data.TargetUF);
        return data;
    }
}

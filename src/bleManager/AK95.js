/* eslint no-bitwise: "off" */
// 抓設定值
export default class AK95 {

    /** AK96 Communication flow
     * init -> 若有 0x0E / 0x46 表 reset 成功 -> 25 block -> 回 ACK。若回 0x01 / 0x19 表為要的資料，需解析 -> init 否則機器會一直吐資料
     * 從機器有收到資料都須回 ACK
     */
    constructor(bleManager) {

        this.TIME_OUT = 1200;

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
        // 6 2 44 60 0 0 e 0 46 0 1 1 0 0 1 0 2f 93 bd 4
        this.ResetRequestCmd = [0x02, 0x44, 0x00, 0x00, 0x00, 0x0E, 0x00, 0x46, 0x00,
            0x01, 0x01, 0xFF, 0x00, 0x01, 0x00, 0x8C, 0xD8, 0xFE, 0x04];

        // the other one
        // this.ResetRequestCmd = [0x02, 0x44, 0x00, 0x00, 0x00, 0x0E, 0x00, 0x46, 0x00,
        //     0x01, 0x01, 0xFF, 0x00, 0x01, 0x00, 0x8C, 0xD8, 0xFE, 0x04];

        // 6 2 44 61 0 0 88 0 46 0 19 1 0 1 5 0 ff 11 33 0 1 4b 0 11 17 0 11 16 0 41 7b 0 41 81 0 1 93 0 41 51 0 1 87 0 41 46 0 1 59 0 1 55 0 1 47 0 11 1c 0 11 1b 3b 0 11 1d 0 11 1e 0 1 5f 0 1 5e 0 1 77 0 42 17 0 42 18 0 42 19 0 42 1a 0 24 5c 0 1b 24 29 1b 22 24 b 0 1 25 0 1b 24 28 0 1b 24 f8 1b 22 1b 24 96 1b 22 41 8 0 1 4c 0 1 20 0 1 21 0 1 18 0 1 19 0 1 1e 0 1 1f 0 11 3e 0 ff f8 ed bb 4
        this.BlockControl25 = [0x00, 0x00, 0x88, 0x00, 0x46, 0x00, 0x19, 0x01, 0x00, 0x01, 0x05,
            0x00, 0xFF, 0x11, 0x33, 0x00, 0x01, 0x4B, 0x00, 0x11, 0x17, 0x00, 0x11, 0x16, 0x00, 0x41,
            0x7B, 0x00, 0x41, 0x81, 0x00, 0x01, 0x93, 0x00, 0x41, 0x51, 0x00, 0x01, 0x87,
            0x00, 0x41, 0x46, 0x00, 0x01, 0x59, 0x00, 0x01, 0x55, 0x00, 0x01, 0x47, 0x00,
            0x11, 0x1C, 0x00, 0x11, 0x1B, 0x00, 0x11, 0x1D, 0x00, 0x11, 0x1E, 0x00, 0x01,
            0x5F, 0x00, 0x01, 0x5E, 0x00, 0x01, 0x77, 0x00, 0x42, 0x17, 0x00, 0x42, 0x18,
            0x00, 0x42, 0x19, 0x00, 0x42, 0x1A, 0x00, 0x24, 0x5C, 0x00, 0x04, 0x29, 0x02,
            0x24, 0x0B, 0x00, 0x01, 0x25, 0x00, 0x04, 0x28, 0x00, 0x04, 0xF8, 0x02, 0x04,
            0x96, 0x02, 0x41, 0x08, 0x00, 0x01, 0x4C, 0x00, 0x01, 0x20, 0x00, 0x01, 0x21,
            0x00, 0x01, 0x18, 0x00, 0x01, 0x19, 0x00, 0x01, 0x1E, 0x00, 0x01, 0x1F, 0x00,
            0x11, 0x3E, 0x00, 0xFF];

        /**
         * TMP 會造成 AK95 一直吐值，就算下 reset request 也無法停，造成解析上的錯誤，因此不去接 TMP 的值
         */
        this.SdtModeCmd = [
            0x00, 0x00, 0xCF, 0x01, 0x53, 0x00, 0x1A, 0x00, 0x00, 0x01, 0x05, 0x00, 0x02, 0x00, 0xFF,
            0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x03, 0x00,
            0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x1A, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00,
            0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x02,
            0x00, 0x01, 0x00, 0x0C, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02,
            0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00,
            0x0A, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00,
            0x03, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0xB0, 0x01, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03,
            0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x00,
            0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x0C, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00,
            0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02,
            0x00, 0x01, 0x00, 0x0A, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02,
            0x00, 0x03, 0x00, 0x03, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0xBE, 0x00, 0x01, 0x02, 0x00,
            0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01,
            0x00, 0x18, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03,
            0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x18, 0x00,
            0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00,
            0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x02,
            0x00, 0x01, 0x00, 0x10, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02,
            0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00,
            0x06, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00,
            0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x16, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x00, 0x01,
            0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02,
            0x00, 0x01, 0x00, 0x0C, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x01,
            0x00, 0x03, 0x00, 0x01, 0x00, 0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00,
            0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x14, 0x00, 0x01, 0x02, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00,
            0x51, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02,
            0x00, 0x01, 0x00, 0x10, 0x00, 0xFF
        ];

        this.block25Result = [];
        this.block26Result = [];
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
            console.log('==================== AK95 Start ====================');
            let data = {};
            let cmd;
            data.DialysisSystem = 'AK95';

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
                        if ((decode[decode.length - 14] & 0xff) === 0x0E && (decode[decode.length - 12] & 0xff) === 0x46) {
                            console.log('Initialize Reset Communication Success');

                            this.bleManager.sendData([this.ACK], { type: 'WITHOUT_READ' })
                                .then(() => {
                                    if (!isFinish) {
                                        sendRequestCommand();   // 送取 Block25 cmd
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
                cmd = this.createRequestCmd(0x01, this.BlockControl25);
                console.log('createRequestCmd for AK95 ', cmd);

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
                        } else if ((decode[5] & 0xff) === 0x0E && (decode[7] & 0xff) === 0x46) {
                            console.log('收到 reset response, 重送 ack');
                            sendACK();
                        } else if (decode[8] === 0 && decode[9] === 25) {
                            // js 版跟 android 不一樣, 因為 js 版有時會回6開頭, 有時不會,
                            // 所以前幾行把6拿掉, 後面的個數計算會比 android 版本少一
                            console.log('重送 ack');
                            sendACK();
                        } else if (decode[8] === 1 && decode[9] === 25) {
                            console.log('got Data Block for 25');
                            Object.assign(this.data, this.parserData25(decode));

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
            //             console.log("Initialize Reset Communication Success");

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
            //             console.log("Control Block for 25 Result: " + String.fromCharCode.apply(null, decode));
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
            //         console.log("Data Block for 25 Result: " + String.fromCharCode.apply(null, decode));
            //         if (decode[8] === 1 && decode[9] === 25) {
            //             if (this.meterType.toLowerCase() === 'p42') {
            //                 Object.assign(this.data, this.parserData25_42(decode));
            //             } else { // P35版本
            //                 Object.assign(this.data, this.parserData25_35(decode));
            //             }
            //         }

            //         resolve(this.data);
            //         console.log("==================== AK96 End ====================");
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
    parserData25(buffer) {
        let data = {};
        // Heparine volume
        let heparineVolume = ((buffer[12] & 0xff) + (buffer[13] << 8)) / 10;
        data.HeparinAccumulatedVolume = heparineVolume;
        console.log('Heparine volume: ' + heparineVolume);

        // Heparine Rate
        let heparineRate = ((buffer[14] & 0xff) + (buffer[15] << 8)) / 10;
        data.HeparinDeliveryRate = heparineRate;
        console.log('Heparine rate: ' + heparineRate);

        // Momentary blood flow
        data.BloodFlowRate = ((buffer[16] & 0xff) + (buffer[17] << 8)) / 10;
        console.log("Momentary blood flow: " + data.BloodFlowRate);

        // Accumulated blood volume
        data.TotalBloodFlowVolume = ((buffer[18] & 0xff) + (buffer[19] << 8)) / 100;
        console.log("Accumulated blood volume: " + data.TotalBloodFlowVolume);

        // UF rate
        data.UFRate = ((buffer[20] & 0xff) + (buffer[21] << 8)) / 1000;
        console.log("UF rate: " + ((buffer[20] & 0xff) + (buffer[21] << 8)) + ", " + data.UFRate);

        // UF Volume
        data.TotalUF = ((buffer[22] & 0xff) + (buffer[23] << 8)) / 1000;
        console.log("UF Volume: " + data.TotalUF);

        // UF Volume, set value
        data.TargetUF = ((buffer[24] & 0xff) + (buffer[25] << 8)) / 1000;
        console.log("UF Volume, set value: " + ((buffer[24] & 0xff) + (buffer[25] << 8)) + ", " + data.TargetUF);

        // Fluid temperature
        data.DialysateTemperature = ((buffer[26] & 0xff) + (buffer[27] << 8)) / 100;
        console.log("Fluid temperature: " + data.DialysateTemperature);

        // Fluid temperature , set value
        data.DialysateTemperatureSet = ((buffer[28] & 0xff) + (buffer[29] << 8)) / 100;
        console.log("Fluid temperature , set value: " + data.DialysateTemperatureSet);

        // Conductivity
        data.DialysateConductivity = ((buffer[30] & 0xff) + (buffer[31] << 8)) / 100;
        console.log("Conductivity: " + data.DialysateConductivity);

        // Sodium set value
        data.TargetSodium = ((buffer[32] & 0xff) + (buffer[33] << 8)) / 10;
        console.log("Sodium set value: " + data.TargetSodium);

        console.log("Sodium set value: " + ((buffer[34] & 0xff) + (buffer[35] << 8)) / 10);

        // Bicarbonate set value
        let bicarbonateSet = (buffer[36] & 0xff) + (buffer[37] << 8);
        console.log("Bicarbonate set value: " + bicarbonateSet);

        // Systolic blood pressure
        data.BPS = (buffer[38] & 0xff) + (buffer[39] << 8);
        console.log("Systolic blood pressure: " + data.BPS);

        // Diastolic blood pressure
        data.BPD = (buffer[40] & 0xff) + (buffer[41] << 8);
        console.log("Diastolic blood pressure: " + data.BPD);

        console.log("Mean blood pressure: " + (buffer[42] & 0xff) + (buffer[43] << 8));

        // Heart rate
        data.Pulse = (buffer[44] & 0xff) + (buffer[45] << 8);
        console.log("Heart rate: " + data.Pulse);

        console.log("Passed Time: " + (buffer[46] & 0xff) + (buffer[47] << 8));
        console.log("Non diffusion time: " + (buffer[48] & 0xff) + (buffer[49] << 8));

        // 剩餘時間
        data.UFTime = (buffer[50] & 0xff) + (buffer[51] << 8);
        console.log("Remaining treatment time: " + data.UFTime);

        console.log("Remaining contact time in chemical disinfection: " + (buffer[52] & 0xff) + (buffer[53] << 8));
        console.log("Remaining fillup time in disinfection phase: " + (buffer[54] & 0xff) + (buffer[55] << 8));
        console.log("Remaining heat time in disinfection phase: " + (buffer[56] & 0xff) + (buffer[57] << 8));
        console.log("Remaining rinse time in disinfection phase: " + (buffer[58] & 0xff) + (buffer[59] << 8));
        console.log("Single needle mode on: " + (buffer[60]));
        console.log("UF profile on: " + (buffer[61]));
        console.log("Bicarbonate mode on: " + (buffer[62]));
        console.log("General alarm: " + (buffer[63] & 0xff) + (buffer[64] << 8));
        console.log("Attention alarm: " + (buffer[65]));
        console.log("UF Rate attention: " + (buffer[66]));
        console.log("Technical alarm: " + (buffer[67]));

        // Dialysis fluid flow
        data.DialysisateFlowRate = ((buffer[68] & 0xff) + (buffer[69] << 8)) / 10;
        console.log("Dialysis fluid flow: " + data.DialysisateFlowRate);

        console.log("Heparine stop limit: " + (buffer[70] & 0xff) + (buffer[71] << 8));
        console.log("Systolic blood pressure, high limit: " + (buffer[72] & 0xff) + (buffer[73] << 8));
        console.log("Systolic blood pressure, low limit: " + (buffer[74] & 0xff) + (buffer[75] << 8));
        console.log("Diastolic blood pressure, high limit: " + (buffer[76] & 0xff) + (buffer[77] << 8));
        console.log("Diastolic blood pressure, low limit: " + (buffer[78] & 0xff) + (buffer[79] << 8));
        console.log("Pulse, high limit: " + (buffer[80] & 0xff) + (buffer[81] << 8));
        console.log("Pulse, low limit: " + (buffer[82] & 0xff) + (buffer[83] << 8));
        console.log("Pulse, low limit: " + (buffer[82] & 0xff) + (buffer[83] << 8));

        // Venous pressure
        data.VenousPressure = ((buffer[84] & 0xff) + (buffer[85] << 8)) / 10;
        console.log("Venous pressure: " + data.VenousPressure);
        return data;
    }
}

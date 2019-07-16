// v100
export default class V100 {
    constructor(bleManager) {

        this.CR = 0x0D;

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
            try {
                console.log("==================== GE Monitor V100 Start ====================");
                const params = {
                    type: 'STOP',
                    stop: this.CR
                };
                let data = {};

                // read BP
                let cmd = this.createCmd(' NF!7');
                this.bleManager.sendData(cmd, params).then((res) => {
                    Object.assign(data, this.parseBP(this.byteAryToString(res)));

                    // read HR
                    cmd = this.createCmd(' RC!8');
                    return this.bleManager.sendData(cmd, params);
                }).then((res) => {
                    Object.assign(data, this.parseHR(this.byteAryToString(res)));

                    // read SPO2
                    cmd = this.createCmd(' OA!3');
                    return this.bleManager.sendData(cmd, params);
                }).then((res) => {
                    Object.assign(data, this.parseSPO2(this.byteAryToString(res)));
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

    /**
        * readBP
        * @param vs
        *  NF!7
        *
    */
    parseBP(source) {
        let bp = {};
        // NF1102207118080091&+
        // NF1101762127073078&<
        let pos = source.indexOf('NF1');
        if (pos > -1) {
            let res = source.substring(pos, pos + 20);
            bp.TimeSpan = res.substring(5, 9);
            // bp.Bps = res.substring(9, 12);  // Gino
            bp.BPS = Number(res.substring(9, 12));
            // bp.Bpd = res.substring(12, 15); // Gino
            bp.BPD = Number(res.substring(12, 15));
        }

        return bp;
    }

    /**
        * readHR
        * @param vs
        * command : uRD - read NIBP heart/pulse value displayed on the front panel
        * response : uRDabbb
        *
        *
    */
    parseHR(source) {
        let data = {};
        // RC3072"F
        let pos = source.indexOf("RC");
        if (pos > -1) {
            let res = source.substring(pos, pos + 8);
            data.Pulse = Number(res.substring(3, 6));
        }
        return data;
    }

    /**
        * readSPO2
        * @param vs
    */
    parseSPO2(source) {
        let data = {};
        // OAabbbcddXX
        let pos = source.indexOf("OA");
        if (pos > -1) {
            let res = source.substring(pos, pos + 11);
            data.Spo2 = res.substring(3, 6);
        }

        return data;
    }

    createCmd(cmdStr) {
        let cmd = cmdStr.split('').map((x) => { return x.charCodeAt(0); });
        cmd.push(this.CR);
        console.log('cmd', new Uint8Array(cmd));
        // 最後須加 0x0D 取得 byte array
        return new Uint8Array(cmd);
    }

    byteAryToString(byteAry) {
        return String.fromCharCode.apply(null, byteAry).substring(1, byteAry.length - 1);
    }
}

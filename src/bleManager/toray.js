export default class toray {
    constructor(bleManager, meterType) {

        this.LF = 0x0A;

        this.meterType = meterType;

        console.log('toray constructor');
        this.bleManager = bleManager;
    }

    // baudrate setting: 9600 8 N 1
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
                console.log('==================== Toray Start ====================');
                let data = {};

                let cmd = this.createCmd([0x4B, 0x0D, 0x0A]);

                // 原本為認 STOP code (0x0D, 0x0A)，但實際接機器會等不到 Stop code，並且若再馬上下 0x4B 會在下一次連線時才吐 stop code，因次改用 timeout
                const params = {
                    type: 'TIMEOUT',
                    timeout: 3000
                };

                this.bleManager.sendData(cmd, params)
                    .then((res) => {
                        console.log('0x4B : ' + res);

                        // 根據型號解析
                        switch (this.meterType) {
                            case '3000':
                                Object.assign(data, this.getTR3000Data(res));
                                break;
                            case '8000':
                                Object.assign(data, this.getTR8000Data(res));
                                break;
                            case '321':
                                Object.assign(data, this.getTR321Data(res));
                                break;
                            default:
                                break;
                        }
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
        return new Uint8Array(cmd);
    }

    // K1261A03.80B03.08C00.95D00320E002.0F037.0G014.1H00129I00084J00045K00194a0b0c0d0e0f0g0h0L00505M00004N00093O00064P00080Q00250R00100S00200T00000U00661V00187W00067X00065Y00171Z-0029i00000j0k0l2m1n        o00012p0q00073r-0047s00153t-0047u000.0v00.00w00.00x0y0z0!0#036.7$0a6
    /** syringe complete
        K1261A03.80B03.75C00.95D00320E000.0F037.1G014.1H00137I00083J00054K00237a0b0c0d0e0f0g0h0L00508M00004N00093O00064P00080Q00250R00100S00200T00000U00806V00187W00067X00119Y00195Z-0005i00000j0k0l2m1n        o00012p0q00073r-0047s00153t-0047u000.0v00.00w00.00x0y0z0!0#036.7$0a9
    */
    /** 有問題的資料: Todo 用 RS232 轉 USB 直接用電腦去下，以確定不是藍牙棒的問題
        0#036.0$088
        K1261A04.00B03.90C00.41D00240E000.0F036.3G013.8H00081I00019J00062K00225a0b0c0d0e0f0g0h0L00531M00006N00097O00072P00095Q00250R00080S00200T00000U00715V00156W00036X00068Y00116Z-0084i00000j0k0l2m1n        o00000p0q00070r-0050s00170t-0030u000.0v00.00w00.00x0y0z0!0#036.0$083
    */
    getTR8000Data(buffer) {
        const dialysis = {};
        dialysis.DialysisSystem = 'TR8000';

        let str = this.parseResult(buffer);
        if (!str) {
            return dialysis;
        }

        dialysis.TargetUF = parseFloat(this.parserData(str, 'A')).toString();   // L
        dialysis.TotalUF = parseFloat(this.parserData(str, 'B')).toString();    // L
        dialysis.UFRate = parseFloat(this.parserData(str, 'C')).toString();     // L/hr
        dialysis.BloodFlowRate = parseFloat(this.parserData(str, 'D')).toString();

        // 肝素維持量
        dialysis.SyringeFlowRate = parseFloat(this.parserData(str, 'E')).toString();
        dialysis.HeparinDeliveryRate = dialysis.SyringeFlowRate;

        dialysis.DialysateTemperature = parseFloat(this.parserData(str, 'F')).toString();
        dialysis.DialysateConductivity = parseFloat(this.parserData(str, 'G')).toString();
        dialysis.VenousPressure = parseFloat(this.parserData(str, 'H')).toString();
        dialysis.DialysatePressure = parseFloat(this.parserData(str, 'I')).toString();
        dialysis.TMP = parseFloat(this.parserData(str, 'J')).toString();
        dialysis.DialysisTime = parseFloat(this.parserData(str, 'K')).toString();   // 經過時間(min)
        dialysis.UFTime = dialysis.DialysisTime; // 經過時間(min)

        dialysis.DialysateTemperatureAlarm = this.parserData(str, 'a');
        dialysis.ConductivityAlarm = this.parserData(str, 'b');
        dialysis.VenousPressureAlarm = this.parserData(str, 'c');
        //            dialysis.DialysatePressureAlarm = this.parserData(str, 'd');
        dialysis.TMPAlarm = parseFloat(this.parserData(str, 'e')).toString();
        dialysis.AirBubbleDetectorAlarm = this.parserData(str, 'f');
        dialysis.BloodLeakAlarm = this.parserData(str, 'g');    // BloodLeak?
        dialysis.BloodLeak = this.parserData(str, 'g');
        dialysis.OtherAlarm = this.parserData(str, 'h');
        dialysis.DialysisateFlowRate = parseFloat(this.parserData(str, 'L')).toString();

        // BPM 血壓相關
        dialysis.BpmMeasurementTimes = this.parserData(str, 'M');
        dialysis.BpmMaxBloodPressure = this.parserData(str, 'N');   // 最後一筆的收縮壓
        dialysis.BPS = parseInt(dialysis.BpmMaxBloodPressure);
        dialysis.BpmMinBloodPressure = this.parserData(str, 'O');   // 最後一筆的舒張壓
        dialysis.BPD = parseInt(dialysis.BpmMinBloodPressure);
        dialysis.BpmPulse = parseFloat(this.parserData(str, 'P')).toString();
        dialysis.Pulse = parseInt(dialysis.BpmPulse);

        dialysis.UpperAlarmMaxBloodPressure = this.parserData(str, 'Q');
        dialysis.LowerAlarmMaxBloodPressure = this.parserData(str, 'R');
        dialysis.CuffPressure = this.parserData(str, 'S');
        dialysis.IntervalOfMeasurement = this.parserData(str, 'T');
        dialysis.TotalBloodFlowVolume = parseFloat(this.parserData(str, 'U')).toString();
        dialysis.UpperAlarmOfVenousPressure = this.parserData(str, 'V');
        dialysis.LowerAlarmOfVenousPressure = this.parserData(str, 'W');
        dialysis.TotalInjectionVolume = this.parserData(str, 'X');
        dialysis.UpperAlarmDialysatePressure = this.parserData(str, 'Y');
        dialysis.LowerAlarmDialysatePressure = this.parserData(str, 'Z');
        dialysis.NaCiInfusion = this.parserData(str, 'i');
        dialysis.UFProfile = this.parserData(str, 'j');
        dialysis.ConcentrateStep = this.parserData(str, 'k');
        dialysis.ConductivityStep = this.parserData(str, 'l');
        //			dialysis.DataCommunicationState = this.parserData(str,'m');
        //            dialysis.SerialNumber = this.parserData(str, 'n');
        dialysis.ArterialPressure = parseFloat(this.parserData(str, 'o')).toString();
        dialysis.ArterialPressureAlarm = this.parserData(str, 'p');
        dialysis.UpperAlarmArterialPressure = this.parserData(str, 'q');
        dialysis.LowerAlarmArterialPressure = this.parserData(str, 'r');
        dialysis.UpperAlarmTMP = this.parserData(str, 's');
        dialysis.LowerAlarmTMP = this.parserData(str, 't');
        dialysis.SubstitutionRate = this.parserData(str, 'u');
        dialysis.SubstitutionGoal = this.parserData(str, 'v');
        dialysis.SubstitutionProgress = this.parserData(str, 'w');
        dialysis.NaProfile = this.parserData(str, 'x');
        dialysis.BloodPumpProfile = this.parserData(str, 'y');
        dialysis.SyringePumpProfile = this.parserData(str, 'z');
        dialysis.DialysateProfile = this.parserData(str, '!');
        dialysis.DialysateTemperatureSet = parseFloat(this.parserData(str, '#')).toString();
        dialysis.WaterShort2Alarm = this.parserData(str, '$');

        return dialysis;
    }

    getTR3000Data(buffer) {
        const dialysis = {};
        dialysis.DialysisSystem = 'TR3000';
        let str = this.parseResult(buffer);
        if (!str) {
            return dialysis;
        }

        dialysis.TargetUF = parseFloat(this.parserData(str, 'A')).toString();
        dialysis.TotalUF = parseFloat(this.parserData(str, 'B')).toString();
        dialysis.UFRate = parseFloat(this.parserData(str, 'C')).toString();
        dialysis.BloodFlowRate = parseFloat(this.parserData(str, 'D')).toString();

        // 肝素維持量
        dialysis.SyringeFlowRate = parseFloat(this.parserData(str, 'E')).toString();
        dialysis.HeparinDeliveryRate = dialysis.SyringeFlowRate;

        dialysis.DialysateTemperature = parseFloat(this.parserData(str, 'F')).toString();
        dialysis.DialysateConductivity = parseFloat(this.parserData(str, 'G')).toString();
        dialysis.VenousPressure = parseFloat(this.parserData(str, 'H')).toString();
        dialysis.DialysatePressure = parseFloat(this.parserData(str, 'I')).toString();
        dialysis.TMP = parseFloat(this.parserData(str, 'J')).toString();
        dialysis.DialysisTime = parseFloat(this.parserData(str, 'K')).toString();
        dialysis.UFTime = parseFloat(this.parserData(str, 'K')).toString(); // 經過時間(min)
        dialysis.DialysateTemperatureAlarm = this.parserData(str, 'a');
        dialysis.ConductivityAlarm = this.parserData(str, 'b');
        dialysis.VenousPressureAlarm = this.parserData(str, 'c');
        //            dialysis.DialysatePressureAlarm = this.parserData(str, 'd');
        dialysis.TMPAlarm = parseFloat(this.parserData(str, 'e')).toString();
        dialysis.AirBubbleDetectorAlarm = this.parserData(str, 'f');
        dialysis.BloodLeakAlarm = this.parserData(str, 'g');
        dialysis.BloodLeak = this.parserData(str, 'g'); // BloodLeak?
        dialysis.OtherAlarm = this.parserData(str, 'h');

        dialysis.DialysisateFlowRate = parseFloat(this.parserData(str, 'L')).toString();
        
        // BPM 相關
        dialysis.BpmMeasurementTimes = this.parserData(str, 'M');
        dialysis.BpmMaxBloodPressure = this.parserData(str, 'N');
        dialysis.BPS = parseInt(dialysis.BpmMaxBloodPressure);
        dialysis.BpmMinBloodPressure = this.parserData(str, 'O');
        dialysis.BPD = parseInt(dialysis.BpmMinBloodPressure);
        dialysis.BpmPulse = parseFloat(this.parserData(str, 'P')).toString();
        dialysis.Pulse = parseInt(dialysis.BpmPulse);

        dialysis.UpperAlarmMaxBloodPressure = this.parserData(str, 'Q');
        dialysis.LowerAlarmMaxBloodPressure = this.parserData(str, 'R');
        dialysis.CuffPressure = this.parserData(str, 'S');
        dialysis.IntervalOfMeasurement = this.parserData(str, 'T');
        dialysis.TotalBloodFlowVolume = parseFloat(this.parserData(str, 'U')).toString();
        dialysis.UpperAlarmOfVenousPressure = this.parserData(str, 'V');
        dialysis.LowerAlarmOfVenousPressure = this.parserData(str, 'W');
        dialysis.TotalInjectionVolume = this.parserData(str, 'X');
        dialysis.UpperAlarmDialysatePressure = this.parserData(str, 'Y');
        dialysis.LowerAlarmDialysatePressure = this.parserData(str, 'Z');

        dialysis.NaCiInfusion = this.parserData(str, 'i');
        dialysis.UFProfile = this.parserData(str, 'j');
        //            dialysis.ConcentrateStep = this.parserData(str, 'k');
        //            dialysis.ConductivityStep = this.parserData(str, 'l');
        //			dialysis.DataCommunicationState = this.parserData(str,'m');
        //            dialysis.SerialNumber = this.parserData(str, 'n');
        return dialysis;
    }

    getTR321Data(buffer) {
        // K1074A01.90B01.35C00.48D00260E02.00F36.80G13.90H00167I00148K00167a0b0c0d0f0g0h0a2
        const dialysis = {};
        dialysis.DialysisSystem = 'TR321';
        let str = this.parseResult(buffer);
        if (!str) {
            return dialysis;
        }

        dialysis.TargetUF = parseFloat(this.parserData(str, 'A')).toString();
        dialysis.TotalUF = parseFloat(this.parserData(str, 'B')).toString();
        dialysis.UFRate = parseFloat(this.parserData(str, 'C')).toString();
        dialysis.BloodFlowRate = parseFloat(this.parserData(str, 'D')).toString();

        // 肝素維持量
        dialysis.SyringeFlowRate = parseFloat(this.parserData(str, 'E')).toString();
        dialysis.HeparinDeliveryRate = dialysis.SyringeFlowRate;

        dialysis.DialysateTemperature = parseFloat(this.parserData(str, 'F')).toString();
        dialysis.DialysateConductivity = parseFloat(this.parserData(str, 'G')).toString();
        dialysis.VenousPressure = parseFloat(this.parserData(str, 'H')).toString();
        dialysis.DialysatePressure = parseFloat(this.parserData(str, 'I')).toString();
        dialysis.TMP = isNaN(parseFloat(this.parserData(str, 'J'))) ? '' : parseFloat(this.parserData(str, 'J')).toString();
        dialysis.DialysisTime = parseFloat(this.parserData(str, 'K')).toString();
        dialysis.UFTime = parseFloat(this.parserData(str, 'K')).toString(); // 剩餘時間(min)?
        dialysis.DialysateTemperatureAlarm = this.parserData(str, 'a');
        dialysis.ConductivityAlarm = this.parserData(str, 'b');
        dialysis.VenousPressureAlarm = this.parserData(str, 'c');
        dialysis.TMPAlarm = parseFloat(this.parserData(str, 'e')).toString();
        dialysis.AirBubbleDetectorAlarm = this.parserData(str, 'f');
        dialysis.BloodLeakAlarm = this.parserData(str, 'g');
        dialysis.BloodLeak = this.parserData(str, 'g'); // BloodLeak?
        dialysis.OtherAlarm = this.parserData(str, 'h');
        dialysis.DialysisateFlowRate = isNaN(parseFloat(this.parserData(str, 'L'))) ? '' : parseFloat(this.parserData(str, 'L')).toString();
        return dialysis;
    }

    parserData(data, field) {
        let tmp = '';
        let result = '';
        try {
            if (field === 'A') {
                tmp = data.substring(5, 11);
                if (tmp.startsWith('A')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'B') {
                tmp = data.substring(11, 17);
                if (tmp.startsWith('B')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'C') {
                tmp = data.substring(17, 23);
                if (tmp.startsWith('C')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'D') {
                tmp = data.substring(23, 29);
                if (tmp.startsWith('D')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'E') {
                tmp = data.substring(29, 35);
                if (tmp.startsWith('E')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'F') {
                tmp = data.substring(35, 41);
                if (tmp.startsWith('F')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'G') {
                tmp = data.substring(41, 47);
                if (tmp.startsWith('G')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'H') {
                tmp = data.substring(47, 53);
                if (tmp.startsWith('H')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'I') {
                tmp = data.substring(53, 59);
                if (tmp.startsWith('I')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'J') {
                tmp = data.substring(59, 65);
                if (tmp.startsWith('J')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'K') {
                tmp = data.substring(65, 71);
                if (tmp.startsWith('K')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'a') {
                tmp = data.substring(71, 73);
                if (tmp.startsWith('a')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'b') {
                tmp = data.substring(73, 75);
                if (tmp.startsWith('b')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'c') {
                tmp = data.substring(75, 77);
                if (tmp.startsWith('c')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'd') {
                tmp = data.substring(77, 79);
                if (tmp.startsWith('d')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'e') {
                tmp = data.substring(79, 81);
                if (tmp.startsWith('e')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'f') {
                tmp = data.substring(81, 83);
                if (tmp.startsWith('f')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'g') {
                tmp = data.substring(83, 85);
                if (tmp.startsWith('g')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'h') {
                tmp = data.substring(85, 87);
                if (tmp.startsWith('h')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'L') {
                tmp = data.substring(87, 93);
                if (tmp.startsWith('L')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'M') {
                tmp = data.substring(93, 99);
                if (tmp.startsWith('M')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'N') {
                tmp = data.substring(99, 105);
                if (tmp.startsWith('N')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'O') {
                tmp = data.substring(105, 111);
                if (tmp.startsWith('O')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'P') {
                tmp = data.substring(111, 117);
                if (tmp.startsWith('P')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'Q') {
                tmp = data.substring(117, 123);
                if (tmp.startsWith('Q')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'R') {
                tmp = data.substring(123, 129);
                if (tmp.startsWith('R')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'S') {
                tmp = data.substring(129, 135);
                if (tmp.startsWith('S')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'T') {
                tmp = data.substring(135, 141);
                if (tmp.startsWith('T')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'U') {
                tmp = data.substring(141, 147);
                if (tmp.startsWith('U')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'V') {
                tmp = data.substring(147, 153);
                if (tmp.startsWith('V')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'W') {
                tmp = data.substring(153, 159);
                if (tmp.startsWith('W')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'X') {
                tmp = data.substring(159, 165);
                if (tmp.startsWith('X')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'Y') {
                tmp = data.substring(165, 171);
                if (tmp.startsWith('Y')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'Z') {
                tmp = data.substring(171, 177);
                if (tmp.startsWith('Z')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'i') {
                tmp = data.substring(177, 183);
                if (tmp.startsWith('i')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'j') {
                tmp = data.substring(183, 185);
                if (tmp.startsWith('j')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'k') {
                tmp = data.substring(185, 187);
                if (tmp.startsWith('k')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'l') {
                tmp = data.substring(187, 189);
                if (tmp.startsWith('l')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'm') {
                tmp = data.substring(189, 191);
                if (tmp.startsWith('l')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'n') {
                tmp = data.substring(191, 200);
                if (tmp.startsWith('n')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'o') {
                tmp = data.substring(200, 206);
                if (tmp.startsWith('o')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'p') {
                tmp = data.substring(206, 208);
                if (tmp.startsWith('p')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'q') {
                tmp = data.substring(208, 214);
                if (tmp.startsWith('q')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'r') {
                tmp = data.substring(214, 220);
                if (tmp.startsWith('r')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 's') {
                tmp = data.substring(220, 226);
                if (tmp.startsWith('s')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 't') {
                tmp = data.substring(226, 232);
                if (tmp.startsWith('t')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'u') {
                tmp = data.substring(232, 238);
                if (tmp.startsWith('u')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'v') {
                tmp = data.substring(238, 244);
                if (tmp.startsWith('v')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'w') {
                tmp = data.substring(244, 250);
                if (tmp.startsWith('w')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'x') {
                tmp = data.substring(250, 252);
                if (tmp.startsWith('x')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'y') {
                tmp = data.substring(252, 254);
                if (tmp.startsWith('y')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === 'z') {
                tmp = data.substring(254, 256);
                if (tmp.startsWith('z')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === '!') {
                tmp = data.substring(256, 258);
                if (tmp.startsWith('!')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === '#') {
                tmp = data.substring(258, 264);
                if (tmp.startsWith('#')) {
                    result = tmp.substring(1, tmp.length);
                }
            } else if (field === '$') {
                tmp = data.substring(264, 266);
                if (tmp.startsWith('$')) {
                    result = tmp.substring(1, tmp.length);
                }
            }
        } catch (ex) {
            console.log('parserData exception: ' + ex);
        }
        return result;
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
        console.log('parseResult', String.fromCharCode.apply(null, source));
        
        // 只將 START code 後面的字串截出來 (若前一次未吐完全)
        let result = String.fromCharCode.apply(null, source);
        let index = result.indexOf('K');    // 取第一個 K

        return index > -1 ? result.substring(index, result.length) : '';
    }

}

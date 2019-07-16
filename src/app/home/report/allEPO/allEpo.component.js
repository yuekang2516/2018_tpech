import report from './allEpo.html';
import './allEpo.less';

angular.module('app').component('allEpo', {
    template: report,
    controller: allEpoCtrl,
    controllerAs: 'allEpo'
});

allEpoCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function allEpoCtrl($stateParams, allReportService, $state, $filter, SettingService) {

    const self = this;

    self.optionYear = [];
    self.optionMonth = [];
    self.Content = [];
    self.itmsjson = [];
    self.strYearMonth = '';
    self.daysOfMonth = 0;
    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year
    self.toMonth = $filter('date')(self.date, 'M');   // get today month

    self.isError = false;

    // page init
    self.$onInit = function $onInit() {

        self.loading = true;
        // WardNumber dropdownlist items setting
        self.wards = SettingService.getCurrentUser().Ward;
        self.keys = Object.keys(self.wards);
        self.selectedWards = self.keys[0];

        // year dropdownlist items setting
        for (let j = (self.toYear - 19); j <= self.toYear; j++) {
            self.optionYear.push(j);
        }
        self.selectedYear = self.toYear;

        // month dropdownlist items setting
        for (let k = 0; k < 12; k++) {
            self.optionMonth.push(k + 1);
        }
        self.selectedMonth = self.toMonth;
        self.searching = false;
        self.searchContent = false;

        //  console.log('init setting Select Items \n self.selectedWards : ' + self.selectedWards + '\n self.selectedYear : ' + self.selectedYear + '\n self.selectedMonth : ' + self.selectedMonth);

        self.loading = false;
    };

    // call allEPO Service
    self.getAllEPO = function getAllEPO() {
        // self.loading = true;
        self.searching = true;
        self.searchContent = false;
        self.contentYear = self.selectedYear;
        self.contentMonth = self.selectedMonth;
        self.strYearMonth = self.selectedYear.toString() + ('0' + self.selectedMonth.toString()).slice(-2);
        self.daysOfMonth = moment(self.strYearMonth, 'YYYYMM').daysInMonth();

        allReportService.getAllEPOByWardYearMonth(self.strYearMonth).then((q) => {

            self.analysisDataNew(q.data);
            // self.analysisData(q.data);  // too slowly
            // self.loading = false;
            self.isError = false;
            self.searching = false;
            self.searchContent = true;
        }, () => {
            // self.loading = false;
            self.isError = true;
            self.searching = false;
            self.searchContent = false;
        });
    };


    // 組表格(顯示完整表頭)
    self.analysisDataNew = function analysisDataNew(items) {

        // self.jsonRecords = items.Records;
        // let cube = [];
        let jsonPatientsLength = 0;  // json Patients 總數
        let jsonEposLength = 0; // json Patients 總數
        let jsonRecordsLength = 0; // json Records 總數
        let tmpPatientsKeyMain = '';   // temp Patients Key
        let tmpPatientsKeyDiff = '';   // temp Patients Key 比對用
        let tmpEposKey = '';  // temp Epos Key
        // let reportContentField = self.daysOfMonth + 1; // 設定report Content 每個月31天 + 1合計
        let tmpRecordsCount = 0;  // 暫存計數
        let recordsSummary = 0;  // 合計總和

        let trContent = '';  // 組html用

        $('#reportContent').html(''); // 清除舊資料

        if (items) {

            jsonPatientsLength = (Object.keys(items.Patients)).length;  // 取得json Patients 總數
            // console.log('Patients count : ' + jsonPatientsLength);

            jsonEposLength = (Object.keys(items.Epos)).length; // 取得json Patients 總數
            // console.log('Epos count : ' + jsonEposLength);

            jsonRecordsLength = items.Records.length;  // 取得json Records 總數
            // console.log('Records count : ' + jsonRecordsLength);

            for (let x = 0; x < jsonPatientsLength; x++) {  // 歷遍 json Patients

                tmpPatientsKeyDiff = Object.keys(items.Patients)[x];  // 取得 Patients key 值

                if (tmpPatientsKeyMain !== tmpPatientsKeyDiff) {  // 病人若不同,則分割列

                    // trContent += '<tr><td rowspan="' + jsonEposLength + '" style="width:100px">' + Object.values(items.Patients)[x] + '</td>';  // 輸出病人名稱至 <td>
                    trContent += `<tr><td rowspan="${jsonEposLength}" style="width:80px; background:#fff; font-weight:bold">${Object.values(items.Patients)[x]}</td>`

                } else {  // 病人相同,則合併列

                    trContent += '<tr>';
                }


                for (let y = 0; y < jsonEposLength; y++) {  // 歷遍 json Epos

                    tmpEposKey = Object.keys(items.Epos)[y];  // 取得 Epos key 值

                    trContent += '<td style="font-weight:bold">' + Object.values(items.Epos)[y] + '</td>';  // 輸出品項名稱至 <td>

                    recordsSummary = 0;

                    for (let z = 0; z < self.daysOfMonth; z++) {  // 歷遍 每月天數

                        let printTDValue = 0; // 0: 尚未輸出欄位, 1: 已輸出欄位,檢測該日期是否有輸出欄位

                        if (items.Records.length > 0) {  // 判斷是否有Records資料

                            for (let rd = 0; rd < jsonRecordsLength; rd++) {  // 歷遍 Records

                                let rdPatientId = items.Records[rd].PatientId; // 取得 Records PatientId
                                let rdKey = items.Records[rd].Key; // 取得 Records Key
                                let rdDay = items.Records[rd].Day; // 取得 Records  Day
                                // let rdQuantityCount = items.Records[rd].QuantityCount;  // 取得 Records  QuantityCount 數量
                                let rdDoseCount = items.Records[rd].DoseCount;  // 取得 Records DoseCount 藥劑量

                                     // 如 PatientId,Epos key,Day 都 Match 則塞入資料
                                    if ((tmpPatientsKeyDiff === rdPatientId) && (tmpEposKey === rdKey) && ((z + 1) === rdDay) && printTDValue === 0) {

                                        tmpRecordsCount = rdDoseCount;  // 暫存數值
                                        trContent += '<td>' + tmpRecordsCount + '</td>';  // 塞入欄位
                                        recordsSummary += tmpRecordsCount;  // 累加合計
                                        printTDValue = 1;

                                    }

                            } // rd loop

                            if (printTDValue === 0) {  // 若沒有資料,則輸出空白欄位
                               trContent += '<td>&nbsp;</td>';
                                printTDValue = 1;
                             }

                        } else {
                            trContent += '<td>&nbsp;</td>';
                        }

                    } // z loop

                    trContent += '<td>' + recordsSummary + '</td>';  // 塞入合計

                    if (y === (jsonEposLength - 1)) {    // 若輸出完品項,則更換病人的key值
                        tmpPatientsKeyMain = tmpPatientsKeyDiff;
                    }

                    trContent += '</tr>';

                } // y loop

            } // x loop


            $('#reportContent').append(trContent);

        }
        // self.Content = cube;
        // self.loading = false;
    };

    // 組表格(顯示完整表頭)
    self.analysisData = function analysisData(items) {

        self.jsonRecords = items;
        self.Content = [];
        let cube = [];
        let jsonPatientsEposlength = 0;
        // let jsonPatientslength = 0;
        let jsonPatientsflag = 0;
        let jsonEposLength = 0;
        let jsonEposflag = 0;
        let jsonRecordsLength = 0;
        // let reportField = self.daysOfMonth + 5; // 設定二維陣列長度  2病人名稱+2EPOS項目+每個月31天 + 1合計
        let reportField = self.daysOfMonth + 3; // 設定二維陣列長度  1病人名稱+1EPOS項目+每個月31天 + 1合計
        let recordsOffSet = 0;  // Records 日期位移
        let tmpRecordsCount = 0;
        let recordsSummary = 0;
        let temPatientsKey = '';
        let temEposKey = '';

        if (items) {

            jsonPatientsEposlength = ((Object.keys(items.Patients)).length) * ((Object.keys(items.Epos)).length); // patients + epos 項目總和才是完整表格標題
            // console.log('jsonPatientslength : ' + jsonPatientsEposlength + ' \n ');
            // jsonPatientslength = (Object.keys(items.Patients)).length;
            jsonEposLength = (Object.keys(items.Epos)).length;  // 取得EPO長度

            // 產生表格標頭
            for (let x = 0; x < jsonPatientsEposlength; x++) {
                recordsSummary = 0;
                cube[x] = [];
                // cube[x].length = reportField;  // 設定二維陣列長度  2病人名稱+2EPOS項目+每個月31天 + 1合計
                cube[x].length = reportField;  // 設定二維陣列長度  1病人名稱+1EPOS項目+每個月31天 + 1合計

                if (jsonEposflag >= jsonEposLength) {  // 判斷EPOS資料印完歸零再重印
                    jsonEposflag = 0;
                    jsonPatientsflag++;
                }

                // 塞入Patients項目
                // cube[x][0] = Object.keys(items.Patients)[jsonPatientsflag];  // PatientsKey
                temPatientsKey = Object.keys(items.Patients)[jsonPatientsflag];  // PatientsKey
                // cube[x][1] = Object.values(items.Patients)[jsonPatientsflag];  // PatientsValue
                if (jsonEposflag === 0) {  // 判斷每一個病人只輸出一次name
                    cube[x][0] = Object.values(items.Patients)[jsonPatientsflag];  // PatientsValue
                }

                // 塞入Epos項目
                // cube[x][2] = Object.keys(items.Epos)[jsonEposflag];  // EposKey
                temEposKey = Object.keys(items.Epos)[jsonEposflag];  // EposKey
                // cube[x][3] = Object.values(items.Epos)[jsonEposflag];  // EposValue
                cube[x][1] = Object.values(items.Epos)[jsonEposflag];  // EposValue

                jsonEposflag++;

                // console.log('塞入Epos項目 jsonEposflag= ' + jsonEposflag + 'cube[x][2] = ' + cube[x][3]);


                // 產生報表紀錄
                if (items.Records) {

                    jsonRecordsLength = items.Records.length;
                    // console.log('jsonRecordsLength = ' + jsonRecordsLength + '\n');

                    // 塞入Records 項目
                    for (let y = 0; y < jsonRecordsLength; y++) {
                        tmpRecordsCount = 0;
                        // if ((cube[x][0] === items.Records[y].PatientId) && (cube[x][2] === items.Records[y].Key)) {
                        if ((temPatientsKey === items.Records[y].PatientId) && (temEposKey === items.Records[y].Key)) {

                            // recordsOffSet = items.Records[y].Day + 4;  // Records 日期位移 +4 ,因為前有2病人名稱+2EPOS項目,共4欄
                            recordsOffSet = items.Records[y].Day + 1;  // Records 日期位移 +1 ,因為前有1病人名稱+1EPOS項目,共2欄
                            // tmpRecordsCount = items.Records[y].QuantityCount;  // 取得數量
                            tmpRecordsCount = items.Records[y].DoseCount;  // 取得藥劑量
                            cube[x][recordsOffSet] = tmpRecordsCount;  // 塞入數量
                            recordsSummary += tmpRecordsCount;  // 逐一加總
                        }

                    } // y loop

                }

                // 塞入summary
                cube[x][(reportField - 1)] = recordsSummary;

            } // x loop


            /*

                             if (items.Patients !== null && typeof (items.Patients) !== 'undefined') {
                                 console.log('===============Patients=======================');
                                 console.log('(Object.keys(items.Patients))[0] : \n' + (Object.keys(items.Patients))[0] + ' \n ');  // ex: 578899e327920c3338db8452
                                 console.log('(Object.values(items.Patients))[0] : \n' + (Object.values(items.Patients))[0] + ' \n ');  // ex: Kirkland
                             }

                             if (items.Epos !== null && typeof (items.Epos) !== 'undefined') {
                                 console.log('===============Epos=======================');
                                 console.log('(Object.keys(items.Epos))[0] : \n' + (Object.keys(items.Epos))[0] + ' \n ');  // ex: 593521b0234594253c3fbcd8
                                 console.log('(Object.values(items.Epos))[0] : \n' + (Object.values(items.Epos))[0] + ' \n ');  // ex: EXSP
                             }

                             if (items.Records[0] !== null && typeof (items.Records[0]) !== 'undefined') {
                                 // if (typeof (Object.values(items.Records[0])) !== 'undefined') {
                                 console.log('===============Records=======================');
                                 console.log('items.Records[0].PatientId : \n' + items.Records[0].PatientId + '\n');  // ex: 57889c0827920c3e0cc57546
                                 console.log('items.Records[0].Key : \n' + items.Records[0].Key + '\n');  // ex: 593521b0234594253c3fbcd8
                                 console.log('items.Records[0].Day : \n' + items.Records[0].Day + '\n');  // ex: 14
                                 console.log('items.Records[0].QuantityCount : \n' + items.Records[0].QuantityCount + '\n');  // ex: 3
                                 console.log('items.Records[0].DoseCount : \n' + items.Records[0].DoseCount + '\n');  // ex: 3000
                             }
                             */


        }
        self.Content = cube;
        // self.loading = false;
    };

}


    /**
     * 檔案:report/allEPO
     * api:/api/Reports/execution/ward/{透析室代碼}/date/{西元年月}
     * 值:
     * {
     *   "Epos": {
     *     "593521b0234594253c3fbcd8": "EXSP",
     *     "59367703234594104c724263": "鐵劑",
     *     "594cb501d8d33217d02a57c5": "EPO藥品測試123",
     *     "594cb5efd8d33217d02a57c8": "EPO藥品測試121",
     *     "594cd05dd8d33217d02a607c": "dd",
     *     "594cd062d8d33217d02a607d": "ee",
     *     "594cd068d8d33217d02a607e": "ff",
     *     "594cd071d8d33217d02a607f": "gg",
     *     "594cd04ed8d33217d02a6079": "aa",
     *     "594cd053d8d33217d02a607a": "bb",
     *     "594cd058d8d33217d02a607b": "cc"
     *   },
     *   "Patients": {
     *     "578899e327920c3338db8452": "Kirkland",
     *     "57970c1627920c4c6cfcc1fb": "陳伯明",
     *     "57970fe427920c4c6cfcc3c7": "宜弘測試",
     *     "57986836efefe11a24d5677e": "草莓牛奶",
     *     "57d36351efefe11928576093": "洪七公",
     *     "584f684900977e0b50cdfb96": "1234",
     *     "5949e1dad8d33213ecdf601f": "sdsd",
     *     "58d1e97cebc951155073026d": "wefwefwef008",
     *     "58d1eaedebc951155073029f": "efwwefwefewf009",
     *     "59030193e9589b0b085e26c5": "2017醉心病人",
     *     "577dffb527920c2dec67e554": "宜弘測試",
     *     "5772339d00977e113c1eb85c": "林智琳sdd",
     *     "57830f8fefefe12194c49cfb": "Snowball",
     *     "591baf69d7eb311e60274ce0": "劉的華",
     *     "57996cb227920c04684fb8db": "pikachu",
     *     "57889c0827920c3e0cc57546": "Coral",
     *     "593e39d6d8d3320c5826523c": "蔡一零",
     *     "57722bc700977e113c1eb78d": "蘇晨樺",
     *     "57722b1b00977e113c1eb774": "李小明11"
     *   },
     *   "Records": [
     *     {
     *       "PatientId": "5772339d00977e113c1eb85c",
     *       "Key": "593521b0234594253c3fbcd8",
     *       "Day": 26,
     *       "QuantityCount": 2,
     *       "DoseCount": 2000
     *     },
     *     {
     *       "PatientId": "57889c0827920c3e0cc57546",
     *       "Key": "593521b0234594253c3fbcd8",
     *       "Day": 7,
     *       "QuantityCount": 4,
     *       "DoseCount": 4000
     *     }]
     * }
     *
*/
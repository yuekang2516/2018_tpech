import report from './allCharge.html';
import './allCharge.less';

angular.module('app').component('allCharge', {
    template: report,
    controller: allChargeCtrl,
    controllerAs: 'allChar'
});

allChargeCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function allChargeCtrl($stateParams, allReportService, $state, $filter, SettingService) {

    const self = this;

    self.optionYear = [];
    self.optionMonth = [];
    self.Content = [];
    self.itmsjson = [];
    self.strYearMonth = '';
    self.daysOfMonth = 0;  // 宣告一個月有幾天
    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year
    self.toMonth = $filter('date')(self.date, 'M');   // get today month

    /** allCharge json報表內容:
     * 檔案: report/allCharge
     * api : /api/Reoprts/charge/ward/{透析室代碼}/date/{西元年月:201701)}
     * 範本值:
     * {
     *   "Charges": {
     *     "57280a9dbc2b880e0ca2f5be": "湯匙",
     *     "579af733bc2b885d084a269b": "筷子",
     *     "57204b9dbc2b8860ec6d1d33": "帥哥",
     *     "572329d7bc2b881fdc26cd19": "飲料",
     *     "594b6935d8d332295080c25e": "杯子",
     *     "594cc6a9d8d33217d02a5e82": "紗布"
     *   },
     *   "Records": [
     *     {
     *       "Key": "57204b9dbc2b8860ec6d1d33",
     *       "Day": 2,
     *       "Count": 2
     *     },
     *     {
     *       "Key": "57204b9dbc2b8860ec6d1d33",
     *       "Day": 10,
     *       "Count": 8
     *     },
     *     {
     *       "Key": "57204b9dbc2b8860ec6d1d33",
     *       "Day": 22,
     *       "Count": 0
     *     },
     *     {
     *       "Key": "57280a9dbc2b880e0ca2f5be",
     *       "Day": 3,
     *       "Count": 1
     *     },
     *     {
     *       "Key": "57280a9dbc2b880e0ca2f5be",
     *       "Day": 11,
     *       "Count": 1
     *     },
     *     {
     *       "Key": "57280a9dbc2b880e0ca2f5be",
     *       "Day": 17,
     *       "Count": 6
     *     },
     *     {
     *       "Key": "57280a9dbc2b880e0ca2f5be",
     *       "Day": 19,
     *       "Count": 5
     *     },
     *     {
     *       "Key": "57280a9dbc2b880e0ca2f5be",
     *       "Day": 23,
     *       "Count": 2
     *     },
     *     {
     *       "Key": "579af733bc2b885d084a269b",
     *       "Day": 3,
     *       "Count": 1
     *     },
     *     {      "Key": "579af733bc2b885d084a269b",
     *       "Day": 17,
     *       "Count": 1
     *     },
     *     {
     *       "Key": "579af733bc2b885d084a269b",
     *       "Day": 24,
     *       "Count": 1
     *     },
     *     {
     *       "Key": "572329d7bc2b881fdc26cd19",
     *       "Day": 10,
     *       "Count": 8
     *     },
     *     {
     *       "Key": "572329d7bc2b881fdc26cd19",
     *       "Day": 19,
     *       "Count": 8
     *     },
     *     {
     *       "Key": "572329d7bc2b881fdc26cd19",
     *       "Day": 23,
     *       "Count": 19
     *     },
     *     {
     *       "Key": "572329d7bc2b881fdc26cd19",
     *       "Day": 15,
     *       "Count": 2
     *     }
     *   ]
     * }
    */
    self.loading = true;

    // page init
    self.$onInit = function $onInit() {

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

        //  console.log('init setting Select Items \n self.selectedWards : ' + self.selectedWards + '\n self.selectedYear : ' + self.selectedYear + '\n self.selectedMonth : ' + self.selectedMonth);

        // self.loading = false;
    };

    // call allCharge Service
    self.getAllCharge = function getAllCharge() {
        self.loading = true;

        // 將年月下拉選單 組成YYYYmm 的格式
        self.strYearMonth = self.selectedYear.toString() + ('0' + self.selectedMonth.toString()).slice(-2);
        self.daysOfMonth = moment(self.strYearMonth, 'YYYYMM').daysInMonth();

        // call allCharge Service
        allReportService.getAllChargeByWardYearMonth(self.selectedWards, self.strYearMonth).then((q) => {
            self.analysisData(q.data);
            self.loading = false;
            self.isError = false;
        }, () => {
            self.loading = false;
            self.isError = true;
        });
        // self.loading = false;
    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'medicalCharges'
        });
    };

    // 組表格
    self.analysisData = function analysisData(items) {

        // self.itmsjson = items;
        let cube = [];
        let jsonChargesItemMaxLength = 0;
        let jsonRecordsItemMaxLength = 0;
        let tmpChargesKey = '';
        let tmpRecordsKey = '';
        let tmpRecordsDay = 0;
        let tmpSingleCount = 0;
        let tmpChargeItemSummary = 0;
        let reportField = self.daysOfMonth + 2; // 設定二維陣列長度  1名稱+每個月31天 + 1合計

        // console.log('daysOfMonth : ' + daysOfMonth + ' \n');
        // console.log('reportField : ' + reportField + ' \n');

        if (items) {  // 判斷service 是否有回傳值

            // 取ChargesItem 的Json長度
            jsonChargesItemMaxLength = (Object.keys(items.Charges)).length;
            // console.log('json.Charges.Item.MaxLength : ' + jsonChargesItemMaxLength + ' \n ');

            // 取Records 的Json長度
            jsonRecordsItemMaxLength = items.Records.length;
            // console.log('json.Records.Item.MaxLength : ' + jsonRecordsItemMaxLength + ' \n ');

            // 設定一維陣列長度
            cube.length = jsonChargesItemMaxLength;
            // console.log('cube.length : ' + cube.length + ' \n ');

            // read Charges
            for (let x = 0; x < jsonChargesItemMaxLength; x++) {
                tmpChargesKey = '';
                tmpSingleCount = 0;
                tmpChargeItemSummary = 0;
                cube[x] = [];   // 宣告二微陣列
                cube[x].length = reportField;  // 設定二維陣列長度  1名稱+每個月31天 + 1 合計
                tmpChargesKey = (Object.keys(items.Charges))[x]; // ex: 57280a9dbc2b880e0ca2f5be
                // console.log('cube[' + x + '].length : ' + cube[x].length + ' \n ');

                // fill left item key
                /*
                if (y === 0) {
                   cube[x][y] = tmpChargesKey; // ex: 57280a9dbc2b880e0ca2f5be
                 // console.log('cube[' + x + '][' + y + '] : ' + cube[x][y] + ' \n ');
                }
                */

                // fill left item name
                cube[x][0] = (Object.values(items.Charges))[x]; // ex: 湯匙
                // console.log('cube[' + x + '][' + y + '] : ' + cube[x][y] + ' \n ');

                // read Records
                for (let y = 0; y < jsonRecordsItemMaxLength; y++) {

                    // let tmpY = z + 1;  // 因0項放name,故需位移1
                    tmpRecordsKey = items.Records[y].Key; // ex: 572329d7bc2b881fdc26cd19
                    tmpRecordsDay = items.Records[y].Day; // ex: 1
                    tmpSingleCount = items.Records[y].Count; // ex: 2

                    // summary and fill record
                    if (tmpChargesKey === tmpRecordsKey) { // 比對id

                        cube[x][tmpRecordsDay] = tmpSingleCount;
                        /*
                        console.log('================ y : ' + y + ' ================\n ');
                        console.log('tmpChargesKey : ', tmpChargesKey);
                        console.log('Record.key : ' + tmpRecordsKey);
                        console.log('cube.name : ', cube[x]);
                        console.log('Record.day : ' + tmpRecordsDay);
                        console.log('tmpSingleCount : ' + tmpSingleCount);
                        console.log('tmpChargeItemSummary befor : ' + tmpChargeItemSummary);
                        */
                        tmpChargeItemSummary += tmpSingleCount;   // 累加
                        // console.log('tmpChargeItemSummary after : ' + tmpChargeItemSummary);
                    }

                } // y loop

                cube[x][reportField - 1] = tmpChargeItemSummary; // summary
                // console.log('cube[' + x + '][33] : ' + cube[x][34] + ' \n ');
            } // x loop

        }


        /*
        console.log('==============================================');

        console.log('Object.keys(items.Charges) : \n' + Object.keys(items.Charges) + '\n');  // 57280a9dbc2b880e0ca2f5be,579af733bc2b885d084a269b,57204b9dbc2b8860ec6d1d33,572329d7bc2b881fdc26cd19,594b6935d8d332295080c25e,594cc6a9d8d33217d02a5e82,594b82692345942470f6451b,594cc8e6d8d33217d02a5f08,594cc8f9d8d33217d02a5f1f,594cc8d3d8d33217d02a5ef1,594cc90cd8d33217d02a5f36
        console.log('Object.values(items.Charges) : \n' + Object.values(items.Charges) + '\n'); // 湯匙,筷子,帥哥,飲料,杯子,紗布,20170622,bb,cc,aa,dd
        console.log('(Object.keys(items.Charges))[0] : \n' + (Object.keys(items.Charges))[0] + ' \n ');  // 57280a9dbc2b880e0ca2f5be
        console.log('(Object.values(items.Charges))[0] : \n' + (Object.values(items.Charges))[0] + ' \n ');  // 湯匙

        console.log('==============================================');

        console.log('Object.keys(items.Records[0]) : \n' + Object.keys(items.Records[0]) + '\n');   // Key,Day,Count
        console.log('Object.values(items.Records[0]) : \n' + Object.values(items.Records[0]) + '\n'); // 572329d7bc2b881fdc26cd19,1,2
        console.log('(Object.keys(items.Records[0]))[0] : \n' + (Object.keys(items.Records[0]))[0] + ' \n ');  // Key
        console.log('(Object.values(items.Records[0]))[0] : \n' + (Object.values(items.Records[0]))[0] + ' \n '); // 572329d7bc2b881fdc26cd19

        console.log('==============================================');

        console.log('items.Records[0].Key : \n' + items.Records[0].Key + '\n');  // 572329d7bc2b881fdc26cd19
        console.log('items.Records[0].Day : \n' + items.Records[0].Day + '\n');  // 1
        console.log('items.Records[0].Count : \n' + items.Records[0].Count + '\n');  // 2
        */

        self.Content = cube;
    };


}


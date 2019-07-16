import report from './allVisit.html';
import './allVisit.less';

angular.module('app').component('allVisit', {
    template: report,
    controller: allVisitCtrl,
    controllerAs: 'allV'
});

allVisitCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function allVisitCtrl($stateParams, allReportService, $state, $filter, SettingService) {

    const self = this;

    let $translate = $filter('translate');

    self.optionYear = [];
    self.optionMonth = [];
    self.Content = [];
    self.itmsjson = [];
    self.strYearMonth = '';
    self.daysOfMonth = 0;
    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year
    self.toMonth = $filter('date')(self.date, 'M');   // get today month

    self.jsonShift = {    // 定義班別為 早(morning),午(afternoon),晚(evening),夜(night),臨時(temp),未排床的則為其他(other)
        morning: $translate('reports.allVisit.component.morning'),
        afternoon: $translate('reports.allVisit.component.afternoon'),
        evening: $translate('reports.allVisit.component.evening'),
        night: $translate('reports.allVisit.component.night'),
        temp: $translate('reports.allVisit.component.temp'),
        other: $translate('reports.allVisit.component.other')
    };

    self.loading = true;
    self.isError = false;

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
        self.searching = false;
        self.searchContent = false;
        // //  console.log('init setting Select Items \n self.selectedWards : ' + self.selectedWards + '\n self.selectedYear : ' + self.selectedYear + '\n self.selectedMonth : ' + self.selectedMonth);

        self.loading = false;
    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'allVisit'
        });

    };

    // call allVisit Service
    self.getAllVisit = function getAllVisit() {
        // self.loading = true;
        self.searching = true;
        self.searchContent = false;

        // 將年月下拉選單 組成YYYYmm 的格式
        self.strYearMonth = self.selectedYear.toString() + ('0' + self.selectedMonth.toString()).slice(-2);
        self.daysOfMonth = moment(self.strYearMonth, 'YYYYMM').daysInMonth();
        self.contentYear = self.selectedYear;
        self.contentMonth = self.selectedMonth;
        // call allVisit Service
        allReportService.getAllVisitByWardYearMonth(self.selectedWards, self.strYearMonth).then((q) => {
            self.analysisData(q.data);
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
        // self.loading = false;
    };

    // 組表格
    self.analysisData = function analysisData(items) {

        // self.itmsjson = items;  // 顯示json格式於 view
        let cube = [6];  // 設定cube陣列,因班別只有早,中,晚,夜,臨時,其他六班,故縱軸設定6
        let itemsLength = 0;
        let tableLength = self.daysOfMonth + 2; // 設定陣列長度 每月31天+ 1項目 + 1合計
        let tempCount = 0;   // temp daily count
        let tempDay = 0;
        let morningSummary = 0;  // 早班合計
        let afternoonSummary = 0; // 中班合計
        let eveningSummary = 0; // 晚班合計
        let nightSummary = 0;   // 夜班合計
        let tempSummary = 0;    // 臨時班合計
        let otherSummary = 0;   // 其他合計

        // console.log('self.jsonShift.first: ' + self.jsonShift.first);

        if (items) {  // 判斷是否items有資料

            itemsLength = items.length; // 取得items資料長度

            cube[0] = [tableLength];  // 設定早班陣列長度
            cube[1] = [tableLength];  // 設定中班陣列長度
            cube[2] = [tableLength];  // 設定晚班陣列長度
            cube[3] = [tableLength];  // 設定夜班陣列長度
            cube[4] = [tableLength];  // 設定臨時班陣列長度
            cube[5] = [tableLength];  // 設定其他陣列長度

            // 設定表
            cube[0][0] = self.jsonShift.morning;  // 塞入早班的值
            cube[1][0] = self.jsonShift.afternoon;  // 塞入中班的值
            cube[2][0] = self.jsonShift.evening;  // 塞入晚班的值
            cube[3][0] = self.jsonShift.night;  // 塞入夜班的值
            cube[4][0] = self.jsonShift.temp;  // 塞入臨時班的值
            cube[5][0] = self.jsonShift.other;  // 塞入其他的值

            // 讀取items資料塞入表格
            for (let x = 0; x < itemsLength; x++) {

                tempCount = 0;   // temp daily count

                /*
                console.log('items.length : ' + items.length);
                console.log('items[0].Shift : ' + items[0].Shift);
                console.log('items[0].Day : ' + items[0].Day);
                console.log('items[0].Count : ' + items[0].Count);
                */

                tempDay = items[x].Day;  // 取出日期
                tempCount = items[x].Count;

                // console.log('tempDay : ' + tempDay);
                // console.log('tempCount : ' + tempCount);
                // console.log('items[' + x + '].shift : ' + items[x].Shift);

                switch (items[x].Shift) {   // 判斷items資料塞早中晚班哪一班
                    case 'morning':
                        cube[0][tempDay] = tempCount;
                        morningSummary += tempCount;   // 早班累加合計
                        break;
                    case 'afternoon':
                        cube[1][tempDay] = tempCount;
                        afternoonSummary += tempCount;  // 中班累加合計
                        break;
                    case 'evening':
                        cube[2][tempDay] = tempCount;
                        eveningSummary += tempCount;  // 晚班累加合計
                        break;
                    case 'night':
                        cube[3][tempDay] = tempCount;
                        nightSummary += tempCount;  // 夜班累加合計
                        break;
                    case 'temp':
                        cube[4][tempDay] = tempCount;
                        tempSummary += tempCount;  // 臨時班累加合計
                        break;
                    case 'other':
                        cube[5][tempDay] = tempCount;
                        otherSummary += tempCount;  // 其他累加合計
                        break;
                    default:
                        break;
                }


            } // x loop

            // Summary
            cube[0][tableLength - 1] = morningSummary;  // 塞入早班合計欄位
            cube[1][tableLength - 1] = afternoonSummary;  // 塞入中班合計欄位
            cube[2][tableLength - 1] = eveningSummary;  // 塞入晚班合計欄位
            cube[3][tableLength - 1] = nightSummary;  // 塞入夜班合計欄位
            cube[4][tableLength - 1] = tempSummary;  // 塞入臨時班合計欄位
            cube[5][tableLength - 1] = otherSummary;  // 塞入其他合計欄位

        }
        self.Content = cube;
    };


}

/**
 * report/allVisit
 * api:/api/reports/visit/ward/{透析室代碼}/date/{西元年月}
 * first:早班(12:00 前開表)，second:中班(12:00 ~ 17:00 開表) night: 晚班 (17:00 後開表)
 * 值:
 * [
 *   {
 *     "Shift": "night",
 *     "Day": 22,
 *     "Count": 3
 *   },
 *   {
 *     "Shift": "night",
 *     "Day": 19,
 *     "Count": 2
 *   },
 *   {
 *     "Shift": "night",
 *     "Day": 5,
 *     "Count": 2
 *   },
 *   {
 *     "Shift": "night",
 *     "Day": 21,
 *     "Count": 1
 *   },
 *   {
 *     "Shift": "first",
 *    "Day": 13,
 *     "Count": 1
 *   },
 *   {
 *    "Shift": "first",
 *     "Day": 21,
 *     "Count": 1
 *   },
 *   {
 *     "Shift": "first",
 *     "Day": 22,
 *     "Count": 1
 *  },
 *   {
 *     "Shift": "first",
 *     "Day": 1,
 *     "Count": 1
 *   },
 *  {
 *     "Shift": "first",
 *     "Day": 19,
 *     "Count": 1
 *   },
 *   {
 *     "Shift": "first",
 *     "Day": 23,
 *     "Count": 1
 *   },
 *   {
 *     "Shift": "second",
 *     "Day": 23,
 *     "Count": 1
 *   },
 *   {
 *     "Shift": "second",
 *     "Day": 3,
 *     "Count": 1
 *   }
 * ]
 */

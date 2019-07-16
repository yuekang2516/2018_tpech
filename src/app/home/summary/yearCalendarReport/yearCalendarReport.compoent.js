import report from './yearCalendarReport.html';
import './yearCalendarReport.less';

angular.module('app').component('yearCalendarReport', {
    template: report,
    controller: yearCalendarReportCtrl
});

yearCalendarReportCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService', 'CalendarEventsService', 'PatientService'];

function yearCalendarReportCtrl($stateParams, allReportService, $state, $filter, SettingService, CalendarEventsService, PatientService) {

    const self = this;

    self.optionYear = [];
    self.Content = [];
    self.itmsjson = [];

    let $translate = $filter('translate');


    self.date = new Date(); // get today date moment().add(1, 'y')
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year

    self.isError = false;

    // page init
    self.$onInit = function $onInit() {

        self.loading = true;

        // year dropdownlist items setting
        for (let j = (self.toYear - 19); j <= self.toYear; j++) {
            self.optionYear.push(j + 1); // 往未來多一年
        }

        self.selectedYear = self.toYear;

        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;

                groupedAllData();

            }, (error) => {
                console.error('PatientService err', error);
                self.loading = false;
                self.isError = true;
            });


    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'yearCalendar'
        });

    };

    // call yearCalendar Service
    self.changeYear = function changeYear() {
        console.log('改年份', self.selectedYear);
        self.loading = true;
        groupedAllData();
    };


    // 組裝data
    function groupedAllData() {

        CalendarEventsService.getAllYearPlans($stateParams.patientId, self.selectedYear, 'report').then((q) => {
            console.log('取得年度計畫表q', angular.copy(q));

            // 所有計畫清單 TODO: 暫時改成 q
            // self.planList = q;
            self.planList = q.data;
            if (self.planList.length === 0) {
                // TODO: 沒有資料
                console.log('沒資料！！！');
                self.noData = true;
                self.loading = false;
                return;
            }
            self.noData = false;
            // 依照月份群組
            let grouped = _.groupBy(self.planList, 'Month');
            console.log('取得年度計畫表 group', grouped);

            let ordered = angular.copy(grouped);// 排序用
            // 依照 執行日期排序
            _.forEach(ordered, (value, key) => {
                console.log('value', value);
                console.log('orderBy', _.orderBy(value, ['ProcessTime'], ['desc']));
                // 將排序過的塞回原來的grouped
                grouped[key] = _.orderBy(value, ['ProcessTime'], ['asc']);
            });
            console.log('依照 執行日期排序 grouped', grouped);
            self.grouped = grouped;
            // 計算單月最多比數數值
            let maxLength = _.maxBy(_.values(grouped), (o) => { return o.length; }).length;
            self.maxLength = maxLength;
            console.log('取得年度計畫表 maxLength', maxLength);
            // _.map(grouped, (arr) => {
            //     console.log('arr!!', arr);
            //     if (arr.length < maxLength) {
            //         // 將不足樹的月份補齊數量
            //         let differentLength = maxLength - arr.length;
            //         for (let i = 0; i < differentLength; i++) {
            //             arr.push({
            //                 Content: null,
            //                 Month: null,
            //                 ProcessTime: null,
            //                 Title: null,
            //                 UserId: null,
            //                 UserName: null
            //             });
            //         }
            //         console.log('arr', arr);
            //     }
            // });
            self.loading = false;
        }, (err) => {
            console.error('取得年度計畫 err', err);
            self.loading = false;
            self.isError = true;
        });
    }


    // 回上頁
    self.back = function goback() {
        history.go(-1);
    };




}


/*
    // 組表格
    self.analysisData = function analysisData(items) {

        // self.itmsjson = items;  // 顯示json格式於 view

        // let heightLength = (Object.keys(items[0]).length) - 1;  // 取得項目共有幾個,-1 因month 不須特別顯示
        let heightLength = (12);  // 取得項目共有幾個  Object.keys(self.tableItemName).length
        let cube = [heightLength];  // 設定cube陣列高度
        let widthLength = 12; // 設定陣列長度 每年12個月
        let strItemTitle = '';

        let tempCount = 0; // temp count
        let tempSummary = 0;  // temp summary


        if (items) {  // 判斷是否items有資料


            for (let x = 0; x < heightLength; x++) {

                tempSummary = 0;
                cube[x] = [widthLength];  // 設定二維陣列寬度

                for (let y = 0; y < widthLength; y++) {

                    strItemTitle = 'x';// Object.values(self.tableItemName)[x];
                    cube[x][0] = strItemTitle;  // 塞入列表項目名稱

                    for (let z = 0; z < items.length; z++) {  // 取資料

                        if (y === ((items[z]).Month)) {


                            // console.log(' key: ' + Object.keys(items[z]));
                            // console.log('values: ' + Object.values(items[z]));
                            // console.log(' values[' + z + ' + 1 ]:' + Object.values(items[z])[z + 1]);
                            // console.log('============================================================');

                            if (strItemTitle.match($translate('reports.yearCalendar.component.count')) != null || strItemTitle.match($translate('reports.yearCalendar.component.times')) != null) {  // 若項目為純數值(百分比,率除外),則進行合計

                                tempCount = Object.values(items[z])[x + 1];
                                cube[x][y] = tempCount;
                                tempSummary += tempCount;  // 累加至合計

                            } else {

                                tempCount = Object.values(items[z])[x + 1];
                                cube[x][y] = $filter('number')(tempCount, 2);  // 項目為百分比,率等字眼的,只做數值表現不做合計
                            }


                        }

                    } // z loop


                } // y loop

                if (strItemTitle.match($translate('reports.yearCalendar.component.count')) != null || strItemTitle.match($translate('reports.yearCalendar.component.times')) != null) {

                    cube[x][widthLength - 1] = tempSummary;  // 塞入合計值

                } else {
                    cube[x][widthLength - 1] = '--';   // 不計算合計欄位
                }

            } // x loop


        }

        self.Content = cube;
        console.log('yearCalendar', self.Content);

    };
*/

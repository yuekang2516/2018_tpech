import report from './demography.html';
import './demography.less';

angular.module('app').component('demography', {
    template: report,
    controller: demographyCtrl,
    controllerAs: 'dg'
});

demographyCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function demographyCtrl($stateParams, allReportService, $state, $filter, SettingService) {

    const self = this;

    let $translate = $filter('translate');

    self.optionYear = [];
    self.Content = [];
    self.itmsjson = [];

    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year

    self.tableItemName = {    // 定義表格項目名稱
        // Month: '月份',
        PatientCount: $translate('reports.demography.component.PatientCount'),
        AverageAge: $translate('reports.demography.component.AverageAge'),
        ElderCount: $translate('reports.demography.component.ElderCount'),
        DiabeticNephropathyCount: $translate('reports.demography.component.DiabeticNephropathyCount'),
        DeathCount: $translate('reports.demography.component.DeathCount')
    };


    self.loading = true;
    self.isError = false;

    // page init
    self.$onInit = function $onInit() {

        // WardNumber dropdownlist items setting
        self.wards = SettingService.getCurrentUser().Ward;
        self.keys = Object.keys(self.wards);
        self.selectedWards = self.keys[0];

        // console.log('wards : ' + self.selectedWards);

        // year dropdownlist items setting
        for (let j = (self.toYear - 19); j <= self.toYear; j++) {
            self.optionYear.push(j);
        }
        self.selectedYear = self.toYear;
        self.loading = false;
        self.searching = false;
        self.searchContent = false;
    };

    // call demography Service
    self.getdemography = function getdemography() {
        // self.loading = true;
        self.searching = true;
        self.searchContent = false;
        self.contentYear = self.selectedYear;

        // call demography Service
        allReportService.getDemographyByWardYear(self.selectedYear).then((q) => {
            self.analysisData(q.data);
            // self.loading = false;
            self.isError = false;
            self.searching = false;
            self.searchContent = true;
        }, () => {
            // self.loading = false;
            self.isError = true;
            self.searching = false;
            self.searchContent = true;
        });
        // self.loading = false;
    };

    // 組表格
    self.analysisData = function analysisData(items) {

        // self.itmsjson = items;  // 顯示json格式於 view

        // let heightLength = (Object.keys(items[0]).length) - 1;  // 取得項目共有幾個,-1 因month 不須特別顯示
        let heightLength = (Object.keys(self.tableItemName).length);  // 取得項目共有幾個
        let cube = [heightLength];  // 設定cube陣列高度
        let widthLength = 12 + 2; // 設定陣列長度 每年12個月+ 1項目 + 1合計

        let tempCount = 0; // temp count
        let patientCountSummary = 0;  // 病人總數合計
        let elderCounSummary = 0; // 年齡>=65歲者合計
        let diabeticNephropathyCountSummary = 0; // 糖尿病腎病病人數合計
        let deathCountSummary = 0; // 死亡個案數合計

        if (items.length > 0) {  // 判斷是否items有資料

            // 產生陣列表格與塞入項目名稱
            for (let x = 0; x < heightLength; x++) {

                cube[x] = [widthLength];
                cube[x][0] = Object.values(self.tableItemName)[x];  // 塞入列表項目名稱

                for (let y = 0; y < items.length; y++) {  // 讀取items資料塞入表格


                    // 塞入一般欄位

                    switch (x) {
                        case 0:  // 病人總數
                            tempCount = (items[y]).PatientCount;
                            cube[x][(items[y]).Month] = tempCount;  // 將資料塞進對應的陣列欄位裡
                            patientCountSummary += tempCount;
                            break;
                        case 1:  // 平均年齡
                            cube[x][(items[y]).Month] = (items[y]).AverageAge;  // 平均歲數不用計算合計值
                            break;
                        case 2:  // 年齡>=65歲者
                            tempCount = (items[y]).ElderCount;
                            cube[x][(items[y]).Month] = tempCount;  // 將資料塞進對應的陣列欄位裡
                            elderCounSummary += tempCount;
                            break;
                        case 3:  // 糖尿病腎病病人數
                            tempCount = (items[y]).DiabeticNephropathyCount;
                            cube[x][(items[y]).Month] = tempCount;        // 將資料塞進對應的陣列欄位裡
                            diabeticNephropathyCountSummary += tempCount;
                            break;
                        case 4:  // 死亡個案數
                            tempCount = (items[y]).DeathCount;
                            cube[x][(items[y]).Month] = tempCount;   // 將資料塞進對應的陣列欄位裡
                            deathCountSummary += tempCount;
                            break;

                    } // switch

                } // y loop

                // 塞入合計欄位
                switch (x) {
                    case 0:  // 病人總數合計
                        cube[x][widthLength - 1] = patientCountSummary;
                        break;
                    case 1:  // 平均年齡合計
                        cube[x][widthLength - 1] = '--';  // 平均歲數不用計算合計值
                        break;
                    case 2:  // 年齡>=65歲者合計
                        cube[x][widthLength - 1] = elderCounSummary;
                        break;
                    case 3:  // 糖尿病腎病病人數合計
                        cube[x][widthLength - 1] = diabeticNephropathyCountSummary;
                        break;
                    case 4:  // 死亡個案數合計
                        cube[x][widthLength - 1] = deathCountSummary;
                        break;

                }


            } // x loop

            // 死亡原因
            console.log(items[0].DeathReasonStatistics);
            if (items[0].DeathReasonStatistics) { // 另外處理死亡原因
                let content2 = [];

                items.forEach((item, index) => {
                    Object.keys(item.DeathReasonStatistics).forEach((key, i) => {
                        if (!content2[i]) {
                            content2[i] = [];
                            content2[i][0] = key;
                            content2[i][13] = 0; // 先把合計設為 0
                        }
                        content2[i][item.Month] = item.DeathReasonStatistics[key];
                        content2[i][13] += item.DeathReasonStatistics[key]; // 合計
                    });
                });
                self.content2 = content2;
            }
        }

        self.Content = cube;

    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'demography'
        });

    };


}


/*
檔案:report/demography
api:/api/Reports/demography/ward/{透析室代碼}/date/{西元年月}
值:
[
  {
    "Month": 1,
    "PatientCount": 1,
    "AverageAge": 32,
    "ElderCount": 0,
    "DiabeticNephropathyCount": 0,
    "DeathCount": 0
  },
  {
    "Month": 4,
    "PatientCount": 1,
    "AverageAge": 31,
    "ElderCount": 0,
    "DiabeticNephropathyCount": 0,
    "DeathCount": 0
  },
  {
    "Month": 5,
    "PatientCount": 4,
    "AverageAge": 17,
    "ElderCount": 0,
    "DiabeticNephropathyCount": 0,
    "DeathCount": 0
  },
  {
    "Month": 6,
    "PatientCount": 9,
    "AverageAge": 24,
    "ElderCount": 1,
    "DiabeticNephropathyCount": 0,
    "DeathCount": 1
  },
  {
    "Month": 7,
    "PatientCount": 5,
    "AverageAge": 10,
    "ElderCount": 0,
    "DiabeticNephropathyCount": 0,
    "DeathCount": 0
  }
]
 */

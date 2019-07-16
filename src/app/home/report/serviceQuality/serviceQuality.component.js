import report from './serviceQuality.html';
import './serviceQuality.less';

angular.module('app').component('serviceQuality', {
    template: report,
    controller: serviceQualityCtrl,
    controllerAs: 'sq'
});

serviceQualityCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function serviceQualityCtrl($stateParams, allReportService, $state, $filter, SettingService) {

    const self = this;

    self.optionYear = [];
    self.Content = [];
    self.itmsjson = [];
    self.isError = false;

    let $translate = $filter('translate');


    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year

    self.tableItemName = {
        // Month: '月份',
        PatientItems: $translate('reports.serviceQuality.component.PatientItems'),
        PatientCount: $translate('reports.serviceQuality.component.PatientCount'),
        AlbuminNumber: $translate('reports.serviceQuality.component.AlbuminNumber'),
        AlbuminPercent: $translate('reports.serviceQuality.component.AlbuminPercent'),
        AlbuminAverage: $translate('reports.serviceQuality.component.AlbuminAverage'),
        AlbuminMore35Percent: $translate('reports.serviceQuality.component.AlbuminMore35Percent'),
        KtVNumber: $translate('reports.serviceQuality.component.KtVNumber'),
        KtVPercent: $translate('reports.serviceQuality.component.KtVPercent'),
        KtVAverage: $translate('reports.serviceQuality.component.KtVAverage'),
        KtVMore2Percent: $translate('reports.serviceQuality.component.KtVMore2Percent'),
        HctNumber: $translate('reports.serviceQuality.component.HctNumber'),
        HctPercent: $translate('reports.serviceQuality.component.HctPercent'),
        HctAverage: $translate('reports.serviceQuality.component.HctAverage'),
        HctMore26Percent: $translate('reports.serviceQuality.component.HctMore26Percent'),
        HbNumber: $translate('reports.serviceQuality.component.HbNumber'),
        HbPercent: $translate('reports.serviceQuality.component.HbPercent'),
        HbAverage: $translate('reports.serviceQuality.component.HbAverage'),
        HbMore26Percent: $translate('reports.serviceQuality.component.HbMore26Percent'),
        AdmissionCount: $translate('reports.serviceQuality.component.AdmissionCount'),
        AdmissionPercent: $translate('reports.serviceQuality.component.AdmissionPercent'),
        DeathCount: $translate('reports.serviceQuality.component.DeathCount'),
        LessYearDeath: $translate('reports.serviceQuality.component.LessYearDeath'),
        MoreYearDeath: $translate('reports.serviceQuality.component.MoreYearDeath'),
        VesselCount: $translate('reports.serviceQuality.component.VesselCount'),
        VesselPercent: $translate('reports.serviceQuality.component.VesselPercent'),
        RestoreCount: $translate('reports.serviceQuality.component.RestoreCount'),
        RestorePercent: $translate('reports.serviceQuality.component.RestorePercent'),
        KidneyTransplantCount: $translate('reports.serviceQuality.component.KidneyTransplantCount'),
        KidneyTransplantPercent: $translate('reports.serviceQuality.component.KidneyTransplantPercent'),
        HBsAgPositiveCount: $translate('reports.serviceQuality.component.HBsAgPositiveCount'),
        HBsAgNegativeCount: $translate('reports.serviceQuality.component.HBsAgNegativeCount'),
        HBsAgPositivePercent: $translate('reports.serviceQuality.component.HBsAgPositivePercent'),
        AntiHCVPositiveCount: $translate('reports.serviceQuality.component.AntiHCVPositiveCount'),
        AntiHCVNegativeCount: $translate('reports.serviceQuality.component.AntiHCVNegativeCount'),
        AntiHCVPositivePercent: $translate('reports.serviceQuality.component.AntiHCVPositivePercent')
    };

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
        self.loading = false;
        self.searching = false;
        self.searchContent = false;
    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'serviceQuality'
        });

    };

    // call serviceQuality Service
    self.getserviceQuality = function getserviceQuality() {
        // self.loading = true;

        self.searching = true;
        self.searchContent = false;
        self.contentYear = self.selectedYear;
        // call serviceQuality Service
        allReportService.getServiceQualityByWardYear(self.selectedYear).then((q) => {
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

        // let heightLength = (Object.keys(items[0]).length) - 1;  // 取得項目共有幾個,-1 因month 不須特別顯示
        let heightLength = (Object.keys(self.tableItemName).length);  // 取得項目共有幾個
        let cube = [heightLength];  // 設定cube陣列高度
        let widthLength = 12 + 2; // 設定陣列長度 每年12個月+ 1項目 + 1合計
        let strItemTitle = '';

        let tempCount = 0; // temp count
        let tempSummary = 0;  // temp summary


        if (items) {  // 判斷是否items有資料


            for (let x = 0; x < heightLength; x++) {

                tempSummary = 0;
                cube[x] = [widthLength];  // 設定二維陣列寬度

                for (let y = 0; y < widthLength; y++) {

                    strItemTitle = Object.values(self.tableItemName)[x];
                    cube[x][0] = strItemTitle;  // 塞入列表項目名稱

                    for (let z = 0; z < items.length; z++) {  // 取資料

                        if (y === ((items[z]).Month)) {


                            // console.log(' key: ' + Object.keys(items[z]));
                            // console.log('values: ' + Object.values(items[z]));
                            // console.log(' values[' + z + ' + 1 ]:' + Object.values(items[z])[z + 1]);
                            // console.log('============================================================');

                            if (strItemTitle.match($translate('reports.serviceQuality.component.count')) != null || strItemTitle.match($translate('reports.serviceQuality.component.times')) != null) {  // 若項目為純數值(百分比,率除外),則進行合計

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

                if (strItemTitle.match($translate('reports.serviceQuality.component.count')) != null || strItemTitle.match($translate('reports.serviceQuality.component.times')) != null) {

                    cube[x][widthLength - 1] = tempSummary;  // 塞入合計值

                } else {
                    cube[x][widthLength - 1] = '--';   // 不計算合計欄位
                }

            } // x loop


        }

        self.Content = cube;
        console.log('serviceQuality', self.Content);

    };

}

/*
 report/serviceQuality
api:/api/Reports/serviceQuality/ward/{透析室代碼}/date/{西元年月}
值:
[
  {
    "Month": 1,
    "PatientCount": 1,
    "AlbuminNumber": null,
    "AlbuminPercent": null,
    "AlbuminAverage": null,
    "AlbuminMore35Percent": null,
    "KtVNumber": null,
    "KtVPercent": null,
    "KtVAverage": null,
    "KtVMore12Percent": null,
    "HctNumber": null,
    "HctPercent": null,
    "HctAverage": null,
    "HctMore26Percent": null,
    "HbNumber": null,
    "HbPercent": null,
    "HbAverage": null,
    "HbMore26Percent": null,
    "AdmissionCount": null,
    "AdmissionPercent": null,
    "DeathCount": 0,
    "LessYearDeath": 0,
    "MoreYearDeath": 0,
    "VesselCount": 0,
    "VesselPercent": 0,
    "RestoreCount": 0,
    "RestorePercent": 0,
    "KidneyTransplantCount": 0,
    "KidneyTransplantPercent": 0,
    "HBsAgPositiveCount": null,
    "HBsAgNegativeCount": null,
    "HBsAgPositivePercent": null,
    "AntiHCVPositiveCount": null,
    "AntiHCVNegativeCount": null,
    "AntiHCVPositivePercent": null
  },
  {
    "Month": 4,
    "PatientCount": 1,
    "AlbuminNumber": null,
    "AlbuminPercent": null,
    "AlbuminAverage": null,
    "AlbuminMore35Percent": null,
    "KtVNumber": null,
    "KtVPercent": null,
    "KtVAverage": null,
    "KtVMore12Percent": null,
    "HctNumber": null,
    "HctPercent": null,
    "HctAverage": null,
    "HctMore26Percent": null,
    "HbNumber": null,
    "HbPercent": null,
    "HbAverage": null,
    "HbMore26Percent": null,
    "AdmissionCount": null,
    "AdmissionPercent": null,
    "DeathCount": 0,
    "LessYearDeath": 0,
    "MoreYearDeath": 0,
    "VesselCount": 1,
    "VesselPercent": 100,
    "RestoreCount": 0,
    "RestorePercent": 0,
    "KidneyTransplantCount": 0,
    "KidneyTransplantPercent": 0,
    "HBsAgPositiveCount": null,
    "HBsAgNegativeCount": null,
    "HBsAgPositivePercent": null,
    "AntiHCVPositiveCount": null,
    "AntiHCVNegativeCount": null,
    "AntiHCVPositivePercent": null
  },
  {
    "Month": 5,
    "PatientCount": 4,
    "AlbuminNumber": null,
    "AlbuminPercent": null,
    "AlbuminAverage": null,
    "AlbuminMore35Percent": null,
    "KtVNumber": null,
    "KtVPercent": null,
    "KtVAverage": null,
    "KtVMore12Percent": null,
    "HctNumber": 2,
    "HctPercent": 50,
    "HctAverage": 45.35,
    "HctMore26Percent": 50,
    "HbNumber": 2,
    "HbPercent": 0.5,
    "HbAverage": 21.15,
    "HbMore26Percent": 50,
    "AdmissionCount": null,
    "AdmissionPercent": null,
    "DeathCount": 0,
    "LessYearDeath": 0,
    "MoreYearDeath": 0,
    "VesselCount": 11,
    "VesselPercent": 275,
    "RestoreCount": 0,
    "RestorePercent": 0,
    "KidneyTransplantCount": 0,
    "KidneyTransplantPercent": 0,
    "HBsAgPositiveCount": null,
    "HBsAgNegativeCount": null,
    "HBsAgPositivePercent": null,
    "AntiHCVPositiveCount": null,
    "AntiHCVNegativeCount": null,
    "AntiHCVPositivePercent": null
  },
  {
    "Month": 6,
    "PatientCount": 9,
    "AlbuminNumber": null,
    "AlbuminPercent": null,
    "AlbuminAverage": null,
    "AlbuminMore35Percent": null,
    "KtVNumber": null,
    "KtVPercent": null,
    "KtVAverage": null,
    "KtVMore12Percent": null,
    "HctNumber": null,
    "HctPercent": null,
    "HctAverage": null,
    "HctMore26Percent": null,
    "HbNumber": null,
    "HbPercent": null,
    "HbAverage": null,
    "HbMore26Percent": null,
    "AdmissionCount": null,
    "AdmissionPercent": null,
    "DeathCount": 1,
    "LessYearDeath": 0,
    "MoreYearDeath": 0,
    "VesselCount": 11,
    "VesselPercent": 122.22222222222223,
    "RestoreCount": 0,
    "RestorePercent": 0,
    "KidneyTransplantCount": 0,
    "KidneyTransplantPercent": 0,
    "HBsAgPositiveCount": null,
    "HBsAgNegativeCount": null,
    "HBsAgPositivePercent": null,
    "AntiHCVPositiveCount": null,
    "AntiHCVNegativeCount": null,
    "AntiHCVPositivePercent": null
  },
  {
    "Month": 7,
    "PatientCount": 5,
    "AlbuminNumber": null,
    "AlbuminPercent": null,
    "AlbuminAverage": null,
    "AlbuminMore35Percent": null,
    "KtVNumber": null,
    "KtVPercent": null,
    "KtVAverage": null,
    "KtVMore12Percent": null,
    "HctNumber": null,
    "HctPercent": null,
    "HctAverage": null,
    "HctMore26Percent": null,
    "HbNumber": null,
    "HbPercent": null,
    "HbAverage": null,
    "HbMore26Percent": null,
    "AdmissionCount": null,
    "AdmissionPercent": null,
    "DeathCount": 0,
    "LessYearDeath": 0,
    "MoreYearDeath": 0,
    "VesselCount": 1,
    "VesselPercent": 20,
    "RestoreCount": 1,
    "RestorePercent": 0.2,
    "KidneyTransplantCount": 0,
    "KidneyTransplantPercent": 0,
    "HBsAgPositiveCount": null,
    "HBsAgNegativeCount": null,
    "HBsAgPositivePercent": null,
    "AntiHCVPositiveCount": null,
    "AntiHCVNegativeCount": null,
    "AntiHCVPositivePercent": null
  }
]
 */

import report from './allApo.html';
import './allApo.less';

angular.module('app').component('allApo', {
    template: report,
    controller: apoCtrl
});

apoCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService'];

function apoCtrl($stateParams, allReportService, $state, $filter, SettingService) {
    const self = this;

    let $translate = $filter('translate');

    self.optionYear = [];
    self.optionMonth = [];
    self.Content = [];
    self.itmsjson = [];

    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year
    self.toMonth = $filter('date')(self.date, 'M');   // get today month
    self.Sum = 0;


    self.loading = true;
    self.isError = false;


    // page init
    self.$onInit = () => {

        self.wards = SettingService.getCurrentUser().Ward;
        self.keys = Object.keys(self.wards);
        self.selectedWards = self.keys[0];

        // year dropdownlist items setting
        for (let j = (self.toYear - 19); j <= self.toYear; j++) {
            self.optionYear.push(j);
        }
        self.selectedYear = self.toYear;
        // self.loading = false;

        // month dropdownlist items setting
        for (let k = 0; k < 12; k++) {
            self.optionMonth.push(k + 1);
        }
        self.selectedMonth = self.toMonth;
        self.loading = false;
        self.searching = false;
        self.searchContent = false;
    };

    self.getApoData = () => {
        // self.loading = true;

        self.searching = true;
        self.searchContent = false;
        self.contentYear = self.selectedYear;
        self.contentMonth = self.selectedMonth;
        // 將年月下拉選單 組成YYYYmm 的格式
        self.strYearMonth = self.selectedYear.toString() + '/' + ('0' + self.selectedMonth.toString()).slice(-2);
        self.daysOfMonth = moment(self.strYearMonth, 'YYYY/MM').daysInMonth();
        self.shifts = [];
        for (let j = 1; j <= Number(self.daysOfMonth); j++) {
            for (let i = 1; i <= 3; i++) {
                self.shifts.push(i);
            }
        }

        // call allAPo Service
        console.log(self.selectedWards);
        console.log(self.strYearMonth);
        allReportService.getAllApoByWardYearMonth(self.selectedWards, self.strYearMonth).then((q) => {
            console.log(q);
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

    };

    self.setTotals = (item) => {
        let total = 0;

        if (item.Report) {
            item.Report.forEach((x) => {
                if (x.Shift !== null) {
                    total += x.Values;
                }
            });
        }
        return total;
    };

    self.analysisData = (items) => {
        self.abnormalContent = items.AbnormalItems.filter(x => x.ParentId !== null);
        self.AbnormalItems = [];
        items.AbnormalItems
            .filter(x => x.ParentId === null)
            .forEach((i, index) => {
                let obj = {};
                obj.child = [];

                if (i.ParentId === null) {
                    obj.Title = `${i.Code} ${i.Name}`;
                }
                self.abnormalContent.forEach((j) => {
                    if (i.Id === j.ParentId) {
                        let data = items.ReportData.filter(x => x.AbnormalItemId === j.Id)
                            .map((x) => {
                                switch (x.Shift) {
                                    case '白班':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 3;
                                        break;
                                    case 'morning':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 3;
                                        break;
                                    case '中班':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 2;
                                        break;
                                    case 'afternoon':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 2;
                                        break;
                                    case '晚班':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 1;
                                        break;
                                    case 'evening':
                                        x.ShiftN = (Number(moment(x.Date).toDate().getDate()) * 3) - 1;
                                        break;
                                    default:
                                        break;
                                }
                                return x;
                            });

                        if (data.length > 0) {
                            j.Report = data;
                        }
                        obj.child.push(j);
                    }
                });
                self.AbnormalItems.push(obj);
            });
    };

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'allApo'
        });

    };

}

import report from './allLabexam.html';
import './allLabexam.less';

angular.module('app').component('allLabexam', {
    template: report,
    controller: labexamCtrl
});

labexamCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'userService'];

function labexamCtrl($stateParams, allReportService, $state, $filter, userService) {
    const self = this;

    // let $translate = $filter('translate');
    self.Patients = null;
    self.optionYear = [];
    self.optionMonth = [];
    self.examItem = [];

    self.date = new Date(); // get today date
    self.toYear = $filter('date')(self.date, 'yyyy');  // get today year
    self.toMonth = $filter('date')(self.date, 'M');   // get today month

    const $translate = $filter('translate');


    self.isError = false;    // page init
    self.$onInit = () => {

        getDoctorList();
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
        self.loading = false;
        self.searching = false;
        self.searchContent = false;

        self.doctor = null; // 初始化醫生下拉選單
    };

    self.getLabexamData = () => {
        // self.loading = true;
        self.searching = true;
        self.searchContent = false;
        self.contentYear = self.selectedYear;
        // 將年月下拉選單 組成YYYYmm 的格式
        self.strYearMonth = self.selectedYear.toString() + '-' + ('0' + self.selectedMonth.toString()).slice(-2);
        console.log(self.strYearMonth);
        $('#myTable').remove();
        let doctorStr = '';
        if (self.doctor == null) {
            doctorStr = '';
        } else {
            doctorStr = self.doctor;
        }
        // call Service
        allReportService.getByPatientIdDate(self.strYearMonth, doctorStr).then((q) => {
            console.log(q);
            analysisData(q.data);
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

    function getDoctorList() {
        userService.get().then((q) => {
            console.log('取得所有使用者 q', q.data);
            self.doctorList = _.filter(q.data, function (o) {
                console.log('doctorList', self.doctorList)
                return (o.Role === 'doctor' && o.Access != '0');

            });
        });
    }

    function analysisData(items) {
        console.log('allLabexam analysisData', items);

        console.time('allLabexam analysisData');
        // 表格橫向title => 檢驗檢查項目
        items.Name = items.Name.sort();

        // 表格內容
        let labItems = [];

        items.Patients.forEach((i) => {
            let child = [];
            items.labExams.filter(x => x.PatientId === i.PatientId).forEach((j) => {
                j.title = '檢驗日期:' + new Date(j.CheckTime).toLocaleDateString();
                // obj.child.push(j);
                child.push(j);
            });
            labItems.push({
                child,
                PatientId: i.PatientId,
                PatientName: i.PatientName
            });
        });

        labItems = _.orderBy(labItems, ['PatientName']);
        console.log(labItems);

        // 組字串時避免出現 undefine / null 的字
        function checkExist(str) {
            return str || '';
        }

        // 組 table 完再吐給 html 顯示
        // let ths = ['序號', '建立日期', '造管種類', '造管部位', '造管醫院', '備註', '終止日期', '終止原因', '建立者', '修改者'];
        function getColumns() {
            let thsStr = '';
            for (let i = 0; i < items.Name.length; i++) {
                thsStr += `<td align="center">${items.Name[i]}</td>`;
            }
            return thsStr;
        }

        function getRows() {
            let trsStr = '';
            for (let i = 0; i < labItems.length; i++) {
                let tds = '';
                // 依據檢驗項目長 row
                for (let j = 0; j < items.Name.length; j++) {
                    let valueStr = '';
                    // 找出資料裡有相同檢驗項目的資料
                    let result = _.filter(labItems[i].child, item => item.LabExamName === items.Name[j]);
                    if (result.length > 0) {
                        _.forEach(result, (labData) => {
                            valueStr += `
                                <span title="${checkExist(labData.title)}">
                                    ${checkExist(labData.Value)}
                                </span>
                                `;
                        });
                    }
                    tds += `
                    <td align="right">
                        ${valueStr}
                    </td>
                    `;
                }
                trsStr += `
                <tr>
                    <td>${labItems[i].PatientName}</td>
                    ${tds}
                </tr>
                `;
            }

            return trsStr;
        }

        // 組表格
        let thExamColspan = items.Name.length + 1;
        let excelTable = `
        <table id="myTable">
            <thead>
                <tr>
                    <td class="allLabexam" colspan="${thExamColspan}">
                        ${$translate('reports.allLabexam.yearMonthHeading', { selectedYear: self.selectedYear, selectedMonth: self.selectedMonth })}
                    </td>
                </tr>
                <tr>
                    <td align="center">${$translate('reports.allLabexam.gridtitle')}</td>
                    ${getColumns()}
                </tr>
            </thead>
            <tbody>
                ${getRows()}
            </tbody>
        </table>
        `;
        $('#allLabexamReport').append(excelTable);

        console.timeEnd('allLabexam analysisData');
    }

    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'allLabexam'
        });

    };
}

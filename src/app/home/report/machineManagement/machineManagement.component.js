import report from './machineManagement.html';
import './machineManagement.less';

angular.module('app').component('machineManagement', {
    template: report,
    controller: machineManagementCtrl,
    controllerAs: '$ctrl'
}).filter('machineManagementTitleFilter', function () {
    return function (input) {
        switch (input) {
            case 'AssignTime':
                return '日期';
            case 'PatientName':
                return '病人';
            case 'MedicalId':
                return '病歷碼';
            case 'Machine':
                return '機型';
            default:
                break;
        }
    };
});

machineManagementCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService', 'showMessage'];

function machineManagementCtrl($stateParams, allReportService, $state, $filter, SettingService, showMessage) {

    const self = this;
    self.isError = false;
    self.isInit = false; // 控制起始時，不顯示下方table
    self.searchContent = false;

    // 報表標題：最後顯示資料會依此順序顯示
    self.title = [
        'AssignTime',
        'PatientName',
        'MedicalId',
        'Machine',
    ];

    // 班別
    self.optionShift = [
        'all',
        'morning',
        'afternoon',
        'evening',
        'night',
        'temp'
    ];

    // 透析機機型
    self.machineNumberList = [
        'TR8000',
        'NCU12',
        'NCU18',
        'NIKKISO'
    ];

    // excel輸出
    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'machineManagement'
        });

    };

    // page init
    self.$onInit = function $onInit() {
        console.log('CurrentUser: ', SettingService.getCurrentUser());
        // 起始日
        self.StartDate = new Date(moment());
        self.StartDateAddOneDay = new Date(moment().add(1, 'days')); // 前端判斷結束日不可大於起始日
        self.EndDate = new Date(moment());

        // 初始化 type：預設病人
        self.Type = 'patient';
        // 初始化 透析機號
        self.MachineNumber = null;
        self.isInit = true; // 控制起始時，不顯示下方table
    };


    // 取得所有透析機資料
    self.getReportData = function getReportData() {

        self.isInit = false; // 控制起始時，不顯示下方table
        self.loading = true;
        self.searchContent = false;

        // 處理 起始日結束日
        if (moment(self.EndDate).isBefore(self.StartDate)) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            self.EndDate = new Date(moment(self.StartDate));
        }

        // 日期區間：限制一個月
        if (moment(self.EndDate).diff(moment(self.StartDate), 'month')) {
            // 結束日 > 一個月區間 -> 結束日改為從起始日起加一個月
            console.log('限制一個月');
            self.EndDate = new Date(moment(self.StartDate).add(1, 'months'));
        }

        // TODO: 假資料用，之後要拿掉
        // 此區間暫無資料
        // self.loading = false;
        // self.finalData = null;
        // return;

        if (self.Type == 'patient') {
            // 病人
            // 取得所有透析機資料
            allReportService.getMachineManagementReportByMedicalId(self.MedicalId, moment(self.StartDate).format('YYYYMMDD'), moment(self.EndDate).format('YYYYMMDD')).then((q) => {
                console.log('取得所有透析機資料 q', q);
                let qdata = angular.copy(q.data);
                console.log('取得所有透析機資料 qdata', qdata);

                if (qdata.length === 0) {
                    // 此區間暫無資料
                    self.loading = false;
                    self.finalData = null;
                    return;
                }
    
                qdata = _.sortBy(qdata.map((o) => {
                    // console.log('排序！！！！！');
                    // 處理日期格式顯示
                    o.AssignTime = moment(o.AssignTime).format('YYYY/MM/DD');
                    
                    return o;
    
                }), ['AssignTime', 'Machine']); // 依照 日期 機型

    
                let finalObj = {}; // { [value按順序排好], [], [], ...}
    
                // 處理data：將後台取得的資料依照表格名稱的順序排好
                _.forEach(self.title, function (titleValue) {
                    _.forEach(qdata, (person, key) => {
    
                        if (finalObj[key]) {
                            finalObj[key].push(person[titleValue]);
                        } else {
                            // 起始 finalObj[key] 尚未有值
                            finalObj[key] = [person[titleValue]];
                        }
                        // console.log('透析機資料 person key', key);
                        // console.log('透析機資料 person', person[titleValue]);
                    });
                });
    
                self.finalData = finalObj;
                console.log('透析機資料 finalObj', finalObj);
                self.loading = false;
    
            }, (err) => {
                console.log('取得所有透析機資料 err', err);
                if (err.data === 'NO_DATA' || err.status === 400) {
                    // 此區間暫無資料
                    self.finalData = null;
                }
                if (err.status !== 200 && err.status !== 400) {
                    self.isError = true;
                }
                self.loading = false;
            });
        } else {
            // 透析機
            // 取得所有透析機資料
            allReportService.getMachineManagementReportByMachineNumber(self.MachineNumber, moment(self.StartDate).format('YYYYMMDD'), moment(self.EndDate).format('YYYYMMDD')).then((q) => {
                console.log('取得所有透析機資料 q', q);
                let qdata = angular.copy(q.data);
                console.log('取得所有透析機資料 qdata', qdata);
                // console.log('new 取得所有透析機資料 qdata', qdata);
    
                if (qdata.length === 0) {
                    // 此區間暫無資料
                    self.loading = false;
                    self.finalData = null;
                    return;
                }
    
                qdata = _.sortBy(qdata.map((o) => {
                    // console.log('排序！！！！！');
                    // 處理日期格式顯示
                    o.AssignTime = moment(o.AssignTime).format('YYYY/MM/DD');
                    
                    return o;
    
                }), ['AssignTime', 'Machine']); // 依照 日期 機型
    
                let finalObj = {}; // { [value按順序排好], [], [], ...}
    
                // 處理data：將後台取得的資料依照表格名稱的順序排好
                _.forEach(self.title, function (titleValue) {
                    _.forEach(qdata, (person, key) => {
    
                        if (finalObj[key]) {
                            finalObj[key].push(person[titleValue]);
                        } else {
                            // 起始 finalObj[key] 尚未有值
                            finalObj[key] = [person[titleValue]];
                        }
                        // console.log('透析機資料 person key', key);
                        // console.log('透析機資料 person', person[titleValue]);
                    });
                });
    
                self.finalData = finalObj;
                console.log('透析機資料 finalObj', finalObj);
                self.loading = false;
                self.searchContent = true;
    
            }, (err) => {
                console.log('取得所有透析機資料 err', err);
                if (err.data === 'NO_DATA' || err.status === 400) {
                    // 此區間暫無資料
                    self.finalData = null;
                }
                if (err.status !== 200 && err.status !== 400) {
                    self.isError = true;
                }
                self.loading = false;
                self.searchContent = false;
            });
        }
    };

}

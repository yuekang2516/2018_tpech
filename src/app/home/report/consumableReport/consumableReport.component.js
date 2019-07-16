import report from './consumableReport.html';
import './consumableReport.less';


angular.module('app').component('consumableReport', {
    template: report,
    controller: consumableReportCtrl,
    controllerAs: '$ctrl'
}).filter('consumableReportTitleFilter', function () {
    return function (input) {
        switch (input) {
            case 'RepType':
                return '種類';
            case 'Item':
                return '項目';
            case 'CountTotal':
                return '總計';
            default:
                return input;
        }
    };
});

consumableReportCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService', 'showMessage'];

function consumableReportCtrl($stateParams, allReportService, $state, $filter, SettingService, showMessage) {

    const self = this;
    self.isError = false;
    self.isInit = false; // 控制起始時，不顯示下方table

    // 標題  ['種類', '項目']
    self.title = ['RepType', 'Item']; // 無資料時也須顯示
    let COUNT_TOTAL = 'CountTotal'; // 總計 CountTotal
    // 日期陣列
    // self.dateArray = [];
    // self.type = ['AK', 'DIALYSATE', 'ROUTE']; // AK, 藥水, 管路

    // excel輸出
    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'consumableReport'
        });
    };


    // page init
    self.$onInit = function $onInit() {

        console.log('CurrentUser: ', SettingService.getCurrentUser());

        // WardNumber dropdownlist items setting
        // self.wards = SettingService.getCurrentUser().Ward;
        // self.keys = Object.keys(self.wards);
        // self.selectedWard = self.keys[0];

        // 起始日
        self.StartDate = new Date(moment());
        self.StartDateAddOneDay = new Date(moment().add(1, 'days')); // 前端判斷結束日不可大於起始日
        self.EndDate = new Date(moment());

        // 初始化 班別：全部
        // self.selectedShift = 'all';

        self.isInit = true; // 控制起始時，不顯示下方table
        self.searchContent = false;

        // 取得所有耗材資料
        // self.getReportData();
    };


    // 取得所有耗材資料
    self.getReportData = function getReportData() {

        self.isInit = false; // 控制起始時，不顯示下方table
        self.loading = true;
        self.searchContent = false;

        self.title = ['RepType', 'Item'];
        // 日期陣列初始化
        self.dateArray = [];
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

        // 測試用，之後要拿掉
        // 此區間暫無資料
        // self.loading = false;
        // self.finalData = null;
        // return;

        // 取得所有耗材資料
        allReportService.getConsumableReport(moment(self.StartDate).format('YYYYMMDD'), moment(self.EndDate).format('YYYYMMDD')).then((q) => {

            console.log('取得所有耗材資料 q', q);
            let qdata = angular.copy(q.data);
            console.log('取得所有耗材資料 qdata', qdata);
            // console.log('new 取得所有耗材資料 qdata', qdata);

            if (!Array.isArray(qdata) || (Array.isArray(qdata) && qdata.length === 0)) {
                // 此區間暫無資料
                self.loading = false;
                self.finalData = null;
                self.akFinal = null;
                self.dialysateFinal = null;
                self.routeFinal = null;
                return;
            }

            // 找出所有日期
            let dateSet = new Set(_.map(_.orderBy(qdata, ['RepDate'], ['asc']), (v) => {
                return moment(v.RepDate).format('YYYY/MM/DD');
            }));
            // Set 轉 Array
            self.dateArray = Array.from(dateSet);
            console.log('日期陣列 self.dateArray', self.dateArray);
            if (self.dateArray && self.dateArray.length > 0) {
                self.title = _.concat(self.title, self.dateArray);
                // 單項不同天統計在一起
                self.title = _.concat(self.title, COUNT_TOTAL); // 總計 CountTotal
            }

            // 先排序
            qdata = _.sortBy(qdata, ['RepType', 'Item']); 
            // groupBy Type
            let group = _.groupBy(qdata, 'RepType');
            console.log('group!!!', group);

            // foreach group to merge same item
            _.forEach(group, (value, type) => {
                let result = [];    // final result ex: [{'RepType': 'AK', 'Item': 'F150', '2019/01/02': 5, '2019/03/02': 4}, {...},...]
                let groupItem = _.groupBy(value, 'Item');
                _.forEach(groupItem, (item) => {
                    let resultObj = {};
                    for (let i = 0; i < item.length; i++) {
                        if (i === 0) {
                            // item 裡的 Type, Item 都一樣，只要塞一次即可
                            resultObj.RepType = item[i].RepType;
                            resultObj.Item = item[i].Item;
                        }
                        // Total 字串轉數字
                        item[i].Total = !isNaN(item[i].Total) ? Number(item[i].Total) : 0;
                        // 組出 -> 日期: 數量
                        resultObj[moment(item[i].RepDate).format('YYYY/MM/DD')] = item[i].Total;
                    }
                    // 單一 Item 總計不同天的數量
                    resultObj[COUNT_TOTAL] = _.sumBy(item, 'Total');
                    // resultObj -> {'RepType': 'AK', 'Item': 'F150', '2019/01/02': 5, '2019/03/02': 4}
                    result.push(resultObj);
                });
                group[type] = result;
            });
            console.log('groupResult!!!', group);

            // 計算種類個別的 rowspan
            self.akRowspan = group && Array.isArray(group.AK) ? group.AK.length : 0;
            self.dialysateRowspan = group && Array.isArray(group.DIALYSATE) ? group.DIALYSATE.length : 0;
            self.routeRowspan = group && Array.isArray(group.ROUTE) ? group.ROUTE.length : 0;
            
            // 依種類組出finalData
            self.akFinal = group && Array.isArray(group.AK) && group.AK.length > 0 ? getFinalDataArray(group.AK) : [];
            self.dialysateFinal = group && Array.isArray(group.DIALYSATE) && group.DIALYSATE.length > 0 ? getFinalDataArray(group.DIALYSATE) : [];
            self.routeFinal = group && Array.isArray(group.ROUTE) && group.ROUTE.length > 0 ? getFinalDataArray(group.ROUTE) : [];

            // finalData控制畫面有無資料
            self.finalData = _.concat(self.akFinal, self.dialysateFinal, self.routeFinal);
            // self.finalData = finalArray;
            console.log('最後資料 self.finalData', self.finalData);
            self.loading = false;
            self.searchContent = true;

        }, (err) => {
            console.log('取得所有耗材資料 err', err);
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
    };

    // 組出html需要的資料陣列 [[value按順序排好], [], [], ...]
    function getFinalDataArray(oneTypeArray) {
        let finalObj = []; // [[value按順序排好], [], [], ...]
        _.forEach(self.title, function (titleValue) {
            _.forEach(oneTypeArray, (item, key) => {
                // Type 不需加入，已經另外處理
                if (titleValue != 'RepType') {
                    if (finalObj[key]) {
                        finalObj[key].push(item[titleValue]);
                    } else {
                        // 起始 finalObj[key] 尚未有值
                        finalObj[key] = [item[titleValue]];
                    }
                }
                // console.log('耗材資料 item key', key);
                // console.log('耗材資料 item', item[titleValue]);
                // console.log('耗材資料 item titleValue', titleValue);
            });
        });
        console.log('getFinalDataArray finalObj', finalObj);
        return finalObj;
    }
}

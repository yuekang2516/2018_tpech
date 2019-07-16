import report from './preparationReport.html';
import './preparationReport.less';

angular.module('app').component('preparationReport', {
    template: report,
    controller: preparationReportCtrl,
    controllerAs: '$ctrl'
}).filter('preparationReportTitleFilter', function () {
    return function (input) {
        switch (input) {
            case 'AssignTime':
                return '日期';
            case 'Shift':
                return '班別';
            case 'BedNo':
                return '床位';
            // case 'WardName':
            //     return '區域';
            case 'PatientName':
                return '姓名';
            case 'MedicalId':
                return '病歷號';
            case 'Mode':
                return '模式';
            case 'Frequency':
                return '頻率';
            case 'Duration':
                return '時間';
            case 'ArtificialKidney':
                return '人工腎臟'; // 透析器種類???
            case 'Route':
                return '血管通路';
            case 'StandardWeight':
                return '乾體重';
            case 'BF':
                return '血液流速';
            case 'AnticoagulantsI':
                return '抗凝劑/起始量/維持量 I';
            case 'AnticoagulantsII':
                return '抗凝劑/起始量/維持量 II';
            case 'Dialysate':
                return 'Ca'; // Ca 就是 透析液
            case 'Na':
                return 'Na';
            case 'DialysateTemperature':
                return '透析液溫度';
            // case 'HCO3':
            //     return 'HCO3+';
            case 'Memo':
                return '其他處方';
            default:
                break;
        }
    };
}).filter('shiftFilter', function () {
    return function (input) {
        switch (input) {
            case 'all':
                return '全部';
            case 'morning':
                return '早班';
            case 'afternoon':
                return '午班';
            case 'evening':
                return '晚班';
            case 'night':
                return '夜班';
            case 'temp':
                return '臨時班';
            default:
                break;
        }
    };
});

preparationReportCtrl.$inject = ['$stateParams', 'allReportService', '$state', '$filter', 'SettingService', 'showMessage'];

function preparationReportCtrl($stateParams, allReportService, $state, $filter, SettingService, showMessage) {

    const self = this;
    self.isError = false;
    self.isInit = false; // 控制起始時，不顯示下方table

    // 報表標題：最後顯示資料會依此順序顯示
    self.title = [
        'AssignTime',
        'Shift',
        'BedNo',
        // 'WardName',
        'PatientName',
        'MedicalId',
        'Mode',
        'Frequency',
        'Duration',
        'ArtificialKidney',
        'Route',
        'StandardWeight',
        'BF',
        'AnticoagulantsI',
        'AnticoagulantsII',
        'Dialysate',
        'Na',
        'DialysateTemperature',
        // 'HCO3',
        'Memo'
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


    // excel輸出
    self.exportExcel = function exportExcel() {
        // excel
        let MyTabel = $('#myTable');

        MyTabel.tableExport({
            fileName: 'preparationReport'
        });

    };


    // page init
    self.$onInit = function $onInit() {

        console.log('CurrentUser: ', SettingService.getCurrentUser());

        // WardNumber dropdownlist items setting
        self.wards = SettingService.getCurrentUser().Ward;
        self.keys = Object.keys(self.wards);
        self.selectedWard = self.keys[0];

        // 起始日
        self.StartDate = new Date(moment());
        self.StartDateAddOneDay = new Date(moment().add(1, 'days')); // 前端判斷結束日不可大於起始日
        self.EndDate = new Date(moment());

        // 初始化 班別：全部
        self.selectedShift = 'all';

        self.isInit = true; // 控制起始時，不顯示下方table
        self.searchContent = false;

        // 取得所有備料資料
        // self.getReportData();
        
    };


    // 取得所有備料資料
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

        // 班別不一定要給值
        let finalShift;
        if (self.selectedShift === 'all') {
            // 選擇全部等於不給值
            finalShift = '';
        } else {
            finalShift = self.selectedShift;
        }

        // // TODO: 測試用，之後要拿掉
        // // 此區間暫無資料
        // self.loading = false;
        // self.finalData = null;
        // return;

        // 取得所有備料資料
        allReportService.getPreparationReport(self.selectedWard, moment(self.StartDate).format('YYYYMMDD'), moment(self.EndDate).format('YYYYMMDD'), finalShift).then((q) => {

            console.log('取得所有備料資料 q', q);
            let qdata = angular.copy(q.data);
            console.log('取得所有備料資料 qdata', qdata);
            // console.log('new 取得所有備料資料 qdata', qdata);

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

                // 處理Mode
                if (o.DialysisMode) {
                    o.Mode = o.DialysisMode.Name;
                } else {
                    o.Mode = null;
                }

                // 處理班別順序
                switch (o.Shift) {
                    case 'morning':
                        o.ShiftIndex = 1;
                        break;
                    case 'afternoon':
                        o.ShiftIndex = 2;
                        break;
                    case 'evening':
                        o.ShiftIndex = 3;
                        break;
                    case 'night':
                        o.ShiftIndex = 4;
                        break;
                    case 'temp':
                        o.ShiftIndex = 5;
                        break;
                }

                // 處理班別中文顯示
                o.Shift = $filter('shiftFilter')(o.Shift);

                // 處理時間 duration {"Hours":2,"Minutes":10,"Seconds":null}
                let hour = '';
                let min = '';
                if (o.Duration) {
                    if (o.Duration.Hours && o.Duration.Minutes) {
                        // 時 分 皆有
                        hour = o.Duration.Hours.toString();
                        min = o.Duration.Minutes.toString();
                        o.Duration = hour.concat('時', min, '分');

                    } else if (o.Duration.Hours && !o.Duration.Minutes) {
                        // 只有 時
                        hour = o.Duration.Hours.toString();
                        o.Duration = hour.concat('時');
                        o.Duration = hour.concat('時');
                    } else if (o.Duration.Minutes && !o.Duration.Hours) {
                        // 只有 分
                        min = o.Duration.Minutes.toString();
                        o.Duration = min.concat('分');
                    }
                } else {
                    // 時 分 皆無
                    o.Duration = '';
                }


                // 處理 血管通路
                // 組字串 AVF L A:16G V:17G  str1.concat(str2, str3)
                // if (o.Route) {
                // 取得AV針
                // let routeStr = o.Route;
                // let needleAStr = '';
                // let needleVStr = '';
                // let gStr = 'G';
                // // if (o.Needle && o.Needle.ArteryLength) {
                // //     let title = 'A:';
                // //     needleAStr = title.concat(o.Needle.ArteryLength, gStr);
                // // }
                // // if (o.Needle && o.Needle.VeinLength) {
                // //     let title = 'V:';
                // //     needleVStr = title.concat(o.Needle.VeinLength, gStr);
                // // }
                // o.Route = routeStr.concat('\xa0\xa0', needleAStr, needleVStr);
                // }

                // 處理 抗凝劑/起始量/維持量 I II
                // 組字串 抗凝劑/起始量/維持量  str1.concat(str2, str3)
                // let obj = {};
                let array = [];
                if (o.Anticoagulants && Object.getOwnPropertyNames(o.Anticoagulants).length > 0) {
                    // 將抗凝劑名字也塞到value的陣列中的第一筆 ['Heperin', '1', '2']，最後再串成字串 'Heperin/1/2'
                    _.forEach(o.Anticoagulants, function (value, key) {
                        o.Anticoagulants[key].unshift(key);
                    });
                    _.forEach(o.Anticoagulants, function (value) {
                        array.push(value);
                    });
                    // console.log('抗凝劑 o.Anticoagulants', o.Anticoagulants);
                    // console.log('抗凝劑 array', array);
                    if (array.length === 1) {
                        // 只有一筆
                        o.AnticoagulantsI = array[0][0].concat(
                            '/',
                            (array[0][1] !== '' && array[0][1] !== null) ? array[0][1] : '--',
                            '/',
                            (array[0][2] !== '' && array[0][2] !== null) ? array[0][2] : '--'
                        );
                        o.AnticoagulantsII = '';
                    } else {
                        // 兩筆皆有
                        o.AnticoagulantsI = array[0][0].concat(
                            '/',
                            (array[0][1] !== '' && array[0][1] !== null) ? array[0][1] : '--',
                            '/',
                            (array[0][2] !== '' && array[0][2] !== null) ? array[0][2] : '--'
                        );
                        o.AnticoagulantsII = array[1][0].concat(
                            '/',
                            (array[1][1] !== '' && array[1][1] !== null) ? array[1][1] : '--',
                            '/',
                            (array[1][2] !== '' && array[1][2] !== null) ? array[1][2] : '--'
                        );
                    }
                } else {
                    // 0 筆
                    o.AnticoagulantsI = '';
                    o.AnticoagulantsII = '';
                }

                return o;

            }), ['AssignTime', 'ShiftIndex', 'BedNo']); // 依照 日期 班別 床位 先後排序


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
                    // console.log('備料資料 person key', key);
                    // console.log('備料資料 person', person[titleValue]);
                });
            });

            self.finalData = finalObj;
            console.log('備料資料 finalObj', finalObj);
            self.loading = false;
            self.searchContent = true;

        }, (err) => {
            console.log('取得所有備料資料 err', err);
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


}

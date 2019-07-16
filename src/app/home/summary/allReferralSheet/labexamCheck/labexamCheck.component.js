import labexamCheck from './labexamCheck.html';

import './labexamCheck.less';

angular.module('app')
    .component('labexamCheck', {
        template: labexamCheck,
        controller: labexamCheckCtrl,
        controllerAs: '$ctrl'
    }).filter('labexamQueryName', ['$filter', () => {
        return function (queryType) {
            switch (queryType) {
                case 'times':
                    return '天數';
                case 'duration':
                    return '期間';
                default:
                    return '';
            }
        };
    }]).filter('labexamTimes', ['$filter', ($filter) => {
        return function (queryType) {
            const $translate = $filter('translate');
            switch (queryType) {
                case '30':
                    return $translate('labexam.labexam.oneMonth');
                case '60':
                    return $translate('labexam.labexam.twoMonth');
                case '90':
                    return $translate('labexam.labexam.threeMonth');
                case '180':
                    return $translate('labexam.labexam.sixMonth');
                case '365':
                    return $translate('labexam.labexam.oneYear');
                case '720':
                    return $translate('labexam.labexam.twoYear');
                default:
                    return '';
            }
        };
    }]);

labexamCheckCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$timeout', 'tpechService'
];

function labexamCheckCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $timeout, tpechService) {
    const self = this;
    self.referralSheetId = $stateParams.referralSheetId;

    self.user = SettingService.getCurrentUser();

    self.isError = false;

    // 病人的所有的檢驗資料
    self.labData = [];

    // 查詢條件相關
    self.conditionTypes = {
        times: {
            name: 'times',
            conditions: ['30', '60', '90', '180', '365', '720'],
            value: {
                days: '30',
                startDate: new Date(moment()),
                endDate: new Date(moment())
            }
            // value: '30'
        },
        duration: {   // 時間區間
            name: 'duration',
            value: {
                startDate: new Date(moment().add(-7, 'day')), // 預設7天
                endDate: new Date()
            }
        }
    };

    // grid 標題
    let columnTitle = [{
            headerName: "項目",
            field: "LAB_NAME",
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            width: 150,
            suppressSizeToFit: true,
            suppressMovable: true,
            lockPosition: true,
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗日期",
            field: "Date",
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗時間",
            field: "Time",
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗數值",
            field: "ResultUnit",
            cellClass: ['font-15px']
        }
    ];


    // 預設畫面
    self.$onInit = function $onInit() {
        // 取得登入者角色，醫生才可以刪除
        self.loginRole = SettingService.getCurrentUser().Role;
        self.patientName = $stateParams.patientName;
        // toolbar：病人姓名
        // PatientService.getById($stateParams.patientId).then((d) => {
        //     // 病人資料
        //     self.patient = d.data;

        // });

        // 時間條件：預設為區間
        self.queryCondition = self.conditionTypes.duration;
        // 初始化時間區間
        // self.StartDate = new Date(moment());
        // self.EndDate = new Date(moment());

        // 先初始化 ag-grid：開始長 grid
        self.gridOptions = {
            columnDefs: columnTitle, // grid 標題設定
            rowData: self.labData, // data
            angularCompileRows: true,
            defaultColDef: {
                resizable: true, // shift 可拉開標題長度
                sortable: true // 全部欄位皆開放排序
                // width: 200
            },
            pagination: true, // 分頁
            paginationAutoPageSize: true, // 每頁筆數自動以頁高為限
            onFirstDataRendered: sizeToFit, // 初始時縮放 grid
            colResizeDefault: 'shift', // 移動內部欄位時 grid resize
            suppressRowClickSelection: true,
            rowSelection: 'multiple', // 多選
            domLayout: 'normal', // autoHeight normal
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center" style="font-size: 15px;">資料下載中，請稍等...</span>',
            overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow; font-size: 15px;">暫無資料，請使用 "時間" 查詢</span>'
        };

        // 等待 grid 長好後再執行
        self.gridOptions.onGridReady = function (event) {
            console.log('the grid is now ready!!');
            sizeToFit();
        };
    };

    // 控制日期
    self.changeQueryDate = function () {
        // 處理 起始日結束日
        if (self.queryCondition.name === 'duration' && moment(self.queryCondition.value.endDate).isBefore(moment(self.queryCondition.value.startDate))) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            self.queryCondition.value.endDate = new Date(moment(self.queryCondition.value.startDate));
        }
    };


    // 取得病人的所有的檢驗資料
    self.getCheckItems = function () {
        // grid 在 init 時就長好了
        self.gridOptions.api.showLoadingOverlay();
        
        // 處理時間 天數 -> 日期
        if (self.queryCondition.name === 'times'){
            // 天數
            // 結束日預設今天
            self.queryCondition.value.endDate = moment();
            // 換算成日期 conditions: ['30', '60', '90', '180', '365', '720'],
            switch (self.queryCondition.value.days) {
                case '30': // 1個月
                    self.queryCondition.value.startDate = moment().subtract(1, 'M'); // 今天 - 1個月
                    break;
                case '60': // 2個月
                    self.queryCondition.value.startDate = moment().subtract(2, 'M'); // 今天 - 2個月
                    break;
                case '90': // 3個月
                    self.queryCondition.value.startDate = moment().subtract(3, 'M'); // 今天 - 3個月
                    break;
                case '180': // 6個月
                    self.queryCondition.value.startDate = moment().subtract(6, 'M'); // 今天 - 6個月
                    break;
                case '365': // 1年
                    self.queryCondition.value.startDate = moment().subtract(1, 'y'); // 今天 - 1年
                    break;
                case '720': // 2年
                    self.queryCondition.value.startDate = moment().subtract(2, 'y'); // 今天 - 2年
                    break;
                default:
                    break;
            }
        }
        // console.log('天數 新日期區間 起', moment(self.queryCondition.value.startDate).format('YYYYMMDD'));
        // console.log('天數 新日期區間 迄', moment(self.queryCondition.value.endDate).format('YYYYMMDD'));
        // self.loading = true;
        // 取得病人的所有的檢驗資料 ReferralSheetService.getLabCheckItems(self.StartDate, self.EndDate)
        tpechService.getLabResult($stateParams.medicalId, moment(self.queryCondition.value.startDate).format('YYYYMMDD'), moment(self.queryCondition.value.endDate).format('YYYYMMDD')).then((q) => {
            // self.loading = false;
            // 先處理資料
            console.log('取得病人的所有的檢驗資料 q', q);
            if (q.data && q.data.length > 0) {
                // 依 項目 日期 排序
                self.labData = _.sortBy(angular.copy(q.data).map((v) => {
                    // 處理日期時間：DateTime string
                    v['DateTime'] = getRealDateTimeStr(v['REPORT_DATE'], v['REPORT_TIME']); // 排序用
                    // 顯示民國
                    v['Date'] = v['REPORT_DATE'] ? v['REPORT_DATE'] : '-';
                    v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                    if (v['Date']) {
                        v['TaiwanDate'] = v['Time'] != '-' ? v['Date'].concat(' ', v['Time']) : '-';
                    } else {
                        // 沒有 Date
                        v['TaiwanDate'] =  '-';
                    }
                    // 顯示西元
                    // v['Date'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('YYYY/MM/DD') : '-';
                    // v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                    // 處理數值單位：ResultUnit string
                    let unit = v['UNIT'] ? v['UNIT'] : '';
                    v['ResultUnit'] = v['RESULT'] ? v['RESULT'].concat(' ', unit) : '-';

                    // 不需要的欄位不需要上傳
                    delete v['PAT_NO'];
                    delete v['ODR_CODE'];
                    delete v['LAB_CODE'];
                    // delete v['LAB_NAME']; // 病摘頁需要
                    delete v['RESULT'];
                    delete v['UNIT'];
                    delete v['HIGH_LIMIT'];
                    delete v['LOW_LIMIT'];
                    delete v['RES_SW'];
                    delete v['REP_TYPE_CODE'];
                    delete v['REP_TYPE_NAME'];
                    delete v['REPORT_DATE'];
                    delete v['REPORT_TIME'];
                    delete v['HDEPT_NAME'];
                    delete v['DateTime'];
                    // delete v['Date']; // 勾選單頁需要
                    // delete v['Time']; // 勾選單頁需要
                    // delete v['TaiwanDate']; // 病摘頁需要
                    // delete v['ResultUnit']; // 病摘頁需要
    
                    return v;
                }), ['LAB_NAME', 'DateTime']);
                console.log('檢驗項目總資料 self.labData', self.labData);
                self.gridOptions.api.setRowData(self.labData);
                // 等待 grid 長好後再執行
                // self.gridOptions.onGridReady =  function(event) { 
                //     console.log('the grid is now ready!!'); 
                //     self.gridOptions.api.hideOverlay();
                //     self.gridOptions.api.setRowData(self.labData);
                // };
            } else {
                self.gridOptions.api.showNoRowsOverlay();
            }
        }, (err) => {
            // self.loading = false;
            self.isError = true;
        });
    };

    // 監聽 window 大小縮放 grid
    window.addEventListener("resize", sizeToFit);

    function sizeToFit() {
        self.gridOptions.api.sizeColumnsToFit();
    }
    // 搜尋功能
    self.onQuickFilterChanged = function () {
        // self.gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
        self.gridOptions.api.setQuickFilter(self.searchText);
    };

    // 處理民國年與時間 -> 轉成 西元時間字串
    function getRealDateTimeStr(dateStr, timeStr) {
        // 1060301 990301
        // 先確認年份是二位還是三位
        let year = null;
        let newDateStr = null;
        let time = null;
        let newTimeStr = null;
        let finalStr = null;
        let finalMoment = null; // 回傳moment物件
        // 處理日期
        if (dateStr) {
            if (dateStr.length >= 7) {
                // 7位：1060301
                // 拆前3位
                year = parseInt(dateStr.substring(0, 3)) ? parseInt(dateStr.substring(0, 3)) + 1911 : null;
                newDateStr = year.toString().concat(dateStr.substring(3, 7)); // 20170301
            } else {
                // 6位：990301
                // 拆前2位
                year = parseInt(dateStr.substring(0, 2)) ? parseInt(dateStr.substring(0, 2)) + 1911 : null;
                newDateStr = year.toString().concat(dateStr.substring(2, 6)); // 20100301
            }
        }
        // 處理時間
        if (timeStr) {
            if (timeStr && timeStr.length === 4) {
                // 0830 -> 08:30
                time = timeStr.substring(0, 2); // 08
                newTimeStr = time.concat(':', timeStr.substring(2, 4)); // 08:30
            }
        }

        finalStr = newDateStr && newTimeStr ? newDateStr.concat(' ', newTimeStr) : null;
        finalMoment = finalStr ? moment(finalStr, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm') : '-';

        // console.log('年月日時 year', year);
        // console.log('年月日時 newDateStr', newDateStr);
        // console.log('年月日時 time', time);
        // console.log('年月日時 newTimeStr', newTimeStr);
        console.log('年月日時 finalStr', finalStr);
        console.log('年月日時 finalMoment', finalMoment);
        return finalMoment;
    }


    // 勾選完畢儲存
    self.saveChecked = function () {
        // 勾選好的資料會成陣列
        // selectedRows 就是檢驗項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();
        // let selectedRowsString = '';
        // selectedRows.forEach(function (selectedRow, index) {
        //     if (index !== 0) {
        //         selectedRowsString += ', ';
        //     }
        //     selectedRowsString += selectedRow.make;
        // });
        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);
        // console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);

        // 帶資料回前一頁
        if (selectedRows && selectedRows.length > 0) {
            // 有勾選
            // ReferralSheetService.setCheckedLabexamData(selectedRows);
            ReferralSheetService.setCheckedData('labexam', selectedRows);
            // $sessionStorage.checkedLabexamData = selectedRows;
        } else {
            // 無勾選
            ReferralSheetService.setCheckedData('labexam', []);
            // $sessionStorage.checkedLabexamData = [];
        }
        console.log('勾選完畢儲存 $sessionStorage.referralCheckedData', $sessionStorage.referralCheckedData);
        $scope.$emit('checkedData', {
            fromStateName: 'labexamCheck'
        });
        self.goback();
        // $sessionStorage.checkedLabexamData = selectedRows;
        // 先處理 $sessionStorage.checkedLabexamData
        // if ($sessionStorage.checkedLabexamData) {
        //     // 要刪掉 $sessionStorage.checkedLabexamData 中的空物件
        //     $sessionStorage.checkedLabexamData = _.concat($sessionStorage.checkedLabexamData, selectedRows);
        // } else {
        //     $sessionStorage.checkedLabexamData = selectedRows;
        // }
    };

    // 回上一頁
    self.goback = function goback(routeName) {
        history.go(-1);
    };

    self.$onDestroy = function onDestroy() {
        window.removeEventListener("resize", sizeToFit);
    };

}

/*
    檢驗資料內容
    public string PAT_NO { get; set; } //病歷號碼
    public string ODR_CODE { get; set; } //醫令代碼
    public string LAB_CODE { get; set; } //檢驗代碼
    public string LAB_NAME { get; set; } //檢驗名稱
    public string RESULT { get; set; } //檢驗值
    public string UNIT { get; set; } //單位
    public string HIGH_LIMIT { get; set; } //正常值上限
    public string LOW_LIMIT { get; set; } //正常值下限
    public string RES_SW { get; set; } //檢驗結果(H:高, L:低, N:正常, HH:過高, LL:過低, X:未判, SP: 無參考值, A:異常[文字報告且異常])
    public string REP_TYPE_CODE { get; set; } //檢驗類別代碼
    public string REP_TYPE_NAME { get; set; } //檢驗類別名稱
    public string REPORT_DATE { get; set; } //報告日期(民國年7碼,YYYMMDD)
    public string REPORT_TIME { get; set; } //報告時間(HHMM)
    public string HDEPT_NAME { get; set; } //開單科別
*/
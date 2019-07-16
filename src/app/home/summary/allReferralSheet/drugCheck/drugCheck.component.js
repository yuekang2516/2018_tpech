import drugCheck from './drugCheck.html';

import './drugCheck.less';

angular.module('app')
    .component('drugCheck', {
        template: drugCheck,
        controller: drugCheckCtrl,
        controllerAs: '$ctrl'
    });

drugCheckCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$timeout', 'tpechService'
];

function drugCheckCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $timeout, tpechService) {
    const self = this;
    self.referralSheetId = $stateParams.referralSheetId;

    self.user = SettingService.getCurrentUser();

    self.isError = false;

    // 病人的所有的用藥資料
    self.drugData = [];

    // grid 標題
    let columnTitle = [{
            headerName: "項目",
            field: "ODR_NAME",
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            width: 250,
            suppressSizeToFit: true,
            suppressMovable: true,
            lockPosition: true,
            cellClass: ['font-15px']
        },
        {
            headerName: "代碼",
            field: "ODR_CODE",
            cellClass: ['font-15px']
        },
        {
            headerName: "起始日", // NewStartDate 民國轉西元
            field: "START_DATE",
            cellClass: ['font-15px']
        }, 
        {
            headerName: "結束日", // NewEndDate 民國轉西元
            field: "END_DATE",
            cellClass: ['font-15px']
        }, 
        {
            headerName: "途徑",
            field: "ROUTE_CODE",
            cellClass: ['font-15px']
        },
        {
            headerName: "頻率",
            field: "FREQ_CODE",
            cellClass: ['font-15px']
        },
        {
            headerName: "劑量", // 劑量+單位 字串 DOSE + DOSE_UNIT
            field: "NewDoseUnit",
            cellClass: ['font-15px']
        }, 
        {
            headerName: "天數",
            field: "DAYS",
            cellClass: ['font-15px']
        },
        {
            headerName: "備註",
            field: "NOTES",
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

        // 初始化時間區間
        self.StartDate = new Date(moment());
        self.EndDate = new Date(moment());

        // 先初始化 ag-grid：開始長 grid
        self.gridOptions = {
            columnDefs: columnTitle, // grid 標題設定
            rowData: self.drugData, // data
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
            overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow; font-size: 15px;">暫無資料，請使用 "時間區間" 查詢</span>'
        };

        // 等待 grid 長好後再執行
        self.gridOptions.onGridReady = function (event) {
            console.log('the grid is now ready!!');
            sizeToFit();
        };
    };

    // 控制日期
    self.dateChange = function () {
        // 處理 起始日結束日
        if (moment(self.EndDate).isBefore(self.StartDate)) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            self.EndDate = new Date(moment(self.StartDate));
        }
    };

    // 取得病人的所有的用藥資料
    self.getCheckItems = function () {
        // grid 在 init 時就長好了
        self.gridOptions.api.showLoadingOverlay();
        // self.loading = true;
        // 取得病人的所有的用藥資料 ReferralSheetService.getDrugCheckItems(self.StartDate, self.EndDate)
        tpechService.getAllMedicine($stateParams.medicalId, self.StartDate, self.EndDate).then((q) => {
            // self.loading = false;
            // 先處理資料
            console.log('取得病人的所有的用藥資料 q', q);
            if (q.data && q.data.length > 0) {
                // 依 項目 日期 排序
                self.drugData = _.sortBy(angular.copy(q.data).map((v) => {

                    // 處理 用藥 起始日 結束日
                    v['NewStartDate'] = getRealDateTimeStr(v['START_DATE'], null, false);
                    v['NewEndDate'] = getRealDateTimeStr(v['END_DATE'], null, false);

                    // 處理數值單位：DOSE DOSE_UNIT string
                    let unit = v['DOSE_UNIT'] ? v['DOSE_UNIT'] : '';
                    v['NewDoseUnit'] = v['DOSE'] ? v['DOSE'].toString().concat(' ', unit) : '-';

                    // 處理 null -> '-'
                    v['ODR_NAME'] = v['ODR_NAME'] ? v['ODR_NAME'] : '-';
                    v['ODR_CODE'] = v['ODR_CODE'] ? v['ODR_CODE'] : '-';
                    v['START_DATE'] = v['START_DATE'] ? v['START_DATE'] : '-';
                    v['END_DATE'] = v['END_DATE'] ? v['END_DATE'] : '-';
                    v['ROUTE_CODE'] = v['ROUTE_CODE'] ? v['ROUTE_CODE'] : '-';
                    v['FREQ_CODE'] = v['FREQ_CODE'] ? v['FREQ_CODE'] : '-';
                    v['DAYS'] = v['DAYS'] ? v['DAYS'] : '-';
                    v['NOTES'] = v['NOTES'] ? v['NOTES'] : '-';

                    return v;
                }), ['ODR_NAME', 'NewStartDate', 'NewEndDate']);

                console.log('用藥項目總資料 self.drugData', self.drugData);

                self.gridOptions.api.setRowData(self.drugData);

                // 等待 grid 長好後再執行
                // self.gridOptions.onGridReady =  function(event) { 
                //     console.log('the grid is now ready!!'); 
                //     self.gridOptions.api.hideOverlay();
                //     self.gridOptions.api.setRowData(self.drugData);
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
    // isNeeedTime：不需時間
    function getRealDateTimeStr(dateStr, timeStr, isNeeedTime) {
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
        // 有無需要顯示時間
        if (isNeeedTime) {
            finalStr = newDateStr && newTimeStr ? newDateStr.concat(' ', newTimeStr) : null;
            finalMoment = finalStr ? moment(finalStr, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm') : '-';
        } else {
            finalStr = newDateStr ? newDateStr : null;
            finalMoment = finalStr ? moment(finalStr, 'YYYY/MM/DD').format('YYYY/MM/DD') : '-';
        }
        console.log('年月日時 finalStr', finalStr);
        console.log('年月日時 finalMoment', finalMoment);
        return finalMoment;
    }


    // 勾選完畢儲存
    self.saveChecked = function () {
        // 勾選好的資料會成陣列
        // selectedRows 就是用藥項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();

        // 勾選完先排序
        let sortData = _.sortBy(selectedRows, ['REP_TYPE_NAME', 'NewStartDate', 'NewEndDate']);
        console.log('勾選完畢先排序 sortData', angular.copy(sortData));
        // 處理成字串
        let selectedRowsString = '';
        sortData.forEach(function (selectedRow, index) {
            // let symbol = ''; // '◈'
            selectedRowsString += selectedRow.ODR_NAME.concat('/', selectedRow.NewDoseUnit, '/', selectedRow.ROUTE_CODE, '/', selectedRow.FREQ_CODE, '/共', selectedRow.DAYS, '天/', '(', selectedRow.START_DATE, '~', selectedRow.END_DATE, ')/', selectedRow.NOTES, '; ');
        });

        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);
        console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);

        // 帶資料回前一頁：字串
        if (selectedRows && selectedRows.length > 0) {
            // 有勾選
            ReferralSheetService.setCheckedData('drug', selectedRowsString);
        } else {
            // 無勾選
            ReferralSheetService.setCheckedData('drug', '');
        }

        console.log('勾選完畢儲存 $sessionStorage.checkedLabexamData', $sessionStorage.referralCheckedData);
        $scope.$emit('checkedData', {
            fromStateName: 'drugCheck'
        });
        self.goback();

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
    用藥資料內容
    "PAT_NO": "50703949",
    "PAT_SEQ": "G01007",
    "ODR_SEQ": 1.0,
    "ODR_CODE": "OSPOR1",
    "ODR_NAME": "適撲諾 膠囊 100公絲",
    "CREATE_DATE": "1010703",
    "START_DATE": "1010703",
    "END_DATE": null,
    "END_TIME": null,
    "DC_FLAG": null,
    "DOSE": 2.5,
    "DOSE_UNIT": "cap",
    "DAYS": 28,
    "FREQ_CODE": "QDWM",
    "ROUTE_CODE": "PO",
    "NOTES": "memo...",
    "USER_NAME": "李春嬌",
    "EPO_QTY": 13,
    "OPD_SW": "0"
*/
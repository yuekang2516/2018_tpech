import surgeryCheck from './surgeryCheck.html';

import './surgeryCheck.less';

angular.module('app')
    .component('surgeryCheck', {
        template: surgeryCheck,
        controller: surgeryCheckCtrl,
        controllerAs: '$ctrl'
    });

surgeryCheckCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$timeout', 'tpechService'
];

function surgeryCheckCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $timeout, tpechService) {
    const self = this;
    self.referralSheetId = $stateParams.referralSheetId;

    self.user = SettingService.getCurrentUser();

    self.isError = false;

    // 病人的所有的手術資料
    self.surgeryData = [];

    // grid 標題
    let columnTitle = [{
            headerName: "科別",
            field: "HDEPT_NAME",
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
            headerName: "日期",
            field: "IN_OR_DATE",
            cellClass: ['font-15px']
        },
        {
            headerName: "手術內容",
            field: "ODR_NAME",
            cellClass: ['font-15px']
        },
        {
            headerName: "醫師",
            field: "DR_NAME",
            cellClass: ['font-15px']
        }
    ];


    // TODO: 預設畫面
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
            rowData: self.surgeryData, // data
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


        // if ($stateParams.referralSheetId) {
        //     // 修改
        //     self.loading = false;

        // } else {
        //     // 新增
        //     // 設定初始值
        //     self.loading = false;
        // }
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


    // 取得病人的所有的手術資料
    self.getCheckItems = function () {
        // grid 在 init 時就長好了
        self.gridOptions.api.showLoadingOverlay();
        // self.loading = true;
        // 取得病人的所有的手術資料 ReferralSheetService.getSurgeryCheckItems(self.StartDate, self.EndDate)
        tpechService.getSurgery($stateParams.medicalId, self.StartDate, self.EndDate).then((q) => {
            // self.loading = false;
            // 先處理資料
            console.log('取得病人的所有的手術資料 q', q);
            if (q.data && q.data.length > 0) {
                // 依 項目 日期 排序
                self.surgeryData = _.sortBy(angular.copy(q.data).map((v) => {

                    // 處理日期 -> 轉西元
                    v['NewInOrDate'] = getRealDateTimeStr(v['IN_OR_DATE'], null, false);
                
                    // 處理 null -> '-'
                    v['HDEPT_NAME'] = v['HDEPT_NAME'] ? v['HDEPT_NAME'] : '-';
                    v['DR_NAME'] = v['DR_NAME'] ? v['DR_NAME'] : '-';

                    return v;
                }), ['HDEPT_NAME', 'NewInOrDate', 'ODR_NAME']);

                console.log('手術項目總資料 self.surgeryData', self.surgeryData);

                self.gridOptions.api.setRowData(self.surgeryData);

                // 等待 grid 長好後再執行
                // self.gridOptions.onGridReady =  function(event) { 
                //     console.log('the grid is now ready!!'); 
                //     self.gridOptions.api.hideOverlay();
                //     self.gridOptions.api.setRowData(self.surgeryData);
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
        // console.log('年月日時 year', year);
        // console.log('年月日時 newDateStr', newDateStr);
        // console.log('年月日時 time', time);
        // console.log('年月日時 newTimeStr', newTimeStr);
        console.log('年月日時 finalStr', finalStr);
        console.log('年月日時 finalMoment', finalMoment);
        return finalMoment;
    }

    // 西元轉民國
    // function getTaiwanDate(date) {
    //     let year = parseInt(moment(date).format('YYYY')) ? parseInt(moment(date).format('YYYY')) - 1911 : null;
    //     let newDateStr = year ? year.toString().concat(moment(date).format('MMDD')) : null;
    //     return newDateStr;
    // }


    // 勾選完畢儲存
    self.saveChecked = function () {
        // 勾選好的資料會成陣列
        // selectedRows 就是手術項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();

        // 勾選完先排序
        let sortData = _.sortBy(selectedRows, ['HDEPT_NAME', 'NewInOrDate', 'ODR_NAME']);
        console.log('勾選完畢先排序 sortData', angular.copy(sortData));
        // 處理成字串
        let selectedRowsString = '';
        sortData.forEach(function (selectedRow, index) {
            // let symbol = ''; // '◈'
            selectedRowsString += selectedRow.HDEPT_NAME.concat('/', selectedRow.IN_OR_DATE, '/', selectedRow.ODR_NAME, '/', selectedRow.DR_NAME, '; ');
        });

        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);
        console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);

        // 帶資料回前一頁：字串
        if (selectedRows && selectedRows.length > 0) {
            // 有勾選
            ReferralSheetService.setCheckedData('surgery', selectedRowsString);
        } else {
            // 無勾選
            ReferralSheetService.setCheckedData('surgery', '');
        }

        console.log('勾選完畢儲存 $sessionStorage.checkedLabexamData', $sessionStorage.referralCheckedData);
        $scope.$emit('checkedData', {
            fromStateName: 'surgeryCheck'
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
    手術資料內容
    "PAT_NO": "41583080",
    "HDEPT_CODE": "BB00",
    "HDEPT_NAME": "心臟血管外科",
    "DR_CODE": "DAK47",
    "DR_NAME": "劉亮廷",
    "IN_OR_DATE": "1080402",
    "OP_ODR_CODE1": "69039",
    "ODR_NAME": "內頸靜脈切開，永久導管放置術"
*/
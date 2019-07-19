import orderCheck from './orderCheck.html';
import './orderCheck.less';

angular.module('app')
    .component('orderCheck', {
        template: orderCheck,
        controller: orderCheckCtrl,
        controllerAs: '$ctrl'
    });

    orderCheckCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$timeout', 'pdTreatService'
];

function orderCheckCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $timeout, pdTreatService) {
    const self = this;
    self.ptId = $stateParams.patientId;
    self.user = SettingService.getCurrentUser();
    self.isError = false;

    // 病人的所有的醫囑資料
    self.orderData = [];

    // grid 標題
    let columnTitle = [{
            headerName: "日期",
            field: "Prescription_Startdate",
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
            headerName: "透析類別",
            field: "Dialysis_Type",
            cellClass: ['font-15px']
        },
        {
            headerName: "透析液系統",
            field: "Dialysis_System",
            cellClass: ['font-15px']
        }
    ];


    // TODO: 預設畫面
    self.$onInit = function $onInit() {
        // 初始化時間區間
        self.StartDate = new Date(moment());
        self.EndDate = new Date(moment());

        // 先初始化 ag-grid：開始長 grid
        self.gridOptions = {
            columnDefs: columnTitle, // grid 標題設定
            rowData: self.orderData, // data
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
            rowSelection: 'single', // 單選
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

        $timeout(() => {
            self.getCheckItems();
        });
    };

    // 取得病人的所有的治療處方資料
    self.getCheckItems = function () {
        // grid 在 init 時就長好了
        self.gridOptions.api.showLoadingOverlay();
        // self.loading = true;

        let searchStDate = moment(self.StartDate).format("YYYY-MM-DD");
        let searchEdDate = moment(self.EndDate).format("YYYY-MM-DD");

        pdTreatService.getListByPatientDateRange(searchStDate, searchEdDate, $stateParams.patientId).then((res) => {
            // 先處理資料
            console.log('取得病人的所有的治療處方資料 res', res);
            if (res.data && res.data.length > 0) {
                self.orderData = angular.copy(res.data);
                console.log('治療處方項目總資料 self.orderData', self.orderData);
                for(var oi in self.orderData){
                    self.orderData[oi].Prescription_Startdate = moment(new Date(self.orderData[oi].Prescription_Startdate)).format("YYYY-MM-DD HH:mm"); 
                }

                self.orderData = _.orderBy(self.orderData, ['Prescription_Startdate'], ['desc']);

                self.gridOptions.api.setRowData(self.orderData);
            } else {
                self.gridOptions.api.showNoRowsOverlay();
            }

        }, (err) => {
            self.isError = true;
        });
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

    // 勾選完畢儲存
    self.saveChecked = function () {
        // 勾選好的資料會成陣列
        // selectedRows 就是手術項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();

        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);

        // 帶資料回前一頁：字串
        if (selectedRows && selectedRows.length > 0) {
            // 有勾選
            ReferralSheetService.setCheckedData('order', selectedRows);
        } else {
            // 無勾選
            ReferralSheetService.setCheckedData('order', '');
        }

        console.log('勾選完畢儲存 $sessionStorage.checkedOrder', $sessionStorage.referralCheckedData);
        $scope.$emit('checkedData', {
            fromStateName: 'orderCheck'
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
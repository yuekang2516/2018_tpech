import diseaseCheck from './diseaseCheck.html';

import './diseaseCheck.less';

angular.module('app')
    .component('diseaseCheck', {
        template: diseaseCheck,
        controller: diseaseCheckCtrl,
        controllerAs: '$ctrl'
    });

diseaseCheckCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', '$sessionStorage', '$timeout', 'tpechService'
];

function diseaseCheckCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, $sessionStorage, $timeout, tpechService) {
    const self = this;
    self.referralSheetId = $stateParams.referralSheetId;

    self.user = SettingService.getCurrentUser();

    self.isError = false;

    // 病人的所有的疾病資料
    self.diseaseData = [
        { Title: '糖尿病', DiseaseName: '糖尿病', OtherMemo: '', SortIndex: 0},
        { Title: '高血壓', DiseaseName: '高血壓', OtherMemo: '', SortIndex: 1 },
        { Title: '鬱血性心臟衰竭', DiseaseName: '鬱血性心臟衰竭', OtherMemo: '', SortIndex: 2 },
        { Title: '缺血性心臟病', DiseaseName: '缺血性心臟病', OtherMemo: '', SortIndex: 3 },
        { Title: '腦血管病變', DiseaseName: '腦血管病變', OtherMemo: '', SortIndex: 4 },
        { Title: '慢性肝病/肝硬化', DiseaseName: '慢性肝病/肝硬化', OtherMemo: '', SortIndex: 5 },
        { Title: '惡性腫瘤', DiseaseName: '惡性腫瘤', OtherMemo: '', SortIndex: 6 },
        { Title: '結核', DiseaseName: '結核', OtherMemo: '', SortIndex: 7 },
        { Title: '其他(請說明)', DiseaseName: '其他', OtherMemo: '', SortIndex: 8 }
    ];


    // grid 標題
    let columnTitle = [{
            headerName: "疾病名稱",
            field: "Title",
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
            headerName: "", // 其他說明內容
            field: "OtherMemo",
            cellClass: ['font-15px'],
            singleClickEdit: true,
            stopEditingWhenGridLosesFocus: true,
            editable: function(params) {
                return params.node.data.Title === '其他(請說明)';
            },
            cellClassRules: {
                "other-memo": function(params) {
                  return params.node.data.Title === '其他(請說明)';
                }
            },
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
            rowData: self.diseaseData, // data
            angularCompileRows: true,
            defaultColDef: {
                resizable: true, // shift 可拉開標題長度
                // sortable: true // 全部欄位皆開放排序
                // width: 200
            },
            pagination: false, // 分頁
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

    // 監聽 window 大小縮放 grid
    window.addEventListener("resize", sizeToFit);

    function sizeToFit() {
        self.gridOptions.api.sizeColumnsToFit();
    }

    // 勾選完畢儲存
    self.saveChecked = function () {
        // 一定要stop否則編輯的資料會帶不進來
        self.gridOptions.api.stopEditing();
        // 勾選好的資料會成陣列
        // selectedRows 就是疾病項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();

        // 勾選完先排序：其他排最後
        let sortData = _.sortBy(selectedRows, ['SortIndex']);
        console.log('勾選完畢先排序 sortData', angular.copy(sortData));
        // 處理成字串
        let selectedRowsString = '';
        sortData.forEach(function (selectedRow) {

            console.log('勾選完畢先排序 selectedRow', selectedRow);

            // let symbol = ''; // '◈'
            if (selectedRow.SortIndex == 8 && (selectedRow.OtherMemo != "" && selectedRow.OtherMemo != null)) {
                console.log('SortIndex: ', selectedRow.SortIndex);
                console.log('OtherMemo1: ', selectedRow.OtherMemo != "");
                console.log('OtherMemo2: ', selectedRow.OtherMemo != null);
                // 其他
                selectedRowsString += selectedRow.DiseaseName.concat(' (',  selectedRow.OtherMemo, '); ');
            } else {
                selectedRowsString += selectedRow.DiseaseName.concat('; ');
            }
        });

        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);
        console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);

        // 帶資料回前一頁：字串
        if (selectedRows && selectedRows.length > 0) {
            // 有勾選
            ReferralSheetService.setCheckedData('disease', selectedRowsString);
        } else {
            // 無勾選
            ReferralSheetService.setCheckedData('disease', '');
        }

        console.log('勾選完畢儲存 $sessionStorage.checkedLabexamData', $sessionStorage.referralCheckedData);
        $scope.$emit('checkedData', {
            fromStateName: 'diseaseCheck'
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

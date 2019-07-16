import tpl from './admissionConsult.html';
import './admissionConsult.less';

angular.module('app').component('admissionConsult', {
    template: tpl,
    controller: admissionConsultCtrl
});

admissionConsultCtrl.$inject = ['$q', '$scope', '$stateParams', 'PatientService', 'tpechService'];
function admissionConsultCtrl($q, $scope, $stateParams, PatientService, tpechService) {
    const self = this;
    // self.serviceData = {};
    // var d = new Date();
    // self.admissionDate = new Date();
    console.log("admissionConsult");

    // 查詢區間
    self.startDate = new Date();
    self.endDate = new Date();

    self.$onInit = function onInit() {
        loadData();

        // ag-grid init
        self.gridOptions = {
            angularCompileRows: true,
            defaultColDef: {
                width: 100,
                resizable: true,
                cellStyle: {
                    'white-space': 'normal',
                    'word-break': 'break-all'   // 英文字才會斷行
                }
            },
            onColumnResized: onColumnResized,
            // onGridReady: function (params) {
            //     params.api.setRowData();
            // },
            // rowModelType: 'serverSide',
            columnDefs: [
                {
                    field: 'PAT_SEQ',
                    headerName: '住院序號',
                    width: 100,
                    autoHeight: true,
                },
                {
                    field: 'IPD_DATE',
                    headerName: '住院日期',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'HDEPT_CODE',
                    headerName: '住院科別代碼',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'HDEPT_NAME',
                    headerName: '住院科別名稱',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'DR_CODE',
                    headerName: '主治醫師代碼',
                    cellClass: 'cell-wrap-text',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'DR_NAME',
                    headerName: '主治醫師姓名',
                    cellClass: 'cell-wrap-text',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'REAL_OUT_DATE',
                    headerName: '出院日期',
                    cellClass: 'cell-wrap-text',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'OUT_ICD_CODE1',
                    headerName: '出院主診斷碼',
                    cellClass: 'cell-wrap-text',
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'OUT_ICD_CODE2',
                    headerName: '出院診斷碼2',
                    // cellClass: 'cell-wrap-text',
                    cellStyle: {
                        'white-space': 'normal'
                    },
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'OUT_ICD_CODE3',
                    headerName: '出院診斷碼3',
                    cellClass: 'cell-wrap-text',
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'OUT_ICD_CODE4',
                    headerName: '出院診斷碼4',
                    cellClass: 'cell-wrap-text',
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'OUT_ICD_CODE5',
                    headerName: '出院診斷碼5',
                    cellClass: 'cell-wrap-text',
                    width: 120,
                    autoHeight: true
                }
            ]
        };

    };
    function onColumnResized() {
        self.gridOptions.api.resetRowHeights();
    }

    let medicalId = null;
    // 取得列表資料
    function loadData() {
        self.loading = true;
        // 先取得病人病歷碼
        PatientService.getById($stateParams.patientId).then((res) => {
            medicalId = res.data.MedicalId;
            return tpechService.getIPD2(res.data.MedicalId, tpechService.getTaiwanDate(self.startDate), tpechService.getTaiwanDate(self.endDate));
        }).then((res) => {
            self.isError = false;
            prepareData(res.data);
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.serviceData = [];
        loadData();
    };

    self.checkValue = function checkValue() {
        self.loading = true;
        // call api
        tpechService.getIPD2(medicalId, tpechService.getTaiwanDate(self.startDate), tpechService.getTaiwanDate(self.endDate)).then((res) => {
            self.isError = false;
            prepareData(res.data);
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
        self.gridOptions.data = self.serviceData.filter((x, index) => {
            console.log("333", self.admissionDate);
            return x.AdmissionDate >= self.admissionDate && x.AdmissionDate <= self.dischargeDate;
        });
    };

    self.changeQueryDate = function () {
        // 處理 起始日結束日
        if (moment(self.endDate).isBefore(moment(self.startDate))) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            self.endDate = new Date(moment(self.startDate));
        }
    };

    function prepareData(rawData) {
        self.lastAccessTime = tpechService.getLastAccessTimeByKey('ipd2');
        if (Array.isArray(rawData) && rawData.length > 0) {
            // 轉換
            rawData = _.orderBy(rawData.map(item => {
                // 日期 民國 -> 西元
                item.IPD_DATE = tpechService.tawiwanDateToBC(item.IPD_DATE) ? moment(tpechService.tawiwanDateToBC(item.IPD_DATE)).format('YYYY/MM/DD') : null;
                item.REAL_OUT_DATE = tpechService.tawiwanDateToBC(item.REAL_OUT_DATE) ? moment(tpechService.tawiwanDateToBC(item.REAL_OUT_DATE)).format('YYYY/MM/DD') : null;
                return item;
            }), ['PAT_SEQ'], ['asc']);
            self.serviceData = rawData;
        } else {
            self.serviceData = [];
        }
        self.gridOptions.api.setRowData(self.serviceData);
        setTimeout(() => {
            self.gridOptions.api.resetRowHeights();
        }, 0);
        // $scope.gridOptions.data = self.serviceData;
        self.isError = false;
    }

    self.back = function () {
        history.go(-1);
    };
}

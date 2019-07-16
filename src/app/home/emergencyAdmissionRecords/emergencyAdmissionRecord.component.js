import tpl from './emergencyAdmissionRecord.html';
import './emergencyAdmissionRecord.less';

angular.module('app').component('emergencyAdmissionRecord', {
    template: tpl,
    controller: emergencyAdmissionRecordController
});

emergencyAdmissionRecordController.$inject = ['$scope', '$stateParams', '$mdSidenav', 'SettingService', 'PatientService', 'tpechService'];

function emergencyAdmissionRecordController($scope, $stateParams, $mdSidenav, SettingService, PatientService, tpechService) {
    const self = this;
    self.today = moment().format('YYYY/MM/DD(dd)');
    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    self.toggleSideNav = function () {
        SettingService.setSideNavStatus(SettingService.getCurrentUser().Id, !SettingService.getSideNavStatus(SettingService.getCurrentUser().Id));
        // emit to parent
        $scope.$emit('toggleNav');

    };

    self.serviceData = [];
    self.$onInit = function () {
        setTimeout(() => {
            $('#medicalSearch').focus();
        }, 0);

        self.msg = '請輸入病歷號';
        // ag-grid init
        self.gridOptions = {
            angularCompileRows: true,
            defaultColDef: {
                width: 100,
                resizable: true,
                cellStyle: {
                    'white-space': 'normal',
                    'word-break': 'break-all' // 英文字才會斷行
                }
            },
            onColumnResized: onColumnResized,
            // onGridReady: function (params) {
            //     params.api.setRowData();
            // },
            // rowModelType: 'serverSide',
            columnDefs: [
                {
                    field: 'OPD_SW',
                    headerName: '門住診',
                    width: 80,
                    autoHeight: true,
                },
                {
                    field: 'PAT_SEQ',
                    headerName: '就診序號',
                    width: 100,
                    autoHeight: true,
                },
                {
                    field: 'IPD_DATE',
                    headerName: '就診日期',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'REAL_OUT_DATE',
                    headerName: '出院日期',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'NOON_CODE',
                    headerName: '護理站/午別',
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'HDEPT_NAME',
                    headerName: '住院科別名稱',
                    width: 150,
                    autoHeight: true
                },
                {
                    field: 'SECT_NO',
                    headerName: '床號/診間號碼',
                    width: 120,
                    autoHeight: true
                },
                {
                    field: 'REG_SEQ',
                    headerName: '診號',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'DR_NAME',
                    headerName: '醫師姓名',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'ICD_CODE1',
                    headerName: '診斷碼1',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'ICD_CODE2',
                    headerName: '診斷碼2',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'ICD_CODE3',
                    headerName: '診斷碼3',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'ICD_CODE4',
                    headerName: '診斷碼4',
                    width: 100,
                    autoHeight: true
                },
                {
                    field: 'ICD_CODE5',
                    headerName: '診斷碼5',
                    width: 100,
                    autoHeight: true
                }
            ]
        };
    };
    function onColumnResized() {
        self.gridOptions.api.resetRowHeights();
    }

    self.search = function () {
        loadData(self.currentMedicalId);
    };

    // 取得列表資料
    function loadData(medicalId) {
        self.loading = true;
        // 先取得病人病歷碼
        tpechService.getIpd(medicalId).then((res) => {
            self.lastAccessTime = tpechService.getLastAccessTimeByKey('ipd2');
            if (Array.isArray(res.data) && res.data.length > 0) {
                // 轉換
                res.data.map(item => {
                    // REG_SEQ 診號
                    if (/^I$/i.test(item.OPD_SW) && item.REG_SEQ == 0) {
                        item.REG_SEQ = '';
                    }

                    // 日期 民國 -> 西元
                    item.IPD_DATE = item.IPD_DATE ? moment(new Date(parseInt(item.IPD_DATE.substring(0, 3)) + 1911, parseInt(item.IPD_DATE.substring(3, 5)) - 1, item.IPD_DATE.substring(5, 7))).format('YYYY/MM/DD') : null;
                    item.REAL_OUT_DATE = item.REAL_OUT_DATE ? moment(new Date(parseInt(item.REAL_OUT_DATE.substring(0, 3)) + 1911, parseInt(item.REAL_OUT_DATE.substring(3, 5)) - 1, item.REAL_OUT_DATE.substring(5, 7))).format('YYYY/MM/DD') : null;

                    // NOON_CODE: OPDER_SW=I時，為護理站名稱；OPDER_SW=E時，為午別代碼(1早2午3晚)
                    if (item.NOON_CODE == 1) {
                        item.NOON_CODE = '早';
                    } else if (item.NOON_CODE == 2) {
                        item.NOON_CODE = '午';
                    } else if (item.NOON_CODE == 3) {
                        item.NOON_CODE = '晚';
                    }

                    // 急住代號轉換，放最後避免影響前面的判斷
                    if (/^E$/i.test(item.OPD_SW)) {
                        item.OPD_SW = '急診';
                    } else if (/^I$/i.test(item.OPD_SW)) {
                        item.OPD_SW = '住院';
                    }

                    return item;
                });
                self.serviceData = res.data;
            } else {
                self.serviceData = [];
                self.msg = '目前沒有資料';
            }
            self.gridOptions.api.setRowData(self.serviceData);
            setTimeout(() => {
                self.gridOptions.api.resetRowHeights();
            }, 0);
            // $scope.gridOptions.data = self.serviceData;
            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }
}

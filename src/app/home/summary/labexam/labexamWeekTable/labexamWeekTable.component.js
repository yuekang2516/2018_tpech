import tpl from './labexamWeekTable.html';
import cellTpl from '../labexamTable/labexamTableCell.html';

angular
    .module('app')
    .component('labexamWeekTable', {
        template: tpl,
        controller: labexamWeekTableCtrl
    });

labexamWeekTableCtrl.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$mdDialog',
    'SettingService',
    'i18nService',
    'uiGridConstants',
    'labexamService',
    '$filter'
];

// 周檢驗
function labexamWeekTableCtrl($scope, $state, $stateParams, $mdDialog, SettingService, i18nService, uiGridConstants,
    labexamService, $filter) {

    const self = this;
    self.user = SettingService.getCurrentUser();
    let $translate = $filter('translate');
    // 預設狀態
    self.loading = true;
    let queryCondition = labexamService.getPreviousQueryConditionByUserId(self.user.Id);

    // listen parent query condition change
    $scope.$on('queryCondition', (event, condition) => {
        console.log('queryCondition', condition);
        queryCondition = condition;

        // TEST
        // ag-grid 統一設定
        // https://www.ag-grid.com/best-angularjs-data-grid/
        $scope.gridOptions = {
            rowData: [
                {
                    CheckTime: '2019/04/13 12:00',
                    WBC: '4500',
                    Hgb: '20',
                    abnormalItems: ['Hgb']
                },
                {
                    CheckTime: '2019/04/15 12:00',
                    Hgb: '14'
                },
                {
                    CheckTime: '2019/04/18 13:00',
                    Hgb: '14'
                }
            ]
        };
        // ag-grid columndef 依據上述排序設定排
        $scope.gridOptions.columnDefs = [
            { field: 'CheckTime', headerName: $translate('labexam.labexam.component.nameAndDate'), width: 140, pinned: 'left' }
        ].concat(_.map(_.groupBy(orderRegExArray, 'groupName'), (item, key) => {
            let result = {
                headerName: key === 'undefined' ? '' : key,
                children: []
            };

            _.forEach(item, (o) => {
                result.children.push({
                    field: o.showName,
                    headerName: o.showName,
                    width: 100,
                    resizable: true,
                    cellClass: (params) => {
                        // 目前的 col 要等於 data 中有包含此 key 值的
                        return params.data.abnormalItems && params.data.abnormalItems.indexOf(params.colDef.field) > -1 ? 'isAbnormal' : '';
                    }
                });
            });

            return result;
        }));

        // self.loading = true;
        // loadingData();
    });

    $scope.$on('labexam-dataChanged', () => {
        self.refresh();
    });

    // 使用者按右上角重整按鈕時
    self.refresh = () => {
        self.loading = true;
        loadingData(true);
    };

    self.$onInit = () => {
        console.log('labWeekTableCtrl 初始化');

        // Excel export & 重新整理相關
        $scope.$emit('labFn', { refresh: self.refresh, exportExcel: self.export });

        // ui-grid init
        // ui-grid 語系設定
        i18nService.setCurrentLang('zh-tw');

        // ui-grid 統一設定
        $scope.gridOptions = {
            enableColumnResizing: true,
            enableColumnMenus: false,   // https://stackoverflow.com/questions/32671202/remove-sorting-menu-from-ui-grid-column-header
            enableSorting: false,
            excessRows: 20,
            exporterExcelFilename: `labexam-${moment().format('YYYYMMDDHHmm')}.xlsx`,
            exporterExcelSheetName: 'labexam',
            exporterFieldCallback: function (grid, row, col, input) {
                // 匯出 excel 時，決定資料長的樣子
                // 若不是 Name 欄位則取物件中的 Value 值，若有多筆則用逗號區隔
                if (col.name !== 'Name') {
                    let result = '';
                    _.forEach(input, (item) => {
                        result = result ? result + ',' + item.Value : item.Value;
                    });
                    return result;
                }

                return input;
            },
            onRegisterApi: function (gridApi) {     // http://ui-grid.info/docs/#!/tutorial/Tutorial:%20110%20Grid%20in%20a%20Modal
                $scope.gridApi = gridApi;
            }
        };

        loadingData(true); // TODO: 再確認一次

    };

    self.export = function () {
        $scope.gridApi.exporter.excelExport('all', 'all');
    };

    // 修改
    $scope.edit = function (data) {
        console.log('edit', data);

        if ($state.current.name.substr(0, 2) === "pd") {
            $state.go('pdUpdateLabexam', {
                patientId: $stateParams.patientId,
                labexamId: data.Id
            });
        } else {
            $state.go('updateLabexam', {
                patientId: $stateParams.patientId,
                labexamId: data.Id
            });
        }
    };

    // 刪除
    $scope.del = function (event, data) {
        $mdDialog.show({
            controller: [
                '$mdDialog', DialogController
            ],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                labexamService
                    .del(data.Id)
                    .then((q) => {
                        if (q.status === 200) {
                            self.refresh();
                        }
                    });
                mdDialog.hide(data);
            };
        }
    };

    let loadingData = (refresh = false) => {
        labexamService
            .getByPatientId($stateParams.patientId, queryCondition, refresh)
            .then((q) => {
                // 吐出資料chart
                // console.log('周表', angular.copy(q.data));
                // self.serviceData = q.data;
                // filter 出周表要的四種檢驗項目 hct ca p k
                let labItemRegExObj = {
                    HCT: /^(\bHCT\b)|(\bHematocrit\b)$/i, // HCT, Hematocrit
                    Ca: /^(\bca\b)|(\bCalcium\b)$/i, // Calcium
                    Inorganic_P: /^(\bp\b)|(\bInorganic[\s]p\b)$/i, // Inorganic P
                    K: /^(\bK\b)|(\bK+\b)$/i
                };
                // 檢驗檢查時間倒序排
                self.serviceData = q.data.sort((a, b) => {
                    if (a.CheckTime < b.CheckTime) return 1;
                    return -1;
                });

                self.serviceData = _.filter(q.data, function (o) {
                    let normalizedName = o.Name.trim();
                    let needReturn = false;

                    _.forEach(labItemRegExObj, (value, key) => {
                        if (value.test(normalizedName)) {
                            o.Name = key.replace(/_/g, ' ');    // 命名 key 時用_代替空格
                            needReturn = true;
                        }
                    });

                    return needReturn;
                });

                $scope.$emit('labDataLength', self.serviceData.length);
                // console.log('全部周表 self.serviceData', self.serviceData);

                // 重組前端顯示用的資料
                // column -> date
                // 將所有 date 組成 columnDefs 所需的陣列
                // 組 date columns

                let rows = [];

                // 組出 grid 的 column 日期不重複，並順便統一所需資料的欄位
                let uniqueDateColumn = [...new Set(self.serviceData
                    .map((i) => {
                        // 順便組 row 需要的資料
                        let displayName = moment(i.CheckTime).format('YYYY-MM-DD');

                        // 因為檢驗項目不分大小寫，先將項目名稱統一轉為小寫存至另外一個欄位，方便 groupBy
                        i[displayName] = null;
                        i.displayName = displayName;
                        i.NameGroup = i.Name.toLowerCase();

                        // 不正常上色
                        // 如果有填 是否在參考值內？
                        i.isAbnormal = i.IsNormal === false;
                        // 如果沒填
                        // 因為 IsNormal 為非必塡，有可能真的是空的，只能以 false, true 判斷
                        if (i.IsNormal !== false) {
                            i.isAbnormal = (i.NormalDown && Number(i.NormalDown) > Number(i.Value)) || (i.NormalUpper && Number(i.NormalUpper) < Number(i.Value));
                        }

                        rows.push(i);

                        // 將資料變為日期
                        return displayName;
                    }))].map((o) => {
                        return {
                            name: o,
                            minWidth: 110,
                            cellTemplate: cellTpl
                        };
                    });

                console.log('uniqueDateColumn', uniqueDateColumn);
                console.log('rows', rows);

                // 將同一項目的 group 在一起
                let groupItems = _.groupBy(rows, 'NameGroup');
                rows = _.map(groupItems, (value) => {
                    let temp = {};
                    // 每個項目再用正序排
                    value = _.orderBy(value, ['CheckTime'], ['asc']);
                    _.forEach(value, (item) => {
                        if (!temp.Name) {
                            temp.Name = item.Name;
                        }
                        if (!temp[item.displayName]) {
                            temp[item.displayName] = [item];
                        } else {
                            temp[item.displayName].push(item);
                        }
                    });
                    return temp;
                });

                console.log('after group rows', rows);
                // 多個 header http://embed.plnkr.co/fsJdENoN1ll4FUGsPzts/
                $scope.gridOptions.columnDefs = [
                    { name: 'Name', displayName: $translate('labexam.labexam.component.nameAndDate'), minWidth: 110, pinnedLeft: true }
                ].concat(uniqueDateColumn);

                // add two rows to prevent add button block the data
                rows.push({ Name: '' });
                rows.push({ Name: '' });
                $scope.gridOptions.data = rows;

                // emit lastAccessTime
                $scope.$emit('labLastAccessTime', labexamService.getLastAccessTime());
                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });
    };

}


import tpl from './labexamTable.html';
import cellTpl from './labexamTableCell.html';

angular
    .module('app')
    .component('labexamTable', {
        template: tpl,
        controller: labTableCtrl,
        bindings: {
            isCard: '<'
        }
    });

labTableCtrl.$inject = [
    '$q',
    '$timeout',
    '$scope',
    '$state',
    '$stateParams',
    '$mdDialog',
    'SettingService',
    'labexamService',
    'labexamSettingService',
    'i18nService',
    'uiGridConstants',
    '$filter',
    'showMessage',
    'SessionStorageService'
];

function labTableCtrl($q, $timeout, $scope, $state, $stateParams, $mdDialog, SettingService, labexamService, labexamSettingService, i18nService, uiGridConstants, $filter, showMessage, SessionStorageService) {

    const self = this;
    self.user = SettingService.getCurrentUser();
    let $translate = $filter('translate');
    // 預設狀態
    // self.loading = true;
    let queryCondition = labexamService.getPreviousQueryConditionByUserId(self.user.Id);

    // listen parent query condition change
    $scope.$on('queryCondition', (event, condition) => {
        console.log('queryCondition', condition);

        // 看是天數還是期間
        queryCondition = condition;
        self.loading = true;
        loadingData();
    });

    $scope.$on('labexam-dataChanged', () => {
        self.refresh();
    });

    // 依照檢驗項目排序及統一名稱，後台設定尚未做，先寫死
    // let orderRegExArray = [
    //     // 血液相關
    //     { Name: 'WBC', upperName: 'WBC', regex: /^(WBC)$/i, SettingGroup: '血液相關', PatientMemo: 'Patient', DoctorMemo: 'Doctor', NurseMemo: 'Nurse' },
    //     { Name: 'HGB', upperName: 'HGB', regex: /^(HGB)$/i, SettingGroup: '血液相關', PatientMemo: 'Patient', DoctorMemo: 'Doctor', NurseMemo: 'Nurse' },
    //     { Name: 'Hct', upperName: 'HCT', regex: /^((HCT)|(Hematocrit))$/i, SettingGroup: '血液相關' },
    //     { Name: 'MCV', upperName: 'MCV', regex: /^(MCV)$/i, SettingGroup: '血液相關', PatientMemo: 'Patient fff', DoctorMemo: 'Doctor ffff', NurseMemo: 'Nurse fkkf' },
    //     { Name: 'PLT', upperName: 'PLT', regex: /^(PLT)$/i, SettingGroup: '血液相關', PatientMemo: 'Patient fff', DoctorMemo: 'Doctor ffff', NurseMemo: 'Nurse fkkf' },
    //     { Name: 'Iron', upperName: 'IRON', regex: /^(IRON)$/i, SettingGroup: '血液相關' },
    //     { Name: 'TIBC', upperName: 'TIBC', regex: /^(TIBC)$/i, SettingGroup: '血液相關' },
    //     { Name: 'Ferritin', upperName: 'FERRITIN', regex: /^(FERRITIN)$/i, SettingGroup: '血液相關' },
    //     { Name: 'TSAT', upperName: 'TSAT', regex: /^(TSAT)$/i, SettingGroup: '血液相關' },
    //     { Name: 'Stool OB', upperName: 'STOOL OB', regex: /^(STOOL OB)$/i, SettingGroup: '血液相關' },
    //     // 營養與代謝
    //     { Name: 'Albumin', upperName: 'ALBUMIN', regex: /^(ALBUMIN)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'T.Protein', upperName: 'T.PROTEIN', regex: /^(T.Protein)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'nPCR', upperName: 'NPCR', regex: /^(NPCR)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'AC', upperName: 'AC', regex: /^(AC)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'A1C', upperName: 'A1C', regex: /^(A1C)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'T.Cho', upperName: 'T.CHO', regex: /^(T.CHO)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'TG', upperName: 'TG', regex: /^(TG)$/i, SettingGroup: '營養與代謝' },
    //     { Name: 'Uric Acid', upperName: 'URIC ACID', regex: /^(Uric Acid)$/i, SettingGroup: '營養與代謝' },
    //     // 透析清除指標
    //     { Name: 'BUN', upperName: 'BUN', regex: /^(BUN)$/i, SettingGroup: '透析清除指標' },
    //     { Name: 'Cr', upperName: 'CR', regex: /^(Cr)$/i, SettingGroup: '透析清除指標' },
    //     { Name: 'kt/V', upperName: 'KT/V', regex: /^(KT\/V)$/i, SettingGroup: '透析清除指標' },
    //     { Name: 'URR', upperName: 'URR', regex: /^(URR)$/i, SettingGroup: '透析清除指標' },
    //     { Name: 'TAC', upperName: 'TAC', regex: /^(TAC)$/i, SettingGroup: '透析清除指標' },
    //     // 生化
    //     { Name: 'Na', upperName: 'NA', regex: /^(NA)$/i, SettingGroup: '生化' },
    //     { Name: 'K', upperName: 'K', regex: /^(K)$/i, SettingGroup: '生化' },
    //     { Name: 'Al', upperName: 'AL', regex: /^(Al)$/i, SettingGroup: '生化' },
    //     { Name: 'Mg', upperName: 'MG', regex: /^(MG)$/i, SettingGroup: '生化' },
    //     { Name: 'CRP', upperName: 'CRP', regex: /^(CRP)$/i, SettingGroup: '生化' },
    //     // 肝臟相關
    //     { Name: 'AST', upperName: 'AST', regex: /^(AST)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'ALT', upperName: 'ALT', regex: /^(ALT)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'Alk-P', upperName: 'ALK-P', regex: /^(ALK-P)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'T.Bil', upperName: 'T.BIL', regex: /^(T.BIL)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'HBsAg', upperName: 'HBSAG', regex: /^(HBSAG)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'Anti-HBs', upperName: 'ANTI-HBS', regex: /^(ANTI-HBS)$/i, SettingGroup: '肝臟相關' },
    //     { Name: 'Anti-HCV', upperName: 'ANTI-HCV', regex: /^(ANTI-HCV)$/i, SettingGroup: '肝臟相關' },
    //     // 鈣磷相關
    //     { Name: 'Ca', upperName: 'CA', regex: /^((CA)|(Calcium))$/i, SettingGroup: '鈣磷相關' },
    //     { Name: 'P', upperName: 'P', regex: /^(P)$/i, SettingGroup: '鈣磷相關' },
    //     { Name: 'iPTH', upperName: 'IPTH', regex: /^(IPTH)$/i, SettingGroup: '鈣磷相關' },
    //     // 心臟相關
    //     { Name: 'CT Ratio', upperName: 'CT RATIO', regex: /^(CT RATIO)$/i, SettingGroup: '心臟相關' }
    // ];

    let orderArray = [];
    // 使用者按右上角重整按鈕時
    self.refresh = () => {
        self.loading = true;
        // $scope.$emit('labLastAccessTime', moment());
        // self.lastAccessTime = moment();
        loadingData(true);
    };

    self.$onInit = () => {
        console.log('labTableCtrl 初始化');

        // Excel export & 重新整理相關
        $scope.$emit('labFn', { refresh: self.refresh, exportExcel: self.export });

        // 若為從 summary 頁來的固定取 90 天
        if (self.isCard) {
            queryCondition = {
                name: 'times',
                value: '90'
            };
        }

        // ag-grid 統一設定
        // https://www.ag-grid.com/best-angularjs-data-grid/
        $scope.gridOptions = {
            angularCompileRows: true,
        };

        loadingData(true);
    };

    // custom cell for ag-grid
    function cellRenderFunc(params) {
        params.$scope.cellClicked = cellClicked;
        params.$scope.cellPressed = cellPressed;
        params.$scope.showMemo = showMemo;
        let value = params.value || '&nbsp;&nbsp;';
        // 項目 id
        let item = _.find(params.data.data, { Name: params.colDef.field });
        let itemId,
            itemName,
            itemNormalDown,
            itemNormaUpper,
            itemIsAbnormal,
            itemCheckTime = '';
        if (item) {
            itemId = item.Id;
            itemName = item.Name;
            itemNormalDown = item.NormalDown;
            itemNormaUpper = item.NormalUpper;
            itemCheckTime = item.CheckTime;
            itemIsAbnormal = item.isAbnormal;
        }

        return `<div class="cell" title="正常範圍 ${itemNormalDown}~${itemNormaUpper}&#013;
        ${value}">
        <span hm-tap="cellClicked('${itemId}')" hm-press="cellPressed('${itemId}')">${value}</span>
        <i class="material-icons" ng-if="${itemIsAbnormal}" hm-tap="showMemo('${itemName}')">info_outline</i>
        </div>
        `;
    }
    function cellClicked(value) {
        if (value === 'undefined') {
            return;
        }
        if ($state.current.name.substr(0, 2) === "pd") {
            $state.go('pdUpdateLabexam', {
                patientId: $stateParams.patientId,
                labexamId: value
            });
        } else {
            $state.go('updateLabexam', {
                patientId: $stateParams.patientId,
                labexamId: value
            });
        }
    }
    function cellPressed(value) {
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
                    .del(value)
                    .then((q) => {
                        if (q.status === 200) {
                            self.refresh();
                        }
                    });
                mdDialog.hide(value);
            };
        }
    }
    function showMemo(itemName) {
        console.log('toggleMemo', itemName);
        // 用 Name 去取後台項目資料
        let idx = _.findIndex(orderArray, (o) => {
            return o.Name === itemName;
        });

        if (idx < 0) {
            showMessage('後台無設定此檢驗項目');
            return;
        }

        // 根據角色顯示不同備註，預設為護理師備註
        // TODO server端拼錯字 nursre -> nurse
        let content = SettingService.getCurrentUser().Role === 'doctor' ? orderArray[idx].DoctorMemo : orderArray[idx].NursreMemo;
        const alert = $mdDialog.alert()
            .title(`${itemName} 異常備註`)
            .textContent(content)
            .clickOutsideToClose(true)
            .ok('確認');

        $mdDialog.show(alert);
    }

    let loadingData = (refresh = false) => {
        self.serviceData = null;
        // 同時取後台資料及檢驗檢查資料
        let exeAry = [getLabData(refresh), getLabExamSetting()];

        $q.all(exeAry).then(() => {
            self.isError = false;
            if (self.serviceData.length === 0) {
                // 沒有資料時，通知 印表按鈕 disabled
                $scope.$emit('labPrintDisabled', true);
                return;
            }
            // 有資料時，通知 印表按鈕
            $scope.$emit('labPrintDisabled', false);
            // 取資料到列印頁 $sessionStorage
            // 資料：self.serviceData, orderArray
            // SessionStorageService.setItem('labexamTableData', {
            //     labData: angular.copy(self.serviceData),
            //     settingData: angular.copy(orderArray)
            // });

            // 處理資料
            prepareData(true);
        }).catch(() => {
            // 有錯誤時，通知 印表按鈕 disabled
            $scope.$emit('labPrintDisabled', true);
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });

    };

    let oriServiceData = null;
    function prepareData(init = false) {
        // 處理資料
        // 統一項目名稱 -> 先不需要，有可能是介接進來就處理了
        // filter 功能
        let filters = searchOptions.filter(option => option !== '全部');
        if (filters.length > 0 && !checkSearchFilterAll()) {
            self.serviceData = oriServiceData.filter((item) => {
                return filters.indexOf(item.Name) > -1;
            });
        } else {
            self.serviceData = oriServiceData;
        }
        // 取資料到列印頁 $sessionStorage
        // 資料：self.serviceData, orderArray
        SessionStorageService.setItem('labexamTableData', {
            labData: angular.copy(self.serviceData),
            settingData: angular.copy(orderArray)
        });

        // 找出最大的SortNo，如果沒有，就給他0
        let maxOrderArraySortNo = _.maxBy(orderArray, 'SortNo') ? _.maxBy(orderArray, 'SortNo').SortNo : 0;
        let maxServiceDataSortNo = _.maxBy(self.serviceData, 'SortNo') ? _.maxBy(self.serviceData, 'SortNo').SortNo : 0;
        let maxSortNo = Math.max(maxOrderArraySortNo, maxServiceDataSortNo);
        console.log('最大 maxSortNo', maxSortNo);

        self.serviceData.map((item) => {

            // 先統一時間格式，方便後續的 groupBy
            item.CheckTime = moment(item.CheckTime).format('YYYY/MM/DD HH:mm');

            let idx = _.findIndex(orderArray, (o) => {
                // return o.regex.test(item.Name);
                return o.Name === item.Name;
            });

            // 未在後台設定裡
            if (idx > -1) {
                // item.Name = orderRegExArray[idx].showName;

                // 從後台拉 SettingGroup 群組名稱
                item.SettingGroup = orderArray[idx].SettingGroup;
                item.SortNo = orderArray[idx].SortNo || maxSortNo + 1;
            } else {
                item.SortNo = item.SortNo || maxSortNo + 1;
            }

            if (self.searchFilters.indexOf(item.Name) === -1) {
                self.searchFilters.push(item.Name);
            }
            return item;
        });

        // 預設全顯示
        if (init) {
            searchOptions = angular.copy(self.searchFilters);
        }

        console.log('regex lab', self.serviceData);

        // 組 columnDefs
        let columns = [
            { field: 'CheckTime', headerName: $translate('labexam.labexam.component.nameAndDate'), width: 140, pinned: 'left' }
        ].concat(_.map(_.groupBy(_.orderBy(self.serviceData, ['SortNo', 'SettingGroup']), 'SettingGroup'), (item, key) => {
            let headerName = key == 'null' ? '其他' : key;
            let result = {
                headerName,
                // headerGroupComponent: 'customHeaderGroupComponent',
                children: []
            };

            // 子項目順序，目前先前端處理，未來後台會多一個 SortNo 的欄位
            let keys = Object.keys(_.groupBy(_.orderBy(item, ['SortNo', 'Name']), 'Name'));

            _.forEach(keys, (o) => {
                result.children.push({
                    field: o,
                    headerName: o == 'null' ? '其他' : o,
                    // headerComponent: 'customHeaderGroupComponent',
                    // headerComponentParams: {
                    //     template: `
                    //     <div class="ag-cell-label-container" role="presentation">
                    //         <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                    //             <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                    //             <i class="material-icons" hm-tap="headerClicked()">info_outline</i>
                    //         </div>
                    //     </div>
                    //     `
                    // },
                    width: 100,
                    resizable: true,
                    cellClass: (params) => {
                        // 目前的 col 要等於 data 中有包含此 key 值的
                        return params.data.abnormalItems && params.data.abnormalItems.indexOf(params.colDef.field) > -1 ? 'isAbnormal' : '';
                    },
                    cellRenderer: cellRenderFunc
                });
            });
            return result;
        }));

        // $scope.gridOptions.columnDefs = columns;

        // 組 rows，需將同一時間的項目組在一起
        // 先倒序再 groupby
        let rows = _.groupBy(_.orderBy(self.serviceData, ['CheckTime'], ['desc']), 'CheckTime');
        rows = _.map(rows, (value, key) => {
            let results = {
                CheckTime: key,
                data: value,    // 原本同天的所有項目原始資料，提供 id
                abnormalItems: [] // 存異常的項目，供顯示判斷使用
            };

            _.forEach(value, (item) => {
                results[item.Name] = item.Value;
                if (item.Value != 0 && !item.Value) {
                    return;
                }
                // 確認是否異常
                if ((item.NormalDown && Number(item.NormalDown) > Number(item.Value)) || (item.NormalUpper && Number(item.NormalUpper) < Number(item.Value)) || item.IsNormal === false) {
                    item.isAbnormal = true;
                    results.abnormalItems.push(item.Name);
                }
            });

            return results;
        });

        console.log('lab rows', rows);

        $timeout(() => {
            $scope.gridOptions.api.setColumnDefs(columns);
            $scope.gridOptions.api.setRowData(rows);
        }, 0);
    }

    function getLabData(refresh) {
        const deferred = $q.defer();

        self.loading = true;
        // 看查詢條件是天數還是區間
        if (queryCondition.name === 'times') {
            labexamService
                .getByPatientId($stateParams.patientId, queryCondition.value, refresh)
                .then((q) => {

                    console.log('全部檢驗值 q', q);

                    // 所有檢驗檢查內容：排序與塞空值用
                    // showName：顯示在前端的字樣  upperName：全大寫比對用

                    // 檢驗檢查時間倒序排
                    self.serviceData = q.data.sort((a, b) => {
                        if (a.CheckTime < b.CheckTime) return 1;
                        return -1;
                    });

                    oriServiceData = angular.copy(self.serviceData);

                    // 先通知外層筆數
                    $scope.$emit('labDataLength', self.serviceData.length);
                    $scope.$emit('labLastAccessTime', labexamService.getLastAccessTime());
                    deferred.resolve();

                }).catch(() => {
                    deferred.reject();
                });
        } else {
            labexamService
                .getByPatientIdDuration($stateParams.patientId, moment(queryCondition.value.startDate).format('YYYYMMDD'), moment(queryCondition.value.endDate).format('YYYYMMDD'))
                .then((q) => {

                    console.log('全部檢驗值 q', q);

                    // 所有檢驗檢查內容：排序與塞空值用
                    // showName：顯示在前端的字樣  upperName：全大寫比對用

                    // 檢驗檢查時間倒序排
                    self.serviceData = q.data.sort((a, b) => {
                        if (a.CheckTime < b.CheckTime) return 1;
                        return -1;
                    });

                    oriServiceData = angular.copy(self.serviceData);

                    // 先通知外層筆數
                    $scope.$emit('labDataLength', self.serviceData.length);
                    $scope.$emit('labLastAccessTime', labexamService.getLastAccessTime());
                    deferred.resolve();

                }).catch(() => {
                    deferred.reject();
                });
        }


        return deferred.promise;
    }

    function getLabExamSetting() {
        const deferred = $q.defer();
        labexamSettingService.get().then((res) => {
            console.log('檢驗setting orderArray', res);
            orderArray = res.data;
            deferred.resolve();
        }).catch(() => {
            deferred.reject();
        });
        return deferred.promise;
    }

    // TODO filter 功能
    self.searchFilters = ['全部'];  //  再把所有檢驗項目帶進去
    let searchOptions = [];
    self.openMenu = function ($mdMenu, ev) {
        $mdMenu.open(ev);
    };
    // reload：是否要重新顯示值
    self.searchToggle = function (item, reload = true) {
        let idx = searchOptions.indexOf(item);

        if (idx > -1) {
            // 先確認是否為勾選 all 若為 all 則所有選項都要清除
            if (item === '全部') {
                // 預設要留一個條件
                searchOptions = [self.searchFilters[1]];
            } else {
                // TODO 一定要留一個條件，因此須先檢查條件是否已剩最後一個
                if (searchOptions.length === 1) {
                    return;
                }

                // 原本已存在在已選的清單裡則清除
                searchOptions.splice(idx, 1);
            }
        } else if (item === '全部') {
            // 先確認是否為勾選 all 若為 all 則所有選項都要新增
            searchOptions = angular.copy(self.searchFilters);
        } else {
            // 不存在則新增
            searchOptions.push(item);
        }

        // 判斷是否要勾全部
        if (checkSearchFilterAll()) {
            searchOptions.push('全部');
        } else {
            let allIdx = searchOptions.indexOf('全部');
            if (allIdx > -1) {
                searchOptions.splice(searchOptions.indexOf('全部'), 1);
            }
        }

        // criterial 變更後需重新搜尋
        if (reload) {
            prepareData();
        }

    };
    self.searchExists = function (item) {
        return searchOptions.indexOf(item) > -1;
    };
    function checkSearchFilterAll() {
        // 去除 all 選項
        return searchOptions.filter(option => option !== '全部').length === self.searchFilters.length - 1;
    }

    // 排序：檢查項目依照orderRegExArray的順序，依序排列
    function sortLabItem(rows, orderRegExArray) {
        let sorted = _.sortBy(rows, function (obj) {
            // 取得index位置
            let temp = _.findIndex(orderRegExArray, { upperName: obj.NameGroup });
            // 若不存在於orderRegExArray的檢查項目，一律都接在最後一個的後面
            return temp === -1 ? orderRegExArray.length : temp;
        });
        return sorted;
    }

}

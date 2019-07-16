import tpl from './prescriptionTabPage.html';
import './prescriptionTabPage.less';
import cellTpl from './prescriptionCell.html';

angular.module('app').component('prescriptionTabPage', {
    template: tpl,
    controller: prescriptionTabPageCtrl,
    bindings: {
        cardType: '<'   // 從 summary card view 中傳入
    }
});

prescriptionTabPageCtrl.$inject = ['prescriptionService', '$stateParams', '$state', '$mdDialog', '$timeout', 'showMessage', '$q', '$filter', '$scope', '$sessionStorage', 'i18nService', 'uiGridConstants', 'SettingService'];
function prescriptionTabPageCtrl(prescriptionService, $stateParams, $state, $mdDialog, $timeout, showMessage, $q, $filter, $scope, $sessionStorage, i18nService, uiGridConstants, SettingService) {
    console.log('enter prescriptionTabPage');
    const self = this;
    self.loginRole = SettingService.getCurrentUser().Role;
    let patientId = $stateParams.patientId;

    let $translate = $filter('translate');

    // self.deletedItemsLength = -1;
    self.serviceData = null;
    // items that are not deleted
    self.normalItems = [];
    self.loading = false;
    self.totalCnt = 0;
    let page = 1;
    let maxpage = 0;
    let limit = 50;
    const prescriptionType = ['HD', 'HDF', 'SLEDD-f', 'INTERIM'];

    console.log('self.cardType:', self.cardType);
    // 看是否是從 summary 頁來的
    if (self.cardType == null) {
        self.tag = $stateParams.tag || 'HD';
    } else {
        self.tag = prescriptionType[self.cardType];
    }

    // 監聽顯示已刪除功能
    $scope.$watch('showDeleted', () => {
        console.log('showDeleted change', $scope.showDeleted);
        // 切換是否包含已刪除的資料
        setDataByIsShowDeleted($scope.showDeleted);
    });

    $scope.$on('prescription-dataChanged', (event, type) => {
        // card 或是 type 為刪除(因為刪除在列表頁)的才需重新整理
        // null or undefined 表示不為 card
        if (self.cardType != null || type === 'del') {
            self.refresh();
        }
    });

    self.loadRecords = function loadRecords(isForce = false) {
        const q = $q.defer();
        self.loading = true;
        // 讀取該病人的所有處方
        // todo 未來需改為依月份, 否則資料一多, 會爆掉
        prescriptionService.getByPatientModeOrType(patientId, self.tag, page, limit, isForce).then(function (d) {
            console.log('所有處方 d', d);

            maxpage = parseInt(d.Total / limit) + 1; // 總頁數
            if (d.Total % limit === 0) {
                maxpage -= 1;
            }
            // 因為 detail 頁面為 child，回來此頁面不會再重新跑 onInit，因此一開始就須與prescriptionService 的暫存綁定，從 child 回來資料才會更新
            self.serviceData = d;

            // 切換是否包含已刪除的資料
            setDataByIsShowDeleted($scope.showDeleted);

            console.log('self.serviceData', self.serviceData);
            // 計算共有幾個Status為Normal，控制沒有data時的ui畫面
            countNormalItem();

            self.lastAccessTime = prescriptionService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
            q.resolve();
        }, () => {
            self.loading = false;
            self.isError = true;
            q.reject();
        });
        return q.promise;
    };

    self.$onInit = function () {

        // ui-grid init
        $scope.gridOptions = {
            enableColumnResizing: true,
            enableColumnMenus: false,   // https://stackoverflow.com/questions/32671202/remove-sorting-menu-from-ui-grid-column-header
            enableSorting: false,
            excessRows: 20,
            rowHeight: 70
        };

        // ui-grid header
        $scope.gridOptions.columnDefs = [
            {
                name: 'CreatedTime',
                displayName: $translate('allPrescriptions.prescriptionTabPage.Item'),
                minWidth: 110,
                pinnedLeft: true,
                cellTemplate: cellTpl
            },
            {
                name: 'BF',
                displayName: $translate('allPrescriptions.prescriptionTabPage.BF'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            {
                name: 'Duration',
                displayName: $translate('allPrescriptions.prescriptionTabPage.Duration'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            {
                name: 'Frequency',
                displayName: $translate('allPrescriptions.prescriptionTabPage.Frequency'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            {
                name: 'Dialysate',
                displayName: $translate('allPrescriptions.prescriptionTabPage.Dialysate'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            // {
            //     name: 'HCO3',
            //     displayName: $translate('allPrescriptions.prescriptionTabPage.HCO3'),
            //     minWidth: 110,
            //     cellTemplate: cellTpl
            // },
            {
                name: 'ArtificialKidney',
                displayName: $translate('allPrescriptions.prescriptionTabPage.ArtificialKidney'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            {
                name: 'DialysateTemperature',
                displayName: $translate('allPrescriptions.prescriptionTabPage.DialysateTemperature'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            {
                name: 'DialysateFlowRate',
                displayName: $translate('allPrescriptions.prescriptionTabPage.DialysateFlowRate'),
                minWidth: 110,
                cellTemplate: cellTpl
            },
            // {
            //     name: 'Needle',
            //     displayName: $translate('allPrescriptions.prescriptionTabPage.Needle'),
            //     minWidth: 110,
            //     cellTemplate: cellTpl
            // },
            {
                name: 'DialysisMode',
                displayName: $translate('allPrescriptions.prescriptionTabPage.DialysisMode'),
                minWidth: 110,
                cellTemplate: cellTpl
            }
        ];

        // infinite scroll 會push資料，因此每次進來需強迫重撈，否則會有資料重複的問題
        // 做暫存，因為detail頁面為 child，回這頁不會重新進 onInit
        self.loadRecords(true).then(() => {
            // do compare after records has been loaded
            compare();
        });
        console.log('目前的tag', self.tag);

        // 依照 type 決定要顯示 D.W or 脫水量
        if (self.tag === 'INTERIM') {
            $scope.gridOptions.columnDefs.splice(1, 0, {
                name: 'Dehydration',
                displayName: $translate('allPrescriptions.prescriptionTabPage.Dehydration'),
                minWidth: 110,
                cellTemplate: cellTpl
            });
            // 控制前端多國語系顯示
            self.tagStr = $translate('allPrescriptions.prescriptionTabPage.component.interim');
        } else {
            $scope.gridOptions.columnDefs.splice(1, 0, {
                name: 'StandardWeight',
                displayName: $translate('allPrescriptions.prescriptionTabPage.StandardWeight'),
                minWidth: 110,
                cellTemplate: cellTpl
            });
            // 控制前端多國語系顯示
            self.tagStr = self.tag;
        }

        // 只有醫生或管理員可以複製、刪除
        if ($scope.checkCanAccess({})) {
            $scope.gridOptions.columnDefs.push(
                {
                    // 複製 刪除
                    pinnedRight: true,
                    name: 'Status',
                    displayName: '',
                    minWidth: 70,
                    cellTemplate: cellTpl
                }
            );
        }
    };

    $scope.edit = function (id) {
        // 傳最後一筆同時狀態不為刪除者到新增頁
        let lastData = {};
        console.log('傳最後一筆', self.normalRecords[0]);
        if (self.normalRecords[0]) {
            lastData = self.normalRecords[0];
            $sessionStorage.lastDataObj = lastData;
        }
        $state.go('prescriptionDetail', { prescriptionId: id, tag: self.tag });
    };

    // 複製處方功能
    $scope.copy = function (data) {
        console.log('prescription copy', data);
        $sessionStorage.lastDataObj = angular.copy(data);
        $state.go('prescriptionDetail', { prescriptionId: 'add', tag: self.tag });
    };

    $scope.del = function (data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
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
                prescriptionService.del(data.Id).then((q) => {
                    showMessage($translate('allPrescriptions.prescriptionTabPage.component.deleteSuccess'));
                    // 計算共有幾個Status為Normal，控制沒有data時的ui畫面
                    data.Status = 'Deleted';
                    countNormalItem();
                    // if (q.status === 200) {
                    //     $state.go('allPrescriptions', null, { reload: true });
                    // }
                });
                mdDialog.hide(data);
            };
        }
    };

    // 確認權限是否能刪除
    $scope.checkCanAccess = function ({ createdUserId, modifiedId }) {
        return SettingService.checkAccessible({ createdUserId, name: 'prescription', modifiedId });
    };

    function compare() {
        console.log('compare!!!!!');
        // load all the records
        self.allItems = self.serviceData.Records;

        for (let i = 0; i < self.allItems.length; i++) {

            // find index of records with status 'Normal'
            if (self.allItems[i].Status === 'Normal') {

                self.allItems[i].index = i;
            }
            // give duration and needle empty object if it's null
            if (self.allItems[i].Duration === null) {
                self.allItems[i].Duration = { Hours: '', Minutes: '' };
            }
            if (self.allItems[i].Needle === null) {
                self.allItems[i].Needle = { ArteryLength: '', VeinLength: '' };
            }
            self.allItems[i].setColor = {};
        }

        // filter out all the 'Normal' records
        self.normalItems = _.filter(self.allItems, { 'Status': 'Normal' });

        // compare latest record with the previous record
        for (let i = 0; i < self.normalItems.length - 1; i++) {
            if (self.normalItems[i].StandardWeight !== self.normalItems[i + 1].StandardWeight) {
                self.allItems[self.normalItems[i].index].setColor.StandardWeight = true;
            }
            if (self.normalItems[i].Dehydration !== self.normalItems[i + 1].Dehydration) {
                self.allItems[self.normalItems[i].index].setColor.Dehydration = true;
            }
            if (self.normalItems[i].BF !== self.normalItems[i + 1].BF) {
                self.allItems[self.normalItems[i].index].setColor.BF = true;
            }
            if (self.normalItems[i].Duration.Hours !== self.normalItems[i + 1].Duration.Hours || self.normalItems[i].Duration.Minutes !== self.normalItems[i + 1].Duration.Minutes) {
                self.allItems[self.normalItems[i].index].setColor.Duration = true;
            }
            if (self.normalItems[i].Frequency !== self.normalItems[i + 1].Frequency) {
                self.allItems[self.normalItems[i].index].setColor.Frequency = true;
            }
            if (self.normalItems[i].Dialysate !== self.normalItems[i + 1].Dialysate) {
                self.allItems[self.normalItems[i].index].setColor.Dialysate = true;
            }
            // if (self.normalItems[i].HCO3 !== self.normalItems[i + 1].HCO3) {
            //     self.allItems[self.normalItems[i].index].setColor.HCO3 = true;
            // }
            if (self.normalItems[i].ArtificialKidney !== self.normalItems[i + 1].ArtificialKidney) {
                self.allItems[self.normalItems[i].index].setColor.ArtificialKidney = true;
            }
            if (self.normalItems[i].DialysateTemperature !== self.normalItems[i + 1].DialysateTemperature) {
                self.allItems[self.normalItems[i].index].setColor.DialysateTemperature = true;
            }
            if (self.normalItems[i].DialysateFlowRate !== self.normalItems[i + 1].DialysateFlowRate) {
                self.allItems[self.normalItems[i].index].setColor.DialysateFlowRate = true;
            }
            // if (self.normalItems[i].Needle.ArteryLength !== self.normalItems[i + 1].Needle.ArteryLength || self.normalItems[i].Needle.VeinLength !== self.normalItems[i + 1].Needle.VeinLength) {
            //     self.allItems[self.normalItems[i].index].setColor.Needle = true;
            // }
            if (self.normalItems[i].DialysisMode.Name !== self.normalItems[i + 1].DialysisMode.Name) {
                self.allItems[self.normalItems[i].index].setColor.DialysisMode = true;
            }

        }

    }

    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loading) {
            return;
        }
        self.loading = true;
        page += 1;
        if (page > maxpage) {
            self.loading = false;
            return;
        }
        // 呼叫取得NursingRecord的Service
        // prescriptionService.getByIdPage(patientId, page, limit).then(function (d) {
        prescriptionService.getByPatientModeOrType(patientId, self.tag, page, limit).then(function (d) {
            console.log(d);
            // 為了維持與 service 的暫存綁定，已於 service 端做完累加資料的動作
            self.serviceData = d;
            setDataByIsShowDeleted($scope.showDeleted);
            self.lastAccessTime = prescriptionService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // 置換是否要顯示已刪除的資料
    function setDataByIsShowDeleted(showDeleted) {
        if (!self.serviceData) {
            return;
        }

        if (showDeleted) {
            $scope.gridOptions.data = self.serviceData.Records;
            return;
        }

        $scope.gridOptions.data = _.filter(self.serviceData.Records, (o) => {
            return o.Status !== 'Deleted';
        });
    }

    // function _calculateDeletedItemLength() {
    //    return self.serviceData.filter((item) => {
    //        return item.Status === 'Deleted';
    //    }).length;
    // }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = null;
        $scope.gridOptions.data = null;

        self.loadRecords(true).then(() => {
            // do compare after records has been loaded
            compare();
        });
    };

    self.back = () => {
        history.go(-1);
    };

    self.gotoDetail = function (id) {
        // 傳最後一筆同時狀態不為刪除者到新增頁
        console.log('傳最後一筆', self.normalRecords[0]);
        console.log('id:', id);
        console.log('self.tag:', self.tag);
        // if (self.normalRecords[0]) {
        //     $sessionStorage.lastDataObj = angular.copy(self.normalRecords[0]);
        // }
        $state.go('prescriptionDetail', { prescriptionId: id, tag: self.tag });
    };

    // 計算共有幾個Status為Normal，控制沒有data時的ui畫面
    function countNormalItem() {
        self.normalRecords = [];

        if (self.serviceData) {
            self.normalRecords = _.filter(self.serviceData.Records, function (o) {
                return o.Status === 'Normal';
            });
        }
        self.normalRecordsLength = self.normalRecords.length;

        // TODO 若列表頁資料未回來就新增，ditto 會有問題 傳最後一筆同時狀態不為刪除者到新增頁
        // 為了在 summary 頁直接新增時也能 ditto，於此時機就把最後一筆資料帶入 session 中
        // if (self.normalRecords[0]) {
        //     $sessionStorage.lastDataObj = angular.copy(self.normalRecords[0]);
        //     console.log('$sessionStorage.lastDataObj', $sessionStorage.lastDataObj);
        // }
    }

}

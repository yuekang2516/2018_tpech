import list from './epoRecord.html';
import add from './epo.add.html';
import execute from './epo.execute.html';
import './epo.less';

angular.module('app').component('epoRecord', {
    template: list,
    controller: epoRecordCtrl,
    controllerAs: 'vm'
})
    .component('epoAdd', {
        template: add,
        controller: epoAddCtrl,
        controllerAs: 'vm'
    })
    .component('epoExecute', {
        template: execute,
        controller: epoExecuteCtrl,
        controllerAs: 'vm'
    });

// EPO 列表
epoRecordCtrl.$inject = ['epoExecutionService', '$stateParams', '$state', '$mdDialog', 'showMessage', '$interval', '$scope', '$timeout', '$filter'];

function epoRecordCtrl(epoExecutionService, $stateParams, $state, $mdDialog, showMessage, $interval, $scope, $timeout, $filter) {
    const vm = this;
    const statePatientId = $stateParams.patientId;
    const stateHeaderId = $stateParams.headerId;
    let vShowDate = null;

    let $translate = $filter('translate');

    vm.loading = true;
    vm.isError = false;
    vm.serviceData = null;
    vm.EPOs = null;

    vm.$onInit = function $onInit() {
        // 預設顯示當月的用藥資訊
        if ($stateParams.listDate.length > 0) {
            vShowDate = $stateParams.listDate;
        } else {
            vShowDate = moment();
        }
        // 依日期取得當月的資料
        vm.getList(vShowDate, false);
    };

    // 使用者按右上角重整按鈕時
    vm.refresh = function refresh() {
        vm.loading = true;
        vm.getList(vShowDate, true);
    };

    // 依日期取得當月的資料
    vm.getList = function getList(value, isForce) {
        epoExecutionService.getListByMonth(statePatientId, value, isForce).then((q) => {
            vm.serviceData = q.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
            vm.deletedItemsLength = _.filter(q.data, ['Status', 'Deleted']).length;
            vm.lastAccessTime = epoExecutionService.getLastAccessTime();
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });

        vm.showDate = moment(value).format('YYYY-MM');
        vm.previousMonthDate = moment(value).subtract(1, 'months').format('YYYY-MM');
    };

    vm.goback = function () {
        history.go(-1);
    };

    // 移至其他頁面，點選執行/不執行或新增/修改EPO
    vm.goto = function goto(type, id) {
        if (type !== null) {
            $state.go('epoExecute', {
                patientId: statePatientId,
                headerId: stateHeaderId,
                executionId: id,
                mode: type
            });
        } else {
            $state.go('epoAdd', {
                patientId: statePatientId,
                headerId: stateHeaderId,
                epoId: id
            });
        }
    };

    // 刪除
    vm.delete = function del(id) {
        const confirm = $mdDialog.confirm()
            .title($translate('epoRecord.epoRecord.component.confirmDelete'))
            .ok($translate('epoRecord.epoRecord.component.deleteOk'))
            .cancel($translate('epoRecord.epoRecord.component.deleteCancel'));

        $mdDialog.show(confirm).then(() => {
            vm.loading = true;
            epoExecutionService.delete(id)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('epoRecord.epoRecord.component.deleteSuccess'));
                        // 即時重讀未執行筆數
                        $scope.$emit('tabCount', { type: 'epo' });
                        // vm.getList(vShowDate);
                        vm.getList(vShowDate, true);
                    } else {
                        // showMessage('刪除失敗，原因:' + res.statusText);
                        showMessage($translate('epoRecord.epoRecord.component.deleteFail', { statusText: res.statusText }));
                    }
                });
        }, (cancel) => {
            // 關掉dialog
            // showMessage(res.statusText);
        });
    };

    // 用藥月份異動
    vm.changeDate = function changeDate(value) {
        if (value === 'prev') {
            vShowDate = moment(vShowDate).add(-1, 'M');
        } else {
            vShowDate = moment(vShowDate).add(1, 'M');
        }
        // vm.getList(showDate);
        $state.go('epo', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            listDate: moment(vShowDate).format('YYYY-MM-DD')
        }, {
                location: 'replace'
            });
    };
}

// 新增 EPO
epoAddCtrl.$inject = ['epoService', 'epoExecutionService', 'showMessage', '$stateParams', '$scope', '$q', '$filter', 'PatientService'];

function epoAddCtrl(epoService, epoExecutionService, showMessage, $stateParams, $scope, $q, $filter, PatientService) {
    const vm = this;
    vm.loading = true;
    vm.serviceData = null;
    vm.selectEPO = [];
    vm.EPO = {};
    vm.Withdraw = 1;
    vm.epoAddId = $stateParams.epoId;

    let $translate = $filter('translate');

    // 取出 EPO 藥品檔
    vm.$onInit = function $onInit() {
        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            vm.patient = res.data;
        });
        epoService.getList().then((q) => {
            vm.serviceData = q.data;
            vm.loading = false;
        }).then(() => {
            if (vm.epoAddId !== 'create') {
                epoExecutionService.getById(vm.epoAddId).then((q) => {
                    vm.EPO = q.data;
                    let data = _.find(vm.serviceData, { 'Id': vm.EPO.EPOId });
                    vm.selectEPO = data.Routes;
                });
            }
        });
    };

    // 藥品異動時，途徑跟著異動
    vm.changeEPO = function changeEPO() {
        if (vm.EPO.EPOId) {
            let data = _.find(vm.serviceData, { 'Id': vm.EPO.EPOId });
            vm.selectEPO = data.Routes;
            vm.EPO.EPOName = data.Name;
            vm.EPO.Quantity = data.Quantity;
            vm.EPO.QuantityUnit = data.QuantityUnit;
            vm.EPO.Dose = data.Dose;
            vm.EPO.DoseUnit = data.DoseUnit;
        } else {
            vm.selectEPO = [];
            vm.EPO = [];
        }
    };

    // 數量異動時，劑量跟著異動
    vm.changeQuantity = function changeQuantity() {
        // 判斷劑量是否有值，有的話要 * 數量
        let data = _.find(vm.serviceData, { 'Id': vm.EPO.EPOId });
        if (data.Dose) {
            let dose = data.Dose;
            vm.EPO.Dose = dose * vm.EPO.Quantity;
            vm.EPO.DoseUnit = data.DoseUnit;
        } else {
            vm.EPO.Dose = null;
            vm.EPO.DoseUnit = null;
        }
    };

    // 資料送出
    vm.isSaving = false;
    vm.submit = function submit() {
        vm.isSaving = true;
        // 將所需資料再套用去
        vm.EPO.PatientId = $stateParams.patientId;

        if (vm.epoAddId === 'create') {
            let failedCount = 0;
            let successCount = 0;
            let executeArray = [];

            // 組執行筆數
            for (let i = 0; i < vm.Withdraw; i++) {
                executeArray.push(epoExecutionService.post(vm.EPO).then(() => {
                    successCount++;
                }, () => {
                    failedCount++;
                })
                );
            }

            // 全部一起執行，執行完成後回傳訊息
            $q.all(executeArray)
                .then(() => {
                    // showMessage('新增成功 ' + successCount + ' 筆，失敗 ' + failedCount + ' 筆');
                    showMessage($translate('epoRecord.epoAdd.component.createSuccess', { count: successCount, failCnt: failedCount }));
                    vm.isSaving = false;
                    // 即時重讀未執行筆數(放著備用)
                    $scope.$emit('tabCount', { type: 'epo' });
                    vm.goback();
                });

        } else {
            epoExecutionService.put(vm.EPO).then(() => {
                showMessage($translate('epoRecord.epoAdd.component.editSuccess'));
                vm.isSaving = false;
                vm.goback();
            }, () => {
                showMessage($translate('epoRecord.epoAdd.component.editFail'));
                vm.isSaving = false;
            });
        }
    };

    // 回上頁
    vm.goback = function goback() {
        history.go(-1);
    };

    vm.plus = function plus() {
        vm.Withdraw += 1;
    };

    // 最小值 1
    vm.minus = function minus() {
        vm.Withdraw -= 1;
        if (vm.Withdraw < 1) {
            vm.Withdraw = 1;
        }
    };
}

// 執行 EPO
epoExecuteCtrl.$inject = ['epoExecutionService', '$stateParams', 'SettingService', 'showMessage', '$scope', '$filter', 'PatientService'];

function epoExecuteCtrl(epoExecutionService, $stateParams, SettingService, showMessage, $scope, $filter, PatientService) {
    const vm = this;
    const executeId = $stateParams.executionId;
    const currentUser = SettingService.getCurrentUser();

    let $translate = $filter('translate');

    vm.loading = true;
    vm.isError = false;
    vm.oMessage = {}; // 操作訊息
    vm.isModify = true; // 用來比對資料使用者是否可修改

    vm.$onInit = function $onInit() {
        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            vm.patient = res.data;
        });
        epoExecutionService.getById(executeId).then((q) => {
            vm.serviceData = q.data;
            vm.serviceData.IsExecute = $stateParams.mode === 'true';
            vm.checkCreatedTime = new Date(vm.serviceData.CreatedTime); // 比對執行時間用
            vm.loading = false;
            vm.isError = false;

            if (!vm.serviceData.ProcessTime) {
                vm.serviceData.ProcessTime = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
            } else {
                vm.serviceData.ProcessTime = new Date(moment(vm.serviceData.ProcessTime).format('YYYY-MM-DD HH:mm:ss'));
                vm.isModify = currentUser.Id === vm.serviceData.ProcessUserId;
            }

            // 當有數量時，將劑量寫至實際執行數量
            if (!vm.serviceData.ActualQuantity && vm.serviceData.IsExecute) {
                vm.serviceData.ActualQuantity = vm.serviceData.Quantity;
            }

            // 當有劑量時，將劑量寫至實際執行劑量
            if (!vm.serviceData.ActualDose && vm.serviceData.Dose && vm.serviceData.IsExecute) {
                vm.serviceData.ActualDose = vm.serviceData.Dose;
            }
        }, (reason) => {
            console.error(reason);
            vm.loading = false;
            vm.isError = true;
        });
    };

    // 計算劑量
    vm.CalculateDose = function CalculateDose() {
        if (vm.serviceData.Dose) {
            let dose = vm.serviceData.Dose / vm.serviceData.Quantity;
            vm.serviceData.ActualDose = vm.serviceData.ActualQuantity * dose;
        }
    };

    // 比對執行時間
    function compareProcessTime() {
        if (moment(resultTime).diff(self.checkCreatedTime) < 0) {
            // self.timeMessage = '請注意，執行時間比建立時間(' + moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') + ')早。';
            self.timeMessage = $translate('epoRecord.epoExecute.component.timeEarlier', { CreatedTime: moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') });
        } else if (moment(resultTime).diff(moment()) > 0) {
            self.timeMessage = $translate('epoRecord.epoExecute.component.timeLater');
        } else {
            self.timeMessage = '';
        }
    }

    // 當日期或時間有修改時
    let resultTime = {};
    self.dateChanged = function (date) {
        resultTime = moment(resultTime).year(moment(date).year()).month(moment(date).month()).date(moment(date).date());
        compareProcessTime();
    };
    self.timeChanged = function (time) {
        resultTime = moment(resultTime).hour(moment(time).hour()).minute(moment(time).minute());
        compareProcessTime();
    };

    // 送出
    vm.isSaving = false;
    vm.submit = function submit() {
        vm.isSaving = true;
        vm.serviceData.DialysisId = $stateParams.headerId;
        vm.serviceData.ProcessUserId = currentUser.Id;
        vm.serviceData.ProcessUserName = currentUser.Name;

        epoExecutionService.put(vm.serviceData).then((q) => {
            showMessage($translate('epoRecord.epoExecute.component.executeSuccess'));
            vm.isSaving = false;
            // 即時重讀未執行筆數(放著備用)
            $scope.$emit('tabCount', { type: 'epo' });
            vm.goback();
        }, () => {
            showMessage($translate('epoRecord.epoExecute.component.executeFail'));
            vm.isSaving = false;
        });
    };

    // 回上頁
    vm.goback = function goback() {
        history.go(-1);
    };
}

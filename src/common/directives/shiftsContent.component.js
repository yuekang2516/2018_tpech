import tpl from './shiftsContent.html';
import tpl2 from './shiftsTotalDialog.html';
import memoDialog from './shiftsMemoDialog.html';
import './shiftsContent.less';

angular.module('app').component('shiftsContent', {
    template: tpl,
    controller: shiftsContentController,
    bindings: {
        data: '='
    }
});

shiftsContentController.$inject = ['showMessage', 'shiftService', '$mdDialog', '$filter', '$mdMedia'];
function shiftsContentController(showMessage, shiftService, $mdDialog, $filter, $mdMedia) {
    const vm = this;
    let lastRepeatShift;    // 紀錄上次重複的 shift
    let editableData = {};  // 暫存目前編輯資料，供重設時使用
    vm.today = moment().format('YYYY-MM-DD');

    let $translate = $filter('translate');

    console.log('daysInMonth', vm.data);

    // let sun = $translate('shiftsContent.component.sun');
    let days = {
        '日': $translate('shifts.shiftsContent.component.sun'),
        '一': $translate('shifts.shiftsContent.component.mon'),
        '二': $translate('shifts.shiftsContent.component.tue'),
        '三': $translate('shifts.shiftsContent.component.wed'),
        '四': $translate('shifts.shiftsContent.component.thu'),
        '五': $translate('shifts.shiftsContent.component.fri'),
        '六': $translate('shifts.shiftsContent.component.sat'),
    };
    // debugger;
    vm.data.daysInMonth.forEach((day) => {
        day.Weekday = days[day.Weekday];
    });
    // debugger;

    // 根據權限決定初始畫面; 若非管理者，則自動將使用者那一欄變為編輯模式
    if (vm.data.currentUser.Access !== 99) {
        const index = _.findIndex(vm.data.employees, ['Id', vm.data.currentUser.Id]);
        if (!vm.data.isDashboard) {
            vm.data.employees[index].isEditable = true;
        }
        // 暫存目前編輯的 employee 相關資料
        setPreviousData(vm.data.employees[index]);
    }

    // 判斷此日期班次床位是否有重複，若有則跳提示並將值設回預設，框重複的那個欄位
    vm.checkShiftsRepeat = function checkShiftsRepeat(employee, currentShift, shiftOrBedGroup, oldValue) {
        // 檢查上次是否有重複的排班，並將 isRepeat 刪除
        clearLastRepeatShift();

        // 若目前設定的 shift 或 bedGroup 尚未選擇，則不需再比較
        if (!currentShift.Shifts[employee.Id].Shift || !currentShift.Shifts[employee.Id].BedGroup) {
            // 計算該員的班次總計
            if (shiftOrBedGroup === 'shift') {
                countShifts(employee, currentShift, oldValue);
            }
            return;
        }

        // 找尋其他 employee，並比對是否有重複排班
        let currentEmployee = currentShift.Shifts[employee.Id];
        let shiftKeys = Object.keys(currentShift.Shifts);

        // 移掉目前的員工 key (不須與自己比較)
        _.remove(shiftKeys, (k) => {
            return k === employee.Id;
        });

        for (let i = 0; i < shiftKeys.length; i++) {
            // 先比對 shift 再比 bedGroup
            if (currentShift.Shifts[shiftKeys[i]].Shift === currentEmployee.Shift) {
                // Todo 先比對 bedGroup
                if (currentShift.Shifts[shiftKeys[i]].BedGroup === currentEmployee.BedGroup) {
                    // 加一個 flag 讓重複的顯示不同的 class (紅色邊框)
                    currentShift.Shifts[shiftKeys[i]].isRepeat = true;
                    lastRepeatShift = currentShift.Shifts[shiftKeys[i]];     // 儲存目前 shift 以待下次進來時可將此 isRepeat flag 刪掉

                    // 將目前選擇回復之前的值
                    if (shiftOrBedGroup === 'shift') {
                        currentEmployee.Shift = oldValue;
                    } else {
                        currentEmployee.BedGroup = oldValue;
                    }
                    showMessage($translate('shiftsContent.duplicateShift'));
                }
            }
        }

        // 計算早中晚班次總計
        if (shiftOrBedGroup === 'shift') {
            countShifts(employee, currentShift, oldValue);
        }
    };

    // 儲存當下的資料，供重設的時候使用
    function setPreviousData(employee) {
        editableData = {
            employee: employee,
            oldCount: angular.copy(employee.Counts),   // 回復班次早中晚總計用
            daysInMonth: angular.copy(vm.data.daysInMonth)
        };
    }

    // 判斷是否要變為編輯模式
    vm.checkEditable = function (e) {
        if (vm.data.currentUser.Access === 99 || vm.data.currentUser.Id === e.Id) {
            // 檢查目前是否有其他正在編輯的，若有且已變動則跳出提示詢問是否要儲存
            let isDiff = false;
            if (editableData.employee && editableData.employee.isEditable) {
                // 檢查資料是否有變動
                for (let i = 0; i < vm.data.daysInMonth.length; i++) {
                    if (vm.data.daysInMonth[i].Shifts[editableData.employee.Id].BedGroup !== editableData.daysInMonth[i].Shifts[editableData.employee.Id].BedGroup || vm.data.daysInMonth[i].Shifts[editableData.employee.Id].Shift !== editableData.daysInMonth[i].Shifts[editableData.employee.Id].Shift
                        || vm.data.daysInMonth[i].Shifts[editableData.employee.Id].Memo !== editableData.daysInMonth[i].Shifts[editableData.employee.Id].Memo) {
                        isDiff = true;
                        break;
                    }
                }
                if (isDiff) {
                    // 跳出提示:有變動未儲存是否仍要繼續
                    const confirm = $mdDialog.confirm()
                        .title($translate('shiftsContent.unsaved'))
                        .textContent($translate('shiftsContent.confirmUnsaved'))
                        .ok($translate('shiftsContent.dontSave'))
                        .cancel($translate('shiftsContent.saveCancel'));

                    $mdDialog.show(confirm).then(() => {
                        e.isEditable = true;
                        editableData.employee.isEditable = false;
                        vm.reset();
                        // 暫存目前編輯的 employee 相關資料
                        setPreviousData(e);
                    }, () => {
                        // 取消
                        return false;
                    });
                } else {
                    e.isEditable = true;
                    editableData.employee.isEditable = false;
                    // 暫存目前編輯的 employee 相關資料
                    setPreviousData(e);
                }
            } else {
                e.isEditable = true;
                // 暫存目前編輯的 employee 相關資料
                setPreviousData(e);
            }

        } else {
            e.isEditable = false;
        }
    };

    vm.save = function (emplyeeId) {
        vm.data.loading = true;

        let shifts = [];    // 欲上傳的 data
        // 取得目前使用者的 shift
        _.forEach(vm.data.daysInMonth, (day) => {
            _.forEach(day.Shifts, (shift, key) => {
                if (key === emplyeeId) {
                    shifts.push(shift);
                }
            });
        });

        shiftService.postWithMode('single', shifts).then((res) => {
            if (res.data) {
                // 塞入後臺產生的 Id，以供判斷資料為新增還是修改
                shifts = res.data;

                if (vm.data.currentUser.Access === 99) {
                    // (管理者權限 only) 將 isEditable 標記移除，並將暫存編輯中的資料清除
                    delete editableData.employee.isEditable;
                    editableData = {};
                } else {
                    // 一般使用者: 需暫存儲存後的資料，供下次重設使用
                    editableData.oldCount = angular.copy(editableData.employee.Counts);
                    editableData.daysInMonth = angular.copy(vm.data.daysInMonth);
                }
            }
            vm.data.loading = false;
            showMessage($translate('shiftsContent.saveSuccess'));
        }, () => {
            vm.data.loading = false;
            showMessage($translate('shiftsContent.saveFail'));
        });
    };

    vm.reset = function (emplyeeId) {
        vm.data.daysInMonth = angular.copy(editableData.daysInMonth);

        // 回復早中晚總計
        editableData.employee.Counts = angular.copy(editableData.oldCount);
    };

    // open dialog for each memo
    vm.showMemoPerDay = function (day, id, editable) {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template: memoDialog,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false, // !$mdMedia('gt-sm'),
            controllerAs: 'vm'
        });

        function showDialogController(mdDialog) {
            const self = this;
            console.log('day.Shifts', day);
            self.day = day;
            self.editable = editable;
            // self.day.memo = 'test';
            self.memo = day.Shifts[id].Memo;

            // self.shiftOptions = vm.data.shiftOptions;
            // console.log('data', vm.data);
            // console.log('day', self.day);
            // console.log('id', id);
            // console.log('self.editable', editable);

            self.cancel = function cancel() {
                $mdDialog.cancel();
            };

            // save function of the dialog
            self.ok = function ok() {
                // console.log('asdfkjklajskdlfslf');
                day.Shifts[id].Memo = self.memo;
                mdDialog.hide();
                // console.log('vm.memo', self.memo);
            };

        }
    };

    // 顯示該天的總計
    vm.showTotalPerDay = function (day) {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template: tpl2,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function showDialogController() {
            const self = this;
            self.day = day;
            self.shiftOptions = vm.data.shiftOptions;

            self.cancel = function cancel() {
                $mdDialog.cancel();
            };

        }
    };

    // 顯示該員工當月的總計
    vm.showTotalPerEmployee = function (employee) {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template: tpl2,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function showDialogController() {
            const self = this;
            self.employee = employee;
            self.shiftOptions = vm.data.shiftOptions;
            self.month = vm.data.daysInMonth[0].format('MM');
            self.cancel = function cancel() {
                $mdDialog.cancel();
            };

        }
    };

    // 計算早中晚班次總計
    function countShifts(e, currentShift, oldValue) {
        // 若使用者變更班次則須依照舊值將總計扣除
        if (oldValue) {
            e.Counts[oldValue]--;
            currentShift.Counts[oldValue]--;
        }

        e.Counts[currentShift.Shifts[e.Id].Shift]++;
        currentShift.Counts[currentShift.Shifts[e.Id].Shift]++;
    }

    // 檢查上次是否有重複的排班，並將 isRepeat 刪除
    function clearLastRepeatShift() {
        if (lastRepeatShift) {
            delete lastRepeatShift.isRepeat;
            lastRepeatShift = null;
        }
    }
}

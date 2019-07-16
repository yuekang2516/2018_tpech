import tpl from './shifts.html';
import './shifts.less';

angular.module('app').component('shifts', {
    template: tpl,
    controller: shiftsCtrl
});

shiftsCtrl.$inject = ['WardService', 'SettingService', 'userService', 'shiftService', 'showMessage', '$timeout', '$mdDialog', 'infoService', '$filter'];

function shiftsCtrl(WardService, SettingService, userService, shiftService, showMessage, $timeout, $mdDialog, infoService, $filter) {
    const vm = this;

    vm.data = {};   // for shifts-content data
    let currentDate;    // 目前時間

    let $translate = $filter('translate');

    // 員工資料
    vm.data.employees = [];

    vm.data.shifts = [];

    // 畫於 calendar 並紀錄資料的 moment
    vm.data.daysInMonth = [];

    vm.$onInit = function () {
        vm.data.currentUser = SettingService.getCurrentUser();
        // 只顯示目前登入者負責的透析室
        // for 系統一開始尚未有病床時的例外狀況
        if (!SettingService.getCurrentUser().Ward) {
            showMessage($translate('shifts.component.addWardMessage'));
            return;
        }
        vm.data.wards = vm.data.currentUser.Ward;
        vm.data.keys = Object.keys(vm.data.wards);
        vm.data.ward = vm.data.keys[0];

        // 取得目前透析室的病床組別
        currentDate = moment();
        vm.data.currentMonth = currentDate.format('MM');
        vm.data.currentYear = currentDate.format('YYYY');
        vm.changeWard(vm.data.ward);
    };

    // 取得當月的天數，並準備資料
    function getDaysInMonth() {
        vm.data.loading = true;
        let firstDateInMonth = moment(currentDate.format('YYYY-MM-01'));
        // 取得所有排班資料 Todo 依透析室及日期取得
        shiftService.getByWardIdAndMonth(vm.data.ward, currentDate.format('YYYY'), currentDate.format('MM')).then((res) => {
            vm.data.shifts = res.data;
            vm.data.daysInMonth = [];
            // 依目前月份塞入對應的天數
            for (let i = 0; i < currentDate.daysInMonth(); i++) {
                if (i === 0) {
                    vm.data.daysInMonth.push(moment(firstDateInMonth));
                } else {
                    vm.data.daysInMonth.push(moment(firstDateInMonth.add(1, 'd')));
                }

                // 依後台班別產生 Counts 的子欄位
                vm.data.daysInMonth[i].Counts = {};
                _.forEach(vm.data.shiftOptions, (s) => {
                    vm.data.daysInMonth[i].Counts[s] = 0;
                });

                // 供前端顯示星期幾
                switch (vm.data.daysInMonth[i].isoWeekday()) {
                    case 1:
                        vm.data.daysInMonth[i].Weekday = '一';
                        break;
                    case 2:
                        vm.data.daysInMonth[i].Weekday = '二';
                        break;
                    case 3:
                        vm.data.daysInMonth[i].Weekday = '三';
                        break;
                    case 4:
                        vm.data.daysInMonth[i].Weekday = '四';
                        break;
                    case 5:
                        vm.data.daysInMonth[i].Weekday = '五';
                        break;
                    case 6:
                        vm.data.daysInMonth[i].Weekday = '六';
                        break;
                    default: // 日
                        vm.data.daysInMonth[i].Weekday = '日';
                        break;

                }
                vm.data.daysInMonth[i].Shifts = {};  // 存這天的所有排班資訊，以 員工 Id 當作 key

                // 查詢資料裡是否有這天的排班，若有，則塞入此天的排班資訊
                _.forEach(vm.data.employees, (e) => {
                    // 於第一次將 employee Counts 歸零
                    // 依後台班別產生 Counts 的子欄位
                    if (i === 0) {
                        e.Counts = {};
                        _.forEach(vm.data.shiftOptions, (s) => {
                            e.Counts[s] = 0;
                        });
                    }

                    // 以 employee id 為 key
                    vm.data.daysInMonth[i].Shifts[e.Id] = {
                        AssignDate: moment(vm.data.daysInMonth[i]),
                        Shift: '',
                        UserId: e.Id,
                        UserName: e.Name,
                        WardId: vm.data.ward,
                        BedGroup: ''
                    };
                    let data = _.find(vm.data.shifts, (shift) => {
                        return moment(shift.AssignDate).format('YYYY-MM-DD') === vm.data.daysInMonth[i].format('YYYY-MM-DD') && e.Id === shift.UserId;
                    });
                    if (data) {
                        vm.data.daysInMonth[i].Shifts[e.Id] = data;
                        // 計算所有班別總計
                        countShifts(e, vm.data.daysInMonth[i]);
                    }
                });
            }
        }, () => {
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        }).finally(() => {
            // 等一下讓畫面畫，再讓畫面顯示
            $timeout(() => {
                vm.data.loading = false;
            }, 500);
        });
    }

    // 計算所有班別總計
    function countShifts(e, currentShift, oldValue) {
        // 若使用者變更班次則須依照舊值將總計扣除
        if (oldValue) {
            e.Counts[oldValue]--;
            currentShift.Counts[oldValue]--;
        }

        e.Counts[currentShift.Shifts[e.Id].Shift]++;
        currentShift.Counts[currentShift.Shifts[e.Id].Shift]++;
    }

    vm.nextMonth = function () {
        currentDate = currentDate.add(1, 'M');
        vm.data.currentMonth = currentDate.format('MM');
        if (vm.data.currentMonth === '01') {
            vm.data.currentYear = currentDate.format('YYYY');
        }
        getDaysInMonth();
    };

    vm.lastMonth = function () {
        currentDate = currentDate.add(-1, 'M');
        vm.data.currentMonth = currentDate.format('MM');
        // 若跨年，年份也須更改
        if (vm.data.currentMonth === '12') {
            vm.data.currentYear = currentDate.format('YYYY');
        }
        getDaysInMonth();
    };

    vm.today = function () {
        currentDate = moment();
        vm.data.currentMonth = currentDate.format('MM');
        vm.data.currentYear = currentDate.format('YYYY');
        getDaysInMonth();
    };

    // 選擇其他透析室時重新讀取病床組別清單
    vm.changeWard = function changeWard(ward) {
        vm.data.loading = true;
        vm.data.daysInMonth = [];
        // Todo 依透析室取得負責員工
        userService.getByWardId(vm.data.ward).then((res) => {
            if (res.data) {
                // 員工以姓名排序
                vm.data.employees = res.data.sort((a, b) => {
                    if (a.Name > b.Name) return 1;
                    return -1;
                });
            }

            // 員工總計歸零
            _.forEach(vm.data.employees, (e) => {
                _.forEach(e.Counts, (key, value) => {
                    value = 0;
                });
            });
            return infoService.get();   // 取得後臺班別 班組選項
        }).then((res) => {
            if (res.data) {
                if (res.data.DefinitionSetting && res.data.DefinitionSetting.Records.Categories.Shifts) {
                    vm.data.shiftOptions = res.data.DefinitionSetting.Records.Categories.Shifts;
                    vm.data.bedGroups = res.data.DefinitionSetting.Records.Categories.ShiftGroups;
                }
            }
            getDaysInMonth();
        })
            .catch(() => {
                vm.data.loading = false;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
    };

    // Todo 排班複製目前顯示的月份至下個月
    vm.cloneShifts = function () {
        let mode;
        let shiftsToCopy = [];  // 儲存欲上傳的排班資料
        let nextMonth = moment(vm.data.shifts[0].AssignDate).add(1, 'months').format('MM');

        let content = ''; // 對話框的內容
        if (vm.data.currentUser.Access !== 99) {
            mode = 'single';
            // content = '您即將複製排班，按下確認後會將您 ' + vm.data.currentMonth + ' 月的排班資料複製至 ' + nextMonth + ' 月';
            content = $translate('shifts.component.copySingle', { currentMonth: vm.data.currentMonth, next: nextMonth });
        } else {
            mode = 'all';
            // content = '您即將複製排班，按下確認後將會依目前員工清單將每人 ' + vm.data.currentMonth + ' 月的排班資料複製至 ' + nextMonth + ' 月';
            content = $translate('shifts.component.copyAll', { currentMonth: vm.data.currentMonth, next: nextMonth });
        }

        // 設定對話視窗參數
        const confirm = $mdDialog.confirm()
            .title($translate('shifts.component.confirmCopy'))
            .textContent(content)
            .ariaLabel('clone confirm')
            .ok($translate('shifts.component.copyOk'))
            .cancel($translate('shifts.component.copyCancel'));

        // 呼叫確認對話視窗
        $mdDialog.show(confirm).then(() => {
            vm.data.loading = true;
            // 區分權限
            let shiftsCopy = angular.copy(vm.data.shifts);  // 用原本資料的複本，避免若上傳失敗，原本的資料也變動了
            _.forEach(shiftsCopy, (shift) => {
                // 個人
                if (mode === 'single') {
                    if (vm.data.currentUser.Id === shift.UserId) {
                        shift.AssignDate = moment(shift.AssignDate).add(28, 'd');
                        // 判斷是否為下個月，若是才新增
                        if (shift.AssignDate.format('MM') === nextMonth) {
                            shiftsToCopy.push(
                                {
                                    AssignDate: shift.AssignDate,
                                    Shift: shift.Shift,
                                    UserId: shift.UserId,
                                    UserName: shift.UserName,
                                    WardId: shift.WardId,
                                    BedGroup: shift.BedGroup
                                }
                            );
                        }
                    }
                } else {
                    // 管理者
                    shift.AssignDate = moment(shift.AssignDate).add(28, 'd');
                    // 判斷是否為下個月，若是才新增
                    if (shift.AssignDate.format('MM') === nextMonth) {
                        shiftsToCopy.push(
                            {
                                AssignDate: shift.AssignDate,
                                Shift: shift.Shift,
                                UserId: shift.UserId,
                                UserName: shift.UserName,
                                WardId: shift.WardId,
                                BedGroup: shift.BedGroup
                            }
                        );
                    }
                }
            });

            shiftService.postWithMode(mode, shiftsToCopy).then((res) => {
                if (res.data) {
                    // 自動至下個月
                    vm.nextMonth();
                }
                showMessage($translate('shifts.component.copySuccess'));
            }, () => {
                vm.data.loading = false;
                showMessage($translate('shifts.component.copyFail'));
            });
        }, () => {
            vm.data.loading = false;
        });

    };

    vm.back = function back() {
        history.go(-1);
    };
}

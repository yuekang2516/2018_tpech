import tpl from './shiftsBoard.html';
import './shiftsBoard.less';

angular.module('app').component('shiftsBoard', {
    template: tpl,
    controller: shiftsBoardCtrl
});

shiftsBoardCtrl.$inject = ['$scope', '$window', 'WardService', 'infoService', 'SettingService', 'userService', 'shiftService', 'showMessage', '$timeout', '$mdDialog', '$stateParams', '$interval', '$filter'];

function shiftsBoardCtrl($scope, $window, WardService, infoService, SettingService, userService, shiftService, showMessage, $timeout, $mdDialog, $stateParams, $interval, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    vm.data = {};
    vm.data.isDashboard = true;
    vm.language = SettingService.getLanguage();

    let currentDate;    // 目前時間

    // 每五分鐘更新一次資料，確保為最新的
    const interval = $interval(refresh, 300000);

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
            showMessage('尚未添加負責透析室，請至後台新增');
            return;
        }
        vm.data.ward = $stateParams.wardId;

        // 取得目前透析室的病床組別
        currentDate = moment();
        vm.data.currentMonth = currentDate.format('MM');
        vm.data.currentYear = currentDate.format('YYYY');
        changeWard(vm.data.ward);
    };

    vm.$onDestroy = function () {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };

    // $window.addEventListener('resize', onResize);
    // function onResize() {
    //     // readonly div width resize
    //     $('#cover').width($('#shifts').width());
    // }

    // 取得當月的天數，並準備資料
    // 參數 hideLoading ，每五分鐘的自動更新不顯示 loading 畫面
    function getDaysInMonth(hideLoading = false) {
        if (!hideLoading) {
            vm.data.loading = true;
        }
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
            vm.serverErr = false;
            // 發出消息，供主頁顯示目前更新時間
            $scope.$emit('lastAccessTime', { time: moment() });
        }, () => {
            vm.serverErr = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        }).finally(() => {
            // 等一下讓畫面畫，再讓畫面顯示
            $timeout(() => {
                vm.data.loading = false;
                // $('#cover').width($('#shifts').width());
            }, 500);
        });
    }

    // 計算該員的班次總計
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
    function changeWard(ward) {
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
            vm.serverErr = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    function refresh() {
        // 通知 dashboard 更新門診住院人數
        $scope.$emit('refresh');

        getDaysInMonth(true);
    }
}

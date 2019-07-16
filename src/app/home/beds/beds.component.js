import tpl from './beds.html';
import './beds.less';

angular.module('app').component('beds', {
    template: tpl,
    controller: BedsController,
    controllerAs: 'vm'
});

BedsController.$inject = ['$scope', '$document', '$mdSidenav', '$state', 'PatientService', 'bedService', 'wardService', 'SettingService', 'showMessage', '$filter'];

function BedsController($scope, $document, $mdSidenav, $state, PatientService, bedService, wardService, SettingService, showMessage, $filter) {
    const vm = this;
    const $translate = $filter('translate');
    vm.isBrowser = cordova.platformId === 'browser';
    vm.shifts = bedService.getShifts();
    const ARRANGEBEDWARD = SettingService.getUISettingParams().ARRANGEBEDWARD;
    const TODAYBED = SettingService.getUISettingParams().TODAYBED;
    // const SHOWDAYOFF = SettingService.getUISettingParams().SHOWDAYOFF;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.$onInit = function onInit() {
        vm.data = {};
        vm.data.currentDate = new Date();
        // 取得床位列表
        // 1. 先取得使用者的透析室列表,
        // 2. 依透析室ID取得病床

        // 若為 admin(系統初始時的帳號) 一開始不會有透析室
        if (!SettingService.getCurrentUser().Ward) {
            showMessage($translate('beds.component.addWardMessage'));
            return;
        }

        vm.data.wards = SettingService.getCurrentUser().Ward;
        vm.data.wardKeys = Object.keys(vm.data.wards);

        // 從 service 撈之前使用者選擇的參數
        vm.data.options = {
            ward: SettingService.getUISettingByKey(ARRANGEBEDWARD) || vm.data.wardKeys[0],
            shift: SettingService.getUISettingByKey(TODAYBED) || 'all'
        };
        // vm.showDayoff = SettingService.getUISettingByKey(SHOWDAYOFF);

        vm.changeWard();
    };

    vm.openLeftMenu = function openLeftMenu() {
        $mdSidenav('left').toggle();
    };

    vm.toggleSideNav = function () {
        SettingService.setSideNavStatus(SettingService.getCurrentUser().Id, !SettingService.getSideNavStatus(SettingService.getCurrentUser().Id));
        // emit to parent
        $scope.$emit('toggleNav');
    };

    // 日期變更後，重新讀取當日床位
    vm.changeDate = function (num) {
        vm.data.currentDate = new Date(moment(vm.data.currentDate).add(num, 'd'));
        loadBeds();
        $scope.$broadcast('removeText');
    };

    // vm.changeShowDayoff = function () {
    //     SettingService.setUISetting({ name: SHOWDAYOFF, value: vm.showDayoff });
    // };

    vm.changeWard = function changeWard() {
        // 讀取病床資料
        $scope.$broadcast('removeText');
        vm.data.loadingBeds = true;

        SettingService.setUISetting({ name: ARRANGEBEDWARD, value: vm.data.options.ward });
        // 讀取該透析室中所有的床位
        wardService.getById(vm.data.options.ward).then((response) => {
            vm.data.beds = [];
            vm.data.bedNo = [];

            // 取得此透析室的所有床號
            _.forEach(response.data.BedNos, (bed) => {
                //查群組名
                let groupName = "";
                _.forEach(response.data.BedGroups, (group) => {
                    _.forEach(group.BedNos, (bedno) => {
                        if (bedno === bed) {
                            groupName = group.Name;
                        }
                    });
                });
                vm.data.bedNo.push(bed);
                vm.data.beds.push({
                    Name: bed,
                    Group: groupName
                });
            });

            // 床號排序，先照後台設定順序
            // vm.data.bedNo.sort();

            loadBeds();
        }, () => {
            vm.data.loadingBeds = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    vm.changeShift = function () {
        console.log('changeShift');
        SettingService.setUISetting({ name: TODAYBED, value: vm.data.options.shift });
    };

    vm.print = function () {
        setTimeout(() => {
            window.print();
        }, 500);
    };

    function loadBeds() {
        // 讀取病床資料
        vm.data.loadingBeds = true;

        // 將床號未在後台設定裡的刪除
        _.remove(vm.data.beds, (b) => {
            return b.NotInSetting;
        });

        // 初始化 vm.beds 的早午晚病人
        _.forEach(vm.data.beds, (bed) => {
            _.forEach(vm.shifts, (shift) => {
                if (bed[shift] != null) {
                    bed[shift] = null;
                }
            });
        });

        bedService.getAssignBedByDateAndWard(moment(vm.data.currentDate).format('YYYYMMDD'), vm.data.options.ward).then((res) => {
            let assignedBeds = angular.copy(res.data);
            console.log('bed', assignedBeds);

            // let now = new Date();
            // let sdate = new Date()
            // 跑迴圈填床位早中晚病人
            _.forEach(vm.data.beds, (bed) => {
                // 可能會有兩筆，一般或請假
                let results = _.filter(assignedBeds, (patient) => {
                    return bed.Name === patient.BedNo;
                });

                if (results.length > 0) {
                    results.forEach((result) => {
                        let now = new Date();

                        // vm.day = day;
                        // console.log('day', day);
                        // 確認已有欄位
                        if (!bed[result.Shift]) {
                            bed[result.Shift] = {
                                Assign: null,
                                Dayoff: null
                            };
                        }

                        if (result.Type !== 'dayoff') {
                            bed[result.Shift].Assign = result;
                            // 算重大傷病卡距離幾天到期
                            if (result.EndDate1 != null) {
                                let day = moment(result.EndDate1).diff(moment(), 'day');
                                bed[result.Shift].TimeGap1 = day;
                            }
                            if (result.EndDate2 != null) {
                                let day = moment(result.EndDate2).diff(moment(), 'day');
                                bed[result.Shift].TimeGap2 = day;
                            }

                        } else {
                            // 請假的資料
                            bed[result.Shift].Dayoff = result;
                            // 算重大傷病卡距離幾天到期
                            if (result.EndDate1 != null) {
                                let day = moment(result.EndDate1).diff(moment(), 'day');
                                bed[result.Shift].day1 = day;
                            }
                            if (result.EndDate2 != null) {
                                let day = moment(result.EndDate2).diff(moment(), 'day');
                                bed[result.Shift].day2 = day;
                            }
                        }
                        // 將已塞的資料從 assignBed 移除
                        assignedBeds.splice(assignedBeds.findIndex(e => e == result), 1);

                    });
                }

            });

            // 塞完後若仍有資料，需另外處理
            if (assignedBeds) {
                assignedBeds = _.groupBy(assignedBeds, (a) => { return a.BedNo; });
                _.forEach(assignedBeds, (a) => {
                    vm.data.beds.push({
                        Name: a[0].BedNo,
                        NotInSetting: true  // 標記未在後台設定裡
                    });

                    _.forEach(a, (assigned) => {
                        vm.data.beds[vm.data.beds.length - 1][assigned.Shift] = assigned;
                        console.log('concat vm bed', assigned, vm.data.beds[vm.data.beds.length - 1][assigned.Shift]);
                    });
                });

                console.log('concat vm bed', vm.beds);
            }

            vm.data.loadingBeds = false;
            vm.isError = false;
        }, () => {
            vm.data.loadingBeds = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }


    vm.refresh = function () {
        vm.changeWard();
    };
}

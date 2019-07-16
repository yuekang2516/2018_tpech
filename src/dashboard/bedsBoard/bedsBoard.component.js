import tpl from './bedsBoard.html';
import './bedsBoard.less';

angular.module('app').component('bedsBoard', {
    template: tpl,
    controller: bedsBoardCtrl,
    controllerAs: 'vm'
});

bedsBoardCtrl.$inject = ['$scope', '$mdSidenav', '$state', 'PatientService', 'bedService', 'wardService', 'SettingService', 'showMessage', '$stateParams', '$interval', '$filter'];

function bedsBoardCtrl($scope, $mdSidenav, $state, PatientService, bedService, wardService, SettingService, showMessage, $stateParams, $interval, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    // 每五分鐘更新一次資料，確保為最新的
    const interval = $interval(refresh, 300000);

    vm.$onInit = function () {
        vm.data = {};
        vm.data.currentDate = moment();

        vm.data.options = {
            ward: $stateParams.wardId,
            shift: 'all'
        };

        changeWard();
    };

    vm.$onDestroy = function () {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };

    // 日期變更後，重新讀取當日床位
    vm.changeDate = function (num) {
        $scope.$broadcast('removeText');
        if (num === 0) {
            // 今日
            vm.data.currentDate = moment();
        } else {
            vm.data.currentDate = moment(vm.data.currentDate).add(num, 'd');
        }
        loadBeds();
    };

    function changeWard() {
        // 讀取病床資料
        vm.data.loadingBeds = true;

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

            // 床號排序，依後台設定順序
            // vm.data.bedNo.sort();

            loadBeds();
        }, () => {
            vm.data.loadingBeds = false;
            vm.serverErr = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    // hideLoading: 每五分鐘的自動更新不須顯示 loading 畫面
    function loadBeds(hideLoading = false) {
        // 讀取病床資料
        if (!hideLoading) {
            vm.data.loadingBeds = true;
        }

        // 將床號未在後台設定裡的刪除
        _.remove(vm.data.beds, (b) => {
            return b.NotInSetting;
        });

        // 初始化 vm.beds 的早午晚病人
        // 初始化 vm.beds 的早午晚病人
        _.forEach(vm.data.beds, (bed) => {
            _.forEach(vm.shifts, (shift) => {
                if (bed[shift] != null) {
                    bed[shift] = null;
                }
            });
        });

        bedService.getAssignBedByDateAndWard(vm.data.currentDate.format('YYYYMMDD'), vm.data.options.ward).then((res) => {
            let assignedBeds = angular.copy(res.data);

            // 跑迴圈填床位早中晚病人
            _.forEach(vm.data.beds, (bed) => {
                // 可能會有兩筆，一般或請假
                let results = _.filter(assignedBeds, (patient) => {
                    return bed.Name === patient.BedNo;
                });

                if (results.length > 0) {
                    results.forEach((result) => {
                        // 處理姓名馬賽克
                        result.PatientName = PatientService.getMaskName(result.PatientName);

                        let now = new Date();
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
                                bed[result.Shift].TimeGap1 = day;
                            }
                            if (result.EndDate2 != null) {
                                let day = moment(result.EndDate2).diff(moment(), 'day');
                                bed[result.Shift].TimeGap2 = day;
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
                    });
                });

                console.log('concat vm bed', vm.beds);
            }

            vm.data.loadingBeds = false;
            vm.serverErr = false;
            // for 電子白板發出消息，供主頁顯示目前更新時間
            $scope.$emit('lastAccessTime', { time: moment() });
        }, () => {
            vm.data.loadingBeds = false;
            vm.serverErr = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    function refresh() {
        // 通知 dashboard 更新門診住院人數
        $scope.$emit('refresh');

        loadBeds(true);
    }
}


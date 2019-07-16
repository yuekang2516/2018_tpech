import tpl from './dashboard.html';
import './dashboard.less';

angular.module('app').component('dashboard', {
    template: tpl,
    controller: dashboardCtrl
});

dashboardCtrl.$inject = ['$scope', '$state', '$interval', 'SettingService', '$timeout', '$stateParams', 'PatientService', 'dashboardService', '$filter', '$rootScope', '$mdDialog'];

function dashboardCtrl($scope, $state, $interval, SettingService, $timeout, $stateParams, PatientService, dashboardService, $filter, $rootScope, $mdDialog) {
    const vm = this;
    const UserInfo = SettingService.getCurrentUser();
    const interval = $interval(updateClock, 1000);
    vm.language = SettingService.getLanguage();
    let $translate = $filter('translate');

    // 更新門診 住院人數
    $scope.$on('refresh', (event) => {
        console.info('refresh');
        countInPatientAndOutPatient();
    });

    // signalR
    $scope.$on('dashboardConnected', () => {
        console.log('dashboardConnected connected');
        $timeout(() => {
            getBed();
            vm.message = '';
        });
    });

    // 每分鐘更新最後更新時間距離現在的時間
    const refreshInterval = $interval(calculateRefreshTime, 60000);
    let lastAccessTime;

    // vm.currentWard = '';   // 目前透析室的 key
    // vm.CurrentWardName = ''; // 目前顯示的透析室

    vm.currentHospital = SettingService.getCurrentHospital();

    // 監聽 lastAccessTime，供前端顯示最後更新時間
    // 參數說明: time-更新時間
    $scope.$on('lastAccessTime', (event, args) => {
        lastAccessTime = args.time;
        vm.lastRefreshTitle = `${moment(lastAccessTime).fromNow()}`;
    });

    // 第一次 signalR 連線
    dashboardService.showAll = function showAll(info) {
        console.log('所有透析機資訊', angular.copy(info));


        // 通知子頁面(病人、透析機)更新
        $scope.$broadcast('showMachineData', info);
    };


    // 更新透析機資料
    dashboardService.updateData = function updateData(info) {
        console.log('dashboardService.updateData', info);

        // 通知子頁面(病人、透析機)更新
        $scope.$broadcast('updateMachineData', info);
    };

    // 更新上下機
    dashboardService.updateBedStatus = function updateBedStatus(info) {
        console.log('dashboardService.updateData', info);

        // 通知子頁面(病人、透析機)更新
        $scope.$broadcast('updateBedStatus', info);
    };

    vm.$onInit = function () {
        updateClock();
        dashboardService.connect();

        // logo
        vm.logo = SettingService.getCurrentHospital().Logo;
        vm.hospitalName = SettingService.getCurrentHospital().HospitalName;
        console.log('vm.logo', vm.logo);

        vm.wardList = UserInfo.Ward;

        // 讀出透析室的第一筆
        if (vm.wardList) {
            // 因為 vm.wardList 是 object 無法判斷筆數，所以轉為陣列，讓前端知道大於1筆才需顯示透析室選項
            vm.Wardkeys = Object.keys(vm.wardList);
            if ($stateParams.wardId) {
                vm.currentWard = $stateParams.wardId;
                vm.CurrentWardName = vm.wardList[$stateParams.wardId];
            } else {
                vm.currentWard = Object.keys(vm.wardList)[0];
                vm.CurrentWardName = vm.wardList[0];
            }
        }

        // 使畫面為選擇的樣式
        // 若 $state.current.name 為 dashboard 表示為從主畫面第一次進入電子白板畫面，須直接幫忙選取病人頁面
        if ($state.current.name === 'dashboard') {
            vm.gotoPage('patientsBoard');
        } else {
            vm.gotoPage($state.current.name);
        }
    };

    // 依透析室取得所有病床資料
    function getBed() {
        vm.Loading = true;
        dashboardService.getBedInfoByUserId(UserInfo.Id,
            $stateParams.wardId,
            UserInfo.HospitalId);
    }

    vm.changeWard = function () {
        // 取得目前 url 並更新 wardId
        $state.go($state.current.name, {
            wardId: vm.currentWard
        });
    };

    vm.gotoPage = function (pageName = 'patientsBoard') {
        countInPatientAndOutPatient();
        vm.selected = pageName;
        switch (pageName) {
            case 'patientsBoard':
                vm.selectedName = $translate('dashboard.component.patient');
                break;
            case 'machineDataBoard':
                vm.selectedName = $translate('dashboard.component.machine');
                break;
            case 'bedsBoard':
                vm.selectedName = $translate('dashboard.component.beds');
                break;
            case 'shiftsBoard':
                vm.selectedName = $translate('dashboard.component.shifts');
                break;
            case 'whiteBoard':
                vm.selectedName = $translate('dashboard.component.other');
                break;
            case 'directoryBoard':
                vm.selectedName = $translate('dashboard.component.directory');
                break;
            default:
                break;
        }
        // 清除更新時間
        vm.lastRefreshTitle = '';

        $state.go(pageName, {
            wardId: vm.currentWard
        });
    };

    // 離開網頁時，所需的動作
    vm.$onDestroy = function onDestroy() {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
        if (angular.isDefined(refreshInterval)) {
            $interval.cancel(refreshInterval);
        }
    };

    // 重新整理 (病人、排床、排班才顯示，透析機及其他則用 signalR 即時更新，不需此功能)
    vm.refresh = function () {
        countInPatientAndOutPatient();

        // 根據目前 router name 重新 $state.go
        $state.go($state.current.name, {
            wardId: vm.currentWard
        }, {
            reload: true
        });
    };

    // 頁面最下方的時間
    function updateClock() {
        vm.NowTime = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    function calculateRefreshTime() {
        $timeout(() => {
            vm.lastRefreshTitle = `${moment(lastAccessTime).fromNow()}`;
        }, 0);
    }

    function countInPatientAndOutPatient() {
        vm.inPatientCount = '--';
        vm.outPatientCount = '--';
        vm.emergencyPatientCount = '--';
        console.log('countInPatientAndOutPatient');
        // 重算門診/住院病人數
        PatientService.getInProgressByWardId($stateParams.wardId).then((res) => {
            if (res.data) {
                // 直接由 PatientSource 來判斷 門診
                vm.emergencyPatientCount = _.filter(res.data, (p) => {
                    return p.PatientSource === 'emergency';
                }).length;
                // 住院
                vm.inPatientCount = _.filter(res.data, (p) => {
                    return p.PatientSource === 'inpatient';
                }).length;
                // emergency
                vm.outPatientCount = res.data.length - vm.inPatientCount - vm.emergencyPatientCount;
                console.log('countInPatientAndOutPatient', res);
            }
        });
    }
}

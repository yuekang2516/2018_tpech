import tpl from './machineDataBoard.html';
import machineDataDetailTpl from './machineDataDetailDialog.html';
import './machineDataBoard.less';

angular.module('app').component('machineDataBoard', {
    template: tpl,
    controller: machineDataBoardCtrl
});

machineDataBoardCtrl.$inject = ['$filter', '$scope', '$stateParams', 'dashboardService', 'PatientService', 'wardService', '$timeout', 'SettingService', '$interval', '$mdDialog', 'showMessage'];

function machineDataBoardCtrl($filter, $scope, $stateParams, dashboardService, PatientService, wardService, $timeout, SettingService, $interval, $mdDialog, showMessage) {
    const vm = this;
    const UserInfo = SettingService.getCurrentUser();
    vm.message = '';
    vm.Loading = false;
    vm.serverData = [];
    let currentWard = ''; // 目前顯示的透析室
    let $translate = $filter('translate');

    // for init
    $scope.$on('showMachineData', (event, info) => {
        console.log('machineDataBoardCtrl showMachineData');
        $timeout(() => {
            // 床號排序，先照後台設定順序
            // vm.serverData = _.orderBy(info, ['BedNo'], ['asc']);

            // 顯示床組 (B肝...)
            wardService.getById($stateParams.wardId).then((res) => {
                console.log('電子白版 ward res', res);
                if (res.data) {
                    vm.serverData = [];
                    if (res.data.BedNos.length > 0) {
                        // 床號排序，先照後台設定順序是什麼就是什麼
                        // res.data.BedNos.sort();

                        _.forEach(res.data.BedNos, (bed) => {
                            //查群組名
                            let groupName = "";
                            _.forEach(res.data.BedGroups, (group) => {
                                _.forEach(group.BedNos, (bedno) => {
                                    if (bedno === bed) {
                                        groupName = group.Name;
                                    }
                                });
                            });
                            vm.serverData.push({
                                BedNo: bed,
                                Group: groupName
                            });
                        });
                    }

                    // vm.serverData = info;
                    // 決定燈號並將姓名馬賽克
                    _.forEach(info, (item) => {
                        // 取出資料的索引值
                        const index = _.findIndex(vm.serverData, ['BedNo', item.BedNo]);

                        item.status = setStatus(item);
                        if (item.Name) {
                            item.Name = PatientService.getMaskName(item.Name);
                        }
                        // 床組
                        item.Group = vm.serverData[index].Group;
                        // 警告
                        item.alarmAry = dashboardService.getAlarmMsgAry(item.MachineData);

                        vm.serverData[index] = item;
                    });
                    vm.Loading = false;
                    vm.message = '';
                }
            }, () => {

            });
        });
    });

    // update
    $scope.$on('updateMachineData', (event, info) => {
        console.log('machineDataBoardCtrl updateMachineData');
        // 通知 dashboard 更新門診住院人數
        $scope.$emit('refresh');

        const updataInfo = angular.copy(vm.serverData);
        // 取出資料的索引值
        const index = _.findIndex(updataInfo, ['BedNo', info.BedNo]);

        // 找不到床位
        if (index < 0) {
            return;
        }
        $timeout(() => {
            vm.serverData[index] = info;
            if (info.Name) {
                vm.serverData[index].Name = PatientService.getMaskName(vm.serverData[index].Name);
            }
            vm.serverData[index].status = setStatus(vm.serverData[index]);

            // 警告
            vm.serverData[index].alarmAry = dashboardService.getAlarmMsgAry(vm.serverData[index].MachineData);
        });
    });

    // 病人上下機
    $scope.$on('updateBedStatus', (event, info) => {
        console.log('machineDataBoardCtrl updateBedStatus');
        const updataInfo = angular.copy(vm.serverData);
        // 取出資料的索引值
        const index = _.findIndex(updataInfo, ['BedNo', info.BedNo]);

        // 找不到床位
        if (index < 0) {
            return;
        }

        $timeout(() => {
            vm.serverData[index] = info;
            if (info.Name) {
                vm.serverData[index].Name = PatientService.getMaskName(vm.serverData[index].Name);
            }

            // 更新燈號
            vm.serverData[index].status = setStatus(vm.serverData[index]);

            // 若非透析中則 alarm 可清空
            if (vm.serverData[index].status !== $translate('machineDataBoard.component.dialyzing')) {
                vm.serverData[index].alarmAry = [];
            }
        });
    });

    vm.$onInit = function $onInit() {
        currentWard = $stateParams.wardId;
        vm.Loading = true;

        dashboardService.restartSignalR();

        // dashboardService.getBedInfoByUserId(UserInfo.Id,
        //     currentWard,
        //     UserInfo.HospitalId);
        // machineDataBoardService.connect();
    };

    vm.$onDestroy = function () {
        // 停止 signalR 連線
        // machineDataBoardService.disconnect();

    };

    // 設定燈號
    function setStatus(lastDialysisInfo) {
        // 病人透析狀態
        // 先檢查是否為今日
        if (lastDialysisInfo.StartTime && moment(lastDialysisInfo.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            // 檢查順序 (符合即不須繼續比對): EndTime(關表) -> AfterWeight/BP(透析完成) -> EstimatedTime(透析中) -> BeforeWeight/BP StartTime(開表)
            if (lastDialysisInfo.EndTime && moment(lastDialysisInfo.EndTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                return $translate('machineDataBoard.component.recordDone');
            } else if (lastDialysisInfo.AfterWeight || (lastDialysisInfo.AfterBP && (lastDialysisInfo.AfterBP.BPS || lastDialysisInfo.AfterBP.BPD))) {
                return $translate('machineDataBoard.component.postDialysis');
            } else if (lastDialysisInfo.DialysisDataFirstTime && !/0001-01-01/.test(lastDialysisInfo.DialysisDataFirstTime) && moment(lastDialysisInfo.DialysisDataFirstTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                return $translate('machineDataBoard.component.dialyzing');
            }
            return $translate('machineDataBoard.component.recordStart');   // start time
        }
        return '';
    }

    vm.toggleAlarm = function (item) {
        console.log('toggleAlarm');
        if (item.alarmAry.length > 0) {
            item.toggleAlarm = !item.toggleAlarm;
        }
    };

    vm.calculationTime = function calculationTime(value) {
        if (value && value !== '0001-01-01T00:00:00') {
            return `${moment(value).format('HH:mm:ss')} (${moment(value).fromNow()})`;
        }
        return '';
    };

    // 顯示詳細資料的對話框
    vm.showDetail = function (item) {
        if (!item.Name) {
            return;
        }
        $mdDialog.show({
            controller: 'machineDataDetailDialogCtrl',
            controllerAs: '$ctrl',
            locals: {
                data: item.MachineData,
                name: item.Name,
                medicalId: item.MedicalId
            },
            bindToController: true,
            template: machineDataDetailTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false
        });
    };
}

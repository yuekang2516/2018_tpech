import tpl from './patientsBoard.html';
import memoTpl from './patientMemoDialog.html';
import notificationsTpl from './notificationDialog.html';
import summaryTpl from '../summaryContentDialog/summaryContentDialog.html';
import './patientsBoard.less';

angular.module('app').component('patientsBoard', {
    template: tpl,
    controller: patientsBoardCtrl
});

patientsBoardCtrl.$inject = ['$timeout', '$q', '$scope', 'wardService', 'PatientService', 'dashboardService', 'SettingService', 'notificationService', '$stateParams', 'showMessage', '$mdDialog', '$interval', '$filter'];

function patientsBoardCtrl($timeout, $q, $scope, wardService, PatientService, dashboardService, SettingService, notificationService, $stateParams, showMessage, $mdDialog, $interval, $filter) {
    const self = this;
    let $translate = $filter('translate');
    // 每五分鐘更新一次資料，確保為最新的
    const interval = $interval(refresh, 300000);

    // for init
    $scope.$on('showMachineData', (event, info) => {
        console.log('patientsBoardCtrl showMachineData');
        $scope.$emit('refresh');
        loadData(info, true);
    });

    // update
    $scope.$on('updateMachineData', (event, info) => {
        console.log('patientsBoardCtrl updateMachineData');
        // 通知 dashboard 更新門診住院人數
        $scope.$emit('refresh');
        loadData(info);
    });

    // 病人上下機
    $scope.$on('updateBedStatus', (event, info) => {
        console.log('patientsBoardCtrl updateBedStatus');
        const updataInfo = angular.copy(self.serverData);
        // 取出資料的索引值
        const index = _.findIndex(updataInfo, ['BedNo', info.BedNo]);

        if (index < 0) {
            return;
        }

        $timeout(() => {
            self.serverData[index] = info;
            if (info.Name) {
                self.serverData[index].Name = PatientService.getMaskName(self.serverData[index].Name);
            }
    
            // 更新燈號
            self.serverData[index].status = setStatus(self.serverData[index]);
    
            // 若非透析中則 alarm 可清空
            if (self.serverData[index].status !== $translate('machineDataBoard.component.dialyzing')) {
                self.serverData[index].alarmAry = [];
            }
        }, 0);

    });

    self.$onInit = function () {
        // $scope.$emit('refresh');
        // loadData();
        dashboardService.restartSignalR();
        // dashboardService.getBedInfoByUserId(SettingService.getCurrentUser().Id,
        //     $stateParams.wardId,
        //     SettingService.getCurrentUser().HospitalId);
    };

    self.$onDestroy = function () {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };

    self.serverData = [];
    function loadData(info, reload = false) {
        // 先取得目前透析室的所有床位、未讀的通知
        let executionAry = [];
        let allNotifications = [];    // 未讀的通知

        if (reload) {
            self.loading = true;
        }
        executionAry.push(
            wardService.getById($stateParams.wardId).then((res) => {
                console.log('電子白版 ward res', res);
                if (res.data) {
                    self.serverData = [];
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
                            self.serverData.push({
                                BedNo: bed,
                                Group: groupName
                            });
                        });
                    }
                }
                self.serverErr = false;
            }, () => {
                self.serverErr = true;
            })
        );
        executionAry.push(
            notificationService.getCarePatientsByUserId(SettingService.getCurrentUser().Id, true).then((res) => {
                console.log('電子白版 CarePatients res', res);
                allNotifications = res.data;
            })
        );

        $q.all(executionAry).then(() => {
            if (!self.serverErr) {
                PatientService.getInProgressByWardId($stateParams.wardId).then((res) => {
                    console.log('電子白版 res', res);
                    // 再篩選出目前透析室的今日病人
                    if (res.data) {
                        // 將資料塞入對應的床號
                        _.forEach(res.data, (item) => {
                            // 處理姓名馬賽克
                            item.Name = PatientService.getMaskName(item.Name);

                            // 處理醫師及護理師
                            // 醫師只有一個
                            _.forEach(item.Doctor, (value, key) => {
                                item.Doctor = value;
                            });
                            // 護理師
                            item.NursesAry = [];
                            _.forEach(item.Nurses, (value) => {
                                item.NursesAry.push(value);
                            });

                            // 取出資料的索引值
                            const index = _.findIndex(self.serverData, ['BedNo', item.BedNo]);
                            // 設定燈號
                            item.status = setStatus(item);

                            // 通知
                            if (allNotifications.length > 0) {
                                let notifications = _.filter(allNotifications, (notification) => {
                                    return notification.PatientId === item.Id;
                                });
                                item.notifications = _.orderBy(notifications, ['Date'], ['desc']);
                                item.unreadNotificationCount = _.filter(notifications, (n) => {
                                    return !n.IsRead;
                                }).length;
                            }

                            // 床組
                            if (index > -1) {
                                item.Group = self.serverData[index].Group;

                                // alarm
                                if (Array.isArray(info)) {
                                    const alarmIdx = _.findIndex(info, ['BedNo', item.BedNo]);
                                    if (alarmIdx > -1) {
                                        item.alarmAry = dashboardService.getAlarmMsgAry(info[alarmIdx].MachineData);
                                    }
                                }

                                self.serverData[index] = item;
                            }
                        });
                    }

                    self.serverErr = false;
                    // 發出消息，供主頁顯示目前更新時間
                    $scope.$emit('lastAccessTime', { time: moment() });
                }, () => {
                    self.serverErr = true;
                    showMessage($translate('customMessage.serverError')); // lang.ComServerError
                });
            } else {
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            }
        })
            .finally(() => {
                self.loading = false;
            });
    }

    // 設定目前狀態
    function setStatus(lastDialysisInfo) {
        // 病人透析狀態
        // 先檢查是否為今日
        if (lastDialysisInfo.StartTime && moment(lastDialysisInfo.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            // 檢查順序 (符合即不須繼續比對): EndTime(關表) -> AfterWeight/BP(透析完成) -> EstimatedTime(透析中) -> BeforeWeight/BP StartTime(開表)
            if (lastDialysisInfo.EndTime && moment(lastDialysisInfo.EndTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                return $translate('patientsBoard.component.recordDone');
            } else if (lastDialysisInfo.AfterWeight || (lastDialysisInfo.AfterBP && (lastDialysisInfo.AfterBP.BPS || lastDialysisInfo.AfterBP.BPD))) {
                return $translate('patientsBoard.component.postDialysis');
            } else if (lastDialysisInfo.DialysisDataFirstTime && !/0001-01-01/.test(lastDialysisInfo.DialysisDataFirstTime) && moment(lastDialysisInfo.DialysisDataFirstTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                return $translate('patientsBoard.component.dialyzing');
            }
            return $translate('patientsBoard.component.recordStart');   // only start time
        }
        return '';
    }

    self.toggleAlarm = function (item) {
        console.log('toggleAlarm');
        if (item.alarmAry.length > 0) {
            item.toggleAlarm = !item.toggleAlarm;
        }
    };

    // 彈出重要記事對話框
    self.showMemo = function (patient) {
        $mdDialog.show({
            controller: memoCtrl,
            controllerAs: '$ctrl',
            locals: {
                data: patient
            },
            bindToController: true,
            template: memoTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false
        });

        function memoCtrl(data) {
            const vm = this;
            vm.currentPatient = data;

            vm.cancel = function () {
                $mdDialog.cancel();
            };
        }
    };

    // 彈出透析表
    self.showSummaryContent = function (patient) {
        $mdDialog.show({
            controller: 'summaryContentCtrl',
            controllerAs: '$ctrl',
            locals: {
                patientId: patient.Id
            },
            bindToController: true,
            template: summaryTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false
        });
    };

    // 彈出最新通知
    self.showNotifications = function (patient) {
        // 顯示對話框
        $mdDialog.show({
            controller: notificationCtrl,
            controllerAs: '$ctrl',
            bindToController: true,
            template: notificationsTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            multiple: true      // 於此對話框中還會顯示詳細的對話框
        });

        function notificationCtrl() {
            const vm = this;
            vm.currentPatient = patient;
            vm.serviceData = patient.notifications;

            vm.cancel = function () {
                $mdDialog.cancel();
            };

            vm.openDialog = function openDialog(ev, item) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title(vm.currentPatient.Name)
                        .textContent(item.Content)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('確定')
                        .targetEvent(ev)
                        .multiple(true)
                );
            };
        }
    };

    function refresh() {
        // 通知 dashboard 更新門診住院人數
        $scope.$emit('refresh');

        // 自動更新，不顯示 loading 畫面
        loadData();
    }
}


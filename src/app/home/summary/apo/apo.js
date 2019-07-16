import apos from './apos.html';
import apo from './apo.html';

angular
    .module('app')
    .component('apo', {
        template: apos,
        controller: apoCtrl,
        controllerAs: '$ctrl'
    })
    .component('apoDetail', {
        template: apo,
        controller: apoEditCtrl,
        controllerAs: '$ctrl'
    });


// 測試資料 const patients = {   Name: '李小明',   WardId: '56fcc9eb4ead7870942f61c4',
//  WardName: '測試透析室001',   Id: '57722b1b00977e113c1eb774' };

apoCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'ApoService',
    '$mdToast',
    'PatientService',
    'SettingService',
    '$mdMedia',
    'showMessage',
    '$interval',
    '$sessionStorage',
    '$timeout',
    '$filter'
];

function apoCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    ApoService, $mdToast, PatientService, SettingService, $mdMedia, showMessage,
    $interval, $sessionStorage, $timeout, $filter) {
    const self = this;
    // const patients = $stateParams.obj;
    self.patient = null;
    let abnormalItems;
    self.user = SettingService.getCurrentUser();
    self.serviceData = null;

    let $translate = $filter('translate');

    // 預設狀態
    self.loading = true;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;

    self.$onInit = function $onInit() {
        loadData();
    };

    // loading data
    function loadData(isForce = true) {
        console.log('loadData Here');
        self.loading = true;
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                console.log('patient:', self.patient);
                ApoService
                    .getByTime($stateParams.patientId, null, null)
                    // .getByPatientId($stateParams.patientId, isForce)
                    .then((q) => {
                        self.isError = false;
                        self.loading = false;
                        self.serviceData = q.data;
                        console.log('serviceData:', self.serviceData);
                        self.deletedItemsLength = self.serviceData && self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = ApoService.getLastAccessTime();
                        if (self.patient.WardId !== null) {
                            self.loading = true;
                            ApoService
                                .getHospitalAll()
                                .then((j) => {
                                    if (j.data.filter(x => x.Id === self.patient.WardId).length > 0) {
                                        abnormalItems = j
                                            .data
                                            .filter(x => x.Id === self.patient.WardId)[0]
                                            .AbnormalItems;
                                    }
                                    self.isError = false;
                                    self.loading = false;
                                }, () => {
                                    self.isError = true;
                                    self.loading = false;
                                });
                        }
                    }, (error) => {
                        console.error('ApoService', error);
                        self.isError = true;
                        self.loading = false;
                    });
            }, () => {
                self.isError = true;
                self.loading = false;
            });
    }

    // function calculateDeletedItemLength() {
    //     return self.serviceData.filter(item => item.Status === 'Deleted').length;
    // }

    // 排序護理記錄時間, 用在 ng-repeat 上
    self.sortRecord = function sortRecord(item) {
        const date = new Date(item.Time);
        return date;
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        loadData(true);
    };

    // add or edit
    self.goto = function goto(apoid = null, apostatus = null) {
        if (typeof abnormalItems === 'object') {
            $sessionStorage.abnormalItems = abnormalItems;
            $state.go('apoDetail', { apoId: apoid, apoStatus: apostatus });
        }
    };

    // // 異常項目
    // self.handleTransformAbnormalItemId = function handleTransformAbnormalItemId(abnormalItemId) {
    //     let idToTC;
    //     if (typeof abnormalItems === 'object') {
    //         abnormalItems.forEach((ai) => {
    //             if (ai.Id === abnormalItemId) {
    //                 idToTC = ai.Name;
    //             }
    //         });
    //         if (idToTC) {
    //             return idToTC;
    //         }
    //         return $translate('apo.apos.component.noSetting');
    //     }
    //     return abnormalItems;
    // };

    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false
        });

        function DialogController($scope, $mdDialog) {
            $scope.hide = function hide() {
                $mdDialog.hide();
            };

            $scope.cancel = function cancel() {
                $mdDialog.cancel();
            };

            $scope.ok = function ok() {
                console.log('data.Id:', data.Id);
                data.Id.forEach((x) => {
                    console.log('x:', x);
                    ApoService
                    .delNew(x)
                    .then((q) => {
                        if (q.status === 200) {
                         self.refresh();
                         console.log('OK');
                     }
                    }, (e) => {
                         console.log('Error, ' + e);
                    });
                });
                // self.refresh();

                // let cellArray = [];
                // let cellstr = 'A,B,C,D,E';
                // cellArray = cellstr.split(',');
                // cellArray.forEach((x) => {
                //     console.log(x);
                // });

                //    ApoService
                //    .del(data.Id)
                //    .then((q) => {
                //        if (q.status === 200) {
                //            self.refresh();
                //        }
                //    });
                $mdDialog.hide(data);
            };
        }
    };

    self.goback = function goback() {
        // $state.go('summary', {}, { location: 'replace' });
        history.back();
    };

}
apoEditCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'ApoService',
    '$mdToast',
    '$timeout',
    'PatientService',
    'SettingService',
    'showMessage',
    '$sessionStorage',
    '$filter'
];

function apoEditCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    ApoService, $mdToast, $timeout, PatientService, SettingService, showMessage, $sessionStorage, $filter) {
    const self = this;
    const abnormalItems = $sessionStorage.abnormalItems;

    self.apoId = $stateParams.apoId;
    self.apoTime = $stateParams.apoId.split(':').join('%3A');
    self.apoTime = self.apoTime.split('+').join('%2B');
    self.apoStatus = $stateParams.apoStatus;
    let abnormalArray = [];
    self.abnormalArray = [];

    let $translate = $filter('translate');

    if (typeof abnormalItems === 'undefined') {
        showMessage($translate('apo.apo.component.updateWard'));
        history.back(-1);
        return;
    }

    self.regform = {};
    self.user = SettingService.getCurrentUser();

    // 離開頁面 remove sessionStorage
    self.$onDestroy = function $onDestroy() {
        delete $sessionStorage.abnormalItems;
    };

    // 讀取資料
    function loadData() {
        console.log('self.apoTime:', self.apoTime);
        // debugger;
        self.loading = true;
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                // debugger;
                self.patients = d.data;
                ApoService
                .getByTime($stateParams.patientId, self.apoTime, self.apoStatus) // 'Deleted' , 'Normal' /'2016-07-15T00%3A00%3A00%2B08%3A00'
                // .getById($stateParams.apoId)
                .then((q) => {
                    // debugger;
                    self.loading = false;
                    self.regforms = q.data;
                    console.log('regforms:', self.regforms);
                    self.regform = self.regforms[0];
                    self.regform.Time = new Date(self.regforms[0].Time);
                    console.log('regform:', self.regform);
                    console.log(self.regform.Time);
                    self.regforms.forEach((x) => {
                        // debugger;
                        x.wardName = self.patients.WardName;
                        x.Name = self.patients.Name;
                        self.memo = x.Memo; // 還原資訊
                        self.abnormalItems = abnormalItems;
                        // 處理班別
                        switch (x.Shift) {
                            case 'morning':
                            case '白班': // 舊資料有中文
                                x.Shift = 'morning';
                              break;
                            case 'afternoon':
                            case '中班':
                                x.Shift = 'afternoon';
                              break;
                            case 'evening':
                            case '晚班':
                                x.Shift = 'evening';
                              break;
                            default:
                              break;
                        }
                        // retrieve Time
                        // x.Time =  moment(x.Time).second(0).millisecond(0).toDate();
                        // 計算異常類別 fix 2017/05/17
                        for (let i = 0; i < abnormalItems.length; i += 1) {
                            if (abnormalItems[i].Id === x.AbnormalItemId) {
                                // 子
                                x.AbnormalItemId = abnormalItems[i].Id;
                                for (let j = 0; j < abnormalItems.length; j += 1) {
                                    if (abnormalItems[j].Id === abnormalItems[i].ParentId) {
                                        // 母
                                        x.abnormalItem = abnormalItems[j].Id;
                                    }
                                }
                            }
                        }

                        let abnormalItem = {};
                        abnormalItem.aid = x.AbnormalItemId;
                        abnormalItem.pid = x.abnormalItem;
                        abnormalArray.push(abnormalItem);
                        self.abnormalArray.push(abnormalItem);
                        // debugger;
                        self.loading = false;
                        self.isError = false;
                    }, () => {
                        // debugger;
                        self.loading = false;
                        self.isError = true;
                    });
                    console.log('abnormalArray:', abnormalArray);
                });
            }, (error) => {
                console.error('ApoService error', error);
                self.loading = false;
                self.isError = true;
            });
        }

    // init
    self.$onInit = function $onInit() {
        if ($stateParams.apoId) {
            loadData();
        } else {
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patients = d.data;
                    self.regform.wardName = self.patients.WardName;
                    self.regform.Name = self.patients.Name;
                    // initialize Time(current time)
                    // self.regform.Time = moment().second(0).millisecond(0).toDate();
                });
            self.abnormalItems = abnormalItems;
            for (let i = 0; i < abnormalItems.length; i += 1) {
                for (let j = 0; j < abnormalItems.length; j += 1) {
                    if (abnormalItems[j].Id === abnormalItems[i].ParentId) {
                        self.regform.abnormalItem = abnormalItems[j].Id;
                    }
                }
            }
        }
    };

    // 畫面前台改變選取狀態的函數
    self.toggle = function toggle(Pid, Aid) {
        // debugger;
        let abnormalItem = {};
        abnormalItem.aid = Aid;
        abnormalItem.pid = Pid;

        let flag = false;
        let index = -1;
        let index1 = -1;
        abnormalArray.forEach((x) => {
            index1 += 1;
            if (x.pid === Pid && x.aid === Aid) {
                flag = true;
                index = index1;
            }
        });
        if (flag) {
            abnormalArray.splice(index, 1);
            self.abnormalArray.splice(index, 1);
        } else {
            abnormalArray.push(abnormalItem);
            self.abnormalArray.push(abnormalItem);
        }
    };

    // 檢查是否有勾選
    self.exists = function exists(Pid, Aid) {
        // debugger;
        let rst = false;
        abnormalArray.forEach((x) => {
            if (x.pid === Pid && x.aid === Aid) {
                rst = true;
            }
        });
        return rst;
    };

    // 提交
    self.isSaving = false;
    self.submit = function submit(event) {
        self.isSaving = true;
        if (event) {
            event.currentTarget.disabled = true;
        }
        // 複製一份，避免原始資料變更
        let saveData = [];
        if ($stateParams.apoId) {
            // edit
            abnormalArray.forEach((x) => {
                let aidFlag = false;
                self.regforms.forEach((y) => {
                    if (x.aid === y.AbnormalItemId) {
                        aidFlag = true;
                        y.Time = self.regform.Time;
                        y.Shift = self.regform.Shift;
                        y.Memo = self.regform.Memo;
                        y.WardId = self.patients.WardId;
                        y.HospitalId = self.user.HospitalId;
                        y.ModifiedUserId = self.user.Id;
                        y.ModifiedUserName = self.user.Name;
                        saveData = angular.copy(y);
                    }
                });
                if (aidFlag) {
                    // 原有勾選=>修改
                    ApoService
                    .putNew(saveData)
                    .then((res) => {
                        if (res.status === 200) {
                            // // 確認存檔成功後，才導入
                            // self.regform = angular.extend(saveData, self.regform);
                            // showMessage($translate('apo.apo.component.editSuccess'));
                            // history.go(-1);
                        }
                    });
                } else {
                    // 增加勾選=>新增
                    self.regform.PatientId = self.patients.Id;
                    self.regform.PatientName = self.patients.Name;
                    self.regform.WardId = self.patients.WardId;
                    self.regform.HospitalId = self.user.HospitalId;
                    self.regform.CreatedUserId = self.user.Id;
                    self.regform.CreatedUserName = self.user.Name;
                    self.regform.ModifiedUserId = self.user.Id;
                    self.regform.ModifiedUserName = self.user.Name;
                    delete self.regform.Id;
                    saveData = angular.copy(self.regform);
                    saveData.AbnormalItemId = x.aid;
                    ApoService
                        .postNew(saveData)
                        .then((res) => {
                            if (res.status === 200) {
                                // // 確認存檔成功後，才導入
                                // self.regform = angular.extend(saveData, self.regform);
                                // showMessage($translate('apo.apo.component.createSuccess'));
                                // history.go(-1);
                            }
                        });
                }
            });

            // 拿掉勾選=>刪除
            self.regforms.forEach((x) => {
                let aidFlag = false;
                abnormalArray.forEach((y) => {
                    if (x.AbnormalItemId === y.aid) {
                        aidFlag = true;
                    }
                });
                if (!aidFlag) {
                    ApoService
                    .delNew(x.Id)
                    .then((q) => {
                        if (q.status === 200) {
                        }
                    });
                }
            });
            showMessage($translate('apo.apo.component.editSuccess'));
            history.go(-1);
            // $state.go('apo');
        } else {
            // add
            self.regform.PatientId = self.patients.Id;
            self.regform.PatientName = self.patients.Name;
            self.regform.WardId = self.patients.WardId;
            self.regform.HospitalId = self.user.HospitalId;
            self.regform.CreatedUserId = self.user.Id;
            self.regform.CreatedUserName = self.user.Name;

            abnormalArray.forEach((x) => {
                saveData = angular.copy(self.regform);
                saveData.AbnormalItemId = x.aid;
                ApoService
                    .postNew(saveData)
                    .then((res) => {
                        if (res.status === 200) {
                            // // 確認存檔成功後，才導入
                            // self.regform = angular.extend(saveData, self.regform);
                            // showMessage($translate('apo.apo.component.createSuccess'));
                            // history.go(-1);
                        }
                    });
                });
            showMessage($translate('apo.apo.component.createSuccess'));
            history.go(-1);
            // $state.go('apo');
        }
    };
    // 異常項目類別選項
    self.selectItem = function selectItem(item) {
        self.selectedParentId = item.Id;
    };
    // 還原備註
    self.redo = function redo() {
        self.regform.Memo = self.memo;
    };

    self.back = function () {
        history.back();
    };
}

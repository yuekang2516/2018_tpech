import doctorNoteDetail from './doctorNote.html';
import doctorNoteList from './doctorNoteList.html';
import './doctorNote.less';

angular.module('app').component('doctorNote', {
    template: doctorNoteList,
    controller: doctorNoteCtrl
}).component('doctorNoteDetail', {
    template: doctorNoteDetail,
    controller: doctorNoteDetailCtrl
});

doctorNoteCtrl.$inject = ['$scope', '$state', 'DoctorNoteService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage', 'SettingService', '$sessionStorage'];

function doctorNoteCtrl($scope, $state, DoctorNoteService, $stateParams,
    $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage, SettingService, $sessionStorage) {
    const self = this;
    self.serviceData = null;
    self.totalCnt = 0;
    let currentPage = 1;
    let maxpage = 0;
    const limit = 50;
    self.loginRole = SettingService.getCurrentUser().Role;

    // 預設狀態
    self.loading = false;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    // self.deletedItemsLength = -1;

    self.stateName = $state.current.name;

    $scope.$on('doctornote_dataChanged', () => {
        self.refresh();
    });

    self.loadRecords = function loadRecords(isForce = false) {
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            DoctorNoteService.getByIdPage($stateParams.patientId, currentPage, limit, isForce).then((q) => {
                console.log(q);
                // debugger;
                // self.serviceData = q.data;
                self.totalCnt = q.data.Total;
                console.log('aaa', self.patient);
                maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
                if (q.data.Total % limit === 0) {
                    maxpage -= 1;
                }
                // console.log(maxpage);
                if (q.data.Total > 0) {
                    // self.rawData = q.data.Results;

                    // setDataByIsShowDeleted($scope.showDeleted);
                    self.serviceData = q.data.Results;
                    self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;

                    // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                } else {
                    self.serviceData = null;
                }
                self.lastAccessTime = DoctorNoteService.getLastAccessTime();
                self.loading = false;
                self.isError = false; // 顯示伺服器連接失敗的訊息
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    self.$onInit = function $onInit() {
        self.loadRecords(true);
    };

    function setDataByIsShowDeleted(showDeleted) {
        if (!self.rawData || self.rawData.length === 0) {
            return;
        }

        self.deletedItemsLength = self.rawData.filter(item => item.Status === 'Deleted').length;
        if (showDeleted) {
            self.serviceData = self.rawData;
            return;
        }

        self.serviceData = _.filter(self.rawData, (o) => {
            return o.Status !== 'Deleted';
        });
    }

    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loadingMore) {
            return;
        }
        self.loadingMore = true;
        currentPage += 1;
        if (currentPage > maxpage) {
            self.loadingMore = false;
            return;
        }
        // 呼叫取得NursingRecord的Service
        DoctorNoteService.getByIdPage($stateParams.patientId, currentPage, limit).then((q) => {
            console.log(q);
            // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data ->
            // 由於目前的方式會同時存在兩個一樣的 component 若於 service 做資料會有問題，改從畫面解決
            self.serviceData = self.serviceData.concat(q.data.Results);
            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            self.loadingMore = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loadingMore = false;
            self.isError = true;
        });
    };

    //  // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //     // 等確定有值才需判斷是否能編輯
    //     return !createdUserId || SettingService.checkAccessible(createdUserId);
    // };
    // 確認權限是否能修改
    self.checkCanAccess = function ({ createdUserId, dataStatus, modifiedId }) {
        // console.log('checkCanAccess', createdUserId, dataStatus);
        return SettingService.checkAccessible({ createdUserId, dataStatus, name: 'doctornote', modifiedId });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        currentPage = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = null;

        self.loadRecords(true);
    };

    // add or edit
    self.goto = function goto(doctorNoteId = null) {
        if ($state.current.name === 'pdDoctorNote') {
            // for PD
            $state.go('pdDoctorNoteDetail', {
                patientId: $stateParams.patientId,
                headerId: $stateParams.headerId,
                doctorNoteId
            });
        } else {
            $state.go('doctorNoteDetail', {
                patientId: $stateParams.patientId,
                headerId: $stateParams.headerId,
                doctorNoteId
            });
        }
    };
    self.goback = function back() {
        history.go(-1);
    };

    self.copy = function (event, content) {
        // 只需帶入 Content 即可
        $sessionStorage.doctorNoteCopy = content;

        delete $sessionStorage.doctorNoteCopy.Id;

        if ($state.current.name === 'pdDoctorNote') {
            // for PD
            $state.go('pdDoctorNoteDetail', {
                patientId: $stateParams.patientId,
                headerId: $stateParams.headerId,
                doctorNoteId: null
            });
        } else {
            $state.go('doctorNoteDetail', {
                patientId: $stateParams.patientId,
                headerId: $stateParams.headerId,
                doctorNoteId: null
            });
        }
    };

    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'doctorNoteDialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                DoctorNoteService.del(data.Id).then((q) => {
                    // if (q.status === 200) {
                    //     self.refresh();
                    // }
                });
                $mdDialog.hide(data);
            };
        }
    };
}

doctorNoteDetailCtrl.$inject = ['$stateParams', '$mdDialog', 'DoctorNoteService', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', '$interval', '$timeout', '$scope', '$filter', 'cursorInput', 'PatientService', '$sessionStorage'];

function doctorNoteDetailCtrl($stateParams, $mdDialog,
    DoctorNoteService, $mdToast, $mdSidenav, SettingService, showMessage, $interval, $timeout, $scope, $filter, cursorInput, PatientService, $sessionStorage) {
    const self = this;

    let $translate = $filter('translate');

    self.user = SettingService.getCurrentUser();
    self.doctorNoteId = $stateParams.doctorNoteId;
    self.canAccess = true;
    // self.userForm = {};

    self.lastAccessTime = moment();

    console.log('$sessionStorage doctornote', $sessionStorage.doctorNoteCopy);

    // loading data
    self.$onInit = function $onInit() {
        // 取得病人資料, 顯示於畫面上方標題列
        // PatientService.getById($stateParams.patientId).then((res) => {
        //     self.patient = res.data;
        // });
        self.userForm = {
            PatientId: $stateParams.patientId,
            DialysisId: $stateParams.headerId,
            HospitalId: self.user.HospitalId,
            RecordTime: moment().second(0).millisecond(0).toDate(),
            Content: ''
        };

        if (self.doctorNoteId) {
            self.loading = true;
            DoctorNoteService.getById(self.doctorNoteId, true).then((q) => {
                self.loading = false;
                self.lastAccessTime = DoctorNoteService.getLastAccessTime();
                if (q.data) {
                    self.userForm = q.data;
                    self.userForm.RecordTime = self.userForm.RecordTime && moment(self.userForm.RecordTime).second(0).millisecond(0).toDate();
                    //修改再確認權限
                    checkCanAccess(self.userForm.CreatedUserId, self.userForm.Status, self.userForm.ModifiedUserId);
                }
                self.isError = false;
            }, () => { // error
                self.loading = false;
                self.isError = true;
                // showMessage(error);
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
        } else {
            self.userForm.Content = $sessionStorage.doctorNoteCopy || '';
            // 清除 session 的內容，以免新增會帶到
            delete $sessionStorage.doctorNoteCopy;
        }
    };

    // // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //     // 修改才需
    //     // 等確定有值才需判斷是否能編輯
    //     if (self.doctorNoteId) {
    //         return !createdUserId || SettingService.checkAccessible(createdUserId);
    //     }
    //     return true;
    // };
    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        // console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, name: 'doctornote', modifiedId });
    }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        DoctorNoteService.getById($stateParams.headerId, true).then((q) => {
            self.loading = false;
            self.userForm = q.data;
            self.lastAccessTime = DoctorNoteService.getLastAccessTime();
            self.isError = false;
        }, () => { // error
            self.loading = false;
            self.isError = true;
            // showMessage(error);
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };
    // 存檔
    self.isSaving = false;
    self.submit = function submit($event) {
        $event.currentTarget.disabled = true;
        self.isSaving = true;

        if (typeof (self.userForm.Id) === 'undefined') {
            self.userForm.CreatedUserId = self.user.Id;
            self.userForm.CreatedUserName = self.user.Name;

            DoctorNoteService.post(self.userForm).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('doctorNote.component.createSuccess'));
                    if (!isDestroyed) {
                        history.go(-1);
                    }
                }
            }).catch((err) => {
                showMessage($translate('doctorNote.component.createFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        } else {
            self.userForm.ModifiedUserId = self.user.Id;
            self.userForm.ModifiedUserName = self.user.Name;
            DoctorNoteService.put(self.userForm).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('doctorNote.component.editSuccess'));
                    if (!isDestroyed) {
                        history.go(-1);
                    }
                }
            }).catch((err) => {
                showMessage($translate('doctorNote.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        //$mdSidenav('rightPhrase').close();
    };

    self.goback = function back() {
        history.go(-1);
    };

    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
    };
}

import doctorNoteList from './doctorNoteList.html';
import doctorNote from './doctorNote.html';

angular.module('app')
    .component('allDoctorNoteList', {
        template: doctorNoteList,
        controller: allDoctorNoteListCtrl,
        controllerAs: '$ctrl'
    })
    .component('allDoctorNoteDetail', {
        template: doctorNote,
        controller: allDoctorNoteContentCtrl,
        controllerAs: '$ctrl'
    });

allDoctorNoteListCtrl.$inject = ['$state', 'DoctorNoteService', '$stateParams', '$mdDialog', '$mdToast', '$interval', 'PatientService', '$timeout', 'showMessage'];

function allDoctorNoteListCtrl($state, DoctorNoteService, $stateParams,
                               $mdDialog, $mdToast, $interval, PatientService, $timeout, showMessage) {
    const self = this;
    self.serviceData = null;
    self.totalCnt = 0;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    // 預設狀態
    self.loading = false;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    // self.deletedItemsLength = -1;

    self.loadRecords = function loadRecords(isForce = false) {
        self.loading = true;
        PatientService.getById($stateParams.patientId).then((d) => {
            self.patient = d.data;
            DoctorNoteService.getByIdPage($stateParams.patientId, page, limit, isForce).then((q) => {
                console.log(q);
                // debugger;
                // self.serviceData = q.data;
                self.totalCnt = q.data.Total;
                maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
                if (q.data.Total % limit === 0) {
                    maxpage -= 1;
                }
                // console.log(maxpage);
                if (q.data.Total > 0) {
                    self.serviceData = q.data.Results;
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

    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loading) {
            return;
        }
        self.loading = true;
        page += 1;
        if (page > maxpage) {
            self.loading = false;
            return;
        }
        // 呼叫取得NursingRecord的Service
        DoctorNoteService.getByIdPage($stateParams.patientId, page, limit).then((q) => {
            console.log(q);
            // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
            self.serviceData = q.data.Results;
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.serviceData = null;

        self.loadRecords(true);
    };

    // add or edit
    self.goto = function goto(doctorNoteId = null) {
        $state.go('allDoctorNoteDetail', {doctorNoteId: doctorNoteId});
    };
    self.back = function back() {
        history.go(-1);
    };
}

allDoctorNoteContentCtrl.$inject = ['$stateParams', 'DoctorNoteService', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService'];

function allDoctorNoteContentCtrl($stateParams, DoctorNoteService,
                                  $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage,
                                  PatientService) {
    const self = this;

    self.doctorNoteId = $stateParams.doctorNoteId;
    self.user = SettingService.getCurrentUser();

    // 預設時間格式
    self.datetimepickerOption = {
        format: 'YYYY-MM-DD HH:mm'
    };

    self.$onInit = function $onInit() {
        self.loading = true;
        if ($stateParams.doctorNoteId) {
            // 預設畫面
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patient = d.data;
                    DoctorNoteService.getById(self.doctorNoteId).then((q) => {
                        self.loading = false;
                        self.regForm = q.data;
                        if (self.regForm.ModifiedTime) {
                            self.regForm.DoctorNoteTime = moment(self.regForm.ModifiedTime).second(0).millisecond(0).toDate();
                        } else {
                            self.regForm.DoctorNoteTime = moment(self.regForm.CreatedTime).second(0).millisecond(0).toDate();
                        }
                    });
                });
        } else {
            // 預設
            PatientService
                .getById($stateParams.patientId)
                .then((d) => {
                    self.patient = d.data;
                    self.loading = false;
                    self.regForm = {
                        DialysisTime: moment().second(0).millisecond(0).toDate(),
                        Content: '',
                        PatientId: $stateParams.patientId,
                        RelativeId: $stateParams.headerId,
                        HospitalId: self.user.HospitalId
                    };
                });
        }
    };

    // 當日期或時間有修改時
    let selectedDate = {};
    let selectedTime = {};
    self.dateChanged = function (date) {
        selectedDate = date;
    };
    self.timeChanged = function (time) {
        selectedTime = time;
    };

    // 回上一頁
    self.goback = function goback() {
        history.back(-1);
    };
}

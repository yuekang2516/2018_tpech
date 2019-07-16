import allReferralSheetList from './allReferralSheetList.html';

import './allReferralSheet.less';

angular.module('app')
    .component('allReferralSheetList', {
        template: allReferralSheetList,
        controller: allReferralSheetListCtrl
    });

allReferralSheetListCtrl.$inject = ['$state', 'ReferralSheetService', '$stateParams', '$mdDialog', '$mdToast', '$rootScope', 'PatientService', '$timeout', 'SettingService'];

function allReferralSheetListCtrl($state, ReferralSheetService, $stateParams,
    $mdDialog, $mdToast, $rootScope, PatientService, $timeout, SettingService) {
    const self = this;
    self.serviceData = null;  // 列表資料

    // 預設狀態
    self.loading = true;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;
    // const interval = $interval(calculateRefreshTime, 60000);

    self.stateName = $state.current.name;

    // 新增一筆返回清單頁時
    $rootScope.$on('referralSheet', () => {
        self.refresh();
    });

    self.$onInit = function $onInit() {
        // 取得登入者角色，醫生才可以刪除
        self.loginRole = SettingService.getCurrentUser().Role;
        // console.log('取得登入者角色 self.loginRole', self.loginRole);

        // seal 的 css
        self.myStyle = { right: '80px' };

        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                ReferralSheetService
                    .getByPatientId($stateParams.patientId)
                    .then((q) => {
                        console.log('轉診病摘清單 q', angular.copy(q));
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = ReferralSheetService.getLastAccessTime();
                        // calculateRefreshTime();
                        self.loading = false;
                    });
            });
    };

    self.$onDestroy = function $onDestroy() {
        // 離開網頁時, 清空 interval, 以免
        // if (angular.isDefined(interval)) {
        //     $interval.cancel(interval);
        // }
    };

    // 排序修改記錄時間, 用在 ng-repeat 上
    // self.sortRecord = function sortRecord(item) {
    //     const date = new Date(item.ModifiedTime);
    //     return date;
    // };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                ReferralSheetService
                    .getByPatientId($stateParams.patientId)
                    .then((q) => {
                        console.log('refresh 轉診病摘清單 q', angular.copy(q));
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = ReferralSheetService.getLastAccessTime();
                        // calculateRefreshTime();
                        self.loading = false;
                    });
            });
    };

    // function calculateRefreshTime() {
    //     $timeout(() => {
    //         self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    //     }, 0);
    // }

    // add or edit
    self.goto = function goto(referralSheetId = null) {
        // $state.go('allReferralSheetDetail', {
        //     patientId: $stateParams.patientId,
        //     referralSheetId
        // });
        if ($state.current.name.substr(0, 2) === 'pd') {
            $state.go('pdAllReferralSheetForm', {
                patientId: $stateParams.patientId,
                referralSheetId
            });
        } else {
            $state.go('allReferralSheetForm', {
                patientId: $stateParams.patientId,
                referralSheetId
            });
        }
    };


    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'dialog.html',
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
                ReferralSheetService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        self.refresh();
                    }
                });
                mdDialog.hide(data);
            };
        }
    };


    // 複製功能
    self.copyReferralSheet = function (data) {
        // 複製單筆資料來新增一筆
        console.log('複製單筆 data', data);
        // referralSheetData
        ReferralSheetService.setReferralSheetData(data);
        self.goto();

    };


    self.back = function back() {
        history.go(-1);
    };

    self.gotoHomePage = function () {
        if (self.loginRole === 'doctor') {
            // 醫生返回'今日床位'
            $state.go('beds');
        } else {
            // 護理師及其他角色及null回'我的病患'
            $state.go('myPatients');
        }
    };


    // self.gotoTestPage = function gotoTestPage(referralSheetId = null) {
    //     // $state.go('allReferralSheetForm', {
    //     //     patientId: $stateParams.patientId,
    //     //     referralSheetId
    //     // });
    //     $state.go('allReferralSheetDetail', {
    //         patientId: $stateParams.patientId,
    //         referralSheetId
    //     });
    // };

}

import tpl from './directoryBoard.html';
import './directoryBoard.less';

angular.module('app').component('directoryBoard', {
    template: tpl,
    controller: directoryBoardCtrl
});

directoryBoardCtrl.$inject = ['$q', '$scope', 'wardService', 'PatientService', 'dialysisService', 'SettingService', 'notificationService', '$stateParams', 'showMessage', '$mdDialog', '$interval', '$filter', 'userService'];

function directoryBoardCtrl($q, $scope, wardService, PatientService, dialysisService, SettingService, notificationService, $stateParams, showMessage, $mdDialog, $interval, $filter, userService) {
    const self = this;
    self.directoryItem = ['姓名', '職別', '電話', '手機'];

    // 每五分鐘更新一次資料，確保為最新的
    // const interval = $interval(refresh, 300000);
    self.$onInit = function onInit() {
        self.loading = true;
        getAllUser();

    };
    function getAllUser() {
        userService.get().then((res) => {
            self.users = res.data;
            self.users = $filter('orderBy')(self.users, 'Role');
            // 發出消息，供主頁顯示目前更新時間
            $scope.$emit('lastAccessTime', { time: moment() });
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
            // showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }
    self.refresh = function () {
        getAllUser();
    };

}

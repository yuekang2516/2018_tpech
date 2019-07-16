import tpl from './roProcess.html';
import './roProcess.less';
import dialog from './roEdit.dialog.html';

angular.module('app').component('roProcess', {
    template: tpl,
    controller: roProcessController
}).filter('ROSource', function ($filter) {
    return function (source) {
        const $translate = $filter('translate');
        switch (source) {
            case 'manual':
                return $translate('roprocess.manual');
            default:
                return $translate('roprocess.system');
        }
    };
});

roProcessController.$inject = ['$rootScope', '$scope', '$state', '$mdDialog', '$mdMedia', '$mdSidenav', 'SettingService', '$filter', 'roProcessService', '$stateParams'];

function roProcessController($rootScope, $scope, $state, $mdDialog, $mdMedia, $mdSidenav, SettingService, $filter, roProcessService, $stateParams) {

    const self = this;
    const currentUserId = SettingService.getCurrentUser().Id;
    let $translate = $filter('translate');

    // tab 相關
    self.allTabs = [
        {
            label: $translate('roprocess.pending'),
            active: 'roProcessPending',
            uiSref: 'roProcessPending',
            uiSrefOpts: '{location: "replace"}'
        },
        {
            label: $translate('roprocess.resolved'),
            active: 'roProcessResolved',
            uiSref: 'roProcessResolved',
            uiSrefOpts: '{location: "replace"}'
        }
    ];
    $scope.currentName = $state.current.name;

    $rootScope.$on('roAbnormalCount', (event, count) => {
        console.log('roAbnormalCount', count);
        self.roAbnormalCount = count;
    });

    self.$onInit = function () {
        console.log('on init');
        // 第一次進入取待處理筆數
        roProcessService.getPendingCount();

        // 加入 rootscape 監看式, 最新通知筆數若有異動, 更新 toolbar 上的數字
        $rootScope.$watch('notificationCount', () => {
            self.notificationCount = $rootScope.notificationCount;
        });


    };

    // 寫在doCheck，在表單點擊時，tab底線才會移動
    let previousState = null;
    self.$doCheck = function () {
        if (previousState !== $state.current.name) {
            // 控制tab底線的移動
            $scope.currentName = $state.current.name;
            previousState = $state.current.name;
        }
    };

    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
    };

    self.add = function () {
        console.log('add ro record');

        $mdDialog.show({
            controller: 'roEditController',
            template: dialog,
            locals: {
                item: null
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            controllerAs: '$ctrl'
        }).then((result) => {
            // 若無資料或已離開此頁則不做事情
            if (result.length < 1 || isDestroyed) {
                return;
            }

            // 依有無處理時間決定要去哪一頁 (待處理/已處理)
            let data = result[0];
            // 若無處理時間且 state 已在待處理或有處理時間且 state 相同則重新整理
            if ((!data.ResolvedTime && $state.current.name === 'roProcessPending') || (data.ResolvedTime && $state.current.name === 'roProcessResolved' && $stateParams.month === moment(data.AbnormalTime).format('YYYY/MM/DD'))) {
                $rootScope.$broadcast('refresh');
            } else if (data.ResolvedTime) {
                $state.go('roProcessResolved', { month: moment(data.AbnormalTime).format('YYYY/MM/DD') }, { location: 'replace' });
            } else {
                // 待處理
                $state.go('roProcessPending', {}, { location: 'replace' });
            }
        });
    };

    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    self.toggleSideNav = function () {
        SettingService.setSideNavStatus(currentUserId, !SettingService.getSideNavStatus(currentUserId));
        // emit to parent
        $scope.$emit('toggleNav');
    };
}

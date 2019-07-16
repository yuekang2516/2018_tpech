import tpl from './summaryToolbar.html';
import './summaryToolbar.less';

angular.module("app").component("summaryToolbar", {
    template: tpl,
    controller: summaryToolbarCtrl,
    bindings: {
        cancel: '&',
        toolbarTitle: '<',
        showRefresh: '<',
        refresh: '&'
    }
});

summaryToolbarCtrl.$inject = ['$scope', '$state', '$stateParams', 'SessionStorageService'];

function summaryToolbarCtrl($scope, $state, $stateParams, SessionStorageService) {

    const self = this;

    self.$onInit = function () {
        console.log('summaryToolbarCtrl');
    };

    self.gotoSummary = function () {
        // 檢驗紀錄表列印資料
        if (SessionStorageService.getItem('labexamTableData')) {
            SessionStorageService.deleteItem('labexamTableData');
        }
        $state.go('summary', {
            headerId: $stateParams.headerId
        });
    };

    self.$onChanges = function (changes) {
        if (changes.toolbarTitle) {
            self.toolbarTitle = changes.toolbarTitle.currentValue;

            // 通知 summary 的 toolbar 換title
            if ($state.current.name !== 'summary') {
                $scope.$emit('summaryTitle', self.toolbarTitle);
            }
            console.log('summaryToolbar onChanges');
        }
    };
}

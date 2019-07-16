import tpl from './roCardList.html';
import dialog from './roEdit.dialog.html';
import cellTpl from './roGridCell.html';

angular.module('app').component('roCardList', {
    template: tpl,
    controller: roCardListCtrl,
    bindings: {
        data: '<',
        isPending: '<'
    }
});

roCardListCtrl.$inject = ['$rootScope', '$scope', '$mdDialog', '$mdMedia', 'showMessage', 'roProcessService', '$filter', '$state', 'uiGridConstants'];
function roCardListCtrl($rootScope, $scope, $mdDialog, $mdMedia, showMessage, roProcessService, $filter, $state, uiGridConstants) {
    const self = this;
    const $translate = $filter('translate');

    self.sealStyle = {
        right: '20px',
        bottom: 'initial',
        top: '10px'
    };

    self.$onInit = function () {
        // ui-grid init
        $scope.gridOptions = {
            enableColumnResizing: true,
            enableColumnMenus: false,   // https://stackoverflow.com/questions/32671202/remove-sorting-menu-from-ui-grid-column-header
            enableSorting: false,
            excessRows: 20
        };

        // ui-grid column
        let columns = [
            { name: 'AbnormalTime', displayName: $translate('roprocess.abnormalTime'), cellTemplate: cellTpl, minWidth: 130, pinnedLeft: true },
            { name: 'PropertyNo', displayName: $translate('roprocess.propertyNo'), cellTemplate: cellTpl, minWidth: 110 },
            { name: 'MachineNo', displayName: $translate('roprocess.machineNo'), cellTemplate: cellTpl, minWidth: 110 },
            { name: 'AbnormalReason', displayName: $translate('roprocess.abnormalReason'), cellTemplate: cellTpl, minWidth: 110 },
            { name: 'Source', displayName: $translate('roprocess.dataSource'), cellTemplate: cellTpl, minWidth: 90 },
            { name: 'Value', displayName: $translate('roprocess.reportValue'), cellTemplate: cellTpl, minWidth: 110 },
            // { name: $translate('roprocess.action'), cellTemplate: cellTpl, width: 95, pinnedRight: true }
        ];

        // 若為已處理則需顯示處理時間及處理人
        if (!self.isPending) {
            // 顯示在第三及第四的位置
            columns.splice(5, 0, ...[
                { name: 'ResolvedTime', displayName: $translate('roprocess.resolvedTime'), cellTemplate: cellTpl, minWidth: 130 },
                { name: 'ResolvedWay', displayName: $translate('roprocess.resolvedWay'), cellTemplate: cellTpl, minWidth: 110 },
                { name: 'ResolvedUserName', displayName: $translate('roprocess.resolvedUser'), cellTemplate: cellTpl, minWidth: 110 }
            ]);
        }

        $scope.gridOptions.columnDefs = columns;
    };

    self.$onChanges = function (changesObj) {
        console.log('rolist onchange', changesObj);
        if (!self.data || self.data.length < 1) {
            return;
        }

        $scope.gridOptions.data = self.data;

        // add two rows to prevent add button block the data
        $scope.gridOptions.data.push({ Name: '' });
        $scope.gridOptions.data.push({ Name: '' });

        console.log('rogrid', $scope.gridOptions.data);
    };

    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
        console.log('rolist', isDestroyed);
    };

    $scope.edit = function (item, col) {
        console.log('edit', item, col);

        $mdDialog.show({
            controller: 'roEditController',
            template: dialog,
            locals: {
                item
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

            console.log('edit dialog');
            // 依有無處理時間決定要去哪一頁 (待處理/已處理)
            let data = result[0];
            // 已處理
            if (data.ResolvedTime) {
                $state.go('roProcessResolved', { month: moment(data.AbnormalTime).format('YYYY/MM/DD') }, { location: 'replace' });
            } else if ($state.current.name !== 'roProcessPending') {
                // 待處理
                $state.go('roProcessPending', {}, { location: 'replace' });
            } else {
                $rootScope.$broadcast('refresh');
            }
        }, () => {

        });
    };

    $scope.del = function (item) {
        console.log('delete', item);
        if (item.Source !== 'manual') {
            showMessage($translate('roprocess.cannotDel'));
            return;
        }
        $mdDialog.show({
            controller: [
                DialogController
            ],
            template: `
            <md-dialog aria-label="刪除確認" style="height:auto">
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 translate>{{'labexam.labexam.confirmDelete'}}</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="$ctrl.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" translate>
                            {{'labexam.labexam.deleteRecord'}}
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button ng-click="$ctrl.cancel()">
                            {{'labexam.labexam.cancel' | translate}}
                        </md-button>
                        <md-button ng-click="$ctrl.ok()">
                            {{'labexam.labexam.delete' | translate}}
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>
            `,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: '$ctrl'
        });

        function DialogController() {
            const vm = this;
            vm.hide = function hide() {
                $mdDialog.hide();
            };

            vm.cancel = function cancel() {
                $mdDialog.cancel();
            };

            vm.ok = function ok() {
                roProcessService
                    .del(item.Id)
                    .then((q) => {
                        showMessage($translate('roprocess.dialog.delete') + $translate('roprocess.dialog.successfully'));
                    }).catch(() => {
                        showMessage($translate('roprocess.dialog.delete') + $translate('roprocess.dialog.failed'));
                    });
                    $mdDialog.hide(item);
            };
        }
    };
}

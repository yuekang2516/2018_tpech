import tpl from './weightHistory.component.html';
import './weightHistory.component.less';

angular.module('app').component('weightHistory', {
    template: tpl,
    controller: weightHistoryController
});

weightHistoryController.$inject = ['$scope', '$mdSidenav', 'weightHistoryService', 'SettingService', 'uiGridConstants'];

function weightHistoryController($scope, $mdSidenav, weightHistoryService, SettingService, uiGridConstants) {
    const self = this;


    self.durationQuery = new Date();

    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    self.toggleSideNav = function () {
        SettingService.setSideNavStatus(SettingService.getCurrentUser().Id, !SettingService.getSideNavStatus(SettingService.getCurrentUser().Id));
        // emit to parent
        $scope.$emit('toggleNav');

        setTimeout(() => {
            $scope.gridApi.core.handleWindowResize();
        }, 0);

    };

    self.$onInit = function () {
        // ui-grid init
        $scope.gridOptions = {
            enableColumnResizing: true,
            enableColumnMenus: false,   // https://stackoverflow.com/questions/32671202/remove-sorting-menu-from-ui-grid-column-header
            enableSorting: true,
            excessRows: 20,
            enableFiltering: true,
            onRegisterApi: function (gridApi) {     // http://ui-grid.info/docs/#!/tutorial/Tutorial:%20110%20Grid%20in%20a%20Modal
                $scope.gridApi = gridApi;
            }
            // enableHorizontalScrollbar: 0
        };

        self.highlightFilteredHeader = (row, rowRenderIndex, col, colRenderIndex) => {
            if (col.filters[0].term) {
                return 'header-filtered';
            }
            return '';
        };

        // ui-grid column
        let columns = [
            { name: 'MeasureTime', displayName: '量測時間', width: 96, sort: { direction: uiGridConstants.DESC }, pinnedLeft: true },
            { name: 'MedicalId', displayName: '病歷號', headerCellClass: self.highlightFilteredHeader, minWidth: 120 },
            { name: 'Name', displayName: '病人', headerCellClass: self.highlightFilteredHeader, minWidth: 120 },
            { name: 'Value', displayName: '體重（kg）', minWidth: 95, enableFiltering: false },
            { name: 'Type', displayName: '狀態', minWidth: 95 }
        ];

        $scope.gridOptions.columnDefs = columns;

        getData(self.durationQuery);
    };

    self.changeDurationQuery = function () {
        getData(self.durationQuery);
    };

    self.refresh = function () {
        getData(self.durationQuery);
    };

    function getData(recordTime) {
        self.loading = true;
        self.isError = false;
        self.serviceData = [];
        weightHistoryService.getByDate(recordTime).then((res) => {
            self.lastAccessTime = weightHistoryService.getLastAccessTime();
            // recordTime 改顯示格式
            self.serviceData = res.data;
            console.log('eee', res.data);
            if (self.serviceData.length > 0) {
                res.data.map((item) => {
                    item.MeasureTime = moment(item.MeasureTime).format('HH:mm:ss');
                    item.Type = item.Type === 'pre' ? '透析前' : '透析後';
                    return item;
                });
            }
            $scope.gridOptions.data = res.data;
            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

}

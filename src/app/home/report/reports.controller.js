import './reports.less';

angular.module('app')
    .controller('reportsController', reportsController);

reportsController.$inject = ['$http', '$scope', '$state', '$filter', 'SettingService'];
function reportsController($http, $scope, $state, $filter, SettingService) {
    const self = this;
    let previousSelected = {};
    let $translate = $filter('translate');

    self.$onInit = function onInit() {
        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getModuleFunctions();
        self.reportsitem = [
            {
                name: $translate('reports.component.serviceQuality'),
                page: 'serviceQuality'
            },
            {
                name: $translate('reports.component.allVisit'),
                page: 'allVisit'
            },
            // {
            //     name: $translate('reports.component.allCharge'),
            //     page: 'allCharge'
            // },
            // {
            //     name: $translate('reports.component.allEpo'),
            //     page: 'allEpo'
            // },
            {
                name: $translate('reports.component.demography'),
                page: 'demography'
            },
            {
                name: $translate('reports.component.allApo'),
                page: 'allApo'
            },
            {
                name: $translate('reports.component.allLabexam'),
                page: 'allLabexam'
            },
            {
                name: '備料報表',
                page: 'preparationReport'
            },
            {
                name: '耗材使用統計表',
                page: 'consumableReport'
            },
            {
                name: '透析機管理',
                page: 'machineManagement'
            }
        ];
        // 根據顯示順序，調整叫用func順序
        insertReportsitem('Epo');
        // insertReportsitem('Charge');
        self.selectitems(self.reportsitem[0]);
    };

    // 根據 ModuleFunctions，調整顯示
    function insertReportsitem(moduleName) {
        if (self.ModuleFunctions === null || self.ModuleFunctions[moduleName] === '1') {
            switch (moduleName) {
                case 'Charge':
                    self.reportsitem.splice(2, 0, {
                        name: $translate('reports.component.allCharge'),
                        page: 'allCharge'
                    });
                    break;
                case 'Epo':
                    self.reportsitem.splice(2, 0, {
                        name: $translate('reports.component.allEpo'),
                        page: 'allEpo'
                    });
                    break;
                default:
                    break;
            }
        }
    }


    // 選擇項目後
    self.selectitems = function selectitems(itemsActive) {
        // 先將之前選擇項目 css 效果移除
        if (previousSelected.isSelected) {
            previousSelected.isSelected = false;
        }
        // 將目前選擇的選取項, 套上 css 效果
        previousSelected = itemsActive;
        itemsActive.isSelected = true;
        $state.go(itemsActive.page, null, { location: 'replace' });
    };

    self.back = function back() {
        history.go(-1);
    };

}

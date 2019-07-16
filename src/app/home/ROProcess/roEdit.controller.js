
angular
    .module('app')
    .controller('roEditController', roEditController);

roEditController.$inject = ['cursorInput', '$mdDialog', '$mdSidenav', 'showMessage', 'SettingService', 'roProcessService', 'item', '$filter', '$state'];
function roEditController(cursorInput, $mdDialog, $mdSidenav, showMessage, SettingService, roProcessService, item, $filter, $state) {
    console.log('roEditController', item);

    const self = this;
    const $translate = $filter('translate');
    self.today = moment().format('YYYY-MM-DDT23:59:59');
    self.isCreate = item == null;

    // 今天的日期供畫面擋掉未來的時間
    // self.today = moment().add(1, 'days').format('YYYY-MM-DDT00:00');

    // 若未傳進 item 表示為新增，需給預設值
    self.selectedItem = angular.copy(item) || {
        Source: 'manual',
        AbnormalTime: new Date(moment().format('YYYY/MM/DD HH:mm'))
    };
    console.log('selected item ', item);

    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    // save
    self.ok = function ok() {
        console.log('item', self.selectedItem);

        // 決定處理人員是否要帶或清除
        let needAddResolvedUser = false;
        if (item && !item.ResolvedTime && self.selectedItem.ResolvedTime) {
            // 若原本的資料為未處理，則處理者帶現在登入者
            needAddResolvedUser = true;
        } else if (!item && self.selectedItem.ResolvedTime) {
            needAddResolvedUser = true;
        }

        // 根據上述判斷決定是否要帶入處理者或清掉
        if (needAddResolvedUser) {
            self.selectedItem.ResolvedUserId = SettingService.getCurrentUser().Id;
            self.selectedItem.ResolvedUserName = SettingService.getCurrentUser().Name;
        } else {
            self.selectedItem.ResolvedUserId = null;
            self.selectedItem.ResolvedUserName = null;
        }

        self.isSaving = true;
        // 修改
        if (item) {
            self.selectedItem.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.selectedItem.ModifiedUserName = SettingService.getCurrentUser().Name;
            roProcessService.put([self.selectedItem]).then((res) => {
                console.log('roProcessService put', self.selectedItem);
                showMessage($translate('roprocess.dialog.edit') + $translate('roprocess.dialog.successfully'));
                $mdDialog.hide(res.data);
            }).catch((err) => {
                console.error('roProcessService put', self.selectedItem);
                showMessage($translate('roprocess.dialog.edit') + $translate('roprocess.dialog.failed'));
            }).finally(() => {
                self.isSaving = false;
            });
        } else {
            // 新增
            self.selectedItem.CreatedUserId = SettingService.getCurrentUser().Id;
            self.selectedItem.CreatedUserName = SettingService.getCurrentUser().Name;
            roProcessService.post([self.selectedItem]).then((res) => {
                console.log('roProcessService post', self.selectedItem);
                showMessage($translate('roprocess.dialog.create') + $translate('roprocess.dialog.successfully'));
                $mdDialog.hide(res.data);
            }).catch((err) => {
                console.error('roProcessService post', self.selectedItem);
                showMessage($translate('roprocess.dialog.create') + $translate('roprocess.dialog.failed'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    self.checkNeedAutoResolvedTime = function () {
        if (self.selectedItem.ResolvedWay && !self.selectedItem.ResolvedTime) {
            self.selectedItem.ResolvedTime = new Date(moment().format('YYYY/MM/DD HH:mm'));
        }
    };

    self.checkResolvedTimeValid = function () {
        if (!self.selectedItem.ResolvedTime) {
            return;
        }

        // 異常時間是否比處理時間大
        if (moment(moment(self.selectedItem.AbnormalTime).format('YYYY/MM/DD HH:mm')).diff(moment(moment(self.selectedItem.ResolvedTime).format('YYYY/MM/DD HH:mm')), 'minutes') >= 0) {
            document.getElementById('resolvedTime').focus();
        }
    };

    // 插入片語
    let phraseTarget = null;
    self.isOpenRight = function isOpenRight(elementId) {
        phraseTarget = elementId;
        console.log('isOpenRight', elementId);
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function (e) {
        cursorInput($(`#${phraseTarget}`), e);
        //$mdSidenav('rightPhrase').close();
    };
}

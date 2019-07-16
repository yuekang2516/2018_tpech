angular
    .module('app')
    .factory('showMessage', ['$mdToast', 'SettingService', '$filter', '$state', function ($mdToast, SettingService, $filter, $state) {
        return function (msg, duration) {
            if (!duration) {
                duration = 5000;
            }

            let $translate = $filter('translate');
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .position('bottom left')
                    .hideDelay(duration)
            ).then(() => {
                // 檢查網路狀態
                // 因為會有網路已連線但 navigator.onLine 仍為 false 的情形，改成一斷線就固定 call api 確定網路狀態
                // https://bugs.chromium.org/p/chromium/issues/detail?id=678075
                if (!SettingService.isOnline()) {
                    // 提示使用者檢查網路
                    // 若為 login 頁面，有可能是因為伺服器位置設錯，須給另外的提示
                    let statusMsg = '';
                    if ($state.current.name === 'login') {
                        statusMsg = $translate('customMessage.OFFLINE_OR_SERVERERR');
                    } else {
                        statusMsg = $translate('customMessage.OFFLINE');
                    }

                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(statusMsg)
                            .hideDelay(false)
                    );
                }
            });
        };
    }]);

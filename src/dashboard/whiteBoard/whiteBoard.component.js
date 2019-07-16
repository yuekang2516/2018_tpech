import tpl from './whiteBoard.html';
import './whiteBoard.less';

angular.module('app').component('whiteBoard', {
    template: tpl,
    controller: whiteBoardCtrl
});

whiteBoardCtrl.$inject = ['$scope', '$window', '$timeout', 'whiteBoardService', 'SettingService', 'showMessage', '$sce', '$mdDialog', '$q', '$filter'];

function whiteBoardCtrl($scope, $window, $timeout, whiteBoardService, SettingService, showMessage, $sce, $mdDialog, $q, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let data = [];
    // 前端操作的資料
    vm.boardData = {
        leftOne: {
            Position: 'leftOne',
            Content: ''
        },
        leftTwo: {
            Position: 'leftTwo',
            Content: ''
        },
        rightOne: {
            Position: 'rightOne',
            Content: ''
        },
        rightTwo: {
            Position: 'rightTwo',
            Content: ''
        },
        rightThree: {
            Position: 'rightThree',
            Content: ''
        }
    };

    $scope.$on('connected', () => {
        console.log('whiteBoardCtrl connected');
        $timeout(() => {
            getData();
            vm.message = '';
        });
    });

    vm.$onInit = function () {
        $scope.tinymceOptionsLeftOne = {
            // setup: function (e) {
            //     e.on('change', function () {
            //         debugger;
            //     });
            // },
            inline: false,
            skin: false,
            autoresize_on_init: true,
            autoresize_min_height: 500,
            autoresize_max_height: 550,
            plugins: 'textcolor autoresize save',
            toolbar: 'save | fontsizeselect | bold italic underline strikethrough | forecolor backcolor',
            menubar: false,
            statusbar: false,
            save_enablewhendirty: false,
            save_onsavecallback: function () {
                save('leftOne');
            }
        };

        $scope.tinymceOptionsRightOne = {
            inline: false,
            skin: false,
            autoresize_on_init: true,
            autoresize_min_height: 200,
            autoresize_max_height: 250,
            plugins: 'textcolor autoresize save',
            toolbar: 'save | fontsizeselect | bold italic underline strikethrough | forecolor backcolor',
            menubar: false,
            statusbar: false,
            save_enablewhendirty: false,
            save_onsavecallback: function () {
                save('rightOne');
            }
        };

        $scope.tinymceOptionsRightTwo = {
            inline: false,
            skin: false,
            autoresize_on_init: true,
            autoresize_min_height: 200,
            autoresize_max_height: 250,
            plugins: 'textcolor autoresize save',
            toolbar: 'save | fontsizeselect | bold italic underline strikethrough | forecolor backcolor',
            menubar: false,
            statusbar: false,
            save_enablewhendirty: false,
            save_onsavecallback: function () {
                save('rightTwo');
            }
        };

        $scope.tinymceOptionsLeftTwo = {
            inline: false,
            skin: false,
            autoresize_on_init: true,
            autoresize_min_height: 200,
            autoresize_max_height: 250,
            plugins: 'textcolor autoresize save',
            toolbar: 'save | fontsizeselect | bold italic underline strikethrough | forecolor backcolor',
            menubar: false,
            statusbar: false,
            save_enablewhendirty: false,
            save_onsavecallback: function () {
                save('leftTwo');
            }
        };

        $scope.tinymceOptionsRightThree = {
            inline: false,
            skin: false,
            autoresize_on_init: true,
            autoresize_min_height: 200,
            autoresize_max_height: 250,
            plugins: 'textcolor autoresize save',
            toolbar: 'save | fontsizeselect | bold italic underline strikethrough | forecolor backcolor',
            menubar: false,
            statusbar: false,
            save_enablewhendirty: false,
            save_onsavecallback: function () {
                save('rightThree');
            }
        };

        // load data
        vm.loading = true;
        whiteBoardService.connect();
        // getDataFromServer();
    };

    vm.$onDestroy = function () {
        // 停止 signalR 連線
        whiteBoardService.disconnect();
    };

    // 顯示所有白板資料
    whiteBoardService.showAll = function (info) {
        $timeout(() => {
            data = info;
            loadData(data);
            vm.message = '';
            vm.loading = false;
        });
    };

    // 更新所有白板資料
    whiteBoardService.updateWhiteBoard = function (info) {
        $timeout(() => {
            data = info;
            loadData(data);
        });
    };

    // signalR 相關事件
    // whiteBoardService.connecting = function connecting() {
    //     $timeout(() => {
    //         vm.message = '伺服器連線中...';
    //     });
    // };

    // whiteBoardService.connected = function connected() {
    //     $timeout(() => {
    //         getData();
    //         vm.message = '';
    //     });
    // };

    function getData() {
        vm.loading = true;
        whiteBoardService.getWhiteBoard(SettingService.getCurrentUser().HospitalId);
    }

    // whiteBoardService.reconnecting = function reconnecting() {
    //     $timeout(() => {
    //         vm.message = '重新連線中...';
    //     });
    // };

    // whiteBoardService.disconnected = function disconnected() {
    //     $timeout(() => {
    //         vm.message = '伺服器已中斷...';
    //     });
    // };

    function getDataFromServer() {
        vm.loading = true;
        whiteBoardService.get(true).then((res) => {
            if (res.data) {
                if (res.data.length > 0) {
                    data = angular.copy(res.data);
                    // 依據 position 取得是哪一區塊的內容
                    loadData(data);

                    // 模式換為唯讀
                    vm.editable = false;
                }
            }
            vm.loading = false;
        }, () => {
            vm.loading = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    function loadData(currentData) {
        // 清空 vm.boardData content，再重塞
        _.forEach(vm.boardData, (item) => {
            item.Content = '';
        });

        // 依據 position 取得是哪一區塊的內容
        _.forEach(currentData, (item) => {
            switch (item.Position) {
                case 'leftOne':
                    vm.boardData.leftOne = item;
                    break;
                case 'leftTwo':
                    vm.boardData.leftTwo = item;
                    break;
                case 'rightOne':
                    vm.boardData.rightOne = item;
                    break;
                case 'rightTwo':
                    vm.boardData.rightTwo = item;
                    break;
                case 'rightThree':
                    vm.boardData.rightThree = item;
                    break;
                default:
                    break;
            }
        });
    }

    function saveAll() {
        vm.loading = true;
        let executionArray = [];
        let savingError = false;

        _.forEach(vm.boardData, (item) => {
            let whileBoard = _.find(data, { 'Position': item.Position });
            // 從 data 抓取資料，沒有的新增，有值的修改
            if (whileBoard) {
                // 修改
                executionArray.push(
                    whiteBoardService.put(whileBoard).then((res) => {
                        item = res.data;
                    }, () => {
                        savingError = true;
                    })
                );
            } else {
                // 新增
                executionArray.push(
                    whiteBoardService.post(item).then((res) => {
                        item = res.data;
                    }, () => {
                        savingError = true;
                    })
                );
            }
        });

        $q.all(executionArray).then(() => {
            if (!savingError) {
                showMessage('儲存成功');
                vm.editable = false;
            } else {
                showMessage('儲存失敗，請重新儲存');
            }
            vm.loading = false;
        });

    }

    // 單獨區塊的儲存
    function save(position) {
        vm.loading = true;
        // 由是否有 Id 判斷是新增或修改
        if (vm.boardData[position] && vm.boardData[position].Id) {
            // 修改
            whiteBoardService.put(vm.boardData[position]).then((res) => {
                vm.boardData[position] = res.data;
                showMessage('儲存成功');
                vm.loading = false;
            }, () => {
                showMessage('儲存失敗，請重新儲存');
                vm.loading = false;
            });
        } else {
            // 新增
            whiteBoardService.post(vm.boardData[position]).then((res) => {
                vm.boardData[position] = res.data;
                showMessage('儲存成功');
                vm.loading = false;
            }, () => {
                showMessage('儲存失敗，請重新儲存');
                vm.loading = false;
            });
        }
    }

    vm.trustedHtml = function (txt) {
        return $sce.trustAsHtml(txt);
    };

    vm.changeMode = function (isEditable = false) {
        // 若為從編輯模式切為唯讀模式，若內容有變動，跳提示詢問是否需要儲存
        if (!isEditable) {
            // check whether text is change
            let isDiff = false;   // 內容是否有變動並尚未儲存
            whiteBoardService.get().then((res) => {
                if (res.data) {
                    _.forEach(vm.boardData, (d) => {
                        let whiteboard = _.find(res.data, { 'Position': d.Position });
                        // 點"儲存並離開編輯模式"的提示訊息畫面
                        // 1. 資料庫無此筆，但 web 有值顯示
                        // 2. web 的值與資料庫不符時顯示
                        if ((whiteboard === undefined && d.Content.length > 0) || (whiteboard && d.Content !== whiteboard.Content)) {
                            isDiff = true;
                            return false;
                        }
                    });

                    // 若有異動，顯示是否儲存的提示
                    if (isDiff) {
                        showSaveDialog();
                    } else {
                        vm.editable = false;
                        vm.loading = false;
                    }
                }
            }, () => {
                vm.loading = false;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
        } else {
            vm.editable = isEditable;
        }
    };

    function showSaveDialog() {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template:
            `<md-dialog aria-label="儲存確認">
          <form ng-cloak>
              <md-toolbar>
                  <div class="md-toolbar-tools">
                      <h2>確認儲存</h2>
                      <span flex></span>
                      <md-button class="md-icon-button" ng-click="vm.cancel()">
                          <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                      </md-button>
                  </div>
              </md-toolbar>

              <md-dialog-content>
                  <div class="md-dialog-content">
                      是否儲存目前內容?
                  </div>
              </md-dialog-content>

              <md-dialog-actions layout="row">
                  <md-button class="md-raised" ng-click="vm.cancel()">
                      否
                  </md-button>
                  <md-button class="md-primary md-raised" ng-click="vm.ok()">
                      儲存
                  </md-button>
              </md-dialog-actions>
          </form>
      </md-dialog>`,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        }).then(() => {
        }, () => {
            // 取消則將 data 回復為之前的
            getDataFromServer();
        });

        function showDialogController(mdDialog) {
            const vm = this;

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                // 將所有內容儲存
                saveAll();
                mdDialog.hide();
            };
        }
    }
}

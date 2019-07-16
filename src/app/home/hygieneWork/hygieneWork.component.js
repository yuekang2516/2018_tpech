import tpl from './hygieneWork.html';
import './hygieneWork.less';
import dotMenuTpl from './dotMenu.html';
import addMenuTpl from './addMenu.html';
import newFolderTpl from './fileFolderNameDialog.html';
import allFoldersTpl from './allFoldersDialog.html';

angular.module('app').component('hygieneWork', {
    template: tpl,
    controller: hygieneWorkCtrl
});

hygieneWorkCtrl.$inject = ['$localStorage', '$http', '$scope', '$state', '$filter', '$mdSidenav', '$mdBottomSheet', '$window', '$stateParams', '$sessionStorage', 'SettingService', 'hygieneWorkService', 'showMessage', 'Upload'];

// [hygieneWorkCtrl]
function hygieneWorkCtrl($localStorage, $http, $scope, $state, $filter, $mdSidenav, $mdBottomSheet, $window, $stateParams, $sessionStorage, SettingService, hygieneWorkService, showMessage, Upload) {
    const self = this;
    let $translate = $filter('translate');
    let currentUserId = $localStorage.currentUser.Id;

    // 前端真正顯示的data
    self.finalData = {
        folder: [],
        singleFile: []
    };

    self.ParentFolderId = null;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    self.toggleSideNav = function () {
        // if the toggle nav status is true
        if (SettingService.getSideNavStatus(currentUserId) === true) {
            // set the status to false
            SettingService.setSideNavStatus(currentUserId, false);
        } else {
            // set the status to true
            SettingService.setSideNavStatus(currentUserId, true);
        }
        // emit to parent
        $scope.$emit('toggleNav');
    };

    // 判斷目前是在哪個子畫面
    // 辨識環境
    self.isBrowser = cordova.platformId === 'browser';
    // document.addEventListener('deviceready', onDeviceReady, false);
    if (!self.isBrowser) {
        document.addEventListener('deviceready', onDeviceReady, false);
    }

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        console.log('Cordova准备好了', cordova);
    }

    // 用麵包屑捷徑更改路由
    self.changeState = function changeState(Url) {
        const parts = Url.split('/');
        // 判斷是不是次目錄
        if (parts.length > 3) {
            // 判斷是不是當前state，如果是就reload
            if ($stateParams.folderId === parts[4]) {
                $state.reload();
            } else {
                $state.go('hygieneWorkInFolder', { folderId: parts[4] });
            }
        } else { // 回主目錄
            $state.go('hygieneWork');
        }
    };

    // 麵包屑(捷徑)
    function getBreadcrumb(dirId) {
        self.breadcrumb = [];
        let breadItem = {};
        if (dirId !== '') {
            // 取得後台所有資料
            hygieneWorkService.getAllFilesFolders().then((q) => {
                self.fullData = q.data;
                // 從目前位置一層層往上取
                while (dirId !== null) {
                    self.fullData.filter((item) => {
                        if (item.Id === dirId && item.IsFolder === 'true') {
                            breadItem = {};
                            breadItem.Name = item.Title;
                            breadItem.Url = '/index.html#/hygieneWork/folders/' + dirId;
                            self.breadcrumb.push(breadItem);
                            dirId = item.ParentFolderId;
                        }
                    });
                }
                // 再加上根目錄項目為最上層
                breadItem = {};
                breadItem.Name = '衛教作業';
                breadItem.Url = '/index.html#/hygieneWork';
                self.breadcrumb.push(breadItem);
                // 麵包屑完成(顯示時反向排序)
                console.log('self.breadcrumb:', self.breadcrumb);
            });
        }
    }

    self.$onInit = function onInit() {
        loadData();
    };

    function loadData() {
        let preDataObj = {};
        self.loading = true;

        // 判斷是否為次目錄中 hygieneWorkInFolder
        if ($state.current.name === 'hygieneWorkInFolder') {
            self.currentName = 'hygieneWorkInFolder';
            self.toolbarTitle = $sessionStorage.folderName;
            self.ParentFolderId = $stateParams.folderId; // 目前所在目錄的Id
        } else {
            // root 的畫面
            self.toolbarTitle = '衛教作業';
            self.currentName = 'hygieneWork';
            self.ParentFolderId = ''; // 目前所在目錄的Id, 根目錄所以 ''
        }

        // 取得指定資料夾(self.ParentFolderId)內所有目錄及檔案
        hygieneWorkService.getInFolderFiles(self.ParentFolderId).then((q) => {
            if (q.data.length > 0) {
                let inFolderData = q.data;
                console.log('hygieneWorkInFolder data', inFolderData);
                // 區分目錄及檔案
                preDataObj = filterSortFinalData(inFolderData);
                console.log('preDataObj:', preDataObj);
            } else {
                self.loading = false;
                // 初始化(要再初始化為空陣列，否則會是undefined)
                preDataObj.folder = [];
                preDataObj.singleFile = [];
            }
            // 塞入finalData裡, 供畫面顯示
            self.finalData.folder = preDataObj.folder;
            self.finalData.singleFile = preDataObj.singleFile;
        }, (error) => {
            console.log('onInit error', error);
            self.loading = false;
            self.isError = true;
        });
        // 取麵包屑
        getBreadcrumb(self.ParentFolderId);
    }

    // 分類排序前端顯示資料
    function filterSortFinalData(dataArray) {
        let obj = {};
        obj.folder = [];
        obj.singleFile = [];
        // 分類：folder, singleFile
        _.filter(dataArray, function (o) {
            if (o.IsFolder === 'true' && o.Status !== 'Deleted') {
                obj.folder.push(o);
            } else if (o.IsFolder === 'false' && o.Status !== 'Deleted') {
                obj.singleFile.push(o);
            }
        });
        self.loading = false;
        return obj;
    }

    // 顯示個別 dotMenu (v重新命名 reName, x移至 moveTo..., v刪除 deleteOneFile)
    self.showDotMenu = function (value, item) {
        console.log('顯示個別 dotMenu');
        let data = {
            fileObj: value,
            fullObj: item
        };
        $mdBottomSheet.show({
            template: dotMenuTpl,
            parent: angular.element(document.body),
            controller: dotMenuController,
            clickOutsideToClose: true,
            controllerAs: 'dotMenu',
            locals: {
                data
            }
          }).then(function (ok) {
            loadData(); // 重刷(此目錄)畫面
          }).catch(function (error) {
            console.log('dot bottom error', error);
          });
    };

    // 顯示 addMenu (v檔案上傳, v新增資料夾)
    self.showAddMenu = function (value, item) {
        console.log('顯示 addMenu');
        let data = {
            ParentFolderId: value,
            fullObj: item
        };
        $mdBottomSheet.show({
            template: addMenuTpl,
            parent: angular.element(document.body),
            controller: addMenuController,
            clickOutsideToClose: true,
            controllerAs: 'addMenu',
            locals: {
                data
            }
        }).then(function (ok) {
            // self.loading = true;

        }).catch(function (error) {
            console.log('add bottom error', error);
        }).finally(() => {
            // self.loading = false;
        });
    };

    // 點擊單一檔案條
    self.clickFile = (key, item) => {
        if (key === 'folder') { // 進入folder
            console.log('進入folder item', item);
            if (!$sessionStorage.folderName) {
                $sessionStorage.folderNameArray = []; // 存入依序進入的 folder name
            }
            $sessionStorage.folderNameArray.push(item.Title);
            $sessionStorage.folderName = item.Title;
            $state.go('hygieneWorkInFolder', { folderId: item.Id });
        } else { // 開啟檔案
            console.log('開啟檔案');
            hygieneWorkService.getSingle(item.Id).then((q) => {
                let single = q.data;
                console.log('file:', q.data);

                let path = SettingService.getServerUrl() + '/Upload/down/' + single.FileId + '?fileType=' + single.FileType + '&fileName=' + single.FileName;
                // let typeArray = ['txt', 'jpg', 'bmp', 'pdf'];
                // if (typeArray.indexOf(single.FileType) === -1) {
                //     path += '&fileName=' + single.FileName;
                // }
                // plugin InAppBrowser 在deploy時，會影響原生的 window.open，所以要多加判斷
                if (cordova.InAppBrowser) { // cordova
                    // cordova.InAppBrowser.open('http://apache.org', '_blank', 'location=yes');
                    cordova.InAppBrowser.open(path, '_blank', 'location=yes');
                    // $window.open(url, '_system', 'location=yes'); // 寫這樣也可以，應該是_blank會衝突
                    console.log('cordova browser');
                } else { // browser
                    // $window.open('http://apache.org', '_blank');
                    // if (single.FileType === 'mp4' || single.FileType === 'mp3' || single.FileType === 'AVI') {
                    //     let videopath = '<html><body><div><video width="640" height="368" src=' + path + ' controls="controls" autoplay="autoplay" /></div></body></html>';
                    //     let w = window.open('about:blank', 'MyWindow');
                    //     w.document.write(videopath);
                    //     w.document.close();
                    // } else {
                        // 目前 jpg 與 pdf, txt OK!!
                        // 目前 doc, docx, xsl, csv, avi, ... 會自動變成下載
                        console.log('path:', path);
                        $window.open(path, '_blank');
                    // }
                    console.log('一般browser');
                }
            }, (error) => {
                // showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                console.log('clickFile error', error);
            });
        }
    };

    self.$onDestroy = function $onDestroy() {
        if (!self.isBrowser) {
            document.removeEventListener('deviceready', onDeviceReady, false);
        }
        // 離開 hygieneWorkInFolder 才刪除
        if ($state.current.name !== 'hygieneWorkInFolder') {
            console.log('$onDestroy!!!!!!!!!');
            delete $sessionStorage.folderNameArray;
            delete $sessionStorage.folderName;
        }
    };

    self.back = function back() {
        // 如果 url folders/有值
        if ($sessionStorage.folderNameArray && $sessionStorage.folderNameArray.length > 0) {
            // 移除最後一個 item
            $sessionStorage.folderNameArray.pop();
            console.log('回上頁 lastItemName', _.last($sessionStorage.folderNameArray));
            // 移除後剩下陣列中的最後一個
            $sessionStorage.folderName = _.last($sessionStorage.folderNameArray);
        }
        history.go(-1);
    };
}

// [dotMenuController] 配合 dotMenu.html
angular.module('app').controller('dotMenuController', dotMenuController);
dotMenuController.$inject = ['$state', '$mdBottomSheet', 'data', '$mdDialog', 'hygieneWorkService', 'showMessage', '$filter'];
function dotMenuController(
    $state,
    $mdBottomSheet,
    data,
    $mdDialog,
    hygieneWorkService,
    showMessage,
    $filter
) {
    const self = this;
    let $translate = $filter('translate');
    let preDataObj = {};

    // 移至畫面顯示用的data
    self.moveToData = {
        folder: []
    };

    // 修改檔名：不同地方
    const editNameTagEnum = {
        DOT_EDIT_FOLDER_NAME: 'dotEditFolderName', // 目錄重新命名
        DOT_EDIT_FILE_NAME: 'dotEditFileName' // 檔案重新命名
    };
    console.log('dotMenuController');
    self.fileObj = data.fileObj;
    self.fullObj = data.fullObj;

    // 重新命名：dotEditFolderName / dotEditFileName
    self.reName = (fileObj) => {
        // 填寫 folder name 的 dialog
        console.log('fileObj:', fileObj);
        let tag = editNameTagEnum.DOT_EDIT_FILE_NAME; // 檔案重新命名
        if (fileObj.IsFolder === 'true') {
            tag = editNameTagEnum.DOT_EDIT_FOLDER_NAME; // 目錄重新命名
        }
        let dialogData = {
            editNameTag: tag,
            previousName: fileObj.Title,
            fileFolderName: fileObj.Title
        };
        $mdDialog.show({
            controller: fileFolderNameDialogController,
            template: newFolderTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                dialogData
            }
          }).then(function (ok) {
            if (fileObj.IsFolder === 'true') {
                // 資料夾
                data.editNameTag = editNameTagEnum.DOT_EDIT_FOLDER_NAME; // 資料夾重新命名
                fileObj.Title = dialogData.fileFolderName;
            } else {
                // 檔案
                data.editNameTag = editNameTagEnum.DOT_EDIT_FILE_NAME; // 檔案重新命名
                fileObj.Title = dialogData.fileFolderName;
            }
            hygieneWorkService.put(fileObj).then(() => {
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            }, () => {
                showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            });
            self.hide(); // 關掉 dotMenu
          }).catch(function (cancel) {
            console.log('reNamme cancel');
            self.cancel(); // 關掉 dotMenu
          });
    }; // self.reName

    // 移至...
    // 所有資料夾的清單 allFoldersDialog
    self.moveTo = (fileObj) => {
        // 先取得根目錄的目錄清單, 若要移動的目標物是目錄, 則清單中要排除自已...)
        // fileObj.IsFolder === "true"
        hygieneWorkService.getInFolderFiles('').then((q) => {
            if (q.data.length > 0) {
                let inFolderData = q.data;
                // 只取目錄, fileObj.IsFolder === "true" 時, 不含自已這個目錄
                preDataObj = filterSortFolder(inFolderData, fileObj);
                console.log('preDataObj:', preDataObj);
            } else {
                self.loading = false;
                // 初始化(要再初始化為空陣列，否則會是undefined)
                preDataObj.folder = [];
            }
            // 塞入finalData裡, 供畫面顯示
            self.moveToData.folder = preDataObj.folder;
            let dialogData = {
                allFoldersList: self.moveToData
            };
            $mdDialog.show({
                controller: allFoldersDialogController,
                template: allFoldersTpl,
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                controllerAs: 'dialog',
                locals: {
                    dialogData
                }
              }).then(function (ok) {
                console.log('dotMenuController 的 ok!');
                fileObj.ParentFolderId = dialogData.fileFolderId;
                fileObj.ParentFolderName = dialogData.fileFolderName;
                hygieneWorkService.put(fileObj).then(() => {
                    showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                }, () => {
                    showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                });
                self.hide(); // 關掉 allFoldersDialog
              }).catch(function (cancel) {
                console.log('allFoldersDialog cancel');
                self.cancel(); // 關掉 allFoldersDialog
              });

            }, (error) => {
            console.log('moveTo error', error);
            self.loading = false;
            self.isError = true;
        });
    };

    // 刪除
    self.deleteOneFile = (ev, fileObj, fullObj) => {
        let kind = '';
        if (fileObj.IsFolder === 'true') {
            kind = '目錄';
        } else {
            kind = '檔案';
        }
        // 設定對話視窗參數
        const confirm = $mdDialog.confirm()
        .title('刪除確認') // '刪除確認' $translate('phrase.component.confirmDelete')
        .textContent(`您即將刪除 ${kind} : ${fileObj.Title} (${fileObj.FileName})，點擊確認後將會刪除此項目!`) // `您即將刪除${vm.type}，點擊確認後將會刪除此內容，已刪除內容可於顯示刪除模式中復原`  $translate('phrase.component.textContent', { type: vm.type })
        .ariaLabel('delete confirm')
        .ok('刪除') // '確認'  $translate('phrase.component.deleteOk')
        .cancel('取消'); // '取消'  $translate('phrase.component.deleteCancel')

        // 呼叫對話視窗
        $mdDialog.show(confirm).then(function (ok) {
            hygieneWorkService.delete(fileObj.Id).then((q) => {
                let index = _.findIndex(fullObj, { Id: fileObj.Id });
                if (index > -1) {
                    fullObj.splice(index, 1);
                }
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
            }, () => {
                showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
            });
            self.hide(); // 關掉 dotMenu
        }).catch(function (cancel) {
            showMessage('取消刪除');
            self.cancel(); // 關掉 dotMenu
        });
    };

    self.hide = function () {
        $mdBottomSheet.hide();
    };

    self.cancel = function cancel() {
        $mdBottomSheet.cancel();
    };

    // 只取目錄
    function filterSortFolder(dataArray, fileObj) {
        let obj = {};
        obj.folder = [];
        // 分類：folder, singleFile
        _.filter(dataArray, function (o) {
            if (o.IsFolder === 'true' && o.Status !== 'Deleted') {
                if (fileObj.IsFolder === 'true' && o.Id === fileObj.Id) {
                    // 不處理
                } else {
                    obj.folder.push(o);
                }
            }
        });
        self.loading = false;
        return obj;
    }
}

// [addMenuController]
angular.module('app').controller('addMenuController', addMenuController);
addMenuController.$inject = ['$state', '$mdBottomSheet', 'data', '$mdDialog', '$filter', 'hygieneWorkService'];
function addMenuController(
    $state,
    $mdBottomSheet,
    data,
    $mdDialog,
    $filter,
    hygieneWorkService
) {
    console.log('data:', data);
    const self = this;
    self.ParentFolderId = data.ParentFolderId;
    console.log('self.ParentFolderId:', self.ParentFolderId);
    let $translate = $filter('translate');
    console.log('addMenuController');

    // 新增檔名/目錄：不同地方
    const editNameTagEnum = {
        ADD_NEW_FOLDER_NAME: 'addNewFolderName',
        ADD_NEW_FILE_NAME: 'addNewFileName'
    };

    // 上傳檔案：有選擇檔案時
    self.selectFiles = () => {
        let dialogData = {
            editNameTag: editNameTagEnum.ADD_NEW_FILE_NAME
        };
        $mdDialog.show({
            controller: fileFolderNameDialogController,
            template: newFolderTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                dialogData
            }
        }).then(function (ok) {
            console.log('上傳檔案 fileFolderNameDialog ok');
            let file = dialogData.upoladfile; // document.getElementById("upfile").files[0]
            console.log('file:', file);
            hygieneWorkService.uploadFiles(file).then((q) => {
                console.log('q:', q);
                let newFolderObj = {
                    ParentFolderId: self.ParentFolderId === '' ? null : self.ParentFolderId,
                    Title: q.data[0].FileName.substring(0, q.data[0].FileName.lastIndexOf('.')),
                    FileName: q.data[0].FileName,
                    size: q.data[0].Size,
                    FileId: q.data[0].FSFileName,
                    uploadTime: moment().format('YYYY/MM/DD HH:mm:ss'),
                    IsFolder: 'false',
                    FileType: q.data[0].FileName.substring(q.data[0].FileName.lastIndexOf('.') + 1).toLowerCase()
                };

                hygieneWorkService.post(newFolderObj).then((res) => {
                    data.fullObj.singleFile.push(res.data);
                    console.log('新的上傳檔案陣列', data.fullObj.singleFile);
                    // showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                }, (error) => {
                    console.log('uploadFiles error', error);
                    // showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                });
            });

            self.hide(); // 關掉 addMenu
        }).catch(function (cancel) {
            console.log('new folder cancel');
            self.cancel(); // 關掉 addMenu
        });
    };

    // 新增資料夾
    self.newFolder = () => {
        // 填寫 folder name 的 dialog
        let dialogData = {
            editNameTag: editNameTagEnum.ADD_NEW_FOLDER_NAME
        };
        $mdDialog.show({
            controller: fileFolderNameDialogController,
            template: newFolderTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                dialogData
            }
        }).then(function (ok) {
            console.log('新增資料夾 fileFolderNameDialog ok', dialogData.fileFolderName);
            // 在這裡組裝新增資料夾物件
            data.newFolderObj = {
                ParentFolderId: data.ParentFolderId === '' ? null : data.ParentFolderId, // 現在在哪個資料夾內
                Title: dialogData.fileFolderName,
                size: null,
                uploadTime: moment().format('YYYY/MM/DD HH:mm:ss'),
                IsFolder: 'true',
                FileType: 'Folder'
            };
            console.log('新增資料夾 newFolderObj:', data.newFolderObj);
            hygieneWorkService.post(data.newFolderObj).then((q) => {
                data.fullObj.folder.push(q.data);
                console.log('新增資料夾 新的上傳目錄陣列', data.fullObj.folder);
                // showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            }, (error) => {
                console.log('post error', error);
                // showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            });

            self.hide(); // 關掉 addMenu
        }).catch(function (cancel) {
            console.log('new folder cancel');
            self.cancel(); // 關掉 addMenu
        });
    };

    self.hide = function () {
        $mdBottomSheet.hide();
    };

    self.cancel = function cancel() {
        console.log('self.cancel');
        $mdBottomSheet.cancel();
    };
}

// [fileFolderNameDialog]  fileFolderNameDialog.html , "重新命名" 功能, "新增資料夾" 功能使用
angular.module('app').controller('fileFolderNameDialogController', fileFolderNameDialogController);
fileFolderNameDialogController.$inject = ['$mdDialog', 'dialogData', '$filter'];
function fileFolderNameDialogController(mdDialog, dialogData, $filter) {
    const vm = this;
    let $translate = $filter('translate');

    // 控制前端顯示內容
    vm.editNameTag = dialogData.editNameTag;
    console.log('editNameTag', vm.editNameTag);
    // dotEditFolderName / dotEditFileName：改檔案名時，若原先有名，要顯示舊名字
    if (dialogData.previousName) {
        vm.fileFolderName = dialogData.previousName;
    }

    vm.ok = function () {

        if (vm.editNameTag === 'addNewFileName') {
            // 上傳檔案 名稱
            dialogData.upoladfile = document.getElementById('upfile').files[0];
        } else {
            // 資料夾 名稱
            dialogData.fileFolderName = vm.fileFolderName;
        }

        mdDialog.hide();
    };

    vm.cancel = function cancel() {
        mdDialog.cancel();
    };
}

// [allFoldersDialog]  allFoldersDialog.html, "移至" 功能使用
angular.module('app').controller('allFoldersDialogController', allFoldersDialogController);
allFoldersDialogController.$inject = ['$mdDialog', 'dialogData', '$filter', 'hygieneWorkService'];
function allFoldersDialogController(mdDialog, dialogData, $filter, hygieneWorkService) {
    const vm = this;
    let preDataObj = {};
    vm.folderNameList = []; // 上方顯示目前位置
    let $translate = $filter('translate');
    vm.currentFolder = null;
    vm.allFoldersList = dialogData.allFoldersList;
    vm.ok = function () {
        console.log('allFoldersDialogController 的 ok!');
        // 資料夾 or 檔案 名稱
        if (vm.currentFolder === null) { // 根目錄
            vm.fileFolderName = '/';
            vm.fileFolderId = null;
        } else {
            vm.fileFolderName = vm.currentFolder.Title;
            vm.fileFolderId = vm.currentFolder.Id;
        }
        // console.log('vm.fileFolderName:', vm.fileFolderName);
        dialogData.fileFolderName = vm.fileFolderName;
        dialogData.fileFolderId = vm.fileFolderId;
        mdDialog.hide();
    };
    vm.cancel = function cancel() {
        mdDialog.cancel();
    };

    // 點擊單一目錄進入
    vm.clickFile = (item) => {
        console.log('進入folder item', item);
        vm.folderNameList.push(item.Title);
        vm.currentFolder = item;
        // 取得指定資料夾(self.ParentFolderId)內所有目錄及檔案
        hygieneWorkService.getInFolderFiles(item.Id).then((q) => {
            console.log('q:', q);
            if (q.data.length > 0) {
                let inFolderData = q.data;
                // 只取目錄, fileObj.IsFolder === "true" 時, 不含自已這個目錄
                preDataObj = filterSortFolder(inFolderData, item);
                console.log('preDataObj:', preDataObj);
            } else {
                self.loading = false;
                // 初始化(要再初始化為空陣列，否則會是undefined)
                preDataObj.folder = [];
            }
            // 塞入finalData裡, 供畫面顯示
            vm.allFoldersList = preDataObj;
        }, (error) => {
            console.log('onInit error', error);
            self.loading = false;
            self.isError = true;
        });
    };

    // 只取目錄
    function filterSortFolder(dataArray, fileObj) {
        let obj = {};
        obj.folder = [];
        // 分類：folder, singleFile
        _.filter(dataArray, function (o) {
            if (o.IsFolder === 'true' && o.Status !== 'Deleted') {
                if (fileObj.IsFolder === 'true' && o.Id === fileObj.Id) {
                    // 不處理
                } else {
                    obj.folder.push(o);
                }
            }
        });
        self.loading = false;
        return obj;
    }
}

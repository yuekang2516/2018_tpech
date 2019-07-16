import tpl from './adminFile.component.html';
import './adminFile.component.less';
import dotMenuTpl from './dotMenu.html';
import addFileTpl from './addFileDialog.html';
import reNameTpl from './reNameDialog.html';
import deleteTpl from './deleteDialog.html';


angular.module('app').component('adminFile', {
    template: tpl,
    controller: adminFileCtrl
});

adminFileCtrl.$inject = ['$q', '$localStorage', '$mdDialog', '$scope', '$state', '$mdSidenav', '$mdBottomSheet', '$window', '$stateParams', '$sessionStorage', 'SettingService', 'adminFileService', 'showMessage'];
function adminFileCtrl($q, $localStorage, $mdDialog, $scope, $state, $mdSidenav, $mdBottomSheet, $window, $stateParams, $sessionStorage, SettingService, adminFileService, showMessage) {
    const self = this;

    // 判斷是否為後台還是被叫用的
    self.isAdmin = $state.current.name === 'adminFile';

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    // 真正的資料
    let realAllData = [];
    // 顯示用：前端真正顯示的data  uploadFiles
    self.finalData = {
        singleFile: [],
        // folder: [], // 暫時不使用
    };
    self.classList = []; // 檔案類別清單
    self.classListForDialog = []; // 檔案類別清單 for dialog (去除"無類別"選項)

    // 判斷目前是在哪個子畫面
    // 辨識環境
    self.isBrowser = cordova.platformId === 'browser';

    self.$onInit = function onInit() {
        // 初始時預設選單為"全部"
        self.selectedClass = null;
        loadData();
    };

    function loadData() {
        const deferred = $q.defer();
        self.loading = true;

        // 真正的資料
        realAllData = [];
        // 顯示用：前端真正顯示的data  uploadFiles
        self.finalData = {
            singleFile: [],
            // folder: [], // 暫時不使用
        };
        self.classList = []; // 檔案類別清單
        self.classListForDialog = []; // 檔案類別清單 for dialog (去除"無類別"選項)

        // 取得所有檔案
        adminFileService.getAllFiles().then((q) => {
            self.isError = false;
            // 處理不是陣列或是空陣列的時候
            if (!Array.isArray(q.data) || (Array.isArray(q.data) && q.data.length === 0)) {
                deferred.resolve();
                return;
            }
            // 已確定 q.data 為陣列的型態
            // 取得全部資料
            // 先存到陣列中
            realAllData = q.data;
            self.finalData.singleFile = angular.copy(q.data);
            console.log('全部資料 realAllData', realAllData);
            console.log('全部資料 singleFile', self.finalData.singleFile);

            // 檔案類別清單：取出所有的類別組成 array -> classList
            let classSet = new Set(_.map(realAllData, (v) => {
                return v.Class || '無類別';
            }).sort());
            // Set 轉 Array
            self.classList = Array.from(classSet);
            self.classListForDialog = angular.copy(self.classList);
            console.log('類別清單 self.classList', self.classList);
            console.log('類別清單 self.classListForDialog', self.classListForDialog);
            deferred.resolve();
        }).catch((error) => {
            console.log('onInit error', error);
            self.isError = true;
            deferred.reject();
        }).finally(() => {
            self.loading = false;
        });
        return deferred.promise;
    }

    // 選擇類別
    self.changeFileClass = function () {
        if (self.selectedClass != null) {
            if (self.selectedClass == '無類別') {
                self.finalData.singleFile = _.filter(realAllData, (o) => {
                    return o.Class == null;
                });
                return;
            }
            self.finalData.singleFile = _.filter(realAllData, (o) => {
                return o.Class == self.selectedClass;
            });
            if (self.finalData.singleFile.length == 0) {
                self.selectedClass = null;
                self.finalData.singleFile = angular.copy(realAllData);
            }
        } else {
            self.finalData.singleFile = angular.copy(realAllData);
        }
    };

    // 上傳檔案：有選擇檔案時 classList => classListForDialog
    self.addFile = (classList) => {
        let dialogData = {
            classList
        };
        $mdDialog.show({
            controller: addFileDialogController,
            template: addFileTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: false, //  確保資料上傳成功才能消失
            controllerAs: 'dialog',
            locals: {
                dialogData
            }
        }).then(function (q) {
            console.log('上傳成功 q', q);

            if (q.data && q.data.length > 0) {
                // 直接更新清單
                loadData().then(() => {
                    // 轉換類別選項
                    // 傳回來的 修改的類別 dialogData.selectedClass
                    self.selectedClass = q.data[0].Class;
                    self.changeFileClass();
                    self.isError = false;
                }, (err) => {
                    console.log('showDotMenu error', err);
                    self.loading = false;
                    self.isError = true;
                }); // 重刷(此目錄)畫面
            }
        }).catch(function (cancel) {
            console.log('new folder cancel');
        });
    };

    // 前台可關閉此 sideNav
    self.close = function () {
        $mdSidenav('rightFile').close();
    };

    // 顯示個別 dotMenu (v重新命名 reName, x移至 moveTo..., v刪除 deleteOneFile)
    self.showDotMenu = function (value, item) {
        console.log('顯示個別 dotMenu');
        let data = {
            fileObj: value, // 單一檔案
            fullObj: item, // 所有檔案
            classList: self.classListForDialog, // 類別清單 classList => classListForDialog
            oldSelectedClass: self.selectedClass
        };
        $mdBottomSheet.show({
            template: dotMenuTpl,
            parent: angular.element(document.body),
            controller: dotMenuController,
            clickOutsideToClose: true,
            controllerAs: 'dotMenu',
            multiple: true,
            locals: {
                data
            }
        }).then(function (ok) {
            console.log('dot menu ok back!!!!');
            // 修改類別完後，重拉資料，再將類別下拉選單改成修改選的那個類別
            
            loadData().then((q) => {
                console.log('tag', data.tag);
                // 轉換類別選項
                // 傳回來的 修改的類別 dialogData.selectedClass
                // TODO: tag 可分辨是修改還是刪除來的
                // if (data.tag == 'reNameDialog') {
                //     // 只有修改需要帶到新改的類別，刪除不需
                //     self.selectedClass = data.selectedClass;
                // }
                self.tag = data.tag;
                self.selectedClass = data.selectedClass;
                self.changeFileClass();
            }, (err) => {
                console.log('showDotMenu error', err);
                self.loading = false;
                self.isError = true;
            }); // 重刷(此目錄)畫面
        }).catch(function (error) {
            console.log('dot bottom error', error);
        });
    };

    // 點擊單一檔案條
    self.clickFile = (key, item) => {
        console.log('開啟檔案');
        // self.isOpening = true;
        let path = SettingService.getServerUrl() + '/api/UploadFilesInfo/down/' + item.Id + '?fileType=' + item.FileType + '&fileName=' + item.FileName;

        // plugin InAppBrowser 在deploy時，會影響原生的 window.open，所以要多加判斷
        if (cordova.InAppBrowser) { // cordova
            // cordova.InAppBrowser.open('http://apache.org', '_blank', 'location=yes');
            cordova.InAppBrowser.open(path, '_blank', 'location=yes');

            if (self.isBrowser) {
                // 調整 inappbrowser 的 style
                setTimeout(() => {
                    let iframeEle = document.querySelector('body div iframe') ? document.querySelector('body div iframe').parentElement : null;
                    if (iframeEle) {
                        iframeEle.style.zIndex = 99;
                    }
                });
            }
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

        // adminFileService.downFiles(item.Id).then((q) => {
        //     let single = q.data;
        //     console.log('file:', q.data);

        //     let path = SettingService.getServerUrl() + '/api/UploadFilesInfo/down/' + item.Id + '?fileType=' + item.FileType + '&fileName=' + item.FileName;

        //     // plugin InAppBrowser 在deploy時，會影響原生的 window.open，所以要多加判斷
        //     if (cordova.InAppBrowser) { // cordova
        //         // cordova.InAppBrowser.open('http://apache.org', '_blank', 'location=yes');
        //         cordova.InAppBrowser.open(path, '_blank', 'location=yes');

        //         if (self.isBrowser) {
        //             // 調整 inappbrowser 的 style
        //             setTimeout(() => {
        //                 let iframeEle = document.querySelector('body div iframe') ? document.querySelector('body div iframe').parentElement : null;
        //                 if (iframeEle) {
        //                     iframeEle.style.zIndex = 99;
        //                 }
        //             });
        //         }
        //         // $window.open(url, '_system', 'location=yes'); // 寫這樣也可以，應該是_blank會衝突
        //         console.log('cordova browser');
        //     } else { // browser
        //         // $window.open('http://apache.org', '_blank');
        //         // if (single.FileType === 'mp4' || single.FileType === 'mp3' || single.FileType === 'AVI') {
        //         //     let videopath = '<html><body><div><video width="640" height="368" src=' + path + ' controls="controls" autoplay="autoplay" /></div></body></html>';
        //         //     let w = window.open('about:blank', 'MyWindow');
        //         //     w.document.write(videopath);
        //         //     w.document.close();
        //         // } else {
        //         // 目前 jpg 與 pdf, txt OK!!
        //         // 目前 doc, docx, xsl, csv, avi, ... 會自動變成下載
        //         console.log('path:', path);
        //         $window.open(path, '_blank');
        //         // }
        //         console.log('一般browser');
        //     }
        // }, (error) => {
        //     // showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
        //     console.log('clickFile error', error);
        //     showMessage('檔案下載失敗');
        // }).finally(() => {
        //     self.isOpening = false;
        // });
    };

    self.refresh = () => {
        loadData();
    };

    self.$onDestroy = function $onDestroy() {

    };

    // self.back = function back() {
    //     // 如果 url folders/有值
    //     if ($sessionStorage.folderNameArray && $sessionStorage.folderNameArray.length > 0) {
    //         // 移除最後一個 item
    //         $sessionStorage.folderNameArray.pop();
    //         console.log('回上頁 lastItemName', _.last($sessionStorage.folderNameArray));
    //         // 移除後剩下陣列中的最後一個
    //         $sessionStorage.folderName = _.last($sessionStorage.folderNameArray);
    //     }
    //     history.go(-1);
    // };
}

// [dotMenuController] 配合 dotMenu.html
angular.module('app').controller('dotMenuController', dotMenuController);
dotMenuController.$inject = ['$state', '$mdBottomSheet', 'data', '$mdDialog', 'adminFileService', 'showMessage', '$filter', '$timeout'];
function dotMenuController(
    $state,
    $mdBottomSheet,
    data,
    $mdDialog,
    adminFileService,
    showMessage,
    $filter,
    $timeout
) {
    const self = this;
    let $translate = $filter('translate');

    console.log('dotMenuController');
    self.fileObj = data.fileObj; // 要編輯的檔案
    self.fullObj = data.fullObj; // 全部檔案
    self.classList = data.classList; // 類別清單

    // 修改類別 (檔案重新命名暫不開放)
    self.reName = (fileObj) => {
        console.log('修改類別 fileObj:', fileObj);

        let dialogData = {
            fileObj: data.fileObj, // 要編輯的檔案
            classList: data.classList // 類別清單
        };
        $mdDialog.show({
            controller: reNameDialogController,
            template: reNameTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            controllerAs: 'dialog',
            multiple: true,
            locals: {
                dialogData
            }
        }).then(function (ok) {
            $mdBottomSheet.hide();
            console.log('從 reNameDialog 回傳的新類別名稱 dialogData.selectedClass', dialogData.selectedClass);
            // 要傳回adminFile
            data.selectedClass = dialogData.selectedClass;
            // tag
            data.tag = 'reNameDialog';
            // 傳回的新類別名稱
            // fileObj.Class = dialogData.selectedClass;
            console.log('從 reNameDialog 回傳後要上傳修改的 fileObj', fileObj);
        }).catch(function (cancel) {
            console.log('reNamme cancel');
            // self.isSaving = false;
            $mdBottomSheet.cancel(); // 關掉 dotMenu
        });
    };


    // 刪除檔案
    self.deleteOneFile = (fileObj, fullObj) => {

        console.log('刪除檔案 fileObj:', fileObj);

        let dialogData = {
            fileObj: data.fileObj, // 要編輯的檔案
            oldSelectedClass: data.oldSelectedClass // 原本就選擇的類別選項
            // classList: data.classList // 類別清單
        };
        $mdDialog.show({
            controller: deleteDialogController,
            template: deleteTpl,
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            controllerAs: 'dialog',
            multiple: true,
            locals: {
                dialogData
            }
        }).then(function (ok) {
            $mdBottomSheet.hide();
            console.log('從 deleteDialog 回傳的新類別名稱 dialogData.selectedClass', dialogData.selectedClass);
            // 要傳回adminFile
            data.selectedClass = dialogData.selectedClass; // TODO: 刪除的要選？？？？
            // tag
            data.tag = 'deleteDialog';
            let index = _.findIndex(fullObj, { Id: fileObj.Id });
            console.log('1 index!!!!!!', index);
            if (index > -1) {
                fullObj.splice(index, 1);
                // console.log('2 index!!!!!!', fullObj);
            }
            $mdBottomSheet.hide(); // 關掉 dotMenu

            // 傳回的新類別名稱
            // fileObj.Class = dialogData.selectedClass;
            // console.log('從 deleteDialog 回傳後要上傳修改的 fileObj', fileObj);
            console.log('從 deleteDialog 回傳後要上傳修改的 fullObj', fullObj);
        }).catch(function (cancel) {
            console.log('delete cancel');
            // self.isSaving = false;
            $mdBottomSheet.cancel(); // 關掉 dotMenu
        });
    };
}

// 點擊＋：新增檔案(每次新增檔案皆需指定一個檔案類別) addFileDialogController
angular.module('app').controller('addFileDialogController', addFileDialogController);
addFileDialogController.$inject = ['$mdDialog', 'dialogData', 'adminFileService', 'showMessage'];
function addFileDialogController($mdDialog, dialogData, adminFileService, showMessage) {
    const vm = this;
    vm.showAddNewClass = false; // 控制新增類別顯示
    // 類別清單
    vm.classList = dialogData.classList;
    vm.selectedClass = null; // 初始化 類別下拉選單
    vm.upoladFile = null; // 檔案
    // 新增類別
    vm.addNewAlbum = () => {
        console.log('點擊 新增類別');
        vm.showAddNewClass = !vm.showAddNewClass;
    };
    vm.changeFile = function () {
        // 控制 上傳按鈕 disabled
        console.log('選檔！！！', document.getElementById('upfile').files);
        vm.upoladFile = document.getElementById('upfile').files[0];
    };
    vm.ok = function () {
        // 回傳資料裡需要的內容
        // 類別
        dialogData.selectedClass = vm.selectedClass;
        // 檔案名稱
        // dialogData.fileName = vm.fileName;
        // 真正的檔案
        dialogData.upoladFile = document.getElementById('upfile').files[0];
        console.log('選取的檔案 全', document.getElementById('upfile').files);

        vm.isSaving = true;
        console.log('上傳檔案 addFileDialogController ok dialogData', dialogData);
        let file = dialogData.upoladFile; // document.getElementById("upfile").files[0]
        console.log('file:', file);
        adminFileService.uploadFiles(file, dialogData.selectedClass).then((q) => {
            console.log('上傳成功 q', q);
            showMessage('檔案上傳成功');
            $mdDialog.hide(q);
        }, (err) => {
            console.log('上傳失敗 err', err);
            showMessage('檔案上傳失敗');
        }).finally(() => {
            vm.isSaving = false;
        });
    };
    vm.cancel = function cancel() {
        $mdDialog.cancel();
    };
}


// 修改類別  reNameDialogController
angular.module('app').controller('reNameDialogController', reNameDialogController);
reNameDialogController.$inject = ['$mdDialog', 'dialogData', '$filter', 'adminFileService', 'showMessage'];
function reNameDialogController($mdDialog, dialogData, $filter, adminFileService, showMessage) {
    const vm = this;
    let $translate = $filter('translate');
    vm.showAddNewClass = false; // 控制新增類別顯示
    // 類別清單
    vm.classList = dialogData.classList;
    // 要編輯的檔案 dialogData.fileObj
    vm.selectedClass = dialogData.fileObj && dialogData.fileObj.Class ? dialogData.fileObj.Class : null; // 原本資料的類別名

    // 新增類別 btn
    vm.addNewClass = () => {
        console.log('點擊 新增類別');
        vm.showAddNewClass = !vm.showAddNewClass;
    };

    // 選擇類別
    // vm.changeFileClass = function () {
    //     if (vm.selectedClass != null && vm.selectedClass == '無類別') {
    //         vm.selectedClass = null;
    //     }
    // };

    vm.ok = function () {
        vm.isSaving = true;
        // 回傳新的類別名稱
        dialogData.selectedClass = vm.selectedClass;
        // 檔案名稱
        // dialogData.fileName = vm.fileName;
        console.log('reName Dialog 新類別名稱 dialogData.selectedClass', dialogData.selectedClass);
        adminFileService.put(dialogData.fileObj, dialogData.selectedClass).then((q) => {
            console.log('修改類別成功 q', q);
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            // 傳回的新類別名稱
            dialogData.fileObj.Class = dialogData.selectedClass;
            vm.isSaving = false;
            $mdDialog.hide(); // 關掉 reNameDialog
            // self.hide(); // 關掉 dotMenu
        }, () => {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            vm.isSaving = false;
            $mdDialog.hide(); // 關掉 reNameDialog
            // self.hide(); // 關掉 dotMenu
        });
    };
    vm.cancel = function cancel() {
        $mdDialog.cancel();
    };
}


// 刪除  deleteDialogController
angular.module('app').controller('deleteDialogController', deleteDialogController);
deleteDialogController.$inject = ['$mdDialog', 'dialogData', '$filter', 'adminFileService', 'showMessage'];
function deleteDialogController($mdDialog, dialogData, $filter, adminFileService, showMessage) {
    const vm = this;
    let $translate = $filter('translate');
    // 要編輯的檔案 dialogData.fileObj
    // vm.selectedClass = dialogData.oldSelectedClass; // 原本頁面上選的類別名
    vm.Title = dialogData.fileObj && dialogData.fileObj.Title ? dialogData.fileObj.Title : '-';
    vm.FileName = dialogData.fileObj && dialogData.fileObj.FileName ? dialogData.fileObj.FileName : '-';
    // 刪除
    vm.ok = function () {
        vm.isSaving = true;
        // 回傳新的類別名稱
        dialogData.selectedClass = dialogData.oldSelectedClass; // 原本頁面上選的類別名
        // 檔案名稱
        // dialogData.fileName = vm.fileName;
        console.log('delete Dialog 類別名稱 dialogData.selectedClass', dialogData.selectedClass);
        adminFileService.delete(dialogData.fileObj.Id).then((q) => {
            console.log('刪除成功 q', q);
            showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
            vm.isSaving = false;
            $mdDialog.hide(); // 關掉 reNameDialog
        }, () => {
            showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
            vm.isSaving = false;
            $mdDialog.hide(); // 關掉 reNameDialog
        });
    };

    // 取消
    vm.cancel = function cancel() {
        $mdDialog.cancel();
    };

}
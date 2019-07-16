import tpl from './checkStaff.html';
// import md5 from 'blueimp-md5'; // md5 轉碼  北市醫不需要密碼功能

/*
    '@':string
    '<':單向綁定
    '=':雙向綁定

    showSelect: '<', 顯示下拉選單
    showNfcBtn: '<', 顯示NFC按鈕
    titleName: '@',  名稱 xx核對簽章
    titleNameNfc: '@', 名稱 xx核對簽章(NFC)
    allStaff: '<', 所有簽章姓名
    signNurse: '=', 簽章姓名
    preSignNurse: '=' 前一個簽章姓名，跳提示存檔用,
    passwordForWeb: '<' 需要有密碼驗證功能 在 web 上
    passwordForNfc: '<' 需要有密碼驗證功能 在 NFC 上
    passwordForQrcode: '<' 需要有密碼驗證功能 在 QRcode 上
*/

angular
    .module('app')
    .component('checkStaff', {
    template: tpl,
    bindings: {
        showSelect: '<',
        showNfcBtn: '<',
        titleName: '@',
        titleNameNfc: '@',
        allStaff: '<',
        signNurse: '=',
        preSignNurse: '=',
        passwordForWeb: '<',
        passwordForNfc: '<',
        passwordForQrcode: '<' 
    },
    controller: checkStaffCtrl
});
checkStaffCtrl.$inject = ['$q', '$filter', 'bedService', 'showMessage', '$sessionStorage', '$state', '$localStorage', 'userService', 'SettingService', '$timeout', '$mdDialog', 'nfcService', 'PatientService'];
function checkStaffCtrl($q, $filter, bedService, showMessage, $sessionStorage, $state, $localStorage, userService, SettingService, $timeout, $mdDialog, nfcService, PatientService) {
    let self = this;
    let $translate = $filter('translate');

    self.searchStr = '';

    self.allSignStaff = []; // 兩組護理師清單：前端顯示、搜尋用
    self.staffList = []; // 兩組護理師清單：處理資料用

    self.iosNFCSupport = false; // 確認ios手機是否支援nfc

    // 是否有簽章
    self.showSelect = false; // 網頁版 顯示簽章 或 簽章下拉選單
    self.showNfcBtn = false; // 手機版 顯示簽章 或 簽章nfc按鈕


    self.signNurse = ''; // 簽章者
    self.preSignNurse = ''; // 前一個存檔過的簽章者 for web

    self.isBrowser = false; // 核對簽章：若是 browser 就顯示下拉選單 isSelector

    self.howMany = self.howManyStaff; // 共幾組簽章
    self.totalStaffArray = self.totalStaff; // 全部簽章者 (陣列)

    self.isCheckedPassword = false; // 是否經過簽章密碼驗證流程

    // 密碼驗證：區別是browser的下拉選單，或是手機NFC
    let SELECTOR = 'SELECTOR';
    let NFC = 'NFC';
    let QRCODE = 'QRCODE';

    // 核對簽章 - 現在登入者不可為核對者 (手機版：按下按鈕靠卡感應, Web版：下拉式選單，有搜尋功能)
    // self.$onChanges = function (changes) {
    //     console.log('!!!!!!!! checkStaff onChanges', changes);
    //     console.log('checkStaff init', self.allStaff);
    //     // 取得簽章護理師清單
    //     // self.allSignStaff = changes.allStaff ? changes.allStaff.currentValue : null; // 核對簽章的護士清單
    //     // self.staffList = changes.allStaff ? changes.allStaff.currentValue : null;

    // };


    self.$onInit = function onInit() {
        // 如果有簽章護理師 self.showSelect = false; 沒有 self.showSelect = true;
        // self.showSelect = true;
        // self.showNfcBtn = true;
        self.allSignStaff = self.allStaff; // 核對簽章的護士清單
        self.staffList = self.allStaff;

        // 先偵測是否為 browser
        switch (cordova.platformId) {
            case 'browser':
                console.log('是 網頁版');
                self.isBrowser = true; // 核對簽章：顯示下拉選單 isSelector
                self.showSelect = true; // 是否有簽章
                break;
            case 'android':
                console.log('是 android');
                self.isBrowser = false;
                self.showNfcBtn = true; // 是否有簽章
                break;
            // case 'ios':
            //     console.log('是 ios');
            //     // 確認ios手機是否支援nfc
            //     checkIosVersion().then((qdata) => {
            //         if (self.iosNFCSupport) {
            //             // 有支援nfc
            //             self.isSelector = false;
            //         } else {
            //             // 沒有支援nfc
            //             self.isSelector = true; // 核對簽章：顯示下拉選單 isSelector
            //         }
            //     }, (err) => {

            //     });
            //     break;
            default:
                break;
        }
        document.addEventListener('volumeupbutton', self.scanBarCode);
        document.addEventListener('volumedownbutton', self.scanBarCode);
    };

    // web
    // 核對簽章 搜尋護理師
    self.searchStaff = function searchStaff(searchStr) {
        console.log('搜尋', searchStr);
        self.allSignStaff = _.filter(angular.copy(self.staffList), (d) => {
            return d.Name.toLowerCase().includes(searchStr.toLowerCase());
        });
    };
    // 選擇簽章護理師後
    self.selectSignStaff = function selectSignStaff(sign, fromCheckPassword = false, passwordCorrect = false) {
        console.log('選擇簽章護理師後 sign 1', sign);
        // 控制顯示
        if (sign && sign.Name !== 'NoSign') {
            self.showSelect = false;
        } else if (sign.Name === 'NoSign') {
            self.showSelect = true;
            self.signNurse = ''; // 選擇不簽章時，signNurse會清空
        }
        console.log('self.signNurse', self.signNurse);
        console.log('self.preSignNurse', self.preSignNurse);
        
        if (fromCheckPassword) {
            // 密碼回來流程
            console.log('密碼流程');
            if (passwordCorrect) {
                // 密碼正確 -> 覆蓋新的章 -> 檢查是否有異動
                console.log('密碼流程  密碼正確');
                self.signNurse = sign;
                if (self.signNurse !== self.preSignNurse) {
                    console.log('密碼流程  密碼正確 有異動');
                    // 核對者有異動，記得存檔
                    showSaveAlertDialog();
                }
            } else {
                // 密碼錯誤 或 取消 -> 維持原舊的章
                console.log('密碼流程  密碼錯誤 或 取消');
                self.signNurse = sign.Name === 'NoSign' ? '' : sign;
            }

        } else if (!fromCheckPassword) {
            // 一般流程
            // 1. 不需要有簽章密碼功能(for web) -> self.passwordForWeb
            // 2. 不簽章 -> 檢查是否有異動
            // 3. 有簽章 登入者與簽章一樣：同一人 -> 檢查是否有異動
            // 4. 有簽章 登入者與簽章不同：不同人 -> 需要簽章密碼
            if ( (self.signNurse === '') || (self.signNurse !== '' && (self.signNurse.Id === SettingService.getCurrentUser().Id)) || !self.passwordForWeb ) {
                // 1. 不需要有簽章密碼功能(for web) -> self.passwordForWeb
                // 2. 不簽章 -> 檢查是否有異動
                // 3. 有簽章 登入者與簽章一樣：同一人 -> 檢查是否有異動
                if (self.signNurse !== self.preSignNurse) {
                    console.log('一般流程');
                    // 核對者有異動，記得存檔
                    showSaveAlertDialog();
                }

            } else if (self.signNurse !== '' && (self.signNurse.Id !== SettingService.getCurrentUser().Id) && self.passwordForWeb) {
                // 1. 需要有簽章密碼功能
                // 4. 有簽章 登入者與簽章不同：不同人 -> 需要簽章密碼
                showPasswordDialog(self.signNurse, self.signNurse.Password, SELECTOR); // 簽章的密碼 self.signNurse.Password

            }
            //  else if (self.signNurse === '') {
            //     // 選到不簽章 -> 檢查是否有異動
            //     if (self.signNurse !== self.preSignNurse) {
            //         console.log('一般流程');
            //         // 核對者有異動，記得存檔
            //         showSaveAlertDialog();
            //     }
            // }

        }

    };
    // 重選簽章
    self.reSelectStaff = function reSelectStaff() {
        self.showSelect = true;
        // self.signNurse = '';
        $timeout(() => {
            $('#sign-select').click();
        }, 0);

    };
    // clear search and load user data, md-select關閉時
    self.clearSearch = function (sign) {
        self.searchStr = '';
        self.allSignStaff = self.staffList;
        // 處理簽章顯示
        if (sign && sign.Name !== 'NoSign') {
            self.showSelect = false;
        } else {
            // 點選不簽章時
            self.showSelect = true;
            self.signNurse = '';
        }
    };


    // NFC
    // 核對簽章 - 手機版
    // 先關掉 patient nfc -> 開啟 nurse nfc -> 關掉 nurse nfc -> 再開啟 patient nfc
    self.nfcSign = function nfcSign(iosNFCSupport) {
        console.log('核對簽章');
        // 先判斷是否為ios，且要有支援nfc
        if (iosNFCSupport) {
            // ios，且有支援nfc
            // begin ios nfc session
            nfc.beginSession((success) => {
                // success
                nfcService.listenNdef(_searchNurseByRfid);
            }, (failure) => {
                // fail
            });
        } else {
            // andriod
            // 靠卡提示 dialog
            showNfcSignDialog(self.signNurse);
        }
    };


    // 手機點選印章顯示dialog
    self.chooseNfcQrcode = function chooseNfcQrcode(iosNFCSupport) {
         // 先判斷是否為ios，且要有支援nfc
         if (iosNFCSupport) {
            // ios，且有支援nfc
            // begin ios nfc session
            nfc.beginSession((success) => {
                // success
                nfcService.listenNdef(_searchNurseByRfid);
            }, (failure) => {
                // fail
            });
        } else {
            // andriod
            // 選擇 NFC / QRcode 掃描
            showChooseNfcQrcodeDialog(self.signNurse);
        }
        // // 確認是否已有簽章
        // if (self.signNurse) {
        //     // 有簽章 -> 掃同簽章：刪除 or 取消
        //     // 有簽章 -> 掃不同簽章：覆蓋 or 取消
        //     // 有簽章 -> 沒掃到id：提示
        //     console.log('有簽章', self.signNurse.Name);

        // } else {
        //     console.log('沒簽章');
        //     // 無簽章 -> 有掃到id：直接蓋章
        //     // 無簽章 -> 沒掃到id：提示

        // }
    };

    // NFC：先比對感應卡的id 是否與清單內某個護理人員相對應 search Nurse callback
    function _searchNurseByRfid(rfid) {
        console.log('user nfc detected!!!');
        console.log('user nfc id', rfid);
        self.showNfcBtn = false;

        if (rfid.Id) {
            for (let i = 0; i < self.staffList.length; i++) {

                if (self.staffList[i].RFID === rfid.Id) {
                    // 有比對到 id
                    console.log('user nfc 找到護理師', self.staffList[i]);
                    console.log('先確認是否要密碼功能', self.staffList[i]);

                    // 先確認是否要密碼功能，再判斷是否為登入者
                    if ( self.passwordForNfc && (rfid.Id !== SettingService.getCurrentUser().RFID) ) {
                        // 不是 登入者 -> 密碼驗證
                        console.log('不是 登入者 -> 密碼驗證');
                        // 密碼驗證
                        showPasswordDialog(self.staffList[i], self.staffList[i].Password, NFC); // 簽章的密碼 self.signNurse.Password
                    } else {
                        // 不需密碼功能
                        // 是 登入者 -> 繼續
                        console.log('是 登入者 -> 繼續');
                        // 確認是否已有簽章
                        if (self.signNurse) {
                            // 有簽章 -> 掃同簽章：刪除 or 取消
                            // 有簽章 -> 掃不同簽章：覆蓋 or 取消
                            console.log('有簽章', self.signNurse.Name);
                            showNfcSignHasSealDialog(self.signNurse, self.staffList[i]);
                        } else {
                            console.log('沒簽章');
                            // 無簽章 -> 有掃到id：直接蓋章
                            self.signNurse = self.staffList[i];
                            $mdDialog.cancel();// 關掉 靠卡提示 dialog
                            // 核對者有異動，記得存檔
                            // showSaveAlertDialog();
                            if (self.signNurse !== self.preSignNurse) {
                                // 核對者有異動，記得存檔
                                showSaveAlertDialog();
                            }
                            reOpenPatientNfc(); // 重新開啟 patient nfc
                        }
                    }
                    return;
                }
            }
            // 沒比對到id
            // 有簽章 -> 沒掃到id：提示
            // 無簽章 -> 沒掃到id：提示
            if (self.signNurse) {
                self.showNfcBtn = false;
            } else {
                self.showNfcBtn = true;
            }

            // 北榮穿刺下針護理師簽章不需要
            // 掃到登入者id -> 提示 '不可掃同使用者'
            // if (SettingService.getCurrentUser().RFID === rfid.Id) {
            //     // showMessage($translate('overview.component.signNurseLoginMessage', { loginName: SettingService.getCurrentUser().Name }));
            //     showMessage('核對簽章不可為目前登入者：' + SettingService.getCurrentUser().Name);
            //     // 關掉 靠卡提示 dialog
            //     $mdDialog.cancel();
            //     reOpenPatientNfc(); // 重新開啟 patient nfc
            //     return;
            // }

            // showMessage($translate('overview.component.rfidPatient', { rfid: rfid.Id }));
            showMessage($translate('overview.component.rfidRoleNurseMessage', { rfid: rfid.Id }));
            //  showMessage('找不到護理師，請確認使用者的角色設定：' + rfid.Id);
            // 關掉 靠卡提示 dialog
            $mdDialog.cancel();
            reOpenPatientNfc(); // 重新開啟 patient nfc
        }
    }


    // NFC 經過簽章密碼驗證流程後
    function afterCheckedPasswordForNFC(signNurse, passwordCorrect = false) {
        if (passwordCorrect) {
            // console.log('NFC 經過簽章密碼驗證流程後 密碼正確 覆蓋簽章');
            // 密碼正確 -> 覆蓋簽章
            // 確認是否已有簽章
            if (self.signNurse) {
                // 有簽章 -> 掃同簽章：刪除 or 取消
                // 有簽章 -> 掃不同簽章：覆蓋 or 取消
                // console.log('NFC 經過簽章密碼驗證流程後 有簽章', self.signNurse.Name);
                showNfcSignHasSealDialog(self.signNurse, signNurse);

            } else {
                // console.log('NFC 經過簽章密碼驗證流程後 沒簽章');
                // 無簽章 -> 有掃到id：直接蓋章
                self.signNurse = signNurse;
                // $mdDialog.cancel();// 關掉 靠卡提示 dialog
                // 核對者有異動，記得存檔
                // showSaveAlertDialog();
                if (self.signNurse !== self.preSignNurse) {
                    // 核對者有異動，記得存檔
                    showSaveAlertDialog();
                }
                reOpenPatientNfc(); // 重新開啟 patient nfc
            }
        } else {
            // console.log('NFC 經過簽章密碼驗證流程後 密碼錯誤 維持原舊的章');
            // 取消密碼 -> 密碼錯誤 或 取消 -> 維持原舊的章
            self.signNurse = signNurse.Name === 'NoSign' ? '' : signNurse;
            // self.signNurse = signNurse;
            reOpenPatientNfc(); // 重新開啟 patient nfc
        }

    }

    // 開啟 nurse nfc
    function openNurseNfc() {
        console.log('開啟 nfc openNurseNfc', openNurseNfc);
        // 關掉掉 patient nfc
        nfcService.stop();
        // andriod
        nfcService.listenNdef(_searchNurseByRfid);
        nfcService.listenTag(_searchNurseByRfid);

        // // 先判斷是否為ios，且要有支援nfc
        // if (iosNFCSupport) {
        //     // ios，且有支援nfc
        //     // begin ios nfc session
        //     nfc.beginSession((success) => {
        //         // success
        //         nfcService.listenNdef(_searchNurseByRfid);
        //     }, (failure) => {
        //         // fail
        //     });
            
        // } else {
        //     // andriod
        //     nfcService.listenNdef(_searchNurseByRfid);
        //     nfcService.listenTag(_searchNurseByRfid);
        // }

    }

    // nfc 靠卡提示
    function showNfcSignDialog(signNurseObj) {
        let data = {
            signNurseObj: signNurseObj
        };
        $mdDialog.show({
            controller: nfcSignDialogController,
            template: `<md-dialog>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 translate>{{'overview.component.signNurse'}}</h2>
                            <!-- <h2>核對簽章</h2>-->
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="dialog.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" translate>
                            <span ng-if="!dialog.showDeleted" translate>{{'overview.component.tagNfcCard'}}</span>
                            <!-- 請在此視窗顯示時，感應靠卡簽章。 -->
                            <span ng-if="dialog.showDeleted" translate>{{'overview.component.tagNfcCardOrDeleted'}}</span>
                            <!-- 請在此視窗顯示時，感應靠卡簽章。 或是刪除目前簽章。 -->
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button ng-if="dialog.showDeleted" class="md-warn md-raised" ng-click="dialog.deleted()">
                            {{'overview.component.deleted' | translate}}
                            <!-- 刪除 -->    
                        </md-button>

                        <md-button class="md-raised" ng-click="dialog.cancel()">
                        {{'overview.component.canceled' | translate}}
                            <!-- 取消 -->
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'dialog',
            locals: {
                data
            },
        }).then((ok) => {
            // 刪除
            console.log('dialog ok', ok);
            self.signNurse = '';
            // 核對者有異動，記得存檔
            // showSaveAlertDialog();
            if (self.signNurse !== self.preSignNurse) {
                // 核對者有異動，記得存檔
                showSaveAlertDialog();
            }
            nfcService.stop(); // 關掉 nurse nfc
            reOpenPatientNfc(); // 重新開啟 patient nfc

        }, (cancel) => {
            console.log('關掉感應dialog');
            nfcService.stop(); // 關掉 nurse nfc
            reOpenPatientNfc(); // 重新開啟 patient nfc
        });

        nfcSignDialogController.$inject = ['data'];
        function nfcSignDialogController(data) {
            const dialog = this;
            console.log('user nfc data', data);
            dialog.showDeleted = false;
            // data.signNurseObj
            if (data.signNurseObj) {
                // 有簽章：顯示刪除按鈕
                dialog.showDeleted = true;
            }
            // 開啟 nurse nfc
            openNurseNfc();
            // 刪除原本的簽章
            dialog.deleted = function deleted() {
                console.log('刪除原本的簽章！！！！！！！');
                self.showNfcBtn = true;
                $mdDialog.hide();
            };
            dialog.cancel = function cancel() {
                $mdDialog.cancel();
            };
        }
    }


    // 原本有簽章，又再次掃卡 dialog
    // 有簽章 -> 掃同簽章：刪除 or 取消
    // 有簽章 -> 掃不同簽章：覆蓋 or 取消
    // fromWhere -> NFC or QRcode
    function showNfcSignHasSealDialog(lastSignObj, signNurseObj, fromWhere = NFC) {
        let data = {
            signNurseObj: signNurseObj,
            lastSignObj: lastSignObj
        };
        $mdDialog.show({
            controller: nfcSignHasSealDialogController,
            template: `<md-dialog>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <!-- <h2>異動核對者</h2> -->
                            <h2 translate>{{'overview.component.changeSignNurse'}}</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="dialog.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" translate>
                            <span ng-if="dialog.isDiffId" translate>{{'overview.component.checkChange'}}</span>
                            <!-- 已有核對者，確認異動核對者? -->
                            <span ng-if="!dialog.isDiffId" translate>{{'overview.component.checkDeleted'}}</span>
                            <!-- 與目前簽章為同一人，是否要刪除？ -->
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button class="md-warn md-raised" ng-click="dialog.deleted()">
                            {{'overview.component.deleted' | translate}}
                            <!-- 刪除 --> 
                        </md-button>
                        <md-button ng-if="dialog.isDiffId" class="md-raised md-primary" ng-click="dialog.changed()">
                            {{'overview.component.covered' | translate}}
                            <!-- 覆蓋 -->
                        </md-button>
                        <md-button ng-if="!dialog.isDiffId" class="md-raised" ng-click="dialog.cancel()">
                            {{'overview.component.canceled' | translate}}
                            <!-- 取消 -->
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'dialog',
            locals: {
                data
            },
        }).then((ok) => {
            console.log('dialog ok', ok);
            if (data.whichBtn === 'deleted') {
                console.log('有簽章 ：刪除');
                self.signNurse = '';

            } else if (data.whichBtn === 'changed') {
                console.log('有簽章 ：覆蓋');
                self.signNurse = signNurseObj;
            }
            // 核對者有異動，記得存檔
            // showSaveAlertDialog();
            if (self.signNurse !== self.preSignNurse) {
                // 核對者有異動，記得存檔
                showSaveAlertDialog();
            }

            if (fromWhere === NFC) {
                nfcService.stop(); // 關掉 nurse nfc
                reOpenPatientNfc(); // 重新開啟 patient nfc
            }

        }, (cancel) => {
            console.log('dialog cancel', cancel);
            console.log('有簽章 ：取消');
            if (fromWhere === NFC) {
                nfcService.stop(); // 關掉 nurse nfc
                reOpenPatientNfc(); // 重新開啟 patient nfc
            }
        });

        nfcSignHasSealDialogController.$inject = ['data'];
        function nfcSignHasSealDialogController(data) {
            const dialog = this;
            console.log('user nfc data', data);
            data.whichBtn = '';
            dialog.isDiffId = false;
            // 前一個簽章 data.lastSignObj
            // 本次掃的簽章 data.signNurseObj
            if (data.lastSignObj.Id === data.signNurseObj.Id) {
                // 掃到同簽章
                dialog.isDiffId = false;
            } else {
                // 掃到不同簽章
                dialog.isDiffId = true;
            }

            // 刪除原本的簽章
            dialog.deleted = function deleted() {
                data.whichBtn = 'deleted';
                console.log('刪除原本的簽章！！！！！！！～～～～～～');
                self.showNfcBtn = true;
                $mdDialog.hide();
            };

            // 覆蓋原本的簽章
            dialog.changed = function changed() {
                data.whichBtn = 'changed';
                $mdDialog.hide();
            };

            dialog.cancel = function cancel() {
                $mdDialog.cancel();
            };
        }
    }


    function showSaveAlertDialog() {
        let data = {};
        $mdDialog.show({
            controller: saveAlertDialogController,
            template: `<md-dialog>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <!-- <h2>存檔提醒</h2> -->
                            <h2 translate>{{'overview.component.alertSaveTitle'}}</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="dialog.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" translate>
                            <span translate>{{'overview.component.alertSaveMessage'}}</span>
                            <!-- 核對簽章已異動，請記得至下方點選儲存。 -->
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button class="md-raised" ng-click="dialog.cancel()">
                            {{'overview.component.closed' | translate}}
                            <!-- 關閉 -->
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'dialog',
            locals: {
                data
            },
        }).then((ok) => {
            console.log('dialog ok', ok);
        }, (cancel) => {
            console.log('dialog cancel', cancel);
        });

        saveAlertDialogController.$inject = ['data'];
        function saveAlertDialogController(data) {
            const dialog = this;
            dialog.cancel = function cancel() {
                $mdDialog.cancel();
            };
        }
    }


    // 密碼驗證
    function showPasswordDialog(signNurse, signPassword, fromWhere) {
        let data = {
            signNurse: signNurse,
            signPassword: signPassword,
            fromWhere: fromWhere // browser or phone
        };
        $mdDialog.show({
            controller: passwordDialogController,
            template: `<md-dialog>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2>簽章密碼</h2>
                            <!-- <h2 translate>{{'overview.component.alertSaveTitle'}}</h2> -->
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="dialog.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>
                    <md-dialog-content>
                        <div layout="column" class="md-dialog-content">
                            <!-- <div translate>{{'overview.component.alertSaveMessage'}}</div> -->
                            <div style="margin-bottom: 10px;" translate>簽章({{dialog.name}})與目前登入者不符，請輸入該簽章密碼。</div>
                            <div layout="row" layout-align="start center">
                                <div style="margin-right: 15px;">密碼</div>
                                <input name="password" ng-model="dialog.password" type="password" required="" style="width: 80%;"/>
                            </div>
                            <div ng-if="dialog.showAlert" layout="row" layout-align="end start" style="color: red; margin-right: 10px;">請輸入正確密碼，或取消</div>
                        </div>
                    </md-dialog-content>
                    <md-dialog-actions layout="row">
                        <md-button class="md-raised" ng-click="dialog.cancel()">
                            <!-- {{'overview.component.closed' | translate}} -->
                            取消 
                        </md-button>
                        <md-button class="md-raised md-primary" ng-click="dialog.ok()">
                            <!-- {{'overview.component.closed' | translate}} -->
                            確認 
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'dialog',
            locals: {
                data
            },
        }).then((ok) => {
            console.log('dialog ok');
            if (data.isCorrect) {
                // 密碼正確
                if (fromWhere === SELECTOR) {
                    // SELECTOR：下拉選單邏輯
                    self.selectSignStaff(signNurse, true, data.isCorrect);
                } else {
                    // NFC：手機靠卡邏輯
                    afterCheckedPasswordForNFC(signNurse, data.isCorrect);
                }
                // self.preSignNurse = signNurse; // preSignNurse不需更動，是上次存檔的那一個sign
            }
        }, (cancel) => {
            console.log('dialog cancel');
            console.log('dialog 取消密碼');
            // 取消密碼 -> 密碼錯誤或是空 -> 回覆成舊簽章
            let oldSign = self.preSignNurse !== '' ? self.preSignNurse : { Name: 'NoSign', Id: '' };
            if (fromWhere === SELECTOR) {
                // SELECTOR：下拉選單邏輯
                self.selectSignStaff(oldSign, true, false);
            } else {
                // NFC：手機靠卡邏輯
                afterCheckedPasswordForNFC(oldSign, false);
            }
            // self.preSignNurse = oldSign; // preSignNurse不需更動，是上次存檔的那一個sign
        });

        passwordDialogController.$inject = ['data'];
        function passwordDialogController(data) {
            const dialog = this;
            dialog.name = data.signNurse.Name;
            dialog.showAlert = false; // 顯示密碼錯誤訊息
            // 確認密碼
            dialog.ok = function ok() {
                // // 比對密碼
                // // 輸入的密碼dialog.password：先統一轉大寫，再轉md5
                // let upperCode = dialog.password ? dialog.password.trim().toUpperCase() : '';
                // // console.log('比對密碼 輸入碼', dialog.password);
                // // console.log('比對密碼 upperCode', upperCode);
                // // console.log('比對密碼 md5', md5(upperCode)); // md5
                // // console.log('比對密碼 原始碼', data.signPassword); // md5
                // if (data.signPassword === md5(upperCode)) {
                //     console.log('dialog 密碼 對');
                //     data.isCorrect = true;
                //     self.isCheckedPassword = true; // 是否經過簽章密碼驗證流程
                //     dialog.showAlert = false; // 顯示密碼錯誤訊息
                //     $mdDialog.hide();
                // } else {
                //     console.log('dialog 密碼 錯');
                //     data.isCorrect = false;
                //     self.isCheckedPassword = true; // 是否經過簽章密碼驗證流程
                //     // 不關dialog，顯示密碼錯誤訊息在dialog上
                //     dialog.showAlert = true; // 顯示密碼錯誤訊息
                //     // $mdDialog.hide();
                // }
            };
            dialog.cancel = function cancel() {
                // 取消密碼，維持舊簽章
                $mdDialog.cancel();
            };
        }
    }


    // 搜尋patient nfc
    function reOpenPatientNfc() {
        nfcService.stop(); // 關掉 nurse nfc
        // 重新開啟 patient nfc
        nfcService.listenNdef(PatientService.searchPatientOrGetMachineData);
        nfcService.listenTag(PatientService.searchPatientOrGetMachineData);
    }


    // QRcode
    self.scanBarCode = function () {
        console.log('scanBarCode() in all patients component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                // result = {text: "1234", format: "QR_CODE", cancelled: false}
                console.log('scan 成功 result', result);

                if (!result.cancelled) {
                    _searchByBarCode(result.text);
                }
            },
            function (error) {
                console.log('scan 失敗 error', error);
                alert('allpatients Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('allPatients.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };


    // 相機掃描
    function _searchByBarCode(code) {
        self.showNfcBtn = false;
        if (code) {
            for (let i = 0; i < self.staffList.length; i++) {

                if (self.staffList[i].BarCode === code) {
                    // 先確認是否要密碼功能，再判斷是否為登入者
                    if ( self.passwordForQrcode && (code !== SettingService.getCurrentUser().BarCode) ) {
                        console.log('不是 登入者 -> 密碼驗證');
                        // TODO: 未作密碼驗證流程
                    } else {
                         // 不需密碼功能
                         // 是 登入者 -> 繼續
                         console.log('是 登入者 -> 繼續');
                         // 確認是否已有簽章
                        if (self.signNurse) {
                            // 有簽章 -> 掃同簽章：刪除 or 取消
                            // 有簽章 -> 掃不同簽章：覆蓋 or 取消
                            console.log('有簽章', self.signNurse.Name);
                            showNfcSignHasSealDialog(self.signNurse, self.staffList[i], QRCODE);
                        } else {
                            console.log('沒簽章');
                            // 無簽章 -> 有掃到Barcode：直接蓋章
                            self.signNurse = self.staffList[i];
                            // $mdDialog.cancel();// 關掉 靠卡提示 dialog
                            // 核對者有異動，記得存檔
                            // showSaveAlertDialog();
                            if (self.signNurse !== self.preSignNurse) {
                                // 核對者有異動，記得存檔
                                showSaveAlertDialog();
                            }
                            // reOpenPatientNfc(); // 重新開啟 patient nfc
                        }

                    }
                    return;
                }
            }
            // 沒比對到id
            // 有簽章 -> 沒掃到id：提示
            // 無簽章 -> 沒掃到id：提示
            if (self.signNurse) {
                self.showNfcBtn = false;
            } else {
                self.showNfcBtn = true;
            }
            showMessage($translate('overview.component.qrcodeRoleNurseMessage', { barcode: code }));
        }
       
    }

    // 選擇 NFC / QRcode
    function showChooseNfcQrcodeDialog(signNurseObj) {
        let data = {
            signNurseObj: signNurseObj
        };
        $mdDialog.show({
            controller: nfcSignDialogController,
            template: `<md-dialog>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <!-- <h2 translate>{{'overview.component.signNurse'}}</h2> -->
                            <h2>核對簽章</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="dialog.cancel()">
                                <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>

                    <md-dialog-content>
                        <div class="md-dialog-content" layout="column">
                            <div translate>請選擇 NFC 或 QRcode 簽章。</div>
                            <div translate>或是刪除目前簽章。</div>
                            <!-- 請在此視窗顯示時，感應靠卡簽章。 或是刪除目前簽章。 {{'overview.component.tagNfcCardOrDeleted'}} -->
                        </div>
                    </md-dialog-content>

                    <md-dialog-actions layout="row">
                        <md-button  class="md-warn md-raised" ng-click="dialog.deleted()">
                            <!-- {{'overview.component.deleted' | translate}} --> 
                            刪除   
                        </md-button>

                        <md-button class="md-primary md-raised" ng-click="dialog.nfc()">
                            <!-- {{'overview.component.canceled' | translate}} -->
                            NFC
                        </md-button>
                        <md-button class="md-raised" ng-click="dialog.qrcode()" style="background: #5c6bc0; color: white;">
                            <!-- {{'overview.component.canceled' | translate}} -->
                            QRcode
                        </md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog>`,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            multiple: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
        }).then((ok) => {
            // 刪除
            console.log('dialog ok', ok);
            self.signNurse = '';
            // 核對者有異動，記得存檔
            // showSaveAlertDialog();
            if (self.signNurse !== self.preSignNurse) {
                // 核對者有異動，記得存檔
                showSaveAlertDialog();
            }
            // nfcService.stop(); // 關掉 nurse nfc
            // reOpenPatientNfc(); // 重新開啟 patient nfc

        }, (cancel) => {
            console.log('關掉感應dialog');
            // nfcService.stop(); // 關掉 nurse nfc
            // reOpenPatientNfc(); // 重新開啟 patient nfc
        });

        nfcSignDialogController.$inject = ['data'];
        function nfcSignDialogController(data) {
            const dialog = this;
            console.log('user nfc data', data);
           
            dialog.deleted = function deleted() {
                console.log('刪除原本的簽章！！！！！！！');
                self.showNfcBtn = true;
                $mdDialog.hide();
            };

            dialog.nfc = function nfc() {
                console.log('nfc簽章！！！！！！！');
                // 靠卡提示 dialog
                showNfcSignDialog(self.signNurse);
            };

            dialog.qrcode = function qrcode() {
                console.log('qrcode簽章！！！！！！！');
                self.scanBarCode();
            };

            dialog.cancel = function cancel() {
                $mdDialog.cancel();
            };
        }
    }


    self.$onDestroy = function () {
        // nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', self.scanBarCode);
        document.removeEventListener('volumedownbutton', self.scanBarCode);
    };

}

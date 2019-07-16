/* global device */
/* global VERSIONTOCHECK */
/* global FileTransfer */
import tpl from './login.html';
import './login.less';

angular.module('app').component('login', {
    template: tpl,
    controller: LoginCtrl,
    controllerAs: 'vm'
});

LoginCtrl.$inject = ['$http', '$mdSidenav', 'showMessage', '$state', '$sessionStorage', 'LoginService', 'SettingService', '$mdDialog', 'basicSettingService']; //  , '$filter', '$scope', 'nfcService'

function LoginCtrl($http, $mdSidenav, showMessage, $state, $sessionStorage, LoginService, SettingService, $mdDialog, basicSettingService) { // , $filter, $scope, nfcService
    const vm = this;

    // let $translate = $filter('translate');
    vm.loading = false;
    vm.updating = false;

    // 由於套件因素，為了使箭頭定位點在文字的上方，須將force-caption-location 設為 bottom，再利用 \n 調整文字的位置
    vm.tutorText = '\n請至設定頁面設定伺服器位置\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';

    vm.$onInit = function onInit() {
        // 讀取目前醫院
        vm.language = SettingService.getLanguage();
        // console.log(SettingService.getCurrentHospital());
        if (!SettingService.getCurrentHospital()) {
            // 若第一次登入會沒有醫院資訊，須從 server 撈
            basicSettingService.getHospitalInfo().then((res) => {
                vm.currentHospital = res.data;
            });
        } else {
            vm.currentHospital = SettingService.getCurrentHospital();
        }
        vm.appVersion = 'Ver: ' + VERSION;

        // 若使用者尚未設定 serverUrl 則顯示提示
        if (!SettingService.getServerUrl()) {
            vm.tutorActive = true;
        }

        // 已經登入的話就到醫院清單
        if (LoginService.isCenterLogin()) {
            $state.go('hospital', {
                location: 'replace'
            });
            // return;
        }

        // // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
        // nfcService.listenTag(_loginByRfid);
        // nfcService.listenNdef(_loginByRfid);

        // document.addEventListener('deviceready', deviceReady);
        // document.addEventListener('volumeupbutton', vm.scanBarCode);
        // document.addEventListener('volumedownbutton', vm.scanBarCode);
    };
    vm.$onDestroy = function () {
        // nfcService.stop();
        // // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        // document.removeEventListener('deviceready', deviceReady);
        // document.removeEventListener('volumeupbutton', vm.scanBarCode);
        // document.removeEventListener('volumedownbutton', vm.scanBarCode);
    };

    // function _loginByRfid(rfid) {
    //    console.log('login by rfid');
    //    if (rfid.Id) {
    //        vm.loading = true;
    //        LoginService.loginByRfid(rfid.Id).then((res) => {
    //            if (res.data.Result) {
    //                $state.go('hospital');
    //            } else {
    //                showMessage(res.data.Message);
    //            }
    //            vm.loading = false;
    //        }, (result) => {
    //            console.log('rfid login failed');
    //            console.log(result);
    //            showMessage(result);
    //        });
    //    }
    // }

    // function deviceReady() {
    //    console.log('login device ready');
    //    // android 7.0 時更新有問題, 需將 targetSDK 設定 23
    //    if (DEVELOPMENT || (device && device.platform === 'Android')) {
    //        $http({
    //            method: 'GET',
    //            url: SettingService.getServerUrl() + '/android.html'
    //        }).then((res) => {
    //            console.log('android version -> ' + res.data);
    //            // 如果 server 上的版本比較新的話
    //            // 就下載 apk 回來更新
    //            // if (DEVELOPMENT) {
    //            if (VERSIONTOCHECK < res.data) {
    //                let confirm = $mdDialog.confirm()
    //                    .title('要升級嗎?')
    //                    .textContent('伺服器有新的版本: ' + res.data)
    //                    // .ariaLabel('Lucky day')
    //                    // .targetEvent(ev)
    //                    .ok('升級!')
    //                    .cancel('不要');
    //                $mdDialog.show(confirm).then(function() {
    //                    vm.updating = true;
    //                    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(fileEntry) {
    //                        let filepath = fileEntry.toURL() + 'Download/dialysis.apk';
    //                        let fileTransfer = new FileTransfer();
    //                        fileTransfer.download(encodeURI(SettingService.getServerUrl() + '/dialysis.apk'), filepath,
    //                            function(entry) {
    //                                console.log('download complete: ', fileEntry);
    //                                window.plugins.webintent.startActivity({
    //                                    action: window.plugins.webintent.ACTION_VIEW,
    //                                    url: entry.toURL(),
    //                                    type: 'application/vnd.android.package-archive'
    //                                }, function () { }, function (err) {
    //                                    showMessage('Failed to open URL via Android Intent. URL: ' + entry.fullPath);
    //                                    console.log('Failed to open URL via Android Intent. URL: ' + entry.fullPath, err);
    //                                    vm.updating = false;
    //                                });
    //                                vm.updating = false;
    //                            },
    //                            function(error) {
    //                                console.log('download error ' + error);
    //                                showMessage('下載失敗' + error.exception);
    //                                vm.updating = false;
    //                            }, true);
    //                    });
    //                }, function() {
    //                    // 不升級
    //                });
    //            }
    //        });
    //    }
    //    vm.isMobileDevice = cordova.platformId !== 'browser';
    // }

    // 條碼掃描, 範例如下
    // cordova.plugins.barcodeScanner.scan(
    //         function (result) {
    //             alert("We got a barcode\n" +
    //                 "Result: " + result.text + "\n" +
    //                 "Format: " + result.format + "\n" +
    //                 "Cancelled: " + result.cancelled);
    //         },
    //         function (error) {
    //             alert("Scanning failed: " + error);
    //         },
    //         {
    //             preferFrontCamera: true, // iOS and Android
    //             showFlipCameraButton: true, // iOS and Android
    //             showTorchButton: true, // iOS and Android
    //             torchOn: true, // Android, launch with the torch switched on (if available)
    //             prompt: "Place a barcode inside the scan area", // Android
    //             resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //             formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
    //             orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
    //             disableAnimations: true, // iOS
    //             disableSuccessBeep: false // iOS
    //         }
    //     );

    // vm.scanBarCode = function() {
    //    console.log('scanBarCode() in login component');
    //    cordova.plugins.barcodeScanner.scan(
    //        function(result) {
    //            if (!result.cancelled) {
    //                _loginByRfid(result.text);
    //            }
    //        },
    //        function(error) {
    //            alert('login Scanning failed: ' + error);
    //        }, {
    //            preferFrontCamera: false, // iOS and Android
    //            showFlipCameraButton: true, // iOS and Android
    //            showTorchButton: true, // iOS and Android
    //            torchOn: false, // Android, launch with the torch switched on (if available)
    //            prompt: '請將條碼置於框框中央處', // Android
    //            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //            formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
    //            orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
    //            disableAnimations: true, // iOS
    //            disableSuccessBeep: false // iOS
    //        }
    //    );
    // };

    vm.formData = {};
    vm.submit = function submit() {

        // let arr = [4, -118, -110, -30, 77, 77, -128];
        // let result = arr.map(function (byte) {
        //    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        // }).join('').toUpperCase();
        // console.log(result);
        // return true;

        // 帳號密碼
        const acc = vm.formData.account;
        const pwd = vm.formData.password;

        vm.loading = true;

        LoginService.centerlogin(acc, pwd).then((res) => {
            if (res.data.Result) {
                $state.go('hospital');
            } else {
                showMessage(res.data.Message);
            }
            vm.loading = false;
        }, (res) => {
            vm.loading = false;
            let msg = '';
            // 根據 res.status 顯示錯誤訊息
            if (res.status === -1) {
                msg = '找不到伺服器, 請檢查網路';
            } else if (res.status >= 400 && res.status < 500) {
                msg = '找不到網頁(' + res.status + '),請重開伺服器';
            } else if (res.status >= 500) {
                msg = '伺服器有問題(http ' + res.status + '), 請重開伺服器';
            }
            showMessage(msg);
        });
    };

    vm.goto = function goto() {
        $state.go('hospital');
    };
}

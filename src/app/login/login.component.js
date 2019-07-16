/* global device */
/* global VERSIONTOCHECK */
/* global FileTransfer */
import tpl from './login.html';
import tpl2 from './hct24Login.html';
import './login.less';

angular.module('app').component('login', {
    template: ['SettingService', function (SettingService) {

        // https://stackoverflow.com/questions/38647207/is-there-a-way-to-dynamically-render-different-templates-for-an-angular-1-5-comp
        // dynamically render different templates
        if (cordova.platformId === 'browser') {
            if (SettingService.getCurrentHospital() && SettingService.getCurrentHospital().HostName.indexOf(window.location.hostname) > -1) {
                return tpl;
            }

            // show the brochure page
            return tpl2;
        }

        return tpl;

    }],
    controller: LoginCtrl,
    controllerAs: 'vm'
});

LoginCtrl.$inject = ['$document', '$http', '$mdSidenav', 'showMessage', '$state', '$sessionStorage', 'LoginService', 'SettingService', '$mdDialog', 'basicSettingService', 'nfcService', '$timeout', '$filter', '$scope'];

function LoginCtrl($document, $http, $mdSidenav, showMessage, $state, $sessionStorage, LoginService, SettingService, $mdDialog, basicSettingService, nfcService, $timeout, $filter, $scope) {
    const vm = this;

    let $translate = $filter('translate');
    vm.year = new Date().getFullYear();

    vm.loading = false;
    vm.updating = false;
    vm.clicked = false;

    vm.language = {};
    // 由於套件因素，為了使箭頭定位點在文字的上方，須將force-caption-location 設為 bottom，再利用 \n 調整文字的位置
    vm.tutorText = $translate('login.component.tutorText');

    // cloud login form object
    vm.form = {};
    vm.package = '';
    vm.formMessage = '';
    vm.optionalItems = {};

    vm.$onInit = function onInit() {

        vm.language = SettingService.getLanguage();
        // 讀取目前醫院
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

        // 已經登入的話就到病人清單
        if (LoginService.isLogin()) {
            $state.go('allPatients', {
                location: 'replace'
            });
            return;
        }

        // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
        // nfcService.listenTag(_loginByRfid);
        // nfcService.listenNdef(_loginByRfid);

        document.addEventListener('deviceready', deviceReady);
        document.addEventListener('volumeupbutton', vm.scanBarCode);
        document.addEventListener('volumedownbutton', vm.scanBarCode);
        console.log(SettingService.getServerUrl());

        angular.element(document).ready(() => {
            console.log('login ready!!!!!!');
            $timeout(() => {
                vm.showTutor = true;
            }, 0);
        });
    };

    // listens for loading broadcast and updates the loading status
    $scope.$on('loading', function (event, data) {
        console.log('loading login', data);
        vm.loading = data;
    });

    vm.$onDestroy = function () {
        // nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('deviceready', deviceReady);
        document.removeEventListener('volumeupbutton', vm.scanBarCode);
        document.removeEventListener('volumedownbutton', vm.scanBarCode);
    };

    vm.changeLanguage = function () {
        console.log('language selected', vm.language);
        SettingService.setLanguage(vm.language);
        $timeout(function () { location.reload(); }, 250);
    };

    vm.dismissWalkthrough = function () {
        vm.clicked = true;
    };

    // cloud version form submit
    vm.submitForm = function (emailValid, compNameValid, compTelValid) {

        vm.submitted = true;

        let optionalMessage;

        // delete key when unchecked
        angular.forEach(vm.optionalItems, (val, key) => {
            if (val === false) {
                delete vm.optionalItems[key];
            }
        });

        if (!_.isEmpty(vm.optionalItems)) {
            optionalMessage = $translate('login.component.optionalMessage');
        } else {
            optionalMessage = '';
        }

        angular.forEach(vm.optionalItems, (val, key) => {
            optionalMessage += val + ' ';
        });

        // if required field are matched
        if (emailValid && compNameValid && compTelValid) {
            vm.form.Content = $translate('login.component.version') + vm.package + ' ' + optionalMessage + $translate('login.component.formMessage') + vm.formMessage;
            vm.loading = true;

            console.log('vm.form', vm.form);
            LoginService.contactUs(vm.form).then((res) => {
                showMessage($translate('login.component.submitSuccessMessage'));
                vm.clearForm();
                vm.loading = false;
                vm.submitted = false;

            }, (err) => {
                showMessage(err);
                vm.loading = false;
                vm.submitted = false;
            });
        }

    };

    vm.clearForm = function () {
        vm.form = {};
        vm.package = '';
        vm.formMessage = '';
        vm.optionalItems = {};
    };

    function _loginByBarcode(code) {
        console.log('login by barcode');

        vm.loading = true;
        LoginService.loginByRfid(code).then((res) => {
            if (res.data.Result) {
                $state.go('allPatients');
            } else {
                showMessage($translate('customMessage.' + res.data.Message));
            }
            vm.loading = false;
        }, (result) => {
            console.log('scan barcode login failed');
            console.log(result);
            vm.loading = false;
            showMessage(result);
        });
    }

    function deviceReady() {
        console.log('login device ready');

        // android 7.0 時更新有問題, 需將 targetSDK 設定 23
        if (SettingService.getServerUrl() && (DEVELOPMENT || (device && device.platform === 'Android'))) {
            $http({
                method: 'GET',
                url: SettingService.getServerUrl() + '/android.html'
            }).then((res) => {
                console.log('android version -> ' + res.data);
                // 如果 server 上的版本比較新的話
                // 就下載 apk 回來更新
                // if (DEVELOPMENT) {
                if (VERSIONTOCHECK < res.data) {
                    let confirm = $mdDialog.confirm()
                        .title($translate('login.component.updateDialog'))
                        .textContent($translate('login.component.newVersion') + res.data)
                        // .ariaLabel('Lucky day')
                        // .targetEvent(ev)
                        .ok($translate('login.component.updateOk'))
                        .cancel($translate('login.component.updateCancel'));

                    $mdDialog.show(confirm).then(function () {
                        // prompt user with storage permission message
                        LoginService.allowStoragePermission((success) => {
                            console.log('permission granted', success);
                        }).then(() => {
                            vm.updating = true;
                            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (fileEntry) {
                                let filepath = fileEntry.toURL() + 'Download/dialysis.apk';
                                let fileTransfer = new FileTransfer();
                                fileTransfer.download(encodeURI(SettingService.getServerUrl() + '/dialysis.apk'), filepath,
                                    function (entry) {
                                        console.log('download complete: ', fileEntry);
                                        window.plugins.webintent.startActivity({
                                            action: window.plugins.webintent.ACTION_VIEW,
                                            url: entry.toURL(),
                                            type: 'application/vnd.android.package-archive'
                                        }, function () { }, function (err) {
                                            showMessage('Failed to open URL via Android Intent. URL: ' + entry.fullPath);
                                            console.log('Failed to open URL via Android Intent. URL: ' + entry.fullPath, err);
                                            vm.updating = false;
                                        });
                                        vm.updating = false;
                                    },
                                    function (error) {
                                        console.log('download error ' + error);
                                        showMessage($translate('login.component.downloadFail') + error.exception);
                                        vm.updating = false;
                                    }, true);
                            });
                        });

                    }, function () {
                        // 不升級
                    });

                }
            });
        }

        $timeout(() => {
            vm.isMobileDevice = cordova.platformId !== 'browser';
        }, 0);
    }
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
    vm.scanBarCode = function () {
        console.log('scanBarCode() in login component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    _loginByBarcode(result.text);
                }
            },
            function (error) {
                alert('login Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('login.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };
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

        LoginService.login(acc, pwd).then((res) => {
            if (res.data.Result) {
                $state.go('allPatients');
            } else {
                // showMessage(res.data.Message);
                showMessage($translate('customMessage.' + res.data.Message));
            }
            vm.loading = false;
        }, (res) => {
            vm.loading = false;
            // 根據 res.status 顯示錯誤訊息
            showMessage(res);
        });
    };

    // vm.goto = function goto() {
    //     $state.go('allPatients');
    // };
}

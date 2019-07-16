import tpl from './profile.html';
import './profile.less';

angular
    .module('app')
    .component('profile', {
        template: tpl,
        controller: ProfileController
    })
    .directive('matchPassword', () => ({
        require: 'ngModel',
        scope: {
            otherModelValue: '=matchPassword'
        },
        link(scope, element, attributes, ngModel) {

            ngModel.$validators.matchPassword = function matchPassword(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch('otherModelValue', () => {
                ngModel.$validate();
            });
        }
    }));

// angular.module('app').component('setting', {
//   templateUrl: 'setting.html',
//   controller: SettingController,
//   controllerAs: 'vm'
// });

ProfileController.$inject = ['$state', 'SettingService', 'showMessage', 'userService', '$timeout', 'Upload', 'nfcService'];

function ProfileController($state, SettingService, showMessage, userService, $timeout, Upload, nfcService) {
    const vm = this;

    // 複製一份，避免原始資料變更
    vm.user = angular.copy(SettingService.getCurrentUser()) || null;
    vm.loadingPicture = false;

    // 辨識環境
    vm.device = cordova.platformId === 'browser';
    let pictureSource;
    let destinationType;

    vm.$onInit = function onInit() {
        // 同時listen tag & Ndef 事件，Ndef卡只會引發 Ndef 事件，因此也需監測 Ndef
        nfcService.listenTag(changeRfid);
        nfcService.listenNdef(changeRfid);

        document.addEventListener('volumeupbutton', scanBarCode);
        document.addEventListener('volumedownbutton', scanBarCode);

        if (!vm.device) {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
    };
    vm.$onDestroy = function $onDestroy() {
        nfcService.stop();

        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', scanBarCode);
        document.removeEventListener('volumedownbutton', scanBarCode);

        if (!vm.device) {
            document.removeEventListener('deviceready', onDeviceReady, false);
        }
    };

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    function changeRfid(rfid) {
        if (rfid.Id) {
            $timeout(() => {
                vm.user.RFID = rfid.Id;
            });
        }
    }

    function scanBarCode() {
        console.log('scanBarCode() in profile component');
        cordova.plugins.barcodeScanner.scan(
            (result) => {
                if (!result.cancelled) {
                    vm.currentUser.BarCode = result.text;
                }
            },
            (error) => {
                showMessage(`Scanning failed: ${error}`);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: '請將條碼置於框框中央處', // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    }

    function onLoadImageFail(message) {
        showMessage('拍照失败，原因：' + message, null, '警告');
    }

    // 相機過來的格式要轉編譯，直接跑destinationType.DATA_URI有些機器出不來
    function onLoadImageSussess(obj) {
        let size = {
            width: '160',
            height: '160',
            centerCrop: true
        };
        Upload.urlToBlob(obj).then(
            (blob) => {
                Upload.resize(blob, size).then((fb) => {
                    vm.user.Photo = fb;
                    imageUpload();
                });
            }
        );
    }

    // 這是暫時解決在 android 和 web 上傳的問題
    vm.handleChangeBase64 = function handleChangeBase64() {
        if (!vm.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.CAMERA
            });
        } else {
            imageUpload();
        }
    };
    // photo to base64
    let imageUpload = () => {
        if (vm.user.Photo) {
            $timeout(() => {
                vm.loadingPicture = true;
            });
            Upload.base64DataUrl(vm.user.Photo).then(
                (x) => {
                    vm.user.Photo = x;
                    vm.loadingPicture = false;
                }
            );
        }
    };

    // 存檔
    vm.save = function save() {
        vm.isSaving = true;
        // 變更密碼 (如果不要變更，就不用輸入)
        vm.user.Password = vm.password1 || '';
        vm.user.ModifiedUserId = vm.user.Id;
        vm.user.ModifiedUserName = vm.user.Name;
        userService.put(vm.user).then((res) => {
            if (res.status === 200) {
                showMessage('修改成功!');
                // history.go(-1);
            }
            vm.isSaving = false;
        }, () => {
            vm.isSaving = false;
            showMessage('修改失敗!');
        });
    };

    vm.back = () => {
        history.go(-1);
    };

    vm.getPicture = (x) => {
        vm.user.Photo = x;
    };
}

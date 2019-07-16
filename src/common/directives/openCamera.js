/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2018/1/24
 * 功能說明: 解決 input type file 在手機版上無法開啟照相機問題
 * 回傳值:  call callback function is base64
 * example:  <button-Camera ng-model="vm.photo"
             callback="vm.getPicture(getPicture)"
             re-size="{width: 160, height: 160, centerCrop: true}">
             </button-Camera>
 * 版本: 簡易版
 *****************************************/

import camera from './openCamera.html';

angular
    .module('app')
    .directive('buttonCamera', () => ({
        restrict: 'EA',
        require: 'ngModel',
        controllerAs: 'vm',
        controller: cameraCtrl,
        bindToController: true,
        scope: {
            reSize: '=?',
            ngModel: '&?',
            callback: '&?'
        },
        template: camera
    }));

cameraCtrl.$inject = ['$stateParams', '$rootScope',
    'Upload', 'showMessage', '$timeout', '$filter'];

function cameraCtrl($stateParams, $rootScope,
                    Upload, showMessage, $timeout, $filter) {
    const self = this;

    let $translate = $filter('translate');
    // 辨識環境
    self.device = cordova.platformId === 'browser';
    self.photo = self.ngModel;

    // 剪切調整
    if (!self.reSize) {
        self.reSize = {
            width: '160',
            height: '160',
            centerCrop: true
        };
    }

    let pictureSource;
    let destinationType;

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    function onLoadImageFail(message) {
        showMessage($translate('openCamera.photofailed') + message, null, $translate('openCamera.caveat'));
    }

    // 相機過來的格式要轉編譯，直接跑destinationType.DATA_URI有些機器出不來
    function onLoadImageSussess(obj) {
        Upload.urlToBlob(obj).then(
            (blob) => {
                Upload.resize(blob, self.reSize).then((fb) => {
                    self.photo = fb;
                    imageUpload();
                });
            }
        );
    }

    self.$onInit = () => {
        if (!self.device) {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
    };

    self.$onDestroy = function () {
        if (!self.device) {
            document.removeEventListener('deviceready', onDeviceReady, false);
        }
    };

    // photo to base64
    self.handleChangeBase64 = function handleChangeBase64() {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.CAMERA,
                correctOrientation: true
            });
        } else {
            imageUpload();
        }
    };

    // photo to base64
    let imageUpload = () => {
        if (self.photo) {
            $timeout(() => {
                self.loadingPicture = true;
            });
            Upload.base64DataUrl(self.photo).then(
                (x) => {
                    if (typeof self.callback === 'function') {
                        self.callback({
                            getPicture: x
                        });
                    }
                }
            );
        }
    };

}

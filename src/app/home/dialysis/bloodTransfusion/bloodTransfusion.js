/* global $*/
/* global nfc*/
/* global cordova*/
import bloodTransfusions from './bloodTransfusions.html';
import bloodTransfusion from './bloodTransfusion.html';
import bloodBagsDialog from './bloodBag.dialog.html';
import './bloodTransfusion.less';

angular.module('app').component('bloodTransfusion', {
    template: bloodTransfusions,
    controller: bloodTransfusionCtrl
}).component('bloodTransfusionDetail', {
    template: bloodTransfusion,
    controller: bloodTransfusionContentCtrl,
    controllerAs: '$ctrl'
})
    // 找出核對人員名稱
    // fix Blur on selected element  ==> https://github.com/angular/material/issues/3976
    .directive('searchUser', ['$timeout', 'BloodTransfusionService', ($timeout, BloodTransfusionService) => ({
        restrict: 'A',
        require: 'ngModel',
        controllerAs: '$ctrl',
        scope: {
            onChangeName: '&?',
            idMatch: '=?'
        },
        link($scope, $element, $attrs, ngModel) {
            setTimeout(() => {
                $element.on('paste', (event) => {
                    vaildId(event);
                });
                $element.on('change', (event) => {
                    vaildId(event);
                });
            }, 0);

            let vaildId = (event) => {
                event.preventDefault();
                $scope.$watch(() => ngModel.$modelValue, (newValue, oldValue) => {
                    if (typeof newValue === 'undefined') {
                        $timeout(function () {
                            if (typeof $scope.onChangeName === 'function') {
                                $scope.onChangeName({
                                    user: []
                                });
                            }
                        });
                        return;
                    }
                    if (!newValue) {
                        $timeout(() => {
                            ngModel.$setValidity('required', false);
                            if (typeof $scope.onChangeName === 'function') {
                                $scope.onChangeName({
                                    user: []
                                });
                            }
                        });
                    } else if ($scope.idMatch === ngModel.$modelValue) {
                        $timeout(() => {
                            ngModel.$setValidity('disMatch', false);
                            if (typeof $scope.onChangeName === 'function') {
                                $scope.onChangeName({
                                    user: []
                                });
                            }
                        });
                    } else if (newValue && $scope.idMatch !== ngModel.$modelValue) {
                        BloodTransfusionService.getUsers(ngModel.$modelValue).then((res) => {
                            if (res.data) {
                                $timeout(() => {
                                    if ($attrs.name === 'TherapistId1') {
                                        ngModel.$setValidity('therapistId1Error', res.data.length !== 0);
                                    } else if ($attrs.name === 'TherapistId2') {
                                        ngModel.$setValidity('disMatch', true);
                                        ngModel.$setValidity('therapistId2Error', res.data.length !== 0);
                                    }
                                    if (typeof $scope.onChangeName === 'function') {
                                        $scope.onChangeName({
                                            user: res
                                        });
                                    }
                                });
                            }
                        }, () => {
                            $timeout(() => {
                                ngModel.$setValidity('serverError', false);
                                if (typeof $scope.onChangeName === 'function') {
                                    $scope.onChangeName({
                                        user: []
                                    });
                                }
                            });
                        });
                    }
                });
            };
        }
    })]);
bloodTransfusionCtrl.$inject = ['$state', 'BloodTransfusionService', '$stateParams', '$mdDialog', '$mdMedia', '$interval', '$timeout'];

function bloodTransfusionCtrl($state, BloodTransfusionService, $stateParams,
    $mdDialog, $mdMedia, $interval, $timeout) {
    const self = this;

    self.serviceData = null;
    // 預設狀態
    self.loading = true;
    self.deletedItemsLength = -1;
    self.lastAccessTime = moment();

    // const interval = $interval(calculateRefreshTime, 60000);

    self.$onInit = function $onInit() {
        BloodTransfusionService.get($stateParams.headerId).then((q) => {
            self.serviceData = q.data;
            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            // calculateRefreshTime();
            self.lastAccessTime = BloodTransfusionService.getLastAccessTime();
            self.loading = false;
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // function calculateRefreshTime() {
    //     $timeout(() => {
    //         self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    //     }, 0);
    // }
    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        BloodTransfusionService.get($stateParams.headerId, true).then((q) => {
            self.serviceData = q.data;
            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            self.lastAccessTime = BloodTransfusionService.getLastAccessTime();
            // calculateRefreshTime();
            self.loading = false;
            self.isError = false;
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };
    // add or edit
    self.goto = function goto(bloodTransfusionId = '') {
        $state.go('bloodTransfusionDetail', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            bloodTransfusionId
        });
    };
    // 排序輸血時間, 用在 ng-repeat 上
    self.sortRecord = function sortRecord(record) {
        const date = new Date(record.StartTime);
        return date;
    };

    self.goback = function () {
        history.go(-1);
    };

    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController() {
            const vm = this;
            vm.hide = function hide() {
                $mdDialog.hide();
            };

            vm.cancel = function cancel() {
                $mdDialog.cancel();
            };

            vm.ok = function ok() {
                BloodTransfusionService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        self.refresh();
                    }
                });
                $mdDialog.hide(data);
            };
        }
    };
}

bloodTransfusionContentCtrl.$inject = ['$rootScope', '$state', 'BloodTransfusionService', '$stateParams', '$mdDialog', 'showMessage', 'SettingService', '$mdMedia', '$timeout', 'infoService', 'nfcService', '$filter', 'PatientService', 'tpechService'];

function bloodTransfusionContentCtrl($rootScope, $state, BloodTransfusionService, $stateParams,
    $mdDialog, showMessage, SettingService, $mdMedia, $timeout, infoService, nfcService, $filter, PatientService, tpechService) {
    const self = this;
    self.regform = {};
    self.user = SettingService.getCurrentUser();
    self.bloodTransfusionId = $stateParams.bloodTransfusionId;

    self.isBrowser = cordova.platformId === 'browser';

    let $translate = $filter('translate');

    // 血袋初始
    self.regform.BloodBags = [];
    // 讀取血袋設定檔 2017/05/08
    self.BloodSettings = SettingService.getHospitalSettings().BloodSetting.PlasmaComponents;
    console.log(self.BloodSettings);

    // 初始化
    self.$onInit = function $onInit() {
        // 若為手持裝置則須多聽實體返回鍵，避免掃描按回上一頁會真的到目前頁面的上一頁
        if (cordova.platformId !== 'browser') {
            document.addEventListener('backbutton', realBack);

            document.addEventListener('volumeupbutton', self.scanBarCode);
            document.addEventListener('volumedownbutton', self.scanBarCode);

            // 同時listen tag & Ndef 事件，Ndef卡只會引發 Ndef 事件，因此也需監測 Ndef
            nfcService.listenTag(self.changeRfid);
            nfcService.listenNdef(self.changeRfid);
        }

        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            self.patient = res.data;
        });
        // 需使用最新的 hospital setting，因此要重整
        infoService.reload().then((res) => {
            console.log('bloodTransfusion', res.data);
        }, () => {
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });

        // 共用的開始時間格式
        self.startdatetimepickerOption = {
            format: 'YYYY-MM-DD HH:mm'
        };
        // 修改初始化
        if ($stateParams.bloodTransfusionId) {
            self.loading = true;
            BloodTransfusionService
                .getById($stateParams.bloodTransfusionId)
                .then((q) => {
                    self.loading = false;
                    self.regform = q.data;
                    //get the start and end time if it's edit
                    self.regform.StartTime = moment(self.regform.StartTime).second(0).millisecond(0).toDate();
                    self.regform.EndTime = moment(self.regform.EndTime).second(0).millisecond(0).toDate();
                });
        } else {
            // 開始時間預設為今天
            self.regform.StartTime = moment().second(0).millisecond(0).toDate();
        }
    };

    // 實體返回鍵，避免取消 scan 真的回上一頁
    function realBack() {
        if (isScanCanceled) {
            isScanCanceled = false;
            return;
        }

        self.goback();
    }

    let isScanCanceled = false;
    // 要做變數
    self.scanBarCode = function scanBarCode() {
        console.log('scanBarCode() in profile component');
        cordova.plugins.barcodeScanner.scan(
            (result) => {
                if (!result.cancelled) {
                    $timeout(() => {
                        self.regform.LeadBlood = result.text;
                    });
                } else {
                    isScanCanceled = true;
                }
            },
            (error) => {
                alert(`Scanning failed: ${error}`);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('bloodTransfusion.bloodTransfusion.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    };

    self.$onDestroy = function $onDestroy() {
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        if (cordova.platformId !== 'browser') {
            // nfc
            nfcService.stop();
            document.removeEventListener('backbutton', realBack);
            document.removeEventListener('volumeupbutton', self.scanBarCode);
            document.removeEventListener('volumedownbutton', self.scanBarCode);
        }
    };
    // 退回
    self.goback = function goback() {
        // 若有任何 dialog 則為關閉 dialog
        if (document.getElementsByTagName('md-dialog').length > 0) {
            $mdDialog.cancel();
            return;
        }
        history.go(-1);
    };

    // 搜尋第一核對用戶名稱結果
    self.onChangeName1 = function onChangeName1(user) {
        if (user.data && user.data.length > 0) {
            self.regform.TherapistName1 = user.data[0].Name;
        } else {
            self.regform.TherapistName1 = null;
        }
    };

    self.changeRfid = (rfidOrBarcode, isQrcode = false) => {
        // 當掃描第一次時填入第一核對人員Id
        let id = rfidOrBarcode.Id;
        if (isQrcode) {
            id = rfidOrBarcode;
        }
        $timeout(() => {
            console.log('self.regform.TherapistName1', self.regform.TherapistName1);
            console.log('self.regform.TherapistName2', self.regform.TherapistName2);
            if (!self.regform.TherapistName1) {
                self.regform.TherapistId1 = id;
                let inputId = $('input[name="TherapistId1"]').val(id).change();
                inputId.blur();
            } else {
                self.regform.TherapistId2 = id;
                let inputId = $('input[name="TherapistId2"]').val(id).change();
                inputId.blur();
            }
        }, 0);
    };

    // 搜尋第二核對用戶名稱
    self.onChangeName2 = function onChangeName2(user) {
        if (user.data && user.data.length > 0) {
            self.regform.TherapistName2 = user.data[0].Name;
        } else {
            self.regform.TherapistName2 = null;
        }
    };


    // QRcode -> Therapist
    let tempTherapistId;
    let tempTherapistName;
    self.scanTherapistBarCode = function (index) {
        console.log('index', index);
        $timeout(() => {
            if (index === 1 && self.regform.TherapistId1) {
                tempTherapistId = angular.copy(self.regform.TherapistId1);
                tempTherapistName = angular.copy(self.regform.TherapistName1);
                self.regform.TherapistId1 = null;
                self.regform.TherapistName1 = null;
                console.log('index 1');
            }
            if (index === 2 && self.regform.TherapistId2) {
                tempTherapistId = angular.copy(self.regform.TherapistId2);
                tempTherapistName = angular.copy(self.regform.TherapistName2);
                self.regform.TherapistId2 = null;
                self.regform.TherapistName2 = null;
                console.log('index 2');
            }
        }, 0);

        console.log('scanBarCode() in all patients component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                // result = {text: "1234", format: "QR_CODE", cancelled: false}
                console.log('scan 成功 result', result);

                if (!result.cancelled) {
                    // _searchByBarCode(result.text);
                    self.changeRfid(result.text, true);
                } else {
                    // 沒有掃東西回來，且沒有error
                    $timeout(() => {
                        if (index === 1 && !self.regform.TherapistId1) {
                            self.regform.TherapistId1 = tempTherapistId;
                            self.regform.TherapistName1 = tempTherapistName;
                        }
                        if (index === 2 && !self.regform.TherapistId2) {
                            self.regform.TherapistId2 = tempTherapistId;
                            self.regform.TherapistName2 = tempTherapistName;
                        }
                    }, 0);
                    isScanCanceled = true;
                }
            },
            function (error) {
                console.log('scan 失敗 error', error);
                alert('allpatients Scanning failed: ' + error);
                $timeout(() => {
                    if (index === 1 && !self.regform.TherapistId1) {
                        self.regform.TherapistId1 = tempTherapistId;
                        self.regform.TherapistName1 = tempTherapistName;
                    }
                    if (index === 2 && !self.regform.TherapistId2) {
                        self.regform.TherapistId2 = tempTherapistId;
                        self.regform.TherapistName2 = tempTherapistName;
                    }
                }, 0);

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


    // save
    self.isSaving = false;
    self.submit = function submit(event) {
        self.isSaving = true;
        event.currentTarget.disabled = true;
        if ($stateParams.bloodTransfusionId) {
            self.regform.ModifiedUserId = self.user.Id;
            self.regform.ModifiedUserName = self.user.Name;

            BloodTransfusionService.put(self.regform).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('bloodTransfusion.bloodTransfusion.component.editSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                showMessage($translate('bloodTransfusion.bloodTransfusion.component.editFail'));

            }).finally(() => {
                self.isSaving = false;
            });

        } else {
            self.regform.PatientId = $stateParams.patientId;
            self.regform.DialysisId = $stateParams.headerId;
            self.regform.HospitalId = self.user.HospitalId;
            self.regform.CreatedUserId = self.user.Id;
            self.regform.CreatedUserName = self.user.Name;

            BloodTransfusionService.post(self.regform).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('bloodTransfusion.bloodTransfusion.component.createSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                showMessage($translate('bloodTransfusion.bloodTransfusion.component.createFail'));

            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    // 新增血袋資訊 object: 血品資訊obj, index: 目前第幾筆，因為可能是多筆血袋
    self.bloodBag = function bloodBag(event, object, index = null) {
        let patient = self.patient;
        // 需使用最新的 hospital setting，因此要重整
        infoService.reload().then((res) => {
            console.log('bloodTransfusion', res.data);
        }, () => {
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });

        $mdDialog.show({
            locals: {
                item: object,
                index,
                patient
            },
            controller: ['$scope', '$mdDialog', 'item', 'index', 'patient', '$mdDateLocale', DialogController],
            template: bloodBagsDialog,
            parent: angular.element(document.getElementsByTagName('blood-transfusion-detail')),
            targetEvent: event,
            clickOutsideToClose: false,
            bindToController: true,
            multiple: true,
            fullscreen: !$mdMedia('gt-sm'),
            controllerAs: 'vm'
        })
            .then((answer) => {
                if (index !== null) {
                    self.regform.BloodBags[index] = answer;
                } else {
                    self.regform.BloodBags.push(answer);
                }
            }).finally(() => {
                if (cordova.platformId !== 'browser') {
                    // 重新聽回本頁的 scanbarcode 功能
                    document.removeEventListener('volumeupbutton', self.scanBarCode);
                    document.removeEventListener('volumedownbutton', self.scanBarCode);
                    document.addEventListener('volumeupbutton', self.scanBarCode);
                    document.addEventListener('volumedownbutton', self.scanBarCode);
                }
            });

        function DialogController($scope, mdDialog, item, i = null, patientItem) {
            const vm = this;

            if (cordova.platformId !== 'browser') {
                // controller 無 $onDestroy，只能聽 $destroy
                // https://odetocode.com/blogs/scott/archive/2013/07/16/angularjs-listening-for-destroy.aspx
                $scope.$on('$destroy', () => {
                    console.log('bloodbagcontroller destroy');
                    document.removeEventListener('volumeupbutton', scanBarCode);
                    document.removeEventListener('volumedownbutton', scanBarCode);
                });
                //  將之前的 addEventListener 移除, 以免 listen 到上一層
                document.removeEventListener('volumeupbutton', self.scanBarCode);
                document.removeEventListener('volumedownbutton', self.scanBarCode);
                document.addEventListener('volumeupbutton', scanBarCode);
                document.addEventListener('volumedownbutton', scanBarCode);
            }
            vm.isBrowser = cordova.platformId === 'browser';

            vm.patient = patientItem; // 病人名字顯示
            vm.bloodBags = {};
            if (i !== null) {
                vm.bloodBags = item.regform.BloodBags[i];
                vm.bloodBags.ExpirationDate = vm.bloodBags.ExpirationDate ? new Date(vm.bloodBags.ExpirationDate) : null;
            } else {
                vm.bloodBags.Quantity = 1; // 預設
                vm.bloodBags.Barcode = [];
            }
            vm.PlasmaComponents = item.BloodSettings;

            // 點照相機icon，開啟照相機
            vm.openCamera = function openCamera() {
                if (cordova.platformId !== 'browser') {
                    scanBarCode();
                }
            };
            vm.ok = function ok(e) {
                vm.bloodBags.PlasmaComponents = vm.bloodBags.PlasmaComponentsCode ? vm.PlasmaComponents[vm.bloodBags.PlasmaComponentsCode] : '';
                mdDialog.hide(vm.bloodBags);
            };
            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            // 確認是否有按 enter 鍵，若有則進行驗證
            vm.barcodeOnKeypress = function (event) {
                console.log('validating....');
                if (event.which !== 13) {
                    return;
                }

                // 驗證此血袋領取沒
                validateBarcode();
            };

            // 輸入 barcode 確認
            vm.checkBarcodeValid = function () {
                console.log('checkBarcodeValid');
                validateBarcode();
            };

            // 刪掉一筆 barcode
            vm.clearBarcode = function (index) {
                // 確認是否要刪除的提示
                const confirm = $mdDialog.confirm()
                    .title('刪除血袋條碼確認') // '刪除檢驗檢查項目提示'
                    .textContent('請問是否要刪除此筆條碼？（刪除後需回上頁儲存才會生效）')
                    .multiple(true)
                    .ok('刪除') // '刪除'
                    .cancel('放棄'); // '取消'

                $mdDialog.show(confirm).then(() => {
                    vm.bloodBags.Barcode.splice(index, index + 1);
                });
            };

            // 驗證血袋是否領取沒並做相應的處理
            function validateBarcode() {
                // 檢查條碼是否已在陣列中了
                if (vm.bloodBags.Barcode.indexOf(vm.currentBarcode) > -1) {
                    showMessage(`${vm.currentBarcode}此條碼已存在，請輸入別的條碼`);
                    vm.currentBarcode = '';
                    return;
                }

                // 外層的驗證處理畫面
                self.barcodeValidating = true;

                tpechService.getBloodBag(self.patient.MedicalId, vm.currentBarcode).then((res) => {
                    // 若為否則刪除最後一筆，並 show 在 textarea 下面，尚未領取的提醒
                    if (res.data === false) {
                        // 顯示驗證沒過的提示
                        vm.barcodeInvalidMsg = '尚未領取';
                    } else if (res.data === true) {
                        vm.barcodeInvalidMsg = '';
                        vm.bloodBags.Barcode.push(vm.currentBarcode);
                        vm.currentBarcode = '';
                    }
                }).catch(() => {
                    // 仍算不過
                    vm.barcodeInvalidMsg = '伺服器忙碌中，請稍後再確認一次';
                }).finally(() => {
                    self.barcodeValidating = false;
                });
            }

            function scanBarCode() {
                cordova.plugins.barcodeScanner.scan(
                    (result) => {
                        if (!result.cancelled) {
                            $timeout(() => {
                                console.log('bloodbag scanner ready');
                                setAndroidData(result.text);
                            });
                        } else {
                            isScanCanceled = true;
                        }
                    },
                    (error) => {
                        alert(`Scanning failed: ${error}`);
                    }, {
                        preferFrontCamera: false, // iOS and Android
                        showFlipCameraButton: true, // iOS and Android
                        showTorchButton: true, // iOS and Android
                        torchOn: false, // Android, launch with the torch switched on (if available)
                        prompt: $translate('bloodTransfusion.bloodTransfusion.component.QRCodePrompt'), // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                        orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations: true, // iOS
                        disableSuccessBeep: false // iOS
                    }
                );
            }

            // 辨識 BarCode String
            function setAndroidData(value) {
                value = value.toUpperCase().trim().toString();
                const bloodTypes = ['A', 'B', 'AB', 'O'];
                const rhs = ['+', '-'];
                const bloodTypesAndRhs = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
                const bloodSetting = item.BloodSettings &&
                    Object.keys(item.BloodSettings).length > 0 ?
                    item.BloodSettings : {};

                if (Object.keys(bloodSetting).filter(x => x === value).length > 0) { // 辨識是否為血品代號(用設定值key驗證)
                    vm.bloodBags.PlasmaComponentsCode = value;
                } else if (isCheckDate(value)) { // 辨識是否為日期格式 有效期限
                    vm.bloodBags.ExpirationDate = new Date(value);
                } else if (bloodTypes.filter(e => e === value).length > 0) { // 辨識是否為血型
                    vm.bloodBags.BloodType = value;
                } else if (rhs.filter(e => e === value).length > 0) { // 辨識是否為陰陽性
                    switch (value) {
                        case '+':
                            vm.bloodBags.RH = '+';
                            break;
                        case '-':
                            vm.bloodBags.RH = '-';
                            break;
                        default:
                            break;
                    }
                } else if (bloodTypesAndRhs.filter(e => e === value).length > 0) { // 辨識是否為組合的血型包含陰陽
                    if (value.length === 3) { // AB+ , AB-
                        switch (value[2]) {
                            case '+':
                                vm.bloodBags.RH = '+';
                                vm.bloodBags.BloodType = 'AB';
                                break;
                            case '-':
                                vm.bloodBags.RH = '-';
                                vm.bloodBags.BloodType = 'AB';
                                break;
                            default:
                                break;
                        }
                    } else { // O+, O-, A+, A-, B+, B-
                        switch (value[1]) {
                            case '+':
                                vm.bloodBags.RH = '+';
                                vm.bloodBags.BloodType = value[0];
                                break;
                            case '-':
                                vm.bloodBags.RH = '-';
                                vm.bloodBags.BloodType = value[0];
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    vm.currentBarcode = value;
                    // 血袋條碼
                    validateBarcode();
                }
            }

            function isCheckDate(s) { // 檢查是否是日期格式
                s = s.replace(/[\-|\.\_]/g, '/');
                s = s.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/g, '$3/$1/$2');
                if (s.search(/^\d{4}\/\d{1,2}\/\d{1,2}\b/g) !== -1) {
                    const dt = new Date(Date.parse(s));
                    const arrDate = s.split('/');

                    if (dt.getMonth() === arrDate[1] - 1 &&
                        dt.getDate() === arrDate[2] - 0 &&
                        dt.getFullYear() === arrDate[0] - 0) {
                        let m = dt.getMonth() + 1;
                        let d = dt.getDate();

                        m = m < 10 ? `0${m}` : m;
                        d = d < 10 ? `0${d}` : d;
                        return true;
                    }
                    return false;

                }
                return false;

            }
        }
    };

    // del BloodBags
    self.showDelDialog = function showDelDialog(event, i) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'delBloodBagdialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            // fullscreen: !$mdMedia('gt-sm'),
            controllerAs: 'vm'
        });

        function DialogController() {
            const vm = this;
            vm.hide = function hide() {
                $mdDialog.hide();
            };

            vm.cancel = function cancel() {
                $mdDialog.cancel();
            };

            vm.ok = function ok() {
                self.regform.BloodBags.splice(i, 1);
                $mdDialog.hide();
            };
        }
    };
}

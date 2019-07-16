import tpl from './charge.html';
import dtpl from './chargeDialog.html';

angular.module('app').component('charge', {
    template: tpl,
    controller: SystemChargeCtrl,
    controllerAs: 'vm'
});

SystemChargeCtrl.$inject = ['$mdSidenav', '$state', '$stateParams', '$mdDialog', '$timeout', 'Upload', 'chargeService', 'wardService', 'showMessage', 'SettingService', '$filter'];
function SystemChargeCtrl($mdSidenav, $state, $stateParams, $mdDialog, $timeout, Upload, chargeService, wardService, showMessage, SettingService, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    // 載入透析室以及計價項目
    vm.loadCharges = function loadCharges() {
        vm.wardsLoaded = false;
        vm.chargesLoaded = false;
        vm.loading = true;

        // 取得透析室計價資料
        chargeService.get().then((resp) => {
            vm.charges = resp.data;
            vm.wardsLoaded = true;
            // 透析室及計價要兩個都讀取完才顯示
            if (vm.wardsLoaded && vm.chargesLoaded) {
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });

        // 取得透析室資料
        wardService.get().then((resp) => {
            vm.wards = resp.data;
            if ($stateParams.wardId) {
                vm.ward = $stateParams.wardId;
            } else if (resp.data.length > 0) {
                    vm.ward = resp.data[0].Id;
            }
            vm.chargesLoaded = true;
            // 透析室及計價要兩個都讀取完才顯示
            if (vm.wardsLoaded && vm.chargesLoaded) {
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
            }
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 載入時立即執行
    vm.$onInit = function onInit() {
        vm.loadCharges();
    };

    // 新增計價項目Dialog
    vm.chargeCreate = function chargeCreate(ev) {
        $mdDialog.show({
            controller: DialogController,
            controllerAs: 'dvm',
            template: dtpl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: vm.customFullscreen
        });
    };

    // 新增計價項目Dialog的controller設定
    function DialogController() {
        const dvm = this;
        dvm.title = $translate('charge.component.addtitle'); // '新增'
        dvm.wards = vm.wards;
        dvm.editMode = false;
        dvm.loading = false;
        // dvm.ward = vm.ward;
        // dvm.NotifyEmail = [];
        // dvm.CompanyEmail = [];
        // 先初始化一個空物件
        dvm.formData = {};
        dvm.formData.WardId = vm.ward;
        dvm.formData.NotifyEmails = [];
        dvm.formData.CompanyEmail = [];

        dvm.addNotifyEmail = function addNotifyEmail(idx) {
            // 先檢查必填欄位
            if (dvm.isEmail(dvm.formData.NotifyEmails[idx]) === false) {
                dvm.formData.NotifyEmails.splice(idx, 1);
                showMessage($translate('charge.component.operatingfailure')); // '操作失敗, Email格式有誤!'
            }
        };

        dvm.addCompanyEmail = function addCompanyEmail(idx) {
            // 先檢查必填欄位
            if (dvm.isEmail(dvm.formData.CompanyEmail[idx]) === false) {
                dvm.formData.CompanyEmail.splice(idx, 1);
                showMessage($translate('charge.component.operatingfailure')); // '操作失敗, Email格式有誤!'
            }
        };

        // 檢查Email格式
        dvm.isEmail = function isEmail(email) {
            // var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            // var regex = /^\w+((-\w+)|(.\w+))\@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
            let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!regex.test(email)) {
                return false;
            // } else {
            //    return true;
            }
            return true;
        };

        // Dialog 右上角 X, 關閉Dialog
        dvm.cancel = function cancel() {
            $mdDialog.cancel();
        };

    // photo to base64
    dvm.handleChangeBase64 = function handleChangeBase64() {
        // debugger;
        $timeout(() => {
            dvm.loadingPicture = true;
        });
        if (dvm.formData.Photo) {
            Upload.base64DataUrl(dvm.formData.Photo).then(
                (x) => {
                    // dvm.patient.Photo = x;
                    dvm.formData.Photo = x;
                    dvm.loadingPicture = false;
                }
            );
        }
    };

    // 儲存計價項目
        dvm.save = function save() {
            // 先檢查必填欄位
            if (dvm.validCheck() === false) {
                showMessage($translate('charge.component.operatingfailureinput')); // '操作失敗, 輸入有誤!'
            } else {
                // 如果提醒email是空，則補上空值
                // if (!dvm.NotifyEmail) {
                //  dvm.NotifyEmail = '';
                // }
                // 如果公司email是空，則補上空值
                // if (!dvm.CompanyEmail) {
                //  dvm.CompanyEmail = '';
                // }
                delete dvm.formData.Id;
                dvm.formData.HospitalId = SettingService.getCurrentHospital().Id;
                dvm.formData.WardName = dvm.wards.filter((item) => {
                        return item.Id === dvm.formData.WardId;
                    })[0].Name;
                dvm.formData.Stock = 0;
                // const obj = {
                //    Id: null,
                //    HospitalId: SettingService.getCurrentHospital().Id,
                //    WardId: dvm.ward,
                //    WardName: dvm.wards.filter((item) => {
                //        return item.Id === dvm.ward;
                //    })[0].Name,
                //    BarCode: dvm.BarCode,
                //    Code: dvm.Code,
                //    Name: dvm.Name,
                //    Unit: dvm.Unit,
                //    Stock: 0,
                //    Price: dvm.Price,
                //    SafetyStock: dvm.SafetyStock,
                //    Sort: dvm.Sort,
                //    NotifyEmails: dvm.NotifyEmail,
                //    CompanyEmail: dvm.CompanyEmail
                //    //NotifyEmails: dvm.NotifyEmail.split('\n'),
                //    //CompanyEmail: dvm.CompanyEmail.split('\n')
                // };
                console.log(dvm.formData);
                chargeService.post(dvm.formData).then(() => {
                    showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully

                    $mdDialog.hide();

                    vm.loadCharges();
                }, () => {
                    showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
                });
            }
        };

        dvm.validCheck = function validCheck() {
            if (dvm.formData.Name && dvm.formData.Price &&
                dvm.formData.SafetyStock && dvm.formData.Unit && dvm.formData.Sort) {
                return true;
            }
            return false;
        };
    }

    // 點選計價項目, 進入計價項目畫面
    vm.gotoCharge = function gotoCharge(chargeId) {
        $state.go('chargeDetail', {
            wardId: vm.ward,
            Id: chargeId
        });
    };

    // 選擇透析室時, location 要跟著變
    vm.changeCharge = function changeCharge(changeWardId) {
        $state.go('charge', { wardId: changeWardId }, { notify: false, reload: false, location: 'replace' });
    };
}

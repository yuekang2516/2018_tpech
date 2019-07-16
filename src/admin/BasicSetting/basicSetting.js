import tpl from './basicSetting.html';

angular.module('app').component('basicSetting', {
    template: tpl,
    controller: basicSettingCtrl,
    controllerAs: 'vm'
});

basicSettingCtrl.$inject = ['$q', '$mdSidenav', '$state', '$sessionStorage', 'basicSettingService', 'hospitalSettingService', 'showMessage', '$scope', '$timeout', 'Upload', 'hospitalService', '$filter', 'tpechService']; //, 'contractService', 'paymentService'

function basicSettingCtrl($q, $mdSidenav, $state, $sessionStorage, basicSettingService, hospitalSettingService, showMessage, $scope, $timeout, Upload, hospitalService, $filter, tpechService) { //, contractService, paymentService
    const vm = this;
    let type = '';
    let $translate = $filter('translate');
    vm.loadingPicture = false;
    // vm.selectedIndex = 0;
    // vm.contractData = true;
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    // 初始載入區
    vm.$onInit = function onInit() {

        // tpechService.test().then((rst) => {
        //     console.log('Test:', rst);
        // });
        // tpech Web Api 介接測試
        // tpechService.getBloodBag('123', '456').then((rst) => {
        //     console.log('GetBloodBag:', rst);
        // });
        // tpechService.getLabResult('123', '1080301', '1080331').then((rst) => {
        //     console.log('GetLabResult:', rst);
        // });
        // tpechService.getMedicine('123', '1080301').then((rst) => {
        //     console.log('GetMedicine:', rst);
        // });
        // tpechService.getPatient('123').then((rst) => {
        //     console.log('GetPatient:', rst);
        // });
        // tpechService.getReg('1080301', '123').then((rst) => {
        //     console.log('GetReg:', rst);
        // });
        // tpechService.getIpd('123').then((rst) => {
        //     console.log('GetIpd:', rst);
        // });
        // tpechService.getUser('123').then((rst) => {
        //     console.log('GetUser:', rst);
        // });
        // tpechService.getMicroResult('123', '1080301', '1080301').then((rst) => {
        //     console.log('GetMicro:', rst);
        // });
        // tpechService.getAllMedicine('123', '1080301', '1080301').then((rst) => {
        //     console.log('GetAllMedicine:', rst);
        // });
        // tpechService.getIPD2('123', '1080301', '1080301').then((rst) => {
        //     console.log('GetIPD2:', rst);
        // });
        // tpechService.getSurgery('123', '1080301', '1080301').then((rst) => {
        //     console.log('GetSurgery:', rst);
        // });

        // 從session取回醫院資訊 需複製一份供前端操作，避免直接改動 CurrentHospital
        vm.HospitalInfo = angular.copy($sessionStorage.HospitalInfo);
        // 更改讀取狀態
        vm.loading = true;
        console.log('vm.HospitalInfo:', vm.HospitalInfo);
        // 資料讀取出來後就先進行分行動作，之後回寫時要進行合併回array動作
        if (vm.HospitalInfo !== undefined) {
            vm.HostName = vm.HospitalInfo.HostName.join('\n');
            vm.loading = false;
        }

        vm.SheetTemplate1 = vm.HospitalInfo.SheetTemplate;
        vm.SheetTemplate2 = vm.HospitalInfo.SheetTemplate;
        if (vm.HospitalInfo.SheetTemplate !== null && vm.HospitalInfo.SheetTemplate !== undefined && vm.HospitalInfo.SheetTemplate !== 'A' && vm.HospitalInfo.SheetTemplate !== 'B' && vm.HospitalInfo.SheetTemplate !== 'C' && vm.HospitalInfo.SheetTemplate !== 'D') {
            vm.SheetTemplate2 = 'O';
        }
        vm.Logo = vm.HospitalInfo.Logo;
        //vm.Logo = "data:image/jpeg;base64,"+vm.HospitalInfo.Logo;
        //console.log('vm.Logo:',vm.Logo);
        // 取mailsetting資訊
        hospitalSettingService.get().then((mailsetting) => {
            // debugger;
            console.log('mailsetting:', mailsetting);
            if (mailsetting.status === 204) {
                type = 'create';
                // 無mailsetting時, 新增預設值
                const addmailsetting = {
                    Module: 'MailSetting',
                    Records: {
                        From: '',
                        Host: '',
                        Port: 0,
                        Account: '',
                        Password: '',
                        EnableSSL: true
                    }
                };
                hospitalSettingService.post(addmailsetting).then(() => {
                    vm.mailsetting = angular.copy(addmailsetting);
                }, () => {
                    showMessage($translate('customMessage.DataAddedFail')); // lang.DataAddedFail
                });
            } else {
                vm.mailsetting = angular.copy(mailsetting.data);
                if (vm.mailsetting.Records.Account === '') {
                    if (vm.mailsetting.Records.Port === '') {
                        vm.mailsetting.Records.Port = 0;
                    }
                    if (vm.mailsetting.Records.EnableSSL === false) {
                        // vm.mailsetting.Records.EnableSSL = '';
                    }
                }
                vm.isError = false; // 顯示伺服器連接失敗的訊息
                type = 'modify';
            }
        }, () => {
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ServerError
        });
        // // 取醫院資訊
        // hospitalService.getById(vm.HospitalInfo.Id).then((resp) => {
        //     console.log('hospital.getById:', resp.data);
        //     vm.formData = angular.copy(resp.data);
        //     vm.SheetTemplate1 = vm.formData.SheetTemplate;
        //     vm.SheetTemplate2 = vm.formData.SheetTemplate;
        //     if (vm.formData.SheetTemplate !== null && vm.formData.SheetTemplate !== undefined && vm.formData.SheetTemplate !== 'A' && vm.formData.SheetTemplate !== 'B' && vm.formData.SheetTemplate !== 'C' && vm.formData.SheetTemplate !== 'D') {
        //         vm.SheetTemplate2 = 'O';
        //     }
        //     vm.loading = false;
        //     vm.isError = false; // 顯示伺服器連接失敗的訊息
        // }, () => {
        //     vm.loading = false;
        //     vm.isError = true;
        // });

        // // 取最新一筆 contract 資料
        // contractService.getHospitalLast(vm.HospitalInfo.Id).then((resp) => {
        //     vm.contract = resp.data;
        //     vm.loading = false;
        //     vm.isError = false; // 顯示伺服器連接失敗的訊息
        // }, () => {
        //     vm.contract = '';
        //     vm.loading = false;
        //     vm.isError = true;
        // });
        // // 取最新一筆 payment 資料
        // paymentService.getHospitalLast(vm.HospitalInfo.Id).then((resp) => {
        //     vm.payment = resp.data;
        //     vm.loading = false;
        //     vm.isError = false; // 顯示伺服器連接失敗的訊息
        // }, () => {
        //     vm.payment = '';
        //     vm.loading = false;
        //     vm.isError = true;
        // });
    };

    // 儲存編輯資料
    vm.edit = function edit() {
        vm.isSaving = true;
        // let saveresult = true;

        console.log('vm.HospitalInfo:', vm.HospitalInfo);
        // console.log('vm.formData:', vm.formData);

        // $q.all執行的陣列
        let executeArray = [];
        // executeArray.push();
        executeArray.push(edit1()); // vm.HospitalInfo
        executeArray.push(edit2()); // vm.mailsetting
        // executeArray.push(edit3()); // hospitalService

        $q.all(executeArray).then(() => {
            // getByHeaderId(false, true); // 4.總資料 dialysisHeader
            // 顯示儲存結果訊息
            console.log('q.all() OK!');
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            // vm.isSaving = false;
        }).catch(() => {
            console.log('q.all catch');
            // showMessage($translate('customMessage.serverError')); // lang.ComServerError
            showMessage($translate('customMessage.ComServerError')); // lang.ComServerError
        }).finally(() => {
            // self.loading = false;
            vm.isSaving = false;
        });

        // => edit1()
        // // 資料回寫前先合併
        // vm.HospitalInfo.HostName = vm.HostName.split('\n').filter((value) => {
        //     return value.trim() !== '';
        // });
        // basicSettingService.put(vm.HospitalInfo).then(() => {
        //     // showMessage(lang.Datasuccessfully);
        //     saveresult = true;
        //     // 成功後不重新讀取API 只把更新資訊寫入session 其餘資訊會有沒更新的情況
        //     // $sessionStorage.HospitalInfo = vm.HospitalInfo;
        //     // $state.reload();
        // }, () => {
        //     // showMessage(lang.ComServerError);
        //     saveresult = false;
        // });

        // => edit2()
        // // mailsetting資料寫回
        // if (type === 'create') {
        //     if (vm.mailsetting.Records.Account !== '' || vm.mailsetting.Records.Host !== '' || vm.mailsetting.Records.Port !== '' || vm.mailsetting.Records.Password !== '' || vm.mailsetting.Records.From !== '' || vm.mailsetting.Records.EnableSSL !== undefined) {
        //         if (vm.mailsetting.Records.Port === '') {
        //             vm.mailsetting.Records.Port = 0;
        //         }
        //         if (vm.mailsetting.Records.EnableSSL === undefined) {
        //             vm.mailsetting.Records.EnableSSL = false;
        //         }
        //         const addmailsetting = {
        //             Module: 'MailSetting',
        //             Records: {
        //                 From: vm.mailsetting.Records.From,
        //                 Host: vm.mailsetting.Records.Host,
        //                 Port: vm.mailsetting.Records.Port,
        //                 Account: vm.mailsetting.Records.Account,
        //                 Password: vm.mailsetting.Records.Password,
        //                 EnableSSL: vm.mailsetting.Records.EnableSSL
        //             }
        //         };
        //         hospitalSettingService.post(addmailsetting).then(() => {
        //             vm.mailsetting = angular.copy(addmailsetting);
        //             saveresult = true;
        //         }, () => {
        //             saveresult = false;
        //         });
        //     }
        // } else {
        //     if (vm.mailsetting.Records.Port === '') {
        //         vm.mailsetting.Records.Port = 0;
        //     }
        //     if (vm.mailsetting.Records.EnableSSL === undefined) {
        //         vm.mailsetting.Records.EnableSSL = false;
        //     }
        //     console.log(vm.mailsetting);
        //     hospitalSettingService.put(vm.mailsetting).then(() => {
        //         // showMessage(lang.Datasuccessfully);
        //         saveresult = true;
        //     }, () => {
        //         // showMessage(lang.ComServerError);
        //         saveresult = false;
        //     });
        // }

        // => edit3()
        // if (vm.mailsetting.Records.Account === '') {
        //     if (vm.mailsetting.Records.Port === '') {
        //         vm.mailsetting.Records.Port = 0;
        //     }
        //     if (vm.mailsetting.Records.EnableSSL === false) {
        //         // vm.mailsetting.Records.EnableSSL = '';
        //     }
        // }

        // if (vm.SheetTemplate1 === 'A' || vm.SheetTemplate1 === 'B' || vm.SheetTemplate1 === 'C' || vm.SheetTemplate1 === 'D') {
        //     vm.formData.SheetTemplate = vm.SheetTemplate1;
        // }
        // console.log('formData');
        // console.log(vm.formData);
        // // hospital資料寫回
        // hospitalService.put(vm.formData).then(() => {
        //     saveresult = true;
        // }, () => {
        //     saveresult = false;
        // });


        // // 顯示儲存結果訊息
        // if (saveresult) {
        //     showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
        // } else {
        //     showMessage($translate('customMessage.ComServerError')); // lang.ComServerError
        // }
        // vm.isSaving = false;
    };

    function edit1() {
        const deferred = $q.defer();
        // 資料回寫前先合併
        vm.HospitalInfo.HostName = vm.HostName.split('\n').filter((value) => {
            return value.trim() !== '';
        });
        if (vm.SheetTemplate1 === 'A' || vm.SheetTemplate1 === 'B' || vm.SheetTemplate1 === 'C' || vm.SheetTemplate1 === 'D') {
            vm.HospitalInfo.SheetTemplate = vm.SheetTemplate1;
        }
        basicSettingService.put(vm.HospitalInfo).then((q) => {
            // // showMessage(lang.Datasuccessfully);
            // saveresult = true;
            // // 成功後不重新讀取API 只把更新資訊寫入session 其餘資訊會有沒更新的情況
            // // $sessionStorage.HospitalInfo = vm.HospitalInfo;
            // // $state.reload();
            console.log('q1:', q);
            console.log('edit1() OK!');
            deferred.resolve();
        }, () => {
            // // showMessage(lang.ComServerError);
            // saveresult = false;
            deferred.reject();
        });
        return deferred.promise;
    }

    function edit2() {
        const deferred = $q.defer();
        // mailsetting資料寫回
        if (type === 'create') {
            if (vm.mailsetting.Records.Account !== '' || vm.mailsetting.Records.Host !== '' || vm.mailsetting.Records.Port !== '' || vm.mailsetting.Records.Password !== '' || vm.mailsetting.Records.From !== '' || vm.mailsetting.Records.EnableSSL !== undefined) {
                if (vm.mailsetting.Records.Port === '') {
                    vm.mailsetting.Records.Port = 0;
                }
                if (vm.mailsetting.Records.EnableSSL === undefined) {
                    vm.mailsetting.Records.EnableSSL = false;
                }
                const addmailsetting = {
                    Module: 'MailSetting',
                    Records: {
                        From: vm.mailsetting.Records.From,
                        Host: vm.mailsetting.Records.Host,
                        Port: vm.mailsetting.Records.Port,
                        Account: vm.mailsetting.Records.Account,
                        Password: vm.mailsetting.Records.Password,
                        EnableSSL: vm.mailsetting.Records.EnableSSL
                    }
                };
                hospitalSettingService.post(addmailsetting).then(() => {
                    vm.mailsetting = angular.copy(addmailsetting);
                    // saveresult = true;
                    console.log('edit2a() OK!');
                    deferred.resolve();
                }, () => {
                    // saveresult = false;
                    deferred.reject();
                });
            }
        } else {
            if (vm.mailsetting.Records.Port === '') {
                vm.mailsetting.Records.Port = 0;
            }
            if (vm.mailsetting.Records.EnableSSL === undefined) {
                vm.mailsetting.Records.EnableSSL = false;
            }
            console.log(vm.mailsetting);
            hospitalSettingService.put(vm.mailsetting).then((q) => {
                // // showMessage(lang.Datasuccessfully);
                // saveresult = true;
                console.log('q2b:', q);
                console.log('edit2b() OK!');
                deferred.resolve();
            }, () => {
                // // showMessage(lang.ComServerError);
                // saveresult = false;
                deferred.reject();
            });
        }

        if (vm.mailsetting.Records.Account === '') {
            if (vm.mailsetting.Records.Port === '') {
                vm.mailsetting.Records.Port = 0;
            }
            if (vm.mailsetting.Records.EnableSSL === false) {
                // vm.mailsetting.Records.EnableSSL = '';
            }
        }

        return deferred.promise;
    }

    // function edit3() {
    //     const deferred = $q.defer();


    //     if (vm.SheetTemplate1 === 'A' || vm.SheetTemplate1 === 'B' || vm.SheetTemplate1 === 'C' || vm.SheetTemplate1 === 'D') {
    //         vm.formData.SheetTemplate = vm.SheetTemplate1;
    //     }
    //     console.log('formData');
    //     console.log(vm.formData);
    //     // hospital資料寫回
    //     hospitalService.put(vm.formData).then((q) => {
    //         // saveresult = true;
    //         console.log('q3:', q);
    //         console.log('edit3() OK!');
    //         deferred.resolve();
    //     }, () => {
    //         // saveresult = false;
    //         deferred.reject();
    //     });

    //     return deferred.promise;
    // }

    // photo to base64
    vm.handleChangeBase64 = function handleChangeBase64() {
        $timeout(() => {
            vm.loadingPicture = true;
        });
        if (vm.Logo) {
            Upload.imageDimensions(vm.Logo).then((y) => {
                let size;
                if (y.width > 200 || y.height > 200) {
                    if (y.width > y.height) {
                        size = {
                            width: '200'
                        };
                    } else {
                        size = {
                            height: '200'
                        };
                    }
                    Upload.resize(vm.Logo, size).then((f) => {
                        Upload.base64DataUrl(f).then((x) => {
                            vm.Logo = x;
                            vm.HospitalInfo.Logo = vm.Logo;
                            vm.loadingPicture = false;
                        });
                    });
                } else {
                    Upload.base64DataUrl(vm.Logo).then((x) => {
                        vm.Logo = x;
                        vm.HospitalInfo.Logo = vm.Logo;
                        vm.loadingPicture = false;
                    });
                }
            });
        }
    };

    // vm.showMethod = function showMethod(method) {
    //     let sMethod = '';
    //     if (method === 'rent') {
    //         sMethod = $translate('payment.rent'); // '月租'
    //     } else if (method === 'usage') {
    //         sMethod = $translate('payment.usage'); // '用量';
    //     } else {
    //         sMethod = method;
    //     }
    //     return sMethod;
    // };

    vm.radioA = function () {
        vm.SheetTemplate2 = '';
    };

    vm.radioO = function () {
        vm.SheetTemplate1 = '';
    };

    // vm.gotoContent = function (index) {
    //     if (index === 0) {
    //         vm.contractData = true;
    //     } else {
    //         vm.contractData = false;
    //     }
    // };
}

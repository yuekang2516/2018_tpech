const tpl = require('./allPdPatients.html');
require('./allPdPatients.less');

angular.module('app').component('allPdPatients', {
    template: tpl,
    controller: allPdPatientsController,
    controllerAs: 'vm'
});

allPdPatientsController.$inject = ['$localStorage', 'dialysisService', '$q', '$document', '$sce', '$rootScope', '$scope', '$interval', '$state', '$stateParams', '$mdSidenav', 'PatientService', 'SettingService', 'showMessage', '$timeout', 'nfcService', '$mdDialog', '$filter','userService'];

function allPdPatientsController($localStorage, dialysisService, $q, $document, $sce, $rootScope, $scope, $interval, $state, $stateParams, $mdSidenav, PatientService, SettingService, showMessage, $timeout, nfcService, $mdDialog, $filter,userService) {
    console.log('enter all patients controller');
    // translate service
    let $translate = $filter('translate');
    const vm = this;
    let currentUserId = $localStorage.currentUser.Id;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.toggleSideNav = function () {
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

    vm.loading = true;
    vm.iosNFCSupport = false;

    vm.patients = []; // 原始資料
    vm.old_patients =[];
    vm.notificationCount = 0;

    const currentUser = SettingService.getCurrentUser();

    // infinite scroll 相關
    let dataEnd = false; // 判斷資料使否已完全 push 至顯示用的陣列裡
    let dataNumOnce = 20; // 一次 push 多少筆資料
 
    let searchFisrtTime = false;

    vm.$onInit = function () {
        // 加入 rootscape 監看式, 最新通知筆數若有異動, 更新 toolbar 上的數字
        $rootScope.$watch('notificationCount', () => {
            vm.notificationCount = $rootScope.notificationCount;
        });
        console.log('getCurrentUser',SettingService.getCurrentUser());

        // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
        // nfcService.listenTag(_searchByRfid);
        // nfcService.listenNdef(_searchByRfid);

        document.addEventListener('volumeupbutton', vm.scanBarCode);
        document.addEventListener('volumedownbutton', vm.scanBarCode);
        document.addEventListener('keypress', keypress);
        document.addEventListener('deviceready', checkIosVersion);
        userService.get().then((res) => {
            vm.people = res.data;
                //讀取醫生
                vm.sel_doctor = SettingService.getCurrentUser().Id;
                console.log(' vm.sel_doctor ', vm.sel_doctor )
                vm.doctors = vm.people.filter( item =>{
                    return item.Role == "doctor"
                });
    
                if(vm.doctors.length > 0){
                    vm.doctors = vm.doctors.map( item =>{
                        return {"EmployeeId": item.EmployeeId, "Account": item.Account, "Name": item.Name,"Id":item.Id };
                    });
    
                    let filterCount = vm.doctors.filter( e =>{
                        return e.Id == vm.sel_doctor
                    });
    
                    if(filterCount.length == 0){
                        vm.sel_doctor = "ALL";
                    }
                }else{
                    vm.sel_doctor = "ALL";
                }
                onInit_Data()
        }, (res) => {
            onInit_Data()
        });
    };
    function onInit_Data(){
        vm.searchOptions = PatientService.getSearchOptions();
        changeFilterPlaceHolder();
        if ($state.current.name === 'allPdPatientsSearch') {
            document.addEventListener("backbutton", vm.backButtonCallback); // 使得實體返回鍵與畫面返回鍵表現相同
            searchFisrtTime = true;
            vm.search = $stateParams.str;

            // 取得病人所有資料以利 RFID 及 barcode 搜尋
            vm.loading = true;
            PatientService.getByUserId(currentUser.Id)
                .then((d) => {
                    console.log('getallpatients d', d);
                    console.log('getallpatients', d.data);

                    // 依特定條件排序 patients: 依剩餘時間排序，null代表尚未洗排最上面; 若都沒有剩餘時間已後修改的為大
                    allPatients = PatientService.orderPatients(d.data);
                    allPatients = allPatients.filter( e =>{
                        return e.State == '2';
                    });
                    vm.old_patients = angular.copy(allPatients);
                    filter_doctor_AllPatients();

                    vm.loading = false;
                    vm.isError = false;
                }, (reason) => {
                    vm.loading = false;
                    vm.isError = true;
                    console.error(reason);
                    showMessage($translate('allPatients.component.patientDataFail'));
                });

            // 等畫面長好才取得到，需引用 $document
            // https://stackoverflow.com/questions/18646756/how-to-run-function-in-angular-controller-on-document-ready
            angular.element(document).ready(() => {
                console.log('ready!!!!!!');
                $('#search').focus();
                $('#outside').click((e) => {
                    // 若於搜尋模式，未有搜尋字串則回到原本的模式
                    if (!vm.search && vm.searchOptions.searchMode) {
                        vm.searchOptions.searchMode = false;
                        history.go(-1);
                    }
                });

                // 點擊搜尋相關的 element 不引發最上層回到 allPatients 的事件
                $('#search').click((e) => {
                    e.stopPropagation();
                });
                $('#search-icon').click((e) => {
                    e.stopPropagation();
                });
                $('#search-filter').click((e) => {
                    e.stopPropagation();
                });
            });

        } else {
            // 避免使用者利用實體鍵回上一頁，造成未設回非搜尋模式
            vm.searchOptions.searchMode = false;
            getAllPatients();
        }
    }
    // 使得實體返回鍵與畫面返回鍵表現相同
    vm.backButtonCallback = function () {
        vm.back().then(() => {
            // remove listener after back
            document.removeEventListener("backbutton", vm.backButtonCallback);
        });
    };

    // check ios version
    function checkIosVersion() {
        // if it's iPhone 7, 7+ and ios version greater than 11.0
        // Model Ex. iPhone9,1 -> 9.1
        // 避免 device not defined 的問題
        try {
            let modelNum = Number(device.model.substring(6).replace(',', '.'));
            if (device.platform == 'iOS' && device.version >= '11.0' && modelNum > 9) {
                // if(device.platform == 'iOS'  && device.version <= '11.0') {
                self.iosNFCSupport = true;
            }
        } catch (error) {

        }
    }

    // begin ios nfc session
    // vm.iosNfcScan = function iosNfcScan() {
    //     nfc.beginSession((success) => {
    //         // success
    //         nfcService.listenNdef(_searchByRfid);
    //     }, (failure) => {
    //         // fail
    //     });
    // };

    function keypress(ev) {
        if (ev.which === 13) {
            console.log('keypress 13 currentPatients', vm.currentPatients);
            console.log('keypress 13 目前頁', $state.current.name);
            console.log('掃barcode');
            $('#search').select();
            // 按下enter時檢查，是否只有一個病人
            if (vm.currentPatients.length === 1) {
                console.log('keypress 13 跳下一頁');
                // 攜帶搜尋字串，避免從summary回來時沒有搜尋字串
                // TODO: check for bugs
                $state.go('summary', { patientId: vm.currentPatients[0].Id, searchStr: $stateParams.str }, { notify: true, reload: true, inherit: false });
            }
            console.log('keypress 13, isScanBarcode 1', $stateParams.isScanBarcode);
            // 掃描barcode會進入此(不是開相機掃barcode)
            // 需等 keyin 的字帶入 input 才移轉。由於 debounce 的關係 vm.search 尚未更新，需利用 jQuery 的方式取 search input 的值
            $timeout(() => {
                console.log('keypress 13 掃描 barcode', $state.current.name);
                if ($state.current.name !== 'allPdPatientsSearch' && $state.current.name !== 'summary' && $('#search').val() !== '') {
                    $state.go('allPdPatientsSearch', { str: $('#search').val(), isScanBarcode: true }, {
                        notify: false, reload: false, location: 'replace'
                    });
                }
            }, 500);
        } else if (ev.which === 27) {
            console.log('keypress 27');
            $timeout(() => {
                vm.search = '';
                vm.searchPatient();
            });
        } else {
            console.log('keypress other');
            $('#search').focus();

            // 需等 keyin 的字帶入 input 才移轉。由於 debounce 的關係 vm.search 尚未更新，需利用 jQuery 的方式取 search input 的值
            $timeout(() => {
                if ($state.current.name !== 'allPdPatientsSearch') {
                    $state.go('allPdPatientsSearch', { str: $('#search').val(), isScanBarcode: false }, {
                        notify: false, reload: false, location: 'replace'
                    });
                }
            }, 500);

        }
    }
    vm.selectDoctor = function(){
        filter_doctor_AllPatients();
    }
    vm.$onDestroy = function () {
        // nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', vm.scanBarCode);
        document.removeEventListener('volumedownbutton', vm.scanBarCode);
        document.removeEventListener('keypress', keypress);
        document.removeEventListener('deviceready', checkIosVersion);
    };

    vm.goToPatientListAdd = function goToPatientListAdd(patientId = null) {
        $state.go('patientDetail', {
            patientId
        });
    };

    // show filter dialog
    vm.showDialog = function showDialog() {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'filter.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'filter'
        });

        function DialogController(mdDialog) {
            const filter = this;
            filter.select = angular.copy(vm.searchOptions);
            delete filter.select.searchMode;
            filter.hide = function hide() {
                mdDialog.hide();
            };

            filter.cancel = function cancel() {
                mdDialog.cancel();
            };

            filter.ok = function ok() {
                vm.searchOptions = angular.extend(vm.searchOptions, filter.select);
                changeFilterPlaceHolder();
                vm.searchPatient(vm.search);

                $mdDialog.hide();
            };
        }
    };
    // 依據使用者選擇的 filter 選項變更 placeholder
    function changeFilterPlaceHolder() {
        // dict
        let filterName = {
            Name: $translate('allPatients.component.Name'),
            MedicalId: $translate('allPatients.component.MedicalId'),
            RFID: $translate('allPatients.component.RFID'),
            BarCode: $translate('allPatients.component.BarCode'),
            IdentifierId: $translate('allPatients.component.IdentifierId'),
            State: $translate('allPatients.component.inactivePatient')// '包含轉出、死亡等病人'
        };
        // 把 true 的選項 filter 出來
        let currentFilterOptions = Object.keys(vm.searchOptions).filter(key => key !== 'searchMode' && vm.searchOptions[key] === true);
        vm.filterHint = '';
        for (let i = 0; i < currentFilterOptions.length; i++) {
            vm.filterHint += filterName[currentFilterOptions[i]];
            if (i !== currentFilterOptions.length - 1) {
                vm.filterHint += ', ';
            }
        }
        console.log('vm.searchOptions', currentFilterOptions);
    }
    vm.searchPatient = function (searchStr) {
        if ($state.current.name !== 'allPdPatientsSearch') {
            return;
        }
        vm.loading = true;
        let barcodeBool = false;
        if ($stateParams.isScanBarcode) { barcodeBool = true; }
        $state.go('allPdPatientsSearch', { str: vm.search, isScanBarcode: barcodeBool }, {
            notify: false, reload: false, location: 'replace'
        }).then(() => {
            // 搜尋時由於列表資料重新整理，與 infinite scroll 相關的參數需初始化
            initForScroll();
            if (searchStr) {
                PatientService.searchPatient(currentUser.Id, searchStr)
                    .then((res) => {
                        // 依特定條件排序 patients: 依剩餘時間排序，null代表尚未洗排最上面; 若都沒有剩餘時間已後修改的為大
                        vm.patients = PatientService.orderPatients(res.data);
                        vm.patients = vm.patients.filter( e =>{
                            return e.State == '2';
                        });
                        vm.patients = changePatientsRepresent(vm.patients);
                        // do the filter here
                        let results = [];
                        angular.forEach(vm.searchOptions, (value, key) => {

                            // check which item is checked
                            if (key !== 'State' && value === true) {
                                // merge search results without duplicates
                                results = _.union(results, _.filter(vm.patients, function (item) {
                                    // if (item[key] != null) {
                                    //     return (item[key].toLowerCase().indexOf(vm.search.toLowerCase()) > -1);
                                    // }
                                    if (vm.searchOptions.State && item[key] != null) {
                                        // true -> 包含離開病人
                                        return (item[key].toLowerCase().indexOf(vm.search.toLowerCase()) > -1);
                                    } else if (!vm.searchOptions.State && item[key] != null) {
                                        // false -> 不包含離開病人 (預設為 false)
                                        switch (item.State) {
                                            case '5': // 轉院
                                            case '6': // 痊癒
                                            case '7': // 放棄
                                            case '8': // 不明原因退出
                                            case '9': // 死亡
                                                break;
                                            default:
                                                return (item[key].toLowerCase().indexOf(vm.search.toLowerCase()) > -1);
                                        }
                                    }
                                }));
                            }
                        });
                        vm.patients = results;

                        vm.loadMore();

                        vm.lastAccessTime = PatientService.getLastAccessTime();

                        vm.loading = false;
                        vm.isError = false;
                    }, () => {
                        vm.loading = false;
                        vm.isError = true;
                        showMessage($translate('allPatients.component.patientDataFail'));
                    });
            } else {
                vm.patients = [];
                vm.isError = false;
                vm.loading = false;
            }
        });
    };

    // 給前端顯示病人狀態及透析狀態
    function changePatientsRepresent(patients) {
        return patients.map((item) => {
            switch (item.State) {
                case '5':
                    item.StateFormat = $translate('allPatients.component.transfer'); // 轉院
                    break;
                case '6':
                    item.StateFormat = $translate('allPatients.component.getWell'); // 痊癒
                    break;
                case '7':
                    item.StateFormat = $translate('allPatients.component.giveUp'); // 放棄
                    break;
                case '8':
                    item.StateFormat = $translate('allPatients.component.dropOut'); // 不明原因退出
                    break;
                case '9':
                    item.StateFormat = $translate('allPatients.component.death'); // 死亡
                    break;
                default:
                    break;
            }

            // 病人透析狀態
            // StatusHtml 供前端判斷該顯示哪個狀態: 1->洗前, 2->XX:XX結束, 2.1->過期, 3->洗後, 4->關表
            // 先檢查是否為今日
            if (item.LastDialysisInfo && item.LastDialysisInfo.StartTime && moment(item.LastDialysisInfo.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                // 檢查順序 (符合即不須繼續比對): EndTime(關表) -> AfterWeight/BP(透析完成) -> EstimatedTime(透析中) -> BeforeWeight/BP StartTime(開表)
                if (item.LastDialysisInfo.EndTime) {
                    item.StatusHtml = 4;
                } else if (item.LastDialysisInfo.AfterWeight || item.LastDialysisInfo.AfterBP.BPS || item.LastDialysisInfo.AfterBP.BPD) {
                    item.StatusHtml = 3;
                } else if (item.LastDialysisInfo.EstimatedEndTime) {
                    if (moment(item.LastDialysisInfo.EstimatedEndTime).format('YYYYMMDDHHmm') < moment().format('YYYYMMDDHHmm')) {
                        item.StatusHtml = 2.1;  // 過期
                    } else {
                        item.StatusHtml = 2;
                    }
                } else {    // start time
                    item.StatusHtml = 1;
                }
            }
            return item;
        });
    }

    let allPatients = []; // 存所有病人資料提供給 scanbarcode / rfid 用，避免搜尋後被影響
    function getAllPatients(isForce = false) {
        vm.loading = true;
        PatientService.getByUserId(currentUser.Id, isForce)
            .then((d) => {
                console.log('getallpatients', d.data);
                // 依特定條件排序 patients: 依剩餘時間排序，null代表尚未洗排最上面; 若都沒有剩餘時間已後修改的為大
                allPatients = PatientService.orderPatients(d.data);
                allPatients = allPatients.filter( e =>{
                    return e.State == '2';
                });
                vm.old_patients = angular.copy(allPatients);
                filter_doctor_AllPatients();
                if ($state.current.name === 'allPdPatients') {
                    vm.patients = angular.copy(allPatients);
                    vm.patients = changePatientsRepresent(vm.patients);

                    initForScroll();
                    vm.loadMore();
                    vm.lastAccessTime = PatientService.getLastAccessTime();
                }
                vm.loading = false;
                vm.isError = false;
            }, (reason) => {
                vm.loading = false;
                vm.isError = true;
                console.error(reason);
                showMessage($translate('allPatients.component.patientDataFail'));
            });
    }
    function filter_doctor_AllPatients(){
        console.log('vm.sel_doctor',vm.sel_doctor);
        if(vm.sel_doctor != 'ALL'){
            allPatients = angular.copy(vm.old_patients);
            allPatients =  allPatients.filter( e =>{
                return e.PDAttendingPhysician == vm.sel_doctor
            });
            console.log('allPatients',allPatients);
            vm.currentPatients = allPatients;
            //return allPatients;
        }else{
            vm.currentPatients = vm.old_patients;
        }
    }
    // 初始化 infinite scroll 相關參數 (一次顯示多個)
    function initForScroll() {
        dataEnd = false;
        vm.currentPatients = [];
    }

    // scroll 至底時呼叫
    vm.loadMore = function () {
        if (dataEnd || !vm.patients || !vm.currentPatients) {
            return;
        }

        let lastIndex = vm.currentPatients.length - 1;

        let dataNum;
        // 判斷是否將為資料底
        if ((lastIndex + dataNumOnce) >= vm.patients.length - 1) {
            dataEnd = true;
            dataNum = vm.patients.length - lastIndex;
        } else {
            dataNum = dataNumOnce + 1;
        }

        for (let i = 1; i < dataNum; i++) {
            vm.currentPatients.push(vm.patients[lastIndex + i]);
        }

        console.log('keypress 13 isScanBarcode 2', $stateParams.isScanBarcode);
        // 如果是掃barcode的直接進下一階(不是開相機掃的)
        if ($stateParams.isScanBarcode && vm.currentPatients.length === 1) {
            // TODO: check for bugs
            // 攜帶搜尋字串，避免從summary回來時沒有搜尋字串
            $state.go('summary', { patientId: vm.currentPatients[0].Id, searchStr: $stateParams.str }, { notify: true, reload: true, inherit: false });
        }
    };

    vm.goToDialysis = function (item) {
        vm.loading = true;
        // TODO: check for bugs
        $state.go('summary', { patientId: item.Id }, { notify: true, reload: true, inherit: false });
    };

    vm.goToPD = function (item) {
        vm.loading = true;
        // TODO: check for bugs
        if (currentUser.Role !== null && currentUser.Role === "doctor") {
            $state.go('orderLR', { patientId: item.Id });
        } else {
            $state.go('frequencyImplantation', { patientId: item.Id });
        }
    };

    // function _searchByRfid(rfid) {
    //     if (rfid.Id) {
    //         vm.loading = true;

    //         for (let i = 0; i < allPatients.length; i++) {
    //             if (allPatients[i].RFID === rfid.Id) {
    //                 // $state.go('summary', { patientId: vm.patients[i].Id, index: 'last' });
    //                 $state.go('summary', { patientId: allPatients[i].Id, index: 'last' }, { notify: true, reload: true, inherit: false });
    //                 return;
    //             }
    //         }

    //         vm.loading = false;
    //         // showMessage('這張卡找不到病人 -> ' + rfid.Id);
    //         showMessage($translate('allPatients.component.rfidPatient', { rfid: rfid.Id }));
    //     }
    // }

    // 相機掃描
    function _searchByBarCode(code) {
        vm.loading = true;
        for (let i = 0; i < allPatients.length; i++) {
            if (allPatients[i].BarCode === code) {
                $state.go('summary', { patientId: allPatients[i].Id }, { notify: true, reload: true, inherit: false });
                return;
            }
        }

        vm.loading = false;
        // showMessage('條碼找不到病人 -> ' + code);
        showMessage($translate('allPatients.component.barCodePatient', { barCode: code }));
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
        console.log('scanBarCode() in all patients component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    _searchByBarCode(result.text);
                }
            },
            function (error) {
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

    /*
     * 搜尋相關 allPatientsSearch
    */
    // 按下 toolbar 裡面的搜尋按鈕
    vm.clickSearch = function () {
        $state.go('allPdPatientsSearch');
    };
    // search focus
    vm.selectSearch = function () {
        vm.searchOptions.searchMode = true;
        if (vm.search && searchFisrtTime) {
            vm.searchPatient(vm.search);
            searchFisrtTime = false;
        } else {
            vm.loading = false;
        }
    };
    vm.back = function () {
        const q = $q.defer();
        vm.searchOptions.searchMode = false;
        // history.go(-1);
        // 直接回allPatients
        $state.go('allPdPatients');
        q.resolve();
        return q.promise;

    };

    // 使用者按右上角重整按鈕時
    vm.refresh = function refresh() {
        console.log('refresh');
        if ($state.current.name === 'allPdPatientsSearch') {
            vm.searchPatient(vm.search);
        } else {
            getAllPatients(true);
        }
    };

    // Todo virtual repeat 必須給高度，因此需動態去算
    // vm.getListHeight = function () {
    //     return { height: '' + ($window.innerHeight - $("#toolbar").height() - $("#header").height()) + 'px' };
    // };
    // $window.addEventListener('resize', onResize);
    // function onResize() {
    //     vm.getListHeight();
    // }
    // $scope.$on('$destroy', function () {
    //     $window.removeEventListener('resize', onResize);
    // });

}

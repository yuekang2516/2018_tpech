import tpl from './allExecutionRecord.html';
import tpl2 from './allExecutionDetail.html';
import './allExecutionRecord.less';
import allExecutionDialogTpl from './allExecutionDialog.html';
import checkToDoDialogTpl from './checkToDoDialog.html';
import recordDeleteDialogTpl from './recordDeleteDialog.html';


angular.module('app').component('allExecutionRecord', {
    template: tpl,
    controller: allExecutionRecordCtrl
}).component('allExecutionDetail', {
    template: tpl2,
    controller: allExecutionDetailCtrl
});

allExecutionRecordCtrl.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$interval', '$timeout', '$mdDialog', '$mdMedia', 'allExecutionRecordService', 'dialysisService', 'showMessage', '$filter', 'SettingService', 'PatientService'];

function allExecutionRecordCtrl($rootScope, $scope, $stateParams, $state, $interval, $timeout, $mdDialog, $mdMedia, allExecutionRecordService, dialysisService, showMessage, $filter, SettingService, PatientService) {
    const self = this;
    const statePatientId = $stateParams.patientId;
    const stateHeaderId = $stateParams.headerId;
    self.serviceData = null;
    self.loading = true;
    self.lastAccessTime = moment();
    let $translate = $filter('translate');
    // 辨識系統別: HD/PD
    self.stateName = $state.current.name;


    // 折疊控制(適應不同螢幕大小)："今日不需執行等字樣", "執行"、"不執行"、"總紀錄"三個按鈕
    $scope.$watch(function () {
        // 在959~1560區間內時，要折疊下來，在<660區間內時，要折疊下來
        if ($mdMedia('(min-width: 959px) and (max-width: 1560px)') || $mdMedia('(max-width: 660px)')) {
            return true;
        }
        return false;
    }, function (isFold) {
        self.isFold = isFold;
        console.log('$watch self.isFold', self.isFold);
    });

    $rootScope.$on('allExecutionRecord-dataChanged', () => {
        self.refresh();
    });


    // 初始值
    self.$onInit = function $onInit() {
        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            self.patient = res.data;
        });
        // 今天日期
        self.currentDate = moment().format('YYYY-MM-DD');
        getAllRecordObj(statePatientId, stateHeaderId, true);
    };


    // 取得所有有效醫囑
    function getAllRecordObj(patientId, headerId, isForce) {
        allExecutionRecordService.loadRecordList(patientId, headerId, isForce).then((res) => {
            console.log('前端 執行列表 res', res);
            console.log('前端 執行列表 res.data', res.data);
            console.log('前端 透析日期 res.DialysisTime 1', res.DialysisTime);
            console.log('前端 透析日期 res.DialysisTime 2', moment(res.DialysisTime).format('YYYYMMDD'));
            // 檢查Record內的單筆紀錄狀態，如果status是deleted就先從陣列裡過濾掉
            _.forEach(res.data, function (value, key) {
                value.Records = _.filter(value.Records, function (o) {
                    return o.Status !== 'Deleted';
                });
            });
            self.serviceData = res.data;
            self.lastAccessTime = allExecutionRecordService.getLastAccessTime();
            self.DialysisTime = res.DialysisTime; // 透析日期 moment格式
            // _calculateRefreshTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        })
            .catch((err) => {
                // showMessage('讀取失敗, ' + err.data);
                self.loading = false;
                self.isError = true;
            })
            .finally(() => {
                self.loading = false;
            });
    }

    // 計算最後更新時間
    // function _calculateRefreshTime() {
    //     $timeout(() => {
    //         self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    //     }, 0);
    // }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        self.currentDate = moment().format('YYYY-MM-DD');
        getAllRecordObj(statePatientId, stateHeaderId, true);
    };

    self.goback = function () {
        history.go(-1);
    };

    // 提醒鈴：點選提醒鈴
    self.clickRemindBell = function clickRemindBell(event, remindStatus, masterId, serviceDataObj) {
        self.showMask = true;
        // 取得點選到的單筆執行紀錄
        let executionFile = _.find(serviceDataObj, function (o) {
            return o.Id === masterId;
        });
        let isRemind = '';
        if (remindStatus === 'on') {
            // 開啟提醒
            console.log('開啟提醒 on', masterId);
            isRemind = true;
            allExecutionRecordService.putRemind(masterId, isRemind).then((res) => {
                console.log('開啟提醒 on res', res);
                // 控制鈴鐺圖示切換
                executionFile.Remind = true;
                // 即時重讀未執行筆數
                $scope.$emit('tabCount', { type: 'allExecute' });
                showMessage($translate('allExecutionRecord.allExecutionRecord.component.remindOnSuccess'));
                self.showMask = false;
            }, (err) => {
                console.log('開啟提醒 on err', err);
                showMessage($translate('allExecutionRecord.allExecutionRecord.component.remindOnFail'));
                self.showMask = false;
            });
        } else {
            // 關閉提醒
            console.log('關閉提醒 off', masterId);
            isRemind = false;
            allExecutionRecordService.putRemind(masterId, isRemind).then((res) => {
                console.log('關閉提醒 off res', res);
                // 控制鈴鐺圖示切換
                executionFile.Remind = false;
                // 即時重讀未執行筆數
                $scope.$emit('tabCount', { type: 'allExecute' });
                showMessage($translate('allExecutionRecord.allExecutionRecord.component.remindOffSuccess'));
                self.showMask = false;
            }, (err) => {
                console.log('關閉提醒 off err', err);
                showMessage($translate('allExecutionRecord.allExecutionRecord.component.remindOffFail'));
                self.showMask = false;
            });
        }
    };


    // 點選 執行Performed / 不執行Neglect / 修改Update
    self.submit = function submit(type, id, event, needToDoTimes) {
        if (needToDoTimes === 0) {
            // 今日不需再執行
            showAlertNotToDo(type, id, event);
            console.log('今日不需再執行');
            return;
        }
        if (type === 'Performed' || type === 'Neglect') {
            if ($state.current.name.substr(0, 2) === "pd") {
                $state.go('pdAllExecutionDetail', {
                    patientId: statePatientId,
                    headerId: stateHeaderId,
                    // executionId: id,
                    masterId: id,
                    // 20190531 為配合Oracle資料庫 故後端Mode 全改為 OrderMode，但是前端router的參數依然維持 Mode 
                    mode: type, // 判斷是從執行或不執行按鈕進來的 
                    event: event, // 判斷是修改還是新增 new/update
                    dialysisTime: self.DialysisTime // 透析日期 moment格式
                });
            } else {
                $state.go('allExecutionDetail', {
                    patientId: statePatientId,
                    headerId: stateHeaderId,
                    // executionId: id,
                    masterId: id,
                    mode: type, // 判斷是從執行或不執行按鈕進來的
                    event: event, // 判斷是修改還是新增 new/update
                    dialysisTime: self.DialysisTime // 透析日期 moment格式
                });
            }
        }
    };

    // 總執行過的紀錄
    self.gotoAllExecutionDialog = function gotoAllExecutionDialog(executionObj, masterId, event) {
        console.log('點選的總紀錄 executionObj', executionObj);
        let dialysisTime = self.DialysisTime; // 透析日期 moment格式
        let patient = self.patient;
        let data = {
            executionObj,
            statePatientId,
            stateHeaderId,
            masterId,
            event, // 判斷是修改還是新增 new/update
            dialysisTime, // 透析日期 moment格式
            patient
        };
        $mdDialog.show({
            controller: allExecutionDialogController,
            template: allExecutionDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok', ok);

        }, (cancel) => {
            console.log('dialog cancel', cancel);
            // 處理刪除後從dialog回來時，確定有紀錄被刪除時
            if (data.deletedId) {
                console.log('dialog cancel data.deletedId', data.deletedId);
                console.log('dialog cancel executionObj', executionObj);
                // 重新取得新的紀錄清單
                self.loading = true;
                getAllRecordObj(statePatientId, stateHeaderId, true);
                // executionObj.Records = _.filter(executionObj.Records, function (o) {
                //     if (o.Id === data.deletedId && (moment(o.ProcessTime).format('YYYY-MM-DD') === moment(self.DialysisTime).format('YYYY-MM-DD'))) {
                //         // 如果刪除的紀錄與透析時間是同一天者，要記得把此筆數加回NeedToDo
                //         executionObj.NeedToDo += 1;
                //     }
                //     return o.Id !== data.deletedId;
                // });
                // 即時重讀未執行筆數(放著備用)
                $scope.$emit('tabCount', { type: 'allExecute' });
                console.log('2 dialog cancel executionObj', executionObj);
            }
        });
    };

    // 今日不需再執行alert
    function showAlertNotToDo(type, id, event) {

        let data = {
            type
        };
        $mdDialog.show({
            controller: checkToDoDialogController,
            template: checkToDoDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            fullscreen: false
            // fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok', ok);
            if (type === 'Performed' || type === 'Neglect') {
                if ($state.current.name.substr(0, 2) === 'pd') {
                    $state.go('pdAllExecutionDetail', {
                        patientId: statePatientId,
                        headerId: stateHeaderId,
                        // executionId: id,
                        masterId: id,
                        mode: type, // 判斷是從執行或不執行按鈕或是修改按鈕進來的
                        event: event, // 判斷是修改還是新增 new/update
                        dialysisTime: self.DialysisTime // 透析日期 moment格式
                    });
                } else {
                    $state.go('allExecutionDetail', {
                        patientId: statePatientId,
                        headerId: stateHeaderId,
                        // executionId: id,
                        masterId: id,
                        mode: type, // 判斷是從執行或不執行按鈕或是修改按鈕進來的
                        event: event, // 判斷是修改還是新增 new/update
                        dialysisTime: self.DialysisTime // 透析日期 moment格式
                    });
                }
            }
        }, (cancel) => {
            console.log('dialog cancel', cancel);
        });
    }

    // self.deleteRecord = function deleteRecord(deleteObj) {
    //     console.log('刪除 deleteObj', deleteObj);
    // };


}


allExecutionDetailCtrl.$inject = ['$timeout', '$rootScope', '$stateParams', '$state', 'showMessage', '$scope', '$filter', 'allExecutionRecordService', 'SettingService', 'PatientService', '$mdDialog', '$q', 'userService', 'signNurseService', 'nfcService', 'checkStaffService', 'tpechService'];

function allExecutionDetailCtrl(
    $timeout,
    $rootScope,
    $stateParams,
    $state,
    showMessage,
    $scope,
    $filter,
    allExecutionRecordService,
    SettingService,
    PatientService,
    $mdDialog,
    $q,
    userService,
    signNurseService,
    nfcService,
    checkStaffService,
    tpechService
) {
    const self = this;

    let $translate = $filter('translate');

    self.loading = true;

    // self.ProcessTime = null; // 執行時間
    self.timeMessage = ''; // 操作訊息


    // 核對簽章
    self.showSelect = [false, false]; // 網頁版 顯示簽章下拉選單or簽章
    self.showNfcBtn = [false, false]; // 手機版 簽章nfc按鈕or簽章
    self.isSelector = false; // 決定是顯示下拉選單or nfc
    self.signNurse = []; // 兩個核對者
    self.allSignNurses = []; // 兩組護理師清單：前端顯示、搜尋用
    self.nursesList = []; // 兩組護理師清單：處理資料用
    self.preSignNurse = []; // 前一個存檔過的簽章者 for web
    self.searchStr = []; // 搜尋字
    let nfcIndex; // 選取到哪個簽章for nfc
    self.iosNFCSupport = false; // 確認ios手機是否支援nfc
    let signRole = 'nurse'; // 簽章角色：目前篩選為護理師
    self.canAccess = true;

    self.$onInit = function $onInit() {
        console.log('透析時間$stateParams.dialysisTime', $stateParams.dialysisTime);
        console.log('細節$stateParams.mode', $stateParams.mode);
        console.log('細節$stateParams.event', $stateParams.event);
        console.log('細節CurrentUser', SettingService.getCurrentUser());
        console.log('細節CurrentUser id', SettingService.getCurrentUser().Id);
        console.log('細節CurrentUser name', SettingService.getCurrentUser().Name);

        self.mode = $stateParams.mode;
        // 核對簽章
        self.showSelect = [true, true];
        self.showNfcBtn = [true, true];
        // cordova.platformId = 'android';
        switch (cordova.platformId) {
            case 'browser':
                console.log('是 網頁版');
                self.isSelector = true; // 核對簽章：顯示下拉選單 isSelector
                break;
            case 'android':
                console.log('是 android');
                self.isSelector = false;
                break;
            case 'ios':
                console.log('是 ios');
                // 確認ios手機是否支援nfc
                checkIosVersion().then((qdata) => {
                    if (self.iosNFCSupport) {
                        // 有支援nfc
                        self.isSelector = false;
                    } else {
                        // 沒有支援nfc
                        self.isSelector = true; // 核對簽章：顯示下拉選單 isSelector
                    }
                }, (err) => {

                });
                break;
            default:
                break;
        }


        // 取得所有護理人員 參數isFilterLoginPerson = false -> 2019/2/26 改為不過濾掉登入者
        checkStaffService.getNurseStaff(false).then((nurses) => {
            console.log('回傳的 nurses 清單', nurses);
            self.firstAllStaff = angular.copy(nurses); // 前端顯示、搜尋用
            self.secondAllStaff = angular.copy(nurses); // 前端顯示、搜尋用

            getPatientDataById();
        }, (err) => {
            self.loading = false;
            self.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
        // 取得所有護理人員 參數isFilterLoginPerson = false -> 2019/2/26 改為不過濾掉登入者
        // signNurseService.getNurses(false).then((nurses) => {
        //     console.log('回傳的 nurses 清單', nurses);
        //     self.allSignNurses[0] = angular.copy(nurses); // 前端顯示、搜尋用
        //     self.allSignNurses[1] = angular.copy(nurses); // 前端顯示、搜尋用
        //     self.nursesList[0] = angular.copy(nurses); // 處理資料用
        //     self.nursesList[1] = angular.copy(nurses); // 處理資料用
        //     getPatientDataById();
        // }, (err) => {
        //     self.loading = false;
        //     self.isError = true;
        //     showMessage($translate('customMessage.serverError')); // lang.ComServerError
        // });
        
        // 取過敏藥
        PatientService.getById($stateParams.patientId).then((d) => {
            console.log('d.data.MedicineId', d.data.MedicalId);

            // getAllergicHistory(d.data.MedicalId);
            tpechService.getMedalrm(d.data.MedicalId).then((res) => {
                self.allergyMed = res.data;
            });
        });
    };

    // function getAllergicHistory(patno) {

    //         // getAllergicHistory(d.data.MedicalId);
    //     const deferred = $q.defer();

    //     // allergicHistory = [];
    //     // 取得死亡原因選項
    //     tpechService.getMedalrm(patno).then((res) => {
    //         console.log('getAllergicHistory', res.data);
    //         // allergicHistory = res.data;
    //         deferred.resolve();
    //     }, (err) => {
    //         deferred.resolve(); // 仍可帶入病人基本資料
    //         showMessage('查此病人的過敏史錯誤：' + err);
    //     });

    //     return deferred.promise;
    // }
    // 核對簽章 - 網頁版
    // 取得所有使用者(filter : role 護理師nurse / Access 未停用者) / 登入者不可為核對者
    // self.getNurses = function getNurses() {
    //     const deffered = $q.defer();
    //     userService.get().then((q) => {
    //         console.log('取得所有使用者 護理師 q', q);
    //         self.nursesList = _.filter(q.data, function (o) {
    //             return o.Role === 'nurse' && o.Access !== '0' && o.Id !== SettingService.getCurrentUser().Id;
    //         });
    //         // 不簽章用
    //         self.nursesList[0] = { Name: 'NoSign', EmployeeId: '', Id: '' };
    //         deffered.resolve(self.nursesList);
    //     }, (err) => {
    //         deffered.reject(err);
    //     });
    //     return deffered.promise;
    // };

    // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //     console.log('checkAccessible');
    //     if ($stateParams.event === 'update') {
    //         // 等確定有值才需判斷是否能編輯
    //         return !createdUserId || SettingService.checkAccessible(createdUserId);
    //     }
    //     return true;
    // };
    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
    }


    // 核對簽章 - 網頁版
    // 選擇簽章護理師後
    // self.selectSignNurse = function selectSignNurse(sign, index) {
    //     console.log('選擇簽章護理師後 sign 1', sign);
    //     console.log('選擇簽章護理師後 showSelect 1', self.showSelect);
    //     index = Number(index);
    //     // 控制顯示
    //     if (sign && sign.Name !== 'NoSign') {
    //         self.showSelect[index] = false;
    //     } else if (sign.Name === 'NoSign') {
    //         self.showSelect[index] = true;
    //         self.signNurse[index] = '';
    //     }
    //     console.log('self.signNurse', self.signNurse[index]);
    //     console.log('self.preSignNurse', self.preSignNurse[index]);

    //     // 核對者有異動，記得存檔
    //     doShowSaveAlertDialog(index);
    //     // 核對者有異動，記得存檔
    //     // if (self.signNurse[index] !== self.preSignNurse[index]) {
    //     //     // 核對者有異動，記得存檔
    //     //     console.log('核對者有異動，記得存檔');
    //     //     showSaveAlertDialog();
    //     // }

    // };

    // // 重選簽章
    // self.reSelectNurse = function reSelectNurse(index) {
    //     self.showSelect[index] = true;
    //     // self.signNurse = '';
    //     // 再次開啟下拉選單
    //     $('#sign-select-' + index).click();
    // };

    // // 核對簽章 搜尋護理師
    // self.searchNurse = function searchNurse(searchStr, index) {
    //     console.log('搜尋', searchStr);
    //     self.allSignNurses[index] = _.filter(angular.copy(self.nursesList[index]), (d) => {
    //         return d.Name.toLowerCase().includes(searchStr.toLowerCase());
    //     });
    // };

    // // clear search and load user data, md-select關閉時
    // self.clearSearch = function (sign, index) {
    //     self.searchStr[index] = '';
    //     self.allSignNurses[index] = self.nursesList[index];
    //     // 處理簽章顯示
    //     if (sign && sign.Name !== 'NoSign') {
    //         self.showSelect[index] = false;
    //     } else {
    //         // 點選不簽章時
    //         self.showSelect[index] = true;
    //         self.signNurse[index] = '';
    //     }
    // };


    // 跳出提醒注意的邏輯
    // function doShowSaveAlertDialog(index) {
    //     // 核對者有異動，記得存檔
    //     // 雙簽章皆有 && 雙簽章皆有姓名 && 簽章姓名有異動
    //     if (self.signNurse.length === 2 && (self.signNurse[0] !== '' && self.signNurse[1] !== '') && (self.signNurse[index] !== self.preSignNurse[index])) {
    //         // 雙簽章是否為不同人
    //         if (self.signNurse[0].Id === self.signNurse[1].Id) {
    //             // 雙簽章相同
    //             console.log('注意 核對者不可相同！！！！！！');
    //             let title = $translate('allExecutionRecord.allExecutionDetail.component.alertheSameTitle');
    //             let message = $translate('allExecutionRecord.allExecutionDetail.component.alertTheSameMessage');
    //             showSaveAlertDialog(title, message);
    //         } else {
    //             // 雙簽章不同人
    //             // 核對者有異動，記得存檔
    //             console.log('存檔提醒 核對者有異動，記得存檔');
    //             let title = $translate('allExecutionRecord.allExecutionDetail.component.alertSaveTitle');
    //             let message = $translate('allExecutionRecord.allExecutionDetail.component.alertSaveMessage');
    //             showSaveAlertDialog(title, message);
    //         }
    //     }
    // }


    // 核對簽章 - 手機版
    // 先關掉 patient nfc -> 開啟 nurse nfc -> 關掉 nurse nfc -> 再開啟 patient nfc
    // self.nfcSign = function nfcSign(iosNFCSupport, index) {
    //     console.log('核對簽章 手機版 index', index);
    //     // 先判斷是否為ios，且要有支援nfc
    //     if (iosNFCSupport) {
    //         // ios，且有支援nfc
    //         // begin ios nfc session
    //         nfc.beginSession((success) => {
    //             // success
    //             nfcService.listenNdef(_searchNurseByRfid);
    //         }, (failure) => {
    //             // fail
    //         });
    //     } else {
    //         // andriod
    //         // 靠卡提示 dialog
    //         nfcIndex = index;
    //         showNfcSignDialog(self.signNurse[index], index);
    //     }
    //     // // 確認是否已有簽章
    //     // if (self.signNurse) {
    //     //     // 有簽章 -> 掃同簽章：刪除 or 取消
    //     //     // 有簽章 -> 掃不同簽章：覆蓋 or 取消
    //     //     // 有簽章 -> 沒掃到id：提示
    //     //     console.log('有簽章', self.signNurse.Name);

    //     // } else {
    //     //     console.log('沒簽章');
    //     //     // 無簽章 -> 有掃到id：直接蓋章
    //     //     // 無簽章 -> 沒掃到id：提示

    //     // }

    // };


    // 確認ios手機是否支援nfc
    function checkIosVersion() {
        const deferred = $q.defer();
        // if it's iPhone 7, 7+ and ios version greater than 11.0
        // Model Ex. iPhone9,1 -> 9.1
        // 避免 device not defined 的問題
        try {
            console.log('確認ios手機是否支援nfc', device);
            let modelNum = Number(device.model.substring(6).replace(',', '.'));
            if (device.platform == 'iOS' && device.version >= '11.0' && modelNum > 9) {
                // if(device.platform == 'iOS'  && device.version <= '11.0') {
                self.iosNFCSupport = true;
            }
            deferred.resolve('checkFinish');
        } catch (error) {
            // console.log('nfc check error!!!!!!!!!!!!!');
        }

        return deferred.promise;
    }


    // 開啟 nurse nfc
    // function openNurseNfc() {
    //     console.log('開啟 nfc openNurseNfc', openNurseNfc);
    //     // 關掉掉 patient nfc
    //     nfcService.stop();
    //     // andriod
    //     nfcService.listenNdef(_searchNurseByRfid);
    //     nfcService.listenTag(_searchNurseByRfid);

    //     // // 先判斷是否為ios，且要有支援nfc
    //     // if (iosNFCSupport) {
    //     //     // ios，且有支援nfc
    //     //     // begin ios nfc session
    //     //     nfc.beginSession((success) => {
    //     //         // success
    //     //         nfcService.listenNdef(_searchNurseByRfid);
    //     //     }, (failure) => {
    //     //         // fail
    //     //     });

    //     // } else {
    //     //     // andriod
    //     //     nfcService.listenNdef(_searchNurseByRfid);
    //     //     nfcService.listenTag(_searchNurseByRfid);
    //     // }

    // }


    // search Nurse callback
    // function _searchNurseByRfid(rfid) {
    //     console.log('user nfc detected!!!');
    //     console.log('user nfc id', rfid);
    //     console.log('user nfc nfcIndex', nfcIndex);
    //     self.showNfcBtn[nfcIndex] = false;

    //     if (rfid.Id) {
    //         for (let i = 0; i < self.nursesList[nfcIndex].length; i++) {
    //             if (self.nursesList[nfcIndex][i].RFID === rfid.Id) {
    //                 // 有比對到 id
    //                 console.log('user nfc 找到護理師', self.nursesList[nfcIndex][i]);
    //                 // 確認是否已有簽章
    //                 if (self.signNurse[nfcIndex]) {
    //                     // 有簽章 -> 掃同簽章：刪除 or 取消
    //                     // 有簽章 -> 掃不同簽章：覆蓋 or 取消
    //                     console.log('有簽章', self.signNurse[nfcIndex].Name);
    //                     showNfcSignHasSealDialog(self.signNurse[nfcIndex], self.nursesList[nfcIndex][i], nfcIndex);

    //                 } else {
    //                     console.log('沒簽章');
    //                     // 無簽章 -> 有掃到id：直接蓋章
    //                     self.signNurse[nfcIndex] = self.nursesList[nfcIndex][i];
    //                     console.log('沒簽章2 self.signNurse', self.signNurse);
    //                     $mdDialog.cancel();// 關掉 靠卡提示 dialog

    //                     doShowSaveAlertDialog(nfcIndex);
    //                     // if (self.signNurse[nfcIndex] !== self.preSignNurse[nfcIndex]) {
    //                     //     // 核對者有異動，記得存檔
    //                     //     showSaveAlertDialog();
    //                     // }
    //                     reOpenPatientNfc(); // 重新開啟 patient nfc
    //                 }
    //                 return;
    //             }
    //         }
    //         // 沒比對到id
    //         // 有簽章 -> 沒掃到id：提示
    //         // 無簽章 -> 沒掃到id：提示
    //         if (self.signNurse[nfcIndex]) {
    //             self.showNfcBtn[nfcIndex] = false;
    //         } else {
    //             self.showNfcBtn[nfcIndex] = true;
    //         }

    //         // 雙簽章：其一可為登入者
    //         // 掃到登入者id -> 提示 '不可掃同使用者'
    //         // if (SettingService.getCurrentUser().RFID === rfid.Id) {
    //         //     showMessage($translate('overview.component.signNurseLoginMessage', { loginName: SettingService.getCurrentUser().Name }));
    //         //     // showMessage('核對簽章不可為目前登入者：' + SettingService.getCurrentUser().Name);
    //         //     // 關掉 靠卡提示 dialog
    //         //     $mdDialog.cancel();
    //         //     reOpenPatientNfc(); // 重新開啟 patient nfc
    //         //     return;
    //         // }

    //         // showMessage($translate('overview.component.rfidPatient', { rfid: rfid.Id }));
    //         showMessage($translate('allExecutionRecord.allExecutionDetail.component.rfidRoleNurseMessage', { rfid: rfid.Id }));
    //         //  showMessage('這張卡找不到使用者' + rfid.Id);
    //         // 關掉 靠卡提示 dialog
    //         $mdDialog.cancel();
    //         reOpenPatientNfc(); // 重新開啟 patient nfc
    //     }
    // }


    // nfc 靠卡提示
    // function showNfcSignDialog(signNurseObj, index) {
    //     let data = {
    //         signNurseObj: signNurseObj
    //     };
    //     $mdDialog.show({
    //         controller: nfcSignDialogController,
    //         template: `<md-dialog>
    //             <form ng-cloak>
    //                 <md-toolbar>
    //                     <div class="md-toolbar-tools">
    //                         <h2 translate>{{'overview.component.signNurse'}}</h2>
    //                         <!-- <h2>核對簽章</h2>  -->
    //                         <span flex></span>
    //                         <md-button class="md-icon-button" ng-click="dialog.cancel()">
    //                             <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
    //                         </md-button>
    //                     </div>
    //                 </md-toolbar>

    //                 <md-dialog-content>
    //                     <div class="md-dialog-content" translate>
    //                         <span ng-if="!dialog.showDeleted" translate>{{'overview.component.tagNfcCard'}}</span>
    //                         <span ng-if="dialog.showDeleted" translate>{{'overview.component.tagNfcCardOrDeleted'}}</span>
    //                         <!-- 請在此視窗顯示時，感應靠卡簽章。 或是刪除目前簽章。-->
    //                     </div>
    //                 </md-dialog-content>

    //                 <md-dialog-actions layout="row">
    //                     <md-button ng-if="dialog.showDeleted" class="md-warn md-raised" ng-click="dialog.deleted()">
    //                         {{'overview.component.deleted' | translate}}    
    //                         <!--刪除-->
    //                     </md-button>

    //                     <md-button class="md-raised" ng-click="dialog.cancel()">
    //                         {{'overview.component.canceled' | translate}}
    //                         <!-- 取消 -->
    //                     </md-button>
    //                 </md-dialog-actions>
    //             </form>
    //         </md-dialog>`,
    //         parent: angular.element(document.body),
    //         targetEvent: event,
    //         clickOutsideToClose: true,
    //         fullscreen: false,
    //         controllerAs: 'dialog',
    //         locals: {
    //             data
    //         },
    //     }).then((ok) => {
    //         // 刪除
    //         console.log('dialog ok', ok);
    //         self.signNurse[index] = '';

    //         doShowSaveAlertDialog(index);
    //         // if (self.signNurse[index] !== self.preSignNurse[index]) {
    //         //     // 核對者有異動，記得存檔
    //         //     showSaveAlertDialog();
    //         // }

    //         nfcService.stop(); // 關掉 nurse nfc
    //         reOpenPatientNfc(); // 重新開啟 patient nfc

    //     }, (cancel) => {
    //         console.log('關掉感應dialog');
    //         nfcService.stop(); // 關掉 nurse nfc
    //         reOpenPatientNfc(); // 重新開啟 patient nfc
    //     });

    //     nfcSignDialogController.$inject = ['data'];
    //     function nfcSignDialogController(data) {
    //         const dialog = this;
    //         console.log('user nfc data', data);
    //         dialog.showDeleted = false;
    //         // data.signNurseObj
    //         if (data.signNurseObj) {
    //             // 有簽章：顯示刪除按鈕
    //             dialog.showDeleted = true;
    //         }
    //         // 開啟 nurse nfc
    //         openNurseNfc();
    //         // 刪除原本的簽章
    //         dialog.deleted = function deleted() {
    //             $mdDialog.hide();
    //         };
    //         dialog.cancel = function cancel() {
    //             $mdDialog.cancel();
    //         };
    //     }
    // }


    // 原本有簽章，又再次掃卡 dialog
    // 有簽章 -> 掃同簽章：刪除 or 取消
    // 有簽章 -> 掃不同簽章：覆蓋 or 取消
    // function showNfcSignHasSealDialog(lastSignObj, signNurseObj, index) {
    //     let data = {
    //         signNurseObj: signNurseObj,
    //         lastSignObj: lastSignObj
    //     };
    //     $mdDialog.show({
    //         controller: nfcSignHasSealDialogController,
    //         template: `<md-dialog>
    //             <form ng-cloak>
    //                 <md-toolbar>
    //                     <div class="md-toolbar-tools">
    //                         <h2 translate>{{'overview.component.changeSignNurse'}}</h2>
    //                         <!-- <h2>異動核對者</h2> -->
    //                         <span flex></span>
    //                         <md-button class="md-icon-button" ng-click="dialog.cancel()">
    //                             <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
    //                         </md-button>
    //                     </div>
    //                 </md-toolbar>

    //                 <md-dialog-content>
    //                     <div class="md-dialog-content" translate>
    //                         <span ng-if="dialog.isDiffId" translate>{{'overview.component.checkChange'}}</span>
    //                         <span ng-if="!dialog.isDiffId" translate>{{'overview.component.checkDeleted'}}</span>
    //                         <!-- 已有核對者，確認異動核對者?  與目前簽章為同一人，是否要刪除？-->
    //                     </div>
    //                 </md-dialog-content>

    //                 <md-dialog-actions layout="row">
    //                     <md-button class="md-warn md-raised" ng-click="dialog.deleted()">
    //                         {{'overview.component.deleted' | translate}}    
    //                         <!--刪除-->
    //                     </md-button>
    //                     <md-button ng-if="dialog.isDiffId" class="md-raised md-primary" ng-click="dialog.changed()">
    //                         {{'overview.component.covered' | translate}}
    //                         <!--覆蓋-->
    //                     </md-button>
    //                     <md-button ng-if="!dialog.isDiffId" class="md-raised" ng-click="dialog.cancel()">
    //                         {{'overview.component.canceled' | translate}}
    //                         <!-- 取消 -->
    //                     </md-button>
    //                 </md-dialog-actions>
    //             </form>
    //         </md-dialog>`,
    //         parent: angular.element(document.body),
    //         targetEvent: event,
    //         clickOutsideToClose: true,
    //         fullscreen: false,
    //         controllerAs: 'dialog',
    //         locals: {
    //             data
    //         },
    //     }).then((ok) => {
    //         console.log('dialog ok', ok);
    //         if (data.whichBtn === 'deleted') {
    //             console.log('有簽章 ：刪除');
    //             self.signNurse[index] = '';

    //         } else if (data.whichBtn === 'changed') {
    //             console.log('有簽章 ：覆蓋');
    //             self.signNurse[index] = signNurseObj;
    //         }

    //         doShowSaveAlertDialog(index);
    //         // if (self.signNurse[index] !== self.preSignNurse[index]) {
    //         //     // 核對者有異動，記得存檔
    //         //     showSaveAlertDialog();
    //         // }

    //         nfcService.stop(); // 關掉 nurse nfc
    //         reOpenPatientNfc(); // 重新開啟 patient nfc

    //     }, (cancel) => {
    //         console.log('dialog cancel', cancel);
    //         console.log('有簽章 ：取消');
    //         nfcService.stop(); // 關掉 nurse nfc
    //         reOpenPatientNfc(); // 重新開啟 patient nfc
    //     });

    //     nfcSignHasSealDialogController.$inject = ['data'];
    //     function nfcSignHasSealDialogController(data) {
    //         const dialog = this;
    //         console.log('user nfc data', data);
    //         data.whichBtn = '';
    //         dialog.isDiffId = false;
    //         // 前一個簽章 data.lastSignObj
    //         // 本次掃的簽章 data.signNurseObj
    //         if (data.lastSignObj.Id === data.signNurseObj.Id) {
    //             // 掃到同簽章
    //             dialog.isDiffId = false;
    //         } else {
    //             // 掃到不同簽章
    //             dialog.isDiffId = true;
    //         }

    //         // 刪除原本的簽章
    //         dialog.deleted = function deleted() {
    //             data.whichBtn = 'deleted';
    //             $mdDialog.hide();
    //         };

    //         // 覆蓋原本的簽章
    //         dialog.changed = function changed() {
    //             data.whichBtn = 'changed';
    //             $mdDialog.hide();
    //         };

    //         dialog.cancel = function cancel() {
    //             $mdDialog.cancel();
    //         };
    //     }
    // }


    // function showSaveAlertDialog(title, message) {
    //     let data = {
    //         alertTitle: title,
    //         alertMessage: message
    //     };
    //     $mdDialog.show({
    //         controller: saveAlertDialogController,
    //         template: `<md-dialog>
    //             <form ng-cloak>
    //                 <md-toolbar>
    //                     <div class="md-toolbar-tools">
    //                         <h2>{{dialog.alertTitle}}</h2>
    //                         <!-- <h2 translate>{{'overview.component.alertSaveTitle'}}</h2> -->
    //                         <!-- <h2>存檔提醒</h2> -->
    //                         <span flex></span>
    //                         <md-button class="md-icon-button" ng-click="dialog.cancel()">
    //                             <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
    //                         </md-button>
    //                     </div>
    //                 </md-toolbar>

    //                 <md-dialog-content>
    //                     <div class="md-dialog-content" translate>
    //                         <span>{{dialog.alertMessage}}</span>
    //                         <!-- <span translate>{{'overview.component.alertSaveMessage'}}</span> -->
    //                         <!-- 核對簽章已異動，請記得至下方點選儲存。 -->
    //                     </div>
    //                 </md-dialog-content>

    //                 <md-dialog-actions layout="row">
    //                     <md-button class="md-raised" ng-click="dialog.cancel()">
    //                         {{'overview.component.closed' | translate}}
    //                         <!-- 關閉-->
    //                     </md-button>
    //                 </md-dialog-actions>
    //             </form>
    //         </md-dialog>`,
    //         parent: angular.element(document.body),
    //         targetEvent: event,
    //         clickOutsideToClose: true,
    //         fullscreen: false,
    //         controllerAs: 'dialog',
    //         locals: {
    //             data
    //         },
    //     }).then((ok) => {
    //         console.log('dialog ok', ok);

    //     }, (cancel) => {

    //         console.log('請存檔 ok self.signNurse', self.signNurse);
    //         console.log('dialog cancel', cancel);
    //     });

    //     saveAlertDialogController.$inject = ['data'];
    //     function saveAlertDialogController(data) {
    //         const dialog = this;
    //         dialog.alertTitle = data.alertTitle;
    //         dialog.alertMessage = data.alertMessage;

    //         dialog.cancel = function cancel() {
    //             $mdDialog.cancel();
    //         };
    //     }
    // }


    // 搜尋patient nfc
    // function reOpenPatientNfc() {
    //     nfcService.stop(); // 關掉 nurse nfc
    //     // 重新開啟 patient nfc
    //     nfcService.listenNdef(PatientService._searchByRfid);
    //     nfcService.listenTag(PatientService._searchByRfid);
    // }


    function getPatientDataById() {
        // 取得病人資料, 顯示於畫面上方標題列
        // PatientService.getById($stateParams.patientId).then((res) => {
        //     self.patient = res.data;
        // });

        self.event = $stateParams.event;

        if ($stateParams.event === 'update') {
            // 修改
            // Performed 執行
            // Neglect 不執行
            allExecutionRecordService.getOneRecordDetail($stateParams.masterId).then((q) => {
                console.log('Update 細節 q', q);
                self.serviceData = angular.copy(q.data);
                self.DetailMemo = self.serviceData.Memo;
                self.doctorMemo = self.serviceData.DoctorMemo;
                self.loading = false;
                self.isError = false; // 顯示伺服器連接失敗的訊息
                self.serviceData.OrderMode = $stateParams.mode;
                self.checkCreatedTime = new Date(self.serviceData.CreatedTime, self.serviceData.ModifiedUserId); // 比對執行時間用
                //修改再確認權限
                checkCanAccess(self.serviceData.CreatedUserId);
                // 修改時
                self.serviceData.ProcessTime = new Date(self.serviceData.ProcessTime);
                compareProcessTime();

                // 不是危險用藥，不須核對人員
                if (!self.serviceData.IsDangerMed) {
                    self.serviceData.CheckStaff = {};
                    return;
                }

                // 危險用藥才需要處理checkStaff
                if (self.serviceData.IsDangerMed && _.size(self.serviceData.CheckStaff) > 0) {
                    // 處理核對簽章 (id, name, allStaff, isFirst)
                    $timeout(() => {
                        initCheckStaff(_.keys(self.serviceData.CheckStaff)[0], _.values(self.serviceData.CheckStaff)[0], self.firstAllStaff, true);
                        initCheckStaff(_.keys(self.serviceData.CheckStaff)[1], _.values(self.serviceData.CheckStaff)[1], self.secondAllStaff, false);
                    }, 0);
                } else {
                    // 沒簽章
                    console.log('self.serviceData.CheckStaff 沒簽章', self.serviceData.CheckStaff);
                    // 處理簽章：預設第一個簽章為目前登入者
                    $timeout(() => {
                        firstSignNurseSetting(self.firstAllStaff);
                    }, 0);
                    // for (let i = 0; i < 2; i++) {
                    //     self.signNurse[i] = '';
                    //     self.preSignNurse[i] = ''; // 前一個存檔過的簽章者 for web
                    // }
                    // self.showSelect = [true, true]; // 網頁版 簽章下拉選單
                    // self.showNfcBtn = [true, true]; // 手機版 簽章nfc按鈕
                }

                // 危險用藥才需要處理checkStaff
                // 處理核對簽章
                // if (self.serviceData.IsDangerMed && self.serviceData.CheckStaff !== null) {
                //     console.log('self.serviceData.CheckStaff 有簽章', self.serviceData.CheckStaff);
                //     console.log('self.serviceData.CheckStaff 有簽章', self.serviceData.CheckStaff.length);
                //     // 有簽章
                //     let findNurse;
                //     for (let i = 0; i < 2; i++) {
                //         findNurse = _.filter(self.nursesList[i], function (o) {
                //             // console.log('處理核對簽章 o.Id', o.Id);
                //             // console.log('處理核對簽章 o', o.Id, o.Name, _.keys(self.serviceData.CheckStaff)[i]);
                //             return o.Id === _.keys(self.serviceData.CheckStaff)[i];
                //         });

                //         // 如果在清單中已找不到，自行push上去
                //         if (!findNurse[0]) {
                //             console.log('自行push上去 id', _.keys(self.serviceData.CheckStaff)[i]);
                //             console.log('自行push上去 name', _.values(self.serviceData.CheckStaff)[i]);
                //             self.nursesList[i].push({ Name: _.values(self.serviceData.CheckStaff)[i], Id: _.keys(self.serviceData.CheckStaff)[i] });
                //             // 新增的在最後一筆
                //             findNurse[0] = self.nursesList[i][self.nursesList[i].length - 1];
                //         }

                //         console.log('處理核對簽章 findNurse', findNurse[0]);

                //         self.signNurse[i] = findNurse[0];
                //         self.preSignNurse[i] = findNurse[0]; // 前一個存檔過的簽章者 for web

                //     }
                //     self.showSelect = [false, false]; // 網頁版 簽章下拉選單
                //     self.showNfcBtn = [false, false]; // 手機版 簽章nfc按鈕
                // } else {
                //     // 沒簽章
                //     console.log('self.serviceData.CheckStaff 沒簽章', self.serviceData.CheckStaff);
                //     // 處理簽章：預設第一個簽章為目前登入者
                //     firstSignNurseSetting();
                //     // for (let i = 0; i < 2; i++) {
                //     //     self.signNurse[i] = '';
                //     //     self.preSignNurse[i] = ''; // 前一個存檔過的簽章者 for web
                //     // }
                //     // self.showSelect = [true, true]; // 網頁版 簽章下拉選單
                //     // self.showNfcBtn = [true, true]; // 手機版 簽章nfc按鈕
                // }
            }, (reason) => {
                console.error(reason);
                self.loading = false;
                self.isError = true;
            });
        } else if ($stateParams.event === 'new') {
            // 新增
            // Performed 執行 / Neglect 不執行
            allExecutionRecordService.getMasterDetail($stateParams.masterId).then((q) => {
                console.log('Performed/Neglect master 細節 q', q);
                self.serviceData = q.data;
                self.doctorMemo = q.data.Memo;
                //self.DetailMemo = self.serviceData.Memo; // 從開藥紀錄帶過來的Memo
                self.DetailMemo = '';
                self.loading = false;
                self.isError = false; // 顯示伺服器連接失敗的訊息
                self.serviceData.OrderMode = $stateParams.mode;
                self.checkCreatedTime = new Date(moment().format('YYYY/MM/DD HH:mm')); // 比對執行時間用 取現在時間 不要娶到秒數，判斷現在時間會有誤差
                // 預設透析日期現在時間
                self.serviceData.ProcessTime = new Date(moment($stateParams.dialysisTime).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm'));
                compareProcessTime();
                // 有執行時才需要此資料
                if (!self.serviceData.ActualQuantity && $stateParams.mode === 'Performed') {
                    self.serviceData.ActualQuantity = self.serviceData.Quantity;
                }

                // 危險用藥才需要處理checkStaff
                if (self.serviceData.IsDangerMed) {
                    // 處理簽章：預設第一個簽章為目前登入者
                    $timeout(() => {
                        firstSignNurseSetting(self.firstAllStaff);
                    }, 0);
                } else {
                    self.serviceData.CheckStaff = {}; // 不是危險用藥，不須核對人員
                }
                // 危險用藥才需要處理checkStaff
                // if (self.serviceData.IsDangerMed) {
                //     // 處理簽章：預設第一個簽章為目前登入者
                //     firstSignNurseSetting();
                // } else {
                //     self.serviceData.CheckStaff = null; // 不是危險用藥，不須核對人員
                // }

            }, (reason) => {
                console.error(reason);
                self.loading = false;
                self.isError = true;
            });
        }
    }


    // 處理簽章：初始化兩個核對簽章
    function initCheckStaff(id, name, allStaff, isFirst) {
        // 處理核對簽章-第一核對者
        if (id !== null) {
            console.log('self.dialysisHeader.OnUserName 有簽章', name);
            // 有簽章
            let findNurse = _.filter(allStaff, function (o) {
                // console.log('處理核對簽章 o', o.Id, o.Name, _.keys(self.dialysisHeader.CheckStaff)[0]);
                return o.Id === id;
            });
            console.log('有簽章 findNurse', findNurse);
            // 如果在清單中已找不到，自行push上去
            if (!findNurse[0]) {
                // console.log('自行push上去 id', _.keys(self.dialysisHeader.CheckStaff)[0]);
                // console.log('自行push上去 name', _.values(self.dialysisHeader.CheckStaff)[0]);
                allStaff.push({ Name: name, Id: id });
                // 新增的在最後一筆
                findNurse[0] = allStaff[allStaff.length - 1];
            }

            if (isFirst) {
                self.firstStaff = findNurse[0];
                self.preFirstStaff = findNurse[0]; // 前一個存檔過的簽章者 for web
                self.showSelectForFirst = false; // 網頁版 簽章下拉選單
                self.showNfcBtnForFirst = false; // 手機版 簽章nfc按鈕
            } else {
                self.secondStaff = findNurse[0];
                self.preSecondStaff = findNurse[0]; // 前一個存檔過的簽章者 for web
                self.showSelectForSecond = false; // 網頁版 簽章下拉選單
                self.showNfcBtnForSecond = false; // 手機版 簽章nfc按鈕
            }

            console.log('firstStaff', self.firstStaff);
            console.log('secondStaff', self.secondStaff);
        } else {
            // 沒簽章
            console.log('self.dialysisHeader.OnUserName 沒簽章', name);
            if (isFirst) {
                console.log('沒簽章 1');
                self.firstStaff = '';
                self.preFirstStaff = ''; // 前一個存檔過的簽章者 for web
                self.showSelectForFirst = true; // 網頁版 簽章下拉選單
                self.showNfcBtnForFirst = true; // 手機版 簽章nfc按鈕
            } else {
                console.log('沒簽章 2');
                self.secondStaff = '';
                self.preSecondStaff = ''; // 前一個存檔過的簽章者 for web
                self.showSelectForSecond = true; // 網頁版 簽章下拉選單
                self.showNfcBtnForSecond = true; // 手機版 簽章nfc按鈕
            }
        }
    }


    // 處理簽章：預設第一個簽章為目前登入者，同時其角色必須是護理師，因若不是護理師，則不會出現在護理師清單中
    // 2019/2/26 改為不限制角色
    function firstSignNurseSetting(allStaff) {
        let currentUserId = SettingService.getCurrentUser().Id;
        // 預帶
        let findNurse = _.filter(allStaff, function (o) {
            return o.Id === currentUserId;
        });
        // 清單列只會顯示角色為護理師的姓名，其他角色不會出現
        // 如果在清單中已找不到，自行push上去
        if (!findNurse[0]) {
            allStaff.unshift({ Name: SettingService.getCurrentUser().Name, Id: currentUserId });
            // 新加的要加在第一筆
            findNurse[0] = allStaff[0];
            // 新增的在最後一筆
            // findNurse[0] = allStaff[allStaff.length - 1];
        }

        self.firstStaff = findNurse[0];
        self.preFirstStaff = findNurse[0]; // 前一個存檔過的簽章者 for web 原始就是空值，預帶，就是預帶的值
        self.showSelectForFirst = false; // 網頁版 簽章下拉選單
        self.showNfcBtnForFirst = false; // 手機版 簽章nfc按鈕
        // 第二個簽章空白
        self.secondStaff = '';
        self.preSecondStaff = '';
        self.showSelectForSecond = true; // 網頁版 簽章下拉選單
        self.showNfcBtnForSecond = true; // 手機版 簽章nfc按鈕

        // 角色為護理師
        // let currentUserRole = SettingService.getCurrentUser().Role;
        // if (currentUserRole === signRole) {
        //     // 有預帶
        //     let findNurse = _.filter(self.nursesList[0], function (o) {
        //         return o.Id === currentUserId;
        //     });
        //     self.signNurse[0] = findNurse[0];
        //     self.preSignNurse[0] = ''; // 前一個存檔過的簽章者 for web 原始就是空值，只是預帶，故原本應是沒有值的
        //     self.showSelect[0] = false; // 網頁版 簽章下拉選單
        //     self.showNfcBtn[0] = false; // 手機版 簽章nfc按鈕
        //     // 第二個簽章空白
        //     self.signNurse[1] = '';
        //     self.preSignNurse[1] = '';
        //     self.showSelect[1] = true; // 網頁版 簽章下拉選單
        //     self.showNfcBtn[1] = true; // 手機版 簽章nfc按鈕
        // } else {
        //     // 無預帶
        //     // 空值讓save button 的 disable 辨識
        //     for (let i = 0; i < 2; i++) {
        //         self.signNurse[i] = '';
        //         self.preSignNurse[i] = ''; // 前一個存檔過的簽章者 for web
        //     }
        //     self.showSelect = [true, true]; // 網頁版 簽章下拉選單
        //     self.showNfcBtn = [true, true]; // 手機版 簽章nfc按鈕
        // }


    }

    // 比對執行時間
    function compareProcessTime() {
        console.log('時差 checkCreatedTime', moment(self.checkCreatedTime).format('YYYY-MM-DD HH:mm:ss'));
        console.log('時差 ProcessTime', moment(self.serviceData.ProcessTime).format('YYYY-MM-DD HH:mm:ss'));
        console.log('時差 相差', moment(moment(self.serviceData.ProcessTime).format('YYYY-MM-DD HH:mm')).diff(moment(self.checkCreatedTime).format('YYYY-MM-DD HH:mm')));
        // 比對到分鐘即可
        if (moment(moment(self.serviceData.ProcessTime).format('YYYY-MM-DD HH:mm')).diff(moment(self.checkCreatedTime).format('YYYY-MM-DD HH:mm')) < 0) {
            // self.timeMessage = '請注意，執行時間比建立時間(' + moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') + ')早。';
            if ($stateParams.event === 'new') {
                // 新增時與現在時間比對
                // self.timeMessage = '請注意，執行時間比現在時間(' + moment(self.checkCreatedTime).format('YYYY/MM/DD HH:mm') + ')早。';
                self.timeMessage = $translate('allExecutionRecord.allExecutionDetail.component.timeEarlierNow') + moment(self.checkCreatedTime).format('YYYY/MM/DD HH:mm');
            } else {
                // 修改時與執行紀錄執行時間做比對
                self.timeMessage = $translate('allExecutionRecord.allExecutionDetail.component.timeEarlier', { createdTime: moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') });
            }
        } else if (moment(moment(self.serviceData.ProcessTime).format('YYYY-MM-DD HH:mm')).diff(moment(self.checkCreatedTime).format('YYYY-MM-DD HH:mm')) > 0) {
            self.timeMessage = $translate('allExecutionRecord.allExecutionDetail.component.timeLater');
        } else {
            self.timeMessage = '';
        }
    }

    // 當日期或時間有修改時
    self.dateChanged = function () {
        compareProcessTime();
    };

    self.isSaving = false;
    // 新增一筆 執行紀錄 或 不執行紀錄
    self.submit = function submit() {

        self.isSaving = true;

        // 危險用藥才需要
        if (self.serviceData.IsDangerMed) {
            // 先處理核對簽章
            self.serviceData.CheckStaff = {};
            self.preFirstStaff = self.firstStaff;
            self.serviceData.CheckStaff[self.firstStaff.Id] = self.firstStaff.Name;
            self.preSecondStaff = self.secondStaff;
            self.serviceData.CheckStaff[self.secondStaff.Id] = self.secondStaff.Name;
        }
        // 危險用藥才需要
        // if (self.serviceData.IsDangerMed) {
        //     // 先處理核對簽章
        //     self.serviceData.CheckStaff = {};
        //     for (let i = 0; i < self.signNurse.length; i++) {
        //         // 處理核對簽章
        //         console.log('上傳時 self.signNurse', self.signNurse[i]);
        //         self.preSignNurse[i] = self.signNurse[i];
        //         self.serviceData.CheckStaff[self.signNurse[i].Id] = self.signNurse[i].Name;
        //     }
        // }

        if ($stateParams.event === 'update') {
            // 修改一筆執行紀錄 put
            console.log('修改 執行/不執行 put');
            // 上傳修改的資料，self.serviceData
            self.serviceData.ModifiedTime = null;
            self.serviceData.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.serviceData.ModifiedUserName = SettingService.getCurrentUser().Name;
            self.serviceData.Memo = self.DetailMemo;

            console.log('修改 最後上傳 self.serviceData', self.serviceData);

            allExecutionRecordService.put(self.serviceData).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('allExecutionRecord.allExecutionDetail.component.editSuccess'));
                    // 即時重讀未執行筆數(放著備用)
                    $scope.$emit('tabCount', { type: 'allExecute' });
                    console.log('前一頁', $state);

                    history.go(-1);
                }
            }).catch((err) => {
                showMessage($translate('allExecutionRecord.allExecutionDetail.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });

        } else if ($stateParams.event === 'new') {
            // 新增一筆執行紀錄 post
            console.log('新增 執行/不執行 post');
            // 處理要上傳的資料，self.serviceData不用全傳
            let recordData = setNewUploadData();
            // 核對簽章
            recordData.CheckStaff = self.serviceData.CheckStaff;
            recordData.DoctorMemo = self.doctorMemo;

            console.log('新增 最後上傳 recordData', recordData);

            allExecutionRecordService.post(recordData).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('allExecutionRecord.allExecutionDetail.component.editSuccess'));
                    // 即時重讀未執行筆數(放著備用)
                    $scope.$emit('tabCount', { type: 'allExecute' });
                    // $state.go('allExecutionRecord');
                    history.go(-1);
                }
            }).catch((err) => {
                showMessage($translate('allExecutionRecord.allExecutionDetail.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    // 回上頁
    self.goback = function goback() {
        history.go(-1);
    };

    // 處理新增要上傳的資料
    function setNewUploadData() {
        let uploadData = {};
        uploadData.DialysisId = $stateParams.headerId;
        uploadData.MasterId = $stateParams.masterId;
        uploadData.PatientId = self.serviceData.PatientId;
        uploadData.MedicineId = self.serviceData.MedicineId;
        uploadData.Code = self.serviceData.Code;
        uploadData.Name = self.serviceData.Name;
        uploadData.ProcessTime = self.serviceData.ProcessTime;
        uploadData.OrderMode = self.serviceData.OrderMode;
        uploadData.Quantity = self.serviceData.Quantity;
        uploadData.ActualQuantity = self.serviceData.ActualQuantity;
        uploadData.QuantityUnit = self.serviceData.QuantityUnit;
        uploadData.Frequency = self.serviceData.Frequency;
        uploadData.Route = self.serviceData.Route;
        uploadData.Memo = self.DetailMemo;
        // uploadData.CreatedTime = moment();
        uploadData.CreatedUserId = SettingService.getCurrentUser().Id;
        uploadData.CreatedUserName = SettingService.getCurrentUser().Name;
        uploadData.IsDangerMed = self.serviceData.IsDangerMed;
        // uploadData.ModifiedTime = null;
        // uploadData.ModifiedUserId = null;
        // uploadData.ModifiedUserName = null;
        return uploadData;
    }

    // 刪除
    self.deleteRecord = function deleteRecord(deleteObj) {
        console.log('刪除 deleteObj', deleteObj);
        // 顯示刪除的dialog
        showAlertDelete(deleteObj);
    };

    // 刪除單筆執行紀錄alert
    function showAlertDelete(deleteObj) {
        console.log('刪除的紀錄', deleteObj);
        let deleteData = {
            deleteObj
        };
        $mdDialog.show({
            controller: recordDeleteDialogController,
            template: recordDeleteDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            multiple: true,
            locals: {
                deleteData
            },
            fullscreen: false
            // fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok', deleteObj.Id);
            allExecutionRecordService.deleteRecord(deleteObj.Id).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('allExecutionRecord.allExecutionDialog.component.deleteSuccess'));
                    // 即時重讀未執行筆數(放著備用)
                    $scope.$emit('tabCount', { type: 'allExecute' });
                    history.go(-1);
                } else {
                    showMessage($translate('allExecutionRecord.allExecutionDialog.component.deleteFail'));
                }
            });
        }, (cancel) => {
            console.log('dialog cancel');
        });
    }


}


// allExecutionDialog
angular
    .module('app')
    .controller('allExecutionDialogController', allExecutionDialogController);

allExecutionDialogController.$inject = ['$state', '$mdDialog', 'showMessage', 'data', 'allExecutionRecordService', '$scope', '$filter', 'SettingService'];

function allExecutionDialogController(
    $state,
    $mdDialog,
    showMessage,
    data,
    allExecutionRecordService,
    $scope,
    $filter,
    SettingService
) {
    const self = this;
    let executionObj = data.executionObj;
    let statePatientId = data.statePatientId;
    let stateHeaderId = data.stateHeaderId;
    let masterId = data.masterId;
    let event = data.event;
    let dialysisTime = data.dialysisTime;
    self.patient = data.patient;
    console.log('總紀錄 dialog', executionObj);

    self.isNoData = false;  // 控制顯示'目前沒有資料'的畫面

    // 取得藥物名稱
    self.Name = executionObj.Name;
    // 取得所有執行紀錄清單
    self.Records = executionObj.Records;
    // self.Records[0].Status = 'Deleted';

    let $translate = $filter('translate');
    console.log('總紀錄 Records', executionObj.Records);


    // 顯示單筆執行紀錄
    self.gotoRecordDetail = function gotoRecordDetail(id, type) {
        console.log('顯示單筆執行紀錄 id', id);
        $mdDialog.hide();

        if ($state.current.name.substr(0, 2) === 'pd') {
            $state.go('pdAllExecutionDetail', {
                patientId: statePatientId,
                headerId: stateHeaderId,
                // executionId: id,
                masterId: id,
                mode: type, // 判斷是從執行或不執行按鈕或是修改按鈕進來的
                event: event, // 判斷是修改還是新增 new/update
                dialysisTime: dialysisTime
            });
        } else {
            $state.go('allExecutionDetail', {
                patientId: statePatientId,
                headerId: stateHeaderId,
                // executionId: id,
                masterId: id,
                mode: type, // 判斷是從執行或不執行按鈕或是修改按鈕進來的
                event: event, // 判斷是修改還是新增 new/update
                dialysisTime: dialysisTime
            });
        }
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };


    self.deleteRecord = function deleteRecord(deleteObj) {
        console.log('刪除 deleteObj', deleteObj);
        // 顯示刪除的dialog
        showAlertDelete(deleteObj);
    };

    // 確認權限是否能修改
    self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
        return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });

    };

    // 刪除單筆執行紀錄alert
    function showAlertDelete(deleteObj) {
        console.log('刪除的紀錄', deleteObj);
        let deleteData = {
            deleteObj
        };
        $mdDialog.show({
            controller: recordDeleteDialogController,
            template: recordDeleteDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            multiple: true,
            locals: {
                deleteData
            },
            fullscreen: false
            // fullscreen: !$mdMedia('gt-sm') // Only for -xs, -sm breakpoints.
        }).then((ok) => {
            console.log('dialog ok', ok);
            allExecutionRecordService.deleteRecord(deleteObj.Id).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('allExecutionRecord.allExecutionDialog.component.deleteSuccess'));
                    // 使此筆紀錄的Status改為Deleted，這樣就不需為了畫面，再重撈資料
                    deleteObj.Status = 'Deleted';
                    // 即時重讀未執行筆數(放著備用)
                    // $scope.$emit('tabCount', { type: 'allExecute' });
                    // 要傳回被刪除紀錄的Id到dialog
                    data.deletedId = deleteObj.Id;
                    // 如果是最後一筆被刪掉，要顯示'目前沒有資料'的畫面
                    // 確認目前的array的長度，因為沒有真的刪除此筆紀錄，所以是用另一個變數去判斷
                    let checkArrayLength = executionObj.Records.length;
                    checkArrayLength -= 1;
                    if (checkArrayLength === 0) {
                        self.isNoData = true; // 控制顯示'目前沒有資料'的畫面
                    }
                } else {
                    showMessage($translate('allExecutionRecord.allExecutionDialog.component.deleteFail'));
                }
            });
        }, (cancel) => {
            console.log('dialog cancel');
        });
    }


}


// checkToDoDialog 確認是否要執行或不執行
angular
    .module('app')
    .controller('checkToDoDialogController', checkToDoDialogController);

checkToDoDialogController.$inject = ['$state', '$mdDialog', 'data'];

function checkToDoDialogController(
    $state,
    $mdDialog,
    data,
) {
    const self = this;

    self.type = data.type;
    console.log('checkToDoDialogController type', self.type);

    self.ok = function () {
        $mdDialog.hide();
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}


// recordDeleteDialog 確認是否刪除單筆紀錄
angular
    .module('app')
    .controller('recordDeleteDialogController', recordDeleteDialogController);

recordDeleteDialogController.$inject = ['$state', '$mdDialog', 'deleteData'];

function recordDeleteDialogController(
    $state,
    $mdDialog,
    deleteData,
) {
    const self = this;

    console.log('dialog 要刪除的', deleteData.deleteObj);
    self.ok = function () {
        $mdDialog.hide();
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}

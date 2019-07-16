import labexamTablePrint from './labexamTablePrint.html';

import './labexamTablePrint.less';

angular.module('app')
    .component('labexamTablePrint', {
        template: labexamTablePrint,
        controller: labexamTablePrintCtrl,
        controllerAs: '$ctrl'
    });

labexamTablePrintCtrl.$inject = ['$q', '$window', '$stateParams', 'ReferralSheetService', '$scope', '$state', 'moment',
    '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'PatientService', 'infoService', 'cursorInput', 'SessionStorageService', '$mdDialog', 'tpechService', 'DoctorNoteService', 'userService'];

function labexamTablePrintCtrl($q, $window, $stateParams, ReferralSheetService,
    $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, PatientService, infoService, cursorInput, SessionStorageService, $mdDialog, tpechService, DoctorNoteService, userService) {
    const self = this;

    self.user = SettingService.getCurrentUser();
    self.printData = {}; // 列印資料
    self.currentPatient = {};
    self.isError = false;

    self.isBrowser = cordova.platformId === 'browser';

    let originalDataObj = {};

    // 預設畫面
    self.$onInit = function $onInit() {
        self.loading = true;
        // 取得登入者角色，醫生才可以刪除
        self.loginRole = SettingService.getCurrentUser().Role;
        // console.log('取得登入者角色 self.loginRole', self.loginRole);

        // 印表日期 先以西元顯示
        self.printData.PrintingDate = moment().format('YYYY/MM/DD HH:mm');
        // 先取得病人資料
        getPatientData().then((q) => {
            // 取得前頁傳來的檢驗資料 (存在 $sessionStorage 裡)
            // labData, settingData
            originalDataObj = angular.copy(SessionStorageService.getItem('labexamTableData'));
            console.log('原始資料 originalDataObj', originalDataObj);

            // 找出最大的SortNo，如果沒有，就給他0
            // 找出最大的SortNo，如果沒有，就給他0
            let maxOrderArraySortNo = _.maxBy(originalDataObj.settingData, 'SortNo') ? _.maxBy(originalDataObj.settingData, 'SortNo').SortNo : 0;
            let maxServiceDataSortNo = _.maxBy(originalDataObj.labData, 'SortNo') ? _.maxBy(originalDataObj.labData, 'SortNo').SortNo : 0;
            let maxSortNo = Math.max(maxOrderArraySortNo, maxServiceDataSortNo);
            console.log('最大 maxSortNo', maxSortNo);

            self.finalData = angular.copy(originalDataObj.labData).map((item) => {

                // 先統一時間格式，方便後續的 groupBy
                item.CheckTime = moment(item.CheckTime).format('YYYY/MM/DD HH:mm');

                let idx = _.findIndex(originalDataObj.settingData, (o) => {
                    // return o.regex.test(item.Name);
                    return o.Name === item.Name;
                });

                // 區間
                    // 區間單位 Unit
                    let areaUnit = '';
                    let normalDown = '-';
                    let normalUpper = '-';
                if (idx > -1) {
                    // 將settingData內的資料寫到item裡
                    // 群組
                    item.SettingGroup = originalDataObj.settingData[idx].SettingGroup;
                    // 組內排序：沒有SortNo，塞最大值給他
                    item.SortNo = originalDataObj.settingData[idx].SortNo || maxSortNo + 1;
                    // 區間
                    // 區間單位 Unit
                    areaUnit = originalDataObj.settingData[idx].Unit;
                    normalDown = originalDataObj.settingData[idx].NormalDown ? originalDataObj.settingData[idx].NormalDown.toString().concat(areaUnit) : '-';
                    normalUpper = originalDataObj.settingData[idx].NormalUpper ? originalDataObj.settingData[idx].NormalUpper.toString().concat(areaUnit) : '-';
                    
                    // memo
                    item.PatientMemo = originalDataObj.settingData[idx].PatientMemo || '-';
                    // TODO: Value Unit
                    let valueUnit = item.Unit ? item.Unit : '';
                    item.Value = item.Value ? item.Value.toString().concat(valueUnit) : '-';

                } else {
                    // 組內排序，若無排序號碼塞最後
                    item.SortNo = item.SortNo || maxSortNo + 1;
                    // 區間
                    areaUnit = item.Unit;
                    normalDown = item.NormalDown ? item.NormalDown.toString().concat(areaUnit) : '-';
                    normalUpper = item.NormalUpper ? item.NormalUpper.toString().concat(areaUnit) : '-';

                    // memo
                    item.PatientMemo = item.PatientMemo || '-';
                }
                item.Area = (normalDown === '-' && normalUpper === '-') ? '-' : normalDown.concat(' ~ ', normalUpper);

                // 確認是否異常
                if ((item.NormalDown && Number(item.NormalDown) > Number(item.Value)) || (item.NormalUpper && Number(item.NormalUpper) < Number(item.Value)) || item.IsNormal === false) {
                    item.isAbnormal = true;
                }

                return item;
            });


            // 先依SortNo排序，再依SettingGroup群組
            self.finalData = _.groupBy(_.orderBy(self.finalData, ['SortNo', 'SettingGroup']), 'SettingGroup');

            // group裡再用 Name, checkTime 排序
            _.forEach(self.finalData, (value, key) => {
                self.finalData[key] = _.orderBy(value, ['SortNo', 'Name', 'CheckTime']);
            });

            console.log('處理完資料 self.finalData', self.finalData);

        }).catch(() => {
            console.log('病人資料 catch');
            self.isError = true;
            showMessage(lang.ComServerError);
        }).finally(() => {
            self.loading = false;
        });
    };


    // 1. 病人相關資料
    function getPatientData() {
        const deferred = $q.defer();
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = angular.copy(res.data);
            console.log('目前病人 self.currentPatient', angular.copy(res.data));
            // 病人相關欄位資料：設定部分病人欄位資料
            angular.extend(self.printData, {
                Name: self.currentPatient.Name,  // 病人姓名
                Gender: self.currentPatient.Gender ? self.currentPatient.Gender : '-',  // 性別
                MedicalId: self.currentPatient.MedicalId ? self.currentPatient.MedicalId : '-', // 病歷號
                IdentifierId: self.currentPatient.IdentifierId ? self.currentPatient.IdentifierId : '-', // 身分證號
            });
            deferred.resolve();
        }, (err) => {
            console.log('病人相關資料 err', err);
            deferred.reject();
        });
        return deferred.promise;
    }


    // 回上一頁
    self.goback = function goback(routeName) {
        history.go(-1);
    };




    // Todo 無法吃到相對路徑的 CSS
    self.print = function () {
        window.print();
        // if (self.isBrowser) {
        //     window.print();
        // }
    };

    self.$onDestroy = function onDestroy() {
        // 刪掉$sessionStorage裡的資料
        SessionStorageService.deleteItem('labexamTableData');
    };

}


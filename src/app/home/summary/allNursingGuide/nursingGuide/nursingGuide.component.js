import tpl from './nursingGuide.component.html';
import './nursingGuide.component.less';

angular.module('app').component('nursingGuide', {
    template: tpl,
    controller: nursingGuideCtrl
});

nursingGuideCtrl.$inject = ['$mdSidenav', '$scope', '$mdDialog', '$state', 'allNursingGuideService', 'SettingService', '$stateParams', 'showMessage', 'PatientService', '$mdMedia', '$interval', '$timeout', '$filter'];

function nursingGuideCtrl($mdSidenav, $scope, $mdDialog, $state, allNursingGuideService, SettingService,
    $stateParams, showMessage, PatientService, $mdMedia, $interval, $timeout, $filter) {

    // TODO checkAccess, api

    const self = this;

    self.isEdit = $stateParams.nursingGuideId !== 'create';

    self.items = [
        '血管通路照護',
        '水分控制技巧護理指導',
        '高血磷症之透析飲食護理指導',
        '高血鉀症之透析飲食護理指導',
        '血液透析病人飲食指導',
        '透析用藥安全',
        '日常生活照顧(包含血壓、血糖、體重檢測等)',
        '透析不適時之症狀與處理',
        '預防跌倒護理指導',
        '環境介紹與逃生說明',
        '血液透析治療須知',
        '血液透析合併症護理指導',
        '雙腔導管/動靜脈瘻管護理指導',
        '血液透析治療護理指導',
        '血液透析病人的居家照護護理指導'
    ];
    self.targetPersonType = ['本人', '子女', '配偶', '外傭'];
    self.checkPersonType = ['本人', '子女', '配偶', '外傭', '其他'];
    self.guideWays = ['口頭指導', '手冊', '單張', '影片', '示範'];
    self.answers = ['暸解', '部分暸解'];

    self.patientId = $stateParams.patientId;
    self.nursingGuideId = $stateParams.nursingGuideId;
    //load user info
    self.user = SettingService.getCurrentUser();

    self.inputOther = {};
    const $translate = $filter('translate');

    self.data = {
        PatientId: $stateParams.patientId,
        NursingGuideItems: []
    };
    for (let i = 0; i < self.items.length; i++) {
        self.data.NursingGuideItems.push({
            Title: self.items[i],
            Target: [],
            Way: [],
            Result: ''
        });
    }

    // refresh 相關
    self.lastAccessTime = moment();

    // 初始化
    self.$onInit = function onInit() {
        getData();
    };

    self.goback = function () {
        history.go(-1);
    };

    // 於 parent summary 頁有埋 admin-file 的 component 因此可以呼叫出來
    self.openFiles = function () {
        console.log('openFiles');
        $mdSidenav('rightFile').toggle();
    };

    function getData() {
        // 新增
        if ($stateParams.nursingGuideId === 'create') {
            self.data.RecordTime = new Date(moment().format('YYYY/MM/DD HH:mm:ss'));
            self.data.NursingGuideItems = self.data.NursingGuideItems;
        } else {
            // 修改
            allNursingGuideService.getById($stateParams.nursingGuideId).then((res) => {
                self.data = res.data;
                console.log('getById', self.data);
                self.data.RecordTime = new Date(moment(self.data.RecordTime).format('YYYY/MM/DD HH:mm:ss'));
                self.isError = false; // 顯示伺服器連接失敗的訊息
                angular.forEach(self.data.NursingGuideItems, function (val, k) {
                    if (self.data.NursingGuideItems[k].Target.length > 0) {
                        for (let i = 0; i < self.data.NursingGuideItems[k].Target.length; i++) {
                            let indx = self.checkPersonType.indexOf(self.data.NursingGuideItems[k].Target[i]);

                            if (indx == -1) {
                                self.inputOther[k] = self.data.NursingGuideItems[k].Target[self.data.NursingGuideItems[k].Target.length - 1];
                            }
                        }
                    }
                });
                self.data.RecordTime = moment(self.data.RecordTime).second(0).millisecond(0).toDate();
            }, () => {
                self.loading = false;
                self.isError = true; // 顯示伺服器連接失敗的訊息
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
        }
    }

    // 複選項目被點選時檢查是否已經存在，不存在就push進去
    self.itemChange = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            if (list[0] == '') {
                list.splice(list[0], 1);
                list.push(item);
            } else {
                list.push(item);
            }
        }
    };
    // 檢查check的
    self.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };
    // 單選的樣式
    self.selectOne = function (i, item) {
        //要先清空不然會一直在字串裡增加
        self.data.NursingGuideItems[i].Result = '';
        self.data.NursingGuideItems[i].Result += item;
    };
    self.submit = function () {

        if (self.nursingGuideId != 'create') {
            self.data.ModifiedUserId = self.user.Id;
            self.data.ModifiedUserName = self.user.Name;
            self.data.RecordTime = new Date(self.data.RecordTime);
            angular.forEach(self.data.NursingGuideItems, function (val, k) {
                let indx = self.checkPersonType.indexOf(self.data.NursingGuideItems[k].Target[self.data.NursingGuideItems[k].Target.length - 1]);
                let inputIndx = self.data.NursingGuideItems[k].Target.indexOf(self.inputOther[k]);
                if (indx > -1) {
                    if (inputIndx > -1) {
                        self.data.NursingGuideItems[k].Target.splice(inputIndx, 1);
                        self.data.NursingGuideItems[k].Target.push(self.inputOther[k]);
                    } else {
                        // self.data.NursingGuideItems[k].Target.splice(self.data.NursingGuideItems[k].Target.length - 1, 1);
                        self.data.NursingGuideItems[k].Target.push(self.inputOther[k]);
                    }
                } else {
                    self.data.NursingGuideItems[k].Target.splice(self.data.NursingGuideItems[k].Target.length - 1, 1);
                    self.data.NursingGuideItems[k].Target.push(self.inputOther[k]);
                }
            });
            allNursingGuideService.put(self.data).then((res) => {
                //success
                if (res.status === 200) {
                    showMessage($translate('assessment.assessment.component.editSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                //fail
                console.log('error: ' + JSON.stringify(err));
                showMessage($translate('assessment.assessment.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        } else {
            self.data.CreatedUserId = self.user.Id;
            self.data.CreatedUserName = self.user.Name;
            self.data.RecordTime = new Date(self.data.RecordTime);
            self.data.NursingGuideItems.Result = self.Result;
            // 將其他裡有填的東西push進去，才會在最後一個
            angular.forEach(self.data.NursingGuideItems, function (val, k) {

                if (self.inputOther[k] == null) {
                    self.inputOther[k] = '';
                    self.data.NursingGuideItems[k].Target.push(self.inputOther[k]);
                }
            });
            allNursingGuideService.post(self.data).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('assessment.assessment.component.createSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                //fail
                console.log('error: ' + JSON.stringify(err));
                showMessage($translate('assessment.assessment.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

}


import tpl from './custom.html';
import dtpl from './customDialog.html';
import './custom.less';

angular.module('app').component('custom', {
    template: tpl,
    controller: SystemCustomCtrl,
    controllerAs: 'vm'
});

SystemCustomCtrl.$inject = ['$mdSidenav', '$mdDialog', '$state', 'customService', 'showMessage', '$filter'];
function SystemCustomCtrl($mdSidenav, $mdDialog, $state, customService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function openLeftMenu() {
        $mdSidenav('left').toggle();
    };

    vm.actionType = 'nursingRecord';

    // 護理紀錄和訊息通知
    vm.list = [{ Title: $translate('custom.Dialysis_Start_Walk'), Key: 'Dialysis_Start_Walk', Filter: ['HEADER_BEFORE_WEIGHT'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_Start_Wheelchair'), Key: 'Dialysis_Start_Wheelchair', Filter: ['HEADER_BEFORE_WEIGHT'], Type: 'NursingRecordSetting' },
    // { Title: '修改表頭 - 輸血反應和之前不同', Key: 'Dialysis_Diff_TransfusionReaction', Filter: [], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_FirstData'), Key: 'Dialysis_FirstData', Filter: ['HEADER_FIRST_TIME_HHMM', 'HEADER_BF', 'HEADER_TARGET_TIME', 'HEADER_DEHYDRATION_TARGET', 'HEADER_HEPARIN'], Type: 'NursingRecordSetting' },
    // { Title: '修改表頭 - 洗前/後血壓改變', Key: 'Dialysis_Diff_BPS', Filter: [], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_After_BP'), Key: 'Dialysis_After_BP', Filter: ['HEADER_START_BPS', 'HEADER_START_BPD', 'HEADER_END_BPS', 'HEADER_END_BPD', 'HEADER_DEHYDRATION', 'MACHINE_DATA_TOTAL_UF', 'PATIENT_ENTRY_MODE'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_After_Weight'), Key: 'Dialysis_After_Weight', Filter: ['HEADER_START_BPS', 'HEADER_START_BPD', 'HEADER_END_BPS', 'HEADER_END_BPD', 'HEADER_DEHYDRATION', 'MACHINE_DATA_TOTAL_UF', 'PATIENT_ENTRY_MODE', 'HEADER_ENDWEIGHT'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_Closed'), Key: 'Dialysis_Closed', Filter: ['HEADER_START_BPS', 'HEADER_START_BPD', 'HEADER_END_BPS', 'HEADER_END_BPD', 'HEADER_DEHYDRATION', 'HEADER_DEVIATION', 'MACHINE_DATA_TOTAL_UF', 'PATIENT_ENTRY_MODE', 'HEADER_SETTINGDEHYDRATION', 'HEADER_ENDWEIGHT'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_Executive_Medication'), Key: 'Dialysis_Executive_Medication', Filter: ['MEDICATION_EXECUTIVE_TIME_HHMM', 'MEDICATION_NAME', 'MEDICATION_QUANITIY', 'MEDICATION_QUANITIY_UNIT', 'MEDICATION_FREQUENCY', 'MEDICATION_ROUTE', 'MEDICATION_MEMO'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_Neglect_Medication'), Key: 'Dialysis_Neglect_Medication', Filter: ['MEDICATION_EXECUTIVE_TIME_HHMM', 'MEDICATION_NAME', 'MEDICATION_QUANITIY', 'MEDICATION_QUANITIY_UNIT', 'MEDICATION_FREQUENCY', 'MEDICATION_ROUTE', 'MEDICATION_MEMO'], Type: 'NursingRecordSetting' },
    { Title: $translate('custom.Dialysis_DoctorNote_Change'), Key: 'Dialysis_DoctorNote_Change', Filter: ['DOCTOR_CHANGE_CONTENT', 'CHANGE_USER_NAME', 'BEFORE_DOCTOR_CONTENT'], Type: 'NotificationSetting' },
    { Title: $translate('custom.Dialysis_Add_Order'), Key: 'Dialysis_Add_Order', Filter: ['MEDICATION_ORDER_DATE_MMDD', 'MEDICATION_NAME', 'MEDICATION_ROUTE', 'MEDICATION_FREQUENCY', 'MEDICATION_QUANITIY', 'MEDICATION_QUANITIY_UNIT', 'MEDICATION_CREATED_NAME'], Type: 'NotificationSetting' },
    { Title: $translate('custom.Dialysis_Update_Order'), Key: 'Dialysis_Update_Order', Filter: [], Type: 'NotificationSetting' },
    { Title: $translate('custom.Dialysis_Delete_Medication'), Key: 'Dialysis_Delete_Medication', Filter: ['MEDICATION_ORDER_DATE_MMDD', 'MEDICATION_NAME', 'MEDICATION_ROUTE', 'MEDICATION_FREQUENCY', 'MEDICATION_QUANITIY', 'MEDICATION_QUANITIY_UNIT', 'MEDICATION_CREATED_NAME'], Type: 'NotificationSetting' }];

    // 詞彙說明
    const description = [{ Code: 'HEADER_FIRST_DATE_YYYYMMDD', Name: $translate('custom.HEADER_FIRST_DATE_YYYYMMDD'), Type: '西元年/月/日' },
    { Code: 'HEADER_FIRST_DATE_MMDD', Name: $translate('custom.HEADER_FIRST_DATE_MMDD'), Type: '月/日' },
    { Code: 'HEADER_FIRST_TIME_HHMM', Name: $translate('custom.HEADER_FIRST_TIME_HHMM'), Type: 'HH:MM' },
    { Code: 'HEADER_LAST_DATE_YYYYMMDD', Name: $translate('custom.HEADER_LAST_DATE_YYYYMMDD'), Type: '西元年/月/日' },
    { Code: 'HEADER_LAST_DATE_MMDD', Name: $translate('custom.HEADER_LAST_DATE_MMDD'), Type: '月/日' },
    { Code: 'HEADER_LAST_TIME_HHMM', Name: $translate('custom.HEADER_LAST_TIME_HHMM'), Type: 'HH:MM' },
    { Code: 'HEADER_TARGET_TIME', Name: $translate('custom.HEADER_TARGET_TIME'), Type: 'string' },
    { Code: 'HEADER_BF', Name: $translate('custom.HEADER_BF'), Type: 'string' },
    { Code: 'HEADER_START_BPS', Name: $translate('custom.HEADER_START_BPS'), Type: 'string' },
    { Code: 'HEADER_START_BPD', Name: $translate('custom.HEADER_START_BPD'), Type: 'string' },
    { Code: 'HEADER_END_BPS', Name: $translate('custom.HEADER_END_BPS'), Type: 'string' },
    { Code: 'HEADER_END_BPD', Name: $translate('custom.HEADER_END_BPD'), Type: 'string' },
    { Code: 'HEADER_DEHYDRATION_TARGET', Name: $translate('custom.HEADER_DEHYDRATION_TARGET'), Type: 'string' },
    { Code: 'HEADER_HEPARIN', Name: $translate('custom.HEADER_HEPARIN'), Type: 'string' },
    { Code: 'MEDICATION_ORDER_DATE_YYYYMMDD', Name: $translate('custom.MEDICATION_ORDER_DATE_YYYYMMDD'), Type: '西元年/月/日' },
    { Code: 'MEDICATION_ORDER_DATE_MMDD', Name: $translate('custom.MEDICATION_ORDER_DATE_MMDD'), Type: '月/日' },
    { Code: 'MEDICATION_ORDER_DATE_HHMM', Name: $translate('custom.MEDICATION_ORDER_DATE_HHMM'), Type: 'HH:MM' },
    { Code: 'MEDICATION_EXECUTIVE_DATE_YYYYMMDD', Name: $translate('custom.MEDICATION_EXECUTIVE_DATE_YYYYMMDD'), Type: '西元年/月/日' },
    { Code: 'MEDICATION_EXECUTIVE_DATE_MMDD', Name: $translate('custom.MEDICATION_EXECUTIVE_DATE_MMDD'), Type: '月/日' },
    { Code: 'MEDICATION_EXECUTIVE_TIME_HHMM', Name: $translate('custom.MEDICATION_EXECUTIVE_TIME_HHMM'), Type: 'HH:MM' },
    { Code: 'MEDICATION_NAME', Name: $translate('custom.MEDICATION_NAME'), Type: 'string' },
    { Code: 'MEDICATION_ROUTE', Name: $translate('custom.MEDICATION_ROUTE'), Type: 'string' },
    { Code: 'MEDICATION_FREQUENCY', Name: $translate('custom.MEDICATION_FREQUENCY'), Type: 'string' },
    { Code: 'MEDICATION_QUANITIY_UNIT', Name: $translate('custom.MEDICATION_QUANITIY_UNIT'), Type: 'string' },
    { Code: 'MEDICATION_QUANITIY', Name: $translate('custom.MEDICATION_QUANITIY'), Type: 'string' },
    { Code: 'MEDICATION_MEMO', Name: $translate('custom.MEDICATION_MEMO'), Type: 'string' },
    { Code: 'MEDICATION_CREATED_NAME', Name: $translate('custom.MEDICATION_CREATED_NAME'), Type: 'string' },
    { Code: 'MEDICATION_MODIFIED_NAME', Name: $translate('custom.'), Type: 'string' },
    { Code: 'HEADER_DEHYDRATION', Name: $translate('custom.HEADER_DEHYDRATION'), Type: 'string' },
    { Code: 'HEADER_DEVIATION', Name: $translate('custom.HEADER_DEVIATION'), Type: 'string' },
    { Code: 'MACHINE_DATA_TOTAL_UF', Name: $translate('custom.MACHINE_DATA_TOTAL_UF'), Type: 'string' },
    { Code: 'PATIENT_ENTRY_MODE', Name: $translate('custom.PATIENT_ENTRY_MODE'), Type: 'string' },
    { Code: 'DOCTOR_CHANGE_CONTENT', Name: $translate('custom.DOCTOR_CHANGE_CONTENT'), Type: 'string' },
    { Code: 'CHANGE_USER_NAME', Name: $translate('custom.CHANGE_USER_NAME'), Type: 'string' },
    { Code: 'HEADER_SETTINGDEHYDRATION', Name: $translate('custom.HEADER_SETTINGDEHYDRATION'), Type: 'string' },
    { Code: 'HEADER_ENDWEIGHT', Name: $translate('custom.HEADER_ENDWEIGHT'), Type: 'string' },
    { Code: 'HEADER_BEFORE_WEIGHT', Name: $translate('custom.HEADER_BEFORE_WEIGHT'), Type: 'string' },
    { Code: 'BEFORE_DOCTOR_CONTENT', Name: $translate('custom.BEFORE_DOCTOR_CONTENT'), Type: 'string' }];

    vm.$onInit = function onInit() {
        vm.loading = true;

        // 先讀取設定資訊 (英文暫定為systemPhrase 但日後定案需要修改)
        customService.get().then((resp) => {
            // console.log(resp);
            vm.systemPhrase = resp.data;
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 呼叫編輯的對話視窗
    vm.showDialog = function showDialog(ev, item) {
        vm.item = item;

        $mdDialog.show({
            controller: customDialogController,
            controllerAs: 'dvm',
            template: dtpl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: vm.customFullscreen
        });
    };

    // 上方進銷存對話視窗的controller
    function customDialogController() {
        const dvm = this;
        // 變更文字內容 轉化原始英文變成中文顯示
        dvm.convertText = function convertText(content) {
            let reg;
            let text = content;
            _.forEach(description, (value) => {
                reg = new RegExp(value.Code, 'g');
                text = text.replace(reg, value.Name);
            });
            return text;
        };

        // 下拉選單的變更函數
        dvm.itemChange = function itemChange(item) {
            dvm.description = [];
            // dvm.originalText = '';
            dvm.convertedText = '';
            dvm.content = '';
            dvm.title = item.Title;
            // 帶入範本項目
            _.forEach(description, (des) => {
                if (item.Filter.indexOf(des.Code) > -1) {
                    dvm.description.push(des);
                }
            });

            // 帶入內容，主要資料有後台的原始內容、變換後內容、前台用的顯示內容，三者之間的交換資訊需細看
            dvm.phrase = null;
            dvm.key = null;
            _.forEach(vm.systemPhrase, (phrase) => {
                if (phrase.Records.Key === vm.item.Key) {
                    // 儲存原始內容
                    // dvm.originalText = phrase.Records.Content;
                    dvm.content = phrase.Records.Content;
                    dvm.convertedText = dvm.convertText(dvm.content);
                    // 儲存變換後內容
                    // dvm.convertedText = dvm.convertText(dvm.originalText);
                    // dvm.content = dvm.convertedText;
                    // dvm.content = dvm.originalText;
                    // 切換自動帶入狀態
                    dvm.isPerformed = phrase.Records.IsPerformed;
                    // 儲存時需要的資訊
                    dvm.phrase = phrase;
                    dvm.method = 'put';
                }
            });
            if (dvm.phrase === null) {
                // 儲存時需要的資訊
                dvm.isPerformed = false;
                dvm.key = vm.item.Key;
                dvm.method = 'post';
            }
        };
        dvm.itemChange(vm.item);

        // 對右側輸入欄位進行內容轉換及控制回寫機制
        dvm.changeText = function changeText() {
            dvm.convertedText = dvm.convertText(dvm.content);
        };

        // dvm.changeText = function changeText(type) {
        //    switch (type) {
        //         case 'original':
        //             dvm.content = dvm.originalText;
        //             break;
        //         case 'converted':
        //             dvm.content = dvm.convertedText;
        //             break;
        //        case 'change':
        //            dvm.originalText = dvm.content;
        //            dvm.convertedText = dvm.convertText(dvm.originalText);
        //            break;
        //         default:
        //            break;
        //     }
        // };

        // 先取得游標在 textarea 裡的位置
        let caretPos = 0;
        dvm.clickPos = function clickPos() {
            // console.log("Pos:" + document.getElementById('conttext1').selectionStart);
            caretPos = document.getElementById('conttext1').selectionStart;
        };
        // 新增組合字到內容輸入區
        dvm.addToContent = function addToContent(item) {
            // console.log("B:" + document.getElementById('conttext1').selectionStart);
            // 將新增的組合字加在游標所在位置
            let bindStr = dvm.content.substr(0, caretPos);
            bindStr += `{${item.Code}}`;
            bindStr += dvm.content.substr(caretPos);
            dvm.content = bindStr;
            dvm.convertedText = dvm.convertText(dvm.content);
            // dvm.originalText += `{${item.Code}}`;
            // dvm.convertedText = dvm.convertText(dvm.originalText);
            // dvm.content = dvm.convertedText;
            // dvm.content = dvm.originalText;
};

        // 儲存檔案
        dvm.save = function save() {
            vm.isSaving = true;
            let obj;

            if (!dvm.key && !dvm.phrase) {
                showMessage($translate('custom.saveMessage')); // '請先選擇片語項目'
                vm.isSaving = false;
            } else if (dvm.key === null) {
                obj = dvm.phrase;

                // obj.Records.Content = dvm.originalText;
                obj.Records.Content = dvm.content;
                obj.Records.IsPerformed = dvm.isPerformed;

                // 進行存檔
                customService.put(obj).then(() => {
                    showMessage($translate('customMessage.DataChangeSuccessfully')); // lang.DataChangeSuccessfully
                    vm.isSaving = false;
                    $mdDialog.hide();
                    $state.reload();
                }, () => {
                    showMessage($translate('customMessage.serverError')); // lang.ComServerError
                    vm.isSaving = false;
                });
            } else {
                obj = {};

                // Module 一定要先掛 不可以調順序 因為後端API需要拿這個值來判斷初始化的class種類
                obj.Module = vm.item.Type;
                obj.Records = {};
                obj.Records.Key = dvm.key;
                // obj.Records.Content = dvm.originalText;
                obj.Records.Content = dvm.content;
                obj.Records.IsPerformed = dvm.isPerformed;

                // 進行存檔
                customService.post(obj).then(() => {
                    showMessage($translate('customMessage.DataChangeSuccessfully')); // lang.DataChangeSuccessfully
                    vm.isSaving = false;
                    $mdDialog.hide();
                    $state.reload();
                }, () => {
                    showMessage($translate('customMessage.serverError')); // lang.ComServerError
                    vm.isSaving = false;
                });
            }
        };

        // 關閉對話視窗
        dvm.cancel = function cancel() {
            $mdDialog.hide();
        };
    }
}

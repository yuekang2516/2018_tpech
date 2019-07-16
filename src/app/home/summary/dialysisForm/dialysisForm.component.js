
import tpl from './dialysisForm.html';
import './dialysisForm.less';

angular
    .module('app')
    .component('dialysisForm', {
        template: tpl,
        controller: dialysisFormController
    }).filter('formQueryName', ['$filter', ($filter) => {
        return function (queryType) {
            let $translate = $filter('translate');
            switch (queryType) {
                case 'times':
                    return $translate('dialysisForm.times');
                case 'months':
                    return $translate('dialysisForm.months');
                default:
                    return $translate('dialysisForm.current');
            }
        };
    }]).filter('formMonths', ['$filter', ($filter) => {
        return function (months) {
            let $translate = $filter('translate');
            switch (months) {
                case 60:
                    return $translate('dialysisForm.twoMonths');
                case 90:
                    return $translate('dialysisForm.threeMonths');
                default:    // default 30
                    return $translate('dialysisForm.oneMonth');
            }
        };
    }]);

dialysisFormController.$inject = ['$state', '$q', '$filter', 'dialysisService', 'SettingService', 'PatientService', '$stateParams', '$sessionStorage', 'summaryReportService'];

function dialysisFormController($state, $q, $filter, dialysisService, SettingService, PatientService, $stateParams, $sessionStorage, summaryReportService) {
    const self = this;
    const $translate = $filter("translate");

    console.log('dialysisFormController');

    self.currentData = [];

    // TODO 顯示條件：目前觀看的表單、前幾次的表單或是時間區間的表單 -> 需紀錄 ui 習慣
    const QUERYCONDITION = SettingService.getUISettingParams().DIALYSISFORM;
    // 次數、期限、主頁正在查看的紀錄
    self.conditionTypes = {
        times: {
            name: 'times',
            conditions: [1, 4, 8],
            value: 4    // 預設給四次
        },
        // TODO 等 API
        months: {   // 天數
            name: 'months',
            conditions: [30, 60, 90],
            value: 30
        },
        current: {
            name: 'current',
            value: $sessionStorage.currentHeader
        }
    };

    // 目前的條件
    self.timesCondition = [1, 4, 8];
    self.durationCondition = [1, 2, 3];

    // 不需紀錄上一次的查詢條件，預設就為正在觀看的表單
    self.queryCondition = self.conditionTypes.current;

    // 取得使用者習慣 query 的方式
    // 若為 current 需替代為目前 $sessionStorage 中的值
    // let userPreviousCondition = SettingService.getUISettingByKey(QUERYCONDITION);
    // if (userPreviousCondition) {
    //     if (userPreviousCondition.name === 'current') {
    //         userPreviousCondition.value = $sessionStorage.currentHeader;
    //     }

    //     // 需再確認本機存的查詢條件在 app 中是否仍存在
    //     self.queryCondition = (userPreviousCondition && self.conditionTypes[userPreviousCondition.name]) ? userPreviousCondition : self.conditionTypes.times;    // 預設用次

    //     if (self.conditionTypes[userPreviousCondition.name]) {
    //         self.conditionTypes[userPreviousCondition.name].value = userPreviousCondition.value;
    //     }
    // } else {
    //     self.queryCondition = self.conditionTypes.times;
    // }

    //使用表單版本選項
    // self.sheetTemplate = SettingService.getCurrentHospital() && SettingService.getCurrentHospital().SheetTemplate ? SettingService.getCurrentHospital().SheetTemplate.toLowerCase() : 'a'; // 預設表單"A"，因應前端判斷要轉小寫

    // for 電子簽章，從 url 給決定要顯示哪一種表單
    self.sheetTemplate = $stateParams.formName ? $stateParams.formName : 'tpech';

    // self.currentPatient = $sessionStorage.currentPatient;
    self.isBrowser = cordova.platformId === 'browser';

    self.$onInit = function () {

        // get dialysisRecord by HeaderId
        // 第一次需要取病人資料及表單資料
        getPateintAndDialysisData();

    };

    function getPateintAndDialysisData() {
        self.loading = true;
        let exeAry = [getPatientData()];

        // 依據查詢條件撈資料
        exeAry.push(getQueryFunctionByQueryType(self.queryCondition.name));

        $q.all(exeAry).then(() => {
            // prepareFormData();
            self.isErr = false;
        }).catch(() => {
            self.isErr = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    function getPatientData() {
        const defer = $q.defer();
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });

        return defer.promise;
    }

    function getQueryFunctionByQueryType(type) {
        // for 電子簽章
        if ($state.current.name === 'dialysisFormForPdf') {
            return getDialysisDataByHeaderId($stateParams.headerId);
        }

        switch (type) {
            case 'times':   // 依照次數
                return getDialysisDataByTimes(self.queryCondition.value);
            case 'months':  // 依照時間區間
                return getDialysisDataByMonths(self.queryCondition.value);
            default:    // 依照主畫面正在顯示的表單
                // TEST
                return getDialysisDataByHeaderId(self.queryCondition.value.headerId);
        }
    }

    self.changeQueryType = function () {
        // 存使用者習慣
        // SettingService.setUISetting(
        //     {
        //         name: QUERYCONDITION,
        //         value: self.queryCondition
        //     }
        // );

        // 更換查詢類型，資料也須重抓
        getQueryFunctionByQueryType(self.queryCondition.name);
    };

    // 取得前幾次表單資料
    self.getDialysisDataByTimes = function (times) {
        // 存使用者習慣
        SettingService.setUISetting(
            {
                name: QUERYCONDITION,
                value: self.queryCondition
            }
        );
        self.loading = true;
        getDialysisDataByTimes(times).then(() => {
            self.isErr = false;
        }).catch(() => {
            self.isErr = true;
        }).finally(() => {
            self.loading = false;
        });
    };
    function getDialysisDataByTimes(times) {
        const defer = $q.defer();
        self.currentData = [];
        dialysisService.getByIdPage(
            $stateParams.patientId,
            1,
            times
        ).then((res) => {
            self.currentData = res.data.Results;

            // TODO 判斷是否有表單
            if (self.currentData.length < 1) {
                defer.resolve();
                return;
            }

            // 依照模式決定是否要換 CRRT 表單
            if (self.currentData[0].Prescription) { // .Mode
                self.isCRRT = summaryReportService.isCRRTMode(self.currentData[0].Prescription.DialysisMode.Name);
            }

            defer.resolve();
        }).catch(() => {
            defer.reject();
        });
        return defer.promise;
    }

    // 依月份取得表單資料
    self.getDialysisDataByMonths = function (months) {
        // 存使用者習慣
        // SettingService.setUISetting(
        //     {
        //         name: QUERYCONDITION,
        //         value: self.queryCondition
        //     }
        // );
        self.loading = true;
        getDialysisDataByMonths(months).then(() => {
            self.isErr = false;
        }).catch(() => {
            self.isErr = true;
        }).finally(() => {
            self.loading = false;
        });
    };
    function getDialysisDataByMonths(months) {
        const defer = $q.defer();
        self.currentData = [];
        dialysisService.getByDuration($stateParams.patientId, moment().add(`-${months}`, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')).then((res) => {
            console.log('getByDuration', res.data);
            self.currentData = _.orderBy(res.data, ['Number'], ['desc']);
            defer.resolve();
        }).catch((err) => {
            defer.reject(err);
        });
        return defer.promise;
    }

    function getDialysisDataByHeaderId(headerId) {
        const defer = $q.defer();
        self.currentData = [];
        dialysisService.getByHeaderId(
            $stateParams.patientId,
            headerId,
            true
        ).then((res) => {
            self.currentData = [res.data.DialysisHeader];
            // console.log('self.currentData', self.currentData);
            defer.resolve();
        }).catch((err) => {
            defer.reject(err);
        });

        return defer.promise;
    }

    // 決定要顯示哪種表單
    self.isShow = function (type, mode) {
        // 先判斷目前是否為 CRRT Mode
        // 若為 CRRT Mode，則不管後台設定皆顯示 CRRT 表單
        if (self.currentData.length > 0 && summaryReportService.isCRRTMode(mode)) {
            if (type === 'crrtform') {
                return true;
            }
            return false;
        }

        return self.currentData.length > 0 && self.sheetTemplate === type;
    };

    self.cancel = function () {
        history.go(-1);
    };

    self.print = function () {
        window.print();
    };

    self.refresh = function () {
        getPateintAndDialysisData();
    };

}

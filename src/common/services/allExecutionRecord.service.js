// fake data
import ordermasterByPatientIdEffectiveByDialysisTimeGet from '../fakeData/allExecutionRecord/ApiOrdermasterByPatientIdEffectiveByDialysisTimeGet.fake.json';
import orderrecordByIdGet from '../fakeData/allExecutionRecord/ApiOrderrecordByIdGet.fake.json';

angular
    .module('app')
    .factory('allExecutionRecordService', allExecutionRecordService);

allExecutionRecordService.$inject = ['$http', '$q', '$rootScope', 'SettingService', 'dialysisService', 'OverViewService'];

function allExecutionRecordService($http, $q, $rootScope, SettingService, dialysisService, OverViewService) {
    const serverApiUrl = SettingService.getServerUrl();
    const rest = {
        getAllRecord,
        getOneRecordDetail,
        getMasterDetail,
        post,
        put,
        getRecordsForPage,
        getLastAccessTime,
        getTodoCount,
        setDirty,
        putRemind,
        loadRecordList,
        deleteRecord
    };

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastDialysisId = '';
    let isDirty = false;


    // 依病人代碼及表頭代碼取得有效醫囑
    function getAllRecord(patientId, dialysisTime, headerId, isForce) {

        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
        // }
        console.log('伺服器 patientId', patientId);
        console.log('伺服器 dialysisTime', dialysisTime);
        console.log('伺服器 serverApiUrl', serverApiUrl);

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if (lastDialysisId === headerId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isDirty) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }
        // mode 區分是執行紀錄(execute)或是開藥清單(list)
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/ordermaster/' + patientId + '/effective/' + dialysisTime + '?mode=execute'
        }).then((res) => {

            // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
            // 成功時才給值，以免下次進來時會進入暫存的判斷式裡而回傳資料
            lastDialysisId = headerId;
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            isDirty = false;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getOneRecordDetail(id) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(orderrecordByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(orderrecordByIdGet, deferred);
        // }
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/orderrecord/' + id
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依執行用藥代碼取得資料
    function getMasterDetail(id) {
        const deferred = $q.defer();
        let ordermasterByPatientIdEffectiveByDialysisTimeGetfind = ordermasterByPatientIdEffectiveByDialysisTimeGet.find((item) => {
            return item.Id === id;
        });
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGetfind, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGetfind, deferred);
        // }
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/ordermaster/' + id
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增 執行用藥 或 不執行用藥
    function post(oData) {
        // console.log('要上傳的執行紀錄 oData', oData);
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
        // }
        $http({
            method: 'POST',
            data: oData,
            url: SettingService.getServerUrl() + '/api/orderrecord'
        }).then((res) => {
            // // 如果現有陣列中己經有該筆資料了, 則換掉
            // // 以利回到上一頁時可以直接取用整個陣列
            // if (lastRecords) {
            //     const index = _.findIndex(lastRecords, ['Id', oData.MasterId]);
            //     lastRecords[index] = res.data;
            // }
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('allExecutionRecord-dataChanged');
            $rootScope.$broadcast('nursingRecord-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 修改執行用藥
    function put(oData) {
        // console.log('要修改的執行紀錄 oData', oData);
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
        // }
        $http({
            method: 'PUT',
            data: oData,
            url: SettingService.getServerUrl() + '/api/orderrecord'
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastRecords) {
                const index = _.findIndex(lastRecords, ['Id', oData.masterId]);
                lastRecords[index] = res.data;
            }
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('allExecutionRecord-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依頁碼取得用藥資訊
    function getRecordsForPage(patientId, offset, limit) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/orderrecord/bypatientid/' + patientId + '?offset=' + offset + '&limit=' + limit
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 取得最後取得資料的時間
    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 未執行筆數
    function getTodoCount(patientId, headerId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/orderrecord/bypatientid/${patientId}/headerid/${headerId}/todoCount`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 設定資料是否要重讀
    function setDirty(value) {
        isDirty = value;
    }

    // 依 masterId(medicineId) 修改remind資料：true / false
    function putRemind(id, isRemind) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
        // }

        $http({
            method: 'PUT',
            url: SettingService.getServerUrl() + '/api/ordermaster/' + id + '?isRemind=' + isRemind
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 刪除一筆執行紀錄
    function deleteRecord(recordId) {
        // console.log('要刪除的執行紀錄 recordId', recordId);
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            data: recordId,
            url: SettingService.getServerUrl() + '/api/orderrecord/' + recordId
        }).then((res) => {
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('allExecutionRecord-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // ------------處理執行紀錄資料---------------
    // 取得所有有效醫囑，並且處理資料
    function loadRecordList(patientId, headerId, isForce) {
        const deferred = $q.defer();
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(ordermasterByPatientIdEffectiveByDialysisTimeGet, deferred);
        // }

        let dialysisTimeStr = ''; // 透析表單時間 string格式
        let dialysisTime = ''; // 透析表單時間 moment格式
        // 1.先取得透析時間
        OverViewService.getByHeaderId(headerId)
            .then((res) => {
                // console.log('dialysisService 取得透析資料', res);
                // console.log('dialysisService 取得透析時間', res.data.StartTime);
                dialysisTimeStr = moment(res.data.StartTime).format('YYYYMMDD'); // 透析表單時間
                dialysisTime = moment(res.data.StartTime);
                // console.log('dialysisService dialysisTime', dialysisTimeStr);

                // 2.取得全部有效醫囑
                return getAllRecord(patientId, dialysisTimeStr, headerId, isForce);
            })
            .then((res) => {
                // console.log('有效醫囑整大筆資料 res', res);
                if (res.length === 0) {
                    // 沒有"有效醫囑"
                    deferred.resolve(res);
                }
                // 移除外院用藥
                res.data = _.remove(res.data, function (n) {
                    return !n.IsOther;
                });
                // 計算每筆藥品的結束日期：前端要顯示
                _.forEach(res.data, function (value) {
                    value.EndDate = moment(value.StartDate).add((value.Days - 1), 'days').format('YYYY-MM-DD');
                });
                // console.log('有效醫囑列表 res.data', res.data);
                // 3.計算執行次數：將計算的及要用的資料存入物件中
                return setExecutionTimmes(res, dialysisTimeStr, dialysisTime);
            })
            .then((res) => {
                console.log('最終 有效醫囑整大筆資料 res', res);
                deferred.resolve(res);
            })
            .catch((err) => {
                deferred.reject(err);
            });

        return deferred.promise;
    }
    /*
        計算執行次數  setExecutionTimmes
            執行區間：當天
            1次(天)：QDPC, STAT, QN, HS, QD, PRN
            2次(天)：BID, BIDAC, BIDPC
            3次(天)：TID, TIDAC, TIDPC
            4次(天)：QID
            每隔1天1次：QOD
            ------------------------------
            執行區間：一週
            1次(一週)：QW1, QW2, QW3, QW4, QW5, QW6, QW7
            2次(一週)：BIW15, BIW26
            3次(一週)：QW135, QW136, QW146, QW246
            4次(一週)：QW1357, QW2467
            ------------------------------
            執行區間：二週
            1次(二週)：Q2W
            ------------------------------
            TimeArea：執行區間分類
            WeekDay：星期幾
            Frequency：頻率
            MustDoTimes：應該要做幾次，依照頻率得知
            ExecutionTimes：已執行的次數
            NeedToDo：還需執行的次數
            needToDoArray：將個筆還需執行的次數塞入此陣列，最後再計算此陣列中的數值
            AreaStartDate：實際執行區間：開始日，前端要顯示此筆開藥是從幾號到幾號
            AreaEndtDate：實際執行區間：結束日，前端要顯示此筆開藥是從幾號到幾號
     */
    function setExecutionTimmes(allnRecordObj, dialysisTimeStr, dialysisTime) {
        const deferred = $q.defer();

        // console.log('透析表單時間 dialysisTime', dialysisTimeStr);
        let needToDoArray = []; // 將個筆還需執行的次數塞入此陣列，最後再計算此陣列中的數值
        let TIME_AREA_DAY = 'day';
        let TIME_AREA_ONE_WEEK = 'oneWeek';
        let TIME_AREA_TWO_WEEK = 'twoWeek';
        // console.log('開始計算執行次數-----------');
        // 先依頻率分類：TimeArea, MustDoTimes
        sortFrequency(allnRecordObj.data);
        _.forEach(allnRecordObj.data, function (value) {
            // 執行區間：當天, 一週, 二週
            if (value.TimeArea === TIME_AREA_DAY) {
                // 執行區間：當天
                // 1次(天)：QDPC, STAT, QN, HS, QD, PRN
                // 2次(天)：BID, BIDAC, BIDPC
                // 3次(天)：TID, TIDAC, TIDPC
                // 4次(天)：QID
                // 每隔1天1次：QOD
                // console.log('Name: ', value.Name);
                // 每隔1天1次
                if (value.Frequency === 'QOD') {
                    // 今天已執行的次數
                    value.ExecutionTimes = countDayExecutionTimes(value.Records, dialysisTimeStr);
                    // let todayTime = moment().format('YYYYMMDD'); // 今天日期
                    let startTime = moment(value.StartDate); // 開藥起始日
                    // console.log('~~~~透析表單時間 dialysisTimeStr', dialysisTimeStr);
                    // console.log('~~~~開藥起始日 1: ', moment(value.StartDate).format('YYYYMMDD HH:mm:ss'));
                    // console.log('~~~~開藥起始日 2: ', moment(value.StartDate).format('YYYYMMDD'));
                    let betweenDay = ''; // 計算起始日與透析日期之間相差天數：透析日期 - 起始日期
                    // 判斷透析日與開藥日是否同天
                    if (dialysisTimeStr !== moment(value.StartDate).format('YYYYMMDD')) {
                        betweenDay = moment(dialysisTimeStr).diff(startTime, 'days');
                    } else {
                        betweenDay = 0;
                    }
                    // 實際執行區間：開始日～結束日 (透析日)
                    value.AreaStartDate = moment(dialysisTimeStr).format('MM/DD');
                    value.AreaEndtDate = moment(dialysisTimeStr).format('MM/DD');
                    // (透析日期 - 起始日期) / 2 整除者，要執行1次
                    if (betweenDay % 2 === 0) {
                        value.MustDoTimes = 1;
                    } else {
                        value.MustDoTimes = 0;
                    }
                    // 今天還需執行的次數
                    value.NeedToDo = countNeedToDoTimes(value.ExecutionTimes, value.MustDoTimes);
                    if (value.NeedToDo !== 0 && value.Remind) {
                        // 還需要執行tabCount：有打開提醒鈴者才加入
                        needToDoArray.push(value.NeedToDo);
                    }
                    // console.log('MustDoTimes: ', value.MustDoTimes);
                } else {
                    // 當天 ~ 1, 2, 3, 4次
                    // 今天已執行的次數
                    value.ExecutionTimes = countDayExecutionTimes(value.Records, dialysisTimeStr);
                    // 實際執行區間：開始日～結束日
                    value.AreaStartDate = moment(dialysisTimeStr).format('MM/DD');
                    value.AreaEndtDate = moment(dialysisTimeStr).format('MM/DD');
                    // 今天還需執行的次數
                    value.NeedToDo = countNeedToDoTimes(value.ExecutionTimes, value.MustDoTimes);
                    if (value.NeedToDo !== 0 && value.Remind) {
                        // 還需要執行tabCount：有打開提醒鈴者才加入
                        needToDoArray.push(value.NeedToDo);
                    }
                    // console.log('MustDoTimes: ', value.MustDoTimes);
                }
                // console.log('TimeArea: ', value.TimeArea);
                // console.log('Frequency: ', value.Frequency);
                // console.log('ExecutionRecord: ', value.Records);
                // console.log('ExecutionTimes: ', value.ExecutionTimes);
                // console.log('NeedToDo: ', value.NeedToDo);
                // console.log('AreaStartDate: ', value.AreaStartDate);
                // console.log('AreaEndtDate: ', value.AreaEndtDate);
                // console.log('----------------------');
            } else if (value.TimeArea === TIME_AREA_ONE_WEEK) {
                // 執行區間：一週
                // 1次(星期)：QW1, QW2, QW3, QW4, QW5, QW6, QW7
                // 2次(星期)：BIW15, BIW26
                // 3次(星期)：QW135, QW136, QW146, QW246
                // 4次(星期)：QW1357, QW2467
                // console.log('Name: ', value.Name);
                // 開藥起始日往後算1週
                let executionStartDate = value.StartDate; // 開藥起始日
                // console.log('開藥起始日 ', moment(executionStartDate).format('YYYY-MM-DD'));
                let oneWeekStartDate = moment(executionStartDate).format('YYYY-MM-DD'); // 一週第一天日期
                let oneWeekEndDate = moment(oneWeekStartDate).add(6, 'days'); // ㄧ週最後一天日期：加6天
                // 一個區間一個區間檢查：檢查透析日是在哪個區間之內
                // 先檢查第一個區間
                let isBetween = isBetweenDate(oneWeekStartDate, oneWeekEndDate, moment(dialysisTimeStr));
                // console.log('1 一週 起始日', moment(oneWeekStartDate).format('YYYY-MM-DD'));
                // console.log('1 一週 結束日', moment(oneWeekEndDate).format('YYYY-MM-DD'));
                // console.log('1 一週 是否在區間內 isBetween', isBetween);
                // 不在第一個區間內，繼續檢查下一個區間
                if (!isBetween) {
                    do {
                        let newOneWeekStartDate = moment(oneWeekStartDate).add(7, 'days'); // 起始日加7天
                        let newOneWeekEndDate = moment(oneWeekEndDate).add(7, 'days'); // 結束日加7天
                        // 新的區間 twoWeekStartDate ~ twoWeekEndDate
                        oneWeekStartDate = newOneWeekStartDate;
                        oneWeekEndDate = newOneWeekEndDate;
                        // console.log('2 一週 起始日', moment(oneWeekStartDate).format('YYYY-MM-DD'));
                        // console.log('2 一週 結束日', moment(oneWeekEndDate).format('YYYY-MM-DD'));
                        isBetween = isBetweenDate(oneWeekStartDate, oneWeekEndDate, moment(dialysisTimeStr));
                        // console.log('2 一週 是否在區間內 isBetween', isBetween);

                    } while (!isBetween);
                }
                // console.log('3 一週 是否在區間內 isBetween', isBetween);
                if (isBetween) {
                    // 利用新的區間 twoWeekStartDate ~ twoWeekEndDate去判斷這期間是否有執行紀錄
                    // 實際執行區間：開始日～結束日
                    value.AreaStartDate = moment(oneWeekStartDate).format('MM/DD');
                    value.AreaEndtDate = moment(oneWeekEndDate).format('MM/DD');
                    // 此一週區間已執行的次數
                    value.ExecutionTimes = countWeekExecutionTimes(oneWeekStartDate, oneWeekEndDate, value.Records);
                    // 此一週區間還需執行的次數
                    value.NeedToDo = countNeedToDoTimes(value.ExecutionTimes, value.MustDoTimes);
                    if (value.NeedToDo !== 0 && value.Remind) {
                        // 還需要執行tabCount：有打開提醒鈴者才加入
                        needToDoArray.push(value.NeedToDo);
                    }
                }
                // console.log('TimeArea: ', value.TimeArea);
                // console.log('Frequency: ', value.Frequency);
                // console.log('MustDoTimes: ', value.MustDoTimes);
                // console.log('ExecutionTimes: ', value.ExecutionTimes);
                // console.log('ExecutionRecord: ', value.Records);
                // console.log('本週已執行 ExecutionTimes: ', value.ExecutionTimes);
                // console.log('NeedToDo: ', value.NeedToDo);
                // console.log('AreaStartDate: ', value.AreaStartDate);
                // console.log('AreaEndtDate: ', value.AreaEndtDate);
                // console.log('----------------------');
            } else if (value.TimeArea === TIME_AREA_TWO_WEEK) {
                // 執行區間：二週
                // 每二週一次
                // console.log('Name: ', value.Name);
                // 開藥起始日往後算2週
                let executionStartDate = value.StartDate; // 開藥起始日
                // console.log('開藥起始日 ', moment(executionStartDate).format('YYYY-MM-DD'));
                let twoWeekStartDate = moment(executionStartDate).format('YYYY-MM-DD'); // 第一週第一天日期
                let twoWeekEndDate = moment(twoWeekStartDate).add(13, 'days'); // 第二週最後一天日期：加13天
                // console.log('1 二週 是否在區間內 isBetween', moment(twoWeekEndDate).format('YYYY-MM-DD'));
                // 一個區間一個區間檢查：檢查今天是在哪個區間之內
                // 先檢查第一個區間
                let isBetween = isBetweenDate(twoWeekStartDate, twoWeekEndDate, moment(dialysisTimeStr));
                // console.log('1 二週 起始日', moment(twoWeekStartDate).format('YYYY-MM-DD'));
                // console.log('1 二週 結束日', moment(twoWeekEndDate).format('YYYY-MM-DD'));
                // console.log('1 二週 是否在區間內 isBetween', isBetween);
                // 不在第一個區間內，繼續檢查下一個區間
                if (!isBetween) {
                    do {
                        let newTwoWeekStartDate = moment(twoWeekStartDate).add(14, 'days'); // 加14天
                        let newTwoWeekEndDate = moment(twoWeekEndDate).add(14, 'days'); // 加14天
                        // 新的區間 twoWeekStartDate ~ twoWeekEndDate
                        twoWeekStartDate = newTwoWeekStartDate;
                        twoWeekEndDate = newTwoWeekEndDate;
                        // console.log('2 二週 起始日', moment(twoWeekStartDate).format('YYYY-MM-DD'));
                        // console.log('2 二週 結束日', moment(twoWeekEndDate).format('YYYY-MM-DD'));
                        isBetween = isBetweenDate(twoWeekStartDate, twoWeekEndDate, moment(dialysisTimeStr));
                        // console.log('2 二週 是否在區間內 isBetween', isBetween);
                    } while (!isBetween);
                }
                // console.log('3 二週 是否在區間內 isBetween', isBetween);
                if (isBetween) {
                    // 利用新的區間 twoWeekStartDate ~ twoWeekEndDate去判斷這期間是否有執行紀錄
                    // 實際執行區間：開始日～結束日
                    value.AreaStartDate = moment(twoWeekStartDate).format('MM/DD');
                    value.AreaEndtDate = moment(twoWeekEndDate).format('MM/DD');
                    // 此二週區間已執行的次數
                    value.ExecutionTimes = countWeekExecutionTimes(twoWeekStartDate, twoWeekEndDate, value.Records);
                    // 此二週區間還需執行的次數
                    value.NeedToDo = countNeedToDoTimes(value.ExecutionTimes, value.MustDoTimes);
                    if (value.NeedToDo !== 0 && value.Remind) {
                        // 還需要執行tabCount：有打開提醒鈴者才加入
                        needToDoArray.push(value.NeedToDo);
                    }
                }
                // console.log('TimeArea: ', value.TimeArea);
                // console.log('Frequency: ', value.Frequency);
                // console.log('MustDoTimes: ', value.MustDoTimes);
                // console.log('ExecutionTimes: ', value.ExecutionTimes);
                // console.log('ExecutionRecord: ', value.Records);
                // console.log('本週已執行 ExecutionTimes: ', value.ExecutionTimes);
                // console.log('NeedToDo: ', value.NeedToDo);
                // console.log('AreaStartDate: ', value.AreaStartDate);
                // console.log('AreaEndtDate: ', value.AreaEndtDate);
                // console.log('----------------------');
            }
            // 處理執行紀錄：前端透析當日執行過的日期按鈕顯示
            if (value.Records && value.Records.length !== 0) {
                _.forEach(value.Records, function (recordsValue) {
                    // 為了配合seal要有key值：ModifiedUserName，才能顯示姓名印章
                    recordsValue.ModifiedUserName = recordsValue.UserName;
                    // 今天日期的才顯示日期按鈕：IsDialysisDayProcess用來判斷是否要顯示
                    if (moment(recordsValue.ProcessTime).format('YYYY-MM-DD') === moment(dialysisTimeStr).format('YYYY-MM-DD')) {
                        recordsValue.IsDialysisDayProcess = true;
                    } else {
                        recordsValue.IsDialysisDayProcess = false;
                    }
                });
            }
        });
        // console.log('設定 allnRecordObj', allnRecordObj);
        // console.log('共用的array needToDoArray', needToDoArray);
        // console.log('共用的array sum', _.sum(needToDoArray));
        // tab上顯示的remind數字：提醒還需執行筆數
        allnRecordObj.ExecuteCount = _.sum(needToDoArray);
        // 前端需要取得透析日期'20180424'
        allnRecordObj.DialysisTime = dialysisTime; // moment格式
        deferred.resolve(allnRecordObj);
        return deferred.promise;
    } // function setExecutionTimmes(allnRecordObj) {

    // 先依頻率分類：TimeArea, MustDoTimes
    function sortFrequency(dataObj) {
        _.forEach(dataObj, function (value) {
            // 紀錄頻率內的星期幾
            // value.WeekDay = setWeekDay(value.Frequency);
            let TIME_AREA_DAY = 'day';
            let TIME_AREA_ONE_WEEK = 'oneWeek';
            let TIME_AREA_TWO_WEEK = 'twoWeek';
            // 執行區間：當天, 一週, 二週
            switch (value.Frequency) {
                // 執行區間：當天
                // 執行次數：1, 2, 3, 4, 每隔1天1次
                // 當天 1次：QDPC, STAT, QN, HS, QD, PRN
                case 'QDPC':
                case 'STAT':
                case 'QN':
                case 'HS':
                case 'QD':
                case 'PRN':
                    value.TimeArea = TIME_AREA_DAY;
                    value.MustDoTimes = 1;
                    break;
                    // 當天 2次：BID, BIDAC, BIDPC
                case 'BID':
                case 'BIDAC':
                case 'BIDPC':
                    value.TimeArea = TIME_AREA_DAY;
                    value.MustDoTimes = 2;
                    break;
                    // 當天 3次：TID, TIDAC, TIDPC
                case 'TID':
                case 'TIDAC':
                case 'TIDPC':
                    value.TimeArea = TIME_AREA_DAY;
                    value.MustDoTimes = 3;
                    break;
                    // 當天 4次：QID
                case 'QID':
                    value.TimeArea = TIME_AREA_DAY;
                    value.MustDoTimes = 4;
                    break;
                    // 當天 每隔1天1次：QOD
                case 'QOD':
                    value.TimeArea = TIME_AREA_DAY;
                    value.MustDoTimes = 0; // 預設0，判斷今日是否要執行才給值
                    break;
                    // 執行區間：一週
                    // 一週 1次(星期)：QW1, QW2, QW3, QW4, QW5, QW6, QW7
                case 'QW1':
                case 'QW2':
                case 'QW3':
                case 'QW4':
                case 'QW5':
                case 'QW6':
                case 'QW7':
                    value.TimeArea = TIME_AREA_ONE_WEEK;
                    value.MustDoTimes = 1;
                    break;
                    // 一週 2次(星期)：BIW15, BIW26
                case 'BIW15':
                case 'BIW26':
                    value.TimeArea = TIME_AREA_ONE_WEEK;
                    value.MustDoTimes = 2;
                    break;
                    // 一週 3次(星期)：QW135, QW136, QW146, QW246
                case 'QW135':
                case 'QW136':
                case 'QW146':
                case 'QW246':
                    value.TimeArea = TIME_AREA_ONE_WEEK;
                    value.MustDoTimes = 3;
                    break;
                    // 一週 4次(星期)：QW1357, QW2467
                case 'QW135日':
                case 'QW1357':
                case 'QW246日':
                case 'QW2467':
                    value.TimeArea = TIME_AREA_ONE_WEEK;
                    value.MustDoTimes = 4;
                    break;
                    // 執行區間：二週
                    // 二週 1次：Q2W
                case 'Q2W':
                    value.TimeArea = TIME_AREA_TWO_WEEK;
                    value.MustDoTimes = 1;
                    break;
                default:
                    // nothing
                    break;
            }
        });
    }

    // 計算透析當日已執行次數
    function countDayExecutionTimes(executionRecords, dialysisTimeStr) {
        let count = 0;
        // 沒有執行紀錄者，且執行紀錄狀態不為Deleted者
        if (!executionRecords) {
            return -1;
        }
        _.forEach(executionRecords, function (executionValue) {
            // 執行紀錄裡有透析當日紀錄者
            if ((moment(executionValue.ProcessTime).format('YYYY-MM-DD') === moment(dialysisTimeStr).format('YYYY-MM-DD')) && (executionValue.Status !== 'Deleted')) {
                // 檢查已經執行過幾次
                count++;
            }
        });
        return count;
    }
    // 計算(一/二)週間已執行次數
    function countWeekExecutionTimes(startDate, endDate, executionRecords) {
        let count = 0;
        // 沒有執行紀錄者
        if (!executionRecords) {
            return -1;
        }
        _.forEach(executionRecords, function (executionValue) {
            // 執行紀錄裡有此二週內紀錄者
            let isInThisArea = isBetweenDate(startDate, endDate, executionValue.ProcessTime);
            // 執行紀錄裡有在區間內紀錄者，且執行紀錄狀態不為Deleted者
            if (isInThisArea && (executionValue.Status !== 'Deleted')) {
                // 檢查已經執行過幾次
                count++;
            }
        });
        return count;
    }
    // 確認checkDate是否在startDate與endDate之間
    function isBetweenDate(startDate, endDate, checkDate) {
        startDate = moment(startDate).format('YYYY-MM-DD');
        endDate = moment(endDate).format('YYYY-MM-DD');
        checkDate = moment(checkDate).format('YYYY-MM-DD');
        return moment(checkDate).isBetween(startDate, endDate, null, '[]'); // true / false,  '[]'->包含起始及結束的日期
    }
    // 計算今天還要執行的次數
    function countNeedToDoTimes(executionTimes, mustDoTimes) {
        switch (executionTimes) {
            case -1:
            case 0:
                // 表示沒有今天紀錄
                return mustDoTimes;
            case 1:
            case 2:
            case 3:
            case 4:
                // 如果已執行次數 > 還要執行次數時，表示不需再執行了，回傳0次
                if (mustDoTimes - executionTimes < 0) {
                    return 0;
                }
                return mustDoTimes - executionTimes;
            default:
                return 0;
        }
    }
    // 存取星期幾陣列
    // function setWeekDay(numberString) {
    //     let weekDayArray = [];
    //     if (weekDayArray.length === 0) {
    //         // 都沒有數字者
    //         return 'null';
    //     }
    //     if (numberString === 'Q2W') {
    //         // 2不是星期(2 => 2週)
    //         return 'null';
    //     }
    //     if (numberString.includes('1')) {
    //         weekDayArray.push('1');
    //     }
    //     if (numberString.includes('2')) {
    //         weekDayArray.push('2');
    //     }
    //     if (numberString.includes('3')) {
    //         weekDayArray.push('3');
    //     }
    //     if (numberString.includes('4')) {
    //         weekDayArray.push('4');
    //     }
    //     if (numberString.includes('5')) {
    //         weekDayArray.push('5');
    //     }
    //     if (numberString.includes('6')) {
    //         weekDayArray.push('6');
    //     }
    //     if (numberString.includes('7')) {
    //         weekDayArray.push('7');
    //     }
    //     return weekDayArray;
    // }

    return rest;
}


import dialysisDataList from '../fakeData/machinedata/ApiDialysisdataByDialysisIdByIdGet.fake.json';
import repeatedData from '../fakeData/machinedata/getrepeat.fake.json';
import repeatedDataByHour from '../fakeData/machinedata/getrepeatbyhour.fake.json';

angular.module('app').factory('machineDataService', machineDataService);

machineDataService.$inject = ['$http', '$q', 'SettingService', 'PatientService', '$localStorage', '$timeout', '$rootScope'];

function machineDataService($http, $q, SettingService, PatientService, $localStorage, $timeout, $rootScope) {
    const rest = {};

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastContAccessTime = new Date();    // 取某時連續型資料的時間
    let lastDialysisId = '';

    // 離線儲存相關
    // 於程式一開啟需檢查 localStorage 的透析機暫存資料，若有 uploading property 需要刪掉 (可能在上傳時未等結果回來時，app 意外關閉，導致標記未刪除)
    if ($localStorage.tempMachineData && $localStorage.tempMachineData.length > 0) {
        _.forEach($localStorage.tempMachineData, (item) => {
            delete item.uploading;
        });
    }
    // 於程式一開啟需檢查，若 localStorage 仍有未上傳的資料則啟動 timer
    let uploadedCount = -1;     // 計算嘗試上傳的次數
    let uploadTimer = $timeout(postTempData, 0);
    function postTempData() {
        // 先取消上一個 timer，確保只正在執行一個 timer
        if (uploadTimer) {
            $timeout.cancel(uploadTimer);
        }

        // 檢查是否尚有資料未上傳
        // post
        if ($localStorage.tempMachineData && $localStorage.tempMachineData.length > 0) {

            // 若成功上傳會刪除 tempMachineData，為避免刪除後 index 會亂掉，傳入複製的那份
            // 為了方便上傳結果回傳時操作資料，先在原始資料須增加唯一值 (uuid) 以供辨識
            for (let i = 0; i < $localStorage.tempMachineData.length; i++) {
                $localStorage.tempMachineData[i].uploading = generateUUID();
            }
            uploadTempData(0, angular.copy($localStorage.tempMachineData));

            // Todo 累加下一次上傳的時間
            uploadedCount++;
            if (uploadedCount <= 10) {
                uploadTimer = $timeout(postTempData, 60000);
            } else if (uploadedCount > 10 && uploadedCount < 16) {
                // 十次以後，每 10 分鐘嘗試一次
                uploadTimer = $timeout(postTempData, 600000);
            }
        }
    }

    // 一次只上傳一筆
    function uploadTempData(notUploadCount, localData) {
        if (notUploadCount >= localData.length) {
            return;
        }

        $http({
            method: 'post',
            data: localData[notUploadCount],
            url: `${SettingService.getServerUrl()}/api/dialysisdata`
        }).then((res) => {
            // 成功上傳則從 localStorage 移除
            console.log('machineData successfully i:' + notUploadCount + '; key:' + localData[notUploadCount].uploading);
            let index = _.findIndex($localStorage.tempMachineData, ['uploading', localData[notUploadCount].uploading]);
            if (index > -1) {
                $localStorage.tempMachineData.splice(index, 1);
            }
            // 前端顯示
            lastRecords.push(res.data);
            $rootScope.$broadcast('machineDataRefresh');

            // 病患清單需要重新撈取以同步病人狀態
            PatientService.setDirty();

        }, (res) => {
            // 失敗將資料的 uploading 標記移除，以利下次上傳嘗試
            console.log('machineData failed i:' + notUploadCount + '; key:' + localData[notUploadCount].uploading);
            let index = _.findIndex($localStorage.tempMachineData, ['uploading', localData[notUploadCount].uploading]);
            if (index > -1) {
                delete $localStorage.tempMachineData[index].uploading;
            }
        }).finally(() => {
            uploadTempData(++notUploadCount, localData);
        });
    }

    function generateUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }

    // 依表頭代碼取得所有透析機資料
    rest.getByHeaderId = function getByHeaderId(headerId, isForce) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisDataList, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisDataList, deferred);
        // }


        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if (lastDialysisId === headerId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isDirty) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/bydialysisid/${headerId}`
        }).then((res) => {
            // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
            lastDialysisId = headerId;

            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依透析機代碼取得資料
    rest.get = function get(id) {
        const deferred = $q.defer();

        // let isApiReady = false;
        // if (!isApiReady) {
        //     // 依 id 去吐
        //     let data = dialysisDataList.find(item => item.Id === id);
        //     return SettingService.checkDemoModeAndGetDataAsync(data, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得連續型透析機資料(以表單ID及Date取得)
    rest.getContinuousData = function (patientId, date) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(repeatedData, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(repeatedData, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/getRepeat/patient/${patientId}/${date}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        lastContAccessTime = Date.now();

        return deferred.promise;
    };

    // 依表單 ID & 日期(時) 取得連續型資料
    rest.getSpecificDayContData = function (patientId, specificDay) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(repeatedDataByHour, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(repeatedDataByHour, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/getRepeat/patient/${patientId}/hour/${specificDay}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getLastContAccessTime = function () {
        return lastContAccessTime;
    };

    // 新增透析機資料
    rest.post = function post(postData) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred);
        // }

        $http({
            method: 'post',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/dialysisdata`
        }).then((res) => {
            lastRecords.push(res.data);
            $rootScope.$broadcast('machineDataRefresh');
            // $rootScope.$broadcast('dataChanged', res);
             // 病患清單需要重新撈取以同步病人狀態
             PatientService.setDirty();
            deferred.resolve(res);
        }, (res) => {
            // 儲存錯誤時，將新增失敗的資料先儲存於 localStorage
            // 若 localStorage 裡沒有 tempMachineData 則創建
            if (!$localStorage.tempMachineData) {
                $localStorage.tempMachineData = [];
            }

            $localStorage.tempMachineData.push(postData);

            // 啟動上傳 timer
            uploadedCount = 0;
            uploadTimer = $timeout(postTempData, 10000);    // 10s 後在開始嘗試上傳

            deferred.reject(res);
        });

        return deferred.promise;
    };

    let isDirty = false;    // 連續型選取資料後，回透析機資料應該要重取
    // 修改透析機資料
    rest.put = function put(postData) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred);
        // }

        $http({
            method: 'put',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/dialysisdata`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastRecords) {
                const index = _.findIndex(lastRecords, ['Id', postData.Id]);
                lastRecords[index] = res.data;
                isDirty = true;
            }
            $rootScope.$broadcast('machineDataRefresh');
            $rootScope.$broadcast('nursingRecord-dataChanged');
            // 病患清單需要重新撈取以同步病人狀態
            PatientService.setDirty();
            // $rootScope.$broadcast('dataChanged', res);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 刪除透析機資訊並帶入使用者代碼
    rest.delete = function del(id, userId) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisDataList[0], deferred);
        // }

        $http({
            method: 'delete',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/delete/${id}`
        }).then((res) => {
            if (lastRecords) {
                const index = _.findIndex(lastRecords, ['Id', id]);
                lastRecords.splice(index, 1);
            }
            $rootScope.$broadcast('machineDataRefresh');
            // $rootScope.$broadcast('dataChanged', res);
            // 病患清單需要重新撈取以同步病人狀態
            PatientService.setDirty();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得最後取得資料的時間
    rest.getLastAccessTime = function getLastAccessTime() {
        return lastAccessTime;
    };

    // 取得最後一筆透析機資料
    rest.getLastByHeaderId = function getLastByHeaderId(headerId) {
        const deferred = $q.defer();

        // 如果之前讀取過的 id 相同,
        // 而且在 1 分鐘內, 則直接回傳前一次的陣列的最後一筆資料
        if (lastDialysisId === headerId && moment(lastAccessTime).add(1, 'm') > moment()) {
            const res = {};
            // 依測量時間取得最後一筆資料，若測量時間相同，再以 CreatedTime 去比
            res.data = _.head(_.orderBy(lastRecords, ['DialysisTime', 'CreatedTime'], ['desc', 'desc']));
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisdata/lastByDialysisId/${headerId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

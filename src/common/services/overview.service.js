// fake data
import dialysisheaderByIdGet from '../fakeData/overview/ApiDialysisheaderByIdGet.fake.json';


angular.module('app').factory('OverViewService', OverViewService);

OverViewService.$inject = ['$http', '$q', '$rootScope', 'SettingService', '$stateParams', 'PatientService'];

function OverViewService($http, $q, $rootScope, SettingService, $stateParams, PatientService) {
    const rest = {
        getByHeaderId,
        getByCheckModifiedTime,
        post,
        put,
        del,
        getNotification,
        putNotificationtoSetread,
        getBypatientidforselectoption,
        getLastAccessTime
    };

    const user = SettingService.getCurrentUser();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = null;
    let lastAccessTime = new Date();
    // let lastDialysisId = '';

    // 用表頭Id讀取N筆總攬
    function getByHeaderId(id, isForce) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisheaderByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisheaderByIdGet, deferred);
        // }

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if ((lastRecords && lastRecords.data.Id === id) && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
        // if (lastDialysisId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/${id}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res;
                // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
                // lastDialysisId = id;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 用表頭Id判斷資料是否已被其他使用者修改，如果 20 秒之內沒反應中斷，再反查一次
    function getByCheckModifiedTime(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/modifiedtime/${id}`,
            timeout: 20000
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/dialysisheader`
        }).then((res) => {
            // 病患清單需要重新撈取以同步病人狀態
            PatientService.setDirty();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/dialysisheader`
        }).then((res) => {
            lastAccessTime = Date.now();
            lastRecords = res;
            // 因為也會修改 patient 的資訊，須利用 setDirty，供 patient service 是否要重新從 server 撈
            PatientService.setDirty();
            deferred.resolve(res);
            $rootScope.$broadcast('overview-dataChanged');
            $rootScope.$broadcast('nursingRecord-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 刪除
    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/delete/${id}`
        }).then((res) => {
            // 病患清單需要重新撈取以同步病人狀態
            PatientService.setDirty();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 讀取通知
    function getNotification(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/notification/bydialysisheaderid/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 修改通知成已讀
    // function putNotificationtoSetread() {
    //   const deferred = $q.defer();
    //   $http({
    //     method: 'PUT',
    //     url: `${serverApiUrl}/api/notification/setread/DialysisHeader?user_id=${user.Id}&patient_id=${patientId}`
    //   }).then((res) => {
    //     deferred.resolve(res);
    //   }, (res) => {
    //     deferred.reject(res);
    //   });

    //   return deferred.promise;
    // }
    function putNotificationtoSetread(relativeId) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/notification/setReadByRelativeId/${relativeId}?user_id=${user.Id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依病人代碼取得血管通路評估資料
    function getBypatientidforselectoption(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/vesselassessment/bypatientidforselectoption/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    return rest;
}


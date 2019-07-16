import dashboardGetCarePatientByUserId from '../fakeData/dashboard/ApiDashboardGetCarePatientByUserId.fake.json';

angular.module('app').factory('notificationService', notificationService);

notificationService.$inject = ['$http', '$q', 'SettingService', '$rootScope'];

function notificationService($http, $q, SettingService, $rootScope) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastUserId = '';
    let lastUnreadCount = 0;
    let lastUnreadId = '';
    let isReload = false; // 是否重讀

    // 依使用者代碼取得今日照護病人的通知
    rest.getCarePatientsByUserId = function getCarePatientsByUserId(id, isForce) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dashboardGetCarePatientByUserId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dashboardGetCarePatientByUserId, deferred);
        // }

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        // 通知增加時，isReload = true
        if (lastUserId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isReload) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/notification/carepatientsbyuserid/${id}`
        }).then((res) => {
            // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
            lastUserId = id;

            if (res.data) {
                lastAccessTime = Date.now();

                // 依日期倒序排
                res.data = _.orderBy(res.data, ['Date'], ['desc']);

                lastRecords = res.data;
                isReload = false;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 設定已讀取及最後讀取時間
    rest.setRead = function setRead(id, userId) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/notification/setRead/${id}/userId/${userId}`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastRecords) {
                const index = _.findIndex(lastRecords, ['Id', id]);
                if (!lastRecords[index].IsRead) lastRecords[index].IsRead = _.findIndex(res.data.ReadUsers, ['Id', userId]) > -1;
            }

            // 即時更新通知筆數
            rest.getUnreadCount(userId);

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得今日照護病人，未讀取通知的筆數
    rest.getUnreadCount = function getUnreadCount(userId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/notification/userunreadcount/${userId}`
        }).then((res) => {
            // 判斷是否有新通知
            if (lastUnreadId !== res.data.lastId) {
                isReload = true;
            }
            if (lastUnreadCount !== res.data.Count) {
                lastUnreadCount = res.data.Count;
                $rootScope.home_notificationCount = lastUnreadCount;
                $rootScope.notificationCount = lastUnreadCount;
            }

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

    // 依病人代碼取得所有通知資料
    rest.getByPatientId = function (patientId) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/notification/byPatientId/${patientId}`
        }).then((res) => {

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

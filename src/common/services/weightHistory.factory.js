import weightHistoryFakeData from '../fakeData/weightHistory/getweighthistory.fake.json';

angular.module('app').factory('weightHistoryService', weightHistoryService);

weightHistoryService.$inject = ['$q', 'SettingService', '$http'];

function weightHistoryService($q, SettingService, $http) {
    const rest = {
        getByDate,
        getLastAccessTime
    };

    let lastAccessTime = null;

    // 新增排班，依 mode 來判斷，先刪除已存在的，才新增 (預設為 single)
    function getByDate(recordTime) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(weightHistoryFakeData, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(weightHistoryFakeData, deferred);
        // }
        let record = moment(recordTime).format('YYYYMMDD');
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/ScaleRecord/recordTime/${record}`
        }).then((res) => {
            lastAccessTime = moment();
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

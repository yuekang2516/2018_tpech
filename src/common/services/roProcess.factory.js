import fakedata from '../../app/home/ROProcess/fake';

angular.module('app').factory('roProcessService', roProcessService);

roProcessService.$inject = ['$rootScope', '$q', 'SettingService', '$http'];

function roProcessService($rootScope, $q, SettingService, $http) {
    let lastAccessTime = null;

    const rest = {
        get,
        getPendingCount,
        getLastAccessTime,
        post,
        put,
        del
    };

    // 依條件取得 ro 異常紀錄
    function get(IsResolved = false, startDate = null, endDate = null) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            // TODO need changed
            url: `${SettingService.getServerUrl()}/api/roalert/getroalert?IsResolved=${IsResolved}&startDate=${startDate || ''}&endDate=${endDate || ''}`
        }).then((res) => {
            // 依異常時間正序排並將 Status 為 Deleted 的過濾
            // res.data = _.orderBy(_.filter(res.data, (o) => {
            //     return o.Status !== 'Deleted';
            // }), ['AbnormalTime']);

            res.data = _.orderBy(res.data, ['AbnormalTime']);

            lastAccessTime = new Date();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // TODO for home to notice user there are some ro need to resolved
    function getPendingCount() {
        console.log('getPendingCount');
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/roalert/getabnormalcount`
        }).then((res) => {
            $rootScope.$broadcast('roAbnormalCount', res.data);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 新增
    function post(data) {
        const deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/roalert`,
            data
        }).then((res) => {
            deferred.resolve(res);

            // 馬上重取未處理的RO異常紀錄數目
            getPendingCount();

            // 通知前端重整
            // $rootScope.$broadcast('refresh');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 修改
    function put(data) {
        const deferred = $q.defer();

        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/roalert`,
            data
        }).then((res) => {
            deferred.resolve(res);

            // 馬上重取未處理的RO異常紀錄數目
            getPendingCount();

            // 通知前端重整
            // $rootScope.$broadcast('refresh');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/roalert?id=${id}`,
        }).then((res) => {
            deferred.resolve(res);

            // 馬上重取未處理的RO異常紀錄數目
            getPendingCount();

            // 通知前端重整
            $rootScope.$broadcast('refresh');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return rest;
}

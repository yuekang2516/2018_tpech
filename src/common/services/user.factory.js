userService.$inject = ['SettingService', '$http', '$q'];

function userService(SettingService, $http, $q) {
    const rest = {};

    rest.get = function get() {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/user`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // Todo 每固定時間重新從 server 撈，以同步資訊
    rest.getById = function get(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/user/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.post = function post(user) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/user`,
            data: user
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.put = function put(user) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/user`,
            data: user
        }).then((res) => {
            // 若修改的使用者與目前使用者相同，則本地端也須更新
            if (user.Id === SettingService.getCurrentUser().Id) {
                SettingService.setCurrentUser(res.data);
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getByWardId = function (wardId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/user/ward/${wardId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('userService', userService);

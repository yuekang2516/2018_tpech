centerUserService.$inject = ['SettingService', '$http', '$q'];

function centerUserService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    // 取得所有使用者
    rest.get = function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterUser`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取代碼取得使用者
    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterUser/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 新增使用者
    rest.post = function post(centeruser) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/CenterUser`,
            data: centeruser
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 修改使用者
    rest.put = function put(centeruser) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/CenterUser`,
            data: centeruser
        }).then((res) => {
            // 若修改的使用者與目前使用者相同，則本地端也須更新
            if (centeruser.Id === SettingService.getCenterUser().Id) {
                SettingService.setCenterUser(res.data);
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 刪除
    rest.delById = function delById(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/CenterUser/${id}`
        }).then((res) => {
            // for (let i = 0; i < lastRecords.length; i += 1) {
            //     if (lastRecords[i].Id === id) {
            //         lastRecords[i].Status = 'Deleted';
            //         break;
            //     }
            // }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('centerUserService', centerUserService);

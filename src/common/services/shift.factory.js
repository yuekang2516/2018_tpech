angular.module('app').factory('shiftService', shiftService);

shiftService.$inject = ['$q', 'SettingService', '$http'];

function shiftService($q, SettingService, $http) {
    const rest = {
        postWithMode,
        getByWardIdAndMonth
    };
    const serverApiUrl = SettingService.getServerUrl();

    // 新增排班，依 mode 來判斷，先刪除已存在的，才新增 (預設為 single)
    function postWithMode(mode = 'single', postData) {
        const deferred = $q.defer();
        $http({
            method: 'post',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/AssignShift/mode/${mode}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 取得所有排班資料
    function getByWardIdAndMonth(wardId, year, month) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/AssignShift/ward/${wardId}/month/${year}/${month}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return rest;
}

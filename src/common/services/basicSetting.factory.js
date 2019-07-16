angular.module('app').factory('basicSettingService', basicSettingService);

basicSettingService.$inject = ['SettingService', '$http', '$q', '$sessionStorage'];
function basicSettingService(SettingService, $http, $q, $sessionStorage) {
    const rest = {};
    let serverApiUrl = SettingService.getServerUrl();

    rest.put = function put(basicSetting) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/hospital`,
            data: basicSetting
        }).then((res) => {
            SettingService.setCurrentHospital(basicSetting);
            $sessionStorage.HospitalInfo = SettingService.getCurrentHospital();

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 第一次若 serverUrl 尚未設定，即使後來設了，serverApiUrl 也不會變(一開始就沒有參考到物件)，需開放此方法，於使用者設定 serverUrl 時呼叫。
    rest.setServerUrl = function (url) {
        serverApiUrl = url;
    };

    // 利用目前網域得到 hospitalInfo
    rest.getHospitalInfo = function () {
        const deferred = $q.defer();

        // for 手機端，若使用者尚未設定 serverUrl，則不跑下面
        if (!serverApiUrl && cordova.platformId !== 'browser') {
            deferred.reject('尚未設置伺服器位置，請至設定頁面設定');
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${serverApiUrl}/api/Hospital/hostName`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('kiditService', kiditService);

kiditService.$inject = ['$http', '$q', 'SettingService'];

function kiditService($http, $q, SettingService) {
    const rest = {
        importsingle,
        importsingleVessel
    };
    const serverApiUrl = SettingService.getServerUrl();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗

    // 處方單筆匯入
    function importsingle(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            // url: `http://172.30.1.177:8000/api/kidit/importsinglePrescription`
            url: `${SettingService.getServerUrl()}/api/kidit/importsinglePrescription`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 造管單筆匯入
    function importsingleVessel(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            // url: `http://172.30.1.177:8000/api/kidit/importsingleVessel`
            url: `${SettingService.getServerUrl()}/api/kidit/importsingleVessel`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    return rest;
}

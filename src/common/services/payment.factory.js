paymentService.$inject = ['SettingService', '$http', '$q'];

function paymentService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    // 取得所有有效帳務
    rest.get = function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Payment`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得所有帳務(不含已刪除)
    rest.getByHospitall = function getByHospital(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Payment/hospital/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得所有帳務, 包含已刪除
    rest.getHospitalAll = function getHospitalAll(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Payment/hospital/${id}/all`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得最後一筆帳務
    rest.getHospitalLast = function getHospitalLast(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Payment/hospital/${id}/last`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取代碼取得帳務
    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Payment/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 新增帳務
    rest.post = function post(payment) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/Payment`,
            data: payment
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 修改帳務
    rest.put = function put(payment) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/Payment`,
            data: payment
        }).then((res) => {
            // 若修改的使用者與目前使用者相同，則本地端也須更新
            if (payment.Id === SettingService.getCenterUser().Id) {
                SettingService.setCenterUser(res.data);
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 刪除帳務
    rest.delById = function delById(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/Payment/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('paymentService', paymentService);

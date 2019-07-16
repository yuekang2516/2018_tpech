contractService.$inject = ['SettingService', '$http', '$q'];

function contractService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    // 取得所有有效合約
    rest.get = function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依年月取得有效合約
    rest.getByDate = function getByDate(year, month) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract/${year}/${month}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得所有合約(不含已刪除)
    rest.getByHospitall = function getByHospital(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract/hospital/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得所有合約, 包含已刪除
    rest.getHospitalAll = function getHospitalAll(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract/hospital/${id}/all`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依醫院代碼取得最後一筆合約
    rest.getHospitalLast = function getHospitalLast(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract/hospital/${id}/last`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取代碼取得合約
    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/CenterContract/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 新增合約
    rest.post = function post(contract) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/CenterContract`,
            data: contract
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 修改合約
    rest.put = function put(contract) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/CenterContract`,
            data: contract
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 刪除合約
    rest.delById = function delById(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/CenterContract/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('contractService', contractService);

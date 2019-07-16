machineService.$inject = ['SettingService', '$http', '$q'];

function machineService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    rest.get = function get(serachStr) {
        // 先處理url
        let serverUrl = `${SettingService.getServerUrl()}/api/MachineProperty/list`;

        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: serverUrl
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getById = function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/MachineProperty/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.post = function post(machine) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/MachineProperty`,
            data: machine
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.put = function put(machine) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/MachineProperty`,
            data: machine
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.delete = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/MachineProperty/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依藍牙棒編號取得財產資訊
    rest.getByBleNum = function getByBleNum(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/MachineProperty/bluetoothNumber/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 批次匯入財產管理
    rest.batchImport = function batchImport(machine) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/MachineProperty/import`,
            data: machine
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

angular.module('app').factory('machineService', machineService);

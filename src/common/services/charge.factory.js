chargeService.$inject = ['SettingService', '$http', '$q'];

angular.module('app').factory('chargeService', chargeService);

function chargeService(SettingService, $http, $q) {
    const rest = {};
    const serverApiUrl = SettingService.getServerUrl();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastRecords = [];
    let lastAccessTime = new Date();
    let lastHeaderId = '';

    rest.get = function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/charge`
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
            url: `${SettingService.getServerUrl()}/api/charge/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getByPatientId = function getByPatientId(Patientid) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/charge/getByPatientId/${Patientid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.post = function post(charge) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/charge`,
            data: charge
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.put = function put(charge) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/charge`,
            data: charge
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 刪除物品使用紀錄 (更改 Status -> Deleted)
    rest.del = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/ChargeWarehouse/${id}`
        }).then((res) => {
            for (let i = 0; i < lastRecords.length; i += 1) {
                if (lastRecords[i].Id === id) {
                    lastRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 刪除計價資料連同計價使用紀錄 (後台使用 admin)
    rest.delete = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/charge/${id}`
        }).then((res) => {
            // if (lastRecords) {
            //   const index = _.findIndex(lastRecords, ['Id', id]);
            //   lastRecords.splice(index, 1);
            // }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得最後取得資料的時間
    rest.getLastAccessTime = function getLastAccessTime() {
        return lastAccessTime;
    };

    rest.getChargeWarehouseByPatientId = function getChargeWarehouseByPatientId(patientId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/chargewarehouse/getByPatientId/${patientId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.getChargeWarehouseByRelativeId = function getChargeWarehouseByRelativeId(relativeId, isForce) {
        const deferred = $q.defer();

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if (lastHeaderId === relativeId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce && !isDirty) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/ChargeWarehouse/getByRelativeId/${relativeId}`
        }).then((res) => {
            // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
            lastHeaderId = relativeId;
            if (res.data) {
                lastAccessTime = Date.now();
                lastRecords = res.data;
                isDirty = false;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    let isDirty = false;  // 資料新增後需要重新從 server 撈，以得到正確的庫存數，因為位於不同 component 中，因此需在此做掉
    rest.saveChargeWarehouse = function saveChargeWarehouse(charge) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/ChargeWarehouse`,
            data: charge
        }).then((res) => {
            // lastRecords.push(res.data);
            isDirty = true;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    rest.editChargeWarehouse = function editChargeWarehouse(charge) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/ChargeWarehouse`,
            data: charge
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            // if (lastRecords) {
            //   const index = _.findIndex(lastRecords, ['Id', charge.Id]);
            //   lastRecords[index] = res.data;
            // }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };


    // 由總覽表單的透析室代碼取得計價物品清單
    rest.getAllItemsByHeaderId = function getAllItemsByHeaderId(HeaderId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/charge/dialysisHeader/${HeaderId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };


    // 依透析室代碼取得計價物品
    rest.getItemsByWardId = function getItemsByWardId(WardId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/charge/ward/${WardId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    return rest;
}

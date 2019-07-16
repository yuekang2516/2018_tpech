// fake data
import dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD from '../fakeData/prescription/ApiDialysisprescriptionByPatientModeOrTypeByIdByTagGetHD.fake.json';
import dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDF from '../fakeData/prescription/ApiDialysisprescriptionByPatientModeOrTypeByIdByTagGetHDF.fake.json';
import dialysisprescriptionByPatientModeOrTypeByIdByTagGetST from '../fakeData/prescription/ApiDialysisprescriptionByPatientModeOrTypeByIdByTagGetST.fake.json';


angular.module('app')
    .factory('prescriptionService', prescriptionService);

prescriptionService.$inject = ['$http', '$q', 'SettingService', '$rootScope'];
function prescriptionService($http, $q, SettingService, $rootScope) {
    const rest = {
        getByIdPage,
        getByPatientModeOrType,
        getByPatientId,
        getDetail,
        postDetail,
        putDetail,
        del,
        getLast,
        getLastAccessTime,
        updateDialysisHeader
    };

    const serverApiUrl = SettingService.getServerUrl();
    const user = SettingService.getCurrentUser();
    let lastAccessTime = new Date();
    let lastPatientId = '';
    let lastPrescriptionType = null;    // 由於前端已把 HD, HDF, INTERM 分開顯示，需多紀錄前一次是取哪種，否則暫存資料會有問題
    let lastRecords = [];   // 暫存

    // 暫存 (infinite scroll)
    let lastPageRecords = {
        Total: 0,   // 供前端綁定 '共幾筆'，因為不能直接由 Records 的 length 得知，且有新增功能，須及時操作 Total 的數量
        Records: []
    };

    // 依病人代碼及頁碼取得處方記錄 api : api/dialysisprescription/patient/{病人代碼}/{頁碼}
    function getByIdPage(id, page, limit, isForce) {
        const deferred = $q.defer();

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            lastPageRecords.Records = [];
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/patient/${id}/${page}?limit=${limit}`
        }).then((res) => {
            lastAccessTime = Date.now();
            // 歷次透析處方暫存
            lastPageRecords.Total = res.data.Total;
            if (lastPageRecords.Records && lastPatientId === id) {
                lastPageRecords.Records = lastPageRecords.Records.concat(res.data.Results);
            } else {
                lastPageRecords.Records = res.data.Results;
                lastPatientId = id;
            }
            deferred.resolve(lastPageRecords);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 依病人代碼及模式取得處方記錄 GET /api/dialysisprescription/byPatientModeOrType/{id}/{tag}
    function getByPatientModeOrType(id, tag, page, limit, isForce) {
        const deferred = $q.defer();
        // // demo
        // let isApiReady = false;
        // if (tag === "HD") {
        //     if (!isApiReady && deferred) {
        //         deferred.resolve({
        //             Total: dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD.Total,
        //             Records: dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD.Results
        //         });
        //         return deferred.promise;
        //     }
        // }
        // if (tag === "HDF") {
        //     if (!isApiReady && deferred) {
        //         deferred.resolve({
        //             Total: dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDF.Total,
        //             Records: dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDF.Results
        //         });
        //         return deferred.promise;
        //     }
        // }
        // if (tag === "INTERIM") {
        //     if (!isApiReady && deferred) {
        //         deferred.resolve({
        //             Total: dialysisprescriptionByPatientModeOrTypeByIdByTagGetST.Total,
        //             Records: dialysisprescriptionByPatientModeOrTypeByIdByTagGetST.Results
        //         });
        //         return deferred.promise;
        //     }
        // }

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            lastPageRecords.Records = [];
        }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/byPatientModeOrType/${id}/${tag}?page=${page}&limit=${limit}`
        }).then((res) => {
            lastAccessTime = Date.now();
            // 歷次透析處方暫存
            lastPageRecords.Total = res.data.Total;
            if (lastPageRecords.Records && lastPatientId === id && lastPrescriptionType === tag) {
                lastPageRecords.Records = lastPageRecords.Records.concat(res.data.Results);
            } else {
                lastPageRecords.Records = res.data.Results;
                lastPatientId = id;
                lastPrescriptionType = tag;
            }
            deferred.resolve(lastPageRecords);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getByPatientId(id, isForce) {
        const deferred = $q.defer();

        // 如果之前讀取過的 id 相同,
        // 而且在5 分鐘內, 則直接回傳前一次的陣列
        // 除非使用者在畫面上按下重整按鈕, 則會強制重讀一次
        if (lastPatientId === id && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            const res = {};
            res.data = lastRecords;
            deferred.resolve(res);
            return deferred.promise;
        }

        // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
        lastPatientId = id;

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/byPatientId/${id}`
        }).then((res) => {
            lastAccessTime = Date.now();
            lastRecords = res.data;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    function getDetail(dialysisPrescriptionId) {
        const deferred = $q.defer();
        let dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDfind = dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD.Results.find((item) => {
            return item.Id === dialysisPrescriptionId;
        });
        // // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDfind, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHDfind, deferred);
        // }
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisprescription/' + dialysisPrescriptionId
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function postDetail(data) {
        const deferred = $q.defer();

        // // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred);
        // }
        $http({
            method: 'POST',
            data: data,
            url: SettingService.getServerUrl() + '/api/dialysisprescription/'
        }).then((res) => {
            lastPageRecords.Total++;
            lastPageRecords.Records.push(res.data);
            deferred.resolve(res);
            $rootScope.$broadcast('prescription-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function putDetail(data) {
        const deferred = $q.defer();

        // // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred);
        // }
        $http({
            method: 'PUT',
            data: data,
            url: SettingService.getServerUrl() + '/api/dialysisprescription/'
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastPageRecords.Records) {
                for (let i = 0; i < lastPageRecords.Records.length; i++) {
                    if (lastPageRecords.Records[i].Id === data.Id) {
                        lastPageRecords.Records[i] = data;
                    }
                }
            }
            // $rootScope.$broadcast('prescriptionChanged', res);
            deferred.resolve(res);
            $rootScope.$broadcast('prescription-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/delete/${id}`
        }).then((res) => {
            for (let i = 0; i < lastPageRecords.Records.length; i++) {
                if (lastPageRecords.Records[i].Id === id) {
                    lastPageRecords.Records[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
            $rootScope.$broadcast('prescription-dataChanged', 'del');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getLast(PatientId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/byPatientIdGetLast/${PatientId}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 覆寫今日洗腎處方
    function updateDialysisHeader(headerId, id, userId) {
        const deferred = $q.defer();

        // // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisprescriptionByPatientModeOrTypeByIdByTagGetHD, deferred);
        // }
        console.log('headerId', headerId);
        $http({
            method: 'PUT',
            url: `${SettingService.getServerUrl()}/api/dialysisprescription/${id}/replaceDialysisHeader/${headerId}/${userId}`
        }).then((res) => {
            // $rootScope.$broadcast('prescriptionChanged', res);
            deferred.resolve(res);
            $rootScope.$broadcast('overview-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    return rest;
}


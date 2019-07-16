angular.module('app').factory('tpechService', tpechService);
tpechService.$inject = ['SettingService', '$http', '$q'];

function tpechService(SettingService, $http, $q) {
    const rest = {
        getBloodBag,
        getLabResult,
        getMicroResult,
        getMedicine,
        getAllMedicine,
        getPatient,
        getReg,
        getIpd,
        getUser,
        getIPD2,
        getSurgery,
        getMedalrm,
        getLastAccessTimeByKey,
        getTaiwanDate,
        tawiwanDateToBC
    };
    const serverApiUrl = SettingService.getServerUrl();
    let lastAccessTime = {
        ipd: null
    };

    // /// 測試
    // rest.test = function test() {
    //     const deferred = $q.defer();
    //     $http({
    //         method: 'GET',
    //         url: `http://dialysissystem.azurewebsites.net/api/patient/57889c0827920c3e0cc57546`
    //     }).then((res) => {
    //         deferred.resolve(res);
    //     }, (res) => {
    //         deferred.reject(res);
    //     });
    //     return deferred.promise;
    // };

    /// 單一病人單一血袋判斷
    function getBloodBag(patno, bagno) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetBloodBag/${patno}/${bagno}`
            //url: `${SettingService.getServerUrl()}BloodBag/getBloodBag?HospId=${syscode}&PatNo=${patno}&BagNo=${bagno}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人檢驗值報告 patno = MadicalId 病歷號碼
    function getLabResult(patno, sdate, edate) {
        const deferred = $q.defer();
        // 西元轉民國 7碼
        sdate = getTaiwanDate(sdate);
        edate = getTaiwanDate(edate);
        console.log('檢驗項目勾選', sdate, edate);
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetLabResult/${patno}/${sdate}/${edate}`
            //url: `${SettingService.getServerUrl()}LabResult/getLabResult?HospId=${syscode}&PatNo=${patno}&Sdate=${sdate}&Edate=${edate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人微生物報告
    function getMicroResult(patno, sdate, edate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetMicroResult/${patno}/${sdate}/${edate}`
            //url: `${SettingService.getServerUrl()}LabResult/GetMicroResult?HospId=${syscode}&PatNo=${patno}&Sdate=${sdate}&Edate=${edate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    /// 單一病人當次就診/住院用藥明細資料
    function getMedicine(patno, patseq) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetMedicine/${patno}/${patseq}`
            //url: `${SettingService.getServerUrl()}Medicine/getMedicine?HospId=${syscode}&PatNo=${patno}&PatSeq=${patseq}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人歷史用藥明細資料
    function getAllMedicine(patno, sdate, edate) {
        const deferred = $q.defer();
        // 西元轉民國 7碼
        sdate = getTaiwanDate(sdate);
        edate = getTaiwanDate(edate);
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetAllMedicine/${patno}/${sdate}/${edate}`
            //url: `${SettingService.getServerUrl()}Medicine/GetAllMedicine?HospId=${syscode}&PatNo=${patno}&Sdate=${sdate}&Edate=${edate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人基本資料
    function getPatient(patno) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetPatient/${patno}`
            //url: `${SettingService.getServerUrl()}Patient/getPatient?HospId=${syscode}&PatNo=${patno}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 洗腎門診預約掛號資料
    function getReg(regdate, nooncode = null) {
        const deferred = $q.defer();
        //let urlpath = '';
        // if (nooncode === null) {
        //     urlpath = `${SettingService.getServerUrl()}Reg/getReg?HospId=${syscode}&RegDate=${regdate}`;
        // } else {
        //     urlpath = `${SettingService.getServerUrl()}Reg/getReg?HospId=${syscode}&RegDate=${regdate}&NoonCode=${nooncode}`;
        // }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetReg/${regdate}?NoonCode=${nooncode}`
            //url: urlpath
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一急住診病人資料
    function getIpd(patno) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetIpd/${patno}`
            //url: `${SettingService.getServerUrl()}Reg/getIpd?HospId=${syscode}&PatNo=${patno}`
        }).then((res) => {
            lastAccessTime.ipd = moment();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一使用者資料
    function getUser(userid) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetUser/${userid}`
            //url: `${SettingService.getServerUrl()}User/GetUser?HospId=${syscode}&UserId=${userid}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人住院歷程
    function getIPD2(patno, sdate, edate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetIPD2/${patno}/${sdate}/${edate}`
            //url: `${SettingService.getServerUrl()}IPD/getIPD?HospId=${syscode}&PatNo=${patno}&Sdate=${sdate}&Edate=${edate}`
        }).then((res) => {
            lastAccessTime.ipd2 = moment();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    /// 單一病人手術歷程
    function getSurgery(patno, sdate, edate) {
        const deferred = $q.defer();
        // 西元轉民國 7碼
        sdate = getTaiwanDate(sdate);
        edate = getTaiwanDate(edate);
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/GetSurgery/${patno}/${sdate}/${edate}`
            //url: `${SettingService.getServerUrl()}IPD/GetSurgery?HospId=${syscode}&PatNo=${patno}&Sdate=${sdate}&Edate=${edate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 單一病人過敏紀錄檔
    function getMedalrm(patno) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Tpech/VW/GetMedalrm/${patno}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 依 key 取得相應的最後取值時間
    function getLastAccessTimeByKey(key) {
        return lastAccessTime[key];
    }


    // 西元轉民國 7碼 YYYMMDD
    function getTaiwanDate(date) {
        let year = parseInt(moment(date).format('YYYY')) ? parseInt(moment(date).format('YYYY')) - 1911 : null;
        let newDateStr = year ? year.toString().concat(moment(date).format('MMDD')) : null;
        return newDateStr;
    }

    // 民國7/13碼轉西元
    function tawiwanDateToBC(str) {
        if (typeof str !== 'string') {
            return null;
        }
        if (str.length === 7) {
            return new Date(parseInt(str.substring(0, 3)) + 1911, parseInt(str.substring(3, 5)) - 1, str.substring(5, 7))
        } else if (str.length === 13) {
            return new Date(parseInt(str.substring(0, 3)) + 1911, parseInt(str.substring(3, 5)) - 1, str.substring(5, 7), str.substring(7, 9), str.substring(9, 11), str.substring(11, 13));
        }

        return null;
    }

    return rest;
}

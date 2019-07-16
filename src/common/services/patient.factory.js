import dashboardGetInProgressByWardId from '../fakeData/dashboard/ApiDashboardGetInProgressByWardId.fake.json';
import PatientByIdGet from '../fakeData/patient/ApiPatientByIdGet.fake.json';

angular
    .module('app')
    .factory('PatientService', PatientService);

PatientService.$inject = ['$q', '$http', '$rootScope', 'SettingService', 'showMessage', '$state', '$filter'];

function PatientService($q, $http, $rootScope, SettingService, showMessage, $state, $filter) {
    let service = {
        getByUserId,
        getMyPatients,
        getInProgressByWardId,
        getById,
        get,
        getMaskName,
        put,
        post,
        postDuplicate,
        getLastAccessTime,
        searchPatient,
        setDirty,
        getSearchOptions,
        getByField,
        _searchByRfid,
        searchPatientOrGetMachineData,
        orderPatients,
        getinformationById
    };

    let serverApiUrl = SettingService.getServerUrl();

    // // 記得上一個 id 的病人, 如果要取得同一個病人, 直接回傳即可
    // let lastPatient = {};

    // 記得所有的病人, if 十分鐘內要取得病人清單的話, 則直接回傳
    let lastUserId;
    let lastPatients = [];  // 正常狀態病人
    let foundPatients = []; // 搜尋完的病人
    let currentPatient = null;    // getById 暫存的地方

    let isApiReady = false;
    let lastAccessTime = !isApiReady ? Date.now() : moment('1900-01-01');
    let lastGetCurrentPatientTime = !isApiReady ? Date.now() : moment('1900-01-01');   // 撈 patient detail 時，判斷是否要重新從 server 撈 (超過五分鐘)

    let isDirty = {
        patientList: false,
        patientDetail: false
    };    // 別處修改(ex. overview)造成暫存資料與 server 端不同

    // 預設過濾條件全選
    let searchOptions = {
        searchMode: false,
        Name: true,
        MedicalId: true,
        RFID: true,
        BarCode: true,
        IdentifierId: true,
        State: false // 包含離開病人: 預設不勾選
    };

    // search patient by rfid
    let $translate = $filter('translate');
    function _searchByRfid(rfid) {
        let allPatients = [];
        getByUserId(SettingService.getCurrentUser().Id).then((d) => {
            allPatients = d.data.sort((a, b) => {
                if (a.MedicalId > b.MedicalId) return 1;
                return -1;
            });
        }, (err) => {
            console.error(err);
            showMessage($translate('allPatients.component.patientDataFail'));
        }).then(() => {
            if (rfid.Id) {
                for (let i = 0; i < allPatients.length; i++) {
                    if (allPatients[i].RFID === rfid.Id) {
                        if ($state.current.parent === 'home' && $state.current.name !== 'summary') {
                            $state.go('summary', { patientId: allPatients[i].Id }, { notify: true, reload: true, inherit: false }, { location: 'replace' });
                        } else {
                            $state.go('summary', { patientId: allPatients[i].Id }, { notify: true, reload: true, inherit: false });
                        }
                        return;
                    }
                }
                // TODO: check for bugs
                showMessage($translate('allPatients.component.rfidPatient', { rfid: rfid.Id }));
            }
        });
    }

    // 於 summary 頁，若卡片有 ndef 以 ndef 為先(讀取機器資料)
    function searchPatientOrGetMachineData(rfid) {
        let allPatients = [];
        getByUserId(SettingService.getCurrentUser().Id).then((d) => {
            allPatients = d.data.sort((a, b) => {
                if (a.MedicalId > b.MedicalId) return 1;
                return -1;
            });
        }, (err) => {
            console.error(err);
            showMessage($translate('allPatients.component.patientDataFail'));
        }).then(() => {
            if (rfid.Data) {
                $state.go('machineDataDetail', {
                    machineDataId: 'create',
                    macId: rfid.Data
                });
            } else if (rfid.Id) {
                for (let i = 0; i < allPatients.length; i++) {
                    if (allPatients[i].RFID === rfid.Id) {
                        if (($state.current.parent && $state.current.parent !== 'home') || $state.current.name === 'summary') {
                            $state.go('summary', { patientId: allPatients[i].Id }, { notify: true, reload: true, inherit: false, location: 'replace' });
                        } else {
                            $state.go('summary', { patientId: allPatients[i].Id }, { notify: true, reload: true, inherit: false });
                        }
                        return;
                    }
                }
                // TODO: check for bugs
                showMessage($translate('allPatients.component.rfidPatient', { rfid: rfid.Id }));
            }

        });
    }

    function getByUserId(userId, isForce, userState) {
        const deferred = $q.defer();

        userState = userState != null ? userState : '';

        // if (moment(lastAccessTime).add(5, 'm') > moment()
        //     && !isForce && !isDirty.patientList
        //     && lastUserId === SettingService.getCurrentUser().Id) {
        //     console.log('讀病人在5分鐘內, 直接回傳...');
        //     const res = {};
        //     res.data = lastPatients;
        //     deferred.resolve(res);
        //     return deferred.promise;
        // }

        console.log('伺服器讀病人中...');
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/patient/dialysislist/byuserid/mobile/${userId}?state=${userState}`
            // url: serverApiUrl + '/api/patient/dialysislist/byuserid/mobile/' + userId
        }).then((res) => {
            console.log('伺服器回傳病人列表...');
            // 把回傳的資料記得 lastPatients 裡
            if (res.data) {
                lastAccessTime = Date.now();
                lastPatients = res.data;
                isDirty.patientList = false;
                // 也要記得上一個讀取的使用者是誰
                // 以免登出後, 換另一個使用者登入時, 讀到前一個使用者暫存的資料
                lastUserId = SettingService.getCurrentUser().Id;
                deferred.resolve(res);
                return deferred.promise;
            }

            deferred.reject('讀不到病人列表, 請重新整理');
            return deferred.promise;
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    function getMyPatients(userId) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/patient/dialysis/byuserid/' + userId
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    function getInProgressByWardId(wardId) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dashboardGetInProgressByWardId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dashboardGetInProgressByWardId, deferred);
        // }
        
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/patient/inProgressByWardId/' + wardId
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getById(id, isForce) {
        // isForce 強制讀取最新的資訊
        const deferred = $q.defer();

        // 若超過五分鐘再從 server 撈
        if (currentPatient && currentPatient.Id === id && !isForce && !isDirty.patientDetail && moment(lastGetCurrentPatientTime).add(5, 'm') > moment()) {
            let res = {};
            res.data = currentPatient;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/patient/' + id,
            // timeout: 20
        }).then((res) => {
            lastGetCurrentPatientTime = Date.now();
            currentPatient = res.data;
            isDirty.patientDetail = false;
            deferred.resolve(res);
        }, (res) => {
            if (!res.status || res.status < 0) {
                // time out
                console.log('Timeout');
                deferred.reject(res);
            } else {
                deferred.reject(res);
            }
        });

        return deferred.promise;
    }

    function getinformationById(id) {
        // isForce 強制讀取最新的資訊
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(PatientByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(PatientByIdGet, deferred);
        // }
        

        return deferred.promise;
    }

    // 依特定條件排序 patients: 依剩餘時間排序，null代表尚未洗排最上面; 若都沒有剩餘時間已後修改的為大
    function orderPatients(patients) {
        patients.sort((a, b) => {
            // 先判斷是否有一方有剩餘時間且為今日且尚未關表，若無則用修改時間比
            let todayEstimatedTimeData = [a, b].filter(item => item.LastDialysisInfo && item.LastDialysisInfo.EstimatedEndTime && !item.LastDialysisInfo.EndTime && moment(item.LastDialysisInfo.EstimatedEndTime).isSame(moment(), 'day'));
            if (todayEstimatedTimeData.length > 0) {
                // 雙方都有剩餘時間
                if (todayEstimatedTimeData.length > 1) {
                    if (moment(a.LastDialysisInfo.EstimatedEndTime).diff(moment(b.LastDialysisInfo.EstimatedEndTime)) < 0) {
                        return 1;
                    }
                    return -1;
                } else if (todayEstimatedTimeData[0].Id === a.Id) {
                    // 若只有 a 有剩餘時間則排在 b 前面
                    return -1;
                }

                // 只有 b 有剩餘時間排在 a 前面
                return 1;
            }

            if (moment(a.ModifiedTime).diff(moment(b.ModifiedTime)) < 0) {
                return 1;
            }
            return -1;

        });

        return patients;
    }

    function get() {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/patient/'
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function getMaskName(name) {
        // 判斷姓名裡是否包含中文，若有才處理
        // 以 Unicode 去判別 https://zh.wikipedia.org/wiki/Unicode
        let containChinese = false;
        let s = name;
        let tempName = '';
        for (let i = 0; i < s.length; i++) {
            if (s.charCodeAt(i) < 0x4E00 || s.charCodeAt(i) > 0x9FBB) {
                // console.log('非中文');
            } else {
                containChinese = true;
            }

            // 馬賽克 1/3 ~ 2/3 之間的字元
            // 若為兩個字則馬賽克最後一個字
            // 空白則不馬賽克
            if (s.length === 2 && i === 1 && s[i] !== ' ') {
                tempName += '○';
                continue;
            } else if (s[i] !== ' ' && s.length !== 2 && (i + 1) / s.length > 1 / 3 && (i + 1) / s.length <= 2 / 3) {
                tempName += '○';
                continue;
            }
            tempName += s[i];
        }

        // console.log('mask name', tempName);

        if (containChinese) {
            return tempName;
        }
        return name;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    // 修改病人，填入"Y"，將原使用此RFID的病人Update RFID = string.Empty
    function put(d, emptyrfid = 'N') {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: d,
            url: `${SettingService.getServerUrl()}/api/patient?emptyrfid=${emptyrfid}`
            // url: serverApiUrl + '/api/patient/'
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastPatients) {
                const index = _.findIndex(lastPatients, ['Id', d.Id]);
                lastPatients[index] = res.data;
            }
            if (currentPatient && currentPatient.Id === d.Id) {
                currentPatient = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增病人，填入"Y"，將原使用此RFID的病人Update RFID = string.Empty
    function post(d, emptyrfid = 'N') {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: d,
            url: `${SettingService.getServerUrl()}/api/patient?emptyrfid=${emptyrfid}`
        }).then((res) => {
            lastPatients.unshift(res.data);

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 判斷欄位的值是否重複
    function postDuplicate(d) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: d,
            url: SettingService.getServerUrl() + '/api/patient/isDuplicate'
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function searchPatient(userId, searchStr) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/patient/careUser/' + userId + '/' + searchStr
        }).then((res) => {
            foundPatients = res.data;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function setDirty() {
        isDirty.patientList = true;
        isDirty.patientDetail = true;
        $rootScope.$broadcast('patient-dataChanged');
    }

    function getSearchOptions() {
        return searchOptions;
    }

    // 依資料欄位取得病人資料
    function getByField(d) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: d,
            url: `${SettingService.getServerUrl()}/api/patient/getByField`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return service;
}

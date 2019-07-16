import labexamGetByPatientId from '../fakeData/labexam/ApiLabexamByPatientId.fake.json';

angular.module('app').factory('labexamService', labexamService);

labexamService.$inject = ['$rootScope', '$http', '$q', '$localStorage', 'SettingService'];

function labexamService($rootScope, $http, $q, $localStorage, SettingService) {
    const rest = {
        getByPatientId,
        getByPatientIdDuration,
        getLastAccessTime,
        getByEPOExecution,
        getById,
        post,
        multiPost,
        put,
        del,
        importsingle,
        getPreviousQueryConditionByUserId,
        setPreviousQueryConditionByUserId,
        getByPatientIdAndNameAndLessDate
    };
    const serverApiUrl = SettingService.getServerUrl();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗
    let lastAccessTime = new Date();
    let lastAllRecords = [];
    let lastAllPatientId = '';
    let lastLabexamDay = '';
    let lastMultiRecords = [];


    // 用病人ID讀取N筆
    // TODO: day 之後要改成 -> 起迄日期 dateObj
    function getByPatientId(id, day, isForce) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(labexamGetByPatientId, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(labexamGetByPatientId, deferred);
        // }

        // if (lastAllPatientId === id && lastLabexamDay === day
        //     && moment(lastAccessTime).add(10, 'm') > moment() && !isForce) {
        //     const res = {};
        //     res.data = lastAllRecords;
        //     deferred.resolve(res);
        //     return deferred.promise;
        // }
        // // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
        // lastAllPatientId = id;
        // lastLabexamDay = day;

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/labExam/patientId/${id}/day/${day}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                // lastAllRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getByPatientIdDuration(id, startDate, endDate) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/labExam/patientId/${id}/date/${startDate}/${endDate}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();
                // lastAllRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // query condition 記在 local 端，以 userId 當 key，記住每個 user 的使用習慣
    function getPreviousQueryConditionByUserId(userId) {
        // query condition 初始值，初始 30 天，等之後檢驗檢查查詢功能好了，在調預設值為今日往前七天
        if (!$localStorage.labExamSetting[userId]) {
            $localStorage.labExamSetting[userId] = {
                name: 'duration',
                value: {
                    startTime: new Date(moment().add(-7, 'day')),
                    endTime: new Date()
                }
            };
        }

        return $localStorage.labExamSetting[userId];
    }
    function setPreviousQueryConditionByUserId(userId, condition) {
        $localStorage.labExamSetting[userId] = condition;
    }

    function getLastAccessTime() {
        return lastAccessTime;
    }

    let lastAccessTime2 = new Date();
    let lastAllRecords2 = [];
    let lastAllPatientId2 = '';
    let lastEpoStartDay = '';
    let lastEpoEndDay = '';

    // get EPOExecution
    function getByEPOExecution(id, startDate, endDate) {
        const deferred = $q.defer();

        if (lastAllPatientId2 === id && lastEpoStartDay === startDate && lastEpoEndDay === endDate
            && moment(lastAccessTime2).add(5, 'm') > moment()) {
            const res = {};
            res.data = lastAllRecords2;
            deferred.resolve(res);
            return deferred.promise;
        }

        // 如果 id 不相同者, 則先換掉, 以免下次進來時 id 還在前一筆
        lastAllPatientId2 = id;
        lastEpoStartDay = startDate;
        lastEpoEndDay = endDate;

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/EPOExecution/patient/${id}/executedDate/${startDate}/${endDate}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime2 = Date.now();
                lastAllRecords2 = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 依 Labexam Id 取得資料
    function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/labExam/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    //依病人代碼及檢驗名稱取得依日期最近的檢驗值
    function getByPatientIdAndNameAndLessDate(patientId,labName){
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/LabExam/patient/${patientId}/labName/${labName}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/labExam`
        }).then((res) => {
            lastAllRecords.push(res.data);
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('labexam-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 多筆新增
    function multiPost(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/labExam/multi`
        }).then((res) => {
            for (let d of res.data) {
                lastAllRecords.push(d);
            }
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('labexam-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/labExam`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastAllRecords) {
                for (let i = 0; i < lastAllRecords.length; i++) {
                    if (lastAllRecords[i].Id === postData.Id) {
                        lastAllRecords[i] = postData;
                    }
                }
            }
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('labexam-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 單筆匯入
    function importsingle(postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/LabExam/importsingle`
        }).then((res) => {
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('labexam-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 刪除
    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/labExam/${id}`
        }).then((res) => {

            for (let i = 0; i < lastAllRecords.length; i += 1) {
                if (lastAllRecords[i].Id === id) {
                    lastAllRecords[i].Status = 'Deleted';
                    break;
                }
            }
            deferred.resolve(res);
            // 通知summary更新顯示資料
            $rootScope.$broadcast('labexam-dataChanged');
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    return rest;
}

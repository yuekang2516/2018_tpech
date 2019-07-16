import lastDialysisHeader from '../fakeData/dialysis/ApiDialysisheaderGetLastByPatientIdAndHeaderIdByPatientidHeaderIdByHeaderidGet.fake.json';
import getLastByIdGet from '../fakeData/dialysis/ApiDialysisrecordGetLastByIdGet.fake.json';
import dialysisHeader from '../fakeData/dialysis/ApiDialysisrecordGetByDialysisIdByPatientIdByDialysisIdGet.fake.json';
import dialysisheaderPatientByIdByPageGet from '../fakeData/dialysis/ApiDialysisheaderPatientByIdByPageGet.fake.json';


angular.module('app').factory('dialysisService', dialysisService);

dialysisService.$inject = ['$http', '$q', '$rootScope', 'SettingService', 'PatientService'];
function dialysisService($http, $q, $rootScope, SettingService, PatientService) {
    const rest = {
        getByIdPage,
        getByDuration,
        get,
        getLast,
        getLastHeaderId,
        getByHeaderId,
        getByIndex,
        getById,
        getByIdForSummary,
        getByDate,
        del,
        post,
        getCreateCheck,
        getLastAccessTime,
        getByHospitalDate,
        getDialysisDataByDialysisId,
        getDataCountByDate,
        getCreatedTimeByHeaderId,
        getRecordDates,
        getLastByPatientAndHeaderId
        // getIsDirty
    };
    const serverApiUrl = SettingService.getServerUrl();
    // 用戶
    const user = SettingService.getCurrentUser();

    // 記住上一筆洗腎表, 如果 id 一樣, 則立即回傳
    let lastDialysisRecord = {};

    function getById(id) {
        const deferred = $q.defer();

        if (lastDialysisRecord && lastDialysisRecord.Id == id) {
            let res = {};
            res.data = lastDialysisRecord;
            deferred.resolve(res);
            return deferred.promise;
        }
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisheader/' + id
        }).then((res) => {
            lastDialysisRecord = res.data;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }
    
    function getByIdForSummary(patientId, Id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisrecord/getByDialysisId/' + patientId + '/' + Id + '/summary'
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依表單id取得所有透析機資料(包含連續型的)
    function getDialysisDataByDialysisId(dialysisId) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisdata/' + dialysisId + '/count'
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 做一個物件暫存該病人的所有表頭
    let patientRecords = {
        patientId: '',
        data: []
    };
    // 歷次列表中若有異動，需標記為 true，供回去 summary 後判斷是否要重撈 (因為從列表回去 summary 不會重跑 onInit);
    // summary content router 改為 query string 後，重新回到 summary 會跑 onInit，於 onInit 中就會重撈資料，因此不須再利用 isDirty 做判斷

    // let isDirty = false;

    // function getIsDirty() {
    //     return isDirty;
    // }

    // 依 DialysisHeader.PatientId 及頁碼取得多筆 DialysisHeader 資料  api : api/dialysisheader/patient/{病人代碼}/{頁碼}
    // 歷次列表已做成長資料，因此 service 端不須作暫存(patientRecords)
    function getByIdPage(patientId, page, limit) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred);
        // }
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/patient/${patientId}/${page}?limit=${limit}`
        }).then((res) => {
            // 若暫存檔裡已有資料且 patient Id 未改變，暫存檔需與新的資料合併
            // patientRecords.patientId = patientId;
            // patientRecords.data = res.data.Results;
            // isDirty = false;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 取得 headerId 及時間次數
    function getByDuration(patientId, startDate, endDate) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/patient/${patientId}/openDate/${startDate}/${endDate}/ids`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getByDate(patientId, startDate, endDate) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/patient/${patientId}/openDate/${startDate}/${endDate}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // get number of records in a period of time(default 2 years)
    function getRecordDates(patientId, startDate, endDate) {
        const deferred = $q.defer();
        let years = [];
        let datePeriod = [];

        getDataCountByDate(patientId, startDate, endDate).then((res) => {
            let newData = res.data.reverse().map((d) => {
                d.Month = d.Month.toString();
                d.Year = d.Year.toString();
                if (d.Month < 10 && d.Month !== 0) {
                    d.Month = "0" + d.Month.toString();
                }
                return d;
            });

            while (newData.length) {
                // debugger;
                let count = 0;
                let i = 0;
                let tempObj = {};

                while (i < 2) {
                    let tempData = newData.shift();
                    if (i === 0) {
                        count += tempData.Count;
                        tempObj.endYear =
                            tempData.Year +
                            "-" +
                            tempData.Month +
                            "-" +
                            moment(tempData.Year + "-" + tempData.Month).daysInMonth();
                    } else {
                        count += tempData.Count;
                        tempObj.startYear =
                            tempData.Year + "-" + tempData.Month + "-01";

                        // filterYear 前端篩選用
                        // startYear != endYear
                        let startYear = tempObj.startYear.split('-')[0];
                        let endYear = tempObj.endYear.split('-')[0];
                        if (startYear !== endYear) {
                            tempObj.filterYear = startYear + '-' + endYear;
                        } else {
                            tempObj.filterYear = startYear;
                        }
                    }
                    i++;
                }
                // push the data to the array only if count is > 0
                tempObj.count = count;
                if (tempObj.count > 0) {
                    years.push(tempObj.filterYear);
                    datePeriod.push(tempObj);
                }
            }

            years = _.uniq(years);

            let data = {
                years,
                datePeriod
            };
            deferred.resolve(data);
        }, (err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    // 依病人代碼及開表時間區間，取得月筆數
    function getDataCountByDate(patientId, startDate, endDate) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/patient/${patientId}/openDate/${startDate}/${endDate}/month`
        }).then((res) => {
            deferred.resolve(res);
        }, (err) => {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function get(patientId, isForce = true) {
        const deferred = $q.defer();

        if (patientRecords.patientId === patientId && moment(lastAccessTime).add(5, 'm') > moment() && !isForce) {
            let res = {};
            res.data = patientRecords.data;
            // isDirty = false;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/bypatientid/${patientId}`
        }).then((res) => {
            lastAccessTime = Date.now();
            patientRecords.patientId = patientId;
            patientRecords.data = res.data;
            // isDirty = false;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 取得最後取得資料的時間
    let lastAccessTime = new Date();
    function getLastAccessTime() {
        return lastAccessTime;
    }


    // 將病人ID及其次數的表單先記下來
    let cacheRecordsByIndex = {
        patientId: null,
        lastIndex: -1,
        data: {}
    };
    function getLast(patientId, isForce) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(getLastByIdGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(getLastByIdGet, deferred);
        // }

        // 還須確認暫存裡是否有這筆資料
        if (cacheRecordsByIndex.patientId === patientId && cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()] && moment(cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()].lastAccessTime).add(5, 'm') > moment() && !isForce) {
            let res = {};
            res.data = cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()];
            deferred.resolve(res);
            return deferred.promise;
        }

        // 若 isForce 為 true，表示資料須重新從server撈，須將暫存陣列裡的資料清空，以確保所有資料為最新狀態
        if (isForce) {
            cacheRecordsByIndex.data = {};
        }


        console.log('從伺服器抓最後一筆');
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisrecord/getlast/' + patientId
        })
            .then((res) => {
                lastAccessTime = Date.now();
                // 如果回傳 count 為0, 則直接告訴前端沒有資料
                if (!res.data.Count) {
                    deferred.resolve({ data: null });
                    return deferred.promise;
                }

                if (cacheRecordsByIndex.patientId !== patientId) {
                    cacheRecordsByIndex.patientId = patientId;
                    cacheRecordsByIndex.data = {};
                }

                // 存開表時間，供透析機資料判斷
                createdTimeSet[res.data.DialysisHeader.Id] = moment(res.data.DialysisHeader.CreatedTime);
                cacheRecordsByIndex.lastIndex = res.data.Count;
                console.log('將最後一筆存入');
                cacheRecordsByIndex.data[res.data.Index.toString()] = res.data;
                cacheRecordsByIndex.data[res.data.Index.toString()].lastAccessTime = new Date();
                deferred.resolve(res);
            }, (res) => {
                console.error(res);
                deferred.reject(res);
            });

        return deferred.promise;
    }

    function getLastHeaderId(patientId, isForce) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync('5c9080ae20c32b17a4c56a3a', deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync('5c9080ae20c32b17a4c56a3a', deferred);
        // }

        // 還須確認暫存裡是否有這筆資料
        if (cacheRecordsByIndex.patientId === patientId && cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()] && moment(cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()].lastAccessTime).add(5, 'm') > moment() && !isForce) {
            let res = {};
            
            // 只需回傳 headerId 即可
            res.data = cacheRecordsByIndex.data[cacheRecordsByIndex.lastIndex.toString()].DialysisHeader.Id;
            deferred.resolve(res);
            return deferred.promise;
        }

        // 若 isForce 為 true，表示資料須重新從server撈，須將暫存陣列裡的資料清空，以確保所有資料為最新狀態
        if (isForce) {
            cacheRecordsByIndex.data = {};
        }


        console.log('從伺服器抓最後一筆');
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisheader/getlastidbypatientid/' + patientId
        })
            .then((res) => {
                // TODO 如果病人尚無任何表單 -> API 404
                // if (!res.data.Count) {
                //     deferred.resolve({ data: null });
                //     return deferred.promise;
                // }
                deferred.resolve(res);
            }, (res) => {
                console.error(res);
                deferred.reject(res);
            });

        return deferred.promise;
    }

    function getByHeaderId(patientId, headerId, isForce) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisHeader, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisHeader, deferred);
        // }

        // 先確認暫存有無資料
        let cacheRecord = null;
        let cacheDataKeys = Object.keys(cacheRecordsByIndex.data);
        for (let i = 0; i < cacheDataKeys.length; i++) {
            if (cacheRecordsByIndex.data[cacheDataKeys[i]].DialysisHeader.Id === headerId) {
                cacheRecord = cacheRecordsByIndex.data[cacheDataKeys[i]];
                break;
            }
        }

        if (cacheRecordsByIndex.patientId === patientId && cacheRecord && moment(cacheRecord.lastAccessTime).add(5, 'm') > moment() && !isForce) {
            // debugger;
            console.log('找到第幾筆, 直接回傳 -> ' + headerId);
            deferred.resolve({ data: cacheRecord });
            return deferred.promise;
        }

        // 若 isForce 為 true，表示資料須重新從server撈，須將暫存陣列裡的資料清空，以確保所有資料為最新狀態
        if (isForce) {
            cacheRecordsByIndex.data = {};
        }
        // api/dialysisrecord/getByDialysisId/{patientId}/{dialysisId}
        // 如果沒找到, 則存入 records 物件暫存
        console.log('從伺服器抓第幾張筆中 -> ' + headerId);
        // TODO 需多處理找不到表單的錯誤
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisrecord/getByDialysisId/' + patientId + '/' + headerId
        }).then((res) => {
            lastAccessTime = Date.now();

            // 若為刪除完馬上取的話，仍會回傳值，需多判斷 header 的 status 是否為 deleted
            if (res.data.DialysisHeader && res.data.DialysisHeader.Status === 'Deleted') {
                deferred.reject({ data: null, status: 400 });
                return;
            }
            // 存開表時間，供透析機資料判斷
            createdTimeSet[res.data.DialysisHeader.Id] = moment(res.data.DialysisHeader.CreatedTime);
            if (cacheRecordsByIndex.patientId !== patientId) {
                cacheRecordsByIndex.patientId = patientId;
                cacheRecordsByIndex.data = {};
            }

            // 先確認 Count ，若為零表示該病人無表單
            if (!res.data.Count) {
                cacheRecordsByIndex.data = {};
                deferred.resolve({ data: null });
                return;
            }

            // 為了避免使用者手動輸入網址，造成 array 增加 => 若 index 小於等於 count 才作存入的動作
            // 存入暫存
            cacheRecordsByIndex.data[res.data.Index.toString()] = res.data;
            cacheRecordsByIndex.lastIndex = res.data.Count;
            // insert last access time when it's first loaded
            cacheRecordsByIndex.data[res.data.Index.toString()].lastAccessTime = new Date();
            console.log('將第幾張存入 data object -> ', res.data.Index, cacheRecordsByIndex.data);
            console.info(cacheRecordsByIndex);
            deferred.resolve(res);
        }, (res) => {
            console.error(res);
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 給透析機資料判斷是否為今日表單用
    // 由於都是從表單進入，一定會 load 到該表單的資料，且開表時間不會變，因此於service 存開表時間
    let createdTimeSet = {};
    function getCreatedTimeByHeaderId(patientId, headerId) {
        const deferred = $q.defer();

        // 若沒取過(重新整理)則再從 server 撈
        if (!createdTimeSet[headerId]) {
            getByHeaderId(patientId, headerId).then((res) => {
                deferred.resolve(createdTimeSet[headerId]);
            }, () => {
                deferred.reject();
            });

            return deferred.promise;
        }
        console.log('createdTimeSet', createdTimeSet);
        deferred.resolve(createdTimeSet[headerId]);
        return deferred.promise;
    }

    function getByIndex(patientId, index, isForce) {
        const deferred = $q.defer();
        // 須確認暫存裡是否有這筆資料，找到了則直接回傳
        // if (cacheRecordsByIndex.patientId === patientId && cacheRecordsByIndex.data[index.toString()] && moment(cacheRecordsByIndex.data[index.toString()].lastAccessTime).add(5, 'm') > moment() && !isForce) {
        //     // debugger;
        //     // TODO 還需確認 Id 是否相同，因為有可能其他裝置已刪除某幾筆表單，造成 index 已位移
        //     console.log('找到第幾筆, 直接回傳 -> ' + index);
        //     let res = {};
        //     res.data = cacheRecordsByIndex.data[index.toString()];
        //     console.log('res.data', res.data);
        //     deferred.resolve(res);
        //     return deferred.promise;
        // }

        // // 若 isForce 為 true，表示資料須重新從server撈，須將暫存陣列裡的資料清空，以確保所有資料為最新狀態
        // if (isForce) {
        //     cacheRecordsByIndex.data = {};
        // }

        // 如果沒找到, 則存入 records 物件暫存
        console.log('從伺服器抓第幾張筆中 -> ' + index);
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisrecord/getbyindex/' + patientId + '/' + index
        }).then((res) => {
            lastAccessTime = Date.now();

            // 若本次病患跟上次不同暫存須清空
            // if (cacheRecordsByIndex.patientId !== patientId) {
            //     cacheRecordsByIndex.patientId = patientId;
            //     cacheRecordsByIndex.data = {};
            //     // records.lastIndex = res.data.Count;
            // }

            // 先確認 Count ，若為零表示該病患無表單
            // if (!res.data.Count) {
            //     cacheRecordsByIndex.data = {};
            //     deferred.resolve({ data: null });
            //     return;
            // }

            // // 存開表時間，供透析機資料判斷
            // createdTimeSet[res.data.DialysisHeader.Id] = moment(res.data.DialysisHeader.CreatedTime);

            // 存入暫存
            // cacheRecordsByIndex.data[index.toString()] = res.data;
            // // insert last access time when it's first loaded
            // cacheRecordsByIndex.data[index.toString()].lastAccessTime = new Date();
            // console.log('將第幾張存入 data object -> ', index, cacheRecordsByIndex.data);
            deferred.resolve(res);
        }, (res) => {
            console.error(res);
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/delete/${id}`
        }).then((res) => {
            // 刪除後，index 會位移，需把暫存清空
            cacheRecordsByIndex.data = {};
            // isDirty = true;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    function post(id) {
        const deferred = $q.defer();

        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred);
        // }
        $http({
            method: 'POST',
            data: id,
            url: SettingService.getServerUrl() + '/api/dialysisheader/' + id + '?userId=' + SettingService.getCurrentUser().Id + '&userName=' + SettingService.getCurrentUser().Name
        }).then((res) => {
            // 由於新增一筆，index 會位移，需把暫存清空
            cacheRecordsByIndex.data = {};
            // isDirty = true;
            deferred.resolve(res);
            $rootScope.$broadcast('changeHeaderId', 'same');
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getCreateCheck(id) {
        console.log(id);
        const deferred = $q.defer();
        
        // demo
        // if (SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(dialysisheaderPatientByIdByPageGet, deferred);
        // }
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/dialysisheader/createcheck/' + id
        }).then((res) => {
            PatientService.setDirty();
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    function getByHospitalDate(hid, sdate, edate) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/hospital/${hid}/openDate/${sdate}/${edate}`

        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }


    // 取得上一筆透析資料
    function getLastByPatientAndHeaderId(patientId, headerId) {
        const deferred = $q.defer();

        // if (SettingService.checkDemoModeAndGetDataAsync(lastDialysisHeader, deferred)) {
        //     return SettingService.checkDemoModeAndGetDataAsync(lastDialysisHeader, deferred);
        // }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/dialysisheader/GetLastByPatientIdAndHeaderId/${patientId}/HeaderId/${headerId}`

        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return rest;
}

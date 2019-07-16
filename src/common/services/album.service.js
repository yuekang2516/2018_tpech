angular.module('app').factory('AlbumService', AlbumService);

AlbumService.$inject = ['$http', '$q', '$rootScope', 'SettingService'];

function AlbumService($http, $q, $rootScope, SettingService) {
    const rest = {
        getByPatientId,
        getTrashByPatientId,
        getById,
        post,
        put,
        updateStatus,
        getLastAccessTime,
        photoData,
        getAlbumByPatientId,
        getAlbumById,
        getPhotoByAlbumId,
        delAlbum,
        getAlbumList
    };
    const serverApiUrl = SettingService.getServerUrl();

    // 記錄前次呼叫 api 時的 id 及 array
    // 可用於下次再呼叫時, 如果 id 相同, arrray 有資料時, 立即回傳
    // 可提升使用者體驗

    // 相片排序
    let lastRecords = [];
    // 相簿四格
    let lastAlburmRecords = [];
    let lastAccessTime = new Date();
    // 垃圾桶
    let lastGarbageRecords = [];
    let getphtoByAlbumRecords = [];

    let patientId = '';

    // 依病人代碼及頁碼取得照片
    function getByPatientId(id, page, limit, isForce) {
        const deferred = $q.defer();

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            console.log('clear');
            lastRecords = [];
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Photo/patient/${id}/${page}?limit=${limit}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();

                if (lastRecords && patientId === id) {
                    lastRecords = lastRecords.concat(res.data.Results);
                    res.data.Results = lastRecords;
                } else {
                    lastRecords = res.data.Results;
                    patientId = id;
                }
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依病人代碼及頁碼取得已刪除的相片
    function getTrashByPatientId(id, page, limit, isForce) {
        const deferred = $q.defer();

        // 強迫重新整理，清空暫存陣列
        if (isForce) {
            console.log('clear');
            lastGarbageRecords = [];
        }

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Photo/patient/${id}/trash/${page}?limit=${limit}`
        }).then((res) => {
            if (res.data) {
                lastAccessTime = Date.now();

                if (lastGarbageRecords && patientId === id) {
                    lastGarbageRecords = lastGarbageRecords.concat(res.data.Results);
                    res.data.Results = lastGarbageRecords;
                } else {
                    lastGarbageRecords = res.data.Results;
                    patientId = id;
                }
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依 Photo.Id 取得單筆 Photo 資料
    function getById(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Photo/${id}`
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

    function photoData() {
        return lastRecords;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/Photo`
        }).then((res) => {
            if (lastAlburmRecords.length > 0 && typeof lastAlburmRecords[0].Files !== 'undefined') {
                // 這裡會找到一本相簿
                let record = lastAlburmRecords.filter(x => x.AlbumName === res.data.AlbumName && x.Id === res.data.AlbumId)[0];

                if (record) {
                    record.PhotoCount += 1;
                    record.Files.push(res.data.ThumbnailFileName);
                }

            }
            lastRecords.push(res.data);

            deferred.resolve(res);
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
            url: `${SettingService.getServerUrl()}/api/Photo`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastRecords) {
                for (let i = 0; i < lastRecords.length; i++) {
                    // 相簿
                    if (lastRecords[i].Id === postData.Id) {
                        lastRecords[i] = postData;
                    }
                }
            }

            if (lastAlburmRecords) {
                for (let i = 0; i < lastAlburmRecords.length; i++) {
                    if (typeof lastAlburmRecords[i].Files !== 'undefined' && lastAlburmRecords[i].Id === postData.AlbumId) {
                        lastAlburmRecords[i].Files.push(postData.ThumbnailFileName);
                    }
                }
            }

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 刪除或復原相片
    function updateStatus(status, postData) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/Photo/updateStatus/${status}/multi`,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            for (let i = 0; i < lastRecords.length; i += 1) {
                let index = res.data.findIndex(x => x.Id === lastRecords[i].Id);

                if (index > -1) {
                    lastRecords[i].Status = status;
                }
            }

            for (let i = 0; i < lastAlburmRecords.length; i += 1) {
                let index = res.data.findIndex(x => x.Id === lastAlburmRecords[i].Id);

                if (index > -1) {
                    lastAlburmRecords[i].Files = [];
                    lastAlburmRecords[i].Status = status;
                }
            }

            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }


    // 依 patient.Id 取得多筆 Album 資料
    function getAlbumByPatientId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Album/patient/${id}`
        }).then((res) => {
            if (res.data) {
                res.data = res.data.filter(x => x.Status === 'Normal');
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依 相簿代碼取得相片資訊，有數量
    function getAlbumById(id, number = 4) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Photo/Album/${id}/lastnumber/${number}`
        }).then((res) => {
            // 重依日期分業切換到依相本分頁 id 不同，這裡的ID是相簿ID
            if (getphtoByAlbumRecords) {
                getphtoByAlbumRecords = getphtoByAlbumRecords.concat(res.data);
                res.data = getphtoByAlbumRecords;
            } else {
                getphtoByAlbumRecords = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 依 相簿代碼取得相片資訊，全部
    function getPhotoByAlbumId(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Photo/Album/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 刪除相簿 '多選' Type ['121313', '32132132']
    function delAlbum(postData) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            data: postData,
            url: `${SettingService.getServerUrl()}/api/Album/`,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            for (let i = 0; i < lastAlburmRecords.length; i += 1) {
                let index = res.data.findIndex(x => x.Id === lastAlburmRecords[i].Id);

                if (index > -1) {
                    lastAlburmRecords[i].Files = [];
                    lastAlburmRecords[i].Status = 'Deleted';
                }
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    }

    // 相簿四格 reading
    function getAlbumList(id, number = 4, isForce) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/Album/list/patient/${id}/lastThumbnailPhotoNumber/${number}`
        }).then((res) => {
            // 強迫重新整理，清空暫存陣列
            if (isForce) {
                console.log('clear');
                lastAlburmRecords = [];
            }
            if (res.data) {
                lastAccessTime = Date.now();

                if (lastAlburmRecords && patientId === id) {
                    lastAlburmRecords = lastAlburmRecords.concat(res.data);
                    res.data = lastAlburmRecords.filter(x => x.Status === 'Normal');
                } else {
                    lastAlburmRecords = res.data.filter(x => x.Status === 'Normal');
                    res.data = lastAlburmRecords.filter(x => x.Status === 'Normal');
                    patientId = id;
                }
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;

    }

    return rest;
}

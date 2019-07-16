angular.module('app').factory('hygieneWorkService', hygieneWorkService);

hygieneWorkService.$inject = ['SettingService', '$http', '$q'];
function hygieneWorkService(SettingService, $http, $q) {
    const rest = {};
    // const serverApiUrl = SettingService.getServerUrl();

    // 所有資料
    rest.getAllFilesFolders = function getAllFilesFolders() {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/HealthEducation/all`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得資料夾子層級資料
    rest.getInFolderFiles = function getInFolderFiles(parentId) {
        let urlpath = '';
        if (parentId === '') {
            urlpath = `${SettingService.getServerUrl()}/api/HealthEducation/parentId`;
        } else {
            urlpath = `${SettingService.getServerUrl()}/api/HealthEducation/parentId?id=${parentId}`;
        }
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: urlpath
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 取得單一檔案
    rest.getSingle = function getSingle(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/HealthEducation/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 新增
    rest.post = function post(d) {
        const deferred = $q.defer();
        $http({
            method: 'POST',
            data: d,
            url: `${SettingService.getServerUrl()}/api/HealthEducation`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 修改
    rest.put = function put(d) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: d,
            url: `${SettingService.getServerUrl()}/api/HealthEducation`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 刪除
    rest.delete = function del(id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/HealthEducation/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 上傳
    rest.uploadFiles = function uploadFiles(f) {

        let myFormData = new FormData();
        myFormData.append('files', f);

        const deferred = $q.defer();

        $http({
            method: 'POST',
            data: myFormData,
            // url: `http://172.30.1.101:8897/Upload/UploadFiles`,
            url: `${SettingService.getServerUrl()}/Upload/UploadFiles`,
            transformRequest: angular.identity, // see the angugular js documentation
            headers: { 'Content-Type' : undefined }// setting content type to undefined that change the default content type of the angular js
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // // 下載
    // rest.downFiles = function downFiles(id, filename, type) {
    //     const deferred = $q.defer();
    //     $http({
    //         method: 'GET',
    //         // url: `http://172.30.1.101:8897/Upload/UploadFiles`,
    //         url: `${SettingService.getServerUrl()}/Upload/down/${id}?fileName=${filename}&fileType=${type}`
    //     }).then((res) => {
    //         deferred.resolve(res);
    //     }, (res) => {
    //         deferred.reject(res);
    //     });
    //     return deferred.promise;
    // };

    return rest;
}

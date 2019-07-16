angular.module('app').factory('adminFileService', adminFileService);

adminFileService.$inject = ['SettingService', '$http', '$q'];
function adminFileService(SettingService, $http, $q) {
    const rest = {};

    // 所有資料
    rest.getAllFiles = function getAllFiles() {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo/all`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 依類別取得資料
    rest.getFilesByClass = function getFilesByClass(fileClass) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo/all/${fileClass}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 取得單一檔案 getSingle
    rest.getOneFile = function getOneFile(id) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo/GetFile/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 修改
    // 根據傳入的檔案id，修改多個檔案類別
    rest.put = function put(fileObj, fileClass) {
        const deferred = $q.defer();
        $http({
            method: 'PUT',
            data: fileObj,
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo?fileClass=${fileClass}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 刪除
    rest.delete = function (id) {
        const deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    // 上傳
    rest.uploadFiles = function uploadFiles(f, fileClass) {

        // https://openhome.cc/Gossip/ECMAScript/FormData.html
        let myFormData = new FormData();
        myFormData.append('files', f);  // 需與 server 端接的名字要一樣 ('files')

        const deferred = $q.defer();

        $http({
            method: 'POST',
            data: myFormData,
            // url: `http://172.30.1.101:8897/Upload/UploadFiles`,
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo?fileClass=${fileClass}`,
            transformRequest: angular.identity, // see the angugular js documentation
            headers: { 'Content-Type' : undefined }// setting content type to undefined that change the default content type of the angular js
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    };

    // 下載
    rest.downFiles = function downFiles(id, filename, type) {
        const deferred = $q.defer();
        $http({
            method: 'GET',
            // url: `${SettingService.getServerUrl()}/UploadFilesInfo/down/${id}?fileName=${filename}&fileType=${type}`
            url: `${SettingService.getServerUrl()}/api/UploadFilesInfo/down/${id}`
        }).then((res) => {
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    return rest;
}

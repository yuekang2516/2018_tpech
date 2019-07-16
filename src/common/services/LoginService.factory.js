angular
    .module('app')
    .factory('LoginService', LoginService);

LoginService.$inject = ['$q', '$http', '$state', 'SettingService', '$cookies', '$filter'];

function LoginService($q, $http, $state, SettingService, $cookies, $filter) {

    const status = {
        isLogin,
        login,
        loginByRfid,
        logout,
        centerlogin,
        centerlogout,
        isCenterLogin,
        contactUs,
        allowStoragePermission,
        httpStatusMessage
    };

    let $translate = $filter('translate');

    // storage permission
    function allowStoragePermission() {
        let permissions = cordova.plugins.permissions;
        const deferred = $q.defer();

        permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, (success) => {
            console.log('permissions.WRITE_EXTERNAL_STORAGE enabled');
            deferred.resolve(success);
        }, (error) => {
            console.log('permissions.WRITE_EXTERNAL_STORAGE error ');
            deferred.reject(error);
        });
        return deferred.promise;
    }

    // contact us. Cloud login page
    function contactUs(postData) {
        const deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${SettingService.getServerUrl()}/api/Auth/contactUs`,
            data: postData
        }).then((res) => {
            deferred.resolve(res);
        }, (err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    // Login Status
    function isLogin() {
        let result = false;
        const now = new Date();
        const Expire = new Date(SettingService.getLoginExpireTime());

        if ((Expire - now) > 0 && SettingService.getCurrentUser()) {
            result = true;
        }

        return result;
    }

    // Login
    function login(acc, pwd) {
        const deferred = $q.defer();

        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/auth/login?account=' + encodeURIComponent(acc) + '&password=' + encodeURIComponent(pwd),
            timeout: 10000  // 大家覺得 5s 太短，Andy 說改成 10s
        })
            .then((res) => {
                // 沒有提示訊息，表示為合法的使用者，才做下列事情
                if (res.data.Result) {
                    SettingService.setLoginExpireTime();
                    SettingService.setCurrentUser(res.data.UserInfo);
                    SettingService.setCurrentHospital(res.data.HospitalInfo);
                    SettingService.setHospitalSettings(res.data.HospitalSettings);
                }
                deferred.resolve(res);
            }, (res) => {
                console.error(res, 'login failed');
                deferred.reject(httpStatusMessage(res.status));
            });

        return deferred.promise;
    }

    function loginByRfid(rfid) {
        // 進入 function 後再讀取 server url
        // 以免 android user, 改了伺服器位置後, 在登入畫面會使用舊的 url
        const serverApiUrl = SettingService.getServerUrl();
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/auth/login/rfid/' + rfid
        })
            .then((res) => {
                if (res.data.Result) {
                    SettingService.setLoginExpireTime();
                    SettingService.setCurrentUser(res.data.UserInfo);
                    SettingService.setCurrentHospital(res.data.HospitalInfo);
                    SettingService.setHospitalSettings(res.data.HospitalSettings);
                }
                deferred.resolve(res);
            }, (res) => {
                deferred.reject(httpStatusMessage(res.status));
            });

        return deferred.promise;
    }

    // Logout
    function logout() {
        $cookies.remove('user_id');
        $cookies.remove('user');
        SettingService.setLoginExpireTime(new Date());
        $state.go('login');
    }

    // centerLogin
    function centerlogin(acc, pwd) {
        const serverApiUrl = SettingService.getServerUrl();
        const deferred = $q.defer();
        $http({
            method: 'GET',
            url: SettingService.getServerUrl() + '/api/auth/center/login?account=' + encodeURIComponent(acc) + '&password=' + encodeURIComponent(pwd)
        })
            .then((res) => {
                SettingService.setCenterLoginExpireTime();
                const now = new Date();
                const Expire = new Date(SettingService.getCenterLoginExpireTime());
                console.log(Expire);
                SettingService.setCenterUser(res.data.UserInfo);
                // SettingService.setCurrentHospital(res.data.HospitalInfo);
                // SettingService.setHospitalSettings(res.data.HospitalSettings);
                deferred.resolve(res);
            }, (res) => {
                console.error(res, 'login failed');
                deferred.reject(res);
            });

        return deferred.promise;
    }

    // centerLogout
    function centerlogout() {
        $cookies.remove('centeruser');
        SettingService.setCenterLoginExpireTime(new Date());
        $state.go('login');
    }

    // Login Status
    function isCenterLogin() {
        let result = false;
        const now = new Date();
        const Expire = new Date(SettingService.getCenterLoginExpireTime());
        if ((Expire - now) > 0 && SettingService.getCenterUser()) {
            result = true;
        }
        return result;
    }

    // 依照http status 顯示 message
    function httpStatusMessage(httpStatus) {
        let msg = '';
        // 根據 res.status 顯示錯誤訊息
        if (httpStatus === -1) {
            msg = $translate('login.component.serverNotFound');
        } else if (httpStatus >= 400 && httpStatus < 500) {
            // msg = '找不到網頁(' + res.status + '),請重開伺服器';
            msg = $translate('login.component.pageNotFound', { status: httpStatus });
        } else if (httpStatus >= 500) {
            // msg = '伺服器有問題(http ' + res.status + '), 請重開伺服器';
            msg = $translate('login.component.serverError', { status: httpStatus });
        }
        return msg;
    }

    return status;
}

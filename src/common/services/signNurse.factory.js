angular.module('app').factory('signNurseService', signNurseService);

signNurseService.$inject = ['SettingService', '$http', '$q', 'userService'];
function signNurseService(SettingService, $http, $q, userService) {
    const rest = {};


    // 核對簽章 - 網頁版
    // 取得所有使用者(filter : role 護理師nurse / Access 未停用者) / 登入者不可為核對者
    rest.getNurses = function getNurses(isFilterLoginPerson = true) {
        const deffered = $q.defer();
        let signRole = 'nurse';
        userService.get().then((q) => {
            console.log('取得所有使用者 護理師 q', q);
            let nursesList = [];
            nursesList = _.filter(q.data, function (o) {
                if (isFilterLoginPerson) {
                    // return o.Role === signRole && o.Access !== '0' && o.Id !== SettingService.getCurrentUser().Id;
                    // 2019/2/21 拿掉 o.Id !== SettingService.getCurrentUser().Id
                    return o.Role === signRole && o.Access !== '0';
                }
                return o.Role === signRole && o.Access !== '0';
            });
            // 不簽章用
            nursesList.unshift({ Name: 'NoSign', Id: '' });
            // nursesList[0] = { Name: 'NoSign', Id: '' };
            deffered.resolve(nursesList);
        }, (err) => {
            deffered.reject(err);
        });
        return deffered.promise;
    };


  return rest;
}

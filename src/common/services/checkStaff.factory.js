angular.module('app').factory('checkStaffService', checkStaffService);

checkStaffService.$inject = ['SettingService', '$http', '$q', 'userService'];

// new version 共用 component 使用
function checkStaffService(SettingService, $http, $q, userService) {
    const rest = {};

    // 核對簽章 - 網頁版
    // 取得所有使用者(filter : role 護理師nurse / Access 未停用者) / 登入者不可為核對者
    rest.getNurseStaff = function getNurseStaff() {
        const deffered = $q.defer();
        // 角色為護理師
        let signRole = 'nurse';
        userService.get().then((q) => {
            console.log('取得所有使用者 護理師 q', q);
            let nursesList = [];
            if (q.data && q.data.length > 0) {
                nursesList = _.filter(q.data, function (o) {
                    // return o.Role === 'nurse' && o.Id !== SettingService.getCurrentUser().Id;
                    return o.Role === signRole && o.Access !== 0; // 停用者要過濾掉
                });
                // 不簽章用
                nursesList.unshift({ Name: 'NoSign', Id: '' });
                // nursesList[0] = { Name: 'NoSign', Id: '' };
                // 如果登入者有在清單中，移到第一個位子
                // 先移除再加到第一個，currentUser即是移除的那個
                let currentUser = _.remove(nursesList, (o) => {
                    return o.Id === SettingService.getCurrentUser().Id;
                });
                // console.log('護士清單 登入者', currentUser);
                if (currentUser.length > 0) {
                    // console.log('護士清單 登入者 nursesList', nursesList);
                    // 登入者在清單中，加到第一個位子
                    nursesList.unshift(currentUser[0]);
                }
            }
            deffered.resolve(nursesList);
        }, (err) => {
            deffered.reject(err);
        });
        return deffered.promise;
    };


  return rest;
}

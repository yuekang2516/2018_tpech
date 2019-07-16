import tpl from './log.html';
import dtpl from './logDetail.html';

angular.module('app').component('log', {
    template: tpl,
    controller: SystemLogCtrl,
    controllerAs: 'vm'
});

SystemLogCtrl.$inject = ['$rootScope', '$mdSidenav', '$timeout', '$mdDialog', '$mdMedia', 'logService', 'showMessage', '$filter'];

function SystemLogCtrl($rootScope, $mdSidenav, $timeout, $mdDialog, $mdMedia, logService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    let timeoutPromise;
    let searchDateTimeStart;
    let searchDateTimeEnd;

    // 初始化資料
    vm.searchStr = '';
    vm.searchDateTime = undefined;
    vm.searchDateTime1 = undefined;
    vm.noData = false;

    // 取得log資料
    vm.loadLogs = function loadLogs() {
        vm.loading = true;
        if (vm.searchDateTime !== undefined) {
            searchDateTimeStart = moment(vm.searchDateTime).format('YYYYMMDD');
        }
        if (vm.searchDateTime1 !== undefined) {
            searchDateTimeEnd = moment(vm.searchDateTime1).format('YYYYMMDD');
        }

        // 呼叫取得log的Service
        logService.get(searchDateTimeStart, searchDateTimeEnd, vm.searchStr, vm.searchStr1, page, limit).then((resp) => {
            // console.log(resp.data[0].TotalCount); // 總筆數
            if (resp.data !== '') {

                maxpage = parseInt(resp.data[0].TotalCount / limit) + 1; // 總頁數
                if (resp.data[0].TotalCount % limit === 0) {
                    maxpage -= 1;
                }
                // console.log(maxpage);
                if (resp.data[0].Log.length > 0) {
                    vm.logs = resp.data[0].Log;
                    vm.noData = false;
                } else {
                    vm.logs = null;
                    vm.noData = true;
                }
            }
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // scroll 至底時呼叫
    vm.loadMore = function loadMore() {
        page += 1;
        if (page > maxpage) {
            return;
        }
        vm.loading = true;
        // 呼叫取得log的Service
        logService.get(searchDateTimeStart, searchDateTimeEnd, vm.searchStr, vm.searchStr1, page, limit).then((resp) => {
            console.log(resp);
            for (let i = 0; i < resp.data[0].Log.length; i++) {
                vm.logs.push(resp.data[0].Log[i]);
            }
            vm.loading = false;
            vm.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            vm.loading = false;
            vm.isError = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // 呼叫log資料細節的dialog視窗
    vm.logDetail = function logDetail(ev, idx) {
        if (vm.logs[idx].Before !== null && vm.logs[idx].After !== null) {
            vm.before = JSON.parse(vm.logs[idx].Before);
            vm.after = JSON.parse(vm.logs[idx].After);

            $mdDialog.show({
                controller: DialogController,
                controllerAs: 'dvm',
                template: dtpl,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: vm.customFullscreen
            });
        }
    };

    // 如果是GET和POST方法就不允許點擊呼叫
    vm.checkMethod = function checkMethod(method) {
        if (method === 'GET' || method === 'POST') {
            return true;
        }

        return false;
    };

    // 搜尋字串有變就重新讀取
    vm.searchStrChange = function searchStrChange() {
        $timeout.cancel(timeoutPromise);
        timeoutPromise = $timeout(() => {
            vm.loading = true;
            page = 1;
            vm.loadLogs();
        }, 1000);
    };

    // 搜尋時間有變就重新讀取
    vm.datetimeChange = function datetimeChange() {
        vm.loading = true;
        page = 1;
        vm.loadLogs();
    };

    // 初始化如果沒有搜尋字串就自動載入
    if (!vm.searchStr || vm.searchStr === '') {
        page = 1;
        vm.loadLogs();
    }

    // vm.images = [1, 2, 3, 4, 5, 6, 7, 8];
    // vm.loadMore = function () {
    //     debugger;
    // let last = vm.images[vm.images.length - 1];
    // for (let i = 1; i <= 8; i++) {
    //  vm.images.push(last + i);
    // }
    // };

    // 以下為處理log細節部分
    vm.created = $translate('log.addlabel'); // '新增'
    vm.updated = $translate('log.updlabel'); // '修改'
    vm.deleted = $translate('log.dellabel'); // '刪除'
    vm.unchanged = $translate('log.unchangelabel'); // '未變動'

    // 判斷兩個數值是否相等
    vm.mapJson = function mapJson(obj1, obj2) {
        const diff = {};

        _.forEach(obj1, (value, key) => {
            if (typeof (obj2[key]) !== 'undefined') {
                diff[key] = vm.convertData(obj1[key], obj2[key]);
            }
        });

        return diff;
    };

    // 在比較是否相等前先判斷是否有時間函數，處理完後再繼續比較值
    vm.convertData = function convertData(value1, value2) {
        if (vm.isValue(value1) || vm.isValue(value2)) {
            // 有時間函數
            if (value1 !== null && value1.toString().startsWith('Date', 1) && value2 !== null && value2.toString().startsWith('Date', 1)) {
                const objTime1 = moment(value1).format('YYYY-MM-DD HH:mm:ss');
                const objTime2 = moment(value2).format('YYYY-MM-DD HH:mm:ss');

                return (typeof objTime1 === 'undefined') ? objTime2 : `${objTime1}(${vm.compareValues(objTime1, objTime2)})`;
            }
            return (typeof value1 === 'undefined') ? value2 : `${value1}(${vm.compareValues(value1, value2)})`;
        }

        return value1;
    };

    // 比較兩個傳進來的值
    vm.compareValues = function compareValues(value1, value2) {
        if (value1 === value2) {
            return vm.unchanged;
        }

        if (typeof (value1) === 'undefined') {
            return vm.created;
        }

        if (typeof (value2) === 'undefined') {
            return vm.deleted;
        }

        return vm.updated;
    };

    vm.isArray = function isArray(obj) {
        return {}.toString.apply(obj) === '[object Array]';
    };

    vm.isObject = function isObject(obj) {
        return {}.toString.apply(obj) === '[object Object]';
    };

    vm.isValue = function isValue(obj) {
        return !vm.isObject(obj) && !vm.isArray(obj);
    };

    // 將資料轉成格式化的字串後回傳
    vm.toString = function toString(obj, ndeep) {
        const self = vm;
        let indent;
        let isArray;

        if (obj == null) {
            return String(obj);
        }

        switch (typeof obj) {
            case 'string':
                if (obj.toString().startsWith('Date', 1)) {
                    return `"${moment(obj).format('YYYY-MM-DD HH:mm:ss')}"`;
                }
                return `"${obj}"`;
            case 'object':
                indent = Array(ndeep || 1).join('\t');
                isArray = Array.isArray(obj);

                return '{['[+isArray] + Object.keys(obj).map((key) => {
                    return '\n\t' + indent + key + ': ' + self.toString(obj[key], (ndeep || 1) + 1);
                }).join(',') + '\n' + indent + '}]'[+isArray];

            default:
                return obj.toString();
        }
    };

    // 呼叫明細對話視窗的controller
    function DialogController() {
        const dvm = this;

        // log 資料處理
        const diff = vm.mapJson(vm.after, vm.before);
        const before = vm.toString(vm.before);
        const after = vm.toString(diff);

        dvm.before = before;

        dvm.after = after;

        dvm.cancel = function cancel() {
            $mdDialog.cancel();
        };
    }

    // Method 翻譯
    vm.showMethod = function showMethod(method) {
        let sMethod = '';
        if (method === 'SENDMAIL') {
            sMethod = $translate('log.sendmail'); // 'SENDMAIL'
        } else if (method === 'GET') {
            sMethod = $translate('log.get'); // 'GET';
        } else if (method === 'POST') {
            sMethod = $translate('log.post'); // 'POST';
        } else if (method === 'PUT') {
            sMethod = $translate('log.put'); // 'PUT';
        } else if (method === 'DELETE') {
            sMethod = $translate('log.delete'); // 'DELETE';
        } else {
            sMethod = method;
        }
        return sMethod;
    };

}

import yearPlanUpdateDialogTpl from './yearPlanUpdateDialog.html';

// 年度計畫
angular
    .module('app')
    .controller('yearPlanDialogController', yearPlanDialogController);

    yearPlanDialogController.$inject = ['$state', '$mdDialog', 'data', '$mdMedia', 'CalendarEventsService', '$stateParams', 'SettingService', 'showMessage'];

function yearPlanDialogController(
    $state,
    $mdDialog,
    data,
    $mdMedia,
    CalendarEventsService,
    $stateParams,
    SettingService,
    showMessage
) {
    const self = this;

    self.currentUser = SettingService.getCurrentUser();
    console.log('年度計畫 self.currentUser', self.currentUser);
    // 月曆目前時間moment物件
    self.calendarDate = data.calendarDate;
    console.log('年度計畫 self.calendarDate', self.calendarDate);

    self.yearPlanObj = {}; // 整包年度計畫

    // 先初始化12個月畫面
    // 1~12月全部事件物件
    self.allMonthEvent = [];

    for (let i = 1; i < 13; i++) {
        self.allMonthEvent.push(setOneMonthObject(i));
    }
    console.log('月份物件', self.allMonthEvent);


    // 先從取得後台資料
    getAllYearPlans();


    // 取得後台資料，by patientId
    function getAllYearPlans() {
        self.loading = true;
        // self.allMonthEvent = ;
        CalendarEventsService.getAllYearPlans($stateParams.patientId, moment(self.calendarDate).format('YYYY'), 'edit').then((qdata) => {
            console.log('取得後台 年度計畫 qdata', angular.copy(qdata));
            self.yearPlanObj = qdata.data ? qdata.data : {};
            console.log('取得後台 self.yearPlanObj', self.yearPlanObj);

            if (_.size(self.yearPlanObj) > 0) {
                // 把Plans塞進self.allMonthEvent.eventChips
                _.forEach(self.yearPlanObj.Plans, (value, key) => {
                   console.log('Plans', key, '~', value);
                   self.allMonthEvent[key - 1].eventChips = value;
                });
            }
            self.loading = false;
        }, (err) => {
            // TODO: error control
            console.log('取得後台 年度計畫 err');
            self.loading = false;
            showMessage('取得資料失敗，請重新整理');

        });

    }


    // 設定單一月物件
    function setOneMonthObject(monthNum) {
        // 字串轉時間
        let planYearMonthStr = moment(self.calendarDate).format('YYYY').concat('-', moment(monthNum.toString(), 'MM').format('MM'));
        let planYearMonthMoment = moment(planYearMonthStr, 'YYYY-MM').format('YYYY-MM');
        let isReadonly = moment(planYearMonthMoment).isBefore(moment().format('YYYY-MM'), 'month');

        let obj = {
            month: monthNum,
            isReadonly: isReadonly, // 過去的月份不可再編輯 TODO: 先測試拿掉
            eventChips: []
        };
        return obj;
    }


    // addChip
    self.addChip = function (month, chip, index) {
        console.log('chip add', month, '~', chip, '~', index);
        // 先清空，再從原index處加入新物件
        self.allMonthEvent[month - 1].eventChips[index] = {};
        let obj = {};
        obj.Title = chip;
        obj.Id = null; // 新增沒有 Id
        self.allMonthEvent[month - 1].eventChips[index] = obj;
        // self.allMonthEvent[month - 1].eventChips.push(obj);
    };

    // 點選chip
    self.selectChip = function (month, event) {
        // console.log('chip select', event);
        let selectedChipIndex = angular.element(event.currentTarget).controller('mdChips').selectedChip;
        // alert(selectedChip);
        console.log('chip select', month, '~', selectedChipIndex);

        // 如果是點選到input element就return -> selectedChipIndex = -1
        if (selectedChipIndex < 0) {
            return;
        }
        
        // 真正有點選到chip
        let chipObj = self.allMonthEvent[month - 1].eventChips[selectedChipIndex];
        console.log('chip select chipObj', chipObj);

        // yearPlanUpdateDialogTpl
        let chipData = {
            chipObj: chipObj
        };
        $mdDialog.show({
            controller: 'yearPlanUpdateDialogController',
            template: yearPlanUpdateDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            multiple: true, // setting multi dialog, the parent won't be closed
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                chipData
            },
            fullscreen: false
            // fullscreen: $mdMedia('xs')
        }).then((ok) => {
            console.log('修改完 ok', chipData.updateTitle);
            // 修改真的資料中的chip標題
            self.allMonthEvent[month - 1].eventChips[selectedChipIndex].Title = chipData.updateTitle;


        }, (cancel) => {
            console.log('修改完 cancel');
        });

    };


    // 點選chip上的delete時
    self.deleteChip = function (month, chip, index) {
        console.log('chip delete', chip);
        // yearPlanUpdateDialogTpl
        // let chipData = {
        //     chipObj: chip
        // };
        // $mdDialog.show({
        //     controller: yearPlanUpdateDialogController,
        //     template: yearPlanUpdateDialogTpl,
        //     parent: angular.element(document.body),
        //     // targetEvent: ev,
        //     multiple: true, // setting multi dialog, the parent won't be closed
        //     clickOutsideToClose: true,
        //     controllerAs: 'dialog',
        //     locals: {
        //         chipData
        //     },
        //     // fullscreen: false
        //     fullscreen: $mdMedia('xs')
        // }).then((ok) => {
        //     console.log('修改完 ok', chipData.updateTitle);
        //     self.allMonthEvent[month - 1].eventChips[selectedChipIndex].title = chipData.updateTitle;
            
        //     // $mdDialog.hide();

        // }, (cancel) => {
        //     console.log('修改完 cancel');
        // });
    };


    self.save = function () {
        self.loading = true;
        console.log('儲存 allMonthEvent', self.allMonthEvent);

        // 組要上傳的資料
        // 組Plans
        let plansObj = {};
        _.forEach(self.allMonthEvent, (value) => {
            if (value.eventChips.length > 0) {
                console.log('組Plans', value);
                plansObj[value.month] = value.eventChips;
            }
        });
        console.log('組Plans plansObj', plansObj);

        self.yearPlanObj.HospitalId = SettingService.getCurrentHospital().Id;
        self.yearPlanObj.PatientId = $stateParams.patientId;
        self.yearPlanObj.Year = moment(self.calendarDate).format('YYYY');

        // 組編輯者
        self.yearPlanObj.UserId = self.currentUser.Id;
        self.yearPlanObj.UserName = self.currentUser.Name;

        // 整包年度計畫
        self.yearPlanObj.Plans = plansObj;
        console.log('要上傳的資料 self.yearPlanObj', self.yearPlanObj);

        // TODO: 上傳資料，再關掉年度計畫dialog
        CalendarEventsService.postYearPlans(self.yearPlanObj).then((qdata) => {
            console.log('上傳資料 qdata', qdata);
            // 會回傳新增加的事件
            self.loading = false;
            showMessage('上傳成功');
            // $mdDialog.hide();
        }, (err) => {
            // TODO: error control
            console.log('上傳資料 err', err);
            self.loading = false;
            showMessage('上傳失敗，請重新儲存');
        });

    };

    self.delete = function () {
        $mdDialog.hide();
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}

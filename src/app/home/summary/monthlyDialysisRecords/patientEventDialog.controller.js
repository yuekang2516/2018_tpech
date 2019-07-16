import eventDeleteDialogTpl from './eventDeleteDialog.html';

angular
    .module('app')
    .controller('patientEventDialogController', patientEventDialogController);

    patientEventDialogController.$inject = ['$filter', '$state', '$mdDialog', 'showMessage', 'data', '$mdMedia', 'SettingService', 'CalendarEventsService'];

function patientEventDialogController(
    $filter,
    $state,
    $mdDialog,
    showMessage,
    data,
    $mdMedia,
    SettingService,
    CalendarEventsService
) {
    const self = this;
    let $translate = $filter('translate');

    let EDITTYPE_NEW = 'new';
    let EDITTYPE_UPDATE = 'update';
    let VIEWTYPE_MONTH = 'month';
    let VIEWTYPE_AGENDAWEEK = 'agendaWeek';

    self.editType = data.editType; // 新增或修改
    self.eventType = data.eventType; // 病人或透析室或年度

    // 新增一個事件物件：需要傳值回月曆頁，欄位要符合月曆命名
    data.newEvent = {};
    // 修改一個事件物件：需要傳值回月曆頁，欄位要符合月曆命名
    data.updateEvent = {};

    let WARD_EVENT = 'ward'; // 透析室記事
    let PATIENT_EVENT = 'patient'; // 病人記事
    let YEAR_EVENT = 'year'; // 年度計畫
    let DIALYSIS_EVENT = 'dialysis'; // 透析紀錄

    // 重複記事最多到從今天起＋10年
    self.max10Year = moment().add(10, 'y').format('YYYY-12-31');
    // console.log('最大10年', self.max10Year);

    self.showEveryDay = true; // 控制"每天"的checkbox顯示
    // 重複日
    self.selectDay = () => {
        // 有任何一個星期被打勾，"每天"不顯示
        if (self.monday || self.tuesday || self.wednesday || self.thursday ||
            self.friday || self.saturday || self.sunday) {
            self.showEveryDay = false;
        }
        if (!self.monday && !self.tuesday && !self.wednesday && !self.thursday &&
            !self.friday && !self.saturday && !self.sunday) {
            self.showEveryDay = true;
        }
    };


    // 新增init
    if (self.editType === EDITTYPE_NEW) {
        console.log('新增病人記事 data', data);

        let clickDate = moment(data.date.start).format('YYYY-MM-DD HH:mm:ss');
        // 初始化日期時間
        self.startDate = new Date(moment(data.date.start).format('YYYY-MM-DD'));
        // self.endDate = new Date(moment(moment(data.date.end).subtract(0, 'day')).format('YYYY-MM-DD HH:mm'));
        // self.tagColor = null; // 病人記事不需顏色   預設顏色 lightblue #039BE5

        if (data.viewType === VIEWTYPE_MONTH) {
            // 月顯示
            self.endDate = new Date(moment(moment(data.date.end).subtract(1, 'day')).format('YYYY-MM-DD HH:mm'));
            self.startTime = new Date(moment().format('YYYY-MM-DD HH:mm'));
            // 處理結束時間
            if (moment(self.startDate).format('YYYY-MM-DD') === moment(self.endDate).format('YYYY-MM-DD')) {
                // 開始日期與結束日期 同一天：結束時間+30min
                self.endTime = new Date(moment(moment().add(30, 'minutes')).format('YYYY-MM-DD HH:mm'));
            } else {
                // 開始日期與結束日期 不同天：結束時間 = 開始時間
                self.endTime = self.startTime;
            }
        } else if (data.viewType === VIEWTYPE_AGENDAWEEK) {
            // 週顯示
            self.endDate = new Date(moment(data.date.end).format('YYYY-MM-DD HH:mm'));
             // 週顯示
            self.startTime = new Date(moment(data.date.start).format('YYYY-MM-DD HH:mm'));
            // 結束時間
            self.endTime = new Date(moment(data.date.end).format('YYYY-MM-DD HH:mm'));
        }

        checkTime('end');
        // compareDateTime();
        console.log('add event dialog clickDate: ', clickDate);
    }


    // 修改init
    if (self.editType === EDITTYPE_UPDATE) {
        console.log('修改事件', data.eventObj);

        self.id = data.eventObj.id;
        self.eventType = data.eventObj.eventType;

        // 畫面顯示
        self.title = data.eventObj.title;
        self.allDay = data.eventObj.allDay;
        self.startDate = new Date(moment(data.eventObj._start).format('YYYY-MM-DD'));
        self.startTime = new Date(moment(data.eventObj._start).format('YYYY-MM-DD HH:mm'));
        
        // TINA
        self.endDate = new Date(moment(data.eventObj.EndTime).format('YYYY-MM-DD'));
        self.endTime = new Date(moment(data.eventObj.EndTime).format('YYYY-MM-DD HH:mm'));
        // self.endDate = new Date(moment(data.eventObj._end).format('YYYY-MM-DD'));
        // self.endTime = new Date(moment(data.eventObj._end).format('YYYY-MM-DD HH:mm'));
        self.content = data.eventObj.content;

        // 處理結束時間null
        if (!data.eventObj._end) {
            self.endDate = self.startDate;
        }

        self.createdTime = data.eventObj.createdTime ? moment(data.eventObj.createdTime).format('YYYY/MM/DD HH:mm') : null;
        self.createdUserName = data.eventObj.createdUserName ? data.eventObj.createdUserName : null;

        self.modifiedTime = data.eventObj.modifiedTime ? moment(data.eventObj.modifiedTime).format('YYYY/MM/DD HH:mm') : null;
        self.modifiedUserName = data.eventObj.modifiedUserName ? data.eventObj.modifiedUserName : null;

        // TODO: 暫不開放透析室記事
        // 處理透析室事件的顏色borderColor
        // if (data.eventObj.eventType === WARD_EVENT) {
        //     self.tagColor = data.eventObj.borderColor;
        // }
        checkTime('end');
        // compareDateTime();
    }


    // 點選新增：新增病人事件
    self.newEvent = function newEvent(form) {
        console.log('新增病人事件');
        if (form.$valid) {

            // 真正要上傳的data
            let uploadNewEvent = {};

            // 以下欄位需配合fullcalendar的設定，欄位名稱依照document的寫法
            uploadNewEvent.Title = self.title;

            // 是否有勾選重複記事
            uploadNewEvent.IsRepeat = self.everyday || self.monday || self.tuesday || self.wednesday || self.thursday || self.friday || self.saturday || self.sunday;
            // 有勾選重複記事：要記錄結束重複的時間
            if (uploadNewEvent.IsRepeat) {
                uploadNewEvent.RepeatEndTime = moment(self.repeatEndTime); // 結束重複 的日期
            }

            // 處理開始時間,結束時間：勾選全天開始與結束時間一樣
            if (self.allDay) {
                // 同天全天
                uploadNewEvent.IsAllDay = true;
                uploadNewEvent.StartTime = moment(self.startDate);
                uploadNewEvent.EndTime = moment(self.endDate); // 要再加一天

                // // 全天且重複每天：結束日期 === 結束重複
                // if (uploadNewEvent.IsRepeat) {
                //     uploadNewEvent.EndTime = moment(self.repeatEndTime).format('YYYY-MM-DD'); // 結束重複 的日期
                // } else {
                //     // 沒有勾選重複記事
                //     uploadNewEvent.EndTime = moment(self.startDate).format('YYYY-MM-DD');
                // }
            } else {
                // 2018-12-29T22:00:00+08:00
                uploadNewEvent.IsAllDay = false;
                uploadNewEvent.StartTime = moment(moment(self.startDate).format('YYYY-MM-DD') + ' ' + moment(self.startTime).format('HH:mm'));
                uploadNewEvent.EndTime = moment(moment(self.endDate).format('YYYY-MM-DD') + ' ' + moment(self.endTime).format('HH:mm'));
                // uploadNewEvent.StartTime = moment(self.startDate).format('YYYY-MM-DD') + ' ' + moment(self.startTime).format('HH:mm');
                // uploadNewEvent.EndTime = moment(self.endDate).format('YYYY-MM-DD') + ' ' + moment(self.endTime).format('HH:mm');
            }

            // 處理空content
            uploadNewEvent.Content = self.content ? self.content : null;

            // 重複記事
            uploadNewEvent.Weeks = []; // 每天或是沒選擇時 -> 空陣列
            if (self.sunday) uploadNewEvent.Weeks.push('7');
            if (self.monday) uploadNewEvent.Weeks.push('1');
            if (self.tuesday) uploadNewEvent.Weeks.push('2');
            if (self.wednesday) uploadNewEvent.Weeks.push('3');
            if (self.thursday) uploadNewEvent.Weeks.push('4');
            if (self.friday) uploadNewEvent.Weeks.push('5');
            if (self.saturday) uploadNewEvent.Weeks.push('6');


            uploadNewEvent.EventId = data.patientId; // EventId -> 病人記事：patientId, 透析室記事：wardId
            uploadNewEvent.HospitalId = SettingService.getCurrentHospital().Id;
            uploadNewEvent.TagColor = null; // 病人記事不需要
            uploadNewEvent.EventType = PATIENT_EVENT; // 病人事件 patient

            uploadNewEvent.CreatedUserId = SettingService.getCurrentUser().Id;
            uploadNewEvent.CreatedUserName = SettingService.getCurrentUser().Name;
            // data.newEvent.CreatedTime = moment().format('YYYY/MM/DD HH:mm');

            console.log('上傳到databasae uploadNewEvent', uploadNewEvent);

            // TODO: 上傳新病人記事，同時改變前端顯示
            CalendarEventsService.postEvent(uploadNewEvent).then((q) => {
                console.log('新增病人記事 q', q);
                console.log('上傳回月曆顯示 新增 data.newEvent', q.data);
                // 回傳的新增記事陣列
                data.newEvent = q.data;

                // 關掉 dialog
                $mdDialog.hide();
            }, (err) => {
                // TODO: error control
                console.log('新增病人記事 err', err);
            });
        } else {
            showMessage('還有欄位要填寫！');
        }
    };


    // 修改病人事件
    self.editEvent = function editEvent(form) {
        console.log('修改修改修改病人記事');
        if (form.$valid) {

            // 真正要上傳的data
            let uploadUpdateEvent = {};

            // 要修改的資料
            // 以下欄位需配合fullcalendar的設定，欄位名稱依照document的寫法
            uploadUpdateEvent.Title = self.title;
            
            if (self.allDay) {
                // 同天全天
                uploadUpdateEvent.IsAllDay = true;
                uploadUpdateEvent.StartTime = moment(self.startDate);
                // uploadUpdateEvent.EndTime = moment(self.startDate).format('YYYY-MM-DD');
                uploadUpdateEvent.EndTime = moment(self.endDate);

            } else {
                uploadUpdateEvent.IsAllDay = false;
                uploadUpdateEvent.StartTime = moment(moment(self.startDate).format('YYYY-MM-DD') + ' ' + moment(self.startTime).format('HH:mm'));
                uploadUpdateEvent.EndTime = moment(moment(self.endDate).format('YYYY-MM-DD') + ' ' + moment(self.endTime).format('HH:mm'));
            }

            // 處理空content
            uploadUpdateEvent.Content = self.content ? self.content : null;

            // TODO: 暫不開放透析室記事
            // 處理顏色：透析室記事可以改顏色
            // if (data.eventObj.eventType === WARD_EVENT) {
            //     data.updateEvent.tagColor = self.tagColor;
            // }

            uploadUpdateEvent.Id = data.eventObj.id;
            uploadUpdateEvent.EventId = data.patientId; // EventId -> 病人記事：patientId, 透析室記事：wardId
            uploadUpdateEvent.HospitalId = SettingService.getCurrentHospital().Id;
            uploadUpdateEvent.TagColor = null; // 病人記事不需要
            uploadUpdateEvent.EventType = PATIENT_EVENT; // 病人事件 patient

            uploadUpdateEvent.ModifiedUserId = SettingService.getCurrentUser().Id;
            uploadUpdateEvent.ModifiedUserName = SettingService.getCurrentUser().Name;
            uploadUpdateEvent.ModifiedTime = moment();

            uploadUpdateEvent.CreatedUserId = data.eventObj.createdUserId;
            uploadUpdateEvent.CreatedUserName = data.eventObj.createdUserName;
            uploadUpdateEvent.CreatedTime = data.eventObj.createdTime;

            console.log('上傳 updateEvent', uploadUpdateEvent);

            // TODO: 上傳新病人記事，同時改變前端顯示
            CalendarEventsService.putEvent(uploadUpdateEvent).then((q) => {
                console.log('！！！！修改病人記事 q', q);
                console.log('上傳回月曆顯示 修改 data.updateEvent', q.data);
                // 回傳的新增記事陣列
                data.updateEvent = q.data;

                // 關掉 dialog
                $mdDialog.hide();
            }, (err) => {
                // TODO: error control
                console.log('修改病人記事 err', err);
            });

        } else {
            showMessage('還有欄位要填寫！');
        }
    };

    // 刪除事件
    self.deleteEvent = function deleteEvent(id, title) {
        console.log('點選刪除！！！！！！！ id', id, title);
        showAlertEventDelete(id, title);
    };

    // 取消
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    // 選擇全天時段
    self.changeAllDay = function changeAllDay(isCheck) {
        console.log('isCheck', isCheck);
        if (isCheck) {
            console.log('選擇全天時段 true');
        } else {
            // 無勾選
            console.log('不選擇全天時段 false');
            // 沒有勾選時要再次比較
            checkTime('end');
        }
    };


    function checkTime(whichDate) {
        let start = moment(self.startDate).format('YYYY-MM-DD') + 'T' + moment(self.startTime).format('HH:mm');
        let end = moment(self.endDate).format('YYYY-MM-DD') + 'T' + moment(self.endTime).format('HH:mm');

        if (moment(end).isBefore(start)) {
            // 結束日 < 起始日 -> 結束日改為與起始日同一天
            console.log('結束日 < 起始日');
            // 改日期就好，時間不動
            self.endDate = new Date(moment(start));
        }
    }


    // 當日期或時間有修改時
    self.dateChanged = function dateChanged(whichDate) {
        // compareDateTime(whichDate);
        checkTime(whichDate);
        console.log('Handler for .change() called.');
    };


    // 刪除記事dialog patientEventDeleteDialogTpl
    function showAlertEventDelete(id, title) {
        let eventType = 'patient';
        let deleteData = {
            id,
            title,
            eventType
        };
        $mdDialog.show({
            controller: 'eventDeleteDialogController',
            template: eventDeleteDialogTpl,
            parent: angular.element(document.body),
            multiple: true, // setting multi dilog, the parent won't be closed
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                deleteData
            },
            // fullscreen: false
            fullscreen: $mdMedia('xs')
        }).then((ok) => {
            console.log('eventDelete dialog ok', ok);
            console.log('確定刪除');

            // 移除月曆上的記事
            $('#calendar').fullCalendar('removeEvents', data.eventObj.id);
            // 移除self.events中的此筆預約單
            _.remove(data.allEventsObj, function (n) {
                return n.id === data.eventObj.id;
            });
            // showMessage('刪除成功');
            $mdDialog.cancel();

        }, (cancel) => {
            // 關掉dialog或按取消
            console.log('eventDelete dialog cancel', cancel);
        });
    }

}

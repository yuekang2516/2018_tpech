import tpl from './wardCalendar.html';
import './wardCalendar.less';
import wardwardEventDialogTpl from './wardEventDialog.html';
import wardEventDeleteDialogTpl from './/wardEventDeleteDialog.html';

angular.module('app').component('wardCalendar', {
    template: tpl,
    controller: wardCalendarCtrl
});

wardCalendarCtrl.$inject = ['$sce', '$state', '$stateParams', 'showMessage', '$timeout', '$mdSidenav', '$mdDialog', '$mdMedia', 'CalendarEventsService', 'SettingService', 'WardService'];

function wardCalendarCtrl($sce, $state, $stateParams, showMessage, $timeout, $mdSidenav, $mdDialog, $mdMedia, CalendarEventsService, SettingService, WardService) {
    const self = this;
    const UserInfo = SettingService.getCurrentUser();

    // 事件物件
    self.events = [];
    let EDITTYPE_NEW = 'new';
    let EDITTYPE_UPDATE = 'update';


    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    self.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };


    self.$onInit = function () {
        console.log('UserInfo', UserInfo);
        // 先取得使用者的透析室列表
        self.wards = SettingService.getCurrentUser().Ward;
        self.keys = Object.keys(self.wards);
        self.ward = self.keys[0];
        console.log('透析室 self.wards', self.wards);
        console.log('透析室 self.keys', self.keys);
        console.log('透析室 self.ward', self.ward);

        // fullcalendar setting
        $('#calendar').fullCalendar({
            locale: 'zh-tw',
            height: 600,
            // aspectRatio: 'parent',
            // defaultDate: moment().format('YYYY-MM-DD'),
            editable: true, // let events cannot be dragged and resized
            header: {
                left: 'title',
                center: '',
                right: 'today, month, agendaWeek, prev, next' // agendaWeek
            },
            dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
            fixedWeekCount: false,
            showNonCurrentDates: false,
            slotEventOverlap: true,
            eventLimit: 3, // allow "more" link when too many events
            nowIndicator: true,
            selectable: true,
            eventDurationEditable: true,
            eventLimitClick: 'popover',
            // droppable: true,
            viewRender: function viewRender(view, element) {
                // self.calendarDate = moment(view.calendar.currentDate._d);
                // 取得資料庫內的全部事件
                getAllEvent();

            },
            dayClick: function dayClick(date, jsEvent, view) {
                console.log('新增事件 view', view);
                // 新增一個事件
                // self.gotoNewEventDialog(date, EDITTYPE_NEW, view.name, self.events.length, self.ward);

            },
            eventClick: (calEvent, jsEvent, view) => {
                console.log('修改事件 calEvent', calEvent);
                console.log('修改事件 calEvent', jsEvent);
                console.log('修改事件 view', view);
                // 修改事件
                self.gotoUpdateEventDialog(calEvent, EDITTYPE_UPDATE, self.events);

            },
            select: function select(start, end, jsEvent, view) {
                console.log('select view', view);
                let date = {
                    start: start,
                    end: end
                };
                self.gotoNewEventDialog(date, EDITTYPE_NEW, view.name, self.events.length, self.ward);
                
            },
            eventRender(event, element, view) {
                // element.find('.fc-title').append('<br/> 加字！');

                
            },
            eventDrop: function eventDrop(event, delta, revertFunc, jsEvent, ui, view) {
                console.log('日期 移動 event', event);
                // month 日期 移動
                // 修改事件
                self.gotoUpdateEventDialog(event, EDITTYPE_UPDATE, self.events);

            },
            eventResize: function eventResize(event, delta, revertFunc, jsEvent, ui, view) {
                console.log('時間 移動 event', event);
                // agendaWeek 時間 移動
                // 修改事件
                self.gotoUpdateEventDialog(event, EDITTYPE_UPDATE, self.events);

            },
            eventAfterAllRender: function eventAfterAllRender(view) {
                // showMessage('all events are rendered'); // remove your loading
            },
            eventMouseover: function eventMouseover(event, jsEvent, view) {
                console.log('event', event);
                // tooltip
                let tooltip = `<div id="tooltip${event.id}" layout="column" class="tooltipevent" style="max-width:130px; word-wrap:break-word; font-size:14px; background:white; position:absolute; z-index:10001; border: 1px solid #ccc; border-radius: 4px; padding:10px;">`;
                let tooltipTitle = `<div><b>標題：</b>${event.title}</div>`;
                let tooltipContent = `<div><b>內容：</b>${event.content}</div>`;
                let tooltipCreator = `<div><b>建立：</b>${event.createdUserName}</div></div>`;
                tooltip = tooltip.concat(tooltipTitle, tooltipContent, tooltipCreator);
                let tooltipDiv = $(tooltip).appendTo('body');
            
                $(this).mouseover(function (e) {
                    $(this).css('z-index', 10000);
                    tooltipDiv.fadeIn('500');
                    tooltipDiv.fadeTo('10', 1.9);
                }).mousemove(function (e) {
                    tooltipDiv.css('top', e.pageY + 10);
                    tooltipDiv.css('left', e.pageX + 20);
                });

            },
            eventMouseout: function eventMouseout(event, jsEvent, view) {
                $(this).css('z-index', 8);
                $('.tooltipevent').remove();
            }

        });

        // 第一次初始化時, 日曆會出不來, 要 settimeout 0秒後才會出來
        setTimeout(() => {
            $('#calendar').fullCalendar('render');
        }, 0);

        // 當按下 next pre today 時重新讀取資料
        $('.fc-prev-button').click(() => {

        });
        $('.fc-next-button').click(() => {

        });
        $('.fc-today-button').click(() => {

        });

    };


    // 取得資料庫內的全部事件
    // 依照月份篩選要顯示的
    function getAllEvent() {
        self.loading = true;
        CalendarEventsService.getEventJSON().then((qdata) => {
            console.log('事件 JSON qdata', qdata);
            self.events = [];
            let dataObj = {};
            // 處理資料
            _.forEach(qdata, function (value) {
                dataObj = {};
                dataObj.id = value.id;
                dataObj.wardId = value.wardId;
                dataObj.eventType = value.eventType;
                dataObj.allDay = value.AllDay;

                dataObj.title = value.title;
                dataObj.content = value.content;
                dataObj.start = value.startTime;
                dataObj.end = value.endTime;
                dataObj.textColor = 'white';
                dataObj.backgroundColor = value.tagColor;

                dataObj.createdUserId = value.CreatedUserId;
                dataObj.createdUserName = value.CreatedUserName;
                dataObj.createdTime = value.CreatedTime;
                dataObj.modifiedUserId = value.ModifiedUserId;
                dataObj.modifiedUserName = value.ModifiedUserName;
                dataObj.modifiedTime = value.ModifiedTime;


                self.events.push(dataObj);
            });
            console.log('全部事件 self.events', self.events);
            $timeout(() => {
                // 重新render事件
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', self.events);
                $('#calendar').fullCalendar('rerenderEvents');
            }, 0);

        })
        .catch((err) => {
            console.log('事件 JSON err', err);
            // showMessage('讀取失敗, ' + err.data);
            self.loading = false;
            self.isError = true;
        })
        .finally(() => {
            self.loading = false;
        });

    }

    // 改變標籤顏色
    /*
        lightblue #039BE5
        purple #7986CB
        green #33B679
        orange #F4511E
    */
    function setTagColor(color) {
        return {
            textColor: 'white',
            backgroundColor: color
        };
    }

    // 新增
    self.gotoNewEventDialog = function gotoNewEventDialog(date, editType, viewType, allEventCount, wardId) {
        let data = {
           date,
           editType,
           viewType, // 月/週
           allEventCount,
           wardId
        };

        $mdDialog.show({
            controller: eventDialogController,
            template: wardwardEventDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: $mdMedia('xs') // Only for -xs, -sm breakpoints.
        }).then(() => {
            console.log('dialog newEvent', data.newEvent);
            // 設定顏色
            let colorobj = setTagColor(data.newEvent.tagColor);
            self.events.push({
                // editType: editType, // new / update
                eventType: 'wardEvent',
                id: allEventCount + 1,
                wardId: self.ward,
                title: data.newEvent.title,
                content: data.newEvent.content,
                start: new Date(data.newEvent.start),
                end: new Date(data.newEvent.end),
                textColor: colorobj.textColor,
                backgroundColor: colorobj.backgroundColor,
                allDay: data.newEvent.allDay,
                CreatedUserId: SettingService.getCurrentUser().Id,
                CreatedUserName: SettingService.getCurrentUser().Name,
                CreatedTime: moment(),
                ModifiedUserId: '',
                ModifiedUserName: '',
                ModifiedTime: ''
            });

            $timeout(() => {
                // 重新render事件
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', self.events);
                $('#calendar').fullCalendar('rerenderEvents');
            }, 0);

            showMessage('新增成功');

        }, (cancel) => {
            console.log('dialog cancel', cancel);
        });
    };


     // 修改
     self.gotoUpdateEventDialog = function gotoUpdateEventDialog(eventObj, editType, allEventsObj) {
        let data = {
            eventObj,
            editType,
            allEventsObj
        };
        console.log('修改calendar', eventObj.id);
        $mdDialog.show({
            controller: eventDialogController,
            template: wardwardEventDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: $mdMedia('xs')
        }).then(() => {
            console.log('dialog updateEvent', data.updateEvent);
            // 找到相對應的資料物件index
            let index = _.findIndex(self.events, function (o) {
                return o.id === data.updateEvent.id;
            });
            console.log('index', index);
            // 設定顏色
            let colorobj = setTagColor(data.updateEvent.tagColor);

            self.events[index].eventType = 'wardEvent';
            self.events[index].title = data.updateEvent.title;
            self.events[index].content = data.updateEvent.content;
            self.events[index].start = new Date(data.updateEvent.start);
            self.events[index].end = new Date(data.updateEvent.end);
            self.events[index].backgroundColor = colorobj.backgroundColor;
            self.events[index].allDay = data.updateEvent.allDay;
            self.events[index].ModifiedUserId = SettingService.getCurrentUser().Id;
            self.events[index].ModifiedUserName = SettingService.getCurrentUser().Name;
            self.events[index].ModifiedTime = moment();


            // self.events[index] = {
            //     eventType: 'wardEvent',
            //     id: data.updateEvent.id,
            //     title: data.updateEvent.title,
            //     content: data.updateEvent.content,
            //     start: new Date(data.updateEvent.start),
            //     end: new Date(data.updateEvent.end),
            //     textColor: colorobj.textColor,
            //     backgroundColor: colorobj.backgroundColor,
            //     allDay: data.updateEvent.allDay,
            //     ModifiedUserId: SettingService.getCurrentUser().Id,
            //     ModifiedUserName: SettingService.getCurrentUser().Name,
            //     ModifiedTime: moment()
            // };

            $timeout(() => {
                // 重新render事件
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', self.events);
                $('#calendar').fullCalendar('rerenderEvents');
            }, 0);

            showMessage('修改成功');

        }, (cancel) => {
            console.log('dialog cancel', cancel);
            // 沒有修改
            $timeout(() => {
                // 重新render事件
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', self.events);
                $('#calendar').fullCalendar('rerenderEvents');
            }, 0);

        });
    };


}


angular
    .module('app')
    .controller('eventDialogController', eventDialogController);

    eventDialogController.$inject = ['$state', '$mdDialog', 'showMessage', 'data', '$mdMedia', 'SettingService'];

function eventDialogController(
    $state,
    $mdDialog,
    showMessage,
    data,
    $mdMedia,
    SettingService
) {
    const self = this;
    let EDITTYPE_NEW = 'new';
    let EDITTYPE_UPDATE = 'update';
    let VIEWTYPE_MONTH = 'month';
    let VIEWTYPE_AGENDAWEEK = 'agendaWeek';

    self.editType = data.editType;

    // 新增一個事件物件：需要傳值出去
    data.newEvent = {};
    // 修改一個事件物件：需要傳值出去
    data.updateEvent = {};

    // 新增init
    if (self.editType === EDITTYPE_NEW) {
        let clickDate = moment(data.date).format('YYYY-MM-DD HH:mm:ss');
        // 初始化日期時間
        self.startDate = new Date(moment(data.date.start).format('YYYY-MM-DD'));
        // self.endDate = new Date(moment(moment(data.date.end).subtract(0, 'day')).format('YYYY-MM-DD HH:mm'));
        self.tagColor = '#039BE5'; // 預設顏色 lightblue

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

        console.log('!! self.startDate: ', self.startDate);
        console.log('!! self.endDate: ', self.endDate);

        compareDateTime();
        console.log('add event dialog clickDate: ', clickDate);
    }

    // 修改init
    if (self.editType === EDITTYPE_UPDATE) {
        console.log('修改事件', data.eventObj);
        // 處理結束時間null
        // if (!data.eventObj._end) {
        //     data.eventObj._end = data.eventObj._start;
        // }
        self.title = data.eventObj.title;
        self.startDate = new Date(moment(data.eventObj._start).format('YYYY-MM-DD'));
        self.content = data.eventObj.content;
        self.allDay = data.eventObj.allDay;
        self.startTime = new Date(moment(data.eventObj._start).format('YYYY-MM-DD HH:mm'));
        self.endDate = new Date(moment(data.eventObj._end).format('YYYY-MM-DD'));
        self.endTime = new Date(moment(data.eventObj._end).format('YYYY-MM-DD HH:mm'));
        self.tagColor = data.eventObj.backgroundColor;
        // 處理結束時間null
        if (!data.eventObj._end) {
            self.endDate = self.startDate;
        }
        compareDateTime();
    }


    // 新增事件
    self.newEvent = function newEvent(form) {
        console.log('新增事件');
        if (form.$valid) {
            // 要上傳的資料
            data.newEvent.title = self.title;
            data.newEvent.tagColor = self.tagColor;
            if (self.allDay) {
                // 同天全天
                data.newEvent.allDay = true;
                data.newEvent.start = moment(self.startDate).format('YYYY-MM-DD');
                data.newEvent.end = moment(self.startDate).format('YYYY-MM-DD');
            } else {
                data.newEvent.allDay = false;
                data.newEvent.start = moment(self.startDate).format('YYYY-MM-DD') + 'T' + moment(self.startTime).format('HH:mm');
                data.newEvent.end = moment(self.endDate).format('YYYY-MM-DD') + 'T' + moment(self.endTime).format('HH:mm');
            }
            if (self.content) {
                data.newEvent.content = self.content;
            } else {
                data.newEvent.content = null;
            }

            data.newEvent.id = data.allEventCount + 1;
            data.newEvent.wardId = data.wardId;
            data.newEvent.eventType = 'wardEvent'; // 透析室事件
            
            data.newEvent.createdUserId = SettingService.getCurrentUser().Id;
            data.newEvent.createdUserName = SettingService.getCurrentUser().Name;
            data.newEvent.createdTime = moment();
            // data.newEvent.modifiedUserId = null;
            // data.newEvent.modifiedUserName = null;
            // data.newEvent.modifiedTime = null;

            // 上傳
            console.log('上傳 newEvent', data.newEvent);


            $mdDialog.hide();
        } else {
            showMessage('還有欄位要填寫！');
        }
    };


    // 修改事件
    self.editEvent = function editEvent(form) {
        if (form.$valid) {
            // 要修改的資料
            data.updateEvent.id = data.eventObj.id;

            data.updateEvent.title = self.title;
            data.updateEvent.tagColor = self.tagColor;
            if (self.allDay) {
                // 同天全天
                data.updateEvent.allDay = true;
                data.updateEvent.start = moment(self.startDate).format('YYYY-MM-DD');
                data.updateEvent.end = moment(self.startDate).format('YYYY-MM-DD');
            } else {
                data.updateEvent.allDay = false;
                data.updateEvent.start = moment(self.startDate).format('YYYY-MM-DD') + 'T' + moment(self.startTime).format('HH:mm');
                data.updateEvent.end = moment(self.endDate).format('YYYY-MM-DD') + 'T' + moment(self.endTime).format('HH:mm');
            }
            if (self.content) {
                data.updateEvent.content = self.content;
            } else {
                data.updateEvent.content = null;
            }

            data.updateEvent.wardId = data.eventObj.wardId;
            data.updateEvent.modifiedUserId = SettingService.getCurrentUser().Id;
            data.updateEvent.modifiedUserName = SettingService.getCurrentUser().Name;
            data.updateEvent.modifiedTime = moment();

            // 上傳
            console.log('上傳 updateEvent', data.updateEvent);

            $mdDialog.hide();
        } else {
            showMessage('還有欄位要填寫！');
        }
    };

    // 刪除事件
    self.deleteEvent = function deleteEvent() {

        showAlertEventDelete(self.title);
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
            // 有勾選時要隱藏
            if (self.timeMessage !== '') {
                self.timeMessage = '';
                self.timeError = false;
            }
            console.log('self.timeError', self.timeError);
            // 勾選 allDay = true
            // 預帶開始日期開始時間
            // self.startTime = new Date(moment(self.startDate).format('YYYY-MM-DD HH:mm'));
            // self.endDate = new Date(moment(self.startDate).format('YYYY-MM-DD'));
            // self.endTime = new Date(moment(self.startDate).format('YYYY-MM-DD HH:mm'));
        } else {
            // 無勾選
            console.log('不選擇全天時段 false');
            // 沒有勾選時要再次比較
            compareDateTime();
            // 修改時，預帶開始日期開始時間
            // if (self.eventType === EDITTYPE_UPDATE) {
            //     self.startTime = new Date(moment().format('YYYY-MM-DD HH:mm'));
            //     self.endDate = new Date(moment(self.startDate).format('YYYY-MM-DD'));
            //     self.endTime = new Date(moment().format('YYYY-MM-DD HH:mm'));
            // }
        }
    };

    // 比對起始結束時間
    function compareDateTime() {
        console.log('self.startDate', self.startDate);
        console.log('self.endDate', self.endDate);
        console.log('相差 1', moment(self.startDate).format('YYYY-MM-DD') + 'T' + moment(self.startTime).format('HH:mm'));
        console.log('相差 2', moment(self.endDate).format('YYYY-MM-DD') + 'T' + moment(self.endTime).format('HH:mm'));

        let start = moment(self.startDate).format('YYYY-MM-DD') + 'T' + moment(self.startTime).format('HH:mm');
        let end = moment(self.endDate).format('YYYY-MM-DD') + 'T' + moment(self.endTime).format('HH:mm');

        if (moment(start).diff(moment(end)) > 0) {
            // self.timeMessage = '請注意，執行時間比建立時間(' + moment(self.serviceData.CreatedTime).format('YYYY/MM/DD HH:mm') + ')早。';
            self.timeMessage = '請注意，結束時間不可比開始時間早';
            self.timeError = true; // 控制按鈕
        } else if (moment(start).diff(moment(end)) === 0) {
            self.timeMessage = '請注意，結束時間要比開始時間晚';
            self.timeError = true;
        } else {
            self.timeMessage = '';
            self.timeError = false;
        }

    }

    // 當日期或時間有修改時
    self.dateChanged = function dateChanged() {
        compareDateTime();
        console.log('Handler for .change() called.');
    };


    // 刪除記事dialog wardEventDeleteDialogTpl
    function showAlertEventDelete(title) {
        
        let alertData = {
            title
        };
        $mdDialog.show({
            controller: wardEventDeleteDialogController,
            template: wardEventDeleteDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                alertData
            },
            // fullscreen: false
            fullscreen: $mdMedia('xs')
        }).then((ok) => {
            console.log('eventDelete dialog ok', ok);

            console.log('確定刪除');
            
            $('#calendar').fullCalendar('removeEvents', data.eventObj.id);
            // 移除self.events中的此筆預約單
            _.remove(data.allEventsObj, function (n) {
                return n.id === data.eventObj.id;
            });

            $mdDialog.hide();
            
        }, (cancel) => {
            console.log('eventDelete dialog cancel', cancel);
        });
    }

}


// 確認刪除記事
angular
    .module('app')
    .controller('wardEventDeleteDialogController', wardEventDeleteDialogController);

    wardEventDeleteDialogController.$inject = ['$state', '$mdDialog', 'alertData'];

function wardEventDeleteDialogController(
    $state,
    $mdDialog,
    alertData
) {
    const self = this;

    self.title = alertData.title;
    console.log('wardEventDeleteDialogController title', self.title);

    self.delete = function () {
        $mdDialog.hide();
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}

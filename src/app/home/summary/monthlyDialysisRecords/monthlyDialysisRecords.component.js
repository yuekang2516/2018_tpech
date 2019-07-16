import tpl from './monthlyDialysisRecords.html';
import './monthlyDialysisRecords.less';
import patientEventDialogTpl from './patientEventDialog.html';

import yearEventDialogTpl from './yearEventDialog.html';
import yearPlanDialogTpl from './yearPlanDialog.html';

angular.module('app').component('monthlyDialysisRecords', {
    template: tpl,
    controller: monthlyDialysisRecordsCtrl
});

monthlyDialysisRecordsCtrl.$inject = ['$scope', '$q', '$sce', '$state', 'infoService', 'PatientService', 'dialysisService', '$stateParams', 'showMessage', '$timeout', 'SettingService', 'CalendarEventsService', '$mdDialog', '$mdMedia', '$filter'];

function monthlyDialysisRecordsCtrl($scope, $q, $sce, $state, infoService, PatientService, dialysisService, $stateParams, showMessage, $timeout, SettingService, CalendarEventsService, $mdDialog, $mdMedia, $filter) {
    const self = this;
    let $translate = $filter('translate');
    self.calendarDate = $stateParams.date ? moment($stateParams.date) : moment();

    self.events = []; // 於 fullcalendar 上顯示
    self.wardEvent = [];
    self.patientEvent = [];
    self.yearEvent = [];
    self.dialysisEvent = [];

    let EDITTYPE_NEW = 'new';
    let EDITTYPE_UPDATE = 'update';
    let currentLanguage = 'zh-tw'; // 預設繁中

    let ALL_EVENT = 'all';
    let WARD_EVENT = 'ward'; // 透析室記事
    let DIALYSIS_EVENT = 'dialysis'; // 透析紀錄
    let PATIENT_EVENT = 'patient'; // 病人記事
    let YEAR_EVENT = 'year'; // 年度計畫

    let changeHeaderId = null;  // 紀錄是否要更換表單
    // self.repeatDays = []; // 重複日

    // 20190403 北市醫 只留下顯示透析記錄功能，其他記事都拿掉
    self.$onInit = function () {

        // 取得醫院模組設定 ModuleFunctions，決定功能是否開放，0->close 1->open
        self.ModuleFunctions = SettingService.getModuleFunctions();

        // 取得目前語系
        currentLanguage = SettingService.getLanguage();

        // 取得 patient 資訊
        PatientService
            .getById($stateParams.patientId)
            .then((res) => {
                if (res.data) {
                    self.patient = res.data;
                }
            }, () => {
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });


        // TODO: 暫不開放透析室記事
        // 先取得使用者的透析室列表
        // self.wards = SettingService.getCurrentUser().Ward;
        // self.keys = Object.keys(self.wards);
        // self.ward = self.keys[0];
        // console.log('透析室 self.wards', self.wards);
        // console.log('透析室 self.keys', self.keys);
        // console.log('透析室 self.ward', self.ward);

        // fullcalendar setting
        $('#calendar').fullCalendar({
            locale: currentLanguage,
            // height: 600,
            aspectRatio: 'parent',
            defaultDate: moment($stateParams.date),
            editable: true, // let events cannot be dragged and resized
            header: {
                left: 'title',
                center: '',
                right: 'today, month, agendaWeek, prev,next'
            },
            // dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'], // 藉由locale來自動顯示
            fixedWeekCount: false,
            showNonCurrentDates: false,
            slotEventOverlap: true,
            eventLimit: 2, // allow "more" link when too many events
            nowIndicator: true,
            selectable: false,
            eventDurationEditable: true,
            eventLimitClick: 'popover',
            handleWindowResize: true,
            timeFormat: 'H:mm', // uppercase H for 24-hour clock
            viewRender: function viewRender(view, element) {
                console.log('oninit viewRender!!!!!!');
                self.calendarDate = moment(view.calendar.currentDate._d);
                self.toolbarTitle = moment(self.calendarDate).format('MMM') + $translate('monthlyDialysisRecords.monthlyDialysisRecords.calendar');

            },
            // dayClick: function dayClick(date, jsEvent, view) {
            //     console.log('新增事件 view', view);
            //     // 有select時，dayClick會重複執行，此處不需再寫
            //     // 新增一個事件
            //     // self.gotoNewPatientEventDialog(date, EDITTYPE_NEW, view.name, 'dayClick');

            // },
            eventClick: (calEvent, jsEvent, view) => {

                console.log('點擊！！！！calEvent', calEvent);
                if (calEvent.eventType === DIALYSIS_EVENT) {
                    // 透析資料
                    // $state.go('overview', { patientId: $stateParams.patientId, headerId: calEvent.headerId });

                    // 供判斷是否要更換表單
                    changeHeaderId = {
                        headerId: calEvent.headerId,
                        date: $stateParams.date
                    };
                    history.go(-1);
                    // $scope.$emit('changeHeaderId', calEvent.headerId, $stateParams.date);
                    // $state.go('summary', { patientId: $stateParams.patientId, headerId: calEvent.headerId, month: $stateParams.date }, { notify: true, reload: true, location: 'replace' });
                    // 關掉tooltip
                    $(this).css('z-index', 8);
                    $('.tooltipevent').remove();
                }
                if (calEvent.eventType === PATIENT_EVENT || calEvent.eventType === WARD_EVENT) {
                    // 修改病人事件
                    console.log('點擊！！！！');
                    // Jessica Todo: 暫時先不開放編輯事件功能
                    self.gotoUpdatePatientEventDialog(calEvent, EDITTYPE_UPDATE, self.events);
                }
                if (calEvent.eventType === YEAR_EVENT) {
                    // 年度計畫dialog
                    self.gotoUpdateYearEventDialog(calEvent, EDITTYPE_UPDATE, self.events, YEAR_EVENT);
                }


            },
            // select: function select(start, end, jsEvent, view) {

            //     console.log('select view', view);
            //     // Jessica Todo: 暫時先不開放編輯事件功能
            //     let date = {
            //         start: start,
            //         end: end
            //     };
            //     // 新增一個事件
            //     self.gotoNewPatientEventDialog(date, EDITTYPE_NEW, view.type, self.events.length);
            // },
            eventRender: function eventRender(event, element) {
                // console.log('event !!!', event);
                if (event.eventType === DIALYSIS_EVENT) {
                    element.find('.fc-title').append(`<div>${event.content}</div>`);
                }
                // if (event.eventType === 'wardEvent') {
                //     $('<i class="material-icons">local_hotel</i>').insertBefore(element.find('.fc-time'));
                // }
                // if (event.eventType === 'patientEvent') {
                //     $('<i class="material-icons">person_outline</i>').insertBefore(element.find('.fc-time'));
                // }
                if (event.eventType === YEAR_EVENT && event.executeStatus) {
                    $('<i class="material-icons" style="color:white; font-size: 18px;">check_circle</i>').insertBefore(element.find('.fc-content'));
                }

            },
            // eventAfterAllRender: function eventAfterAllRender(view) {
            //     // showMessage('all events are rendered'); // remove your loading

            // },
            // eventDrop: function eventDrop(event, delta, revertFunc, jsEvent, ui, view) {
            //     console.log('日期 移動 event', event);
            //     // month 日期 移動
            //     // 修改病人事件

            //     // 拖動的結束時間(因為是 fullcalendar 上的) for database 的需減一天
            //     if (event.allDay && (moment(event._start).format('YYYYMMDD') !== moment(event._end).format('YYYYMMDD'))) {
            //         event.EndTime = moment(event._end).add(-1, 'd');
            //     } else {
            //         event.EndTime = event._end;
            //     }
            //     self.gotoUpdatePatientEventDialog(event, EDITTYPE_UPDATE, self.events);

            // },
            // eventResize: function eventResize(event, delta, revertFunc, jsEvent, ui, view) {
            //     console.log('時間 移動 event', event);
            //     // agendaWeek 時間 移動
            //     // 修改病人事件
            //     self.gotoUpdatePatientEventDialog(event, EDITTYPE_UPDATE, self.events);

            // },
            eventMouseover: function eventMouseover(event, jsEvent, view) {
                // console.log('event', event);
                // tooltip
                let tooltip = `<div layout="column" class="tooltipevent" style="max-width:130px; font-size:14px; background:white; position:absolute; z-index:10001; border: 1px solid #ccc; border-radius: 4px; padding:10px;">`;
                let tooltipTitle = `<div><b>${$translate('monthlyDialysisRecords.monthlyDialysisRecords.component.toolTipTitle')}</b><span>${event.title}</span></div>`;
                let tooltipContent = `<div><b>${$translate('monthlyDialysisRecords.monthlyDialysisRecords.component.tooltipContent')}</b><span>${event.content ? event.content : '-'}</span></div>`;
                // let tooltipCreator = `<div><b>${$translate('monthlyDialysisRecords.monthlyDialysisRecords.component.tooltipCreator')}</b>${event.createdUserName}</div></div>`;
                // if (event.createdUserName) {
                //     tooltip = tooltip.concat(tooltipTitle, tooltipContent, tooltipCreator);
                // } else {
                //     // 透析資料 沒有 event.createdUserName，不需顯示'建立者'
                //     tooltip = tooltip.concat(tooltipTitle, tooltipContent, '</div>');
                // }
                tooltip = tooltip.concat(tooltipTitle, tooltipContent, '</div>');

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

        // // 第一次初始化時, 日曆會出不來, 要 settimeout 0秒後才會出來
        // setTimeout(() => {
        //     $('#calendar').fullCalendar('render');
        // }, 0);

        // 當按下 next pre today 時重新讀取資料
        $('.fc-prev-button').click(() => {
            reloadDialysisHeader();
        });
        $('.fc-next-button').click(() => {
            reloadDialysisHeader();
        });
        $('.fc-today-button').click(() => {
            reloadDialysisHeader();
        });

        self.loading = true;

        // // 若為透析機
        // if ($stateParams.isSummary) {
        //     self.dialysisRecordOnly = true;
        // }

        // 北市醫 不需記事功能
        self.dialysisRecordOnly = true;

        loadAllData(true);

    };

    self.$onDestroy = function () {
        if (!changeHeaderId) {
            return;
        }

        $scope.$emit('changeHeaderId', changeHeaderId.headerId, changeHeaderId.date);
    };

    // 取得：透析事件、使用者透析室事件、病人事件
    function loadAllData(isInit = false) {
        // 每次重新拉資料就要清空陣列
        self.events = [];
        self.wardEvent = [];
        self.patientEvent = [];
        self.yearEvent = [];
        self.dialysisEvent = [];

        // 上方flter btn
        self.filterBtn = '';
        // self.isALLBtn = true;
        // self.isADialysisBtn = false;
        // self.isPatientBtn = false;
        // self.isYearBtn = false;
        // self.isWardBtn = false;
        // 取得透析事件
        getDialysisEvent().then(() => {
            // 若只需要透析事件則不須撈病人事件
            if (self.dialysisRecordOnly) {
                rerenderCalendar(self.dialysisEvent);
                return;
            }

            // 北市醫 不需記事功能
            // 取得病人事件
            // getPatientEvent().then(() => {
            //     self.events = self.events.concat(self.dialysisEvent, self.wardEvent, self.patientEvent, self.yearEvent);
            //     console.log('總 self.events', self.events);
            //     // 若為從 summary
            //     if (isInit && $stateParams.isSummary) {
            //         self.filterBtn = DIALYSIS_EVENT;
            //         self.getOneEventType(self.filterBtn);
            //     } else if (!$stateParams.isSummary && isInit) {
            //         self.filterBtn = ALL_EVENT;
            //         self.getOneEventType(self.filterBtn);
            //     } else {
            //        rerenderCalendar(self.events);
            //     }
            // });
        });

        // TODO: 暫不開放透析室記事
        // 取得透析事件
        // getDialysisEvent().then(() => {
        //     // 取得使用者透析室事件
        //     getUserWardAllEvent().then(() => {
        //         // 取得病人事件
        //         getPatientEvent().then(() => {
        //             self.events = self.events.concat(self.dialysisEvent, self.wardEvent, self.patientEvent, self.yearEvent);
        //             console.log('總 self.events', self.events);
        //             rerenderCalendar(self.events);
        //         });
        //     });
        // });

    }

    // 重畫行事曆
    function rerenderCalendar(event) {
        $timeout(() => {
            // 重新render事件
            $('#calendar').fullCalendar('removeEvents');
            $('#calendar').fullCalendar('addEventSource', event);
            $('#calendar').fullCalendar('rerenderEvents');
        }, 0);
    }

    self.goback = function () {
        history.go(-1);
    };

    function getDialysisEvent() {
        const deferred = $q.defer();
        // 從後台得到所有模式的選項
        infoService.get().then((res) => {
            if (res.data && res.data.DialysisSetting && res.data.DialysisSetting.Records && res.data.DialysisSetting.Records.PrescriptionModes && res.data.DialysisSetting.Records.PrescriptionModes.length > 0) {
                self.modes = {};

                // Todo 若後臺模式設定超過十個，需判斷
                for (let i = 0; i < res.data.DialysisSetting.Records.PrescriptionModes.length; i++) {
                    // 依順序塞入模式顏色，以 Mode 當作 key，供後續 event 變更顏色用
                    self.modes[res.data.DialysisSetting.Records.PrescriptionModes[i]] = $sce.trustAsHtml('<div style="background-color: ' + modeColors[i] + '; border-radius: 3px; margin-left: 10px; padding: 3px 8px;">' + res.data.DialysisSetting.Records.PrescriptionModes[i] + '</div>');
                }
            }
            // 當月透析紀錄：依時間區間取得此病人當月的透析紀錄
            return dialysisService.getByDate($stateParams.patientId, self.calendarDate.format('YYYY-MM-01'), moment(self.calendarDate).endOf('month').format('YYYY-MM-DD'));
        }).then((res) => {
            if (res.data) {
                self.events = []; // 於 fullcalendar 上顯示
                _.forEach(res.data, (dialysisHeader) => {
                    console.log('dialysisHeader', dialysisHeader);
                    // 確認是否有處方中的模式
                    let mode = $translate('monthlyDialysisRecords.monthlyDialysisRecords.component.none'); // '無';
                    if (dialysisHeader.Prescription && dialysisHeader.Prescription.DialysisMode) {
                        mode = dialysisHeader.Prescription.DialysisMode.Name;
                    }
                    // self.events.push({
                    //     eventType: DIALYSIS_EVENT,
                    //     // $translate('overview.component.signNurseLoginMessage', { loginName: SettingService.getCurrentUser().Name })
                    //     title: $translate('monthlyDialysisRecords.monthlyDialysisRecords.component.whatTimes', { numberAll: dialysisHeader.Numbers.all }) + (mode || $translate('monthlyDialysisRecords.monthlyDialysisRecords.component.none')), // '第' + dialysisHeader.Numbers.all + '次 ' + (mode || '無'),
                    //     content: dialysisHeader.Location,
                    //     headerId: dialysisHeader.Id,
                    //     textColor: 'black',
                    //     backgroundColor: getLabelBackgroundColor(dialysisHeader),
                    //     start: new Date(dialysisHeader.CreatedTime),
                    //     allDay: true,
                    //     editable: false, // 透析紀錄事件不可移動
                    //     borderColor: getLabelBackgroundColor(dialysisHeader) // border 與 background一樣
                    // });

                    self.dialysisEvent.push({
                        eventType: DIALYSIS_EVENT,
                        // $translate('overview.component.signNurseLoginMessage', { loginName: SettingService.getCurrentUser().Name })
                        title: $translate('monthlyDialysisRecords.monthlyDialysisRecords.component.whatTimes', { numberAll: dialysisHeader.Numbers.all }) + (mode || $translate('monthlyDialysisRecords.monthlyDialysisRecords.component.none')), // '第' + dialysisHeader.Numbers.all + '次 ' + (mode || '無'),
                        content: dialysisHeader.Location,
                        headerId: dialysisHeader.Id,
                        textColor: 'black',
                        backgroundColor: getLabelBackgroundColor(dialysisHeader),
                        start: new Date(dialysisHeader.StartTime), // dialysisHeader.CreatedTime
                        allDay: true,
                        editable: false, // 透析紀錄事件不可移動
                        borderColor: getLabelBackgroundColor(dialysisHeader) // border 與 background一樣
                    });
                });
            }
        }).catch(() => {
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        })
            .finally(() => {
                // 第一次初始化時, 日曆會出不來, 要 settimeout 0秒後才會出來
                setTimeout(() => {
                    $('#calendar').fullCalendar('render');
                }, 0);
                self.loading = false;
                deferred.resolve();
            });
        return deferred.promise;
    }

    // 依據模式改變顏色
    // 預設 7 種顏色，依順序套用顏色 (紅橙黃綠藍靛紫)
    let modeColors = [
        '#ef9a9a',
        '#ff6d00',
        '#ffeb3b',
        '#81c784',
        '#81d4fa',
        '#9fa8da',
        '#b388ff'
    ];
    // 模式 無:#eeeeee; hd: #c8e6c9; hdf: #a5d6a7; hf: #81c784; uf: #66bb6a
    function getLabelBackgroundColor(dialysisHeader) {
        // 確認是否有 Mode 欄位
        if (dialysisHeader.Prescription && dialysisHeader.Prescription.DialysisMode) {
            // 與後台給的資料比對並吐回相應的顏色
            let modes = Object.keys(self.modes);
            const index = _.indexOf(modes, dialysisHeader.Prescription.DialysisMode.Name);
            if (index > -1) {
                return modeColors[index];
            }
        }
        return '#eeeeee';
    }

    // 重新讀取資料
    function reloadDialysisHeader() {
        console.log('重新讀取資料 in');
        $("#calendar").fullCalendar('removeEvents');
        self.loading = true;
        loadAllData();
        $state.go('monthlyDialysisRecords', {
            patientId: $stateParams.patientId,
            date: self.calendarDate.format('YYYY-MM'),
            isSummary: $stateParams.isSummary
        }, { notify: false, reload: false, location: 'replace' });
    }


    // TODO: 暫不開放透析室記事
    // 選擇其他透析室時重新讀取病床清單
    // self.changeWard = function changeWard() {
    //     console.log('選擇透析室');
    //     // 每次重新拉資料就要清空陣列
    //     self.events = [];
    //     self.wardEvent = []; // 有更新先清空
    //     getUserWardAllEvent().then(() => {
    //         self.events = self.events.concat(self.dialysisEvent, self.wardEvent, self.patientEvent, self.yearEvent);
    //         rerenderCalendar(self.events);
    //     });
    // };


    // 篩選記事：上方三按鈕～病人、透析室、透析
    self.getOneEventType = function getOneEventType(eventType) {
        // 所有記事篩出 個別 eventType (WARD_EVENT、DIALYSIS_EVENT、PATIENT_EVENT、YEAR_EVENT)
        switch (eventType) {
            case DIALYSIS_EVENT: // 透析
                // TODO: 只顯示當月透析
                self.dialysisEvents = []; // 先清空
                $("#calendar").fullCalendar('removeEvents');
                self.dialysisEvents = _.filter(self.events, (o) => {
                    return o.eventType === DIALYSIS_EVENT;
                });
                rerenderCalendar(self.dialysisEvents);
                self.filterBtn = 'dialysis';
                break;
            case WARD_EVENT: // 透析室
                // TODO: 只顯示當月透析室
                $("#calendar").fullCalendar('removeEvents');
                self.wardEvents = []; // 先清空
                self.wardEvents = _.filter(self.events, (o) => {
                    return o.eventType === WARD_EVENT;
                });
                rerenderCalendar(self.wardEvents);
                self.filterBtn = 'ward';
                break;
            case PATIENT_EVENT: // 病人
                $("#calendar").fullCalendar('removeEvents');
                self.patientEvents = []; // 先清空
                self.patientEvents = _.filter(self.events, (o) => {
                    return o.eventType === PATIENT_EVENT;
                });
                rerenderCalendar(self.patientEvents);
                self.filterBtn = 'patient';
                break;
            case YEAR_EVENT: // 年度
                $("#calendar").fullCalendar('removeEvents');
                self.yearEvents = []; // 先清空
                self.yearEvents = _.filter(self.events, (o) => {
                    return o.eventType === YEAR_EVENT;
                });
                rerenderCalendar(self.yearEvents);
                self.filterBtn = 'year';
                break;
            default:
                // 顯示全部 'all'
                $("#calendar").fullCalendar('removeEvents');
                rerenderCalendar(self.events);
                self.filterBtn = 'all';
                break;

        }
    };


    // TODO: 暫不開放透析室記事
    // 使用者的透析室事件-------------------------------
    // 取得資料庫內的全部事件
    // TODO: 依照"月份" 依照"透析室" 篩選要顯示的
    // function getUserWardAllEvent() {
    //     const deferred = $q.defer();
    //     self.loading = true;
    //     CalendarEventsService.getWardEventJSON(self.ward).then((qdata) => {
    //         console.log('透析室事件 JSON qdata', qdata);
    //         // self.events = [];
    //         let dataObj = {};
    //         // 處理資料
    //         _.forEach(qdata, function (value) {
    //             dataObj = {};

    //             dataObj.id = value.id;
    //             dataObj.wardId = value.wardId;
    //             dataObj.eventType = value.eventType; // wardEvent
    //             dataObj.title = value.title;
    //             dataObj.content = value.content;
    //             dataObj.start = moment(value.startTime).format('YYYY/MM/DD HH:mm');
    //             dataObj.end = moment(value.endTime).format('YYYY/MM/DD HH:mm');
    //             dataObj.textColor = 'black'; // value.textColor;
    //             dataObj.backgroundColor = 'white'; // value.tagColor;
    //             dataObj.borderColor = value.tagColor;

    //             // dataObj.noEndDate = value.NoEndDate;
    //             dataObj.allDay = value.AllDay;
    //             // dataObj.executeStatus = value.ExecuteStatus === '' ? 'none' : value.ExecuteStatus;
    //             // dataObj.executeTime = value.ExecuteTime;

    //             dataObj.createdUserId = value.CreatedUserId;
    //             dataObj.createdUserName = value.CreatedUserName;
    //             dataObj.createdTime = value.CreatedTime;
    //             dataObj.modifiedUserId = value.ModifiedUserId;
    //             dataObj.modifiedUserName = value.ModifiedUserName;
    //             dataObj.modifiedTime = value.ModifiedTime;

    //             // 塞入self.events
    //             // self.events.push(dataObj);
    //             self.wardEvent.push(dataObj);

    //         });
    //         console.log('全部 透析室事件 self.events', self.events);

    //     })
    //     .catch((err) => {
    //         console.log('事件 JSON err', err);
    //         // showMessage('讀取失敗, ' + err.data);
    //         self.loading = false;
    //         self.isError = true;
    //     })
    //     .finally(() => {
    //         self.loading = false;
    //         deferred.resolve();
    //     });
    //         return deferred.promise;
    // }

    // 病人事件：包含病人的年度計畫
    function getPatientEvent() {
        const deferred = $q.defer();
        self.loading = true;
        CalendarEventsService.getPatientEvent($stateParams.patientId, moment(self.calendarDate).startOf('month').format('YYYYMMDD'), moment(self.calendarDate).endOf('month').format('YYYYMMDD')).then((qdata) => {
            console.log('病人事件 qdata', angular.copy(qdata));

            // 病人記事
            let patientEvent = _.filter(qdata.data, (o) => {
                return o.EventType === PATIENT_EVENT;
            });
            // 年度計畫
            let yearEvent = _.filter(qdata.data, (o) => {
                return o.EventType === YEAR_EVENT;
            });
            console.log('patientEvent', patientEvent);
            console.log('yearEvent', yearEvent);

            // 取得：病人記事
            if (patientEvent.length > 0) {
                let patientEventObj = {};
                _.forEach(patientEvent, function (value) {
                    patientEventObj = {};

                    // 以下欄位需配合fullcalendar的設定，名稱依照document的寫法
                    patientEventObj.id = value.Id; // 該筆事件id
                    patientEventObj.title = value.Title;
                    patientEventObj.content = value.Content;
                    patientEventObj.allDay = value.IsAllDay;
                    patientEventObj.editable = true; // 病人記事可以移動
                    patientEventObj.start = moment(value.StartTime).format('YYYY/MM/DD HH:mm');

                    // 顯示於 fullcalendar 上用
                    patientEventObj.end = getFullCalendarEndTimeByCondition(value.IsAllDay, patientEventObj.start, moment(value.EndTime).format('YYYY/MM/DD HH:mm'));

                    // patientEventObj.end = moment(value.EndTime).format('YYYY/MM/DD HH:mm');

                    // TINA
                    patientEventObj.EndTime = moment(value.EndTime).format('YYYY/MM/DD HH:mm');

                    patientEventObj.textColor = 'black'; // value.textColor;
                    patientEventObj.backgroundColor = '#fcf4ad'; // value.tagColor;
                    patientEventObj.borderColor = '#ff0066'; // #ff0066

                    // 以下欄位為後台資料
                    patientEventObj.eventId = $stateParams.patientId; // 病人記事：patientId, 透析室記事：wardId
                    patientEventObj.eventType = value.EventType; // patient
                    patientEventObj.hospitalId = value.HospitalId;
                    patientEventObj.groupCode = value.GroupCode;
                    patientEventObj.repeatEndTime = value.RepeatEndTime; // 重複記事的最後一天
                    // patientEventObj.tagColor = value.TagColor; // 病人記事沒有tagColor

                    patientEventObj.createdUserId = value.CreatedUserId;
                    patientEventObj.createdUserName = value.CreatedUserName;
                    patientEventObj.createdTime = value.CreatedTime;
                    patientEventObj.modifiedUserId = value.ModifiedUserId;
                    patientEventObj.modifiedUserName = value.ModifiedUserName;
                    patientEventObj.modifiedTime = value.ModifiedTime;

                    // 塞入self.events
                    // self.events.push(patientEventObj);
                    self.patientEvent.push(patientEventObj);
                });
            }

            // 取得：年度計畫
            if (yearEvent.length > 0) {
                let yearEventObj = {};
                _.forEach(yearEvent, function (value) {
                    yearEventObj = {};

                    // 以下欄位需配合fullcalendar的設定，名稱依照document的寫法
                    yearEventObj.id = value.Id; // 該筆事件id
                    yearEventObj.title = value.Title;
                    yearEventObj.content = value.Content;
                    yearEventObj.allDay = value.IsAllDay; // 一定是 true
                    yearEventObj.editable = false; // 年度計畫事件不可移動

                    // 顯示在日曆上的日期：年度計畫若未執行，則跳至今天日期
                    if (value.ProcessTime) {
                        // 已執行
                        yearEventObj.start = moment(value.StartTime).format('YYYY/MM/DD HH:mm');
                        yearEventObj.end = moment(value.EndTime).format('YYYY/MM/DD HH:mm');
                    } else {
                        // 未執行
                        // 先判斷該計畫是否是
                        if (moment(value.StartTime).format('YYYY/MM') === moment().format('YYYY/MM')) {
                            // 是今日月份
                            // 如果已經是目前月曆月份的最後一天，或是今天已超過目前月曆的月份，則不需再往下跳，要停留在目前月曆月份的最後一天
                            if (moment(moment().format('YYYY-MM-DD')).isSameOrAfter(moment(moment(self.calendarDate).format('YYYY-MM-DD')).endOf('month').format('YYYY-MM-DD'))) {
                                // 目前月曆最後一天，不需再往下跳，就停在最後一天
                                yearEventObj.start = moment(moment(self.calendarDate).format('YYYY-MM-DD')).endOf('month').format('YYYY-MM-DD');
                                yearEventObj.end = moment(moment(self.calendarDate).format('YYYY-MM-DD')).endOf('month').format('YYYY-MM-DD');
                            } else {
                                // 不是目前月曆月份的最後一天，跳至今天日期
                                yearEventObj.start = moment().format('YYYY-MM-DD');
                                yearEventObj.end = moment().format('YYYY-MM-DD');
                            }
                            // console.log('當月最後一天：', moment().endOf('month').format('YYYY-MM-DD'));
                            // console.log('是否 當月最後一天：', moment('2018-12-31').isSame(moment().endOf('month').format('YYYY-MM-DD')));
                        } else if (moment(moment(value.StartTime).format('YYYY/MM')).isBefore(moment().format('YYYY/MM'))) {
                            // 過去的月份 -> 跳到該月最後一天
                            yearEventObj.start = moment(moment(value.StartTime).format('YYYY-MM-DD')).endOf('month').format('YYYY-MM-DD');
                            yearEventObj.end = moment(moment(value.EndTime).format('YYYY-MM-DD')).endOf('month').format('YYYY-MM-DD');

                        } else {
                            // 未來的月份
                            yearEventObj.start = moment(value.StartTime).format('YYYY/MM/DD HH:mm');
                            yearEventObj.end = moment(value.EndTime).format('YYYY/MM/DD HH:mm');
                        }
                    }
                    yearEventObj.textColor = 'white'; // value.textColor;
                    yearEventObj.backgroundColor = '#F4511E'; // value.tagColor;  #8470ff  #F4511E
                    yearEventObj.borderColor = '#F4511E'; // #F4511E  #00C43E

                    // 以下欄位為後台資料所需
                    yearEventObj.eventId = $stateParams.patientId; // 病人記事：patientId, 透析室記事：wardId
                    yearEventObj.eventType = value.EventType; // year
                    yearEventObj.processTime = value.ProcessTime;
                    yearEventObj.executeStatus = value.ProcessTime ? true : false; // 後台沒有此欄位，但前台需要
                    // if (value.ExecuteTime) {
                    //     yearEventObj.executeStatus = true;
                    // } else {
                    //     yearEventObj.executeStatus = false;
                    // }
                    yearEventObj.hospitalId = value.HospitalId;
                    // yearEventObj.tagColor = value.TagColor; // 年度計畫沒有tagColor

                    // 執行人員
                    yearEventObj.processUserId = value.ProcessUserId;
                    yearEventObj.processUserName = value.ProcessUserName;

                    yearEventObj.createdUserId = value.CreatedUserId;
                    yearEventObj.createdUserName = value.CreatedUserName;
                    yearEventObj.createdTime = value.CreatedTime;
                    yearEventObj.modifiedUserId = value.ModifiedUserId;
                    yearEventObj.modifiedUserName = value.ModifiedUserName;
                    yearEventObj.modifiedTime = value.ModifiedTime;

                    // 塞入self.events
                    // self.events.push(yearEventObj);
                    self.yearEvent.push(yearEventObj);
                });

            }

            console.log('全部 事件 self.yearEvent', self.yearEvent);
        })
            .catch((err) => {
                console.log('病人事件 JSON err', err);
                // showMessage('讀取失敗, ' + err.data);
                self.loading = false;
                self.isError = true;
            })
            .finally(() => {
                self.loading = false;
                deferred.resolve();
            });
        return deferred.promise;
    }

    // TINA
    function getFullCalendarEndTimeByCondition(allday, startDate, endDate) {
        console.log('getFullCalendarEndTimeByCondition');

        if (allday && (moment(startDate).format('YYYYMMDD') !== moment(endDate).format('YYYYMMDD'))) {
            return moment(moment(endDate).add(1, 'd').format('YYYY/MM/DD HH:mm'));
        }

        return moment(moment(endDate).format('YYYY/MM/DD HH:mm'));

    }

    // 病人的事件-------------------------------
    // 新增：新增病人記事
    self.gotoNewPatientEventDialog = function gotoNewPatientEventDialog(date, editType, viewType, allEventCount) {

        let patientId = $stateParams.patientId;

        let data = {
            date,
            editType,
            viewType, // 月/週
            allEventCount,
            patientId
        };

        $mdDialog.show({
            controller: 'patientEventDialogController',
            template: patientEventDialogTpl,
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

            _.forEach(data.newEvent, (o) => {
                // 月曆顯示
                self.events.push({
                    eventType: PATIENT_EVENT,
                    id: o.Id,
                    title: o.Title,
                    allDay: o.IsAllDay,
                    start: new Date(moment(o.StartTime).format('YYYY-MM-DD HH:mm')),
                    end: getFullCalendarEndTimeByCondition(o.IsAllDay, o.StartTime, o.EndTime),
                    EndTime: o.EndTime,
                    content: o.Content,
                    textColor: 'black',
                    backgroundColor: '#fcf4ad', // #ff0080  #fffc00
                    borderColor: '#ff0066', // #00308f  #0029ff

                    createdUserId: SettingService.getCurrentUser().Id,
                    createdUserName: SettingService.getCurrentUser().Name,
                    createdTime: o.CreatedTime,
                    modifiedUserId: '',
                    modifiedUserName: '',
                    modifiedTime: ''
                });
            });


            console.log('最後self.events', self.events);

            $timeout(() => {
                // 重新render事件
                // $('#calendar').fullCalendar('removeEvents');
                // $('#calendar').fullCalendar('addEventSource', self.events);
                // $('#calendar').fullCalendar('rerenderEvents');

                if (self.filterBtn === ALL_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === DIALYSIS_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === PATIENT_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === YEAR_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
            }, 0);

            // getPatientEvent().then(() => {
            //     self.events = self.events.concat(self.dialysisEvent, self.wardEvent, self.patientEvent, self.yearEvent);
            //     console.log('總 self.events', self.events);
            //     rerenderCalendar(self.events);
            // });

            showMessage('新增成功');

        }, (cancel) => {
            console.log('dialog cancel', cancel);
        });
    };


    // 修改：可以修改ward及patient的行事曆
    self.gotoUpdatePatientEventDialog = function gotoUpdatePatientEventDialog(eventObj, editType, allEventsObj) {

        let patientId = $stateParams.patientId;

        let data = {
            eventObj,
            editType,
            allEventsObj,
            patientId
        };

        $mdDialog.show({
            controller: 'patientEventDialogController',
            template: patientEventDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            // fullscreen: false
            fullscreen: $mdMedia('xs')
        }).then((newData) => {
            console.log('dialog updateEvent 修改病人記事', data.updateEvent);

            // 找到相對應的資料物件index
            let index = _.findIndex(self.events, function (o) {
                return o.id === data.updateEvent.Id;
            });
            console.log('index', index);

            // TODO: 暫不開放透析室記事
            // ui更新：透析室記事
            // if (data.updateEvent.eventType === WARD_EVENT) {
            //     self.events[index] = {
            //         eventType: WARD_EVENT,
            //         id: data.updateEvent.id,
            //         title: data.updateEvent.title,
            //         content: data.updateEvent.content,
            //         start: new Date(data.updateEvent.start),
            //         end: new Date(data.updateEvent.end),
            //         textColor: 'black',
            //         backgroundColor: 'white',
            //         borderColor: data.updateEvent.tagColor,
            //         allDay: data.updateEvent.allDay,
            //     };
            // }

            // ui更新：病人記事
            if (data.updateEvent.EventType === PATIENT_EVENT) {
                console.log('修改 in');

                eventObj.title = data.updateEvent.Title;
                eventObj.allDay = data.updateEvent.IsAllDay;
                eventObj.start = new Date(moment(data.updateEvent.StartTime).format('YYYY-MM-DD HH:mm'));

                // TINA
                eventObj.end = getFullCalendarEndTimeByCondition(data.updateEvent.IsAllDay, data.updateEvent.StartTime, data.updateEvent.EndTime);

                eventObj.EndTime = data.updateEvent.EndTime;
                // eventObj.end = new Date(moment(data.updateEvent.EndTime).format('YYYY-MM-DD HH:mm'));

                eventObj.content = data.updateEvent.Content;
                eventObj.modifiedUserId = data.updateEvent.ModifiedUserId;
                eventObj.modifiedUserName = data.updateEvent.ModifiedUserName;
                eventObj.modifiedTime = data.updateEvent.ModifiedTime;

                console.log('dialog update PATIENT Event eventObj', eventObj);

                self.events[index] = eventObj;

                // self.events[index] = {
                //     eventType: PATIENT_EVENT,
                //     id: data.updateEvent.Id,
                //     title: data.updateEvent.Title,
                //     allDay: data.updateEvent.IsAllDay,
                //     start: new Date(moment(data.updateEvent.StartTime).format('YYYY-MM-DD HH:mm')),
                //     end: new Date(moment(data.updateEvent.EndTime).format('YYYY-MM-DD HH:mm')),
                //     content: data.updateEvent.Content,
                //     textColor: 'black',
                //     backgroundColor: '#fcf4ad',
                //     borderColor: '#ff0066',
                //     modifiedUserId: data.updateEvent.ModifiedUserId,
                //     modifiedUserName: data.updateEvent.ModifiedUserName
                //     // modifiedTime: ''
                // };
            }

            console.log('修改完成最後 self.events', self.events);

            $timeout(() => {
                // // 重新render事件
                // $('#calendar').fullCalendar('removeEvents');
                // $('#calendar').fullCalendar('addEventSource', self.events);
                // $('#calendar').fullCalendar('rerenderEvents');
                if (self.filterBtn === ALL_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === DIALYSIS_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === PATIENT_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === YEAR_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
            }, 0);

            showMessage('修改成功');

        }, (cancel) => {
            console.log('dialog cancel', cancel);
            // 沒有修改
            $timeout(() => {
                // // 重新render事件
                // $('#calendar').fullCalendar('removeEvents');
                // $('#calendar').fullCalendar('addEventSource', self.events);
                // $('#calendar').fullCalendar('rerenderEvents');
                if (self.filterBtn === ALL_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === DIALYSIS_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === PATIENT_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === YEAR_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
            }, 0);
        });
    };


    // 修改：年度計畫
    self.gotoUpdateYearEventDialog = function gotoUpdateYearEventDialog(eventObj, editType, allEventsObj, eventType) {
        let data = {
            eventObj,
            editType,
            allEventsObj,
            eventType
        };

        $mdDialog.show({
            controller: 'yearEventDialogController',
            template: yearEventDialogTpl,
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
            console.log('dialog update YEAR Event', data.updateEvent);

            // 找到相對應的資料物件index
            let index = _.findIndex(self.events, function (o) {
                return o.id === data.updateEvent.Id;
            });
            console.log('index', index);

            // ui更新：年度計畫
            if (data.updateEvent.EventType === YEAR_EVENT) {

                // 將 eventObj 部分值改掉

                eventObj.title = data.updateEvent.Title;
                eventObj.content = data.updateEvent.Content;
                eventObj.start = new Date(moment(data.updateEvent.StartTime).format('YYYY/MM/DD HH:mm'));
                eventObj.end = new Date(moment(data.updateEvent.EndTime).format('YYYY/MM/DD HH:mm'));
                eventObj.executeStatus = data.updateEvent.ProcessTime ? true : false;
                eventObj.processTime = data.updateEvent.ProcessTime ? new Date(moment(data.updateEvent.ProcessTime).format('YYYY/MM/DD HH:mm')) : null;
                eventObj.processUserId = data.updateEvent.ProcessUserId;
                eventObj.processUserName = data.updateEvent.ProcessUserName;
                eventObj.modifiedUserId = data.updateEvent.ModifiedUserId;
                eventObj.modifiedUserName = data.updateEvent.ModifiedUserName;
                eventObj.modifiedTime = data.updateEvent.ModifiedTime;

                console.log('dialog update YEAR Event eventObj', eventObj);

                self.events[index] = eventObj;
                // self.events[index] = {
                //     eventType: YEAR_EVENT,
                //     id: data.updateEvent.Id,
                //     title: data.updateEvent.Title,
                //     allDay: data.updateEvent.IsAllDay,
                //     content: data.updateEvent.Content,
                //     start: new Date(moment(data.updateEvent.StartTime).format('YYYY/MM/DD HH:mm')),
                //     end: new Date(moment(data.updateEvent.EndTime).format('YYYY/MM/DD HH:mm')),
                //     textColor: 'white',
                //     backgroundColor: '#F4511E',
                //     borderColor: '#F4511E',
                //     executeStatus: data.updateEvent.ProcessTime ? true : false,
                //     processTime: data.updateEvent.ProcessTime ? new Date(moment(data.updateEvent.ProcessTime).format('YYYY/MM/DD HH:mm')) : null,

                //     processUserId: data.updateEvent.ProcessUserId,
                //     processUserName: data.updateEvent.ProcessUserName,

                //     modifiedUserId: data.updateEvent.ModifiedUserId,
                //     modifiedUserName: data.updateEvent.ModifiedUserName
                // };
            }

            $timeout(() => {
                // // 重新render事件
                // $('#calendar').fullCalendar('removeEvents');
                // $('#calendar').fullCalendar('addEventSource', self.events);
                // $('#calendar').fullCalendar('rerenderEvents');
                if (self.filterBtn === ALL_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === DIALYSIS_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === PATIENT_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === YEAR_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
            }, 0);

            showMessage('修改成功');

        }, (cancel) => {
            console.log('dialog cancel', cancel);
            // 沒有修改
            $timeout(() => {
                // // 重新render事件
                // $('#calendar').fullCalendar('removeEvents');
                // $('#calendar').fullCalendar('addEventSource', self.events);
                // $('#calendar').fullCalendar('rerenderEvents');
                if (self.filterBtn === ALL_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === DIALYSIS_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === PATIENT_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
                if (self.filterBtn === YEAR_EVENT) {
                    self.getOneEventType(self.filterBtn);
                }
            }, 0);
        });
    };

    // 年度計畫
    self.gotoYearPlanDialog = function gotoYearPlanDialog() {

        let data = {
            calendarDate: self.calendarDate
        };

        $mdDialog.show({
            controller: 'yearPlanDialogController',
            template: yearPlanDialogTpl,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            controllerAs: 'dialog',
            locals: {
                data
            },
            fullscreen: true
            // fullscreen: $mdMedia('xs')
        }).then((ok) => {
            // 月曆重新整理
            if (CalendarEventsService.getIsYearPlanDirty()) {
                reloadDialysisHeader();
            }
        }, (cancel) => {
            // 存檔完後點選x -> 關掉dialog
            if (CalendarEventsService.getIsYearPlanDirty()) {
                reloadDialysisHeader();
            }
        });
    };


}

import eventDeleteDialogTpl from './eventDeleteDialog.html';
// 年度計畫 yearEventDialogController
angular
    .module('app')
    .controller('yearEventDialogController', yearEventDialogController);

    yearEventDialogController.$inject = ['$state', '$mdDialog', 'showMessage', 'data', '$mdMedia', 'SettingService', 'CalendarEventsService', 'userService'];

function yearEventDialogController(
    $state,
    $mdDialog,
    showMessage,
    data,
    $mdMedia,
    SettingService,
    CalendarEventsService,
    userService
) {
    const self = this;

    console.log('修改執行 年度計畫 data', data);

    let EDITTYPE_UPDATE = 'update';

    self.editType = data.editType;
    self.eventType = data.eventType;

    // 修改一個事件物件：需要傳值出去
    data.updateEvent = {};

    let YEAR_EVENT = 'year'; // 年度計畫


    // 取得所有使用者
    getAllUsers();
    // 取得所有使用者
    function getAllUsers() {
        self.loading = true;

        userService.get().then((q) => {
            console.log('取得所有使用者 q', angular.copy(q));
            self.allProcessUser = q.data;
            // 不選擇用
            self.allProcessUser.unshift({ Name: 'NoUser', EmployeeId: '' });

            self.allProcessUser = self.allProcessUser; // 綁定前端，配合顯示資料會變動

            self.allProcessUserList = self.allProcessUser; // 處理資料用，資料不會變動


            // 修改 執行人員 init
            if (self.editType === EDITTYPE_UPDATE) {
                // console.log('執行者：', data.eventObj.processUserId, data.eventObj.processUserName);

                if (data.eventObj.processUserId === null) {
                    // 沒有執行人員
                    self.processUser = self.allProcessUserList[0];

                } else {
                    let findUser = _.filter(self.allProcessUserList, function (o) {
                        return o.Id === data.eventObj.processUserId;
                    });

                    console.log('執行者 findUser：', findUser);

                    // 如果在清單中已找不到，自行push上去
                    if (!findUser[0]) {
                        self.allProcessUserList.push({
                            Name: data.eventObj.processUserName,
                            Id: data.eventObj.processUserId
                        });
                        findUser[0] = {
                            Name: data.eventObj.processUserName,
                            Id: data.eventObj.processUserId
                        };
                    }
                    self.processUser = findUser[0];
                }
            }
            self.loading = false;
        }, (err) => {
            console.log('取得所有使用者 err', err);
            showMessage('取得資料錯誤，請重新點選');
            self.loading = false;
        });
    }


    // 修改init
    if (self.editType === EDITTYPE_UPDATE) {
        console.log('修改 單筆年度計畫', data.eventObj);

        self.id = data.eventObj.id;
        self.title = data.eventObj.title;
        // self.startDate = new Date(moment(data.eventObj._start).format('YYYY-MM-DD'));
        // self.startTime = new Date(moment(data.eventObj._start).format('YYYY-MM-DD HH:mm'));
        // self.endDate = new Date(moment(data.eventObj._end).format('YYYY-MM-DD'));
        // self.endTime = new Date(moment(data.eventObj._end).format('YYYY-MM-DD HH:mm'));
        self.content = data.eventObj.content;
        self.allDay = data.eventObj.allDay; // TODO: 年度計畫 always true

        self.executeStatus = data.eventObj.processTime ? true : false; // 只有前端判斷需要，不需存入資料庫
        self.processTime = data.eventObj.processTime ? new Date(moment(data.eventObj.processTime).format('YYYY/MM/DD HH:mm')) : null;
        
        // self.eventType = YEAR_EVENT;

        self.createdTime = data.eventObj.createdTime ? moment(data.eventObj.createdTime).format('YYYY/MM/DD HH:mm') : null;
        self.createdUserName = data.eventObj.createdUserName ? data.eventObj.createdUserName : null;

        self.modifiedTime = data.eventObj.modifiedTime ? moment(data.eventObj.modifiedTime).format('YYYY/MM/DD HH:mm') : null;
        self.modifiedUserName = data.eventObj.modifiedUserName ? data.eventObj.modifiedUserName : null;

        // 處理結束時間null
        // if (!data.eventObj._end) {
        //     self.endDate = self.startDate;
        // }
        // checkTime('end');
        // compareDateTime();
    }

    // 執行狀態
    self.executeStatusChanged = function executeStatusChanged(status) {
        if (status) {
            // 預設為當天當時
            self.processTime = new Date(moment(moment(data.eventObj._start).format('YYYY/MM/DD') + ' ' + moment().format('HH:mm')).format('YYYY/MM/DD HH:mm'));
        } else {
            self.processTime = null;
        }
    };


    // 修改年度計畫
    self.editEvent = function editEvent(form) {
        if (form.$valid) {

            // 真正要上傳的data
            let uploadUpdateEvent = {};

            // 要修改的資料
            uploadUpdateEvent.Title = self.title;
            
            // 全天
            uploadUpdateEvent.IsAllDay = self.allDay;

            // 處理空content
            uploadUpdateEvent.Content = self.content ? self.content : null;

            // data.updateEvent.executeStatus = self.executeStatus; // 執行狀態 true, false

            if (self.executeStatus) {
                // 已執行
                // 開始日與結束日一樣：存成執行時間的日期
                uploadUpdateEvent.StartTime = moment(self.processTime);
                uploadUpdateEvent.EndTime = moment(self.processTime);
                // 執行時間
                uploadUpdateEvent.ProcessTime = moment(self.processTime);

                // 執行人員
                uploadUpdateEvent.ProcessUserId = self.processUser.Id;
                uploadUpdateEvent.ProcessUserName = self.processUser.Name;

            } else {
                // 未執行 // TODO: 測試修改年度計畫
                uploadUpdateEvent.StartTime = moment(data.eventObj._start);
                uploadUpdateEvent.EndTime = moment(data.eventObj._start);
                uploadUpdateEvent.ProcessTime = null;

                // 執行人員
                uploadUpdateEvent.ProcessUserId = null;
                uploadUpdateEvent.ProcessUserName = null;
            }

            uploadUpdateEvent.Id = data.eventObj.id;
            uploadUpdateEvent.EventId = data.eventObj.eventId;
            uploadUpdateEvent.HospitalId = SettingService.getCurrentHospital().Id;
            uploadUpdateEvent.TagColor = null; // 年度計畫不需要
            uploadUpdateEvent.EventType = YEAR_EVENT;

            uploadUpdateEvent.ModifiedUserId = SettingService.getCurrentUser().Id;
            uploadUpdateEvent.ModifiedUserName = SettingService.getCurrentUser().Name;
            uploadUpdateEvent.ModifiedTime = moment();

            uploadUpdateEvent.CreatedUserId = data.eventObj.createdUserId;
            uploadUpdateEvent.CreatedUserName = data.eventObj.createdUserName;
            uploadUpdateEvent.CreatedTime = data.eventObj.createdTime;

            console.log('上傳 年度 uploadUpdateEvent', uploadUpdateEvent);


            // TODO: 上傳，同時改變前端顯示
            CalendarEventsService.putEvent(uploadUpdateEvent).then((q) => {
                console.log('修改年度計畫 q', q);
                console.log('上傳回月曆顯示 年度修改 data.updateEvent', q.data);
                // 回傳的新增記事陣列
                data.updateEvent = q.data;
                
                // 關掉 dialog
                $mdDialog.hide();
            }, (err) => {
                // TODO: error control
                console.log('修改年度計畫 err', err);
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

    // 刪除記事dialog ventDeleteDialogTpl
    function showAlertEventDelete(id, title) {

        let eventType = 'year';
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
            $mdDialog.hide();

        }, (cancel) => {
            // 關掉dialog或按取消
            console.log('eventDelete dialog cancel', cancel);
        });
    }


    // 執行人員 搜尋使用者
    self.searchProcessUser = function searchProcessUser(searchStr) {
        console.log('搜尋', searchStr);
        self.allProcessUser = _.filter(angular.copy(self.allProcessUserList), (d) => {
            return d.Name.toLowerCase().includes(searchStr.toLowerCase());
        });
    };


    // clear search and load user data
    self.clearSearch = function () {
        self.searchStr = '';
        self.allProcessUser = self.allProcessUserList;
    };
    

    // 選擇執行人員
    self.selectProcessUser = function (processUser) {
        console.log('選擇執行人員:', processUser);
        if (processUser.Name !== 'NoUser') {
            console.log('有 執行人員:', processUser);
        } else {
            // 如果不選擇
            self.processUser = {
                Id: null,
                Name: null
            };
        }
    };


    self.cancel = function cancel() {
        $mdDialog.cancel();
    };


}

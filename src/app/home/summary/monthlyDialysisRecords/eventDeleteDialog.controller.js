// 確認刪除記事
angular
    .module('app')
    .controller('eventDeleteDialogController', eventDeleteDialogController);

eventDeleteDialogController.$inject = ['$state', '$mdDialog', 'deleteData', 'CalendarEventsService', 'showMessage'];

function eventDeleteDialogController(
    $state,
    $mdDialog,
    deleteData,
    CalendarEventsService,
    showMessage
) {
    const self = this;
    self.eventType = deleteData.eventType;
    self.title = deleteData.title;
    console.log('eventDeleteDialogController id', deleteData.id);


    self.delete = function () {
        CalendarEventsService.deleteEvent(deleteData.id).then((q) => {
            console.log('刪除成功DeleteDialog q', q);
            showMessage('刪除成功');
            $mdDialog.hide();

        }, (err) => {
            console.log('刪除成功DeleteDialog err', err);
            showMessage('刪除失敗，請重新操作');

        });
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}

angular.module('app').component('lastRefreshTime', {
    template: `<div class="list-header">
                <h6>{{$ctrl.lastRefreshTitle}}</h6>
                <md-button class="md-icon-button" ng-click="$ctrl.refresh(); $event.stopPropagation()">
                <i class="material-icons">refresh</i>
                </md-button></div>`,
    bindings: {
        accesstime: '<',
        refresh: '&'
    },
    controller: lastRefreshTimeCtrl
});

lastRefreshTimeCtrl.$inject = ['$interval', '$filter'];

function lastRefreshTimeCtrl($interval, $filter) {

    let self = this;
    let $translate = $filter('translate');

    // execute function every 60 seconds
    const interval = $interval(_calculateRefreshTime, 60000);

    // check for changes, assign current time if there are changes
    self.$onChanges = function (changes) {
        if (changes.accesstime) {
            self.time = changes.accesstime.currentValue;
            showTitle(self.time);
            console.log('onChanges');
        }
    };

    // 離開網頁時，所需的動作
    self.$onDestroy = function onDestroy() {
        // 清空 interval
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
        }
    };

    // 計算最後更新時間
    function _calculateRefreshTime() {
        showTitle(self.time);
        console.log('_calculateRefreshTime');
    }

    //function to display last fresh time message
    function showTitle(time) {
        // self.lastRefreshTitle = '更新: ' + moment(time).fromNow();
        // 若沒有 time 則不顯示
        let timeFromNow = (time && moment(time).fromNow()) || '';
        self.lastRefreshTitle = $translate('lastRefreshTime.refreshTime', { time: timeFromNow });
    }
}

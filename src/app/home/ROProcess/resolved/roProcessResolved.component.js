import tpl from './roProcessResolved.html';

angular.module('app').component('roProcessResolved', {
    template: tpl,
    controller: roProcessResolvedCtrl
});

roProcessResolvedCtrl.$inject = ['$scope', '$stateParams', 'roProcessService'];
function roProcessResolvedCtrl($scope, $stateParams, roProcessService) {
    const self = this;

    self.thisMonth = moment().format('YYYY-MM');

    $scope.$on('refresh', () => {
        self.refresh();
    });

    self.$onInit = function () {

        self.currentDate = $stateParams.month ? new Date($stateParams.month) : new Date();
        self.disableNextMonth = isDisableNextMonth(self.currentDate, self.thisMonth);
        console.log('ro resolved query condition', self.currentDate);
        loadingData();
    };

    self.changeDate = function (num) {
        self.currentDate = new Date(moment(self.currentDate).add(num, 'month'));
        self.disableNextMonth = isDisableNextMonth(self.currentDate, self.thisMonth);
        loadingData();
    };

    function isDisableNextMonth(currentDate, thisMonth) {
        if (moment(moment(currentDate).format('YYYY-MM')).diff(thisMonth, 'month') >= 0) {
            return true;
        }
        return false;
    }

    function loadingData() {
        self.loading = true;

        // 取特定時間區間內已處理的資料
        roProcessService.get(true, moment(self.currentDate).format('YYYYMM01'), moment(self.currentDate).endOf('month').format('YYYYMMDD')).then((res) => {
            if (res.data) {
                // 因為要綁 input 將時間統一處理
                self.data = res.data.map((o) => {
                    o.AbnormalTime = o.AbnormalTime ? new Date(moment(o.AbnormalTime).format('YYYY/MM/DD HH:mm')) : null;
                    o.ResolvedTime = o.ResolvedTime ? new Date(moment(o.ResolvedTime).format('YYYY/MM/DD HH:mm')) : null;
                    return o;
                });
            }

            // emit lastAccessTime
            self.lastAccessTime = roProcessService.getLastAccessTime();

            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });

    }

    self.refresh = function () {
        console.log('ro resolved refresh');
        loadingData();
    };

}

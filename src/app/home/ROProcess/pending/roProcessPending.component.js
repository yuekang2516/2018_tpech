import tpl from './roProcessPending.html';

angular.module('app').component('roProcessPending', {
    template: tpl,
    controller: roProcessPendingCtrl
});

roProcessPendingCtrl.$inject = ['$scope', 'roProcessService'];
function roProcessPendingCtrl($scope, roProcessService) {
    const self = this;

    $scope.$on('refresh', () => {
        self.refresh();
    });

    self.$onInit = function () {
        loadingData();
    };

    function loadingData() {
        self.loading = true;
        // 取所有未處理的紀錄
        roProcessService.get().then((res) => {
            if (res.data) {
                // 因為要綁 input 將時間統一處理
                self.data = res.data.map((o) => {
                    o.AbnormalTime = o.AbnormalTime ? new Date(moment(o.AbnormalTime).format('YYYY/MM/DD HH:mm')) : null;
                    o.ResolvedTime = o.ResolvedTime ? new Date(moment(o.ResolvedTime).format('YYYY/MM/DD HH:mm')) : null;
                    return o;
                });

            }

            self.lastAccessTime = roProcessService.getLastAccessTime();

            // emit lastAccessTime
            $scope.$emit('lastAccessTime', roProcessService.getLastAccessTime());

            self.isError = false;
        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    self.refresh = function () {
        console.log('ro pending refresh');
        loadingData();
    };
}

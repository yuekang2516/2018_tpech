import tpl from './patientList.html';

angular.module('app').component('patientList', {
    template: tpl,
    controller: PatientListController,
    controllerAs: 'vm',
    bindings: {
        patients: '<'
    }
});

PatientListController.$inject = ['dialysisService', '$sce', '$scope', '$state', '$mdSidenav', 'PatientService', 'SettingService', 'SessionStorageService'];
function PatientListController(dialysisService, $sce, $scope, $state, $mdSidenav, PatientService, SettingService, SessionStorageService) {
    console.log('enter patient list controller');
    let self = this;

    // 給前端顯示病人狀態及透析狀態
    self.patients = self.patients.map((item) => {
        // 病人透析狀態
        // 檢查順序: EndTime(關表) -> AfterWeight/BP(透析完成) -> EstimatedTime(透析中) -> BeforeWeight/BP StartTime(開表)
        // 先檢查是否已關表

        // 病人透析狀態
        // StatusHtml 供前端判斷該顯示哪個狀態: 1->洗前, 2->XX:XX結束, 2.1->過期, 3->洗後, 4->關表
        // 先檢查是否為今日
        if (item.LastDialysisInfo && item.LastDialysisInfo.StartTime && moment(item.LastDialysisInfo.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            // 檢查順序 (符合即不須繼續比對): EndTime(關表) -> AfterWeight/BP(透析完成) -> EstimatedTime(透析中) -> BeforeWeight/BP StartTime(開表)
            if (item.LastDialysisInfo.EndTime) {
                item.StatusHtml = 4;
            } else if (item.LastDialysisInfo.AfterWeight || item.LastDialysisInfo.AfterBP.BPS || item.LastDialysisInfo.AfterBP.BPD) {
                item.StatusHtml = 3;
            } else if (item.LastDialysisInfo.EstimatedEndTime && !/0001-01-01/.test(item.LastDialysisInfo.EstimatedEndTime)) {
                if (moment(item.LastDialysisInfo.EstimatedEndTime).format('YYYYMMDDHHmm') < moment().format('YYYYMMDDHHmm')) {
                    item.StatusHtml = 2.1;  // 過期
                } else {
                    item.StatusHtml = 2;
                }
            } else if (item.LastDialysisInfo.DialysisDataFirstTime && !/0001-01-01/.test(item.LastDialysisInfo.DialysisDataFirstTime) && moment(item.LastDialysisInfo.DialysisDataFirstTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {  // 若無剩餘時間則用開始的透析機時間
                item.StatusHtml = 2.2; // 顯示透析中即可
            } else {    // start time
                item.StatusHtml = 1;
            }
        }
        return item;
    });

    self.goToDialysis = function (item) {
        // debugger;
        // self.loading = true;
        // TODO: check for bugs
        if ($state.current.name === 'myPatients') {
            SessionStorageService.setItem('homeStateName', 'myPatients'); // 紀錄由我的病人到summary，由summary返回上一頁時要回到我的病人
            $state.go('summary', { patientId: item.Id });
        } else {
            $state.go('summary', { patientId: item.Id }, { location: 'replace' });
        }
    };

    // infinite-scroll test
    // let dataNumOnce = 10;

    // self.$onChanges = function () {
    //     if (self.patients) {
    //         if (self.patients.length > dataNumOnce) {
    //             self.currentPatients = self.patients.slice(0, dataNumOnce + 1);  // 供畫面顯示使用的資料
    //         } else {
    //             self.currentPatients = self.patients;
    //         }
    //     }
    // };

    // scroll 至底時呼叫 (infinite scroll)
    // self.loadMore = function () {
    //     let last = self.currentPatients.length - 1;
    //     if (last > 1) {
    //         for (let i = 1; i <= dataNumOnce + 1; i++) {
    //             self.currentPatients.push(self.patients[last + i]);
    //         }
    //     }
    // };

    // Todo virtual repeat 必須給高度，因此需動態去算
    // 可直接減去 toolbar & list-header 的高度
    // self.getListHeight = function () {
    //     return { height: '' + (($window.innerHeight - 110) / 16) + 'px' };
    // };
    // $window.addEventListener('resize', onResize);
    // function onResize() {
    //     self.getListHeight();
    // }
    // $scope.$on('$destroy', function () {
    //     $window.removeEventListener('resize', onResize);
    // });

}

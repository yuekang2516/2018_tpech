import tpl from './highRiskFaller.html';
import dialog from './hRFEdit.dialog.html';
import './highRiskFaller.less';


angular.module('app').component('highRiskFaller', {
    template: tpl,
    controller: highRiskFallerCtrl
});

highRiskFallerCtrl.$inject = [
    '$scope', '$state', '$stateParams', 'SettingService', 'highRiskFallerService',
    '$mdDialog', '$mdMedia', 'PatientService', '$filter', 'showMessage'
];
function highRiskFallerCtrl(
    $scope, $state, $stateParams, SettingService, highRiskFallerService,
    $mdDialog, $mdMedia, PatientService, $filter, showMessage
) {
    const self = this;

    self.totalCnt = 0;
    self.deletedItemsLength = -1;
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    let $translate = $filter('translate');
    // 預設狀態
    self.lastAccessTime = moment();
    self.myStyle = { right: '120px'}
    
    self.patientId = $stateParams.patientId;
    self.currentPatient = [];
    // List Data Array
    self.hRFList = [];
    self.hRFList.AgeOver65Name = "";
    self.hRFList.HaveFallenBeforeName = "";
    // self.hRFList.CanNotWalkMyself="";
    // self.hRFList.LimbDysfunction="";
    // self.hRFList.UnconsciousnessOrMci="";
    // self.hRFList.MalnutritionOrDizziness="";
    // self.hRFList.Percent25AnemiaHct="";
    // self.hRFList.BloodPressureInstability="";
    // self.hRFList.BlurredVisionOrBlindness="";
    // self.hRFList.TakeDrugsAffectConscious="";

    $scope.$on('highRiskFaller-dataChanged', () => {
        self.refresh();
    });

    self.$onInit = function onInit() {
        self.getList();
        
    };

    self.getList = function () {
        self.loading = true;

        // 依據 state name 決定要拿什麼資料
        let hdParams = {};
        let hdState = ['summary', 'highRiskFallerHD', 'allHighRiskFallerHD'];
        if (hdState.indexOf($state.current.name) > -1) {
            hdParams.sysType = 'HD';
            hdParams.headerId = $state.current.name === hdState[2] ? '' : $stateParams.headerId;
        }else{
            hdParams.sysType = 'PD';
            hdParams.headerId = "";
        }
        //取得清單
        highRiskFallerService.getListByPatientID(self.patientId, hdParams.headerId, hdParams.sysType).then((res) => {
            console.log("highRiskFallerService getList Success", res);
            // debugger;
            // self.serviceData = q.data;
            let Total = res.data.length;
            
            self.totalCnt = Total;
            maxpage = parseInt(Total / limit) + 1; // 總頁數
            if (Total% limit === 0) {
                maxpage -= 1;
            }
            // console.log(maxpage);
            if (Total > 0) {
                
                self.deletedItemsLength = _.filter(res.data, { 'Status': 'Deleted' }).length;
                self.hRFList = res.data;
                self.hRFList = $filter('orderBy')(self.hRFList,'-Record_Date');
                // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
            } else {
                self.hRFList = [];
            }
            //self.lastAccessTime = NursingRecordService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, (res) => {
            self.loading = false;
            self.isError = true;
            console.log("highRiskFallerService getList Fail", res);
        });
        //病患資料
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;

            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("highRiskFallerService getList Fail", res);
        });

    };
    // scroll 至底時呼叫
    self.loadMore = function loadMore() {
        if (self.loading) {
          return;
        }
        self.loading = true;
        page += 1;
        if (page > maxpage) {
          self.loading = false;
          return;
        }
        // // 呼叫取得NursingRecord的Service
        // NursingRecordService.getByIdPage($stateParams.patientId, page, limit).then((q) => {
        //   console.log(q);
        //   // 為了維持與service 的 lastAllRecords 綁定，後端暫存已做累加 data
        //   self.serviceData = q.data.Results;
        //   // for (let i = 0; i < q.data.Results.length; i++) {
        //   //     self.serviceData.push(q.data.Results[i]);
        //   // }
        //   // self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
        //   self.loading = false;
        //   self.isError = false; // 顯示伺服器連接失敗的訊息
        // }, () => {
        //   self.loading = false;
        //   self.isError = true;
        //   // showMessage(lang.ComServerError);
        // });
      };

    self.openCreateDialog = function () {
        let hRFItem = {};
        hRFItem.Total = 0;
        hRFItem.isCreate = true;
        hRFItem.isCopy = false;
        //hRFItem.Record_Date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        hRFItem.Record_Date = new Date();
        $mdDialog.show({
            controller: 'hRFEditController',
            template: dialog,
            locals: {
                hRFItem: hRFItem,
                headerId: $stateParams.headerId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    // 為了讓 HD 透析總覽可以直接叫用新增
    SettingService.setCallback('createhighRiskFaller', self.openCreateDialog);

    self.openEditDialog = function (hRFItem, isCopy) {
        console.log("vtPhoneEditController openEditDialog");
        hRFItem.Record_Date = new Date(moment(hRFItem.Record_Date).format("YYYY-MM-DD HH:mm:ss"));
        hRFItem.isCopy = isCopy;
        hRFItem.isCreate = false;
        console.log("hRFItem", hRFItem);
        $mdDialog.show({
            controller: 'hRFEditController',
            template: dialog,
            locals: {
                hRFItem: hRFItem,
                headerId: $stateParams.headerId
            },
            parent: angular.element(document.body),
            //clickOutsideToClose: true,
            fullscreen: true,
            controllerAs: '$ctrl'
        }).then((result) => {
            self.getList();
        });

    };

    // 刪除    
    self.deleteOne = function (ev, hRFItem) {
        const confirm = $mdDialog.confirm()

            .title($translate('highRiskFaller.component.confirmDelete')) // '刪除確認'
            .textContent($translate('highRiskFaller.component.textContent')) //  '您即將刪除此筆資料，點擊確認後會刪除此筆資料'
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .ok($translate('highRiskFaller.component.deleteOk')) // '刪除'
            .cancel($translate('highRiskFaller.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {

            hRFItem.Status = "Deleted";
            console.log("deleteOne", hRFItem);

            highRiskFallerService.put(hRFItem).then((res) => {
                console.log("highRiskFaller update success", res);
                showMessage($translate('highRiskFaller.component.deleteSuccess'));
            }, (res) => {
                console.log("highRiskFaller update fail", res);
                showMessage($translate('highRiskFaller.component.deleteFail'));
            });

            self.getList();
            $mdDialog.hide();

        }, () => {
            $mdDialog.hide();
        });
    };


      // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        // 為了畫面顯示合理，須將資料清空 (不能用 ng-show，infinite scroll 會覺得到底而一直呼叫 loadmore)
        self.hRFList = []
        self.getList();
        self.lastAccessTime = moment();
    };

    self.$onDestroy = function () {
        // 清空 interval
        // if (angular.isDefined(interval)) {
        //     $interval.cancel(interval);
        // }
        // if (angular.isDefined(executeInterval)) {
        //     $interval.cancel(executeInterval);
        // }
    };

    self.back = function back() {
        history.go(-1);
    };

    // For HD
    // 區分是從PD或HD使用
    self.headerId = $stateParams.headerId || false;

    // 區分是否為歷次，歷次不能新增
    self.isAll = $state.current.name === 'allHighRiskFallerHD';
}

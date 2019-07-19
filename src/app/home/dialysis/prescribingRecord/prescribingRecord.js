import tpl from './prescribingRecord.html';
import tpl2 from './medicineRecord.html';
import tpl3 from './prescribingDetail.html';
import tpl4 from './lastMonthPrescribing.html';
import tpl5 from './customMedicine.html';
import tpl6 from './checkWholeMedicine.html';
import './prescribing.less';

angular.module('app').component('prescribingRecord', {
  template: tpl,
  controller: prescribingRecordCtrl,
  controllerAs: 'vm',
  bindings: {
    checkValid: '<'
  }
})
  .component('medicineRecord', {
    template: tpl2,
    controller: medicineRecordCtrl
  })
  .component('prescribingDetail', {
    template: tpl3,
    controller: prescribingDetailCtrl
  })
  .component('lastMonthPrescribing', {
    template: tpl4,
    controller: lastMonthPrescribingCtrl
  })
  .component('customMedicine', {
    template: tpl5,
    controller: customMedicineCtrl
  })
  .component('checkWholeMedicine', {
    template: tpl6,
    controller: checkWholeMedicineCtrl
  });

// 用藥列表
prescribingRecordCtrl.$inject = ['$window', 'PrescribingRecordService', '$stateParams', '$state', '$rootScope', 'showMessage', '$mdDialog', 'SettingService', '$mdMenu', '$interval', '$scope', '$timeout', '$filter', 'OverViewService'];

function prescribingRecordCtrl(
  $window,
  PrescribingRecordService,
  $stateParams,
  $state,
  $rootScope,
  showMessage,
  $mdDialog,
  SettingService,
  $mdMenu,
  $interval,
  $scope,
  $timeout,
  $filter,
  OverViewService
) {
  const vm = this;
  vm.loading = true;
  let vShowDate = null;
  const UserInfo = SettingService.getCurrentUser();

  let $translate = $filter('translate');

  vm.serviceData = null;
  vm.showDate = null;
  vm.CategoryNameList = []; // 類別列表
  vm.CopyServiceData = {}; // 切換類別用
  vm.myCategoryName = 'All';
  vm.showDeleted = false;
  vm.lastAccessTime = moment();
  // 辨識系統別: HD/PD
  vm.stateName = $state.current.name;

  // 有效/無效藥
  // vm.isValidDrug = false;
  let dialysisTime = '';
  vm.validDrugList = [];

  $rootScope.$on('allExecutionRecord-dataChanged', () => {
    vm.refresh();
  });

  vm.loginRole = SettingService.getCurrentUser().Role;
  vm.$onInit = function $onInit() {
    console.log('UserInfo', UserInfo);
    vm.currentUserId = UserInfo.Id; // 登入者Id，開藥者與登入者同一人才可刪除開藥紀錄
    // 預設顯示當月的用藥資訊
    if ($stateParams.listDate && $stateParams.listDate.length > 0) {
      vShowDate = $stateParams.listDate;
    } else {
      vShowDate = moment();
    }

    // 先取得透析時間
    OverViewService.getByHeaderId($stateParams.headerId).then((res) => {
      dialysisTime = moment(res.data.StartTime);
      console.log('開藥清單 dialysisTime', moment(res.data.StartTime).format('YYYY-MM-DD'));

      // 判斷是否為從 summary card 來的，summary card 中顯示所有有效的藥，checkValid 為 true
      if (vm.checkValid) {
        vm.changeCheckValid();
        return;
      }

      // 依日期取得當月的資料
      vm.getList(vShowDate, false, moment(res.data.StartTime).format('YYYY-MM-DD'));

    }, (err) => {
      vm.loading = false;
      vm.isError = true;
    });
  };

  vm.title = 'this is prescribingRecord component page';

  // 依日期取得當月的資料
  vm.getList = function getList(value, isForce, time) {
    PrescribingRecordService.getMonthExecution($stateParams.patientId, moment(value).format('YYYY-MM-DD'), isForce).then((q) => {
      console.log('開藥清單 q', q);
      vm.serviceData = q.data;
      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
      vm.CopyServiceData = angular.copy(q.data); // 切換類別用
      vm.deletedItemsLength = _.filter(q.data, ['Status', 'Deleted']).length;
      vm.lastAccessTime = PrescribingRecordService.getLastAccessTime();

      // 取得類別名稱
      if (q.data.length > 0) {
        q.data.forEach((d) => {
          if (vm.CategoryNameList.indexOf(d.CategoryName) === -1) {
            vm.CategoryNameList.push(d.CategoryName);
          }
        });
      }
      // 處理有效/無效藥 顯示
      let noDeletedItem = _.filter(q.data, function (o) {
        o.isValidDrug = 'deleted'; // 刪除用藥另給標記，前端辨識判斷
        calculateValidDrug(o, o.StartDate, o.Days, o.Name, time);
        return o.Status !== 'Deleted';
      });
      _.forEach(noDeletedItem, function (v, k) {
        console.log('處理有效/無效藥', v, k);
        // 計算是否在效期內
        calculateValidDrug(v, v.StartDate, v.Days, v.Name, time, k);
      });
    }, (reason) => {
      vm.loading = false;
      vm.isError = true;
    });
    vm.showDate = moment(value).format('YYYY-MM');
  };

  // 取得所有有效醫囑
  vm.changeCheckValid = function changeCheckValid() {
    console.log('取得所有有效醫囑 dialysisTime', dialysisTime);
    vm.loading = true;
    vm.isValidError = false;
    if (vm.checkValid) {
      PrescribingRecordService.getAllValidRecord($stateParams.patientId, moment(dialysisTime).format('YYYYMMDD')).then((res) => {
        // console.log('取得所有有效醫囑 res.data', res.data);
        vm.loading = false;
        _.forEach(res.data, function (v, k) {
          // 都是效期內用藥
          v.isValidDrug = true;
          calculateValidDrug(v, v.StartDate, v.Days, v.Name, moment(dialysisTime).format('YYYY-MM-DD'), k);
        });
        // 處理有效/無效藥
        vm.serviceData = res.data;
      }, (reason) => {
        vm.loading = false;
        console.log('取得所有有效醫囑 reason', reason);
        if (vm.checkValid) {
          vm.isValidError = true;
        } else {
          vm.isValidError = false;
        }
      });
    } else {
      // 取消勾選時
      // 依日期取得當月的資料
      vm.getList(vShowDate, false, moment(dialysisTime).format('YYYY-MM-DD'));
    }
  };


  // 計算是否在效期內
  function calculateValidDrug(valueObj, startDate, days, name, time, key) {
    if (days) {
      // 不是無限期用藥
      // 計算是否在效期內
      let dialysisMoment = moment(time); // 透析表單的日期
      let endDate = moment(startDate).add((days - 1), 'day'); // 起始日 + (總共天數days - 1)
      console.log('endDate', vm.serviceData.endDate, vm.serviceData);
      // console.log('計算是否在效期內 不是無限 endDate', moment(startDate).format('YYYY-MM-DD'), days, moment(endDate).format('YYYY-MM-DD'), endDate.diff(dialysisMoment, 'days'));
      // 透析表單的日期 與 結束日期 相比
      let endDateFormat = moment(startDate).format();
      let duringDate = moment(endDateFormat).add((days - 1), 'day');
      if (endDate.diff(dialysisMoment, 'days') >= 0) {
        // 有效
        valueObj.isValidDrug = true;
        valueObj.duringDate = duringDate.format('MM/DD');
      } else {
        // 無效
        valueObj.isValidDrug = false;
        valueObj.duringDate = duringDate.format('MM/DD');
      }
    } else {
      // 無限期用藥 : 有效藥
      valueObj.isValidDrug = true;
    }
  }

  // 確認權限是否能修改
  vm.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
    return SettingService.checkAccessible({ createdUserId, dataStatus, name: 'medicine', modifiedId });
  };

  vm.checkHIS = function (source) {
    let matchString = "--";
    let res = source.match(matchString);
    if (source != null && res == "--") {
      return false;
    }
    return true;
  };

  // 使用者按右上角重整按鈕時
  vm.refresh = function refresh() {
    vm.loading = true;
    if (vm.checkValid) {
      vm.changeCheckValid();
      return;
    }
    vm.getList(vShowDate, true);
  };

  // 移至其他頁面
  vm.goto = function goto(routeName, obj) {
    // 上月用藥
    if (routeName === 'lastMonthPrescribing') {
      if ($state.current.name === 'pdPrescribingRecord') {
        $state.go('pdLastMonthPrescribing', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          setDate: moment(vShowDate).format('YYYY-MM-DD')
        });
      } else {
        $state.go(routeName, {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          setDate: moment(vShowDate).format('YYYY-MM-DD')
        });
      }
    } else if (routeName === 'prescribingDetail') {
      // 如果是自訂藥物rout要改為'customMedicine'
      // 自訂藥物沒有MedicineId
      if (!obj.MedicineId) {
        // 修改自訂藥物頁面
        if ($state.current.name === 'pdPrescribingRecord') {
          $state.go('pdCustomMedicine', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            prescribingId: obj.Id
          });
        } else {
          $state.go('customMedicine', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            prescribingId: obj.Id
          });
        }
      } else {
        // 修改用藥頁面
        if ($state.current.name === 'pdPrescribingRecord') {
          // for PD
          $state.go('pdPrescribingDetail', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            medId: obj.MedicineId,
            prescribingId: obj.Id
          });
        } else {
          $state.go(routeName, {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            medId: obj.MedicineId,
            prescribingId: obj.Id
          });
        }
      }
    } else if (routeName === 'checkWholeMedicine') {
      $state.go('checkWholeMedicine', {
        patientId: $stateParams.patientId
      });
    } else if (routeName === 'medicineRecord') {
      if ($state.current.name === 'pdPrescribingRecord') {
        // for PD
        $state.go('pdMedicineRecord', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId
        });
      } else {
        $state.go(routeName, {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId
        });
      }
    } else {
      $state.go(routeName, {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId
      });
    }
  };

  // 回上頁
  vm.goback = function goback() {
    // $window.history.back();
    history.go(-1);
  };

  // 用藥月份異動
  vm.changeDate = function changeDate(value) {
    if (value === 'prev') {
      vShowDate = moment(vShowDate).add(-1, 'M');
    } else {
      vShowDate = moment(vShowDate).add(1, 'M');
    }
    // vm.getList(showDate);

    if ($state.current.name.substr(0, 2) === "pd") {
      $state.go('pdPrescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(vShowDate).format('YYYY-MM-DD')
      }, {
          location: 'replace'
        });
    } else {
      $state.go('prescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(vShowDate).format('YYYY-MM-DD')
      }, {
          location: 'replace'
        });

    }
  };

  // 匯入上次透析的 ST 用藥
  vm.ImportST = function ImportST() {
    vm.loading = true;
    PrescribingRecordService.ImportST(
      $stateParams.headerId,
      UserInfo.Id,
      UserInfo.Name
    ).then((res) => {
      vm.loading = false;
      if (res.status === 200 && res.data > 0) {
        // showMessage('匯入 ST 成功，共 ' + res.data + '筆');
        showMessage($translate('prescribingRecord.prescribingRecord.component.importSuccess', { dataCount: res.data }));
        // 即時重讀未執行筆數
        $scope.$emit('tabCount', {
          type: 'allExecute'
        });
        vm.getList(vShowDate, true);
      } else if (res.data === 0) {
        showMessage($translate('prescribingRecord.prescribingRecord.component.noST'));
      } else {
        // showMessage('匯入 失敗' + res.statusText);
        showMessage($translate('prescribingRecord.prescribingRecord.component.importFail', { statusText: res.statusText }));
      }
    }, (reason) => {
      vm.loading = false;
      showMessage($translate('prescribingRecord.prescribingRecord.component.serverError'));
    });
  };

  // 手機畫面, 按下右側的選單按鈕
  vm.openMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  // 刪除開藥
  vm.delete = function del(Id) {
    const confirm = $mdDialog.confirm()
      .title($translate('prescribingRecord.prescribingRecord.component.confirmDelete'))
      .textContent($translate('prescribingRecord.prescribingRecord.component.deleteWarning'))
      .ariaLabel('Lucky day')
      .ok($translate('prescribingRecord.prescribingRecord.component.deleteOk'))
      .cancel($translate('prescribingRecord.prescribingRecord.component.deleteCancel'));

    $mdDialog.show(confirm).then(() => {
      PrescribingRecordService.delete(
        Id,
        UserInfo.Id,
        UserInfo.Name)
        .then((res) => {
          if (res.status === 200) {
            showMessage($translate('prescribingRecord.prescribingRecord.component.deleteSuccess'));
            // 即時重讀未執行筆數
            $scope.$emit('tabCount', {
              type: 'allExecute'
            });
            // vm.getList(vShowDate);
            vm.getList(vShowDate, true); // isForse要設定true，刪除完後，立刻點選"顯示已刪除"的時候才看得到剛剛刪除的那筆資料
          } else {
            // showMessage('刪除失敗，原因:' + res.statusText);
            showMessage($translate('prescribingRecord.prescribingRecord.component.deleteFail', { statusText: res.statusText }));
          }
        });
    }, () => {
      // do nothing
    });
    // if (confirm('您確認要刪除此筆用藥?\n請注意:連同未執行的用藥皆會一併刪除!!')) {

    // }
  };

  // 顯示結束時間
  vm.getEndDate = function getEndDate(iDate, days) {
    const result = moment(iDate).add(days - 1, 'd');
    let rtn = '';

    if (moment(iDate).year() !== moment(result).year()) {
      rtn = '< ' + result.format('YYYY-MM-DD');
    } else {
      rtn = '< ' + result.format('MM-DD');
    }

    return rtn;
  };

  // 異動類別
  vm.changeCategory = function changeCategory() {
    if (vm.myCategoryName === 'All') {
      vm.serviceData = vm.CopyServiceData;
    } else if (vm.myCategoryName === 'STAT') {
      vm.serviceData = vm.CopyServiceData.filter(i => i.Frequency === 'STAT');
    } else if (vm.myCategoryName === 'NotST') {
      vm.serviceData = vm.CopyServiceData.filter(i => i.Frequency !== 'STAT');
    } else if (vm.myCategoryName.length > 0) {
      vm.serviceData = vm.CopyServiceData.filter(i => i.CategoryName === vm.myCategoryName);
    }
    vm.deletedItemsLength = _.filter(vm.serviceData, ['Status', 'Deleted']).length;
  };
}

// 藥品列表
medicineRecordCtrl.$inject = ['$window', 'PrescribingRecordService', '$stateParams', '$state', '$filter', 'PatientService', '$timeout'];

function medicineRecordCtrl($window, PrescribingRecordService, $stateParams, $state, $filter, PatientService, $timeout) {
  const self = this;
  self.loading = true;
  self.serviceData = null;
  self.myCategoryName = 'All';
  self.CategoryNameList = []; // 類別列表
  self.CopyServiceData = {}; // 切換類別用

  let $translate = $filter('translate');
  let dataNumOnce = 20; // 一次 push 多少筆資料
  let originalMedicine = [];  // 原始藥品資料
  self.filteredMedicine = [];  // 經過篩選過後的資料
  self.currentMedicine = []; // 目前顯示在畫面的資料
  let dataEnd = false;

  self.$onInit = function $onInit() {
    // 取得病人資料, 顯示於畫面上方標題列
    // PatientService.getById($stateParams.patientId).then((res) => {
    //   self.patient = res.data;
    // });
    PrescribingRecordService.getMedicines().then((q) => {
      console.log('取得藥品清單', q.data);
      // 自訂藥物欄位
      let customMedicineObj = {
        IsCustomMedicine: true,
        CategoryName: $translate('prescribingRecord.medicineRecord.CustomMedicine') // '自訂藥物'
      };
      // 將自訂藥物加在array第一個
      let dataArray = q.data;
      dataArray.unshift(customMedicineObj);
      // self.serviceData = q.data;
      // self.CopyServiceData = angular.copy(q.data);
      // self.medcine = angular.copy(q.data);
      originalMedicine = angular.copy(q.data);
      self.filteredMedicine = angular.copy(originalMedicine);
      self.loadMore();
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息

      // 取得類別名稱
      q.data.forEach((d) => {
        if (self.CategoryNameList.indexOf(d.CategoryName) === -1) {
          self.CategoryNameList.push(d.CategoryName);
        }
      });
    }, (reason) => {
      self.loading = false;
      self.isError = true;
    });
  };

  // 初始化 infinite scroll 相關參數 (一次顯示多個)
  function initForScroll() {
    dataEnd = false;
    self.currentMedicine = [];
  }
  // scroll 至底時呼叫
  self.loadMore = function () {
    if (dataEnd) {
      return;
    }

    let lastIndex = self.currentMedicine.length - 1;

    let dataNum;
    // 判斷是否將為資料底
    if ((lastIndex + dataNumOnce) >= self.filteredMedicine.length - 1) {
      dataEnd = true;
      dataNum = self.filteredMedicine.length - lastIndex;
    } else {
      dataNum = dataNumOnce + 1;
    }

    for (let i = 1; i < dataNum; i++) {
      self.currentMedicine.push(self.filteredMedicine[lastIndex + i]);
    }
  };


  // 搜尋藥品
  self.searchMed = function () {
    //     self.currentMedicine = self.serviceData.filter((item) => {
    //         return (text == item.Name || text == item.CategoryName);

    // });
    self.loading = true;
    self.filteredMedicine = [];
    initForScroll();

    $timeout(() => {
      // 若為全部且無搜尋字串則清單全 show
      if (self.myCategoryName === 'All' && !self.searchText && self.searchText !== '0') {
        self.filteredMedicine = angular.copy(originalMedicine);
      } else {
        self.filteredMedicine = _.filter(originalMedicine, (medicine) => {
          // 先處理類別，若類別不為全部，類別名不一樣就不一樣
          if (self.myCategoryName !== 'All') {
            if (medicine.CategoryName !== self.myCategoryName) {
              return false;
            }
          }
          // 再處理搜尋
          // 若有搜尋字串才篩
          if (self.searchText || self.searchText === '0') {
            // 模糊搜尋類別名稱或藥名，搜尋不分大小寫
            return (medicine.CategoryName && medicine.CategoryName.toLowerCase().indexOf(self.searchText.toLowerCase()) > -1) || (medicine.Name && medicine.Name.toLowerCase().indexOf(self.searchText.toLowerCase()) > -1);
          }
          return true;
        });
      }

      self.loadMore();
      self.loading = false;
    });

  };


  self.title = 'this is medicineRecord component page';

  self.gotoAdd = function gotoAdd(item) {
    if (item.IsCustomMedicine) {
      // 自訂藥物
      console.log('點選自訂藥物', item);
      if ($state.current.name.substr(0, 2) === 'pd') {
        $state.go('pdCustomMedicine', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          prescribingId: 'create'
        });
      } else {
        $state.go('customMedicine', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          prescribingId: 'create'
        });
      }
    } else {
      // 其他藥物
      if ($state.current.name.substr(0, 2) === 'pd') {
        $state.go('pdPrescribingDetail', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          medId: item.Id,
          prescribingId: 'create'
        });
      } else {
        $state.go('prescribingDetail', {
          patientId: $stateParams.patientId,
          headerId: $stateParams.headerId,
          medId: item.Id,
          prescribingId: 'create'
        });
      }
    }
  };

  // 回上一頁
  self.goback = function goback() {
    history.go(-1);
  };

  // // 異動類別
  // self.changeCategory = function changeCategory() {
  //   if (self.myCategoryName === 'All') {
  //     self.serviceData = self.CopyServiceData;
  //   } else if (self.myCategoryName.length > 0) {
  //     self.serviceData = self.CopyServiceData.filter(i => i.CategoryName === self.myCategoryName);
  //   }
  // };
}

// 用藥內容
prescribingDetailCtrl.$inject = ['$rootScope', 'PrescribingRecordService', '$stateParams', '$state', 'showMessage', 'SettingService', '$scope', '$filter', 'PatientService'];

function prescribingDetailCtrl(
  $rootScope,
  PrescribingRecordService,
  $stateParams,
  $state,
  showMessage,
  SettingService,
  $scope,
  $filter,
  PatientService
) {
  const self = this;

  let $translate = $filter('translate');

  self.loading = true;
  const UserInfo = SettingService.getCurrentUser();

  self.serviceData = null; // 用藥資料
  self.serviceMedicineData = null; // 藥品資料
  self.StartDate = new Date(); // 用藥日
  self.oMessage = {}; // 操作訊息
  self.prescribingId = $stateParams.prescribingId;
  self.routeOptions = [];
  self.frequencyOptions = [];
  self.canAccess = true;

  self.$onInit = function $onInit() {
    //console.log('過敏藥？？？？', self.isAllergicDrug);

    // 取得病人資料, 顯示於畫面上方標題列
    // PatientService.getById($stateParams.patientId).then((res) => {
    //   self.patient = res.data;
    // });
    PrescribingRecordService.getMedicine($stateParams.medId).then((q) => {
      console.log('藥品 q.data', q.data);
      self.serviceMedicineData = q.data;
      // 取出系統設定的途徑
      self.routeOptions = _.filter(self.allRouteOptions, (o) => {
        return _.indexOf(self.serviceMedicineData.Routes, o.code) > -1;
      });
      // 取出系統設定的頻率
      self.frequencyOptions = _.filter(self.allFrequencyOptions, (o) => {
        return _.indexOf(self.serviceMedicineData.Frequencys, o.code) > -1;
      });
      // 取得藥品是否為高危險用藥
      self.IsDangerMed = self.serviceMedicineData.IsDangerMed;
      self.loading = false;
      // 後台藥品檔的mem帶入紀錄的memo
      self.MedcineMemo = self.serviceMedicineData.Memo;

      if ($stateParams.prescribingId !== 'create') {
        // 修改
        PrescribingRecordService.getPrescribing($stateParams.prescribingId).then((q) => {
          console.log('修改q.data', q.data);
          console.log('修改 q.data.Days ', q.data.Days);
          // 無限期用藥：使用天數Days, 總量TotalQuantity為null
          if (q.data.Days === null && q.data.TotalQuantity === null) {
            // 無限期用藥：勾選無限期用藥
            self.Infinity = true;
          } else {
            self.Infinity = false;
          }
          self.serviceData = q.data;
          //修改再確認權限
          checkCanAccess(self.serviceData.CreatedUserId, self.serviceData.Status);
          self.checkHIS(self.serviceData.Source);
          self.isAllergicDrug = self.serviceData.IsAllergic;
          self.StartDate = new Date(q.data.StartDate);
          self.IsOther = self.serviceData.IsOther; // 外院用藥顯示
          self.isError = false; // 顯示伺服器連接失敗的訊息
        }, (reason) => {
          self.loading = false;
          self.isError = true;
        });
      } else {
        // 新增
        self.Infinity = false; // 無限期用藥：init不勾選
        self.IsOther = false; // 外院用藥：init不勾選
        self.serviceData = {
          Quantity: self.serviceMedicineData.Quantity, // 1,
          Days: 1,
          //IsAllergic: self.isAllergicDrug, // 過敏藥
          Memo: self.MedcineMemo, // 後台藥品檔的mem帶入紀錄的memo
          QuantityUnit: self.serviceMedicineData.QuantityUnit
        };
      }
    });

    if ($stateParams.prescribingId !== 'create') {
      // 修改
      PrescribingRecordService.getPrescribing($stateParams.prescribingId).then((q) => {
        console.log('修改q.data', q.data);
        console.log('修改 q.data.Days ', q.data.Days);
        // 無限期用藥：使用天數Days, 總量TotalQuantity為null
        if (q.data.Days === null && q.data.TotalQuantity === null) {
          // 無限期用藥：勾選無限期用藥
          self.Infinity = true;
        } else {
          self.Infinity = false;
        }
        self.serviceData = q.data;
        //修改再確認權限
        checkCanAccess(self.serviceData.CreatedUserId, self.serviceData.Status, self.serviceData.ModifiedUserId);
        self.checkHIS(self.serviceData.Source);
        self.StartDate = new Date(q.data.StartDate);
        self.IsOther = self.serviceData.IsOther; // 外院用藥顯示
        self.isError = false; // 顯示伺服器連接失敗的訊息
      }, (reason) => {
        self.loading = false;
        self.isError = true;
      });
    } else {
      // 新增
      self.Infinity = false; // 無限期用藥：init不勾選
      self.IsOther = false; // 外院用藥：init不勾選
      self.serviceData = {
        Quantity: 1,
        Days: 1
      };
    }
  };
  // 判斷是否為唯讀
  function checkCanAccess(createdUserId, dataStatus, modifiedId) {
    console.log('checkAccessible');
    self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, name: 'medicine', modifiedId });
  }
  self.checkHIS = function (source) {
    let matchString = "--";
    let res = source.match(matchString);
    self.checkIsHIS = false;
    if (source != null && res == "--") {
      self.checkIsHIS = true;
      return self.checkIsHIS;
    }
    return self.checkIsHIS;
  };

  // 選擇無截止日：控制ST的使用天數及總量顯示
  self.changeInfinity = function changeInfinity(isCheck) {
    if (self.serviceData.Frequency === 'ST' || self.serviceData.Frequency === 'STAT') {
      if (isCheck) {
        // 勾選
        self.serviceData.Days = 0;
        self.serviceData.TotalQuantity = 0;
        self.oMessage.STMessage = '';
      } else {
        // 無勾選
        self.serviceData.Days = 1;
        self.serviceData.TotalQuantity = 1;
        self.oMessage.STMessage = $translate('prescribingRecord.prescribingDetail.component.STMessage');
      }
    }

  };

  // 選擇外院用藥
  self.changeIsOtherDrug = function changeIsOtherDrug() {
    if (self.IsOther) {
      self.serviceData.IsOther = true;
    } else {
      self.serviceData.IsOther = false;
      self.serviceData.OtherContent = null;
    }
  };

  // 儲存(save)
  self.isSaving = false;
  self.submit = function submit() {
    self.isSaving = true;
    // 無限期用藥：使用天數Days, 總量TotalQuantity不需要傳給後台
    if (self.Infinity) {
      // 無限期用藥：移除使用天數Days, 總量TotalQuantity
      delete self.serviceData.Days;
      delete self.serviceData.TotalQuantity;
    }
    // 處理外院用藥
    self.changeIsOtherDrug();

    // 處理高危險用藥:從藥品檔的資料中帶過來
    self.serviceData.IsDangerMed = self.IsDangerMed;

    // Update or Create
    if ($stateParams.prescribingId !== 'create') {
      self.serviceData.ModifiedUserId = UserInfo.Id;
      self.serviceData.ModifiedUserName = UserInfo.Name;
      self.serviceData.StartDate = moment(self.StartDate).format('YYYY-MM-DD');

      // 修改
      PrescribingRecordService.put(self.serviceData).then((res) => {
        if (res.status === 200) {
          showMessage($translate('prescribingRecord.prescribingDetail.component.editSuccess'));
          // self.isSaving = false;
          // 即時重讀未執行筆數(放著備用)
          $scope.$emit('tabCount', {
            type: 'allExecute'
          });
          history.go(-1);
        }
      }).catch((err) => {
        showMessage($translate('prescribingRecord.prescribingDetail.component.editFail'));
      }).finally(() => {
        self.isSaving = false;
      });
    } else {
      self.serviceData.HospitalId = UserInfo.HospitalId;
      self.serviceData.CreatedUserId = UserInfo.Id;
      self.serviceData.CreatedUserName = UserInfo.Name;
      self.serviceData.DialysisId = $stateParams.headerId;
      self.serviceData.Source = 'medication';
      self.serviceData.StartDate = moment(self.StartDate).format('YYYY-MM-DD');
      self.serviceData.PatientId = $stateParams.patientId;
      self.serviceData.MedicineId = $stateParams.medId;
      self.serviceData.Code = self.serviceMedicineData.MedicineCode;
      self.serviceData.Name = self.serviceMedicineData.Name;
      self.serviceData.QuantityUnit = self.serviceMedicineData.QuantityUnit;
      self.serviceData.CategoryName = self.serviceMedicineData.CategoryName;

      // 新增
      PrescribingRecordService.post(self.serviceData).then((res) => {
        if (res.status === 200) {
          showMessage($translate('prescribingRecord.prescribingDetail.component.createSuccess'));
          self.isSaving = false;
          // 即時重讀未執行筆數(放著備用)
          $scope.$emit('tabCount', {
            type: 'allExecute'
          });

          if ($state.current.name.substr(0, 2) === "pd") {
            history.go(-1);
          } else {
            history.go(-2);
          }
        }
      }).catch((err) => {
        showMessage($translate('prescribingRecord.prescribingDetail.component.createFail'));
      }).finally(() => {
        self.isSaving = false;
      });
    }
  };

  // 確認權限是否能修改
  // self.checkAccessible = function (createdUserId) {
  //   // 修改才需
  //   // 等確定有值才需判斷是否能編輯
  //   if ($stateParams.prescribingId !== 'create') {
  //     return !createdUserId || SettingService.checkAccessible(createdUserId);
  //   }
  //   return true;
  // };

  // 回至列表
  self.gotoList = function gotoList() {
    if ($state.current.name.substr(0, 2) === 'pd') {
      $state.go('pdPrescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    } else {
      $state.go('prescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    }
  };

  // 回上一頁
  self.goback = function goback() {
    history.go(-1);
  };

  self.allRouteOptions = [{
    code: 'PO',
    text: $translate('prescribingRecord.prescribingDetail.component.PO')
  },
  {
    code: 'SC',
    text: $translate('prescribingRecord.prescribingDetail.component.SC')
  },
  {
    code: 'SL',
    text: $translate('prescribingRecord.prescribingDetail.component.SL')
  },
  {
    code: 'IV',
    text: $translate('prescribingRecord.prescribingDetail.component.IV')
  },
  {
    code: 'IM',
    text: $translate('prescribingRecord.prescribingDetail.component.IM')
  },
  {
    code: 'IVD',
    text: $translate('prescribingRecord.prescribingDetail.component.IVD')
  },
  {
    code: 'TOPI',
    text: $translate('prescribingRecord.prescribingDetail.component.TOPI')
  },
  {
    code: 'EXT',
    text: $translate('prescribingRecord.prescribingDetail.component.EXT')
  },
  {
    code: 'AC',
    text: $translate('prescribingRecord.prescribingDetail.component.AC')
  },
  {
    code: 'PC',
    text: $translate('prescribingRecord.prescribingDetail.component.PC')
  },
  {
    code: 'Meal',
    text: $translate('prescribingRecord.prescribingDetail.component.Meal')
  }
  ];

  self.allFrequencyOptions = [{
    code: 'QDPC',
    text: $translate('prescribingRecord.prescribingDetail.component.QDPC')
  },
  {
    code: 'QN',
    text: $translate('prescribingRecord.prescribingDetail.component.QN')
  },
  {
    code: 'QOD',
    text: $translate('prescribingRecord.prescribingDetail.component.QOD')
  },
  {
    code: 'HS',
    text: $translate('prescribingRecord.prescribingDetail.component.HS')
  },
  {
    code: 'TID',
    text: $translate('prescribingRecord.prescribingDetail.component.TID')
  },
  {
    code: 'TIDAC',
    text: $translate('prescribingRecord.prescribingDetail.component.TIDAC')
  },
  {
    code: 'TIDPC',
    text: $translate('prescribingRecord.prescribingDetail.component.TIDPC')
  },
  {
    code: 'BID',
    text: $translate('prescribingRecord.prescribingDetail.component.BID')
  },
  {
    code: 'BIDAC',
    text: $translate('prescribingRecord.prescribingDetail.component.BIDAC')
  },
  {
    code: 'BIDPC',
    text: $translate('prescribingRecord.prescribingDetail.component.BIDPC')
  },
  {
    code: 'STAT',
    text: $translate('prescribingRecord.prescribingDetail.component.ST')
  },
  {
    code: 'Q2W',
    text: $translate('prescribingRecord.prescribingDetail.component.Q2W')
  },
  {
    code: 'QID',
    text: $translate('prescribingRecord.prescribingDetail.component.QID')
  },
  {
    code: 'QD',
    text: $translate('prescribingRecord.prescribingDetail.component.QD')
  },
  {
    code: 'QW1',
    text: $translate('prescribingRecord.prescribingDetail.component.QW1')
  },
  {
    code: 'QW2',
    text: $translate('prescribingRecord.prescribingDetail.component.QW2')
  },
  {
    code: 'QW3',
    text: $translate('prescribingRecord.prescribingDetail.component.QW3')
  },
  {
    code: 'QW4',
    text: $translate('prescribingRecord.prescribingDetail.component.QW4')
  },
  {
    code: 'QW5',
    text: $translate('prescribingRecord.prescribingDetail.component.QW5')
  },
  {
    code: 'QW6',
    text: $translate('prescribingRecord.prescribingDetail.component.QW6')
  },
  {
    code: 'QW7',
    text: $translate('prescribingRecord.prescribingDetail.component.QW7')
  },
  {
    code: 'QW135',
    text: $translate('prescribingRecord.prescribingDetail.component.QW135')
  },
  {
    code: 'QW135日',
    text: $translate('prescribingRecord.prescribingDetail.component.QW135S')
  },
  {
    code: 'QW1357',
    text: $translate('prescribingRecord.prescribingDetail.component.QW135S')
  },
  {
    code: 'QW246',
    text: $translate('prescribingRecord.prescribingDetail.component.QW246')
  },
  {
    code: 'QW246日',
    text: $translate('prescribingRecord.prescribingDetail.component.QW246S')
  },
  {
    code: 'QW2467',
    text: $translate('prescribingRecord.prescribingDetail.component.QW246S')
  },
  {
    code: 'QW136',
    text: $translate('prescribingRecord.prescribingDetail.component.QW136')
  },
  {
    code: 'QW146',
    text: $translate('prescribingRecord.prescribingDetail.component.QW146')
  },
  {
    code: 'PRN',
    text: $translate('prescribingRecord.prescribingDetail.component.PRN')
  },
  {
    code: 'TIW',
    text: $translate('prescribingRecord.prescribingDetail.component.TIW')
  },
  {
    code: 'BIW',
    text: $translate('prescribingRecord.prescribingDetail.component.BIW')
  },
  {
    code: 'BIW13',
    text: $translate('prescribingRecord.prescribingDetail.component.BIW13')
  },
  {
    code: 'BIW15',
    text: $translate('prescribingRecord.prescribingDetail.component.BIW15')
  },
  {
    code: 'BIW24',
    text: $translate('prescribingRecord.prescribingDetail.component.BIW24')
  },
  {
    code: 'BIW26',
    text: $translate('prescribingRecord.prescribingDetail.component.BIW26')
  }
  ];

  // 計算藥品總量
  self.calculationTotal = function calculationTotal() {
    // if (event) { event.preventDefault(); }

    let medicationtotal = 0;
    const quantity = self.serviceData.Quantity ? self.serviceData.Quantity : null;
    const days = self.serviceData.Days ? self.serviceData.Days : null;
    const frequency = self.serviceData.Frequency ? self.serviceData.Frequency : null;

    // 立即使用，固定天數 1 天
    if (frequency === 'ST' || frequency === 'STAT') {
      self.serviceData.Days = 1;
      self.oMessage.STMessage = $translate('prescribingRecord.prescribingDetail.component.STMessage');
    } else {
      self.oMessage.STMessage = '';
    }

    // 必要時服用，可異動總數量
    if (frequency === 'PRN' && self.serviceData.TotalQuantity) {
      self.oMessage.PRNMessage = $translate('prescribingRecord.prescribingDetail.component.PRNMessage');
    } else if (self.serviceData.TotalQuantity) {
      self.oMessage.PRNMessage = '';
    }

    if (quantity > 0 && frequency !== '') {
      let startTime = moment(self.StartDate);
      const endTime = moment(startTime).add(days, 'd');
      let count = 0;
      const weekDay = {
        QW1: 1,
        QW2: 2,
        QW3: 3,
        QW4: 4,
        QW5: 5,
        QW6: 6,
        QW7: 0
      };

      switch (frequency) {
        // 每週4次
        case 'QID':
          medicationtotal = days * quantity * 4;
          break;

        // 每天3次
        case 'TID':
        case 'TIDAC':
        case 'TIDPC':
          medicationtotal = days * quantity * 3;
          break;

        // 每天2次
        case 'BID':
        case 'BIDAC':
        case 'BIDPC':
          medicationtotal = days * quantity * 2;
          break;

        // 每天1次
        case 'QDPC':
        case 'QN':
        case 'HS':
        case 'QD':
          medicationtotal = days * quantity;
          break;

        // 時間區間必要時
        case 'PRN':
          medicationtotal = days * quantity;
          break;

        // 每隔一天1次
        case 'QOD':
          medicationtotal = Math.ceil(days / 2) * quantity;
          break;

        // 依星期每天1次
        case 'QW1':
        case 'QW2':
        case 'QW3':
        case 'QW4':
        case 'QW5':
        case 'QW6':
        case 'QW7':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay[frequency]) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 依星期135每天1次
        case 'QW135':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW3 ||
              moment(startTime).weekday() === weekDay.QW5) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 依星期246每天1次
        case 'QW246':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW2 ||
              moment(startTime).weekday() === weekDay.QW4 ||
              moment(startTime).weekday() === weekDay.QW6) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 依星期135日每天1次
        case 'QW135日':
        case 'QW1357':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW3 ||
              moment(startTime).weekday() === weekDay.QW5 ||
              moment(startTime).weekday() === weekDay.QW7) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 依星期246日每天1次
        case 'QW246日':
        case 'QW2467':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW2 ||
              moment(startTime).weekday() === weekDay.QW4 ||
              moment(startTime).weekday() === weekDay.QW6 ||
              moment(startTime).weekday() === weekDay.QW7) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 當天使用
        case 'ST':
        case 'STAT':
          medicationtotal = 1 * quantity;
          break;

        // 每週3次
        case 'TIW':
          while (startTime < endTime) {
            count += 3;
            startTime = moment(startTime).add(7, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 每週2次
        case 'BIW':
          while (startTime < endTime) {
            count += 2;
            startTime = moment(startTime).add(7, 'd');
          }
          medicationtotal = quantity * count;
          break;

        // 每2週1次
        case 'Q2W':
          while (startTime < endTime) {
            count += 1;
            startTime = moment(startTime).add(14, 'd');
          }
          medicationtotal = quantity * count;
          break;
        // 每週2次(1、5)
        case 'BIW15':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW5) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }

          medicationtotal = quantity * count;
          break;
        // 每週2次(2、6)
        case 'BIW26':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW2 ||
              moment(startTime).weekday() === weekDay.QW6) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }

          medicationtotal = quantity * count;
          break;
        // 每週2次(1、3)
        case 'BIW13':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW3) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }

          medicationtotal = quantity * count;
          break;
        // 每週2次(2、4)
        case 'BIW24':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW2 ||
              moment(startTime).weekday() === weekDay.QW4) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }

          medicationtotal = quantity * count;
          break;
        // 依星期136每天1次
        case 'QW136':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW3 ||
              moment(startTime).weekday() === weekDay.QW6) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;
        // 依星期146每天1次
        case 'QW146':
          while (startTime < endTime) {
            if (moment(startTime).weekday() === weekDay.QW1 ||
              moment(startTime).weekday() === weekDay.QW4 ||
              moment(startTime).weekday() === weekDay.QW6) {
              count += 1;
            }
            startTime = moment(startTime).add(1, 'd');
          }
          medicationtotal = quantity * count;
          break;
        default:
          // nothing
          break;
      }
    }

    self.serviceData.TotalQuantity = medicationtotal;
  };
}

// 上月用藥
lastMonthPrescribingCtrl.$inject = ['$window', 'PrescribingRecordService', '$stateParams', '$state', '$rootScope', 'showMessage', 'SettingService', '$scope', '$filter'];

function lastMonthPrescribingCtrl(
  $window,
  PrescribingRecordService,
  $stateParams,
  $state,
  $rootScope,
  showMessage,
  SettingService,
  $scope,
  $filter
) {

  const self = this;
  self.loading = true;
  const UserInfo = SettingService.getCurrentUser();

  let $translate = $filter('translate');

  self.serviceData = null;
  self.showDate = moment(new Date($stateParams.setDate)).format('YYYY-MM');
  self.Day = moment().dates();
  self.sendData = {
    PatientId: $stateParams.patientId,
    StartDate: null,
    OrderMasterIds: [],
    Days: 1,
    CreatedUserId: UserInfo.Id,
    CreatedUserName: UserInfo.Name,
    DialysisId: $stateParams.headerId
  };

  self.days = new Array(31);

  self.$onInit = function $onInit() {
    PrescribingRecordService.getFilterSTMonthExecution($stateParams.patientId, moment(new Date($stateParams.setDate)).add(-1, 'months').format('YYYY-MM-DD')).then((q) => {
      self.serviceData = q.data;
      self.loading = false;
      self.isError = false; // 顯示伺服器連接失敗的訊息
    }, (reason) => {
      self.loading = false;
      self.isError = true;
    });
  };


  self.toggle = function toggle(item, list) {
    const idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
  };

  self.exists = function exists(item, list) {
    return list.indexOf(item) > -1;
  };

  self.submit = function submit() {
    const importDate = moment(new Date(self.showDate + '-' + self.Day)).format('YYYY-MM-DD');
    // 組用藥日期
    self.sendData.StartDate = importDate;

    PrescribingRecordService.ImportMaster(self.sendData).then((res) => {
      if (res.statusText !== 'OK') {
        // showMessage('寫入' + self.showDate + '月用藥資料失敗。原因:' + res.statusText);
        showMessage($translate('prescribingRecord.lastMonthPrescribing.component.writeError', { showDate: self.showDate, statusText: res.statusText }));
      } else if (parseInt(res.data, 10) > 0) {
        PrescribingRecordService.getMonthExecution($stateParams.patientId, moment(importDate).format('YYYY-MM-DD'), true).then((res2) => {
          if (res2.status === 200) {
            showMessage($translate('prescribingRecord.lastMonthPrescribing.component.importSuccess'));
            // 即時重讀未執行筆數
            $scope.$emit('tabCount', {
              type: 'allExecute'
            });
          } else {
            showMessage($translate('prescribingRecord.lastMonthPrescribing.component.loadDataError'));
          }

          history.go(-1);

        });
      } else {
        showMessage($translate('prescribingRecord.lastMonthPrescribing.component.noPrescription'));
      }
    });
  };

  // 回上一頁
  self.goback = function goback() {
    history.go(-1);
  };
}


// 自訂藥物內容
customMedicineCtrl.$inject = ['$rootScope', 'PrescribingRecordService', '$stateParams', '$state', 'showMessage', 'SettingService', '$scope', '$filter'];

function customMedicineCtrl(
  $rootScope,
  PrescribingRecordService,
  $stateParams,
  $state,
  showMessage,
  SettingService,
  $scope,
  $filter
) {
  const self = this;

  let $translate = $filter('translate');

  self.loading = true;
  const UserInfo = SettingService.getCurrentUser();

  self.serviceData = null; // 用藥資料
  // self.serviceMedicineData = null; // 藥品資料
  self.StartDate = new Date(); // 用藥日
  self.oMessage = {}; // 操作訊息
  self.prescribingId = $stateParams.prescribingId;
  self.routeOptions = [];
  self.frequencyOptions = [];

  self.$onInit = function $onInit() {
    self.frequencyOptions = self.allFrequencyOptions;
    self.routeOptions = self.allRouteOptions;

    if ($stateParams.prescribingId !== 'create') {
      // 修改
      PrescribingRecordService.getPrescribing($stateParams.prescribingId).then((q) => {
        console.log('自訂藥物 修改q.data', q.data);
        self.serviceData = q.data;
        self.checkHIS(self.serviceData.Source);
        self.StartDate = new Date(q.data.StartDate);
        self.IsOther = self.serviceData.IsOther; // 外院用藥顯示
        self.loading = false;
        self.isError = false; // 顯示伺服器連接失敗的訊息
      }, (reason) => {
        self.loading = false;
        self.isError = true;
      });
    } else {
      // 新增
      self.loading = false;
      self.IsOther = false; // 外院用藥：init不勾選
      self.serviceData = {
        Frequency: 'STAT',
        Quantity: 1,
        Days: 1,
        TotalQuantity: 1
      };
    }
  };

  // 選擇外院用藥
  self.changeIsOtherDrug = function changeIsOtherDrug() {
    if (self.IsOther) {
      self.serviceData.IsOther = true;
    } else {
      self.serviceData.IsOther = false;
      self.serviceData.OtherContent = null;
    }
  };

  self.checkHIS = function (source) {
    let matchString = "--";
    let res = source.match(matchString);
    self.checkIsHIS = false;
    if (source != null && res == "--") {
      self.checkIsHIS = true;
      return self.checkIsHIS;
    }
    return self.checkIsHIS;
  };

  // 儲存(save)
  self.submit = function submit() {
    self.isSaving = true;
    // 處理外院用藥
    self.changeIsOtherDrug();
    // Update or Create
    if ($stateParams.prescribingId !== 'create') {
      // 修改
      self.serviceData.ModifiedUserId = UserInfo.Id;
      self.serviceData.ModifiedUserName = UserInfo.Name;
      self.serviceData.StartDate = moment(self.StartDate).format('YYYY-MM-DD');
      PrescribingRecordService.put(self.serviceData).then((res) => {
        if (res.status === 200) {
          showMessage($translate('prescribingRecord.customMedicine.component.editSuccess'));
          self.isSaving = false;
          // 即時重讀未執行筆數(放著備用)
          $scope.$emit('tabCount', {
            type: 'allExecute'
          });
          history.go(-1);
        } else {
          // showMessage('修改失敗' + res.statusText);
          showMessage($translate('prescribingRecord.customMedicine.component.editFailMsg', { errorMsg: res.statusText }));
          self.isSaving = false;
        }
      }, () => {
        showMessage($translate('prescribingRecord.customMedicine.component.editFail'));
        self.isSaving = false;
      });
    } else {
      // 新增
      self.serviceData.PatientId = $stateParams.patientId;
      self.serviceData.Source = 'medication';
      self.serviceData.HospitalId = UserInfo.HospitalId;
      self.serviceData.CreatedUserId = UserInfo.Id;
      self.serviceData.CreatedUserName = UserInfo.Name;
      self.serviceData.StartDate = moment(self.StartDate).format('YYYY-MM-DD');
      // 新增
      PrescribingRecordService.postCustomMedicine(self.serviceData).then((res) => {
        if (res.status === 200) {
          showMessage($translate('prescribingRecord.customMedicine.component.createSuccess'));
          self.isSaving = false;
          // 即時重讀未執行筆數(放著備用)
          $scope.$emit('tabCount', {
            type: 'allExecute'
          });
          history.go(-2);
        } else {
          // showMessage('新增失敗' + res.statusText);
          showMessage($translate('prescribingRecord.customMedicine.component.createFailMsg', { errorMsg: res.statusText }));
          self.isSaving = false;
        }
      }, () => {
        showMessage($translate('prescribingRecord.customMedicine.component.createFail'));
        self.isSaving = false;
      });
    }
  };

  // 回至列表
  self.gotoList = function gotoList() {
    if ($state.current.name.substr(0, 2) === 'pd') {
      $state.go('pdPrescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    } else {
      $state.go('prescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    }
  };

  // 回上一頁
  self.goback = function goback() {
    history.go(-1);
  };

  // 途徑
  self.allRouteOptions = [
    {
      code: '',
      text: ''
    },
    {
      code: 'PO',
      text: $translate('prescribingRecord.prescribingDetail.component.PO')
    },
    {
      code: 'SC',
      text: $translate('prescribingRecord.prescribingDetail.component.SC')
    },
    {
      code: 'SL',
      text: $translate('prescribingRecord.prescribingDetail.component.SL')
    },
    {
      code: 'IV',
      text: $translate('prescribingRecord.prescribingDetail.component.IV')
    },
    {
      code: 'IM',
      text: $translate('prescribingRecord.prescribingDetail.component.IM')
    },
    {
      code: 'IVD',
      text: $translate('prescribingRecord.prescribingDetail.component.IVD')
    },
    {
      code: 'TOPI',
      text: $translate('prescribingRecord.prescribingDetail.component.TOPI')
    },
    {
      code: 'EXT',
      text: $translate('prescribingRecord.prescribingDetail.component.EXT')
    },
    {
      code: 'AC',
      text: $translate('prescribingRecord.prescribingDetail.component.AC')
    },
    {
      code: 'PC',
      text: $translate('prescribingRecord.prescribingDetail.component.PC')
    },
    {
      code: 'Meal',
      text: $translate('prescribingRecord.prescribingDetail.component.Meal')
    }
  ];

  // 頻率：目前只開放ST
  self.allFrequencyOptions = [
    {
      code: 'STAT',
      text: $translate('prescribingRecord.prescribingDetail.component.ST')
    }
  ];

  // 計算藥品總量
  self.calculationTotal = function calculationTotal() {
    // if (event) { event.preventDefault(); }
    let medicationtotal = 0;
    const quantity = self.serviceData.Quantity ? self.serviceData.Quantity : null;
    const frequency = self.serviceData.Frequency ? self.serviceData.Frequency : null;
    // ST 立即使用，固定天數 1 天
    self.serviceData.Days = 1;
    if (quantity > 0 && frequency !== '') {
      medicationtotal = 1 * quantity;
    }
    self.serviceData.TotalQuantity = medicationtotal;
  };

}

// 查詢全院開立藥品
checkWholeMedicineCtrl.$inject = ['$rootScope', 'PrescribingRecordService', '$stateParams', '$state', 'showMessage', 'SettingService', '$scope', '$filter', 'tpechService', 'PatientService'];

function checkWholeMedicineCtrl(
  $rootScope,
  PrescribingRecordService,
  $stateParams,
  $state,
  showMessage,
  SettingService,
  $scope,
  $filter,
  tpechService,
  PatientService
) {
  const self = this;
  let $translate = $filter('translate');
  self.loading = true;
  const UserInfo = SettingService.getCurrentUser();
  self.serviceData = null; // 用藥資料
  self.currentPatient = {};
  self.routeOptions = [];
  self.frequencyOptions = [];
  self.checkedMedAry = [];

  self.$onInit = function $onInit() {
    PatientService.getById($stateParams.patientId).then((res) => {
      console.log('PatientService getById success', res);
      self.currentPatient = res.data;

      self.loadWholeMedicine();
    }, (err) => {
      console.log('PatientService getById fail', res);
    });
  };

  self.loadWholeMedicine = function () {
    let today = new Date();
    let tdYear = today.getFullYear();
    tdYear = tdYear - 1911;
    let todayTW = tdYear.toString() + moment().format("MMDD");
    // 取得院內全部開藥記錄
    tpechService.getAllMedicine(self.currentPatient.MedicalId, todayTW, todayTW).then((res) => {
      console.log("tpechService getAllMedicine success", res);
      self.serviceData = res.data;

      for (let mi in self.serviceData) {
        let tmpMed = self.serviceData[mi];
        tmpMed.TOT_DOSE = tmpMed.DOSE * tmpMed.DAYS;
        self.serviceData[mi] = tmpMed;
      }

      self.loading = false;
    }, (res) => {
      console.log("tpechService getAllMedicine fail", res);
      self.loading = false;
    });
  };

  // 儲存(save)
  self.submit = function submit() {
    // 組合 import data 所需欄位
    let postDataObj = {};
    postDataObj.PatientId = $stateParams.patientId;
    postDataObj.CreatedUserId = UserInfo.Id;
    postDataObj.CreatedUserName = UserInfo.Name;
    postDataObj.DialysisId = "";
    postDataObj.OrderMasterIds = [];
    for (let mi = 0; mi < self.checkedMedAry.length; mi++) {
      let tmpMed = self.checkedMedAry[mi];

      postDataObj.Days = tmpMed.DAYS;
      postDataObj.StartDate = tmpMed.START_DATE;
      postDataObj.OrderMasterIds.push(tmpMed.ODR_CODE);
    }

    PrescribingRecordService.ImportMaster(postDataObj).then((res) => {
      if (res.statusText !== 'OK') {
        // showMessage('寫入' + self.showDate + '月用藥資料失敗。原因:' + res.statusText);
        showMessage($translate('prescribingRecord.checkWholeMedicine.component.writeError', { showDate: self.showDate, statusText: res.statusText }));
      } else if (parseInt(res.data, 10) > 0) {
        PrescribingRecordService.getMonthExecution($stateParams.patientId, moment(importDate).format('YYYY-MM-DD'), true).then((res2) => {
          if (res2.status === 200) {
            showMessage($translate('prescribingRecord.checkWholeMedicine.component.importSuccess'));
            // 即時重讀未執行筆數
            $scope.$emit('tabCount', {
              type: 'allExecute'
            });
          } else {
            showMessage($translate('prescribingRecord.checkWholeMedicine.component.loadDataError'));
          }
          history.go(-1);
        });
      } else {
        showMessage($translate('prescribingRecord.checkWholeMedicine.component.noPrescription'));
      }
    });
  };

  self.toggle = function toggle(item, list) {
    const idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
  };

  self.exists = function exists(item, list) {
    return list.indexOf(item) > -1;
  };

  // 回至列表
  self.gotoList = function gotoList() {
    if ($state.current.name.substr(0, 2) === 'pd') {
      $state.go('pdPrescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    } else {
      $state.go('prescribingRecord', {
        patientId: $stateParams.patientId,
        headerId: $stateParams.headerId,
        listDate: moment(self.serviceData.StartDate).format('YYYY-MM-DD')
      }, {
          reload: true
        });
    }
  };

  // 回上一頁
  self.goback = function goback() {
    history.go(-1);
  };

  // 途徑
  self.allRouteOptions = [
    {
      code: '',
      text: ''
    },
    {
      code: 'PO',
      text: $translate('prescribingRecord.prescribingDetail.component.PO')
    },
    {
      code: 'SC',
      text: $translate('prescribingRecord.prescribingDetail.component.SC')
    },
    {
      code: 'SL',
      text: $translate('prescribingRecord.prescribingDetail.component.SL')
    },
    {
      code: 'IV',
      text: $translate('prescribingRecord.prescribingDetail.component.IV')
    },
    {
      code: 'IM',
      text: $translate('prescribingRecord.prescribingDetail.component.IM')
    },
    {
      code: 'IVD',
      text: $translate('prescribingRecord.prescribingDetail.component.IVD')
    },
    {
      code: 'TOPI',
      text: $translate('prescribingRecord.prescribingDetail.component.TOPI')
    },
    {
      code: 'EXT',
      text: $translate('prescribingRecord.prescribingDetail.component.EXT')
    },
    {
      code: 'AC',
      text: $translate('prescribingRecord.prescribingDetail.component.AC')
    },
    {
      code: 'PC',
      text: $translate('prescribingRecord.prescribingDetail.component.PC')
    },
    {
      code: 'Meal',
      text: $translate('prescribingRecord.prescribingDetail.component.Meal')
    }
  ];

  // 頻率：目前只開放ST
  self.allFrequencyOptions = [
    {
      code: 'STAT',
      text: $translate('prescribingRecord.prescribingDetail.component.ST')
    }
  ];

}

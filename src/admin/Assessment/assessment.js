import tpl from './assessment.html';

angular.module('app').component('assessment', {
  template: tpl,
  controller: assessmentCtrl,
  controllerAs: 'vm'
});

assessmentCtrl.$inject = ['$mdSidenav', '$state', 'assessmentService', 'showMessage', '$filter'];
function assessmentCtrl($mdSidenav, $state, assessmentService, showMessage, $filter) {
  const vm = this;
  let tmpItem = '';
  let tmpOptions = '';
  let $translate = $filter('translate');

  // 有可能是手機點進來的, 所以要把左側選單收起來
  // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
  $mdSidenav('left').close();
  vm.openLeftMenu = function openLeftMenu() {
    $mdSidenav('left').toggle();
  };

  // 初始載入區
  vm.$onInit = function onInit() {
    // 更改讀取狀態
    vm.loading = true;

    // 取得評估資料--洗前
    assessmentService.getByType('pre').then((resp1) => {
        console.log(resp1);
        vm.assessments_pre = resp1.data;
        if (vm.assessments_pre) {
          vm.totalItems_pre = vm.assessments_pre.Items.length;
      } else {
          vm.totalItems_pre = 0;
      }
        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息
      }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ServerError
    });

    // 取得評估資料--洗中
    assessmentService.getByType('in').then((resp2) => {
        console.log(resp2);
        vm.assessments_in = resp2.data;
        if (vm.assessments_in) {
          vm.totalItems_in = vm.assessments_in.Items.length;
      } else {
          vm.totalItems_in = 0;
      }
        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息
      }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ServerError
    });

    // 取得評估資料--洗後
    assessmentService.getByType('post').then((resp3) => {
        console.log(resp3);
        vm.assessments_post = resp3.data;
        if (vm.assessments_post) {
          vm.totalItems_post = vm.assessments_post.Items.length;
      } else {
          vm.totalItems_post = 0;
      }
        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息s
      }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ServerError
    });

  };

  // 進入編輯評估項目頁面
  vm.gotoAssessmentData = function gotoAssessmentData(data, itype) {
      // debugger;
      // console.log(ind);
    $state.go('assessmentDetail', { id: data, type: itype });
    // $state.go('assessmentDetail', { id: data.Item, type: itype });
};

  // 進入新增評估項目頁面
  vm.gotoCreate = function gotoCreate() {
    $state.go('assessmentDetail', { id: 'create', type: '' });
  };

    // 排序:項目往上調整
    vm.moveUp = function moveUp(data, type) {
        if (type === 'pre') {
            vm.assessments = vm.assessments_pre;
        } else if (type === 'in') {
            vm.assessments = vm.assessments_in;
        } else {
            vm.assessments = vm.assessments_post;
        }
        angular.forEach(vm.assessments.Items, function (item, ind) {
            if (item.Item === data.Item) {
                if (ind !== 0) {
                    tmpItem = vm.assessments.Items[ind - 1].Item;
                    tmpOptions = vm.assessments.Items[ind - 1].Options;
                    vm.assessments.Items[ind - 1].Item = vm.assessments.Items[ind].Item;
                    vm.assessments.Items[ind - 1].Options = vm.assessments.Items[ind].Options;
                    vm.assessments.Items[ind].Item = tmpItem;
                    vm.assessments.Items[ind].Options = tmpOptions;
                    delete vm.assessments.Id;
                    assessmentService.put(vm.assessments).then((resp4) => {
                        if (type === 'pre') {
                            vm.assessments_pre = resp4.data;
                        } else if (type === 'in') {
                            vm.assessments_in = resp4.data;
                        } else {
                            vm.assessments_post = resp4.data;
                        }
                        // 修改評估項目
                        showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                        $state.reload();
                    }, () => {
                        showMessage($translate('customMessage.EditFail')); // lang.EditFail
                    });
                }
            }
        });
    };

    // 排序:項目往下調整
    vm.moveDown = function moveDown(data, type) {
        if (type === 'pre') {
            vm.assessments = vm.assessments_pre;
        } else if (type === 'in') {
            vm.assessments = vm.assessments_in;
        } else {
            vm.assessments = vm.assessments_post;
        }
        angular.forEach(vm.assessments.Items, function (item, ind) {
            if (item.Item === data.Item) {
                if (ind !== vm.assessments.Items.length - 1) {
                    tmpItem = vm.assessments.Items[ind + 1].Item;
                    tmpOptions = vm.assessments.Items[ind + 1].Options;
                    vm.assessments.Items[ind + 1].Item = vm.assessments.Items[ind].Item;
                    vm.assessments.Items[ind + 1].Options = vm.assessments.Items[ind].Options;
                    vm.assessments.Items[ind].Item = tmpItem;
                    vm.assessments.Items[ind].Options = tmpOptions;
                    delete vm.assessments.Id;
                    assessmentService.put(vm.assessments).then((resp5) => {
                        if (type === 'pre') {
                            vm.assessments_pre = resp5.data;
                        } else if (type === 'in') {
                            vm.assessments_in = resp5.data;
                        } else {
                            vm.assessments_post = resp5.data;
                        }
                        // 修改評估項目
                        showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                        $state.reload();
                    }, () => {
                        showMessage($translate('customMessage.EditFail')); // lang.EditFail
                    });
                }
            }
        });
    };

    // // 排序:項目往上調整
//     vm.moveUp = function moveUp(data) {
//         angular.forEach(vm.assessments, function (item, ind) {
//           if (item.Item === data.Item) {
//                 if (ind !== 0) {
//                     tmpItem = vm.assessments[ind - 1].Item;
//                     tmpOptions = vm.assessments[ind - 1].Options;
//                     vm.assessments[ind - 1].Item = vm.assessments[ind].Item;
//                     vm.assessments[ind - 1].Options = vm.assessments[ind].Options;
//                     vm.assessments[ind].Item = tmpItem;
//                     vm.assessments[ind].Options = tmpOptions;
//                     delete vm.assessments.Id;
//                     console.log(vm.assessments);
//                     assessmentService.put(vm.assessments).then(() => {
//                     // 修改評估項目
//                     showMessage(lang.Datasuccessfully);
//                     $state.reload();
//                     }, () => {
//                         showMessage(lang.EditFail);
//                     });
//                 }
//             }
//         });
//     };

//   // 排序:項目往下調整
//   vm.moveDown = function moveDown(data) {
//       angular.forEach(vm.assessments, function (item, ind) {
//           if (item.Item === data.Item) {
//               if (ind !== vm.assessments.length - 1) {
//                   tmpItem = vm.assessments[ind + 1].Item;
//                   tmpOptions = vm.assessments[ind + 1].Options;
//                   vm.assessments[ind + 1].Item = vm.assessments[ind].Item;
//                   vm.assessments[ind + 1].Options = vm.assessments[ind].Options;
//                   vm.assessments[ind].Item = tmpItem;
//                   vm.assessments[ind].Options = tmpOptions;
//                   delete vm.assessments.Id;
//                   console.log(vm.assessments);
//                   assessmentService.put(vm.assessments).then(() => {
//                   // 修改評估項目
//                   showMessage(lang.Datasuccessfully);
//                   $state.reload();
//                   }, () => {
//                       showMessage(lang.EditFail);
//                   });
//               }
//           }
//       });
//   };
}

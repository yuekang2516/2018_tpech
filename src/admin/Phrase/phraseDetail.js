import tpl from './phraseDetail.html';
import cdtpl from './phraseCategoryDialog.html';
import pdtpl from './phraseDialog.html';

angular.module('app').component('phraseDetail', {
  template: tpl,
  controller: SystemPhraseDetailCtrl,
  controllerAs: 'vm'
});

SystemPhraseDetailCtrl.$inject = ['$window', '$state', '$stateParams', '$mdDialog', 'phraseService', 'showMessage', 'SettingService', '$filter', '$sessionStorage'];
function SystemPhraseDetailCtrl($window, $state, $stateParams, $mdDialog, phraseService, showMessage, SettingService, $filter, $sessionStorage) {
  const vm = this;
  let $translate = $filter('translate');

  vm.$onInit = function onInit() {
    // 進入此頁面後拉到最頂
    $window.scrollTo(0, 0);
    // 更改讀取狀態
    vm.loading = true;
    vm.user = SettingService.getCurrentUser();
    // 讀取資訊，先決定API來源
    if ($stateParams.categoryId === 'home') {
      // 讀取片語目錄相關資訊
      phraseService.getByWardId($stateParams.wardId, $stateParams.wardId === 'personalphrase' ? vm.user.Id : null).then((resp) => {
        vm.phrase = resp.data;
        vm.currentCategoryName = vm.phrase.currentCategoryName || null;
        vm.deletedCategoryCount = 0;
        vm.deletedPhraseCount = 0;

        // 計算以下兩個筆數是為了顯示"沒有資料"的判斷
        // 計算已刪除資料筆數
        _.forEach(vm.phrase.category, (category) => {
          if (category.Status === 'Deleted') {
            vm.deletedCategoryCount += 1;
          }
        });

        // 計算已刪除資料筆數
        _.forEach(vm.phrase.phrase, (phrase) => {
          if (phrase.Status === 'Deleted') {
            vm.deletedPhraseCount += 1;
          }
        });

        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息
      }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
      });
    } else {
      // 讀取子層片語目錄相關資訊
      // $stateParams.wardId
      phraseService.getByCategoryId($stateParams.categoryId).then((resp) => {
        vm.phrase = resp.data;
        vm.currentCategoryName = vm.phrase.currentCategoryName || null;
        vm.deletedCategoryCount = 0;
        vm.deletedPhraseCount = 0;

        // 計算以下兩個筆數是為了顯示"沒有資料"的判斷
        // 計算已刪除資料筆數
        _.forEach(vm.phrase.category, (category) => {
          if (category.Status === 'Deleted') {
            vm.deletedCategoryCount += 1;
          }
        });

        // 計算已刪除資料筆數
        _.forEach(vm.phrase.phrase, (phrase) => {
          if (phrase.Status === 'Deleted') {
            vm.deletedPhraseCount += 1;
          }
        });

        vm.loading = false;
        vm.isError = false; // 顯示伺服器連接失敗的訊息
      }, () => {
        vm.loading = false;
        vm.isError = true;
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
      });
    }

    // 讀取麵包屑(捷徑)資訊
    phraseService.getBreadcrumb($stateParams.wardId === '' ? $stateParams.phraseKind : $stateParams.wardId, $stateParams.categoryId).then((resp) => {
      vm.breadcrumb = resp.data;
      // 對breadcrumb做事後處理 如果API那段有修改就不需要這段
      _.forEach(vm.breadcrumb, (value) => { value.Url = value.Url.replace('/setting', '/admin.html#/admin'); });
    }, () => {
      showMessage($translate('customMessage.serverError')); // lang.ComServerError
    });
  };

  // 用麵包屑捷徑更改路由
  vm.changeState = function changeState(Url) {
    const parts = Url.split('/');
    // 判斷是不是片語明細
    if (parts.length > 5) {
      // 判斷是不是當前state，如果是就reload
      if ($stateParams.wardId === parts[4] && $stateParams.categoryId === parts[5]) {
        $state.reload();
      } else {
        $state.go('phraseDetail', { wardId: parts[4], categoryId: parts[5], phraseKind: $stateParams.phraseKind });
      }
    } else {
      $state.go('phrase');
    }
  };

  vm.showBreadcrumb = function showBreadcrumb(name) {
    let sName = '';
    if (name === 'rootphrase') {
        sName = $translate('phrase.rootphrase'); // '片語目錄';
    } else if (name === 'personal') {
        sName = $translate('phrase.personal'); // 個人片語;
    } else if (name === 'system') {
        sName = $translate('phrase.system'); // 系統片語;
    } else {
        sName = name;
    }
    return sName;
  };

  // 進入子目錄頁面
  vm.gotoPhrase = function gotoPhrase(Id, cId) {
    $state.go('phraseDetail', { wardId: Id, categoryId: cId, phraseKind: $stateParams.phraseKind });
  };

  // 顯示刪除對話視窗
  vm.showDeleteDialog = function showDeleteDialog(ev, type, data) {
    // 決定對話視窗內的字樣
    if (type === 'PhraseCategory') {
      vm.type = $translate('phrase.catalog'); // '目錄'
    } else {
      vm.type = $translate('phrase.phrase'); // '片語'
    }

    // 設定對話視窗參數
    const confirm = $mdDialog.confirm()
      .title($translate('phrase.component.confirmDelete')) // '刪除確認'
      .textContent($translate('phrase.component.textContent', { type: vm.type })) // `您即將刪除${vm.type}，點擊確認後將會刪除此內容，已刪除內容可於顯示刪除模式中復原`
      .ariaLabel('delete confirm')
      .targetEvent(ev)
      .ok($translate('phrase.component.deleteOk')) // '確認'
      .cancel($translate('phrase.component.deleteCancel')); // '取消'

    // 呼叫對話視窗
    $mdDialog.show(confirm).then(() => {
      if (type === 'PhraseCategory') {
        phraseService.deletePhraseCategory(data).then(() => {
          showMessage($translate('customMessage.DeleteSuccess')); // lang.DeleteSuccess

          $state.reload();
        }, () => {
          showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
      } else {
        phraseService.deletePhrase(data).then(() => {
          showMessage($translate('customMessage.DeleteSuccess')); // lang.DeleteSuccess

          $state.reload();
        }, () => {
          showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
      }
    });
  };

  // 還原已刪除的選項
  vm.revert = function revert(ev, type, data) {
    if (type === 'PhraseCategory') {
      phraseService.revertPhraseCategory(data).then(() => {
        showMessage($translate('customMessage.RevertDataSuccess')); // lang.RevertDataSuccess

        $state.reload();
      }, () => {
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
      });
    } else {
      phraseService.revertPhrase(data).then(() => {
        showMessage($translate('customMessage.RevertDataSuccess')); // lang.RevertDataSuccess

        $state.reload();
      }, () => {
        showMessage($translate('customMessage.serverError')); // lang.ComServerError
      });
    }
  };

  // 顯示新增目錄對話視窗
  vm.showCategoryDialog = function showCategoryDialog(ev, data) {
    vm.data = data;

    $mdDialog.show({
      controller: categoryDialogController,
      controllerAs: 'dvm',
      template: cdtpl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: vm.customFullscreen
    });
  };

  // 設定子視窗的controller
  function categoryDialogController() {
    const dvm = this;

    if (vm.data === 'add') {
      dvm.title = $translate('phrase.component.addCatalogtitle'); // '新增目錄';
    } else {
      dvm.title = $translate('phrase.component.editCatalogtitle'); // '編輯目錄';

      // 用data帶入內容
      dvm.categoryName = vm.data.Name;
    }

    dvm.cancel = function cancel() {
      $mdDialog.cancel();
    };

    // 儲存目錄
    dvm.save = function save() {
      dvm.isSaving = true;
      // 先檢查必填欄位
      if (dvm.validCheck() === false) {
        showMessage($translate('phrase.component.operatingfailure')); // '操作失敗, 輸入有誤!'
        dvm.isSaving = false;
      } else {
        let obj = {};
        const httpMethod = vm.data === 'add' ? 'post' : 'put';
        const ParentId = $stateParams.categoryId === 'home' ? null : $stateParams.categoryId;
        const WardId = ($stateParams.wardId === 'personalphrase' || $stateParams.wardId === 'systemphrase') ? null : $stateParams.wardId;

        // 把 obj組起來 再送出去
        if (httpMethod === 'post') {
          obj.WardId = WardId; // 所屬透析室
          obj.Name = dvm.categoryName; // 目錄名稱
          obj.ParentId = ParentId; // 上層代碼 - null = 第一層目錄
          obj.Sequence = 0; // 排序 - 先都帶0進去
          if ($stateParams.wardId === 'personalphrase') {
            obj.OwnerId = vm.user.Id;
          }
          phraseService.savePhraseCategory(obj).then(() => {
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            dvm.isSaving = false;
            $mdDialog.hide();

            $state.reload();
          }, () => {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            dvm.isSaving = false;
          });
        } else if (httpMethod === 'put') {
          obj = vm.data;
          obj.Name = dvm.categoryName; // 目錄名稱

          phraseService.editPhraseCategory(obj).then(() => {
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            dvm.isSaving = false;
            $mdDialog.hide();

            $state.reload();
          }, () => {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            dvm.isSaving = false;
          });
        } else {
          // 防呆
          showMessage($translate('phrase.component.operatingfailuretype')); // '操作失敗, Type異常'
          dvm.isSaving = false;
        }
      }
    };

    // 檢查是否有填值
    dvm.validCheck = function validCheck() {
      if (dvm.categoryName) {
        return true;
      }

      return false;
    };
  }

  // 顯示新增片語對話視窗
  vm.showPhraseDialog = function showPhraseDialog(ev, data) {
    vm.data = data;

    $mdDialog.show({
      controller: phraseDialogController,
      controllerAs: 'dvm',
      template: pdtpl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: vm.customFullscreen
    });
  };

  // 設定子視窗的controller
  function phraseDialogController() {
    const dvm = this;

    if (vm.data === 'add') {
      dvm.title = $translate('phrase.component.addPhrasetitle'); // '新增片語';
    } else {
      dvm.title = $translate('phrase.component.editPhrasetitle'); // '編輯片語';

      // 用data帶入內容
      dvm.phraseTitle = vm.data.Title;
      dvm.phraseContent = vm.data.Content;
    }

    dvm.cancel = function cancel() {
      $mdDialog.cancel();
    };

    // 儲存片語
    dvm.save = function save() {
      dvm.isSaving = true;
      // 先檢查必填欄位
      if (dvm.validCheck() === false) {
        showMessage($translate('phrase.component.operatingfailure')); // '操作失敗, 輸入有誤!'
        dvm.isSaving = false;
      } else {
        let obj = {};
        const httpMethod = vm.data === 'add' ? 'post' : 'put';

        // 把 obj組起來 再送出去
        if (httpMethod === 'post') {
          obj = {
            Title: dvm.phraseTitle, // 片語標題
            Content: dvm.phraseContent, // 片語內容
            WardId: ($stateParams.wardId === 'personalphrase' || $stateParams.wardId === 'systemphrase') ? null : $stateParams.wardId, // 所屬透析室
            CategoryId: $stateParams.categoryId === 'home' ? null : $stateParams.categoryId, // 類別代碼
            CategoryName: vm.currentCategoryName, // 類別名稱
            OwnerId: $stateParams.phraseKind === 'personalphrase' ? $sessionStorage.UserInfo.Id : null
          };

          phraseService.savePhrase(obj).then(() => {
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            dvm.isSaving = false;
            $mdDialog.hide();

            $state.reload();
          }, () => {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            dvm.isSaving = false;
          });
        } else if (httpMethod === 'put') {
          obj = vm.data;
          obj.Title = dvm.phraseTitle; // 片語標題
          obj.Content = dvm.phraseContent; // 片語內容

          phraseService.editPhrase(obj).then(() => {
            showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
            dvm.isSaving = false;
            $mdDialog.hide();

            $state.reload();
          }, () => {
            showMessage($translate('customMessage.DatasFailure')); // lang.DatasFailure
            dvm.isSaving = false;
          });
        } else {
          // 防呆
          showMessage($translate('phrase.component.operatingfailuretype')); // '操作失敗, Type異常'
          dvm.isSaving = false;
        }
      }
    };

    // 檢查是否有填值
    dvm.validCheck = function validCheck() {
      if (dvm.phraseTitle && dvm.phraseContent) {
        return true;
      }

      return false;
    };
  }
}

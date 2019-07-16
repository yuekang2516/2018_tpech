/* global $*/
/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/3/17
 * 功能說明: 片語 (開發中)
 * 回傳值:  call callback function is string
 * example: <phrase callback="$ctrl.phraseInsertCallback(word)" ></phrase>
 * 版本: 開發中
 *****************************************/
import phraseUrl from './phraseIndex.html';

angular
.module('app')
.directive('phrase', () => ({
  restrict: 'EA',
  require: 'ngModel',
  controllerAs: 'vm',
  controller: phraseCtrl,
  bindToController: true,
  scope: {
    vm: '=?',
    callback: '&?'
  },
  template: phraseUrl
}));

phraseCtrl.$inject = ['$stateParams', '$rootScope', '$mdToast', '$mdSidenav', 'PhraseButtonService', '$q', '$mdDialog', 'SettingService', '$mdMedia', '$filter'];

function phraseCtrl($stateParams, $rootScope, $mdToast, $mdSidenav, PhraseButtonService,
  $q, $mdDialog, SettingService, $mdMedia, $filter) {

  const vm = this;
  let $translate = $filter('translate');
  vm.user = SettingService.getCurrentUser();
  vm.WardSettings = SettingService.getCurrentUser().Ward;
  vm.phraseTitleName = ''; // 片語標題
  vm.phraseId = ''; // 當前頁面編號
  vm.phraseListPage = []; // 片語Data
  vm.phrasecallbacklistId = []; // 上一頁id 瀏覽歷程
  vm.loading = true;
  vm.$onInit = function $onInit() {
    vm.handleAddPhraseList(null, null, $translate('phrase.component.phraseIndex')); // '片語目錄'
  };
  vm.handleAddPhraseList = function handleAddPhraseList(type, id, name) {
    // 所有瀏覽過的分業資訊，關閉時要清空
    const newPhraseId = Math.random();
    const promise = vm.newPhraseLisePage(type, id);
    // 找尋目錄
    promise.then((item) => {
      vm.phraseTitleName = name;
      vm.phraseId = newPhraseId;
      vm.phrasecallbacklistId.push(newPhraseId);
      vm.phraseListPage.push({
        name: name || $translate('phrase.component.phraseIndex'), // '片語目錄'
        id: newPhraseId,
        category_id: id,
        type,
        obj: item
      });
    });
  };
  // 關閉
  vm.closeRight = function closeRight() {
    $mdSidenav('rightPhrase').close();
  };
  // 回上一頁
  vm.closeSelf = function closeSelf() {
    let items = vm.phraseListPage;
    items = items.filter(p => p.id !== vm.phrasecallbacklistId[vm.phrasecallbacklistId.length - 1]);
    // 當找不到任何目錄前頁，退回去
    if (items.length === 0) {
      $mdSidenav('rightPhrase').close();
    } else {
      // // 刪除瀏覽歷程
      vm.phrasecallbacklistId.splice(vm.phrasecallbacklistId.length - 1, 1);
      // // 列表導回前一頁
      vm.phraseTitleName = items[items.length - 1].name;
      vm.phraseId = items[items.length - 1].id;
      vm.phraseListPage = items;
    }
  };
  // 點擊片語項目
  vm.handleClickPhraseBox = function handleClickPhraseBox(event, item) {
    // 如果是片語就丟出來
    if (item.type === 'phrase') {
      if (typeof vm.callback === 'function') {
        vm.callback({
          word: item.content
        });
      }
    } else {
      // event.currentTarget.disabled = true;
      vm.handleAddPhraseList(item.type, item.id, item.name);
    }
  };
  // load data
  vm.newPhraseLisePage = function newPhraseLisePage(type, id) {
    const deferred = $q.defer();
    vm.loading = true;
    let apiAddress;

    if (type === 'ward') {
      apiAddress = `/api/phraseCategory/getbywardid/${id}?userId=${vm.user.Id}`;
    } else if (type === 'user') {
      apiAddress = `/api/phraseCategory/getbywardid/personalphrase?userId=${vm.user.Id}`;
    } else if (type === 'system') {
      apiAddress = '/api/phraseCategory/getbywardid/systemphrase';
    } else if (type === 'category') {
      apiAddress = `/api/phraseCategory/getbycategoryid/${id}?userId=${vm.user.Id}`;
    }

    const items = [];
    if (apiAddress) {
      PhraseButtonService.get(apiAddress).then((q) => {
        q.data.category.forEach((c) => {
          if (c.Status !== 'Deleted') {
            items.push({
              name: c.Name,
              type: 'category',
              id: c.Id,
              Status: c.Status
            });
          }
        });
        q.data.phrase.forEach((c) => {
          if (c.Status !== 'Deleted') {
            items.push({
              name: c.Title,
              type: 'phrase',
              id: c.Id,
              content: c.Content,
              Status: c.Status
            });
          }
        });
        vm.loading = false;
        deferred.resolve(items);
      });
    } else {
      items.push({ name: $translate('phrase.component.personalPhrase'), type: 'user', id: null }); // '個人片語'
      items.push({ name: $translate('phrase.component.systemPhrase'), type: 'system', id: null }); // '系統片語'
      Object.keys(vm.WardSettings).map(keys =>
        items.push({
          name: vm.WardSettings[keys],
          type: 'ward',
          id: keys
        }));
      vm.loading = false;
      deferred.resolve(items);
    }
    return deferred.promise;
  };
  // 新增目錄、片語
  vm.handleCreateModal = function handleCreateModal(event, method, modalObj = null) {
    $mdDialog.show({
      locals: {
        method,
        modalObj
      },
      controller: ['$mdDialog', 'method', 'modalObj', DialogController],
      templateUrl: `${method}.html`,
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: true,
      fullscreen: !$mdMedia('gt-sm'),
      controllerAs: 'dia'
    })
      .then((items) => {
        const promise = vm.newPhraseLisePage(items.type, items.category_id);
        promise.then((thisitem) => {
          // 因為刪除後陣列長度會不同，兩者比對完後會多出最後一筆
          // Object.assign(items.obj, thisitem);
          items.obj = thisitem;
        });
      });
    function DialogController(mdDialog, mod, mobj = null) {
      const dia = this;
      const items = vm.phraseListPage.filter(p => p.id === vm.phraseId)[0];
      if (mobj !== null && mobj.type === 'category') {
        dia.CategoryName = mobj.name;
      }
      if (mobj !== null && mobj.type === 'phrase') {
        dia.Name = mobj.name;
        dia.Content = mobj.content;
      }
      let obj = {};
      dia.ok = function ok() {
        switch (mod) {
          case 'delete': {
            let delUrl;
            const serverApiUrl = SettingService.getServerUrl();

            if (mobj !== null && mobj.type === 'phrase') {
              obj = {
                Id: mobj.id,
                Title: dia.Name,
                Content: dia.Content,
                ModifiedUserId: vm.user.Id,
                ModifiedUserName: vm.user.Name
              };
              delUrl = `${serverApiUrl}/api/phrase/delete/`;
            } else if (mobj !== null && mobj.type === 'category') {
              obj = {
                Id: mobj.id,
                Name: dia.CategoryName,
                ModifiedUserId: vm.user.Id,
                ModifiedUserName: vm.user.Name
              };
              delUrl = `${serverApiUrl}/api/phraseCategory/delete/`;
            }
            PhraseButtonService.del(delUrl, obj).then((res) => {
              if (res.status === 200) {
                mdDialog.hide(items);
                $mdToast.show(
                  $mdToast.simple()
                    .textContent($translate('phrase.component.deleteSuccess')) // 刪除成功!
                    .position('top right')
                    .hideDelay(3000)
                );
              }
            });
            break;
          }
          case 'create-category':
            obj = {
              Name: dia.CategoryName, // 目錄名稱
              WardId: items.type === 'user' ? null : items.category_id, // 所屬透析室
              OwnerId: items.type === 'user' ? vm.user.Id : null,
              ParentId: items.type === 'ward' ? null : items.category_id
            };
            PhraseButtonService.postCategory(obj).then((res) => {
              if (res.status === 200) {
                mdDialog.hide(items);
                $mdToast.show(
                    $mdToast.simple()
                      .textContent($translate('phrase.component.createSuccess')) // 新增成功!
                      .position('top right')
                      .hideDelay(3000)
                  );
              }
            });
            break;
          case 'create-phrase':
            obj = {
              Title: dia.Name,    // 片語標題
              Content: dia.Content,  // 片語內容
              WardId: items.type === 'user' ? null : items.category_id, // 所屬透析室
              OwnerId: items.type === 'user' ? vm.user.Id : null,
              CategoryId: items.category_id
            };
            PhraseButtonService.postPhrase(obj).then((res) => {
              if (res.status === 200) {
                mdDialog.hide(items);
                $mdToast.show(
                  $mdToast.simple()
                    .textContent($translate('phrase.component.createSuccess')) // 新增成功!
                    .position('top right')
                    .hideDelay(3000)
                );
              }
            });
            break;
          case 'edit-category':
            obj = {
              Id: mobj.id,
              Name: dia.CategoryName,
              ModifiedUserId: vm.user.Id,
              ModifiedUserName: vm.user.Name
            };
            PhraseButtonService.putCategory(obj).then((res) => {
              if (res.status === 200) {
                mdDialog.hide(items);
                $mdToast.show(
                  $mdToast.simple()
                    .textContent($translate('phrase.component.updateSuccess')) // 修改成功!
                    .position('top right')
                    .hideDelay(3000)
                );
              }
            });
            break;
          case 'edit-phrase':
            obj = {
              Id: mobj.id,
              Title: dia.Name,
              Content: dia.Content,
              ModifiedUserId: vm.user.Id,
              ModifiedUserName: vm.user.Name
            };
            PhraseButtonService.putPhrase(obj).then((res) => {
              if (res.status === 200) {
                mdDialog.hide(items);
                $mdToast.show(
                  $mdToast.simple()
                    .textContent($translate('phrase.component.updateSuccess')) // 修改成功!
                    .position('top right')
                    .hideDelay(3000)
                );
              }
            });
            break;
          default:
            break;
        }
      };
      dia.cancel = function cancel() {
        mdDialog.cancel();
      };
    }
  };
  vm.openMenu = function openMenu($mdMenu, ev) {
    $mdMenu.open(ev);
  };
  vm.closeMenu = function closeMenu($mdMenu) {
    $mdMenu.close();
  };
}

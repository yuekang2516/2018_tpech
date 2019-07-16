/** ***************************************
 * ng-repeat事件後呼叫
 * 建檔人員: Andersen
 * 建檔日期: 2017/2/20
 * 功能說明: 在有使用ng-repeater的element上加上on-finish-render屬性,並指定要執行的方法,例:
 *           <div ng-repeat="item in $ctrl.lists" on-finish-render="$ctrl.myFunc()">
 *              {{ item.name }}
 *           </div>
 * 修改記錄:
 * 關聯程式:
 *****************************************/

function onFinishRenderDirective($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(() => {
          scope.$evalAsync(attr.onFinishRender);
        });
      }
    }
  };
}

angular
  .module('app')
  .directive('onFinishRender', [
    '$timeout',
    onFinishRenderDirective
  ]);

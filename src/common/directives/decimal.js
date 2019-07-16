/* global $*/
/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/3/13
 * 功能說明: 取小數點N位，四捨五入
 * 回傳值: string
 * 參考文檔: null
 * 版本: 0.1
 * 範例： <span set-value="45.128" decimals="2" on-Decimal-Load></span> show =======> 25.13
 *****************************************/

angular
  .module('app')
  .directive('onDecimalLoad', ['$timeout', $timeout => ({
    restrict: 'A',
    scope: {
      setValue: '=?', // 要傳入的數字
      decimals: '&?' // 小數點幾位
    },
    link($scope, $element) {
      const decimalCount = parseInt($scope.decimals, 10) || 2;
      $scope.$watch('setValue', (newValue) => {
        let setValue = newValue === null ? 0 : newValue;
        $timeout(() => {
          setValue = (Math.round(setValue * Math.pow(10, decimalCount)) / Math.pow(10, decimalCount)).toString();
          $element.text(setValue);
        });
      }, true);
    }
  })]);

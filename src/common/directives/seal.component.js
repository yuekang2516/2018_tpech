
import tpl from './seal.html';

/*
*** model: object; 資料 (需要 CreatedUserName / ModifiedUserName 欄位)
*** created: string; 填入 none (不顯示) 或 always (顯示); default: always
*** modified: string; 填入 none (不顯示), always (顯示) 或 hideIfSame (與 CreatedUserName 相同時隱藏) ; default: always
*** label: string; 傳入自定義的字串，有值才會顯示
*** myStyle: object; 可傳入自定義的 style (position, display...)
    ex. 於 controller中: self.myStyle = { position: 'relatve', display:'inline-block'... }
*** fixed: boolean; 決定是否用絕對位置; default: false
*/
angular.module('app').component('seal', {
    restrict: 'E',
    template: tpl,
    bindings: {
        model: '<',
        created: '@',
        modified: '@',
        label: '@',
        myStyle: '<',
        fixed: '@',
        name: '@'
    }
});


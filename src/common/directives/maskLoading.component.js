import tpl from './maskLoading.html';

/*
    isShowTitle: 是否顯示loading字樣 (boolean)
    titleText: 要顯示的loading字樣 (string)
*/

angular
    .module('app')
    .component('maskLoading', {
    template: tpl,
    bindings: {
        isShowTitle: '<',
        titleText: '@'
    }

});

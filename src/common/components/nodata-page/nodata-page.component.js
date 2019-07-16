import tpl from './nodata-page.html';
import './nodata-page.less';

angular.module("app").component("nodataPage", {
    template: tpl,
    controller: nodataPageCtrl,
    bindings: {
        refresh: '&',
        nodataTitle: '@',
        content: '@'
    }
});

nodataPageCtrl.$inject = [];

function nodataPageCtrl() {

    const self = this;

    self.$onInit = function () {
        console.log('nodataPage');
    };

}

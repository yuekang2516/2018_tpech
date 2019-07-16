import tpl from './server-error-page.html';
import './server-error-page.less';

angular.module("app").component("serverErrorPage", {
    template: tpl,
    controller: serverErrorPageCtrl,
    bindings: {
        refresh: '&',
        hideRefresh: '<',
        msg: '@'
    }
});

serverErrorPageCtrl.$inject = [];

function serverErrorPageCtrl() {

    const self = this;

    self.$onInit = function () {
        console.log('serverErrorPage', self.refresh);
    };

}

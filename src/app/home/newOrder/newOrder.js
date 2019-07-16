import tpl from './newOrder.html';

angular.module('app').component('newOrder', {
  template: tpl,
  controller: newOrderCtrl
});

newOrderCtrl.$inject = ['$rootScope', 'NewOrderService'];

function newOrderCtrl($rootScope, NewOrderService) {
  const self = this;

  self.serviceData = null;

  self.$onInit = function onInit() {
    NewOrderService.get().then((q) => {
      self.serviceData = q.data;
    });
  };

  self.title = 'this is newOrder component page';

  self.goback = function goback() {
    $rootScope.$emit('stateGoBack');
  };

}

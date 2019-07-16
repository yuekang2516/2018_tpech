  /* global $*/
/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/5/11
 * 功能說明: 兩欄式 開始、時間
 * 版本: 0.1
 * 傳入參考： <date-time-picker-standard my-model="$ctrl.regform.StartTime" max="$ctrl.regform.EndTime" text="'開始'" required="true"/>
 * my-model : moment() 非必塡
 * max: moment() 非必塡
 * min: moment() 非必塡
 * text: string 非必塡
 * required: bool 如沒有請填 false
 *****************************************/
  import tp1 from './dateTimePickerStandard.html';

  angular.module('app').component('dateTimePickerStandard', {
    restrict: 'E',
    template: tp1,
    controller: MyDateTimePickerController,
    controllerAs: 'vm',
    bindToController: true, // bind 後才執行 Controller 避免 bind null
    bindings: {
        myModel: '=?', // 雙向
        required: '<', // 單向
        max: '=?',
        min: '=?',
        text: '=?',
        onChange: '&'
    }
  });

  function MyDateTimePickerController($timeout) {
    const vm = this;

    vm.$onInit = function $onInit() {
        // 如果傳來為 undefined 就給預設為 null 免得錯
        vm.myModel = vm.myModel || null;
        vm.max = vm.max || null;
        vm.min = vm.min || null;
        vm.text = vm.text || null;
    };

    vm.dateChange = function () {
      // 若不加上 $timeout 會導致 ng-change 裡的 model 仍是舊值
      // https://github.com/angular/angular.js/issues/4558
      $timeout(() => {
        vm.onChange();
      }, 0);
    };
    // vm.$onChanges = function $onChanges(changes) {
    //   if (changes.canChange) {
    //    this.performActionWithValueOf(changes.canChange);
    //   }
    // };

  }

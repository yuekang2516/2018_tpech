import tpl from './selectTimePicker.html';

angular.module('app').component('selectTimePicker', {
    restrict: 'E',
    template: tpl,
    controller: selectTimePickerController,
    bindings: {
        ngModel: '<',
        required: '@',
        onChange: '&',
        name: '@'
    }
});

selectTimePickerController.$inject = ['$timeout'];
function selectTimePickerController($timeout) {
    const self = this;

    self.$onInit = function () {
        self.hours = _.range(0, 24);
        self.minutes = _.range(0, 60);
    };

    self.$onChanges = function (changes) {
        console.log('onchages', changes);

        // 如果 ng-model 傳入後
        if (changes.ngModel && changes.ngModel.currentValue && moment(changes.ngModel.currentValue).diff(moment(changes.ngModel.previousValue)) !== 0) {
            self.selectedHour = moment(changes.ngModel.currentValue).hour();
            self.selectedMinute = moment(changes.ngModel.currentValue).minute();
            self.afterSelected();
        }
    };

    // self.$doCheck = function () {
    //     console.log('do check', self.ngModel);
    // };

    // self.$postLink = function () {
    //     console.log('postlink');
    // };

    self.afterSelected = function () {
        console.log('after selected');

        $timeout(() => {
            if (self.selectedHour && self.selectedMinute) {
                self.onChange({ time: moment({ hour: self.selectedHour, minute: self.selectedMinute }) }); // 回傳 time 新值到上層 component
            }
        });

    };

}

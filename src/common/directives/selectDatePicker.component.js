import tpl from './selectDatePicker.html';

angular.module('app').component('selectDatePicker', {
    restrict: 'E',
    template: tpl,
    controller: selectDatePickerController,
    bindings: {
        ngModel: '<',
        minDate: '<',
        maxDate: '<',
        required: '@',
        onChange: '&',
        name: '@'
    }
});

selectDatePickerController.$inject = ['$timeout'];
function selectDatePickerController($timeout) {
    const self = this;

    self.$onInit = function () {
        // todo 如果病人超過一百歲, 讀到病人後還要再加年份
        self.years = _.range(moment().year(), moment().year() - 100);
        self.months = [];
        self.days = [];

        // self.selectedYear = moment(self.ngModel).year();
        // self.selectedMonth = moment(self.ngModel).month();
        // self.afterSelected();
        // self.selectedDay = moment(self.ngModel).date();
    };


    self.$onChanges = function (changes) {
        console.log('onchages', changes);

        // 如果 ng-model 傳入後
        if (changes.ngModel && changes.ngModel.currentValue && moment(changes.ngModel.currentValue).diff(moment(changes.ngModel.previousValue)) !== 0) {
            self.selectedYear = moment(changes.ngModel.currentValue).year();
            self.selectedMonth = moment(changes.ngModel.currentValue).month() + 1; // zero based
            self.selectedDay = moment(changes.ngModel.currentValue).date();
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

        // 如果選了今年, 月份最多到本月
        $timeout(() => {
            if (self.selectedYear >= moment().year()) {
                self.months = _.range(1, moment().month() + 2); // ragne 最後一個數字不包含在內

                if (self.selectedMonth >= moment().month()) {
                    self.days = _.range(1, moment().date() + 1);
                } else {
                    self.days = _.range(1, moment([self.selectedYear, self.selectedMonth, 1]).add(-1, 'd').date() + 1);
                }
            } else {
                self.months = _.range(1, 13);

                if (self.selectedMonth) {
                    // 下個月減一天的天數
                    self.days = _.range(1, moment([self.selectedYear, self.selectedMonth, 1]).add(-1, 'd').date() + 1);
                }
            }

            if (moment([self.selectedYear, self.selectedMonth - 1, self.selectedDay]).isValid()) {
                self.onChange({ date: moment([self.selectedYear, self.selectedMonth - 1, self.selectedDay]) }); // 回傳 date 新值到上層 component
            }
        });
    };

}

var PrescribingRecord = function() {
    this.fab = element(by.css('[ng-click="vm.goto(\'medicineRecord\')"]'));

    //medicine record
    this.medicineRecordList = element.all(by.repeater('item in $ctrl.serviceData'));

    //prescribingDetail
    this.routeDropDown = element(by.model('$ctrl.serviceData.Route'));
    this.routeDropDownList = element.all(by.repeater('state in $ctrl.routeOptions'));
    this.frequencyDropDown = element(by.model('$ctrl.serviceData.Frequency'));
    this.frequencyDropDownList = element.all(by.repeater('state in $ctrl.frequencyOptions'));
    this.save = element(by.css('[ng-click="$ctrl.submit()"]'));
};
module.exports = PrescribingRecord;
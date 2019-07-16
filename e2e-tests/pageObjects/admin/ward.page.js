var Ward = function() {
    this.wardList = element.all(by.repeater('w in vm.wards'));
    this.fab = element(by.css('[ng-click="vm.gotoCreate()"]'));

    //ward create/edit page
    this.saveButton = element(by.css('[ng-click="vm.save(vm.Ward)"]'));
    this.wardName = element(by.model('vm.Ward.Name'));
};
module.exports = Ward;
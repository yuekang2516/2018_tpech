var Epo = function() {
    this.epoList = element.all(by.repeater('epo in vm.epos'));
    this.fab = element(by.css('[ng-click="vm.gotoCreate()"]'));

    //create epo
    this.name = element(by.model('vm.formData.Name'));
    this.quantity = element(by.model('vm.formData.Quantity'));
    this.saveButton = element(by.css('[ng-click="vm.save()"]'));

    this.setEpo = function(name, quantity) {
        this.name.sendKeys(name);
        this.quantity.sendKeys(quantity);
    };
};
module.exports = Epo;
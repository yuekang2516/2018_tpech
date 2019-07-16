var Charge = function() {
    this.chargeList = element.all(by.repeater('c in vm.charges'));
    this.wardSelect = element(by.model('vm.ward'));
    this.fab = element(by.css('[ng-click="vm.chargeCreate($event)"]'));
    this.chargeDialog = element(by.css('md-dialog'));

    //charge dialog
    this.name = element(by.model('dvm.formData.Name'));
    this.price = element(by.model('dvm.formData.Price'));
    this.unit = element(by.model('dvm.formData.Unit'));
    this.safteyStock = element(by.model('dvm.formData.SafetyStock'));
    this.sort = element(by.model('dvm.formData.Sort'));
    this.saveButton = element(by.css('[ng-click="dvm.save()"]'));

    this.setCharge = function(name, price, unit, safteyStock, sort) {
        this.name.sendKeys(name);
        this.price.sendKeys(price);
        this.unit.sendKeys(unit);
        this.safteyStock.sendKeys(safteyStock);
        this.sort.sendKeys(sort);
    };
};
module.exports = Charge;
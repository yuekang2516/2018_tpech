var Medicine = function() {
    this.medicineList = element.all(by.repeater('vm.go(med)'));
    this.fab = element(by.css('[ng-click="vm.gotoCreate()"]'));

    //create page
    this.medicineName = element(by.model('vm.formData.Name'));
    this.medicineCode = element(by.model('vm.formData.MedicineCode'));
    this.quantity = element(by.model('vm.formData.Quantity'));
    this.saveButton = element(by.css('[ng-click="vm.save()"]'));

    this.setMedicine = function(name, code, quantity) {
        this.medicineName.sendKeys(name);
        this.medicineCode.sendKeys(code);
        this.quantity.sendKeys(quantity);
    };
};
module.exports = Medicine;
var Patient = function () {
    this.name = element(by.model('vm.patient.Name'));
    this.id = element(by.model('vm.patient.IdentifierId'));
    this.dob = element(by.model('vm.patient.Birthday'));
    this.ward = element(by.model('vm.patient.WardId'));
    this.wardList = element.all(by.repeater('(k, v) in vm.wards'));
    this.medId = element(by.model('vm.patient.MedicalId'));
    this.submit = element(by.buttonText('儲存'));

    //tag dialog elements
    this.addTagButton = element(by.css('[ng-click="vm.tagDialog()"]'));
    this.tagName = element(by.model('tag.tagForm.TagName'));
    this.tagColors = element.all(by.repeater('color in tag.colorgroups'));
    this.createTagButton = element(by.css('[ng-click="tag.ok(tagForm)"]'));
    this.tags = element.all(by.repeater('tag in vm.patient.Tags track by $index'));
    this.tagDelete = element(by.css('[ng-click="$ctrl.delete()"]'));
    this.tagDeleteButton = element(by.css('[ng-click="vm.ok()"]'));

    this.setPatient = function(name, id, dob, medId) {
        
        this.name.sendKeys(name);
        this.id.sendKeys(id);
        browser.ignoreSynchronization = true;
        this.dob.sendKeys(dob);
        this.medId.sendKeys(medId);
        browser.driver.sleep(1000);
        //browser.waitForAngular();
        this.ward.click();
        browser.driver.sleep(1000);
        this.wardList.get(0).click();
        browser.ignoreSynchronization = false;
    };

    this.addTag = function(tagName) {
        this.addTagButton.click();
        this.tagName.sendKeys(tagName);
        this.tagColors.get(0).click();
        this.createTagButton.click();
    };

    this.deleteTag = function() {
        this.tagDelete.click();
        this.tagDeleteButton.click();
    }
    
};
module.exports = Patient;
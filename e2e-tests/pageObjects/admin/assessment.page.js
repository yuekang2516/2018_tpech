var Assessment = function() {
    this.assessmentList = element.all(by.repeater('a in vm.assessments.Items'));
    this.fab = element(by.css('[ng-click="vm.gotoCreate()"]'));

    //create assessment
    this.itemName = element(by.model('vm.Assessment.Item'));
    this.saveButton = element(by.css('[ng-click="vm.save(vm.Assessment)"]'));

    this.setAssessment = function(itemName) {
        this.itemName.sendKeys(itemName);
    };
};
module.exports = Assessment;
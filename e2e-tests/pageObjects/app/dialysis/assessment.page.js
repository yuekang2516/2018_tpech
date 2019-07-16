var Assessment = function() {
    this.assessmentList = element.all(by.repeater('item in $ctrl.serviceData'));
    this.assessmentFab = element(by.css('[ng-click="$ctrl.goto()"]'));

    //assessment detail page
    this.questions = element.all(by.repeater('item in $ctrl.questions'));
    // this.options = element(by.repeater('(k, v) in item.Options').row(0));
    this.saveButton = element(by.css('[ng-click="$ctrl.submit()"]'));
    this.question = element.all(by.repeater('item in $ctrl.questions')).get(0).all(by.model('$ctrl.checkedItems[item.Item][v]')).get(0);

};
module.exports = Assessment;
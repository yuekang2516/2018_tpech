var NursingRecord = function() {
    this.fab = element(by.css('[ng-click="$ctrl.goto()"]'));
    this.nursingRecordList = element.all(by.repeater('item in $ctrl.serviceData'));

    //nursingRecord detail
    this.textArea = element(by.model('$ctrl.regForm.Content'));
    this.phraseButton = element(by.css('[ng-click="$ctrl.isOpenRight()"]'));
    this.save = element(by.css('[ng-click="$ctrl.submit($event)"]'));
};
module.exports = NursingRecord;
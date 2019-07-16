var VesselAssessmentProblemsList = function() {
    this.problemList = element.all(by.repeater('item in $ctrl.serviceData'));
    this.fab = element(by.css('[ng-click="$ctrl.goto()"]'));
};
module.exports = VesselAssessmentProblemsList;
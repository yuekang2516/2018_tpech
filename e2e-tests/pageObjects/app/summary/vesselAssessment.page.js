var VesselAssessment = function() {
    this.vesselAssessmentList = element(by.repeater('item in $ctrl.serviceData'));
    this.fab = element(by.css('[ng-click="$ctrl.goto()"]'));
};
module.exports = VesselAssessment;
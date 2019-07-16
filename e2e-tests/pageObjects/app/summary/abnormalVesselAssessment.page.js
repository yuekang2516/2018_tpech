var AbnormalVesselAssessment = function() {
    this.abnormalVesselList = element.all(by.repeater('item in $ctrl.serviceData'));
    this.fab = element(by.css('$ctrl.goto()'));
};
module.exports = AbnormalVesselAssessment;
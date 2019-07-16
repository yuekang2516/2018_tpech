var VesselAssessmentTab = function () {
    this.tabs = element.all(by.repeater('tab in $mdTabsCtrl.tabs'));
};
module.exports = VesselAssessmentTab;
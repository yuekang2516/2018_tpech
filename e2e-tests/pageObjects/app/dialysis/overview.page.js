var Overview = function() {
    this.tabs = element.all(by.repeater('tab in $mdTabsCtrl.tabs'));
    this.location = element(by.model('$ctrl.dialysisHeader.Location'));
};
module.exports = Overview;
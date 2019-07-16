var DialysisTab = function() {
    this.tabs = element.all(by.repeater('tab in $mdTabsCtrl.tabs'));

    this.getTab = function(tabIndex) {
        this.tabs.get(tabIndex).click();
        //console.log(this.tabs);
    };

};
module.exports = DialysisTab;
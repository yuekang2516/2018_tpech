var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');

describe('charge page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(8).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to charge page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/charge');
        browser.waitForAngularEnabled(true);
    });
});
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');

describe('executionRecord page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(3).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to executionRecord page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/executionRecord');
        browser.waitForAngularEnabled(true);
    });
});
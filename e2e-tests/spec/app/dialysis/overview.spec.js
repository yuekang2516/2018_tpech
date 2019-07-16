var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var Overview = require(protractor.appPageObjectPath + '/dialysis/overview.page.js');
describe('overview page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var overview = new Overview();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        
    });

    xit('should navigate to overview', () => {
        browser.ignoreSynchronization = true;
        expect(browser.getCurrentUrl()).toContain('/overview');
        browser.ignoreSynchronization = false;
    });

    // it('should fill location', () => {
    //     browser.ignoreSynchronization = true;
    //     browser.sleep(5000);
    //     // overview.location.clear();
    //     //overview.location.sendKeys('adsfasdfasdfsadf');
    //     dialysisTab.getTab(1);
    //     browser.ignoreSynchronization = true;
    // })
});
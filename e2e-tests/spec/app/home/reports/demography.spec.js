var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Reports = require(protractor.appPageObjectPath + '/home/reports/reports.page.js');

describe('demography page', () => {
    var allPatients = new AllPatients();
    var reports = new Reports;

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
        reports.reportMenu.get(4).click();
    });

    it('should navigate to demography page', () => {
        expect(browser.getCurrentUrl()).toContain('/demography');
    });
});
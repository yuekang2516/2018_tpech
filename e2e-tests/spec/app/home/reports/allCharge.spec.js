var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Reports = require(protractor.appPageObjectPath + '/home/reports/reports.page.js');

describe('allCharge page', () => {
    var allPatients = new AllPatients();
    var reports = new Reports;

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
        reports.reportMenu.get(2).click();
    });

    it('should navigate to allCharge page', () => {
        expect(browser.getCurrentUrl()).toContain('/allCharge');
    });
});
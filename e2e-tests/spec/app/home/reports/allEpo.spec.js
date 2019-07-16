var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Reports = require(protractor.appPageObjectPath + '/home/reports/reports.page.js');

describe('allEpo page', () => {
    var allPatients = new AllPatients();
    var reports = new Reports;

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
        reports.reportMenu.get(3).click();
    });

    it('should navigate to allEpo page', () => {
        expect(browser.getCurrentUrl()).toContain('/allEpo');
    });
});
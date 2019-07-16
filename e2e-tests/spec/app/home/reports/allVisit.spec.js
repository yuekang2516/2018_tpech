var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Reports = require(protractor.appPageObjectPath + '/home/reports/reports.page.js');

describe('allVisit page', () => {
    var allPatients = new AllPatients();
    var reports = new Reports;

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
        reports.reportMenu.get(1).click();
    });

    it('should navigate to allVisit page', () => {
        expect(browser.getCurrentUrl()).toContain('/allVisit');
    });
});
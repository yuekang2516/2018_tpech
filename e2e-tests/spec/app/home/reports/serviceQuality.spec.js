// var ServiceQuality = require('../../../../pageObjects/app/home/reports/serviceQuality.page.js');
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js'); 
var Reports = require(protractor.appPageObjectPath + '/home/reports/reports.page.js');

describe('serviceQuality page', () => {

    var allPatients = new AllPatients();
    var reports = new Reports;

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
        reports.reportMenu.get(0).click();
    });

    it('should navigate to serviceQuality page', () => {
        expect(browser.getCurrentUrl()).toContain('/serviceQuality');
    });
});
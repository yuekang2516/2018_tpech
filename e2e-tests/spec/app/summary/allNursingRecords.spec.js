var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');

describe('allNursingRecords page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();    

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        summary.sidenavButton.click();
        summary.sideMenu.get(3).click();
    });

    it('should navigate to allNursingRecords page', () => {
        expect(browser.getCurrentUrl()).toContain('/allNursingRecords');
    });
});
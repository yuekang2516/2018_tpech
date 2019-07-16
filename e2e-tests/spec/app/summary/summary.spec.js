var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');

describe('summary page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
    });

    it('should navigate to summary page', () => {
        expect(browser.getCurrentUrl()).toContain('summary');
    });
});
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var AllDialysisRecords = require(protractor.appPageObjectPath + '/summary/allDialysisRecords.page.js');

describe('allPatients page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();
    var allDialysisRecords = new AllDialysisRecords();

    beforeAll(() => {
        allPatients.get();
    });

    it('should navigate to patients page', () => {
        expect(browser.getCurrentUrl()).toContain('#/allPatients');
    });

    it('should have at least 1 protractor patient', () => {
        allPatients.searchPatient('protractor'+dateTime);
        browser.sleep(2000)
        expect(allPatients.getNumberOfPatients()).toBeGreaterThan(0);
    });

    describe('create new dialysis record', () => {

        it('create new dialysis record link should be visible if empty', () => {
            allPatients.patients.get(0).click();
            expect(summary.createNewDialysis.isDisplayed()).toBe(true);
        });

        it('should create new dialysis record', () => {       
            summary.createNewDialysis.click();
            browser.sleep(1000);
            expect(browser.getCurrentUrl()).toContain('/allDialysisRecords');
            allDialysisRecords.fab.click();
            browser.sleep(1000);
            allDialysisRecords.createButton.click();
            browser.waitForAngularEnabled(false);
            browser.sleep(3000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.createRecordSuccess);
            browser.waitForAngularEnabled(true);
        });
    });
});
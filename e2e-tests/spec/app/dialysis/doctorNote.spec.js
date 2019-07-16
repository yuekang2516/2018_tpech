var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var DoctorNote = require(protractor.appPageObjectPath + '/dialysis/doctorNote.page.js');

describe('doctorNote page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var doctorNote = new DoctorNote();

    beforeAll(() => {
        allPatients.get();
        allPatients.searchPatient('protractor');
        browser.sleep(2000);
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(6).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to doctorNote page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/doctorNote');
        browser.waitForAngularEnabled(true);
    });

    it('save button should be disabled', () => {
        browser.waitForAngularEnabled(false);
        expect(doctorNote.save.isEnabled()).toBe(false);
        browser.waitForAngularEnabled(true);
    });

    it('should add a doctorNote', () => {
        browser.waitForAngularEnabled(false);
        doctorNote.textArea.sendKeys('protractor test is fun!!!');
        doctorNote.save.click();
        browser.sleep(3000);
        expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
        browser.waitForAngularEnabled(true);
    });
});
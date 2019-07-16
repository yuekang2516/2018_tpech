var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var PrescribingRecord = require(protractor.appPageObjectPath + '/dialysis/prescribingRecord.page.js');

describe('prescribingRecord page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var prescribingRecord = new PrescribingRecord();

    beforeAll(() => {
        allPatients.get();
        allPatients.searchPatient('protractor');
        browser.sleep(2000);
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(5).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to prescribingRecord page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/prescribingRecord');
        browser.waitForAngularEnabled(true);
    });

    describe('create prescribingRecord page', () => {
        beforeAll(() => {
            browser.waitForAngularEnabled(false);
            prescribingRecord.fab.click();
            browser.waitForAngularEnabled(true);
        });

        it('should navigate to medicineRecord page', () => {
            expect(browser.getCurrentUrl()).toContain('/medicineRecord');
        });

        it('should contain at least 1 medicineRecord', () => {
            expect(prescribingRecord.medicineRecordList.count()).toBeGreaterThan(0);
        });

        it('should navigate to create prescribingDetail page', () => {
            prescribingRecord.medicineRecordList.get(0).click();
            expect(browser.getCurrentUrl()).toContain('/create');
        });

        it('save button should be disabled', () => {
            expect(prescribingRecord.save.isEnabled()).toBe(false);
        });

        it('should add a prescribingRecord', () => {
            browser.waitForAngularEnabled(false);
            prescribingRecord.routeDropDown.click();
            browser.sleep(1000);
            prescribingRecord.routeDropDownList.get(0).click();
            browser.sleep(1000);
            prescribingRecord.frequencyDropDown.click();
            browser.sleep(1000);
            prescribingRecord.frequencyDropDownList.get(0).click();
            browser.sleep(1000);
            prescribingRecord.save.click();
            browser.sleep(3000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
            browser.waitForAngularEnabled(true);
        });

    });
});
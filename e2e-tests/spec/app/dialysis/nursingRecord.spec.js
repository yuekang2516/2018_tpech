var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var NursingRecord = require(protractor.appPageObjectPath + '/dialysis/nursingRecord.page.js');

describe('nursingRecord page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var nursingRecord = new NursingRecord();

    beforeAll(() => {
        allPatients.get();
        allPatients.searchPatient('protractor');
        browser.sleep(2000);
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(4).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to nursingRecord page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/nursingRecord');
        browser.waitForAngularEnabled(true);
    });

    describe('create nursingRecord detail page', () => {

        beforeAll(() => {
            browser.waitForAngularEnabled(false);
            nursingRecord.fab.click();
            browser.waitForAngularEnabled(true);
        });

        it('should navigate to nursingRecord/ page', () => {
            expect(browser.getCurrentUrl()).toContain('/nursingRecord/');
        });

        it('save button should be disabled', () => {
            expect(nursingRecord.save.isEnabled()).toBe(false);
        })

        it('should add a nursingRecord', () => {
            browser.waitForAngularEnabled(false);
            nursingRecord.textArea.sendKeys('protractor test is fun!!!');
            browser.sleep(1000);
            nursingRecord.save.click();
            browser.sleep(3000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
            browser.waitForAngularEnabled(true);
        });

    });

    it('should contain at least 1 nursingRecord', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(nursingRecord.nursingRecordList.count()).toBeGreaterThan(0);
        browser.waitForAngularEnabled(true);
    });

});
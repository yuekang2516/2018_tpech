var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var MachineData = require(protractor.appPageObjectPath + '/dialysis/machineData.page.js');

describe('machineData page', () => {
    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var machineData = new MachineData();

    beforeAll(() => {
        allPatients.get();
        allPatients.searchPatient('protractor');
        browser.sleep(2000);
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(2).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to machineData page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/machineData');
        browser.waitForAngularEnabled(true);
    });

    describe('create machineDataDetail page', () => {

        beforeAll(() => {
            browser.waitForAngularEnabled(false);
            machineData.fab.click();
            browser.waitForAngularEnabled(true);
        });

        it('should navigate to machineDataDetail page', () => {
            expect(browser.getCurrentUrl()).toContain('/machineDataDetail/create');
        });

        it('should add one machineData', () => {
            machineData.save.click();
            browser.waitForAngularEnabled(false);
            browser.sleep(4000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
            browser.waitForAngularEnabled(true);
        });
    });

    it('should contain at least 1 machineData', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(machineData.machineDataList.count()).toBeGreaterThan(0);
        browser.waitForAngularEnabled(true);
    });
});
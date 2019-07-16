var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var DialysisTab = require(protractor.appPageObjectPath + '/dialysisTab.page.js');
var Assessment = require(protractor.appPageObjectPath + '/dialysis/assessment.page.js');
// var Overview = require(protractor.appPageObjectPath + '/dialysis/overview.page.js');

describe('assessment list page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();
    var dialysisTab = new DialysisTab();
    var assessment = new Assessment();
    // var overview = new Overview();

    beforeAll(() => {
        allPatients.get();
        allPatients.searchPatient('protractor');
        browser.sleep(2000);
        allPatients.patients.get(0).click();
        summary.overviewButton.get(0).click();
        browser.waitForAngularEnabled(false);
        dialysisTab.tabs.get(1).click();
        browser.waitForAngularEnabled(true);
    });

    it('should go to assessment page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/assessment');
        browser.waitForAngularEnabled(true);
    });

    describe('create assessment detail page', () => {

        beforeAll(() => {
            browser.waitForAngularEnabled(false);
            assessment.assessmentFab.click();
            browser.waitForAngularEnabled(true);
        });

        it('should go to add assessment page', () => {
            expect(browser.getCurrentUrl()).toContain('/assessment/');
        });

        it('should have at least 1 question and save button is disabled', () => {
            expect(assessment.saveButton.isEnabled()).toBe(false);
            expect(assessment.questions.count()).toBeGreaterThan(0);
        });

        it('should add an assessment', () => {
            assessment.question.click();
            expect(assessment.saveButton.isEnabled()).toBe(true);
            browser.sleep(1000);
            assessment.saveButton.click();
            browser.waitForAngularEnabled(false);
            browser.sleep(3000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
            browser.waitForAngularEnabled(true);
        });
    });

    it('should contain at least 1 assessment', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(assessment.assessmentList.count()).toBeGreaterThan(0);
        browser.waitForAngularEnabled(true);
    });

});
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var VesselAssessmentTab = require(protractor.appPageObjectPath + '/vesselAssessmentTab.page.js');
var VesselAssessmentProblemsList = require(protractor.appPageObjectPath + '/summary/vesselAssessmentProblemsList.page.js');

describe('vesselAssessmentProblemsList page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();
    var vesselAssessmentTab = new VesselAssessmentTab();
    var vesselAssessmentProblemsList = new VesselAssessmentProblemsList();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        summary.sidenavButton.click();
        browser.waitForAngularEnabled(false);
        summary.sideMenu.get(1).click();
        browser.sleep(1000);
        vesselAssessmentTab.tabs.get(1).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to vesselAssessmentProblemsList page', () => {
        browser.waitForAngularEnabled(false);
        expect(browser.getCurrentUrl()).toContain('/vesselAssessmentProblemsList');
        browser.waitForAngularEnabled(true);
    });

    it('should contain at least 1 vesselAssessmentProblemsList', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(vesselAssessmentProblemsList.problemList.count()).toBeGreaterThan(0);
        browser.waitForAngularEnabled(true);
    });

    xdescribe('create vesselAssessmentProblemsList', () => {
        // beforeAll(() => {
        //     // browser.waitForAngularEnabled(false);
        //     // browser.sleep(3000);
        //     vesselAssessmentProblemsList.fab.click();
        //     // browser.sleep(3000);
        //     // browser.waitForAngularEnabled(true);
        // });

        it('should navigate to vesselAssessmentProblemsDetail', () => {
            browser.waitForAngularEnabled(false);
            vesselAssessmentProblemsList.fab.click();
            expect(browser.getCurrentUrl()).toContain('/vesselAssessmentProblemsDetail');
            browser.waitForAngularEnabled(true);
        });
    });
});
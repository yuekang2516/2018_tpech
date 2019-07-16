var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var VesselAssessment = require(protractor.appPageObjectPath + '/summary/vesselAssessment.page.js');

describe('vesselAssessment page', () => {

    var allPatients = new AllPatients();
    var summary = new Summary();
    var vesselAssessment = new VesselAssessment();

    beforeEach(() => {
        allPatients.get();
        allPatients.patients.get(0).click();
        browser.waitForAngularEnabled(false);
        summary.sidenavButton.click(); 
        summary.sideMenu.get(1).click();
        browser.waitForAngularEnabled(true);
    });

    it('should navigate to vesselAssessment page', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toContain('/vesselAssessment');
        browser.waitForAngularEnabled(true);
    });

    // it('should adfsafsadf', () => {
    //     browser.waitForAngularEnabled(false);
    //     browser.sleep(1000);
    //     vesselAssessment.fab.click();
    //     //expect(vesselAssessmentProblemsList.problemList.count()).toBeGreaterThan(0);
    //     browser.sleep(3000);
    //     browser.waitForAngularEnabled(true);
    // });

});
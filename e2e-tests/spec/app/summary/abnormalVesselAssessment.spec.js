var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');
var Summary = require(protractor.appPageObjectPath + '/summary/summary.page.js');
var VesselAssessmentTab = require(protractor.appPageObjectPath + '/vesselAssessmentTab.page.js');
var AbnormalVesselAssessment = require(protractor.appPageObjectPath + '/summary/abnormalVesselAssessment.page.js');

describe('abnormalVesselAssessment page', () => {
    
        var allPatients = new AllPatients();
        var summary = new Summary();
        var vesselAssessmentTab = new VesselAssessmentTab();
        var abnormalVesselAssessment = new AbnormalVesselAssessment();
    
        beforeEach(() => {
            allPatients.get();
            allPatients.patients.get(0).click();
            summary.sidenavButton.click();
            browser.waitForAngularEnabled(false);
            summary.sideMenu.get(1).click();
            browser.sleep(1000);
            vesselAssessmentTab.tabs.get(2).click();
            browser.waitForAngularEnabled(true);
        });
    
        it('should navigate to abnormalVesselAssessment page', () => {
            browser.waitForAngularEnabled(false);
            expect(browser.getCurrentUrl()).toContain('/abnormalVesselAssessment');
            browser.waitForAngularEnabled(true);
        });
    
    
        describe('create vesselAssessmentProblemsList', () => {
    
            it('should navigate to vesselAssessmentProblemsDetail', () => {
                
            });
        });
    });
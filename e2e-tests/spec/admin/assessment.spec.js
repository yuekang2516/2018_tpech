var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Assessment = require(protractor.adminPageObjectPath + '/assessment.page.js');

describe('assessment page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var assessment = new Assessment();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(12).click();
    });

    it('should navigate to assessment page', () => {
        expect(browser.getCurrentUrl()).toContain('/assessment');
    });

    it('should contain at least 1 assessment', () => {
        expect(assessment.assessmentList.count()).toBeGreaterThan(0);
    });

    describe('create assessment', () => {
        beforeAll(() => {
            assessment.fab.click();
        });

        it('should navigate to create assessment', () => {
            expect(browser.getCurrentUrl()).toContain('/create');
        });

        it('save button should be disabled', () => {
            expect(assessment.saveButton.isEnabled()).toBe(false);
        });

        it('save button should be enabled', () => {
            assessment.setAssessment('test123');
            expect(assessment.saveButton.isEnabled()).toBe(true);
        });
    });
});
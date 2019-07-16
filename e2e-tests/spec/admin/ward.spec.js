var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Ward = require(protractor.adminPageObjectPath + '/ward.page.js');

describe('ward page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var ward = new Ward();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(3).click();
    });

    it('should navigate to ward page', () => {
        expect(browser.getCurrentUrl()).toContain('/ward');
    });

    it('should contain at least 1 ward', () => {
        expect(ward.wardList.count()).toBeGreaterThan(0);
    });

    describe('create ward', () => {
        beforeAll(() => {
            ward.fab.click();
        });

        it('save button should be disabled', () => {
            expect(ward.saveButton.isEnabled()).toBe(false);
        });

        it('save button should be enabled if required are filled', () => {
            ward.wardName.sendKeys('test ward');
            expect(ward.saveButton.isEnabled()).toBe(true);
        });

    });
});
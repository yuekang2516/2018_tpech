var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Medicine = require(protractor.adminPageObjectPath + '/medicine.page.js');

describe('medicine page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var medicine = new Medicine();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(5).click();
    });

    it('should navigate to medicine page', () => {
        expect(browser.getCurrentUrl()).toContain('/medicine');
    });

    describe('create medicine', () => {
        beforeAll(() => {
            medicine.fab.click();
        });

        it('should navigate to medicine create page', () => {
            expect(browser.getCurrentUrl()).toContain('/create');
        });

        it('save button should be disabled', () => {
            expect(medicine.saveButton.isEnabled()).toBe(false);
        });

        it('save button should be enabled', () => {
            medicine.setMedicine('test', 'test123', 123);
            expect(medicine.saveButton.isEnabled()).toBe(true);
        });

    });
});
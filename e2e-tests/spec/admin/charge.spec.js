var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Charge = require(protractor.adminPageObjectPath + '/charge.page.js');

describe('charge page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var charge = new Charge();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(4).click();
    });

    it('should navigate to charge page', () => {
        expect(browser.getCurrentUrl()).toContain('/charge');
    });

    xit('select ward', () => {
        charge.wardSelect.click();
        browser.sleep(2000);
    });

    describe('create charge', () => {
        beforeAll(() => {
            charge.fab.click();
        });

        it('should open to create charge dialog', () => {
            expect(charge.chargeDialog.isDisplayed()).toBe(true);
        });

        it('save button should be disabled', () => {
            expect(charge.saveButton.isEnabled()).toBe(false);
        });

        it('save button should be enabled', () => {
            charge.setCharge('test', 111, 'test', 111, 111);
            expect(charge.saveButton.isEnabled()).toBe(true);
        });
    });
});
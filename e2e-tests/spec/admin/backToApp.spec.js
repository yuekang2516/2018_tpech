var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('back to allPatients page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(16).click();
    });

    it('should navigate to allPatients page', () => {
        expect(browser.getCurrentUrl()).toContain('/allPatients');
    });
});
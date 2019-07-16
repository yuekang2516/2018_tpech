var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('medicationExport page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(9).click();
    });

    it('should navigate to medicationExport page', () => {
        expect(browser.getCurrentUrl()).toContain('/medicationExport');
    });
});
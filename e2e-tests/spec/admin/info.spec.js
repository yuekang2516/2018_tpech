var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('info page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(11).click();
    });

    it('should navigate to info page', () => {
        expect(browser.getCurrentUrl()).toContain('/info');
    });
});
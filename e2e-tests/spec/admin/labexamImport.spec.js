var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('labexamImport page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(13).click();
    });

    it('should navigate to labexamImport page', () => {
        expect(browser.getCurrentUrl()).toContain('/labexamImport');
    });
});
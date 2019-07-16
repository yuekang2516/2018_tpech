var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('statistic page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(15).click();
    });

    it('should navigate to statistic page', () => {
        expect(browser.getCurrentUrl()).toContain('/statistic');
    });
});
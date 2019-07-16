var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Log = require(protractor.adminPageObjectPath + '/log.page.js');

describe('log page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var log = new Log();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(10).click();
    });

    it('should navigate to log page', () => {
        expect(browser.getCurrentUrl()).toContain('/log');
    });

    it('should contain at least 1 log', () => {
        expect(log.logList.count()).toBeGreaterThan(0);
    });
});
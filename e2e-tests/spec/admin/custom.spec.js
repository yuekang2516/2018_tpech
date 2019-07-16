var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Custom = require(protractor.adminPageObjectPath + '/custom.page.js');

describe('custom page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var custom = new Custom();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(7).click();
    });

    it('should navigate to custom page', () => {
        expect(browser.getCurrentUrl()).toContain('/custom');
    });

    it('should contain at least 1 custom item', () => {
        expect(custom.customList.count()).toBeGreaterThan(0);
    });
});
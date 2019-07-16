var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Phrase = require(protractor.adminPageObjectPath + '/phrase.page.js');

describe('phrase page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var phrase = new Phrase();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(2).click();
    });

    it('should navigate to phrase page', () => {
        expect(browser.getCurrentUrl()).toContain('/phrase');
    });

    it('should contain at least 1 phrase', () => {
        expect(phrase.phraseList.count()).toBeGreaterThan(0);
    });
});
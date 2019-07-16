var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var Epo = require(protractor.adminPageObjectPath + '/epo.page.js');

describe('epo page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var epo = new Epo();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(6).click();
    });

    it('should navigate to epo page', () => {
        expect(browser.getCurrentUrl()).toContain('/epo');
    });

    it('should contain at least 1 epo', () => {
        expect(epo.epoList.count()).toBeGreaterThan(0);
    });

    describe('epo create', () => {
        beforeAll(() => {
            epo.fab.click();
        });

        it('should navigate to create epo page', () => {
            expect(browser.getCurrentUrl()).toContain('/create');
        });

        it('save button should be disabled', () => {
            expect(epo.saveButton.isEnabled()).toBe(false);
        });

        it('save button should be enabled', () => {
            epo.setEpo('test123', 123);
            expect(epo.saveButton.isEnabled()).toBe(true);
        });
    });
});
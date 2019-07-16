var AdminSideNav = require(protractor.adminPageObjectPath + '/adminSideNav.page.js');
var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');
var User = require(protractor.adminPageObjectPath + '/user.page.js');

describe('user page', () => {
    var adminSideNav = new AdminSideNav();
    var basicSetting = new BasicSetting();
    var user = new User();

    beforeAll(() => {
        basicSetting.get();
        adminSideNav.sideMenu.get(1).click();
    });

    it('should navigate to user page', () => {
        expect(browser.getCurrentUrl()).toContain('/user');
    });

    it('should contain at least 1 user', () => {
        expect(user.userList.count()).toBeGreaterThan(0);
    });

    describe('create user', () => {

        beforeAll(() => {
            user.fab.click();
        });

        it('save button should be disabled', () => {
            expect(user.saveButton.isEnabled()).toBe(false);
        });

        it('should navigate to user create page', () => {
            expect(browser.getCurrentUrl()).toContain('/create');
        });
    });
});
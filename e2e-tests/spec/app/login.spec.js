var LoginPage = require(protractor.appPageObjectPath + '/login.page.js');
describe('login page', function () {
    
    var login = new LoginPage();

    beforeAll(() => {
        
        login.get();
        
    })

    it('it should navigate to login page', function () {
        expect(browser.getCurrentUrl()).toContain('#/login');
        expect(login.loginButton.isEnabled()).toBe(false);
    });

    //test for non existing user
    xit('test for non existing user', function () {
        browser.ignoreSynchronization = true;
        login.login('admin123', '1234');
        expect(login.loginButton.isEnabled()).toBe(true);
        browser.sleep(1000);
        expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.cantFindUser);
        browser.ignoreSynchronization = false;
    });

    //login successful
    it('test for login successful and redirect to home page (allPatients)', function () {
        login.username.clear();
        login.password.clear();
        login.login('admin', '1234');
        expect(browser.getCurrentUrl()).toContain('#/allPatients');
        
    });

});
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('notification page', () => {

    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(3).click();
        // browser.get('/notifications');
    });

    it('should navigate to notification page', () => {
        expect(browser.getCurrentUrl()).toContain('/notifications');
    });
});
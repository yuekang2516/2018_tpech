var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('beds page', () => {

    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(2).click();
        // browser.get('/beds');
    });

    it('should navigate to beds page', () => {
        expect(browser.getCurrentUrl()).toContain('/beds');
    });
});
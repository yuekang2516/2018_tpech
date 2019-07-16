var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('shifts page', () => {
    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(5).click();
        // browser.get('/shifts');
    });

    it('should navigate to shifts page', () => {
        expect(browser.getCurrentUrl()).toContain('/shifts');
    });
});
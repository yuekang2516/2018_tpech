var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('bed page', () => {
    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(4).click();
        //browser.get('/bed');
    });

    it('should navigate to bed page', () => {
        expect(browser.getCurrentUrl()).toContain('/bed');
    });
});
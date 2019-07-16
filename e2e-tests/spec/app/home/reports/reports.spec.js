var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('reports page', () => {

    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(6).click();
    });

    it('should navigate to reports page', () => {
        expect(browser.getCurrentUrl()).toContain('reports');
    });
});
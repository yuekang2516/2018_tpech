var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('myPatients page', () => {

    var allPatients = new AllPatients();

    beforeEach(() => {
        allPatients.get();
        allPatients.leftSideMenu.get(1).click();
        // browser.get('/myPatients');
    });

    it('should navigate to myPatients page', () => {
        expect(browser.getCurrentUrl()).toContain('/myPatients');
    });

});
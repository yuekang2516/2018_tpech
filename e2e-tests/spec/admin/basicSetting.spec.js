var BasicSetting = require(protractor.adminPageObjectPath + '/basicSetting.page.js');

describe('basicSetting page', () => {

    var basicSetting = new BasicSetting();

    beforeAll(() => {
        basicSetting.get();
    });

    it('should navigate to basicSetting page', () => {
        expect(browser.getCurrentUrl()).toContain('/basicSetting');
    });
});
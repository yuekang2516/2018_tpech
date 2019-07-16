/* global element */
/* global browser */
/* global by */
/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('dialysis system v2 app', function () {

    it('should automatically redirect to #login', function () {
        browser.get('/');
        // browser.explore();
        // browser.pause();

        expect(browser.getCurrentUrl()).toContain('#/login');
    });

    describe('login', function () {

        // beforeEach(function() {
        //   browser.get('/');
        // });

        it('login failed', function () {
            element(by.model('vm.formData.account')).sendKeys('admin123');
            element(by.model('vm.formData.password')).sendKeys('1234');
            element(by.buttonText('登入')).click();
            // browser.waitForAngular();

            browser.ignoreSynchronization = true;
            browser.sleep(1000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain('無此使用者');
            browser.ignoreSynchronization = false;
        });

        it('should redirect to allpatient page', function () {
            element(by.model('vm.formData.account')).clear();
            element(by.model('vm.formData.account')).sendKeys('admin');
            element(by.model('vm.formData.password')).clear();
            element(by.model('vm.formData.password')).sendKeys('1234');
            element(by.buttonText('登入')).click();
            browser.waitForAngular();
            expect(browser.getCurrentUrl()).toContain('#/allPatients');
        });

    });


    describe('all patients page', function () {

        beforeAll(function () {
            browser.get('/');
        });


        it('should exist patients', function () {
            var length = element.all(by.tagName('md-list-item')).count();
            expect(length).toBeGreaterThan(1);
        });

        it('should goto add patient page', () => {
            element(by.css('.md-fab')).click();
            expect(browser.getCurrentUrl()).toContain('#/patient');
        });

        it('should add a patient', () => {
            element(by.buttonText('儲存')).click();
            browser.ignoreSynchronization = true;
            browser.sleep(1000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain('尚有欄位未填寫');
            browser.ignoreSynchronization = false;
        });
    });

    describe('first patient dialysis record', () => {
        beforeAll(function () {
            browser.get('/');
        });

        it('create a dialysis record', () => {
            element(by.repeater('item in vm.currentPatients').row(0)).click();
            element(by.id('right-menu')).click();
            element(by.cssContainingText('.md-button', '歷次透析紀錄')).click();
            expect(browser.getCurrentUrl()).toContain('allDialysisRecords');

            // press add button
            element(by.css('.md-fab')).click();
            browser.ignoreSynchronization = true;
            browser.sleep(3000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain('開表成功');
            browser.ignoreSynchronization = false;
        });

        it('should save OK', () => {
            element(by.buttonText('儲存')).click();
            browser.ignoreSynchronization = true;
            browser.sleep(1000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain('修改成功');
            browser.ignoreSynchronization = false;
        });

        it('should goto machine data page', () => {
            element(by.cssContainingText('.md-tab', '透析機')).click();
            element(by.css('.md-fab')).click();
            element(by.buttonText('儲存')).click();
            var count = element.all(by.repeater('item in machineData.serviceData')).count();
            expect(count).toBeGreaterThan(0);
        });

        // todo 中間好幾個 tab 還沒做

        it('should delete OK', () => {
            // 先回上一頁
            element(by.id('back-button')).click();
            element(by.css('.md-secondary')).click();
            element(by.css('.md-warn')).click();
            browser.ignoreSynchronization = true;
            browser.sleep(1000);
            expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain('刪除成功');
            browser.ignoreSynchronization = false;
        });
    });
});

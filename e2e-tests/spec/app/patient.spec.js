var Patient = require(protractor.appPageObjectPath + '/patient.page.js');
var AllPatients = require(protractor.appPageObjectPath + '/allPatients.page.js');

describe('patient page', () => {
    patient = new Patient();
    allPatients = new AllPatients();

    beforeAll(() => {
        allPatients.get();
        browser.ignoreSynchronization = true;
        allPatients.fab.click();
        browser.ignoreSynchronization = false;
    });

    it('should enable the save button if all required field are filled and disable if not', () => {
        expect(patient.submit.isEnabled()).toBe(false);
        patient.setPatient('protractor'+dateTime, 'a0'+dateTime, '01-01-2000', dateTime);
        browser.ignoreSynchronization = true;
        browser.sleep(1000);
        expect(patient.submit.isEnabled()).toBe(true);
        browser.ignoreSynchronization = false;
    });

    it('should delete a tag', () => {
        browser.sleep(1000);
        patient.addTag('test Tag');
        patient.deleteTag();
        expect(patient.tags.count()).toBe(0);
    });

    it('should add a tag', () => {
        patient.addTag('test Tag');
        expect(patient.tags.count()).toBeGreaterThan(0);
    });

    it('should add a patient with a tag', () => {
        patient.submit.click();
        browser.sleep(1000);
        expect(element(by.tagName('md-toast')).element(by.tagName('span')).getText()).toContain(toastMessage.saveSuccess);
    });
});
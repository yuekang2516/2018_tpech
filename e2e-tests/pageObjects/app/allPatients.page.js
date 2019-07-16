var AllPatients = function () {
    this.fab = element(by.css('[ng-click="vm.goToPatientListAdd()"]'));
    this.refreshButton = element(by.css('[ng-click="$ctrl.refresh()"]'));
    this.patients = element.all(by.repeater('item in vm.currentPatients')); //patient list
    this.searchButton = element(by.css('[ng-click="vm.clickSearch()"]'));
    this.searchBar = element(by.model('vm.search'));
    //side nav
    this.leftSideNavButton = element(by.css('[ng-click="vm.openLeftMenu()"]'));
    this.leftSideMenu = element(by.css('.md-sidenav-left')).all(by.css('a.md-no-style.md-button.md-ink-ripple'));

    this.get = function () {
        browser.get('/allPatients#/allPatients');
    };

    this.getNumberOfPatients = function () {
        return this.patients.count();
    };

    this.searchPatient = function (name) {
        this.searchButton.click();
        this.searchBar.sendKeys(name);

        return this.patients.count();
    };
};

module.exports = AllPatients;
var Summary = function() {
    this.overviewButton = element.all(by.css('[ng-click="$ctrl.gotoOverview()"]'));
    this.doctorNoteButton = element(by.css('[ng-click="$ctrl.gotoDoctorNote()"]'));
    this.nursingRecordsButton = element(by.css('[ng-click="$ctrl.gotoNursingRecords()"]'));
    this.sidenavButton = element(by.css('[ng-click="$ctrl.openMenu()"]'));
    this.sideMenu = element(by.css('.md-sidenav-right')).all(by.css('a.md-no-style.md-button.md-ink-ripple'));
    this.createNewDialysis = element(by.css('div h3 a'));

    this.gotoOverView = function() {
        this.overviewButton.click();
    };

    this.gotoDoctorNote = function() {
        this.doctorNoteButton.click();
    };

    this.gotoNursingRecord = function() {
        this.nursingRecordsButton.click();
    };
};
module.exports = Summary;
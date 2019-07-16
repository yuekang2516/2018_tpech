var DoctorNote = function() {
    this.textArea = element(by.model('$ctrl.userForm.Content'));
    this.save = element(by.css('[ng-click="$ctrl.submit($event)"]'));
};
module.exports = DoctorNote;
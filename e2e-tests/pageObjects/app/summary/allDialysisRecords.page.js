 var AllDialysisRecords = function() {
    this.fab = element(by.css('[ng-click="$ctrl._handleCreateCheck($event)"]'));
    this.createButton = element(by.css('[ng-click="vm.ok()"]'));
};
module.exports = AllDialysisRecords;
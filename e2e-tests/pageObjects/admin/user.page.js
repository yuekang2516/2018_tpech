var User = function() {
    this.userList = element.all(by.repeater('u in vm.users'));
    this.fab = element(by.css('[ng-click="vm.gotoCreate()"]'));

    //user create/edit
    this.saveButton = element(by.css('[ng-click="vm.showSimpleToast()"]'));
};
module.exports = User;
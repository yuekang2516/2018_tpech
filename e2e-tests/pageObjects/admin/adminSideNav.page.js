var AdminSideNav = function() {
    this.navButton = element(by.css('[ng-click="vm.openLeftMenu()"]'));
    this.sideMenu = element.all(by.css('md-list-item'));
};
module.exports = AdminSideNav;
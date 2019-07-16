var LoginPage = function () {
    //define elements
    this.username = element(by.model('vm.formData.account'));
    this.password = element(by.model('vm.formData.password'));
    this.loginButton = element(by.css('button'));

    this.get = function () {
        browser.get('/');
    };

    this.login = function (username, password) {
        this.username.sendKeys(username);
        this.password.sendKeys(password);
        this.loginButton.click();
    };
};

module.exports = LoginPage;
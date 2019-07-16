var Log = function() {
    this.logList = element.all(by.repeater('log in vm.logs'));
};
module.exports = Log;
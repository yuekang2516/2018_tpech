var Custom = function() {
    this.customList = element.all(by.repeater('item in vm.list'));
};
module.exports = Custom;
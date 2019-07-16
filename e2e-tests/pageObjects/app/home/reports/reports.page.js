var Reports = function() {
    this.reportMenu = element.all(by.repeater('p in rep.reportsitem'));
};
module.exports = Reports;
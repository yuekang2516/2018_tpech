var MachineData = function() {
    this.fab = element(by.css('[ng-click="machineData.goto(\'create\')"]'));
    this.machineDataList = element.all(by.repeater('item in machineData.serviceData'));

    //machineDataDetail
    this.save = element(by.css('[ng-click="detail.submit()"]'));
};
module.exports = MachineData;
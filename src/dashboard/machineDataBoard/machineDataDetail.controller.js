import './machineDataBoard.less';

angular
    .module('app')
    .controller('machineDataDetailDialogCtrl', machineDataDetailDialogCtrl);

machineDataDetailDialogCtrl.$inject = ['data', 'name', 'medicalId', '$mdDialog'];

function machineDataDetailDialogCtrl(data, name, medicalId, $mdDialog) {
    const self = this;

    self.item = data;
    self.name = name;
    self.medicalId = medicalId;
    // 是否要 show volume /sub volume -> CVVH 及 F 結尾
    if (self.item && self.item.HDFType && self.item.HDFType.match(/(^cvvh$)|(f$)/i)) {
        self.showVolume = true;
    } else {
        self.showVolume = false;
    }
    console.log(self.item);
    self.calculationTime = function calculationTime(value) {
        if (value && value !== '0001-01-01T00:00:00') {
            return `${moment(value).format('HH:mm:ss')} (${moment(value).fromNow()})`;
        }
        return '';
    };

    self.cancel = function () {
        $mdDialog.cancel();
    };
}

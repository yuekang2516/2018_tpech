

angular
    .module('app')
    .controller('petEditController', petEditController);

petEditController.$inject = [
    '$mdDialog', 'showMessage', 'SettingService', 'peritonitisService',
    '$filter', 'germItem', 'ptId', '$rootScope'];
function petEditController(
    $mdDialog, showMessage, SettingService, peritonitisService,
    $filter, germItem, ptId, $rootScope) {
    console.log("peritonitis treat Edit/Create Dialog", germItem);

    const self = this;
    const $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();
    self.isCreate = germItem.Treatment_Record === "CREATE";
    self.petDataObj = germItem;
    self.enableStartDate = false;

    // cancel
    self.cancel = function cancel() {
        $rootScope.$emit("peritonitisListRefreshEvent", "");
        $mdDialog.cancel();
    };

    // save
    self.ok = function ok() {

        if (self.petDataObj.Recorddate < self.petDataObj.Startdate) {
            showMessage("開始日期應早於記錄日期");
            return;
        }

        self.petDataObj.PatientId = ptId;
        self.petDataObj.HospitalId = self.currentHospital.Id;

        console.log("self.petDataObj---", self.petDataObj);

        if (self.isCreate) {
            peritonitisService.postGerm(self.petDataObj).then((res) => {
                console.log("peritonitisService createOne Germ success", res);
                showMessage($translate('peritonitis.treat.createSuccess'));
                $rootScope.$emit("peritonitisListRefreshEvent", "");
            }, (res) => {
                console.log("peritonitisService createOne Germ fail", res);
                showMessage($translate('peritonitis.treat.createFail'));
            });
        } else {
            peritonitisService.putGerm(self.petDataObj).then((res) => {
                console.log("peritonitisService update Germ success", res);
                showMessage($translate('peritonitis.treat.editSuccess'));
            }, (res) => {
                console.log("peritonitisService update Germ fail", res);
                showMessage($translate('peritonitis.treat.editSuccess'));
            });
        }

        console.log("emit peritonitisListRefreshEvent");
        $rootScope.$emit("peritonitisListRefreshEvent", "");
        $mdDialog.hide();
    };

    self.initialUI = function () {
        if (self.isCreate) {
            // 借用的欄位，使用完後，交還
            self.petDataObj.Treatment_Record = "";
        } else {
            let tmpStr = "";
            tmpStr = self.petDataObj.Startdate;
            self.petDataObj.Startdate = new Date(tmpStr);

            tmpStr = self.petDataObj.Recorddate;
            self.petDataObj.Recorddate = new Date(tmpStr);
        }
    };
    self.initialUI();

}

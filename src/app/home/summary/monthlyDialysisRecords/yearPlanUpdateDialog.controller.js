
// 修改單一個年度計畫
angular
    .module('app')
    .controller('yearPlanUpdateDialogController', yearPlanUpdateDialogController);

    yearPlanUpdateDialogController.$inject = ['$state', '$mdDialog', 'chipData'];

function yearPlanUpdateDialogController(
    $state,
    $mdDialog,
    chipData
) {
    const self = this;

    console.log('修改年度計畫表 chipData', chipData);
    self.title = chipData.chipObj.Title;

    
    self.save = function () {
        console.log('儲存');
        // 修改後的標題
        chipData.updateTitle = self.title;
        $mdDialog.hide();
    };

    self.delete = function () {
        $mdDialog.hide();
    };

    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

}


/*
    <md-dialog class="year-plan-update-dialog-container">
        <form name="eventForm" ng-cloak>
            <md-toolbar>
                <div class="md-toolbar-tools" layout="row">

                    <p flex>刪除年度計畫標題</p>

                    <md-button class="md-icon-button" ng-click="dialog.cancel()">
                        <i class="material-icons">clear</i>
                    </md-button>
                </div>
            </md-toolbar>

            <md-dialog-content>
                <div class="md-dialog-content">

                    <div layout="row" class="row">
                        <label class="label-margin">記事標題</label>
                        <input required ng-model="dialog.title">
                    </div>


                    <md-dialog-actions layout-align="end end">
                        <md-button class="md-raised" ng-click="dialog.cancel()">
                            取消
                        </md-button>
                        <md-button class="md-raised md-primary md-btn-white-text" ng-click="dialog.save()" ng-disabled="eventForm.$invalid">
                            修改記事
                        </md-button>
                    </md-dialog-actions>
                </div>
            </md-dialog-content>

        </form>
    </md-dialog>

 */

 // 刪除單一年度計畫
// angular
//     .module('app')
//     .controller('yearPlanDeleteDialogController', yearPlanDeleteDialogController);

//     yearPlanDeleteDialogController.$inject = ['$state', '$mdDialog', 'chipData'];

// function yearPlanDeleteDialogController(
//     $state,
//     $mdDialog,
//     chipData
// ) {
//     const self = this;

//     console.log('刪除年度計畫表 chipData', chipData);

//     self.save = function () {
//         console.log('刪除');

//         $mdDialog.hide();
//     };

//     self.delete = function () {
//         $mdDialog.hide();
//     };

//     self.cancel = function cancel() {
//         $mdDialog.cancel();
//     };

// }

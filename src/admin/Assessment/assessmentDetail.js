import tpl from './assessmentDetail.html';

angular.module('app').component('assessmentDetail', {
    template: tpl,
    controller: assessmentDetailCtrl,
    controllerAs: 'vm'
});

assessmentDetailCtrl.$inject = ['$state', '$stateParams', '$mdDialog', 'assessmentService', 'showMessage', '$filter'];

function assessmentDetailCtrl($state, $stateParams, $mdDialog, assessmentService, showMessage, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    let Assessments;
    vm.Options = '';
    vm.IsformShow = true;

    // 取得評估項目資料
    vm.loadAssessment = function loadAssessment() {
        if (vm.type === 'create') {
            // 設定標題
            Assessments = {};
            Assessments.Items = [];
            vm.editMode = false;
            vm.loading = false;
        } else {
            // 先行處理評估項目資料顯示
            assessmentService.getByType($stateParams.type).then((resp) => {
                Assessments = resp.data;
                console.log(Assessments);
                vm.AssessmentType = Assessments.Type;
                angular.forEach(Assessments.Items, function (item, ind) {
                    // if (item.Item === $stateParams.id) {
                    if (ind.toString() === $stateParams.id) {
                        vm.Assessment = item;
                        vm.Options = vm.Assessment.Options.join('\n');
                        vm.IsformShow = vm.Assessment.IsformShow == "Y" ? true : false;
                    }
                });
                vm.editMode = true;
                vm.loading = false;
                vm.isError = false; // 顯示伺服器連接失敗的訊息
                }, () => {
                vm.isError = true;
            });
        }
    };

    // 初始化頁面時載入評估項目資料
    vm.$onInit = function onInit() {
        // 設定上方title
        if ($stateParams.id === 'create') {
            vm.type = 'create';
        } else {
            vm.type = 'edit';
        }
        vm.Assessment = {};
        vm.Assessment.Options = [];
        vm.Assessment.IncludeOther = false;
        vm.Assessment.IsformShow = "Y";
        vm.count = 0;
        vm.editMode = false;
        vm.loadAssessment();
    };

    // 性別下拉清單選項
    vm.optType = [{
        value: 'pre',
        name: $translate('assessment.subtitle1') // '洗前'
    },
    {
        value: 'in',
        name: $translate('assessment.subtitle2') // '洗中'
    },
    {
        value: 'post',
        name: $translate('assessment.subtitle3') // '洗後'
    }];

    // 儲存評估項目
    vm.save = function save(Assessment) {
        vm.isSaving = true;
        Assessment.Options = vm.Options.split('\n').filter((value) => { return value.trim() !== ''; });
        Assessment.IsformShow = vm.IsformShow == true ? "Y" : "N";
        if (vm.type === 'create') {
            // 檢查該 type 是否存在
            assessmentService.getByType(vm.AssessmentType).then((resp1) => {
                if (resp1.data) {
                    // 新增評估項目
                    Assessments = resp1.data;
                    Assessments.Items.push(Assessment);
                    delete Assessments.Id;
                    assessmentService.put(Assessments).then(() => {
                    // 修改評估項目
                    showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                    vm.isSaving = false;
                    $state.go('assessment', {}, {
                            reload: true
                        });
                    }, () => {
                        showMessage($translate('customMessage.EditFail')); // lang.EditFail
                        vm.isSaving = false;
                    });
                } else {
                    // 建立評估項目
                    if (Assessments.Items === undefined) {
                        Assessments = {};
                        Assessments.Items = [];
                    }
                    Assessments.Type = vm.AssessmentType;
                    Assessments.Items.push(Assessment);
                    assessmentService.post(Assessments).then(() => {
                        showMessage($translate('customMessage.DataAddedSuccessfully')); // lang.DataAddedSuccessfully
                        vm.isSaving = false;
                        $state.go('assessment', {}, {
                            reload: true
                        });
                    }, () => {
                        showMessage($translate('customMessage.DataAddedFail'));
                        vm.isSaving = false;
                    });
                }
            });
        } else { // 'edit'
            delete Assessments.Id;
            assessmentService.put(Assessments).then(() => {
                // 修改評估項目
                showMessage($translate('customMessage.Datasuccessfully')); // lang.Datasuccessfully
                    vm.isSaving = false;
                    $state.go('assessment', {}, {
                    reload: true
                });
            }, () => {
                showMessage($translate('customMessage.EditFail')); // lang.EditFail
                vm.isSaving = false;
                // showMessage(reason.data);
            });
        }
    };

    // 復原評估項目
    vm.recover = function recover() {
        vm.isSaving = true;
        // 取得評估項目資料
        vm.loadAssessment();
        showMessage($translate('customMessage.RevertDataSuccess')); // '復原成功' lang.RecoveryAssessmentDataSuccessfully
        vm.isSaving = false;
    };

    // 呼叫刪除對話視窗
    vm.delete = function del(ev) {
        vm.isSaving = true;
        const confirm = $mdDialog.confirm()
            .title($translate('assessment.component.confirmDelete')) // '刪除檢驗檢查項目提示'
            .textContent($translate('assessment.component.textContent')) // '請問是否要刪除此筆檢驗檢查項目資料?'
            .ariaLabel($translate('assessment.component.confirmTitle')) // '刪除檢驗檢查項目'
            .targetEvent(ev)
            .ok($translate('assessment.component.deleteOk')) // '刪除'
            .cancel($translate('assessment.component.deleteCancel')); // '取消'

        $mdDialog.show(confirm).then(() => {
            //    // 呼叫刪除的service
            //    labexamSettingService.delete(vm.labexam_id).then(() => {
            //        showMessage($translate('customMessage.DataDeletedSuccess')); // lang.DataDeletedSuccess
            angular.forEach(Assessments.Items, function (item, ind) {
                // if (item.Item === $stateParams.id) {
                if (ind.toString() === $stateParams.id) {
                    console.log(ind);
                    Assessments.Items.splice(ind, 1);
                }
            });
            console.log(Assessments.Items);

            delete Assessments.Id;
            assessmentService.put(Assessments).then(() => {
                // console.log(Assessments);
                // 修改評估項目
                showMessage($translate('customMessage.DataDeletedSuccess')); // lang.Datasuccessfully
                vm.isSaving = false;
                $state.go('assessment', {}, {
                    reload: true
                });
            }, (reason) => {
                showMessage($translate('customMessage.DataDeleteFailed')); // lang.EditFail
                vm.isSaving = false;
                // showMessage(reason.data);
            });

            // $state.go('assessment', {}, {
            //        reload: true
            //    });
            //    }, () => {
            //        showMessage($translate('customMessage.DataDeleteFailed')); // lang.DataDeleteFailed
            //    });
        }, () => {
            vm.isSaving = false;
        });
    };

    // 回評估項目列表
    vm.back = function () {
        history.go(-1);
    };
}

import abnormalvesselassessments from './abnormalvesselassessments.html';
import abnormalvesselassessment from './abnormalvesselassessment.html';

angular
    .module('app')
    .component('abnormalVesselAssessment', {
        template: abnormalvesselassessments,
        controller: abnormalvesselassessmentCtrl
    })
    .component('abnormalVesselAssessmentDetail', {
        template: abnormalvesselassessment,
        controller: abnormalvesselassessmentEditCtrl
    })
    .directive('complicationsValidator', () => ({
        require: 'ngModel',
        scope: {
            ngModel: '=ngModel'
        },
        link(scope, element, attrs, ngModel) {
            // ngModel.$parsers.push((value) => {
            //   if (!value || value.length === 0) return false;
            //   ngModel.$setValidity('warring', value !== '請選擇');
            //   return value;
            // });
            scope.$watch('ngModel', (newValue, oldValue) => {
                ngModel.$setValidity('warring', newValue !== '請選擇');
            });
        }
    }));

// 測試資料
// const patients = {
//   Name: '李小明',
//   WardId: '56fcc9eb4ead7870942f61c4',
//   WardName: '測試透析室001',
//   Id: '57722b1b00977e113c1eb774'
// };
abnormalvesselassessmentCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'AbnormalvesselassessmentService',
    '$mdToast',
    'moment',
    'SettingService',
    '$mdMedia',
    'PatientService',
    '$interval',
    '$timeout'
];

function abnormalvesselassessmentCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    AbnormalvesselassessmentService, $mdToast, moment, SettingService, $mdMedia, PatientService,
    $interval, $timeout) {
    const self = this;

    self.user = SettingService.getCurrentUser();
    self.serviceData = null;

    // 預設狀態
    self.loading = true;
    self.lastApoId = '';
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;

    self.$onInit = function $onInit() {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                AbnormalvesselassessmentService
                    .get($stateParams.patientId)
                    .then((q) => {
                        console.log(q);
                        self.loading = false;
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = AbnormalvesselassessmentService.getLastAccessTime();
                        self.isError = false;
                    }, (error) => {
                        console.error('AbnormalvesselassessmentService error', error);
                        self.loading = false;
                        self.isError = true;
                    });
            }, (error) => {
                self.loading = false;
                self.isError = true;
                console.error('PatientService error', error);
            });
    };

    // 排序護理記錄時間, 用在 ng-repeat 上
    self.sortRecord = function sortRecord(item) {
        const date = new Date(item.AbnormalTime);
        return date;
    };
    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                AbnormalvesselassessmentService
                    .get($stateParams.patientId, true)
                    .then((q) => {
                        self.loading = false;
                        self.isError = false;
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = AbnormalvesselassessmentService.getLastAccessTime();
                    }, (error) => {
                        self.loading = false;
                        self.isError = true;
                        console.error('AbnormalvesselassessmentService error', error);
                    });
            }, (error) => {
                self.loading = false;
                self.isError = true;
                console.error('PatientService error', error);
            });
    };
    // go to
    self.goto = function goto(id = null) {
        $state.go('abnormalVesselAssessmentDetail', {
            abnormalVesselAssessmentId: id,
            patientId: $stateParams.patientId
        });
    };

    self.goback = function goback() {
        // $state.go('summary', {}, { location: 'replace' });
        history.back();
    };

    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;
            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                AbnormalvesselassessmentService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        self.refresh();
                    }
                });
                mdDialog.hide(data);
            };
        }
    };
}

abnormalvesselassessmentEditCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'AbnormalvesselassessmentService',
    '$mdToast',
    'SettingService',
    'moment',
    '$mdSidenav',
    'showMessage',
    'PatientService',
    '$filter',
    'cursorInput'
];

function abnormalvesselassessmentEditCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    AbnormalvesselassessmentService, $mdToast, SettingService, moment, $mdSidenav,
    showMessage, PatientService, $filter, cursorInput) {
    const self = this;

    let $translate = $filter('translate');

    // 預設選單
    self.regform = {};
    self.user = SettingService.getCurrentUser();
    console.log(self.user);
    self.abnormalVesselAssessmentId = $stateParams.abnormalVesselAssessmentId;
    self.DisposalResults = '';
    // self.complications = '請選擇';
    self.disposal = '請選擇';
    // self.Complications = [
    //     '針管凝固', '導管出口滲液', '血流量不足需要降低血液流速', '穿刺點止血時間延長', '手掌/手臂/手指 腫脹/疼痛/麻木感/冰冷',
    //     '衝擊聲或震顫微弱/不連續/音調改變', '靜脈壓力連續三次異常升高', '瘻管外觀改變(詳細說明)', 'KT/V或URR不足', '通路凝固',
    //     '感染(菌種)', '導管脫落', '穿刺困難', '其他'
    // ];
    // self.Complications = [
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.0'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.1'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.2'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.3'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.4'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.5'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.6'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.7'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.8'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.9'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.10'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.11'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.12'),
    //     $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Complications.13'),
    // ];

    // self.Disposals = ['偵測再循環率(結果)', '內科療法去除血栓(請說明)', '外科手術切除血栓', '瘻管或血液攝影', '血管成形術(PTA)',
    //     '外科矯正', '重建新血管通路', '給予抗生素(種類及途經)', '其他方法(請說明)'
    // ];
    self.Disposals = [
        $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Disposals.0'),
        $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Disposals.1'),
        $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Disposals.2'),
        $translate('abnormalVesselAssessment.abnormalVesselAssessment.component.Disposals.3'),
    ];

    // 處置醫院
    self.DisposalHospitals = SettingService.getHospitalSettings();

    self.$onInit = function $onInit() {
        // 修改
        if ($stateParams.abnormalVesselAssessmentId) {
            self.loading = true;
            PatientService
                .getById($stateParams.patientId, true)
                .then((p) => {
                    self.patient = p.data;
                    AbnormalvesselassessmentService.getById($stateParams.abnormalVesselAssessmentId)
                        .then((q) => {
                            if (q.status === 200) {
                                self.loading = false;
                                self.regform = q.data;
                                self.regform.AbnormalTime = new Date(moment(self.regform.AbnormalTime).format('YYYY-MM-DD HH:mm:ss'));
                                // self.complications = q.data.Complications[0];
                                self.disposal = q.data.Disposal;
                                if (q.data.DisposalHospital != null) {
                                    self.useHospitalKeyIn = q.data.DisposalHospital.substring(4);
                                    self.regform.DisposalHospital = q.data.DisposalHospital.substring(0, 4);
                                }
                                self.DisposalResults = q.data.DisposalResults;
                                self.isError = false;
                            }
                        }, (error) => {
                            console.error('AbnormalvesselassessmentService', error);
                            self.loading = false;
                            self.isError = true;
                        });
                }, (error) => {
                    console.error('PatientService', error);
                    self.loading = false;
                    self.isError = true;
                });
        } else {  // 新增
            self.regform.DisposalResults = '';  // 避免 undefined
            self.regform.AbnormalTime = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
            PatientService
                .getById($stateParams.patientId, true)
                .then((p) => {
                    self.loading = false;
                    self.patient = p.data;
                }, (error) => {
                    console.error('PatientService', error);
                });
        }
    };

    self.isSaving = false;
    self.submit = function submit(event) {
        self.isSaving = true;
        if (event) {
            event.currentTarget.disabled = true;
        }

        // 處置醫院
        if (self.regform.DisposalHospital === 'none') {
            if (!self.useHospitalKeyIn) {
                self.regform.DisposalHospital = null;
            } else {
                self.regform.DisposalHospital += self.useHospitalKeyIn;
            }
        }

        if ($stateParams.abnormalVesselAssessmentId) {
            // 修改
            self.regform.ModifiedUserId = self.user.Id;
            self.regform.ModifiedUserName = self.user.Name;
            // self.regform.Complications = self.complications.split(',');
            self.regform.Disposal = self.disposal;

            AbnormalvesselassessmentService.put(self.regform).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('abnormalVesselAssessment.abnormalVesselAssessment.component.editSuccess'));
                    history.back(-1);
                }
            }).catch((err) => {
                showMessage($translate('abnormalVesselAssessment.abnormalVesselAssessment.component.editFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        } else {
            // 新增
            self.regform.CreatedUserId = self.user.Id;
            self.regform.CreatedUserName = self.user.Name;
            // self.regform.Complications = self.complications.split(',');
            self.regform.Disposal = self.disposal;
            self.regform.PatientId = $stateParams.patientId;

            AbnormalvesselassessmentService.post(self.regform).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('abnormalVesselAssessment.abnormalVesselAssessment.component.createSuccess'));
                    history.back(-1);
                }
            }).catch((err) => {
                showMessage($translate('abnormalVesselAssessment.abnormalVesselAssessment.component.createFail'));
            }).finally(() => {
                self.isSaving = false;
            });
        }
    };

    // 處置結果還原
    self.redo = function redo() {
        self.regform.DisposalResults = self.DisposalResults;
    };

    self.goback = function goback() {
        history.back();
    };
    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#DisposalResults'), e);
        //$mdSidenav('rightPhrase').close();
    };
    // 併發症項目 check ok
    self.changeDisposalResults = function ChangeDisposalResults() {
        if (typeof self.regform.DisposalResults === 'undefined') {
            if (self.regform.Complications !== '請選擇' && self.regform.Disposal !== '請選擇') {
                self.regform.DisposalResults = 'OK';
            }
        }
    };
}

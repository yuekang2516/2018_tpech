import createlab from './createLabexam.html';
import updatelab from './updateLabexam.html';

angular
    .module('app')
    .component('createLabexam', {
        template: createlab,
        controller: updatelabCtrl
    }).component('updateLabexam', {
        template: updatelab,
        controller: updatelabCtrl
    });

updatelabCtrl.$inject = [
    '$state',
    '$stateParams',
    '$mdDialog',
    '$mdToast',
    'SettingService',
    'PatientService',
    'showMessage',
    '$interval',
    '$sessionStorage',
    'labexamService',
    '$timeout',
    'labexamSettingService',
    '$filter'
];


function updatelabCtrl($state, $stateParams, $mdDialog, $mdToast, SettingService,
    PatientService, showMessage, $interval, $sessionStorage, labexamService, $timeout, labexamSettingService, $filter) {
    let self = this;

    let $translate = $filter('translate');

    self.loading = true;
    // self.defaultGroup = ['HCT', 'HB', 'ALBUMIN', 'FE', 'EPO']; // 預設群組
    self.defaultGroup = [];
    self.user = SettingService.getCurrentUser();
    self.labexamId = $stateParams.labexamId;
    self.platform = cordova.platformId;

    // 設定 javascript 時間
    let time = new Date(),
        h = time.getHours(),
        m = time.getMinutes();
    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;

    let CheckTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), parseInt(h), parseInt(m), 0, 0);


    // 檢查當天可以設定的最大時間
    let setMaxTime = new Date();
    self.checkMaxTime = setMaxTime.setDate(setMaxTime.getDate() - 1);

    self.searchTerm = '';

    // 初始化
    self.$onInit = () => {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                if ($stateParams.labexamId) {
                    labexamService
                        .getById($stateParams.labexamId)
                        .then((q) => {
                            self.form = q.data;
                            if (self.form.CheckTime) {
                                self.form.CheckTime = moment(self.form.CheckTime).toDate();
                            }
                            self.loading = false;
                            self.isError = false;
                        }, () => {
                            self.loading = false;
                            self.isError = true;
                        });
                } else {
                    // 這裡要做撈取下拉選單API
                    labexamSettingService
                        .get()
                        .then((q) => {
                            if (q.data) {
                                // 如果資料中已經有預設群組名單，從名單中給值
                                // self.defaultGroup = q.data.map(x => x.Name).filter((element, index, arr) => {
                                //     return arr.indexOf(element) === index;
                                // });

                                q.data.forEach((item) => {
                                    let Name;
                                    let itemObj;
                                    if (item.Gender === self.patient.Gender) {
                                        Name = item.Name;
                                        itemObj = {
                                            Name,
                                            NormalUpper: item.NormalUpper,
                                            NormalDown: item.NormalDown,
                                            Unit: item.Unit,
                                            Code: item.Code,
                                            Memo: item.Memo
                                        };
                                        self.defaultGroup.push(itemObj);
                                    } else if (item.Gender === 'O') {
                                        Name = item.Name;
                                        itemObj = {
                                            Name,
                                            NormalUpper: item.NormalUpper,
                                            NormalDown: item.NormalDown,
                                            Unit: item.Unit,
                                            Code: item.Code,
                                            Memo: item.Memo
                                        };
                                        self.defaultGroup.push(itemObj);
                                    }

                                });
                                self.copyGroup = angular.copy(self.defaultGroup);

                                // self.defaultGroup = q.data.map((x) => {
                                //     let Name;
                                //     // 對應男女不同
                                //     debugger;
                                //     if (x.Gender === self.patient.Gender) {
                                //         Name = x.Name;
                                //     } else if (x.Gender === 'O') {
                                //         Name = x.Name;
                                //     }
                                //     return {
                                //         Name,
                                //         NormalUpper: x.NormalUpper,
                                //         NormalDown: x.NormalDown,
                                //         Unit: x.Unit,
                                //         Code: x.Code,
                                //         Memo: x.Memo
                                //     };
                                // });
                            }
                            self.loading = false;
                            self.isError = false;
                        }, () => {
                            self.loading = false;
                            self.isError = true;
                        });
                    self.form = {};
                    self.form.CheckTime = CheckTime;
                    self.form.labItems = [{
                        PatientId: $stateParams.patientId,
                        CheckTime
                    }];
                }
            }, () => {
                self.loading = false;
                self.isError = true;
            });
    };
    // +
    self.add = () => {
        self.form.labItems.push({
            PatientId: $stateParams.patientId,
            CheckTime: self.form.CheckTime
        });
    };
    // -
    self.remove = (index) => {
        self.form.labItems.length > 1 ? self.form.labItems.splice(index, 1) : self.form.labItems[index].Name = '';
    };
    // anyMore
    self.openMore = (event, object) => {
        $mdDialog.show({
            locals: {
                item: object
            },
            controller: [
                '$mdDialog',
                'item',
                AnyMoreController
            ],
            templateUrl: 'anyMore.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function AnyMoreController(mdDialog, item) {
            const vm = this;
            vm.form = item;

            // 判斷是否不正常
            if (parseInt(item.NormalDown) < item.Value) {
                vm.form.IsNormal = false;
            } else if (parseInt(item.NormalUpper) > item.Value) {
                vm.form.IsNormal = false;
            }

            vm.hide = function hide() {
                mdDialog.hide();
            };


            vm.ok = function ok() {
                mdDialog.hide(data);
            };
        }

    };

    self.onChangeName = (obj, index) => {
        // self.form.labItems[index].push()
        // 如有重複取締一個
        let selected = self.defaultGroup.filter(x => x.Name === obj.Name)[0];

        if (selected) {
            self.form.labItems[index].NormalUpper = selected.NormalUpper;
            self.form.labItems[index].NormalDown = selected.NormalDown;
            self.form.labItems[index].Unit = selected.Unit;
            self.form.labItems[index].Code = selected.Code;
            self.form.labItems[index].Memo = selected.Memo;
            self.form.labItems[index].CheckTime = self.form.CheckTime;
        }

    };


    self.goback = () => {
        history.go(-1);
    };

    // autocomplete
    self.getGroup = function (searchText) {
        if (searchText === undefined) {
            searchText = '';
        }
        return self.defaultGroup.filter((group) => {
            return group.Name.toUpperCase().indexOf(searchText.toUpperCase()) !== -1;
        });
    };

    self.isSaving = false;
    self.submit = (e) => {
        self.isSaving = true;
        if (e) {
            e.currentTarget.disabled = true;
        }

        // if (self.form.Group === 'none') {
        //     self.form.Group = self.useGroupKeyIn;
        // }

        if (self.form.CheckTime) {
            self.form.CheckTime = new Date(self.form.CheckTime);
        }

        if ($stateParams.labexamId) {
            self.form.ModifiedUserId = self.user.Id;
            self.form.ModifiedUserName = self.user.Name;
            // debugger;
            labexamService
                .put(self.form)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('labexam.updateLabexam.component.editSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('labexam.updateLabexam.component.editFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
            console.log('self.form', self.form);
        } else {
            // 存檔時確認時間是否有更動
            for (let d of self.form.labItems) {
                d.CheckTime = self.form.CheckTime;
            }

            labexamService
                .multiPost(self.form.labItems)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('labexam.updateLabexam.component.createSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('labexam.updateLabexam.component.createFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
            console.log('self.form.labItems', self.form.labItems);
        }
    };
}

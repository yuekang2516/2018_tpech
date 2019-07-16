import tpl from './prescriptionDetail.html';
import './prescriptionDetail.less';

angular.module('app')
    .component('prescriptionDetail', {
        template: tpl,
        controller: prescriptionDetailCtrl
    });

prescriptionDetailCtrl.$inject = ['$state', '$stateParams', 'prescriptionService', 'SettingService', 'showMessage', 'PatientService', '$mdDialog', 'infoService', '$filter', '$rootScope', '$sessionStorage', 'cursorInput', '$mdSidenav'];

function prescriptionDetailCtrl($state, $stateParams, prescriptionService, SettingService, showMessage, PatientService, $mdDialog, infoService, $filter, $rootScope, $sessionStorage, cursorInput, $mdSidenav) {
    let self = this;
    self.serviceData = {};
    self.prescriptionId = $stateParams.prescriptionId;
    const patientId = $stateParams.patientId;
    const currentUser = SettingService.getCurrentUser();

    self.isCloseModeAndType = false; // 初始:顯示mode區域

    let $translate = $filter('translate');

    self.HospitalSettings = SettingService.getHospitalSettings();
    self.Anticoagulants = {};
    self.selected = [];
    self.canAccess = true;

    // Duration Hour options 1-12
    self.durationH = [];
    for (let i = 1; i < 13; i++) {
        self.durationH.push(i);
    }

    self.$onInit = function () {
        // 需使用最新的 hospital setting，因此要重整
        infoService.reload().then(() => { }, () => { showMessage($translate('customMessage.serverError')); }); // lang.ComServerError

        // 讀取病人資料, 放在 toolbar 裡面
        PatientService.getById(patientId, true).then((res) => {
            self.currentPatient = res.data;
            self.loading = false;
            self.isError = false;
        }, () => {
            self.loading = false;
            self.isError = true;
        });

        if (self.prescriptionId !== 'add') {
            // edit mode
            self.loading = true;

            // 判斷是哪種tag，控制畫面顯示及處理mode上傳資料
            if ($state.current.name !== 'prescriptionForPdf') {
                setTagByModeOrType();
            }

            prescriptionService.getDetail(self.prescriptionId).then((d) => {
                // console.log(d.data);
                self.serviceData = d.data;

                // for 電子簽章
                if ($state.current.name === 'prescriptionForPdf') {
                    self.isCloseModeAndType = true; // 不顯示mode區域
                    if (Object.hasProperty(self.serviceData, 'DialysisMode.Name')) {
                        self.DialysisMode = self.serviceData.DialysisMode.Name;
                        self.tag = self.serviceData.DialysisMode.Name;
                    }
                }
                // 修改再確認權限
                if ($state.current.name !== 'prescriptionForPdf') {
                    checkCanAccess(self.serviceData.CreatedUserId, self.serviceData.ModifiedUserId);
                }
                _assembleData();

                // 怕舊資料會有 y 或 true 或中文字, 一律配合後台, 改為 string
                if (self.serviceData.InBed && (self.serviceData.InBed === 'true' || self.serviceData.InBed === '是')) {
                    self.serviceData.InBed = 'true';
                } else {
                    self.serviceData.InBed = 'false';
                }

                self.changeMode();  // trigger 根據 mode 顯示或隱藏不同欄位

                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        } else {
            // 新增
            // 預帶
            self.serviceData.Duration = {
                Hours: 4,
                Minutes: 0
            };
            self.serviceData.Na = 140;

            // 判斷是哪種tag，控制畫面顯示及處理mode上傳資料
            setTagByModeOrType();

            // 若有傳入 data 則直接帶入
            if ($sessionStorage.lastDataObj) {
                // mode 維持與來源一致，不讓使用者修改
                self.copy = true;
                self.ditto();
            }
        }
    };

    // 判斷是哪種tag，控制畫面顯示及處理mode上傳資料
    function setTagByModeOrType() {
        switch ($stateParams.tag) {
            case 'HD':
                self.isCloseModeAndType = true; // 不顯示mode區域
                self.tag = 'HD';
                self.DialysisMode = 'HD';  // 要上傳的資料
                self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                break;
            case 'HDF':
                self.isCloseModeAndType = true; // 不顯示mode區域
                self.tag = 'HDF';
                self.DialysisMode = 'HDF'; // 要上傳的資料
                self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                break;
            case 'SLEDD-f':
                self.isCloseModeAndType = true; // 不顯示mode區域
                self.tag = 'SLEDD-f';
                self.DialysisMode = 'SLEDD-f'; // 要上傳的資料
                self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                break;
            case 'INTERIM': // 臨時
                // 不需顯示tag內容
                self.isCloseModeAndType = false; // 顯示mode區域
                self.serviceData.Type = 'ShortTerm';  // 要上傳的資料
                break;
        }
    }

    // 重組資料, 以符合畫面上所用
    function _assembleData() {
        // 將抗凝劑放到有選取的 checkbox array
        // self.selected = Object.keys(self.serviceData.Anticoagulants);
        self.selected = [];
        for (let i = 0; i < Object.keys(self.serviceData.Anticoagulants).length; i++) {
            let key = Object.keys(self.serviceData.Anticoagulants)[i];
            self.selected.push(key);
            self.Anticoagulants[key] = [];
            self.Anticoagulants[key][0] = self.serviceData.Anticoagulants[key][0];
            self.Anticoagulants[key][1] = self.serviceData.Anticoagulants[key][1];
        }

        // 將模式取出, 丟到畫面上
        if (self.serviceData.DialysisMode) {
            self.DialysisMode = self.serviceData.DialysisMode['Name'];
        }
    }

    // // 確認權限是否能修改
    // self.checkAccessible = function (createdUserId) {
    //     if (self.prescriptionId !== 'add') {
    //         // 等確定有值才需判斷是否能編輯
    //         return !createdUserId || SettingService.checkAccessible(createdUserId);
    //     }
    //     return true;
    // };

    // 判斷是否為唯讀
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, name: 'prescription', modifiedId });
    }

    self.back = function () {
        history.go(-1);
    };

    self.exists = function (item) {
        return self.selected.indexOf(item) > -1;
    };

    self.toggle = function (item) {
        const idx = self.selected.indexOf(item);
        if (idx > -1) {
            self.selected.splice(idx, 1);
        } else {
            self.selected.push(item);
        }
    };

    self.ditto = () => {
        // 如果有上一筆
        if (Object.getOwnPropertyNames($sessionStorage.lastDataObj).length !== 0) {
            self.serviceData = $sessionStorage.lastDataObj;
            console.log('上一筆資料', self.serviceData);

            // 刪除自己的ID, 以免到後台時, 會導致重複的 ID 新增失敗
            delete self.serviceData.Id;
            delete self.serviceData.Revision;
            delete self.serviceData.ModifiedUserId;
            delete self.serviceData.ModifiedUserName;
            delete self.serviceData.CreatedTime;
            delete self.serviceData.ModifiedTime;

            // 處理抗凝劑
            _assembleData();

            self.serviceData.CreatedUserId = currentUser.Id;
            self.serviceData.CreatedUserName = currentUser.Name;

            // 處理Type / Mode
            switch ($stateParams.tag) {
                case 'HD':
                    self.DialysisMode = 'HD';  // 要上傳的資料
                    self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                    break;
                case 'HDF':
                    self.DialysisMode = 'HDF'; // 要上傳的資料
                    self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                    break;
                case 'SLEDD-f':
                    self.DialysisMode = 'SLEDD-f'; // 要上傳的資料
                    self.serviceData.Type = 'LongTerm';  // 要上傳的資料
                    break;
                case 'INTERIM': // 臨時
                    // 不需顯示tag內容
                    self.serviceData.Type = 'ShortTerm';  // 要上傳的資料
                    break;
            }
        } else {
            showMessage($translate('allPrescriptions.prescriptionDetail.component.noPrevData'));
        }
    };

    self.changeMode = function () {
        // 判斷 MODE 是否為 CRRT mode
        // 符合 CRRT 模式的條件
        // if (self.Mode && self.Mode.toLowerCase().match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/)) {
        //     console.log('isCRRTMode');
        //     self.isCRRT = true;
        //     return;
        // }

        self.isCRRT = false;
    };

    self.submit = function ($event) {
        // 把選取的抗凝劑, 重組為要上傳的資料
        self.serviceData.Anticoagulants = {};
        for (let i = 0; i < self.selected.length; i++) {
            // 有選取的話, 將底下的兩個 input, 組成 array
            if (self.Anticoagulants[self.selected[i]]) {
                self.serviceData.Anticoagulants[self.selected[i]] = [
                    self.Anticoagulants[self.selected[i]][0],
                    self.Anticoagulants[self.selected[i]][1]
                ];
            } else {
                self.serviceData.Anticoagulants[self.selected[i]] = [];
            }
        }

        // 把選取的模式, 組成要上傳的資料
        self.serviceData.DialysisMode = { Name: self.DialysisMode, Volumn: null };

        // 判斷最後是長期還是臨時處方，若為長期須將臨時脫水量移除，若為臨時則將標準體重移除
        if (self.serviceData.Type === 'LongTerm') {
            self.serviceData.Dehydration = '';
        } else {
            self.serviceData.StandardWeight = '';
        }

        // 判斷Mode,不需要的欄位為空值
        if (self.isCRRT) {
            self.serviceData.StandardWeight = '';
            self.serviceData.Dehydration = '';
            self.serviceData.DurationH = '';
            self.serviceData.DurationM = '';
            self.serviceData.Frequency = '';
            self.serviceData.NeedleArteries = '';
            self.serviceData.NeedleVeins = '';
        }
        // else {
        //     self.serviceData.PBP = '';
        //     self.serviceData.FluidFlowWate = '';
        //     self.serviceData.ACTControl = '';
        // }

        self.isSaving = true;
        if (self.prescriptionId !== 'add') {
            // 修改
            self.serviceData.ModifiedUserId = currentUser.Id;
            self.serviceData.ModifiedUserName = currentUser.Name;

            console.log('修改 self.serviceData', self.serviceData);
            prescriptionService.putDetail(self.serviceData).then((res) => {
                if (res.status === 200) {
                    overrideHeader($translate('allPrescriptions.prescriptionDetail.component.editSuccess'), res);
                }
                self.isSaving = false;
            }, () => {
                overrideHeader($translate('allPrescriptions.prescriptionDetail.component.editFail'));
                self.isSaving = false;
            });
        } else {
            // 新增
            // self.serviceData._t = 'DialysisPrescription';
            self.serviceData.HospitalId = currentUser.HospitalId;
            self.serviceData.PatientId = patientId;
            self.serviceData.CreatedUserId = currentUser.Id;
            self.serviceData.CreatedUserName = currentUser.Name;
            console.log('新增 self.serviceData', self.serviceData);
            prescriptionService.postDetail(self.serviceData).then(function (res) {
                if (res.status === 200) {
                    overrideHeader($translate('allPrescriptions.prescriptionDetail.component.createSuccess'), res);
                }
                self.isSaving = false;
            }, (reason) => {
                // self.overrideHeader('新增失敗!');
                showMessage($translate('allPrescriptions.prescriptionDetail.component.createFail') + reason.data);
                self.isSaving = false;
            });
        }
    };

    // 最新的透析處方異動後，確認今日是無有洗腎，是否要覆蓋表頭的處方
    function overrideHeader(title, res) {
        let lastData;
        let prescription = res.data;
        // 取出最新的處方
        // prescriptionService.getByIdPage(prescription.PatientId, 1, 50, true).then((res) => {
        prescriptionService.getByPatientModeOrType(prescription.PatientId, $stateParams.tag, 1, 50, true).then((res) => {
            if (res.Records.length > 1) {
                // 取出狀態不是刪除的處方，並且用建立日期排序
                let orderData = _.orderBy(_.filter(res.Records, ['Status', 'Normal']), ['CreatedTime'], ['desc']);
                _.forEach(orderData, (d) => {
                    // 短效(臨時)需當天才可被覆寫
                    if (d.Type === 'ShortTerm' && moment().isSame(moment(d.CreatedTime), 'day')) {
                        lastData = d;
                        return false;
                    } else if (d.Type !== 'ShortTerm') {
                        lastData = d;
                        return false;
                    }
                    return true;
                });
            } else {
                lastData = res.Records[0];
            }

            // 判斷是不是最新處方
            // 依 self.currentPatient 的最後透析機資料(LastDialysisInfo.StartTime)，判斷今日是否有洗腎並且未關表
            if (lastData && lastData.Id === prescription.Id &&
                self.currentPatient && self.currentPatient.LastDialysisInfo &&
                self.currentPatient.LastDialysisInfo.EndTime === null &&
                moment().isSame(moment(self.currentPatient.LastDialysisInfo.StartTime), 'day')) {
                console.log('lastDialysisInfo', self.currentPatient.LastDialysisInfo);
                // 詢問是否有需要覆蓋表頭處方
                let confirm = $mdDialog.confirm()
                    .title($translate('allPrescriptions.prescriptionDetail.component.prescription') + title)
                    .textContent($translate('allPrescriptions.prescriptionDetail.component.overwriteConfirm'))
                    .ariaLabel('Lucky day')
                    .ok($translate('allPrescriptions.prescriptionDetail.component.overwriteToday'))
                    .cancel($translate('allPrescriptions.prescriptionDetail.component.dontOverwrite'));

                $mdDialog.show(confirm).then(() => {
                    prescriptionService.updateDialysisHeader(self.currentPatient.LastDialysisInfo.DialysisId, prescription.Id, currentUser.Id).then(() => {
                        showMessage($translate('allPrescriptions.prescriptionDetail.component.overwriteSuccess'));
                        $rootScope.$broadcast('overview-dataChanged'); // 通知summary
                        history.go(-1);
                    }, (res2) => {
                        // showMessage('覆寫失敗，原因' + res2.data);
                        showMessage($translate('allPrescriptions.prescriptionDetail.component.overwriteFail', { data: res2.data }));
                        history.go(-1);
                    });
                }, () => {
                    // $scope.$emit('prescriptionChanged', res);
                    history.go(-1);
                });
            } else {
                showMessage(title);
                history.go(-1);
            }
        });
    }


    self.$onDestroy = function () {
        // 刪除 sessionStorage的整個key
        delete $sessionStorage.lastDataObj;
    };


    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Memo'), e);
        //$mdSidenav('rightPhrase').close();
    };


}

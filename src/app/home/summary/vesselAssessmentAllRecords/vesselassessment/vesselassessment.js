import vesselassessments from './vesselassessments.html';
import vesselassessment from './vesselassessment.html';

angular
    .module('app')
    .component('vesselassessment', {
        template: vesselassessments,
        controller: vesselassessmentCtrl,
        controllerAs: '$ctrl'
    })
    .component('vesselassessmentDetail', {
        template: vesselassessment,
        controller: vesselassessmentEditCtrl,
        controllerAs: '$ctrl'
    });

vesselassessmentCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'VesselAssessmentService',
    '$mdToast',
    '$mdMedia',
    '$interval',
    'PatientService',
    '$timeout',
    '$filter'
];

function vesselassessmentCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    VesselAssessmentService, $mdToast, $mdMedia, $interval, PatientService, $timeout, $filter) {
    const self = this;

    let $translate = $filter('translate');

    self.serviceData = [];
    // 預設狀態
    // self.status = 'Deleted';
    self.loading = true;
    self.lastRecords = [];
    self.header = {};
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;

    self.isBrowser = cordova.platformId === 'browser';

    // const interval = $interval(calculateRefreshTime, 60000);

    self.$onInit = function $onInit() {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                VesselAssessmentService
                    .get($stateParams.patientId)
                    .then((q) => {
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = VesselAssessmentService.getLastAccessTime();
                        // calculateRefreshTime();
                        self.loading = false;
                        self.isError = false;
                    }, () => {
                        self.loading = false;
                        self.isError = true;
                    });
            }, (error) => {
                console.error('VesselAssessmentService', error);
                self.loading = false;
                self.isError = true;
            });
    };

    // function calculateRefreshTime() {
    //     $timeout(() => {
    //         self.lastRefreshTitle = `最後更新: ${moment(self.lastAccessTime).fromNow()}`;
    //     }, 0);
    // }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.loading = true;
        PatientService
            .getById($stateParams.patientId, true)
            .then((d) => {
                self.patient = d.data;
                VesselAssessmentService
                    .get($stateParams.patientId, true)
                    .then((q) => {
                        self.serviceData = q.data;
                        self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                        self.lastAccessTime = VesselAssessmentService.getLastAccessTime();
                        // calculateRefreshTime();
                        self.loading = false;
                        self.isError = false;
                    }, () => {
                        self.loading = false;
                        self.isError = true;
                    });
            }, (error) => {
                console.error('VesselAssessmentService', error);
                self.loading = false;
                self.isError = true;
            });
    };

    // 排序護理記錄時間, 用在 ng-repeat 上
    self.sortRecord = function sortRecord(record) {
        const date = new Date(record.StartDate);
        return date;
    };

    self.handleTransformCatheterType = function handleTransformCatheterType(catheterType) {
        switch (catheterType) {
            case 'AVFistula':
                return $translate('vesselAssessment.vesselAssessments.component.AVFistula');
            case 'AVGraft':
                return $translate('vesselAssessment.vesselAssessments.component.AVGraft');
            case 'DoubleLumen':
                return $translate('vesselAssessment.vesselAssessments.component.DoubleLumen');
            case 'Permanent':
                return $translate('vesselAssessment.vesselAssessments.component.Permanent');
            default:
                return '';
        }
    };

    self.exportExcel = function () {
        console.log('exportExcel');

        let ths = ['序號', '建立日期', '造管種類', '造管部位', '造管醫院', '備註', '終止日期', '終止原因', '建立者', '修改者'];
        function getColumns(ary) {
            let thsStr = '';
            for (let i = 0; i < ths.length; i++) {
                thsStr += `<th>${ths[i]}</th>`;
            }
            return thsStr;
        }

        function getRows(ary) {
            let trsStr = '';
            let startDate = null; // 建立日期
            let catheterPosition = null; // 造管部位
            let catheterHospital = null; // 造管醫院
            let endDate = null; // 終止日期

            // 篩掉刪除的
            let rows = self.serviceData.filter(item => item.Status !== 'Deleted');

            for (let i = 0; i < rows.length; i++) {
                startDate = rows[i].StartDate ? moment(rows[i].StartDate).format('YYYY/MM/DD') : '未知';
                catheterPosition = $translate(`vesselAssessment.vesselAssessment.${rows[i].CatheterPosition.Side}`) + $translate(`vesselAssessment.vesselAssessment.${rows[i].CatheterPosition.Position}`);

                // 造管醫院，需區隔是否為手動輸入由 none 區分
                if (/^none/.test(rows[i].CatheterHospital)) {
                    catheterHospital = rows[i].CatheterHospital.substring(4, rows[i].CatheterHospital.length);
                } else {
                    catheterHospital = rows[i].CatheterHospital;
                }

                rows[i].Memo = rows[i].Memo || '';
                rows[i].EndReason = rows[i].EndReason || '';
                rows[i].ModifiedUserName = rows[i].ModifiedUserName || '';

                endDate = rows[i].EndDate ? moment(rows[i].EndDate).format('YYYY/MM/DD') : '未知';
                trsStr += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${startDate}</td>
                    <td>${self.handleTransformCatheterType(rows[i].CatheterType)}</td>
                    <td>${catheterPosition}</td>
                    <td>${catheterHospital}</td>
                    <td>${rows[i].Memo}</td>
                    <td>${endDate}</td>
                    <td>${rows[i].EndReason}</td>
                    <td>${rows[i].CreatedUserName}</td>
                    <td>${rows[i].ModifiedUserName}</td>
                </tr>
                `;
            }
            return trsStr;
        }

        // 組表格
        let excelTable = `
        <table id="excelTable">
            <thead>
                <tr>${getColumns()}</tr>
            </thead>
            <tbody>
                ${getRows()}
            </tbody>
        </table>
        `;

        // 匯出 excel
        $('#excelDiv').append(excelTable);
        let myTabel = $('#excelTable');
        myTabel.tableExport({
            fileName: `${self.patient.MedicalId}-血管通路紀錄`
        });
        $('#excelTable').remove();
    };

    self.goto = function goto(Id = null) {
        $state.go('vesselassessmentDetail', {
            vesselassessmentId: Id,
            patientId: $stateParams.patientId
        });
    };


    // 刪除詢問
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: [
                '$mdDialog', DialogController
            ],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: !$mdMedia('gt-sm'),
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
                VesselAssessmentService
                    .del(data.Id)
                    .then((q) => {
                        if (q.status === 200) {
                            self.refresh();
                        }
                    });
                mdDialog.hide(data);
            };
        }
    };

    self.goback = function goback() {
        // $state.go('summary', {}, { location: 'replace' });
        history.back();
    };

}

vesselassessmentEditCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    'VesselAssessmentService',
    '$mdToast',
    'SettingService',
    '$mdMedia',
    'showMessage',
    'PatientService',
    'Upload',
    'infoService',
    '$timeout',
    '$filter'
];

function vesselassessmentEditCtrl($window, $state, $stateParams, $mdDialog, $rootScope,
    VesselAssessmentService, $mdToast, SettingService, $mdMedia, showMessage, PatientService,
    Upload, infoService, $timeout, $filter) {
    const self = this;

    let $translate = $filter('translate');

    self.Url = SettingService.getServerUrl();
    self.user = SettingService.getCurrentUser();
    self.today = moment().format('YYYY-MM-DD');
    self.filename = 'body.png';
    self.data = {};
    self.useHospitalKeyIn = '';
    self.vesselassessmentId = $stateParams.vesselassessmentId;
    // self.CatheterHospitals = Object.prototype.hasOwnProperty.call(SettingService.getHospitalSettings().DialysisSetting, 'CatheterHospitals') ?
    //     SettingService.getHospitalSettings().DialysisSetting.CatheterHospitals : [];
    self.CatheterHospitals = SettingService.getHospitalSettings();
    // get by picture
    self.imagesData = [];
    self.loadingPicture = false;
    self.isFabOpen = false;

    // 辨識環境
    self.device = cordova.platformId === 'browser';
    console.log('va');


    let pictureSource;  // 设定图片来源
    let destinationType; // 选择返回数据的格式

    if (!self.device) {
        document.addEventListener('deviceready', onDeviceReady, false);
    }

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    // init
    self.$onInit = function $onInit() {
        // 需使用最新的 hospital setting，因此要重整
        infoService.reload().then(() => {
        }, () => {
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });

        if ($stateParams.vesselassessmentId) {
            self.loading = true;
            PatientService.getById($stateParams.patientId, true)
                .then((p) => {
                    self.patient = p.data;
                    VesselAssessmentService
                        .getById($stateParams.vesselassessmentId)
                        .then((q) => {
                            self.data = q.data;
                            self.useHospitalKeyIn = q.data.CatheterHospital.substring(4);
                            self.data.CatheterHospital = q.data.CatheterHospital.substring(0, 4);
                            if (self.data.StartDate) {
                                self.startDate = moment(self.data.StartDate).toDate();
                            }
                            if (self.data.EndDate) {
                                self.endDate = moment(self.data.EndDate).toDate();
                            }
                            if (self.data.Images.length > 0) {
                                VesselAssessmentService
                                    .getImages(self.data.Images)
                                    .then((d) => {
                                        self.imagesData = d.data;
                                    });
                            }

                            // 初始化人體圖
                            self.handleSetUpImage(self.data.CatheterPosition.Side,
                                self.data.CatheterPosition.Position);

                            self.loading = false;
                            self.isError = false;
                        }, () => {
                            self.loading = false;
                            self.isError = true;
                        });
                }, () => {
                    self.loading = false;
                    self.isError = true;
                });
        } else {
            PatientService
                .getById($stateParams.patientId, true)
                .then((p) => {
                    self.patient = p.data;
                });
        }
    };

    // click 造管種類
    self.clickTubingTypes = function clickTubingTypes(type) {
        self.data.CatheterType = type;

        if ((type === 'Permanent' && typeof (self.data.CatheterPosition) !== 'undefined') && self.data.CatheterPosition.Position) {
            switch (self.data.CatheterPosition.Position) {
                case 'forearm': // 前臂
                    self.data.CatheterPosition.Position = null;
                    self.filename = 'body.png';
                    break;
                case 'upperArm': // 上臂
                    self.data.CatheterPosition.Position = null;
                    self.filename = 'body.png';
                    break;
                case 'thigh': // 大腿
                    self.data.CatheterPosition.Position = null;
                    self.filename = 'body.png';
                    break;
                case 'calf': // 小腿
                    self.data.CatheterPosition.Position = null;
                    self.filename = 'body.png';
                    break;
                default:
                    break;
            }
        }
    };

    // 造管部位
    self.clickTubingPosition = function clickTubingPosition(Side, Position) {
        if (self.data.CatheterPosition != null) {
            self.data.CatheterPosition.Side = Side;
            self.data.CatheterPosition.Position = Position;
        } else {
            self.data.CatheterPosition = {};
            self.data.CatheterPosition.Side = Side;
            self.data.CatheterPosition.Position = Position;
        }
        self.handleSetUpImage(Side, Position);
    };

    // 初始化圖片
    self.handleSetUpImage = function handleSetUpImage(Side, Position) {
        let filename = '';

        if (!Side && !Position) {
            filename = 'body';
        }

        if (Side === 'left') {
            filename += 'right';
        } else if (Side === 'right') {
            filename += 'left';
        } else {
            filename = 'body';
        }

        if (Position === 'forearm') {
            filename += 'forearm';
        } else if (Position === 'upperArm') {
            filename += 'upper-arm';
        } else if (Position === 'thigh') {
            filename += 'thigh';
        } else if (Position === 'calf') {
            filename += 'calf';
        } else if (Position === 'IJV') { // 內頸靜脈
            filename += 'jugular';
        } else if (Position === 'SV') { // 鎖骨下靜脈
            filename += 'subclavian';
        } else if (Position === 'FV') { // 股靜脈
            filename += 'femoral';
        }

        filename += '.png';

        self.filename = filename;
    };

    // 未知開始時間
    self.startDateUnknown = function startDateUnknown() {
        self.startDate = null;
    };

    function onLoadImageFail(message) {
        // showMessage('拍照失败，原因：' + message, null, '警告');
        showMessage($translate('vesselAssessment.vesselAssessment.component.imageFail', { errMessage: message }));
    }


    function onLoadImageSussess(obj) {
        $timeout(() => {
            self.loadingPicture = true;
        });
        const photo = {
            Image: obj
        };
        VesselAssessmentService
            .postImages(photo)
            .then((q) => {
                if (q.status === 200) {
                    self.imagesData.push(q.data[0]);
                    self.loadingPicture = false;
                    showMessage($translate('vesselAssessment.vesselAssessment.component.uploadSuccess'));
                }
            }, (q) => {
                self.loadingPicture = false;
                showMessage($translate('vesselAssessment.vesselAssessment.component.uploadFail'));
            });
    }

    let imageUpload = () => {
        if (self.data.Photo) {
            $timeout(() => {
                self.loadingPicture = true;
            });
            Upload.base64DataUrl(self.data.Photo).then(
                (x) => {
                    // 因為是多筆上傳，這裡用for
                    for (let ime of x) {
                        const photo = {
                            Image: ime.split(',')[1]
                        };
                        VesselAssessmentService
                            .postImages(photo)
                            .then((q) => {
                                if (q.status === 200) {
                                    self.imagesData.push(q.data[0]);
                                    self.loadingPicture = false;
                                    showMessage($translate('vesselAssessment.vesselAssessment.component.uploadSuccess'));
                                }
                            }, () => {
                                self.loadingPicture = false;
                                showMessage($translate('vesselAssessment.vesselAssessment.component.uploadFail'));
                            });
                    }
                }
            );
        }
    };

    // 上傳圖片
    self.uploadImage = function uploadImage() {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.DATA_URL,
                sourceType: pictureSource.CAMERA,
                correctOrientation: true
            });
        } else {
            imageUpload();
        }
    };

    self.openDocument = () => {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.DATA_URL,
                sourceType: pictureSource.SAVEDPHOTOALBUM
            });
        }
    };

    self.openImage = (image) => {
        let url;

        if (image) {
            if (location.port !== null) {
                url = self.Url + '/Upload/GetImage/' + image;
            }

            // plugin InAppBrowser 在deploy時，會影響原生的 window.open，所以要多加判斷
            if (cordova.InAppBrowser) {
                // cordova
                cordova.InAppBrowser.open(url, '_system', 'location=yes');
                // $window.open(url, '_system', 'location=yes'); // 寫這樣也可以，應該是_blank會衝突
                console.log('cordova browser');
            } else {
                // browser
                window.open(url, '', '_blank');
                console.log('一般browser');
            }

        }
    };

    self.deleteImage = function ($event, idx) {
        $mdDialog.show({
            controller: [
                '$mdDialog', DialogController
            ],
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
                self
                    .imagesData
                    .splice(idx, 1);
                mdDialog.hide();
            };
        }
    };
    self.isSaving = false;
    self.submit = function submit(e) {
        self.isSaving = true;
        if (e) {
            e.currentTarget.disabled = true;
        }
        self.data.Images = [];

        if (self.imagesData && self.imagesData.length > 0) {
            self
                .imagesData
                .map(x => self.data.Images.push(x.Image));
        }

        if (self.data.CatheterHospital === 'none') {
            self.data.CatheterHospital += self.useHospitalKeyIn;
            console.log('CatheterHospital', self.data.CatheterHospital);
        }

        // 處理日期
        if (self.startDate) {
            self.data.StartDate = moment(self.startDate);
        } else {
            self.data.StartDate = null;
        }
        if (self.endDate) {
            self.data.EndDate = moment(self.endDate);
        } else {
            self.data.EndDate = null;
        }

        if ($stateParams.vesselassessmentId) {
            self.data.ModifiedUserId = self.user.Id;
            self.data.ModifiedUserName = self.user.Name;

            VesselAssessmentService
                .put(self.data)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('vesselAssessment.vesselAssessment.component.editSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('vesselAssessment.vesselAssessment.component.editFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
        } else {
            self.data.PatientId = $stateParams.patientId;
            self.data.HospitalId = self.user.HospitalId;
            self.data.CreatedUserId = self.user.Id;
            self.data.CreatedUserName = self.user.Name;

            VesselAssessmentService
                .post(self.data)
                .then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('vesselAssessment.vesselAssessment.component.createSuccess'));
                        history.back(-1);
                    }
                }).catch((err) => {
                    showMessage($translate('vesselAssessment.vesselAssessment.component.createFail'));
                }).finally(() => {
                    self.isSaving = false;
                });
        }
    };

    self.goback = function goback() {
        $window
            .history
            .back();
    };

}

import changGung from './summaryContentChangGung.html'; // 長庚透析連續型表單

import '../../static/barCode';

import './summaryContent1.less';

angular.module('app').component('summaryContent1', {
    bindings: {
        data: '<',
        patient: '<',
        deviation: '<',
        catheter: '<',
        clicked: '=',
        columnTd: '=',
        whiteframe: '=?'
    },
    template: changGung,
    controller: SummaryContent1Controller
})
    .filter('AnticoagulantValue', () => function AnticoagulantValue(value) { // 抗凝劑
        return value.join('/');
    })
    .filter('rhMode', ['$filter', $filter => function rhMode(value) { // RH 轉
        const $translate = $filter('translate');
        switch (value) {
            case '+':
                return $translate('summaryContent.RHPos');
            case '-':
                return $translate('summaryContent.RHNeg');
            default:
                return $translate('summaryContent.RHUnknown');
        }
    }])
    .filter('TdRange', () => function range(n) {
        return _.range(0, n);
    })
    .filter('catheterType', ['$filter', ($filter) => {
        return (catheterType) => {
            const $translate = $filter('translate');

            switch (catheterType) {
                case 'AVFistula':
                    return $translate('overview.component.AVFistula');
                case 'AVGraft':
                    return $translate('overview.component.AVGraft');
                case 'Permanent':
                    return $translate('overview.component.Permanent');
                case 'DoubleLumen':
                    return $translate('overview.component.DoubleLumen');
                default:
                    return $translate('overview.component.typeError');
            }
        };
    }])
    .filter('catheterSide', ['$filter', ($filter) => {
        return (side) => {
            const $translate = $filter('translate');

            switch (side) {
                case 'right':
                    return $translate('vesselAssessment.vesselAssessment.right');
                case 'left':
                    return $translate('vesselAssessment.vesselAssessment.left');
                default:
                    return side;

            }
        };
    }])
    .filter('catheterPosition', ['$filter', ($filter) => {
        return (position) => {
            const $translate = $filter('translate');

            switch (position) {
                case 'forearm':
                    return $translate('vesselAssessment.vesselAssessment.forearm');
                case 'upperArm':
                    return $translate('vesselAssessment.vesselAssessment.upperArm');
                case 'thigh':
                    return $translate('vesselAssessment.vesselAssessment.thigh');
                case 'calf':
                    return $translate('vesselAssessment.vesselAssessment.calf');
                case 'IJV':
                    return $translate('vesselAssessment.vesselAssessment.IJV');
                case 'SV':
                    return $translate('vesselAssessment.vesselAssessment.SV');
                case 'FV':
                    return $translate('vesselAssessment.vesselAssessment.FV');
                default:
                    return position;
            }
        };
    }]);

SummaryContent1Controller.$inject = ['$filter', '$mdDialog', '$state', '$stateParams', 'dialysisService', 'showMessage', '$scope', 'SettingService', 'userService', 'postAssessmentService', 'shiftIssueService', 'labexamService', 'assessmentService'];
function SummaryContent1Controller($filter, $mdDialog, $state, $stateParams, dialysisService, showMessage, $scope, SettingService, userService, postAssessmentService, shiftIssueService, labexamService, assessmentService) {
    console.log('enter summary content component 1');
    const self = this;
    console.log('data', self.data);
    console.log('patient', self.patient);
    // debugger;

    let $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();
    const patientId = self.patient.Id; // $stateParams.patientId
    let headerId = $stateParams.headerId;
    self.whiteframe = true;

    if (self.data.DialysisHeader.CheckStaff) {
        self.checkStaff = Object.keys(self.data.DialysisHeader.CheckStaff)[0];
    }
    // 表單標題
    self.dialysisRecordTable = SettingService.getCurrentHospital().FormTitle;

    document.getElementsByTagName('body')[0].onafterprint = function () {
        self.whiteframe = true;
    };

    let sheetTemplateName = SettingService.getCurrentHospital().SheetTemplate ? SettingService.getCurrentHospital().SheetTemplate.toUpperCase() : ''; // 轉大寫
    self.$onInit = function $onInit() {
        // debugger;
        getLastDialysisRecord();
    };

    function getLastDialysisRecord() {
        dialysisService.getLast(patientId, true).then((res) => {
            // debugger;
            self.serviceData = res.data;
            // checkCanCreate();
        });
    }

    function checkCanCreate() {
        if (self.serviceData && !self.serviceData.DialysisHeader.EndTime && moment(self.serviceData.DialysisHeader.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
            self.canCreate = false;
        } else {
            self.canCreate = true;
        }
    }

    self._handleCreateCheck = function _handleCreateCheck(event) {
        self.canCreate = false;
        $scope.$emit('loadSummaryContent', true);
        self.loading = true;
        dialysisService.getCreateCheck(patientId).then((res) => {
            let createCheck;
            if (res.status === 200) {
                createCheck = res.data;
                // debugger;
                // 當 DialysisPrescriptionCount > 0 && VesselAssessmentCount > 0 就開表
                if (createCheck.DialysisPrescriptionCount > 0 && createCheck.VesselAssessmentCount > 0) {
                    postDialysis();
                } else {
                    $mdDialog.show({
                        controller: ['$mdDialog', handleCreateDialogController],
                        templateUrl: 'confirm.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controllerAs: 'vm'
                    }).then(() => { }, () => {
                        self.loading = false;
                        self.canCreate = true;
                    });
                }
            } else {
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    function handleCreateDialogController(mdDialog) {
        const vm = this;
        vm.hide = function hide() {
            mdDialog.hide();
        };

        vm.cancel = function cancel() {
            mdDialog.cancel();
        };

        vm.ok = function ok() {
            postDialysis();
            mdDialog.hide();
        };
    }

    function postDialysis() {
        self.loading = true;
        dialysisService.post(patientId).then((q) => {
            if (q.status === 200) {
                showMessage($translate('allDialysisRecords.component.formCreateSuccess'));
                // $state.go('overview', { patientId: self.patientId, headerId: q.data.Id }, { reload: true });
                // go to summary with the latest result
                // TODO: check for bugs
                // dialysisService.getLast(self.patientId, false).then((res) => {
                //     if (res.data.Count > 0) {
                //         return res.data.DialysisHeader.Id;
                //     }
                //     return 'none';
                // }).then((headerId) => {
                //     $state.go('summary', { patientId: self.patientId, headerId }, { notify: true, reload: true, location: 'replace' });
                // });
                $state.go('summary', { patientId, headerId: 'last' }, { notify: true, reload: true, location: 'replace' });
            } else {
                self.loading = false;
                self.canCreate = true;
                showMessage($translate('allDialysisRecords.component.formCreateFail'));
            }
        }, () => {
            self.loading = false;
            self.canCreate = true;
            showMessage($translate('allDialysisRecords.component.formCreateFail'));
        });
    }

    self.columnTd = 0;
    // 算出欄位，是否有少於8欄
    if (self.data.DialysisData.length <= 8) {
        let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
        self.columnTd = range;
    }

    self.columnTd2 = 0;
    // 算出欄位，是否有少於13欄
    if (self.data.DialysisData.length <= 13) {
        let range2 = Array.from(Array(13 - self.data.DialysisData.length).keys());
        self.columnTd2 = range2;
    }

    self.columnTd3 = 0;
    // 算出欄位，是否有少於18欄
    if (self.data.DoctorNotes.length <= 18) {
        let range3 = Array.from(Array(18 - self.data.DoctorNotes.length).keys());
        self.columnTd3 = range3;
    }

    // 血管通路
    self.VesselAssessment = '';
    if (self.data.DialysisHeader.VesselAssessments.length > 0) {
        if (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterType === 'AVFistula' || self.data.DialysisHeader.VesselAssessments[0].Data.CatheterType === 'AVGraft') {
            switch (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position) {
                case 'forearm':
                    self.VesselAssessment = '前臂(含腕部)';
                    break;
                case '1':
                    self.VesselAssessment = '前臂(含腕部)';
                    break;
                case 'upperArm':
                    self.VesselAssessment = '上臂(含肘部)';
                    break;
                case '2':
                    self.VesselAssessment = '上臂(含肘部)';
                    break;
                case 'thigh':
                    self.VesselAssessment = '大腿';
                    break;
                case '3':
                    self.VesselAssessment = '大腿';
                    break;
                case 'calf':
                    self.VesselAssessment = '小腿';
                    break;
                case '4':
                    self.VesselAssessment = '小腿';
                    break;
                case 'IJV':
                    self.VesselAssessment = '內頸靜脈';
                    break;
                case 'SV':
                    self.VesselAssessment = '鎖股下靜脈';
                    break;
                case 'FV':
                    self.VesselAssessment = '股靜脈';
                    break;
                default:
                    self.VesselAssessment = self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position;
                    break;
                }
        } else {
            switch (self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position) {
                case 'forearm':
                    self.VesselAssessment = '前臂(含腕部)';
                    break;
                case 'upperArm':
                    self.VesselAssessment = '上臂(含肘部)';
                    break;
                case 'thigh':
                    self.VesselAssessment = '大腿';
                    break;
                case 'calf':
                    self.VesselAssessment = '小腿';
                    break;
                case 'IJV':
                    self.VesselAssessment = '內頸靜脈';
                    break;
                case '1':
                    self.VesselAssessment = '內頸靜脈';
                    break;
                case 'SV':
                    self.VesselAssessment = '鎖股下靜脈';
                    break;
                case '2':
                    self.VesselAssessment = '鎖股下靜脈';
                    break;
                case 'FV':
                    self.VesselAssessment = '股靜脈';
                    break;
                case '3':
                    self.VesselAssessment = '股靜脈';
                    break;
                default:
                    self.VesselAssessment = self.data.DialysisHeader.VesselAssessments[0].Data.CatheterPosition.Position;
                    break;
                }
        }
    }

    self.CatheterType = '';

    // 洗前評估
    // when it has assessment records
    self.preAssessment = [];
    if (self.data.AssessmentRecords.length > 0) {
        // sort records by record time
        self.data.AssessmentRecords = _.sortBy(self.data.AssessmentRecords, function (o) { return o.RecordTime; });

        // 洗前評估
        // filter out pre-assessment records
        let preAssessmentRecords = _.filter(self.data.AssessmentRecords, {
            'Type': 'pre'
        });
        let preAssessmentCount = preAssessmentRecords.length;
        // console.log('preAssessmentRecords:', preAssessmentRecords);
        // console.log('preAssessmentCount:', preAssessmentCount);
        // initialize pre assessment object
        // self.preAssessment = {};
        let assItem = '';

        // if there is pre assessment record
        if (preAssessmentCount > 0) {

            // 取得評估資料--洗前
            assessmentService.getByType('pre').then((resp1) => {
                self.assessments_pre = resp1.data.Items;
                self.assessments_pre.forEach((i) => {
                    // console.log(i.Item);
                    if (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item]) {
                        assItem = i.Item + ' : ' + (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item] ? preAssessmentRecords[preAssessmentCount - 1].Items[i.Item].toString() : '');
                        self.preAssessment.push(assItem);
                        if (i.Item === 'ECMO') {
                            self.CatheterType = 'V ECMO';
                        }
                    }
                });
                // 文字性評估描述欄
                if (resp1.data.Description !== null) {
                    self.preAssessment.push(resp1.data.Description);
                }
            });
            // // // get the latest record
            // // self.preAssessment.Previous = 'Bleeding : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['Bleeding'] ? preAssessmentRecords[preAssessmentCount - 1].Items['Bleeding'][0] : '');
            // // self.preAssessment.Current = 'Bruit : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['Bruit'] ? preAssessmentRecords[preAssessmentCount - 1].Items['Bruit'][0] : '');
            // // self.preAssessment = preAssessmentRecords[preAssessmentCount - 1].Items;
            // assItem = '前次透析後狀況 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'].toString() : '');
            // self.preAssessment.push(assItem);
            // assItem = '外觀 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['外觀'] ? preAssessmentRecords[preAssessmentCount - 1].Items['外觀'].toString() : '');
            // self.preAssessment.push(assItem);
            // assItem = '本次透析前狀況 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'].toString() : '');
            // self.preAssessment.push(assItem);
            // assItem = '血流量 : ' + (preAssessmentRecords[preAssessmentCount - 1].Items['血流量'] ? preAssessmentRecords[preAssessmentCount - 1].Items['血流量'].toString() : '');
            // self.preAssessment.push(assItem);
            // // // debugger;
            // // // self.preAssessment = preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'];
            console.log('preAssessment:', self.preAssessment);
        }
    }

    // 檢驗檢查
    self.labexamData = [];
    // self.labexamDataArray = [];
    labexamService.getByPatientId(patientId, 90, false)
    .then((q) => {
        console.log('檢驗檢查 q.data', q.data);
        self.labexamData = q.data.filter(x => x.Status === 'Normal');
        // self.deletedItemsLength = q.data.filter(x => x.Status === 'Deleted').length;
        // 抓取全部日期，只到日期 [2017-10-22, 2017-09-16, 2017-09-14]
        self.checkTimeList = self.labexamData.sort((a, b) => {
            if (a.CheckTime < b.CheckTime) return 1;
            return -1;
        }).map(i => moment(i.CheckTime).format('YYYY/MM/DD HH:mm')).filter((item, pos, ary) => {
            return !pos || item !== ary[pos - 1];
        });
        // console.log('checkTimeList', self.checkTimeList);

        // let cellstr = 'BUN,Cr,Na,K,Cl,P,Hct,Hb,Plate';
        let cellstr = 'Bun,Creatinine,Na(Sodium),K(Potassium),Cl(Chloride),Inorganic P,Hematocrit,Hemoglobin,Platelets';
        let cellArray = cellstr.split(',');

        self.tArray = []; // 先宣告一維
        for (let k = 0; k < 4; k++) { // 一維長度為i,i為變數，可以根據實際情況改變
            self.tArray[k] = []; // 宣告二維，每一個一維陣列裡面的一個元素都是一個陣列；
            for (let j = 0; j < 9; j++) { // 一維陣列裡面每個元素陣列可以包含的數量p，p也是一個變數；
                self.tArray[k][j] = getLabexamData(self.checkTimeList[k], cellArray[j]); // 這裡將變數初始化，我這邊統一初始化為空，後面在用所需的值覆蓋裡面的值
            }
        }
        console.log('tArray', self.tArray);
    });

    function getLabexamData(ind, item) {
        let t = '';
        if (self.labexamData.length > 0) {
            self.labexamData.forEach((j) => {
                let newDate = new Date(j.CheckTime);
                let indDate = new Date(ind);
                if (newDate.toLocaleDateString().substring(0, 10) === indDate.toLocaleDateString().substring(0, 10) && j.Name.toUpperCase() === item.toUpperCase()) {
                    t = j.Value;
                }
            });
        }
        return t;
    }

    // 交班事項
    self.shiftIssueData = [];
    shiftIssueService.getByPatientId(patientId, false).then((res) => {
        self.shiftIssueData = _.filter(res.data, { 'Status': 'Normal' });
        console.log('self.shiftIssueData', self.shiftIssueData);
        // get deleted item count
        // self.deletedItemsLength = _.filter(res.data, { 'Status': 'Deleted' }).length;
        // self.isError = false;
    }, (err) => {
        // self.isError = true;
        // console.log('error: ' + JSON.stringify(err));
    }).finally(() => {
        // self.loading = false;
    });


    // 呼吸機最後一筆資料 且 totalUF != null
    self.lastRecord = null;
    self.data.DialysisData.forEach((x) => {
        if (x.TotalUF !== null) {
            self.lastRecord = x;
        }
    });
    console.log('呼吸機最後一筆資料 且 totalUF != null', self.lastRecord);

    // 實際脫水量
    if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
        self.realUF = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
    }

    // 結束體重
    if (self.data.DialysisHeader && (self.data.DialysisHeader.StandardWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
        self.WeightAfter = Math.round((self.data.DialysisHeader.WeightAfterDialysis - self.data.DialysisHeader.StandardWeight) * 100) / 100;
    }

    // 透析後脫水誤差
    if (self.lastRecord && self.lastRecord.TotalUF) {
        self.diffUF = Math.round((self.lastRecord.TotalUF - self.realUF) * 100) / 100;
    }

    // Weight loss 透析前體重 - 透析後體重
    if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
        self.Weightloss = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
    }

    // 實際透析時間 = 開始 - 結束
    self.dialysisRealTime = null;
    if (self.data.DialysisHeader.DialysisDataLastTime && self.data.DialysisHeader.DialysisDataFirstTime) {
        let diff = moment(self.data.DialysisHeader.DialysisDataLastTime).diff(self.data.DialysisHeader.DialysisDataFirstTime);
        let duration = moment.duration(diff);
        self.dialysisRealTime = duration.hours() + '時' + duration.minutes() + '分';
    }

    // Weight gain 透析前體重 - 處方的標準體重
    self.WeightGain = null;
    if (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.StandardWeight) {
        self.WeightGain = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.Prescription.StandardWeight) * 100) / 100;
    }

    // Hct filter last CheckTime Value
    if (self.data.LabExams.length > 0) {
        self.Hct = null;
        self.Hb = null;
        let hct = self.data.LabExams.filter(x => x.Name === 'Hct').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
        if (hct.length > 0) {
            self.Hct = hct.reduce(x => x);
        }
        let hb = self.data.LabExams.filter(x => x.Name === 'Hb').sort(x => x.CheckTime).slice(self.data.LabExams.length - 1);
        if (hb.length > 0) {
            self.Hb = hb.reduce(x => x);
        }
    }

    // barcode create 128 core
    if (document.querySelectorAll('.summary [id^=barcode]').length > 0) {
        // debugger;
        JsBarcode('#barcode2', self.patient.MedicalId, {
            width: 2,
            height: 30,
            displayValue: false,
            margin: 10
        });

        JsBarcode('#barcode3', self.patient.MedicalId, {
            width: 2,
            height: 30,
            displayValue: false,
            margin: 10
        });
    }

    // get doctor employee id by user id
    function getDoctorEmployeeId() {
        // debugger;
        let userId = self.data.DialysisHeader.Prescription.ModifiedUserId ? self.data.DialysisHeader.Prescription.ModifiedUserId : self.data.DialysisHeader.Prescription.CreatedUserId;
        // self.employeeId = null;
        userService.getById(userId).then((res) => {
            self.doctorEmployeeId = res.data.EmployeeId;
        });
    }

    function getNurseEmployeeId() {
        let userId = self.data.DialysisHeader.OnUserId;
        // self.employeeId = null;
        userService.getById(userId).then((res) => {
            self.nurseEmployeeId = res.data.EmployeeId;
        });
    }

    // 洗前評估
    // let assessment = null;
    // if (self.data.AssessmentRecords.length > 0) {
    //     self.data.AssessmentRecords.forEach((a) => {
    //         if (a.Type === 'pre' && assessment === null) {
    //             assessment = a.items;
    //             console.log('assessment:', assessment);
    //         }
    //     });
    // }
    // if (assessment === null) {
    //     assessment = [];
    // }


    // 洗後評估
    /*
    function postDialysisAssessment() {
        postAssessmentService.getByDialysisId(headerId).then((res) => {
            if (res.data.Items) {
                // check if object exists
                self.complication = !!res.data.Items['Complication'] ? res.data.Items['Complication'] : res.data.Items['Complication'] = [];
                self.technicalComplication = !!res.data.Items['Technical complication'] ? res.data.Items['Technical complication'] : res.data.Items['Technical complication'] = [];
                self.nursingIntervention = !!res.data.Items['Nursing intervention'] ? res.data.Items['Nursing intervention'] : res.data.Items['Nursing intervention'] = [];
                self.healthEducation = !!res.data.Items['Health education'] ? res.data.Items['Health education'] : res.data.Items['Health education'] = [];
            }
            // debugger;
        });
    }*/
    // 評估處理
    /*
    let assessment = [];
    let reassessment = [];

    // if assessment record = 1
    if (self.data.AssessmentRecords.length === 1) {

        // get the items of the first record
        let fields = self.data.AssessmentRecords[0].Items;

        assessment = Object.keys(fields).map((key) => {
            return { type: key, name: fields[key].slice(0) };
        });

        // assessment
        self.pain = assessment.filter(x => x.type.toLowerCase() === 'pain').map(x => x.name)[0];
        self.chestDiscomfort = assessment.filter(x => x.type.toLowerCase() === 'chest discomfort').map(x => x.name)[0];
        self.dyspnea = assessment.filter(x => x.type.toLowerCase() === 'dyspnea').map(x => x.name)[0];
        self.Fever = assessment.filter(x => x.type.toLowerCase() === 'fever').map(x => x.name)[0];
        self.Headache = assessment.filter(x => x.type.toLowerCase() === 'headache').map(x => x.name)[0];
        self.Nausea = assessment.filter(x => x.type.toLowerCase() === 'nausea/vomit' || x.type.toLowerCase() === 'nausea/vomiting').map(x => x.name)[0];
        self.Sleep = assessment.filter(x => x.type.toLowerCase() === 'sleep disturbance').map(x => x.name)[0];
        self.Bleeding = assessment.filter(x => x.type.toLowerCase() === 'bleeding' || x.type.toLowerCase() === 'Prolonged bleeding').map(x => x.name)[0];
        self.Intching = assessment.filter(x => x.type.toLowerCase() === 'itching').map(x => x.name)[0];
        self.Engorged = assessment.filter(x => x.type.toLowerCase() === 'engorged' || x.type.toLowerCase() === 'engorged neck vein').map(x => x.name)[0];
        self.Pale = assessment.filter(x => x.type.toLowerCase() === 'pale').map(x => x.name)[0];
        self.Edema = assessment.filter(x => x.type.toLowerCase() === 'edema').map(x => x.name)[0];
        self.Poor = assessment.filter(x => x.type.toLowerCase() === 'poor oral intake').map(x => x.name)[0];
        self.Psychosocial = assessment.filter(x => x.type.toLowerCase() === 'psychosocial problem').map(x => x.name)[0];
        self.Other = assessment.filter(x => x.type.toLowerCase() === 'other').map(x => x.name)[0];
    }

    if (self.data.AssessmentRecords.length > 1) {
        // sort array according to CreatedTime
        self.data.AssessmentRecords = _.sortBy(self.data.AssessmentRecords, function (o) { return o.CreatedTime; });
        // get the items of the first record
        let fields = self.data.AssessmentRecords[0].Items;
        // get the items of the last record
        let fields2 = self.data.AssessmentRecords[self.data.AssessmentRecords.length - 1].Items;
        assessment = Object.keys(fields).map((key) => {
            return { type: key, name: fields[key].slice(0) };
        });
        reassessment = Object.keys(fields2).map((key) => {
            return { type: key, name: fields2[key].slice(0) };
        });
        // assessment
        self.pain = assessment.filter(x => x.type.toLowerCase() === 'pain').map(x => x.name)[0];
        self.chestDiscomfort = assessment.filter(x => x.type.toLowerCase() === 'chest discomfort').map(x => x.name)[0];
        self.dyspnea = assessment.filter(x => x.type.toLowerCase() === 'dyspnea').map(x => x.name)[0];
        self.Fever = assessment.filter(x => x.type.toLowerCase() === 'fever').map(x => x.name)[0];
        self.Headache = assessment.filter(x => x.type.toLowerCase() === 'headache').map(x => x.name)[0];
        self.Nausea = assessment.filter(x => x.type.toLowerCase() === 'nausea/vomit' || x.type.toLowerCase() === 'nausea/vomiting').map(x => x.name)[0];
        self.Sleep = assessment.filter(x => x.type.toLowerCase() === 'sleep disturbance').map(x => x.name)[0];
        self.Bleeding = assessment.filter(x => x.type.toLowerCase() === 'bleeding' || x.type.toLowerCase() === 'Prolonged bleeding').map(x => x.name)[0];
        self.Intching = assessment.filter(x => x.type.toLowerCase() === 'itching').map(x => x.name)[0];
        self.Engorged = assessment.filter(x => x.type.toLowerCase() === 'engorged' || x.type.toLowerCase() === 'engorged neck vein').map(x => x.name)[0];
        self.Pale = assessment.filter(x => x.type.toLowerCase() === 'pale').map(x => x.name)[0];
        self.Edema = assessment.filter(x => x.type.toLowerCase() === 'edema').map(x => x.name)[0];
        self.Poor = assessment.filter(x => x.type.toLowerCase() === 'poor oral intake').map(x => x.name)[0];
        self.Psychosocial = assessment.filter(x => x.type.toLowerCase() === 'psychosocial problem').map(x => x.name)[0];
        self.Other = assessment.filter(x => x.type.toLowerCase() === 'other').map(x => x.name)[0];

        // reassessment
        self.rePain = reassessment.filter(x => x.type.toLowerCase() === 'pain').map(x => x.name)[0];
        self.rechestDiscomfort = reassessment.filter(x => x.type.toLowerCase() === 'chest discomfort').map(x => x.name)[0];
        self.reDyspnea = reassessment.filter(x => x.type.toLowerCase() === 'dyspnea').map(x => x.name)[0];
        self.reFever = reassessment.filter(x => x.type.toLowerCase() === 'fever').map(x => x.name)[0];
        self.reHeadache = reassessment.filter(x => x.type.toLowerCase() === 'headache').map(x => x.name)[0];
        self.reNausea = reassessment.filter(x => x.type.toLowerCase() === 'nausea/vomit' || x.type.toLowerCase() === 'nausea/vomiting').map(x => x.name)[0];
        self.reSleep = reassessment.filter(x => x.type.toLowerCase() === 'sleep disturbance').map(x => x.name)[0];
        self.reBleeding = reassessment.filter(x => x.type.toLowerCase() === 'bleeding' || x.type.toLowerCase() === 'Prolonged bleeding').map(x => x.name)[0];
        self.reIntching = reassessment.filter(x => x.type.toLowerCase() === 'itching').map(x => x.name)[0];
        self.reEngorged = reassessment.filter(x => x.type.toLowerCase() === 'engorged' || x.type.toLowerCase() === 'engorged neck vein').map(x => x.name)[0];
        self.rePale = reassessment.filter(x => x.type.toLowerCase() === 'pale').map(x => x.name)[0];
        self.reEdema = reassessment.filter(x => x.type.toLowerCase() === 'edema').map(x => x.name)[0];
        self.rePoor = reassessment.filter(x => x.type.toLowerCase() === 'poor oral intake').map(x => x.name)[0];
        self.rePsychosocial = reassessment.filter(x => x.type.toLowerCase() === 'psychosocial problem').map(x => x.name)[0];
        self.reOther = reassessment.filter(x => x.type.toLowerCase() === 'other').map(x => x.name)[0];
    }


    // vascular access
    self.inflammation = assessment.filter(x => x.type.toLocaleLowerCase() === 'inflammation').map(x => x.name)[0];
    self.thrill = assessment.filter(x => x.type.toLocaleLowerCase() === 'thrill').map(x => x.name)[0];
    self.bruit = assessment.filter(x => x.type.toLocaleLowerCase() === 'bruit').map(x => x.name)[0];

    // self.continue = assessment.filter(x => x.type.toLocaleLowerCase() === 'continue').map(x => x.name)[0];
    // self.systolic = assessment.filter(x => x.type.toLocaleLowerCase() === 'systolic').map(x => x.name)[0];
    */
    // 抓異常項目子集合
    self.AbnormalItems = [];
    if (self.data.APOs && self.data.APOs.some(x => x.AbnormalItem)) {
        self.data.APOs.map(x => {
            self.AbnormalItems.push(x.AbnormalItem);
        });
    }

    // piyavate
    // get the catheter volume when catheter type is 'Permanent' or 'DoubleLumen'
    function getCatheterVolume() {
        // get vessel assessment record count
        let vesselAssessmentCount = self.data.DialysisHeader.VesselAssessments.length;
        // if vessel assessment record is greater than 0
        if (vesselAssessmentCount > 0) {
            // get the latest vessel assessment record
            let lastVesselAssessmentRecord = self.data.DialysisHeader.VesselAssessments[vesselAssessmentCount - 1];
            // get the catheter type (Permanent, DoubleLumen, AVFistula, Avgraft)
            let catheterType = lastVesselAssessmentRecord.Data.CatheterType;
            // check if catheterType = Permanent or DoubleLumen (unit in ml)
            if (catheterType === 'Permanent' || catheterType === 'DoubleLumen') {
                return {
                    'ArteryCatheter': lastVesselAssessmentRecord.ArteryCatheter,
                    'VeinCatheter': lastVesselAssessmentRecord.VeinCatheter
                };
            }
            return 0;
        }
        return 0;
    }

    // if it contains 'Other' then change it to '其它'
    function checkForOther(assessmentArray, otherValue = '') {
        if (assessmentArray) {
            // if it contains 'Other'
            if (assessmentArray.includes('Other')) {
                let indexOfOther = assessmentArray.indexOf('Other');

                // 'Other' is in the second last position
                if (indexOfOther !== assessmentArray.length - 1) {
                    assessmentArray[indexOfOther] = otherValue === '' ? '其它：' + assessmentArray[assessmentArray.length - 1] : '異常：' + assessmentArray[assessmentArray.length - 1];
                    assessmentArray.splice(assessmentArray.length - 1, 1);
                } else {
                    // 'Other' is in last position
                    assessmentArray[indexOfOther] = otherValue === '' ? '其它' : '異常';
                }
            }
        }
    }

    // const index = $stateParams.index;
    // self.currentDataHasTotalUF = []; // 抓最後一筆含有 TotalUF 的machine data
    // self.currentDataHasDialysisTime = []; // 抓最後一筆含有 DialysisTime 的machine data
    // let intCurrentDataCount = -1;
    // self.strPunctureNurse = null; // Puncture nurse
    // self.strCareNurse = []; // Care nurse
    // self.strOffNurse = null; // Off nurse
    // self.strCatheter = '(次)'; // AV針的單位
    // self.startTimeBloodTrans = null; // 抓第一筆開始輸血時間
    // self.endTimeBloodTrans = null; // 抓結束最後一筆輸血時間
    // self.endTransfusionReaction = null; // 抓結束最後一筆輸血反應

    // self.currentPatient = self.patient;

    // 讀該筆資料
    // self.currentHeader = self.data.DialysisHeader;
    // self.currentData = self.data.DialysisData;
    // self.currentNursingRecord = self.data.NursingRecord;
    // const currentBloodTrans = self.data.BloodTransfusions;
    // 醫囑少資料
    // self.currentDoctorNote = self.data.DoctorNote;
    // console.log(self.currentDoctorNote);
    // 給藥
    // self.currentOrderRecord = self.data.OrderRecord;

    // 輸血只要以下不要全部撈資料
    // if (self.data.BloodTransfusions.length > 0) {
    //     self.data.endTimeBloodTrans = currentBloodTrans[currentBloodTrans.length - 1].EndTime;
    //     self.data.startTimeBloodTrans = currentBloodTrans[0].StartTime;
    //     self.data.endTransfusionReaction = currentBloodTrans[currentBloodTrans.length - 1].TransfusionReaction;
    // }


    // self.totalCount = self.data.Count;
    // self.currentIndex = self.data.Index;// (self.totalCount > 0) ? 1 : 0;
    // self.loading = false;
    // 計算有幾筆
    // intCurrentDataCount = self.data.DialysisData.length;

    // foundCareNurse();

    // found Care Nurse (為多筆可能)。 Puncture nurse， Off nurse
    // function foundCareNurse() {
    //     if (intCurrentDataCount > 0) {
    //         // 抓最後一筆含有 TotalUF 的machine data
    //         self.currentDataHasTotalUF = self.data.DialysisData.filter(x => x.TotalUF !== null)
    //             .reverse()[0];
    //         // 抓取最後一筆透析時間
    //         self.currentDataHasDialysisTime = self.data.DialysisData.filter(x => x.DialysisTime !== null)
    //             .reverse()[0];

    //         self.strPunctureNurse = self.data.DialysisData[0].CreatedUserName;
    //         if (intCurrentDataCount === 1) {
    //             if (self.data.DialysisHeader.EndTime) {
    //                 self.strOffNurse = self.strPunctureNurse;
    //                 // 2016/01/30 by Andy 靖綺說只有一筆時, care 不出現 (蘇奕華)
    //             }
    //         }
    //         if (intCurrentDataCount === 2) {
    //             if (self.data.DialysisHeader.EndTime) {
    //                 if (self.data.DialysisData[1].ModifiedUserName) {
    //                     self.strOffNurse = self.data.DialysisData[1].ModifiedUserName;
    //                     self.strCareNurse.push(self.data.DialysisData[1].ModifiedUserName);
    //                 } else {
    //                     self.strOffNurse = self.data.DialysisData[1].CreatedUserName;
    //                     self.strCareNurse.push(self.data.DialysisData[1].CreatedUserName);
    //                 }
    //             }
    //         }
    //         if (intCurrentDataCount > 2) {
    //             for (let i = 0, idx = (intCurrentDataCount - 1); i < idx; i += 1) {
    //                 // 是否有修改者
    //                 if (!self.data.DialysisData[i].ModifiedUserName) {
    //                     // 無相同的姓名
    //                     if (self.strCareNurse.findIndex(x => x === self.data.DialysisData[i].CreatedUserName)) {
    //                         self.strCareNurse.push(self.data.DialysisData[i].CreatedUserName);
    //                     }
    //                 } else if (self.strCareNurse.findIndex(x => x === self.data.DialysisData[i].ModifiedUserName)) {
    //                     self.strCareNurse.push(self.data.DialysisData[i].ModifiedUserName);
    //                 }
    //             }
    //         }
    //         // 關表狀態
    //         if (self.data.DialysisHeader.EndTime) {
    //             if (self.currentDataHasDialysisTime.ModifiedUserName && self.currentDataHasDialysisTime) {
    //                 self.strOffNurse = self.currentDataHasDialysisTime.ModifiedUserName;
    //             } else {
    //                 self.strOffNurse = self.currentDataHasDialysisTime.CreatedUserName;
    //             }
    //             // 是否有修改者
    //         } else if (!self.currentDataHasDialysisTime.ModifiedUserName && self.currentDataHasDialysisTime) {
    //             // 無相同的姓名
    //             if (self.strCareNurse.findIndex(x => x === self.data.DialysisData[intCurrentDataCount - 1].CreatedUserName)) {
    //                 self.strCareNurse.push(self.data.DialysisData[intCurrentDataCount - 1].CreatedUserName);
    //             }
    //         } else if (self.currentDataHasDialysisTime) {
    //             if (self.strCareNurse.findIndex(x => x === self.data.DialysisData[intCurrentDataCount - 1].ModifiedUserName)) {
    //                 self.strCareNurse.push(self.data.DialysisData[intCurrentDataCount - 1].ModifiedUserName);
    //             }
    //         }
    //     }
    //     // array => string;
    //     self.strCareNurse = self.strCareNurse.join();
    // }

    let arr = self.data.DialysisData.filter(x => x.MacAddress).map(x => x.MacAddress);
    if (arr.length > 0) {
        self.lastMacAddress = arr[arr.length - 1].slice(-6);
    }

    self.calculateActualTime = function () {
        if (self.data.StartTime && self.data.EndTime) {
            moment(self.data.EndTime).diff(self.data.StartTime).format('HH:mm');
        }
    };

    self.gotoOverview = function goto() {
        $state.go('overview', { headerId: self.data.DialysisHeader.Id });
        self.clicked = true;
    };
    self.gotoNursingRecords = function goto() {
        $state.go('nursingRecord', { patientId, headerId: self.data.DialysisHeader.Id });
        self.clicked = true;
    };
    self.gotoAssessment = function goto() {
        $state.go('assessment', { patientId, headerId: self.data.DialysisHeader.Id });
        self.clicked = true;
    };
    self.gotoMachineData = function goto() {
        $state.go('machineData', { patientId, headerId: self.data.DialysisHeader.Id });
        self.clicked = true;
    };
    self.gotoDoctorNote = function goto(event) {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        $state.go('doctorNote', { patientId, headerId: self.data.DialysisHeader.Id });
        self.clicked = true;
    };

    self.gotoBloodTransfusion = function () {
        $state.go('bloodTransfusion').then(() => {
            self.clicked = true;
        });
    };

    self.gotoPrescription = function () {
        $state.go('allPrescriptions').then(() => {
            self.clicked = true;
        });
    };

    self.gotoExecutionRecord = function () {
        $state.go('allExecutionRecord').then(() => {
            self.clicked = true;
        });
    };
}
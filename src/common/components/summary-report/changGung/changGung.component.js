import changGung from './changGung.component.html'; // 長庚透析連續型表單
import './changGung.component.less';

angular.module('app').component('changGungReport', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: changGung,
    controller: changGungController
});

// SummaryContent1Controller.$inject = ['$filter', '$mdDialog', '$state', '$stateParams', 'dialysisService', 'showMessage', '$scope', 'SettingService', 'userService', 'postAssessmentService', 'shiftIssueService', 'labexamService', 'assessmentService'];
// function SummaryContent1Controller($filter, $mdDialog, $state, $stateParams, dialysisService, showMessage, $scope, SettingService, userService, postAssessmentService, shiftIssueService, labexamService, assessmentService) {

changGungController.$inject = ['$filter', '$state', '$stateParams', 'SettingService', 'shiftIssueService', 'labexamService', 'assessmentService', 'summaryReportService'];

function changGungController($filter, $state, $stateParams, SettingService, shiftIssueService, labexamService, assessmentService, summaryReportService) {
    console.log('enter summary content component 1');
    const self = this;
    console.log('data', self.data);
    console.log('patient', self.patient);

    let $translate = $filter('translate');
    self.currentHospital = SettingService.getCurrentHospital();
    const patientId = $stateParams.patientId; // $stateParams.patientId


    // 表單標題
    self.dialysisRecordTable = SettingService.getCurrentHospital().FormTitle;

    self.$onInit = function $onInit() {
        prepareData();
    };

    function prepareData() {
        self.loading = true;

        summaryReportService.getCommonSummaryData(patientId, self.headerId).then((res) => {
            self.data = res.data;
            self.catheter = res.catheter;
            self.deviation = res.deviation;

            if (self.data.DialysisHeader.CheckStaff) {
                self.checkStaff = Object.keys(self.data.DialysisHeader.CheckStaff)[0];
            }

            self.columnTd = 0;
            // 算出欄位，是否有少於8欄
            if (self.data.DialysisData.length <= 8) {
                let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
                self.columnTd = range;
            }

            // self.columnTd2 = 0;
            // // 算出欄位，是否有少於13欄
            // if (self.data.DialysisData.length <= 13) {
            //     let range2 = Array.from(Array(13 - self.data.DialysisData.length).keys());
            //     self.columnTd2 = range2;
            // }

            // 20181108改:分頁顯示
            // 算頁數
            // Math.ceil(5/2) 向上取整數(有小數就+1)
            let pageCntTotal = 0;
            self.CRRTTable = [];
            let CRRTItem = {};
            if (self.data.DialysisData.length > 0) {
                pageCntTotal = Math.ceil(self.data.DialysisData.length / 13); // 總頁數
                for (let i = 0; i < pageCntTotal; i++) {
                    CRRTItem = {};
                    CRRTItem.pageNo = i + 1;
                    CRRTItem.DialysisData = [];
                    let j = 0;
                    self.data.DialysisData.forEach((x) => {
                        j += 1;
                        if (j >= ((i * 13) + 1) && j <= ((i * 13) + 13)) {
                            CRRTItem.DialysisData.push(x);
                        }
                    });
                    if (i === pageCntTotal - 1) {
                        CRRTItem.columnTd2 = Array.from(Array((13 * pageCntTotal) - self.data.DialysisData.length).keys());
                    } else {
                        CRRTItem.columnTd2 = [];
                    }
                    self.CRRTTable.push(CRRTItem);
                }
            } else {
                CRRTItem.pageNo = 1;
                CRRTItem.DialysisData = self.data.DialysisData;
                CRRTItem.columnTd2 = Array.from(Array(13 - self.data.DialysisData.length).keys());
                self.CRRTTable.push(CRRTItem);
            }
            console.log('CRRTTable', self.CRRTTable);

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
                        console.log('resp1:', resp1);
                        self.assessments_pre = resp1.data.Items;
                        self.assessments_pre.forEach((i) => {
                            // console.log(i.Item);
                            if (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item]) {
                                if (i.Item === 'ECMO') {
                                    self.CatheterType = 'V ECMO';
                                } else {
                                    assItem = i.Item + ' : ' + (preAssessmentRecords[preAssessmentCount - 1].Items[i.Item] ? preAssessmentRecords[preAssessmentCount - 1].Items[i.Item].toString() : '');
                                    self.preAssessment.push(assItem);
                                }
                            }
                        });
                        // 文字性評估描述欄
                        console.log('Description:', preAssessmentRecords[preAssessmentCount - 1].Description);
                        if (preAssessmentRecords[preAssessmentCount - 1].Description !== null) {
                            self.preAssessment.push(preAssessmentRecords[preAssessmentCount - 1].Description);
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
            // 抓異常項目子集合
            self.AbnormalItems = [];
            if (self.data.APOs && self.data.APOs.some(x => x.AbnormalItem)) {
                self.data.APOs.map(x => {
                    self.AbnormalItems.push(x.AbnormalItem);
                });
            }

            let arr = self.data.DialysisData.filter(x => x.MacAddress).map(x => x.MacAddress);
            if (arr.length > 0) {
                self.lastMacAddress = arr[arr.length - 1].slice(-6);
            }

            self.isError = false;
        }).catch((err) => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });

    }

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

    self.refresh = function () {
        prepareData();
    };

    self.calculateActualTime = function () {
        if (self.data.StartTime && self.data.EndTime) {
            moment(self.data.EndTime).diff(self.data.StartTime).format('HH:mm');
        }
    };
}

import tpech from './tpech.component.html'; // 院內表單
import './tpech.component.less';

angular.module('app').component('tpechReport', {
    bindings: {
        headerId: '<',
        patient: '<'
    },
    template: tpech,
    controller: tpechController
});

tpechController.$inject = ['$q', '$filter', '$stateParams', 'summaryReportService', 'basicSettingService', 'showMessage', 'BloodTransfusionService', 'SettingService', 'userService', 'bedService', 'allNursingGuideService', 'allHealthProblemService', 'highRiskFallerService'];

function tpechController($q, $filter, $stateParams, summaryReportService, basicSettingService, showMessage, BloodTransfusionService, SettingService, userService, bedService, allNursingGuideService, allHealthProblemService, highRiskFallerService) {
    console.log('enter summary content component tpechReport');
    const self = this;
    console.log('self.headerId', self.headerId);
    console.log('patient', self.patient);
    let $translate = $filter('translate');
    // self.headerVesselAssessments = [];
    // let headerVesselAssessmentsObj = {
    //     Data: {
    //         Id: '',
    //     },
    //     ArteryPosition: '',
    //     VeinPosition: '',
    //     Thrill: '',
    //     Favorable: ''
    // };

    self.$onInit = function () {
        prepareData();
    };

    let patientId = $stateParams.patientId ? $stateParams.patientId : self.patient.Id;
    function prepareData() {
        self.loading = true;

        // 需調整非同步問題，否則電子病歷那裏會有問題
        // 不需等取到表單資料就可先取的: 輸血及表單標題
        // 須等取到表單資料才能取的: 護理指導、健康問題、跌倒評估
        let exeAry = [getHospitalInfo(), getBloodTransfusion(), getCommonSummaryData()];
        $q.all(exeAry).then(() => {
            let startDate = moment(self.data.DialysisHeader.StartTime).format('YYYYMMDD');
            let exeAryAfter = [getNursingGuide(startDate), getHealthProblem(startDate), getHighRiskFaller()];
            self.orderPrescribingTime = [];
            self.orderProcessTime = [];
            self.EPOCreatedTime = [];
            self.EPOProcessTime = [];
            // 開表時間
            let startTime = moment(self.data.DialysisHeader.StartTime).format('YYYY/MM/DD');

            // 一般醫囑
            _.forEach(self.data.OrderRecord, (value) => {
                let PrescribingTime = moment(value.PrescribingTime).format('YYYY/MM/DD');
                let ProcessTime = moment(value.ProcessTime).format('YYYY/MM/DD');
                if (value.PrescribingTime != null && (PrescribingTime != startTime)) {
                    let orderPrescribingTime = moment(value.PrescribingTime).format('MM/DD');
                    self.orderPrescribingTime.push(orderPrescribingTime);
                } else if (PrescribingTime == startTime) {
                    let orderPrescribingTime = moment(value.PrescribingTime).format('HH:mm');
                    self.orderPrescribingTime.push(orderPrescribingTime);
                }
                // 執行時間
                // 執行 -> 顯示時間; 不執行 -> 顯示原因
                if (value.OrderMode === 'Performed') {
                    // 執行 -> 顯示時間
                    if (value.ProcessTime != null && (ProcessTime != startTime)) {
                        let orderProcessTime = moment(value.ProcessTime).format('MM/DD HH:mm');
                        self.orderProcessTime.push(orderProcessTime);
                    } else if (ProcessTime == startTime) {
                        let orderProcessTime = moment(value.ProcessTime).format('HH:mm');
                        self.orderProcessTime.push(orderProcessTime);
                    }
                } else if (value.OrderMode === 'Neglect') {
                    // 不執行 -> 顯示原因
                    self.orderProcessTime.push(value.Memo);
                }
            });

            // EPO 醫囑
            _.forEach(self.data.EPOExecutions, (value) => {
                let CreatedTime = moment(value.CreatedTime).format('YYYY/MM/DD');
                let ProcessTime = moment(value.ProcessTime).format('YYYY/MM/DD');
                if (value.CreatedTime != null && (CreatedTime != startTime)) {
                    let EPOCreatedTime = moment(value.CreatedTime).format('MM/DD');
                    self.EPOCreatedTime.push(EPOCreatedTime);
                } else if (CreatedTime == startTime) {
                    let EPOCreatedTime = moment(value.CreatedTime).format('HH:mm');
                    self.EPOCreatedTime.push(EPOCreatedTime);
                }

                if (value.ProcessTime != null && (ProcessTime != startTime)) {
                    let EPOProcessTime = moment(value.ProcessTime).format('MM/DD HH:mm');
                    self.EPOProcessTime.push(EPOProcessTime);
                } else if (ProcessTime == startTime) {
                    let EPOProcessTime = moment(value.ProcessTime).format('HH:mm');
                    self.EPOProcessTime.push(EPOProcessTime);
                }
            });

            //$ctrl.data.DialysisHeader.Dehydration - $ctrl.data.DialysisHeader.DehydrationSetting
            if (self.data.DialysisHeader.Dehydration === null && self.data.DialysisHeader.DehydrationSetting === null) {
                self.numberdiss = "";
            } else if (self.data.DialysisHeader.Dehydration === null) {
                self.numberdiss = Number(0 - self.data.DialysisHeader.DehydrationSetting).toFixed(2);
            } else {
                self.numberdiss = Number(self.data.DialysisHeader.Dehydration - self.data.DialysisHeader.DehydrationSetting).toFixed(2);
            }

            // Ca,Na透析液
            if (self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.Dialysate != null) {
                let searchComma = self.data.DialysisHeader.Prescription.Dialysate.split(',');
                _.forEach(searchComma, (value, key) => {
                    if (searchComma[key] != null && searchComma[key].match('Ca')) {
                        self.dialysateCa = searchComma[key].substring(searchComma[key].search('/') + 1);
                    } else if (searchComma[key] != null && searchComma[key].match('K')) {
                        self.dialysateK = searchComma[key].substring(searchComma[key].search('/') + 1);
                    }
                });
                // if (searchComma[0] != null) {

                // }
                // if (searchComma[1] != null) {

                // }
            }

            // 抗凝劑 Heparin 初劑量 200, 維持量 250
            self.Anticoagulants = [];
            let Anticoagulant = {};
            if (self.data.DialysisHeader.Prescription !== null) {
                for (let i = 0; i < Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants).length; i++) {
                    let key = Object.keys(self.data.DialysisHeader.Prescription.Anticoagulants)[i];
                    // console.log('key:', key);
                    // console.log('0:', self.data.DialysisHeader.Prescription.Anticoagulants[key][0]);
                    // console.log('1:', self.data.DialysisHeader.Prescription.Anticoagulants[key][1]);
                    Anticoagulant.Name = key;
                    // Anticoagulant.Value = self.data.DialysisHeader.Prescription.Anticoagulants[key][0] + ' / ' + self.data.DialysisHeader.Prescription.Anticoagulants[key][1] + ' U';
                    Anticoagulant.firstValue = self.data.DialysisHeader.Prescription.Anticoagulants[key][0];
                    Anticoagulant.maintainValue = self.data.DialysisHeader.Prescription.Anticoagulants[key][1];
                    self.Anticoagulants.push(Anticoagulant);
                    Anticoagulant = {};
                    // if (key.toLocaleLowerCase === "heparin") {
                    //     self.Anticoagulants.push(self.data.DialysisHeader.Prescription.Anticoagulants[key][0] + ' / ' + self.data.DialysisHeader.Prescription.Anticoagulants[key][1]);
                    // }
                }
            }

            // 血管通路 組合成字串:self.VesselAssessmentStr
            if (self.data.DialysisHeader.VesselAssessments.length > 0) {
                let va = self.data.DialysisHeader.VesselAssessments[0];
                console.log('血管通路 組合成字串 va', va);
                if (!va) {
                    return;
                }
                let vsa = false;
                if (va.Data && va.Data.StartDate) {
                    if ((Date.parse(moment(va.Data.StartDate).format('YYYY-MM-DD'))).valueOf() <= (Date.parse(self.data.DialysisHeader.StartTime)).valueOf() &&
                        (!va.Data.EndDate || (va.Data.EndDate && (Date.parse(moment(va.Data.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(self.data.DialysisHeader.StartTime)).valueOf()))) {
                        vsa = true;
                    }
                } else if (va.Data && (!va.Data.EndDate || (va.Data.EndDate && (Date.parse(moment(va.Data.EndDate).format('YYYY-MM-DD'))).valueOf() >= (Date.parse(self.data.DialysisHeader.StartTime)).valueOf()))) {
                    vsa = true;
                }
                if (vsa) {
                    self.VesselAssessmentStr = handleTransformCatheterType(va.Data.CatheterType) + ' ' + $translate('vesselAssessment.vesselAssessment.' + va.Data.CatheterPosition.Side) + ' ' + $translate('vesselAssessment.vesselAssessment.' + va.Data.CatheterPosition.Position);
                    console.log('self.VesselAssessmentStr', self.VesselAssessmentStr);
                    self.VAdate = (va.Data && va.Data.StartDate) ? moment(va.Data.StartDate).format('YYYY/MM/DD') : '';
                    // 動脈
                    if (va.ArteryPosition != null && va.ArteryPosition != '') {
                        va.ArteryPosition = va.ArteryPosition.split('@@');
                        // ['outside', 'inside', 'otherxxx']
                        for (let i = 0; i < va.ArteryPosition.length; i++) {
                            if (va.ArteryPosition[i].includes('other')) {
                                // 拆解 otherxxx
                                let otherStr = translateNeedlePosition(va.ArteryPosition[i].substring(0, 5)); // 其他
                                let otherInputStr = va.ArteryPosition[i].substring(5); // xxxx
                                // 其他：xxx
                                va.ArteryPosition[i] = otherInputStr ? otherStr.concat(':', otherInputStr) : otherStr;
                            } else {
                                va.ArteryPosition[i] = translateNeedlePosition(va.ArteryPosition[i]);
                            }
                        }
                        // 組成字串顯示
                        self.ArteryPosition = va.ArteryPosition.join(', ');
                    }
                    // 靜脈
                    if (va.VeinPosition != null && va.VeinPosition != '') {
                        va.VeinPosition = va.VeinPosition.split('@@');
                        // ['outside', 'inside', 'otherxxx']
                        for (let i = 0; i < va.VeinPosition.length; i++) {
                            if (va.VeinPosition[i].includes('other')) {
                                let otherStr = translateNeedlePosition(va.VeinPosition[i].substring(0, 5)); // 其他
                                let otherInputStr = va.VeinPosition[i].substring(5); // xxxx
                                // 其他：xxx
                                va.VeinPosition[i] = otherInputStr ? otherStr.concat(':', otherInputStr) : otherStr;
                            } else {
                                va.VeinPosition[i] = translateNeedlePosition(va.VeinPosition[i]);
                            }
                        }
                        self.VeinPosition = va.VeinPosition.join(', ');
                    }
                    // if (va.ArteryPosition != null && va.ArteryPosition.match('other')) {
                    //     let ArteryPosition = translateNeedlePosition(va.ArteryPosition.substr(0, 5));
                    //     self.ArteryPosition = ArteryPosition + '：' + va.ArteryPosition.substr(5);
                    // } else {
                    //     self.ArteryPosition = translateNeedlePosition(va.ArteryPosition);
                    // }
                    // if (va.VeinPosition != null && va.VeinPosition.match('other')) {
                    //     let VeinPosition = translateNeedlePosition(va.VeinPosition.substr(0, 5));
                    //     self.VeinPosition = VeinPosition + '：' + va.VeinPosition.substr(5);
                    // } else {
                    //     self.VeinPosition = translateNeedlePosition(va.VeinPosition);
                    // }
                    self.Thrill = va.Thrill === "yes" ? "有" : (va.Thrill === "none" ? "無" : "");
                    self.Favorable = va.Favorable === "yes" ? "是" : (va.Favorable === "no" ? "否" : "");
                }
                //self.headerVesselAssessments = self.dialysisHeader.VesselAssessments;
            }
            //  else {
            //     // 沒資料：初始化一組
            //     self.headerVesselAssessments = [
            //         angular.copy(headerVesselAssessmentsObj)
            //     ];
            // }

            // 輸血
            // BloodTransfusionService.get(self.headerId, false, patientId).then((q) => {
            //     if (q.data) {
            //         self.bloodData = q.data.filter(item => item.Status !== 'Deleted');
            //         console.log('self.bloodData:', self.bloodData);
            //     }
            // });

            // 透析機資料
            self.columnTd2 = [];
            if (self.data.DialysisData.length <= 11) {
                self.columnTd2 = Array.from(Array(11 - self.data.DialysisData.length).keys());
            }

            // 洗前評估
            // self.AssessmentRecords = [];
            self.preAssessmentRecords = [];
            console.log('AssessmentRecords:', self.data.AssessmentRecords);
            //洗前
            self.Assessment = self.data.AssessmentRecords.filter(item => item.Type === 'pre' && item.Status !== 'Deleted');
            let asStr = "";
            // 先取最新一筆即可
            if (self.Assessment.length > 0) {
                let firstAssessmentRecord = _.orderBy(self.Assessment, ['RecordTime'], ['desc'])[0];
                for (let j = 0; j < Object.keys(firstAssessmentRecord.Items).length; j++) {
                    let key = Object.keys(firstAssessmentRecord.Items)[j];
                    let str = generateAssessmentStr(firstAssessmentRecord.Items[key], key);
                    if (str) {
                        self.preAssessmentRecords.push(str);
                    }
                }

            }

            console.log('preAssessmentRecords', self.preAssessmentRecords);
            // self.AssessmentRecords.push(asStr);
            //洗後
            self.postAssessmentRecords = [];
            self.Assessment = self.data.AssessmentRecords.filter(item => item.Type === 'post' && item.Status !== 'Deleted');
            asStr = "";
            // 先取最新一筆即可
            if (self.Assessment.length > 0) {
                let firstAssessmentRecord = _.orderBy(self.Assessment, ['RecordTime'], ['desc'])[0];
                for (let j = 0; j < Object.keys(firstAssessmentRecord.Items).length; j++) {
                    let key = Object.keys(firstAssessmentRecord.Items)[j];
                    let str = generateAssessmentStr(firstAssessmentRecord.Items[key], key);
                    if (str) {
                        self.postAssessmentRecords.push(str);
                    }
                }

            }

            // 洗中評估
            self.Assessment = [];
            for (let i = 0; i < self.data.DialysisData.length; i++) {
                let AssessmentItems = {
                    Content: '',
                    DialysisData: null,
                    CreatedUserName: null,
                    ModifiedUserName: null
                };
                if (self.data.DialysisData[i].Status !== 'Deleted' && Object.keys(self.data.DialysisData[i].AssessmentItems).length > 0) {
                    for (let j = 0; j < Object.keys(self.data.DialysisData[i].AssessmentItems).length; j++) {
                        let key = Object.keys(self.data.DialysisData[i].AssessmentItems)[j];
                        console.log('key:', key);
                        console.log('cont', self.data.DialysisData[i].AssessmentItems[key]);
                        AssessmentItems.Content += generateAssessmentStr(self.data.DialysisData[i].AssessmentItems[key], key);
                        // 若不為最後一個才需要加，
                        if (j !== Object.keys(self.data.DialysisData[i].AssessmentItems).length - 1) {
                            AssessmentItems.Content += '；';
                        }
                        AssessmentItems.DialysisData = self.data.DialysisData[i].DialysisTime;
                        AssessmentItems.CreatedUserName = self.data.DialysisData[i].CreatedUserName;
                        AssessmentItems.ModifiedUserName = self.data.DialysisData[i].ModifiedUserName;
                    }
                    self.Assessment.push(AssessmentItems);
                }
            }

            if (self.data.DialysisHeader.Leaving != null && self.data.DialysisHeader.Leaving.match('other')) {
                if (self.data.DialysisHeader.Leaving.substr(5) != '') {
                    self.otherLeavingInput = '：' + self.data.DialysisHeader.Leaving.substr(5);
                }
                self.data.DialysisHeader.Leaving = self.data.DialysisHeader.Leaving.substr(0, 5);
            }

            // TODO: 北市醫 結束後情況
            self.AfterSituation = {
                good: false,
                spasm: false,
                headache: false,
                vomit: false,
                other: false
            };

            if (self.data.DialysisHeader.AfterSituation.length > 0) {
                for (let i = 0; i < self.data.DialysisHeader.AfterSituation.length; i++) {
                    if (self.data.DialysisHeader.AfterSituation[i] === "良好") {
                        self.AfterSituation.good = true;
                    } else if (self.data.DialysisHeader.AfterSituation[i] === "痙攣") {
                        self.AfterSituation.spasm = true;
                    } else if (self.data.DialysisHeader.AfterSituation[i] === "頭痛") {
                        self.AfterSituation.headache = true;
                    } else if (self.data.DialysisHeader.AfterSituation[i] === "嘔吐") {
                        self.AfterSituation.vomit = true;
                    } else if (self.data.DialysisHeader.AfterSituation[i] === "其他") {
                        self.AfterSituation.other = true;
                    } else if (self.data.DialysisHeader.AfterSituation[i] != '') {
                        self.inputOther = '：' + self.data.DialysisHeader.AfterSituation[i];
                    }
                }
            }

            return $q.all(exeAryAfter);
        }).then(() => {
            self.isError = false;

        }).catch(() => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    // 取共同資料
    function getCommonSummaryData() {
        const defer = $q.defer();
        summaryReportService.getCommonSummaryData(patientId, self.headerId).then((res) => {
            self.data = res.data;
            console.log('prepareData data', self.data);
            self.catheter = res.catheter;
            self.deviation = res.deviation;
            defer.resolve();
        }).catch((err) => {
            defer.reject();
        }).finally(() => {
            self.loading = false;
        });
        return defer.promise;
    }
    // 取表單標題
    function getHospitalInfo() {
        const defer = $q.defer();
        if (SettingService.getCurrentHospital()) {
            self.formTitle = SettingService.getCurrentHospital().FormTitle;
            defer.resolve();
        } else {
            // 重新從 server 撈
            basicSettingService.getHospitalInfo().then((res) => {
                self.formTitle = res.data.FormTitle;
                defer.resolve();
            }).catch(() => {
                defer.reject();
            });
        }
        return defer.promise;
    }
    // 取輸血
    function getBloodTransfusion() {
        const defer = $q.defer();
        BloodTransfusionService.get(self.headerId, false, patientId).then((q) => {
            if (q.data) {
                self.bloodData = q.data.filter(item => item.Status !== 'Deleted');
                console.log('self.bloodData:', self.bloodData);
            }
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });
        return defer.promise;
    }
    // 跌倒評估
    function getHighRiskFaller() {
        const defer = $q.defer();

        highRiskFallerService.getListByPatientID(patientId, self.headerId, 'HD').then((res) => {
            console.log("highRiskFallerService getList Success", res.data, patientId, self.headerId);
            // debugger;
            self.serviceData = res.data;
            // self.highriskTime = [];
            self.highriskTime = self.serviceData.filter(function (item) {
                let time = item.Record_Date;
                time = moment(item.Record_Date).format('YYYYMMDD');
                self.data.DialysisHeader.StartTime = moment(self.data.DialysisHeader.StartTime).format('YYYYMMDD');
                return (item.Status != "Deleted") && (time >= self.data.DialysisHeader.StartTime);
            });
            console.log('self.highriskTime', self.highriskTime);
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });

        return defer.promise;
    }
    // 護理指導
    function getNursingGuide(startDate) {
        const defer = $q.defer();
        allNursingGuideService.getNursingGuide(patientId, startDate, startDate).then((res) => {
            self.nursingGuide = res.data;
            console.log('self.nursingGuide:', self.nursingGuide);
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });
        return defer.promise;
    }
    // 健康問題
    function getHealthProblem(startDate) {
        const defer = $q.defer();
        allHealthProblemService.getHealthProblem(patientId, startDate, startDate).then((q) => {
            self.healthProblem = q.data;
            console.log('self.healthProblem:', self.healthProblem, startDate);
            defer.resolve();
        }).catch(() => {
            defer.reject();
        });

        return defer.promise;
    }

    // 需處理其他
    function generateAssessmentStr(assessmentAry, key) {
        let totalLength = assessmentAry.length - 1;    // 供判斷其他是否為最後一個
        // 此評估無項目
        if (totalLength === -1) {
            return '';
        }
        // 需處理其他
        let assessmentContent = '';
        let otherIdx = assessmentAry.indexOf('Other');
        if (otherIdx > -1) {
            let otherArys = assessmentAry.splice(otherIdx, assessmentAry.length);
            // 其他一定會出現在最後一個或倒數第二個先用'-'去連
            let otherStr = otherIdx < totalLength ? `其他-${otherArys[otherArys.length - 1]}` : '其他';
            assessmentContent = assessmentAry.length > 0 ? `${assessmentAry.toString()}，${otherStr}` : otherStr;
        } else {
            assessmentContent = assessmentAry.join('，');
        }

        return key + '：' + assessmentContent;
    }

    self.refresh = function () {
        prepareData();
    };

    function handleTransformCatheterType(catheterType) {
        let catheterTypeTC;
        switch (catheterType) {
            case 'AVFistula':
                catheterTypeTC = $translate('overview.component.AVFistula');
                break;
            case 'AVGraft':
                catheterTypeTC = $translate('overview.component.AVGraft');
                break;
            case 'Permanent':
                catheterTypeTC = $translate('overview.component.Permanent');
                break;
            case 'DoubleLumen':
                catheterTypeTC = $translate('overview.component.DoubleLumen');
                break;
            default:
                catheterTypeTC = $translate('overview.component.typeError');
        }
        return catheterTypeTC;
    }

    // 血管通路上針部位翻譯
    function translateNeedlePosition(needlePosition) {
        let needlePositionStr;
        switch (needlePosition) {
            case 'outside':
                needlePositionStr = "外側";
                break;
            case 'inside':
                needlePositionStr = "內側";
                break;
            case 'forearm':
                needlePositionStr = "前臂";
                break;
            case 'upperarm':
                needlePositionStr = "上臂";
                break;
            case 'other':
                needlePositionStr = "其他";
                break;
        }
        return needlePositionStr;
    }
}

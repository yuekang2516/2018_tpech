import piyavate from './piyavate.component.html'; // 院內表單
import '../../../../static/barCode';
import './piyavate.component.less';

angular.module('app').component('piyavateReport', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: piyavate,
    controller: piyavateController
});

piyavateController.$inject = ['$stateParams', 'SettingService', 'userService', 'bedService', 'summaryReportService'];

function piyavateController($stateParams, SettingService, userService, bedService, summaryReportService) {
    console.log('enter summary content component');
    const self = this;
    console.log('data', self.data);
    console.log('patient', self.patient);

    self.currentHospital = SettingService.getCurrentHospital();

    const patientId = self.patient.Id; // $stateParams.patientId
    let wardId = Object.keys(SettingService.getCurrentUser().Ward)[0];

    self.$onInit = function () {
        prepareData();
        // getDoctorEmployeeId();
        // getNurseEmployeeId();
        // getNextAppointment();
    };

    function prepareData() {
        self.loading = true;
        summaryReportService.getCommonSummaryData($stateParams.patientId, self.headerId).then((res) => {
            self.data = res.data;
            self.catheter = res.catheter;
            self.deviation = res.deviation;

            if (self.data.DialysisHeader.CheckStaff) {
                self.checkStaff = Object.keys(self.data.DialysisHeader.CheckStaff)[0];
            }

            getDoctorEmployeeId();
            getNurseEmployeeId();
            getNextAppointment();

            self.columnTd = 0;
            // 算出欄位，是否有少於8欄
            if (self.data.DialysisData.length <= 8) {
                let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
                self.columnTd = range;
            }

            // Weight loss 透析前體重 - 透析後體重
            if (self.data.DialysisHeader && (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.WeightAfterDialysis)) {
                self.Weightloss = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.WeightAfterDialysis) * 100) / 100;
            }

            // Weight gain 透析前體重 - 處方的標準體重
            self.WeightGain = null;
            if (self.data.DialysisHeader.PredialysisWeight && self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.StandardWeight) {
                self.WeightGain = Math.round((self.data.DialysisHeader.PredialysisWeight - self.data.DialysisHeader.Prescription.StandardWeight) * 100) / 100;
            }

            // barcode create 128 core
            if (document.querySelectorAll('.summary [id^=barcode]').length > 0) {
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

            self.catheterVolume = getCatheterVolume();
            if (self.data.AssessmentRecords.length > 0) {
                // sort records by record time
                self.data.AssessmentRecords = _.sortBy(self.data.AssessmentRecords, function (o) { return o.RecordTime; });
                // 洗前評估
                // filter out pre-assessment records
                let preAssessmentRecords = _.filter(self.data.AssessmentRecords, {
                    'Type': 'pre'
                });
                // pre-assessment record count
                let preAssessmentCount = preAssessmentRecords.length;
                // if more than 1 record of pre-assessment
                if (preAssessmentCount > 0) {
                    let indexOfBruitThrill = findLastIndexOfBruit(preAssessmentRecords);
                    // get the first record (assessment) if it only has 1 record
                    if (preAssessmentCount === 1) {
                        self.assessment = !_.isEmpty(preAssessmentRecords[0].Items) ? preAssessmentRecords[0].Items : {};
                        assignBruitThrill(preAssessmentRecords, indexOfBruitThrill);
                    } else {
                        // get the last record (reassessment) if it has more than 1 records
                        self.assessment = !_.isEmpty(preAssessmentRecords[0].Items) ? preAssessmentRecords[0].Items : {};
                        self.reassessment = !_.isEmpty(preAssessmentRecords[preAssessmentCount - 1].Items) ? preAssessmentRecords[preAssessmentCount - 1].Items : {};

                        assignBruitThrill(preAssessmentRecords, indexOfBruitThrill);
                    }
                }

                // 洗後評估
                // filter out post-assessment records
                let postAssessmentRecords = _.filter(self.data.AssessmentRecords, {
                    'Type': 'post'
                });
                // post-assessment record count
                let postAssessmentCount = postAssessmentRecords.length;
                // if more than 1 record of post-assessment
                if (postAssessmentCount > 0) {
                    // get the first record if it only contains 1 record
                    if (postAssessmentCount === 1) {
                        self.postAssessment = !_.isEmpty(postAssessmentRecords[0].Items) ? postAssessmentRecords[0].Items : {};
                    } else {
                        self.postAssessment = !_.isEmpty(postAssessmentRecords[postAssessmentCount - 1].Items) ? postAssessmentRecords[postAssessmentCount - 1].Items : {};
                    }
                }
            }

            let arr = self.data.DialysisData.filter(x => x.MacAddress).map(x => x.MacAddress);
            if (arr.length > 0) {
                self.lastMacAddress = arr[arr.length - 1].slice(-6);
            }

        }).catch((err) => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    // get doctor employee id by user id
    function getDoctorEmployeeId() {
        if (self.data.DialysisHeader.Prescription) {
            let userId = self.data.DialysisHeader.Prescription.ModifiedUserId ? self.data.DialysisHeader.Prescription.ModifiedUserId : self.data.DialysisHeader.Prescription.CreatedUserId;
            userService.getById(userId).then((res) => {
                self.doctorEmployeeId = res.data.EmployeeId;
            });
        }
    }

    function getNurseEmployeeId() {
        let userId = self.data.DialysisHeader.OnUserId;
        userService.getById(userId).then((res) => {
            self.nurseEmployeeId = res.data.EmployeeId;
        });
    }

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

    function getNextAppointment() {
        // get start date (today)
        let startDate = moment().format('YYYYMMDD');
        // get end date (end of next month)
        let endDate = moment().add(1, 'M').endOf('month').format('YYYYMMDD');

        bedService.getAssignBedByWardAndMonth(wardId, startDate, endDate).then((res) => {
            // sort arranged data by assign bed then filter out a specific patient
            let arrangedPatient = _.filter(_.sortBy(res.data, function (o) {
                return o.AssignDate;
            }), {
                    'PatientId': patientId
                });
            // filter out arranged data that is after today
            self.nextAppointment = _.filter(arrangedPatient, function (o) {
                return moment(o.AssignDate) > moment();
            });
        });
    }

    // find the last index of existing Inflammation, Bruit or Thrill
    function findLastIndexOfBruit(preAssessmentRecords) {
        let index;
        // loop through every record in the array
        preAssessmentRecords.forEach((value, i) => {
            // check if either Inflammation, Bruit or Thrill exist
            if (value.Items['Inflammation'] || value.Items['Thrill'] || value.Items['Bruit']) {
                // assign the index
                index = i;
            }
        });
        return index;
    }

    // assign Inflammation, Thrill and Bruit
    function assignBruitThrill(preAssessmentRecords, indexOfBruitThrill) {
        // if record consist of either Inflammation, Bruit or Thrill
        if (indexOfBruitThrill !== undefined) {
            self.inflammation = preAssessmentRecords[indexOfBruitThrill].Items['Inflammation'] ? preAssessmentRecords[indexOfBruitThrill].Items['Inflammation'] : {};
            self.thrill = preAssessmentRecords[indexOfBruitThrill].Items['Thrill'] ? preAssessmentRecords[indexOfBruitThrill].Items['Thrill'] : {};
            self.bruit = preAssessmentRecords[indexOfBruitThrill].Items['Bruit'] ? preAssessmentRecords[indexOfBruitThrill].Items['Bruit'] : {};
        }
    }

}

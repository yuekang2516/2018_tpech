import postAssessment from './postAssessment.html';
import './postAssessment.less';
import Waterfall from '../../../../static/responsive_waterfall.js';

angular.module('app').component('postAssessment', {
    template: postAssessment,
    controller: postAssessmentCtrl,
    contrllerAs: '$ctrl'
});

postAssessmentCtrl.$inject = ['$scope', '$stateParams', 'SettingService', 'postAssessmentService', 'showMessage'];
function postAssessmentCtrl($scope, $stateParams, SettingService, postAssessmentService, showMessage) {
    const self = this;

    // user info
    let user = SettingService.getCurrentUser();

    let patientId = $stateParams.patientId;
    let headerId = $stateParams.headerId;
    let hospitalId = user.HospitalId;

    self.loading = true;

    // Current time
    self.recordTime = moment().second(0).millisecond(0).toDate();
    // object to hold list of arrays
    self.selectedItems = {
        // "Complication": ['Muscle cramp', 'Fever'],
        // "Health education": ["Nutrition"],
        // "Nursing intervention": ["Pause ultrafiltration"],
        // "Technical complication": ["Clotted dialyzer"]
    };
    self.data = {};

    self.complication = [
        "No complication",
        "Hypotension",
        "Muscle cramp",
        "Headache",
        "Nausea/Vomit",
        "Fever",
        "Hypertension",
        "Chest pain",
        "Arrhythmia",
        "Vascular access problem",
        "Other"
    ];

    self.technical = [
        "No complication",
        "Clotted dialyzer",
        "Clotted blood line",
        "Machine problem",
        "Blood leak"
    ];

    self.intervention = [
        "Psychological support",
        "Trenderlenburg position",
        "Monitor vital signs",
        "Pause ultrafiltration",
        "Decrease dialysate temperature",
        "Oxygen therapy",
        "Hot compression",
        "Strength exercise",
        "Cold compression",
        "Aspirate precaution",
        "Monitor EKG",
        "Decrease BFR",
        "Monitor access flow",
        "Change dialyzer",
        "Change blood line",
        "Notified physician",
        "Other"
    ];

    self.education = [
        "Nutrition",
        "Vascular access",
        "Exercise",
        "Personal hygine",
        "Medication",
        "Fluid control",
        "KT preparation"
    ];

    let isEdit = false;
    self.$onInit = function $onInit() {
        getSelectedItems();
    };

    let getSelectedItems = function () {
        postAssessmentService.getByDialysisId(headerId, true).then((res) => {
            console.log('get by id', res);
            // if it has data
            if (res.data) {
                self.data = res.data;
                self.selectedItems = res.data.Items;
                // debugger;
                // postAssessmentId = res.data.Id;
                isEdit = true;
                self.loading = false;
                // debugger;
            } else {
                isEdit = false;
                self.loading = false;
                // debugger;
            }

        });
    };

    self.toggle = function (title, item) {
        // check if the object exists, if not create an object with an empty array
        if (!self.selectedItems[title]) {
            self.selectedItems[title] = [];
        }
        // debugger;
        // find the index of the item in the array
        let idx = self.selectedItems[title].indexOf(item);
        if (idx > -1) {
            // remove the item from the array if it's found
            self.selectedItems[title].splice(idx, 1);
        } else {
            // add the item into the array
            self.selectedItems[title].push(item);
        }
    };

    // check if item exists and set the checkbox status
    self.exists = function (title, item) {
        if (self.selectedItems[title]) {
            return self.selectedItems[title].indexOf(item) > -1;
        }
    };

    self.submit = function () {
        // delete object if the value of the object is empty
        _.forEach(self.selectedItems, (v, k) => {
            if (v.length === 0) {
                delete self.selectedItems[k];
            }
        });
        self.loading = true;
        // console.log(data);

        // edit post assessment
        if (isEdit) {
            self.data.ModifiedUserId = user.Id;
            self.data.ModifiedUserName = user.Name;
            self.data.Items = self.selectedItems;
            // self.data.Id = postAssessmentId;

            postAssessmentService.putRecord(self.data).then((res) => {
                if (res.status === 200) {
                    showMessage('Edited');
                    self.data = res.data;
                    self.loading = false;
                    // history.go(-1);
                }
            }, (err) => {
                // fail
                console.log('error: ' + JSON.stringify(err));
                self.loading = false;
            });
        } else {
            // create post assessment
            self.data = {
                PatientId: patientId,
                DialysisId: headerId,
                HospitalId: hospitalId,
                Items: self.selectedItems
            };

            self.data.CreatedUserId = user.Id;
            self.data.CreatedUserName = user.Name;

            postAssessmentService.postRecord(self.data).then((res) => {
                if (res.status === 200) {
                    showMessage('Created');
                    self.data = res.data;
                    isEdit = true;
                    self.loading = false;
                    // history.go(-1);
                }
            }, (err) => {
                // fail
                console.log('error: ' + JSON.stringify(err));
                self.loading = false;
            });
        }
    };
}

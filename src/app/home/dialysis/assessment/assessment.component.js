import assessments from './assessments.html';
import assessment from './assessment.html';
import './assessment.less';
import Waterfall from '../../../../static/responsive_waterfall.js';

angular.module('app').component('assessment', {
    template: assessments,
    controller: assessmentCtrl,
    contrllerAs: '$ctrl'
}).component('assessmentDetail', {
    template: assessment,
    controller: assessmentContentCtrl,
    contrllerAs: '$ctrl'
});
//don't show OtherItem
angular.module('app').filter('otherItem', function () {
    return function (input) {
        if (input != 'OtherItem') {
            return input;
        }
    };
});

assessmentCtrl.$inject = ['$scope', '$window', '$state', '$stateParams', '$mdDialog', '$mdToast', 'dialysisService', '$interval', '$timeout', 'assessmentService', 'SettingService'];
//function for the asseessment list
function assessmentCtrl($scope, $window, $state, $stateParams, $mdDialog, $mdToast, dialysisService, $interval, $timeout, assessmentService, SettingService) {

    const self = this;
    self.serviceData = [];

    // 預設狀態
    self.loading = true;
    self.header = {};
    self.lastAccessTime = moment();
    self.deletedItemsLength = -1;
    console.log('hekjlsdjlfkjlsdf', $state.current);

    $scope.$on('assessment-dataChanged', () => {
        self.refresh();
    });

    self.$onInit = function $onInit() {

        //get the header data
        // dialysisService.getById($stateParams.headerId).then((res) => {
        //     self.header = res.data;
        //     console.log(self.header);
        //     self.loading = false;
        // }, () => {
        //     self.loading = false;
        //     self.isError = true; // 顯示伺服器連接失敗的訊息
        // });
        //call the function to retrieve the list
        getList(false);
    };

    //function to get the list by Dialysis Id
    function getList(isForce) {
        self.loading = true;
        assessmentService.getByDialysisId($stateParams.headerId, isForce).then((q) => {
            //success
            self.serviceData = q.data;
            console.log(q.data);
            // get the assessment by type
            getAssessmentDataByType(q.data);
            //get the length/number of the deleted items
            self.deletedItemsLength = _.filter(q.data, {
                'Status': 'Deleted'
            }).length;
            self.lastAccessTime = assessmentService.getLastAccessTime();
            self.loading = false;
            self.isError = false;
        }, (err) => {
            //fail
            self.loading = false;
            console.log('error!!!');
            self.isError = true;
        });
    };
    self.checkCanAccess = function (createdUserId, dataStatus, modifiedId) {
        return SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
      };

    function getAssessmentDataByType(data) {
        // filter out only pre assessment data from array of assessments
        self.preAssessmentData = _.filter(data, {
            'Type': 'pre'
        });
        // if it contains at least 1 'Normal' assessment
        self.showPreTitle = _.filter(self.preAssessmentData, {
            'Status': 'Normal'
        }).length > 0 ? true : false;
        // filter out only post assessment data from array of assessments
        self.postAssessmentData = _.filter(data, {
            'Type': 'post'
        });
        // if it contains at least 1 'Normal' assessment
        self.showPostTitle = _.filter(self.postAssessmentData, {
            'Status': 'Normal'
        }).length > 0 ? true : false;
    }

    //add or edit
    //either pass in the Id for edit or no Id for create
    self.goto = function goto(Id, type) {
        $state.go('assessmentDetail', {
            patientId: $stateParams.patientId,
            headerId: $stateParams.headerId,
            Id,
            type
        });
    };

    //refresh the list
    self.refresh = function refresh() {
        self.loading = true;
        //call the function to retrieve the list
        getList(true);
    };

    self.goback = function () {
        history.go(-1);
    };

    //show delete dialog
    self.showDialog = function showDialog(event, data) {
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'assessmentdialog.html',
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
                console.log('jkljkljlk');
                assessmentService.del(data.Id).then((q) => {
                    if (q.status === 200) {
                        assessmentService.getByDialysisId($stateParams.headerId).then((q) => {
                            self.serviceData = q.data;
                            self.deletedItemsLength = self.serviceData.filter(item => item.Status === 'Deleted').length;
                            self.lastAccessTime = assessmentService.getLastAccessTime();
                            self.loading = false;
                        });
                    }
                });
                $mdDialog.hide(data);
            };

        }
    };
}

assessmentContentCtrl.$inject = ['$timeout', '$document', '$window', '$stateParams', '$scope', '$state', 'moment', '$rootScope', '$mdToast', '$mdSidenav', 'SettingService', 'showMessage', 'assessmentService', '$filter', 'PatientService'];
//function for the assessment content
function assessmentContentCtrl($timeout, $document, $window, $stateParams, $scope, $state, moment, $rootScope, $mdToast, $mdSidenav, SettingService, showMessage, assessmentService, $filter, PatientService) {

    const self = this;

    const $translate = $filter('translate');

    // type of assessment (pre/post)
    self.type = $stateParams.type;
    // Id of the assessment
    self.Id = $stateParams.Id;
    //form data
    self.regForm = {};
    //questions
    self.questions = {};
    //load user info
    self.user = SettingService.getCurrentUser();
    //checked items
    self.checkedItems = {};
    self.checkedOtherItems = {};
    //text box items
    self.otherInput = {};
    self.canAccess = true;

    self.$onInit = function $onInit() {

        // 取得病人資料, 顯示於畫面上方標題列
        PatientService.getById($stateParams.patientId).then((res) => {
            self.patient = res.data;
            // self.loading = false;
            self.isError = false;
        }, () => {
            // self.loading = false;
            self.isError = true;
        });

        angular.element(document).ready(() => {

            var waterfall = new Waterfall({
                minBoxWidth: 200
            });
        });
        //when edit is clicked
        //check if the id exist
        if ($stateParams.Id) {
            self.loading = true;
            //get by id
            assessmentService.getByRecordId($stateParams.Id).then((q) => {
                //success
                //get the results
                //load the data to regForm
                self.regForm = q.data;
                console.log(q.data);

                checkCanAccess(self.regForm.CreatedUserId, self.regForm.Status, self.regForm.ModifiedUserId);
                //get the version number of the specific Id
                self.versionNo = q.data.Version;
                self.regForm.RecordTime = moment(self.regForm.RecordTime).second(0).millisecond(0).toDate();

                //process the checked items
                self.checked = {};
                self.otherChecked = {};

                //loop through every questions
                angular.forEach(q.data.Items, function (value, key) {
                    self.selectedItems = {};
                    self.selectedOtherItems = {};
                    //if other does not exists
                    if (value.indexOf('Other') == -1) {

                        for (var i = 0; i < value.length; i++) {
                            self.selectedItems[value[i]] = true;
                        }
                    }
                    //if other exists
                    else {
                        for (var i = 0; i < value.length; i++) {
                            //if it's not Other, set it to true
                            if (value[i] !== 'Other' && value.indexOf(value[i]) != value.length - 1) {
                                self.selectedItems[value[i]] = true;
                            }
                            //if it's Other, and no text, set OtherItem to ''
                            else if (value[i] === 'Other') {
                                self.selectedOtherItems[value[i]] = true;
                                self.selectedOtherItems.OtherItem = '';
                            }
                            //if there is text set OtherItem to the text
                            else if (value[value.length - 1] !== 'Other') {
                                self.selectedOtherItems.OtherItem = value[value.length - 1];
                            }
                        }
                    }
                    self.checked[key] = self.selectedItems;
                    self.otherChecked[key] = self.selectedOtherItems;
                    self.otherInput[key] = self.selectedOtherItems.OtherItem;
                });
                self.checkedItems = self.checked;
                self.checkedOtherItems = self.otherChecked;
                self.loading = false;
                self.isError = false;
            }, () => {
                //fail
                self.loading = false;
                self.isError = true;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            }).then(() => {
                //get questions by version number
                assessmentService.getTypeByVersion(self.type, self.versionNo).then((q) => {
                    //success
                    //console.log(q.data);
                    if (q.data.Revision == self.versionNo) {
                        self.questions = q.data.Items;
                        self.loading = false;
                        $timeout(() => {
                            var waterfall = new Waterfall({
                                minBoxWidth: 200
                            });
                        }, 500);
                    }
                }, () => {
                    //fail
                    self.loading = false;
                    showMessage($translate('customMessage.serverError')); // lang.ComServerError
                });
            });
        } else {
            //initialize save button
            //disable the button. hence, nothing is selected.
            self.disabled = true;
            self.loading = true;
            //when add new assessment is clicked
            //show all the questions
            assessmentService.getByType(self.type).then((q) => {
                console.log(q.data);
                self.questions = q.data.Items;
                self.regForm.Version = q.data.Revision;
                self.loading = false;

                $timeout(() => {
                    var waterfall = new Waterfall({
                        minBoxWidth: 200
                    });
                }, 500);
                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });

            //sets the initial values for the form
            self.regForm = {
                RecordTime: moment().seconds(0).millisecond(0).toDate(),
                PatientId: $stateParams.patientId,
                HospitalId: self.user.HospitalId,
                DialysisId: $stateParams.headerId
                // Items: self.Items
            };
        }
    }

    //when items changed    
    self.itemChange = function () {
        self.disabled = true;
        angular.forEach(self.checkedItems, function (value, key) {
            angular.forEach(value, function (val, k) {
                //if checkbox selected
                if (val == true) {
                    //set disabled to false, it enables the save button
                    self.disabled = false;
                }
            });
        });
        angular.forEach(self.checkedOtherItems, function (value, key) {
            angular.forEach(value, function (val, k) {
                //if checkbox selected
                if (val == true) {
                    //set disabled to false, it enables the save button
                    self.disabled = false;
                }
            });
        });
        if (self.regForm.Description !== '') {
            self.disabled = false;
        }
    };
    function checkCanAccess(createdUserId, dataStatus, modifiedId) {
        console.log('checkAccessible');
        self.canAccess = SettingService.checkAccessible({ createdUserId, dataStatus, modifiedId });
      }

    function processItems() {
        //loop through every checked items
        self.Items = {};
        angular.forEach(self.questions, function (value, key) {
            if (Object.keys(self.checkedItems).indexOf(value.Item) >= 0 || Object.keys(self.checkedOtherItems).indexOf(value.Item) >= 0) {
                self.Items[value.Item] = [];
            }
            if (Object.keys(self.checkedItems).indexOf(value.Item) >= 0 && !_.isEmpty(self.checkedItems[value.Item])) {
                angular.forEach(self.checkedItems[value.Item], function (v, k) {
                    if (v === true) {
                        self.Items[value.Item].push(k);
                    }
                });
            }
            if (Object.keys(self.checkedOtherItems).indexOf(value.Item) >= 0 && !_.isEmpty(self.checkedOtherItems[value.Item])) {
                angular.forEach(self.checkedOtherItems[value.Item], function (otherValue, otherKey) {
                    if (otherKey === 'Other' && otherValue === true) {
                        self.Items[value.Item].push(otherKey);
                    } else if (otherKey === 'OtherItem' && otherValue != '') {
                        self.Items[value.Item].push(otherValue);
                    }
                });
            }
        });
        self.regForm.Items = self.Items;
    }
    self.isSaving = false;
    self.submit = function submit() {
        self.isSaving = true;
        //self.regForm.CreatedTime = new Date(self.regForm.CreatedTime);
        self.regForm.RecordTime = new Date(self.regForm.RecordTime);

        //if it is edit
        if ($stateParams.Id) {
            self.regForm.ModifiedUserId = self.user.Id;
            self.regForm.ModifiedUserName = self.user.Name;
            self.regForm.Type = self.type;

            //check if other checkbox is checked and if the user has entered something
            angular.forEach(self.checkedItems, function (value, key) {
                angular.forEach(value, function (val, k) {
                    //delete anything with a value of false from the object
                    if (val == false) {
                        delete value[k];
                    }
                });
                if (_.isEmpty(value)) {
                    delete self.checkedItems[key];
                }
            });
            angular.forEach(self.checkedOtherItems, function (value, key) {
                angular.forEach(value, function (val, k) {
                    if (val === true && _.isEmpty(self.otherInput[key])) {
                        value.OtherItem = '';
                    } else if (val === true && !_.isEmpty(self.otherInput[key])) {
                        value.OtherItem = self.otherInput[key];
                    } else if (val == false) {
                        delete value[k];
                        delete value['OtherItem'];
                    }
                });
                if (_.isEmpty(value)) {
                    delete self.checkedOtherItems[key];
                }
            });
            processItems();
            //make a put request
            assessmentService.putRecord(self.regForm).then((res) => {
                //success
                if (res.status === 200) {
                    showMessage($translate('assessment.assessment.component.editSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                //fail
                console.log('error: ' + JSON.stringify(err));
                showMessage($translate('assessment.assessment.component.editFail'));
            }).finally(()=>{
            //console.log(self.checkedItems);
            console.log(self.regForm);
            self.isSaving = false;
            });
        } else {
            self.regForm.CreatedUserId = self.user.Id;
            self.regForm.CreatedUserName = self.user.Name;
            self.regForm.Type = self.type;

            //check if other checkbox is checked and if the user has entered something
            angular.forEach(self.checkedOtherItems, function (value, key) {
                angular.forEach(value, function (val, k) {
                    if (val === true && _.isEmpty(self.otherInput[key])) {
                        console.log('im other');
                        value.OtherItem = '';
                    } else if (val === true && !_.isEmpty(self.otherInput[key])) {
                        value.OtherItem = self.otherInput[key];
                    } else if (val == false) {
                        delete value[k];
                        delete value['OtherItem'];
                    }
                });
                if (_.isEmpty(value)) {
                    console.log('im empty');
                    delete self.checkedOtherItems[key];
                }
            });
            processItems();
            //make a post request.
            assessmentService.postRecord(self.regForm).then((res) => {
                if (res.status === 200) {
                    showMessage($translate('assessment.assessment.component.createSuccess'));
                    history.go(-1);
                }
            }).catch((err) => {
                showMessage($translate('assessment.assessment.component.createFail'));
                console.log('error: ' + JSON.stringify(err));
            }).finally(() => {
                self.isSaving = false;});
                console.log(self.regForm);
        }
    };

    // 回上一頁
    self.goback = function goback() {
        history.go(-1);
    };

}

import fixedBed from './fixedBed.html';
import './fixedBed.less';

angular.module('app').component('fixedBed', {
    template: fixedBed,
    controller: fixedBedCtrl,
    contrllerAs: '$ctrl'
});


fixedBedCtrl.$inject = ['$filter', 'showMessage', '$mdDialog', '$timeout', 'SettingService', 'PatientService', 'WardService', 'fixedBedService'];
function fixedBedCtrl($filter, showMessage, $mdDialog, $timeout, SettingService, PatientService, WardService, fixedBedService) {

    const self = this;
    const ARRANGEBEDWARD = SettingService.getUISettingParams().ARRANGEBEDWARD;

    let $translate = $filter('translate');
    // get all the wards
    // debugger;
    self.wards = SettingService.getCurrentUser().Ward;
    // get the keys of the wards
    self.keys = Object.keys(self.wards);

    // 看目前登入者上一次選擇的透析室為何，若無則取第一個透析室
    self.ward = SettingService.getUISettingByKey(ARRANGEBEDWARD) || self.keys[0];

    // loading for edit, create and delete
    // self.loadingBed = false;
    // previous selected patient
    self.previousSelectedPatient = {};

    let patients = [];
    const shifts = ['morning', 'afternoon', 'evening', 'night', 'temp'];  // 固定床位表僅三個班別
    self.days = [
        $translate('arrange.mon'),
        $translate('arrange.tue'),
        $translate('arrange.wed'),
        $translate('arrange.thurs'),
        $translate('arrange.fri'),
        $translate('arrange.sat'),
        $translate('arrange.sun')
    ];
    self.beds = [];
    let bedsInSetting = []; // 目前後台有的床號
    let wardName = self.wards[self.ward];
    self.selectedIndex = -1; // tab 上選取的 index (zero based)
    self.tabs = [
        { title: 'Week1' }
    ];

    // default mode value
    // self.mode = 'HD';
    // debugger;
    self.$onInit = function $onInit() {
        console.log('fixed bed init');
        self.loadingBed = true;
        self.selectedIndex = 0;
        getScrollbarWidth();
        // getAssignedPatients();
        loadPatients();
        getBeds(self.selectedIndex);
        // self.selectedIndex = 0;

        // for 動態調整表格寬度及高度
        window.addEventListener('resize', changeTableSize);

    };

    self.$onDestroy = function () {
        window.removeEventListener('resize', changeTableSize);
        $('tbody').off('scroll', fixedTheadAndFirstColumn);
    };

    function changeTableSize() {
        console.log('changeTableSize');

        // 確認有取到 element 才繼續往下做
        if (!document.getElementById('arrange-fixed-container') || !document.getElementById('arrange-fixed')) {
            return;
        }

        self.cellMaxWidth = document.querySelector('.bedCell').clientWidth;
        console.log('cell width', self.cellMaxWidth);

        // 取得 table-container 的寬高
        let width = document.getElementById('arrange-fixed-container').offsetWidth;

        // 取得要操作的 element
        let element = document.getElementById('arrange-fixed');
        element.style.width = width + 'px';

        // th or td width recount
        let ths = element.querySelectorAll('th');
        let tds = element.querySelectorAll('td');
        for (let i = 1; i < ths.length; i++) {
            // ths[i].style.width = Math.ceil((width - 66 - scrollbarWidth) / 7) + 'px';
            // tds[i].style.width = Math.floor((width - 66 - scrollbarWidth) / 7) + 'px';
            ths[i].style.width = Math.ceil((width - 66) / 7) + 'px';
            tds[i].style.width = Math.floor((width - 66) / 7) + 'px';
        }

        let thead = element.querySelector('thead');
        let tbody = element.querySelector('tbody');
        if (thead) {
            thead.style.width = (width - scrollbarWidth) + 'px';
        }

        if (tbody) {
            tbody.style.width = width + 'px';
        }
    }

    // 取得 scrollbar width
    // https://davidwalsh.name/detect-scrollbar-width
    let scrollbarWidth = 0; // scrollbar 寬度以方便計算 table的長寬
    function getScrollbarWidth() {
        let element = document.querySelector('fixed-bed');
        // Create the measurement node
        let scrollDiv = document.createElement('div');
        scrollDiv.className = 'scrollbar-measure';
        element.appendChild(scrollDiv);

        // Get the scrollbar width
        scrollbarWidth = (scrollDiv.offsetWidth - scrollDiv.clientWidth) > 0 ? (scrollDiv.offsetWidth - scrollDiv.clientWidth) : 15;    // for mac 若系統隱藏 scrollbar 會取不到，預設給 15px
        console.warn(scrollbarWidth); // Mac:  15

        // Delete the DIV
        element.removeChild(scrollDiv);
    }

    // 固定第一欄及第一列的 table
    // https://jsfiddle.net/RMarsh/bzuasLcz/3/
    function fixedTheadAndFirstColumn() {
        /*
        Setting the thead left value to the negative valule of tbody.scrollLeft will make it track the movement
        of the tbody element. Setting an elements left value to that of the tbody.scrollLeft left makes it maintain it's relative position at the left of the table.    
        */
        $('thead').css('left', -$('tbody').scrollLeft()); // fix the thead relative to the body scrolling
        $('thead th:nth-child(1)').css('left', $('tbody').scrollLeft()); // fix the first cell of the header
        $('tbody td:nth-child(1)').css('left', $('tbody').scrollLeft()); // fix the first column of tdbody
    }

    self.addNewWeek = function () {
        console.log('new week added');
        self.tabs.push({ title: 'Week2' });
        self.selectedIndex = 1;
        self.loadFixedBeds(self.selectedIndex);
    };

    self.loadFixedBeds = function (index) {
        // debugger;
        // loadPatients();
        // getBeds();
        self.loadingBed = true;
        self.selectedIndex = index;
        console.log('index', index);
        getAssignedPatients(index);
    };

    // get all the patients that has been assigned
    let assignedBeds = [];
    function getAssignedPatients(week) {
        // get assigned patients by wardId
        fixedBedService.getByWardId(self.ward).then((res) => {
            console.log('assigned patients', res);
            self.week1Length = _.filter(res.data, (a) => {
                return a.Week === '1';
            }).length;
            // debugger;
            if (self.week1Length > 0 && week === 0 && self.tabs.length < 2) {
                self.tabs.push({ title: 'Week2' });
            } else if (self.week1Length === 0 && self.tabs.length === 2 && week === 0) {
                self.tabs.splice(1, 1);
            }
            // debugger;
            // filter patients by week
            assignedBeds = _.filter(res.data, (a) => {
                return a.Week === week.toString();
            });
            console.log('filtered assignedBeds', assignedBeds);
            getDaysInWeek(week);

            // 需等畫面長好
            $timeout(() => {
                $('tbody').off('scroll', fixedTheadAndFirstColumn);
                $('tbody').on('scroll', fixedTheadAndFirstColumn);
                changeTableSize();
            }, 0);
        }).catch(() => {
            self.loadingBed = false;
            self.loadingBedsErr = true;
        });
    }

    // get all the beds in a specific ward
    function getBeds(index) {
        // self.isLoadingBedsFinished = false;
        // get beds by ward id
        // debugger;
        WardService.getById(self.ward).then((res) => {
            // debugger;
            self.wardMemo = res.data.Memo;

            if (Array.isArray(res.data.BedNos)) {
                for (let i = 0; i < res.data.BedNos.length; i++) {
                    //查群組名
                    let groupName = "";
                    _.forEach(res.data.BedGroups, (group) => {
                        _.forEach(group.BedNos, (bedno) => {
                            if (bedno === res.data.BedNos[i]) {
                                groupName = group.Name;
                            }
                        });
                    });
                    const b = {
                        No: res.data.BedNos[i],
                        Group: groupName
                    };
                    bedsInSetting.push(b);
                }
            }
            // sort by bed number
            // bedsInSetting = _.orderBy(bedsInSetting, ['No']);
            console.log('sort finished', bedsInSetting);

            // clone bedsInSettings
            self.beds = angular.copy(bedsInSetting);
            console.log('getBeds');
            self.loadFixedBeds(index);
            // getDaysInWeek();

        });
    }

    // load all the patients
    function loadPatients() {
        // self.isLoadingPatientsFinished = false;
        self.loadingPatients = true;
        PatientService.getByUserId(SettingService.getCurrentUser().Id).then((res) => {

            patients = res.data.sort((a, b) => {
                if (a.MedicalId > b.MedicalId) return 1;
                return -1;
            });
            self.patients = angular.copy(patients);
            // self.bedPatients = angular.copy(patients);
            console.log('all the patients', self.patients);
            self.loadingPatients = false;
            // self.isLoadingPatientsFinished = true;
        }, () => {
            self.loadingPatients = false;
            self.loadingPatientsErr = true;
        });
    }

    // populate monday to sunday and assign default values for each day
    // assign the patients for each day
    function getDaysInWeek(week) {
        console.log('getDaysInWeek');
        self.daysInWeek = [];

        let groupedAssignedBeds = _.groupBy(assignedBeds, 'BedNo');

        for (let i = 0; i < 7; i++) {
            // let pushDate = i !== 0 ? moment(firstDateInWeek.add(1, 'd')) : moment(firstDateInWeek);
            self.daysInWeek.push({
                Weekday: fixedBedService.convertNoToWeekday(i)
            });

            // initialize assign beds in each day
            self.daysInWeek[i].AssignBed = {};  // 存這天的所有排床資訊，以床號當作 key

            _.forEach(self.beds, (b) => {
                // 以 bedNo 為 key
                if (!self.daysInWeek[i].AssignBed[b.No]) {
                    self.daysInWeek[i].AssignBed[b.No] = {};
                }
                _.forEach(shifts, (shift) => {

                    let index = -1;
                    if (groupedAssignedBeds[b.No]) {
                        // 與從資料庫抓來的資料比對日期，若日期相同且班別相同則塞進前端顯示的資料裡，可能會有多筆 (不同班別)
                        index = _.findIndex(groupedAssignedBeds[b.No], (o) => {
                            return o.Weekday === self.daysInWeek[i].Weekday && shift === o.Shift;
                        });
                    }

                    if (index > -1) {
                        self.daysInWeek[i].AssignBed[b.No][shift] = groupedAssignedBeds[b.No][index];
                        // 將已塞的資料從 assignBed 移除
                        groupedAssignedBeds[b.No].splice(index, 1);
                    } else {
                        self.daysInWeek[i].AssignBed[b.No][shift] = {
                            Weekday: fixedBedService.convertNoToWeekday(i),
                            BedNo: b.No,
                            Shift: shift,
                            PatientId: '',
                            PatientName: '',
                            WardId: self.ward
                        };
                    }

                });
            });
        }

        // ex. [[...], [...]]
        // 塞完後台床位資料後，若 groupedAssignedBeds 裡仍有資料，表示未存在後台目前的床號裡，需另外處理
        let notInSettings = _.filter(groupedAssignedBeds, (o) => { return o.length > 0; });
        console.log('notInSettings', notInSettings);
        if (notInSettings.length === 0) {
            self.loadingBed = false;
            self.loadingBedsErr = false;
            self.loading = false;
            return;
        }

        for (let i = 0; i < 7; i++) {
            _.forEach(notInSettings, (value) => {
                if (i === 0) {
                    self.beds.push({ No: value[0].BedNo, Count: value.length, isNotInSetting: true });
                }

                _.forEach(shifts, (shift) => {
                    // 以 bedNo 為 key
                    if (!self.daysInWeek[i].AssignBed[value[0].BedNo]) {
                        self.daysInWeek[i].AssignBed[value[0].BedNo] = {};
                    }

                    let index = -1;
                    // 與從資料庫抓來的資料比對日期，若日期相同且班別相同則塞進前端顯示的資料裡，可能會有多筆 (不同班別)
                    index = _.findIndex(value, (o) => {
                        return o.Weekday === self.daysInWeek[i].Weekday && shift === o.Shift;
                    });

                    if (index > -1) {
                        self.daysInWeek[i].AssignBed[value[0].BedNo][shift] = value[index];
                    } else {
                        self.daysInWeek[i].AssignBed[value[0].BedNo][shift] = {
                            Weekday: fixedBedService.convertNoToWeekday(i),
                            BedNo: value[0].BedNo,
                            Shift: shift,
                            PatientId: '',
                            PatientName: '',
                            WardId: self.ward
                        };
                    }

                });
            });
        }
        // debugger;
        console.log('self.daysInWeek', self.daysInWeek);
        self.loadingBed = false;
        self.loadingBedsErr = false;
        self.loading = false;
    }

    // when shift is clicked
    self.previousId = '';
    self.selectedPatient = {};
    // self.mode = 'HD';
    self.changeEditMode = function (data, cannotNew = false) {
        // 若正在新增或修改，或是已不在後台床號且為新增則不做下面事情
        if (data.loadingBedCell || (cannotNew && !data.PatientId)) {
            return;
        }

        self.cellMaxWidth = document.querySelector('.bedCell') ? document.querySelector('.bedCell').clientWidth : 0;
        data.editing = !data.editing;

        // 正在編輯中的資料
        if (!data.edit) {
            data.edit = {};
        }

        if (!data.editing) {
            // 需把暫存已存 patientList 中的病人刪掉
            data.edit = {};
            data.searchPatientText = '';
            return;
        }

        data.bedPatients = filterPatients(data);

        // edit if it contains patient id
        if (data.PatientId) {
            data.edit.status = 'edit';
        } else {
            data.edit.status = 'new';
        }

        let searchId = self.highlightPatient.Id ? self.highlightPatient.Id : data.PatientId;


        data.edit.patient = _.find(data.bedPatients, { Id: searchId });

        if (data.DialysisMode) {
            data.edit.mode = data.DialysisMode;
        } else {
            data.edit.mode = 'HD';
        }
        console.log('patiient', self.selectedPatient);

    };

    self.selectedFirstMeetPatient = function (value) {
        // 已有選取的病人則不需做
        if (value.edit.patient) {
            return;
        }
        // let result = searchPatients(self.searchPatientText);
        value.edit.patient = value.bedPatients.length > 0 && value.searchPatientText ? value.bedPatients[0] : null;
    };

    // save/edit
    self.assignFixedBed = function (event, item, weekday) {
        // debugger;
        event.stopPropagation();
        if (!item.edit) {
            return;
        }
        console.log('status', item.edit.status);
        console.log('item', item);
        let data = [];
        const fixedBedObj = {
            PatientId: item.edit.patient.Id,
            PatientName: item.edit.patient.Name,
            PatientGender: item.edit.patient.Gender,
            MedicalId: item.edit.patient.MedicalId,
            WeekDay: weekday,
            Shift: item.Shift,
            BedNo: item.BedNo,
            DialysisMode: item.edit.mode,
            HospitalId: SettingService.getCurrentHospital().Id,
            WardId: self.ward,
            WardName: wardName,
            Week: self.selectedIndex
        };
        console.log('fixedBedObj', fixedBedObj);

        item.loadingBedCell = true;
        // create fixed bed
        if (item.edit.status === 'new') {
            fixedBedObj.CreatedUserId = SettingService.getCurrentUser().Id;
            fixedBedObj.CreatedUserName = SettingService.getCurrentUser().Name;

            data.push(fixedBedObj);
            console.log('data', data);
            fixedBedService.postRecord(data).then((res) => {
                if (res.status === 200) {
                    showMessage('新增成功');
                    // self.isLoading = false;
                    item.loadingBedCell = false;
                    item.edit = {};
                    item.editing = !item.editing;

                    angular.extend(item, res.data[0]);
                }
            }, (err) => {
                // self.isLoading = false;
                item.loadingBedCell = false;
                if (err.data) {
                    self.arrangeFixedBedErr = true;
                } else {
                    showMessage(lang.ComServerError);
                }
            });
        } else {
            // edit fixed bed
            fixedBedObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            fixedBedObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            fixedBedObj.ModifiedTime = moment();
            fixedBedObj.Id = item.Id;

            fixedBedService.putRecord(fixedBedObj).then((res) => {

                if (res.status === 200) {
                    showMessage($translate('customMessage.UPDATE_COMPLETED'));
                    // self.isLoading = false;
                    item.loadingBedCell = false;

                    // let indexDay = _.findIndex(self.daysInWeek, (d) => {
                    //     return d.Weekday === day.Weekday;
                    // });
                    // self.daysInWeek[indexDay].AssignBed[item.BedNo][shift] = fixedBedObj;
                    item.edit = {};
                    item.editing = !item.editing;
                    angular.extend(item, res.data);
                    console.log('daysInWeek', self.daysInWeek);
                }
            }, (err) => {
                // self.isLoading = false;
                item.loadingBedCell = false;
                if (err.data) {
                    self.arrangeFixedBedErr = true;
                } else {
                    showMessage(lang.ComServerError);
                }
            });
        }
    };

    // delete patient in bed
    self.deletePatient = function (event, data, day, shift) {
        console.log('delete');
        $mdDialog.show({
            controller: ['$mdDialog', DialogController],
            templateUrl: 'deleteDialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog) {
            const vm = this;

            vm.hide = function () {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function () {
                self.loadingBedCell = true;
                console.log('deleted!!!!', data.Id);
                // reset the data when deleted
                let resetData = {
                    Weekday: data.Weekday,
                    BedNo: data.BedNo,
                    Shift: data.Shift,
                    PatientId: '',
                    PatientName: '',
                    WardId: self.ward
                };
                fixedBedService.deleteRecord(data.Id).then((res) => {
                    if (res.status === 200) {
                        self.loadingBedCell = false;
                        showMessage($translate('customMessage.DataDeletedSuccess'));
                        vm.hide();
                        let indexDay = _.findIndex(self.daysInWeek, (d) => {
                            return d.Weekday === day.Weekday;
                        });

                        self.daysInWeek[indexDay].AssignBed[data.BedNo][shift] = resetData;

                        self.clickedId = '';
                        self.previousId = '';
                    }
                }, (err) => {
                    self.loadingBed = false;
                    if (err.data) {
                        self.arrangeFixedBedErr = true;
                    } else {
                        showMessage(lang.ComServerError);
                    }
                });
            };
        }
    };

    self.changeWard = function (ward) {
        self.selectedIndex = 0;
        self.loadingBed = true;
        self.clickedId = '';
        self.previousId = '';
        console.log('ward', ward);
        bedsInSetting = [];
        assignedBeds = [];
        SettingService.setUISetting({ name: ARRANGEBEDWARD, value: ward });
        getBeds(self.selectedIndex);
    };

    self.highlightPatient = {};
    self.selectPatient = function (patient) {
        console.log('patient selected', patient);
        if (self.highlightPatient.isSelected) {
            self.highlightPatient.isSelected = false;
        }

        if (self.highlightPatient.Id === patient.Id) {
            self.highlightPatient = {};
        } else {
            self.highlightPatient = patient;
            patient.isSelected = true;
        }
        console.log('highlighted patient', self.highlightPatient);
    };

    // search patient
    self.searchPatient = function (search, type = 'patientList') {
        let searchStr = search.searchPatientText ? search.searchPatientText : search;
        let searchRegex = new RegExp(searchStr, 'i');
        // 左邊病人列表
        if (type === 'patientList') {
            self.highlightPatient = {};
            self.patients = _.filter(angular.copy(patients), (p) => {
                return searchRegex.test(p.Name) || searchRegex.test(p.MedicalId);
            });
        } else {
            // 每個 cell 裡的
            search.bedPatients = _.filter(filterPatients(search), (p) => {
                return searchRegex.test(p.Name) || searchRegex.test(p.MedicalId);
            });
        }

        console.log(search);
        console.log(type);

        return search.bedPatients;

    };

    self.clearSearch = function (data) {
        // debugger;
        console.log('has patient');
        data.searchBedPatient = '';
        data.bedPatients = filterPatients(data);
    };

    // 取得可 assign 的病人（剔除此天及班次已排的病人）-> 20190411 vida建議改為提示不要直接濾掉
    function filterPatients(data) {
        let patientCopy = angular.copy(patients);

        let result = _.filter(self.daysInWeek[fixedBedService.convertWeekdayToNo(data.Weekday)].AssignBed, (value, key) => {
            // key: bedNo, value: {morning:...}
            return  value[data.Shift].PatientId
                    && value[data.Shift].Id !== data.Id;
        }).map((value, key) => {
            return value[data.Shift]
        });

        if (result.length > 0) {
            let index = -1;
            result.forEach((record) => {
                index = _.findIndex(patientCopy, { Id: record.PatientId });
                if (index > -1) {
                    // patientCopy.splice(index, 1);
                    patientCopy[index].HintMessage = 'arranged'; // 該天該班別已排床過
                    patientCopy[index].HintBed = record.BedNo; // 已排在床位 
                }
            });
        }

        return patientCopy;
    }

    self.back = function () {
        history.back();
    };

}

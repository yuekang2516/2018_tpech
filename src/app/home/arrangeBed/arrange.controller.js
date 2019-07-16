

// 排床、修改和刪除共用的 Controller
angular
    .module('app')
    .filter('shift', function ($filter) {
        let $translate = $filter('translate');
        return function (shift) {
            switch (shift) {
                case 'morning':
                    return $translate('arrange.morning');
                case 'afternoon':
                    return $translate('arrange.afternoon');
                case 'evening':
                    return $translate('arrange.evening');
                case 'night':
                    return $translate('arrange.night');
                case 'temp':
                    return $translate('arrange.temp');
                default:
                    return '';
            }
        };
    })
    .controller('ArrangeController', ArrangeController);

ArrangeController.$inject = ['$scope', 'SettingService', 'bedService', '$mdDialog', 'showMessage', 'data', 'mode', 'changePatient', '$filter'];

function ArrangeController($scope, SettingService, bedService, $mdDialog, showMessage, data, mode, changePatient, $filter) {
    const self = this;
    const $translate = $filter('translate');
    console.log('arrange data', data);

    self.mode = mode;   // 判別是編輯單筆(single)還是多筆
    self.patients = angular.copy(data.patients);

    self.takeDayoffOnly = data.takeDayoffOnly;
    self.isDayoff = self.takeDayoffOnly;

    // 準備資料
    if (data.assignBed) {
        data.assignBed.AssignDate = data.assignBed.AssignDate ? new Date(data.assignBed.AssignDate) : null;
        self.assignBedCopy = angular.copy(data.assignBed);  // 先複製一份 parent 來的 data 供前端操作

        // 判斷請假能不能刪除，今天以前的不能刪
        if (data.assignBed.Type === 'dayoff') {
            self.cannotDel = !recordIsFuture(data.assignBed.AssignDate);
        }

    } else {
        self.assignBedCopy = {
            Nurses: [],
            Weeks: [],
            WardId: data.wardId
        };
    }

    self.beds = data.beds;

    // doctors and nurses
    const oriDoctors = data.users.filter(user => user.Role === 'doctor');   // 因有搜尋功能，需保留原始資料
    const oriNurses = data.users.filter(user => user.Role === 'nurse');     // 因有搜尋功能，需保留原始資料
    self.doctors = oriDoctors;
    self.nurses = oriNurses;
    console.log('nurses', self.nurses);
    self.selectedNurses = [];

    // search implementation
    self.searchTerm = '';
    self.searchNurseTerm = '';

    self.dayoffRecords = [];

    // 當變更日期、床號、班次時都需要檢查有無病人請假並從清單中剔掉
    self.filterPatients = function (date, shift) {
        // 先回復最原始的病患清單
        self.patients = angular.copy(data.patients);

        // 剔除請假的病患，可能會有多位
        let dayoffRecords = data.getDayoffRecords(date, shift);

        console.log('請假的病人 dayoffRecords', dayoffRecords);

        // 若為修改需把同一筆濾掉 -> 20190411 vida建議改為提示不要直接濾掉
        // 該天該班別已經排在床位上的病人：arrangePatients
        let arrangePatients = data.getAssignRecords(date, shift).filter((o) => { return o.Id !== data.assignBed.Id; });
        console.log('arrangePatients 1', arrangePatients);
        // let notInListPatients = dayoffRecords.concat(data.getAssignRecords(date, shift).filter((o) => { return o.Id !== data.assignBed.Id; }));

        // 請假
        if (dayoffRecords.length > 0) {
            let index = -1;
            dayoffRecords.forEach((record) => {

                index = _.findIndex(self.patients, { Id: record.PatientId });
                if (index > -1) {
                    // 標記請假
                    self.patients[index].HintMessage = 'dayoff'; // 該天該班別已排床過
                }
            });
        }

        // 已排過
        if (arrangePatients.length > 0) {
            let index = -1;
            arrangePatients.forEach((record) => {

                index = _.findIndex(self.patients, { Id: record.PatientId });
                if (index > -1) {
                    // 標記該天該班別已排過
                    self.patients[index].HintMessage = 'arranged'; // 該天該班別已排床過
                    self.patients[index].HintBed = record.BedNo; // 已排在床位 
                }
            });
        }

        console.log('arrangePatients 2', arrangePatients);

        // if (notInListPatients.length > 0) {
        //     let index = -1;
        //     notInListPatients.forEach((record) => {
        //         index = _.findIndex(self.patients, { Id: record.PatientId });
        //         if (index > -1) {
        //             self.patients.splice(index, 1);
        //         }
        //     });

        //     // 判斷目前選擇的 patient 還在不在請單中，若不在了須清空
        //     if (self.selectedPatient && data.assignBed.Type !== 'dayoff' && _.findIndex(self.patients, { Id: self.selectedPatient.Id }) === -1) {
        //         self.selectedPatient = null;
        //     }
        // }

        // 病患搜尋用
        // self.patientsForSearch = angular.copy(self.patients);
        canTakeDayoff(dayoffRecords);
    };





    // self.filterPatients = function (date, shift) {
    //     // 先回復最原始的病人清單
    //     self.patients = angular.copy(data.patients);

    //     // 剔除請假的病人，可能會有多位
    //     let dayoffRecords = data.getDayoffRecords(date, shift);

    //     // 若為修改需把同一筆濾掉
    //     let notInListPatients = dayoffRecords.concat(data.getAssignRecords(date, shift).filter((o) => { return o.Id !== data.assignBed.Id; }));

    //     if (notInListPatients.length > 0) {
    //         let index = -1;
    //         notInListPatients.forEach((record) => {
    //             index = _.findIndex(self.patients, { Id: record.PatientId });
    //             if (index > -1) {
    //                 self.patients.splice(index, 1);
    //             }
    //         });

    //         // 判斷目前選擇的 patient 還在不在請單中，若不在了須清空
    //         if (self.selectedPatient && data.assignBed.Type !== 'dayoff' && _.findIndex(self.patients, { Id: self.selectedPatient.Id }) === -1) {
    //             self.selectedPatient = null;
    //         }
    //     }

    //     canTakeDayoff(dayoffRecords);
    // };

    // 是否能新增或修改請假紀錄
    // 有固定床位，且為今天以後
    function canTakeDayoff(dayoffRecords) {
        if (self.mode !== 'single') {
            return;
        }

        // 判斷有無這個日期這個班次這個床位的請假紀錄，若已有請假紀錄則不能選請假的 type
        let hasDayoff = _.findIndex(dayoffRecords, (o) => {
            return moment(o.AssignDate).format('YYYYMMDD') === moment(self.assignBedCopy.AssignDate).format('YYYYMMDD')
                && o.Shift === self.assignBedCopy.Shift
                && o.BedNo === self.assignBedCopy.BedNo
                && o.Id !== data.assignBed.Id;
        }) > -1;

        // 看這個位置是否有固定床位
        if (hasDayoff || !recordIsFuture(self.assignBedCopy.AssignDate)) {
            dayoffInit();
        } else {
            let fixedRecord = data.getFixedRecordsByBedAndDateAndShift(
                {
                    BedNo: self.assignBedCopy.BedNo,
                    AssignDate: self.assignBedCopy.AssignDate,
                    Shift: self.assignBedCopy.Shift,
                    PatientId: self.selectedPatient ? self.selectedPatient.Id : ''
                });
            if (!fixedRecord) {
                dayoffInit();
                return;
            }

            self.canTakeDayoff = true;
        }
    }
    function dayoffInit() {
        self.assignBedCopy.Type = data.assignBed ? data.assignBed.Type : '';
        self.canTakeDayoff = false;
    }
    // 包含今日
    function recordIsFuture(date) {
        return moment(moment().format('YYYY/MM/DD')).diff(moment(moment(date).format('YYYY/MM/DD')), 'days') <= 0;
    }

    self.searchPatients = function () {
        self.searchPatientResults = searchPatients(self.searchPatientText);
    };

    self.checkCanTakeDayoff = function () {
        if (mode === 'single') {
            let dayoffRecords = data.getDayoffRecords(self.assignBedCopy.AssignDate, self.assignBedCopy.Shift);
            canTakeDayoff(dayoffRecords);
        }
    };

    // 選取病人
    self.selectedItemChange = function () {
        self.checkCanTakeDayoff();
    };

    // 若目前未選取病人，自動選取最符合的病人（結果中第一個）
    self.selectedFirstMeetPatient = function () {
        // 已有選取的病人則不需做
        if (self.selectedPatient) {
            return;
        }
        // let result = searchPatients(self.searchPatientText);
        self.selectedPatient = self.searchPatientResults.length > 0 ? self.searchPatientResults[0] : null;
        self.checkCanTakeDayoff();
    };

    // 依照 query 字串模糊搜尋病人
    function searchPatients(query = '') {
        if (query) {
            query = query.toLowerCase();
            // 若包含 - 表示有可能為直接選取的 ex. 123-demopatient
            if (query.includes('-')) {
                let queryAry = query.split('-');
                return _.filter(self.patients, (p) => {
                    if (queryAry.length > 1) {
                        return p.Name.toLowerCase().includes(queryAry[1]) || p.MedicalId.toLowerCase().includes(queryAry[0]);
                    }
                    return p.MedicalId.toLowerCase().includes(queryAry[0]);
                });
            }

            return _.filter(self.patients, (p) => {
                return p.Name.toLowerCase().includes(query) || p.MedicalId.toLowerCase().includes(query);
            });
        }
        return [];
    }

    // 計算統計的天數
    function countDays(Beds) {
        let weekdaysCount = [0, 0, 0, 0, 0, 0, 0];

        _.forEach(Beds, (bed) => {
            weekdaysCount[moment(bed.AssignDate).weekday()]++;
        });

        // 計算完後判斷如果數字大於2，可推斷為慣例排床日，並把介面上的星期幾打勾
        for (let i = 0; i < weekdaysCount.length; i++) {
            if (weekdaysCount[i] > 2) {
                switch (i) {
                    case 0:
                        self.sunday = true;
                        break;
                    case 1:
                        self.monday = true;
                        break;
                    case 2:
                        self.tuesday = true;
                        break;
                    case 3:
                        self.wednesday = true;
                        break;
                    case 4:
                        self.thursday = true;
                        break;
                    case 5:
                        self.friday = true;
                        break;
                    default: // 6
                        self.saturday = true;
                        break;
                }
            }
        }
        console.log('weekdaysCount', weekdaysCount);

    }

    // search function
    self.searchDoc = function (search, role) {
        let searchRegex = new RegExp(search, 'i');
        if (role === 'doctor') {
            self.doctors = _.filter(angular.copy(oriDoctors), (d) => {
                return searchRegex.test(d.Name) || searchRegex.test(d.EmployeeId);
            });
        } else {
            self.nurses = _.filter(angular.copy(oriNurses), (n) => {
                return searchRegex.test(n.Name) || searchRegex.test(n.EmployeeId);
            });
        }
    };
    // clear search and load user data
    self.clearSearch = function () {
        self.searchTerm = '';
        self.doctors = oriDoctors;
    };

    // select nurse && add chips
    // array to store selected nurses
    // select nurse function
    self.selectNurse = function (nurse) {
        console.log('$scope.arrangeForm', $scope.arrangeForm);
        // 由程式控制的增減不會使 form 變為 dirty，需用程式的方式給
        $scope.arrangeForm.$setDirty();
        // if nurse is selected
        if (nurse.isSelected) {
            // mark isSelected to false and delete the nurse in the array
            nurse.isSelected = false;
            self.selectedNurses.splice(_.findIndex(self.selectedNurses, (n) => { return n.Id === nurse.Id; }), 1);
        } else {
            // push it to array if nurse is added and set isSelected to true
            nurse.isSelected = true;
            self.selectedNurses.push(nurse);
        }
        console.log('selected nurses', self.selectedNurses);
    };
    // remove chips
    self.removeNurse = function (chip) {
        chip.isSelected = false;
        console.log('remove nurse', chip);
        console.log('selected nurse removed', self.selectedNurses);
    };

    // 請假
    // self.showDayoff = function (record) {
    //     let item = data;
    //     item.assignBed = record;

    //     // data.showArrange(item, 'single');

    //     // 設定對話視窗參數
    //     // const confirm = $mdDialog.confirm()
    //     //     .title($translate('bed.component.confirmDelete'))
    //     //     .textContent($translate('bed.component.deleteRecord'))
    //     //     .ariaLabel('delete confirm')
    //     //     .multiple(true)
    //     //     .ok($translate('bed.component.delete'))
    //     //     .cancel($translate('bed.component.cancel'));

    //     // $mdDialog.show(confirm).then(() => {
    //     //     self.isLoading = true;
    //     //     bedService.deleteAssignBed(record.Id).then(() => {
    //     //         showMessage($translate('bed.component.deleteBedSuccess'));

    //     //         // refresh beds/patients count
    //     //         for (let i = 0; i < data.beds.length; i++) {
    //     //             if (data.beds[i].No === record.Bed) {
    //     //                 data.beds[i].Count -= 1;
    //     //                 break;
    //     //             }
    //     //         }
    //     //         for (let i = 0; i < data.patients.length; i++) {
    //     //             if (data.patients[i].Id === record.PatientId) {
    //     //                 data.patients[i].Count -= 1;
    //     //                 break;
    //     //             }
    //     //         }

    //     //         // 清空此資料
    //     //         angular.extend(record, {
    //     //             Id: '',
    //     //             PatientId: '',
    //     //             PatientName: '',
    //     //             MedicalId: '',
    //     //             Gender: '',
    //     //             Doctor: {},
    //     //             Nurses: {},
    //     //             Mode: '',
    //     //             Type: ''
    //     //         });
    //     //         // 回復病人清單資料
    //     //         self.filterDayoffPatients(record.AssignDate, record.Shift);
    //     //     }).catch((res) => {
    //     //         if (res.data !== undefined) {
    //     //             showMessage(res.data);
    //     //         } else {
    //     //             showMessage($translate('customMessage.serverError')); // lang.ComServerError
    //     //         }
    //     //     }).finally(() => {
    //     //         self.isLoading = false;
    //     //     });
    //     // });
    // };

    self.cancel = function () {
        $mdDialog.cancel();
        self.editMode = false;
    };

    self.arrangeErr = false;
    self.repeatDateAry = [];
    self.save = function save() {
        // saving
        self.isLoading = true;

        // 直接按排床按鈕
        self.assignBedCopy.Weeks = [];
        if (mode !== 'single') {
            if (self.sunday) self.assignBedCopy.Weeks.push('0');
            if (self.monday) self.assignBedCopy.Weeks.push('1');
            if (self.tuesday) self.assignBedCopy.Weeks.push('2');
            if (self.wednesday) self.assignBedCopy.Weeks.push('3');
            if (self.thursday) self.assignBedCopy.Weeks.push('4');
            if (self.friday) self.assignBedCopy.Weeks.push('5');
            if (self.saturday) self.assignBedCopy.Weeks.push('6');
        } else {
            // 直接按月曆上的須自己組 week(Weeks), startDate(StartTime), (endDate)EndTime Todo 或是再多一個 api 單獨新增一天?
            self.assignBedCopy.Weeks.push((moment(self.assignBedCopy.AssignDate).isoWeekday() === 7 ? 0 : moment(self.assignBedCopy.AssignDate).isoWeekday()).toString());
            self.assignBedCopy.StartTime = self.assignBedCopy.AssignDate;
            self.assignBedCopy.EndTime = self.assignBedCopy.AssignDate;
        }
        self.assignBedCopy.BedNo = self.assignBedCopy.BedNo;

        // 先檢查必填欄位
        if (validCheck() === false) {
            self.isLoading = false;
            showMessage($translate('bed.component.chooseDay'));
            return;
        }

        // MedicalId and WardId
        if (data.selected.MedicalId === undefined || data.selected.WardId === undefined) {
            for (let i = 0; i < data.patients.length; i++) {
                if (data.patients[i].Id === self.patient) {
                    data.selected.WardId = data.patients[i].WardId;
                    break;
                }
            }
        }

        // 組 Nurses 資料
        let nurses = {};
        let doctor = {};
        if (self.selectedNurses) {
            self.selectedNurses.forEach((nurse) => {
                nurses[nurse.Id] = nurse.Name;
            });
        }
        self.assignBedCopy.Nurses = nurses;

        if (self.doctor) {
            doctor[self.doctor.Id] = self.doctor.Name;
        }

        self.assignBedCopy.Doctor = doctor;

        // 組 Patient 相關資料
        self.assignBedCopy.PatientId = self.selectedPatient.Id;
        self.assignBedCopy.PatientName = self.selectedPatient.Name;
        self.assignBedCopy.MedicalId = self.selectedPatient.MedicalId;
        self.assignBedCopy.PatientGender = self.selectedPatient.Gender;

        self.assignBedCopy.CreatedUserId = SettingService.getCurrentUser().Id;
        self.assignBedCopy.CreatedUserName = SettingService.getCurrentUser().Name;

        console.log('self.doctor', self.doctor);
        console.log('arrangeData', self.assignBedCopy);

        bedService.saveAssignBed(self.assignBedCopy).then((res) => {
            let msg = self.assignBedCopy.Type === 'dayoff' ? $translate('bed.component.takeDayoffSuccess') : $translate('bed.component.arrangeBedSuccess');
            showMessage(msg);
            // 前端同步變更
            if (mode === 'single') {
                // TODO assign to AssignBed or Dayoff
                // data.assignBed = angular.extend(data.assignBed, res.data[0]);

                // refresh beds/patients count TODO refresh dayoff count
                if (res.data[0]) {
                    let bedIndex = _.findIndex(data.beds, { No: res.data[0].BedNo });
                    data.beds[bedIndex].Count += 1;

                    let patientIndex = _.findIndex(data.patients, { Id: res.data[0].PatientId });
                    data.patients[patientIndex].Count += 1;
                }

            }

            self.nurses.forEach((ele) => {
                ele.isSelected = false;
            });

            self.isLoading = false;
            $mdDialog.hide(res);
        }, (err) => {
            self.isLoading = false;
            if (err.data) {
                self.arrangeErr = true;
                self.repeatDateAry = err.data.split('|');
                // 滑到置底以顯是錯誤訊息
                setTimeout(() => {
                    document.querySelector('.md-dialog-content').scroll(0, document.querySelector('.md-dialog-content').scrollHeight);
                }, 0);
            } else {
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            }
        });
    };

    self.edit = function edit() {
        console.log('patient', self.selectedpatient);
        self.isLoading = true;

        let nurses = {};
        let doctor = {};
        if (self.selectedNurses) {
            self.selectedNurses.forEach((nurse) => {
                nurses[nurse.Id] = nurse.Name;
            });
        }
        self.assignBedCopy.Nurses = nurses;

        if (self.doctor) {
            doctor[self.doctor.Id] = self.doctor.Name;
        }
        self.assignBedCopy.Doctor = doctor;

        // 組 Patient 相關資料
        self.assignBedCopy.PatientId = self.selectedPatient.Id;
        self.assignBedCopy.PatientName = self.selectedPatient.Name;
        self.assignBedCopy.MedicalId = self.selectedPatient.MedicalId;
        self.assignBedCopy.PatientGender = self.selectedPatient.Gender;

        self.assignBedCopy.ModifiedUserId = SettingService.getCurrentUser().Id;
        self.assignBedCopy.ModifiedUserName = SettingService.getCurrentUser().Name;

        console.log('bed edit', self.assignBedCopy);

        bedService.editAssignBed(self.assignBedCopy).then((res) => {
            // TODO assign to AssignBed or Dayoff

            // 若變動完新的日期為本周，依變動的病人或床位進行加減，TODO dayoff count
            if (moment(data.assignBed.AssignDate).isoWeek() === moment(self.assignBedCopy.AssignDate).isoWeek()) {
                // 若病人變動且新的日期為本月，原本病人 Count -1, 新病人 Count +1
                if (data.assignBed.PatientId !== self.selectedPatient.Id) {
                    // 原床位 Count - 1
                    let patientIndex = _.findIndex(data.patients, { Id: data.assignBed.PatientId });
                    data.patients[patientIndex].Count -= 1;

                    // 新床位 Count + 1
                    patientIndex = _.findIndex(data.patients, { Id: self.selectedPatient.Id });
                    data.patients[patientIndex].Count += 1;

                }

                // 若床位變動且新的日期為本月，原本床位 count -1，新的床位 count + 1
                if (data.assignBed.BedNo !== self.assignBedCopy.BedNo) {
                    // 原床位 Count - 1
                    let bedIndex = _.findIndex(data.beds, { No: data.assignBed.BedNo });
                    data.beds[bedIndex].Count -= 1;

                    // 新床位 Count + 1
                    bedIndex = _.findIndex(data.beds, { No: self.assignBedCopy.BedNo });
                    data.beds[bedIndex].Count += 1;

                }
            } else {
                // 若日期變動到其他月份，則床及病人的 count - 1
                // 原床位 Count -1
                let bedIndex = _.findIndex(data.beds, { No: data.assignBed.BedNo });
                data.beds[bedIndex].Count -= 1;

                // 病人 Count -1
                let patientIndex = _.findIndex(data.patients, { Id: data.assignBed.PatientId });
                data.patients[patientIndex].Count -= 1;

            }

            console.log('Before assignbed', angular.copy(data.assignBed));

            // 將更改的值賦值給供前端顯示的資料
            // data.assignBed = angular.extend(data.assignBed, assignBedCopy);

            console.log('EDITED assignbed', angular.copy(data.assignBed));
            console.log('assignBedCopy', self.assignBedCopy);
            console.log('nurses', self.nurses);
            self.nurses.forEach((ele) => {
                ele.isSelected = false;
            });

            let msg = self.assignBedCopy.Type === 'dayoff' ? $translate('bed.component.editDayoffSuccess') : $translate('bed.component.editBedSuccess')
            showMessage(msg);
            self.isLoading = false;

            $mdDialog.hide(res.data);
        }, (res) => {
            self.isLoading = false;
            if (res.data !== undefined) {
                showMessage(res.data);
            } else {
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            }
        });
    };

    self.delete = function del(ev) {
        // 若為取消請假用詞需調整
        let deleteTitle = data.assignBed.Type === 'dayoff' ? $translate('bed.component.confirmCancelDayoff') : $translate('bed.component.confirmDelete');
        let deleteContent = data.assignBed.Type === 'dayoff' ? $translate('bed.component.cancelDayoffContent') : $translate('bed.component.deleteRecord');
        let ok = data.assignBed.Type === 'dayoff' ? $translate('bed.component.cancelDayoff') : $translate('bed.component.delete');
        // 設定對話視窗參數
        const confirm = $mdDialog.confirm()
            .title(deleteTitle)
            .textContent(deleteContent)
            .ariaLabel('delete confirm')
            .targetEvent(ev)
            .multiple(true)
            .ok(ok)
            .cancel($translate('bed.component.cancel'));

        // 呼叫對話視窗
        $mdDialog.show(confirm).then(() => {
            self.isLoading = true;
            bedService.deleteAssignBed(data.assignBed.Id).then(() => {
                // 請假用詞
                let resultMsg = data.assignBed.Type === 'dayoff' ? $translate('bed.component.cancelDayoffSuccess') : $translate('bed.component.deleteBedSuccess');
                showMessage(resultMsg);

                // refresh beds/patients count
                let bedIndex = _.findIndex(data.beds, { No: data.assignBed.BedNo });
                data.beds[bedIndex].Count -= 1;

                let patientIndex = _.findIndex(data.patients, { Id: data.assignBed.PatientId });
                data.patients[patientIndex].Count -= 1;

                angular.extend(data.assignBed, bedService.getEmptyAssignRecord());

                data.assignBed.Status = 'DELETE';
                // set isSelected to false
                self.nurses.forEach((ele) => {
                    ele.isSelected = false;
                });

                $mdDialog.hide(data.assignBed);

            }, () => {
                $mdDialog.cancel();
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
        });
    };

    function validCheck() {
        // 欲排的星期天數、班別是否有選，病人與床位是否有值
        if (self.assignBedCopy.Weeks.length < 1) {
            return false;
        }
        return true;
    }

    // Init，避免 return 造成 function 也沒有初始化，因此把這段移到最下方
    // 由於選擇帶入的資料欄位不盡相同，因此另外以相應的變數儲存
    // 單筆編輯模式
    if (mode === 'single') {
        // 先複製一份原始資料供前端操作，若確定存檔成功才更換
        let selectedCopy = angular.copy(data.selected); // 目前選取的病人
        console.log('self.selectedPatient', data.selected);

        // 優先帶入目前選取的病人，若未選擇病人則帶入原本資料的病人
        self.selectedPatient = selectedCopy.Id ? selectedCopy : _.find(self.patients, { Id: self.assignBedCopy.PatientId });

        // 從病人清單選取後再挑此班別，需算已更動病人
        if (changePatient) {
            // 需等畫面長好
            setTimeout(() => {
                $scope.arrangeForm.$setDirty();
            }, 500);
        }

        // 剔除請假的病人
        self.filterPatients(data.assignBed.AssignDate, data.assignBed.Shift);

        // 由 grid table 點取會有兩種狀況: 新增、修改可由 assignedBed.PatientId 辨別
        // 修改
        if (data.assignBed.PatientId) {
            self.editMode = true;
            // 若原本為請假則不允許變更 Type
            self.isDayoff = self.assignBedCopy.Type === 'dayoff';
            self.title = self.isDayoff ? '' : $translate('bed.component.edit');
        } else {
            // 新增
            self.editMode = false;

            self.assignBedCopy.Type = self.takeDayoffOnly ? 'dayoff' : '';

            // 判斷固定床位是否有資料，若有則預設可帶此資料
            if (data.fixedBed && data.fixedBed.PatientId) {
                let res = _.find(self.patients, { Id: data.fixedBed.PatientId });
                if (!res) {
                    return;
                }

                self.selectedPatient = res;
                self.assignBedCopy.DialysisMode = data.fixedBed.DialysisMode;

                // 因為重新給病人的資料需再確認能否請假
                self.checkCanTakeDayoff();
            }
        }

        // get the selected doctor
        let selectedDoctor = '';
        if (data.assignBed.Doctor) {
            selectedDoctor = _.find(self.doctors, (d) => {
                return d.Id === Object.keys(data.assignBed.Doctor)[0];
            });
        }
        self.doctor = selectedDoctor;
        // get selected nurses
        let selectedNurses = [];
        if (data.assignBed.Nurses) {
            Object.keys(data.assignBed.Nurses).forEach((nurse) => {
                // find nurses by id and push the nurse object into array for the chip to show
                let result = _.find(self.nurses, (n) => { return n.Id === nurse; });
                if (result) {
                    selectedNurses.push(result);
                    result.isSelected = true;
                }
            });
        }

        self.selectedNurses = selectedNurses;
        // self.selectedNurse = selectedNurses;

        console.log('selected nurses', self.selectedNurse);
        console.log('assignBedCopy Edit', self.assignBedCopy);
    } else {
        // 排床按鈕，可一次排多天，定為新增
        self.title = '';
        self.editMode = false;

        // 判斷使用者是否有選取病人
        if (data.selected.Name) {
            self.selectedPatient = data.selected;

            // 如果點選病人並按下排床按鈕，這時要先去搜尋該位病人最新月份的排床資料
            // 前面已經有取出當前月份，檢查count是否為0，然後統計該月排床
            if (data.arrangedBeds && data.arrangedBeds.length > 0) {
                // 用排床資料計算可能天數後並設定排床時間為下個月份
                countDays(data.arrangedBeds);
            } else {
                // 如果發現現在該月份是0筆，就往前找一個月份，直到找到筆數不等於0的為止
                // 讀取排床資料 時間範圍是日曆月份的第一天到最後一天
                // 更新:上面做法會容易卡死，待日後測試，現在先改為只找上一個月份，沒有就不作為

                // while (searchData) {
                bedService.getAssignBedByPatientId(moment(data.calendarDate).add(-1, 'months').format('YYYY-MM-01'),
                    moment(data.calendarDate).endOf('month').format('YYYY-MM-DD'), self.patient).then((res) => {
                        if (res.data.length > 0) {
                            // 用排床資料計算可能天數後並設定排床時間為下個月份
                            // searchData = false;
                            countDays(res.data);
                        }
                    });
                // }
            }
        }

        // 排床日期預設為當下瀏覽週
        self.assignBedCopy.StartTime = new Date(moment(data.calendarDate).startOf('isoWeek').format('YYYY-MM-DD'));
        self.assignBedCopy.EndTime = new Date(moment(data.calendarDate).endOf('isoWeek').format('YYYY-MM-DD'));
    }
}

import './arrange.less';
import './arrangeBed.less';
import tpl from './arrangeBed.html';
import template from './arrange.dialog.html';
import ptemplate from './process.html';

angular
    .module('app')
    .component('arrangeBed', {
        template: tpl,
        controller: arrangeBedController
    });

arrangeBedController.$inject = ['$q', 'fixedBedService', 'userService', '$timeout', '$scope', '$state', 'PatientService', 'SettingService', 'WardService', 'bedService', '$mdDialog', '$mdMedia', 'showMessage', '$filter', '$mdSidenav'];

function arrangeBedController($q, fixedBedService, userService, $timeout, $scope, $state, PatientService, SettingService,
    WardService, bedService, $mdDialog, $mdMedia, showMessage, $filter, $mdSidenav) {
    const vm = this;
    const shifts = bedService.getShifts();    // 目前排床的班別名稱
    const weekdayMap = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6
    };

    const ARRANGEBEDWARD = SettingService.getUISettingParams().ARRANGEBEDWARD;

    vm.previousSelected = {};
    let patients = [];  // 存取該使用者負責的所有病人
    let users = []; // initialize doctors and nurses

    const $translate = $filter('translate');
    vm.dayoffTitle = $translate('arrange.dayoffTitle');

    // Todo 應可在 url 設 params 確定前一次是排哪個月份，若無則為這個月
    let currentDate = moment();
    let beginDateInWeek = null;
    let endDateInWeek = null;
    getDateTitle();

    // 組完應顯示的資料後一次丟到前端顯示
    vm.arrangeCalendar = '';
    // get the week number of the year
    let weekNumber = moment().isoWeek();

    let bedsInSetting = []; // 目前後台有的床號
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    // $mdSidenav('left').close();
    vm.$onInit = function onInit() {
        // 預設為今日
        currentDate = moment();

        getScrollbarWidth();

        vm.loadingPatients = true;
        // 先取得使用者負責的病人列表，再顯示位於該透析室的病人
        PatientService.getByUserId(SettingService.getCurrentUser().Id).then((res) => {
            patients = res.data.sort((a, b) => {
                if (a.MedicalId > b.MedicalId) return 1;
                return -1;
            });

            vm.patients = angular.copy(patients);

            // 讀取所有病人的排床天數
            getPatientDaysByWardId(vm.ward);
        }, () => {
            vm.loadingPatients = false;
            vm.loadingPatientsErr = true;
        });

        // 再取得床位列表
        // 1. 先取得使用者的透析室列表,
        // 2. 依透析室ID取得病床
        vm.loading = true;
        vm.wards = SettingService.getCurrentUser().Ward;
        vm.keys = Object.keys(vm.wards);

        // 看目前登入者上一次選擇的透析室為何，若無則取第一個透析室
        // vm.ward = vm.keys[0];
        vm.ward = SettingService.getUISettingByKey(ARRANGEBEDWARD) || vm.keys[0];

        vm.beds = [];
        // checkForSecondWeek();

        WardService.getById(vm.ward).then((res) => {
            // 透析室備註
            vm.wardMemo = res.data.Memo;

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

            // 依病床號排序，先照後台順序去排
            // bedsInSetting = _.orderBy(bedsInSetting, ['No']);
            console.log('sort finish', bedsInSetting);

            vm.beds = angular.copy(bedsInSetting);
            // 讀取所有床位的已排人數
            getBedAssignedPeopleCount(true);

        }, () => {
            vm.loading = false;
            vm.loadingBedsErr = true;
        });

        // get users by wardId
        userService.getByWardId(vm.ward).then((res) => {
            users = res.data;
        }).then(() => {
            console.log('users', users);
        });
        // for 動態調整表格寬度及高度
        window.addEventListener('resize', changeTableSize);
    };

    function changeTableSize() {
        console.log('changeTableSize');

        // 確認有取到 element 才繼續往下做
        if (!document.getElementById('table-container') || !document.getElementById('arrange-bed-table')) {
            return;
        }

        // 取得 table-container 的寬高
        let width = document.getElementById('table-container').offsetWidth - 1;

        // 取得要操作的 element
        let element = document.getElementById('arrange-bed-table');
        element.style.width = width + 'px';

        // th or td width recount
        let ths = element.querySelectorAll('th');
        let tds = element.querySelectorAll('td');
        for (let i = 1; i < ths.length; i++) {
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

    vm.$onDestroy = function () {
        window.removeEventListener('resize', changeTableSize);
        $('tbody').off('scroll', fixedTheadAndFirstColumn);

    };

    function getDateTitle() {
        beginDateInWeek = moment(currentDate.format('YYYY-MM-DD')).startOf('isoWeek'); // 取得本週禮拜一的日期
        endDateInWeek = moment(beginDateInWeek).add(6, 'days');
        // 組成目前日期區間
        // 1. 起始日與結束日同月 2. 起始日與結束日不同年 3. 起始日與結束日不同月
        if (endDateInWeek.format('MM') === beginDateInWeek.format('MM')) {
            vm.currentYear = beginDateInWeek.format('YYYY');
            vm.currentMonth = beginDateInWeek.format('MM');
            vm.currentDay = beginDateInWeek.format('DD') + '-' + endDateInWeek.format('DD');
            vm.monthTitle = 'sameMonth';
        } else if (endDateInWeek.format('YYYY') !== beginDateInWeek.format('YYYY')) {
            vm.beginYear = beginDateInWeek.format('YYYY');
            vm.beginMonth = beginDateInWeek.format('MM');
            vm.beginDay = beginDateInWeek.format('DD');
            vm.endYear = endDateInWeek.format('YYYY');
            vm.endMonth = endDateInWeek.format('MM');
            vm.endDay = endDateInWeek.format('DD');
            vm.monthTitle = 'diffYear';
        } else if (endDateInWeek.format('MM') !== beginDateInWeek.format('MM')) {
            vm.beginYear = beginDateInWeek.format('YYYY');
            vm.beginMonth = beginDateInWeek.format('MM');
            vm.beginDay = beginDateInWeek.format('DD');
            vm.endMonth = endDateInWeek.format('MM');
            vm.endDay = endDateInWeek.format('DD');
            vm.monthTitle = 'diffMonth';
        }
    }

    // 供前端判斷顏色變化
    vm.compareStatus = function (value, bed) {
        // selected, assigned, differentPatient, patientInBed, patientInFixed, disableHover
        let classes = [];
        let assignBedPatientId = value.AssignBed && value.AssignBed.PatientId;
        let fixedBedPatientId = value.FixedBed && value.FixedBed.PatientId;

        // selected: AssignBed 的病人與目前病人清單選擇的病人為同一人
        if (assignBedPatientId && assignBedPatientId === vm.previousSelected.Id) {
            classes.push('selected');
        }

        // disableHover: 無排床資料且無固定床位資料或 床號已不再後台且沒有 AssignPatient
        if ((vm.isBedAssigned === -1 && !fixedBedPatientId) || (!assignBedPatientId && bed.isNotInSetting)) {
            classes.push('disableHover');
        }

        if (!assignBedPatientId && !fixedBedPatientId) {
            return classes;
        }

        classes.push('assigned');

        // assigned: 排床資料與固定床位相同;
        // patientInFixed: 只有固定床位的資料
        // patientInBed: 只有排床資料
        if (!assignBedPatientId && fixedBedPatientId) {
            classes.push('patientInFixed');
        } else if (assignBedPatientId && !fixedBedPatientId) {
            classes.push('patientInBed');
        } else if (assignBedPatientId !== fixedBedPatientId) {
            classes.push('differentPatient');
        }

        return classes;
    };

    // 顯示病人，若尚未 assign，有固定床位但請假了則不需顯示
    vm.showPatient = function (value = null) {
        if (!value) {
            return false;
        }
        // 若有 assign 或 固定床位不等於請假的病人時顯示
        if (value.AssignBed && value.AssignBed.PatientId) {
            return true;
        }

        if (value.FixedBed && value.FixedBed.PatientId) {
            if (value.Dayoff && value.FixedBed.PatientId === value.Dayoff.PatientId) {
                return false;
            }
            return true;
        }

        return false;
    };

    // 本週的按鈕是否要 disable
    vm.thisWeekDisable = function () {
        // 若目前週數與本週相同則 disable
        if (moment(currentDate).isoWeek() === moment().isoWeek()) {
            return true;
        }

        return false;
    };

    // 取得當週，並準備資料
    function getDaysInWeek() {
        /** *
         * [moment object with more property: {
         *      [BedNo]: {
         *          [shift]: {
         *              "AssignBed": {...},
         *              "FixedBed": {...},
         *              "Dayoff": {...}
         *          }
         *          ...
         *      },
         *      ...
         * } ]
        */
        vm.daysInWeek = [];
        let firstDateInWeek = moment(beginDateInWeek);

        // 依目前月份塞入對應的天數
        // 排床資料 groupBy Bed
        // 20190509 為符合北市醫資料庫欄位名稱，原 Bed 改 BedNo
        let groupedAssignedBeds = _.groupBy(assignedBeds, 'BedNo');

        // 固定床位資料
        let groupedFixedBeds = _.groupBy(assignedFixedBeds, 'BedNo');

        const defaultAssignProperty = {
            PatientId: '',
            PatientName: '',
            WardId: vm.ward
        };

        for (let i = 0; i < 7; i++) {
            let pushDate = i !== 0 ? moment(firstDateInWeek.add(1, 'd')) : moment(firstDateInWeek);
            vm.daysInWeek.push(moment(pushDate));

            // 是否為今日
            vm.daysInWeek[i].isToday = moment().format('YYYYMMDD') === moment(vm.daysInWeek[i]).format('YYYYMMDD');

            // 是否為週末
            vm.daysInWeek[i].isWeekend = vm.daysInWeek[i].isoWeekday() === 6 || vm.daysInWeek[i].isoWeekday() === 7;

            // for 顯示星期幾用
            vm.daysInWeek[i].Weekday = convertNoToWeekdayLang(vm.daysInWeek[i].isoWeekday());

            // 查詢資料裡是否有這天的排床，若有，則塞入此天的排床資訊
            // 排床目前設計有五班: morning(早班), afternoon(午班), evening(晚班), night(夜班), temp(臨時班)
            _.forEach(vm.beds, (b) => {
                if (!vm.daysInWeek[i][b.No]) {
                    vm.daysInWeek[i][b.No] = {};
                }
                _.forEach(shifts, (shift) => {
                    // 排床資料
                    // 以 bedNo 為 key
                    if (!vm.daysInWeek[i][b.No][shift]) {
                        vm.daysInWeek[i][b.No][shift] = {
                            AssignBed: angular.extend({
                                AssignDate: moment(vm.daysInWeek[i]),
                                BedNo: b.No,
                                Shift: shift
                            }, defaultAssignProperty),
                            FixedBed: {},   // 不會在此頁編輯，可給空的物件
                            Dayoff: angular.extend({
                                AssignDate: moment(vm.daysInWeek[i]),
                                BedNo: b.No,
                                Shift: shift
                            }, defaultAssignProperty)
                        };
                    }

                    let currentShift = vm.daysInWeek[i][b.No][shift];
                    let findResults = [];
                    if (groupedAssignedBeds[b.No]) {
                        // 因為同一班別同一天可能會有兩筆 (一般/請假)
                        // 與從資料庫抓來的資料比對日期，若日期相同且班別相同則塞進前端顯示的資料裡，可能會有多筆 (不同班別)
                        findResults = _.filter(groupedAssignedBeds[b.No], (o) => {
                            return moment(o.AssignDate).format('YYYY-MM-DD') === vm.daysInWeek[i].format('YYYY-MM-DD') && shift === o.Shift;
                        });
                    }

                    if (findResults.length > 0) {
                        // 塞一般資料 or 請假
                        findResults.forEach((result) => {
                            if (result.Type !== 'dayoff') {
                                // 一般排床資料
                                currentShift.AssignBed = result;
                            } else {
                                // 請假資料
                                currentShift.Dayoff = result;
                            }
                            // 將已塞的資料從 assignBed 移除
                            groupedAssignedBeds[b.No].splice(groupedAssignedBeds[b.No].findIndex(e => e == result), 1);
                        });
                    }

                    // 固定床位資料
                    findResults = [];
                    if (groupedFixedBeds[b.No]) {
                        // 與從資料庫抓來的資料比對 Weekday，若 Weekday 相同且班別相同則塞進前端顯示的資料裡
                        findResults = _.filter(groupedFixedBeds[b.No], (o) => {
                            return weekdayMap[o.Weekday] == i && shift === o.Shift;
                        });
                    }

                    if (findResults.length > 0) {
                        findResults.forEach((result) => {
                            currentShift.FixedBed = result;
                            groupedFixedBeds[b.No].splice(groupedFixedBeds[b.No].findIndex(e => e == result), 1);
                        });
                    }
                });
            });

            console.log('vm.daysInWeek', vm.daysInWeek, groupedAssignedBeds);
        }

        // ex. [[...], [...]]
        // 塞完後台床位資料後，若 groupedAssignedBeds 裡仍有資料，表示未存在後台目前的床號裡，需另外處理
        let notInSettings = _.filter(groupedAssignedBeds, (o) => { return o.length > 0; });
        console.log('notInSettings', notInSettings);

        // 塞完後台床位資料後，若 groupedFixedBeds 裡仍有資料，表示未存在後台目前的床號裡，需另外處理
        let fixedNotInSettings = _.filter(groupedFixedBeds, (o) => { return o.length > 0; });
        console.log('notInSettings', fixedNotInSettings);

        if (notInSettings.length === 0 && fixedNotInSettings.length === 0) {
            return;
        }

        // 排床資料
        // 可由 AssignDate.isoWeekday() - 1 及 Shift 來塞資料
        _.forEach(notInSettings, (value) => {
            let srcBedNo = value[0].BedNo;

            // 判斷目前床號資料裡有無此床號，若無則新增，並標上已不存在後台床號裡的 flag
            if (vm.beds.indexOf(srcBedNo) < 0) {
                vm.beds.push({ No: srcBedNo, Count: value.length, isNotInSetting: true });
            }

            // 塞資料
            _.forEach(value, (result) => {
                let dayIndex = moment(result.AssignDate).isoWeekday() - 1;
                let srcShift = result.Shift;

                // 確認是否已有此床號的資料了
                if (!vm.daysInWeek[dayIndex][srcBedNo]) {
                    vm.daysInWeek[dayIndex][srcBedNo] = {};
                }

                // 確認是否已有此班次的資料了
                if (!vm.daysInWeek[dayIndex][srcBedNo][srcShift]) {
                    vm.daysInWeek[dayIndex][srcBedNo][srcShift] = {};
                }

                let dstShift = vm.daysInWeek[dayIndex][srcBedNo][srcShift];
                // 確認是一般或是請假的資料
                if (result.Type !== 'dayoff') {
                    // 一般資料
                    dstShift.AssignBed = result;
                } else {
                    dstShift.Dayoff = result;
                }
            });
        });

        // 固定床位資料
        // 可由 weekdayMap[Weekday] 及 Shift 來塞資料
        _.forEach(fixedNotInSettings, (value) => {
            let srcBedNo = value[0].BedNo;

            // 判斷目前床號資料裡有無此床號，若無則新增，並標上已不存在後台床號裡的 flag
            if (vm.beds.indexOf(srcBedNo) < 0) {
                vm.beds.push({ No: srcBedNo, Count: 0, isNotInSetting: true });
            }

            // 塞資料
            _.forEach(value, (result) => {
                let dayIndex = weekdayMap[result.Weekday];
                let srcShift = result.Shift;

                // 確認是否已有此床號的資料了
                if (!vm.daysInWeek[dayIndex][srcBedNo]) {
                    vm.daysInWeek[dayIndex][srcBedNo] = {};
                }

                // 確認是否已有此班次的資料了
                if (!vm.daysInWeek[dayIndex][srcBedNo][srcShift]) {
                    vm.daysInWeek[dayIndex][srcBedNo][srcShift] = {};
                }

                let dstShift = vm.daysInWeek[dayIndex][srcBedNo][srcShift];
                dstShift.FixedBed = result;
            });
        });

    }

    // 將 weekday 轉成多國語系供前端顯示
    function convertNoToWeekdayLang(no) {
        switch (no) {
            case 1:
                return $translate('shifts.component.mon');
            case 2:
                return $translate('shifts.component.tue');
            case 3:
                return $translate('shifts.component.wed');
            case 4:
                return $translate('shifts.component.thu');
            case 5:
                return $translate('shifts.component.fri');
            case 6:
                return $translate('shifts.component.sat');
            default: // 日
                return $translate('shifts.component.sun');
        }
    }

    // 取得 scrollbar width
    // https://davidwalsh.name/detect-scrollbar-width
    let scrollbarWidth = 0; // scrollbar 寬度以方便計算 table的長寬
    function getScrollbarWidth() {
        let element = document.querySelector('arrange-bed');
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

    // 提供判斷排床、全部複製排床按鈕功能是否需要開啟
    vm.isLoadingPatientsFinished = false;
    vm.isLoadingBedsFinished = false;

    // 取得管理者管理的所有透析室當月的病人排床天數
    function getPatientDaysByWardId(key, previousId) {
        vm.isLoadingPatientsFinished = false;
        // 先將所有病人的 count 初始化為 0
        _.forEach(patients, (patient) => {
            patient.Count = 0;
        });

        // 取得該透析室中病人的已排天數
        vm.loadingPatients = true;
        // 此 API 只能依當時病人所在透析室抓取資料，因此若病人換透析室，之前住的透析室天數無法取得
        bedService.getPatientDaysByWardIdAndDate(key, beginDateInWeek.format('YYYYMMDD'), endDateInWeek.format('YYYYMMDD')).then((res) => {
            // console.log('取得該透析室中病人的已排天數', res);
            // 將取得的排床天數塞入相應的病人中
            let keysOfDays = _.groupBy(res.data, 'PatientId');
            patients.map((o) => {
                // 確保 keysOfDays 裡確實有此病人的資料，若無則給
                if (keysOfDays[o.Id] && keysOfDays[o.Id].length > 0) {
                    o.Count = keysOfDays[o.Id][0].Days;
                } else {
                    o.Count = 0;
                }
                return o;
            });

            // 將 counts 給 raw patients
            vm.patients = angular.copy(patients);

            // 若之前使用者有選擇，標記回來
            if (previousId) {
                vm.previousSelected = _.find(vm.patients, { 'Id': previousId });
                vm.previousSelected.isSelected = true;
                vm.search = '';
            }

            vm.loadingPatients = false;
            vm.isLoadingPatientsFinished = true;
            vm.loadingPatientsErr = false;
        }, () => {
            vm.loadingPatients = false;
            vm.loadingPatientsErr = true;
            // showMessage(lang.ComServerError);
        });
    }

    // 依日期、班次剔除請假的病人
    // 可能會有多位病人
    function getDayoffRecords(date, shift) {
        let result = _.filter(vm.daysInWeek[moment(date).isoWeekday() - 1], (value, key) => {
            // key: bedNo, value: {morning:...}
            return value[shift] && value[shift].Dayoff && value[shift].Dayoff.PatientId;
        }).map((value, key) => {
            return value[shift].Dayoff;
            // return {
            //     PatientId: value[shift].Dayoff.PatientId,
            //     Id: value[shift].Dayoff.Id,
            // };
        });

        // let result = _.filter(dayoffBeds, (o) => {
        //     return o.Type === 'dayoff' && moment(o.AssignDate).format('YYYYMMDD') === moment(date).format('YYYYMMDD') && o.Shift === shift;
        // });

        console.log('filterDayoffRecord', result);

        return result || [];
    }

    // 依日期、班次取得已排的病人
    function getAssignRecords(date, shift) {
        let result = _.filter(vm.daysInWeek[moment(date).isoWeekday() - 1], (value, key) => {
            // key: bedNo, value: {morning:...}
            return value[shift] && value[shift].AssignBed && value[shift].AssignBed.PatientId;
        }).map((value, key) => {
            // return { PatientId: value[shift].AssignBed.PatientId, Id: value[shift].AssignBed.Id };
            return { PatientId: value[shift].AssignBed.PatientId, Id: value[shift].AssignBed.Id, BedNo: value[shift].AssignBed.BedNo };
        });

        // let result = _.filter(assignedBeds, (o) => {
        //     return o.Type !== 'dayoff' && moment(o.AssignDate).format('YYYYMMDD') === moment(date).format('YYYYMMDD')
        //             && o.Shift === shift;
        // });

        console.log('getAssignRecords', result);

        return result || [];
    }

    // condition: { BedNo, Weekday, Shift, PatientId } 
    function getFixedRecordsByCondition(srcCondition) {
        // 若無 patientId 則傳 null
        if (!srcCondition.PatientId) {
            return null;
        }

        let condition = {
            BedNo: srcCondition.BedNo,
            Weekday: fixedBedService.convertNoToWeekday(moment(srcCondition.AssignDate).isoWeekday() - 1),   // TEST !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            Shift: srcCondition.Shift,
            PatientId: srcCondition.PatientId
        };

        return _.find(assignedFixedBeds, condition);
    }

    function loadAssignBedByPatient(patientId) {
        // 讀取排床資料 時間範圍是日曆月份的第一天到最後一天
        bedService.getAssignBedByPatientId(moment(currentDate).format('YYYY-MM-01'),
            moment(currentDate).endOf('month').format('YYYY-MM-DD'), patientId).then((res) => {
                vm.arrangedBeds = res.data;

                _.forEach(res.data, (arrange) => {
                    // 判斷是否為當前選擇的透析室
                    if (arrange.WardId !== vm.ward) {
                        return;
                    }

                });

                vm.loadingPatients = false;
            }, () => {
                vm.loadingPatients = false;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });
    }

    // search patient 依據姓名或病歷號 不分大小寫
    vm.searchPatient = function (search = '') {
        let searchRegex = new RegExp(search, 'i');
        vm.patients = _.filter(angular.copy(patients), (p) => {
            return searchRegex.test(p.Name) || searchRegex.test(p.MedicalId);
        }).sort((a, b) => {
            if (a.MedicalId > b.MedicalId) return 1;
            return -1;
        });

        // 需將之前選取的取消
        if (vm.previousSelected.isSelected) {
            vm.previousSelected = {};
        }
    };
    // 判斷是否要顯示排床對話框
    // isNotInSettings: 床號已不在後台，則不能新增
    vm.showArrangeDialog = function (item = null, isNotInSettings = false, isDayoff = false) {
        console.log('arrange dialog', item);

        // 排床或是請假資料 only
        let srcAssignBed = isDayoff ? item : item.AssignBed;
        // 若本週無排床或是床號已不再後台且無排床資料則不做下面的事情
        if (((!srcAssignBed || !srcAssignBed.PatientId) && isNotInSettings) || (vm.isBedAssigned === -1 && srcAssignBed.Type !== 'dayoff' && (!item.FixedBed || !item.FixedBed.PatientId))) {
            return;
        }

        let takeDayoffOnly = vm.isBedAssigned === -1 && item.FixedBed && item.FixedBed.PatientId;    // 僅能新增請假
        // 若已有請假紀錄且不為查看 dayoff則不顯示
        if (takeDayoffOnly && !isDayoff && item.Dayoff && item.Dayoff.PatientId) {
            return;
        }

        let data = {
            wardId: vm.ward,
            patients, // 應該帶原始的病人清單(未搜尋前)
            beds: vm.beds,
            users,
            assignBed: srcAssignBed,
            fixedBed: item.FixedBed,
            selected: vm.previousSelected,     // 使用者目前選擇的病人
            takeDayoffOnly,
            getDayoffRecords,
            getAssignRecords,
            getFixedRecordsByBedAndDateAndShift: getFixedRecordsByCondition
            // showArrange
        };

        // 單筆或是多筆新增
        let mode = 'single';

        // 判斷使用者是否有選擇病人，若有，再判斷這天這個班次是否已排人
        if (data.selected.Id) {
            if (srcAssignBed.PatientId && srcAssignBed.PatientId !== data.selected.Id) {
                // 顯示提示訊息，詢問目前已排人，是否仍要操作
                const confirm = $mdDialog.confirm()
                    .title($translate('bed.component.editBed'))
                    .textContent($translate('bed.component.confirmBedEdit'))
                    .ok($translate('bed.component.ok'))
                    .clickOutsideToClose(true)
                    .cancel($translate('bed.component.cancel'));

                $mdDialog.show(confirm).then(() => {
                    showArrange(data, mode, isNotInSettings, true);
                });
            } else {
                showArrange(data, mode, isNotInSettings);
            }
        } else {
            showArrange(data, mode, isNotInSettings);
        }
    };

    vm.gotoFixedBed = function () {
        $state.go('fixedBed');
    };

    // 顯示排床畫面
    function showArrange(data, mode = '', isNotInSettings = false, changePatient = false) {
        $mdDialog.show({
            controller: 'ArrangeController',
            controllerAs: '$ctrl',
            template,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals: {
                data,
                mode,
                isNotInSettings,
                changePatient
            },
            multiple: true,
            fullscreen: false // Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        }).then((res) => {
            // 於 vm.daysInMonth 中找到相對應的資料並變動
            // 刪除
            if (res.Status === 'DELETE') {

                // 重新取得請假紀錄及病人清單
                dayoffBeds = _.filter(assignedBeds, { Type: 'dayoff' });
                console.log('dayoffBeds', dayoffBeds);
                vm.searchPatient(vm.search);

                // 判斷是否能排床及是否要顯示帶入固定床位功能
                vm.isBedAssigned = _.findIndex(vm.beds, function (o) {
                    return o.Count > o.DayOffMember;
                });
                // 若目前週數為本週且尚無排床需顯示帶入固定床位的功能
                // if (currentDate.isoWeek() === moment().isoWeek() && vm.isBedAssigned === -1) {
                //     vm.showCloneFixedBed = true;
                // }

                return;
            }
            let srcRes = null;
            if (!res.data) {
                srcRes = res;
                // 先將被修改的原始資料欄位清空
                // 清空此資料
                angular.extend(data.assignBed, bedService.getEmptyAssignRecord());
            } else {
                // 新增
                srcRes = res.data[0];
            }

            // 若在同一周，將資料塞進相應的位子
            let index = moment(srcRes.AssignDate).isoWeekday() - 1;
            if (moment(data.assignBed.AssignDate).isoWeek() === moment(srcRes.AssignDate).isoWeek()) {
                // 確認是否為請假或是一般
                if (srcRes.Type === 'dayoff') {
                    angular.extend(vm.daysInWeek[index][srcRes.BedNo][srcRes.Shift].Dayoff, srcRes);
                    // vm.daysInWeek[index][srcRes.Bed][srcRes.Shift].Dayoff = srcRes;
                } else {
                    angular.extend(vm.daysInWeek[index][srcRes.BedNo][srcRes.Shift].AssignBed, srcRes);
                    // vm.daysInWeek[index][srcRes.Bed][srcRes.Shift].AssignBed = srcRes;
                }

            }

            // 確認紀錄裡是否沒有這筆，若沒有則須新增
            let resultIndex = _.findIndex(assignedBeds, { Id: srcRes.Id });
            if (resultIndex > -1) {
                angular.extend(assignedBeds[resultIndex], srcRes);
            } else {
                assignedBeds.push(srcRes);
            }
            // 重新取得請假紀錄及病人清單
            dayoffBeds = _.filter(assignedBeds, { Type: 'dayoff' });
            console.log('dayoffBeds', dayoffBeds);
            vm.searchPatient(vm.search);
        }, () => {
            // showMessage(lang.ComServerError);
            users.forEach((ele) => {
                ele.isSelected = false;
            });
        });
    }

    // 選擇病人後
    vm.selectPatient = function selectPatient(patient) {
        // 先將之前選擇病人 css 效果移除
        if (vm.previousSelected.isSelected) {
            vm.previousSelected.isSelected = false;
        }

        if (vm.previousSelected.Id === patient.Id) {
            vm.previousSelected = {};

        } else {
            // 將目前選擇的病人, 套上 css 效果
            vm.previousSelected = patient;
            patient.isSelected = true;
        }

        // 讀取排床資料 時間範圍是日曆月份的第一天到最後一天，為了自動幫忙選常用的星期數
        loadAssignBedByPatient(patient.Id);
    };

    // 讀取此透析室的所有床位已排的人數
    let assignedBeds = [];
    let dayoffBeds = [];
    function getBedAssignedPeopleCount(isFirstTime) {
        vm.loading = true;
        vm.isLoadingBedsFinished = false;

        // 若非首次，須將 vm.beds 先回復至與後台的床號資料相同
        if (!isFirstTime) {
            vm.beds = angular.copy(bedsInSetting);
        }

        // vm.showCloneFixedBed = false;
        bedService.getBedAssignedPeopleCountByDate(vm.ward, beginDateInWeek.format('YYYYMMDD'), endDateInWeek.format('YYYYMMDD'))
            .then((res) => {
                // console.log('將人數塞入對應的床號', res);
                // 將人數塞入對應的床號
                // 將取得的排床天數塞入相應的病人中
                let keysOfDays = _.groupBy(res.data, 'BedNo');
                vm.beds.map((o) => {
                    // 確保 keysOfDays 裡確實有此病人的資料，若無則給
                    if (keysOfDays[o.No] && keysOfDays[o.No].length > 0) {
                        o.Count = keysOfDays[o.No][0].Member;
                        o.DayOffMember = keysOfDays[o.No][0].DayOffMember;
                    } else {
                        o.Count = 0;
                        o.DayOffMember = 0;
                    }
                    return o;
                });

                // 檢查是否有排床
                vm.isBedAssigned = _.findIndex(res.data, function (o) {
                    return o.Member > o.DayOffMember;
                });

                // 若目前週數為本週且尚無排床需顯示帶入固定床位的功能
                // if (currentDate.isoWeek() === moment().isoWeek() && vm.isBedAssigned === -1) {
                //     vm.showCloneFixedBed = true;
                // }

                // 依透析室及月分取得排床資訊
                // 同時取排床資料及固定床位資料
                let exeAry = [getAssignBedByWardAndMonth(), getAssignedPatients()];

                $q.all(exeAry).then(() => {
                    getDaysInWeek();
                    console.log('filtered assignedFixedBeds', assignedFixedBeds);

                    console.log('fixedDaysInWeek', vm.fixedDaysInWeek);
                    console.log('DaysInWeek', vm.daysInWeek);

                    vm.loading = false;
                    vm.loadingFixedBedsErr = false;

                    // 需等畫面長好
                    $timeout(() => {
                        // compare();
                        $('tbody').off('scroll', fixedTheadAndFirstColumn);
                        $('tbody').on('scroll', fixedTheadAndFirstColumn);
                        changeTableSize();
                    }, 0);

                    vm.loadingBedsErr = false;
                    vm.loadDataErr = false;
                }).catch(() => {
                    vm.loading = false;
                    vm.loadDataErr = true;
                    console.error('getdata error');
                });

                vm.loadingBeds = false;
                // vm.loadingBedsErr = false;
                vm.isLoadingBedsFinished = true;
            }, () => {
                vm.loadingBeds = false;
                vm.loadingBedsErr = true;
                vm.loading = false;
                showMessage($translate('customMessage.serverError')); // lang.ComServerError
            });

    }

    // 取排床資料
    function getAssignBedByWardAndMonth() {
        const defer = $q.defer();

        assignedBeds = [];
        dayoffBeds = [];
        bedService.getAssignBedByWardAndMonth(vm.ward, moment(currentDate).startOf('isoWeek').format('YYYYMMDD'), moment(currentDate).endOf('isoWeek').format('YYYYMMDD')).then((res) => {
            
            console.log('取排床資料 res', angular.copy(res));
            assignedBeds = res.data;
            dayoffBeds = _.filter(assignedBeds, { Type: 'dayoff' });

            defer.resolve();
            // 將排床資料塞入前端顯示用的資料
            // getDaysInWeek();
            // vm.loading = false;
            // vm.loadDataErr = false;
        }, (err) => {
            // err
            vm.loading = false;
            vm.loadDataErr = true;
            defer.reject();
        });

        return defer.promise;
    }

    // 取固定床位資料
    let assignedFixedBeds = [];
    function getAssignedPatients() {
        const defer = $q.defer();

        self.hasAssignedFixedBeds = false;
        fixedBedService.getByWardId(vm.ward).then((res) => {
            console.log('取固定床位資料 assigned patients', res);

            // 若週數為單數則取單週
            if (weekNumber % 2 !== 0) {
                assignedFixedBeds = _.filter(res.data, (a) => {
                    return a.Week == 0;
                });

                vm.hasAssignedFixedBeds = assignedFixedBeds.length > 0;
                defer.resolve();
                return;
            }

            // check whether there is second week
            let secondWeekDataCount = _.filter(res.data, (a) => {
                return a.Week === '1';
            }).length;

            let week = null;    // 應取第幾週的固定床位

            // it has week2 and if week is odd number
            if (secondWeekDataCount > 0) {
                week = 1;
            } else {
                week = 0;
            }
            assignedFixedBeds = _.filter(res.data, (a) => {
                return a.Week == week;
            });

            vm.hasAssignedFixedBeds = assignedFixedBeds.length > 0;
            defer.resolve();
        }).catch((err) => {
            vm.loading = false;
            vm.loadingFixedBedsErr = true;
            defer.reject();
        });

        return defer.promise;
    }

    // 重新讀取所有病人及床位的排床資訊
    function reloadAssignedBedRecord() {
        // 初始化搜尋相關
        let previousId = '';
        if (vm.previousSelected && vm.previousSelected.isSelected) {
            previousId = vm.previousSelected.Id;
        }
        vm.patients = angular.copy(patients);

        getPatientDaysByWardId(vm.ward, previousId);
        getBedAssignedPeopleCount();
    }

    // 選擇其他透析室時重新讀取病床清單
    vm.changeWard = function changeWard(ward) {
        // currentDate = moment();
        weekNumber = moment().isoWeek();
        // checkForSecondWeek();
        if (vm.previousSelected.isSelected) {
            vm.previousSelected.isSelected = false;
        }
        vm.previousSelected = {};
        vm.search = '';
        // 記得目前登入者目前選擇的透析室
        SettingService.setUISetting({ name: ARRANGEBEDWARD, value: ward });

        vm.beds = null; // 床位先清空
        vm.loading = true;
        vm.loadingPatients = true;
        WardService.getById(ward).then((res) => {
            // 該透析室的備註
            vm.wardMemo = res.data.Memo;
            vm.loadingBedsErr = false;

            // 所有床號及已排人數
            bedsInSetting = [];

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

            // 依病床號排序，先照後台順序去排
            // bedsInSetting = _.orderBy(bedsInSetting, ['No']);
            console.log('sort finish', bedsInSetting);

            vm.beds = angular.copy(bedsInSetting);

            for (let i = 0; i < res.data.BedNos.length; i++) {
                let b = {
                    No: res.data.BedNos[i],
                    Count: 0
                };
                bedsInSetting.push(b);
            }
            // bedsInSetting = _.orderBy(bedsInSetting, ['No']);

            vm.beds = angular.copy(bedsInSetting);
            getPatientDaysByWardId(vm.ward);
            getBedAssignedPeopleCount(true);
            // loadAssignBedCountByBeds();
        }).catch(() => {
            vm.loadingBedsErr = true;
        }).finally(() => {
            vm.loadingBeds = false;
        });
    };

    // 排床按鈕
    vm.arrange = function arrange(ev, mode, changePatient = false) {
        let data = {
            wardId: vm.ward,
            patients,
            beds: vm.beds,
            users,
            calendarDate: currentDate,
            arrangedBeds: vm.arrangedBeds
        };
        data.selected = vm.previousSelected;

        $mdDialog.show({
            controller: 'ArrangeController',
            controllerAs: '$ctrl',
            template,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                data,
                mode,
                changePatient
            },
            fullscreen: false // Only for -xs, -sm breakpoints. !$mdMedia('gt-sm')
        }).then((answer) => {
            // 若為排床及全部複製排床則重新整理
            reloadAssignedBedRecord();
        }, () => {
            // showMessage(lang.ComServerError);
            console.log('nurses', users);
            // set isSelect to false when dialog closes
            // set isSelected to false to toggle css
            users.forEach((ele) => {
                ele.isSelected = false;
            });
        });
    };

    vm.refreshAssignBed = function () {
        reloadAssignedBedRecord();
    };

    // 左上角回上頁
    vm.back = function back() {
        // if ($state.previousStateName) {
        //     $state.go($state.previousStateName);
        // } else {
        vm.previousSelected.isSelected = false;
        history.go(-1);
        // $state.go('allPatients');
        // }
    };

    // 上方時間相關的功能
    vm.nextWeek = function () {
        currentDate = endDateInWeek.add(1, 'd');
        weekNumber = moment(currentDate).isoWeek();
        getDateTitle();
        reloadAssignedBedRecord();
    };
    vm.lastWeek = function () {
        currentDate = beginDateInWeek.add(-1, 'd');
        // debugger;
        weekNumber = moment(currentDate).isoWeek();
        getDateTitle();
        reloadAssignedBedRecord();
    };
    vm.today = function () {
        currentDate = moment();
        getDateTitle();
        reloadAssignedBedRecord();
    };

    // 帶入固定床位表，若為本週且尚未有排床紀錄則顯示此功能
    vm.cloneArranged = function (ev) {

        // 設定對話視窗參數
        const confirm = $mdDialog.confirm()
            .title($translate('bed.copyAll'))
            .textContent($translate('bed.copyAllConfirm'))
            .ariaLabel('clone confirm')
            .targetEvent(ev)
            .ok($translate('bed.confirmCopy'))
            .cancel($translate('arrange.cancel'));

        // 呼叫對話視窗

        $mdDialog.show(confirm).then(() => {
            console.log('paste fixed bed');
            vm.fixedBedCloning = true; // mask
            // 固定班表寫入排床
            let startDate = moment(currentDate).startOf('isoweek').format('YYYYMMDD');
            bedService.copyFixedBed(vm.ward, startDate).then((res) => {
                // debugger;
                // getDaysInWeek();
                reloadAssignedBedRecord();
                showMessage($translate('bed.copySuccess'));
            }).catch(() => {
                showMessage($translate('bed.copyFailed'));
            }).finally(() => {
                vm.fixedBedCloning = false;
            });
        });
    };

}

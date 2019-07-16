import report from './annualEpoReport.html';
import './annualEpoReport.less';

angular.module('app').component('annualEpoReport', {
    template: report,
    controller: annualEpoReportCtrl,
    controllerAs: 'vm'
});

annualEpoReportCtrl.$inject = ['$stateParams', 'epoExecutionService', 'PatientService', '$state', '$filter'];

function annualEpoReportCtrl($stateParams, epoExecutionService, PatientService, $state, $filter) {
    const vm = this;
    const statePatientId = $stateParams.patientId;
    const stateYear = $stateParams.year;

    let $translate = $filter('translate');

    vm.optionYear = [];

    vm.loading = true;
    vm.isError = false;
    vm.selectedYear = stateYear;

    // initialize an empty array for content

    vm.$onInit = function $onInit() {
        for (let i = 0; i < 20; i++) {
            vm.optionYear.push(moment().year() - i);
        }
        PatientService.getById($stateParams.patientId).then((d) => {
            // get patient info
            vm.patient = d.data;
            console.log('vm.patient', vm.patient);
        }).then(() => {
            vm.getExecutionEPO(statePatientId, stateYear);
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    // 依年度異動統計內容
    vm.getExecutionEPO = function getExecutionEPO(patientId, year) {
        epoExecutionService.getExecutionEPOByYear(patientId, year).then((q) => {
            vm.analysisData(q.data);
            console.log('q', q);
            vm.isError = false;
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    // 年度異動
    vm.changeYear = function changeYear() {
        vm.loading = true;
        $state.go('annualEpo', {
            year: vm.selectedYear
        }, {
                location: 'replace'
            });
    };

    // 回上頁
    vm.back = function goback() {
        history.go(-1);
    };

    vm.analysisData = function analysisData(items) {
        // vm.Content = [];
        vm.dateHBContent = [];
        vm.publicMedsContent = [];
        vm.privateMedsContent = [];
        vm.docProcessNameContent = [];

        let meds = items.Titles; // 藥品
        let content = items.Content; // 內容
        let first = ['processTime', 'hb']; // 藥品前要顯示的值

        // 一次展12個月的資料，每筆 row 有 16 個欄位，第一個欄位為資料名稱
        // sort by process time for every month
        for (let i = 1; i <= 12; i++) {
            // 依月份取出當月資料，並且用執行時間排序
            let data = _.orderBy(_.filter(content, function (o) {
                return moment(o.ProcessTime).month() === (i - 1);
            }), 'ProcessTime');
            let dateHB = {};
            let publicMeds = {};
            let privateMeds = {};
            let docProcessName = {};

            // loop through process time and hb and push the values to jsonData
            //  for each item in 'first' (processTime, hb)
            let row = 0;
            first.forEach((item) => {

                switch (item) {
                    case 'processTime':
                        dateHB[row] = [$translate('annualEpo.component.date')];
                        // loop 15 times since there will only be a maximum of 15 times
                        for (let j = 0; j < 15; j++) {
                            dateHB[row].push(data[j] ? moment(data[j].ProcessTime).format('MM/DD') : '');
                        }
                        break;
                    case 'hb':
                        dateHB[row] = ['Hb'];
                        for (let j = 0; j < 15; j++) {
                            dateHB[row].push(data[j] ? data[j].Hb : '');
                        }
                        break;
                    default:
                        break;
                }
                row += 1;
            });

            row = 0;
            // loop through all meds
            // 公費
            _.forEach(meds, (value, key) => {
                // let row = 0;
                publicMeds[row] = [value];
                let count = 0;
                let countDose = 0;
                // loop 15 times
                // get quantity and dosage
                for (let j = 0; j < 15; j++) {
                    let rowData = '';
                    // find 公費
                    if (data[j] && data[j].Type !== 'Self') {
                        // get AcutualQuantity
                        let quantity = data[j].EPOId === key && data[j].ActualQuantity ? data[j].ActualQuantity : '';
                        let dose = data[j].EPOId === key && data[j].ActualDose ? data[j].ActualDose : '';

                        rowData = quantity + (dose !== '' ? `/${dose}` : '');
                        publicMeds[row].push(rowData);
                    } else {
                        publicMeds[row].push('');
                    }
                }
                row += 1;
                publicMeds[row] = [$translate('annualEpo.component.totalDosage')];
                // calculate total usage
                for (let j = 0; j < 15; j++) {
                    let rowData = '';
                    // find 公費
                    if (data[j] && data[j].Type !== 'Self') {
                        let quantity = data[j].EPOId === key && data[j].ActualQuantity ? data[j].ActualQuantity : '';

                        if (quantity !== '') {
                            count += quantity;
                        }
                        let dose = data[j].EPOId === key && data[j].ActualDose ? data[j].ActualDose : '';
                        // 累積劑量
                        if (dose !== '') {
                            countDose += dose;
                        }
                        if (quantity !== '') {
                            rowData = count + (dose !== '' ? `/${countDose}` : '');
                        }
                        publicMeds[row].push(rowData);
                    } else {
                        publicMeds[row].push('');
                    }
                }
                row += 1;
                publicMeds[row] = [$translate('annualEpo.component.route')];

                for (let j = 0; j < 15; j++) {
                    if (data[j] && data[j].Type !== 'Self') {
                        let route = data[j].EPOId === key && data[j].Route ? data[j].Route : '';
                        publicMeds[row].push(route);
                    } else {
                        publicMeds[row].push('');
                    }
                }
                row += 1;
            });

            row = 0;
            // loop through all meds
            // 自費
            _.forEach(meds, (value, key) => {
                // let row = 0;
                privateMeds[row] = [value];
                let count = 0;
                let countDose = 0;
                // loop 15 times
                // get quantity and dosage
                for (let j = 0; j < 15; j++) {
                    let rowData = '';

                    // find 公費
                    if (data[j] && data[j].Type === 'Self') {
                        // get AcutualQuantity
                        let quantity = data[j].EPOId === key && data[j].ActualQuantity ? data[j].ActualQuantity : '';

                        // 補單位
                        if (quantity !== '' && data[j].QuantityUnit) {
                            quantity += `(${data[j].QuantityUnit})`;
                        }

                        let dose = data[j].EPOId === key && data[j].ActualDose ? data[j].ActualDose : '';

                        // 補單位
                        if (quantity !== '' && data[j].DoseUnit) {
                            quantity += `(${data[j].DoseUnit})`;
                        }

                        rowData = quantity + (dose !== '' ? `/${dose}` : '');
                        privateMeds[row].push(rowData);
                    } else {
                        privateMeds[row].push('');
                    }
                }
                row += 1;
                privateMeds[row] = [$translate('annualEpo.component.totalDosage')];
                // calculate total usage
                for (let j = 0; j < 15; j++) {
                    let rowData = '';
                    // find 公費
                    if (data[j] && data[j].Type === 'Self') {
                        let quantity = data[j].EPOId === key && data[j].ActualQuantity ? data[j].ActualQuantity : '';

                        if (quantity !== '') {
                            count += quantity;
                        }
                        let dose = data[j].EPOId === key && data[j].ActualDose ? data[j].ActualDose : '';
                        // 累積劑量
                        if (dose !== '') {
                            countDose += dose;
                        }
                        if (quantity !== '') {
                            rowData = count + (dose !== '' ? `/${countDose}` : '');
                        }
                        privateMeds[row].push(rowData);
                    } else {
                        privateMeds[row].push('');
                    }
                }
                row += 1;
                privateMeds[row] = [$translate('annualEpo.component.route')];

                for (let j = 0; j < 15; j++) {
                    if (data[j] && data[j].Type === 'Self') {
                        let route = data[j].EPOId === key && data[j].Route ? data[j].Route : '';
                        privateMeds[row].push(route);
                    } else {
                        privateMeds[row].push('');
                    }
                }
                row += 1;
            });

            row = 0;
            docProcessName[row] = [$translate('annualEpo.component.doctor')];
            for (let j = 0; j < 15; j++) {
                docProcessName[row].push(data[j] ? data[j].CreatedUserName : '');
            }
            row += 1;
            docProcessName[row] = [$translate('annualEpo.component.injector')];
            for (let j = 0; j < 15; j++) {
                docProcessName[row].push(data[j] ? data[j].ProcessUserName : '');
            }

            vm.dateHBContent.push(dateHB);
            vm.publicMedsContent.push(publicMeds);
            vm.privateMedsContent.push(privateMeds);
            vm.docProcessNameContent.push(docProcessName);
        }
        // 公費自費表格長度
        vm.publicRowspan = vm.publicMedsContent.length > 0 ? Object.keys(vm.publicMedsContent[0]).length + 1 : 1;
        vm.privateRowspan = vm.privateMedsContent.length > 0 ? Object.keys(vm.privateMedsContent[0]).length + 1 : 1;
        vm.loading = false;
    };
}

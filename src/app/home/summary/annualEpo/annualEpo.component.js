import report from './annualEpo.html';
import './annualEpo.less';

angular.module('app').component('annualEpo', {
    template: report,
    controller: annualEpoCtrl,
    controllerAs: 'vm'
});

annualEpoCtrl.$inject = ['$stateParams', 'epoExecutionService', 'PatientService', '$state', '$filter'];

function annualEpoCtrl($stateParams, epoExecutionService, PatientService, $state, $filter) {
    const vm = this;
    const statePatientId = $stateParams.patientId;
    const stateYear = $stateParams.year;

    let $translate = $filter('translate');

    vm.optionYear = [];

    vm.loading = true;
    vm.isError = false;
    vm.selectedYear = stateYear;
    // vm.Content = [
    //     {
    //         "1": ['日期', '', '4' ,'6' ,'', '','','','','','','','','','','',''],
    //         "2": ["Hb",'', '1', '2' ,'', '','','','','','','','','','','',''],
    //         "3":["A",'', '1', '2' ,'', '','','','','','','','','','','','3'],
    //         "4":["B",'', '1', '2' ,'', '','','','','','','','','','','','3'],
    //         "5":["C",'', '1', '2' ,'', '','','','','','','','','','','','3']
    //     },
    //     {
    //         "1": ['日期', '', '4' ,'6' ,'', '','5','','','','','','','','','',''],
    //         "2": ["Hb",'', '1', '2' ,'', '','','','','','','','','','','',''],
    //         "3":["A",'', '1', '2' ,'', '','','','','','','','','','','','3'],
    //         "4":["B",'', '1', '2' ,'', '','','','','','','','','','','','3'],
    //         "5":["C",'', '1', '2' ,'', '','6','','','','','','','','','','3']
    //     }
    // ]; // 報表內容
    vm.Content = [];

    vm.$onInit = function $onInit() {
        for (let i = 0; i < 20; i++) {
            vm.optionYear.push(moment().year() - i);
        }
        PatientService.getById($stateParams.patientId).then((d) => {
            vm.patient = d.data;
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
            vm.isError = false;
        }, () => {
            vm.loading = false;
            vm.isError = true;
        });
    };

    // 年度異動
    vm.changeYear = function changeYear() {
        vm.loading = true;
        // vm.getExecutionEPO(statePatientId, vm.selectedYear);
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
        vm.Content = [];

        let meds = items.Titles; // 藥品
        let content = items.Content; // 內容
        let first = ['processTime', 'hb']; // 藥品前要顯示的值
        let last = ['med', 'route', 'doctor', 'processName']; // 藥品後要顯示的值

        // 一次展12個月的資料，每筆 row 有 16 個欄位，第一個欄位為資料名稱
        for (let i = 1; i <= 12; i++) {
            // 依月份取出當月資料，並且用執行時間排序
            let data = _.orderBy(_.filter(content, function (o) {
                return moment(o.ProcessTime).month() === (i - 1);
            }), 'ProcessTime');

            let jsonData = {};
            let row = 1; // 用來決定有幾筆 row
            first.forEach(function (item) {
                switch (item) {
                    case 'processTime':
                        jsonData[row] = [$translate('annualEpo.component.date')];
                        for (let j = 0; j < 16; j++) {
                            jsonData[row].push(data[j] ? moment(data[j].ProcessTime).format('DD') : '');
                        }
                        break;
                    case 'hb':
                        jsonData[row] = ['Hb'];
                        for (let j = 0; j < 16; j++) {
                            jsonData[row].push(data[j] ? data[j].Hb : '');
                        }
                        break;
                    default:
                        break;
                }
                row += 1;
                // console.log('jsonData:' + jsonData);
            }, this);

            // Type 不等於自費的都要累積，藥品來源是抓系統的 EPO 藥品檔
            _.forEach(meds, function (value, key) {
                jsonData[row] = [value];
                let count = 0;
                let countDose = 0;
                for (let j = 0; j < 15; j++) {
                    let rowData = '';

                    if (data[j] && data[j].Type !== 'Self') {
                        let quantity = data[j].EPOId === key && data[j].ActualQuantity ? data[j].ActualQuantity : '';
                        // 累積數量
                        if (quantity !== '') {
                            count += quantity;
                        }

                        let dose = data[j].EPOId === key && data[j].ActualDose ? data[j].ActualDose : '';
                        // 累積劑量
                        if (dose !== '') {
                            countDose += dose;
                        }

                        rowData = quantity + (dose !== '' ? `/${dose}` : '');

                        jsonData[row].push(rowData);
                    } else {
                        jsonData[row].push('');
                    }
                }
                // 累積劑量
                jsonData[row].push(count > 0 ? countDose > 0 ? `${count}/${countDose}` : count : '');
                row += 1;
            }, this);

            last.forEach(function (item) {
                switch (item) {
                    case 'med':
                        jsonData[row] = [$translate('annualEpo.component.dosage')];
                        for (let j = 0; j < 16; j++) {

                            if (data[j] && data[j].Type === 'Self') {
                                let quantity = data[j].ActualQuantity ? data[j].ActualQuantity : '';
                                // 補單位
                                if (quantity !== '' && data[j].QuantityUnit) {
                                    quantity += `(${data[j].QuantityUnit})`;
                                }

                                let dose = data[j].ActualDose ? data[j].ActualDose : '';
                                // 補單位
                                if (quantity !== '' && data[j].DoseUnit) {
                                    quantity += `(${data[j].DoseUnit})`;
                                }

                                let rowData = quantity + (dose !== '' ? `/${dose}` : '');

                                jsonData[row].push(`${data[j].EPOName}-${rowData}`);
                            } else {
                                jsonData[row].push('');
                            }
                        }
                        break;
                    case 'route':
                        jsonData[row] = [$translate('annualEpo.component.route')];
                        for (let j = 0; j < 16; j++) {
                            jsonData[row].push(data[j] ? data[j].Route : '');
                        }
                        break;
                    case 'doctor':
                        jsonData[row] = [$translate('annualEpo.component.doctor')];
                        for (let j = 0; j < 16; j++) {
                            jsonData[row].push(data[j] ? data[j].CreatedUserName : '');
                        }
                        break;
                    case 'processName':
                        jsonData[row] = [$translate('annualEpo.component.injector')];
                        for (let j = 0; j < 16; j++) {
                            jsonData[row].push(data[j] ? data[j].ProcessUserName : '');
                        }
                        break;
                    default:
                        break;
                }
                row += 1;
            });

            vm.Content.push(jsonData);
        }

        vm.loading = false;
    };
}
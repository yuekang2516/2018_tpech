import tpl from './medicationImport.html';
import 'script-loader!xlsx/dist/xlsx.full.min.js';

angular.module('app').component('medicationImport', {
    template: tpl,
    controller: medicationImportCtrl,
    controllerAs: 'vm'
});

medicationImportCtrl.$inject = ['$mdSidenav', 'Upload', '$http', '$timeout', 'PatientService', 'medicineService', 'SettingService', '$filter'];
function medicationImportCtrl($mdSidenav, Upload, $http, $timeout, PatientService, medicineService, SettingService, $filter) {
    const vm = this;
    let $translate = $filter('translate');
    vm.lang = SettingService.getLanguage();
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    vm.loading = false;
    vm.buttonrun = false;
    // let Medicines;
    let Medication = {};
    let MedicationArray = [];
    // let Name = '';
    // let MedicineCode = '';

    let wb; // 读取完成的数据
    let rABS = true; // 是否将文件读取为二进制字符串 // false

    // let testStr = 'A&B&C&D';
    // let testresult = testStr.split('&');
    // console.log(testresult);

    // // 取回所有藥品資料
    // medicineService.get().then((resp) => {
    //     Medicines = resp.data[0].medicine;
    //     console.log(Medicines);
    //     vm.loading = false;
    //     vm.isError = false; // 顯示伺服器連接失敗的訊息
    // }, () => {
    //     vm.loading = false;
    //     vm.isError = true;
    //     console.log('查不到藥品資料');
    // });

    // 分析選取的檔案內容
    vm.importf = function importf(obj) { // 导入
        if (!obj.files) {
            return;
        }
        vm.buttonrun = false;
        Medication = {};
        MedicationArray = [];
        vm.MedicationResult = [];
        let f = obj.files[0];

        let reader = new FileReader();
        reader.onload = function (e) {
            let data = e.target.result;

            // 依csv檔案編碼, 判斷是否需轉碼
            data = new Uint8Array(data);
            let isUTF8rst = isUTF8(data);
            if (f.name.toLowerCase().indexOf('.xlsx') > -1 || f.name.toLowerCase().indexOf('.xls') > -1) {
                isUTF8rst = true;
            }
            if (isUTF8rst) {
                data = e.target.result;
            } else {
                //data = iconv.decode(data, 'BIG5'); // 轉碼方式一 ANSI => UTF8
                data = cptable.utils.decode(950, data); //936 // 轉碼方式二 ANSI => UTF8
                rABS = false;
            }

            if (rABS) {
                wb = XLSX.read(btoa(fixdata(data)), { // 手动转化
                    type: 'base64'
                });
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            }

            if (f.name.toLowerCase().indexOf('.csv') > -1 || f.name.toLowerCase().indexOf('.txt') > -1) {
                // csv的處理方式

                let cellArray = [];
                let fieldArray = [];
                let dataArray = [];
                console.log(wb.Sheets.Sheet1);
                let xlsarray = wb.Sheets.Sheet1;
                let arrayInt = 0;
                let dataInt = 0;
                // 先塞資料到三個array
                angular.forEach(xlsarray, function (record, ind) {
                    // console.log(ind);
                    // console.log(record);
                    if (ind.substr(ind.length - 1, 1) === '1') {
                        // 欄位列
                        cellArray[arrayInt] = ind.substr(0, ind.length - 1);
                        // console.log(ind);
                        // 第一列為標題
                        if (record.t !== 'n') {
                            fieldArray[arrayInt] = record.v;
                            // console.log(record.v);
                            arrayInt += 1;
                        }
                    } else {
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        let rowNo = ind.substr(ind.length - 1, 1);
                        for (let i = 0; i < arrayInt; i++) {
                            if (cellArray[i] === ind.substr(0, ind.length - 1)) {
                                // dataArray[i] = record.w;
                                if (record.t === 's') {
                                    dataArray[((parseInt(rowNo) - 2) * arrayInt) + i] = record.v.trim();
                                } else {
                                    dataArray[((parseInt(rowNo) - 2) * arrayInt) + i] = record.w.trim();
                                }
                                dataInt += 1;
                            }
                        }
                        // dataArray = record.split(',');
                        // console.log(record.v);
                    }
                });
                // 從三個array拆資料, 解析待上傳內容
                for (let i = 0; i < dataInt; i++) {
                    // console.log(cellArray[i % arrayInt] + '/' + fieldArray[i % arrayInt] + '/' + dataArray[i]);

                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.name').trim()) { // '藥品名稱'
                        Medication.Name = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.codes').trim()) { // '代碼'
                        Medication.MedicineCode = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.qty').trim()) { // '數量'
                        if (dataArray[i].trim() === '') {
                            Medication.Quantity = 0;
                        } else {
                            Medication.Quantity = parseInt(dataArray[i].trim());
                        }
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.kind').trim()) { // '類別名稱'
                        Medication.CategoryName = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.NHICodes').trim()) { // '健保碼'
                        Medication.NHICode = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.qtyUnit').trim()) { // '數量單位'
                        Medication.QuantityUnit = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.capacity').trim()) { // '容量'
                        if (dataArray[i].trim() === '') {
                            Medication.Volume = 0;
                        } else {
                            Medication.Volume = parseInt(dataArray[i].trim());
                        }
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.capacityUnit').trim()) { // '容量單位'
                        Medication.VolumeUnit = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.dose').trim()) { // '劑量'
                        if (dataArray[i].trim() === '') {
                            Medication.Dose = 0;
                        } else {
                            Medication.Dose = parseInt(dataArray[i].trim());
                        }
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.doseUnit').trim()) { // '劑量單位'
                        Medication.DoseUnit = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.addStatistics').trim()) { // '加入統計表'
                        Medication.IsStatistics = false;
                        if (dataArray[i].trim() === '1') {
                            Medication.IsStatistics = true;
                        }
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.way').trim()) { // '途徑'
                        Medication.Routes = dataArray[i].trim().split('&');
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('medicationImport.excel.method').trim()) { // '服法(頻率)'
                        Medication.Frequencys = dataArray[i].trim().split('&');
                    }

                    if (i % arrayInt === arrayInt - 1) {
                        Medication.CheckStatus = '';
                        console.log(Medication);
                        MedicationArray.push(Medication);
                        Medication = {};
                    }
                }

            } else if (f.name.toLowerCase().indexOf('.xlsx') > -1 || f.name.toLowerCase().indexOf('.xls') > -1) {
                    // xlsx的處理方式

                // wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
                // wb.Sheets[Sheet名]获取第一个Sheet的数据
                // document.getElementById("demo").innerHTML= JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) );
                // console.log(wb.Sheets[wb.SheetNames[0]]);
                let xlsarray = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                angular.forEach(xlsarray, function (record, ind) {
                    // Name = ''; // 藥品名稱
                    // MedicineCode = ''; // 代碼
                    Medication.Quantity = 0;
                    angular.forEach(record, function (item, fname) {

                        if (fname.trim() === $translate('medicationImport.excel.name')) { // '藥品名稱'
                            Medication.Name = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.codes')) { // '代碼'
                            Medication.MedicineCode = item; // .trim()
                        }
                        if (fname.trim() === $translate('medicationImport.excel.qty')) { // '數量'
                            if (item === '') { // .trim()
                                Medication.Quantity = 0;
                            } else {
                                Medication.Quantity = parseInt(item); // .trim()
                            }
                        }
                        if (fname.trim() === $translate('medicationImport.excel.kind')) { // '類別名稱'
                            Medication.CategoryName = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.NHICodes')) { // '健保碼'
                            Medication.NHICode = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.qtyUnit')) { // '數量單位'
                            Medication.QuantityUnit = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.capacity')) { // '容量'
                            if (item === '') { // .trim()
                                Medication.Volume = 0;
                            } else {
                                Medication.Volume = parseInt(item); // .trim()
                            }
                        }
                        if (fname.trim() === $translate('medicationImport.excel.capacityUnit')) { // '容量單位'
                            Medication.VolumeUnit = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.dose')) { // '劑量'
                            if (item === '') { // .trim()
                                Medication.Dose = 0;
                            } else {
                                Medication.Dose = parseInt(item); // .trim()
                            }
                        }
                        if (fname.trim() === $translate('medicationImport.excel.doseUnit')) { // '劑量單位'
                            Medication.DoseUnit = item.trim();
                        }
                        if (fname.trim() === $translate('medicationImport.excel.addStatistics')) { // '加入統計表'
                            Medication.IsStatistics = false;
                            if (item === '1') { // .trim()
                                Medication.IsStatistics = true;
                            }
                        }
                        if (fname.trim() === $translate('medicationImport.excel.way')) { // '途徑'
                            Medication.Routes = item.trim().split('&');
                        }
                        if (fname.trim() === $translate('medicationImport.excel.method')) { // '服法(頻率)'
                            Medication.Frequencys = item.trim().split('&');
                        }
                    });
                    Medication.CheckStatus = '';
                    MedicationArray.push(Medication);
                    Medication = {};
                });

            } else {
                console.log('格式無法辯識?');
            }
            vm.MedicationResult = MedicationArray;
        };
        if (rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
    };

    // 藥品資料匯入
    vm.sendFile = function sendFile() {
        vm.buttonrun = true;
        medicineService.batchImport(MedicationArray).then((rst) => {
            // 匯入成功
            // x update completed: AF(121111)。|added successfully: AG(17112401)。|added successfully: AK(17112402)。|
            // v UPDATE_COMPLETED: Diovan(12345)。|ADDED_SUCCESSFULLY: AA(1211AA)。|
            let rstarray = rst.data.split('|');
           angular.forEach(rstarray, function (rstone, ind2) {
               if (rstone !== '') {
                    let rstonearray = rstone.split(': ');
                    let keepGoing = true;
                    angular.forEach(vm.MedicationResult, function (Med, ind3) {
                        if (keepGoing) {
                            let codeNameStr = rstonearray[1]; // Calcium Acetate 667mg(井田)(22)。
                            let namex = codeNameStr.substring(0, codeNameStr.lastIndexOf('('));
                            let codex = codeNameStr.substring(codeNameStr.lastIndexOf('(') + 1);
                            codex = codex.substring(0, codex.indexOf(')'));
                            // let codeNameStr = rstonearray[1].replace('。', '');
                            // let namex = codeNameStr.substring(0, codeNameStr.indexOf('('));
                            // let codex = codeNameStr.substring(codeNameStr.indexOf('(') + 1);
                            // codex = codex.substring(0, codex.indexOf(')'));
                            if (Med.Name === namex && Med.MedicineCode.toString() === codex) {
                                if (rstonearray[0].substring(rstonearray[0].indexOf('_') + 1).replace(':', '') === 'SUCCESSFULLY' || rstonearray[0].substring(rstonearray[0].indexOf('_') + 1).replace(':', '') === 'COMPLETED') {
                                    Med.CheckStatus = rstonearray[0].substring(0, rstonearray[0].indexOf('_'));
                                } else {
                                    Med.CheckStatus = rstone; // rstonearray[0] + ' ' + rstonearray[1].replace(':', '');
                                }
                                keepGoing = false;
                            }
                        }
                    });
                }
           });
           console.log(vm.MedicationResult);
        }, (err) => {
            // 匯入失敗
            console.log('err:');
            console.log();
        });

    };

    function isUTF8(bytes) {
        if (bytes[0] === 255 && bytes[1] === 254) {
            //code = 'Unicode';
            return true;
        } else if (bytes[0] === 254 && bytes[1] === 255) {
            //code = 'UnicodeBig';
            return true;
        } else if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) {
            //code = 'UTF-8';
            return true;
        } else {
            return false;
        }
    }

    // 文件流转BinaryString
    function fixdata(data) {
        let o = '';
        let l = 0;
        let w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }
}

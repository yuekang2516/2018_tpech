import tpl from './machinePropertyImport.html';
import 'script-loader!xlsx/dist/xlsx.full.min.js';

angular.module('app').component('machinePropertyImport', {
    template: tpl,
    controller: machinePropertyImportCtrl,
    controllerAs: 'vm'
});

machinePropertyImportCtrl.$inject = ['$mdSidenav', 'Upload', '$http', '$timeout', 'PatientService', 'machineService', 'SettingService', '$filter'];
function machinePropertyImportCtrl($mdSidenav, Upload, $http, $timeout, PatientService, machineService, SettingService, $filter) {
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
    let MachineProperty = {};
    let MachinePropertyArray = [];

    let wb; // 读取完成的数据
    let rABS = true; // 是否将文件读取为二进制字符串 // false

    // 分析選取的檔案內容
    vm.importf = function importf(obj) { // 導入
        if (!obj.files) {
            return;
        }
        vm.buttonrun = false;
        MachineProperty = {};
        MachinePropertyArray = [];
        vm.MachinePropertyResult = [];
        let f = obj.files[0];
        // console.log(f.name);

        let reader = new FileReader();
        reader.onload = function (e) {
            console.log(e);
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

                    if (fieldArray[i % arrayInt].trim() === $translate('machinePropertyImport.excel.propertyNumber')) { // '財產編號'
                        MachineProperty.PropertyNumber = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('machinePropertyImport.excel.bluetoothNumber')) { // '藍芽棒編號'
                        MachineProperty.BluetoothNumber = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('machinePropertyImport.excel.brand')) { // '洗腎機廠牌'
                        MachineProperty.Brand = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('machinePropertyImport.excel.model')) { // '洗腎機型號'
                        MachineProperty.Model = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === $translate('machinePropertyImport.excel.serialNumber')) { // '洗腎機序號'
                        MachineProperty.SerialNumber = dataArray[i].trim();
                    }
                    if (fieldArray[i % arrayInt].trim() === 'Memo') {
                        MachineProperty.Memo = dataArray[i].trim();
                    }

                    if (i % arrayInt === arrayInt - 1) {
                        MachineProperty.CheckStatus = '';
                        // console.log(MachineProperty);
                        MachinePropertyArray.push(MachineProperty);
                        MachineProperty = {};
                        }
                }

            } else if (f.name.toLowerCase().indexOf('.xlsx') > -1) {
                // xlsx的處理方式
                // wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
                // wb.Sheets[Sheet名]获取第一个Sheet的数据
                // document.getElementById("demo").innerHTML= JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) );
                // console.log(wb.Sheets[wb.SheetNames[0]]);
                let xlsarray = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                angular.forEach(xlsarray, function (record, ind) {
                    angular.forEach(record, function (item, fname) {
                        if (fname.trim() === $translate('machinePropertyImport.excel.propertyNumber')) { // '財產編號'
                            MachineProperty.PropertyNumber = item.trim();
                        }
                        if (fname.trim() === $translate('machinePropertyImport.excel.bluetoothNumber')) { // '藍芽棒編號'
                            MachineProperty.BluetoothNumber = item.trim();
                        }
                        if (fname.trim() === $translate('machinePropertyImport.excel.brand')) { // '洗腎機廠牌'
                            MachineProperty.Brand = item.trim();
                        }
                        if (fname.trim() === $translate('machinePropertyImport.excel.model')) { // '洗腎機型號'
                            MachineProperty.Model = item.trim();
                        }
                        if (fname.trim() === $translate('machinePropertyImport.excel.serialNumber')) { // '洗腎機序號'
                            MachineProperty.SerialNumber = item.trim();
                        }
                        if (fname.trim() === 'Memo') {
                            MachineProperty.Memo = item.trim();
                        }
                    });
                    MachineProperty.CheckStatus = '';
                    // console.log(MachineProperty);
                    MachinePropertyArray.push(MachineProperty);
                    MachineProperty = {};
                });

            } else {
                console.log('格式無法辯識?');
            }

            vm.MachinePropertyResult = MachinePropertyArray;
        };
        if (rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
    };

    // 財產資料匯入
    vm.sendFile = function sendFile() {
        vm.buttonrun = true;
        machineService.batchImport(MachinePropertyArray).then((rst) => {
            // 匯入成功
            // x update completed: 201700100032。|added successfully: 201700100033。|added successfully: 201700100034。|
            // v UPDATE_COMPLETED: 201700100032。|ADDED_SUCCESSFULLY: 201700100033。|
            let rstarray = rst.data.split('|');
            angular.forEach(rstarray, function (rstone, ind2) {
                if (rstone !== '') {
                    let rstonearray = rstone.split(' ');
                    let keepGoing = true;
                    angular.forEach(vm.MachinePropertyResult, function (Machine, ind3) {
                        if (keepGoing) {
                            if (Machine.PropertyNumber === rstonearray[1].replace('。', '')) {
                                if (rstonearray[0].substring(rstonearray[0].indexOf('_') + 1).replace(':', '') === 'SUCCESSFULLY' || rstonearray[0].substring(rstonearray[0].indexOf('_') + 1).replace(':', '') === 'COMPLETED') {
                                    Machine.CheckStatus = rstonearray[0].substring(0, rstonearray[0].indexOf('_'));
                                } else {
                                    Machine.CheckStatus = rstone; // rstonearray[0] + ' ' + rstonearray[1].replace(':', '');
                                }
                                keepGoing = false;
                            }
                        }
                    });
                }
            });
            console.log(vm.MachinePropertyResult);
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

import tpl from './labexamImport.html';
import 'script-loader!xlsx/dist/xlsx.full.min.js';

angular.module('app').component('labexamImport', {
    template: tpl,
    controller: labexamImportCtrl,
    controllerAs: 'vm'
});

labexamImportCtrl.$inject = ['$mdSidenav', 'Upload', '$http', '$timeout', 'PatientService', 'labexamService', 'SettingService', 'labexamSettingService', '$filter'];
function labexamImportCtrl($mdSidenav, Upload, $http, $timeout, PatientService, labexamService, SettingService, labexamSettingService, $filter) {
    const vm = this;
    // const iconv = require('iconv-lite'); 

    let $translate = $filter('translate');
    vm.lang = SettingService.getLanguage();
    console.log(vm.lang);
    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    let currentHospital = SettingService.getCurrentHospital();
    // console.log(currentHospital);
    vm.loading = false;
    let Patients;
    let LabexamItems;
    let HospitalId = currentHospital.Id; // '56fcc5dd4ead7870942f61c3';
    let PatientId = '';
    let Name = '';
    let Unit = '';
    let CheckTime = '';
    let IdentifierId = '';
    let MedicalId = '';
    let Gender = '';
    let LabExam = {};
    let LabExamArray = [];

    let wb; // 读取完成的数据
    let rABS = true; // 是否将文件读取为二进制字符串 // false

    let startInd = '0';

    // 取回所有 Patient 資料
    PatientService.get().then((d) => {
        Patients = d.data;
        console.log(Patients);
    }, () => {
        // 查不到 PatientId ??!!
        console.log('查不到 PatientId');
    });

    // 取回所有檢驗檢查項目資料
    labexamSettingService.get().then((resp) => {
        console.log(resp);
        LabexamItems = resp.data;
    }, () => {
        // 查不到 PatientId ??!!
        console.log('查不到 檢驗檢查項目');
    });

    // 檢驗檢查資料匯入
    vm.sendFile = function sendFile() {
        // 加進資料庫
        let totalCnt = 0;
        let successCnt = 0;
        let falseCnt = 0;
        // 待匯入總筆數
        totalCnt = LabExamArray.length;
        // 一筆一筆上傳 => 可以 show 上傳進度??
        angular.forEach(LabExamArray, function (postData, ind2) {
            console.log(ind2 + postData.data);
            labexamService.importsingle(postData).then((a) => {
                console.log(a.data);
                console.log(ind2 + '匯入成功');
                // 匯入成功筆數
                successCnt += 1;
                setRst(a.data.PatientId, a.data.Name, a.data.Value, 'Success');
            }, (b) => {
                console.log(ind2 + '匯入失敗');
                // 匯入失敗筆數
                falseCnt += 1;
                setRst(b.data.PatientId, b.data.Name, b.data.Value, 'Fail');
            });
        });
        console.log('totalCnt=' + totalCnt + ',successCnt=' + successCnt + ',falseCnt=' + falseCnt);
    };

    function setRst(id, name, value, rst) {
        angular.forEach(vm.LabExamResult, function (labItem, ind4) {
            if (labItem.PatientId === id && labItem.Name.trim() === name.trim() && labItem.Value === value) {
                labItem.Result = rst;
            }
        });
    }

    // 分析選取的檔案內容
    vm.importf = function importf(obj) { // 导入
        if (!obj.files) {
            console.log('!obj.files');
            return;
        }

        // 匯入梢案是否包含標題列?
        if (vm.havetitle) {
            startInd = '1'; // 有, 標題列設定 1, 第2列開始為資料列
        } else {
            startInd = '0'; // 無, 標題列設定 0, 第1列開始為資料列
        }

        LabExamArray = [];
        let f = obj.files[0];
        // console.log(f.name);
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
                wb = XLSX.read(btoa(fixdata(data)), { // 手動轉化
                    type: 'base64'
                });
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            }

            // 預設欄位名Array
            let cellstr = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR,AS,AT,AU,AV,AW,AX,AY,AZ,BA,BB,BC';
            let cellArray = cellstr.split(',');
            // console.log(cellArray.length.toString());
            let fieldstr = '身份證號,病歷號,檢驗日期,W.B.C. (x1000/ul),R.B.C. (x10^6/ul),Hbc (g/dl),Hct (%),MCV (fl),Platelet (x1000/ul),Total protein (gm/dl),Albumin (gm/dl),A.S.T.[GOT] (IU/L),A.L.T.[GPT] (IU/L),Alkaline-P (IU/L),Total Bilirubin (mg/dl),Cholesterol (mg/dl),Triglyceride(mg/dl),Glucose[AC] (mg/dl),透析前收縮壓(mmHg),透析前舒張壓(mmHg),透析前體重(kg),透析後體重(kg),本次透析時間(min),本次透析前BUN (mg/dl),本次透析後BUN (mg/dl),下次透析前BUN (mg/dl),兩次透析時間間隔 (min),Creatinine (mg/dl),Uric acid (mg/dl),Na (meq/l),K (meq/l),Cl (meq/l),全鈣 (mg/dl),離子鈣 (mg/dl),P (mg/dl),Fe (ug/dl),UIBC (ug/dl),TIBC (ug/dl),Ferritin (ng/ml),Al (ng/ml),Mg (mg/dl),intact-PTH (pg/ml),Cardiac/thoracic ratio,HBsAg,Anti-HCV,EKG,身高(cm),自訂一,自訂二,自訂三,自訂四,自訂五,自訂六,自訂七,自訂八';
            let fieldArray = fieldstr.split(',');
            // console.log(fieldArray.length.toString());
            let arrayInt = cellArray.length;
            let dataArray = [];
            let dataInt = 0;
            MedicalId = ''; // 病人Id
            PatientId = ''; // 病歷號
            IdentifierId = ''; // 身份證號
            CheckTime = ''; // 檢驗日期

            if (f.name.toLowerCase().indexOf('.csv') > -1 || f.name.toLowerCase().indexOf('.txt') > -1) {
                // csv的處理方式
                // console.log(wb.Sheets.Sheet1);
                let xlsarray = wb.Sheets.Sheet1;

                // 先塞資料到三個array
                angular.forEach(xlsarray, function (record, ind) {
                    // console.log(record);
                    // console.log(ind);
                    // let rowNo = ind.substr(ind.length - 1, 1);
                    let rowNo = ''; // 列序號
                    if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                        rowNo = ind.substr(2); // 列序號
                    } else {
                        rowNo = ind.substr(1); // 列序號
                    }
                    if (rowNo === startInd) {
                        // // 欄位列
                        // cellArray[arrayInt] = ind.substr(0, ind.length - 1);
                        // // console.log(ind);
                        // // 第一列為標題
                        // if (record.t !== 'n') {
                        //     fieldArray[arrayInt] = record.v;
                        //     arrayInt += 1;
                        // }
                    } else {
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        for (let i = 0; i < arrayInt; i++) {
                            // if (cellArray[i] === ind.substr(0, ind.length - 1)) { // 比對欄位名
                            if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                                if (cellArray[i] === ind.substr(0, 2)) { // 比對欄位名
                                    // dataArray[i] = record.w;
                                    // 依資料格式取資料
                                    if (record.t === 's' || record.t === 'b') { // 欄位型態為字串 => 取 v 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                    } else { // 欄位型態為字串以外 => 取 w 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                    }
                                    dataInt += 1;
                                }
                            } else {
                                // rowNo = ind.substr(1); // 列序號
                                if (cellArray[i] === ind.substr(0, 1)) { // 比對欄位名
                                    // 依資料格式取資料
                                    if (record.t === 's' || record.t === 'b') { // 欄位型態為字串 => 取 v 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                    } else { // 欄位型態為字串以外 => 取 w 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                    }
                                    dataInt += 1;
                                    // console.log(dataInt.toString());
                                }
                            }
                        }
                        // dataArray = record.split(',');
                        // console.log(record.v);
                    }
                });
                // console.log(dataArray.length.toString());
                // console.log(dataInt.toString());
                // 從三個array拆資料, 解析待上傳內容
                let starti = 0;
                if (vm.havetitle) {
                    starti = arrayInt;
                }
                for (let i = starti; i < dataArray.length; i++) {
                    // console.log(cellArray[i % arrayInt] + '/' + fieldArray[i % arrayInt] + '/' + dataArray[i]);
                    if (fieldArray[i % arrayInt] === $translate('labexamImport.idnumber')) { // '身份證號' .trim() .trim()
                    IdentifierId = dataArray[i]; // .trim()
                    PatientId = '';
                    MedicalId = '';
                        if (IdentifierId !== '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                            if (Patient.IdentifierId === IdentifierId) {
                                PatientId = Patient.Id;
                                MedicalId = Patient.MedicalId;
                                Gender = Patient.Gender;
                                // break;
                            }
                        });
                    }
                } else if (fieldArray[i % arrayInt] === $translate('labexamImport.patientCode')) { // '病歷號' .trim() .trim()
                    if (MedicalId === '') {
                        MedicalId = dataArray[i]; // .trim()
                    }
                    if (PatientId === '' && MedicalId !== '') {
                        angular.forEach(Patients, function (Patient, ind1) {
                            if (Patient.MedicalId === MedicalId) {
                                PatientId = Patient.Id;
                                MedicalId = Patient.MedicalId;
                                Gender = Patient.Gender;
                                // break;
                            }
                        });
                    }
                } else if (fieldArray[i % arrayInt] === $translate('labexamImport.labexamdate')) { // '檢驗日期' .trim() .trim()
                    CheckTime = (parseInt(dataArray[i].substr(0, 3)) + 1911).toString() + '-' + dataArray[i].substr(3, 2) + '-' + dataArray[i].substr(5, 2);
                } else if (dataArray[i] !== null && dataArray[i] !== undefined && dataArray[i].trim() !== '') { // .trim()
                        // 開始分析檢驗檢查資料
                        if (fieldArray[i % arrayInt].indexOf('(') > 0) {
                            Name = fieldArray[i % arrayInt].substring(0, fieldArray[i % arrayInt].indexOf('(')); // .trim()
                            Unit = fieldArray[i % arrayInt].substring(fieldArray[i % arrayInt].indexOf('(') + 1).replace(')', ''); // .trim()
                        } else {
                            Name = fieldArray[i % arrayInt];
                            Unit = '';
                        }
                        LabExam.Name = Name;
                        LabExam.Value = dataArray[i]; // .trim()
                        LabExam.Unit = Unit;
                        LabExam.CheckTime = CheckTime;
                        LabExam.PatientId = PatientId;
                        LabExam.MedicalId = MedicalId;
                        LabExam.HospitalId = HospitalId;
                        LabExam.Result = '';
                        angular.forEach(LabexamItems, function (LabexamItem, ind3) {
                            if (LabexamItem.Name === Name && (LabexamItem.Gender === 'O' || LabexamItem.Gender === Gender)) {
                                if (LabExam.Unit === '') {
                                    LabExam.Unit = LabexamItem.Unit;
                                }
                                LabExam.Code = LabexamItem.Code;
                                LabExam.NormalUpper = LabexamItem.NormalUpper;
                                LabExam.NormalDown = LabexamItem.NormalDown;
                                LabExam.SettingGroup = LabexamItem.SettingGroup;
                            }
                        });
                        // console.log(LabExam);
                        LabExamArray.push(LabExam);
                        LabExam = {};
                    }
                }
                vm.LabExamResult = LabExamArray;
                console.log(LabExamArray);
                console.log(vm.LabExamResult.length);

            } else if (f.name.toLowerCase().indexOf('.xlsx') > -1 || f.name.toLowerCase().indexOf('.xls') > -1) {
                // xlsx的處理方式

                // wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
                // wb.Sheets[Sheet名]获取第一个Sheet的数据
                // document.getElementById("demo").innerHTML= JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) );
                // console.log(wb.Sheets[wb.SheetNames[0]]);
                let xlsarray = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                angular.forEach(xlsarray, function (record, ind) {
                    MedicalId = ''; // 病人Id
                    PatientId = ''; // 病歷號
                    IdentifierId = ''; // 身份證號
                    CheckTime = ''; // 檢驗日期
                    angular.forEach(record, function (item, fname) {
                        if (fname.trim() === $translate('labexamImport.idnumber')) { // '身份證號'
                            IdentifierId = item.trim();
                            if (IdentifierId !== '') {
                                angular.forEach(Patients, function (Patient, ind1) {
                                    if (Patient.IdentifierId === IdentifierId) {
                                        PatientId = Patient.Id;
                                        MedicalId = Patient.MedicalId;
                                        Gender = Patient.Gender;
                                        // break;
                                    }
                                });
                            }
                        } else if (fname.trim() === $translate('labexamImport.patientCode')) { // '病歷號'
                            if (MedicalId === '') {
                                MedicalId = item.trim();
                            }
                            if (PatientId === '' && MedicalId !== '') {
                                angular.forEach(Patients, function (Patient, ind1) {
                                    if (Patient.MedicalId === MedicalId) {
                                        PatientId = Patient.Id;
                                        MedicalId = Patient.MedicalId;
                                        Gender = Patient.Gender;
                                        // break;
                                    }
                                });
                            }
                        } else if (fname.trim() === $translate('labexamImport.labexamdate')) { // '檢驗日期'
                            CheckTime = (parseInt(item.substr(0, 3)) + 1911).toString() + '-' + item.substr(3, 2) + '-' + item.substr(5, 2);
                        } else if (item.trim() !== '') {
                            // 開始分析檢驗檢查資料
                            fname = fname.trim();
                            if (fname.indexOf('(') > 0) {
                                Name = fname.substring(0, fname.indexOf('(')).trim();
                                Unit = fname.substring(fname.indexOf('(') + 1).replace(')', '').trim();
                            } else {
                                Name = fname.trim();
                                Unit = '';
                            }
                            LabExam.Name = Name;
                            LabExam.Value = item.trim();
                            LabExam.Unit = Unit;
                            LabExam.CheckTime = CheckTime;
                            LabExam.PatientId = PatientId;
                            LabExam.MedicalId = MedicalId;
                            LabExam.HospitalId = HospitalId;
                            LabExam.Result = '';
                            angular.forEach(LabexamItems, function (LabexamItem, ind3) {
                                if (LabexamItem.Name === Name && (LabexamItem.Gender === 'O' || LabexamItem.Gender === Gender)) {
                                    if (LabExam.Unit === '') {
                                        LabExam.Unit = LabexamItem.Unit;
                                    }
                                    LabExam.Code = LabexamItem.Code;
                                    LabExam.NormalUpper = LabexamItem.NormalUpper;
                                    LabExam.NormalDown = LabexamItem.NormalDown;
                                    LabExam.SettingGroup = LabexamItem.SettingGroup;
                                }
                            });
                            // console.log(LabExam);
                            LabExamArray.push(LabExam);
                            LabExam = {};
                        }
                    });
                });
                vm.LabExamResult = LabExamArray;
                console.log(LabExamArray);
                console.log(vm.LabExamResult.length);
                // let aaa = JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));

            } else {
                console.log('格式無法辯識?');
            }
        };
        if (rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
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

    function fixdata(data) { // 文件流转BinaryString
        let o = '';
        let l = 0;
        let w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }
}


    // let fieldArray = '';
    // let dataArray = '';
    // // 分析選取的檔案內容
    // vm.handleChangeBase64 = function handleChangeBase64() {
    //     $timeout(() => {
    //     });
    //     if (vm.Photo) {
    //         Upload.dataUrl(vm.Photo).then(
    //             (x) => {
    //                 vm.Photo = x;
    //                 $http.get(vm.Photo).success(function (data) {
    //                     angular.forEach(data.split('\n'), function (record, ind) {
    //                         if (ind === 0) {
    //                             // 第一列為標題不會匯入
    //                             fieldArray = record.split(',');
    //                         } else if (record !== '') {
    //                             // 第二列開始才是資料列
    //                             dataArray = record.split(',');
    //                             // 取到 PatientId 再繼續
    //                             PatientId = '';
    //                             // 取身份證號
    //                             IdentifierId = dataArray[0].trim();
    //                             // 取病歷號
    //                             MedicalId = dataArray[1].trim();
    //                             angular.forEach(Patients, function (Patient, ind1) {
    //                                 if (Patient.IdentifierId === IdentifierId || Patient.MedicalId === MedicalId) {
    //                                     PatientId = Patient.Id;
    //                                 }
    //                             });
    //                             // 取檢驗日期
    //                             CheckTime = (parseInt(dataArray[2].substr(0, 3)) + 1911).toString() + '-' + dataArray[2].substr(3, 2) + '-' + dataArray[2].substr(5, 2);
    //                             // 開始分析檢驗檢查資料
    //                             for (let i = 3; i < fieldArray.length - 1; i++) {
    //                                 if (dataArray[i] !== '') {
    //                                     if (fieldArray[i].indexOf('(') > 0) {
    //                                         Name = fieldArray[i].substring(0, fieldArray[i].indexOf('(')).trim();
    //                                         Unit = fieldArray[i].substring(fieldArray[i].indexOf('(') + 1).replace(')', '').trim();
    //                                     } else {
    //                                         Name = fieldArray[i].trim();
    //                                         Unit = '';
    //                                     }
    //                                     LabExam.Name = Name;
    //                                     LabExam.Value = dataArray[i].trim();
    //                                     LabExam.Unit = Unit;
    //                                     LabExam.CheckTime = CheckTime;
    //                                     LabExam.PatientId = PatientId;
    //                                     LabExam.MedicalId = MedicalId;
    //                                     LabExam.HospitalId = HospitalId;
    //                                     LabExamArray.push(LabExam);
    //                                     LabExam = {};
    //                                 }
    //                             }
    //                         }
    //                     });
    //                     // LabExam = LabExam.substring(0, LabExam.length - 1);
    //                     console.log(LabExamArray);
    //                     vm.LabExamResult = LabExamArray;
    //                 });
    //             }
    //         );
    //     }
    // };

                                        // LabExam += '{';
                                        // // LabExam += '"DateTimestamp":"' + DTStamp + '",';
                                        // // LabExam += '"Code":null,';
                                        // LabExam += '"Name":"' + Name + '",';
                                        // LabExam += '"Value":"' + dataArray[i].trim() + '",';
                                        // // LabExam += '"NormalUpper":null,';
                                        // // LabExam += '"NormalDown":null,';
                                        // LabExam += '"Unit":"' + Unit + '",';
                                        // // LabExam += '"IsNormal":true,';
                                        // LabExam += '"CheckTime":"' + CheckTime + '",';
                                        // // LabExam += '"DialysisId":null,';
                                        // LabExam += '"PatientId":"' + PatientId + '",';
                                        // LabExam += '"MedicalId":"' + MedicalId + '",';
                                        // // LabExam += '"Memo":null,';
                                        // // LabExam += '"Group":null,';
                                        // LabExam += '"HospitalId":"' + HospitalId + '"';
                                        // // LabExam += '"HospitalId":"' + HospitalId + '",';
                                        // // LabExam += '"Revision":1,';
                                        // // LabExam += '"Status":"Normal",';
                                        // // LabExam += '"CreatedUserId":"' + CreatedUserId + '",';
                                        // // LabExam += '"CreatedUserName":"系統匯入",';
                                        // // LabExam += '"CreatedTime":"' + DTStamp + '",';
                                        // // LabExam += '"ModifiedUserId":null,';
                                        // // LabExam += '"ModifiedUserName":null,';
                                        // // LabExam += '"ModifiedTime":null,';
                                        // // LabExam += '"Id":null';
                                        // LabExam += '}，';


// A22596506900227     1060922  21.45  15.22
// L18931304800918291  1060922  21.45  15.22
// A20595961808976     1060922  21.45  15.22
// C25212495009675     1060922  21.45  15.22

// 檢驗紀錄欄位說明
//    01	身份證號		S	10
//    02	病歷號			S	10
//    03	日期			S	7	前三碼為年份，中兩碼為月份，後兩碼為日數，例：0880101為民國88年1月1日
//    04	W.B.C. (x1000/ul)	N	7.2
//    05	R.B.C. (x10^6/ul)	N	7.2
//    06	Hbc (g/dl)		N	7.2
//    07	Hct (%)			N	7.2
//    08	MCV (fl)		N	7.2
//    09	Platelet (x1000/ul)	N	7.2
//    10	Total protein (gm/dl)	N	7.2
//    11	Albumin (gm/dl)		N	7.2
//    12	A.S.T.[GOT] (IU/L)	N	7.2
//    13	A.L.T.[GPT] (IU/L)	N	7.2
//    14	Alkaline-P (IU/L)	N	7.2
//    15	Total Bilirubin (mg/dl)	N	7.2
//    16	Cholesterol (mg/dl)	N	7.2
//    17	Triglyceride(mg/dl)	N	7.2
//    18	Glucose[AC] (mg/dl)	N	7.2
//    19	透析前收縮壓(mmHg)	N	7.2
//    20	透析前舒張壓(mmHg)	N	7.2
//    21	透析前體重(kg)		N	7.2
//    22	透析後體重(kg)		N	7.2
//    23	本次透析時間(min)	N	7.2
//    24	本次透析前BUN (mg/dl)	N	7.2
//    25	本次透析後BUN (mg/dl)	N	7.2
//    26	下次透析前BUN (mg/dl)	N	7.2
//    27	兩次透析時間間隔 (min)	N	7.2
//    28	Creatinine (mg/dl)	N	7.2
//    29	Uric acid (mg/dl)	N	7.2
//    30	Na (meq/l) 		N	7.2
//    31	K (meq/l)		N	7.2
//    32	Cl (meq/l)		N	7.2
//    33	全鈣 (mg/dl)		N	7.2
//    34	離子鈣 (mg/dl)		N	7.2
//    35	P (mg/dl)		N	7.2
//    36	Fe (ug/dl)		N	7.2
//    37	UIBC (ug/dl)		N	7.2
//    38	TIBC (ug/dl)		N	7.2
//    39	Ferritin (ng/ml)	N	7.2
//    40	Al (ng/ml)		N	7.2
//    41	Mg (mg/dl)		N	7.2
//    42	intact-PTH (pg/ml)	N	7.2
//    43	Cardiac/thoracic ratio	N	7.3
//    44	HBsAg			S	1	"Y=陽性(+)    N=陰性(-)    O=未做"
//    45	Anti-HCV		S	1	"Y=陽性(+)    N=陰性(-)    O=未做"
//    46	EKG			S	40
//    47	身高(cm)		N	7.3
//    48	自訂一			N	7.2
//    49	自訂二			N	7.2
//    50	自訂三			N	7.2
//    51	自訂四			N	7.2
//    52	自訂五			N	7.2
//    53	自訂六			N	7.2
//    54	自訂七			S	30
//    55	自訂八			S	30

// const FAKEDATA = [
//   {
//         "DateTimestamp": "2017-09-21T06:52:59.030Z",
//         "Code": null,
//         "Name": "MCHC平均血球血濃度",
//         "Value": "53",
//         "NormalUpper": null,
//         "NormalDown": null,
//         "Unit": "%",
//         "IsNormal": true,
//         "CheckTime": "2017-09-21T06:52:59.030Z",
//         "DialysisId": null,
//         "PatientId": "57889c0827920c3e0cc57546",
//         "MedicalId": "00227",
//         "Memo": null,
//         "Group": null,
//         "HospitalId": "56fcc5dd4ead7870942f61c3",
//         "Revision": 1,
//         "Status": "Normal",
//         "CreatedUserId": "admin",
//         "CreatedUserName": "系統匯入",
//         "CreatedTime": "2017-09-21T06:52:59.030Z",
//         "ModifiedUserId": null,
//         "ModifiedUserName": null,
//         "ModifiedTime": null,
//         "Id": null
//     }
// ];

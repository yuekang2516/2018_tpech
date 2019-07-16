import tpl from './kidit.html';
import 'script-loader!xlsx/dist/xlsx.full.min.js';
import 'static/tableExport.js';

angular.module('app').component('kidit', {
    template: tpl,
    controller: SystemkiditCtrl,
    controllerAs: 'vm'
});

SystemkiditCtrl.$inject = ['$mdSidenav', '$state', '$stateParams', 'wardService', 'SettingService', 'Upload', 'PatientService', '$filter', 'kiditService','pdTreatService'];
function SystemkiditCtrl($mdSidenav, $state, $stateParams, wardService, SettingService, Upload, PatientService, $filter, kiditService,
    pdTreatService) {
    const vm = this;
    let $translate = $filter('translate');

    // 有可能是手機點進來的, 所以要把左側選單收起來
    // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
    $mdSidenav('left').close();
    vm.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

    const serverApiUrl = SettingService.getServerUrl();

    // 醫院代碼設定
    vm.systemCode = 'yuekang';

    vm.loading = false;

    // 取得透析室資料
    wardService.get().then((resp) => {
        vm.Wards = _.map(resp.data, function (q) {
            return { Id: q.Id, Name: q.Name };
        });
        if (resp.data.length > 0) {
            vm.Ward = vm.Wards[0];
        }
    });

    // 日期選單
    vm.dialysisStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.dialysisEndDate = new Date();
    vm.prescriptionStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.prescriptionEndDate = new Date();
    vm.prescriptionSetDate = new Date();
    vm.vesselStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.vesselEndDate = new Date();
    vm.labexamStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.labexamEndDate = new Date();

    vm.opts = {
        autoApply: true
    };

    // 透析資料匯出
    vm.exportDialysisCSV = function exportDialysisCSV() {
        // 時間格式處理
        vm.dialysisStartDateFormat = moment(vm.dialysisStartDate).format('YYYY-MM-DD');
        vm.dialysisEndDateFormat = moment(vm.dialysisEndDate).format('YYYY-MM-DD');

        // 經由API下載csv檔案
        window.location = `${serverApiUrl}/api/kidit/exportDialysisCSV?startDate=${vm.dialysisStartDateFormat}&endDate=${vm.dialysisEndDateFormat}&type=${SettingService.getLanguage()}`;
        console.log(window.location);
    };

    // 透析處方匯出
    vm.exportPrescriptionCSV = function exportPrescriptionCSV() {
        let prescriptionSetDateFormat = null;
        // 時間格式處理
        vm.prescriptionStartDateFormat = moment(vm.prescriptionStartDate).format('YYYY-MM-DD');
        vm.prescriptionEndDateFormat = moment(vm.prescriptionEndDate).format('YYYY-MM-DD');
        if (vm.prescriptionDate) {
            prescriptionSetDateFormat = moment(vm.prescriptionSetDate).format('YYYY-MM-DD');
        }

        // 經由API下載csv檔案
        window.location = `${serverApiUrl}/api/kidit/exportPrescriptionCSV?startDate=${vm.prescriptionStartDateFormat}&endDate=${vm.prescriptionEndDateFormat}&setDate=${prescriptionSetDateFormat}&type=${SettingService.getLanguage()}`;
    };

    // 病人資料匯出
    vm.exportPatientCSV = function exportPatientCSV() {
        // 經由API下載csv檔案
        window.location = `${serverApiUrl}/api/kidit/ExportPatientCSV?type=${SettingService.getLanguage()}`;
    };

    // 造管資料匯出
    vm.exportVesselCSV = function exportVesselCSV() {
        // 時間格式處理
        vm.vesselStartDateFormat = moment(vm.vesselStartDate).format('YYYYMMDD');
        vm.vesselEndDateFormat = moment(vm.vesselEndDate).format('YYYYMMDD');

        // 經由API下載csv檔案
        window.location = `${serverApiUrl}/api/kidit/exportVesselCsv?startDate=${vm.vesselStartDateFormat}&endDate=${vm.vesselEndDateFormat}&type=${SettingService.getLanguage()}`;
        //window.location = `http://172.30.1.104:3424/api/kidit/exportVesselCsv?startDate=${vm.vesselStartDateFormat}&endDate=${vm.vesselEndDateFormat}&type=${SettingService.getLanguage()}`;
    };
    //腹膜透析處方匯出 start
    vm.PDTreatRecordStartDate = new Date(moment().add(-1, 'M').format('YYYY-MM-DD'));
    vm.PDTreatRecordEndDate = new Date();
    vm.exportPDTreatRecordCSV = function exportPDTreatRecordCSV (event){
        if (event) {
            event.currentTarget.disabled = true;
        }
        let PDTreatRecordStartDate = moment(vm.PDTreatRecordStartDate).format('YYYY-MM-DD');
        let PDTreatRecordEndDate = moment(vm.PDTreatRecordEndDate).format('YYYY-MM-DD');
        let exportData = [];
        pdTreatService.GetListByDateRange(PDTreatRecordStartDate,PDTreatRecordEndDate,"NORMAL").then((res) => {
            if(res.data.length > 0){
                exportData = res.data;
                let excelTable = "";
                    excelTable += "<table id='excelTable'>";
                    excelTable += "<thead><tr>";
                    excelTable += "<th>身份證號</th>";
                    excelTable += "<th>病歷號</th>";
                    excelTable += "<th>日期</th>";
                    excelTable += "<th>長期腹膜透析方式</th>";
                    excelTable += "<th>換液系統</th>";
                    excelTable += "<th>是否兼做血液透析</th>";
                    excelTable += "<th>血液透析次/月(HD)</th>";
                    excelTable += "<th>主要換袋者</th>";
                    excelTable += "<th>透析液系統</th>";
                    excelTable += "<th>升數</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>每日袋數</th>";
                    excelTable += "<th>升數</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>每日袋數</th>";
                    excelTable += "<th>升數</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>每日袋數</th>";
                    excelTable += "<th>升數</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>每日袋數</th>";
                    excelTable += "<th>夜間透析總治療時間</th>";
                    excelTable += "<th>灌注量</th>";
                    excelTable += "<th>換液次數</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>葡萄糖濃度</th>";
                    excelTable += "<th>鈣離子濃度</th>";
                    excelTable += "<th>鉀離子濃度</th>";
                    excelTable += "<th>鹼基</th>";
                    excelTable += "<th>透析液滲透物質</th>";
                    excelTable += "<th>ESA種類</th>";
                    excelTable += "<th>ESA 劑量 (IU)</th>";
                    excelTable += "</tr></thead>";
                    excelTable += "<tbody>";
                //取清單之後再組合字串
                let pdDetail_CAPD = [];                
                let pdDetail_APD = [];
                let promises = [];
                exportData.forEach(e =>{
                    promises.push(
                        pdTreatService.getDetailList(e.Id,"Normal").then((res2) => {
                            let pdDetail = res2.data;
                            if(pdDetail.length > 0){
                                pdDetail_CAPD = pdDetail.filter(o =>{
                                    return o.Fluidchangetime == 'White';
                                });
                                pdDetail_APD = pdDetail.filter(o =>{
                                    return o.Fluidchangetime == 'Night';
                                });
                            }
                            pdDetail_CAPD.length = 4;
                            for (let index = 0; index < pdDetail_CAPD.length; index++) {
                                if(typeof pdDetail_CAPD[index] == "undefined"){
                                    pdDetail_CAPD[index] = null;
                                }
                            }
                            
                            pdDetail_APD.length = 2;
                            for (let index = 0; index < pdDetail_APD.length; index++) {
                                if(typeof pdDetail_APD[index] == "undefined"){
                                    pdDetail_APD[index] = null;
                                }
                            }
                            let tr = CreateTrData(e,pdDetail_CAPD,pdDetail_APD);
                            excelTable += tr;
                        }).then((res)=>{
                            //self.getDetailList_load = false;
                        })
                    );
                });
                
                Promise.all(promises).then(() => {
                }).then(function(reason){
                    excelTable += "</tbody>";
                    excelTable += "<table>";
                    $('#excelDiv').append(excelTable);
                    let MyTabel = $('#excelTable');
                    MyTabel.tableExport({
                        fileName: 'catheterInfect',
                        type:'csv'
                    });
                    $('#excelTable').remove();
                    event.currentTarget.disabled = false;
                });
            }
            
        }).then((res)=>{
            //self.getDetailList_load = false;
        });

    }
    function CreateTrData(exportData,pdDetail_CAPD,pdDetail_APD){
        let output = "";
        let e = exportData;
        let Dialysis_Type = [
                {"Value":"A","Text":"CAPD"},
                {"Value":"B","Text":"APD"},
                {"Value":"C","Text":"CCPD"},
                {"Value":"D","Text":"NPD"},
                {"Value":"E","Text":"TPD"},
                {"Value":"F","Text":"IPD"},
                {"Value":"G","Text":"其他"}
            ];//腹膜透析類別
        let Liquid_Exchange_System =[
            {"Value":"A1","Text":"Manual Spike"},
            {"Value":"A2","Text":"CXD"},
            {"Value":"A3","Text":"UVXD"},
            {"Value":"A4","Text":"UV flash"},
            {"Value":"A5","Text":"O set"},
            {"Value":"A6","Text":"Ultra-set"},
            {"Value":"A7","Text":"Twin bag"},
            {"Value":"A8","Text":"Fresenius"},
            {"Value":"AA","Text":"Stay safe"},
            {"Value":"A9","Text":"其他"},
            {"Value":"B1","Text":"PAC-Xtra"},
            {"Value":"B2","Text":"HomeChoice"},
            {"Value":"B3","Text":"Quantum"},
            {"Value":"B4","Text":"Fresenius"},
            {"Value":"B9","Text":"其他"}
        ];//換液系統
        let Dialysis_System = [
            {"Value":"1","Text":"Baxter"},
            {"Value":"2","Text":"Fresenius"},
            {"Value":"3","Text":"Nutrineal"},
            {"Value":"4","Text":"Extraneal"},
            {"Value":"9","Text":"其他"}
        ];//透析液系統
        let Major_Bag_Changers =[
            {"Value":"1","Text":"病人"},
            {"Value":"2","Text":"配偶"},
            {"Value":"3","Text":"其他家屬"},
            {"Value":"4","Text":"外傭"}
        ];//主要換袋者
        let Alkali_Base =[
            {"Value":"1","Text":"Acetate"},
            {"Value":"2","Text":"Bicarbonate"},
            {"Value":"3","Text":"Lactate"}
        ];//鹼基
        let Esa_Types = [
                {"Value":"1","Text":"Eprex"},
                {"Value":"2","Text":"Recormon"},
                {"Value":"3","Text":"Aranesp"},
                {"Value":"4","Text":"Glycol-epoetin-b"},
                {"Value":"5","Text":"Nesp"},
                {"Value":"9","Text":"其它"}
            ];
        let DialysisOsmoticSubstanceCheck = ['Glucose','Glucose polymer','Amino acid','其他'];
            e.IdentifierId = "";
            e.MedicalId = "";
            let p = Patients.find(x =>{
                return x.Id == e.Patientid;
            });

            if(typeof p !="undefined"){
                e.IdentifierId = p.IdentifierId;
                e.MedicalId = p.MedicalId; 
            }
            //---長期腹膜透析方式---
            let Dialysis_TypeVal = Dialysis_Type.filter(o =>{
                return o.Text == e.Dialysis_Type;
            });
            if(Dialysis_TypeVal.length>0){
                Dialysis_TypeVal = Dialysis_TypeVal[0]['Value'];
            }else{
                Dialysis_TypeVal ="";
            }
            //---長期腹膜透析方式---
            //---換液系統---
            let Liquid_Exchange_SystemVal = Liquid_Exchange_System.filter(o =>{
                return o.Text === e.Liquid_Exchange_System;
            });
            if(Liquid_Exchange_SystemVal.length>0){
                Liquid_Exchange_SystemVal = Liquid_Exchange_SystemVal[0]['Value'];
            }else{
                Liquid_Exchange_SystemVal ="";
            }
            //---換液系統---
            //---主要換袋者---
            let Major_Bag_ChangersVal = Major_Bag_Changers.filter(o =>{
                return o.Text === e.Major_Bag_Changers;
            });
            if(Major_Bag_ChangersVal.length>0){
                Major_Bag_ChangersVal = Major_Bag_ChangersVal[0]['Value'];
            }else{
                Major_Bag_ChangersVal ="";
            }
            //---主要換袋者---
            //---透析液系統---
            let Dialysis_SystemVal = Dialysis_System.filter(o =>{
                return o.Text === e.Dialysis_System;
            });
            if(Dialysis_SystemVal.length>0){
                Dialysis_SystemVal = Dialysis_SystemVal[0]['Value'];
            }else{
                Dialysis_SystemVal ="";
            }
            //---透析液系統---
            //---鹼基---
            let Alkali_BaseVal = Alkali_Base.filter(o =>{
                return o.Text === e.Alkali_Base;
            });
            if(Alkali_BaseVal.length>0){
                Alkali_BaseVal = Alkali_BaseVal[0]['Value'];
            }else{
                Alkali_BaseVal ="";
            }
            //---鹼基---
            //透析液滲透物質
            let dostr = [0,0,0,0,0,0,0,0,0,0];
            if(e.Dialysis_Osmotic_Substance != null){
                if(e.Dialysis_Osmotic_Substance.split(',').length > 0){   
                        e.Dialysis_Osmotic_Substance.split(',').forEach(o =>{
                        let findindex = DialysisOsmoticSubstanceCheck.indexOf(o);
                        dostr[findindex] = 1;
                    });
                }
            }
            
            dostr = dostr.join().replace(/,/g,'');
            //透析液滲透物質
            let Esa_TypesVal = Esa_Types.filter(o =>{
                return o.Text === e.Esa_Types;
            });
            if(Esa_TypesVal.length>0){
                Esa_TypesVal = Esa_TypesVal[0]['Value'];
            }else{
                Esa_TypesVal ="";
            }
            e.Prescription_Startdate = moment(e.Prescription_Startdate).format('YYYY-MM-DD');
            output = "<tr>";
            output += `<td>${e.IdentifierId}</td>`;
            output += `<td>${e.MedicalId}</td>`;
            output += `<td>${e.Prescription_Startdate}</td>`;
            output += `<td>${Dialysis_TypeVal}</td>`;
            output += `<td>${Liquid_Exchange_SystemVal}</td>`;
            output += `<td>${e.Is_With_Hemodialysis}</td>`;
            output += `<td>${e.Monthly_Hemodialysis_Times}</td>`;
            output += `<td>${Major_Bag_ChangersVal}</td>`;
            output += `<td>${Dialysis_SystemVal}</td>`;
            pdDetail_CAPD.forEach(capd =>{
                if(capd == null){
                    output += `<td></td>`;
                    output += `<td></td>`;
                    output += `<td></td>`;
                    output += `<td></td>`;
                }else{
                    capd.Baglitre = capd.Baglitre.replace('其他|','')
                    output += `<td>${capd.Baglitre}</td>`;
                    output += `<td>${capd.Glucoseconcentration}</td>`;
                    output += `<td>${capd.Calciumconcentration}</td>`;
                    output += `<td>${capd.Bagnumber}</td>`;
                }
                
            });
            output += `<td>${e.Night_Total_Treatment_Time}</td>`;
            output += `<td>${e.Night_Perfusion_Volume}</td>`;
            output += `<td>${e.Night_Liquid_Exchange_Times}</td>`;
            pdDetail_APD.forEach(apd =>{  
                if(apd == null){
                    output += `<td></td>`;
                    output += `<td></td>`;
                }else{
                    output += `<td>${apd.Glucoseconcentration}</td>`;
                    output += `<td>${apd.Calciumconcentration}</td>`;
                }
            });
            output += "<td></td>";
            output += `<td>${Alkali_BaseVal}</td>`;
            
            output += `<td>${dostr}</td>`;
            output += `<td>${Esa_TypesVal}</td>`;
            
            if(e.Esa_Dose_U == null){
                e.Esa_Dose_U = "";
            }
            output += `<td>${e.Esa_Dose_U}</td>`;
            output += "</tr>";
            
        return output;
        
    }
    //腹膜透析處方匯出 end

    // 檢驗檢查匯出
    vm.exportLabexamCSV = function exportLabexamCSV() {
        // 時間格式處理
        vm.labexamStartDateFormat = moment(vm.labexamStartDate).format('YYYY-MM-DD');
        vm.labexamEndDateFormat = moment(vm.labexamEndDate).format('YYYY-MM-DD');
        // 經由API下載csv檔案
        //window.location = `http://172.30.1.36:8881/api/kidit/exportLabexamCsv?startDate=${vm.labexamStartDateFormat}&endDate=${vm.labexamEndDateFormat}&type=${SettingService.getLanguage()}`;
        window.location = `${serverApiUrl}/api/kidit/exportLabexamCsv?startDate=${vm.labexamStartDateFormat}&endDate=${vm.labexamEndDateFormat}&type=${SettingService.getLanguage()}`;
    };

    // 病人資料匯入
    vm.sendFile = function sendFile() {
        vm.upload = Upload.upload({
            url: `${serverApiUrl}/api/kidit/importPatientCsv`,
            data: { uploadFile: vm.myfile, wardName: vm.Ward.Name, wardId: vm.Ward.Id }
        }).then(function (resp) {
            vm.Message = resp.data;
            vm.loading = false;
        }, function (error) {
            vm.Message = error.data;
            vm.loading = false;
        }, function (evt) {
            vm.loading = true;
            vm.Message = '';
        });
    };

    // 處方資料匯入
    let Patients;
    let PrescriptionArray = [];

    // 取回所有 Patient 資料
    PatientService.get().then((d) => {
        Patients = d.data;
        console.log(Patients);
    }, () => {
        // 查不到 PatientId ??!!
        console.log('查不到 PatientId');
    });

    // 處方按匯入
    vm.sendFile1 = function sendFile1() {
        // 加進資料庫
        let totalCnt = 0;
        let successCnt = 0;
        let falseCnt = 0;
        // 待匯入總筆數
        totalCnt = PrescriptionArray.length;
        // 一筆一筆上傳 => 可以 show 上傳進度??
        angular.forEach(PrescriptionArray, function (postData, ind2) {
            console.log(ind2 + postData);
            kiditService.importsingle(postData).then((a) => {
                console.log(a.data);
                console.log(ind2 + '匯入成功');
                // 匯入成功筆數
                successCnt += 1;
                setRst(a.data.PatientId, 'Success');
            }, (b) => {
                console.log(b.data);
                console.log(ind2 + '匯入失敗');
                // 匯入失敗筆數
                falseCnt += 1;
                setRst(b.data.PatientId, 'Fail');
            });
        });
        console.log('totalCnt=' + totalCnt + ',successCnt=' + successCnt + ',falseCnt=' + falseCnt);
    };

    // 處方匯入結果
    function setRst(id, rst) {
        angular.forEach(vm.PrescriptionResult, function (labItem, ind4) {
            if (labItem.PatientId === id) { //  && labItem.Name === name && labItem.Value === value
                labItem.Result = rst;
            }
        });
    }

    // 處方 分析選取的檔案內容
    vm.importf = function importf(obj) { // 导入
        if (!obj.files) {
            return;
        }
        let currentHospital = SettingService.getCurrentHospital();
        let HospitalId = currentHospital.Id; // '56fcc5dd4ead7870942f61c3';
        let PatientId = '';
        let CreatedTime = '';
        let IdentifierId = '';
        let MedicalId = '';
        let AnticoagulantsName = ''; // 抗凝劑
        let Anticoagulants1 = ''; // 初劑量
        let Anticoagulants2 = ''; // 維持劑量
        let Prescription = {};
        let wb; // 读取完成的数据
        let rABS = true; // 是否将文件读取为二进制字符串 // false

        PrescriptionArray = [];
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
                wb = XLSX.read(btoa(fixdata(data)), { // 手動轉化
                    type: 'base64'
                });
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            }

            let cellArray = [];
            let dataArray = [];
            let startInd = '0';
            let arrayInt = 0;
            let dataInt = 0;
            MedicalId = ''; // 病歷號
            PatientId = ''; // 病人Id
            IdentifierId = ''; // 身份證號
            CreatedTime = ''; // 處方日期
            AnticoagulantsName = ''; // 抗凝劑
            Anticoagulants1 = ''; // 初劑量
            Anticoagulants2 = ''; // 維持劑量
            // 預設欄位名Array
            let cellstr = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q';
            cellArray = cellstr.split(',');
            arrayInt = cellArray.length;
            // 匯入檔案是否包含標題列?
            if (vm.havetitle) {
                startInd = '1'; // 有, 標題列設定 1, 第2列開始為資料列
            } else {
                startInd = '0'; // 無, 標題列設定 0, 第1列開始為資料列
            }
            // console.log('startInd=' + startInd);
            let xlsarray;
            if (f.name.toLowerCase().indexOf('.csv') > -1 || f.name.toLowerCase().indexOf('.txt') > -1) {
                // csv的處理方式
                xlsarray = wb.Sheets.Sheet1;

                angular.forEach(xlsarray, function (record, ind) {
                    // let rowNo = ind.substr(ind.length - 1, 1); // 列序號
                    let rowNo = ind.substr(1); // 列序號
                    if (rowNo === startInd) {
                        // 欄位列, 第一列為標題
                    } else {
                        // console.log(rowNo);
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        // record.t === 's' 時, value 抓 record.v (string) A12345 => v:A12345
                        // record.t === 'n' 時, value 抓 record.w (number) 00027 => w:00027,v:27
                        for (let i = 0; i < arrayInt; i++) { // 欄數
                            // if (cellArray[i] === ind.substr(0, ind.length - 1)) { // 比對欄位名
                            if (cellArray[i] === ind.substr(0, 1)) { // 比對欄位名
                                    // 依資料格式取資料
                                if (record.t === 's') { // 欄位型態為字串 => 取 v 值
                                    dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                } else { // 欄位型態為字串以外 => 取 w 值
                                    dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                }
                                dataInt += 1;
                                // console.log(dataInt.toString());
                            }
                        }
                    }
                });
                // 從兩個array拆資料, 解析待上傳內容
                console.log(dataInt);
                console.log(arrayInt);
                console.log(dataArray.length);
                let starti = 0;
                if (vm.havetitle) {
                    starti = arrayInt;
                }
                for (let i = starti; i < dataArray.length; i++) {
                    if (i % arrayInt === 0) { // '身份證號'
                        // console.log(i.toString());
                        AnticoagulantsName = ''; // 抗凝劑
                        Anticoagulants1 = ''; // 初劑量
                        Anticoagulants2 = ''; // 維持劑量
                        Prescription = {};

                        IdentifierId = dataArray[i]; // .trim()
                        if (IdentifierId !== '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                                if (Patient.IdentifierId.toUpperCase() === IdentifierId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 1) { // '病歷號'
                        MedicalId = dataArray[i]; // .trim()
                        if (PatientId === '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                                if (Patient.MedicalId.toUpperCase() === MedicalId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 2) { // '處方日期'
                        CreatedTime = (parseInt(dataArray[i].substr(0, 3)) + 1911).toString() + '-' + dataArray[i].substr(3, 2) + '-' + dataArray[i].substr(5, 2);
                    } else if (dataArray[i] !== '' && dataArray[i] !== 'undefined') { // .trim()
                        if (i % arrayInt === 3) { // '透析方式'
                            let Modex = {};
                            _.forEach(ModeCode, (value) => {
                                if (value.value === dataArray[i].substring(0, 1)) { // .trim()
                                    Modex.Name = value.name;
                                    Modex.Volumn = null;
                                }
                            });
                            Prescription.DialysisMode = Modex;
                        }
                        if (i % arrayInt === 4) { // '血液流速 (ml/min)'
                            Prescription.BF = parseInt(dataArray[i]); // .trim()
                        }
                        if (i % arrayInt === 5) { // '透析液流速 (ml/min)'
                            Prescription.DialysateFlowRate = parseInt(dataArray[i]); // .trim()
                        }
                        if (i % arrayInt === 6) { // '每週次數'
                            _.forEach(FrequencyCode, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Prescription.Frequency = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 8) { // '每次透析時間 (Hr)'
                            let Durationx = {};
                            Durationx.Hours = Math.floor(parseFloat(dataArray[i])); // .trim()
                            Durationx.Minutes = (parseFloat(dataArray[i]) % 1) * 60; // .trim()
                            Durationx.Seconds = 0;
                            Prescription.Duration = Durationx;
                        }
                        if (i % arrayInt === 9) { // '透析器表面積 (m^2)'
                            Prescription.DialyzerSurfaceArea = dataArray[i];
                        }
                        if (i % arrayInt === 10) { // '抗凝劑'
                            _.forEach(AnticoagulantsCode, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    AnticoagulantsName = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 11) { // '初劑量 (U)'
                            Anticoagulants1 = dataArray[i]; // .trim()
                        }
                        if (i % arrayInt === 12) { // '維持劑量(U/小時)'
                            Anticoagulants2 = dataArray[i]; // .trim()
                        }
                        if (i % arrayInt === 13) { // '透析器型號'
                            _.forEach(AKCode, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Prescription.ArtificialKidney = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 15) { // '鈣離子濃度(meq/L)'
                            Prescription.Dialysate = dataArray[i]; // .trim()
                            if (dataArray[i].indexOf('.') < 0) { // .trim()
                                Prescription.Dialysate += '.0';
                            }
                        }
                        if (i % arrayInt === 16) { // '鉀離子濃度(meq/L)'
                            Prescription.Dialysate = Prescription.Dialysate + '/' + dataArray[i]; // .trim()
                            if (dataArray[i].indexOf('.') < 0) { // .trim()
                                Prescription.Dialysate += '.0';
                            }

                            let Anticoagulants = {};
                            let AnticoagulantsArray = [];
                            AnticoagulantsArray.push(Anticoagulants1);
                            AnticoagulantsArray.push(Anticoagulants2);
                            if (AnticoagulantsName === 'HEPARIN') {
                                Anticoagulants.HEPARIN = AnticoagulantsArray;
                            } else if (AnticoagulantsName === '低分子量肝素') {
                                Anticoagulants.低分子量肝素 = AnticoagulantsArray;
                            } else if (AnticoagulantsName === '檸檬酸鈉') {
                                Anticoagulants.檸檬酸鈉 = AnticoagulantsArray;
                            }
                            Prescription.Anticoagulants = Anticoagulants;
                            Prescription.PatientId = PatientId;
                            Prescription.IdentifierId = IdentifierId;
                            Prescription.CreatedTime = CreatedTime;
                            Prescription.HospitalId = HospitalId;
                            Prescription.Type = 'LongTerm';
                            Prescription.Result = '';
                            PrescriptionArray.push(Prescription);
                            Prescription = {};
                        }
                    }
                }
                vm.PrescriptionResult = PrescriptionArray;
                console.log(PrescriptionArray);
                console.log(vm.PrescriptionResult.length);

            } else if (f.name.toLowerCase().indexOf('.xlsx') > -1 || f.name.toLowerCase().indexOf('.xls') > -1) {
                // xls, xlsx 第一列有資料列一定是標題列? 第二列有資料列才認定為資料列且 ind=0
                xlsarray = wb.Sheets[wb.SheetNames[0]];

                angular.forEach(xlsarray, function (record, ind) {
                    if (ind !== '!ref') {
                        // dataInt = parseInt(ind.substr(ind.length - 1, 1)) * 17; // 計算全部 cell 數
                        dataInt = parseInt(ind.substr(1)) * 17; // 計算全部 cell 數
                    }
                    // if (ind.substr(ind.length - 1, 1) === startInd) {
                    if (ind.substr(1) === startInd) {
                            // 欄位列, 第一列為標題
                    } else {
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        // record.t === 's' 時, value 抓 record.v (string) A12345 => v:A12345
                        // record.t === 'n' 時, value 抓 record.w (number) 00027 => w:00027,v:27
                        // let rowNo = ind.substr(ind.length - 1, 1); // 列序號
                        let rowNo = ind.substr(1); // 列序號
                        // console.log(ind.substr(1).toString());
                        for (let i = 0; i < arrayInt; i++) { // 欄數
                            // if (cellArray[i] === ind.substr(0, ind.length - 1)) { // 比對欄位名
                            if (cellArray[i] === ind.substr(0, 1)) { // 比對欄位名
                                    // 依資料格式取資料
                                if (record.t === 's') { // 欄位型態為字串 => 取 v 值
                                    dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                } else { // 欄位型態為字串以外 => 取 w 值
                                    dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                }
                            }
                        }
                    }
                });

                // console.log(dataInt.toString());
                // console.log(dataArray);
                // 從兩個array拆資料, 解析待上傳內容
                let starti = 0;
                if (vm.havetitle) {
                    starti = arrayInt;
                }
                for (let i = starti; i < dataArray.length; i++) {
                    //for (let i = 0; i < dataInt; i++) {
                    if (i % arrayInt === 0) { // '身份證號'
                        AnticoagulantsName = ''; // 抗凝劑
                        Anticoagulants1 = ''; // 初劑量
                        Anticoagulants2 = ''; // 維持劑量
                        Prescription = {};

                        IdentifierId = dataArray[i];
                        if (IdentifierId !== '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                                if (Patient.IdentifierId.toUpperCase() === IdentifierId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 1) { // '病歷號'
                        MedicalId = dataArray[i];
                        if (PatientId === '' && MedicalId !== '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                                if (Patient.MedicalId.toUpperCase() === MedicalId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 2) { // '處方日期'
                        if (!(dataArray[i] === '' || dataArray[i] === undefined)) {
                            CreatedTime = (parseInt(dataArray[i].substr(0, 3)) + 1911).toString() + '-' + dataArray[i].substr(3, 2) + '-' + dataArray[i].substr(5, 2);
                        }
                    } else if (!(dataArray[i] === '' || dataArray[i] === undefined)) {
                        if (i % arrayInt === 3) { // '透析方式'
                            let Modex = {};
                            Modex.Name = dataArray[i].substring(0, 1); // 對應不到透析方式時, 先存下代碼
                            Modex.Volumn = null;
                            _.forEach(ModeCode, (value) => {
                                if (value.value === dataArray[i].substring(0, 1)) {
                                    Modex.Name = value.name;
                                }
                            });
                            Prescription.DialysisMode = Modex;
                        }
                        if (i % arrayInt === 4) { // '血液流速 (ml/min)'
                            Prescription.BF = parseInt(dataArray[i]);
                        }
                        if (i % arrayInt === 5) { // '透析液流速 (ml/min)'
                            Prescription.DialysateFlowRate = parseInt(dataArray[i]);
                        }
                        if (i % arrayInt === 6) { // '每週次數'
                            Prescription.Frequency = dataArray[i]; // 對應不到次數時, 先存下代碼
                            _.forEach(FrequencyCode, (value) => {
                                if (value.value === dataArray[i]) {
                                    Prescription.Frequency = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 8) { // '每次透析時間 (Hr)'
                            let Durationx = {};
                            Durationx.Hours = Math.floor(parseFloat(dataArray[i]));
                            Durationx.Minutes = (parseFloat(dataArray[i]) % 1) * 60;
                            Durationx.Seconds = 0;
                            Prescription.Duration = Durationx;
                        }
                        if (i % arrayInt === 9) { // '透析器表面積 (m^2)'
                            Prescription.DialyzerSurfaceArea = dataArray[i];
                        }
                        if (i % arrayInt === 10) { // '抗凝劑'
                            AnticoagulantsName = dataArray[i]; // 對應不到抗凝劑時, 先存下代碼
                            _.forEach(AnticoagulantsCode, (value) => {
                                if (value.value === dataArray[i]) {
                                    AnticoagulantsName = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 11) { // '初劑量 (U)'
                            Anticoagulants1 = dataArray[i];
                        }
                        if (i % arrayInt === 12) { // '維持劑量(U/小時)'
                            Anticoagulants2 = dataArray[i];
                        }
                        if (i % arrayInt === 13) { // '透析器型號'
                            Prescription.ArtificialKidney = dataArray[i]; // 對應不到型號時, 先存下代碼
                            _.forEach(AKCode, (value) => {
                                if (value.value === dataArray[i]) {
                                    Prescription.ArtificialKidney = value.name;
                                }
                            });
                        }
                        if (i % arrayInt === 15) { // '鈣離子濃度(meq/L)'
                            Prescription.Dialysate = dataArray[i];
                            if (dataArray[i].indexOf('.') < 0) {
                                Prescription.Dialysate += '.0';
                            }
                        }
                        if (i % arrayInt === 16) { // '鉀離子濃度(meq/L)'
                            Prescription.Dialysate = Prescription.Dialysate + '/' + dataArray[i];
                            if (dataArray[i].indexOf('.') < 0) {
                                Prescription.Dialysate += '.0';
                            }
                            let Anticoagulants = {};
                            let AnticoagulantsArray = [];
                            AnticoagulantsArray.push(Anticoagulants1);
                            AnticoagulantsArray.push(Anticoagulants2);
                            if (AnticoagulantsName === 'HEPARIN') {
                                Anticoagulants.HEPARIN = AnticoagulantsArray;
                            } else if (AnticoagulantsName === '低分子量肝素') {
                                Anticoagulants.低分子量肝素 = AnticoagulantsArray;
                            } else if (AnticoagulantsName === '檸檬酸鈉') {
                                Anticoagulants.檸檬酸鈉 = AnticoagulantsArray;
                            }
                            Prescription.Anticoagulants = Anticoagulants;
                            Prescription.PatientId = PatientId;
                            Prescription.IdentifierId = IdentifierId;
                            Prescription.CreatedTime = CreatedTime;
                            Prescription.HospitalId = HospitalId;
                            Prescription.Type = 'LongTerm';
                            Prescription.Result = '';
                            PrescriptionArray.push(Prescription);
                            Prescription = {};
                        }
                    }
                }
                vm.PrescriptionResult = PrescriptionArray;
                console.log(PrescriptionArray);
                console.log(vm.PrescriptionResult.length);
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

    // 造管資料匯入
    let VesselArray = [];

    // 造管按匯入
    vm.sendFile2 = function sendFile2() {
        // 加進資料庫
        let totalCnt = 0;
        let successCnt = 0;
        let falseCnt = 0;
        // 待匯入總筆數
        totalCnt = VesselArray.length;
        // 一筆一筆上傳 => 可以 show 上傳進度??
        angular.forEach(VesselArray, function (postData, ind2) {
            console.log(ind2 + postData);
            kiditService.importsingleVessel(postData).then((a) => {
                console.log(a.data);
                console.log(ind2 + '匯入成功');
                // 匯入成功筆數
                successCnt += 1;
                setRst1(a.data.PatientId, 'Success');
            }, (b) => {
                console.log(b.data);
                console.log(ind2 + '匯入失敗');
                // 匯入失敗筆數
                falseCnt += 1;
                setRst1(b.data.PatientId, 'Fail');
            });
        });
        console.log('totalCnt=' + totalCnt + ',successCnt=' + successCnt + ',falseCnt=' + falseCnt);
    };

    // 造管匯入結果
    function setRst1(id, rst) {
        angular.forEach(vm.VesselResult, function (labItem, ind4) {
            if (labItem.PatientId === id) { //  && labItem.Name === name && labItem.Value === value
                labItem.Result = rst;
            }
        });
    }

    // 造管 分析選取的檔案內容
    vm.importf1 = function importf1(obj) { // 导入
        if (!obj.files) {
            return;
        }
        let currentHospital = SettingService.getCurrentHospital();
        let HospitalId = currentHospital.Id; // '56fcc5dd4ead7870942f61c3';
        let PatientId = '';
        let SeasonVesselDate = '';
        let IdentifierId = '';
        let MedicalId = '';
        let CatheterType = '';
        let Side = '';
        let Position = '';
        let secondVessel = '';
        let CatheterType2 = '';
        let Side2 = '';
        let Position2 = '';

        let isEnable = false;
        let RadioHeatTimes = '';
        let RadioHeatWeeklyMinutes = '';
        let isEnable2 = false;
        let OtherHeatMethod = '';
        let OtherHeatWeeklyMinutes = '';

        let Vessel = {};
        let wb; // 读取完成的数据
        let rABS = true; // 是否将文件读取为二进制字符串 // false

        VesselArray = [];
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
                wb = XLSX.read(btoa(fixdata(data)), { // 手動轉化
                    type: 'base64'
                });
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            }

            let cellArray = [];
            let dataArray = [];
            let startInd = '0';
            let arrayInt = 0;
            let dataInt = 0;
            MedicalId = ''; // 病歷號
            PatientId = ''; // 病人Id
            IdentifierId = ''; // 身份證號
            SeasonVesselDate = ''; // 本季第一次透析日期
            CatheterType = '';
            Side = '';
            Position = '';
            CatheterType2 = '';
            Side2 = '';
            Position2 = '';
            // 預設欄位名Array
            let cellstr = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR,AS,AT,AU,AV,AW,AX,AY,AZ,BA,BB,BC';
            cellArray = cellstr.split(',');
            arrayInt = cellArray.length;
            // 匯入梢案是否包含標題列?
            if (vm.havetitle1) {
                startInd = '1'; // 有, 標題列設定 1, 第2列開始為資料列
            } else {
                startInd = '0'; // 無, 標題列設定 0, 第1列開始為資料列
            }
            let xlsarray;
            if (f.name.toLowerCase().indexOf('.csv') > -1 || f.name.toLowerCase().indexOf('.txt') > -1) {
                // csv的處理方式
                xlsarray = wb.Sheets.Sheet1;

                angular.forEach(xlsarray, function (record, ind) {
                    // console.log(record);
                    // console.log(ind);
                    // let rowNo = ind.substr(ind.length - 1, 1); // 列序號
                    let rowNo = ''; // 列序號
                    if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                        rowNo = ind.substr(2); // 列序號
                    } else {
                        rowNo = ind.substr(1); // 列序號
                    }
                    // console.log(rowNo);
                    if (rowNo === startInd) {
                        // 欄位列, 第一列為標題
                    } else {
                        // console.log(rowNo);
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        // record.t === 's' 時, value 抓 record.v (string) A12345 => v:A12345
                        // record.t === 'n' 時, value 抓 record.w (number) 00027 => w:00027,v:27

                        for (let i = 0; i < arrayInt; i++) { // 欄數
                            // if (cellArray[i] === ind.substr(0, ind.length - 1)) { // 比對欄位名
                            if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                                // rowNo = ind.substr(2); // 列序號
                                if (cellArray[i] === ind.substr(0, 2)) { // 比對欄位名
                                    // 依資料格式取資料
                                    if (record.t === 's' || record.t === 'b') { // 欄位型態為字串 => 取 v 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                    } else { // 欄位型態為字串以外 => 取 w 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                    }
                                    dataInt += 1;
                                    // console.log(dataInt.toString());
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
                    }
                });
                console.log(dataInt);
                console.log(arrayInt);
                console.log(dataArray.length);
                // 從兩個array拆資料, 解析待上傳內容
                let starti = 0;
                if (vm.havetitle1) {
                    starti = arrayInt;
                }
                for (let i = starti; i < dataArray.length; i++) {
                    // console.log(i.toString());
                    // console.log(dataArray[i]);
                    if (i % arrayInt === 0) { // '身份證號'
                        Vessel = {};
                        secondVessel = '0';
                        isEnable = false;
                        RadioHeatTimes = '';
                        RadioHeatWeeklyMinutes = '';
                        isEnable2 = false;
                        OtherHeatMethod = '';
                        OtherHeatWeeklyMinutes = '';
                
                        IdentifierId = dataArray[i]; // .trim()
                        if (IdentifierId !== '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                               if (Patient.IdentifierId.toUpperCase() === IdentifierId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 1) { // '病歷號'
                        MedicalId = dataArray[i]; // .trim()
                        if (PatientId === '') {
                            angular.forEach(Patients, function (Patient, ind1) {
                                if (Patient.MedicalId.toUpperCase() === MedicalId.toUpperCase()) {
                                    PatientId = Patient.Id;
                                }
                            });
                        }
                    } else if (i % arrayInt === 2) { // '本季第一次透析日期'
                        // CreatedTime = (parseInt(dataArray[i].substr(0, 3)) + 1911).toString() + '-' + dataArray[i].substr(3, 2) + '-' + dataArray[i].substr(5, 2);
                        let VesselDate = dataArray[i];
                        let VesselM = VesselDate.substring(0, VesselDate.indexOf('/'));
                        if (VesselM.length === 1) {
                            VesselM = '0' + VesselM;
                        }
                        VesselDate = VesselDate.substring(VesselDate.indexOf('/') + 1);
                        let VesselD = VesselDate.substring(0, VesselDate.indexOf('/'));
                        if (VesselD.length === 1) {
                            VesselD = '0' + VesselD;
                        }
                        let VesselY = VesselDate.substring(VesselDate.indexOf('/') + 1);
                        // SeasonVesselDate = dataArray[i].substring();
                        SeasonVesselDate = '20' + VesselY + '-' + VesselM + '-' + VesselD;
                    } else if (dataArray[i] !== 'undefined') { // .trim()  dataArray[i] !== '' && 

                        if (i % arrayInt === 3) { // '自體動靜脈廔管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType = 'AVFistula';
                            }
                        }
                        if (i % arrayInt === 4) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side = 'right';
                                } else {
                                    Side = 'left';
                                }
                                // Side = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 5) { // '自體動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 6) { // '人工動靜脈廔管位置'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType = 'AVGraft';
                            }
                        }
                        if (i % arrayInt === 7) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side = 'right';
                                } else {
                                    Side = 'left';
                                }
                                // Side = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 8) { // '人工動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 9) { // 'PermCath或其他長期導管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType = 'Permanent';
                            }
                        }
                        if (i % arrayInt === 10) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side = 'right';
                                } else {
                                    Side = 'left';
                                }
                                // Side = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 11) { // 'PermCath其他長期導管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 12) { // '其他短期導管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType = 'DoubleLumen';
                            }
                        }
                        if (i % arrayInt === 13) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side = 'right';
                                } else {
                                    Side = 'left';
                                }
                                // Side = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 14) { // '其他短期導管'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position = value.name;
                                    }
                                });
                            }
                        }

                        // if (i % arrayInt === 16) { // 'BloodFlow' 本季透析時最佳pump blood flow  ml/min
                        //     Vessel.BestPumpBloodFlow = dataArray[i]; // .trim()
                        // }

                        // if (i % arrayInt === 17) { //
                        //
                        // }

                        if (i % arrayInt === 18) { // 是否使用遠紅外線治療
                            isEnable = dataArray[i];
                        }

                        if (i % arrayInt === 19) { // 每周幾次
                            RadioHeatTimes = dataArray[i];
                        }

                        if (i % arrayInt === 20) { // 平均每周總治療時間（分鐘)
                            RadioHeatWeeklyMinutes = dataArray[i];
                        }

                        if (i % arrayInt === 21) { // 是否使用其他熱治療法
                            isEnable2 = dataArray[i];
                        }

                        if (i % arrayInt === 22) { // 治療方法
                            OtherHeatMethod = dataArray[i];
                        }

                        if (i % arrayInt === 23) { // 平均每周總治療時間（分鐘)
                            OtherHeatWeeklyMinutes = dataArray[i];
                        }

                        if (i % arrayInt === 24) { // IsCoTubeMethod 是否並存其他血管通路方式
                            if (dataArray[i] === true) {
                                secondVessel = '1';
                            }
                        }

                        if (secondVessel === '1') {

                        if (i % arrayInt === 25) { // '自體動靜脈廔管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType2 = 'AVFistula';
                            }
                        }
                        if (i % arrayInt === 26) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 27) { // '自體動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 28) { // '人工動靜脈廔管位置'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType2 = 'AVGraft';
                            }
                        }
                        if (i % arrayInt === 29) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 30) { // '人工動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 31) { // 'PermCath或其他長期導管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType2 = 'Permanent';
                            }
                        }
                        if (i % arrayInt === 32) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 33) { // 'PermCath其他長期導管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 34) { // '其他短期導管'
                            if (dataArray[i] === true) { // .trim()
                                CatheterType2 = 'DoubleLumen';
                            }
                        }
                        if (i % arrayInt === 35) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 36) { // '其他短期導管'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        }

                        if (i % arrayInt === 51) {
                            Vessel.PatientId = PatientId;
                            Vessel.IdentifierId = IdentifierId;
                            Vessel.HospitalId = HospitalId;
                            Vessel.CatheterType = CatheterType;
                            let PositionItem = {};
                            PositionItem.Side = Side;
                            PositionItem.Position = Position;
                            PositionItem.Vein = null;
                            Vessel.CatheterPosition = PositionItem;
                            if (secondVessel === '1') {
                                Vessel.CatheterType2 = CatheterType2;
                                let PositionItem2 = {};
                                PositionItem2.Side = Side2;
                                PositionItem2.Position = Position2;
                                PositionItem2.Vein = null;
                                Vessel.CatheterPosition2 = PositionItem2;
                            }
                            Vessel.SeasonVesselDate = SeasonVesselDate;
                            let RadioHeatItem = {};
                            RadioHeatItem.isEnable = isEnable;
                            RadioHeatItem.RadioHeatTimes = RadioHeatTimes;
                            RadioHeatItem.RadioHeatWeeklyMinutes = RadioHeatWeeklyMinutes;
                            Vessel.RadioHeat = RadioHeatItem;
                            let OtherHeatItem = {};
                            OtherHeatItem.isEnable = isEnable2;
                            OtherHeatItem.OtherHeatMethod = OtherHeatMethod;
                            OtherHeatItem.OtherHeatWeeklyMinutes = OtherHeatWeeklyMinutes;
                            Vessel.OtherHeat = OtherHeatItem;
                            VesselArray.push(Vessel);
                            Vessel = {};
                        }
                    }
                }
                vm.VesselResult = VesselArray;
                console.log(VesselArray);
                console.log(vm.VesselResult.length);

            } else if (f.name.toLowerCase().indexOf('.xlsx') > -1 || f.name.toLowerCase().indexOf('.xls') > -1) {
                // xls, xlsx 第一列有資料列一定是標題列? 第二列有資料列才認定為資料列且 ind=0
                xlsarray = wb.Sheets[wb.SheetNames[0]];

                angular.forEach(xlsarray, function (record, ind) {
                    // console.log(record);
                    // console.log(ind);
                    if (ind !== '!ref' && ind !== '!margins') {
                        // dataInt = parseInt(ind.substr(ind.length - 1, 1)) * 17; // 計算全部 cell 數
                        if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                            dataInt = parseInt(ind.substr(2)) * 55; // 計算全部 cell 數
                            // console.log("A" + dataInt.toString());
                        } else {
                            dataInt = parseInt(ind.substr(1)) * 55; // 計算全部 cell 數
                            // console.log("B" + dataInt.toString());
                        }
                    }
                    // if (ind.substr(ind.length - 1, 1) === startInd) {
                    if (ind.substr(1) === startInd) {
                            // 欄位列, 第一列為標題
                    } else {
                        // 第二列開始才是資料列
                        // ind.substr(ind.length - 1, 1) = 2,3,4,5,6......
                        // record.t === 's' 時, value 抓 record.v (string) A12345 => v:A12345
                        // record.t === 'n' 時, value 抓 record.w (number) 00027 => w:00027,v:27
                        // let rowNo = ind.substr(ind.length - 1, 1); // 列序號
                        // let rowNo = ind.substr(1); // 列序號
                        let rowNo = ''; // 列序號
                        if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                            rowNo = ind.substr(2); // 列序號
                        } else {
                            rowNo = ind.substr(1); // 列序號
                        }
                        // console.log(rowNo);
                        // console.log(ind.substr(1).toString());
                        for (let i = 0; i < arrayInt; i++) { // 欄數
                            // if (cellArray[i] === ind.substr(0, ind.length - 1)) { // 比對欄位名
                            if (ind.substr(1, 1) >= 'A' && ind.substr(1, 1) <= 'Z') {
                                if (cellArray[i] === ind.substr(0, 2)) { // 比對欄位名
                                    // 依資料格式取資料
                                    if (record.t === 's' || record.b === 'b') { // 欄位型態為字串 => 取 v 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                    } else { // 欄位型態為字串以外 => 取 w 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                    }
                                }
                            } else {
                                if (cellArray[i] === ind.substr(0, 1)) { // 比對欄位名
                                    // 依資料格式取資料
                                    if (record.t === 's' || record.b === 'b') { // 欄位型態為字串 => 取 v 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.v; // .trim()
                                    } else { // 欄位型態為字串以外 => 取 w 值
                                        dataArray[((parseInt(rowNo) - 1) * arrayInt) + i] = record.w; // .trim()
                                    }
                                }
                            }
                        }
                    }
                });
                console.log(dataInt);
                console.log(arrayInt);
                console.log(dataArray.length);
                // 從兩個array拆資料, 解析待上傳內容
                let starti = 0;
                if (vm.havetitle1) {
                    starti = arrayInt;
                }
                for (let i = starti; i < dataArray.length; i++) {
                   // console.log(i.toString());
                   // console.log(dataArray[i]);
                   if (i % arrayInt === 0) { // '身份證號'
                       // AnticoagulantsName = ''; // 抗凝劑
                       // Anticoagulants1 = ''; // 初劑量
                       // Anticoagulants2 = ''; // 維持劑量
                       Vessel = {};

                       IdentifierId = dataArray[i];
                       if (IdentifierId !== '') {
                           angular.forEach(Patients, function (Patient, ind1) {
                               if (Patient.IdentifierId.toUpperCase() === IdentifierId.toUpperCase()) {
                                   PatientId = Patient.Id;
                               }
                           });
                       }
                   } else if (i % arrayInt === 1) { // '病歷號'
                       MedicalId = dataArray[i];
                       if (PatientId === '' && MedicalId !== '') {
                           angular.forEach(Patients, function (Patient, ind1) {
                               if (Patient.MedicalId.toUpperCase() === MedicalId.toUpperCase()) {
                                   PatientId = Patient.Id;
                               }
                           });
                       }
                    } else if (i % arrayInt === 2) { // '本季第一次透析日期'
                    // CreatedTime = (parseInt(dataArray[i].substr(0, 3)) + 1911).toString() + '-' + dataArray[i].substr(3, 2) + '-' + dataArray[i].substr(5, 2);
                    let VesselDate = dataArray[i];
                    let VesselM = VesselDate.substring(0, VesselDate.indexOf('/'));
                    if (VesselM.length === 1) {
                        VesselM = '0' + VesselM;
                    }
                    VesselDate = VesselDate.substring(VesselDate.indexOf('/') + 1);
                    let VesselD = VesselDate.substring(0, VesselDate.indexOf('/'));
                    if (VesselD.length === 1) {
                        VesselD = '0' + VesselD;
                    }
                    let VesselY = VesselDate.substring(VesselDate.indexOf('/') + 1);
                    // SeasonVesselDate = dataArray[i].substring();
                    SeasonVesselDate = '20' + VesselY + '-' + VesselM + '-' + VesselD;
                } else if (dataArray[i] !== undefined) { // .trim()  dataArray[i] !== '' &&

                    if (i % arrayInt === 3) { // '自體動靜脈廔管'
                        if (dataArray[i] === 'TRUE') { // .trim()
                            CatheterType = 'AVFistula';
                        }
                    }
                    if (i % arrayInt === 4) { // '左右'
                        if (dataArray[i] !== undefined) {
                            if (dataArray[i] === 'R') {
                                Side = 'right';
                            } else {
                                Side = 'left';
                            }
                            // Side = dataArray[i]; // .trim()
                        }
                    }
                    if (i % arrayInt === 5) { // '自體動靜脈廔管位置'
                        if (dataArray[i] !== '') {
                            _.forEach(Position1, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Position = value.name;
                                }
                            });
                        }
                    }

                    if (i % arrayInt === 6) { // '人工動靜脈廔管位置'
                        if (dataArray[i] === 'TRUE') { // .trim()
                            CatheterType = 'AVGraft';
                        }
                    }
                    if (i % arrayInt === 7) { // '左右'
                        if (dataArray[i] !== undefined) {
                            if (dataArray[i] === 'R') {
                                Side = 'right';
                            } else {
                                Side = 'left';
                            }
                            // Side = dataArray[i]; // .trim()
                        }
                    }
                    if (i % arrayInt === 8) { // '人工動靜脈廔管位置'
                        if (dataArray[i] !== '') {
                            _.forEach(Position1, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Position = value.name;
                                }
                            });
                        }
                    }

                    if (i % arrayInt === 9) { // 'PermCath或其他長期導管'
                        if (dataArray[i] === 'TRUE') { // .trim()
                            CatheterType = 'Permanent';
                        }
                    }
                    if (i % arrayInt === 10) { // '左右'
                        if (dataArray[i] !== undefined) {
                            if (dataArray[i] === 'R') {
                                Side = 'right';
                            } else {
                                Side = 'left';
                            }
                            // Side = dataArray[i]; // .trim()
                        }
                    }
                    if (i % arrayInt === 11) { // 'PermCath其他長期導管位置'
                        if (dataArray[i] !== '') {
                            _.forEach(Position12, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Position = value.name;
                                }
                            });
                        }
                    }

                    if (i % arrayInt === 12) { // '其他短期導管'
                        if (dataArray[i] === 'TRUE') { // .trim()
                            CatheterType = 'DoubleLumen';
                        }
                    }
                    if (i % arrayInt === 13) { // '左右'
                        if (dataArray[i] !== undefined) {
                            if (dataArray[i] === 'R') {
                                Side = 'right';
                            } else {
                                Side = 'left';
                            }
                            // Side = dataArray[i]; // .trim()
                        }
                    }
                    if (i % arrayInt === 14) { // '其他短期導管'
                        if (dataArray[i] !== '') {
                            _.forEach(Position12, (value) => {
                                if (value.value === dataArray[i]) { // .trim()
                                    Position = value.name;
                                }
                            });
                        }
                    }

                    // if (i % arrayInt === 16) { // 'BloodFlow' 本季透析時最佳pump blood flow  ml/min
                    //     Vessel.BestPumpBloodFlow = dataArray[i]; // .trim()
                    // }

                    // if (i % arrayInt === 17) { //
                    //
                    // }

                    if (i % arrayInt === 18) { // 是否使用遠紅外線治療
                        if (dataArray[i] === 'TRUE') { // .trim()
                            isEnable = true;
                        } else {
                            isEnable = false;
                        }
                    }

                    if (i % arrayInt === 19) { // 每周幾次
                        RadioHeatTimes = dataArray[i];
                    }

                    if (i % arrayInt === 20) { // 平均每周總治療時間（分鐘)
                        RadioHeatWeeklyMinutes = dataArray[i];
                    }

                    if (i % arrayInt === 21) { // 是否使用其他熱治療法
                        if (dataArray[i] === 'TRUE') { // .trim()
                            isEnable2 = true;
                        } else {
                            isEnable2 = false;
                        }
                    }

                    if (i % arrayInt === 22) { // 治療方法
                        OtherHeatMethod = dataArray[i];
                    }

                    if (i % arrayInt === 20) { // 平均每周總治療時間（分鐘)
                        OtherHeatWeeklyMinutes = dataArray[i];
                    }

                    if (i % arrayInt === 24) { // IsCoTubeMethod 是否並存其他血管通路方式
                        if (dataArray[i] === 'TRUE') {
                            secondVessel = '1';
                        }
                    }

                    if (secondVessel === '1') {

                        if (i % arrayInt === 25) { // '自體動靜脈廔管'
                            if (dataArray[i] === 'TRUE') { // .trim()
                                CatheterType2 = 'AVFistula';
                            }
                        }
                        if (i % arrayInt === 26) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 27) { // '自體動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 28) { // '人工動靜脈廔管位置'
                            if (dataArray[i] === 'TRUE') { // .trim()
                                CatheterType2 = 'AVGraft';
                            }
                        }
                        if (i % arrayInt === 29) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 30) { // '人工動靜脈廔管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position1, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 31) { // 'PermCath或其他長期導管'
                            if (dataArray[i] === 'TRUE') { // .trim()
                                CatheterType2 = 'Permanent';
                            }
                        }
                        if (i % arrayInt === 32) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 33) { // 'PermCath其他長期導管位置'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }

                        if (i % arrayInt === 34) { // '其他短期導管'
                            if (dataArray[i] === 'TRUE') { // .trim()
                                CatheterType2 = 'DoubleLumen';
                            }
                        }
                        if (i % arrayInt === 35) { // '左右'
                            if (dataArray[i] !== '') {
                                if (dataArray[i] === 'R') {
                                    Side2 = 'right';
                                } else {
                                    Side2 = 'left';
                                }
                                // Side2 = dataArray[i]; // .trim()
                            }
                        }
                        if (i % arrayInt === 36) { // '其他短期導管'
                            if (dataArray[i] !== '') {
                                _.forEach(Position12, (value) => {
                                    if (value.value === dataArray[i]) { // .trim()
                                        Position2 = value.name;
                                    }
                                });
                            }
                        }
                    }

                    if (i % arrayInt === 51) {
                        Vessel.PatientId = PatientId;
                        Vessel.IdentifierId = IdentifierId;
                        Vessel.HospitalId = HospitalId;
                        Vessel.CatheterType = CatheterType;
                        let PositionItem = {};
                        PositionItem.Side = Side;
                        PositionItem.Position = Position;
                        PositionItem.Vein = null;
                        Vessel.CatheterPosition = PositionItem;
                        if (secondVessel === '1') {
                            Vessel.CatheterType2 = CatheterType2;
                            let PositionItem2 = {};
                            PositionItem2.Side = Side2;
                            PositionItem2.Position = Position2;
                            PositionItem2.Vein = null;
                            Vessel.CatheterPosition2 = PositionItem2;
                        }
                        Vessel.SeasonVesselDate = SeasonVesselDate;
                        let RadioHeatItem = {};
                        RadioHeatItem.isEnable = isEnable;
                        RadioHeatItem.RadioHeatTimes = RadioHeatTimes;
                        RadioHeatItem.RadioHeatWeeklyMinutes = RadioHeatWeeklyMinutes;
                        Vessel.RadioHeat = RadioHeatItem;
                        let OtherHeatItem = {};
                        OtherHeatItem.isEnable = isEnable2;
                        OtherHeatItem.OtherHeatMethod = OtherHeatMethod;
                        OtherHeatItem.OtherHeatWeeklyMinutes = OtherHeatWeeklyMinutes;
                        Vessel.OtherHeat = OtherHeatItem;
                        VesselArray.push(Vessel);
                        Vessel = {};
                    }
                }
            }
            vm.VesselResult = VesselArray;
            console.log(VesselArray);
            console.log(vm.VesselResult.length);

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


    // 透析器型號
    let AKCode = [
        { value: '91', name: 'FX80' },
        { value: '92', name: 'FX100' },
        { value: '200', name: 'ELISIO-25H' },
        { value: '13', name: 'FB170U' },
        { value: '131', name: 'B1-1.6H' },
        { value: '130', name: 'B1-1.3H' },
        { value: '71', name: 'LO PS15' }
    ];

    // 每週次數
    let FrequencyCode = [
        { value: '3', name: 'Tiw' },
        { value: '2', name: 'Biw' },
        { value: '1', name: 'Qw' },
        { value: '0', name: '' },
        { value: '4', name: '' }
    ];

    // 抗凝劑
    let AnticoagulantsCode = [
        { value: '1', name: 'HEPARIN' }, // '肝素'
        { value: '2', name: '低分子量肝素' },
        { value: '3', name: '檸檬酸鈉' }
    ];

    // 透析方式
    let ModeCode = [
        { value: '1', name: 'HD' }, // 'HD' , Conventional HD
        { value: '2', name: 'HD' }, // High efficient HD
        { value: '3', name: 'HD' }, // 'High flux HD' 'HDF'?
        { value: '4', name: 'HDF' }, // Hemodiafiltration
        { value: '5', name: 'CWH' },
        { value: '6', name: 'DFPP' },
        { value: '7', name: 'SLEF' },
        { value: '8', name: 'PE' }
    ];

    // 自體動靜脈廔管位置, 人工動靜脈廔管位置
    let Position1 = [
        { value: '1', name: 'forearm' }, // 前臂(含腕部)(forearm)
        { value: '2', name: 'upperArm' }, // 上臂(含肘部)(upperArm)
        { value: '3', name: 'thigh' }, // 大腿(thigh)
        { value: '4', name: 'calf' }, // 小腿(calf)
        { value: '9', name: '其他' }
    ];

    // PermCath或其他長期導管位置, 其他短期導管位置
    let Position12 = [
        { value: '1', name: 'IJV' }, // 內頸靜脈(IJV)
        { value: '2', name: 'SV' }, // 鎖股下靜脈(SV)
        { value: '3', name: 'FV' }, // 股靜脈(FV)
        { value: '9', name: '其他' }
    ];

// HD處方
//    {
//        "PatientId": "57889c0827920c3e0cc57546",
//        "BF": 20,
//        "Duration": {
//          "Hours": 4,
//          "Minutes": 0,
//          "Seconds": null
//        },
//        "Frequency": "Tiw",
//        "Anticoagulants": {
//          "Heparin": [
//            "200",
//            "10"
//          ]
//        },
//        "Dialysate": "2.5/1.0",
//        "DialysateFlowRate": 300,
//        "ArtificialKidney": "FX80",
//        "Mode": {
//          "Name": "Conventional HD",
//          "Volumn": null
//        },
//        "HospitalId": "56fcc5dd4ead7870942f61c3",
//        "CreatedTime": "2018-07-03T08:14:03.632Z",
//        "Type": "LongTerm"
//    }


    //     "PatientId": "57889c0827920c3e0cc57546",
    //     "BF": 20,
    //     "Duration": {
    //       "Hours": 4,
    //       "Minutes": 0,
    //       "Seconds": null
    //     },
    //     "Frequency": "Tiw",
    //     "Anticoagulants": {
    //       "Heparin": [
    //         "200",
    //         "10"
    //       ]
    //     },
    //     "Dialysate": "2.5/1.0",
    //     "DialysateFlowRate": 300,
    //     "ArtificialKidney": null, 透析器型號

    //     "Mode": {
    //       "Name": "HD", 透析方式
    // 1=Conventional HD
    // 2=High efficient HD
    // 3=High flux HD
    // 4=Hemodiafiltration
    // 5=CWH
    // 6=DFPP
    // 7=SLEF
    // 8=PE
    //       "Volumn": null
    //     },
    //     "HospitalId": "56fcc5dd4ead7870942f61c3",
    //     "CreatedTime": "2018-07-03T08:14:03.632Z", 日期??

    // ////////////////////////////////////////////////////////////////////

    //     "PatientId": "57889c0827920c3e0cc57546", (用 身份證號 , 病歷號 找 PatientId)
    //     "BF": 20, 血液流速 (ml/min)
    //     "Duration": { 每次透析時間 (Hr)
    //       "Hours": 4,
    //       "Minutes": 0,
    //       "Seconds": null
    //     },
    //     "Frequency": "Tiw", 每週次數??
    // { "TIW", "3" },
    // { "BIW", "2" },
    // { "QW", "1" }
    //     "Anticoagulants": {  抗凝劑
    //       "Heparin": [ 肝素
    //         "200",  初劑量 (U)
    //         "10" 維持劑量(U/小時)
    //       ]
    //     },
    // { "HEPARIN", "1" },
    // { "肝素", "1" },
    // { "低分子量肝素", "2" },
    // { "檸檬酸鈉", "3" }
    // { 不使用, "0" }
    //     "Dialysate": "2.5/1.0", 鈣離子濃度(meq/L) / 鉀離子濃度(meq/L)
    //     "HCO3": "1", (2 時 鹼基??)
    //     "DialysateFlowRate": 300, 透析液流速 (ml/min)
    //     "ArtificialKidney": null, 透析器型號

    //     "Mode": {
    //       "Name": "HD", 透析方式
    // 1=Conventional HD
    // 2=High efficient HD
    // 3=High flux HD
    // 4=Hemodiafiltration
    // 5=CWH
    // 6=DFPP
    // 7=SLEF
    // 8=PE
    //       "Volumn": null
    //     },
    //     "HospitalId": "56fcc5dd4ead7870942f61c3",
    //     "CreatedTime": "2018-07-03T08:14:03.632Z", 日期??

    // ////////////////////////////////////////////////////////////////////

    // {
    //     "SupplementVolume": null,
    //     "SupplementPosition": null,
    //     "DateTimestamp": "2018-07-25T16:42:11.6755017+08:00",
    //     "PatientId": "57889c0827920c3e0cc57546", (用 身份證號 , 病歷號 找 PatientId)
    //     "InBed": "false",
    //     "StandardWeight": 61.5,
    //     "Dehydration": null,
    //     "BF": 20, 血液流速 (ml/min)
    //     "Duration": { 每次透析時間 (Hr)
    //       "Hours": 4,
    //       "Minutes": 0,
    //       "Seconds": null
    //     },
    //     "Frequency": "Tiw", 每週次數??
    // { "TIW", "3" },
    // { "BIW", "2" },
    // { "QW", "1" }
    //     "Anticoagulants": {  抗凝劑
    //       "Heparin": [ 肝素
    //         "200",  初劑量 (U)
    //         "10" 維持劑量(U/小時)
    //       ]
    //     },
    // { "HEPARIN", "1" },
    // { "肝素", "1" },
    // { "低分子量肝素", "2" },
    // { "檸檬酸鈉", "3" }
    // { 不使用, "0" }
    //     "Dialysate": "2.5/1.0", 鈣離子濃度(meq/L) / 鉀離子濃度(meq/L)
    //     "HCO3": "1", (2 時 鹼基??)
    //     "Na": 2,
    //     "Ca": null,
    //     "DialysateTemperature": 35,
    //     "DialysateFlowRate": 300, 透析液流速 (ml/min)
    //     "Needle": {
    //       "ArteryLength": "16",
    //       "VeinLength": "16"
    //     },
    //     "ArtificialKidney": null, 透析器型號
    //     "Mode": {
    //       "Name": "HD", 透析方式

    // 1=Conventional HD
    // 2=High efficient HD
    // 3=High flux HD
    // 4=Hemodiafiltration
    // 5=CWH
    // 6=DFPP
    // 7=SLEF
    // 8=PE

    //       "Volumn": null
    //     },
    //     "Type": "LongTerm",
    //     "AnticoagulantFreeCause": null,
    //     "Route": null,
    //     "Memo": null,
    //     "HospitalId": "56fcc5dd4ead7870942f61c3",
    //     "Revision": 4,
    //     "HistoryId": null,
    //     "Status": "Normal",
    //     "CreatedUserId": "579725de27920c13acf79e79",
    //     "CreatedUserName": "coral",
    //     "CreatedTime": "2018-07-03T08:14:03.632Z", 日期??
    //     "ModifiedUserId": "570600fdd53d3c61d6794f95",
    //     "ModifiedUserName": "Admin",
    //     "ModifiedTime": "2018-07-04T03:41:12.124Z",
    //     "Id": "5b3b304b13dc4c3e84b2a0bc",
    //     "CreatedOn": "2018-07-03T08:14:03Z",
    //     "ModifiedOn": "0001-01-01T00:00:00Z",
    //     "ObjectId": {
    //       "Timestamp": 1530605643,
    //       "Machine": 1301580,
    //       "Pid": 16004,
    //       "Increment": 11706556,
    //       "CreationTime": "2018-07-03T08:14:03Z"
    //     }
    //   }

    // //////////////////////////////////////////////////////////////////////

    // HD 造管
    //    {
    //      "Images": [
    //        "593f9461a6e10c3678138808",
    //        "596eb100974cd219e48586ba",
    //        "596eb100974cd219e48586b9",
    //        "596eb101974cd219e48586bf"
    //      ],
    //      "DateTimestamp": "2018-08-01T15:09:25.8576608+08:00",
    //      "PatientId": "593f3acfd8d33222a031162a",
    //      "CatheterType": "Permanent",
    //      "CatheterPosition": {
    //        "Side": "right",
    //        "Position": "calf",
    //        "Vein": null
    //      },
    //      "StartDate": "2017-06-16T07:27:00Z",
    //      "EndDate": "2017-06-17T07:27:00Z",
    //      "CatheterHospital": "test201606081654",
    //      "EndReason": null,
    //      "Memo": null,
    //      "HospitalId": "56fcc5dd4ead7870942f61c3",
    //      "Revision": 3,
    //      "HistoryId": null,
    //      "Status": "Normal",
    //      "CreatedUserId": "5912aae9d7eb311f60dec5da",
    //      "CreatedUserName": "Paul",
    //      "CreatedTime": "2017-06-13T07:27:39.842Z",
    //      "ModifiedUserId": "5912aae9d7eb311f60dec5da",
    //      "ModifiedUserName": "Paul",
    //      "ModifiedTime": "2017-07-19T01:09:19.444Z",
    //      "Id": "593f93eba6e10c3678138806",
    //      "CreatedOn": "2017-06-13T07:27:39Z",
    //      "ModifiedOn": "0001-01-01T00:00:00Z",
    //      "ObjectId": {
    //        "Timestamp": 1497338859,
    //        "Machine": 10936588,
    //        "Pid": 13944,
    //        "Increment": 1280006,
    //        "CreationTime": "2017-06-13T07:27:39Z"
    //      }
    //    }
}

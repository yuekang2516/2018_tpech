import './compEdit.less';
angular
    .module('app')
    .controller('compEditController', compEditController);

compEditController.$inject = [
    '$stateParams', 'PatientService', '$mdDialog', 'showMessage', 'SettingService',
    'complicationService', '$filter', 'compItem', '$mdSidenav', 'cursorInput', 'labexamService', '$scope', '$timeout', 'tpechService'];
function compEditController(
    $stateParams, PatientService, $mdDialog, showMessage, SettingService,
    complicationService, $filter, compItem, $mdSidenav, cursorInput, labexamService, $scope, $timeout, tpechService) {
    console.log("complication Create/Edit compDataObj---", compItem);
    const self = this;
    const $translate = $filter('translate');
    
    let _compItem = angular.copy(compItem);

    self.compDataObj = _compItem;
    self.patientId = $stateParams.patientId;
    self.treatmentResultOther = "";

    self.formType = "complication";

    // 治療結果
    self.treatmentResultCheck = [
        { Value: '治癒', Text: '治癒', Check: false },
        { Value: '轉HD', Text: '轉HD', Check: false },
        { Value: '拔管', Text: '拔管', Check: false },
        { Value: '轉位', Text: '轉位', Check: false },
        { Value: '復發', Text: '復發', Check: false }
    ];

    //非感染併發症
    self.noninfectionOptions = [
        { key: "0", value: "請選擇" },
        { key: "BSD", value: "Blood-stained Dialysate" },
        { key: "CM", value: "Catheter Malfunction" },
        { key: "EPS", value: "Encapsulation Peritoneal Sclerosis" },
        { key: "HER", value: "Hernia" },
        { key: "LEAK", value: "Leak" },
        { key: "PTY", value: "Parathyroidectomy" },
        { key: "UF", value: "UF Failure" },
        { key: "OTHER", value: "Other" }
    ];

    // 腹膜炎感染 - 性質
    self.peritonitisCheck = [
        { Value: '復發性', Text: '復發性', Check: false },
        { Value: '反覆性', Text: '反覆性', Check: false },
        { Value: '重複性', Text: '重複性', Check: false }
    ];

    // cancel
    self.cancel = function cancel() {
        $mdDialog.cancel();
    };

    // save
    self.ok = function ok() {
        let toDay = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        //patient 基本資料
        self.compDataObj.Patientid = self.currentPatient.Id;
        self.compDataObj.Patient_Name = self.currentPatient.Name;
        self.compDataObj.Medicalid = self.currentPatient.MedicalId;
        self.compDataObj.Hospitalid = self.currentPatient.HospitalId;
        self.compDataObj.Pat_Seq = self.currentPatient.PAT_SEQ;
        self.compDataObj.Status = "Normal";

        //#region 20190402 by WT, 儲存資料整理
        switch (self.infectionKind) {
            case "noninfection":
                self.compDataObj.Infection_Complication = "noninfection";

                switch (self.noninfectionNm) {
                    case "BSD":
                    case "CM":
                        self.compDataObj.Non_Infection_Complication = self.noninfectionNm;
                        self.compDataObj.Non_Infection_Detail = self.noninfectionSCM;
                        break;
                    case "EPS":
                    case "HER":
                        self.compDataObj.Non_Infection_Complication = self.noninfectionNm;
                        self.compDataObj.Non_Infection_Detail = self.herniaLocation;
                        break;
                    case "LEAK":
                        self.compDataObj.Non_Infection_Complication = self.noninfectionNm;
                        self.compDataObj.Non_Infection_Detail = self.noninfectionSLEAK;
                        break;
                    case "UF":
                    case "PTY":
                        self.compDataObj.Non_Infection_Complication = self.noninfectionNm;
                        self.compDataObj.Non_Infection_Detail = "";
                        break;
                    case "OTHER":
                        self.compDataObj.Non_Infection_Complication = "OTHER";
                        self.compDataObj.Non_Infection_Detail = self.noninfectionOther;
                        break;
                }
                break;
            default:
                self.compDataObj.Infection_Complication = self.infectionKind;
                break;
        }
        //#endregion

        // 整理畫面資料
        self.sortoutData("treatmentResult");
        self.sortoutData("peritonitisCheck");

        console.log("compDataObj--Update Create---", self.compDataObj);

        if (self.compDataObj.isCreate == true) {
            
            self.compDataObj.CreatedTime = toDay;
            self.compDataObj.CreatedUserId = SettingService.getCurrentUser().Id;
            self.compDataObj.CreatedUserName = SettingService.getCurrentUser().Name;

            complicationService.post(self.compDataObj).then((res) => {
                console.log("compData createOne success", res);
                showMessage($translate('visitHome.dialog.createSuccess'));
                $rootScope.$emit("ComplicationRefreshEvent", "");
            }, (res) => {
                console.log("compData createOne fail", res);
                showMessage($translate('visitHome.dialog.createFail'));
            });
        } else {
            self.compDataObj.ModifiedTime = toDay;
            self.compDataObj.ModifiedUserId = SettingService.getCurrentUser().Id;
            self.compDataObj.ModifiedUserName = SettingService.getCurrentUser().Name;
            complicationService.put(self.compDataObj).then((res) => {
                console.log("compData update success", res);
                showMessage($translate('visitHome.dialog.editSuccess'));
                $rootScope.$emit("ComplicationRefreshEvent", "");
            }, (res) => {
                console.log("compData update fail", res);
                showMessage($translate('visitHome.dialog.editFail'));
            });
        }

        $mdDialog.hide();
    };

    // initial 整理 資料庫資料 => 畫面上 Checkbox
    self.sortinData = function (blockName) {
        // 感染併發症
        self.infectionKind = self.compDataObj.Infection_Complication;
        self.noninfectionNm = self.compDataObj.Non_Infection_Complication;
        self.noninfectionSCM = "";
        self.noninfectionSLEAK = "";
        self.herniaLocation = "";
        self.noninfectionOther = "";

        if (self.compDataObj.Infection_Complication_Detail) {
            if (self.compDataObj.Infection_Complication_Detail !== "") {
                let icdAry = self.compDataObj.Infection_Complication_Detail.split(",");
                for (let tmpItem in icdAry) {
                    for (let i = 0; i < self.peritonitisCheck.length; i++) {
                        let si = self.peritonitisCheck[i];
                        if (icdAry[tmpItem] === si.Text) {
                            si.Check = true;
                            self.peritonitisCheck[i] = si;
                            break;
                        }
                    }
                }
            }
        }

        switch (self.noninfectionNm) {
            case "BSD":
            case "CM":
                self.noninfectionSCM = self.compDataObj.Non_Infection_Detail;
                break;
            case "EPS":
            case "HER":
                self.herniaLocation = self.compDataObj.Non_Infection_Detail;
                break;
            case "LEAK":
                self.noninfectionSLEAK = self.compDataObj.Non_Infection_Detail;
                break;
            case "UF":
            case "PTY":
                self.compDataObj.Non_Infection_Detail = "";
                break;
            case "OTHER":
                self.noninfectionOther = self.compDataObj.Non_Infection_Detail;
                break;
        }

        self.treatmentResultOther = "";
        let tmpAry = [];
        switch (blockName) {
            case "treatmentResult":
                if (self.compDataObj.Treatment_Treatment !== null) {
                    tmpAry = self.compDataObj.Treatment_Treatment.split(",");
                    for (let tmpItem in tmpAry) {
                        if (tmpAry[tmpItem].substr(0, 5) === "OTHER") {
                            let tmpTreatmentAry = tmpAry[tmpItem].split("_");
                            self.treatmentResultOther = tmpTreatmentAry[1];
                        } else {
                            for (let i = 0; i < self.treatmentResultCheck.length; i++) {
                                let si = self.treatmentResultCheck[i];
                                if (tmpAry[tmpItem] === si.Text) {
                                    si.Check = true;
                                    self.treatmentResultCheck[i] = si;
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
        }
    };

    // 儲存button -> 整理 畫面上 Checkbox => 資料庫資料
    self.sortoutData = function (blockName) {
        let tmpStr = "";
        switch (blockName) {
            case "treatmentResult":
                tmpStr = "";
                for (let si in self.treatmentResultCheck) {
                    if (self.treatmentResultCheck[si].Check) {
                        tmpStr += self.treatmentResultCheck[si].Text + ",";
                    }
                }
                tmpStr += "OTHER_" + self.treatmentResultOther;
                self.compDataObj.Treatment_Treatment = tmpStr;
                break;
            case "peritonitisCheck":
                tmpStr = "";
                for (let si in self.peritonitisCheck) {
                    if (self.peritonitisCheck[si].Check) {
                        tmpStr += self.peritonitisCheck[si].Text + ",";
                    }
                }
                self.compDataObj.Infection_Complication_Detail = tmpStr.substr(0, tmpStr.length - 1);
                break;
        }

    };

    self.checkTheBox = function (blockName, index) {
        switch (blockName) {
            case "treatmentResult":
                self.treatmentResultCheck[index].Check = !self.treatmentResultCheck[index].Check;
                break;
            case "peritonitisCheck":
                self.peritonitisCheck[index].Check = !self.peritonitisCheck[index].Check;
                break;
        }
    };

    // 插入片語
    self.isOpenRight = function isOpenRight() {
        return $mdSidenav('rightPhrase').toggle();
    };
    self.phraseInsertCallback = function phraseInsertCallback(e) {
        cursorInput($('#Content'), e);
        //$mdSidenav('rightPhrase').close();
    };
    function cellPressed(value) {
        $mdDialog.show({
            controller: [
                '$mdDialog', DialogController
            ],
            templateUrl: 'dialog.html',
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
                labexamService
                    .del(value)
                    .then((q) => {
                        if (q.status === 200) {
                            self.refresh();
                        }
                    });
                mdDialog.hide(value);
            };
        }
    }
    function calculateDays (treatItem) {
        let days = 0;
        
        let firstStr = moment(treatItem.startDate).format("YYYY-MM-DD");
        let nowStr = moment(treatItem.endDate).format("YYYY-MM-DD");

        let firstLong = (new Date(firstStr + " 00:00:00")).valueOf();
        let nowLong = (new Date(nowStr + " 00:00:00")).valueOf();
        let diffLong = nowLong - firstLong;
        days = Math.ceil(diffLong / (24 * 60 * 60 * 1000));

        return days + 1;
    };

    self.viewLabexam = function(qtype){
        self.formType = "labexam";
        loadingData();
        // if(!qtype){
        //     self.labStDate = new Date(queryCondition.value.startDate);
        //     self.labEdDate = new Date(queryCondition.value.endDate);
        // }
        // loadingData(true);
    };
    
    self.cancelLabexam = function(){
        self.formType = "complication";
        self.islabError = false;
        self.searchText = null;
    };


    //#endregion

    //#region 查看微生物報告
    self.mrStDate = new Date();
    self.mrEdDate = new Date();

    self.viewMicroResult = function(){
        self.formType = "microresult";
        self.mrClass = "ALL";
        self.checkMicroResult();
    };
    self.boxMicroResultClass = [];
    self.boxMicroResultShow = [];
    self.boo = true;
    self.toggleFunc = function(index){
        let newClassName = "box-wrap box-close"
        self.boxMicroResultShow[index] = false;
        //box = document.querySelector('.box-wrap');
        if (self.boxMicroResultClass[index].match(/box-close/)) {
            newClassName = "box-wrap box-open";
            self.boxMicroResultShow[index] = true;
        }
        self.boxMicroResultClass[index] = newClassName;
    }

    self.checkMicroResult = function(){
        self.mrLoading = true;
        let stDate = self.mrStDate
        let stYear = stDate.getFullYear();
        stYear = stYear - 1911;
        let stDateTW = stYear.toString() + moment(self.mrStDate).format("MMDD");

        let edDate = self.mrEdDate
        let edYear = edDate.getFullYear();
        edYear = edYear - 1911;
        let edDateTW = edYear.toString() + moment(self.mrEdDate).format("MMDD");

        self.microResultAry = [];
        console.log('self.mrClass',self.mrClass);
        tpechService.getMicroResult(self.currentPatient.MedicalId, stDateTW, edDateTW).then((res) => {
            console.log("tpechService getMicroResult success", res);
            let temptitle = "|抗生素                |      1      |抗生素                |      1      |";
            let temptitle2 = `|抗生素                 |      1      |抗生素                 |      1      |`;
            //篩選體液、微生物

            if(res.data.length > 0 && self.mrClass != 'ALL'){
                res.data = res.data.filter(e =>{
                    e.REP_TYPE_CODE == String(self.mrClass);
                })
            }

            for(let resItem in res.data){
                let mrItem = {};
    
                let itemYear = res.data[resItem].REPORT_DATE.substr(0, 3);
                let itemMD = res.data[resItem].REPORT_DATE.substr(3, 4);
    
                mrItem.REPORT_TIME = (Number(itemYear) + 1911).toString() + itemMD + " " + res.data[resItem].REPORT_TIME;
                mrItem.RES_SW = res.data[resItem].RES_SW;
                mrItem.REP_TYPE_CODE = res.data[resItem].REP_TYPE_CODE;
                mrItem.REP_TYPE_NAME = res.data[resItem].REP_TYPE_NAME;
                mrItem.HDEPT_NAME = res.data[resItem].HDEPT_NAME;
                
                if(res.data[resItem].RESULT.indexOf(temptitle) > -1){
                    res.data[resItem].RESULT = res.data[resItem].RESULT.replace(temptitle,temptitle2);
                }
                mrItem.RESULT = res.data[resItem].RESULT;
                self.boxMicroResultClass.push('box-close');
                self.boxMicroResultShow.push(true);
                self.microResultAry.push(mrItem);
            }
            self.mrLoading = false;
            // for(let resItem in res.Data){
            //     let mrItem = {};

            //     let itemYear = res.Data[resItem].REPORT_DATE.substr(0, 3);
            //     let itemMD = res.Data[resItem].REPORT_DATE.substr(3, 4);

            //     mrItem.REPORT_TIME = (Number(itemYear) + 1911).toString() + itemMD + " " + res.Data[resItem].REPORT_TIME;
            //     mrItem.RES_SW = res.Data[resItem].RES_SW;
            //     mrItem.REP_TYPE_CODE = res.Data[resItem].REP_TYPE_CODE;
            //     mrItem.REP_TYPE_NAME = res.Data[resItem].REP_TYPE_NAME;
            //     mrItem.HDEPT_NAME = res.Data[resItem].HDEPT_NAME;
        
            //     self.microResultAry.push(mrItem);
            // }
        }, (res) => {
            self.mrLoading = false;
            console.log("tpechService getMicroResult fail", res);
        });
    };

    self.cancelMicroResult = function(){
        self.formType = "complication";
    };

    //#endregion
    //可點選檢驗檢查清單設定 grid start
    // 初始化檢驗檢查
    // 查詢條件相關
    self.conditionTypes = {
        times: {
            name: 'times',
            conditions: ['30', '60', '90', '180', '365', '720'],
            value: {
                days: '30',
                startDate: new Date(moment()),
                endDate: new Date(moment())
            }
            // value: '30'
        },
        duration: {   // 時間區間
            name: 'duration',
            value: {
                startDate: new Date(moment().add(-7, 'day')), // 預設7天
                endDate: new Date()
            }
        }
    };
    
    function loadingData(){
        self.queryCondition = self.conditionTypes.duration;
        self.queryCondition.value.startDate = new Date(moment().add(-7, 'day'));
        self.queryCondition.value.endDate =  new Date();
        self.labData = [];
        // grid 標題
        let columnTitle = [{
            headerName: "項目",
            field: "LAB_NAME",
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            width: 150,
            suppressSizeToFit: true,
            suppressMovable: true,
            lockPosition: true,
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗日期",
            field: "Date",
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗時間",
            field: "Time",
            cellClass: ['font-15px']
        },
        {
            headerName: "檢驗數值",
            field: "ResultUnit",
            cellClass: ['font-15px']
        }
        ];
        self.gridOptions = {
            columnDefs: columnTitle, // grid 標題設定
            rowData: self.labData, // data
            angularCompileRows: true,
            defaultColDef: {
                resizable: true, // shift 可拉開標題長度
                sortable: true // 全部欄位皆開放排序
                // width: 200
            },
            pagination: true, // 分頁
            paginationAutoPageSize: true, // 每頁筆數自動以頁高為限
            onFirstDataRendered: sizeToFit, // 初始時縮放 grid
            colResizeDefault: 'shift', // 移動內部欄位時 grid resize
            suppressRowClickSelection: true,
            rowSelection: 'multiple', // 多選
            domLayout: 'normal', // autoHeight normal
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center" style="font-size: 15px;">資料下載中，請稍等...</span>',
            overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow; font-size: 15px;">暫無資料，請使用 "時間區間" 查詢</span>'
        };
        self.gridOptions.onGridReady = function (event) {
            console.log('the grid is now ready!!');
            sizeToFit();
        };
        self.getCheckItems();
        // 先初始化 ag-grid：開始長 grid
    }
    // 取得病人的所有的檢驗資料
    self.getCheckItems = function () {
        // grid 在 init 時就長好了
        //self.gridOptions.api.showLoadingOverlay();
        // self.loading = true;
        // 取得病人的所有的檢驗資料 ReferralSheetService.getLabCheckItems(self.StartDate, self.EndDate)
        // 處理時間 天數 -> 日期
        if (self.queryCondition.name === 'times'){
            // 天數
            // 結束日預設今天
            self.queryCondition.value.endDate = moment();
            // 換算成日期 conditions: ['30', '60', '90', '180', '365', '720'],
            switch (self.queryCondition.value.days) {
                case '30': // 1個月
                    self.queryCondition.value.startDate = moment().subtract(1, 'M'); // 今天 - 1個月
                    break;
                case '60': // 2個月
                    self.queryCondition.value.startDate = moment().subtract(2, 'M'); // 今天 - 2個月
                    break;
                case '90': // 3個月
                    self.queryCondition.value.startDate = moment().subtract(3, 'M'); // 今天 - 3個月
                    break;
                case '180': // 6個月
                    self.queryCondition.value.startDate = moment().subtract(6, 'M'); // 今天 - 6個月
                    break;
                case '365': // 1年
                    self.queryCondition.value.startDate = moment().subtract(1, 'y'); // 今天 - 1年
                    break;
                case '720': // 2年
                    self.queryCondition.value.startDate = moment().subtract(2, 'y'); // 今天 - 2年
                    break;
                default:
                    break;
            }
        }
        tpechService.getLabResult(self.currentPatient.MedicalId, self.queryCondition.value.startDate, self.queryCondition.value.endDate).then((q) => {
            self.loading = false;
            console.log('取得病人的所有的檢驗資料 q', q,q.data,q.data.length);
            if (q.data && q.data.length > 0) {
                // 依 項目 日期 排序
                self.labData = _.sortBy(angular.copy(q.data).map((v) => {
                    // 處理日期時間：DateTime string
                    v['DateTime'] = getRealDateTimeStr(v['REPORT_DATE'], v['REPORT_TIME']); // 排序用
                    // 顯示民國
                    v['Date'] = v['REPORT_DATE'] ? v['REPORT_DATE'] : '-';
                    v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                    if (v['Date']) {
                        v['TaiwanDate'] = v['Time'] != '-' ? v['Date'].concat(' ', v['Time']) : '-';
                    } else {
                        // 沒有 Date
                        v['TaiwanDate'] =  '-';
                    }
                    // 顯示西元
                    // v['Date'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('YYYY/MM/DD') : '-';
                    // v['Time'] = v['DateTime'] && v['DateTime'] != '-' ? moment(v['DateTime']).format('HH:mm') : '-';
                    // 處理數值單位：ResultUnit string
                    let unit = v['UNIT'] ? v['UNIT'] : '';
                    v['ResultUnit'] = v['RESULT'] ? v['RESULT'].concat(' ', unit) : '-';

                    // 不需要的欄位不需要上傳
                    delete v['PAT_NO'];
                    delete v['ODR_CODE'];
                    delete v['LAB_CODE'];
                    // delete v['LAB_NAME']; // 病摘頁需要
                    delete v['RESULT'];
                    delete v['UNIT'];
                    delete v['HIGH_LIMIT'];
                    delete v['LOW_LIMIT'];
                    delete v['RES_SW'];
                    delete v['REP_TYPE_CODE'];
                    delete v['REP_TYPE_NAME'];
                    delete v['REPORT_DATE'];
                    delete v['REPORT_TIME'];
                    delete v['HDEPT_NAME'];
                    delete v['DateTime'];
                    // delete v['Date']; // 勾選單頁需要
                    // delete v['Time']; // 勾選單頁需要
                    // delete v['TaiwanDate']; // 病摘頁需要
                    // delete v['ResultUnit']; // 病摘頁需要
    
                    return v;
                }), ['LAB_NAME', 'DateTime']);
                // _.forEach(self.labData, (v) => {
                //     // 處理日期時間：DateTime string
                //     v['DateTime'] = getRealDateTimeStr(v['REPORT_DATE'], v['REPORT_TIME']);
                //     // 處理數值單位：ResultUnit string
                //     let unit = v['UNIT'] ? v['UNIT'] : '';
                //     v['ResultUnit'] = v['RESULT'] ? v['RESULT'].concat(' ', unit) : '-';
                // })
                console.log('檢驗項目總資料 self.labData', self.labData);
                $timeout(() => {
                    self.gridOptions.api.setRowData(self.labData);
                    // $scope.gridOptions.api.setRowData(rows);
                }, 0);
                
    
                // 等待 grid 長好後再執行
                // self.gridOptions.onGridReady =  function(event) { 
                //     console.log('the grid is now ready!!'); 
                //     self.gridOptions.api.hideOverlay();
                //     self.gridOptions.api.setRowData(self.labData);
                // };
            } else {
                //self.gridOptions.api.showNoRowsOverlay();
            }
        }, (err) => {
            self.loading = false;
            self.islabError = true;
        });
    };
    // 搜尋功能
    self.onQuickFilterChanged = function () {
        // self.gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
        self.gridOptions.api.setQuickFilter(self.searchText);
    };
    // 處理民國年與時間 -> 轉成 西元時間字串
    function getRealDateTimeStr(dateStr, timeStr) {
        // 1060301 990301
        // 先確認年份是二位還是三位
        let year = null;
        let newDateStr = null;
        let time = null;
        let newTimeStr = null;
        let finalStr = null;
        let finalMoment = null; // 回傳moment物件
        // 處理日期
        if (dateStr) {
            if (dateStr.length >= 7) {
                // 7位：1060301
                // 拆前3位
                year = parseInt(dateStr.substring(0, 3)) ? parseInt(dateStr.substring(0, 3)) + 1911 : null;
                newDateStr = year.toString().concat(dateStr.substring(3, 7)); // 20170301
            } else {
                // 6位：990301
                // 拆前2位
                year = parseInt(dateStr.substring(0, 2)) ? parseInt(dateStr.substring(0, 2)) + 1911 : null;
                newDateStr = year.toString().concat(dateStr.substring(2, 6)); // 20100301
            }
        }
        // 處理時間
        if (timeStr) {
            if (timeStr && timeStr.length === 4) {
                // 0830 -> 08:30
                time = timeStr.substring(0, 2); // 08
                newTimeStr = time.concat(':', timeStr.substring(2, 4)); // 08:30
            }
        }

        finalStr = newDateStr && newTimeStr ? newDateStr.concat(' ', newTimeStr) : null;
        finalMoment = finalStr ? moment(finalStr, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm') : '-';

        // console.log('年月日時 finalStr', finalStr);
        // console.log('年月日時 finalMoment', finalMoment);
        return finalMoment;
    }
    // 勾選完畢儲存
    self.saveChecked = function () {
        // 勾選好的資料會成陣列
        // selectedRows 就是檢驗項目原始資料物件
        let selectedRows = self.gridOptions.api.getSelectedRows();
        // nodes 為 ag-grid 的詳細資料物件：包含在grid中的位置...等
        let selectedNodes = self.gridOptions.api.getSelectedNodes();

        // let selectedRowsString = '';
        // selectedRows.forEach(function (selectedRow, index) {
        //     if (index !== 0) {
        //         selectedRowsString += ', ';
        //     }
        //     selectedRowsString += selectedRow.make;
        // });

        // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
        console.log('勾選完畢儲存 selectedRows', selectedRows);
        console.log('勾選完畢儲存 selectedNodes', selectedNodes);
        // console.log('勾選完畢儲存 selectedRowsString', selectedRowsString);

        // 帶資料回前一頁
        if (selectedRows && selectedRows.length > 0) {
            let labexamItem = [];
            if(!_.isEmpty(self.compDataObj.Bacterial_Culture_Results)){
                labexamItem = self.compDataObj.Bacterial_Culture_Results.split(',');
            }
            selectedRows.forEach(element => {
                labexamItem.push(`${element.LAB_NAME}：${element.ResultUnit}`)
            });
            console.log('labexamItem',labexamItem);
            
            self.compDataObj.Bacterial_Culture_Results = labexamItem.join(',');
            
            
            // 有勾選
            // ReferralSheetService.setCheckedLabexamData(selectedRows);
            //ReferralSheetService.setCheckedData('labexam', selectedRows);
            // $sessionStorage.checkedLabexamData = selectedRows;
        } else {
            // 無勾選
            //ReferralSheetService.setCheckedData('labexam', []);
            // $sessionStorage.checkedLabexamData = [];
        }
        //console.log('勾選完畢儲存 $sessionStorage.referralCheckedData', $sessionStorage.referralCheckedData);
        
        self.cancelLabexam();

    };
    // 監聽 window 大小縮放 grid
    window.addEventListener("resize", sizeToFit);

    function sizeToFit() {
        $timeout(() => {
            self.gridOptions.api.sizeColumnsToFit();
        }, 0);  
    }
    
    //可點選檢驗檢查清單設定 end
    self.initialUI = function () {
        PatientService.getById($stateParams.patientId).then((res) => {
            self.currentPatient = res.data;
            console.log("self.currentPatient--", self.currentPatient);
        }, (res) => {
            console.log("complicationService getList Fail", res);
        });

        if (self.compDataObj.isCreate == true) {
            self.compDataObj.Record_Date = new Date();
            self.compDataObj.Infection_Complication_Detail = "";

            self.infectionKind = 'noninfection';
            self.noninfectionNm = "BSD";
            self.noninfectionSCM = "Fibrin";
            self.noninfectionSLEAK = "Abdominal";
            self.herniaLocation = "";
            self.noninfectionOther = "";
            self.treatmentResultOther = "";
        } else {
            self.compDataObj.Record_Date = new Date(self.compDataObj.Record_Date);
            self.sortinData("treatmentResult");
        }
    };
    self.initialUI();
}

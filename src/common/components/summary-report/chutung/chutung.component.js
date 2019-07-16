import chuTung from './chutung.component.html'; // 台大竹東表單
import './chutung.component.less';

angular.module('app').component('chutungReport', {
    bindings: {
        headerId: '<',
        patient: '<',
        // deviation: '<',
        // catheter: '<',
        // clicked: '=',
        // columnTd: '=',
        // whiteframe: '=?'
    },
    template: chuTung,
    controller: chuTungController
})
    .filter('TdRange', () => function range(n) {
        return _.range(0, n);
    });

chuTungController.$inject = ['$state', 'SettingService', 'summaryReportService', '$stateParams'];

function chuTungController($state, SettingService, summaryReportService, $stateParams) {
    console.log('enter summary content component');
    const self = this;
    const maxMachineDataLengthPerPage = 8;
    console.log('data', self.data);
    console.log('patient', self.patient);

    self.currentHospital = SettingService.getCurrentHospital();

    self.$onInit = function () {
        prepareData();
    };

    function prepareData() {
        self.loading = true;
        summaryReportService.getCommonSummaryData($stateParams.patientId, self.headerId).then((res) => {
            self.data = res.data;
            self.catheter = res.catheter;
            self.deviation = res.deviation;

            self.columnTd = 0;
            // 算出欄位，是否有少於8欄
            if (self.data.DialysisData.length <= 8) {
                let range = Array.from(Array(8 - self.data.DialysisData.length).keys());
                self.columnTd = range;
            }

            console.log('sheet template', self.template);

            // offuser 邏輯，若已關表，取最後一筆透析機資料的修改者，若無修改者則取建立者
            if (self.data.DialysisHeader.EndTime && self.data.DialysisData.length > 0) {
                self.OffUser = {
                    UserId: self.data.DialysisData[self.data.DialysisData.length - 1].ModifiedUserId || self.data.DialysisData[self.data.DialysisData.length - 1].CreatedUserId,
                    UserName: self.data.DialysisData[self.data.DialysisData.length - 1].ModifiedUserName || self.data.DialysisData[self.data.DialysisData.length - 1].CreatedUserName
                };
            }
            console.log('OffUser', self.OffUser);

            // for chutung check whether offuser is diff from checkstaff
            _.forEach(self.data.DialysisHeader.CheckStaff, (value, key) => {
                self.data.DialysisHeader.CheckStaffId = key;
                console.log('CheckStaffId', self.data.DialysisHeader.CheckStaffId);
            });

            // 護理紀錄 需執行在分頁之前
            memoRecords();

            // 分頁
            // 依據透析機資料(8筆)或護理紀錄(7筆)
            let pageTotalCount = 0;
            self.formPages = [];  // 表單頁面
        let machineItem = {};
        if (self.data.DialysisData.length > 0 || self.data.NursingRecord.length > 0) {
            // copy 一份護理紀錄避免動到其他邏輯
            let records = angular.copy(self.records);

            // 透析機資料與護理紀錄以比較多筆的為頁數
            let machineDataPage = Math.ceil(self.data.DialysisData.length / maxMachineDataLengthPerPage); // page count

            pageTotalCount = self.records.length > machineDataPage ? records.length : machineDataPage; // page count
            for (let i = 0; i < pageTotalCount; i++) {
                // 透析機資料
                machineItem = {};
                machineItem.pageNo = i + 1;
                machineItem.DialysisData = [];
                let j = 0;
                self.data.DialysisData.forEach((x) => {
                    j += 1;
                    if (j >= ((i * maxMachineDataLengthPerPage) + 1) && j <= ((i * maxMachineDataLengthPerPage) + maxMachineDataLengthPerPage)) {
                        machineItem.DialysisData.push(x);
                    }
                });

                // 為了補齊 8 個 td
                if (machineItem.DialysisData.length < maxMachineDataLengthPerPage) {
                    // machineItem.columnTd = Array.from(Array((8 * machineDataPage) - machineItem.DialysisData.length).keys());
                    machineItem.columnTd = Array.from(Array(maxMachineDataLengthPerPage - machineItem.DialysisData.length).keys());
                }

                // 護理紀錄取下一頁第一筆透析機資料時間之前
                // 當最後一頁或是只有一頁的時候，將剩餘護理紀錄全給
                if (pageTotalCount === 1 || (pageTotalCount > 1 && i === pageTotalCount - 1)) {
                    machineItem.records = records[i] ? records[i] : [];
                    console.log('pageNo', machineItem.pageNo, machineItem.records);
                } else if (pageTotalCount > 1) {
                    // 取得下一頁的第一筆透析機資料紀錄時間
                    // let nextPageFirstDataDialysisTime = moment(self.data.DialysisData[(i + 1) * 8].DialysisTime);
                    // // 只撈出下一頁第一筆透析機資料透析時間之前的護理紀錄
                    // machineItem.records = _.filter(records, (o) => {
                    //     return moment(o.CreatedTime).diff(nextPageFirstDataDialysisTime) < 0;
                    // });
                    // // 將已塞入的護理紀錄從原本的 array 刪除，因為已照時間正序排
                    // if (machineItem.records.length > 0) {
                    //     records.splice(0, machineItem.records.length);
                    // }

                    machineItem.records = records[i] ? records[i] : [];

                    console.log('pageNo', machineItem.pageNo, machineItem.records);
                }

                // 護理紀錄最少要顯示七筆的長度，因此未滿七筆需補齊
                if (machineItem.records.length < maxNursingRecordLengthPerPage + 1) {
                    let count = maxNursingRecordLengthPerPage - machineItem.records.length;
                    for (let k = 0; k < count; k++) {
                        machineItem.records.push({});
                    }
                }

                self.formPages.push(machineItem);
                console.log('分頁', self.formPages);

            }
        } else {
            machineItem.pageNo = 1;
            machineItem.DialysisData = self.data.DialysisData;
            machineItem.columnTd = Array.from(Array(maxMachineDataLengthPerPage - self.data.DialysisData.length).keys());

            // 護理紀錄最少要顯示九筆的長度，因此未滿九筆需補齊
            machineItem.records = self.records[0] ? self.record[0] : [];
            if (machineItem.records.length < maxNursingRecordLengthPerPage + 1) {
                let count = maxNursingRecordLengthPerPage - machineItem.records.length;
                for (let i = 0; i < count; i++) {
                    machineItem.records.push({});
                }
            }
            self.formPages.push(machineItem);
        }

            // 竹東表單
            self.lastDialysisTime = getLastDialysisTime();
            // when it has assessment records
            if (self.data.AssessmentRecords.length > 0) {
                // sort records by record time
                self.data.AssessmentRecords = _.sortBy(self.data.AssessmentRecords, function (o) {
                    return o.RecordTime;
                });

                // 洗前評估
                // filter out pre-assessment records
                let preAssessmentRecords = _.filter(self.data.AssessmentRecords, {
                    'Type': 'pre'
                });
                let preAssessmentCount = preAssessmentRecords.length;
                // initialize pre assessment object
                self.preAssessment = {};

                // if there is pre assessment record
                if (preAssessmentCount > 0) {

                    // get the latest record
                    self.preAssessment.Previous = preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['前次透析後狀況'] : [];
                    checkForOther(self.preAssessment.Previous);
                    self.preAssessment.Current = preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'] ? preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'] : [];
                    checkForOther(self.preAssessment.Current);
                    // debugger;
                    // self.preAssessment = preAssessmentRecords[preAssessmentCount - 1].Items['本次透析前狀況'];
                }

                // 洗後評估
                // filter out post-assessment records
                let postAssessmentRecords = _.filter(self.data.AssessmentRecords, {
                    'Type': 'post'
                });
                let postAssessmentCount = postAssessmentRecords.length;
                // initialize post assessment object
                self.postAssessment = {
                    // vesselAssessment: {}
                };
                // if there is post assessment record
                if (postAssessmentCount > 0) {
                    // get the latest record
                    // self.postAssessment.postAssessment = postAssessmentRecords[postAssessmentCount - 1].Items['本次透析前狀況'] ? postAssessmentRecords[postAssessmentCount - 1].Items['本次透析前狀況'] : [];
                    // checkForOther(self.postAssessment.postAssessment);
                    self.postAssessment.bloodFlow = postAssessmentRecords[postAssessmentCount - 1].Items['血流量'] ? postAssessmentRecords[postAssessmentCount - 1].Items['血流量'] : [];
                    checkForOther(self.postAssessment.bloodFlow);
                    self.postAssessment.appearance = postAssessmentRecords[postAssessmentCount - 1].Items['外觀'] ? postAssessmentRecords[postAssessmentCount - 1].Items['外觀'] : [];
                    checkForOther(self.postAssessment.appearance, 'abnormal');
                    // self.postAssessment.vesselAssessment.part = postAssessmentRecords[postAssessmentCount - 1].Items['血管通路評估(部位)'] ? postAssessmentRecords[postAssessmentCount - 1].Items['血管通路評估(部位)'] : [];
                    // self.postAssessment.vesselAssessment.type = postAssessmentRecords[postAssessmentCount - 1].Items['血管通路評估(種類)'] ? postAssessmentRecords[postAssessmentCount - 1].Items['血管通路評估(種類)'] : [];
                }

            }
            self.isError = false;
        }).catch((err) => {
            self.isError = true;
        }).finally(() => {
            self.loading = false;
        });
    }

    const maxStringLength = 96;
    const maxLastStringLength = 84; // 最後一行需要留印章的位置
    const maxNursingRecordLengthPerPage = 7;    // 滿七筆要多一頁
    // 處理護理紀錄是否要分頁
    function memoRecords() {
        self.records = [];

        // 正規化資料並依建立時間正序排
        let nursingRecord = _.orderBy(self.data.NursingRecord.map((data) => {
            // 字串大於 135(中文字 45 個字) 時需再切
            return {
                Id: data.Id,
                CreatedTime: data.NursingTime,
                // ModifiedTime: data.ModifiedTime,
                Memo: data.Content,
                CreatedUserName: data.CreatedUserName,
                ModifiedUserName: data.ModifiedUserName
            };
        }), ['CreatedTime']);

        // console.log('nursingRecord', nursingRecord);

        // get nursing record
        let temp = [];  // 暫時存資料，若超過七筆則再清空

        _.forEach(nursingRecord, (record, index) => {
            // 根據內容
            let currentRows = maxStringLength - 1;
            let resultStr = record.Memo[0];
            let sameRecordRows = 0; // 判斷是否為同筆資料的第一個

            for (let i = 1; i < record.Memo.length; i++) {
                // 判斷前一個字是否為空白且目前是否為空白，若是則不須做下面的事
                if (record.Memo[i - 1] == ' ' && record.Memo[i] == ' ') {
                    continue;
                }

                // 判斷目前字元是否為半形，若為半形則 - 1，否則 - 2
                // https://codertw.com/%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC/195462/
                if (record.Memo[i].match(/[\u0000-\u00ff]/g)) {
                    currentRows--;
                } else {
                    currentRows -= 2;
                }

                resultStr += record.Memo[i];

                if (currentRows <= 0 || i === record.Memo.length - 1) {
                    // 判斷 temp 是否要換頁
                    if (temp.length === maxNursingRecordLengthPerPage) {
                        self.records.push(temp);
                        temp = [];
                    }

                    // 判斷是否為第一個 row，第一個 row 才需要顯示紀錄時間
                    let item = {
                        Memo: resultStr
                    };
                    if (sameRecordRows === 0) {
                        item.CreatedTime = record.CreatedTime;
                    }

                    // 再判斷是否小於零，若小於零．原本到底的事仍要做，上一步需再執行一次
                    if (currentRows < 0) {
                        i--;
                        item.Memo = resultStr.substring(0, resultStr.length - 1);
                    } else if (i === record.Memo.length - 1) {
                        // 判斷是否已到此筆紀錄的結尾
                        // 結尾需顯示印章，因此要留印章的位置，需重新 repeat 最後一行字串，確保有印章的空間
                        // 最保險須留 90，因此抓若最後一行字串大於 45 (若都為全形字) 就需要檢查是否要再斷行
                        if (resultStr.length > 45) {
                            let currentLastRows = maxLastStringLength;
                            let lastResultStr = '';
                            for (let j = 0; j < resultStr.length; j++) {
                                if (resultStr[j].match(/[\u0000-\u00ff]/g)) {
                                    currentLastRows--;
                                } else {
                                    currentLastRows -= 2;
                                }

                                lastResultStr += resultStr[j];

                                // 超過一行
                                if (currentLastRows < 0) {
                                    // 若後面仍有字需另外處理
                                    // 變為最後兩行，第一行需補滿 97 個字，若無則補空白
                                    if (resultStr[j + 1] != null) {
                                        lastResultStr += resultStr[j + 1];
                                        let k = 2;
                                        let l = 1;
                                        while (k < maxStringLength - maxLastStringLength) {
                                            l++;
                                            // 判斷是否本筆資料已無字，則補滿空白
                                            if (resultStr[j + l] == null) {
                                                lastResultStr += ' ';
                                                k++;
                                                continue;
                                            }
                                            // 判斷前一個字是否為空白，若為空白則不須做下面的事
                                            if (resultStr[(j + l) - 1] == ' ' && record.Memo[j + l] == ' ') {
                                                continue;
                                            }
                                            if (resultStr[j + l].match(/[\u0000-\u00ff]/g)) {
                                                k++;
                                            } else {
                                                k += 2;
                                            }
    
                                            lastResultStr += resultStr[j + l];
                                        }
                                    }

                                    // let lastRowItem = {
                                    //     Memo: lastResultStr.substring(0, lastResultStr.length - 1)
                                    // };

                                    let lastRowItem = {
                                        Memo: lastResultStr
                                    };

                                    // 判斷是否為第一行
                                    if (sameRecordRows === 0) {
                                        lastRowItem.CreatedTime = record.CreatedTime;
                                        item.CreatedTime = null;
                                    }

                                    temp.push(lastRowItem);

                                    // 需再確認是否要換頁
                                    if (temp.length === maxNursingRecordLengthPerPage) {
                                        self.records.push(temp);
                                        temp = [];
                                    }

                                    // 真的最後一行的訊息就為剩下的字
                                    if (lastResultStr.length < resultStr.length) {
                                        item.Memo = resultStr.substring(lastResultStr.length - 1, resultStr.length);
                                    } else {
                                        item.Memo = '';
                                    }
                                    break;
                                }
                            }
                        }

                        item.CreatedUserName = record.CreatedUserName;
                        item.ModifiedUserName = record.ModifiedUserName;


                    }
                    temp.push(item);
                    sameRecordRows++;

                    // init
                    currentRows = maxStringLength;
                    resultStr = '';

                }

                // 判斷是否已滿一行了
                // if (currentRows <= 0) {
                //     // 判斷 temp 是否要換頁
                //     if (temp.length === maxNursingRecordLengthPerPage) {
                //         self.records.push(temp);
                //         temp = [];
                //     }

                //     // 判斷是否為第一個 row，第一個 row 才需要顯示紀錄時間
                //     let item = {
                //         Memo: resultStr
                //     };
                //     if (sameRecordRows === 0) {
                //         item.CreatedTime = record.CreatedTime;
                //     }

                //     // 再判斷是否小於零，若小於零．原本到底的事仍要做，上一步需再執行一次
                //     if (currentRows < 0) {
                //         i--;
                //         item.Memo = resultStr.substring(0, resultStr.length - 1);
                //         temp.push(item);
                //         sameRecordRows++;
                //         currentRows = maxStringLength;  // init
                //         resultStr = '';
                //     } else if (i === record.Memo.length - 1) {
                //         // 判斷是否已到此筆紀錄的結尾
                //         // 結尾需顯示印章
                //         item.CreatedUserName = record.CreatedUserName;
                //         item.ModifiedUserName = record.ModifiedUserName;
                //         temp.push(item);
                //         sameRecordRows++;
                //         currentRows = maxStringLength;  // init
                //         resultStr = '';
                //     }

                // } else if (i === record.Memo.length - 1) {
                //     // 判斷 temp 是否要換頁
                //     if (temp.length === maxNursingRecordLengthPerPage) {
                //         self.records.push(temp);
                //         temp = [];
                //     }
                //     let item = {
                //         Memo: resultStr,
                //         CreatedUserName: record.CreatedUserName,
                //         ModifiedUserName: record.ModifiedUserName
                //     };

                //     if (sameRecordRows === 0) {
                //         item.CreatedTime = record.CreatedTime;
                //     }

                //     // 若已到此筆紀錄的結尾也需加到 temp 陣列裡
                //     temp.push(item);
                // }
            }

            // 最後一筆時，判斷 temp 裡是否還有，如果有則需再換頁
            if ((index === nursingRecord.length - 1) && temp.length > 0) {
                self.records.push(temp);
            }

        });


        console.log('memoRecords', self.records);
    }

    // 關表 get the time of the last dialysis time
    function getLastDialysisTime() {
        // check if DialysisDataLastTime exists
        if (self.data.DialysisHeader.EndTime) {
            // get last dialysis time if there are at least one record
            if (self.data.DialysisData.length > 0) {
                let dialysisDataCount = self.data.DialysisData.length;
                return self.data.DialysisData[dialysisDataCount - 1].DialysisTime;
            }
        }
        return 0;
    }

    // if it contains 'Other' then change it to '其它'
    function checkForOther(assessmentArray, otherValue = '') {
        if (assessmentArray) {
            // if it contains 'Other'
            if (assessmentArray.includes('Other')) {
                let indexOfOther = assessmentArray.indexOf('Other');

                // 'Other' is in the second last position
                if (indexOfOther !== assessmentArray.length - 1) {
                    assessmentArray[indexOfOther] = otherValue === '' ? '其它：' + assessmentArray[assessmentArray.length - 1] : '異常：' + assessmentArray[assessmentArray.length - 1];
                    assessmentArray.splice(assessmentArray.length - 1, 1);
                } else {
                    // 'Other' is in last position
                    assessmentArray[indexOfOther] = otherValue === '' ? '其它' : '異常';
                }
            }
        }
    }

    self.refresh = function () {
        prepareData();
    };

}

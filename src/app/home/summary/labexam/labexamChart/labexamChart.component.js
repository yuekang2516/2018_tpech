import tpl from './labexamChart.html';

angular
    .module('app')
    .component('labexamChart', {
        template: tpl,
        controller: labChartCtrl,
        bindings: {
            isCard: '<'
        }
    });

labChartCtrl.$inject = [
    '$state',
    '$stateParams',
    '$scope',
    '$mdDialog',
    'SettingService',
    'PatientService',
    '$mdMedia',
    'showMessage',
    '$interval',
    'labexamService',
    '$filter'
];

function labChartCtrl($state, $stateParams, $scope, $mdDialog, SettingService,
    PatientService, $mdMedia, showMessage, $interval, labexamService, $filter) {

    const self = this;
    self.user = SettingService.getCurrentUser();
    // 預設狀態
    self.loading = true;
    let queryCondition = labexamService.getPreviousQueryConditionByUserId(self.user.Id);
    self.serviceData = null;

    let $translate = $filter('translate');

    // listen parent query condition change
    $scope.$on('queryCondition', (event, condition) => {
        console.log('queryCondition', condition);
        queryCondition = condition;
        self.loading = true;
        loadingData();
    });

    $scope.$on('labexam-dataChanged', () => {
        self.refresh();
    });

    // 使用者按右上角重整按鈕時
    self.refresh = () => {
        self.loading = true;
        loadingData(true);
    };

    // 初始化
    self.$onInit = () => {
        console.log('labexam chart');

        // Excel export & 重新整理相關
        $scope.$emit('labFn', { refresh: self.refresh });

        // 若為從 summary 頁來的固定取 90 天
        if (self.isCard) {
            queryCondition = {
                name: 'times',
                value: '90'
            };
        }

        loadingData(true);
    };

    let loadingData = (refresh = false) => {
        // 看查詢條件是天數還是區間
        if (queryCondition.name === 'times') {
            labexamService
            .getByPatientId($stateParams.patientId, queryCondition.value, refresh)
            .then((q) => {
                console.log('檢驗檢查 q.data', q.data);
                self.serviceData = q.data;
                $scope.$emit('labDataLength', self.serviceData.length);
                self.serviceData = q.data.map((item) => {
                    // 比較 NormalUpper < Value 偏高  NormalDown > Value 偏低
                    const upper = parseFloat(item.NormalUpper, 2); // 最大值
                    const down = parseFloat(item.NormalDown, 2); // 最小值
                    const standard = parseFloat(item.Value, 2); // 標準值
                    if (!isNaN(upper) && !isNaN(down) && !isNaN(standard)) {
                        if (upper < standard) {
                            item.isAbnormal = true;
                            item.flag = $translate('labexam.labexam.component.tooHigh');
                        } else if (down > standard) {
                            item.isAbnormal = true;
                            item.flag = $translate('labexam.labexam.component.tooLow');
                        } else {
                            item.isAbnormal = false;
                            item.flag = $translate('labexam.labexam.component.normal');
                        }
                    } else {
                        item.isAbnormal = true;
                        item.flag = $translate('labexam.labexam.component.abnormal');
                    }

                    // handle group
                    if (!item.Group) {
                        item.Group = $translate('labexam.labexam.component.other');
                    }

                    // handle display time
                    item.displayTime = moment(item.CheckTime).format('YYYY/MM/DD (dd) HH:mm') + ' (' + moment(item.CheckTime).fromNow() + ')';

                    return item;
                });

                // 抓取 EPO 資料
                const endDate = moment().format('YYYY-MM-DD');
                const startDate = moment().subtract(queryCondition.value, 'd').format('YYYY-MM-DD');
                let EPOdata = null,
                    edata = null;

                labexamService
                    .getByEPOExecution($stateParams.patientId, startDate, endDate)
                    .then((d) => {
                        EPOdata = d.data;
                        // 組chat data
                        if (EPOdata) {
                            edata = EPOdata.concat(q.data);
                        } else {
                            edata = q.data;
                        }
                        console.log('getByEPOExecution q.data', q.data);

                        self.chartData = parseData(q.data);

                        // self.arrayLegend = ['HCT', 'HB', 'ALBUMIN', 'FE', 'EPO'];
                        self.arrayLegend = ['HCT', 'HB', 'ALBUMIN', 'FE'];

                        console.log('getByEPOExecution self.chartData', self.chartData);

                        // let dataZoomShow = false; // 因為預設值 HCT 不管有無數值，都會畫出圖表，當 HCT 無值時，不需再計算 dataZoom 的範圍，故 dataZoom 的 config->show: false

                        // && self.chartData.hctData.length !== 0
                        if (self.chartData) {
                            self.eChartsConfig = {
                                theme: 'default',
                                dataLoaded: true
                                // title: 'ededed'
                            };

                            self.eChartsOption = {
                                legend: {
                                    show: false,
                                    type: 'scroll',
                                    data: self.arrayLegend,
                                    top: 20,
                                    itemWidth: 40,
                                    borderRadius: 5,
                                    textStyle: {
                                        align: 'center'
                                    },
                                    selected: {
                                        HCT: true,
                                        HB: false,
                                        ALBUMIN: false,
                                        FE: false,
                                        EPO: false
                                    }
                                },
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross'
                                    }
                                },
                                dataZoom: [{
                                    show: true,
                                    type: 'inside'
                                },
                                {
                                    startValue: self.chartData.startDate[0], // 开始位置的百分比，0 - 100
                                    end: self.chartData.hctData.length > 10 ? 50 : 100, // 结束位置的百分比，0 - 100
                                    show: true,
                                    type: 'slider',
                                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                    handleSize: '80%',
                                    handleStyle: {
                                        color: '#fff',
                                        shadowBlur: 3,
                                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                                        shadowOffsetX: 2,
                                        shadowOffsetY: 2
                                    },
                                    bottom: 0
                                }
                                ],
                                xAxis: [{
                                    type: 'time',
                                    name: $translate('labexam.labexam.component.date'),
                                    axisLabel: {
                                        formatter(value, index) {
                                            let date = new Date(value);
                                            let texts = [(date.getMonth() + 1), date.getDate()];
                                            if (index === 0) {
                                                let temp_year = date.getYear();
                                                temp_year = temp_year < 2000 ? temp_year + 1900 : temp_year;
                                                let yy = temp_year.toString();
                                                texts.unshift(yy);
                                            }
                                            return texts.join('/');
                                        },
                                        rotate: 45
                                    },
                                    // splitNumber: 10,
                                    // minInterval: 1,
                                    maxInterval: 3600 * 48 * 1000
                                    // data: dateList
                                }],
                                yAxis: {
                                    type: 'value',
                                    min(value) {
                                        return value.min;
                                    },
                                    max(value) {
                                        return value.max + 1;
                                    }
                                },
                                series: [{
                                    name: 'HCT',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: 'rgb(255, 70, 131)'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.hctData
                                },
                                {
                                    name: 'HB',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    // sampling: 'average',
                                    itemStyle: {
                                        normal: {
                                            color: 'orange'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.hbData
                                },
                                {
                                    name: 'ALBUMIN',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: 'yellow'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.albuminData
                                },
                                {
                                    name: 'FE',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: '#15f605'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.feData
                                },
                                {
                                    name: 'EPO',
                                    type: 'bar',
                                    smooth: true,
                                    itemStyle: {
                                        normal: {
                                            color: 'blue'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter(params) {
                                                return params.data[1];
                                            }
                                        }
                                    },
                                    barWidth: 15,
                                    data: self.chartData.epoData
                                }
                                ]
                            };

                        }
                    });

                /**
                 * checkbox 選擇器 for echarts
                 */

                self.selected = ['HCT'];
                self.exists = (item) => {
                    return self.selected.indexOf(item) > -1;
                };
                self.disabled = (item) => {
                    switch (item) {
                        case 'HCT':
                            return self.chartData.hctData.length === 0;
                        case 'HB':
                            return self.chartData.hbData.length === 0;
                        case 'ALBUMIN':
                            return self.chartData.albuminData.length === 0;
                        case 'FE':
                            return self.chartData.feData.length === 0;
                        case 'EPO':
                            return self.chartData.epoData.length === 0;
                        default:
                            return false;
                    }
                };
                self.toggle = (item) => {
                    const idx = self.selected.indexOf(item);
                    if (idx > -1) {
                        self.selected.splice(idx, 1);
                    } else {
                        self.selected.push(item);
                    }

                    self.eChartsOption.legend.selected = {
                        HCT: self.selected.indexOf('HCT') > -1,
                        HB: self.selected.indexOf('HB') > -1,
                        ALBUMIN: self.selected.indexOf('ALBUMIN') > -1,
                        FE: self.selected.indexOf('FE') > -1,
                        EPO: self.selected.indexOf('EPO') > -1
                    };
                };

                // emit lastAccessTime
                $scope.$emit('labLastAccessTime', labexamService.getLastAccessTime());
                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        } else {
            labexamService
            .getByPatientIdDuration($stateParams.patientId, moment(queryCondition.value.startDate).format('YYYYMMDD'), moment(queryCondition.value.endDate).format('YYYYMMDD'))
            .then((q) => {
                console.log('檢驗檢查 q.data', q.data);
                self.serviceData = q.data;
                $scope.$emit('labDataLength', self.serviceData.length);
                self.serviceData = q.data.map((item) => {
                    // 比較 NormalUpper < Value 偏高  NormalDown > Value 偏低
                    const upper = parseFloat(item.NormalUpper, 2); // 最大值
                    const down = parseFloat(item.NormalDown, 2); // 最小值
                    const standard = parseFloat(item.Value, 2); // 標準值
                    if (!isNaN(upper) && !isNaN(down) && !isNaN(standard)) {
                        if (upper < standard) {
                            item.isAbnormal = true;
                            item.flag = $translate('labexam.labexam.component.tooHigh');
                        } else if (down > standard) {
                            item.isAbnormal = true;
                            item.flag = $translate('labexam.labexam.component.tooLow');
                        } else {
                            item.isAbnormal = false;
                            item.flag = $translate('labexam.labexam.component.normal');
                        }
                    } else {
                        item.isAbnormal = true;
                        item.flag = $translate('labexam.labexam.component.abnormal');
                    }

                    // handle group
                    if (!item.Group) {
                        item.Group = $translate('labexam.labexam.component.other');
                    }

                    // handle display time
                    item.displayTime = moment(item.CheckTime).format('YYYY/MM/DD (dd) HH:mm') + ' (' + moment(item.CheckTime).fromNow() + ')';

                    return item;
                });

                // 抓取 EPO 資料
                const endDate = moment().format('YYYY-MM-DD');
                const startDate = moment().subtract(queryCondition, 'd').format('YYYY-MM-DD');
                let EPOdata = null,
                    edata = null;

                labexamService
                    .getByEPOExecution($stateParams.patientId, startDate, endDate)
                    .then((d) => {
                        EPOdata = d.data;
                        // 組chat data
                        if (EPOdata) {
                            edata = EPOdata.concat(q.data);
                        } else {
                            edata = q.data;
                        }
                        console.log('getByEPOExecution q.data', q.data);

                        self.chartData = parseData(q.data);

                        // self.arrayLegend = ['HCT', 'HB', 'ALBUMIN', 'FE', 'EPO'];
                        self.arrayLegend = ['HCT', 'HB', 'ALBUMIN', 'FE'];

                        console.log('getByEPOExecution self.chartData', self.chartData);

                        // let dataZoomShow = false; // 因為預設值 HCT 不管有無數值，都會畫出圖表，當 HCT 無值時，不需再計算 dataZoom 的範圍，故 dataZoom 的 config->show: false

                        // && self.chartData.hctData.length !== 0
                        if (self.chartData) {
                            self.eChartsConfig = {
                                theme: 'default',
                                dataLoaded: true
                                // title: 'ededed'
                            };

                            self.eChartsOption = {
                                legend: {
                                    show: false,
                                    type: 'scroll',
                                    data: self.arrayLegend,
                                    top: 20,
                                    itemWidth: 40,
                                    borderRadius: 5,
                                    textStyle: {
                                        align: 'center'
                                    },
                                    selected: {
                                        HCT: true,
                                        HB: false,
                                        ALBUMIN: false,
                                        FE: false,
                                        EPO: false
                                    }
                                },
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross'
                                    }
                                },
                                dataZoom: [{
                                    show: true,
                                    type: 'inside'
                                },
                                {
                                    startValue: self.chartData.startDate[0], // 开始位置的百分比，0 - 100
                                    end: self.chartData.hctData.length > 10 ? 50 : 100, // 结束位置的百分比，0 - 100
                                    show: true,
                                    type: 'slider',
                                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                    handleSize: '80%',
                                    handleStyle: {
                                        color: '#fff',
                                        shadowBlur: 3,
                                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                                        shadowOffsetX: 2,
                                        shadowOffsetY: 2
                                    },
                                    bottom: 0
                                }
                                ],
                                xAxis: [{
                                    type: 'time',
                                    name: $translate('labexam.labexam.component.date'),
                                    axisLabel: {
                                        formatter(value, index) {
                                            let date = new Date(value);
                                            let texts = [(date.getMonth() + 1), date.getDate()];
                                            if (index === 0) {
                                                let temp_year = date.getYear();
                                                temp_year = temp_year < 2000 ? temp_year + 1900 : temp_year;
                                                let yy = temp_year.toString();
                                                texts.unshift(yy);
                                            }
                                            return texts.join('/');
                                        },
                                        rotate: 45
                                    },
                                    // splitNumber: 10,
                                    // minInterval: 1,
                                    maxInterval: 3600 * 48 * 1000
                                    // data: dateList
                                }],
                                yAxis: {
                                    type: 'value',
                                    min(value) {
                                        return value.min;
                                    },
                                    max(value) {
                                        return value.max + 1;
                                    }
                                },
                                series: [{
                                    name: 'HCT',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: 'rgb(255, 70, 131)'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.hctData
                                },
                                {
                                    name: 'HB',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    // sampling: 'average',
                                    itemStyle: {
                                        normal: {
                                            color: 'orange'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.hbData
                                },
                                {
                                    name: 'ALBUMIN',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: 'yellow'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.albuminData
                                },
                                {
                                    name: 'FE',
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    itemStyle: {
                                        normal: {
                                            color: '#15f605'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true
                                        }
                                    },
                                    data: self.chartData.feData
                                },
                                {
                                    name: 'EPO',
                                    type: 'bar',
                                    smooth: true,
                                    itemStyle: {
                                        normal: {
                                            color: 'blue'
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter(params) {
                                                return params.data[1];
                                            }
                                        }
                                    },
                                    barWidth: 15,
                                    data: self.chartData.epoData
                                }
                                ]
                            };

                        }
                    });

                /**
                 * checkbox 選擇器 for echarts
                 */

                self.selected = ['HCT'];
                self.exists = (item) => {
                    return self.selected.indexOf(item) > -1;
                };
                self.disabled = (item) => {
                    switch (item) {
                        case 'HCT':
                            return self.chartData.hctData.length === 0;
                        case 'HB':
                            return self.chartData.hbData.length === 0;
                        case 'ALBUMIN':
                            return self.chartData.albuminData.length === 0;
                        case 'FE':
                            return self.chartData.feData.length === 0;
                        case 'EPO':
                            return self.chartData.epoData.length === 0;
                        default:
                            return false;
                    }
                };
                self.toggle = (item) => {
                    const idx = self.selected.indexOf(item);
                    if (idx > -1) {
                        self.selected.splice(idx, 1);
                    } else {
                        self.selected.push(item);
                    }

                    self.eChartsOption.legend.selected = {
                        HCT: self.selected.indexOf('HCT') > -1,
                        HB: self.selected.indexOf('HB') > -1,
                        ALBUMIN: self.selected.indexOf('ALBUMIN') > -1,
                        FE: self.selected.indexOf('FE') > -1,
                        EPO: self.selected.indexOf('EPO') > -1
                    };
                };

                // emit lastAccessTime
                $scope.$emit('labLastAccessTime', labexamService.getLastAccessTime());
                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });
        }
    };

}

let parseData = (resData) => {
    let hctData = [];
    let hbData = [];
    let albuminData = [];
    let feData = [];
    let epoData = [];

    // dataZoom startValue
    let startDate = [];

    let groupData = {};

    // 分類
    resData.sort((a, b) => {
        return a.CheckTime < b.CheckTime ? -1 : 1;
    }).forEach((i) => {
        // 如果有填選group資料優先
        if (i.Name) {
            let name = i.Name.toLocaleUpperCase();
            // find DATA
            //  HCT CheckTimeArray, ValueArray
            if (name.search(/(\b[Hh]\.[Cc]\.[Tt]\b)|(\b[Hh][Cc][Tt]\b)|(\b[Hh][Ee][Mm][Aa][Tt][Oo][Cc][Rr][Ii][Tt]\b)/g) > -1) {
                startDate.push(new Date(i.CheckTime));
                hctData.push([new Date(i.CheckTime), i.Value]);
            } else if (name.search(/(\b[Hh]\.[Bb]\b)|(\b[Hh][Bb]\b)|(\b[Hh][Gg][Bb]\b)|(\b[Hh][Ee][Mm][Oo][Gg][Ll][Oo][Bb][Ii][Nn]\b)/g) > -1) {
                startDate.push(new Date(i.CheckTime));
                hbData.push([new Date(i.CheckTime), i.Value]);
            } else if ((name.search(/(\b[Aa]\.[Ll]\.[Bb]\.[Uu]\.[Mm]\.[Ii]\.[Nn]\b)|(\b[Aa][Ll][Bb][Uu][Mm][Ii][Nn]\b)/g) > -1) ||
                (name.search(/(\b[Aa]\.[Ll]\.[Bb]\b)|(\b[Aa][Ll][Bb]\b)/g) > -1)) {
                startDate.push(new Date(i.CheckTime));
                albuminData.push([new Date(i.CheckTime), i.Value]);
            } else if (name.search(/(\b[Ff]\.[Ee]\b)|(\b[Ff][Ee]\b)/g) > -1) {
                startDate.push(new Date(i.CheckTime));
                feData.push([new Date(i.CheckTime), i.Value]);
            } else if (name.search(/(\b[Ee]\.[Pp]\.[Oo]\b)|(\b[Ee][Pp][Oo]\b)/g) > -1) { // Erythropoietin
                startDate.push(new Date(i.CheckTime));
                epoData.push([new Date(i.CheckTime), i.Value]);
            }
        } else if (i.ProcessTime) {
            startDate.push(new Date(i.ProcessTime));
            epoData.push([new Date(i.ProcessTime), i.ActualQuantity]);
        }
    });

    groupData.startDate = startDate.sort((a, b) => a - b);
    groupData.hctData = hctData;
    groupData.hbData = hbData;
    groupData.albuminData = albuminData;
    groupData.feData = feData;
    groupData.epoData = epoData;

    return groupData;
};


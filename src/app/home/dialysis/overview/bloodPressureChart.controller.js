import echarts from 'echarts';
import './overview.html';


angular.module('app')
.controller('bloodPressureChartController', bloodPressureChartController);

bloodPressureChartController.$inject = ['$mdMedia', 'data', '$filter', '$window', '$mdDialog', 'bloodPressureChartService', 'SettingService'];
function bloodPressureChartController($mdMedia, data, $filter, $window, $mdDialog, bloodPressureChartService, SettingService) {
    let self = this;
    let $translate = $filter('translate');
    
    console.log('血壓趨勢圖 controller', data);
  
    let chartContainer;
    let myChart;
    let patientId = data.patientId;

    // 目前語系：後台送通知時，須知道使用者目前語系，傳送相對應語系內容給通知
    let currentLanguage = SettingService.getLanguage();
    // 處理完的 data 總物件
    self.allDataObj = {};

    // 透析單日期
    self.titleDate = moment(data.dialysisStartTime).format('YYYY-MM-DD');

    self.nodata = false;
    self.isError = false;

    // console.log('時間 timestamp', moment(1537931640000).format('YYYY/MM/DD HH:mm'));
    
    // 畫面長好 onInit
    angular.element(document).ready(() => {
        // 圖表自適應性
        chartContainer = document.getElementById('main-chart');
        // console.log('血壓趨勢圖 controller', chartContainer);

        // 自適應性寬高
        resizechartContainer();
        // myChart = echarts.init(document.getElementById('main-chart')); // 不可這樣寫，又另建了一個圖表物件
        // 初始化圖表
        myChart = echarts.init(chartContainer);

        // 處理資料，畫圖
        dealChartData(patientId, self.titleDate);


    });

    // chart 適應性
    let resizechartContainer = function () {
        chartContainer.style.width = ($('#blood-pressure-dialog').width() - 20) + 'px';
        // chartContainer.style.width = ($('#blood-pressure-dialog').height() - $('#toolbar').height() - 20) + 'px';
        chartContainer.style.height = ($('#blood-pressure-dialog').height() - $('#toolbar').height()) + 'px';
    };


    // 畫面大小改變時圖表重新resize
    angular.element($window).on('resize', function () {
        resizechartContainer();
        myChart.resize();
        // console.log('resize resize resize');
    });


    // 處理資料
    function dealChartData(thisPatientId, thisDialysisStartTime) {

        self.loading = true;

        bloodPressureChartService.getBloodPressureChartData(thisPatientId, thisDialysisStartTime, currentLanguage).then((q) => {
            console.log('血壓圖 原始資料 q', q);
            self.loading = false;

            let pressureOption = {};
            let slopeOption = {};
            let finalOption = {};

            let allSlope = {
                "TodayBPS": { slope: parseFloat(q.data.TodayBPS), type: 'BPS', needDraw: true },
                "MaxBPS": { slope: parseFloat(q.data.MaxBPS), type: 'BPS', needDraw: true },
                "MinBPS": { slope: parseFloat(q.data.MinBPS), type: 'BPS', needDraw: true },
                "TodayBPD": { slope: parseFloat(q.data.TodayBPD), type: 'BPD', needDraw: true },
                "MaxBPD": { slope: parseFloat(q.data.MaxBPD), type: 'BPD', needDraw: true },
                "MinBPD": { slope: parseFloat(q.data.MinBPD), type: 'BPD', needDraw: true }
            };

            // 判斷是否要顯示虛線
            self.legendSelectObj = {
                "MaxBPS": false,
                "MinBPS": false,
                "MaxBPD": false,
                "MinBPD": false
            };
            // today > Max -> show Max
            // today < Min -> show Min
            // BPS
            if (q.data.TodayBPS > q.data.MaxBPS) {
                self.legendSelectObj.MaxBPS = true;
            }
            if (q.data.TodayBPS < q.data.MinBPS) {
                self.legendSelectObj.MinBPS = true;
            }
            // BPD
            if (q.data.TodayBPD > q.data.MaxBPD) {
                self.legendSelectObj.MaxBPD = true;
            }
            if (q.data.TodayBPD < q.data.MinBPD) {
                self.legendSelectObj.MinBPD = true;
            }


            // 今天血壓資料 q.TodayVitalsignValues = [ {DialysisTime: "2018-09-26T03:14:00Z", BPS: "112", BPD: "133"}, ... ]
            if (q.data.TodayVitalsignValues.length !== 0) {
                // 處理今天血壓：得到 X軸, Y軸
                dealTodayVitalsignValues(q.data.TodayVitalsignValues);
                // 血壓 candleStick 圖
                pressureOption = getPressureOption(self.allDataObj.todayXaxisTime, self.allDataObj.todayPressureData, allSlope);
            } else {
                // 沒有血壓資料，不需畫圖
                self.nodata = true;
                return;
            }
        
            // 先確認該有的數值皆有才畫圖
            // 設定 option : slope線 與 血壓candlestick 的 option 分開設定
            slopeOption = getSlopeOptionArray(allSlope, self.allDataObj.todayXaxisTime, self.allDataObj.todayPressureData);
            finalOption = getFinalOption(pressureOption, slopeOption);
            // 畫圖
            drawChart(finalOption);

        }, (err) => {
            self.loading = false;
            self.isError = true;
            console.log('血壓圖資料 error', err);
        });

        // X軸資料
        // Y軸資料
        // 血壓資料
        // 斜率資料 -> 6組

    }


    // 資料處理：今天血壓資料，斜率資料
    function dealTodayVitalsignValues(pressureData) {

        // X軸資料：時間 array -> DialysisTime
        let timeArray = [];
        // 今天血壓 array -> 先 BPD 再 BPS [ [80, 110, 80, 110],[BPD舒張壓80, BPS收縮壓120, 舒張壓80, 收縮壓120] ... ]
        let pressureArray = [];

        // 先照時間排序
        pressureData = _.sortBy(pressureData, function (value) {
            return value.DialysisTime;
        });

        _.forEach(pressureData, function (value) {

            // 時間必須是要 timestamp X軸才可定位
            timeArray.push(moment(value.DialysisTime).valueOf()); // moment(value.DialysisTime).valueOf()

            let onePreesureArray = []; // 一組血壓資料 [X軸位置, BPD, BPS, BPD, BPS]
            onePreesureArray.push(moment(value.DialysisTime).valueOf(), value.BPD, value.BPS, value.BPD, value.BPS);
            pressureArray.push(onePreesureArray);
        });

        self.allDataObj.todayXaxisTime = timeArray;
        self.allDataObj.todayPressureData = pressureArray;

        console.log('X軸 時間 timeArray', timeArray);
        console.log('Y軸 血壓 pressureArray', pressureArray);
    }

    // 組合 option
    function getFinalOption(pressureOption, slopeOptionArray) {
        // 加入slope線的 option
        _.forEach(slopeOptionArray, function (value) {
            pressureOption.legend.data.push(value.name);
            pressureOption.color.push(value.lineStyle.normal.color);
            pressureOption.series.push(value);
        });
        return pressureOption;
    }


    // 繪製圖表
    function getPressureOption(todayXaxisTime, todayPressureData, allSlope) {

        let maxXTime = 0;
        // 如果血壓今天只有一筆，X軸最大最小值設定
        if (todayXaxisTime.length === 1) {
            // X軸 給第二點，否則X軸會全擠在一起
            maxXTime = moment(todayXaxisTime[0]).add(30, 'm').format('YYYY-MM-DD HH:30');
            self.allDataObj.todayXaxisTime.push(moment(maxXTime).valueOf()); // 為了後續畫 max min slope線
        } else {
            maxXTime = todayXaxisTime[todayXaxisTime.length - 1];
        }

        let option = {
            title: {
                // text: 'ECharts'
            },
            legend: {
                show: true,
                type: 'scroll',
                bottom: 0,
                // left: 'right',
                itemGap: 5,
                itemWidth: 20,
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 13
                },
                data: ['血壓'],
                selected: self.legendSelectObj // 控制 legend 的 關或開
            },
            color: [],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    snap: true,
                    axis: 'x',
                    label: {
                        precision: 0 // y軸精準度到小數n位
                    }
                },
                formatter: (function (params) {
                    // console.log('tooltip params', params);
                    let content = '';
                    for (let i = 0, l = params.length; i < l; i++) {

                        if (params[i].seriesName === '血壓') {
                            content += `時間 : ${moment(params[i].data[0]).format('HH:mm')}<br>${params[i].seriesName} : ${params[i].data[1]} ~ ${params[i].data[2]}<br>`;
                        } else {
                            content += `${params[i].seriesName} : ${allSlope[params[i].seriesName].slope}<br>`;
                        }
                    }
                    return content;
                })
            },
            xAxis: {
                type: 'time',
                axisTick: {
                    show: true,
                    alignWithLabel: true
                },
                axisPointer: {
                    // type: 'cross',
                    label: {
                        formatter: (function (params) {
                            // console.log('axisPointer params', params);
                            return moment(params.value).format('HH:mm');
                        })
                    }
                },
                boundaryGap: '20%',
                name: '時間',
                nameLocation: 'end',
                nameTextStyle: {
                    fontWeight: 'bold',
                    fontSize: 14,
                    padding: [0, 0, 0, -8]
                },
                axisLabel: {
                    formatter: (function (value) {
                        return moment(value).format('HH:mm');
                    }),
                    fontWeight: 'bold',
                    fontSize: 12,
                    rotate: -45
                },
                // maxInterval: 3600 * 24 * 1000,
                // min: new Date(moment(startTime).startOf('month')),
                // max: new Date(moment(startTime).endOf('month')),
                // data: countDateArray(startTime) // 月份天數
                minInterval: 24 * 3600 * 1000, // 毫秒
                interval: 3600 * 1000 * 0.5, // 每半小時一個間隔
                data: todayXaxisTime, // X軸資料：時間 array
                min: todayXaxisTime[0], // moment(todayXaxisTime[0]).subtract(30, 'm').format('YYYY-MM-DD HH:30'), // 往前一個小時當起始點
                max: maxXTime // todayXaxisTime[todayXaxisTime.length - 1] // moment(dayArray[dayArray.length - 1]).add(30, 'm').format('YYYY-MM-DD HH:30') // 往後一個小時當結束點
            },
            yAxis: {
                type: 'value',
                name: '血壓',
                nameLocation: 'end',
                nameTextStyle: {
                    fontWeight: 'bold',
                    fontSize: 14,
                    padding: [13, 0, 0, -10]
                },
                axisLabel: {
                    fontWeight: 'bold',
                    fontSize: 14
                },
                nameRotate: 0,
                min: 30,
                max: 300
                // minInterval: 50
            },
            series: [
                {
                    name: '血壓',
                    type: 'candlestick',
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            color: '#fb9b3e',
                            color0: '#fb9b3e',
                            borderColor: '#fb9b3e',
                            borderColor0: '#fb9b3e'
                        }
                    },
                    data: todayPressureData
                    // data: [
                    //     // X軸, Y軸 data
                    //     [dayData[0], 80, 110, 80, 110],
                    //     [dayData[1], 90, 110, 90, 110],
                    //     [dayData[2], 70, 120, 70, 120]
                    // ]
                    // data: [
                    //     { name: dayData[0], value: [dayData[0], 80, 110, 80, 110] },
                    //     { name: dayData[1], value: [dayData[1], 90, 110, 90, 110] },
                    //     { name: dayData[2], value: [dayData[2], 70, 120, 70, 120] }
                    // ]
                    // data: todayPressureData // 今天血壓 array
                    // data: [
                    //     [80, 110, 80, 110],
                    //     [90, 110, 90, 110],
                    //     [70, 120, 70, 120],
                    //     [80, 110, 80, 110],
                    //     [100, 120, 100, 120]
                    // ]
                    // markLine: getSlopeLineData()
                }
                // {
                //     name: 'A',
                //     type: 'line',
                //     data: [[todayXaxisTime[0], todayPressureData[0][1]], [todayXaxisTime[todayXaxisTime.length - 1], 150]],
                //     symbol: 'circle',
                //     lineStyle: {
                //         normal: {
                //             color: '#3701fe',
                //             type: 'solid',
                //             width: 5
                //         }
                //     }
                // },
                // {
                //     name: 'B',
                //     type: 'line',
                //     data: [[0, 110], [2, 180]],
                //     symbol: 'roundRect',
                //     lineStyle: {
                //         normal: {
                //             color: '#046ec8',
                //             type: 'dotted',
                //             width: 5
                //         }
                //     }
                // },
                // {
                //     name: 'C',
                //     type: 'line',
                //     data: [[0, 110], [2, 80]],
                //     symbol: 'diamond',
                //     lineStyle: {
                //         normal: {
                //             color: '#41bce6',
                //             type: 'dotted',
                //             width: 5
                //         }
                //     }
                // },
                // {
                //     name: 'D',
                //     type: 'line',
                //     data: [[0, 80], [2, 60]],
                //     symbol: 'circle',
                //     lineStyle: {
                //         normal: {
                //             color: '#37ab07',
                //             type: 'solid',
                //             width: 5
                //         }
                //     }
                // },
                // {
                //     name: 'E',
                //     type: 'line',
                //     data: [[0, 80], [2, 70]],
                //     symbol: 'roundRect',
                //     lineStyle: {
                //         normal: {
                //             color: '#69c045',
                //             type: 'dotted',
                //             width: 5
                //         }
                //     }
                // },
                // {
                //     name: 'F',
                //     type: 'line',
                //     data: [[0, 80], [2, 50]],
                //     symbol: 'diamond',
                //     lineStyle: {
                //         normal: {
                //             color: '#9bd583',
                //             type: 'dotted',
                //             width: 5
                //         }
                //     }
                // }
            ]
        };

        return option;
    }


    // 斜率 6 條線
    // TodayBPS, MaxBPS, MinBPS
    // TodayBPD, MaxBPD, MinBPD
    // 處理斜率data  [ [X1, Y1], [X2, Y2] ]
    function getSlopeOptionArray(allSlopeObj, todayXaxisTime, todayPressureData) {
        // allSlopeObj = {
        //     "TodayBPS": { slope: parseFloat(q.data.TodayBPS), type: 'BPS', needDraw: true },
        //     "MaxBPS": { slope: parseFloat(q.data.MaxBPS), type: 'BPS', needDraw: true },
        //     "MinBPS": { slope: parseFloat(q.data.MinBPS0), type: 'BPS', needDraw: true },
        //     "TodayBPD": { slope: parseFloat(q.data.TodayBPD), type: 'BPD', needDraw: true },
        //     "MaxBPD": { slope: parseFloat(q.data.MaxBPD), type: 'BPD', needDraw: true },
        //     "MinBPD": { slope: parseFloat(q.data.MinBPD), type: 'BPD', needDraw: true }
        // };

        // 先確認 Max 與 Min slope：
        // 若是 MaxBPS 與 MinBPS 值 相等，畫一條線即可(只畫 MaxBPS)
        if (allSlopeObj.MaxBPS.slope !== 0 && allSlopeObj.MinBPS.slope !== 0 && allSlopeObj.MaxBPS.slope === allSlopeObj.MinBPS.slope) {
            allSlopeObj.MinBPS.needDraw = false; // min 不畫
        }
        // 若是 MaxBPD 與 MinBPD 值 相等，畫一條線即可(只畫 MaxBPD)
        if (allSlopeObj.MaxBPD.slope !== 0 && allSlopeObj.MinBPD.slope !== 0 && allSlopeObj.MaxBPD.slope === allSlopeObj.MinBPD.slope) {
            allSlopeObj.MinBPD.needDraw = false; // min 不畫
        }

        _.forEach(allSlopeObj, function (v, k) {

                // slope 必須要再X軸有兩點的情況下才畫得出第二點的位置，才畫的出線
                // 先確認X軸有兩點以上才需畫線  needDraw: false
                if (todayXaxisTime.length > 1) {
                    // 設定 X軸
                    v.x1Point = todayXaxisTime[0];
                    v.x2Point = todayXaxisTime[todayXaxisTime.length - 1];
                } else {
                    v.x1Point = null;
                    v.x2Point = null;
                    v.needDraw = false; // X軸有兩點以上才需畫線
                }

                // 先判斷 slope 是否有值 (不等於0)
                // 且X軸有兩點以上 (前面判斷 needDraw = true 表示X軸有兩點以上)
                // 要計算slope第二點Y軸位置
                if (v.slope !== 0 && v.needDraw) {
                    let deltaTime = parseFloat((parseFloat(todayXaxisTime[todayXaxisTime.length - 1]) - parseFloat(todayXaxisTime[0])) / 60000); // timestamp毫秒 轉 分
                    let deltaY = parseFloat(v.slope) * parseFloat(deltaTime);

                    // 計算 Y2 值(斜率線第二點的 Y座標)
                    // 判斷 type 是 BPS / BPD ，取得相對應的 第一點座標
                    // Y軸 todayPressureData -> [X軸位置, BPD, BPS, BPD, BPS]
                    if (v.type === 'BPD') {
                        v.y1Point = parseFloat(todayPressureData[0][1]); // BPD
                        v.y2Point = parseFloat(deltaY) + v.y1Point;
                    } else {
                        v.y1Point = parseFloat(todayPressureData[0][2]); // BPS
                        v.y2Point = parseFloat(deltaY) + v.y1Point;
                        console.log('第二點 y: ', k, '~~', v.y2Point);
                    }
                } else {
                    v.y1Point = null;
                    v.y2Point = null;
                    v.needDraw = false; // 有slope才需要第二點座標，沒有slope也不需要畫線
                }


        });

        // 最後要 return 的 option
        let optionObjArray = [];

        let optionObj = {};
        optionObj.TodayBPS = {};
        optionObj.MaxBPS = {};
        optionObj.MinBPS = {};
        optionObj.TodayBPD = {};
        optionObj.MaxBPD = {};
        optionObj.MinBPD = {};


        if (allSlopeObj.TodayBPS.needDraw) {
            optionObj.TodayBPS = {
                name: 'TodayBPS',
                type: 'line',
                // data: [[todayXaxisTime[0], todayPressureData[0][2]], [todayXaxisTime[todayXaxisTime.length - 1], todayBPSY2]],
                data: [[allSlopeObj.TodayBPS.x1Point, allSlopeObj.TodayBPS.y1Point], [allSlopeObj.TodayBPS.x2Point, allSlopeObj.TodayBPS.y2Point]],
                symbol: 'circle',
                lineStyle: {
                    normal: {
                        color: '#fb0000',
                        type: 'solid',
                        width: 3
                    }
                }
            };
        }


        if (allSlopeObj.MaxBPS.needDraw) {
            optionObj.MaxBPS = {
                name: 'MaxBPS',
                type: 'line',
                data: [[allSlopeObj.MaxBPS.x1Point, allSlopeObj.MaxBPS.y1Point], [allSlopeObj.MaxBPS.x2Point, allSlopeObj.MaxBPS.y2Point]],
                symbol: 'circle',
                lineStyle: {
                    normal: {
                        color: '#fc5959',
                        type: 'dotted',
                        width: 3
                    }
                }
            };
        }


        if (allSlopeObj.MinBPS.needDraw) {
            optionObj.MinBPS = {
                name: 'MinBPS',
                type: 'line',
                data: [[allSlopeObj.MinBPS.x1Point, allSlopeObj.MinBPS.y1Point], [allSlopeObj.MinBPS.x2Point, allSlopeObj.MinBPS.y2Point]],
                symbol: 'circle',
                lineStyle: {
                    normal: {
                        color: '#fea8b2',
                        type: 'dotted',
                        width: 3
                    }
                }
            };
        }

        if (allSlopeObj.TodayBPD.needDraw) {
            optionObj.TodayBPD = {
                name: 'TodayBPD',
                type: 'line',
                data: [[allSlopeObj.TodayBPD.x1Point, allSlopeObj.TodayBPD.y1Point], [allSlopeObj.TodayBPD.x2Point, allSlopeObj.TodayBPD.y2Point]],
                symbol: 'diamond',
                lineStyle: {
                    normal: {
                        color: '#0869c3',
                        type: 'solid',
                        width: 3
                    }
                }
            };
        }


        if (allSlopeObj.MaxBPD.needDraw) {
            optionObj.MaxBPD = {
                name: 'MaxBPD',
                type: 'line',
                data: [[allSlopeObj.MaxBPD.x1Point, allSlopeObj.MaxBPD.y1Point], [allSlopeObj.MaxBPD.x2Point, allSlopeObj.MaxBPD.y2Point]],
                symbol: 'diamond',
                lineStyle: {
                    normal: {
                        color: '#03a1e9',
                        type: 'dotted',
                        width: 3
                    }
                }
            };
        }


        if (allSlopeObj.MinBPD.needDraw) {
            optionObj.MinBPD = {
                name: 'MinBPD',
                type: 'line',
                data: [[allSlopeObj.MinBPD.x1Point, allSlopeObj.MinBPD.y1Point], [allSlopeObj.MinBPD.x2Point, allSlopeObj.MinBPD.y2Point]],
                symbol: 'diamond',
                lineStyle: {
                    normal: {
                        color: '#80d4ff',
                        type: 'dotted',
                        width: 3
                    }
                }
            };
        }

        // optionObj.g = {
        //     name: 'G',
        //     type: 'line',
        //     data: [[todayXaxisTime[0], todayPressureData[0][1]], [todayXaxisTime[todayXaxisTime.length - 1], 180]],
        //     symbol: 'circle',
        //     lineStyle: {
        //         normal: {
        //             color: 'red',
        //             type: 'solid',
        //             width: 3
        //         }
        //     }
        // };


        // 要判斷誰不需要畫線，物件為空者表示不需要畫線
        _.forEach(optionObj, function (value) {
            if (Object.getOwnPropertyNames(value).length > 0) {
                optionObjArray.push(value);
            }
        });
        // optionObjArray.push(TodayBPS, MaxBPS, MinBPS, TodayBPD, MaxBPD, MinBPD);

        return optionObjArray;
    }

    // 畫圖
    function drawChart(option) {
        myChart.setOption(option);
    }


    // 計算月份天數
    function countDateArray(date) {
        console.log('取得當月 date', date);
        let dateArray = [];
        let howManyDays = moment(date, 'YYYY-MM').daysInMonth();

        for (let i = 0; i < howManyDays; i++) {
            dateArray.push(i + 1);
        }
        console.log('本月有幾天 howManyDays', moment(date).format('YYYY-MM-DD'), howManyDays);

        return dateArray;
    }


    self.cancel = function () {
        $mdDialog.cancel();
    };


}


/*
    // 畫出斜率
    function getSlopeLineData() {
        let markLineOpt = {
            animation: false,
            label: {
                normal: {
                    formatter: 'A',
                    textStyle: {
                        align: 'right'
                    }
                }
            },
            lineStyle: {
                normal: {
                    type: 'solid',
                    color: 'black'
                }
            },
            tooltip: {
                formatter: 'A'
            },
            data: [[{
                coord: [0, 110],
                symbol: 'circle'
            }, {
                coord: [4, 120],
                symbol: 'circle'
            }]]
        };

        return markLineOpt;

    }



    // let slope = parseFloat(allSlopeObj.TodayBPS);
        // let deltaTime = parseFloat((parseFloat(todayXaxisTime[todayXaxisTime.length - 1]) - parseFloat(todayXaxisTime[0])) / 1000); // timestamp毫秒 轉 秒
        // let deltaY = parseFloat(slope) * parseFloat(deltaTime);
        // let todayBPSY2 = parseFloat(deltaY) + parseFloat(todayPressureData[0][2]);
        // console.log('第二點 slope', slope);
        // console.log('第二點 deltaTime', deltaTime);
        // console.log('第二點 deltaY', deltaY);
        // console.log('第二點 todayBPSY2', todayBPSY2);
        // console.log('第二點 Y1', todayPressureData[0][2]);


 */
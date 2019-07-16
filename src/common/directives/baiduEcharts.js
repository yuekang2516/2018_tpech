// import echarts from 'echarts';

/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/9/20
 * 功能說明: 百度 echarts
 * 參考文檔: http://echarts.baidu.com/tutorial.html
 * 參考版本: echarts 3.0
 * data loading 完成後 才能畫 svg， config.dataLoaded 一定要加
 *****************************************/

angular.module('app')
    .directive('baiduEcharts', ['$window', '$timeout', '$filter', function ($window, $timeout, $filter) {
        return {
            link(scope, element, attrs) {
                let $translate = $filter('translate');
                let chart = null;
                let mainContainer = element[0];

                function refreshChart() {
                    // 佈景主題
                    let theme = (scope.config && scope.config.theme)
                        ? scope.config.theme : 'default';

                    let resizeMainContainer = function () {
                        mainContainer.style.width = ($window.innerWidth - 10) + 'px';
                        mainContainer.style.height = ($window.innerHeight * 0.5) + 'px';
                    };
                    resizeMainContainer();

                    chart = echarts.init(mainContainer, theme);
                    chart.showLoading();

                    // 資料 loading 中， 繪製 loading ....
                    if (scope.config && scope.config.dataLoaded === false) {
                        chart.showLoading();
                    }
                    // 資料 loading 結束
                    if (scope.config && scope.config.dataLoaded) {
                        let dataSize = 0;
                        // 檢查內容是否有資料，搭配前端 checkbox
                        for (let select in scope.option.legend.selected) {
                            dataSize += scope.option.series.find(x => x.name === select).data.length;
                        }
                        // 如果通通都沒資料，就在前端帶入No data
                        if (dataSize === 0) {
                            // 有資料時才顯示 title
                            scope.option.title = {
                                show: true,
                                textStyle: {
                                    color: '#bcbcbc'
                                },
                                text: $translate('baiduEcharts.noData'), // 'No Data',
                                left: 'center',
                                top: 'center'
                            };
                        } else {
                            // 有資料時不顯示title，若沒關掉 No Data 會一直顯示
                            scope.option.title = {
                                show: false
                            };
                        }
                        chart.setOption(scope.option);
                        chart.resize();
                        chart.hideLoading();
                    }

                    // resize dom
                    $(window).on('resize', function () {
                        resizeMainContainer();
                        chart.resize();
                    });

                    // event
                    if (scope.config && scope.config.event) {
                        if (angular.isArray(scope.config.event)) {
                            angular.forEach(scope.config.event, function (value, key) {
                                for (let e in value) {
                                    chart.on(e, value[e]);
                                }
                            });
                        }
                    }
                }


                // -- config
                // event
                // theme
                // dataLoaded
                scope.$watch(
                    function () {
                        return scope.config;
                    },
                    function (value) {
                        if (value) {
                            refreshChart();
                        }
                    },
                    true
                );

                // option
                scope.$watch(
                    function () {
                        return scope.option;
                    },
                    function (value) {
                        if (value) {
                            refreshChart();
                        }
                    },
                    true
                );
            },
            scope: {
                option: '=ngOption',
                config: '=ngConfig'
            },
            restrict: 'EA'
        };
    }]);

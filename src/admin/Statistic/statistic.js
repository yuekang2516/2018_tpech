import tpl from './statistic.html';

angular.module('app').component('statistic', {
  template: tpl,
  controller: SystemStatisticCtrl,
  controllerAs: 'vm'
});

SystemStatisticCtrl.$inject = ['$mdSidenav', '$timeout', 'statisticService', 'showMessage', '$filter'];
function SystemStatisticCtrl($mdSidenav, $timeout, statisticService, showMessage, $filter) {
  const vm = this;
  let $translate = $filter('translate');

  // 有可能是手機點進來的, 所以要把左側選單收起來
  // 如果是寬畫面點進來的, 關起來無所謂, 畫面上還是會存在
  $mdSidenav('left').close();
  vm.openLeftMenu = function openLeftMenu() {
    $mdSidenav('left').toggle();
  };

  let timeoutPromise;
  vm.loading = true;

  vm.statisticStartDate = new Date(moment().add(-14, 'days').format('YYYY-MM-DD'));
  vm.statisticEndDate = new Date();

  // 在改變日期一秒後重新載入圖表
  vm.changeDate = function changeDate() {
    vm.loading = true;
    // 清空圖表
    if (vm.myChart) vm.myChart.destroy();
    $timeout.cancel(timeoutPromise);
    timeoutPromise = $timeout(() => {
      vm.$onInit();
    }, 1000);
  };

  vm.$onInit = function onInit() {
    // 呼叫取得圖表資料的service
    statisticService.get(vm.statisticStartDate, vm.statisticEndDate).then((resp) => {
      vm.statistic = resp.data;

      const categories = [];
      const data = [];

      _.forEach(resp.data, (value) => {
        categories.push(value.Day);
        data.push(value.Total);
      });

      // 將資料填表的區域
      const ctx = document.getElementById('myChart');
      vm.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categories,

          datasets: [{
            label: $translate('statistic.label'), // '血液透析紀錄單筆數'
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      vm.loading = false;
      vm.isError = false; // 顯示伺服器連接失敗的訊息
    }, () => {
      vm.loading = false;
      vm.isError = true;
      showMessage($translate('customMessage.serverError')); // lang.ComServerError
    });

      // vm.myChart.resize();

    };
}

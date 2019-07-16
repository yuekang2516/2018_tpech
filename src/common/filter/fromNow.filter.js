// 計算距離到現在的時間
angular
        .module('app')
        .filter('fromnow', () => date => moment(date).fromNow());

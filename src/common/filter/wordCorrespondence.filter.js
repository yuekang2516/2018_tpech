angular.module('app')
    .filter('otherKey', () => function other(value) { // 轉換其他
        return /other/i.test(value) ? '其他' : value;
    });

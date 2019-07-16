angular.module('app')
    .filter('dialysisStatus', ['$sce', function ($sce) {
        return function (lastInfo) {
            // console.log('dialysisInfo filter', lastInfo);
            // 判斷 lastInfo 的日期是否為今日
            if (lastInfo && moment(lastInfo.StartTime).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                switch (lastInfo.Status) {
                    case 0:
                    case 'OPEN':
                        return '手動開表完成';
                    case 1:
                    case 'OPEN_HAVEWEIGHT':
                        return '量完洗前體重';
                    case 2:
                    case 'DIALYSIS':
                        if (lastInfo.EstimatedEndTime) {
                            // 若過期則紅底白字，否則為紅字
                            if (moment(lastInfo.EstimatedEndTime).format('YYYYMMDDHHmm') < moment().format('YYYYMMDDHHmm')) {
                                return $sce.trustAsHtml('<span style="padding: 3px; border-radius:4px; background-color: red; color: white">' + moment(lastInfo.EstimatedEndTime).format('HH:mm') + ' 結束' + '</span>');
                            }
                            return $sce.trustAsHtml('<span style="padding: 3px; color: red">' + moment(lastInfo.EstimatedEndTime).format('HH:mm') + ' 結束' + '</span>');
                        }
                        return $sce.trustAsHtml('<span style="padding: 3px; color: red">透析中</span>');
                    case 3:
                    case 'END_HAVEWEIGHT':
                        return '量完洗後體重';
                    case 4:
                    case 'CLOSED':
                        return '關表(透析完成)';
                    default:
                        return '';
                }
            }

            return '';
        };
    }]);

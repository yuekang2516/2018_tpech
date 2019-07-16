// 表單共用的功能
angular.module('app').factory('summaryReportService', summaryReportService);

summaryReportService.$inject = ['$http', '$q', '$filter', 'SettingService', 'dialysisService'];
function summaryReportService($http, $q, $filter, SettingService, dialysisService) {
    const rest = {
        isCRRTMode,
        getCommonSummaryData
    };

    const $translate = $filter('translate');

    // 組成其他表單需要用的通用資料
    function getCommonSummaryData(patientId, headerId, isForce = true) {
        const defered = $q.defer();

        dialysisService.getByHeaderId(patientId, headerId, isForce).then((res) => {
            defered.resolve(prepareFormData(res.data));
        }).catch((err) => {
            defered.reject(err);
        });

        return defered.promise;
    }

    function isCRRTMode(mode) {
        // 符合 CRRT 模式的條件
        // if (mode && mode.match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/i)) {
        //     return true;
        // }

        return false;
    }

    // 傳入 DialysisRecord 組出 deviation, catheter
    function prepareFormData(dialysisRecord) {
        const formData = {
            data: dialysisRecord,
            catheter: {},
            deviation: ''
        };

        // 護理紀錄依時間正序排
        dialysisRecord.NursingRecord = _.orderBy(
            dialysisRecord.NursingRecord, ["NursingTime"], ["asc"]
        );

        // 血管通路
        // 單位
        formData.catheter.unit = $translate("summary.component.unitTimes");
        if (dialysisRecord.DialysisHeader.VesselAssessments.length > 0) {
            if (
                dialysisRecord.DialysisHeader.VesselAssessments[0].Data &&
                (dialysisRecord.DialysisHeader.VesselAssessments[0].Data
                    .CatheterType === "Permanent" ||
                    dialysisRecord.DialysisHeader.VesselAssessments[0].Data
                        .CatheterType === "DoubleLumen")
            ) {
                formData.catheter.unit = $translate("summary.component.unitCC");
            }
        }
        // 管路名稱替換
        if (
            dialysisRecord.DialysisHeader.VesselAssessments.length > 0 &&
            dialysisRecord.DialysisHeader.VesselAssessments[0].Data &&
            dialysisRecord.DialysisHeader.VesselAssessments[0].Data
                .CatheterType != null
        ) {
            switch (
                dialysisRecord.DialysisHeader.VesselAssessments[0].Data
                .CatheterType
            ) {
                case "AVFistula":
                formData.catheter.typeName = $translate(
                        "summary.component.AVFistula"
                    );
                    break;
                case "AVGraft":
                formData.catheter.typeName = $translate(
                        "summary.component.AVGraft"
                    );
                    break;
                case "Permanent":
                formData.catheter.typeName = $translate(
                        "summary.component.Permanent"
                    );
                    break;
                case "DoubleLumen":
                formData.catheter.typeName = $translate(
                        "summary.component.DoubleLumen"
                    );
                    break;
                default:
                formData.catheter.typeName = $translate(
                        "summary.component.unknownType"
                    );
                    break;
            }
        }

        // 計算偏差 => 理想體重有沒有大於透析前體重
        if (dialysisRecord.DialysisHeader) {
            // 確認透析前後真的有值
            if (
                _.isNumber(dialysisRecord.DialysisHeader.PredialysisWeight) &&
                _.isNumber(dialysisRecord.DialysisHeader.WeightAfterDialysis)
            ) {
                // 透析前體重 - 透析後體重 or 透析後體重 - 透析前體重 取絕對值
                if (
                    _.isNumber(dialysisRecord.DialysisHeader.StandardWeight)
                ) {
                    formData.deviation = Math.abs(
                        dialysisRecord.DialysisHeader.PredialysisWeight -
                        dialysisRecord.DialysisHeader.WeightAfterDialysis
                    ).toFixed(2);
                } else if (
                    dialysisRecord.DialysisHeader.Dehydration !== null &&
                    dialysisRecord.DialysisHeader.DehydrationTarget !== null
                ) {
                    formData.deviation = (
                        dialysisRecord.DialysisHeader.Dehydration -
                        dialysisRecord.DialysisHeader.DehydrationTarget
                    ).toFixed(2);
                }
            }
        }
        return formData;
    }

    return rest;
}

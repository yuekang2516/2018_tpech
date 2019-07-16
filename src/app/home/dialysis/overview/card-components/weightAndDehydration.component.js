import tpl from './weightAndDehydration.html';

angular.module('app').component('weightAndDehydration', {
    template: tpl,
    controller: WeightAndDehydrationController,
    bindings: {
        data: '=',
        prescriptionLength: '<',
        lastEstimatedDehydration: '<' // 供判斷預估脫水量量是否與設定脫水量相同，以決定是否要幫忙自動算設定脫水量
    }
});

WeightAndDehydrationController.$inject = ['dialysisService'];
function WeightAndDehydrationController(dialysisService) {
    let self = this;

    self.$onInit = function () {

        // 組報到日期時間
        if (self.data.CheckInTime) {
            self.data.CheckInTime = new Date(moment(self.data.CheckInTime).format('YYYY-MM-DD HH:mm'));
        }

        self.countWeightAndDehydration();
    };

    // 計算體重與脫水量欄位相關: 透析前總重 or 輪椅重量 or 衣物重量 值變化時應做的運算
    self.countWeightAndDehydration = function () {

        // 避免臨時處方 TotalWeightPredialysis 欄位清空時造成目標脫水量變動
        // 透析前體重 = 透析前總重 - 輪椅重量 - 衣物重量
        if (self.data && self.data.TotalWeightPredialysis) {
            // 已限制 input 只能輸入至小數點第二位，但js精確度的問題，某些情況下會出現 .49999...，因此運算結果仍需取小數點兩位
            self.data.PredialysisWeight = Number((self.data.TotalWeightPredialysis -
                Number(self.data.WheelchairWeight) - Number(self.data.NoClothingWeight)).toFixed(2));

            // 與上次透析前體重比較，若差超過 7% 則顯示警告
            console.log('weight diff!!');
            if (self.data.LastPredialysisWeight && (Math.abs(self.data.PredialysisWeight - self.data.LastPredialysisWeight) / (self.data.LastPredialysisWeight)) * 100 > 7) {
                self.showWeightDiffWarning = true;
            } else {
                self.showWeightDiffWarning = false;
            }

            if (self.prescriptionLength > 0) {
                // 若處方為臨時，沒有理想體重，直接依臨時透析處方的目標脫水量為準
                if (self.data.Prescription.Type === 'LongTerm') {
                    // 目標脫水量 = 透析前總重 - 理想體重 - 輪椅重量 - 衣物重量
                    countDehydrationTarget();
                }

                // 預估脫水量(L) = 目標脫水量 + 食物重量 + 輸注量
                countEstimatedDehydration();
            }

            // 若已有透析後體重，若輪椅或衣物重量改變，結束體重與實際脫水量需要更新
            if (self.data.WeightAfterDialysis) {
                countWeightAfterDialysis();
                countDehydration();
                if (self.data.Dehydration != null) {
                    self.countDeviation();
                }
            }
        } else {
            if (self.data.WeightAfterDialysis) {
                countWeightAfterDialysis();
            }
            self.showWeightDiffWarning = false;
            self.data.PredialysisWeight = null;
            // 臨時處方目標脫水量不動
            if (self.data.Prescription != null && self.data.Prescription.Type === 'LongTerm') {
                self.data.DehydrationTarget = null;
                self.data.EstimatedDehydration = null;
                self.data.DehydrationSetting = null;
                self.data.Dehydration = null;
            } else {
                self.data.EstimatedDehydration = self.data.DehydrationTarget;
                self.data.DehydrationSetting = self.data.DehydrationTarget;
            }
        }
    };

    // 目標脫水量 = 透析前總重 - 理想體重 - 輪椅重量 - 衣物重量
    function countDehydrationTarget() {
        self.data.DehydrationTarget = Number((self.data.TotalWeightPredialysis - Number(self.data.Prescription.StandardWeight) -
            Number(self.data.WheelchairWeight) - Number(self.data.NoClothingWeight)).toFixed(2));
    }

    // 預估脫水量(L) = 目標脫水量 + 食物重量 + 輸注量
    function countEstimatedDehydration() {
        self.data.EstimatedDehydration = Number((self.data.DehydrationTarget + Number(self.data.FoodWeight) + Number(self.data.Flush)).toFixed(2));

        // 若預估脫水量與設定脫水量相同或設定脫水量尚未設定，則自動幫忙計算設定脫水量
        if (self.lastEstimatedDehydration === self.data.DehydrationSetting || self.data.DehydrationSetting === null) {
            self.data.DehydrationSetting = self.data.EstimatedDehydration;
            if (self.data.Dehydration != null) {
                self.countDeviation();
            }

        }
        self.lastEstimatedDehydration = self.data.EstimatedDehydration;
    }

    // 結束體重(Kg) = 結束總重 - 輪椅重量 - 衣物重量
    function countWeightAfterDialysis() {
        self.data.WeightAfterDialysis = Number((self.data.TotalWeightAfterDialysis - Number(self.data.WheelchairWeight) - Number(self.data.NoClothingWeight)).toFixed(2));
    }

    // 實際脫水量 = 透析前體重 - 結束體重
    function countDehydration() {
        self.data.Dehydration = Number((self.data.PredialysisWeight - self.data.WeightAfterDialysis).toFixed(2));
    }

    // 偏差 = 實際脫水量 Dehydration - 設定脫水量 DehydrationSetting
    self.countDeviation = function countDeviation() {
        if (self.data.Dehydration != null && self.data.DehydrationSetting != null) {
            self.data.Deviation = Number((self.data.Dehydration - self.data.DehydrationSetting).toFixed(2));
        }
    };

    // 食物重量 / 輸注量值變化時，應做的運算
    self.estimatedDehydration = function () {
        // 預估脫水量(L) = 目標脫水量 + 食物重量 + 輸注量
        if (self.data && self.data.TotalWeightPredialysis) {
            countEstimatedDehydration();
        }
    };

    // 結束總重值變化時，應做的運算
    self.weightAfterDialysis = function weightAfterDialysis() {
        if (self.data && self.data.TotalWeightAfterDialysis) {
            countWeightAfterDialysis();

            // 實際脫水量 = 透析前體重 - 結束體重
            if (self.data.TotalWeightPredialysis) {
                countDehydration();
                if (self.data.Dehydration != null) {
                    self.countDeviation();
                }
            }
        } else {
            self.data.WeightAfterDialysis = null;
            self.data.Dehydration = null;
            self.data.Deviation = null;
        }
    };

}


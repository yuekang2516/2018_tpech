/* global $*/
/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/4/26
 * 功能說明: 病人基本資料驗證
 * 傳入值: object {欄位名,病人Id,原始資料}
 * 回傳值: function callback 身分證回傳直
 * 參考文檔:
 * 版本: 0.1
 *****************************************/
import chineseId from '../validId/chinaIDValid';
import taiwanId from '../validId/taiwanIDValid';
import hongKongId from '../validId/hongKongIDValid';

angular
    .module('app')
    .directive('patientValidator', ['PatientService', '$timeout', '$q', (PatientService, $timeout, $q) => ({
        restrict: 'EA',
        require: 'ngModel',
        scope: {
            formValidator: '=?',
            ngModel: '=ngModel',
            callback: '&?'
        },
        link($scope, $element, $attrs, ngModel) {
            $timeout(() => {
                $element.bind('change', (event) => {
                    vaild(event);
                });
                $element.bind('paste', (event) => {
                    vaild(event);
                });
            }, 0);

            let vaild = (event) => {
                // 檢查 formValidator 設定是否有錯
                if (!Object.prototype.hasOwnProperty.call($scope.formValidator, 'PatientId') &&
                    !Object.prototype.hasOwnProperty.call($scope.formValidator, 'Field')) {
                    return;
                }

                const patientId = $scope.formValidator.PatientId;
                const field = $scope.formValidator.Field;
                const identity = $scope.formValidator.Identity;
                let peoplevailed;
                let id;
                if (field === 'IdentifierId' && $scope.formValidator.Id) {
                    id = $scope.formValidator.Id;
                }

                const oViewModel = {
                    PatientId: patientId,
                    Field: field,
                    Value: event.currentTarget.value
                };

                // 如果沒有變動就不檢查
                // 20170728 Andy: 加入或空值的檢查
                if (id === event.currentTarget.value || !event.currentTarget.value.trim()) {
                    ngModel.$setValidity('required', true);
                    ngModel.$setValidity('existed', true);
                    return;
                } else {
                    if (identity === 'IDNumber') {
                        let chinese = new chineseId();
                        let taiwenese = new taiwanId();
                        let hongKong = new hongKongId();
                        let vaildchinese, vaildtaiwenese, vaildhongKong;

                        vaildchinese = chinese.validate(event.currentTarget.value.trim());
                        vaildtaiwenese = taiwenese.validate(event.currentTarget.value.trim());
                        vaildhongKong = hongKong.validate(event.currentTarget.value.trim());

                        ngModel.$setValidity('idrule', true);

                        if (vaildchinese.success) {
                            peoplevailed = vaildchinese;
                        } else if (vaildtaiwenese.success) {
                            peoplevailed = vaildtaiwenese;
                        } else if (vaildhongKong.success) {
                            peoplevailed = vaildhongKong;
                        } else {
                            ngModel.$setValidity('idrule', false);
                        }

                        if (typeof $scope.callback === 'function') {
                            $scope.callback({
                                vailed: peoplevailed
                            });
                        }
                    }

                    switch (field) {
                        case 'IdentifierId': // 身分證
                        case 'rfid':
                        case 'barcode':
                            PatientService.getByField(oViewModel).then((res) => {
                                if (res.status === 200) {
                                    if (field === 'IdentifierId') {
                                        ngModel.$setValidity('existed', !res.data);
                                    }
                                    if (typeof $scope.callback === 'function' && res.data) {
                                        $scope.callback({
                                            vailed: res.data,
                                            field
                                        });
                                    }
                                    // $('#' + field).select();
                                    ngModel.$render();
                                } else {
                                    ngModel.$setValidity('existed', true);
                                }
                            });
                            break;
                        default:
                            PatientService.postDuplicate(oViewModel).then((res) => {
                                if (res.status === 200) {
                                    ngModel.$setValidity('existed', !res.data);
                                }
                            });
                            break;
                    }
                }
                // 防止驗證 API沒跑完就提交出去了， submit 時會先跑這一段
                if (event.which === 13 || event.type === 'change') {
                    event.preventDefault();
                    $timeout(() => {
                        $scope.$apply(() => {
                            // 之前寫時忘記帶event
                            $scope.$eval($attrs.patientValidator, {$event: event});
                        });
                    }, 100);
                }
            };
        }
    })]);

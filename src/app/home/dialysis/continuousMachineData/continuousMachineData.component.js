import tpl from './continuousMachineData.html';
import './continuousMachineData.less';
import toastTpl from '../../../../common/directives/restartBle-toast.html';

// Pi
import piSettingDialog from './raspberryPiSettingDialog.html';
import './raspberryPiSetting.less';

angular.module('app').component('continuousMachineData', {
    template: tpl,
    controller: continuousMachineDataCtrl,
    bindings: {
        isCard: '<'
    }
});

continuousMachineDataCtrl.$inject = ['$q', '$scope', '$mdToast', '$compile', '$state', 'SettingService', 'machineDataService', 'bleService', 'raspberryPiService', 'PatientService', 'OverViewService', '$stateParams', '$mdDialog', 'showMessage', '$timeout', 'nfcService', '$filter'];

function continuousMachineDataCtrl($q, $scope, $mdToast, $compile, $state, SettingService, machineDataService, bleService, raspberryPiService, PatientService, OverViewService, $stateParams, $mdDialog, showMessage, $timeout, nfcService, $filter) {

    const self = this;
    const patientId = $stateParams.patientId;
    const currentUserInfo = SettingService.getCurrentUser();
    let $translate = $filter('translate');

    self.serviceData = null;
    self.loading = true;
    self.lastAccessTime = moment();
    let [isCRRT, isHDF] = [false, false]; // 決定是否要顯示應顯示的欄位

    // 綁於日期 input / bar chart 下方顯示日期及筆數
    function setCurrentDate(date) {
        self.currentDate = date;
        self.displayDate = moment(date).format('YYYY-MM-DD');
    }
    self.totalCount = 0;

    // ble / pi 相關
    let defaultFrequency = 1;  // 連續型預設為 1 分鐘

    self.pi = {
        frequency: defaultFrequency
    };
    self.serviceData = [];

    let oriPatient = null; // original patient
    self.$onInit = function onInit() {
        // 若非在 summary 頁取消所有 nfc 功能
        // if (!self.isCard) {
        //     nfcService.stop();
        // }

        self.loading = true;

        // get 表單日期
        OverViewService.getByHeaderId($stateParams.headerId).then((res) => {
            if (res.data) {
                // 設置日期可以查詢的限制，最小為開表日，最大為今日
                self.minValidDate = moment(res.data.CreatedTime).format('YYYY-MM-DD');
                self.maxValidDate = moment().format('YYYY-MM-DD');
                setCurrentDate(new Date(res.data.CreatedTime));
                checkDisableChangeDate();

                // 確認是否需要顯示傳輸盒設定頁面
                // 若表單處方模式為 CRRT 或 若為 24 小時內的表單且未關表才須 show 連續型功能，避免發生啟動到非今日的表單
                // let prescriptionMode = res.data.Prescription ? res.data.Prescription.Mode.Name : '';
                // if ((isCRRTMode(prescriptionMode) || moment().diff(moment(res.data.CreatedTime), 'hours') < 24) && !res.data.EndTime) {
                //     self.canContinuous = true;
                // }

                // check whether ble is enabled or not.
                // if (self.canContinuous) {
                //     switch (cordova.platformId) {
                //         case 'android':
                //             bleService.isEnabled().then(() => {
                //                 // do nothing
                //             }).catch(() => {
                //                 // enable
                //                 bleService.enableWithoutAlert((err) => {
                //                     /*
                //                         若藍牙已開啟會回：
                //                             error:"disable"
                //                             message:"Bluetooth not disabled"
                //                     */
                //                     if (err.message.toLowerCase() !== 'bluetooth not disabled') {
                //                         showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                //                     }
                //                 });
                //             });

                //             // 由於不需 scan 了，也不需要確認定位是否有開，因此註解掉
                //             // bleService.checkLocationPermissionAndExecute();
                //             break;
                //         case 'ios':
                //             bleService.isEnabled(() => {
                //                 // self.scanPi();
                //             }, () => {
                //                 showMessage($translate('machineData.machineDataDetail.component.bluetoothOff'));
                //             });
                //             break;
                //         default:
                //             break;
                //     }
                // }

                getChart();
                // 取得病人資料, 顯示於畫面上方標題列及綁定樹苺派用
                getPatientInfo();
            }
        }, () => {
            self.loading = false;
            self.isError = true; // 顯示伺服器連接失敗的訊息
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    function registerScanAndNfcEvent() {
        // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
        nfcService.listenTag(_readNDEF);
        nfcService.listenNdef(_readNDEF);

        // for scan barcode to pair
        document.addEventListener('volumeupbutton', scanBarCode);
        document.addEventListener('volumedownbutton', scanBarCode);
    }

    function unRegisterScanAndNfcEvent() {
        if (!self.isCard) {
            nfcService.stop();
        } else {
            nfcService.listenTag(PatientService.searchPatientOrGetMachineData);
            nfcService.listenNdef(PatientService.searchPatientOrGetMachineData);
        }

        document.removeEventListener('volumeupbutton', scanBarCode);
        document.removeEventListener('volumedownbutton', scanBarCode);
    }

    function setLastBleActionCallback(callback = null, mac = '') {
        lastBleActionCallback = callback;
        lastMac = mac || lastMac;
        console.log('setLastBleActionCallback', lastBleActionCallback, lastMac);
    }

    function bindAndStart() {
        setStartOrStop().then(() => {
            // 成功的話將設定頁重開
            // 若 setting 對話框未顯示，則不需再作下面的動作
            if (document.querySelector('.pi')) {
                $mdDialog.hide();
            }

            $mdDialog.show({
                controller: piSettingDialogController,
                controllerAs: '$ctrl',
                template: piSettingDialog,
                locals: {
                    data: self.pi
                },
                parent: angular.element(document.querySelector('.cont-machine-data-container')),
                // parent: angular.element(document.body),
                clickOutsideToClose: true
            }).then(() => {
                unRegisterScanAndNfcEvent();
            }, () => {
                unRegisterScanAndNfcEvent();
            });
        });
    }

    // nfcService 回傳物件 {Id:'', Data:'...'}
    let lastMac = '';   // for 重試藍牙連線時使用
    let lastBleActionCallback = null; // for 重試藍牙連線時使用
    function _readNDEF(ndef) {
        console.log('_readNDEF');

        // 確認卡片內容是否為合法的
        if (!ndef.Data) {
            showMessage($translate('machineData.machineDataDetail.component.invalidCard'));
            return;
        }
        if (!ndef.Data.includes('B827EB')) {
            // showMessage(`儀器卡片內容有誤 -> ${ndef.Data}`);
            showMessage($translate('machineData.machineDataDetail.component.cardError', { data: ndef.Data }));
            return;
        }

        // 直接開始
        setLastBleActionCallback(bindAndStart, ndef.Data);
        bindAndStart();
    }

    // scan barcode
    function scanBarCode() {
        console.log('scanBarCode() in continuousMachineData component');
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    if (!result.text.includes('B827EB') || result.text.length !== 12) {
                        // showMessage('條碼內容有誤 -> ' + result.text);
                        showMessage($translate('machineData.machineDataDetail.component.barCodeError', { errText: result.text }));
                        return;
                    }

                    setLastBleActionCallback(bindAndStart, result.text.split('**')[0]);
                    bindAndStart();
                }
            },
            function (error) {
                alert('Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('machineData.machineDataDetail.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    }

    // 取得病人資料, 顯示於畫面上方標題列及綁定樹苺派用
    function getPatientInfo() {
        PatientService.getById(patientId, true).then((res) => {
            // console.log('Patient', res.data);
            // if (res.data.RaspberryPiSetting && res.data.RaspberryPiSetting.RaspberryPiId) {
            //     res.data.RaspberryPiSetting.RaspberryPiId = res.data.RaspberryPiSetting.RaspberryPiId.replace(/:/g, '');
            // }
            oriPatient = res.data;

            console.log('cont patient', oriPatient);
            self.patient = angular.copy(oriPatient);
            // 若為可以連結樹莓派的裝置無綁定也 show 設定頁，若尚未綁定按鈕名稱則改為掃描或靠卡
            // 該病人可能留有上次解除綁定前的頻率
            // if (self.patient.RaspberryPiSetting && self.patient.RaspberryPiSetting.Frequency) {
            //     self.pi.frequency = (parseInt(self.patient.RaspberryPiSetting.Frequency) / 60) || defaultFrequency; // 秒 -> 分
            // }
            // if (self.patient.RaspberryPiSetting.RaspberryPiId) {
            //     self.pi.isPiBind = true;
            //     self.pi.meter = self.patient.RaspberryPiSetting.Meter;
            //     self.pi.raspberryPiId = self.patient.RaspberryPiSetting.RaspberryPiId;
            //     // 根據 Pi Status 判斷相關 flag
            //     if (self.patient.RaspberryPiSetting.Status) {
            //         switch (self.patient.RaspberryPiSetting.Status.toUpperCase()) {
            //             case 'START':
            //                 // 需再多判斷目前 Pi 正在傳在哪個表單，若不同則仍維持 stop 的 icon
            //                 if (self.patient.RaspberryPiSetting.DialysisId && self.patient.RaspberryPiSetting.DialysisId !== $stateParams.headerId) {
            //                     self.pi.isSetContinuous = false;
            //                 } else {
            //                     self.pi.isSetContinuous = true;
            //                 }
            //                 break;
            //             case 'STOP':
            //                 self.pi.isSetContinuous = false;
            //                 break;
            //             default:
            //                 break;
            //         }
            //     }
            // } else if (self.canContinuous && cordova.platformId !== 'browser' && $state.current.name === 'continuousMachineData') {
            //     // 於 summary card view 中不需一開始顯示提示
            //     self.raspberryPiSettingDialog();
            // }
        }, (err) => {
            // 需再取一次，否則無法繼續
        }).finally(() => {
            // self.showReading = false;
            // self.bleStatusTitle = '';
            // self.bleStatusContent = '';
        });
    }

    self.goback = function () {
        history.go(-1);
    };

    // 紀錄是否已離開這頁，以供判斷非同步回來的 callback 是否繼續要做
    let isDestroyed = false;
    self.$onDestroy = function () {
        isDestroyed = true;
        // 離開此頁時，重新開啟藍牙 android only and not card
        // if (cordova.platformId === 'android' && $state.previousStateNameForDestroy === 'continuousMachineData') {
        //     // 隱藏 toast
        //     if (document.getElementById('restart-ble-toast')) {
        //         $mdToast.hide();
        //     }

        //     // 重新開啟藍牙
        //     console.log('onDestroy disconnect start');
        //     bleService.disconnect().then(() => {
        //         bleService.setDisableCallback(() => {
        //             bleService.enableWithoutAlert();
        //         });
        //         bleService.disable();
        //     });
        // }

        // if (cordova.platformId !== 'browser') {
        //     document.removeEventListener('volumeupbutton', scanBarCode);
        //     document.removeEventListener('volumedownbutton', scanBarCode);
        // }

    };

    function generateHtml() {
        let result = '';
        result += `
        <table id="cont-table">
            <thead>
                <tr>
                    <th id="selectedTitle"> <div>` +
            $translate('continuousMachineData.component.choose', { length: _.filter(self.serviceData, { 'IsSelected': true }).length })
            + '</div>'
            + '</th>' +
            generateThs() +
            `
                </tr>
            </thead>
            <tbody id="cont-tbody">` + generateTds() +
            `</tbody>
        </table>
        `;

        let gridTable = angular.element(document.querySelector('#cont-machine-data-table'));
        gridTable.empty();
        gridTable.append($compile(result)($scope));
    }
    function generateThs() {
        // 依據連續型資料有幾筆生出幾筆選取的 th
        let ths = '';
        for (let i = 0; i < self.serviceData.length; i++) {
            ths += `
            <th>
                <div ng-show="!$ctrl._${self.serviceData[i].Id}Loading" id="${self.serviceData[i].Id}" class="${getIsSelectedClass(self.serviceData[i].IsSelected)}" ng-click="$ctrl.selectItem('${self.serviceData[i].Id}')">
                    ${getIsSelectedWord(self.serviceData[i].IsSelected)}
                </div>
                <label ng-show="$ctrl._${self.serviceData[i].Id}Loading">` + $translate('continuousMachineData.component.doing') + `</label>
            </th>
            `;
        }
        return ths;
    }
    // 取得是否選取的 class
    function getIsSelectedClass(isSelected) {
        return isSelected ? 'buttonselect selected' : 'buttonselect';
    }
    // 取得是否選取的文字
    function getIsSelectedWord(isSelected) {
        return isSelected ? $translate('continuousMachineData.component.selected') : $translate('continuousMachineData.component.notSelected');
    }

    /** 警示欄位
     * 液溫警報: IsDialysateTemperatureAlarm
     * 導電度警報: IsConductivityAlarm
     * 濃度警報: IsConcentrationAlarm
     * 靜脈壓警報: IsVenousPressureAlarm
     * 液壓警報: IsDialysatePressureAlarm
     * TMP 警報: IsTMPAlarm
     * 氣泡檢測警報: IsAirBubbleDetectorAlarm
     * 漏血警報: IsBloodLeakAlarm
     * 動脈壓警報: IsArterialPressureAlarm
     * 血壓警報: IsBloodPressureAlarm
     * 脈搏警報: IsPulseAlarm
    */
    const machineDataAbnormalColumns = {
        IsDialysateTemperatureAlarm: '液溫警報',
        IsConductivityAlarm: '導電度警報',
        IsConcentrationAlarm: '濃度警報',
        IsVenousPressureAlarm: '靜脈壓警報',
        IsDialysatePressureAlarm: '液壓警報',
        IsTMPAlarm: 'TMP 警報',
        IsAirBubbleDetectorAlarm: '氣泡檢測警報',
        IsBloodLeakAlarm: '漏血警報',
        IsArterialPressureAlarm: '動脈壓警報',
        IsBloodPressureAlarm: '血壓警報',
        IsPulseAlarm: '脈搏警報'
    };
    function generateAlarmStr(data) {
        let msgAry = [];
        _.forEach(machineDataAbnormalColumns, (value, key) => {
            if (data[key]) {
                msgAry.push(value);
            }
        });
        return msgAry.join('；');
    }
    function getNormalOrAlarmTd(isAlarm, value) {
        // 若 value 有兩個值
        let alarmClass = isAlarm ? 'warning' : '';

        if (Array.isArray(value) && value.length > 1) {
            return `
                <td class="${alarmClass}">
                    ${value[0] || ''}/${value[1] || ''}
                </td>
            `;
        }
        return `
            <td class="${alarmClass}">
                ${value || ''}
            </td>
        `;
    }

    function generateTds() {
        let result = '';
        let tds = {
            DialysisTime: '',
            DialysisSystem: '',
            RemainingTime: '',
            BP: '',
            PulseBreath: '',
            BloodFlowRate: '',
            ArterialPressure: '',
            FilterPressure: '',
            EffluentPressure: '',
            PressureDrop: '',
            VenousPressure: '',
            TMP: '',
            ACT: '',
            HeaterTemperature: '',
            UFRate: '',
            TotalUF: '',
            HeparinOriginal: '',
            HeparinDeliveryRate: '',
            HeparinAccumulatedVolume: '',
            DialysisateFlowRate: '',
            DialysateA: '',
            DialysateTemperatureSet: '',
            DialysateTemperature: '',
            DialysateConductivity: '',
            UFProfile: '',
            TargetSodium: '',
            NaProfile: '',
            HDFType: '',
            Volume: '',
            SubVolume: '',
            // TotalBloodFlowVolume: '',
            // BloodLeak: '',
            TargetUF: '',
            Alarm: ''
        };

        // 根據 mode title 需顯示的字串
        let [crrtModePressureStr, crrtModeOtherStr, hdfStr] = ['', '', ''];
        for (let i = 0; i < self.serviceData.length; i++) {
            // 剩餘時間(分鐘)轉為 XX:XX
            if (self.serviceData[i].UFTime && !self.serviceData[i].UFTime.includes(':')) {
                self.serviceData[i].UFTime = ('0' + parseInt(self.serviceData[i].UFTime / 60)).slice(-2) + ':' + ('0' + parseInt(self.serviceData[i].UFTime % 60)).slice(-2);
            } else if (self.serviceData[i].UFTime && (isNaN(parseInt(self.serviceData[i].UFTime.split(':')[0])) || isNaN(parseInt(self.serviceData[i].UFTime.split(':')[1])))) {
                self.serviceData[i].UFTime = '';
            }

            // 準備所有資料的 td
            tds.DialysisTime += `
                <td>
                    ${moment(self.serviceData[i].DialysisTime).format('HH:mm:ss')}
                </td>
            `;
            tds.DialysisSystem += `
                <td>
                    ${self.serviceData[i].DialysisSystem || ''}
                </td>
            `;
            tds.RemainingTime += `
                <td>
                    ${self.serviceData[i].UFTime || ''}
                </td>
            `;

            // 血壓
            tds.BP += getNormalOrAlarmTd(self.serviceData[i].IsBloodPressureAlarm, [self.serviceData[i].BPS, self.serviceData[i].BPD]);
            // tds.BP += `
            //     <td>
            //         ${self.serviceData[i].BPS || ''}/${self.serviceData[i].BPD || ''}
            //     </td>
            // `;

            // 脈搏警報
            let pulseWarnClass = self.serviceData[i].IsPulseAlarm ? 'warning' : '';
            tds.PulseBreath += `
                <td>
                    <span class="${pulseWarnClass}">${self.serviceData[i].Pulse || ''}</span>/${self.serviceData[i].Breath || ''}
                </td>
            `;
            tds.BloodFlowRate += `
                <td>
                    ${self.serviceData[i].BloodFlowRate || ''}
                </td>
            `;

            if (isCRRT) {
                tds.ArterialPressure += `
                <td>
                    ${self.serviceData[i].ArterialPressure || ''}
                </td>
            `;
                tds.FilterPressure += `
                <td>
                    ${self.serviceData[i].FilterPressure || ''}
                </td>
            `;
                tds.EffluentPressure += `
                <td>
                    ${self.serviceData[i].EffluentPressure || ''}
                </td>
            `;
                tds.PressureDrop += `
                <td>
                    ${self.serviceData[i].PressureDrop || ''}
                </td>
            `;

            }

            // 靜脈壓警報
            tds.VenousPressure += getNormalOrAlarmTd(self.serviceData[i].IsVenousPressureAlarm, self.serviceData[i].VenousPressure);
            // tds.VenousPressure += `
            //     <td>
            //         ${self.serviceData[i].VenousPressure || ''}
            //     </td>
            // `;

            // TMP 警報
            tds.TMP += getNormalOrAlarmTd(self.serviceData[i].IsTMPAlarm, self.serviceData[i].TMP);
            // tds.TMP += `
            //     <td>
            //         ${self.serviceData[i].TMP || ''}
            //     </td>
            // `;

            if (isCRRT) {
                tds.ACT += `
                <td>
                    ${self.serviceData[i].ACT || ''}
                </td>
            `;
                tds.HeaterTemperature += `
                <td>
                    ${self.serviceData[i].HeaterTemperature || ''}
                </td>
            `;
            }

            tds.UFRate += `
                <td>
                    ${self.serviceData[i].UFRate || ''}
                </td>
            `;
            tds.TotalUF += `
                <td>
                    ${self.serviceData[i].TotalUF || ''}
                </td>
            `;
            tds.HeparinOriginal += `
                <td>
                    ${self.serviceData[i].HeparinOriginal || ''}
                </td>
            `;
            tds.HeparinDeliveryRate += `
                <td>
                    ${self.serviceData[i].HeparinDeliveryRate || ''}
                </td>
            `;
            tds.HeparinAccumulatedVolume += `
                <td>
                    ${self.serviceData[i].HeparinAccumulatedVolume || ''}
                </td>
            `;
            tds.DialysisateFlowRate += `
                <td>
                    ${self.serviceData[i].DialysisateFlowRate || ''}
                </td>
            `;

            // 濃度警報
            tds.DialysateA += getNormalOrAlarmTd(self.serviceData[i].IsConcentrationAlarm, self.serviceData[i].DialysateA);
            // tds.DialysateA += `
            //     <td>
            //         ${self.serviceData[i].DialysateA || ''}
            //     </td>
            // `;

            tds.DialysateTemperatureSet += `
            <td>
            ${self.serviceData[i].DialysateTemperatureSet || self.serviceData[i].TargetTemperature || ''}
            </td>
            `;

            // 液溫警報 設定值？
            tds.DialysateTemperature += getNormalOrAlarmTd(self.serviceData[i].IsDialysateTemperatureAlarm, self.serviceData[i].DialysateTemperature);
            // tds.DialysateTemperature += `
            //     <td>
            //         ${self.serviceData[i].DialysateTemperature || ''}
            //     </td>
            // `;

            // 導電度警報
            tds.DialysateConductivity += getNormalOrAlarmTd(self.serviceData[i].IsConductivityAlarm, self.serviceData[i].DialysateConductivity);
            // tds.DialysateConductivity += `
            //     <td>
            //         ${self.serviceData[i].DialysateConductivity || ''}
            //     </td>
            // `;

            tds.UFProfile += `
                <td>
                    ${self.serviceData[i].UFProfile || ''}
                </td>
            `;
            tds.TargetSodium += `
                <td>
                    ${self.serviceData[i].TargetSodium || ''}
                </td>
            `;
            tds.NaProfile += `
                <td>
                    ${self.serviceData[i].NaProfile || ''}
                </td>
            `;
            tds.HDFType += `
                <td>
                    ${self.serviceData[i].HDFType || ''}
                </td>
            `;

            if (isHDF) {
                tds.Volume += `
                    <td>
                        ${self.serviceData[i].Volume || ''}
                    </td>
                `;
                tds.SubVolume += `
                    <td>
                        ${self.serviceData[i].SubVolume || ''}
                    </td>
                `;
            }
            // tds.TotalBloodFlowVolume += `
            //     <td>
            //         ${self.serviceData[i].TotalBloodFlowVolume || ''}
            //     </td>
            // `;
            // tds.BloodLeak += `
            //     <td>
            //         ${self.serviceData[i].BloodLeak || ''}
            //     </td>
            // `;
            tds.TargetUF += `
                <td>
                    ${self.serviceData[i].TargetUF || ''}
                </td>
            `;
            tds.Alarm += `
                <td class="warning">
                    ${generateAlarmStr(self.serviceData[i])}
                </td>
            `;
        }

        // 依據 mode 顯示相應的欄位
        if (isCRRT) {
            crrtModePressureStr = `
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.ArterialPressure')}
                        </td>` + tds.ArterialPressure + `
                    </tr>
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.FilterPressure')}
                        </td>` + tds.FilterPressure + `
                    </tr>
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.EffluentPressure')}
                        </td>` + tds.EffluentPressure + `
                    </tr>
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.PressureDrop')}
                        </td>` + tds.PressureDrop + `
                    </tr>
                    `;
            crrtModeOtherStr = `
                <tr>
                    <td class="title">
                        ${$translate('machineData.machineDataDetail.ACT')}
                    </td>` + tds.ACT + `
                </tr>
                <tr>
                    <td class="title">
                        ${$translate('machineData.machineDataDetail.HeaterTemperature')}
                    </td>` + tds.HeaterTemperature + `
                </tr>
                `;
        }

        if (isHDF) {
            hdfStr = `
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.Volume')}
                        </td>` + tds.Volume + `
                    </tr>
                    <tr>
                        <td class="title">
                            ${$translate('machineData.machineDataDetail.SubVolume')}
                        </td>` + tds.SubVolume + `
                    </tr>
                    `;
        }

        result += `
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.date')}
            </td>` + tds.DialysisTime + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('continuousMachineData.dialysisSystem')}
            </td>` + tds.DialysisSystem + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.remainingTime')}
            </td>` + tds.RemainingTime + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.bloodPressure')}
            </td>` + tds.BP + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.PulseBreath')}
            </td>` + tds.PulseBreath + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.BloodFlowRate')}
            </td>` + tds.BloodFlowRate + `
        </tr>` + crrtModePressureStr + `
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.VenousPressure')}
            </td>` + tds.VenousPressure + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.TMP')}
            </td>` + tds.TMP + `
        </tr>` + crrtModeOtherStr + `
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.UFRate')}
            </td>` + tds.UFRate + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.TotalUF')}
            </td>` + tds.TotalUF + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.HeparinOriginal')}
            </td>` + tds.HeparinOriginal + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.HeparinDeliveryRate')}
            </td>` + tds.HeparinDeliveryRate + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.HeparinAccumulatedVolume')}
            </td>` + tds.HeparinAccumulatedVolume + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.DialysisateFlowRate')}
            </td>` + tds.DialysisateFlowRate + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.DialysateA')}
            </td>` + tds.DialysateA + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.DialysateTemperatureSet')}
            </td>` + tds.DialysateTemperatureSet + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.DialysateTemperature')}
            </td>` + tds.DialysateTemperature + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.DialysateConductivity')}
            </td>` + tds.DialysateConductivity + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.UFProfile')}
            </td>` + tds.UFProfile + `
        </tr>
         <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.TargetSodium')} Na<sup>+</sup>(mmole)
            </td>` + tds.TargetSodium + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.NaProfile')}
            </td>` + tds.NaProfile + `
        </tr>
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.HDFType')}
            </td>` + tds.HDFType + `
        </tr>` + hdfStr + `
        <tr>
            <td class="title">
                ${$translate('machineData.machineDataDetail.TargetUF')}
            </td>` + tds.TargetUF + `
        </tr>
        <tr>
            <td class="title">
                警報
            </td>` + tds.Alarm + `
        </tr>
        `;

        return result;
    }

    // 手機及 Mac 上 scroll stop 時會得不到最後的值，因此需用以下方式
    // https://stackoverflow.com/questions/3701311/event-when-user-stops-scrolling
    // 擴充 jquery 方法
    $.fn.scrollEnd = function (callback, timeout) {
        $(this).scroll(function () {
            var $this = $(this);
            if ($this.data('scrollTimeout')) {
                clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback, timeout));
        });
    };

    // 取得目前日期特定時間的連續型資料
    self.getList = function getList(hour) {
        self.loadingTable = true;
        clearTable();
        if (hour) {
            self.specificHour = hour + ':00-' + hour + ':59';
        }
        self.specificHourCount = null;
        machineDataService.getSpecificDayContData($stateParams.patientId, moment(self.currentDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(hour, 'hours').format('YYYYMMDDHH')).then((q) => {
            // 若筆數與 bar 的資料對不起來則重取
            if (self.barData[hour] !== q.data.length) {
                getChart();
            }

            self.serviceData = _.orderBy(q.data, ['DialysisTime'], ['desc']);

            [isCRRT, isHDF] = [false, false];
            for (let i = 0; i < self.serviceData.length; i++) {
                // 確認這些資料中是否有 CRRT / HDF Mode，只要有一筆有就顯示
                if (isCRRTMode(self.serviceData[i].HDFType)) {
                    isCRRT = true;
                } else if (self.serviceData[i].HDFType && self.serviceData[i].HDFType.match(/(^cvvh$)|(f$)/i)) {
                    isHDF = true;
                }
            }

            self.loadingTable = false;
            // 供前端顯示目前時間區間的筆數
            self.specificHourCount = self.serviceData.length;

            if (self.serviceData.length < 1) {
                return;
            }

            generateHtml();

            $('#cont-tbody').scrollEnd((e) => { // detect a scroll event on the tbody
                /*
              Setting the thead left value to the negative valule of tbody.scrollLeft will make it track the movement
              of the tbody element. Setting an elements left value to that of the tbody.scrollLeft left makes it maintain it's relative position at the left of the table.    
              */
                $('#cont-table thead').css('left', -$('#cont-tbody').scrollLeft()); // fix the thead relative to the body scrolling
                $('#cont-table thead th:nth-child(1)').css('left', $('#cont-tbody').scrollLeft()); // fix the first cell of the header
                $('#cont-table tbody td:nth-child(1)').css('left', $('#cont-tbody').scrollLeft()); // fix the first column of tdbody
            }, 10);

        }, (reason) => {
            self.loadingTable = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    self.selectItem = function (id) {
        console.log('selectItem' + id);
        // 若正在 Loading 則不做事情
        if (self['_' + id + 'Loading']) {
            return;
        }

        const index = _.findIndex(self.serviceData, ['Id', id]);
        self.serviceData[index].IsSelected = !self.serviceData[index].IsSelected;

        // Todo Mac 號需處理 -> 請 Gino 調整 or 去掉 -
        // self.serviceData[index].MacAddress = self.serviceData[index].MacAddress.replace(/-/g, '');

        // modified user
        self.serviceData[index].ModifiedUserId = SettingService.getCurrentUser().Id;
        self.serviceData[index].ModifiedUserName = SettingService.getCurrentUser().Name;
        self.serviceData[index].ModifiedTime = moment();

        let isSelected = self.serviceData[index].IsSelected;
        // 若為取消選取需把 DialysisId 清空，選取需要給表單 Id
        if (!isSelected) {
            self.serviceData[index].DialysisId = '';
        } else {
            self.serviceData[index].DialysisId = $stateParams.headerId;
        }

        // 按鈕旁 show loading
        self['_' + id + 'Loading'] = true;

        // Todo Real time set IsSelected flag;
        machineDataService.put(self.serviceData[index]).then((res) => {
            self['_' + id + 'Loading'] = false;

            // 將按鈕變色改變狀態
            let sBtn = angular.element(document.getElementById(id));
            sBtn.removeClass().addClass(getIsSelectedClass(isSelected));
            sBtn.text(getIsSelectedWord(isSelected));

            // 變目前已選的數目
            // let text = `是否選取(已選${_.filter(self.serviceData, { 'IsSelected': true }).length}筆)`;
            let text = $translate('continuousMachineData.component.choose', { length: _.filter(self.serviceData, { 'IsSelected': true }).length });
            angular.element(document.getElementById('selectedTitle')).text(text);

        }, () => {
            self['_' + id + 'Loading'] = false;
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    };

    // barchart 相關
    self.baseCount = 40;
    self.barData = {};
    self.getBarHeight = function getBarHeight(value) {
        return (value / self.totalCount) * 100;
    };
    self.getLastHourNumber = function (value) {
        return parseInt(value) === 23 ? 0 : (parseInt(value) + 1);
    };
    function getChart() {
        self.loading = true;
        self.barData = {};
        self.totalCount = 0;
        machineDataService.getContinuousData($stateParams.patientId, moment(self.currentDate).format('YYYYMMDD')).then((res) => {
            console.log('getChart continuous', res);
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
            self.lastAccessTime = machineDataService.getLastContAccessTime();
            if (res.data.length === 0) {
                return;
            }
            // 先依日期順序排
            res.data.map((item) => {
                item.Hour = parseInt(item.Hour);
                return item;
            });
            res.data = _.orderBy(res.data, ['Hour']);

            // 判斷第一筆跟最後一筆是否超過四小時，若無則長四個 bar，有則多少個小時就多少個 bar
            let realDuration = 0;
            let firstDataHr = parseInt(res.data[0].Hour);
            if (res.data.length > 1) {
                realDuration = parseInt(res.data[res.data.length - 1].Hour - res.data[0].Hour) + 1;
            }
            let barNo = -1;
            if (realDuration > 4) {
                barNo = realDuration;
            } else if ((23 - firstDataHr + 1) < 4) {
                // 先判斷第一筆資料距離跨日還有幾小時，若小於四小時則以小的為準
                barNo = (23 - firstDataHr + 1);
            } else {    // 直接生四條
                barNo = 4;
            }
            for (let i = firstDataHr; i < (firstDataHr + barNo); i++) {
                self.barData[i] = 0;
            }
            _.forEach(res.data, (data) => {
                self.barData[parseInt(data.Hour)] = data.Total;
                self.totalCount += data.Total;
            });
            console.log('getChart', self.barData);
        }, (err) => {
            self.loading = false;
            self.isError = true; // 顯示伺服器連接失敗的訊息
            showMessage($translate('customMessage.serverError')); // lang.ComServerError
        });
    }

    function isCRRTMode(mode) {
        // 符合 CRRT 模式的條件
        // if (mode && mode.match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/i)) {
        //     console.log('isCRRTMode');
        //     return true;
        // }

        return false;
    }

    function checkDisableChangeDate() {
        // 判斷減一按鈕是否要 disable
        if (moment(self.currentDate).diff(moment(self.minValidDate), 'days') <= 0) {
            self.cantPreviousDate = true;
        } else {
            self.cantPreviousDate = false;
        }

        // 判斷加一按鈕是否要 disable
        if (moment(self.currentDate).format('YYYY-MM-DD') === self.maxValidDate) {
            self.cantNextDate = true;
        } else {
            self.cantNextDate = false;
        }
    }

    self.changeDate = function (num) {
        self.currentDate = new Date(moment(self.currentDate).add(num, 'd'));
        checkDisableChangeDate();
        self.specificHour = '';
        self.specificHourCount = 0;
        self.displayDate = moment(self.currentDate).format('YYYY-MM-DD');
        clearTable();
        getChart();
    };

    function clearTable() {
        let gridTable = angular.element(document.querySelector('#cont-machine-data-table'));
        gridTable.empty();
    }

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.specificHour = '';
        clearTable();
        getPatientInfo();
        getChart();
    };

    //#region RaspberryPi-related
    self.raspberryPiSettingDialog = function () {
        console.log('raspberryPiSettingDialog');
        // 若 setting 對話框已顯示或已不在連續型頁面，則不需再作下面的動作
        if (document.querySelector('.pi') || isDestroyed) {
            return;
        }

        // let data = self.pi;

        // 設定頁且尚未綁定才能掃 QRcode or NFC 靠卡
        if (!self.pi.isPiBind) {
            registerScanAndNfcEvent();
        }
        $mdDialog.show({
            controller: piSettingDialogController,
            controllerAs: '$ctrl',
            template: piSettingDialog,
            locals: {
                data: self.pi
            },
            parent: angular.element(document.querySelector('continuous-machine-data')),
            // parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(() => {
            unRegisterScanAndNfcEvent();
        }, () => {
            // 隱藏 toast
            if (document.getElementById('restart-ble-toast')) {
                $mdToast.hide();
            }
            unRegisterScanAndNfcEvent();
        });
    };
    function piSettingDialogController(data) {
        const vm = this;

        vm.data = data;
        vm.isBrowser = cordova.platformId === 'browser';
        vm.isPiBind = self.pi.isPiBind;

        // 判斷是否要顯示解除連結按鈕，若有表單 id 且 欲現在表單一致才能有解除綁定的功能
        if (self.patient.RaspberryPiSetting.DialysisId && self.patient.RaspberryPiSetting.DialysisId !== $stateParams.headerId) {
            vm.hideUnbind = true;
        }

        // 應顯示的訊息
        if (vm.isBrowser) {
            vm.info = $translate('continuousMachineData.info');
        } else if (!vm.isPiBind) {
            // 若為 ios 則只能掃描
            if (cordova.platformId === 'ios') {
                vm.info = $translate('continuousMachineData.component.infoBindIos');
            } else {
                vm.info = $translate('continuousMachineData.component.infoBind');
            }
        } else {
            vm.info = $translate('continuousMachineData.component.infoNearby');
        }

        vm.scan = function () {
            scanBarCode();
        };

        vm.setStartOrStop = function () {
            setLastBleActionCallback(setStartOrStop, '');
            setStartOrStop();
            console.log(lastBleActionCallback);
        };

        vm.doUnbind = function () {
            doUnbind();
        };

        vm.hide = function () {
            $mdDialog.cancel();
        };
    }

    function doUnbind() {
        const confirm = $mdDialog.confirm()
            .title($translate('raspberryPi.doUnbind'))
            .multiple(true)
            .clickOutsideToClose(true)
            .textContent('')
            .ok($translate('raspberryPi.unbind'))
            .cancel($translate('customMessage.doItLater'));

        $mdDialog.show(confirm).then(() => {
            if (self.patient.RaspberryPiSetting.RaspberryPiId) {
                // 解連結時留住最後一次的頻率
                self.patient.RaspberryPiSetting = {
                    Frequency: self.patient.RaspberryPiSetting.Frequency
                };

                // modified user
                self.patient.ModifiedUserId = SettingService.getCurrentUser().Id;
                self.patient.ModifiedUserName = SettingService.getCurrentUser().Name;
                PatientService.put(self.patient).then((res) => {
                    self.pi.isPiBind = false;
                    oriPatient = angular.copy(res.data);
                    $mdDialog.hide();
                    // showBindingAlert();
                });
            }
        }, function () {
            // self.raspBerryPiSettingDialog();
        });
    }


    function setStartOrStop() {
        const defer = $q.defer();
        // macStr = macStr.split('**')[0];
        lastMac = lastMac.split('**')[0];
        // 先確認是啟動還是停止
        // pimac
        let mac = self.patient.RaspberryPiSetting.RaspberryPiId || lastMac;
        self.bleStatusContent = $translate('raspberryPi.connecting');
        // 尚未連續型傳輸 -> start
        if (!self.pi.isSetContinuous) {
            self.actionName = 'GETTASK';
            self.actionObject = null;

            // 提供使用者知道目前連線狀態的字眼
            self.bleStatusTitle = $translate('continuousMachineData.component.starting');


            self.read(mac, 'first').then((res) => {
                console.log('gettask done', res);
                if (!res.FormId) {
                    // 啟動
                    self.actionName = 'setContinuous';
                    self.actionObject = {
                        FormId: $stateParams.headerId,
                        PatientId: patientId,
                        PatientName: self.patient.Name,
                        MedicalId: self.patient.MedicalId,
                        UserId: currentUserInfo.Id,
                        UserName: currentUserInfo.Name,
                        Frequency: self.pi.frequency * 60   // 分 -> 秒
                    };
                    self.read(mac, 'last').then(() => {
                        // 成功開始連續型傳輸
                        defer.resolve(mac);
                    });
                } else if (res.FormId === $stateParams.headerId) {
                    showMessage($translate('raspberryPi.reloadPiStatus'));
                    // 啟動時伺服器已更新成功但傳輸器未回傳，須重撈病人資料更新
                    getPatientInfo();
                    self.disconnect();
                    self.raspberryPiSettingDialog();

                } else {
                    // 顯示 pi 正在執行中並顯示目前是執行哪位病人的任務的對話框
                    showPiStartedDialog(res.PatientId).then(() => {
                        // 先停止當前任務(才會更新病人狀態) 再執行
                        self.actionName = 'stopTask';
                        self.actionObject = null;
                        self.read(mac, 'multiple').then(() => {
                            // 啟動
                            self.actionName = 'setContinuous';
                            self.actionObject = {
                                FormId: $stateParams.headerId,
                                PatientId: patientId,
                                PatientName: self.patient.Name,
                                MedicalId: self.patient.MedicalId,
                                UserId: currentUserInfo.Id,
                                UserName: currentUserInfo.Name,
                                Frequency: self.pi.frequency * 60   // 分 -> 秒
                            };
                            self.read(mac, 'last').then(() => {
                                // 成功開始連續型傳輸
                                defer.resolve(mac);
                            });
                        }, () => {
                            self.disconnect();
                        });
                    }, () => {
                        // 斷藍牙連線
                        self.disconnect();
                    });
                }
            });
        } else {
            setStop();
        }

        return defer.promise;
    }

    // 顯示 pi 正在執行中並顯示目前是執行哪位病人的任務的對話框
    function showPiStartedDialog(pId) {
        return new Promise((resolve, reject) => {
            PatientService.getById(pId).then((resp) => {
                console.log('目前傳輸器執行的病人', resp.data);
                const alert = getIsExeDialog(resp.data);
                $mdDialog.show(alert).then(() => { resolve(); }, () => { reject(); });
            }, (err) => {
                const alert = getIsExeDialog(err);
                $mdDialog.show(alert).then(() => { resolve(); }, () => { reject(); });
            });
        });
    }
    // 傳輸器有人執行的對話框
    function getIsExeDialog(exePatient) {
        let [patientName, patientMedicalId] = [exePatient.Name || $translate('customMessage.serverError'), exePatient.MedicalId || ''];
        let msg = '';   // 提示的內容

        // 若目前病人與傳輸器正在執行的病人相同 -> 提示同一個病人，但表單不同
        if (self.patient.MedicalId === exePatient.MedicalId) {
            msg = $translate('continuousMachineData.component.diffFormAlert');
        } else {
            msg = $translate('continuousMachineData.component.currentExePatient', { patientName, patientMedicalId });
        }

        return $mdDialog.confirm()
            .title($translate('continuousMachineData.component.isExeTitle'))
            .clickOutsideToClose(true)
            .multiple(true)
            .textContent(msg)
            .ok($translate('continuousMachineData.component.execute'))
            .cancel($translate('continuousMachineData.component.continueTask'));
    }

    function setStop() {
        const confirm = $mdDialog.confirm()
            .title($translate('raspberryPi.confirmStop'))
            .clickOutsideToClose(true)
            .multiple(true)
            .textContent('')
            .ok($translate('raspberryPi.stop'))
            .cancel($translate('customMessage.doItLater'));

        $mdDialog.show(confirm).then(() => {
            setLastBleActionCallback(stop, '');
            stop();
        }, function () {
            // 若選擇不停止，則斷藍牙連線
            // self.disconnect();
            // self.raspBerryPiSettingDialog();
        });

        function stop() {
            // 提供使用者知道目前連線狀態的字眼
            self.bleStatusTitle = $translate('continuousMachineData.component.stoping');

            if (self.patient.RaspberryPiSetting.RaspberryPiId) {
                self.actionName = 'GETTASK';
                self.actionObject = null;
                self.bleStatusContent = $translate('raspberryPi.connecting');

                self.read(self.patient.RaspberryPiSetting.RaspberryPiId, 'first').then((res) => {
                    // 檢查目前透析表單單號是否與傳輸器的當前任務一致，若不一致跳選擇
                    self.actionName = 'stopTask';
                    self.actionObject = null;
                    if (res.FormId) {
                        if (res.FormId !== $stateParams.headerId) {
                            // 調整傳輸器傳輸中的 z-index，避免對話框被擋住
                            document.querySelector('.fullscreenMask').style.zIndex = '80';

                            // 跳選項，若確定則再下停止命令，否則斷藍牙連線
                            const select = $mdDialog.confirm()
                                .title($translate('continuousMachineData.component.isDiffTaskTitle'))
                                .clickOutsideToClose(true)
                                .multiple(true)
                                .textContent($translate('continuousMachineData.component.isDiffTask'))
                                .ok($translate('raspberryPi.stop'))
                                .cancel($translate('continuousMachineData.component.continueTask'));
                            $mdDialog.show(select).then(() => {
                                // 回復輸器傳輸中的 z-index
                                document.querySelector('.fullscreenMask').style.zIndex = '90';
                                self.read(self.patient.RaspberryPiSetting.RaspberryPiId, 'last');
                            }, () => {
                                // 回復傳輸器傳輸中的 z-index
                                document.querySelector('.fullscreenMask').style.zIndex = '90';
                                self.disconnect();
                            });
                        } else {
                            self.read(self.patient.RaspberryPiSetting.RaspberryPiId, 'last');
                        }
                    } else {
                        // 若傳輸器已停止，再呼叫一次讓傳輸器回寫資料庫
                        self.read(self.patient.RaspberryPiSetting.RaspberryPiId, 'last');
                    }
                });
            }
        }
    }

    self.read = function (ndefData, multipleAndStep) {
        // 隱藏 toast
        if (document.getElementById('restart-ble-toast')) {
            $mdToast.hide();
        }
        return new Promise((resolve, reject) => {
            if ((!multipleAndStep && self.reading) || (self.reading && multipleAndStep && multipleAndStep === 'first')) {
                resolve('still reading!');
                return;
            }
            $timeout(() => {
                self.reading = true;
                self.showReading = true;
                self.bleStatus = $translate('machineData.machineDataDetail.component.bleConnecting');
            }, 0);

            getData(ndefData, resolve, reject, playConnectedSound, multipleAndStep);
        });

    };

    function getData(ndefData, resolve, reject, playConnectedSound, multipleAndStep) {
        bleService.getData(ndefData, {
            workType: self.actionName,
            objectData: self.actionObject,
            callback: playConnectedSound
        }, multipleAndStep === 'last' || multipleAndStep === 'multiple')
            .then((data) => {
                // console.log('blemanager.getData success -> ', JSON.stringify(data));
                let messageStr = '';
                setLastBleActionCallback(null, '');
                switch (self.actionName.toUpperCase()) {
                    case 'GETTASK':
                        console.log('GETTASK successfully!!');
                        messageStr = $translate('raspberryPi.getPiStatusSuccessfully');
                        break;
                    case 'CHANGESETTING':
                        console.log('ChangeSetting', data);
                        self.patient.RaspberryPiSetting.RaspberryPiId = ndefData;
                        self.patient.RaspberryPiSetting.Meter = data.Meter;
                        // self.patient.RaspBerryPiSetting.BedNo = data.BedNo;
                        self.patient.RaspberryPiSetting.IsRepeated = false;

                        // 前端判斷
                        self.patient.RaspberryPiSetting.RaspberryPiId = ndefData;
                        self.pi.isPiBind = true;

                        messageStr = $translate('raspberryPi.settingFinished');
                        break;
                    case 'SETCONTINUOUS':
                        if (self.patient.RaspberryPiSetting.Status) {
                            if (self.patient.RaspberryPiSetting.Status.toUpperCase() === 'STOP') {
                                messageStr = $translate('raspberryPi.contSettingRestart');
                            } else {
                                messageStr = $translate('raspberryPi.contSettingSuccessfully');
                            }
                        } else {
                            messageStr = $translate('raspberryPi.contSettingSuccessfully');
                        }
                        self.patient.RaspberryPiSetting.RaspberryPiId = ndefData;
                        self.patient.RaspberryPiSetting.Status = data.Status;
                        self.patient.RaspberryPiSetting.Frequency = data.Frequency;

                        self.patient.RaspberryPiSetting.Meter = data.Meter;
                        self.pi.meter = data.Meter;

                        self.patient.RaspberryPiSetting.IsRepeated = true;
                        self.pi.frequency = data.Frequency / 60; // 秒 -> 分

                        // 前端判斷
                        self.pi.raspberryPiId = self.patient.RaspberryPiSetting.RaspberryPiId;
                        self.pi.isStopDisable = false;
                        self.pi.isSetContinuous = true;
                        self.pi.isPiBind = true;

                        // patient 狀態改變
                        PatientService.setDirty();
                        break;
                    case 'STOPTASK':
                        self.patient.RaspberryPiSetting.Status = data.Status;
                        self.patient.RaspberryPiSetting.IsRepeated = false;
                        // 前端判斷
                        self.pi.isStopDisable = true;
                        self.pi.isSetContinuous = false;

                        // patient 狀態改變
                        PatientService.setDirty();

                        messageStr = $translate('raspberryPi.contStop');
                        break;
                    default:
                        // todo:
                        break;
                }

                // 最後一步再顯示訊息即可
                if (multipleAndStep === 'last') {
                    showMessage(messageStr);
                }

                resolve(data);
                // 若沒有傳multipleAndStep參數或是multipleAndStep為 last才需要斷線
                if (!multipleAndStep || multipleAndStep === 'last') {
                    self.disconnect();
                }
            }, (result) => {
                let msg = result.message ? result.message : result;

                // TODO Android only 連線錯誤訊息才需顯示重啟藍牙後自動連線傳輸的 toast
                if (cordova.platformId === 'android' && (/BT_CONNECT_TIMEOUT/i.test(msg) || /BT_RETRYCONNECT/i.test(msg))) {
                    $mdToast.show({
                        hideDelay: 0,
                        controller: 'restartBleToastCtrl',
                        controllerAs: '$ctrl',
                        bindToController: true,
                        locals: {
                            callback: () => { if (typeof lastBleActionCallback !== 'function') { return; } lastBleActionCallback(); },
                            mac: lastMac
                        }, // lastMac
                        template: toastTpl
                    }).then((res) => {
                        console.log(res);
                        if (res === 'restart_ble') {
                            $timeout(() => {
                                self.showReading = true;
                                self.bleStatusTitle = $translate('bluetooth.btRestarting');
                                self.bleStatusContent = $translate('continuousMachineData.component.wait');
                            }, 0);
                        }
                    }).catch((error) => {
                        console.error('Custom toast failure:', error);
                    });
                    self.disconnect();
                    return;
                }


                if (result.message) {
                    showMessage(showMessage(bleService.errorParser(result.message)));
                } else {
                    showMessage(raspberryPiService.convertPiErr(result));
                }
                reject('Err');
                self.disconnect();
            });
    }

    function playConnectedSound() {
        document.getElementById('piConnectedSound').play();
        self.bleStatusContent = $translate('raspberryPi.setting');
    }

    function playDisconnectedSound() {
        document.getElementById('piDisconnectedSound').play();
    }

    self.disconnect = function () {
        console.log('self.disconnet');
        playDisconnectedSound();
        bleService.disconnect()
            .then((result) => {
                // showMessage(result);
                // 成功的話不用顯示
                console.log(result);

                $timeout(() => {
                    self.reading = false;
                    self.showReading = false;
                    console.log('self.reading -> ' + self.reading);
                    // 繼續掃
                    if (!self.pi.isSetContinuous) {
                        // self.scanPi();
                    }
                }, 0);
            }, (result) => {
                //showMessage(result);
                console.log('disconnect error => ' + result);

                $timeout(() => {
                    self.reading = false;
                    self.showReading = false;
                    console.log('self.reading -> ' + self.reading);
                    // 繼續掃
                    if (!self.pi.isSetContinuous) {
                        // self.scanPi();
                    }
                }, 0);
            });
    };
    //#endregion RaspberryPi-related

}


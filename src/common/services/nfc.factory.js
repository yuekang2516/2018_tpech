
angular
    .module('app')
    .factory('nfcService', nfcService);

nfcService.$inject = ['$mdDialog', '$filter'];
function nfcService($mdDialog, $filter) {
    console.info('enter nfc Service');
    const $translate = $filter('translate');

    let _tagCallbackFunction;
    let _ndefCallbackFunction;

    // init nfc
    document.addEventListener('deviceready', deviceReady);

    return {
        listenTag,
        listenNdef,
        checkNfcAndInit,
        stop
    };

    // ndef卡，若同時偵測 tag 與 ndef 事件時，只會引發 ndef 事件
    // 解決方式為回傳一個物件包含 Id & Data，讓前端決定使用哪個欄位
    function deviceReady() {
        // NFC
        if (cordova.platformId !== 'browser') {
            checkNfcAndInit();
        }
    }

    function checkNfcAndInit() {
        // 確認使用者的 NFC 是否有開
        nfc.enabled(() => {
            // 為了重新取得 NFC intent
            // 先 remove 再 add
            nfc.removeTagDiscoveredListener(readTag, () => {
                // add
                nfc.addTagDiscoveredListener(readTag, () => {
                    console.log('nfc.addTagDiscoveredListener success');
                }, () => {
                    console.log('nfc.addTagDiscoveredListener failed');
                });
            }, (err) => {
                console.error('removeTagDiscoveredListener failed', err);
            });

            nfc.removeNdefListener(readNdef, () => {
                // add
                nfc.addNdefListener(readNdef, () => {
                    console.log('nfc.addNdefListener success');
                }, () => {
                    console.error('nfc.addNdefListener failed');
                });
            }, (err) => {
                console.error('removeNdefListener failed', err);
            });
        }, (err) => {
            // 若裝置有 NFC 功能但未開啟
            if (err === 'NFC_DISABLED') {
                // showMessage 提醒要開 nfc
                // 若已有相同的 $mdDialog show 則不須再 show
                const dialogTitle = $translate('nfc.openNFC');
                if ($('md-Dialog .md-title')[0] && $('md-Dialog .md-title')[0].innerHTML === dialogTitle) {
                    return;
                }
                const confirm = $mdDialog.confirm()
                    .title(dialogTitle)
                    .ok($translate('nfc.gotoSetting'));

                $mdDialog.show(confirm).then(() => {
                    // 開啟手機 NFC 設定頁
                    nfc.showSettings(() => {

                    }, (res) => {
                        console.error('NFC!!!!!!!', res);
                    });
                });
            }
            console.error(err);
        });
    }

    function listenTag(callback) {
        _tagCallbackFunction = callback;
    }

    function listenNdef(callback) {
        _ndefCallbackFunction = callback;
    }

    function stop() {
        _tagCallbackFunction = null;
        _ndefCallbackFunction = null;
    }

    function readTag(nfcEvent) {
        if (nfcEvent && _tagCallbackFunction) {
            // 把讀到的 byte array 轉成 HEX 字患, 並轉成大寫
            // 例如原始 array -> [4, -118, -110, -30, 77, 77, -128]
            // 最後結果為 D14F6004
            let rfid = {};
            let rawId = cordova.platformId === 'ios' ? nfcEvent.tag.ndefMessage[0].id : nfcEvent.tag.id;
            rfid.Id = rawId.map(function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('').toUpperCase();

            _tagCallbackFunction(rfid);
        }
    }

    function readNdef(nfcEvent) {
        if (nfcEvent && _ndefCallbackFunction) {
            let ndef = {};
            if (nfcEvent.tag.ndefMessage) {
                if (nfcEvent.tag.ndefMessage[0].payload[0] === 0x02) {
                    nfcEvent.tag.ndefMessage[0].payload.splice(0, 3);
                }
                ndef.Data = String.fromCharCode.apply(null, nfcEvent.tag.ndefMessage[0].payload);
            }
            let rawId = cordova.platformId === 'ios' ? nfcEvent.tag.ndefMessage[0].id : nfcEvent.tag.id;
            ndef.Id = rawId.map(function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('').toUpperCase();

            _ndefCallbackFunction(ndef);
        }
    }
}


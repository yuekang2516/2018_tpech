import * as signalR from '@aspnet/signalr';

angular.module('app').factory('dashboardService', dashboardService);
dashboardService.$inject = ['$http', '$q', '$rootScope', '$timeout', 'SettingService'];

function dashboardService($http, $q, $rootScope, $timeout, SettingService) {
    console.log('dashboardService');
    const rest = {
        updateData,
        showAll,
        updateBedStatus,
        connecting,
        connected,
        reconnecting,
        disconnected,
        connect,
        disconnect,
        getBedInfoByUserId,
        getAlarmMsgAry,
        restartSignalR,
        getSignalRConnectState
    };

    /** 警示欄位  顯示訊息與傳輸盒一致
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

    // signalR 由於需即時反應異常，把透析機的 sigmalR 搬至最外層
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${SettingService.getServerUrl()}/CommHub`, { transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling })
        // .withUrl(`${SettingService.getServerUrl()}/CommHub`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // listen server event
    connection.on('updateDialysisData', (info) => {
        console.log('updateDialysisData!!!!', info);
        rest.updateData(info);
    });

    connection.on('updateBedStatus', (info) => {
        console.log('updateBedStatus!!!!', info);
        rest.updateBedStatus(info);
    });

    connection.on('showDialysisData', (info) => {
        console.log('showDialysisData!!!!', info);
        rest.showAll(info);
    });

    function updateData(callback) {
        rest.callback = callback;
    }

    function showAll(callback) {
        console.log(callback);
        rest.callback = callback;
    }

    function updateBedStatus(callback) {
        rest.callback = callback;
    }

    function connecting() {

    }

    function connected() {

    }

    function reconnecting() {

    }

    function disconnected() {
        // try reconnect
        // Restart connection after 5 seconds.
        // setTimeout(() => {
        //     console.log('reconnect failed, start by timer');
        //     $.connection.hub.start();
        // }, 5000);
    }

    function connect() {
        try {
            // 已連線
            if (connection.state === 1) {
                $rootScope.$broadcast('dashboardConnected');
                return;
            }
            connection.start().then(function (res) {
                console.log("connected", res);
                $rootScope.$broadcast('dashboardConnected');
            }).catch((err) => {
                // 已在連線的狀態
                if (/disconnected/i.test(err.message)) {
                    $rootScope.$broadcast('dashboardConnected');
                }
                console.log('connect failed', err, connection.state);
            });
        } catch (error) {
            console.log('connect error', error, connection.state);
            connect();
        }
        // hub.connect();
    }

    function disconnect() {
        // hub.disconnect();
    }

    let isRestarting = false;
    function restartSignalR() {
        if (isRestarting) {
            isRestarting = false;
            return;
        }
        isRestarting = true;
        connection.stop().then(() => {
            connect();
            isRestarting = false;
        }).catch(() => {
            isRestarting = false;
            restartSignalR();
        });
    }

    // 取得透析機資料
    function getBedInfoByUserId(userId, ward, hospitalId) {
        console.log('call getBedInfoByUserId!!!!');
        connection.invoke('getBedInfoByUserId', userId, ward, hospitalId).then((res) => {
            console.log('getBedInfoByUserId', res);
        }).catch(function (err) {
            // 若為連線問題，則需重連
            // if (/connected/i.test(err.message)) {
            //     // 重新連線
            //     connect();
            // }
            console.log(err.toString());
        });
        // hub.getBedInfoByUserId(userId, ward, hospitalId);
    }

    // 只要顯示中的其中一個 flag 有異常就變色
    function getAlarmMsgAry(data) {
        if (!data || typeof data !== 'object') {
            return [];
        }
        let msgAry = [];
        _.forEach(machineDataAbnormalColumns, (value, key) => {
            if (data[key]) {
                msgAry.push(value);
            }
        });
        return msgAry;
    }

    function getSignalRConnectState() {
        return connection.state;
    }

    return rest;
}


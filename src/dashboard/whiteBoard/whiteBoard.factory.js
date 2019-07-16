import * as signalR from '@aspnet/signalr';

angular.module('app').factory('whiteBoardService', whiteBoardService);
whiteBoardService.$inject = ['$rootScope', '$http', '$q', 'Hub', '$timeout', 'SettingService'];

function whiteBoardService($rootScope, $http, $q, Hub, $timeout, SettingService) {
    const rest = {
        showAll,
        updateWhiteBoard,
        // connecting,
        // connected,
        // reconnecting,
        // disconnected,
        connect,
        disconnect,
        getWhiteBoard,
        get,
        post,
        put
    };
    const serverUrl = SettingService.getServerUrl();

    let lastTexts = [];
    let lastAccessTime = moment('1900-01-01');  // 使第一次進入畫面可從伺服器撈

    function showAll(callback) {
        rest.callback = callback;
    }

    function updateWhiteBoard(callback) {
        rest.callback = callback;
    }

    function connecting() {

    }

    function connected() {

    }

    function reconnecting() {

    }

    function disconnected() {

    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${SettingService.getServerUrl()}/CommHub`, { transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling })
        // .withUrl(`${SettingService.getServerUrl()}/CommHub`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.on('showWhiteBoard', (info) => {
        rest.showAll(info);
    });

    connection.on('updateWhiteBoard', (info) => {
        rest.updateWhiteBoard(info);
    });


    // const hub = new Hub('CommHub', {
    //     // client side methods
    //     listeners: {
    //         showWhiteBoard(info) {
    //             rest.showAll(info);
    //         },
    //         updateWhiteBoard(info) {
    //             rest.updateWhiteBoard(info);
    //         }
    //     },

    //     // server side methods
    //     methods: ['GetWhiteBoard'],

    //     // query params sent on initial connection
    //     // queryParams: {
    //     //   'token': 'exampletoken'
    //     // },

    //     // handle connection error
    //     errorHandler(error) {
    //         console.error(error);
    //     },

    //     // specify a non default root
    //     rootPath: serverUrl + '/signalr',

    //     stateChanged(state) {
    //         switch (state.newState) {
    //             case $.signalR.connectionState.connecting:
    //                 rest.connecting();
    //                 // your code here
    //                 break;
    //             case $.signalR.connectionState.connected:
    //                 rest.connected();
    //                 // your code here
    //                 break;
    //             case $.signalR.connectionState.reconnecting:
    //                 rest.reconnecting();
    //                 // your code here
    //                 break;
    //             case $.signalR.connectionState.disconnected:
    //                 rest.disconnected();
    //                 // your code here
    //                 break;
    //             default:
    //                 // ...
    //                 break;
    //         }
    //     },
    //     withCredentials: false,
    //     useSharedConnection: false,
    //     autoConnect: false
    // });

    function connect() {
        try {
            // 已連線
            if (connection.state === 1) {
                $rootScope.$broadcast('connected');
                return;
            }
            connection.start().then(function (res) {
                console.log("connected", res);
                $rootScope.$broadcast('connected');
            }).catch((err) => {
                console.log('connect failed', err, connection.state);
            });
        } catch (error) {
            console.log('connect error', error, connection.state);
        }
        // hub.connect();
    }
    function disconnect() {
        // hub.disconnect();
    }

    function getWhiteBoard(hospitalId) {
        console.log('call GetWhiteBoard!!!!');
        connection.invoke('GetWhiteBoard', hospitalId).then((res) => {
            console.log('GetWhiteBoard', res);
        }).catch(function (err) {
            return console.error(err.toString());
        });
        // hub.GetWhiteBoard();
    }

    function get(isForce) {
        const deferred = $q.defer();

        if (moment(lastAccessTime).add(5, 'm') > moment() && !isForce && lastTexts) {
            const res = {};
            res.data = lastTexts;
            deferred.resolve(res);
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: `${serverUrl}/api/WhiteBoard`
        }).then((res) => {
            lastAccessTime = Date.now();
            lastTexts = res.data;
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 新增
    function post(postData) {
        const deferred = $q.defer();
        $http({
            method: 'post',
            data: postData,
            url: `${serverUrl}/api/WhiteBoard`
        }).then((res) => {
            lastTexts.push(postData);
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    // 修改
    function put(postData) {
        const deferred = $q.defer();
        $http({
            method: 'put',
            data: postData,
            url: `${serverUrl}/api/WhiteBoard`
        }).then((res) => {
            // 如果現有陣列中己經有該筆資料了, 則換掉
            // 以利回到上一頁時可以直接取用整個陣列
            if (lastTexts) {
                const index = _.findIndex(lastTexts, ['Id', postData.Id]);
                lastTexts[index] = res.data;
            }
            deferred.resolve(res);
        }, (res) => {
            deferred.reject(res);
        });

        return deferred.promise;
    }

    return rest;
}

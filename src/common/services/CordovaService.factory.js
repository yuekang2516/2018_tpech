angular
    .module('app')
    .factory('CordovaService', CordovaService);

CordovaService.$inject = ['$q'];

function CordovaService($q) {
    const plugins = {
        // get Cordova device info
        // document: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device/index.html#properties
        device: device,
    };


    return plugins;
}

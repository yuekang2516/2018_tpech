/*
Created: 2017/10/23
Author: Terry
Component: iosFab
Function: FAB for IOS devices where it need to scan NFC.
*/

import tp1 from './iosFab.html';

angular.module('app').component('iosFab', {
    template: tp1,
    bindings: {
        add: '&',
        nfc: '&'
    }
});
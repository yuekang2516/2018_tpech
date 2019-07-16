
angular
.module('app')
.factory('SessionStorageService', SessionStorageService);

SessionStorageService.$inject = ['$state', '$q', '$localStorage', '$sessionStorage', '$http', '$filter'];

function SessionStorageService($state, $q, $localStorage, $sessionStorage, $http, $filter) {
    
    const $translate = $filter('translate');
    const setting = {
        setItem,
        getItem,
        deleteItem
    };

    function setItem(key, value) {
        if (!$sessionStorage[key]) {
            $sessionStorage[key] = {};
        }
        $sessionStorage[key] = value;
    }

    function getItem(key) {
        return $sessionStorage[key];
    }

    function deleteItem(key) {
        delete $sessionStorage[key];
    }

    return setting;
}
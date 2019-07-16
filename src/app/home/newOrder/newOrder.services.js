angular.module("app").factory('NewOrderService', NewOrderService);

NewOrderService.$inject = ['$http', '$q'];
function NewOrderService($http, $q) {
  const rest = {};

  rest.get = function get() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/app/newOrder/newOrder.fake.json'
    }).then((res) => {
      const t = setTimeout(() => {
        deferred.resolve(res);
        clearTimeout(t);
      }, 1000);
    }, (res) => {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  return rest;
}

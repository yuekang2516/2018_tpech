describe("\033[47;34mTestService測試\033[0m", function () {

  beforeEach(module("app"));

  var TestService, $httpBackend;

  var demoApiDataStruct = [
    {
      "id": 1,
      "name": "cup"
    },
    {
      "id": 2,
      "name": "spoon"
    },
    {
      "id": 3,
      "name": "fork"
    }
  ];

  beforeEach(inject(function (_TestService_, _$httpBackend_) {
    TestService = _TestService_;
    $httpBackend = _$httpBackend_;
  }));

  describe("get 取資料", function () {

    it("確認API有被呼叫", function () {
      $httpBackend.whenGET("https://jsonplaceholder.typicode.com/users").respond(demoApiDataStruct);
      expect(TestService.get()).toBeDefined();
    });

    it("確認返回陣列資料", function () {
      $httpBackend.whenGET("https://jsonplaceholder.typicode.com/users").respond(demoApiDataStruct);
      var promise = TestService.get();
      var theFruits = null;

      promise.then(function (res) {
        theFruits = res.data;
      });
      $httpBackend.flush();
      expect(theFruits instanceof Array).toBeTruthy();
    });
    it("確認有處理error事件", function () {
      $httpBackend.whenGET("https://jsonplaceholder.typicode.com/users").respond(500);
      var promise = TestService.get();
      var result = null;

      promise.then(function (res) {
        result = res.data;
      }, function (errObj) {
        result = errObj;
      });
      $httpBackend.flush();
      expect(result.status).toBe(500);
    });
  });

});
describe('\033[47;34m元件測試: test\033[0m', function () {
  //必要載入模組
  beforeEach(module('app'));

  describe('元件的顯示: ', function () {
    var element;
    var $httpBackend;
    var scope;
    var fakeJsonStr = '[{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}},{"id":6,"name":"Mrs. Dennis Schulist","username":"Leopoldo_Corkery","email":"Karley_Dach@jasper.info","address":{"street":"Norberto Crossing","suite":"Apt. 950","city":"South Christy","zipcode":"23505-1337","geo":{"lat":"-71.4197","lng":"71.7478"}},"phone":"1-477-935-8478 x6430","website":"ola.org","company":{"name":"Considine-Lockman","catchPhrase":"Synchronised bottom-line interface","bs":"e-enable innovative applications"}},{"id":7,"name":"Kurtis Weissnat","username":"Elwyn.Skiles","email":"Telly.Hoeger@billy.biz","address":{"street":"Rex Trail","suite":"Suite 280","city":"Howemouth","zipcode":"58804-1099","geo":{"lat":"24.8918","lng":"21.8984"}},"phone":"210.067.6132","website":"elvis.io","company":{"name":"Johns Group","catchPhrase":"Configurable multimedia task-force","bs":"generate enterprise e-tailers"}},{"id":8,"name":"Nicholas Runolfsdottir V","username":"Maxime_Nienow","email":"Sherwood@rosamond.me","address":{"street":"Ellsworth Summit","suite":"Suite 729","city":"Aliyaview","zipcode":"45169","geo":{"lat":"-14.3990","lng":"-120.7677"}},"phone":"586.493.6943 x140","website":"jacynthe.com","company":{"name":"Abernathy Group","catchPhrase":"Implemented secondary concept","bs":"e-enable extensible e-tailers"}},{"id":9,"name":"Glenna Reichert","username":"Delphine","email":"Chaim_McDermott@dana.io","address":{"street":"Dayna Park","suite":"Suite 449","city":"Bartholomebury","zipcode":"76495-3109","geo":{"lat":"24.6463","lng":"-168.8889"}},"phone":"(775)976-6794 x41206","website":"conrad.com","company":{"name":"Yost and Sons","catchPhrase":"Switchable contextually-based project","bs":"aggregate real-time technologies"}},{"id":10,"name":"Clementina DuBuque","username":"Moriah.Stanton","email":"Rey.Padberg@karina.biz","address":{"street":"Kattie Turnpike","suite":"Suite 198","city":"Lebsackbury","zipcode":"31428-2261","geo":{"lat":"-38.2386","lng":"57.2232"}},"phone":"024-648-3804","website":"ambrose.net","company":{"name":"Hoeger LLC","catchPhrase":"Centralized empowering task-force","bs":"target end-to-end models"}}]';
    var fakeJson = JSON.parse(fakeJsonStr);

    // 注入元件(如果有外部參數在這邊一併載入)
    beforeEach(inject(function ($rootScope, $compile, _$httpBackend_) {
      scope = $rootScope.$new();

      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('https://jsonplaceholder.typicode.com/users').respond(200, fakeJson);

      element = angular.element('<test pass-val={{outside}}></test>');
      element = $compile(element)(scope);


      scope.outside = 'Andersen';
      scope.$apply();

      $httpBackend.flush();


    }));

    // 檢驗元件畫面的呈現
    it('HTML應該顯示: hello Andersen', function () {
      var h1 = element.find('h1');
      expect(h1.text()).toBe('hello Andersen');
    });
  });


  describe('元件的Controller: ', function () {
    var controller;
    var $httpBackend;
    var scope;
    var fakeJson = [
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

    //注入元件的Controller
    beforeEach(inject(function ($rootScope, $componentController, _$httpBackend_) {
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('https://jsonplaceholder.typicode.com/users').respond(200, fakeJson);

      controller = $componentController('test', { $scope: scope });

    }));

    //檢驗Controller的Scope變數值
    it('controller.testVar必須初始且值應為: hello', function () {

      //檢驗是否有定義
      expect(controller.testVar).toBeDefined();

      //檢驗值
      expect(controller.testVar).toEqual('hello');
    });




    //檢驗方法呼叫的結果
    it('controller.testFunc(obj)方法呼叫回傳必須為: boy / girl', function () {
      var check1 = controller.testFunc({ sex: 0 });
      var check2 = controller.testFunc({ sex: 1 });
      expect(check1).toEqual('girl');
      expect(check2).toEqual('boy');
    });

    //檢驗component中Services呼叫的結果
    it('controller.testData 透過在$onInit呼叫Services回傳資料陣列必須有長度', function () {
      controller.$onInit();
      $httpBackend.flush();
      expect(controller.testData.length).toBeGreaterThan(2);
    });

  });

});
describe('\033[47;34m元件測試: ward\033[0m', function () {
    // 必要載入模組
    beforeEach(module('app'));
    beforeEach(module('templates'));

    describe('元件的顯示: ', function () {
        var element;
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

        // 注入元件(如果有外部參數在這邊一併載入)
        beforeEach(inject(function ($rootScope, $compile, _$httpBackend_) {
            scope = $rootScope.$new();

            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('http://localhost:8888/test').respond(200, fakeJson);

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

        // 注入元件的Controller
        beforeEach(inject(function ($rootScope, $componentController, _$httpBackend_) {
            scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('http://localhost:8888/test').respond(200, fakeJson);

            controller = $componentController('test', { $scope: scope });

        }));

        // 檢驗Controller的Scope變數值
        it('controller.testVar必須初始且值應為: hello', function () {

            // 檢驗是否有定義
            expect(controller.testVar).toBeDefined();

            // 檢驗值
            expect(controller.testVar).toEqual('hello');
        });

        // 檢驗方法呼叫的結果
        it('controller.testFunc(obj)方法呼叫回傳必須為: boy / girl', function () {
            var check1 = controller.testFunc({ sex: 0 });
            var check2 = controller.testFunc({ sex: 1 });
            expect(check1).toEqual('girl');
            expect(check2).toEqual('boy');
        });

        // 檢驗component中Services呼叫的結果
        it('controller.testData 透過在$onInit呼叫Services回傳資料陣列必須有長度', function () {
            controller.$onInit();
            $httpBackend.flush();
            expect(controller.testData.length).toBeGreaterThan(2);
        });
    });
});
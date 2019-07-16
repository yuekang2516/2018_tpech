describe('\033[35m開藥功能測試\033[0m', function () {
	//必要載入模組
	beforeEach(module('app'));
	beforeEach(module('templates'));

	describe('列表顯示: ', function () {
		var element;
		var $httpBackend;
		var scope;
		var serverApiUrl;
		var stateParams
		var fakeJson = [
			{
				"Name": "Buscopan",
				"StartDate": "2017-01-20 15:38:58.424",
				"Quantity": "1",
				"QuantityUnit": "Amp",
				"TotalQuantity": "1",
				"Days": "1",
				"Frequency": "QN",
				"Route": "PO",
				"Memo": null,
				"CategoryName": "6樓 注射針劑"
			}
		];

		//注入元件(如果有外部參數在這邊一併載入)
		beforeEach(inject(function ($rootScope, $componentController, _$httpBackend_, $stateParams) {
			scope = $rootScope.$new();

			controller = $componentController('prescribingRecord', { 
				$scope: scope
			 })
		}));

		it('Mode should be fun', function(){  //write tests
            expect(controller.myCategoryName).toBe('All'); //pass
        });

		// it('controller.Data 透過在$onInit呼叫Services回傳資料陣列必須有長度', function () {
		// 	controller.$onInit();
		// 	$httpBackend.flush();
		// 	expect(controller.serviceData.length).toBeGreaterThan(1);
		// });

	})
})
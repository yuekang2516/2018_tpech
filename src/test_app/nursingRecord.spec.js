describe('\033[47;34m護理紀錄測試: \033[0m', function () {
  //必要載入模組
  beforeEach(module('app'));
  beforeEach(module('templates'));

  describe('元件的顯示: ', function () {
    var element;
    var $httpBackend;
    var scope;
    var controller;

    // 列表 demoData
    var fakeJson = [
      {
        "DateTimestamp": "2017-01-23T07:45:16.5153503+00:00",
        "PatientId": "57722b1b00977e113c1eb774",
        "RelativeId": "5799c5cc27920c306cc3b6f0",
        "Content": "12121212",
        "NursingTime": "2017-01-23T02:27:33.142Z",
        "SourceId": null,
        "SourceType": null,
        "HospitalId": "56fcc5dd4ead7870942f61c3",
        "Status": "Deleted",
        "CreatedUserId": "570600fdd53d3c61d6794f95",
        "CreatedUserName": null,
        "CreatedTime": "2017-01-23T02:28:39.104Z",
        "ModifiedUserId": "570600fdd53d3c61d6794f95",
        "ModifiedUserName": "管理者",
        "ModifiedTime": "2017-01-23T03:02:51.397Z",
        "Id": "58856a57910d783a1c885f9c"
      }, {
        "DateTimestamp": "2017-01-23T07:45:16.5153503+00:00",
        "PatientId": "57722b1b00977e113c1eb774",
        "RelativeId": "5799c5cc27920c306cc3b6f0",
        "Content": "454535435",
        "NursingTime": "2017-01-20T09:26:56.733Z",
        "SourceId": null,
        "SourceType": null,
        "HospitalId": "56fcc5dd4ead7870942f61c3",
        "Status": "Deleted",
        "CreatedUserId": "570600fdd53d3c61d6794f95",
        "CreatedUserName": null,
        "CreatedTime": "2017-01-20T09:27:04.187Z",
        "ModifiedUserId": "570600fdd53d3c61d6794f95",
        "ModifiedUserName": "管理者",
        "ModifiedTime": "2017-01-20T09:29:11.244Z",
        "Id": "5881d805a6e10c2d14c1cd1c"
      }, {
        "DateTimestamp": "2017-01-23T07:45:16.5153503+00:00",
        "PatientId": null,
        "RelativeId": "5799c5cc27920c306cc3b6f0",
        "Content": "關表內容",
        "NursingTime": "2016-07-29T02:31:41.199Z",
        "SourceId": "5799c5cc27920c306cc3b6f0",
        "SourceType": "DialysisHeader",
        "HospitalId": "56fcc5dd4ead7870942f61c3",
        "Status": "Normal",
        "CreatedUserId": null,
        "CreatedUserName": "系統-Dialysis_Closed",
        "CreatedTime": "2016-07-29T02:31:41.199Z",
        "ModifiedUserId": null,
        "ModifiedUserName": null,
        "ModifiedTime": null,
        "Id": "579ac00d27920c306cc3bb5f"
      }, {
        "DateTimestamp": "2017-01-23T07:45:16.5153503+00:00",
        "PatientId": null,
        "RelativeId": "5799c5cc27920c306cc3b6f0",
        "Content": "10:12 開始接受血液透析，預定 {hemodialysis}(H/D)     小時，脫水：  {DehydrationTarget}  公斤，BF： {B" +
            "Fvalue}  ml/min， {HeparinMaintainString}，N/S共沖 *** ml。\n11:00",
        "NursingTime": "2016-07-29T02:13:07.925Z",
        "SourceId": "579abbb227920c306cc3baac",
        "SourceType": "DialysisData",
        "HospitalId": "56fcc5dd4ead7870942f61c3",
        "Status": "Normal",
        "CreatedUserId": null,
        "CreatedUserName": "系統-Dialysis_FirstData",
        "CreatedTime": "2016-07-29T02:13:07.925Z",
        "ModifiedUserId": null,
        "ModifiedUserName": null,
        "ModifiedTime": "2017-01-20T06:54:58.449Z",
        "Id": "579abbb427920c306cc3baae"
      }
    ];

    var postJson = [
      {
        Content: "這一筆是測試資料",
        CreatedUserId: "570600fdd53d3c61d6794f95",
        CreatedUserName: "管理者",
        HospitalId: "56fcc5dd4ead7870942f61c3",
        NursingTime: "Thu Jan 26 2017 10:47:00 GMT+0800",
        PatientId: "57722b1b00977e113c1eb774",
        RelativeId: "5799c5cc27920c306cc3b6f0"
      }
    ];

    var putJson = [
      {
        Content: "這一筆是測試資料",
        CreatedUserId: "570600fdd53d3c61d6794f95",
        CreatedUserName: "管理者",
        HospitalId: "56fcc5dd4ead7870942f61c3",
        NursingTime: "Thu Jan 26 2017 10:47:00 GMT+0800",
        PatientId: "57722b1b00977e113c1eb774",
        RelativeId: "5799c5cc27920c306cc3b6f0",
        Id: "58896366910d783a1c886631"
      }
    ];

    beforeEach(inject(function ($rootScope, $compile, $componentController, _$httpBackend_, moment, _NursingRecordService_) {
      scope = $rootScope.$new();

      $httpBackend = _$httpBackend_;
      NursingRecordService = _NursingRecordService_;

      $httpBackend
        .whenGET('http://dialysissystem.azurewebsites.net/api/nursingrecord/')
        .respond(200, fakeJson);

      controller = $componentController('nursingRecord', {$scope: scope});
    }));

    it("確認查詢API有被呼叫", function () {
      $httpBackend
        .whenGET("http://dialysissystem.azurewebsites.net/api/nursingrecord/")
        .respond(fakeJson);
      expect(NursingRecordService.get()).toBeDefined();
    });

    it('護理紀錄預設不顯示已經刪除紀錄 item.Status !== Deleted', function () {
      expect(controller.status).toBeDefined();
      //檢驗值
      expect(controller.status).toEqual('Deleted');
    });

    it('護理紀錄時間顯示格式是否正常: YYYY-MM-DD (一) HH:mm', function () {
      var check1 = controller._handleTransformNursingTime(new Date());
      var regex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s\((一|二|三|四|五|六)\)\s(2[0-3]|[01][0-9]):[0-5][0-9]/;

      expect(regex.test(check1)).toBeTrue();
    });

    it("確認刪除功能", function () {
      $httpBackend
        .whenDELETE("http://dialysissystem.azurewebsites.net/api/nursingrecord/", "DELETE")
        .respond(200, fakeJson);

      expect(NursingRecordService.del()).toBeDefined();
    });

    it("確認修改API有被呼叫", function () {
      $httpBackend
        .when('GET', 'http://dialysissystem.azurewebsites.net/api/nursingrecord/')
        .respond({id: '5887161d910d783a1c8862df'});
      expect(NursingRecordService.getById()).toBeDefined();
    });

    it("新增一筆測試資料", function () {
      $httpBackend
        .whenPOST('http://dialysissystem.azurewebsites.net/api/nursingrecord/', "POST")
        .respond(postJson);
      expect(NursingRecordService.post()).toBeDefined();
    });

    it("修改一筆測試資料", function () {
      $httpBackend
        .whenPUT('http://dialysissystem.azurewebsites.net/api/nursingrecord/', "PUT")
        .respond(putJson);
      expect(NursingRecordService.put()).toBeDefined();
    });

  });
});
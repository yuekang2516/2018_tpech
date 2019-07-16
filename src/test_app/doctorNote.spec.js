describe('\033[47;34m醫囑測試: \033[0m', function () {
	  //必要載入模組
  beforeEach(module('app'));
  beforeEach(module('templates'));

	describe('元件的顯示: ', function () {
    var element;
    var $httpBackend;
    var scope;
    var controller;

    var postJson = [
      {
				HospitalId : "56fcc5dd4ead7870942f61c3",
				CreatedUserId : "570600fdd53d3c61d6794f95",
				CreatedUserName : "管理者",
				PatientId : "577dffb527920c2dec67e554",
				DialysisId : "578de020a6e10c243cbf8c82",
				Content : "44344334434434"
      }
    ];

    var putJson = [
      {
        Content: "這一筆是測試資料",
        CreatedUserId: "570600fdd53d3c61d6794f95",
        CreatedUserName: "管理者",
        HospitalId: "56fcc5dd4ead7870942f61c3",
        PatientId: "57722b1b00977e113c1eb774",
        DialysisId: "5799c5cc27920c306cc3b6f0"
        Id: "58993c11a6e10c1ae0f26319"
      }
    ];

    beforeEach(inject(function ($rootScope, $compile, $componentController, _$httpBackend_, moment, _DoctorNoteService_) {
      scope = $rootScope.$new();

      $httpBackend = _$httpBackend_;
      DoctorNoteService = _DoctorNoteService_;
    }));


    it("查詢一筆醫囑資料", function () {
      $httpBackend
        .when('GET', 'http://dialysissystem.azurewebsites.net/api/doctorNote/')
        .respond({id: '578de020a6e10c243cbf8c82'});
      expect(DoctorNoteService.getById()).toBeDefined();
    });

    it("新增一筆測試資料", function () {
      $httpBackend
        .whenPOST('http://dialysissystem.azurewebsites.net/api/doctorNote/', "POST")
        .respond(postJson);
      expect(NursingRecordService.post()).toBeDefined();
    });

    it("修改一筆測試資料", function () {
      $httpBackend
        .whenPUT('http://dialysissystem.azurewebsites.net/api/doctorNote/', "PUT")
        .respond(putJson);
      expect(NursingRecordService.put()).toBeDefined();
    });

  });

});
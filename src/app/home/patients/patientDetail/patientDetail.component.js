import './patientDetail.less';

import chineseId from '../../../../common/validId/chinaIDValid';
import taiwanId from '../../../../common/validId/taiwanIDValid';
import hongKongId from '../../../../common/validId/hongKongIDValid';
import addPatientDialogTpl from './addpatientDialog.html';

const tpl = require('./patientDetail.html');

angular.module('app').component('patientDetail', {
    template: tpl,
    controller: PatientDetailController,
    controllerAs: 'vm'
});

PatientDetailController.$inject = ['$q', '$scope', '$rootScope', '$mdDialog', '$state', 'PatientService',
    '$stateParams', 'wardService', 'SettingService', '$mdMedia', 'showMessage', '$timeout',
    'Upload', 'nfcService', 'infoService', '$filter', 'medicineService', 'userService', 'tpechService'];

function PatientDetailController($q, $scope, $rootScope, $mdDialog, $state, PatientService, $stateParams,
    wardService, SettingService, $mdMedia, showMessage, $timeout,
    Upload, nfcService, infoService, $filter, medicineService, userService, tpechService) {
    const vm = this;
    console.log($stateParams);
    let $translate = $filter('translate');
    // 檢查欄位
    let fieldObj = {};
    // get current language
    vm.language = SettingService.getLanguage();
    vm.patient = {};
    vm.loading = false;

    // 醫院統一從造管醫院來
    vm.catheterHospitals = SettingService.getHospitalSettings();

    vm.BloodTypes = ['A', 'B', 'AB', 'O', $translate('patientDetail.component.unknown')];
    vm.Rh = ['+', '-'];
    vm.Genders = [$translate('patientDetail.male'), $translate('patientDetail.female')];
    vm.EntryModes = [
        $translate('patientDetail.component.stretcher'),
        $translate('patientDetail.component.wheelchair'),
        $translate('patientDetail.component.walk'),
    ];
    // 原發病大類
    vm.primaryDiseaseList = {
        A: 'A 腎臟實質疾病',
        B: 'B 系統性疾病',
        C: 'C 阻塞性腎病變及泌尿系統疾病',
        D: 'D 腎血管病變',
        E: 'E 遺傳性疾病',
        F: 'F 其他已知原因腎衰竭',
        G: 'G 不明原因之腎衰竭',
        H: 'H 中毒',
        I: 'I 其他'
    };

    // 原發病細類
    vm.primaryDiseaseDetailList = {
        'A-01A': 'A-01A 慢性腎絲球腎炎(臨床診斷，未有病理切片者)',
        'A-01B': 'A-01B 慢性腎絲球腎炎(有病理切片診斷者)',
        'A-01B-a': 'A-01B-a A型免疫球蛋白腎炎',
        'A-01B-b': 'A-01B-b 局部腎絲球硬化症',
        'A-01B-c': 'A-01B-c 膜性腎病變',
        'A-01B-d': 'A-01B-d 膜性增生性腎炎',
        'A-01B-e': 'A-01B-e 間質增生性腎炎',
        'A-01B-f': 'A-01B-f 微小變化型腎病變',
        'A-01B-g': 'A-01B-g 半月狀腎絲球腎炎',
        'A-01B-h': 'A-01B-h 鏈球菌感染後腎絲球腎炎',
        'A-01B-i': 'A-01B-i 腎小管組織腎炎',
        'A-01B-j': 'A-01B-j 止痛劑性腎病變',
        'A-01B-k': 'A-01B-k 其他型腎絲球腎炎',
        'A-02A': 'A-02A 快速進行性腎絲球腎炎(臨床診斷，未有病理切片者)',
        'A-02B': 'A-02B 快速進行性腎絲球腎炎(有病理切片診斷者)',
        'A-03A': 'A-03A 慢性腎間質性腎炎(臨床診斷，未有病理切片者)',
        'A-03A-a': 'A-03A-a 中藥引起之慢性腎間質性腎炎(臨床診斷，未有病理切片者)',
        'A-03B': 'A-03B 慢性腎間質性腎炎(有病理切片診斷者)',
        'A-03B-a': 'A-03B-a 中藥引起之慢性腎間質性腎炎(有病理切片診斷者)',
        'A-04': 'A-04 慢性腎孟腎炎',
        'A-05': 'A-05 急性腎衰竭(未恢復)',
        'A-06': 'A-06 其他腎實質疾病',
        'B-01': 'B-01 腎硬化症（缺血性腎病變）',
        'B-02': 'B-02 惡性高血壓',
        'B-03': 'B-03 糖尿病',
        'B-04': 'B-04 紅斑性狼瘡',
        'B-05': 'B-05 類澱粉腎病變',
        'B-06': 'B-06 硬皮症',
        'B-07': 'B-07 多發性骨髓病',
        'B-08': 'B-08 痛風性腎病變',
        'B-09': 'B-09 肝硬化',
        'B-10': 'B-10 心衰竭',
        'B-11': 'B-11 妊娠毒血症',
        'B-12': 'B-12 其他代謝異常引起的腎衰竭',
        'B-13': 'B-13 其他系統性疾病引起之腎衰竭',
        'B-14': 'B-14 敗血症',
        'C-01': 'C-01 結石',
        'C-02': 'C-02 腎結核',
        'C-03': 'C-03 腎尿路惡性腫瘤',
        'C-04': 'C-04 其他惡性腫病導致之尿路阻塞',
        'C-05': 'C-05 逆流性腎病變',
        'C-06': 'C-06 其他原因引起之阻塞性腎病變',
        'D-01': 'D-01 腎梗塞',
        'D-02': 'D-02 腎動脈栓塞',
        'D-03': 'D-03 腎靜脈血栓症',
        'D-04': 'D-04 溶血性尿毒症候群',
        'D-05': 'D-05 其他腎血管疾病',
        'E-01': 'E-01 多囊腎',
        'E-02': 'E-02 其他腎囊腫性疾病',
        'E-03': 'E-03 遺傳性腎炎',
        'E-04': 'E-04 腎形成不全',
        'E-05': 'E-05 其他遺傳性疾病導致腎衰竭',
        'F': 'F 其他已知原因腎衰竭',
        'G': 'G 不明原因之腎衰竭',
        'H-01': 'H-01 一般藥物中毒',
        'H-02': 'H-02 農藥中毒',
        'H-03': 'H-03 化學製劑中毒',
        'H-04': 'H-04 其他中毒',
        'I-01': 'I-01 其他'
    };

    vm.user = SettingService.getCurrentUser();
    console.log(SettingService.getCurrentHospital());
    // 預設時間格式
    vm.datetimepickerOption = {
        format: 'YYYY-MM-DD'
    };
    vm.patientId = $stateParams.patientId;
    vm.loadingPicture = false;
    vm.today = moment().format('YYYY-MM-DD'); // input date type max

    // 預設身分別
    vm.Identity = [{
        id: 'IDNumber',
        value: $translate('patientDetail.component.IDNumber')
    }, {
        id: 'OtherDocuments',
        value: $translate('patientDetail.component.OtherDocuments')
    }];

    // 婚姻狀況
    vm.MaritalStr = ['未婚', '已婚', '其他'];

    // 教育
    vm.EducationStr = ['無', '小學', '國中', '高中(職)', '五專.二專', '三專.大學', '研究所', '不詳'];

    // 死亡地點
    vm.deathPlace = ['醫院', '透析單位', '家中'];
    // 辨識環境
    vm.device = cordova.platformId === 'browser';
    let pictureSource;
    let destinationType;

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    // 存檔是否覆蓋，BarCode、

    vm.$onInit = function $onInit() {

        // 先取得醫生選項
        // 先取得死亡原因選項
        let executeArray = []; // $q.all執行的陣列
        // 1.醫生選項  2.死亡原因選項

        // 新增不需比對主治醫生是否仍在後台設定，因此可以同時 call
        if (!vm.patientId) {
            executeArray.push(getDoctorList()); // 1.醫生選項
        }
        executeArray.push(getDeathReasonList()); // 2.死亡原因選項

        $q.all(executeArray).then(() => {

            // 如果有病人ID, 表示為修改, 則去抓一次基本資料
            // todo 未來可修改為直接從列表傳過來即可
            if (vm.patientId) {
                PatientService.getById(vm.patientId).then((d) => {
                    // 依所屬病房取得床號
                    getBedNosByWard(d.data.WardId);

                    getAllergicHistory(d.data.MedicalId);

                    console.log('AttendingPhysician', d.data.AttendingPhysician);
                    // 處理手輸醫院
                    // 首次透析醫院
                    if (d.data.FirstDialysisHospital) {
                        if (!Object.hasProperty(vm.catheterHospitals, 'DialysisSetting.CatheterHospitals')) {
                            vm.catheterHospitals.DialysisSetting = { CatheterHospitals: [] };
                        }
                        // 若不存在則 push 進選單裡
                        if (vm.catheterHospitals.DialysisSetting.CatheterHospitals.indexOf(d.data.FirstDialysisHospital) === -1) {
                            vm.catheterHospitals.DialysisSetting.CatheterHospitals.push(d.data.FirstDialysisHospital);
                        }
                    }
                    // 轉外科腎臟移植醫院
                    if (d.data.OrganTransplantHospital) {
                        if (!Object.hasProperty(vm.catheterHospitals, 'DialysisSetting.CatheterHospitals')) {
                            vm.catheterHospitals.DialysisSetting = { CatheterHospitals: [] };
                        }
                        // 若不存在則 push 進選單裡
                        if (vm.catheterHospitals.DialysisSetting.CatheterHospitals.indexOf(d.data.OrganTransplantHospital) === -1) {
                            vm.catheterHospitals.DialysisSetting.CatheterHospitals.push(d.data.OrganTransplantHospital);
                        }
                    }

                    // input type date 綁定的 value 須為 date 型態
                    d.data.Birthday = new Date(d.data.Birthday);
                    d.data.DeathDate = new Date(moment(d.data.DeathDate).format('YYYY-MM-DD'));
                    d.data.StateChangedDate = new Date(moment(d.data.StateChangedDate).format('YYYY-MM-DD HH:mm:ss'));
                    d.data.FirstDialysisDate = new Date(moment(d.data.FirstDialysisDate).format('YYYY-MM-DD'));
                    d.data.FirstPDDate = new Date(moment(d.data.FirstPDDate).format('YYYY-MM-DD'));
                    d.data.FirstDialysisDateInHospital = new Date(moment(d.data.FirstDialysisDateInHospital).format('YYYY-MM-DD'));
                    d.data.OrganTransplantDate = new Date(moment(d.data.OrganTransplantDate).format('YYYY-MM-DD'));
                    d.data.TransferCAPDDate = new Date(moment(d.data.TransferCAPDDate).format('YYYY-MM-DD'));
                    d.data.HandicapHandbook = new Date(moment(d.data.HandicapHandbook).format('YYYY-MM-DD'));
                    d.data.StartDate1 = new Date(moment(d.data.StartDate1).format('YYYY-MM-DD'));
                    d.data.EndDate1 = new Date(moment(d.data.EndDate1).format('YYYY-MM-DD'));
                    d.data.StartDate2 = new Date(moment(d.data.StartDate2).format('YYYY-MM-DD'));
                    d.data.EndDate2 = new Date(moment(d.data.EndDate2).format('YYYY-MM-DD'));

                    vm.patient = angular.copy(d.data);
                    getDoctorList();

                    // DNR 註記轉換
                    convertDNRFlag(d.data.DNRFlag);

                    // DNR 同意書轉換
                    convertDNRConsent(d.data.DNRConsent);

                    if (!vm.patient.AllergicMedicine) {
                        vm.patient.AllergicMedicine = [];
                    }
                    if (!vm.patient.Phone) {
                        vm.patient.Phone = ['', '']; // 固定第一個存家裡電話，第二個存手機
                    }
                    if (!vm.patient.DeliveryAddress) {
                        vm.patient.DeliveryAddress = [];
                    }
                    if (!vm.patient.ContactPhone1) {
                        vm.patient.ContactPhone1 = [];
                    }
                    if (!vm.patient.ContactPhone2) {
                        vm.patient.ContactPhone2 = [];
                    }
                    // vm.Phone1 = vm.patient.Phone[0];
                    // vm.Phone2 = vm.patient.Phone[1];
                    // vm.Phone3 = vm.patient.Phone[2];
                    vm.DeliveryAddress1 = vm.patient.DeliveryAddress[0];
                    vm.DeliveryAddress2 = vm.patient.DeliveryAddress[1];
                    vm.DeliveryAddress3 = vm.patient.DeliveryAddress[2];
                    vm.ContactPhone11 = vm.patient.ContactPhone1[0];
                    vm.ContactPhone12 = vm.patient.ContactPhone1[1];
                    vm.ContactPhone13 = vm.patient.ContactPhone1[2];
                    vm.ContactPhone21 = vm.patient.ContactPhone2[0];
                    vm.ContactPhone22 = vm.patient.ContactPhone2[1];
                    vm.ContactPhone23 = vm.patient.ContactPhone2[2];
                    // console.log('vm.DeliveryAddress1:', vm.DeliveryAddress1);
                    // console.log('vm.DeliveryAddress2:', vm.DeliveryAddress2);
                    // console.log('vm.DeliveryAddress3:', vm.DeliveryAddress3);
                    // console.log('vm.ContactPhone11:', vm.ContactPhone11);
                    // console.log('vm.ContactPhone12:', vm.ContactPhone12);
                    // console.log('vm.ContactPhone13:', vm.ContactPhone13);
                    // console.log('vm.ContactPhone21:', vm.ContactPhone21);
                    // console.log('vm.ContactPhone22:', vm.ContactPhone22);
                    // console.log('vm.ContactPhone23:', vm.ContactPhone23);
                    // console.log('vm.patient.Birthday => ', vm.patient.Birthday);
                    // 保留一份資料庫已存的資料，好做重複驗證以免檢驗到自己
                    vm.identifierId = d.data.IdentifierId;
                    vm.medicalId = d.data.MedicalId;
                    vm.barcode = d.data.BarCode;
                    vm.rfid = d.data.RFID;
                    vm.photo = d.data.Photo;
                    vm.primaryDisease = d.data.PrimaryDisease;
                    vm.primaryDiseaseDetail = d.data.PrimaryDiseaseDetail;
                    if (d.data.DeathReason != null) {
                        vm.patient.DeathReason = d.data.DeathReason.substring(0, 5);
                        vm.inputDeathReason = d.data.DeathReason.substring(5);
                    }
                    if (d.data.DeathPlace != null) {
                        vm.patient.DeathPlace = d.data.DeathPlace.substring(0, 5);
                        vm.inputDeathPlace = d.data.DeathPlace.substring(5);
                    }
                    if (d.data.Gender != null) {
                        vm.gender = d.data.Gender === "M" ? "男" : "女";
                    }
                    console.log('vm.patient:', vm.patient);
                    if (!vm.patient.IDType) {
                        vm.patient.IDType = 'IDNumber';
                    }
                    if (!vm.device) {
                        document.addEventListener('deviceready', onDeviceReady, false);
                    }

                });
            } else {
                vm.patient = {
                    Tags: [],
                    Phone: ['', '']
                };
                vm.Photo = null;
                vm.patient.IDType = 'IDNumber';
                vm.primaryDisease = null;
                vm.primaryDiseaseDetail = null;
            }


            // 若為 admin(系統初始時的帳號) 一開始不會有透析室
            if (!SettingService.getCurrentUser().Ward) {
                showMessage($translate('patientDetail.component.addWardMessage'));
                return;
            }

            // 透析室選單，若使用者為 admin 則顯示該醫院的所有透析室，若為一般則顯示該使用者負責的透析室
            if (SettingService.getCurrentUser().Access === 99) {
                vm.wards = {};
                wardService.get().then((res) => {
                    // 組 key(Id) and value(Name)
                    _.forEach(res.data, (item) => {
                        vm.wards[item.Id] = item.Name;
                    });
                    vm.keys = Object.keys(vm.wards);

                    // 於新增病人時，若透析室只有一個，WardId 直接賦值並供前端顯示
                    if (!vm.patientId && vm.keys.length === 1) {
                        vm.patient.WardId = vm.keys[0];
                    }
                }, () => {
                    vm.wardErr = true;
                });
            } else {
                vm.wards = SettingService.getCurrentUser().Ward;
                vm.keys = Object.keys(vm.wards);

                // 於新增病人時，若透析室只有一個，WardId 直接賦值並供前端顯示
                if (!vm.patientId && vm.keys.length === 1) {
                    vm.patient.WardId = vm.keys[0];
                }
            }



        }).catch(() => {
            console.log('q.all catch');

            showMessage($translate('customMessage.serverError')); // lang.ComServerError

        }).finally(() => {
            self.loading = false;
        });


        // 同時listen tag & Ndef 事件，Ndef卡只會進入 Ndef，因此也需監測 Ndef
        nfcService.listenTag(_loadByRfid);
        nfcService.listenNdef(_loadByRfid);

        document.addEventListener('volumeupbutton', scanBarCode);
        document.addEventListener('volumedownbutton', scanBarCode);
        document.addEventListener('keydown', keydown);

        // 取得死亡原因選項
        // infoService.get().then((res) => {
        //     vm.deathReasonSetting = res.data.DeathReasonSetting.Records.Items;
        // });

    };

    // 已停用的清單
    vm.notInListDoctor = [];
    // 取得醫生選項，固定第一個存 HD, 第二個存 PD
    vm.notInListFlag = [false, false];
    function getDoctorList() {
        const deferred = $q.defer();

        // AttendingPhysician
        // PDAttendingPhysician
        userService.get().then((q) => {
            console.log('取得所有使用者 q', q);
            vm.doctorList = _.filter(q.data, function (o) {
                return (o.Role === 'doctor' && o.Access != '0');
            });

            if (_.find(vm.doctorList, { Id: vm.patient.AttendingPhysician })) {
                vm.notInListFlag[0] = false;

            } else {
                vm.notInListFlag[0] = true;
                q.data.forEach((v) => {
                    if (v.Id === vm.patient.AttendingPhysician && !_.find(vm.doctorList, { Id: v.Id })) {
                        vm.notInListDoctor.push(v);
                        // 如果有停用醫生再出現停用/未停用字
                        vm.inDoctorList = '未停用';
                        vm.notInList = '停用';
                    }
                });
            }

            if (_.find(vm.doctorList, { Id: vm.patient.PDAttendingPhysician })) {
                vm.notInListFlag[1] = false;
            } else {
                vm.notInListFlag[1] = true;
                q.data.forEach((v) => {
                    if (v.Id === vm.patient.PDAttendingPhysician && !_.find(vm.notInListDoctor, { Id: v.Id })) {
                        vm.notInListDoctor.push(v);
                        // 設定如果有停用醫生再出現停用/未停用字
                        vm.inDoctorList = '未停用';
                        vm.notInList = '停用';
                    }
                });
            }

            console.log('vm.doctorList', vm.doctorList);
            deferred.resolve();
        }, (err) => {
            deferred.reject();
        });

        return deferred.promise;
    }

    // 選擇醫生停用者變換顏色
    vm.changeStyle = function () {
        if (_.find(vm.doctorList, { Id: vm.patient.AttendingPhysician }) || vm.patient.AttendingPhysician == '') {
            vm.notInListFlag[0] = false;
        } else {
            vm.notInListFlag[0] = true;
        }

        if (_.find(vm.doctorList, { Id: vm.patient.PDAttendingPhysician }) || vm.patient.PDAttendingPhysician == '') {
            vm.notInListFlag[1] = false;
        } else {
            vm.notInListFlag[1] = true;
        }

    };
    // 取得死亡原因選項
    function getDeathReasonList() {
        const deferred = $q.defer();

        // 取得死亡原因選項
        infoService.get().then((res) => {
            vm.deathReasonSetting = Object.hasProperty(res.data, 'DeathReasonSetting.Records.Items') ? res.data.DeathReasonSetting.Records.Items : [];
            deferred.resolve();
        }, (err) => {
            deferred.reject();
        });

        return deferred.promise;
    }

    // 取得過敏藥物
    let allergicHistory = [];
    function getAllergicHistory(patno) {
        const deferred = $q.defer();

        allergicHistory = [];
        // 取得死亡原因選項
        tpechService.getMedalrm(patno).then((res) => {
            console.log('getAllergicHistory', res.data);
            allergicHistory = res.data;
            deferred.resolve();
        }, (err) => {
            deferred.resolve(); // 仍可帶入病人基本資料
            showMessage('查此病人的過敏史錯誤：' + err);
        });

        return deferred.promise;
    }

    // 取得後台的床組、床號
    vm.bedGroups = [];
    vm.notExistBedNo = '';  // 供 html 標記用
    function getBedNosByWard(wardId) {
        vm.bedNoMsg = '取得床位資料中...';
        vm.notExistBedNo = '';
        // 讀取該透析室中所有的床位
        wardService.getById(wardId).then((res) => {
            console.log('wardService patient', res);
            vm.bedNoMsg = '';
            if (res.data && Array.isArray(res.data.BedNos) && res.data.BedNos.length > 0) {
                // 先比對目前的病人資料裡的床號是否仍在後台設定裡，若已不再則須 push 到選項裡並給個標記
                if (vm.patient.BedNo) {
                    let idx = res.data.BedNos.indexOf(vm.patient.BedNo);
                    // 已不存在
                    if (idx < 0) {
                        vm.notExistBedNo = vm.patient.BedNo;
                    }
                }

                // 重新組 BedGroups 因為沒分組的不在裡面，需多一組 Name 為 ''的  [{Name:'B', BedNos:['1', '2']}, {Name:'C', BedNos:['3', '4']}]
                let bedGroups = res.data.BedGroups;
                _.forEach(res.data.BedGroups, (value) => {
                    // 砍掉對應到的 BedNo
                    _.forEach(value.BedNos, (bedNo) => {
                        let idx = res.data.BedNos.indexOf(bedNo);
                        if (idx > -1) {
                            res.data.BedNos.splice(idx, 1);
                        }
                    });
                });
                // 若有剩下的塞進 name 為 '' 的物件裡
                if (res.data.BedNos.length > 0) {
                    bedGroups.push({ Name: '未分類', BedNos: res.data.BedNos });
                }
                // 處理已不存在的床號
                if (vm.notExistBedNo) {
                    bedGroups.push({ Name: '已不存在', BedNos: [vm.notExistBedNo] });
                }

                vm.bedGroups = bedGroups;
            }
        }).catch(() => {
            vm.bedNoMsg = '取得透析室床號失敗，請重取';
            // showMessage('取得透析室床號失敗'); // lang.ComServerError
        }).finally(() => {

        });
    }

    vm.changeWard = function (wardId) {
        getBedNosByWard(wardId);
    };

    // 取得 HIS 病人資料
    let patientInfoFromHis = {};
    function getPatientFromHis(patno) {
        const deferred = $q.defer();
        patientInfoFromHis = {};
        tpechService.getPatient(patno).then((res) => {
            if (Array.isArray(res.data) && res.data.length > 0) {
                patientInfoFromHis = res.data[0];
                deferred.resolve();
            } else {
                showMessage('查無此人');
                deferred.reject();
            }
        }, (err) => {
            showMessage(`取得病人資料失敗:${err}`);
            deferred.reject();
        }).finally(() => {
            vm.downloading = false;
        });

        return deferred.promise;
    }


    vm.FieldAdd = function (item) {
        if (item === 'Phone') {
            if (vm.Phone2 === '' || vm.Phone2 === null || vm.Phone2 === undefined) {
                vm.Phone2 = ' ';
            } else {
                vm.Phone3 = ' ';
            }
        } else if (item === 'DeliveryAddress') {
            if (vm.DeliveryAddress2 === '' || vm.DeliveryAddress2 === null || vm.DeliveryAddress2 === undefined) {
                vm.DeliveryAddress2 = ' ';
            } else {
                vm.DeliveryAddress3 = ' ';
            }
        } else if (item === 'ContactPhone1') {
            if (vm.ContactPhone12 === '' || vm.ContactPhone12 === null || vm.ContactPhone12 === undefined) {
                vm.ContactPhone12 = ' ';
            } else {
                vm.ContactPhone13 = ' ';
            }
        } else if (item === 'ContactPhone2') {
            if (vm.ContactPhone22 === '' || vm.ContactPhone22 === null || vm.ContactPhone22 === undefined) {
                vm.ContactPhone22 = ' ';
            } else {
                vm.ContactPhone23 = ' ';
            }
        } else if (item === 'Contact') {
            vm.patient.ContactName2 = ' ';
        } else if (item === 'MajorDiseases') {
            vm.patient.MajorDiseasesNo2 = ' ';
        }
    };

    vm.FieldDel = function (item) {
        if (item === 'Contact') {
            vm.patient.ContactName2 = '';
            vm.patient.ContactRelationship2 = '';
            vm.ContactPhone21 = '';
            vm.ContactPhone22 = '';
            vm.ContactPhone23 = '';
        } else if (item === 'MajorDiseases') {
            vm.patient.MajorDiseasesNo2 = '';
            vm.patient.StartDate2 = null;
            vm.patient.EndDate2 = null;
        }
    };

    // Todo 無法分辨使用者輸入或是掃描，因此其他 input 也能使用掃描功能
    function keydown(ev) {
        // 為了避免影響其他 input 的輸入，只有當 barcode 為 focus 狀態時才做以下動作
        if ($('#barcode').is(':focus')) {
            if (ev.which === 13) {
                $('#barcode').select();
            } else if (ev.which === 27) {
                $timeout(() => {
                    vm.patient.BarCode = '';
                });
            }
        }
    }

    function _loadByRfid(rfid) {
        if (rfid.Id) {
            $timeout(() => {
                vm.patient.RFID = rfid.Id;
            });
        }
    }

    function _loadByBarCode(code) {
        $timeout(() => {
            vm.patient.BarCode = code;
        });
    }

    // 照相機
    function scanBarCode() {
        console.log('scanBarCode() in patientDetail component');
        $('#barcode').select();
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    _loadByBarCode(result.text);
                }
            },
            function (error) {
                alert('patientDetail Scanning failed: ' + error);
            }, {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: $translate('patientDetail.component.QRCodePrompt'), // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417,CODE_39,CODE_128,EAN_8,EAN_13', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'landscape', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    }

    vm.$onDestroy = function () {
        // nfcService.stop();
        // 將之前的 addEventListener 移除, 以免到其他頁還在繼續 listen
        document.removeEventListener('volumeupbutton', scanBarCode);
        document.removeEventListener('volumedownbutton', scanBarCode);
        document.removeEventListener('keydown', keydown);

        if (!vm.device) {
            document.removeEventListener('deviceready', onDeviceReady, false);
        }
    };

    // 選擇異動時間的對話框
    vm.stateChangedDateDialog = function (isChange = false) {
        // 若為新病人則不跳對話
        if (!vm.patientId) {
            return;
        }

        let stateChangedDate = vm.patient.StateChangedDate;
        // 若有變動則自動帶入目前時間
        if (isChange) {
            stateChangedDate = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
        }

        // 若 state 非死亡(9) 則清空死亡原因及死亡時間
        if (vm.patient.State !== '9') {
            vm.patient.DeathDate = null;
            vm.patient.DeathReason = null;
        }

        $mdDialog.show({
            locals: {
                stateChangedDate,
                isChange
            },
            controller: ['stateChangedDate', 'isChange', stateChangedDateDialogController],
            controllerAs: 'state',
            templateUrl: 'stateChangedDate.html',
            clickOutsideToClose: true
        }).then((result) => {
            vm.patient.StateChangedDate = result;
        });

        function stateChangedDateDialogController() {
            const self = this;
            self.stateChangedDate = stateChangedDate;
            self.isChange = isChange;
            self.ok = function () {
                $mdDialog.hide(self.stateChangedDate);
            };
            self.cancel = function () {
                $mdDialog.cancel();
            };

        }
    };

    function onLoadImageFail(message) {
        // showMessage('拍照失败，原因：' + message, null, '警告');
        showMessage($translate('patientDetail.component.imageFail', { msg: message }));
    }

    // 相機過來的格式要轉編譯，直接跑destinationType.DATA_URI有些機器出不來
    function onLoadImageSussess(obj) {
        let size = {
            width: '160',
            height: '160',
            centerCrop: true
        };
        Upload.urlToBlob(obj).then(
            (blob) => {
                Upload.resize(blob, size).then((fb) => {
                    vm.photo = fb;
                    imageUpload();
                });
            }
        );
    }

    // photo to base64
    vm.handleChangeBase64 = function handleChangeBase64() {
        if (!vm.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.CAMERA
            });
        } else {
            imageUpload();
        }
    };

    // photo to base64
    let imageUpload = () => {
        if (vm.photo) {
            $timeout(() => {
                vm.loadingPicture = true;
            });
            Upload.base64DataUrl(vm.photo).then(
                (x) => {
                    vm.photo = vm.patient.Photo = x;
                    vm.loadingPicture = false;
                }
            );
        }
    };


    vm.VaildCallback = (vailed) => {
        if (vailed && vailed.success) {
            if (!vm.patient.Gender && vailed.gender) {
                vm.patient.Gender = vailed.gender === 'Female' ? 'F' : 'M';
            }
            if (!vm.patient.Birthday && vailed.birthday) {
                vm.patient.Birthday = new Date(vailed.birthday);
            }
        }
    };

    vm.addpatient = function () {
        addPatientDialog();
    };

    function addPatientDialog() {
        $mdDialog.show({
            controller: addPatientDialogController,
            controllerAs: '$ctrl',
            template: addPatientDialogTpl,
            clickOutsideToClose: true
        }).then((result) => {
            // 帶病人基本資料

            vm.patient.MedicalId = result.PAT_NO;   // 病歷號
            vm.checkDuplicate({ Field: 'MedicalId', PatientId: vm.patientId || null, Value: vm.patient.MedicalId }, 'medicalId');
            
            vm.patient.Name = result.PAT_NAME;      // 病人姓名

            if (result.PAT_ID) {
                vm.patient.IDType = 'IDNumber';           // 身分證別
                vm.patient.IdentifierId = result.PAT_ID;    // 身分證號
            } else {
                vm.patient.IdentifierId = '';    // 身分證號
            }

            // 生日 民國年轉西元年 YYYMMDD -> YYYYMMDD
            vm.patient.Birthday = result.BIRTHDAY ? new Date(parseInt(result.BIRTHDAY.substring(0, 3)) + 1911, parseInt(result.BIRTHDAY.substring(3, 5)) - 1, result.BIRTHDAY.substring(5, 7)) : null;

            vm.patient.BloodTypes = result.BLOODTYPE_LAB;
            vm.patient.RH = result.BLOODTYPE_LAB_RH;
            vm.patient.Phone[0] = result.PHONE_NO_H;
            vm.patient.Phone[1] = result.CELLPHONE;
            vm.patient.Address = result.ADDRESS1;
            vm.patient.CurrentAddress = result.ADDRESS2;
            vm.gender = result.SEX;

            // 死亡日期 民國年轉西元年 YYYMMDD -> YYYYMMDD
            // 若有死亡日期需把狀態也改為死亡
            if (result.DEAD_DATE) {
                vm.patient.State = '9';
                vm.patient.DeathDate = new Date(parseInt(result.DEAD_DATE.substring(0, 3)) + 1911, parseInt(result.DEAD_DATE.substring(3, 5)) - 1, result.DEAD_DATE.substring(5, 7));
            } else {
                vm.patient.State = '';
                vm.patient.DeathDate = null;
            }

            // DNR 註記
            // 對應
            convertDNRFlag(result.DNR_IC_FLAG);

            // DNR 同意書
            // 簽署DNR同意書日期:院區代碼,簽署日期(YYYYMMDD),資料註記人員(員編),資料註記時間(YYYMMDDHHMMSS),不實施心肺復甦術註記內容[註A]=>G,1040101,A3061,1040101010030,135
            // 組資料
            convertDNRConsent(result.DNR_CONSENT);

            vm.patient.AllergicHistory = '';
            // 帶過敏史，目前先串 Odr_Atc_Name 即可
            if (result.AllergicHistory.length > 0) {
                vm.patient.AllergicHistory = _.map(result.AllergicHistory, item => item.Odr_Atc_Name).join('；');
            }

        });

        function addPatientDialogController() {
            const self = this;
            self.getFocus = function () {
                vm.focus = true;
            };

            self.cancel = function () {
                $mdDialog.cancel();
            };
            self.ok = function () {
                vm.downloading = true;

                // 取病人資料及過敏藥品
                let executeArray = [getPatientFromHis(self.medicalId), getAllergicHistory(self.medicalId)];
                $q.all(executeArray).then(() => {
                    let data = patientInfoFromHis;
                    data.AllergicHistory = allergicHistory;
                    $mdDialog.hide(data);
                }).catch(() => {

                }).finally(() => {
                    vm.downloading = false;
                });
                // tpechService.getPatient(self.medicalId).then((res) => {
                //     if (Array.isArray(res.data) && res.data.length > 0) {
                //         $mdDialog.hide(res.data[0]);
                //     } else {
                //         showMessage('查無此人');
                //     }
                // }, (err) => {
                //     console.log('err');
                //     showMessage(`取得病人資料失敗:${err}`);
                // }).finally(() => {
                //     vm.downloading = false;
                // });
            };

            setTimeout(() => {
                $('#myText').focus();
            }, 0);
        }
    }

    function convertDNRFlag(value) {
        vm.patient.DNRFlag = '';
            if (value) {
                let dnrFlags = value.split(',');
                vm.patient.DNRFlag = '';
                for (let i = 0; i < dnrFlags.length; i++) {
                    if (!dnrFlags[i]) {
                        continue;
                    }
                    switch (dnrFlags[i].toUpperCase()) {
                        case '1':
                            vm.patient.DNRFlag += '同意器官捐贈。';
                            break;
                        case '2':
                            vm.patient.DNRFlag += '同意安寧緩和醫療。';
                            break;
                        case '3':
                            vm.patient.DNRFlag += '同意不施行心肺復甦術。';
                            break;
                        case '4':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行心肺復甦術、同意不施行維生醫療。';
                            break;
                        case '5':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療。';
                            break;
                        case '6':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行心肺復甦術。';
                            break;
                        case '7':
                        case 'H':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行心肺復甦術、同意不施行維生醫療。';
                            break;
                        case 'A':
                            vm.patient.DNRFlag += '同意不施行維生醫療。';
                            break;
                        case 'B':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行維生醫療。';
                            break;
                        case 'C':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行維生醫療。';
                            break;
                        case 'D':
                            vm.patient.DNRFlag += '同意不施行心肺復甦術、同意不施行維生醫療。';
                            break;
                        case 'E':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行心肺復甦術、同意不施行維生醫療。';
                            break;
                        case 'F':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行維生醫療。';
                            break;
                        case 'G':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行心肺復甦術、同意不施行維生醫療。';
                            break;
                        case 'I':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行心肺復甦術。';
                            break;
                        case 'J':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行心肺復甦術。';
                            break;
                        case 'K':
                            vm.patient.DNRFlag += '同意預立醫療決定。';
                            break;
                        case 'L':
                            vm.patient.DNRFlag += '同意器官捐贈、同意預立醫療決定。';
                            break;
                        case 'M':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意預立醫療決定。';
                            break;
                        case 'N':
                            vm.patient.DNRFlag += '同意不施行心肺復甦術、同意預立醫療決定。';
                            break;
                        case 'O':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行心肺復甦術、同意預立醫療決定。';
                            break;
                        case 'P':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意預立醫療決定。';
                            break;
                        case 'Q':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行心肺復甦術、同意預立醫療決定。';
                            break;
                        case 'R':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行心肺復甦術、同意預立醫療決定。';
                            break;
                        case 'S':
                            vm.patient.DNRFlag += '同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'T':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'U':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'V':
                            vm.patient.DNRFlag += '同意不施行心肺復甦術、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'W':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行心肺復甦術、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'X':
                            vm.patient.DNRFlag += '同意器官捐贈、同意安寧緩和醫療、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'Y':
                            vm.patient.DNRFlag += '同意器官捐贈、同意不施行心肺復甦術、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        case 'Z':
                            vm.patient.DNRFlag += '同意安寧緩和醫療、同意不施行心肺復甦術、同意不施行維生醫療、同意預立醫療決定。';
                            break;
                        default:
                            break;
                    }
                }
                // 去掉最後的頓號
                if (vm.patient.DNRFlag[vm.patient.DNRFlag - 1] === '、') {
                    vm.patient.DNRFlag = vm.patient.DNRFlag.slice(0, vm.patient.DNRFlag.length - 1);
                }
            }
    }
    function convertDNRConsent(value) {
        vm.patient.DNRConsent = '';
            if (value) {
                let dnrConsent = value.split(',');
                for (let i = 1; i < dnrConsent.length; i++) {
                    switch (i) {
                        case 1:
                            // 簽署日期(YYYYMMDD)
                            vm.patient.DNRConsent += `簽署日期：${moment(new Date(parseInt(dnrConsent[i].substring(0, 3)) + 1911, parseInt(dnrConsent[i].substring(3, 5)) - 1, dnrConsent[i].substring(5, 7))).format('YYYY/MM/DD')}；`;
                            break;
                        case 2:
                            // 資料註記人員(員編)
                            vm.patient.DNRConsent += `註記人員：${dnrConsent[i]}；`;
                            break;
                        case 3:
                            // 資料註記時間(YYYMMDDHHMMSS)
                            vm.patient.DNRConsent += `註記時間：${moment(new Date(parseInt(dnrConsent[i].substring(0, 3)) + 1911, parseInt(dnrConsent[i].substring(3, 5)) - 1, dnrConsent[i].substring(5, 7), dnrConsent[i].substring(7, 9), dnrConsent[i].substring(9, 11), dnrConsent[i].substring(11, 13))).format('YYYY/MM/DD HH:mm:ss')}；`;
                            break;
                        case 4:
                            // 不實施心肺復甦術註記內容
                            let dnrNote = dnrConsent[i].length > 0 ? '不實施心肺復甦術註記內容：' : '';
                            for (let j = 0; j < dnrConsent[i].length; j++) {

                                switch (dnrConsent[i][j]) {
                                    case '1':
                                        dnrNote += '氣管內插管、';
                                        break;
                                    case '2':
                                        dnrNote += '體外心臟按壓、';
                                        break;
                                    case '3':
                                        dnrNote += '急救藥物注射、';
                                        break;
                                    case '4':
                                        dnrNote += '心臟電擊、';
                                        break;
                                    case '5':
                                        dnrNote += '心臟人工調頻、';
                                        break;
                                    case '6':
                                        dnrNote += '人工呼吸等標準急救程序、';
                                        break;
                                    case '7':
                                        dnrNote += '其他緊急救治行為、';
                                        break;
                                    default:
                                        break;
                                }
                            }
                            // 去掉最後的頓號
                            if (dnrNote[dnrNote.length - 1] === '、') {
                                dnrNote = dnrNote.slice(0, dnrNote.length - 1);
                            }
                            vm.patient.DNRConsent += dnrNote;
                            break;
                        default:
                            break;
                    }
                }

                // 去掉最後的分號
                if (vm.patient.DNRConsent[vm.patient.DNRConsent.length - 1] === '；') {
                    vm.patient.DNRConsent = vm.patient.DNRConsent.slice(0, vm.patient.DNRConsent.length - 1);
                }
            }
    }

    // 檢查判斷欄位是否重複
    vm.vaildField = (vailed, field) => {
        if (vailed) {
            switch (field) {
                case 'rfid':
                    fieldObj.RFID = vailed;
                    break;
                case 'barcode':
                    fieldObj.BARCODE = vailed;
                    break;
                default:
                    break;
            }
        }
    };

    vm.deleteTag = function (index) {
        $mdDialog.show({
            controller: ['$mdDialog', showDialogController],
            template:
                `<md-dialog aria-label="刪除確認">
          <form ng-cloak>
              <md-toolbar>
                  <div class="md-toolbar-tools">
                      <h2 translate>{{'patientDetail.component.deleteTag'}}</h2>
                      <span flex></span>
                      <md-button class="md-icon-button" ng-click="vm.cancel()">
                          <md-icon md-svg-src="static/img/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>
                      </md-button>
                  </div>
              </md-toolbar>

              <md-dialog-content>
                  <div class="md-dialog-content" translate>
                    {{'patientDetail.component.confirmDelete'}}
                  </div>
              </md-dialog-content>

              <md-dialog-actions layout="row">
                  <md-button class="md-raised" ng-click="vm.cancel()" translate>
                    {{'patientDetail.component.cancel' | translate}}
                  </md-button>
                  <md-button class="md-warn md-raised" ng-click="vm.ok()" translate>
                    {{'patientDetail.component.ok' | translate}}
                  </md-button>
              </md-dialog-actions>
          </form>
      </md-dialog>`,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function showDialogController(mdDialog) {
            const self = this;
            self.hide = function hide() {
                mdDialog.hide();
            };

            self.cancel = function cancel() {
                mdDialog.cancel();
            };

            self.ok = function ok() {
                vm.patient.Tags.splice(index, 1);
                mdDialog.hide();
            };
        }
    };

    vm.tagDialog = function tagDialog(event, data, index = null) {
        $mdDialog.show({
            locals: {
                data,
                index
            },
            controller: ['$mdDialog', 'data', 'index', DialogController],
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: !$mdMedia('gt-sm'),
            controllerAs: 'tag'
        }).then((tags) => {
            if (index !== null) {
                // $timeout(() => {vm.patient.Tags[index] = tags;}, 0);
                vm.patient.Tags[index] = tags;
            } else {
                vm.patient.Tags.push(tags);
            }
        });

        function DialogController(mdDialog, tags, i = null) {
            const tag = this;
            // 第幾筆標籤
            tag.index = i;
            if (tags) {
                tag.tagForm = tags;
            } else {
                tag.tagForm = {
                    LineThrough: 'none',
                    FontStyle: 'normal',
                    FontWeight: 'normal',
                    TagColor: '#464646',
                    TagBgColor: '#E7E7E7'
                };
            }
            tag.colorgroups = [{
                word: '#464646',
                background: '#E7E7E7'
            }, {
                word: '#0D3472',
                background: '#B6CFF5'
            },
            {
                word: '#464646',
                background: '#98D7E4'
            }, {
                word: '#0D3472',
                background: '#E3D7FF'
            },
            {
                word: '#464646',
                background: '#FBD3E0'
            }, {
                word: '#0D3472',
                background: '#F2B2A8'
            },

            {
                word: '#FFFFFF',
                background: '#C0C2C2'
            }, {
                word: '#FFFFFF',
                background: '#4886E7'
            },
            {
                word: '#FFFFFF',
                background: '#2DA2BB'
            }, {
                word: '#FFFFFF',
                background: '#B99AFF'
            },
            {
                word: '#464646',
                background: '#F691B2'
            }, {
                word: '#FFFFFF',
                background: '#FB4C2F'
            },

            {
                word: '#464646',
                background: '#FFC8AF'
            }, {
                word: '#0D3472',
                background: '#FFDEB5'
            },
            {
                word: '#464646',
                background: '#FBE983'
            }, {
                word: '#0D3472',
                background: '#FDEDC1'
            },
            {
                word: '#464646',
                background: '#B3EFD3'
            }, {
                word: '#0D3472',
                background: '#A2DCC1'
            },

            {
                word: '#FFFFFF',
                background: '#FFB137'
            }, {
                word: '#FFFFFF',
                background: '#FFAD46'
            },
            {
                word: '#464646',
                background: '#EBDBDE'
            }, {
                word: '#FFFFFF',
                background: '#CCA6AC'
            },
            {
                word: '#464646',
                background: '#42D692'
            }, {
                word: '#FFFFFF',
                background: '#16A765'
            }
            ];

            tag.selectColor = function selectColor(color) {
                tag.tagForm.TagColor = color.word;
                tag.tagForm.TagBgColor = color.background;
            };

            tag.hide = function hide() {
                mdDialog.hide();
            };

            tag.cancel = function cancel() {
                mdDialog.cancel();
            };

            tag.ok = function ok(tagForm) {
                if (tagForm.$valid) {
                    mdDialog.hide(tag.tagForm);
                }
            };
        }
    };

    // 提交form， cover = 'Y'時自動覆蓋 RFID、BarCode
    vm.submit = function submit(form, cover) {
        if (form.$valid) {
            // if (form.$valid && !(fieldObj.RFID || fieldObj.BARCODE)) {
            vm.isSaving = true;
            vm.patient.HospitalId = SettingService.getCurrentHospital().Id;
            vm.patient.PrimaryDisease = vm.primaryDisease;
            vm.patient.PrimaryDiseaseDetail = vm.primaryDiseaseDetail;
            vm.patient.Phone = [];
            vm.patient.DeliveryAddress = [];
            vm.patient.ContactPhone1 = [];
            vm.patient.ContactPhone2 = [];
            if (vm.patient.WardId) {
                vm.patient.WardName = vm.wards[vm.patient.WardId];
            }
            if (vm.photo) {
                vm.patient.Photo = vm.photo;
            }
            if (vm.patient.Birthday) {
                vm.patient.Birthday = moment(vm.patient.Birthday).second(0).millisecond(0).toDate();
            }
            // if (vm.Phone1 !== '' && vm.Phone1 !== null && vm.Phone1 !== undefined) {
            //     vm.patient.Phone.push(vm.Phone1.trim());
            // }
            // if (vm.Phone2 !== '' && vm.Phone2 !== null && vm.Phone2 !== undefined) {
            //     vm.patient.Phone.push(vm.Phone2.trim());
            // }
            // if (vm.Phone3 !== '' && vm.Phone3 !== null && vm.Phone3 !== undefined) {
            //     vm.patient.Phone.push(vm.Phone3.trim());
            // }
            if (vm.DeliveryAddress1 !== '' && vm.DeliveryAddress1 !== null && vm.DeliveryAddress1 !== undefined) {
                vm.patient.DeliveryAddress.push(vm.DeliveryAddress1.trim());
            }
            if (vm.DeliveryAddress2 !== '' && vm.DeliveryAddress2 !== null && vm.DeliveryAddress2 !== undefined) {
                vm.patient.DeliveryAddress.push(vm.DeliveryAddress2.trim());
            }
            if (vm.DeliveryAddress3 !== '' && vm.DeliveryAddress3 !== null && vm.DeliveryAddress3 !== undefined) {
                vm.patient.DeliveryAddress.push(vm.DeliveryAddress3.trim());
            }
            if (vm.ContactPhone11 !== '' && vm.ContactPhone11 !== null && vm.ContactPhone11 !== undefined) {
                vm.patient.ContactPhone1.push(vm.ContactPhone11.trim());
            }
            if (vm.ContactPhone12 !== '' && vm.ContactPhone12 !== null && vm.ContactPhone12 !== undefined) {
                vm.patient.ContactPhone1.push(vm.ContactPhone12.trim());
            }
            if (vm.ContactPhone13 !== '' && vm.ContactPhone13 !== null && vm.ContactPhone13 !== undefined) {
                vm.patient.ContactPhone1.push(vm.ContactPhone13.trim());
            }
            if (vm.ContactPhone21 !== '' && vm.ContactPhone21 !== null && vm.ContactPhone21 !== undefined) {
                vm.patient.ContactPhone2.push(vm.ContactPhone21.trim());
            }
            if (vm.ContactPhone22 !== '' && vm.ContactPhone22 !== null && vm.ContactPhone22 !== undefined) {
                vm.patient.ContactPhone2.push(vm.ContactPhone22.trim());
            }
            if (vm.ContactPhone23 !== '' && vm.ContactPhone23 !== null && vm.ContactPhone23 !== undefined) {
                vm.patient.ContactPhone2.push(vm.ContactPhone23.trim());
            }
            if (vm.patient.ContactName2 !== '' && vm.patient.ContactName2 !== null && vm.patient.ContactName2 !== undefined) {
                vm.patient.ContactName2 = vm.patient.ContactName2.trim();
            }
            if (vm.patient.MajorDiseasesNo2 !== '' && vm.patient.MajorDiseasesNo2 !== null && vm.patient.MajorDiseasesNo2 !== undefined) {
                vm.patient.MajorDiseasesNo2 = vm.patient.MajorDiseasesNo2.trim();
            }

            if (vm.patient.DeathReason === 'other') {
                if (vm.inputDeathReason == undefined) {
                    vm.inputDeathReason = '';
                }
                vm.patient.DeathReason += vm.inputDeathReason;
                console.log('reason', vm.patient.DeathReason);
            }

            if (vm.patient.DeathPlace === 'other') {
                if (vm.inputDeathPlace == undefined) {
                    vm.inputDeathPlace = '';
                }
                vm.patient.DeathPlace += vm.inputDeathPlace;
                console.log('reason', vm.patient.DeathPlace);
            }

            // 處理手輸醫院
            if (vm.patient.FirstDialysisHospital === 'none') {
                vm.patient.FirstDialysisHospital = vm.firstDialysisHospitalManual;
            }
            if (vm.patient.OrganTransplantHospital === 'none') {
                vm.patient.OrganTransplantHospital = vm.organTransplantDateManual;
            }

            // 上傳
            if (vm.patientId) {
                vm.patient.ModifiedUserId = vm.user.Id;
                vm.patient.ModifiedUserName = vm.user.Name;
                PatientService.put(vm.patient, cover).then((d) => {
                    if (d.status === 200) {
                        showMessage($translate('patientDetail.component.editSuccess'));
                        history.go(-1);
                    }
                }, (err) => {
                    vm.isSaving = false;
                    errorControlCheckDuplicate(err, form);
                });
            } else {
                if (vm.patient.Birthday) {
                    vm.patient.Birthday = moment(vm.patient.Birthday).second(0).millisecond(0).toDate();
                }
                vm.patient.CreatedUserId = vm.user.Id;
                vm.patient.CreatedUserName = vm.user.Name;
                PatientService.post(vm.patient, cover).then((d) => {
                    if (d.status === 200) {
                        showMessage($translate('patientDetail.component.createSuccess'));
                        history.go(-1);
                    }
                }, (err) => {
                    vm.isSaving = false;
                    errorControlCheckDuplicate(err, form);
                });
            }
        }

        // else {
        //     if (fieldObj.RFID) {
        //         let confirm = $mdDialog.confirm()
        //             .title('')
        //             .textContent(`RFID號碼${vm.patient.RFID}重複,${fieldObj.RFID.Name}使用`)
        //             .ariaLabel('')
        //             .targetEvent(form)
        //             .ok('確定覆蓋，並存檔')
        //             .cancel('取消覆蓋');

        //         $mdDialog.show(confirm).then(() => {
        //             // 確定覆蓋
        //             vm.submit(form, 'Y');
        //         }, () => {
        //             delete fieldObj.RFID;
        //             vm.patient.RFID = vm.rfid;
        //             // 不做任何動作， 讓使用者自己修改
        //         });
        //     } else if (fieldObj.BARCODE) {
        //         let confirm = $mdDialog.confirm()
        //             .title('')
        //             .textContent(`BarCode號碼${vm.patient.BarCode}重複,${fieldObj.BARCODE.Name}使用`)
        //             .ariaLabel('')
        //             .targetEvent(form)
        //             .ok('確定覆蓋，並存檔')
        //             .cancel('取消覆蓋');

        //         $mdDialog.show(confirm).then(() => {
        //             // 確定覆蓋
        //             vm.submit(form, 'Y');
        //         }, () => {
        //             delete fieldObj.BARCODE;
        //             vm.patient.BarCode = vm.barcode;
        //             // 不做任何動作， 讓使用者自己修改
        //         });
        //     }
        // }
    };

    // 上傳完後的error，確認是否重複
    function errorControlCheckDuplicate(err, form) {
        switch (err.data) {
            case 'EXISTED_IDENTIFIER':
                vm.checkDuplicate({ Field: 'IdentifierId', PatientId: vm.patientId || null, Value: vm.patient.IdentifierId }, 'identifierId');
                break;
            case 'EXISTED_MEDICALID':
                vm.checkDuplicate({ Field: 'MedicalId', PatientId: vm.patientId || null, Value: vm.patient.MedicalId }, 'medicalId');
                break;
            case 'EXISTED_BARCODE':
                vm.checkDuplicate({ Field: 'BarCode', PatientId: vm.patientId || null, Value: vm.patient.BarCode }, 'barcode', form);
                break;
            case 'EXISTED_RFID':
                vm.checkDuplicate({ Field: 'RFID', PatientId: vm.patientId || null, Value: vm.patient.RFID }, 'rfid', form);
                break;
            default:
                break;
        }
    }

    // 用來辨識是否要 disabled input：驗證中時input要disabled避免callback來不及回來，資訊顯示錯誤
    vm.disabledInput = null;
    // 前端跟上傳完後的error，確認是否重複
    vm.checkDuplicate = function checkDuplicate(checkObj, inputName, form = null) {
        console.log('checkDuplicate', checkObj, inputName);
        // 驗證中：先 disabled 存檔按鈕
        vm.isChecking = true;

        // IDType -> 身份證 IDNumber, 其他證件 OtherDocuments
        // 其他證件：號碼不需驗證
        if (inputName === 'identifierId' && vm.patient.IDType === 'OtherDocuments') {
            vm.isChecking = false;
            $scope.projectForm[inputName].$setValidity('idrule', true);
            $scope.projectForm[inputName].$setValidity('existed', true);
            return;
        }

        // 身分證：號碼要驗證
        if (inputName === 'identifierId' && vm.patient.IDType === 'IDNumber') {
            vm.isChecking = false;
            let chinese = new chineseId();
            let taiwenese = new taiwanId();
            let hongKong = new hongKongId();
            let vaildchinese;
            let vaildtaiwenese;
            let vaildhongKong;
            let finalVailedobj; // 驗證完返回的結果
            // 進行驗證
            vaildchinese = chinese.validate(checkObj.Value ? checkObj.Value.trim() : null);
            vaildtaiwenese = taiwenese.validate(checkObj.Value ? checkObj.Value.trim() : null);
            vaildhongKong = hongKong.validate(checkObj.Value ? checkObj.Value.trim() : null);
            // console.log('身份證 ch', vaildchinese);
            // console.log('身份證 tw', vaildtaiwenese);
            // console.log('身份證 hk', vaildhongKong);
            if (vaildchinese.success) {
                finalVailedobj = vaildchinese;
                $scope.projectForm[inputName].$setValidity('idrule', true);
            } else if (vaildtaiwenese.success) {
                finalVailedobj = vaildtaiwenese;
                $scope.projectForm[inputName].$setValidity('idrule', true);
            } else if (vaildhongKong.success) {
                finalVailedobj = vaildhongKong;
                $scope.projectForm[inputName].$setValidity('idrule', true);
            } else {
                // 驗證失敗：不需再進行重複與否驗證
                $scope.projectForm[inputName].$setValidity('idrule', false);
                return;
            }
            console.log('身份證 rule', finalVailedobj);
        }

        // 驗證中...
        if (checkObj.Value && checkObj.Value !== '') {
            // 有輸入值
            vm.disabledInput = inputName; // disabled input
            $scope.projectForm[inputName].$setValidity('isChecking', false); // isValid -> false 顯示 驗證中...
            $scope.projectForm[inputName].$setValidity('existed', true); // isValid -> true 先關掉有重複的顯示，不然會干擾"驗證中"顯示
            console.log('有輸入值', vm.disabledInput);
        } else {
            // 無輸入值：不需顯示
            vm.isChecking = false;
            console.log('無輸入值', vm.disabledInput);
        }

        // 病歷號/身份證 只需知道是否有重複即可 return true/false
        if (inputName === 'medicalId' || inputName === 'identifierId') {
            PatientService.postDuplicate(checkObj).then((res) => {
                vm.isChecking = false; // 驗證完
                vm.disabledInput = null; // disabled input
                $scope.projectForm[inputName].$setValidity('isChecking', true); // isValid -> true 不顯示 驗證中...
                console.log('post 驗證', inputName, ': ', res);
                if (res && res.status === 200) {
                    // 重複
                    $scope.projectForm[inputName].$setValidity('existed', !res.data); // isValid -> fasle  !res.data
                } else {
                    // 不重複
                    console.log('post 驗證 不重複', inputName, ': ', res);
                    $scope.projectForm[inputName].$setValidity('existed', true); // isValid -> true
                }
            }, (err) => {
                // 驗證失敗
                console.log('驗證失敗 err', err);
                vm.isChecking = false; // 驗證完
                vm.disabledInput = null;
                $scope.projectForm[inputName].$setValidity('isChecking', true); // isValid -> true
            });
        } else {
            // barcode、rfid 需知道是與誰重複 return patientObj
            PatientService.getByField(checkObj).then((res) => {
                vm.isChecking = false; // 驗證完
                vm.disabledInput = null;
                $scope.projectForm[inputName].$setValidity('isChecking', true); // isValid -> false
                console.log('put 驗證', inputName, ': ', res);
                if (res && res.status === 200) {
                    switch (inputName) {
                        case 'barcode':
                            let barcodeConfirm = $mdDialog.confirm()
                                .title('')
                                .textContent($translate('patientDetail.component.barcodeRepeat', { number: vm.patient.BarCode, name: res.data.Name }))
                                // .textContent(`BarCode："${vm.patient.BarCode}" 重複，"${res.data.Name}" 使用中`)
                                .ariaLabel('')
                                .targetEvent(form)
                                .ok($translate('patientDetail.component.coverSave'))
                                .cancel($translate('patientDetail.component.deleteCover'));
                            $mdDialog.show(barcodeConfirm).then(() => {
                                // 確定覆蓋
                                vm.submit(form, 'Y');
                            }, () => {
                                // delete fieldObj.BARCODE;
                                vm.patient.BarCode = vm.barcode;
                                // 不做任何動作， 讓使用者自己修改
                            });
                            break;
                        case 'rfid':
                            let rfidConfirm = $mdDialog.confirm()
                                .title('')
                                .textContent($translate('patientDetail.component.rfidRepeat', { number: vm.patient.RFID, name: res.data.Name }))
                                // .textContent(`RFID："${vm.patient.RFID}" 重複，"${res.data.Name}" 使用中`)
                                .ariaLabel('')
                                .targetEvent(form)
                                .ok($translate('patientDetail.component.coverSave'))
                                .cancel($translate('patientDetail.component.deleteCover'));
                            $mdDialog.show(rfidConfirm).then(() => {
                                // 確定覆蓋
                                vm.submit(form, 'Y');
                            }, () => {
                                // delete fieldObj.RFID;
                                vm.patient.RFID = vm.rfid;
                                // 不做任何動作， 讓使用者自己修改
                            });
                            break;
                        default:
                            break;
                    }
                    // $scope.projectForm[inputName].$render();
                } else {
                    // 不重複
                    console.log('put 驗證 不重複', inputName, ': ', res);
                    vm.isChecking = false; // 驗證完
                    vm.disabledInput = null;
                    $scope.projectForm[inputName].$setValidity('existed', true); // isValid -> true
                }
            }, (err) => {
                // 驗證失敗
                console.log('驗證失敗 err', err);
                vm.isChecking = false; // 驗證完
                vm.disabledInput = null;
                $scope.projectForm[inputName].$setValidity('existed', true); // isValid -> true
            });
        }
    };

    vm.back = function back() {
        history.go(-1);
    };

    vm.getPicture = (x) => {
        vm.photo = x;
    };
}

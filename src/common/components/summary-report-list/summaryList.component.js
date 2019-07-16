import summaryList from './summaryList.component.html';
import './summaryList.component.less';

angular.module('app').component('summaryList', {
    bindings: {
        data: '<',
        patient: '<',
        deviation: '<',
        catheter: '<',
        clicked: '=',
        columnTd: '=',
        whiteframe: '=?'
    },
    template: summaryList,
    controller: summaryListController
});

summaryListController.$inject = ['$state', '$timeout'];

function summaryListController($state, $timeout) {
    const self = this;
    console.log('data', self.data);
    const patientId = self.patient.Id;

    self.$onInit = function () {
        // 透析機資料 table tr 高度調整，需等畫面出來才取得到 element
        $timeout(() => {
            let machineDataElement = document.querySelector('.machine table');
            let ths = machineDataElement.querySelectorAll('th');
            _.forEach(ths, (th) => {
                // 取比較高的高度
                let parentTrHeight = th.parentElement ? th.parentElement.clientHeight : 0;
                console.log('parentTrHeight', parentTrHeight);
                if (parentTrHeight >= th.clientHeight) {
                    th.style.height = parentTrHeight + 'px';
                } else {
                    th.parentElement.style.height = th.clientHeight + 'px';
                }
            });
        }, 500);
    };

    // 判斷是否為 CRRT Mode，決定透析機要顯示的欄位
    if (self.data.DialysisHeader.Prescription && self.data.DialysisHeader.Prescription.Mode) {
        let modeName = self.data.DialysisHeader.Prescription.Mode.Name;
        // 符合 CRRT 模式的條件
        // if (modeName && modeName.match(/(^cvv)|(^ivv)|(^cav)|(^scuf)|(^sled)/i)) {
        //     self.isCRRTMode = true;
        // }
    }

    self.gotoOverview = function goto() {
        $state.go('overview', {
            headerId: self.data.DialysisHeader.Id
        });
        self.clicked = true;
    };
    self.gotoNursingRecords = function goto() {
        $state.go('nursingRecord', {
            patientId,
            headerId: self.data.DialysisHeader.Id
        });
        self.clicked = true;
    };
    self.gotoAssessment = function goto() {
        $state.go('assessment', {
            patientId,
            headerId: self.data.DialysisHeader.Id
        });
        self.clicked = true;
    };
    self.gotoMachineData = function goto() {
        $state.go('machineData', {
            patientId,
            headerId: self.data.DialysisHeader.Id
        });
        self.clicked = true;
    };
    self.gotoDoctorNote = function goto(event) {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        $state.go('doctorNote', {
            patientId,
            headerId: self.data.DialysisHeader.Id
        });
        self.clicked = true;
    };

    self.gotoBloodTransfusion = function () {
        $state.go('bloodTransfusion').then(() => {
            self.clicked = true;
        });
    };

    self.gotoPrescription = function () {
        $state.go('allPrescriptions').then(() => {
            self.clicked = true;
        });
    };

    self.gotoExecutionRecord = function () {
        $state.go('allExecutionRecord').then(() => {
            self.clicked = true;
        });
    };

    self.gotoShiftIssues = function () {
        console.log('go to shiftIssues');
        $state.go('shiftIssues').then(() => {
            self.clicked = true;
        });
    };
}

/*
English translation dictonary
Author: Terry
Usage (directive): <tag translate>{{'something'}}</tag>
Usage (filter): <tag>{{'something' | translate}}</tag>
NB: md-button and md-checkbox does not work with translate directive, use filter(pipe) instead
eg. <md-button translate>{{'something'}}</md-button> change it to <md-button>{{'something' | translate}}</md-button>
or use span tag
eg. <md-button><span translate>{{'something'}}</span></md-button>
=================translate using values============================================
<ANY translate="arrange.status" translate-values="{status: arrange.title}"></ANY>
=================translate Conditional operator using directive====================
<ANY translate>{{something === 'something' ? 'something.translate' : 'something.translate'}}</ANY>
=================translate Conditional operator with Pipe that has values==========
<ANY>{{ something ? ('something.translate' | translate: {value: valueToSubstitute}) : ('something.translate' | translate) }}</ANY>
*/

window.en_us_translations = {
    // custom messages for toast message
    customMessage: {
        EXISTED_IDENTIFIER: "ID exists",
        EXISTED_RFID: "RFID exists",
        EXISTED_BARCODE: "Barcode exists",
        EXISTED_MEDICALID: "Medical code already exists",
        NO_DATA: "No data",
        FAILED_VALIDATION: "Necessary fields are not filled",
        MODULE_ERROR: "Version error",
        NO_SOURCE: "No source available",
        NO_PATIENTID: "No patient ID",
        EXISTED_ACCOUNT: "Account already exists",
        UPDATE_FAILD: "Update failed",
        HAS_ASSIGN_BED: "Bed has already been assigned for today",
        OTHER_PEOPLE_ASSIGN_BED: "Bed has already been assigned for other people",
        CHECK_WEIGHT: "Please confirm whether the weight is correct",
        NO_PATIENT: "Patient does not exist",
        CHECK_DATETIME_FORMAT: "Please confirm the date format",
        PRESCRIPTION_STATE_ERROR: "Prescription status is wrong",
        NO_PRESCRIPTION: "No such dialysis prescription information",
        TODAY_NO_DIALYSIS: "This patient has no dialysis data for today",
        PARAMETER_EMPTY: "Parameter can not be null",
        NO_MEDICINE_GET_CATEGORY_FAIL: "Can not find medicine information, access to medicine categories failed",
        NO_MEDICINE_CODE: "Please fill in the medicine code",
        EXISTED_MEDICINE_CODE: "Medicine code already exists",
        NO_MEDICINE_NAME: "Please fill in the medicine name",
        NO_QUANTITY: "Please fill in the quantity",
        NO_ROUTE: "Please fill in the route",
        NO_FREQUENCY: "Please fill in the frequency",
        NO_MEDICINE: "Please confirm the medicine file, can not find the medicine",
        NO_MEDICINE_BY_ID: "Please confirm the medicine file, can not find the medicine Id",
        NO_START_TIME: "Please fill in the start medication time",
        DAYS_FAILED_VALIDATION: "Please fill in the medication period, it needs to be greater than 0",
        NO_USER: "User does not exist",
        NO_PATIENT_NAME: "Please enter the patient's name",
        NO_IDENTIFIER: "Please enter the ID number",
        NO_MEDICAL_CODE: "Please enter the medical record code",
        NO_WARD: "Please enter the ward",
        EXISTED_WARD_NAME: "Ward name already exists",
        CAN_NOT_BE_DELETED: "This item can not be deleted",
        MEASUREMENT_TIME_IS_NOT_TODAY: "Measurement time is not today",
        ADDED_FAILED: "Create failed",
        ADDED_SUCCESSFULLY: "Created successfully",
        UPDATE_COMPLETED: "Updated successfully",
        WRONG_PASSWORD: "wrong password",
        ACCOUNT_DISABLED: "Account is disabled",
        doItLater: 'Later',
        cancel: 'Cancel',
        iKnow: 'Understand',
        serverError: 'Server error',
        serverError1: 'Server error, please refresh',
        OFFLINE: 'Internet disconnected! Please check your connection',
        OFFLINE_OR_SERVERERR: 'Internet disconnected! Please check your connection or server address',
        Datasuccessfully: 'Successful data storage',
        DatasFailure: 'Failed to save data',
        DataDeletedSuccess: '資料刪除成功',
        DataDeleteFailed: '資料刪除失敗',
        readonly: 'Read only',
        readonlyTitle: 'Only Creater and Admin can Edit'
    },
    // raspberryPi-related
    raspberryPi: {
        serverEmpty: 'Server not filled',
        meterNotSupport: 'Instrument not supported',
        systemError: 'System error',
        connectMeterError: 'Transmitter and dialysis machine connection error',
        readDataError: 'Data read error',
        notBindingTitle: 'Not yet linked to transmitter',
        notBindingContent: 'Please turn on the Bluetooth and then put your card on the sensor area.',
        notBindingContentForIos: 'Please turn on the Bluetooth and then scan the QRcode',
        scan: 'scan',
        settingError: 'Not set successfully, please try again',
        doUnbind: 'Would you like to unlink?',
        unbind: 'Unlink',
        confirmStop: 'Are you sure to stop?',
        stop: 'Stop continuous transmission',
        bindSuccessfully: 'Linked successfully',
        settingFinished: 'Setting completed',
        contSettingRestart: 'Restart continuous setting',
        contSettingSuccessfully: 'Continuous setting success',
        contStop: 'Stop continuous transmission',
        connecting: 'Connecting to transmitter...',
        setting: 'Setting transmitter...',
        syncStatusError: 'Failed to update server status',
        connectServerError: 'Failed to connect server',
        getPiStatusSuccessfully: 'Acquire server status success',
        getPiStatusFail: 'Failed to retrieve the status of the current transmitter',
        piNotFound: 'Transmitter not found, please restart',
        reloadPiStatus: 'Transmitter is activated, reloading patient status.'
    },
    bluetooth: {
        receivingDataTimeOut: 'Receiving time exceeded 10 seconds',
        btError: 'Bluetooth device error, please try again {{errorCode}}',
        btNotFound: 'Bluetooth device {{macAddr}} not found, please restart the device',
        cannotFindCorrespondingMachine: 'Machine not supported',
        btConnectError: 'Bluetooth device connection failed, please try again',
        btPoweroff: 'Bluetooth device power off, please turn it on and try again',
        btDisconnectFail: 'Failed to disconnect, please exit the page and try again',
        dataFormatWrong: 'Data format error, please try again',
        btConnectLose: 'Bluetooth device disconnect by accident, please try agian',
        btRetryConnectError: 'Bluetooth device connection failed, please check the power on and connection area',
        btRestarting: 'Bluetooth Restarting...',
        btConnectErrorRestartBle: 'Bluetooth device connection failed, please try again or press this button',
        btRetryConnect: 'to retry connection',
        btMacError: '藍牙 Mac 碼有誤，請確認卡片或 QR code 內容是否正確'
    },
    nfc: {
        openNFC: 'Please open NFC',
        gotoSetting: 'Go to Settings'
    },
    // directives (common)
    // dateTimePickerStandard.html
    dateTimePickerStandard: {
        date: "{{dateText}} Date",
        dateRequired: "{{text}} Date Required",
        time: "{{timeText}} Time",
        timeRequired: "{{text}} Time Required"
    },
    // lastRefreshTime.component.js
    lastRefreshTime: {
        refreshTime: "{{time}}",
    },
    // shiftsContent.component.js
    shiftsContent: {
        duplicateShift: "Duplicatd shift, please select again",
        unsaved: "Not yet archived",
        confirmUnsaved: "Data not saved, continue?",
        dontSave: "Do not save",
        saveCancel: "Return to edit",
        saveSuccess: "Save successfully",
        saveFail: "Save failed",
    },
    // summaryContent.component.js
    summaryContent: {
        RHPos: "RH+(Positive)",
        RHNeg: "RH-(Negative)",
        RHUnknown: "Unknown",
    },
    // bedsContent.html
    bedsContent: {
        doctorName: "Doctor: {{doctor}}",
        nurses: "Nurse{{idx + 1}}: {{n}}",
        mode: "Mode: {{mode}}",
        afk: "AK: {{afk}}",
        dialysate: "Dialysate: {{dialysate}}",
    },
    // login page login.html
    login: {
        DialysisSystem: "Dialysis System",
        enterUsernamePassword: "Please enter your username & password",
        scanToLogin: "Or scan your ID card to login",
        enterUsername: "Please enter your username",
        enterPassword: "Please enter your password",
        username: "Username",
        password: "Password",
        login: "Login",
        downloadAPK: "Download APK",
        updateMessage: "Updating. Please wait...",
        // component
        component: {
            tutorText: "\nPlease go to the settings page to set the server location\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
            optionalMessage: "Optional items:",
            version: "Version:",
            formMessage: "Message:",
            submitSuccessMessage: "Form sent, we will contact you shortly",
            updateDialog: "Update now?",
            newVersion: "New version available: ",
            updateOk: "Update!",
            updateCancel: "No",
            downloadFail: "Download failed",
            QRCodePrompt: "Please place the barcode in the center of the frame",
            serverNotFound: "Can not find the server, please check the internet",
            pageNotFound: "Can not find page ({{status}}), please restart server",
            serverError: "Server error (http {{status}} ), please restart server",
        }
    }, // end of login

    // hct24Login page hct24Login.html
    hct24Login: {
        SmartECareDialysisSystem: "Smart eCare",
        SmartECareDialysisSystemSamllText: "Hemodialysis System",
        aboutSystem: "ABOUT", // "關於系統"
        systemFunction: "SERVICE", // "系統功能"
        applySystem: "PRICING", // "系統申請"
        firstChoiceMessage: "No.1 choice for small to mid-sized reginal HD centers",
        unLimitedMessage: "Unrestricted by number of patients nor acess to modules; no download necessary",
        free30Days: "30-Days Free Trial",
        memberLogin: "Member Login", // "會員登入",
        enterUsername: "Username",
        enterPassword: "Password",
        login: "Login",
        downloadAPK: "Download APK",
        clinic: {
            clinicTitle: "Current Clinical Status",
            problem1: "Q1",
            message1: "Data dispersed throughout various departments and units",
            problem2: "Q2",
            message2: "Data transcription (hand & entry)- a waste of time and effort",
            problem3: "Q3",
            message3: "Medical data are full of data transcription errors or blanks",
        },
        choice: {
            choiceTitle: "No.1 choice for Hemodialysis centers",
            picture1: "Screen reader and auto upload",
            picture2: "Triple ID recognition and wireless data transmission",
            picture3: "Fully digitalized workflow",
            picture4: "HIPAA compliant cloud based architecture",
        },
        function: {
            functionTitle: "Service", // "系統功能"
            functionMessage: "Only 3 Steps Needed", // "簡單三步驟 輕鬆完成照護流程",
            picture1: "Scan RFID card or barcode wristband", // "利用識別卡或手圈快速辨識身份"
            picture2: "Receive data from dialysis machine to mobile devices", // "平板裝置即時讀取量測儀器訊號"
            picture3: "Integrate the system with HIS", // "中央即時監控HIS整合應用"
        },
        apply: {
            applyTitle: "Pricing", // "系統申請"
            dollarIcon: "$",
            or: "or",
            eachDollarMessage: "/per record",
            choiceThis: "Get Started", // "我要選擇",
            plusBuy: "Additional items", // "加購項目：",
            basic: {
                title: "Basic", // "基本版"
                price: "20,000/month", // "20,000/月",
                eachPrice: "25",
            },
            advanced: {
                title: "Standard", // "進階版", Advanced
                price: "25,000/month",
                eachPrice: "30",
            },
            premium: {
                title: "Premium", // "完整版",
                price: "30,000/month",
                eachPrice: "35",
            },
            function: {
                "0": "Patient Management",
                "1": "Hemodialysis Management System",
                "2": "Doctor's Advice",
                "3": "Notification Management",
                "4": "Template Management",
                "5": "Photo Album Management",
                "6": "Medical Charge Management",
                "7": "Patient Bed Management",
                "8": "Staff Shift Management",
                "9": "Dashboard",
                "10": "Report Management",
                "11": "KiDiT Management",
            },
            weightScale: {
                title: "Weight Scale Integration",
                function1: "Patient Identification",
                function2: "Upload Data Automatically",
            },
            bloodPressure: {
                title: "Blood Pressure Integration",
                function1: "Patient Identification",
                function2: "Upload Data Automatically",
            },
        },
        contact: {
            title: "Get in touch, we are here to help!", // "請留下您的聯絡方式，我們會派專人與您聯絡",
            companyName: "Company", // "公司大名",
            companyPhone: "Phone", // "公司電話",
            contactPerson: "Name", // "公司聯絡人",
            email: "Email",
            memo: "How can we help you?", // "您的留言",
            phoneEmpty: "Please enter your phone number.", // "請輸入您的公司電話",
            phoneError: "Phone number is incorrect.", // "電話號碼不正確",
            contactPersonEmpty: "Please enter your name.", // "請輸入公司聯絡人",
            emailEmpty: "Please enter your email.", // "請輸入您的Email",
            emailError: "Email is incorrect.",
            submit: "Send",
            clear: "Clear",
        },
        // component
        component: {}
    }, // end of hct24Login

    // home left navbar home.html
    home: {
        welcome: "Welcome {{username}}",
        patients: "Patients",
        myPatiens: "My Patients",
        todayBeds: "Today's Bed",
        notification: "Notifications",
        arrangeBed: "Arrange Beds",
        arrangeShift: "Arrange Shifts",
        dashboard: "Dashboard",
        reports: "Reports",
        settings: "Settings",
        logout: "Logout",
        healthEducation: "Health Education",
        // component
        component: {}
    }, // end of home

    // allPatients allPatients.html
    allPatients: {
        // html
        totalRecord: "Total: {{total}}",
        patients: "@:home.patients",
        searchFinish: "Quit search",
        filter: "Filter Settings",
        Name: "Name",
        MedicalId: "Medical ID #",
        RFID: "RFID",
        BarCode: "Barcode",
        IdentifierId: "ID #",
        cancel: "Cancel",
        ok: "Confirm",
        BeforeBP: "BP Before Treatment",
        AfterBP: "BP After Treatment",
        none: "None",
        finish: "Finished",
        close: "Close (Dialysis Completed)",
        total: "Total",
        record: "# of record",
        inactivePatient: "Inactive",
        // component
        component: {
            patientDataFail: "Can not read the patient information, please refresh",
            Name: "Name",
            MedicalId: "Medical ID",
            RFID: "RFID",
            BarCode: "Barcode",
            IdentifierId: "ID",
            transfer: "Transfer", // 轉院
            getWell: "Heal", // 痊癒
            giveUp: "Giveup", // 放棄
            dropOut: "Retreat", // 不明原因退出
            death: "Death", // 死亡
            rfidPatient: "This card can not find the patient ->  {{rfid}}",
            barCodePatient: "Bar code can not find the patient -> {{barCode}}",
            QRCodePrompt: "Please place the barcode in the center of the frame",
        }
    }, // end of allPatients

    // patientDetail patientDetail.html
    patientDetail: {
        basicInfo: "Basic Information",
        createPatient: "New Patient",
        name: "Name",
        requiredName: "Please enter your full name",
        identifierId: "ID #",
        requiredIdentifierId: "Please enter your ID #",
        requiredOtherDoc: "Please enter other document number",
        minlengthIdentifierId: "Your ID # is too short",
        maxlengthrequiredIdentifierId: "Your ID # is too lengthy",
        idRule: "ID # entered does not conform to its usual format",
        existedIdentifierId: "This ID # already exists",
        clinicBedNo: "Bed #",
        admissionBedNo: "Admission Bed #", // TODO: 住院床號
        gender: "Gender",
        male: "Male",
        female: "Female",
        birthday: "DOB",
        requiredBirthday: "DOB cannot be left blank",
        bloodTypes: "Blood Type",
        select: "Please Select...",
        phone: "Telephone",
        address: "Address",
        ward: "Ward",
        wardErr: "Ward data access failed; please refresh the page",
        requiredWard: "Please select a ward",
        medicalId: "Medical ID #",
        requiredMedicalId: "Please enter the patient's Medical ID #",
        existedMedicalId: "This Medical ID # already exists",
        bedNo: "Bed #",
        patientState: "Status",
        state: {
            "-": "Uncategorized: acute patient",
            ".": "Uncategorized: inpatient requiring emergency dialysis",
            "/": "Uncategorized: patient under temporary care usually receives dialysis treatment at another institution",
            "0": "Uncategorized: patient has yet to enter long-term dialysis treatments; currently requires catheterization surgery",
            "1": "Long-term Hemodialysis",
            "2": "Long-term Peritoneal Dialysis",
            "3": "Under long-term observation for kidney transplant",
            "5": "Hospital Transfer",
            "6": "Full Recovery",
            "7": "Conclude due to medical futility",
            "8": "Backed out due to reasons unknown",
            "9": "Deceased",
        },
        deathDate: "Time of Death",
        deathReason: "Cause of Death",
        entryMode: "Admittance",
        barCode: "Barcode",
        existedBarCode: "This barcode already exists",
        RFID: "RFID",
        existedRFID: "This RFID already exist",
        FirstDialysisDate: "1st Dialysis",
        FirstDialysisDateInHospital: "1st at this facility",
        Memo: "Memo",
        maxlengthMemo: "Memo must not exceed 5000 characters",
        ClinicalDiagnosis: "Clinical Diagnosis",
        maxlengthClinicalDiagnosis: "Clinical diagnosis must not exceed 5000 characters",
        MedicalHistory: "Medical History",
        maxlengthMedicalHistory: "Medical history must not exceed 5000 characters",
        allergicHistory: "Allergy History",
        maxlengthAllergicHistory: "Allergy sistory must not exceed 5000 characters",
        allergicMedicine: "Allergy Medicine",
        noMatch: "No Matched Medicine",
        Remark: "Remark",
        maxlengthRemark: "Remark must not exceed 5000 characters",
        tag: "Tag",
        createTag: "New Tag(s)",
        save: "Save",
        saving: "Saving...",
        editTag: "Edit Tags",
        tagName: "Tag Name",
        requiredTagName: "Tag name required",
        tagColor: "Tag Color",
        tagStyle: "Tag Style",
        tagStrike: "Strikethrough Tag",
        tagFontWeight: "Bold",
        tagPreview: "Preview",
        tagExample: "Tag Example",
        cancel: "Cancel",
        create: "New",
        edit: "Edit",
        patientTimeChange: "Times of patient condition change",
        timeChangeMsg: "Please click “Ok”/ “Confirm” button to change the times for patient condition change”",
        dateChange: "Date of condition change",
        timeChange: "Time of condition change",
        ok: "Confirmed",
        checking: "Verifying...",
        addin: 'Add In',
        // component
        component: {
            unknown: "Unknown",
            stretcher: "stretcher",
            wheelchair: "wheelchair",
            walk: "walk",
            IDNumber: "ID",
            OtherDocuments: "Other",
            addWardMessage: "Ward nurse not added, please add nurse in settings",
            QRCodePrompt: "Please place the barcode in the center of the frame",
            imageFail: "Capture failed, reason: {{msg}} warning",
            deleteTag: "Confirm to delete this tab",
            confirmDelete: "Delete tag? click save after deletion",
            ok: "Delete",
            cancel: "Cancel",
            editSuccess: "Updated successfully!",
            createSuccess: "Created successfully!",
            fieldInvalid: "Field invalid",
            barcodeRepeat: "BarCode：Number \"{{number}}\" is repeated，\"{{name}}\" is using",
            rfidRepeat: "RFID：Number \"{{number}}\" is repeated，\"{{name}}\" is using",
            coverSave: "Using and saving",
            deleteCover: "Cancel",
        }
    }, // end of patientDetail

    // myPatients myPatients.html
    myPatients: {
        todayPatients: "Today's Patients",
        msg1: "You have yet to open/establish a record",
        msg2: "Patient(s) for the day will appear here",
        msg3: "Select Patient to proceed",
        goto: "Please go to...",
        patients: "@: home.patients",
        // component
        component: {}
    }, // end of myPatients

    // beds 今日床位 beds.html
    beds: {
        todayBeds: "@:home.todayBeds",
        ward: "Ward",
        loadingWard: "Loading ward data...",
        bedNoNotInSetting: "This bed no longer exists",
        all: "All",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        night: "Night",
        temp: "Temporary",
        serverError: "Server error, please refresh",
        male: ": Male",
        female: ": Female",
        na: ": N/A",
        showDayoff: "Show dayoff",
        // component
        component: {
            addWardMessage: "Ward nurse not added, please add nurse in settings",
            morningAbbr: "M",
            afternoonAbbr: "A",
            eveningAbbr: "E",
            nightAbbr: "N",
            tempAbbr: "T",
            morningShift: "@:beds.morning",
            afternoonShift: "@:beds.afternoon",
            eveningShift: "@:beds.evening",
            nightShift: "@:beds.night",
            tempShift: "@:beds.temp",
        }
    }, // end of beds

    // notifications Newest Notifications notifications.html
    notifications: {
        notification: "@:home.notification",
        totalRecord: "@:allPatients.totalRecord",
        noData: "No data to display",
        serverError: "Server access error; please refresh the page.",
        // component
        component: {
            ok: "Ok",
        }
    }, // end of notifications

    // arrangeBed 排床 arrangeBed.html
    bed: {
        fixedBed: "Routine beds",
        add: "Add",
        nameAndMedicalId: "Name、Medical Id",
        choosePatient: "Choose Patient",
        confirmDeleteFixedBedTitle: "Delete patient confirm",
        confirmDeleteFixedBedContent: "Would you delete this patient?",
        arrangeBed: "Arrange Beds",
        yearAndMonth: "{{year}} / {{month}}",
        currentMonth: "This month",
        yearAndWeekSameMonth: "{{year}} / {{month}} / {{day}}",
        yearAndWeekDiffMonth: "{{year}} / {{beginMonth}} / {{beginDay}} - {{endMonth}} / {{endDay}}",
        yearAndWeekDiffYear: "{{beginYear}} / {{beginMonth}} / {{beginDay}} - {{endYear}} / {{endMonth}} / {{endDay}}",
        currentWeek: "This week",
        msg: "Please select either a patient or bed, then press the \"Arrange\"  button to begin assigning beds.",
        ward: "Ward:",
        bedNo: "Bed #",
        loadingPatients: "Loading Patient Data...",
        bedArrangeCount: "{{count}} times this week",
        copyAll: "帶入固定床位",
        copyAllConfirm: '您確定要帶入固定床位表至本週?',
        confirmCopy: '帶入',
        noFixedBedWarning: '尚無固定床位資料，請編輯',
        copySuccess: '帶入固定床位成功',
        copyFailed: '帶入固定床位失敗，請重試',
        fixedBedCloning: '帶入固定床位資料中...',
        loadingBeds: "Loading Bed Data...",
        patientArrangeTitle: "",
        patientArrangeCount: "{{count}} pt's",
        bedNoNotInSetting: "This bed no longer exists",
        serverError: "Server data read failed, please refresh",
        morningShift: "Morning",
        morningShiftAbbr: "M",
        afternoonShift: "Afternoon",
        afternoonShiftAbbr: "A",
        eveningShift: "Evening",
        eveningShiftAbbr: "E",
        nightShift: "Night:",
        nightShiftAbbr: "N",
        tempShift: "Temporary:",
        tempShiftAbbr: "T",
        diffPatient: "Different Patient",
        patientInFixed: "Routine bed", // TODO
        patientInBed: "Arrange Beds",
        samePatient: "Same Patient",
        thisWeekIsBedAssigned: "Bed Assigned this week (CAN add or edit arranged bed)",
        thisWeekNoBedAssigned: "Bed Assigned this week (CAN NOT add or edit arranged bed)",
        // component
        component: {
            // bed.controller.js
            editBed: "Edit bed",
            confirmBedEdit: "Bed arranged, change it anyways?",
            ok: "Alter",
            cancel: "Abandon",
            // arrangeBed.controller.js
            morning: "Morning shift",
            afternoon: "Afternoon shift",
            evening: "Evening shift",
            night: "Night shift",
            temp: "Temporary shift",
            edit: "Edit",
            chooseDay: "Day not selected, select at least one",
            arrangeBedSuccess: "Bed arranged successfully",
            takeDayoffSuccess: "Take a dayoff successfully",
            editDayoffSuccess: "Edit dayoff record successfully",
            editBedSuccess: "Bed edited successfully",
            confirmDelete: "Delete confirmation",
            deleteRecord: "You are about to delete the bed record, click 'DELETE' to delete the content",
            delete: "Delete",
            deleteBedSuccess: "Bed deleted successfully",
            confirmCancelDayoff: "Cancel dayoff confirm",
            cancelDayoffContent: "You are about to cancel the dayoff, click 'CANCEL DAYOFF' to cancel the dayoff",
            cancelDayoff: "Cancel dayoff",
            cancelDayoffSuccess: "Cancel dayoff successfully!"
        }
    }, // end of bed

    // arrange.html
    arrange: {
        dayoffTitle: 'Dayoff Record',
        status: "{{status}} Bed",
        nurseName: "Nurse Name or Employee Id",
        searchPatient: "Please enter Medical Id or Name",
        noMatchPatient: "No patients were found",
        patient: "Patient",
        bad: "Bed",
        doctor: "Doctor",
        doctorName: "Doctor Name or Employee Id",
        nurses: "Nurse(s) (Required)",
        chooseFromLeft: "Please select nurse(s) from the left",
        mode: "Mode (Required)",
        startDate: "Start Date:",
        endDate: "End Date:",
        date: "Date:",
        chooseDays: "Select Day(s) (Required)",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thurs: "Thu",
        fri: "Fri",
        sat: "Sat",
        sun: "Sun",
        chooseShifts: "Select Shift (Required)",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        night: "Night",
        temp: "Temporary",
        shiftsArranged: "Arranged Date:",
        delete: "Delete",
        cancel: "Cancel",
        arrangeBed: "Arrange Bed",
        edit: "Edit",
        dayoff: "Take a Dayoff",
        memo: 'Memo'
    }, // end of arrange

    // shifts 排班 shifts.html
    shifts: {
        arrangeShift: "Set Shift",
        yearAndMonth: "{{year}} {{month}} ",
        currentMonth: "This month",
        ward: "Ward: ",
        copyShifts: "Copy Shifts",
        // component
        component: {
            addWardMessage: "Ward nurse not added, please add nurse in settings",
            mon: "Mon",
            tue: "Tue",
            wed: "Wed",
            thu: "Thu",
            fri: "Fri",
            sat: "Sat",
            sun: "Sun",
            copySingle: "Are you sure to copy the shift?Click OK will copy this month's shift to next month.",
            copyAll: "Are you sure to copy the shift?Click OK will copy everyone's shift to next month",
            confirmCopy: "Copy shift confirmation",
            copyOk: "copy",
            copyCancel: "Cancel",
            copySuccess: "Shift copied successfully",
            copyFail: "Shift copy failed",
        },

        // shifts content directive in common dir shiftsContent.html
        shiftsContent: {
            staff: "Staff(s)",
            total: "Total",
            totalStaff: "Total Staffs",
            edit: "Edit",
            save: "Save",
            reset: "Reset",
            shift: "Shift",
            BedGroup: "Bed Group",
            dailyTotal: "Daily Total",
            memo: "Memo",
            maxlengthMemo: "Cannot exceed 5000 characters",
            // component
            component: {
                mon: "Mon",
                tue: "Tue",
                wed: "Wed",
                thu: "Thu",
                fri: "Fri",
                sat: "Sat",
                sun: "Sun",
            }
        },

        // shiftsMemoDialog.html
        shiftsMemoDialog: {
            memo: "Memo",
            overTextMessage: "Cannot exceed 5000 characters",
            save: "Save",
            // component
            component: {}
        }
    }, // end of shifts

    // reports 報表 reports.html
    reports: {
        report: "Report",
        // component reports.controller.js
        component: {
            serviceQuality: "Service Quality Report",
            allVisit: "Service Report",
            allCharge: "Medical Charges Report",
            allEpo: "EPO Statistics",
            demography: "Demographic Statistics",
            allApo: "Abnormal record",
            allLabexam: "Labexam Record"
        },
        // serviceQuality 服務品質指標年度統計表 serviceQuality.html
        serviceQuality: {
            title: "{{selectedYear}} Service Quality Report",
            ward: "Ward:",
            year: "Year:",
            exportExcel: "Export To Excel",
            yearHeading: "{{selectedYear}}",
            itemAndMonth: "Factors \\ Month",
            months: "{{month}}",
            total: "Total",
            // component
            component: {
                PatientItems: 'Sheet times', // "次" must correspond to the "time" key
                PatientCount: 'Patient count', // "數" must correspond to the "count" key
                AlbuminNumber: 'Albumin Examine count',
                AlbuminPercent: 'Albumin(BCG) examination rate',
                AlbuminAverage: 'Albumin(BCG) average',
                AlbuminMore35Percent: 'Albumin(BCG) >= 3.5 percentage',
                KtVNumber: 'Kt/V examine count',
                KtVPercent: 'Kt/V examination rate',
                KtVAverage: 'Kt/V average',
                KtVMore2Percent: 'Kt/V >= 1.2 percentage',
                HctNumber: 'Hct examine count',
                HctPercent: 'Hct examination rate',
                HctAverage: 'Hct average',
                HctMore26Percent: 'Hct >= 26 percentage',
                HbNumber: 'Hb examine count',
                HbPercent: 'Hb examination rate',
                HbAverage: 'Hb average',
                HbMore26Percent: 'Hb > 8.5 g/dL',
                AdmissionCount: 'Admission count',
                AdmissionPercent: 'Admission rate',
                DeathCount: 'Death toll',
                LessYearDeath: 'Dialysis time<annual death rate',
                MoreYearDeath: 'Dialysis time>=annual death rate',
                VesselCount: 'Fistula recover count',
                VesselPercent: 'Fistula recover rate',
                RestoreCount: 'Kidney Recovered Count',
                RestorePercent: 'Detachment Rate(I)-Kidney Recovered',
                KidneyTransplantCount: 'Kidney Transplant count',
                KidneyTransplantPercent: 'Detachment Rate(II)-Kidney Transplant',
                HBsAgPositiveCount: 'HBsAg Positive Count',
                HBsAgNegativeCount: 'HBsAg Negative Count',
                HBsAgPositivePercent: 'HBsAg + Rate',
                AntiHCVPositiveCount: 'AntiHCV + Count',
                AntiHCVNegativeCount: 'AntiHCV - Count',
                AntiHCVPositivePercent: 'Anti-HCV + Rate',
                times: "Sheet times",
                count: "Patient count",
            }
        },
        // allVisit 服務總量統計表 allVisit.html
        allVisit: {
            title: "{{selectedYear}}-{{selectedMonth}} Service Report",
            ward: "Ward:",
            year: "Year:",
            month: "Month:",
            exportExcel: "Export To Excel",
            yearMonthHeading: "{{selectedYear}}-{{selectedMonth}}",
            itemAndMonth: "Factors \\  Month",
            total: "Total",
            // component
            component: {
                morning: 'Morning shift',
                afternoon: 'Afternoon shift',
                evening: 'Evening shift',
                night: 'Night shift',
                temp: 'Temporary shift',
                other: 'Other'
            }
        },
        // allCharge 計價項目統計表 allCharge.html
        allCharge: {
            title: "{{selectedYear}}-{{selectedMonth}} Medical Charges Statistics",
            ward: "Ward:",
            year: "Year:",
            month: "Month:",
            exportExcel: "Export To Excel",
            yearMonthHeading: "{{selectedYear}}-{{selectedMonth}}",
            itemAndDay: "Factors \\  Month",
            total: "Total",
            // component
            component: {},
        },
        // allEpo EPO統計表 allEpo.html
        allEpo: {
            title: "{{selectedYear}}-{{selectedMonth}} EPO Report",
            ward: "Ward:",
            year: "Year:",
            month: "Month:",
            yearMonthHeading: "{{selectedYear}}-{{selectedMonth}}",
            patient: "Patient(s)",
            itemAndDay: "Factors \\  Month",
            total: "Total",
            // component
            component: {},
        },
        // demography 人口學統計年度統計表 demography.html
        demography: {
            title: "{{selectedYear}} Demographical Statistics",
            ward: "Ward:",
            year: "Year:",
            exportExcel: "Export To Excel",
            yearHeading: "{{selectedYear}}",
            itemAndMonth: "Factors \\ Month",
            months: "{{month}}",
            total: "Total",
            deathReason: "The following are the cause(s) of death:",
            // component
            component: {
                PatientCount: 'Total number of patients',
                AverageAge: 'Average age',
                ElderCount: 'Age>=65',
                DiabeticNephropathyCount: 'Diabetic nephropathy patients',
                DeathCount: 'Number of deaths',
            },
        },
        // allApo 血液透析異常狀況紀錄 allApo.html
        allApo: {
            title: "{{selectedYear}}-{{selectedMonth}} Hemodialysis Abnormal Record",
            ward: "Ward:",
            year: "Year:",
            month: "Month:",
            exportExcel: "Export To Excel",
            yearMonthHeading: "{{selectedYear}}-{{selectedMonth}}",
            total: "Total",
            abnormalItem: "Abnormal Item",
            // component
            component: {
            }
        },
        // allLabexam 檢驗檢查紀錄 allLabexam.html
        allLabexam: {
            title: "{{selectedYear}}-{{selectedMonth}} Labexam Record",
            year: "Year:",
            month: "Month:",
            gridtitle: "Patient \\ Labexam Ietm",
            exportExcel: "Export To Excel",
            yearMonthHeading: "{{selectedYear}}-{{selectedMonth}}",
            // component
            component: {
            }
        },
    }, // end of reports

    // ro process
    roprocess: {
        title: 'RO Abnormal Record',
        pending: 'Pending',
        resolved: 'Resolved',
        dataSource: 'Source',
        machineNo: 'Machine No.',
        propertyNo: 'Property No.',
        reportValue: 'Value',
        abnormalTime: 'Abnormal Time',
        abnormalReason: 'Abnormal Reason',
        resolvedTime: 'Resolved Time',
        resolvedWay: 'Resolved Process',
        createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        manual: 'Manual',
        system: 'System',
        serverError: 'Server error, please refresh',
        noDataThisMonth: 'No data to display',
        noData: 'No data to display',
        cannotDel: 'Can not delete record from System',
        dialog: {
            phrase: 'Insert phrase',
            cancel: 'Cancel',
            create: 'Create',
            delete: 'Delete',
            edit: 'Edit',
            successfully: 'Successfully',
            failed: 'Failed',
            phraseInvalid: 'Please focus on Abnormal reason or Resolved Process',
            resolvedTimeInvalid: 'Resolved time can not before Abnormal time'
        },
        dashboardTitle: 'RO Abnormal Alert'
    }, // end of summary

    // summary summary.html
    summary: {
        // right sidenav
        dialysisRecordHistory: "Dialysis Record",
        vascularAccess: "AV Shunt Record",
        nursingProblem: "Rectification Record",
        nursingRecord: "Nursing Record",
        medicationRecord: "Medication Record",
        hemodialysisAbnormal: "Abnormal Condition",
        EpoStatistic: "Annual EPO Report",
        inspection: "Lab examination",
        doctor: "Doctor",
        prescription: "Dialysis Prescription",
        // toolbar
        dialysisRecord: "Dialysis Record",
        photoAlbum: "Album",
        dialysisCalendar: "Dialysis Calendar",
        share: "Share",
        print: "Print",
        dialysisForm: "透析表单",   // TODO
        // patient info
        age: "{{age}} y/o", // eg 10歲
        noDataWarning: "No dialysis machine information, please go to:",
        machineData: "Dialysis machine data",
        noDialysisRecord: "No Dialysis Record",
        goto: "Please go to",
        allDialysisRecords: "Dialysis Record History",
        createNewRecord: " create a new record.",
        cannotRead: "Cannot read the record",
        readError: "Read failed, please check the internet or re-entry this page. If it still can not fix it, please call the IT department, re-starting the server.",
        // component
        component: {
            retrieveError: "Read failed, {{data}}",
            unitTimes: "(times)",
            unitCC: "(cc)",
            AVFistula: "Autologous arteriovenous fistula",
            AVGraft: "Arteriovenous fistula",
            Permanent: "PermCath or other long term catheter",
            DoubleLumen: "Other short-term catheter",
            unknownType: "No corresponding pipe name",
            today: "Today",
        },
        album: "photo",
        doctorNote: "PREV summary",
        yearPlanReport: "Annual Plan",
        dialysisOverview: 'Dialysis Overview', // TODO

        // summaryContent directive summaryContent.html (common directives)
        content: {
            dialysisRecordTable: "Dialysis Record Form",
            dateAndNumberOfTreatment: "{{CreatedTime  | moment: 'YYYY/MM/DD(dd)'}} {{Number}} ",
            dateOfTreatment: "{{CreatedTime  | moment: 'YYYY/MM/DD(dd)'}}",
            dialysisTimes: "Dialysis #",
            name: "Name:",
            BedNo: "Bed #:",
            MedicalId: "Medical ID #:",
            age: "Age:",
            dialysisTime: "Dialysis Time",
            dialysisDate: "Dialysis Date",
            startTime: "Start Time",
            time: "Time",
            shiftIssue: "Shift Issue",
            noData: "No data",
            chiefComplaint: "Chief Complaint",
            start: "Start:",
            end: "End:",
            bloodPressure: "Blood Pressure",
            startTitle: "Start: {{BloodPressureBeforePosture}}",
            endTitle: "End: {{BloodPressureAfterPosture}}",
            Temperature: "Temp.:",
            degrees: "Degrees",
            weight: "Weight",
            StandardWeight: "Dry Weight:",
            Dehydration: "Removed:",
            DehydrationTarget: "Target:",
            DehydrationSetting: "Setting Excess Fluid Removal Amount:",
            deviation: "Deviation:",
            DialysisSystem: "Machine Type:",
            machineType: "Dialyzer Type:",
            Dialysate: "Dialysate:",
            Anticoagulants: "Anticoagulant:",
            EndHollowFiber: "Fiber:",
            EndChamber: "Chamber:",
            vascularAccess: "AV Shunt",
            StartDate: "Start Date:",
            ArteryCatheter: "Arterial Needle",
            VeinCatheter: "Venous Needle",
            CatheterLength: "Needle Length:",
            VACR: "Comorbidity",
            LabItems: "Lab:",
            BeforeDialysisExsanguinate: "Pre blood sampling:",
            BeforeBloodTransfusionPerson: "Phlebotomist:",
            AfterDialysisExsanguinate: "Post blood sampling:",
            AfterBloodTransfusionPerson: "Phlebotomist:",
            BloodTypes: "Blood Type:",
            RH: "RH:",
            BloodTransfusionTime: "Blood Transfusion Time",
            TransfusionReaction: "Reaction:",
            Prescription: "Prescription",
            DialysisTime: "Time",
            BPS: "BP",
            Breath: "HR/RR",
            BloodFlowRate: "BF Rate(CC/min)",
            VenousPressure: "Venous Press.(mmHg)",
            TMP: "TMP",
            UFRate: "UFRate",
            HeparinDeliveryRate: "Heparin",
            DialysisateFlowRate: "Dialysis FR(cc/h)",
            DialysateA: "Dialysate Conc",
            DialysateConductivity: "Dialysate Conduct.(mS/cm)",
            DialysateTemperature: "Dialysate Temp.",
            NormalSaline: "Saline Solution",
            AKClot: "AK Clot",
            FiftyPercentGW: "50% G/W",
            BloodLeak: "Blood Leak",
            NeedleStatus: "Needle Condition",
            Profile: "Profile",
            SubVolume: "SubVolume(L)",
            Memo: "Memo",
            TotalUF: "Total UF",
            nameTable: "Name",
            dosageTable: "Qty",
            methodTable: "Freq",
            prescribedTimeTable: "Prescribed",
            executionTimeTable: "Exec",
            signature: "SIG.",
            dialysisPrescription: "Dialysis Prescription",
            DW: "DW:",
            dt: "Dialysis Time:",
            dialysisTimeHour: "{{Hours}} ",
            dialysisTimeMinute: "{{Minutes}} ",
            dialysisTimeSecond: "{{Seconds}} ",
            DialysateConcentration: "Dialysate Conc:",
            HCO3: "HCO3 / NA:",
            dialysateTemperature: "Dialysate Temperature:",
            BF: "BF:",
            DialysateFlowRate: "Dialysate Flow Rate:",
            Route: "Route:",
            ArteryLength: "Arterial Needle:",
            VeinLength: "Venous Needle:",
            ArtificialKidney: "AK:",
            Mode: "Mode:",
            SupplementVolume: "IV Supplement Volume:",
            memo: "Memo:",
            condition: "Patient Health Record",
            NursingRecord: "Nursing Record",
            PunctureNurse: "Puncture nurse",
            CareNurse: "Nurse (on duty)",
            OffNurse: "Nurse (off duty)",
        },
        service: {
            close: "Close",
        },
    }, // end of summary

    // dialysis tab and right sidenav dialysisTabView.html
    dialysisTabView: {
        // toolbar
        dialysisRecord: "{{::StartTime | moment:'MM/DD'}} Dialysis Record",
        // tabs
        overview: "Overview",
        assessment: "Assessment",
        postAssessment: "Post-Assessment",
        machine: "Dialysis Machine",
        machineContinuous: "Continuous dialysis machine",
        executionRecord: "Execution Record", // Implement ST
        shiftIssue: "shift Issues",
        nursingRecord: "Nursing Record",
        prescribingRecord: "Medicine",
        doctorNote: "Doctor's Comment",
        bloodTransfusion: "Blood Transfusion",
        charge: "Medical Charges",
        EPO: "EPO",
        // right sidenav
        allDialysisRecords: "Dialysis Record History",
        vesselAssessmentAllRecords: "AV Shunt Record History",
        nursingProblemList: "Nursing Rectification Record HIstory",
        allNursingRecords: "Nursing Record History",
        allMedicationRecords: "Prescription Record History",
        apo: "Hemodialysis Record History",
        annualEpo: "Annual EPO Report",
        labexam: "Laboratory Examination",
        doctor: "Doctor",
        allPrescriptions: "Dialysis Prescription History",
        album: "Photo",
        // component
        component: {},
    }, // end of dialysis tab

    // overview 總覽 overview.html
    overview: {
        // notification
        notification: "Notification",
        notificationDataShow: "Total: {{length}}, Unread: {{notificationunread}}",
        notificationDetail: "Click here to browse notification detail",
        notificationRead: "Notification Read",
        notificationClose: "Close",
        // 基本資料
        basicInfo: "Basic Information",
        ward: "Ward",
        location: "Location",
        pateintSource: "Admission Type",
        bedNo: "Bed #",
        number: "Tot treatment",
        modeNumber: "{{mode}} treatment times",
        DialysisDataFirstTime: "Cycle Start Time ",
        DialysisDataLastTime: "Cycle End Time",
        lastShiftIssues: "Last Shift Report",
        ditto: "ditto",
        shiftIssues: "Shift Report",
        chiefComplaint: "Chief Complaint",
        // 透析處方
        dialysisPrescription: "Dialysis Prescription",
        Type: "State",
        longTerm: "Long-term",
        temporary: "Temporary",
        InBed: "In Bed",
        StandardWeight: "Dry Weight(D.W)",
        Frequency: "Frequency",
        anticoagulants: "Anticoagulant",
        Dialysate: "Dialysate",
        HCO3: "HCO3",
        Na: "Na",
        DialysateTemperature: "Dialysate Temperature",
        DialysateFlowRate: "Dialysate Flow Rate",
        ArteryLength: "Arterial Needle",
        VeinLength: "Venous Needle",
        Mode: "Mode",
        SupplementVolume: "IV Supplement",
        SupplementPosition: "IV Supplement Position",
        Route: "Route",
        BF: "BF",
        Duration: "Duration",
        ArtificialKidney: "Artificial Kidney",
        Memo: "Memo",
        noData: "No Data Currently",
        signNurseNfcTitle: "Proofreader(NFC)：",
        signNurseTitle: "Proofreader：",
        signNurse: "Name",
        signName: "Search Name",
        noSign: "Unsigned",
        // 生理徵象
        signs: "Vital Signs",
        posture: "Posture",
        preDialysis: "Pre-dialysis",
        BPS: "BPS",
        BPD: "BPD",
        choosePosture: "Please choose posture",
        lie: "Lying",
        sit: "Sitting",
        stand: "Standing",
        Temperature: "Temp.",
        Pulse: "HR",
        Respiration: "RR",
        postDialysis: "Post-dialysis",
        vitalSignDate: "測量日期",  // TODO:
        vitalSignTime: "測量時間",  // TODO:
        bloodChart: 'BPs Chart',
        chartNoData: 'No Data',
        // 檢驗
        labItemNames: "Lab Analysis",
        inspectionValue: "Lab Value",
        // 洗前採血
        BeforeDialysisExsanguinate: "Pre-Dialysis Blood Collection",
        yes: "Yes",
        none: "None",
        other: "Other",
        DialysisExsanguinateSettingAlertText: 'Please go to setting the Blood Collection items', // TODO: 請至後台參數設定處設定採血品項
        BeforeDialysisExsanguinateContent: "Other items",
        BeforeBloodTransfusionPerson: "Phlebotomist",
        AfterDialysisExsanguinate: "Post-Dialysis Blood Collection",
        AfterDialysisExsanguinateContent: "Other items",
        AfterBloodTransfusionPerson: "Phlebotomist",
        // 血管通路
        vesselAssessments: "AV Shunt",
        vesselAssessmentsNoData: "Please note that there are no AV shunt data",
        preCatheterLength: "Previous Cath. Length(cm)：",
        lastCatheterLengthError: "Error, please refresh",
        chooseAssessment: "Please select AV shunt",
        noStartTime: "There are no record opening time for this Dialysis Record",
        ArteryCatheter: "Arterial Needle",
        times: "(times)",
        VeinCatheter: "Venous Needle",
        CatheterLength: "Length(cm)",
        VACR: "Vascular Access Comorbidity Record",
        content: "Content",
        // 皮膚評估
        skinAssessment: "Dermal Assessment",
        SkinPosition: "Skin Site",
        normal: "Normal",
        redness: "Redness",
        wound: "Wound",
        Cyanosis: "Cyanosis",
        rednessAndSore: "Red, Swollen & Painful",
        brokenSkin: "Broken Skin",
        //
        Aranesp: "Aranesp(mcg)",
        clearAranesp: "Clear",
        route: "Route",
        // 透析後資料
        postDialysisData: "Post-dialysis AK",
        clearAfterDialysisOptions: "Clear",
        EndHollowFiber: "Post-Dialysis Hollow Fiber",
        EndChamber: "Post-Dialysis Chamber",
        EndHollowFiberAlertText: 'Please go to setting the Post-Dialysis Hollow Fiber items',
        EndChamberAlertText: 'Please go to setting the Post-Dialysis Chamber items',
        CreatedTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        EditTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        save: "Save",
        finishRecord: "Complete Recording",
        finishRecordTime: "Record was completed {{EndTime | moment: 'YYYY/MM/DD (dd) HH:mm'}}",
        dataDontExist: "Data does not exist",
        refreshConfirm: "Please confirm to refresh data",
        editedByNurse: "This record has been modified by other staffs",
        refresh: "Refresh",
        confirmDialysis: "Please confirm to complete the dialysis treatment.",
        finishDialysisRecord: "A new Dialysis Record will be generated upon completion of treatment",
        cancel: "Cancel",
        addOneData: "Add",
        delOneData: "Del",
        // component
        component: {
            clinic: "Outpatient clinic",
            emergency: "Emergency",
            hospitalized: "Hospitalized",
            admissionNumber: "Admission NO:",
            normal: "Normal",
            redness: "Redness",
            wound: "Wounded",
            Cyanosis: "Cyanosis",
            rednessAndSore: "Red, swollen, pain",
            brokenSkin: "Broken skin",
            AVFistula: "Autologous arteriovenous fistula",
            AVGraft: "Arteriovenous fistula",
            Permanent: "PermCath or other long term catheter",
            DoubleLumen: "Other short-term catheter",
            typeError: "Tube type error",
            editSuccess: "Updated successfully",
            editFail: "Update failed",
            signNurseLoginMessage: "Couldn't be the same user: {{loginName}}",
            rfidRoleNurseMessage: "Make sure current user has Nusre permission: {{rfid}}",
            rfidPatient: "User not found {{rfid}}",
            signNurse: "Proofreader",
            tagNfcCard: "Scan card to sign in this window",
            tagNfcCardOrDeleted: "Scan card to sign in this window, or delete current signature",
            changeSignNurse: "Modify Signature",
            checkChange: "Sure to change Signature?",
            checkDeleted: "Signature duplicated, do you wish to delete?",
            alertSaveTitle: "Sure To Save ?",
            alertSaveMessage: "Signature changed, please remember to save",
            covered: "Recover",
            deleted: "Delete",
            canceled: "Cancel",
            closed: "Close",
        },

        // weight-and-dehydration 體重與脫水量 weighAndDehydration.html
        weightAndWater: "Weight & Dehydration",
        checkInDate: "Check-in Date",
        checkInTime: "Check-in Time",
        TotalWeightPredialysis: "Pre. Tot wt.(Kg)",
        WheelchairWeight: "Wheelchair wt.(Kg)",
        NoClothingWeight: "Clothing wt.(Kg)",
        PredialysisWeightTitle: "Pre-dialysis Tot wt.(Kg) - Wheelchair wt.(Kg) - Clothing wt.(Kg)",
        PredialysisWeight: "Pre-dialysis wt.(Kg)",
        expectedWeight: "Target Dry wt.(Kg)",
        createDialysisPrescription: "Please create new Dialysis Prescription",
        DehydrationTargetTitle: "Pre-dialysis Tot wt.(Kg) - Target Dry wt. - Wheelchair wt.(Kg) - Clothing wt.(Kg)",
        DehydrationTarget: "UFnet(Kg)",
        DehydrationTargetError: "Cannot calculate UFnet(kg); please update your Dialysis Prescription",
        FoodWeight: "Food wt.(Kg)",
        Flush: "Intake(Kg)",
        EstimatedDehydrationTitle: "UFnet(Kg) + Food wt.(Kg) + Intake(Kg)",
        EstimatedDehydration: "Estimated UFgoal(L)",
        EstimatedDehydrationError: "Cannot calculate Estimated UFgoal(L); please update your Dialysis Prescription",
        DehydrationSetting: "UFgoal(Kg)",
        TotalWeightAfterDialysis: "Post Tot wt.(Kg)",
        WeightAfterDialysisTitle: "Post-dialysis wt.(Kg) - Wheelchair wt.(Kg) - Clothing wt.(Kg)",
        WeightAfterDialysis: "Post-dialysis wt.(Kg)",
        ActualDehydrationTitle: "Pre-dialysis wt.(Kg) - Post-dialysis wt.(Kg)",
        ActualDehydration: "Actual Excess Fluid Removed(Kg)",
        WeightDiffWarning: "Previous weight {{lastTimeWeight}} kg, major difference",
        abnormalWeight: "Abnormal Weight",
        abnormalWeightTrue: "Yes",
        AbnormalWeightReason: "Reason",
        // js
    }, // end of overview

    // assessment 評估
    assessment: {
        // assessments.html
        assessments: {
            preAssessment: "Pre-Assessment",
            postAssessment: "Post-Assessment",
            preFAB: "Pre",
            postFAB: "Pos",
            createPreAssessment: "Create Pre-Assessment",
            createPostAssessment: "Create Post-Assessment",
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}} ",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new record",
            serverError: "Server data access failedServer Access Failed",
            deleteRecord: "Please confirm deletion of this record",
            confirmDelete: "Do you wish to delete this record?",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {},
        },
        // assessment.html (detail page)
        assessment: {
            addPreAssessment: "Create Pre-Assessment",
            editPreAssessment: "Edit Pre-Assessment",
            showDeletedPreAssessment: "Show deleted Pre-Assessment",
            addPostAssessment: "Create Post-Assessment",
            editPostAssessment: "Edit Post-Assessment",
            showDeletedPostAssessment: "Show deleted Post-Assessment",
            addAssessment: "New Assessment Record",
            editAssessment: "Modify Assessment Record",
            showDeletedAssessment: "Show deleted Assessment Records",
            assessmentRecord: "Assessment Record",
            date: "Date",
            time: "Time",
            noData: "No data to display",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully!",
                editFail: "Update failed",
                createSuccess: "Created successfully",
                createFail:"Created failed",

            },
        },
    }, // end of assessment

    // machineData 透析機
    machineData: {
        // machineData.html
        machineData: {
            totalRecord: "Total: {{length}}",
            bloodPressure: "Blood Pressure",
            BloodFlowRate: "Blood Flow Rate",
            VenousPressure: "Venous Access Pressure",
            TMP: "TMP",
            UFRate: "UFR",
            assessment: "Assessment",
            noData: "No data to display",
            clickBottomRight: "Click the \"+\" to create new Dialysis Machine Data",
            serverError: "Server Access Failed",
            // component
            component: {
                confirmDelete: "Do you want to delete this dialysis machine information?",
                deleteOk: "Delete",
                deleteCancel: "Cancel",
                deleteSuccess: "successfully deleted",
                deleteFail: "Delete failed, reason:{{statusText}}",
            },
        },
        // machineDataDetail.html
        machineDataDetail: {
            createOrEditMachineData: "{{ machineDataId === 'create' ? 'New Dialysis Machine Data' : 'Modify Dialysis Machine Data' }}",
            createMachineData: "New Dialysis Machine Data",
            editMachineData: "Modify Dialysis Machine Data",
            date: "Recorded Date",
            time: "Recorded Time",
            cardNo: "Card #/ Model Type",
            remainingTime: "Remaining Time",
            hour: "H",
            min: "M",
            bloodPressure: "Blood Press.",
            systolicPressure: "BPS",
            diastolicPressure: "BPD",
            PulseBreath: "HR/RR",
            Pulse: "HR",
            Breath: "RR",
            BloodFlowRateLabel: "BFR(ml/min)",
            BloodFlowRate: "Blood Flow Rate(ml/min)",
            ArterialPressure: "Input Press.(mmHg)",
            FilterPressure: "Filter Press.(mmHg)",
            EffluentPressure: "Effluent Press.(mmHg)",
            PressureDrop: "Press. Drop(mmHg)",
            VenousPressureLabel: "VP(mmHg)",
            VenousPressure: "Venous Press.(mmHg)",
            TMPLabel: "TMP",
            TMP: "TMP",
            ACT: "ACT(sec)",
            HeaterTemperature: "Heater Temperature(℃)",
            UFRateLabel: "UFRate(L)",
            UFRate: "UFR",
            TotalUF: "Total UF",
            Heparin: "Heparin",
            HeparinOriginal: "Loading(ml)",
            HeparinDeliveryRate: "Main.(ml/hr)",
            HeparinAccumulatedVolume: "Heparin Accumulated Volume(ml)",
            DialysisateFlowRateLabel: "Dialysate Flow(ml/min)",
            DialysisateFlowRate: "Dialysate FR(ml/min)",
            DialysateA: "Dialysate Concen.",
            DialysateTemperature: "Dialysate Temp.(℃)",
            DialysateTemperatureSet: "Target Dialysate Temp.(℃)",
            DialysateConductivity: "Dialysate Conduct.(mS/cm)",
            NormalSalineLabel: "Saline Solution",
            NormalSaline: "Saline Drip Quantity",
            AKClot: "AK Clot",
            choose: "Please Choose:",
            FiftyPercentGW: "50% G/W",
            NeedleStatusLabel: "Needle Condition",
            UFProfile: "UF Profile",
            TargetSodium: "Target", // 因為Na+要上標，在前端處理
            NaProfile: "Profile", // 因為Na+要上標，在前端處理
            HDFType: "Mode",
            Volume: "Volume",
            SubVolume: "SubVolume(L)",
            Temperature: "Temp.",
            TotalBloodFlowVolume: "ACCUM BF Volume",
            BloodLeak: "Blood Leak",
            TargetUF: "Target UF",
            Memo: "Memo",
            insertPhrase: "Insert Phrase",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            readingData: "Accessing machine data...",
            serverError: "Server Access Failed",
            dataSource: 'Data source',
            targetUFDiffToDehydrationSetting: 'Target UF should be the same as excess fluid',
            UFTimeErr: 'Estimated prescription dialysis time',
            DialysateFlowRateErr: 'dialysate flow rate different to prescription',
            DialysateTemperatureErr: 'dialysate temp. different to prescription',
            BloodFlowRateErr: 'blood flow rate different to prescription',
            mesoAssessment: 'Assessment',
            mesoAssessmentAlert: 'Please go to setting the assessment items',
            // component
            component: {
                bluetoothOff: "Bluetooth is not turned on",
                invalidCard: "This is not an instrument card",
                cardError: "Instrument card content is wrong -> {{data}}",
                barCodeError: "Barcode content is wrong -> {{errText}}",
                QRCodePrompt: "Please place the barcode in the center of the frame",
                editSuccess: "Updated successfully",
                editFail: "Update failed",
                createSuccess: "Created successfully",
                createFail: "Create failed",
                serverError: "Server error, data saved to local storage and will upload the data once the connection is successful",
                warning: "Please note",
                differentData: "Data different from last time!",
                understand: "Got it",
                continuous: 'Continuous',
                single: 'Auto',
                manual: 'Manual',
                bleConnecting: 'Connecting...',
                dataTransfering: 'Receiving Data...',
                checkDialysisHeaderIsTodayTitle: 'Created date does not correspond to current record',
                checkDialysisHeaderIsToday: 'Dialysis record time ({{dialysisTime}}) does not correspond to current time ({{nowTime}}). Would you like to create?',
                create: 'Create'
            },
        },
    }, // end of machine data

    // continuousMachineData 連續型透析機
    continuousMachineData: {
        dialysisSystem: 'Model',
        info: 'Please use a device that supports Bluetooth to operate',
        totalRecord: 'total: {{count}}',
        // component
        component: {
            choose: 'Selected({{length}} records)',
            selected: 'Selected',
            notSelected: 'Unselected',
            doing: 'Processing...',
            confirmDiffFromOriBind: 'Different from the original link, would you like to relink?',
            reBind: 'Relink',
            isBound: 'Transmitter connected.',
            isExeTitle: 'Transmitter is in use.',
            currentExePatient: 'Patient {{patientName}}({{patientMedicalId}} is currently in progress.. If you would like to continue, the previous transmittion will be terminated. Do you wish to proceed?',
            diffFormAlert: 'The record of this patient is currently in progress.. If you would like to continue, the previous transmittion will be terminated. Do you wish to proceed?',
            execute: 'execute',
            isDiffTaskTitle: 'Different tasks',
            isDiffTask: 'Do you still want to stop the current task of the transmitter?',
            continueTask: 'Continue the current task?',
            infoNearby: 'Please operate nearby the tansmitter',
            infoBind: 'Please use machine card or scan QR code to start',
            infoBindIos: 'Please scan QR code to start',
            starting: 'Starting...',
            stoping: 'Stoping...',
            statusCheck: 'Status checking...',
            wait: 'Please wait...',
        },
        raspberrySetting: {
            piSetting: "Transmittion Settings",
            frequency: "Frequency(min)",
            frequencyMin: "The minimum frequency is 0.5 min",
            machine: "Machine",
            raspberryPiId: "Bluetooth ID",
            unBind: "Unbind",
            stop: "Stop",
            resume: "Transmission start",
            machineError: "Machine malfunction",
            close: "Close"
        }
    },

    // 執行紀錄
    allExecutionRecord: {
        // allExecutionRecord.html
        allExecutionRecord: {
            totalRecord: "Total: {{length}} ",
            execute: "Execute",
            dontExecute: "Skip",
            unexecuted: "Unexecuted",
            reasonMemo: "{{Mode === 'Neglect' ? 'Reason:': 'Remark:'}}{{Memo}}",
            noData: "No data",
            createPrescription: "Please add medication information to drug records.",
            serverError: "Server data read failed",
            infinity: "Non-expired",
            todayNoExecute: "Completed",
            todayExecute: "Left:{{times}}X",
            executeArea: "Left:{{times}}X ({{startDate}} ~ {{endDate}}).",
            allRecord: "Total",
            // component
            component: {
                remindOnSuccess: "Reminder truns on!",
                remindOnFail: "Fail to turn on reminder, please try again.",
                remindOffSuccess: "Reminder truns off!",
                remindOffFail: "Fail to turn off reminder, please try again.",
            },
        },
        // allExecutionDetail.html
        allExecutionDetail: {
            executeMedicine: "Execute the medicine",
            confirmExecuteMedicine: "Confirm not to execute the medicine.",
            medicine: "Medicine",
            route: "Route",
            Frequency: "Frequency",
            Quantity: "Usage amount",
            ActualQuantity: "Actual usage amount",
            usageMsgRequired: "Please add usage amount",
            usageMsgMin: "Must be greater than 0",
            doctorMemo: "Doctor Memo",
            DetailMemo: "Remark",
            reason: "Reason",
            reasonRequired: "Reason for not executing",
            save: "Save",
            delete:"Delete",
            DoctorMemo: " Prescription Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "Server data load failed",
            // signNurseNfcTitle: "Proofreader(NFC)：",
            signNurseTitleI: "Proofreader I：",
            signNurseTitleII: "Proofreader II：",
            signNurse: "Name",
            signName: "Search Name",
            noSign: "Unsigned",
            // component read
            component: {
                timeEarlier: "Execution time is ealier than created time( {{createdTime}} )",
                timeEarlierNow: "Execution time is ealier than the current time",
                timeLater: "Execution time is later than the current time",
                editSuccess: "Update successfully",
                editFail: "Update failed",
                alertSaveTitle: "Sure To Save ?",
                alertSaveMessage: "Signature changed, please remember to save",
                alertheSameTitle: "Attention",
                alertTheSameMessage: "Signatures are same !。",
                rfidRoleNurseMessage: "Make sure current user has Nurse permission: {{rfid}}",
            },
        },
        // allExecutionDialog.html
        allExecutionDialog: {
            executeMemo: "Memo",
            execute: "@:allExecutionRecord.allExecutionRecord.execute",
            dontExecute: "@:allExecutionRecord.allExecutionRecord.dontExecute",
            noData: "No data",
            noMemo: "No memo",
            component: {
                deleteSuccess: "Delete successfully",
                deleteFail: "Delete failed"
            },
        },
        // checkToDoDialog.html
        checkToDoDialog: {
            checkExecuteTitle: "Whether to record or not？",
            checkExecuteMessagaForExecute: "It is not necessary to record again, do you wish to record another execution record?",
            checkExecuteMessagaForDontExecute: "It is not necessary to record again, do you wish to record another non-execution record?",
            cancel: "Cancel",
            execute: "@:allExecutionRecord.allExecutionRecord.execute",
            dontExecute: "@:allExecutionRecord.allExecutionRecord.dontExecute"
        },
        // recordDeleteDialog.html
        recordDeleteDialog: {
            checkDeleteTitle: "Confirm to delete this record",
            checkDeleteMessage: "Do you wish to delete this record?",
            cancel: "Cancel",
            delete: "Delete"
        },
    },

    // 執行ST
    executionRecord: {
        // executionRecord.html
        executionRecord: {
            totalRecord: "Total: {{length}}",
            execute: "Implement",
            dontExecute: "Hold",
            unexecuted: "Unread",
            reasonMemo: "{{Mode === 'Neglect' ? 'Reason(s):': 'Memo:'}}{{Memo}}",
            noData: "No data to display",
            createPrescription: "Please enter the Medication Record page to create new Medication Record",
            serverError: "Server Access Failed",
            // component
            component: {},
        },
        // executionDetail.html
        executionDetail: {
            executeMedicine: "Comply",
            confirmExecuteMedicine: "Confirm to Hold",
            medicine: "Medicine",
            route: "Route",
            Frequency: "Frequency",
            Quantity: "Set Usage Quantity",
            ActualQuantity: "Actual Usage Quantity",
            usageMsgRequired: "Please enter usage quantity",
            usageMsgMin: "Value must be greater than 0",
            Memo: "Memo",
            reason: "Reason(s)",
            reasonRequired: "Please enter reasons for Holding",
            save: "Save",
            DoctorMemo: "Prescription Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "Server Access Failed",
            // component
            component: {
                timeEarlier: "Execution time is ealier than created time( {{createdTime}} )",
                timeLater: "Execution time is later than the current time",
                editSuccess: "Updated successfully",
                editFail: "Update failed",
            },
        },
    }, // end of execution record

    // 交班事項
    shiftIssues: {
        // shiftIssue.html
        shiftIssue: {
            createShiftIssue: "New Shift Issue",
            editShiftIssue: "Modify Shift Issue",
            showDeleted: "Show deleted Shift Issue",
            date: "Date",
            time: "Time",
            content: "Shift Issue",
            contentMax: "Shift Issue cannot exceed 5000 characters",
            insertPhrase: "Insert Phrase",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully!",
                editFail: "Update failed!",
                createSuccess: "Created successfully!",
                createFail: "Create failed!",
            },
        },
        // shiftIssues.html
        shiftIssues: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new Shift Issue",
            serverError: "Server Access Failed",
            deleteRecord: "Confirm to delete this Shift Issue",
            confirmDelete: "Do you wish to delete this Shift Issue?",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {
                deleteSuccess: "Deteleted successfully!",
                deleteFail: "Detelete failed!",
            },
        }
    },

    // 護理紀錄
    nursingRecord: {
        // nursingRecord.html (detail page)
        nursingRecord: {
            createNursingRecord: "New Nursing Record",
            editNursingRecord: "Modify Nursing Record",
            showDeleted: "Show deleted Nursing Record",
            date: "Date",
            time: "Time",
            Content: "Content",
            contentRequired: "Content cannot be left blank",
            contentMax: "Content cannot exceed 5000 characters",
            insertPhrase: "Insert Phrase",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully!",
                createSuccess: "Created successfully!",
                editFail: "Update failed",
                createFail: "Created failed"
            },
        },
        // nursingRecords.html
        nursingRecords: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new Nursing Record",
            serverError: "Server Access Failed",
            deleteRecord: "Confirm to delete this Nursing Record",
            confirmDelete: "Do you wish to delete this Nursing Record?",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {},
        },
    }, // end of nursing record

    // 開藥紀錄
    prescribingRecord: {
        // prescribingRecord.html
        prescribingRecord: {
            All: "All..",
            ST: "ST",
            NotST: "Non-ST",
            prevMonth: "Previous",
            nextMonth: "Next",
            validDrug: "In-Use",
            ImportST: "Import to last ST",
            lastMonthPrescribing: "Import into last month",
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            totalDays: "{{StartDate | date: 'yyyy-MM-dd' }} {{ Days > 1 ? vm.getEndDate(StartDate, Days): '' }} {{Days }} Day(s)",
            totalQuantity: "{{Route}} {{Frequency }} every time {{Quantity }} {{QuantityUnit }}, total: {{TotalQuantity}} {{QuantityUnit}}",
            noData: "{{showDate}} No data to display",
            clickBottomRight: "Please click \"+\" to create new Medication Record",
            serverError: "Server Access Failed",
            Infinity: "Non-expired",
            quantity: " {{Quantity}} {{QuantityUnit}} / times",
            IsOtherDrug: "Medication of other hospital",
            // component
            component: {
                importSuccess: "Imported ST successfully, total:{{dataCount}} records",
                noST: "No ST medication to import",
                importFail: "Import failed {{statusText}}",
                serverError: "Server error while retrieving ST records",
                confirmDelete: "Do you want to delete this medication record?",
                deleteWarning: "Please note: undelivered medication will be deleted!",
                deleteOk: "Delete",
                deleteCancel: "Cancel",
                deleteSuccess: "Successfully deleted",
                deleteFail: "Delete failed, reason: {{statusText}}",
            },
        },
        // prescribingDetail.html
        prescribingDetail: {
            createPrescription: "New Prescription Record",
            editPrescription: "Modify Prescription Record",
            showDeleted: "Show deleted Prescription Record",
            category: "Category",
            medicineName: "Drug Name",
            MedicineCode: "Medicine Code",
            NHICode: "National Health Insurance #",
            QuantityUnit: "Qty ({{QuantityUnit}})",
            QuantityRequired: "Please enter quantity per treatment",
            QuantityMin: "Qty must be greater than 0",
            Route: "Route",
            Frequency: "Frequency",
            StartDate: "Administer Date",
            StartDateRequired: "Please enter Administer Date",
            usageDays: "Duration(days)",
            usageDaysRequired: "Please enter duration of use (days)",
            usageDaysMin: "Duration of Use (days) must be greater than 0",
            TotalQuantity: "Total Qty",
            TotalQuantityRequired: "Please enter total quantity",
            TotalQuantityMin: "Total quantity must be greater than 0; please confirm the quantity, frequency, administer date, and duration of medication",
            Memo: "Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            serverError: "Server Access Failed",
            Infinity: "No expiration date",
            IsOtherDrug: "Medication of other hospital",
            OtherDrugContent: "Medication description of other hospital",
            ExecuteNoShow: "(Execution records are not shown)",
            // component
            component: {
                editSuccess: "Updated successfully",
                editFailMsg: "Update failed {{errorMsg}}",
                editFail: "Update failed",
                createSuccess: "Created successfully",
                createFailMsg: "Create failed {{errorMsg}}",
                createFail: "Create failed",
                PO: "PO - Oral",
                SC: "SC - Subcutaneous injection",
                SL: "SL - Sublingual",
                IV: "IV - Intravenous injection",
                IM: "IM - Intramuscular injection",
                IVD: "IVD - Intravenous drip",
                TOPI: "TOPI - Partially rubbed",
                EXT: "EXT - External use",
                AC: "AC - Before meal",
                PC: "PC - After meal",
                Meal: "Meal - Between meal",
                // Frequency
                QDPC: "QDPC - Once a day(After meal)",
                QN: "QN - Once every night",
                QOD: "QOD - Once after another day",
                HS: "HS - Once every night 30 min before bed",
                TID: "TID - 3 times a day(Morning, Afternoon, Evening)",
                TIDAC: "TIDAC - Everyday 30 min before every meal",
                TIDPC: "TIDPC - Everyday after every meal",
                BID: "BID - 2 times a day(Morning, Evening)",
                BIDAC: "BIDAC - Every morning and evening(30 min before meal)",
                BIDPC: "BIDPC - Every morning and evening(after meal)",
                ST: "ST - Use immediately",
                Q2W: "Q2W - Once every 2 weeks",
                QID: "QID - 4 times a day",
                QD: "QD - Once a day(fixed time)",
                QW1: "QW1 - Once a week(Mon)",
                QW2: "QW2 - Once a week(Tue)",
                QW3: "QW3 - Once a week（Wed)",
                QW4: "QW4 - Once a week(Thu)",
                QW5: "QW5 - Once a week(Fri)",
                QW6: "QW6 - Once a week(Sat)",
                QW7: "QW7 - Once a week(Sun)",
                QW135: "QW135 - 3 times a week(Mon, Wed, Fri)",
                QW135S: "QW1357 - 4 times a week(Mon, Wed, Fri, Sun)",
                QW246: "QW246 - 3 times a week(Tue, Thu, Sat)",
                QW246S: "QW2467 - 4 times a week(Tue, Thu, Sat, Sun)",
                QW136: "QW136 - 3 times a week(Mon, Wed, Sat)",
                QW146: "QW146 - 3 times a week(Mon, Thu, Sat)",
                PRN: "PRN - Use when needed",
                TIW: "TIW - 3 times a week",
                BIW: "BIW - 2 times a week",
                BIW13: "BIW13 - 2 times a week(Mon, Wed)",
                BIW15: "BIW15 - 2 times a week(Mon, Fri)",
                BIW24: "BIW24 - 2 times a week(Tue, Thu)",
                BIW26: "BIW26 - 2 times a week(Tue, Sat)",
                STMessage: "If the frequency is used immediately, it is used for the same day",
                PRNMessage: "If the frequency is taken when necessary, the total number can be modified.",
            },
        },
        // customMedicine.html
        customMedicine: {
            createPrescription: "New Prescription Record",
            editPrescription: "Modify Prescription Record",
            showDeleted: "Show deleted Prescription Record",
            category: "Category",
            medicineName: "Drug Name/Treatment",
            MedicineCode: "Medicine Code",
            NHICode: "National Health Insurance #",
            QuantityUnit: "Quantity per treatment", // "Quantity per treatment ({{QuantityUnit}})"
            Unit: "Unit",
            QuantityRequired: "Please enter quantity per treatment",
            QuantityMin: "Quantity must be greater than 0",
            Route: "Route",
            Frequency: "Frequency",
            StartDate: "Administer/Treatment Date",
            StartDateRequired: "Please enter Administer Date",
            usageDays: "Duration of Use (days)",
            usageDaysRequired: "Please enter duration of use (days)",
            usageDaysMin: "Duration of Use (days) must be greater than 0",
            TotalQuantity: "Total Quantity",
            TotalQuantityRequired: "Please enter total quantity",
            TotalQuantityMin: "Total quantity must be greater than 0; please confirm the quantity, frequency, administer date, and duration of medication",
            Memo: "Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            serverError: "Server Access Failed",
            Infinity: "No expiration date",
            IsOtherDrug: "Medication of other hospital",
            OtherDrugContent: "Medication description of other hospital",
            ExecuteNoShow: "(Execution records are not shown)",
            // component
            component: {
                editSuccess: "Updated successfully",
                editFailMsg: "Update failed {{errorMsg}}",
                editFail: "Update failed",
                createSuccess: "Created successfully",
                createFailMsg: "Create failed {{errorMsg}}",
                createFail: "Create failed",
                PO: "PO - Oral",
                SC: "SC - Subcutaneous injection",
                SL: "SL - Sublingual",
                IV: "IV - Intravenous injection",
                IM: "IM - Intramuscular injection",
                IVD: "IVD - Intravenous drip",
                TOPI: "TOPI - Partially rubbed",
                EXT: "EXT - External use",
                AC: "AC - Before meal",
                PC: "PC - After meal",
                Meal: "Meal - Between meal",
                // Frequency
                ST: "ST - Use immediately",
                STMessage: "If the frequency is used immediately, it is used for the same day",
                PRNMessage: "If the frequency is taken when necessary, the total number can be modified.",
            },
        },
        // medicineRecord.html
        medicineRecord: {
            chooseMedicine: "New Prescription; please select medication...",
            All: "All..",
            totalRecord: "Total: {{length}}",
            serverError: "Server Access Failed",
            CustomMedicine: "Custom Medicine",
            // component
            component: {},
        },
        // lastMonthPrescribing.html
        lastMonthPrescribing: {
            createNoST: "New {{::showDate}} Non- ST Administration",
            usageDate: "Administer Date",
            usageDays: "Duration of Use (days)",
            usageDaysRequired: "Please enter duration of use (days)",
            usageDaysMin: "Duration of Use must be greater than 0",
            chooseMedicine: "Please select the medications",
            Quantity: "{{::Route}} {{::Frequency}} every time {{::Quantity}} {{::QuantityUnit}}, total:{{::TotalQuantity}} {{::QuantityUnit}}",
            save: "Save",
            serverError: "Server Access Failed",
            // component
            component: {
                writeError: "Month {{showDate}} medication data write failed, reason: {{statusText}}",
                importSuccess: "Import completed, move to the list",
                loadDataError: "Failed to reload data, please go to list page to refresh!!",
                noPrescription: "No medication information",
            },
        },
    }, // end of prescribing record

    // 醫囑
    doctorNote: {
        diseaseSummary: "Condition Summary",
        diseaseSummaryMax: "Cannot exceed 5000 characters",
        insertPhrase: "Insert Phrase",
        save: "Save",
        doctorNoteEdit: "Modify pathography",
        doctorNoteCreate: "Add pathography",
        doctorNoteView: "View pathography",
        // component
        component: {
            createSuccess: "Created successfully!",
            editSuccess: "Updated successfully!",
        },
    },

    // 輸血
    bloodTransfusion: {
        // bloodTransfusion.html
        bloodTransfusion: {
            createBloodTransfusion: "New Blood Transfusion Record",
            editBloodTransfusion: "Modify Blood Transfusion Record",
            showDeleted: "Show deleted Blood Transfusion Records",
            basicInfo: "Basic Information",
            startTime: "Start Time",
            EndTime: "End Time",
            TherapistId1: "1st Inspection Staff",
            TherapistId1Code: "Code",
            TherapistId1Required: "1st Inspection Staff Code cannot be left blank",
            TherapistId1Dismatch: "1st Inspection Staff Code cannot be the same as the 2nd Inspection Staff Code",
            TherapistId1Error: "This 1st Inspection Staff Code does not exist",
            TherapistName1: "Name",
            TherapistName1Required: "1st Inspection Staff Name cannot be left blank",
            TherapistName1Error: "The 1st Inspection Staff Name does not exist",
            TherapistId2: "2nd Inspection Staff",
            TherapistId2Code: "Code",
            TherapistId2Required: "2nd Inspection Staff Code cannot be left blank",
            TherapistId2Dismatch: "2nd Inspection Staff Code cannot be the same as the 1st Inspection Staff Code",
            TherapistId2Error: "The 2nd Inspection Staff Name does not exist",
            TherapistName2: "Name",
            TherapistName2Required: "2nd Inspection Staff Name cannot be left blank",
            LeadBlood: "Blood Transfusion Slip",
            TransfusionReaction: "Transfusion Reaction",
            bloodBagInfo: "Blood Bag Data",
            create: "+ Create",
            save: "Save",
            noBloodBagInfo: "There are no Blood Bag Data currently",
            bloodProduct: "Blood Component",
            bloodType: "Blood Type",
            quantity: "Quantity(Bag)",
            validDate: "Valid Date",
            delete: "Delete",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            noBloodProduct: "There are no Blood Component Data; please contact your system administrator",
            chooseBloodProduct: "Please select Blood Component",
            bloodTypeRequired: "Blood Type Required",
            RHRequired: "RH Required",
            Volume: "Blood Volume(u)",
            barCodeLabel: "Please enter a non-repeating barcode",
            barCodePlaceholder: "Please enter a non-repeating barcode (Note: 1 barcode per line)",
            BarcodeRequired: "Please enter a non-repeating barcode",
            BarcodeMAx: "Cannot exceed over 5000 characters",
            cancel: "Cancel",
            ok: "Confirm",
            confirmDelete: "Confirm to Delete",
            deleteRecord: "Do you wish to delete this Blood Bag Record?",
            start: "Start",
            end: "End",
            // component
            component: {
                QRCodePrompt: "Please place the barcode in the center of the frame",
                editSuccess: "Updated successfully",
                editFail: "Update failed",
                createSuccess: "Created successfully",
                createFail:"Created failed"
            },
        },
        // bloodTransfusions.html
        bloodTransfusions: {
            showDeleted: "Show deleted # of records: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            unknown: "Unknown",
            LeadBlood: "Blood Transfusion Slip",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new Blood Transfusion Record",
            serverError: "Server Access Failed",
            confirmDelete: "Confirm deletion of this Blood Transfusion Record",
            deleteRecord: "Do you wish to delete this Blood Transfusion Record?",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {},
        },
    }, // end of blood transfusion

    // 計價
    charge: {
        // charge.html
        charge: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}, {{itemLength}} items",
            totalPrice: "Total $ {{totalPrice}} ",
            deposite: "Using {{Deposit}}{{Unit}} {{ItemName}}, Remaing Stock: {{Stock}}",
            withdraw: "Using {{Withdraw}}{{Unit}} {{ItemName}}, Charge ${{Price*Withdraw}}",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new Medical Charges Record",
            serverError: "Server Access Failed",
            stocktaking: "Stock-taking completed, modification is prohibited!",
            // component
            component: {
                QRCodePrompt: "Please place the barcode in the center of the frame",
                confirmDelete: "Confirm deletion of this charge Record",
                deleteRecord: "Do you wish to delete this charge Record?",
                deleteCancel: "Cancel",
                deleteOk: "Delete",
                itemNotFound: "No match item found, no such item barcode: {{resultMsg}}",
            },
        },
        // chargeCreate.html
        chargeCreate: {
            createCharge: "New Medical Charges Record",
            searchItem: "Search Items",
            itemList: "{{title}} Inventory List",
            remainingStock: "Remaining Stock: {{Stock}}",
            lowerSafetyStock: "Below safety stock",
            // component
            component: {
                QRCodePrompt: "Please place the barcode in the center of the frame",
            },
        },
        // chargePSWEditDialog.html
        chargePSWEditDialog: {
            editCharge: "Modify Record Form(s)",
            use: "Purpose",
            value: "Use",
            Stock: "Current Stock",
            SafetyStock: "Safety Stock",
            Withdraw: "Quantity({{action}})",
            WithdrawRequired: "Selection required",
            WithdrawMin: "Numerical value must be greater than 0",
            oldStockText: "{{action}} previous stock",
            oldQtyText: "Modify Previous {{action}}Quantity",
            QtyText: "Modify Latter{{action}}Quantity",
            SafetyStockText: "Safety Stock",
            StockText: "Modify Previous Stock",
            newStockText: "Modify New Stock",
            notSafety: "Low Stock!",
            notEnough: "Stock cannot be lower than 0!",
            stockAfter: "{{action}}New Stock",
            Price: "Unit Price",
            TotalPrice: "Total Price",
            Memo: "Memo",
            save: "Save",
            cancel: "Cancel",
            action: "Used",
            // component
            component: {
                action: "Use",
                inputError: "Operation failed, entered incorrectly!",
                itemsChecked: 'Stock-taking completed, modification is prohibited!'
            },
        },
    }, // end of charge

    // EPO
    epoRecord: {
        // epoRecord.html
        epoRecord: {
            prevMonth: "Previous",
            nextMonth: "Next",
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            execute: "Comply",
            dontExecute: "Hold",
            noData: "{{showDate}} No data to display",
            clickBottomRight: "Please click \"+\" to create new EPO Report",
            serverError: "Server Access Failed",
            // component
            component: {
                confirmDelete: "Do you wish to delete this EPO Record?",
                deleteOk: "Delete",
                deleteCancel: "Cancel",
                deleteSuccess: "Successfully deleted",
                deleteFail: "Delete failed, reason: {{statusText}}",
            },
        },
        // epo.add.html
        epoAdd: {
            createEpo: "New EPO",
            count: "#",
            medicine: "Medicine",
            choose: "Please select:",
            route: "Route",
            Quantity: "Quantity",
            Dosage: "Dosage",
            save: "Save",
            createdTime: "Established: {{::CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{::ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            // component
            component: {
                createSuccess: "Created successfully. Total:{{count}} Failed:{{failCnt}}",
                editSuccess: "Updated successfully",
                editFail: "Update failed",
            },
        },
        // epo.execute.html
        epoExecute: {
            executeMedicine: "Comply with Order",
            conformDontExecute: "Confirm to Hold",
            isModify: "Sorry, as you are not the EPO administrator, you are not authorized to modify this record。",
            date: "Date",
            time: "Time",
            medicine: "Medicine",
            route: "Route",
            Quantity: "Prescribed Quantity",
            Dosage: "，Dose {{::Dose}} ",
            ActualQuantity: "Quantity Administered ({{::QuantityUnit}})",
            QuantityRequired: "Please enter Administration Quantity",
            QuantityMin: "Quantity must be greater than 0",
            ActualDose: "Dosage Administered {{::DoseUnit}}",
            Type: "Type",
            choose: "Please select:",
            Public: "Public Fee",
            Self: "Out of Pocket",
            Memo: "Memo",
            reason: "Reason(s)",
            reasonRequired: "Please enter Reasons for Refrain",
            save: "Save",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "Server Access Failed",
            // component
            component: {
                timeEarlier: "Execution time is ealier than created time( {{createdTime}} )",
                timeLater: "Execution time is later than the current time",
                executeSuccess: "Execution succeed",
                executeFail: "Execution failed",
            },
        },
    }, // end of EPO

    // right sidenav==========================
    // vessel Assessment Tabs and toolbar
    vesselAssessmentAllRecords: {
        // vesselAssessmentAllRecords.html
        vesselAssessmentRecord: "AV Shunt Records History",
        vesselAssessmentTab: "AV Shunt Records",
        vesselProblemTab: "AV Shunt Issues",
        vesselAbnormalTab: "AV Shunt Treatment Records",
        // component
        component: {},
    },

    allDialysisRecords: {
        dialysisRecordHistory: "Dialysis Record History",
        totalRecord: "Total: {{totalCnt}} ",
        numberOfTimes: "#{{Number}} treatment at {{Location}}",
        noData: "To Add a Record",
        clickBottomRight: "Please click \"+\" to create new Dialysis Record",
        serverError: "Server Access Failed",
        createTable: "This patient has no Dialysis Prescription nor AV Shunt Data; are you sure you wish to proceed and create a record?",
        cancel: "Cancel",
        ok: "Confirm",
        // component
        component: {
            confirmDelete: "Confirmed Deletion of this dialysis record",
            deleteRecord: "Do you wish to delete this dialysis record?",
            deleteCancel: "Cancel",
            deleteOk: "Delete",
            deleteSuccess: "Successfully deleted",
            deleteFail: "Delete failed",
            formCreateFail: "Failed to create the form!",
            formCreateSuccess: "The form created successfully!",
        },
    }, // end of allDialysisRecords

    // 血管通路紀錄
    vesselAssessment: {
        // vesselassessment.html
        vesselAssessment: {
            createVesselAssessment: "New AV Shunt Evaluation Record",
            editVesselAssessment: "Modified AV Shunt Evaluation Record",
            showDeleted: "Show deleted AV Shunt Evaluation Record",
            createdDate: "Established Date",
            unknown: "Unknown",
            pipeType: "Catheterization Type",
            AVFistula: "AV Fistula",
            AVGraft: "AV Graft",
            Permanent: "PermCath / other long-term options",
            DoubleLumen: "Short-term Catheterization",
            CatheterTypeRequired: "Catheterization cannot be left blank",
            tubingposition: "Shunt Site",
            rightForearm: "R. Forearm",
            leftForearm: "L. Forearm",
            rightUpperArm: "R. Upper Arm",
            leftUpperArm: "L. Upper Arm",
            rightThigh: "R. Thigh",
            leftThigh: "L. Thigh",
            rightCalf: "R. Calf",
            leftCalf: "L. Calf",
            rightIJV: "R. IJV",
            leftIJV: "L. IJV",
            rightSV: "R. SJV",
            leftSV: "L. SJV",
            rightFV: "R. Femoral Vein",
            leftFV: "L. Femoral Vein",
            CatheterPositionRequired: "Catherization Site cannot be left blank",
            CatheterHospital: "Catheterization Institution",
            enterCatheterHospital: "Manual Input of Catheterization Institution",
            enterCatheterHospitalRequired: "Manual Input of Catheterization Institution cannot be left blank",
            Memo: "Memo",
            endDate: "End Date",
            EndReason: "Reason(s) for Discontinuation",
            camera: "Photograph",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            confirmDelete: "Confirmed Deletion",
            deletePic: "Do you wish to delete this picture??",
            cancel: "Cancel",
            delete: "Delete",
            // position and side
            right: "Right",
            left: "left",
            forearm: "Forearm",
            upperArm: "Upper Arm",
            thigh: "Thigh",
            calf: "Calf",
            IJV: "IJV",
            SV: "SV",
            FV: "FV",
            // component
            component: {
                imageFail: "Capture failed, reasion: {{errMessage}} warning",
                uploadSuccess: "Upload successfully!",
                uploadFail: "Upload failed, please try again!",
                editSuccess: "Updated successfully!",
                createSuccess: "Created successfully!",
                editFail: "Update failed",
                createFail: "Created failed",
            },
        },
        vesselAssessments: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            unknown: "Unknown",
            noData: "There are no AV Shunt Evaluation Record History currently",
            clickBottomRight: "Please click \"+\" to create new AV Shunt Evaluation Record History",
            serverError: "Server Access Failed",
            confirmDelete: "COnfirmed Deletion",
            deleteRecord: "Do you wish to delete this AV Shunt Evaluation Record??",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {
                AVFistula: "Autologous arteriovenous fistula",
                AVGraft: "Arteriovenous fistula",
                DoubleLumen: "Other short-term catheter",
                Permanent: "PermCath or other long term catheter",
            },
        },
    }, // end of vessel assessment

    // 血管通路問題
    vesselAssessmentProblems: {
        // vesselAssessmentProblemsList.html
        problemsList: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            noData: "There are no current AV Shunt Status Record History currently",
            clickBottomRight: "Please click \"+\" to create new AV Shunt Status Record",
            serverError: "Server Access Failed",
            confirmDelete: "Confirmed Deletion",
            deleteRecord: "Do you wish to delete this AV Shunt Status Record??",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {},
        },
        // vesselAssessmentProblemsDetail.html
        problemsDetail: {
            createVesselProblem: "New AV Shunt Status Record",
            editVesselProblem: "Modified AV Shunt Status Record",
            showVesselPrblem: "Show deleted AV Shunt Status Record",
            RecordDate: "Established Date",
            BF: "Blood Flow",
            VascularSoundWeakened: "Blood Flow Sound Weakening",
            LackBloodFlow: "Low Blood Flow",
            NoBloodFlow: "No Blood Flow",
            Infection: "infection",
            VenousPressure: "Venous Pressure >200",
            RednessPain: "Red, Swollen & Painful",
            NotEasyStopBleeding: "Difficult to stop bleeding after dialysis",
            Other: "Others",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            confirmDelete: "Confirmed Deletion",
            cancel: "Cancel",
            delete: "Delete",
            Venousneedledislodgement: "Venous needle dislodgement",
            tubeappearancechange: "Tube appearance change",
            StopBleedingOver20minutes: "Stop Bleeding Over 20 minutes",
            cholesterol: "cholesterol >300",
            Triglyceride: "Triglyceride >300",
            // component
            component: {
                editSuccess: "Updated successfully!",
                createSuccess: "Created successfully!",
                editFail: "Update failed",
                createFail: "Created failed"
            },
        },
    }, // end of vessel assessment problems

    // 血管異常處置紀錄
    abnormalVesselAssessment: {
        // abnormalvesselassessment.html
        abnormalVesselAssessment: {
            createAbnormalVessel: "New AV Shunt Status Record",
            editAbnormalVessel: "Modified AV Shunt Status Record",
            showDeleted: "Show deleted AV Shunt Status Record",
            Complications: "Complications",
            ComplicationsItems: "Complications (List)",
            choose: "Please select...",
            ComplicationsRequired: "Complication(s) must be selected",
            Disposal: "Treatment Method",
            DisposalItems: "Treatment Plan Items",
            DisposalRequired: "Treatment Plan required",
            DisposalResults: "Treatment Results",
            DisposalResultsRequired: "Treatment Results Required",
            insertPhrase: "Insert Phrase(s)",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            abnormal: "Abnormal",
            DisposalHospital: "Hospital",
            enterDisposalHospital: "Enter hospital manually",
            // component
            component: {
                Complications: { // TODO:
                    0: "Needle tube coagulation",
                    1: "Catheter outlet exudate",
                    2: "Insufficient Blood Flow",
                    3: "Prolong Bleeding Time",
                    4: "Palm/arm/finger swell/pain/numb/cold",
                    5: "Abnormal Bruit(Weakening/Discontinued/Change in Tune)",
                    6: "3 consecutive unusual increase of Venous pressure",
                    7: "Change of fistula appearance(detailed explanation)",
                    8: "Insufficient KT/V or URR",
                    9: "Path solidification",
                    10: "Infection (bacteria)",
                    11: "Catheter shedding",
                    12: "Puncture difficulty",
                    13: "Other",
                },
                Disposals: {
                    0: "Percutaneous transluminal coronary angioplasty(PTCA)",
                    1: "Vascular debridement",
                    2: "New vascular access reconstruction",
                    3: "Other(explain)",
                },
                editSuccess: "Updated successfully",
                createSuccess: "Created successfully",
                editFail: "Update failed",
                createFail: "Created failed"
            },
        },
        // abnormalvesselassessments.html
        abnormalVesselAssessments: {
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            unknown: "Unknown",
            noData: "No data to display",
            clickBottomRight: "Please click \"+\" to create new AV Shunt Record",
            serverError: "Server Access Failed",
            confirmDelete: "Confirmed Deletion",
            deleteRecord: "Do you wish to delete this AN Shunt Record?",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {},
        },
    }, // end of abnormal vessel assessment

    // 歷次透析護理問題處置
    nursingProblem: {
        // nursingProblemList.html
        nursingProblemList: {
            nursingProblemRecord: "Nursing Rectification Record History",
            showDeleted: "Show Deleted",
            totalRecord: "Total: {{Total}}",
            noData: "There are no Nursing Rectification Record",
            serverError: "Server Access Failed",
            confirmDelete: "Confirmed deletion of this Nursing Rectification Record",
            deleteRecord: "Do you wish to delete this Nursing Rectification Record",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {
                deleteSuccess: "successfully deleted",
            },
        },
        // nursingProblemItem.html
        nursingProblemItem: {
            nursingItemList: "Nursing Issues List",
            totalRecord: "Total: {{length}}",
            noData: "There are no Nursing Issues List currently",
            serverError: "Server Access Failed",
            // component
            component: {
                create: "Create",
                edit: "Edit",
                nursingMeasure: "Nursing measures",
            },
            search: "Search nursing problems"
        },
        // nursingProblemDetail.html
        nursingProblemDetail: {
            edit: "Modified",
            showDeleted: "Show Deleted",
            nursingProblemRecord: "{{::Name}}({{::MedicalId}}) Nursing Rectification Record",
            StartDate: "Start Date:",
            nursingProblem: "Nursing Rectifications:",
            editNursingProblem: "Modify Nursing Rectifications",
            Measures: "Nursing Solutions:",
            editMeasures: "Modify Nursing Solutions",
            ResolveDate: "Resolved Date:",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully",
                edit: "Edit",
                nursingMeasure: "Nursing measures",
                retrieveError: "Failure to obtain care, please refresh",
            },
        },
        // nursingProblemItemDetail.html
        nursingProblemItemDetail: {
            StartDate: "Start Date:",
            nursingProblem: "Nursing Rectifications:",
            Measures: "Nursing Solutions:",
            ResolveDate: "Resolved Date:",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            ok: "OK",
            // component
            component: {
                editSuccess: "Updated successfully",
                createSuccess: "Created successfully",
            },
        },
    }, // end of nursing problems

    // 歷次護理紀錄
    allNursingRecord: {
        // nursingRecord.html
        nursingRecord: {
            createNursingRecord: "New Nursing Record",
            editNursingRecord: "Modified Nursing Record",
            showDeleted: "Show deleted Nursing Record",
            content: "Content",
            contentRequired: "Content cannot be left blank",
            insertPhrase: "Insert Phrase(s)",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully",
                createSuccess: "Created successfully",
                editFail: "Update failed",
                createFail: "Created failed"
            },
        },
        // nursingRecords.html
        nursingRecords: {
            nursingRecord: "Nursing Record History",
            showDeleted: "Show Deleted",
            totalRecord: "Total: {{totalCnt}} ",
            noData: "There are no Nursing Record currently",
            serverError: "Server Access Failed",
            confirmDelete: "COnfirm deletion of this Nursing Record",
            deleteRecord: "Do you wish to delete this Nursing Record",
            cancel: "Cancel",
            delete: "Delete",
            // component
            component: {
                deleteSuccess: "Successfully deleted",
            },
        },
    }, // end of all nursing record

    // 歷次用藥記錄
    allMedicationRecords: {
        // allMedicationRecords.html
        medicationRecord: "Precription Record History",
        execute: "Comply",
        dontExecute: "Abstain",
        unexecuted: "Unread",
        noData: "There are no Precription Record History currently",
        serverError: "Server Access Failed",
        // component
        component: {},
    }, // end of all medication records

    // 歷次血液透析異常狀況記錄
    apo: {
        // apo.html
        apo: {
            createApo: "New Abnormal Condition",
            editApo: "Modified Hemodialysis Record",
            showDeleted: "Show deleted Hemodialysis Record",
            shift: "Shift",
            morningShift: "Morning Shift",
            afternoonShift: "Afternoon Shift",
            eveningShift: "Night Shift",
            ward: "Ward",
            patient: "Patient",
            abnormalItem: "Conditions",
            abnormalItemRequired: "Conditions required",
            AbnormalItemId: "Conditions (subcategory)",
            AbnormalItemIdRequired: "Conditions (subcategory) required",
            Memo: "Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            abnormal: "",
            // component
            component: {
                updateWard: "Please update the ward information before performing this operation",
                editSuccess: "Updated successfully",
                createSuccess: "Created successfully",
            },
        },
        // apos.html
        apos: {
            apoAbnormal: "Hemodialysis Record",
            showDeleted: "Deleted: ({{deletedItemsLength}})",
            totalRecord: "Total: {{length}}",
            unknown: "Unknown",
            noData: "There are no Hemodialysis Record currently",
            clickBottomRight: "Please click \"+\" to create new Hemodialysis Record",
            serverError: "Server Access Failed",
            confirmDelete: "Confirm Deletion",
            deleteRecord: "Do you wish to delete this Hemodialysis Record?",
            no: "No",
            yes: "Yes",
            morningShift: "Morning Shift",
            afternoonShift: "Afternoon Shift",
            eveningShift: "Night Shift",
            // component
            component: {
                noSetting: "The ward does not have this abnormal item.",
            },
        },
    }, // end of apo

    // EPO 年度統計表
    annualEpo: {
        // annualEpoReport.html
        annualEpoReport: "EPO Annual Report",
        selectedYear: "Please select year:",
        yearAndMonth: "{{selectedYear}} / {{month}}",
        dialysisTimes: "# of Dialysis Received",
        total: "Total Sum",
        serverError: "Server Access Failed",
        publicPay: "Public",
        selfPay: "Self",
        // component
        component: {
            date: "Date",
            dosage: "Personal dosage",
            route: "Injection route(IV.H)",
            doctor: "Physician",
            injector: "Injector",
            totalDosage: "Total dose",
        },
    }, // end of annual Epo

    // 檢驗檢查
    labexam: {
        // labexam.html
        labexam: {
            labexamResult: "Laboratory Examination Results",
            exportExcel: "Export To Excel",
            showdeletedAndTotal: "Deleted ({{deletedItemsLength}}) Total: {{length}}",
            oneMonth: "1 month (30days)",
            threeMonth: "3 month(90days)",
            sixMonth: "6 months (180days)",
            oneYear: "1 year(365days)",
            warning: "Note: Please hold to delete",
            date: "Date",
            totalRecord: "Total: {{length}}",
            noData: "There are no Laboratory Examination Results for this month currently",
            serverError: "Server Access Failed",
            confirmDelete: "Deletion Confirmed",
            deleteRecord: "Do you wish to delete this record?",
            cancel: "Cancel",
            delete: "Delete",
            weekTable: "Week Table",
            table: "Table",
            chart: "Chart",
            // component
            component: {
                tooHigh: "High",
                tooLow: "Low",
                normal: "Normal",
                abnormal: "Abnormal",
                other: "Other",
                date: "Date",
                nameAndDate: "Name/Date"
            },
        },
        // createLabexam.html
        createLabexam: {
            createLabexam: "New Lab Exam",
            editLabexam: "Modified Lab Exam",
            showDeleted: "Show deleted lab exam results",
            CheckTime: "Entry Time:",
            labName: "Lab Exam Name",
            labNameRequired: "Lab Exam Name cannot be left blank",
            labValue: "Lab Exam Value",
            labValueRequired: "Lab Exam Value cannot be left blank",
            labValueDigit: "Lab Exam Values are numerical",
            save: "Save Confirmed",
            labCode: "Lab Exam Code",
            NormalUpper: "Reference Maximum",
            NormalUpperDigit: "Reference Maximum is numerical",
            NormalDown: "Reference Minimum",
            NormalDownDigit: "Reference Minimum is numerical",
            unit: "Unit",
            IsNormal: "Within normal range？",
            normal: "Normal",
            abnormal: "Unusual",
            Memo: "Memo",
        },
        // updateLabexam.html
        updateLabexam: {
            createLabexam: "New Laboratory Examination",
            editLabexam: "Modify Laboratory Examination",
            showDeleted: "Show deleted Lab Exam Results",
            labCode: "Lab Exam Code",
            labName: "Lab Exam Name",
            labNameRequired: "Lab Exam Name cannot be left blank",
            labValue: "Lab Exam Value",
            labValueRequired: "Lab Exam Value cannot be left blank",
            labValueDigit: "Lab Exam Values are numerical",
            NormalUpper: "Reference Maximum",
            NormalUpperDigit: "Reference Maximum is numerical",
            NormalDown: "Reference Minimum",
            NormalDownDigit: "Reference Minimum is numerical",
            unit: "Unit",
            IsNormal: "Within normal range？",
            normal: "Normal",
            abnormal: "Unusual",
            CheckTime: "Examination Time",
            CheckTimeRequired: "Manual entry of Examination Time cannot be blank",
            save: "Save",
            Memo: "Memo",
            // component
            component: {
                editSuccess: "Updated successfully!",
                createSuccess: "Created successfully!",
                editFail: "Update failed",
                createFail: "Created failed"
            },
        },
        // labexamChart.html
        labexamChart: {
            checkResult: "Laboratory Examination Result",
            totalRecord: "Total: {{length}}",
            oneMonth: "1 month (30days)",
            threeMonth: "3 month (90days)",
            sixMonth: "6 months (180days)",
            oneYear: "1 year (365days)",
            noData: "There are no Laboratory Examination Result Data currently",
            serverError: "Server Access Failed",
        },
    }, // end of lab exam

    // 歷次表單
    dialysisForm: {
        times: 'times',
        timesTitle: '最近幾次',
        months: '月',
        monthsTitle: '最近幾個月',
        current: '目前瀏覽的表單',
        conditionTitle: '查詢類型',
        count: '第 {{ count }} 次',
        oneMonth: '最近一個月(30天)',
        twoMonths: '最近兩個月(60天)',
        threeMonths: '最近三個月(90天)',
    },
    // end of 歷次表單

    // 年度計畫表
    yearCalendarReport: {
        yearPlan: "Year Plan",
        year: "Year:",
        exportExcel: "Export To Excel",
        yearHeading: "{{selectedYear}}",
        months: "{{month}}",
        noData: "No Data",
        pending: "Pending",
        serverError: "Server Access Failed",
        component: {},
    },
    // end of 年度計畫表

    // 日曆-歷次透析處方
    // monthlyDialysisRecords
    monthlyDialysisRecords: {
        // monthlyDialysisRecords.html
        monthlyDialysisRecords: {
            prescribingRecord: "Dialysis Prescription Record",
            mode: "Mode:",
            none: "N/A",
            all: "All",
            dialysisRecord: "Dialysis",
            patientEvent: "Patient",
            yearPlan: "Annual",
            component: {
                whatTimes: "No.{{numberAll}}",
                none: "N/A",
                toolTipTitle: "Title：",
                tooltipContent: "Content：",
                tooltipCreator: "Creator："
            },
        },
        patientEventDialog: {
            newPatientEvent: "New Patient Event",
            updatePatientEvent: "Modify Patient Event",
            updateWardEvent: "Modify Ward Event",
            title: "Title",
            allDay: "AllDay",
            startDate: "Start Date",
            startTime: "Start Time",
            endDate: "End Date",
            endTime: "End Time",
            repeat: "Repeat",
            everyday: "Everyday",
            repeatEndDate: "Repeat End Date",
            tagColor: "Event Color",
            content: "Content",
            fillContent: "Please fill in the content",
            created: "Creator：",
            modified: "Modifier：",
            cancel: "Cancel",
            delete: "Delete",
            update: "Update",
            new: "New",
            mon: "Mon",
            tue: "Tue",
            wed: "Wed",
            thurs: "Thu",
            fri: "Fri",
            sat: "Sat",
            sun: "Sun",
            component: {},
        },
    },

    // 歷次透析處方
    allPrescriptions: {
        // allPrescriptions.html
        allPrescriptions: {
            prescribingRecord: "Dialysis Prescription Record History",
            HD: "HD",
            HDF: "HDF",
            SLEDDF: "SLEDD-f",
            interim: "Temporary",
            component: {},
        },
        // prescriptionTabPage.html
        prescriptionTabPage: {
            prescribingRecord: "Dialysis Prescription Record History",
            showDeleted: "Show Deleted",
            totalRecord: "Total: {{Total}}",
            longTerm: "Long-term",
            temporary: "Temporary",
            Item: "Item",
            StandardWeight: "D.W",
            Dehydration: "Excess Fluid Removal Amount",
            BF: "BF",
            Duration: "Duration",
            Frequency: "Frequency",
            Dialysate: "Dialysate",
            HCO3: "HCO3 / Na",
            ArtificialKidney: "Artificial Kidney",
            DialysateTemperature: "Dialysate Temperature",
            DialysateFlowRate: "Dialysate Flow Rate",
            Needle: "Needle",
            Mode: "Mode",
            noData: "There are no {{tag}}'s Dialysis Prescription Record History currently",
            clickBottomRight: "Please click \"+\" to create new Dialysis Prescription Record History",
            serverError: "Server Access Failed",
            confirmDelete: "Confirm to delete this Dialysis Prescription Record",
            deleteRecord: "Do you wish to delete this Dialysis Prescription Record?",
            cancel: "Cancel",
            delete: "Delete",
            copy: 'Copy',
            // component
            component: {
                interim: "Temporary",
                deleteSuccess: "successfully deleted",
            },
        },
        // prescriptionDetail.html
        prescriptionDetail: {
            createPrescription: "New Dialysis Record",
            editPrescription: "Modified Dialysis Record",
            showDeleted: "Show deleted Dialysis Record",
            loadPrev: "Do you wish to load the previous prescription record?",
            yes: "Yes",
            Type: "Prescription Status",
            LongTerm: "Long-term",
            ShortTerm: "Temporary (Prescription for the day only)",
            InBed: "In Bed?",
            StandardWeight: "D.W(kg)",
            enterStandardWeight: "Please enter D.W(Kg)",
            Dehydration: "Temporary Excess Fluid Removal Amount",
            enterDehydration: "Please enter Temporary Excess Fluid Removal Amount",
            BF: "BF(ml/min)",
            enterBF: "Please enter BF(ml/min)",
            DurationH: "Duration(Hours)",
            choose: "Please Select...",
            DurationM: "Duration(Minutes)",
            Frequency: "Frequency(times/wk)",
            Anticoagulants: "Anticoagulant",
            firstAnticoagulants: "Please enter initial single administration amount(u)",
            maintainAnticoagulants: "Please enter administration amount(u) to be maintained",
            reason: "Reasons for Refrain",
            enterReason: "Please enter reasons for refraining",
            otherItem: "Others",
            Dialysate: "Dialysate Ca/K",
            HCO3: "HCO3",
            enterHCO3: "Please enter HCO3",
            Na: "Na",
            enterNa: "Please enter Na",
            DialysateTemperature: "Dialysate Temperature",
            enterDialysateTemperature: "Please enter Dialysate Flow Rate",
            DialysateFlowRate: "Dialysate Flow Rate(ml/min)",
            Route: "Route",
            NeedleArteries: "Arterial Needle",
            NeedleVeins: "Venous Needle",
            ArtificialKidneys: "Artificial Kidney(AK)",
            mode: "Mode",
            SupplementVolume: "IV Supplement",
            enterSupplementVolume: "Please enter IV supplement volume or chroma",
            SupplementPosition: "IV Supplement Postion",
            choosePosition: "Please select postion:",
            chooseFrequency: "Please select frequency:",
            chooseDialysate: "Please select Dialysate:",
            chooseDialysateFlowRate: "Please select Dialysate Flow Rate",
            chooseRoute: "Please select Route:",
            chooseNeedleLength: "Please select length:",
            chooseArtificialKidneys: "Please select Artificial Kidneys:",
            front: "Pre",
            back: "Post",
            dialyzerSurfaceArea: "Dialyzer Surface Area",
            dialyzerSurfaceAreaPlaceHolder: "Dialyzer Surface Area(m^2)",
            PBP: "PBP",
            PBPPlaceHolder: "PBP(mL/hr)",
            FluidFlowWate: "Fluid Flow Wate",
            FluidFlowWatePlaceHolder: "Fluid Flow Wate(mL/hr)",
            ACTControl: "ACT Control",
            ACTControlPlaceHolder: "ACT Control(秒)",
            Memo: "Memo",
            enterMemo: "Please enter Memo",
            createdTime: "Established: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "Save",
            // component
            component: {
                editSuccess: "Updated successfully!",
                editFail: "Update failed!",
                createSuccess: "Created successfully!",
                createFail: "Create failed, ",
                prescription: "Dialysis prescription",
                overwriteConfirm: "Overwrite today's dialysis prescription header(overview)??",
                overwriteToday: "Overwrite today",
                dontOverwrite: "Do not overwrite",
                overwriteSuccess: "Overwrite success!",
                overwriteFail: "Overwrite failure, reason {{data}}",
                noPrevData: "There is no previous prescription record",
            },
        },
    }, // end of all prescription

    album: {
        album: {
            album: "Album",
            photoByDate: "By photo date",
            byAlbum: "By albulm",
            photofailed: "Capture failed, reason:",
            caveat: "Warning",
            addPicture: "Add photos",
            errorPicture: "Photo format is invalid. Please re-upload the photo",
            createOk: "Created successfully",
            modifyPicture: "Edit photo",
            modifyOk: "Updated successfully",
            delOk: "Album deleted successfully",
            delError: "Album deletion failed",
            trash: "Trash",
            otherAlbum: "Other albums"
        },
        photoList: {
            selected: "Chosen",
            hasPicture: "pictures",
            noPicture: "Currently no photo data",
            addPicture: "Please click \"camera\" button to create new record",
            pictureError: "Failed to retrieve photo, please refresh",
            modifyContent: "Edit content",
            plsSelect: "Please choose",
            photoDescription: "Photo description",
            modifyOk: "Confirm changes",
            deletePhoto: "Delete {{Piclength}} selected pictures ?",
            cancel: "Cancel",
            toTrash: "Move to trash"
        },
        albumList: {
            selected: "Chosen",
            hasAlbum: "Current album",
            garbage: "Trash",
            noAlbum: "No album information",
            addAlbum: "Please click \"camera\" button to create new record",
            albumError: "Album file read failed, please refresh",
            deleteAlbum: "Are sure you want to delete album {{Piclength}}?",
            description: "Once deleted, the album can not be recovered. When you delete an album, the photos in it remain in your photo gallery.",
            delAlbum: "Confirm deletion",
            cancel: "Cancel",
            seal: "Seal",
            reduction: "Restore",
            modifyContent: "Edit content",
            plsSelect: "Please choose",
            photoDescription: "Photo description",
            modify: "Edit"
        },
        showPhoto: {
            addAlbumDo: "Create a new album",
            addAlbum: "New album",
            cancelAddAlbum: "Cancel",
            selectAlbum: "Choose an album",
            photoDescription: "Photo description",
            photoName: "Photo Name",
            uploadOk: "Confirm upload"
        }
    },
    allDoctorNote: {
        alldoctorNote: "Previous summary",
        doctorNote: "Disease summary",
        noData: "Currently no summary of the condition",
        totalRecord: "Total: {{totalCnt}}",
        serverError: "Server Access Failed",
        confirmDelete: "Confirm to delete this nursing Record",
        deleteRecord: "Do you wish to delete this nursing Record?",
        cancel: "Cancel",
        delete: "Delete",
        createRecord: "Create {{!loading ? Name + '(' + MedicalId + ')' : null }} disease summary",
        editRecord: "Modify {{!loading ? Name + '(' + MedicalId + ')' : null }} disease summary",
        showDeleted: "show deleted {{!loading ? Name + '(' + MedicalId + ')' : null }} disease summary",
        createdTime: "Created: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "Modified: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        doctorNoteTime: "Date created",
        content: "Content"
    },
    openCamera: {
        photofailed: "Capture failed, reason:",
        caveat: "Warning",
    },

    // 片語目錄 phraseIndex.html phraseButton.js
    phrase: {
        edit: "Edit",
        delete: "Delete",
        cancel: "Cancel",
        noDataMessage: "No data...",
        addCatalog: "New directory",
        addPhrase: "New phrase",
        catalogName: "Directory name",
        enterCatalogName: "Enter directory name",
        title: "Title",
        enterPhraseTitle: "Enter title",
        phraseContent: "Phrase content",
        enterPhraseContent: "enter content",
        updateCatalog: "Edit directory",
        updatePhrase: "Edit phrase",
        deleteMessage: "Would you like to delete？",
        component: {
            phraseIndex: "Directories",
            personalPhrase: 'Personal phrases',
            systemPhrase: 'System phrases',
            deleteSuccess: "Successfully deleted!",
            createSuccess: "Successfully Added!",
            updateSuccess: "Successfully edited!",
        }
    },

    // dashboard
    dashboard: {
        outpatient: "Outpatient",
        Hospitalization: "Hospitalized",
        person: "Person(s)",
        component: {
            patient: "Patients",
            machine: "Machines",
            beds: "Beds",
            shifts: "Shifts",
            other: "Other",
            directory: "Directory"
        }
    },
    // patientsBoard.html
    patientsBoard: {
        serverError: "Server error, please refresh",
        none: "N/A",
        Hospitalized: "Hosp- {{bedNo}}",
        Outpatient: "Out",
        memo: "Memo",
        notification: "Notification",
        dialysisRecord: "Record",
        component: {
            recordDone: "Completed",
            postDialysis: "Post dialysis",
            dialyzing: "Dialyzing",
            recordStart: "Started"
        }
    },
    // shiftsBoard.html
    shiftsBoard: {
        date: "{{year}} / {{month}}",
        serverError: "Server error, please refresh",
    },
    // machinseDataBoard.html
    machineDataBoard: {
        dialysisFR: "Dialysate FR: {{dialysisFR}}",
        bloodFR: "Blood FR: {{bloodFR}}",
        bloodP: "BP: {{BPS}}/{{BPD}}",
        respiration: "P/RR: {{Pulse}} / {{Breath}}",
        temp: "Temp: {{temp}}",
        component: {
            recordDone: "Completed",
            postDialysis: "Post dialysis",
            dialyzing: "Dialyzing",
            recordStart: "Started",
            serverConnecting: "Connecting to server..."
        }
    },
    // bedsBoard.html
    bedsBoard: {
        serverError: "Server error, please refresh",
    },

    // summaryContentDialog.html
    summaryContentDialog: {
        header: "{{name}} ({{medicalId}}) Report"
    },

    // baiduEcharts.js (directive)
    baiduEcharts: {
        noData: "No Data"
    }

}; // end of translation

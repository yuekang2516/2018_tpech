/*
Chinese translation dictonary
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

window.zh_tw_translations = {
    // custom messages for toast message
    customMessage: {
        EXISTED_IDENTIFIER: "身份證已存在",
        EXISTED_RFID: "RFID已存在",
        EXISTED_BARCODE: "條碼已存在",
        EXISTED_MEDICALID: "病歷碼已存在",
        NO_DATA: "找不到資料",
        FAILED_VALIDATION: "必要欄位未填寫",
        MODULE_ERROR: "版本錯誤",
        NO_SOURCE: "無資料來源",
        NO_PATIENTID: "無病人代碼",
        EXISTED_ACCOUNT: "帳號已存在",
        UPDATE_FAILD: "更新失敗",
        HAS_ASSIGN_BED: "當天已排床",
        OTHER_PEOPLE_ASSIGN_BED: "已有其他人排床",
        CHECK_WEIGHT: "請確認體重是否正確",
        NO_PATIENT: "病人不存在",
        CHECK_DATETIME_FORMAT: "請確認日期格式",
        PRESCRIPTION_STATE_ERROR: "處方狀態錯誤",
        NO_PRESCRIPTION: "無此筆透析處方資料",
        TODAY_NO_DIALYSIS: "此病人無今日透析中資料",
        PARAMETER_EMPTY: "參數不可為空值",
        NO_MEDICINE_GET_CATEGORY_FAIL: "找不到藥品資訊，取得藥品類別失敗",
        NO_MEDICINE_CODE: "請填寫藥品代碼",
        EXISTED_MEDICINE_CODE: "藥品代碼已存在",
        NO_MEDICINE_NAME: "請填寫藥品名稱",
        NO_QUANTITY: "請填寫數量",
        NO_ROUTE: "請填寫途徑",
        NO_FREQUENCY: "請填寫頻率",
        NO_MEDICINE: "請確認藥品檔，查不到此藥品",
        NO_MEDICINE_BY_ID: "請確認藥品檔，查不到此藥品 Id",
        NO_START_TIME: "請填寫開始用藥時間",
        DAYS_FAILED_VALIDATION: "請填寫用藥期間，並且需大於0",
        NO_USER: "使用者不存在",
        NO_PATIENT_NAME: "請輸入病人姓名",
        NO_IDENTIFIER: "請輸入身份證字號",
        NO_MEDICAL_CODE: "請輸入病歷碼",
        NO_WARD: "請輸入透析室",
        EXISTED_WARD_NAME: "透析室名稱重覆",
        CAN_NOT_BE_DELETED: "此筆項目不可刪",
        MEASUREMENT_TIME_IS_NOT_TODAY: "量測時間不是今日",
        ADDED_FAILED: "新增失敗",
        ADDED_SUCCESSFULLY: "新增成功",
        UPDATE_COMPLETED: "修改成功",
        WRONG_PASSWORD: "密碼錯誤",
        ACCOUNT_DISABLED: "帳號已停用",
        doItLater: '稍後再說',
        cancel: '取消',
        iKnow: '我知道了',
        serverError: '伺服器錯誤',
        serverError1: '伺服器資料讀取失敗，請重新整理',
        OFFLINE: '網路已斷線，請檢查網路',
        OFFLINE_OR_SERVERERR: '網路已斷線，請檢查網路或請確認伺服器位置設定',
        Datasuccessfully: '資料儲存成功',
        DatasFailure: '資料儲存失敗',
        DataDeletedSuccess: '資料刪除成功',
        DataDeleteFailed: '資料刪除失敗',
        readonly: '唯讀',
        readonlyTitle: '僅建立者或管理者可修改'
    },
    // raspberryPi-related
    raspberryPi: {
        serverEmpty: '伺服器未填寫',
        meterNotSupport: '設定的儀器不支援',
        systemError: '系統錯誤',
        connectMeterError: '傳輸器與透析機連線錯誤',
        readDataError: '資料讀取錯誤',
        notBindingTitle: '未與傳輸器連結提示',
        notBindingContent: '請將手持裝置開啟藍芽後，靠向傳輸器的卡片，進行連結',
        notBindingContentForIos: '請將手持裝置開啟藍芽後，掃條碼連結',
        scan: '掃描',
        settingError: '未設定成功，請再設定一次',
        doUnbind: '您確認要解除連結？',
        unbind: '解除連結',
        confirmStop: '您確認要停止傳輸？',
        stop: '停止連續傳輸',
        bindSuccessfully: '連結傳輸器完成',
        settingFinished: '設定完成',
        contSettingRestart: '連續設定重啟',
        contSettingSuccessfully: '連續傳輸設定成功',
        contStop: '連續傳輸停止',
        connecting: '與傳輸器連接中...',
        setting: '設定傳輸器中...',
        syncStatusError: '更新伺服器狀態失敗',
        connectServerError: '連接伺服器錯誤',
        getPiStatusSuccessfully: '取得傳輸器目前狀態成功',
        getPiStatusFail: '取得目前傳輸器狀態失敗，請重新操作',
        piNotFound: '找不到傳輸器，請重開',
        reloadPiStatus: '已啟動，重新讀取病人狀態'
    },
    bluetooth: {
        receivingDataTimeout: '讀取超過10秒',
        btError: '藍牙棒錯誤，請重新操作 {{errorCode}}',
        btNotFound: '找不到藍牙棒 -> {{macAddr}}，請重開藍牙棒',
        cannotFindCorrespondingMachine: '未支援此機型',
        btConnectError: '藍牙連線錯誤，請重新操作',
        btPoweroff: '藍牙未開啟，請打開藍牙棒後，重新操作',
        btDisconnectFail: '藍牙斷線失敗，請離開本頁面並重新操作',
        dataFormatWrong: '透析機傳回資料格式有誤，請重新操作',
        btConnectLose: '藍牙意外斷線，請重新操作',
        btRetryConnectError: '藍牙連線錯誤，請確認藍牙是否開啟及是否在連線範圍',
        btRestarting: '重啟藍牙中...',
        btConnectErrorRestartBle: '藍牙連線錯誤，請重新操作或於此按',
        btRetryConnect: '重新連線',
        btMacError: '藍牙 Mac 碼有誤，請確認卡片或 QR code 內容是否正確'
    },
    nfc: {
        openNFC: '請開啟 NFC 功能',
        gotoSetting: '前往設定頁'
    },
    // directives (common)
    // dateTimePickerStandard.html
    dateTimePickerStandard: {
        date: "{{dateText}}日期",
        dateRequired: "{{text}}日期不能為空白",
        time: "{{timeText}}時間",
        timeRequired: "{{text}}時間不能為空白"
    },
    // lastRefreshTime.component.js
    lastRefreshTime: {
        refreshTime: "更新：{{time}}",
    },
    // shiftsContent.component.js
    shiftsContent: {
        duplicateShift: "已有重複的排班，請重新選擇",
        unsaved: "尚未存檔",
        confirmUnsaved: "尚有資料未儲存，是否仍要繼續?",
        dontSave: "不要儲存",
        saveCancel: "返回編輯",
        saveSuccess: "儲存成功",
        saveFail: "儲存失敗",
    },
    // summaryContent.component.js
    summaryContent: {
        RHPos: "RH＋（陽性）",
        RHNeg: "RH−（陰性）",
        RHUnknown: "未知",
    },
    // bedsContent.html
    bedsContent: {
        doctorName: "醫師：{{doctor}}",
        nurses: "護理師{{idx + 1}}：{{n}}",
        mode: "模式：{{mode}}",
        afk: "人工腎臟：{{afk}}",
        dialysate: "透析液：{{dialysate}}",
    },
    // login page login.html
    login: {
        DialysisSystem: "透析系統",
        enterUsernamePassword: "請輸入帳號及密碼",
        scanToLogin: "或刷卡登入",
        enterUsername: "請輸入帳號",
        enterPassword: "請輸入密碼",
        username: "帳號",
        password: "密碼",
        login: "登入",
        downloadAPK: "下載APK",
        updateMessage: "程式升級中，需下載30～40MB檔案，費時幾分鐘，請耐心等待",
        // component
        component: {
            tutorText: "\n請至設定頁面設定伺服器位置\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
            optionalMessage: "加購項目：",
            version: "版本：",
            formMessage: "留言：",
            submitSuccessMessage: "表格送出，我們會派專人與您聯絡",
            updateDialog: "要升級嗎？",
            newVersion: "伺服器有新的版本：",
            updateOk: "升級！",
            updateCancel: "不要",
            downloadFail: "下載失敗",
            QRCodePrompt: "請將條碼置於框框中央處",
            serverNotFound: "找不到伺服器，請檢查網路",
            pageNotFound: "找不到網頁({{status}})，請重開伺服器",
            serverError: "伺服器有問題(http {{status}} )，請重開伺服器",
        }
    }, // end of login

    // hct24Login page hct24Login.html
    hct24Login: {
        SmartECareDialysisSystem: "悅康透析系統",
        SmartECareDialysisSystemSamllText: "Smart eCare Hemodialysis System",
        aboutSystem: "關於系統",
        systemFunction: "系統功能",
        applySystem: "系統申請",
        firstChoiceMessage: "中小型地區洗腎中心的第一選擇",
        unLimitedMessage: "不限人數、不限模組、不須下載",
        free30Days: "免費試用30天",
        memberLogin: "會員登入",
        enterUsername: "請輸入帳號",
        enterPassword: "請輸入密碼",
        login: "登入",
        downloadAPK: "下載APK",
        clinic: {
            clinicTitle: "醫療臨床現況",
            problem1: "問題一",
            message1: "臨床需收集眾多資料，且分散各處未整合",
            problem2: "問題二",
            message2: "臨床儀器資料抄寫，登錄費時費力",
            problem3: "問題三",
            message3: "資料抄寫錯誤或遺失",
        },
        choice: {
            choiceTitle: "洗腎中心的第一選擇",
            picture1: "語音導讀，自動上傳",
            picture2: "無線傳輸，三重辨識認證",
            picture3: "100%無紙化作業流程",
            picture4: "雲端架構,資料備援及加密保護",
        },
        function: {
            functionTitle: "系統功能",
            functionMessage: "簡單三步驟 輕鬆完成照護流程",
            picture1: "利用識別卡或手圈快速辨識身份",
            picture2: "平板裝置即時讀取量測儀器訊號",
            picture3: "中央即時監控HIS整合應用",
        },
        apply: {
            applyTitle: "系統申請",
            dollarIcon: "NT$",
            or: "或",
            eachDollarMessage: "/每張表單",
            choiceThis: "我要選擇",
            plusBuy: "加購項目：",
            basic: {
                title: "基本版",
                price: "20,000/月",
                eachPrice: "25",
            },
            advanced: {
                title: "標準版",
                price: "25,000/月",
                eachPrice: "30",
            },
            premium: {
                title: "完整版",
                price: "30,000/月",
                eachPrice: "35",
            },
            function: {
                "0": "病人管理",
                "1": "洗腎作業管理",
                "2": "醫囑管理",
                "3": "通知管理",
                "4": "片語管理",
                "5": "相簿管理",
                "6": "計價管理",
                "7": "病人排床管理",
                "8": "工作人員排班管理",
                "9": "電子白板",
                "10": "報表管理",
                "11": "KiDiT作業管理",
            },
            weightScale: {
                title: "體重機連線系統",
                function1: "身分辨識功能",
                function2: "體重自動上傳",
            },
            bloodPressure: {
                title: "血壓計連線系統",
                function1: "身分辨識功能",
                function2: "血壓自動上傳",
            },
        },
        contact: {
            title: "請留下您的聯絡方式，我們會派專人與您聯絡",
            companyName: "公司大名",
            companyPhone: "公司電話",
            contactPerson: "公司聯絡人",
            email: "Email",
            memo: "您的留言",
            phoneEmpty: "請輸入您的公司電話",
            phoneError: "電話號碼不正確",
            contactPersonEmpty: "請輸入公司聯絡人",
            emailEmpty: "請輸入您的Email",
            emailError: "Email格式不正確",
            submit: "送出",
            clear: "清除",
        },
        // component
        component: {}
    }, // end of hct24Login

    // home left navbar home.html
    home: {
        welcome: "{{username}} 您好",
        patients: "血透病人清單",
        pdPatients: "腹透病人清單",
        myPatiens: "我的病人(血透)",
        todayBeds: "今日床位",
        notification: "最新通知",
        arrangeBed: "排床",
        arrangeShift: "排班",
        dashboard: "電子白板",
        reports: "報表",
        settings: "系統設定",
        logout: "登出",
        healthEducation: "衛教作業",
        // component
        component: {}
    }, // end of home

    // allPatients allPatients.html
    allPatients: {
        // html
        totalRecord: "共 {{total}} 筆",
        patients: "@:home.patients",
        searchFinish: "退出搜尋",
        filter: "過濾條件",
        Name: "姓名",
        MedicalId: "病歷號",
        RFID: "RFID",
        BarCode: "條碼",
        IdentifierId: "身分證號",
        cancel: "取消",
        ok: "確認",
        BeforeBP: "透析前BP",
        AfterBP: "透析後BP",
        none: "無",
        finish: "結束",
        close: "關表（透析完成）",
        total: "共",
        record: "筆",
        inactivePatient: "包含轉出、死亡等病人",
        // component
        component: {
            patientDataFail: "讀不到病人資料，請重新整理",
            Name: "名稱",
            MedicalId: "病歷號",
            RFID: "RFID",
            BarCode: "條碼",
            IdentifierId: "身分證號",
            transfer: "轉", // 轉院
            getWell: "癒", // 痊癒
            giveUp: "棄", // 放棄
            dropOut: "退", // 不明原因退出
            death: "歿", // 死亡
            rfidPatient: "這張卡找不到病人 ->  {{rfid}}",
            barCodePatient: "條碼找不到病人 -> {{barCode}}",
            QRCodePrompt: "請將條碼置於框框中央處",
        }
    }, // end of allPatients

    // patientDetail patientDetail.html
    patientDetail: {
        basicInfo: "基本資料",
        createPatient: "新增病人",
        name: "姓名",
        requiredName: "請輸入姓名",
        identifierId: "身分證字號",
        requiredIdentifierId: "請輸入身分證字號",
        requiredOtherDoc: "請輸入其他證件號",
        minlengthIdentifierId: "身份證字號長度太短",
        maxlengthrequiredIdentifierId: "身份證字號長度太長",
        idRule: "身份證規則不符",
        existedIdentifierId: "此身份證字號已存在",
        clinicBedNo: "透析床號",
        admissionBedNo: "住院床號",
        gender: "性別",
        male: "男",
        female: "女",
        birthday: "生日",
        requiredBirthday: "生日不能為空白",
        bloodTypes: "血型",
        select: "請選擇...",
        phone: "電話",
        address: "戶籍地址",
        ward: "透析室",
        wardErr: "透析室資訊取得失敗，請重新整理",
        requiredWard: "請選擇透析室",
        medicalId: "病歷號",
        requiredMedicalId: "請輸入病歷號",
        existedMedicalId: "此病歷號已存在",
        bedNo: "床號",
        patientState: "病人狀況",
        state: {
            "-": "未歸類－急性病人",
            ".": "未歸類－住院病人需做緊急透析",
            "/": "未歸類－已接受他院長期透析，由本院暫處理",
            "0": "未歸類－尚未進入長期透析先作瘻管",
            "1": "長期血液透析",
            "2": "長期腹膜透析",
            "3": "長期腎移植追蹤",
            "5": "轉院",
            "6": "痊癒",
            "7": "放棄",
            "8": "不明原因退出",
            "9": "死亡",
            "10": "轉安寧治療"
        },
        other: "其他",
        deathDate: "死亡日期",
        deathReason: "死亡原因",
        entryMode: "入院方式",
        barCode: "Barcode",
        existedBarCode: "此BarCode已存在",
        RFID: "RFID",
        existedRFID: "此RFID已存在",
        FirstDialysisDate: "首次血液透析日期",
        FirstDialysisDateInHospital: "本院開始透析日期",
        Memo: "重要記事",
        maxlengthMemo: "重要記事不得超過5000個字",
        ClinicalDiagnosis: "臨床診斷",
        maxlengthClinicalDiagnosis: "臨床診斷不得超過5000個字",
        MedicalHistory: "病史",
        maxlengthMedicalHistory: "病史不得超過5000個字",
        allergicHistory: "過敏史",
        maxlengthAllergicHistory: "過敏史不得超過5000個字",
        allergicMedicine: "過敏藥品",
        noMatch: "找不到藥品名稱",
        Remark: "備註",
        maxlengthRemark: "備註不得超過5000個字",
        tag: "標籤",
        createTag: "新增標籤",
        save: "儲存",
        saving: "存檔中...",
        editTag: "修改標籤",
        tagName: "標籤名稱",
        requiredTagName: "標籤名稱為必填",
        tagColor: "標籤顏色",
        tagStyle: "風格",
        tagStrike: "線條",
        tagFontWeight: "粗細",
        tagPreview: "結果預覽",
        tagExample: "標籤範例",
        cancel: "取消",
        create: "新增",
        edit: "修改",
        patientTimeChange: "病人狀況異動時間",
        timeChangeMsg: "若要變更病人狀況異動時間，請按下確認按鈕 （預設帶入目前時間）",
        dateChange: "異動日期",
        timeChange: "異動時間",
        ok: "確認",
        checking: "驗證中...",
        addin: '加入',
        // component
        component: {
            unknown: "未知",
            stretcher: "推床",
            wheelchair: "輪椅",
            walk: "步行",
            IDNumber: "身分證字號",
            OtherDocuments: "其他證件",
            addWardMessage: "尚未添加負責透析室，請至後台新增",
            QRCodePrompt: "請將條碼置於框框中央處",
            imageFail: "拍照失败，原因：{{msg}} 警告",
            deleteTag: "確認刪除此標籤",
            confirmDelete: "是否將此標籤刪除？刪除後須再按下儲存才會生效",
            ok: "刪除",
            cancel: "取消",
            editSuccess: "修改成功",
            createSuccess: "新增成功",
            fieldInvalid: "尚有欄位未填寫正確",
            barcodeRepeat: "BarCode：\"{{number}}\" 重複，\"{{name}}\" 使用中",
            rfidRepeat: "RFID：\"{{number}}\" 重複，\"{{name}}\" 使用中",
            coverSave: "確定覆蓋，並存檔",
            deleteCover: "取消覆蓋",
        }
    }, // end of patientDetail

    // myPatients myPatients.html
    myPatients: {
        todayPatients: "我的病人",
        msg1: "您今日尚未開表。",
        msg2: "今日有經手的病人會顯示於此。",
        msg3: "中，選取病人後開始作業。",
        goto: "請至",
        patients: "@: home.patients",
        // component
        component: {}
    }, // end of myPatients

    // beds 今日床位 beds.html
    beds: {
        todayBeds: "@:home.todayBeds",
        ward: "透析室",
        loadingWard: "病床讀取中...",
        bedNoNotInSetting: "此床號已不存在",
        all: "全部",
        morning: "早班",
        afternoon: "午班",
        evening: "晚班",
        night: "夜班",
        temp: "臨時班",
        serverError: "伺服器資料讀取失敗，請重新整理",
        male: "：男性",
        female: "：女性",
        na: "：未填寫",
        showDayoff: "顯示請假",
        // component
        component: {
            addWardMessage: "尚未添加負責透析室，請至後台新增",
            morningAbbr: "早",
            afternoonAbbr: "午",
            eveningAbbr: "晚",
            nightAbbr: "夜",
            tempAbbr: "臨",
            morningShift: "@:beds.morning",
            afternoonShift: "@:beds.afternoon",
            eveningShift: "@:beds.evening",
            nightShift: "@:beds.night",
            tempShift: "@:beds.temp",
        }
    }, // end of beds

    // notifications 最新通知 notifications.html
    notifications: {
        notification: "最新通知",
        totalRecord: "共 {{total}} 筆",
        noData: "目前沒有資料",
        serverError: "伺服器資料讀取失敗",
        // component
        component: {
            ok: "確定",
        }
    }, // end of notifications

    // arrangeBed 排床 arrangeBed.html
    bed: {
        fixedBed: "固定床位表",
        add: "新增",
        nameAndMedicalId: "姓名、病歷號",
        choosePatient: "選擇病人",
        confirmDeleteFixedBedTitle: "確定刪除此病人",
        confirmDeleteFixedBedContent: "是否將此病人刪除？",
        arrangeBed: "排床",
        yearAndMonth: "{{year}} 年 {{month}} 月",
        currentMonth: "本月",
        yearAndWeekSameMonth: "{{year}} 年 {{month}} 月 {{day}} 日",
        yearAndWeekDiffMonth: "{{year}} 年 {{beginMonth}} 月 {{beginDay}} 日 － {{endMonth}} 月 {{endDay}} 日",
        yearAndWeekDiffYear: "{{beginYear}} 年 {{beginMonth}} 月 {{beginDay}} 日 － {{endYear}} 年 {{endMonth}} 月 {{endDay}} 日",
        currentWeek: "本週",
        msg: "請選擇病人或床位，再按下方\"排床\"按鈕，即可進行排床",
        ward: "透析室：",
        bedNo: "床號",
        loadingPatients: "病人讀取中...",
        bedArrangeCount: "本週己排 {{count}} 次",
        copyAll: "帶入固定床位",
        copyAllConfirm: '您確定要帶入固定床位表至本週？',
        confirmCopy: '帶入',
        noFixedBedWarning: '尚無固定床位資料，請編輯',
        copySuccess: '帶入固定床位成功',
        copyFailed: '帶入固定床位失敗，請重試',
        fixedBedCloning: '帶入固定床位資料中...',
        loadingBeds: "床位讀取中...",
        patientArrangeTitle: "本週己排",
        patientArrangeCount: "{{count}} 位",
        bedNoNotInSetting: "此床號已不存在",
        serverError: "伺服器資料讀取失敗，請重新整理",
        morningShift: "早：",
        morningShiftAbbr: "早：", // English only
        afternoonShift: "午：",
        afternoonShiftAbbr: "午：", // English only
        eveningShift: "晚：",
        eveningShiftAbbr: "晚：", // English only
        nightShift: "夜：",
        nightShiftAbbr: "夜：", // English only
        tempShift: "臨：",
        tempShiftAbbr: "臨：", // English only
        diffPatient: "不同病人",
        patientInFixed: "固定床位",
        patientInBed: "排床",
        samePatient: "相同病人",
        thisWeekIsBedAssigned: "當週有排床（可新增或修改排床）",
        thisWeekNoBedAssigned: "當週沒有排床（不可新增或修改排床）",
        // component
        component: {
            // bed.controller.js
            editBed: "修改排床",
            confirmBedEdit: "此床位已排定，是否仍要變更？",
            ok: "變更",
            cancel: "放棄",
            // arrangeBed.controller.js
            morning: "早班",
            afternoon: "午班",
            evening: "晚班",
            night: "夜班",
            temp: "臨時班",
            edit: "修改",
            chooseDay: "未選擇星期幾，請至少選擇一天",
            arrangeBedSuccess: "排床成功",
            takeDayoffSuccess: "請假成功",
            editDayoffSuccess: "請假修改成功",
            editBedSuccess: "排床修改成功",
            confirmDelete: "刪除確認",
            deleteRecord: "您即將刪除排床紀錄，點擊確認後將會刪除此內容",
            delete: "刪除",
            deleteBedSuccess: "排床刪除成功",
            confirmCancelDayoff: "取消請假確認",
            cancelDayoffContent: "您即將取消請假紀錄，點擊確認後將會取消請假",
            cancelDayoff: "取消請假",
            cancelDayoffSuccess: "取消請假成功"
        }
    }, // end of bed

    // arrange.html
    arrange: {
        dayoffTitle: '請假紀錄',
        status: "{{status}}排床",
        nurseName: "護理師姓名、員編",
        searchPatient: "請輸入病歷碼或姓名",
        noMatchPatient: "無符合的病人",
        patient: "病人",
        bad: "床位",
        doctor: "醫師",
        doctorName: "醫師姓名、員編",
        nurses: "護理師",
        chooseFromLeft: "請從左邊選取護理師",
        mode: "模式（必選）",
        startDate: "起始日：",
        endDate: "結束日：",
        date: "日期",
        chooseDays: "請問要排哪一天（必選）",
        mon: "星期一",
        tue: "星期二",
        wed: "星期三",
        thurs: "星期四",
        fri: "星期五",
        sat: "星期六",
        sun: "星期日",
        chooseShifts: "請問班次為（必選）",
        morning: "早班",
        afternoon: "午班",
        evening: "晚班",
        night: "夜班",
        temp: "臨時班",
        shiftsArranged: "下列日期已有排床紀錄，請重新選擇：",
        delete: "刪除",
        cancel: "取消",
        arrangeBed: "排床",
        edit: "修改",
        dayoff: "請假",
        memo: '備註'
    }, // end of arrange

    // shifts 排班 shifts.html
    shifts: {
        arrangeShift: "排班",
        yearAndMonth: "{{year}} 年 {{month}} 月",
        currentMonth: "本月",
        ward: "透析室：",
        copyShifts: "複製排班",
        // component
        component: {
            addWardMessage: "尚未添加負責透析室，請至後台新增",
            mon: "一",
            tue: "二",
            wed: "三",
            thu: "四",
            fri: "五",
            sat: "六",
            sun: "日",
            copySingle: "您即將複製排班，按下確認後會將您 {{currentMonth}} 月的排班資料複製至 {{next}} 月",
            copyAll: "您即將複製排班，按下確認後將會依目前員工清單將每人 {{currentMonth}} 月的排班資料複製至 {{next}} 月",
            confirmCopy: "複製排班確認",
            copyOk: "複製",
            copyCancel: "取消",
            copySuccess: "複製排班成功",
            copyFail: "複製排班失敗",
        },

        // shifts content directive in common dir shiftsContent.html
        shiftsContent: {
            staff: "員工",
            total: "總計",
            totalStaff: "該員總計",
            edit: "編輯",
            save: "儲存",
            reset: "回復",
            shift: "班次",
            BedGroup: "組別",
            dailyTotal: "每日總計",
            memo: "備忘錄",
            maxlengthMemo: "不得超過5000個字",
            // component
            component: {
                mon: "一",
                tue: "二",
                wed: "三",
                thu: "四",
                fri: "五",
                sat: "六",
                sun: "日",
            }
        },

        // shiftsMemoDialog.html
        shiftsMemoDialog: {
            memo: "備忘錄",
            overTextMessage: "不得超過5000個字",
            save: "儲存",
            // component
            component: {}
        }
    }, // end of shifts

    // reports 報表 reports.html
    reports: {
        report: "報表",
        // component reports.controller.js
        component: {
            serviceQuality: "服務品質指標年度統計表",
            allVisit: "服務總量統計表",
            allCharge: "計價項目統計表",
            allEpo: "ESA統計表",
            demography: "人口學統計年度統計表",
            allApo: "血液透析異常紀錄",
            allLabexam: "檢驗紀錄表"
        },
        // serviceQuality 服務品質指標年度統計表 serviceQuality.html
        serviceQuality: {
            title: "{{selectedYear}} 年度服務品質指標年度統計表",
            ward: "透析室：",
            year: "年份：",
            exportExcel: "匯出 excel 檔",
            yearHeading: "{{selectedYear}}年",
            itemAndMonth: "項目 \\ 月份",
            months: "{{month}}月",
            total: "合計",
            // component
            component: {
                PatientItems: '人次', // "次" must correspond to the "time" key
                PatientCount: '人數', // "數" must correspond to the "count" key
                AlbuminNumber: 'Albumin 受檢數',
                AlbuminPercent: 'Albumin（BCG）受檢率',
                AlbuminAverage: 'Albumin（BCG）平均值',
                AlbuminMore35Percent: 'Albumin（BCG）＞＝ 3.5百分比',
                KtVNumber: 'Kt/V受檢數',
                KtVPercent: 'Kt/V受檢率',
                KtVAverage: 'Kt/V平均值',
                KtVMore2Percent: 'Kt/V ＞＝ 1.2百分比',
                HctNumber: 'Hct受檢數',
                HctPercent: 'Hct受檢率',
                HctAverage: 'Hct平均值',
                HctMore26Percent: 'Hct ＞＝ 26百分比',
                HbNumber: 'Hb受檢數',
                HbPercent: 'Hb受檢率',
                HbAverage: 'Hb平均值',
                HbMore26Percent: 'Hb ＞ 8.5 g/dL',
                AdmissionCount: '住院次數',
                AdmissionPercent: '住院率',
                DeathCount: '死亡數',
                LessYearDeath: '透析時間＜1年之死亡率',
                MoreYearDeath: '透析時間＞＝1年之死亡率',
                VesselCount: '瘻管重建個案數',
                VesselPercent: '瘻管重建率',
                RestoreCount: '腎功能恢復人數',
                RestorePercent: '脫離率（I）－腎功能回復',
                KidneyTransplantCount: '腎移植人數',
                KidneyTransplantPercent: '脫離率（II）－腎移植',
                HBsAgPositiveCount: '轉陽人數',
                HBsAgNegativeCount: '陰性人數',
                HBsAgPositivePercent: 'HBsAg轉陽率',
                AntiHCVPositiveCount: '轉陽人數',
                AntiHCVNegativeCount: '陰性人數',
                AntiHCVPositivePercent: 'Anti－HCV轉陽率',
                times: "次",
                count: "數",
            }
        },
        // allVisit 服務總量統計表 allVisit.html
        allVisit: {
            title: "{{selectedYear}} 年 {{selectedMonth}} 月服務總量統計表",
            ward: "透析室：",
            year: "年份：",
            month: "月份：",
            exportExcel: "匯出 excel 檔",
            yearMonthHeading: "{{selectedYear}}年 {{selectedMonth}}月",
            itemAndMonth: "項目 \\ 日期",
            total: "合計",
            // component
            component: {
                morning: '早班',
                afternoon: '午班',
                evening: '晚班',
                night: '夜班',
                temp: '臨時班',
                other: '其他'
            }
        },
        // allCharge 計價項目統計表 allCharge.html
        allCharge: {
            title: "{{selectedYear}} 年 {{selectedMonth}} 月計價項目統計表",
            ward: "透析室:",
            year: "年份:",
            month: "月份:",
            exportExcel: "匯出 excel 檔",
            yearMonthHeading: "{{selectedYear}}年 {{selectedMonth}}月",
            itemAndDay: "項目 \\ 日期",
            total: "合計",
            // component
            component: {},
        },
        // allEpo EPO統計表 allEpo.html
        allEpo: {
            title: "{{selectedYear}} 年 {{selectedMonth}} 月ESA統計表",
            ward: "透析室：",
            year: "年份：",
            month: "月份：",
            yearMonthHeading: "{{selectedYear}}年 {{selectedMonth}}月",
            patient: "病人",
            itemAndDay: "項目 \\ 日期",
            total: "合計",
            // component
            component: {},
        },
        // demography 人口學統計年度統計表 demography.html
        demography: {
            title: "{{selectedYear}} 年度人口學統計年度統計表",
            ward: "透析室：",
            year: "年份：",
            exportExcel: "匯出 excel 檔",
            yearHeading: "{{selectedYear}}年",
            itemAndMonth: "項目 \\ 月份",
            months: "{{month}}月",
            total: "合計",
            deathReason: "死亡原因如下",
            // component
            component: {
                PatientCount: '病人總數',
                AverageAge: '平均年齡',
                ElderCount: '年齡＞＝65歲者',
                DiabeticNephropathyCount: '糖尿病腎病病人數',
                DeathCount: '死亡個案數',
            },
        },
        // allApo 血液透析異常狀況紀錄 allApo.html
        allApo: {
            title: "{{selectedYear}} 年 {{selectedMonth}} 月血液透析異常狀況紀錄",
            ward: "透析室：",
            year: "年份：",
            month: "月份：",
            exportExcel: "匯出 excel 檔",
            yearMonthHeading: "{{selectedYear}}年 {{selectedMonth}}月",
            total: "合計",
            abnormalItem: "異常項目",
            // component
            component: {
            }
        },
        // allLabexam 檢驗檢查紀錄 allLabexam.html
        allLabexam: {
            title: "{{selectedYear}} 年 {{selectedMonth}} 檢驗紀錄表",
            year: "年份：",
            month: "月份：",
            gridtitle: "病人 \\ 檢驗紀錄項目",
            exportExcel: "匯出 excel 檔",
            yearMonthHeading: "{{selectedYear}}年 {{selectedMonth}}月",
            // component
            component: {
            }
        },
    }, // end of reports

    // ro process
    roprocess: {
        title: 'RO 異常處理',
        pending: '待處理',
        resolved: '已處理',
        dataSource: '來源',
        machineNo: '機器編號',
        propertyNo: '財產編號',
        reportValue: '報告值',
        abnormalTime: '異常時間',
        abnormalReason: '異常原因',
        resolvedTime: '處理時間',
        resolvedUser: '處理人',
        resolvedWay: '處理過程',
        createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        manual: '手動',
        system: '系統',
        serverError: '伺服器錯誤，請重新整理',
        noDataThisMonth: '本月沒有資料',
        noData: '目前沒有資料',
        cannotDel: '不能刪除系統新增的紀錄',
        dialog: {
            phrase: '插入片語',
            cancel: '取消',
            create: '新增',
            delete: '刪除',
            edit: '修改',
            successfully: '成功',
            failed: '失敗',
            phraseInvalid: '請選在異常原因或處理過程編輯欄',
            resolvedTimeInvalid: '處理時間不能在異常時間之前'
        },
        dashboardTitle: 'RO 異常警示'
    }, // end of summary

    // summary summary.html
    summary: {
        // right sidenav
        dialysisRecordHistory: "歷次透析紀錄",
        vascularAccess: "歷次血管通路記錄表",
        nursingProblem: "歷次透析護理問題處置",
        nursingRecord: "歷次護理紀錄",
        medicationRecord: "歷次用藥紀錄",
        hemodialysisAbnormal: "歷次血液透析異常狀況",
        EpoStatistic: "ESA 年度統計表",
        inspection: "檢驗紀錄表",
        doctor: "醫師",
        prescription: "歷次透析處方",
        // toolbar
        dialysisRecord: "透析紀錄",
        photoAlbum: "相簿",
        dialysisCalendar: "歷次透析月曆",
        share: "分享",
        print: "列印",
        dialysisForm: "透析表單",
        // patient info
        age: "{{age}}歲", // eg 10歲,
        noDataWarning: "目前無透析機資料，請至：",
        machineData: "透析機資料",
        noDialysisRecord: "目前還沒有透析表單",
        goto: "您可以到",
        allDialysisRecords: "歷次透析列表",
        createNewRecord: "中，開啟一張新的記錄單",
        cannotRead: "讀不到表單",
        readError: "讀取表單時發生錯誤，有可能是網路剛好不通，請回上一頁重新進來一次。如果持續讀不到表單，請通知資訊單位，將伺服器重開。",
        // component
        component: {
            retrieveError: "讀取失敗，{{data}}",
            unitTimes: "(次)",
            unitCC: "(cc)",
            AVFistula: "自體動靜脈瘻管",
            AVGraft: "人工動靜脈瘻管",
            Permanent: "PermCath或其他長期導管",
            DoubleLumen: "其他短期導管(Double Lumen)",
            unknownType: "無對應的管路名稱",
            today: "今天",
        },
        album: "相簿",
        doctorNote: "歷次病情摘要",
        yearPlanReport: "年度計畫表",
        dialysisOverview: '透析總覽',

        // summaryContent directive summaryContent.html (common directives)
        content: {
            dialysisRecordTable: "透析記錄表",
            dateAndNumberOfTreatment: "{{CreatedTime  | moment: 'YYYY年MM月DD日(dd)'}} 第 {{Number}} 次",
            dateOfTreatment: "{{CreatedTime  | moment: 'YYYY年MM月DD日(dd)'}}",
            dialysisTimes: "透析次數",
            name: "姓名：",
            BedNo: "床號：",
            MedicalId: "病歷號：",
            age: "年齡：",
            dialysisTime: "透析時間",
            dialysisDate: "透析日期",
            startTime: "開表日期",
            time: "時間",
            shiftIssue: "本次交班事項",
            noData: "沒有資料",
            chiefComplaint: "上次返家情況主訴",
            start: "開始：",
            end: "結束：",
            bloodPressure: "血壓",
            startTitle: "開始：{{BloodPressureBeforePosture}}",
            endTitle: "結束：{{BloodPressureAfterPosture}}",
            Temperature: "體溫：",
            degrees: "度",
            weight: "體重",
            StandardWeight: "標準體重：",
            Dehydration: "實際調水：",
            DehydrationTarget: "應調水：",
            DehydrationSetting: "設定脫水：",
            deviation: "偏差：",
            DialysisSystem: "機台種類：",
            machineType: "透析器種類：",
            Dialysate: "透析液：",
            Anticoagulants: "抗凝劑：",
            EndHollowFiber: "結束 Hollow Fiber：",
            EndChamber: "Chamber：",
            vascularAccess: "血管通路",
            StartDate: "日期：",
            ArteryCatheter: "A針",
            VeinCatheter: "V針",
            CatheterLength: "長度：",
            VACR: "血管通路合併症紀錄：",
            LabItems: "檢驗：",
            BeforeDialysisExsanguinate: "透析前採血：",
            BeforeBloodTransfusionPerson: "採血者：",
            AfterDialysisExsanguinate: "透析後採血：",
            AfterBloodTransfusionPerson: "採血者：",
            BloodTypes: "血型：",
            RH: "RH：",
            BloodTransfusionTime: "輸血時間",
            TransfusionReaction: "反應：",
            Prescription: "透析處方",
            DW: "DW：",
            DialysisTime: "時間",
            BPS: "血壓",
            Breath: "脈搏/呼吸",
            BloodFlowRate: "流速（CC/min）",
            VenousPressure: "靜脈壓（mmHg）",
            TMP: "TMP",
            UFRate: "UFR/脫水量",
            HeparinDeliveryRate: "Heparin",
            DialysisateFlowRate: "透析液流速（cc/h）",
            DialysateA: "透析液濃度",
            DialysateConductivity: "透析液導電度（mS/cm）",
            DialysateTemperature: "透析液溫度",
            NormalSaline: "加生理食鹽水（cc）",
            AKClot: "AK Clot",
            FiftyPercentGW: "50% G/W",
            BloodLeak: "漏血",
            NeedleStatus: "Needle 狀況",
            Profile: "Profile",
            SubVolume: "補充液量（L）",
            Memo: "備註",
            TotalUF: "Total UF",
            nameTable: "名稱",
            dosageTable: "劑量",
            methodTable: "給法",
            prescribedTimeTable: "開立時間",
            executionTimeTable: "執行時間",
            signature: "簽名",
            dialysisPrescription: "透析處方",
            dt: "透析時間：",
            dialysisTimeHour: "{{Hours}} 時",
            dialysisTimeMinute: "{{Minutes}} 分",
            dialysisTimeSecond: "{{Seconds}} 秒",
            DialysateConcentration: "透析液濃度：",
            HCO3: "HCO3 / NA：",
            dialysateTemperature: "透析液溫度：",
            BF: "血液流速：",
            DialysateFlowRate: "透析液流速：",
            Route: "Route：",
            ArteryLength: "A針：",
            VeinLength: "V針：",
            ArtificialKidney: "AK：",
            DialysisMode: "Mode：",
            SupplementVolume: "補充液量：",
            memo: "Memo：",
            condition: "病情記載",
            NursingRecord: "護理記錄",
            PunctureNurse: "Puncture nurse",
            CareNurse: "Care nurse",
            OffNurse: "Off nurse",
        },
        service: {
            close: "關閉",
        },
    }, // end of summary

    // dialysis tab and right sidenav dialysisTabView.html
    dialysisTabView: {
        // toolbar
        dialysisRecord: "{{::StartTime | moment:'MM/DD'}}",
        // tabs
        overview: "總覽",
        assessment: "評估",
        postAssessment: "透析後評估",
        machine: "透析機",
        machineContinuous: "連續型透析機",
        executionRecord: "執行紀錄",
        shiftIssue: "交班事項",
        nursingRecord: "護理紀錄",
        prescribingRecord: "開藥紀錄/處置",
        doctorNote: "病情摘要",
        bloodTransfusion: "輸血",
        charge: "計價",
        EPO: "ESA",
        // right sidenav
        allDialysisRecords: "歷次透析紀錄",
        vesselAssessmentAllRecords: "歷次血管通路記錄表",
        nursingProblemList: "歷次透析護理問題處置",
        allNursingRecords: "歷次護理紀錄",
        allMedicationRecords: "歷次用藥紀錄",
        apo: "歷次血液透析異常狀況",
        annualEpo: "ESA 年度統計表",
        labexam: "檢驗紀錄表",
        doctor: "醫師",
        allPrescriptions: "歷次透析處方",
        album: "相簿",
        // component
        component: {},
    }, // end of dialysis tab

    // overview 總覽 overview.html
    overview: {
        // notification
        notification: "通知",
        notificationDataShow: "共 {{length}} 則，未讀 {{notificationunread}} 則。",
        notificationDetail: "您可以點此瀏覽詳細紀錄。",
        notificationRead: " 我知道了 ",
        EMRupload: "電子病歷上傳",
        notificationClose: "關閉",
        // 基本資料
        basicInfo: "基本資料",
        ward: "透析室",
        location: "地點",
        pateintSource: "病人來源",
        bedNo: "透析床號", // 北市醫 床號
        inBedNo: "住院床號", // 北市醫
        number: "月透析次數", // 北市醫 總透析次數
        modeNumber: "模式次數({{mode}})",
        DialysisDataFirstTime: "上機時間",
        DialysisDataLastTime: "下機時間",
        lastShiftIssues: "上次交班事項",
        ditto: "ditto",
        shiftIssues: "交班事項",
        chiefComplaint: "上次透析返家主訴",
        // 透析處方
        dialysisPrescription: "透析處方",
        Type: "狀態",
        longTerm: "長期",
        temporary: "臨時",
        InBed: "臥床",
        StandardWeight: "乾體重", // 北市醫 D.W
        Frequency: "Frequency",
        anticoagulants: "抗凝劑",
        Dialysate: "透析液濃度", // 北市醫 透析液
        HCO3: "HCO3",
        Na: "Na",
        HCO3Na: "HCO3／Na+",
        DialysateTemperature: "透析液溫度",
        DialysateFlowRate: "透析液流速",
        ArteryLength: "Needle A",
        VeinLength: "Needle V",
        DialysisMode: "Mode",
        SupplementVolume: "補充液量",
        SupplementPosition: "補充液位置",
        Route: "管路",
        BF: "血液流速",
        Duration: "透析時間", // 北市醫 Duration
        ArtificialKidney: "人工腎臟",
        Memo: "Memo",
        noData: "目前無處方資料",
        signNurseNfcTitle: "核對簽章(NFC)：",
        signNurseTitle: "核對簽章：",
        signNurse: "護理師簽章",
        signName: "簽章姓名",
        noSign: "不簽章",
        // 生理徵象
        signs: "生理徵象",
        posture: "姿勢",
        preDialysis: "透析前",
        BPS: "收縮",
        BPD: "舒張",
        choosePosture: "請選擇姿勢",
        lie: "臥",
        sit: "坐",
        stand: "立",
        Temperature: "體溫",
        Pulse: "心跳",
        Respiration: "呼吸",
        postDialysis: "透析後",
        vitalSignDate: "量測日期",
        vitalSignTime: "量測時間",
        bloodChart: '血壓趨勢圖',
        chartNoData: '暫無資料',
        // 檢驗
        labItemNames: "檢驗",
        inspectionValue: "检验数值",
        // 洗前採血
        BeforeDialysisExsanguinate: "透析前採血",
        yes: "有",
        none: "無",
        other: "其他",
        DialysisExsanguinateSettingAlertText: '請至後台參數設定處設定採血品項',
        BeforeDialysisExsanguinateContent: "透析前採血的其他品項",
        BeforeBloodTransfusionPerson: "採血者",
        AfterDialysisExsanguinate: "透析後採血",
        AfterDialysisExsanguinateContent: "透析後採血的其他品項",
        AfterBloodTransfusionPerson: "採血者",
        // 血管通路
        vesselAssessmentsTitle: "通路種類及部位", // 北市醫
        vesselAssessments: "通路",
        vesselAssessmentsNoData: "注意！通路種類及部位沒有資料",
        preCatheterLength: "前次導管長度(cm)：",
        lastCatheterLengthError: "讀取失敗，請重新整理",
        chooseAssessment: "請選擇血管通路",
        noStartTime: "Oops！此透析紀錄無開表日期",
        ArteryCatheter: "A針",
        times: "(次)",
        VeinCatheter: "V針",
        CatheterLength: "長度(cm)",
        VACR: "血管通路合併症記錄",
        content: "內容",
        // 皮膚評估
        skinAssessment: "皮膚評估",
        SkinPosition: "部位",
        normal: "正常",
        redness: "發紅",
        wound: "有傷口",
        Cyanosis: "發紺",
        rednessAndSore: "紅.腫.痛",
        brokenSkin: "破皮",
        //
        Aranesp: "Aranesp(mcg)",
        clearAranesp: "清除",
        route: "路徑",
        // 透析後資料
        postDialysisData: "AK 結束",
        clearAfterDialysisOptions: "清除",
        EndHollowFiber: "結束 Hollow Fiber",
        EndChamber: "結束 Chamber",
        EndHollowFiberAlertText: '請至後台參數設定處設定 "結束 Hollow Fiber" 項目',
        EndChamberAlertText: '請至後台參數設定處設定 "結束 Chamber" 項目',
        // 結束後情況
        afterSituation: "結束後情況",
        CreatedTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        EditTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        save: "儲存",
        finishRecord: "關表並儲存",
        finishRecordTime: "表單已於 {{EndTime | moment: 'YYYY/MM/DD (dd) HH:mm'}} 關表",
        dataDontExist: "資料不存在",
        refreshConfirm: "資料重整確認",
        editedByNurse: "此筆資料已被其他護理人員修改",
        refresh: "重整",
        confirmDialysis: "確定要完成此次透析嗎？",
        finishDialysisRecord: "結束後會新增結束透析的護理紀錄",
        cancel: "取消",
        addOneData: "新增一筆",
        delOneData: "刪除一筆",
        // component
        component: {
            clinic: "門診",
            emergency: "急診",
            hospitalized: "住院",
            admissionNumber: "入院號",
            normal: "正常",
            redness: "發紅",
            wound: "有傷口",
            Cyanosis: "發紺",
            rednessAndSore: "紅.腫.痛",
            brokenSkin: "破皮",
            AVFistula: "自體動靜脈瘻管",
            AVGraft: "人工動靜脈瘻管",
            Permanent: "PermCath或其他長期導管",
            DoubleLumen: "其他短期導管(Double Lumen)",
            typeError: "造管種類錯誤",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            signNurseLoginMessage: "核對簽章不可為目前登入者：{{loginName}}",
            rfidRoleNurseMessage: "這張卡找不到使用者，或請確認該使用者角色為護理師：{{rfid}}",
            rfidPatient: "這張卡找不到使用者{{rfid}}",
            signNurse: "核對簽章",
            tagNfcCard: "請在此視窗顯示時，感應靠卡簽章。",
            tagNfcCardOrDeleted: "請在此視窗顯示時，感應靠卡簽章。或是刪除目前簽章。",
            changeSignNurse: "異動核對者",
            checkChange: "已有核對者，確認異動核對者？",
            checkDeleted: "與目前簽章為同一人，是否要刪除？",
            alertSaveTitle: "存檔提醒",
            alertSaveMessage: "核對簽章已異動，請記得至下方點選儲存。",
            covered: "覆蓋",
            deleted: "刪除",
            canceled: "取消",
            closed: "關閉",
        },

        // weight-and-dehydration 體重與脫水量 weighAndDehydration.html
        weightAndWater: "體重與脫水量",
        checkInDate: "報到日期",
        checkInTime: "報到時間",
        TotalWeightPredialysis: "開始體重(Kg)",
        WheelchairWeight: "輪椅重量(Kg)",
        NoClothingWeight: "衣物重量(Kg)",
        PredialysisWeightTitle: "透析前總重 − 輪椅重量 − 衣物重量",
        PredialysisWeight: "透析前體重(Kg)",
        expectedWeight: "乾體重(Kg)",
        createDialysisPrescription: "請新增透析處方",
        DehydrationTargetTitle: "透析前總重 − 乾體重 − 輪椅重量 − 衣物重量",
        DehydrationTarget: "應脫水量(Kg)",
        DehydrationTargetError: "無法計算目標脫水量，請更新透析處方",
        FoodWeight: "食物重量(Kg)",
        Flush: "輸注量(Kg)",
        EstimatedDehydrationTitle: "目標脫水量 ＋ 食物重量 ＋ 輸注量",
        EstimatedDehydration: "預估脫水量(L)",
        EstimatedDehydrationError: "無法計算預估脫水量(L)，請更新透析處方",
        DehydrationSetting: "設定脫水量(Kg)",
        TotalWeightAfterDialysis: "結束總重(Kg)",
        WeightAfterDialysisTitle: "結束總重 − 輪椅重量 − 衣物重量",
        WeightAfterDialysis: "透析後體重(Kg)",
        ActualDehydrationTitle: "透析前體重 − 結束體重",
        ActualDehydration: "實際脫水量(Kg)",
        WeightDiffWarning: "上次 {{lastTimeWeight}} kg，差異過大",
        abnormalWeight: "體重異常",
        abnormalWeightTrue: "是",
        AbnormalWeightReason: "體重異常原因",
        // js
    }, // end of overview

    // assessment 評估
    assessment: {
        // assessments.html
        assessments: {
            preAssessment: "透析前評估",
            postAssessment: "透析後評估",
            preFAB: "前",
            postFAB: "後",
            createPreAssessment: "新增透析前評估",
            createPostAssessment: "新增透析後評估",
            showDeleted: "顯示已刪除 ({{deletedItemsLength}}筆)",
            totalRecord: "共 {{length}} 筆",
            noData: "目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增評估記錄",
            serverError: "伺服器資料讀取失敗",
            deleteRecord: "確認刪除此筆評估紀錄",
            confirmDelete: "是否將此筆評估紀錄刪除",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {},
        },
        // assessment.html (detail page)
        assessment: {
            addPreAssessment: "新增透析前評估紀錄",
            editPreAssessment: "修改透析前評估紀錄",
            showDeletedPreAssessment: "查看己刪除透析前評估紀錄",
            addPostAssessment: "新增透析後評估紀錄",
            editPostAssessment: "修改透析後評估紀錄",
            showDeletedPostAssessment: "查看己刪除透析後評估紀錄",
            addAssessment: "新增評估紀錄",
            editAssessment: "修改評估紀錄",
            showDeletedAssessment: "查看己刪除評估紀錄",
            assessmentRecord: "評估紀錄",
            date: "日期",
            time: "時間",
            noData: "目前沒有資料",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功",
                editFail: "修改失敗",
                createSuccess: "新增成功",
                createFail: "新增失敗"
            },
        },
    }, // end of assessment

    // machineData 透析機
    machineData: {
        // machineData.html
        machineData: {
            totalRecord: "共 {{length}} 筆",
            bloodPressure: "血壓",
            BloodFlowRate: "血液流速",
            VenousPressure: "靜脈迴路壓",
            TMP: "TMP",
            UFRate: "UFR",
            noData: "目前沒有資料",
            assessment: "評估",
            clickBottomRight: "您可以按右下角新增按鈕來新增透析機資料",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                confirmDelete: "您確認要刪除此筆透析機資訊?",
                deleteOk: "刪除",
                deleteCancel: "取消",
                deleteSuccess: "刪除成功",
                deleteFail: "刪除失敗，原因：{{statusText}}",
            },
        },
        // machineDataDetail.html
        machineDataDetail: {
            createOrEditMachineData: "{{ machineDataId === 'create' ? '新增透析機資料' : '修改透析機資料' }}",
            createMachineData: "新增透析機資料",
            editMachineData: "修改透析機資料",
            date: "記錄日期",
            time: "記錄時間",
            cardNo: "卡號/機型",
            remainingTime: "剩餘時間",
            hour: "時",
            min: "分",
            bloodPressure: "血壓",
            systolicPressure: "收縮壓",
            diastolicPressure: "舒張壓",
            PulseBreath: "脈搏/呼吸",
            Pulse: "脈搏",
            Breath: "呼吸(次/分)",
            BloodFlowRateLabel: "血液流速(cc/分)",
            BloodFlowRate: "血液流速(cc/分)",
            ArterialPressure: "輸入壓(mmHg)",
            FilterPressure: "濾器壓(mmHg)",
            EffluentPressure: "廢液壓(mmHg)",
            PressureDrop: "壓力下降壓(mmHg)",
            VenousPressureLabel: "靜脈壓(mmHg)",
            VenousPressure: "靜脈壓(mmHg)",
            TMPLabel: "TMP",
            TMP: "TMP",
            ACT: "ACT(sec)",
            HeaterTemperature: "Heater 溫度(℃)",
            UFRateLabel: "UFR/脫水量(L)",
            UFRate: "UFR",
            TotalUF: "脫水量(L)",
            Heparin: "Heparin",
            HeparinOriginal: "肝素初次量(U)",
            HeparinDeliveryRate: "肝素維持量(U)",
            HeparinAccumulatedVolume: "肝素使用量總量(U)",
            DialysisateFlowRateLabel: "透析液流速(cc/時)",
            DialysisateFlowRate: "透析液流速(cc/時)",
            DialysateA: "透析液濃度",
            DialysateConductivity: "透析液導電度(mS/cm)",
            DialysateTemperature: "透析液溫度(℃)",
            DialysateTemperatureSet: "目標透析液溫度(℃)",
            NormalSalineLabel: "加生理食鹽水",
            NormalSaline: "加生理食鹽水",
            AKClot: "AK Clot",
            choose: "請選擇",
            FiftyPercentGW: "50% G/W",
            NeedleStatusLabel: "Needle狀況",
            UFProfile: "UF Profile",
            TargetSodium: "鈉離子濃度", // 因為Na+要上標，在前端處理
            NaProfile: "Sodium Profile", // 因為Na+要上標，在前端處理
            HDFType: "Mode",
            Volume: "補充液流速(cc/分)",
            SubVolume: "補充液量(L)",
            Temperature: "體溫(℃)",
            TotalBloodFlowVolume: "累積血流量",
            BloodLeak: "漏血",
            TargetUF: "目標UF",
            Memo: "備註",
            insertPhrase: "加入片語",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            readingData: "機器資料讀取中...",
            serverError: "伺服器資料讀取失敗",
            dataSource: '資料來源',
            targetUFDiffToDehydrationSetting: '請注意！與設定脫水量不符',
            UFTimeErr: '處方設定透析時間',
            DialysateFlowRateErr: '請注意！透析液流速與處方設定不符',
            DialysateTemperatureErr: '請注意！透析液溫度與處方設定不符',
            BloodFlowRateErr: '請注意！血液流速與處方設定不符',
            mesoAssessment: '透析中評估',
            mesoAssessmentAlert: '目前沒有評估項目，請至後台設定透析中評估',
            // component
            component: {
                bluetoothOff: "藍牙未開啟，請至手機設定開啟",
                invalidCard: "這張不是儀器卡片",
                cardError: "儀器卡片內容有誤 -> {{data}}",
                barCodeError: "條碼內容有誤 -> {{errText}}",
                QRCodePrompt: "請將條碼置於框框中央處",
                editSuccess: "修改成功",
                editFail: "修改失敗",
                createSuccess: "新增成功",
                createFail: "新增失敗",
                serverError: "伺服器連線失敗，已暫存至本地端，等待系統連線後即會自動上傳",
                warning: "請注意",
                differentData: "本次讀取的機器與上次的不同！",
                understand: "知道了",
                continuous: '連續型',
                single: '自動單筆',
                manual: '手動',
                bleConnecting: '儀器連線中...',
                dataTransfering: '機器資料讀取中...',
                checkDialysisHeaderIsTodayTitle: '新增資料非當次表單',
                checkDialysisHeaderIsToday: '此為（{{dialysisTime}}） 表單，現在時間 （{{nowTime}}），是否仍要新增？',
                create: '新增'
            },
        },
    }, // end of machine data

    // continuousMachineData 連續型透析機
    continuousMachineData: {
        dialysisSystem: '機型',
        info: '請使用有藍牙功能的設備進行操作',
        totalRecord: '共{{count}}筆資料',
        // component
        component: {
            choose: '已選 {{length}} 筆',
            selected: '已選取',
            notSelected: '未選取',
            doing: '處理中...',
            confirmDiffFromOriBind: '與原連結不同，請問是否要重新連結？',
            reBind: '重新連結',
            isBound: '傳輸器已連結',
            isExeTitle: '此傳輸器正在使用中',
            currentExePatient: '若仍要使用，將會先停止病人 {{patientName}}({{patientMedicalId}}) 的連續型傳輸，是否仍要執行？',
            diffFormAlert: '正在傳此病人的另外一張表單，若仍要使用將會停止該張表單的上傳，是否仍要執行？',
            execute: '執行',
            isDiffTaskTitle: '任務不同',
            isDiffTask: '是否仍要停止傳輸器目前任務',
            continueTask: '繼續當前任務',
            infoNearby: '操作時，請至傳輸器附近',
            infoBind: '請靠卡或掃描啟動',
            infoBindIos: '請掃描啟動',
            starting: '啟動中...',
            stoping: '停止中...',
            statusCheck: '確認狀態...',
            wait: '請稍等...',
        },
        raspberrySetting: {
            piSetting: "傳輸器設定",
            frequency: "連續頻率(分)",
            frequencyMin: "最小頻率為 0.5 分",
            machine: "透析機",
            raspberryPiId: "藍牙編號",
            unBind: "解除連結",
            stop: "停止",
            resume: "傳輸啟動",
            machineError: "機器故障",
            close: "關閉"
        }
    },

    // 執行紀錄
    allExecutionRecord: {
        // allExecutionRecord.html
        allExecutionRecord: {
            totalRecord: "共 {{length}} 筆",
            execute: "執行",
            dontExecute: "不執行",
            unexecuted: "未執行",
            reasonMemo: "{{OrderMode === 'Neglect' ? '原因：': '備註：'}}{{Memo}}",
            noData: "目前沒有資料",
            createPrescription: "請至開藥記錄新增用藥資料",
            serverError: "伺服器資料讀取失敗",
            infinity: "無截止日",
            todayNoExecute: "今日不需再執行",
            todayExecute: "今日還需執行 {{times}} 次",
            executeArea: "{{startDate}} ～ {{endDate}}間還須執行 {{times}} 次",
            allRecord: "總紀錄",
            // component
            component: {
                remindOnSuccess: "開啟提醒成功！",
                remindOnFail: "開啟提醒失敗，請重新操作",
                remindOffSuccess: "關閉提醒成功！",
                remindOffFail: "關閉提醒失敗，請重新操作",
            },
        },
        // allExecutionDetail.html
        allExecutionDetail: {
            executeMedicine: "執行藥物",
            confirmExecuteMedicine: "確定不執行藥物",
            medicine: "藥物",
            route: "途徑",
            Frequency: "頻率",
            Quantity: "開立使用數量",
            ActualQuantity: "實際使用數量",
            usageMsgRequired: "請填寫使用數量",
            usageMsgMin: "值需要大於 0",
            doctorMemo: "醫師備註",
            DetailMemo: "備註",
            reason: "原因",
            reasonRequired: "請填寫不執行原因",
            save: "儲存",
            delete: "刪除",
            DoctorMemo: "開藥備註",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "伺服器資料讀取失敗",
            // signNurseNfcTitle: "核對簽章(NFC)：",
            signNurseTitleI: "核對簽章 I：",
            signNurseTitleII: "核對簽章 II：",
            signNurse: "護理師簽章",
            signName: "簽章姓名",
            noSign: "不簽章",
            // component
            component: {
                timeEarlier: "請注意，執行時間比建立時間（{{createdTime}}）早。",
                timeEarlierNow: "請注意，執行時間比現在時間早。",
                timeLater: "請注意，執行時間比現在時間晚。",
                editSuccess: "更新成功",
                editFail: "更新失敗",
                alertSaveTitle: "存檔提醒",
                alertSaveMessage: "核對簽章已異動，請記得至下方點選儲存。",
                alertheSameTitle: "注意",
                alertTheSameMessage: "雙簽章不可為同一人。",
                rfidRoleNurseMessage: "這張卡找不到使用者，或請確認該使用者角色為護理師：{{rfid}}",
            },
        },
        // allExecutionDialog.html
        allExecutionDialog: {
            executeMemo: "備註",
            execute: "@:allExecutionRecord.allExecutionRecord.execute",
            dontExecute: "@:allExecutionRecord.allExecutionRecord.dontExecute",
            noData: "目前沒有資料",
            noMemo: "目前沒有備註",
            component: {
                deleteSuccess: "刪除成功",
                deleteFail: "刪除失敗"
            },
        },
        // checkToDoDialog.html
        checkToDoDialog: {
            checkExecuteTitle: "是否要再記錄？",
            checkExecuteMessagaForExecute: "今日已記錄完畢，若要再記錄一筆\"執行紀錄\"，請點選\"執行\"？",
            checkExecuteMessagaForDontExecute: "今日已記錄完畢，若要再記錄一筆\"不執行紀錄\"，請點選\"不執行\"？",
            cancel: "取消",
            execute: "@:allExecutionRecord.allExecutionRecord.execute",
            dontExecute: "@:allExecutionRecord.allExecutionRecord.dontExecute"
        },
        // recordDeleteDialog.html
        recordDeleteDialog: {
            checkDeleteTitle: "刪除執行紀錄",
            checkDeleteMessage: "您確認要刪除此筆執行紀錄？",
            cancel: "取消",
            delete: "刪除"
        },
    },

    // 執行ST
    executionRecord: {
        // executionRecord.html
        executionRecord: {
            totalRecord: "共 {{length}} 筆",
            execute: "執行",
            dontExecute: "不執行",
            unexecuted: "未執行",
            reasonMemo: "{{OrderMode === 'Neglect' ? '原因：': '備註：'}}{{Memo}}",
            noData: "目前沒有資料",
            createPrescription: "請至開藥記錄新增用藥資料",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {},
        },
        // executionDetail.html
        executionDetail: {
            executeMedicine: "執行藥物",
            confirmExecuteMedicine: "確定不執行藥物",
            medicine: "藥物",
            route: "途徑",
            Frequency: "頻率",
            Quantity: "開立使用數量",
            ActualQuantity: "實際使用數量",
            usageMsgRequired: "請填寫使用數量",
            usageMsgMin: "值需要大於 0",
            Memo: "備註",
            reason: "原因",
            reasonRequired: "請填寫不執行原因",
            save: "儲存",
            DoctorMemo: "開藥備註",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                timeEarlier: "請注意，執行時間比建立時間（{{createdTime}}）早。",
                timeLater: "請注意，執行時間比現在時間晚。",
                editSuccess: "更新成功",
                editFail: "更新失敗",
            },
        },
    }, // end of execution record

    // 交班事項
    shiftIssues: {
        // shiftIssue.html
        shiftIssue: {
            createShiftIssue: "新增交班事項",
            editShiftIssue: "修改交班事項",
            showDeleted: "查看己刪除交班事項",
            date: "日期",
            time: "時間",
            content: "交班事項",
            contentMax: "不得超過5000個字",
            insertPhrase: "插入片語",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功!",
                editFail: "修改失敗",
                createSuccess: "新增成功!",
                createFail: "新增失敗",
            },
        },
        // shiftIssues.html
        shiftIssues: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            noData: "目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增交班事項",
            serverError: "伺服器資料讀取失敗",
            deleteRecord: "確認刪除此筆交班紀錄",
            confirmDelete: "是否將此筆交班紀錄刪除",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {
                deleteSuccess: "刪除成功",
                deleteFail: "刪除失敗",
            },
        }
    },
    // 護理紀錄
    nursingRecord: {
        // nursingRecord.html (detail page)
        nursingRecord: {
            createNursingRecord: "新增護理紀錄",
            editNursingRecord: "修改護理紀錄",
            showDeleted: "查看己刪除護理紀錄",
            date: "日期",
            time: "時間",
            Content: "內容",
            contentRequired: "內容不能為空白",
            contentMax: "不得超過5000個字",
            insertPhrase: "插入片語",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功",
                editFail: "修改失敗",
                createSuccess: "新增成功!",
                createFail: "新增失敗",
            },
        },
        // nursingRecords.html
        nursingRecords: {
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            noData: "目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增護理記錄",
            serverError: "伺服器資料讀取失敗",
            deleteRecord: "確認刪除此筆護理紀錄",
            confirmDelete: "是否將此筆護理紀錄刪除",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {},
        },
    }, // end of nursing record

    // 開藥紀錄
    prescribingRecord: {
        // prescribingRecord.html
        prescribingRecord: {
            All: "全部..",
            ST: "STAT用藥",
            NotST: "常規用藥",
            prevMonth: "上個月",
            nextMonth: "下個月",
            validDrug: "期限內",
            ImportST: "匯入前 STAT",
            lastMonthPrescribing: "匯入上月",
            checkWholeMedicine: "匯入全院",
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            totalDays: "{{StartDate | date: 'MM/dd' }} {{ Days > 1 ? vm.getEndDate(StartDate, Days): '' }} ~ {{duringDate | date: 'MM/dd' }} 共 {{Days }} 天", // TODO:
            totalQuantity: "{{Route}} {{Frequency}} 每次 {{Quantity }} {{QuantityUnit }}",
            noData: "{{showDate}}目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增用藥資料",
            serverError: "伺服器資料讀取失敗",
            Infinity: "無截止日",
            quantity: "{{Route}} {{Frequency}} 每次 {{Quantity}} {{QuantityUnit}}",
            IsOtherDrug: "外院用藥",
            // component
            component: {
                importSuccess: "匯入 STAT 成功，共 {{dataCount}} 筆",
                noST: "無 STAT 用藥可匯入",
                importFail: "匯入失敗 {{statusText}}",
                serverError: "伺服器取得 STAT 資料失敗",
                confirmDelete: "您確認要刪除此筆用藥",
                deleteWarning: "請注意：連同未執行的用藥皆會一併刪除！",
                deleteOk: "刪除",
                deleteCancel: "取消",
                deleteSuccess: "刪除成功",
                deleteFail: "刪除失敗，原因：{{statusText}}",
            },
        },
        // prescribingDetail.html
        prescribingDetail: {
            createPrescription: "新增開藥記錄",
            editPrescription: "修改開藥記錄",
            showDeleted: "查看己刪除開藥記錄",
            category: "類別",
            medicineName: "藥名",
            MedicineCode: "藥品代碼",
            NHICode: "健保碼",
            QuantityUnit: "每次數量 ({{QuantityUnit}})",
            QuantityRequired: "請填寫每次數量",
            QuantityMin: "值需要大於 0",
            Route: "途徑",
            Frequency: "頻率",
            StartDate: "用藥日",
            StartDateRequired: "請填寫用藥日",
            usageDays: "使用天數",
            usageDaysRequired: "請填寫使用天數",
            usageDaysMin: "使用天數需要大於 0",
            TotalQuantity: "總量",
            TotalQuantityRequired: "請填寫總量",
            TotalQuantityMin: "總量需大於 0，請確認給藥的數量、頻率、用藥日、天數。",
            Memo: "備註",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            serverError: "伺服器資料讀取失敗",
            Infinity: "無截止日",
            IsOtherDrug: "外院用藥",
            OtherDrugContent: "外院用藥描述",
            ExecuteNoShow: "（執行紀錄不顯示）",
            // component
            component: {
                editSuccess: "修改成功",
                editFailMsg: "修改失敗 {{errorMsg}}",
                editFail: "修改失敗",
                createSuccess: "新增成功",
                createFailMsg: "新增失敗 {{errorMsg}}",
                createFail: "新增失敗",
                PO: "PO － 口服",
                SC: "SC － 皮下注射",
                SL: "SL － 舌下含服",
                IV: "IV － 靜脈注射",
                IM: "IM － 肌肉注射",
                IVD: "IVD － 靜脈添加",
                TOPI: "TOPI － 局部塗擦",
                EXT: "EXT － 外用",
                AC: "AC － 飯前服用",
                PC: "PC － 飯後服用",
                Meal: "Meal － 餐中服用",
                // Frequency
                QDPC: "QDPC － 每日1次（餐後）",
                QN: "QN － 每晚1次",
                QOD: "QOD － 每隔1日1次",
                HS: "HS － 每晚睡前半小時1次",
                TID: "TID － 每日3次（早、午、晚）",
                TIDAC: "TIDAC － 每日3餐半小時前",
                TIDPC: "TIDPC － 每日3餐後",
                BID: "BID － 每日2次（早上、晚上）",
                BIDAC: "BIDAC － 每日早晚（用餐半小時前）",
                BIDPC: "BIDPC － 每日早晚（餐後）",
                ST: "STAT － 立刻使用",
                Q2W: "Q2W － 每2週1次",
                QID: "QID － 每日4次",
                QM:"QM - 一個月一次",
                QD: "QD － 每日1次（每日固定時間）",
                QW1: "QW1 － 每週1次（星期一）",
                QW2: "QW2 － 每週1次（星期二）",
                QW3: "QW3 － 每週1次（星期三）",
                QW4: "QW4 － 每週1次（星期四)）",
                QW5: "QW5 － 每週1次（星期五）",
                QW6: "QW6 － 每週1次（星期六）",
                QW7: "QW7 － 每週1次（星期日）",
                QW135: "QW135 － 每週3次（一、三、五）",
                QW135S: "QW1357 － 每週4次（一、三、五、日",
                QW246: "QW246 － 每週3次（二、四、六）",
                QW246S: "QW2467 － 每週4次（二、四、六、日）",
                QW136: "QW136 － 每週3次（一、三、六）",
                QW146: "QW146 － 每週3次（一、四、六）",
                PRN: "PRN － 需要時使用",
                TIW: "TIW － 每週3次",
                BIW: "BIW － 每週2次",
                BIW13: "BIW13 － 每週2次（一、三）",
                BIW15: "BIW15 － 每週2次（一、五）",
                BIW24: "BIW24 － 每週2次（二、四）",
                BIW26: "BIW26 － 每週2次（二、六）",
                STMessage: "因頻率為立即使用，則為當天使用。",
                PRNMessage: "因頻率為必要時服用，可異動總數量。",
            },
        },
        // customMedicine.html
        customMedicine: {
            createPrescription: "新增開藥記錄",
            editPrescription: "修改開藥記錄",
            showDeleted: "查看己刪除開藥記錄",
            category: "類別",
            medicineName: "藥名／處置",
            MedicineCode: "藥品代碼",
            NHICode: "健保碼",
            QuantityUnit: "每次數量", // "每次數量 ({{QuantityUnit}})"
            Unit: "單位",
            QuantityRequired: "請填寫每次數量",
            QuantityMin: "值需要大於 0",
            Route: "途徑",
            Frequency: "頻率",
            StartDate: "用藥／處置日",
            StartDateRequired: "請填寫用藥日",
            usageDays: "使用天數",
            usageDaysRequired: "請填寫使用天數",
            usageDaysMin: "使用天數需要大於 0",
            TotalQuantity: "總量",
            TotalQuantityRequired: "請填寫總量",
            TotalQuantityMin: "總量需大於 0，請確認給藥的數量、頻率、用藥日、天數。",
            Memo: "備註",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            serverError: "伺服器資料讀取失敗",
            Infinity: "無截止日",
            IsOtherDrug: "外院用藥",
            OtherDrugContent: "外院用藥描述",
            ExecuteNoShow: "（執行紀錄不顯示）",
            // component
            component: {
                editSuccess: "修改成功",
                editFailMsg: "修改失敗 {{errorMsg}}",
                editFail: "修改失敗",
                createSuccess: "新增成功",
                createFailMsg: "新增失敗 {{errorMsg}}",
                createFail: "新增失敗",
                PO: "PO － 口服",
                SC: "SC － 皮下注射",
                SL: "SL － 舌下含服",
                IV: "IV － 靜脈注射",
                IM: "IM － 肌肉注射",
                IVD: "IVD － 靜脈添加",
                TOPI: "TOPI － 局部塗擦",
                EXT: "EXT － 外用",
                AC: "AC － 飯前服用",
                PC: "PC － 飯後服用",
                Meal: "Meal － 餐中服用",
                // Frequency
                ST: "STAT － 立刻使用",
                STMessage: "因頻率為立即使用，則為當天使用。",
                PRNMessage: "因頻率為必要時服用，可異動總數量。",
            },
        },
        // medicineRecord.html
        medicineRecord: {
            chooseMedicine: "新增開藥，請點選藥品...",
            All: "全部..",
            totalRecord: "共 {{length}} 筆",
            serverError: "伺服器資料讀取失敗",
            CustomMedicine: "自訂藥物",
            // component
            component: {},
        },
        // lastMonthPrescribing.html
        lastMonthPrescribing: {
            createNoST: "新增 {{::showDate}} 非 STAT 用藥",
            usageDate: "用藥日",
            usageDays: "使用天數",
            usageDaysRequired: "請填寫使用天數",
            usageDaysMin: "使用天數需要大於 0",
            chooseMedicine: "請勾選藥品",
            Quantity: "{{::Route}} {{::Frequency}} 每次 {{::Quantity}} {{::QuantityUnit}} ，共 {{::TotalQuantity}} {{::QuantityUnit}}",
            save: "儲存",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                writeError: "寫入 {{showDate}} 月用藥資料失敗。原因：{{statusText}}",
                importSuccess: "匯入完成，移至列表",
                loadDataError: "重新載入資料失敗，請至列表頁重新整理！",
                noPrescription: "無用藥資訊匯入。",
            },
        },
        // checkWholeMedicine.html
        checkWholeMedicine: {
            createWhole: "查詢全院開藥資料",
            usageDate: "用藥日",
            usageDays: "使用天數",
            usageDaysRequired: "請填寫使用天數",
            usageDaysMin: "使用天數需要大於 0",
            chooseMedicine: "請勾選藥品",
            Quantity: "{{::Route}} {{::Frequency}} 每次 {{::Quantity}} {{::QuantityUnit}} ，共 {{::TotalQuantity}} {{::QuantityUnit}}",
            save: "儲存",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                writeError: "寫入 {{showDate}} 用藥資料失敗。原因：{{statusText}}",
                importSuccess: "匯入完成，移至列表",
                loadDataError: "重新載入資料失敗，請至列表頁重新整理！",
                noPrescription: "無用藥資訊匯入。",
            }
        }
    }, // end of prescribing record

    // 醫囑
    doctorNote: {
        diseaseSummary: "病情摘要",
        diseaseSummaryMax: "不得超過5000個字",
        insertPhrase: "插入片語",
        save: "儲存",
        doctorNoteEdit: "編輯病情摘要",
        doctorNoteCreate: "新增病情摘要",
        doctorNoteView: "檢視病情摘要",
        createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        // component
        component: {
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
    },

    // 輸血
    bloodTransfusion: {
        // bloodTransfusion.html
        bloodTransfusion: {
            createBloodTransfusion: "新增輸血紀錄",
            editBloodTransfusion: "修改輸血紀錄",
            showDeleted: "查看己刪除輸血紀錄",
            basicInfo: "基本資料",
            startTime: "開始",
            EndTime: "結束",
            TherapistId1: "第一核對人員",
            TherapistId1Code: "代碼",
            TherapistId1Required: "第一核對人員代碼不能為空白",
            TherapistId1Dismatch: "第一核對人員代碼不能和第二核對人員代碼重複",
            TherapistId1Error: "此第一核對人員代碼不存在",
            TherapistName1: "名稱",
            TherapistName1Required: "第一核對人員名稱不能為空白",
            TherapistName1Error: "此第一核對人員名稱不存在",
            TherapistId2: "第二核對人員",
            TherapistId2Code: "代碼",
            TherapistId2Required: "第二核對人員代碼不能為空白",
            TherapistId2Dismatch: "第二核對人員代碼不能和第一核對人員代碼重複",
            TherapistId2Error: "此第二核對人員名稱不存在",
            TherapistName2: "名稱",
            TherapistName2Required: "第二核對人員名稱不能為空白",
            LeadBlood: "領血單號",
            TransfusionReaction: "輸血反應",
            bloodBagInfo: "血袋資訊",
            create: "＋新增",
            save: "儲存",
            noBloodBagInfo: "目前無血袋資訊",
            bloodProduct: "血品",
            bloodType: "血型",
            quantity: "數量（袋）",
            validDate: "有效期限",
            delete: "刪除",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            noBloodProduct: "目前沒有血品資料，請通知管理員",
            chooseBloodProduct: "請選擇血品",
            bloodTypeRequired: "血型為必選項目",
            RHRequired: "RH為必選項目",
            Volume: "輸血量（u）",
            barCodeLabel: "請輸入不重複條碼",
            barCodePlaceholder: "請輸入不重複條碼（請注意一行一條代碼）",
            BarcodeRequired: "請輸入不重複條碼",
            BarcodeMAx: "不得超過5000個字",
            cancel: "取消",
            ok: "確定",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆血袋紀錄刪除？",
            start: "開始",
            end: "結束",
            // component
            component: {
                QRCodePrompt: "請將條碼置於框框中央處",
                editSuccess: "修改成功",
                createSuccess: "新增成功",
                editFail: "修改失敗",
                createFail: "新增失敗"
            },
        },
        // bloodTransfusions.html
        bloodTransfusions: {
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            unknown: "未知",
            LeadBlood: "領血單號",
            noData: "目前還沒有輸血表單",
            clickBottomRight: "您可以按右下角新增按鈕來新增輸血記錄",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "刪除確認此筆輸血紀錄",
            deleteRecord: "是否將此筆輸血紀錄刪除？",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {},
        },
    }, // end of blood transfusion

    // 計價
    charge: {
        // charge.html
        charge: {
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆紀錄，{{itemLength}} 項物品",
            totalPrice: "總計 {{totalPrice}} 元",
            deposite: "使用{{Deposit}}{{Unit}} {{ItemName}}，剩餘庫存: {{Stock}}",
            withdraw: "使用{{Withdraw}}{{Unit}} {{ItemName}}，小計 {{Price*Withdraw}} 元",
            noData: "目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增計價記錄",
            serverError: "伺服器資料讀取失敗",
            stocktaking: "此物品已盤點，不可再異動",
            // component
            component: {
                QRCodePrompt: "請將條碼置於框框中央處",
                confirmDelete: "確認刪除此筆計價紀錄",
                deleteRecord: "是否將此筆計價紀錄刪除",
                deleteCancel: "取消",
                deleteOk: "刪除",
                itemNotFound: "找不到符合的計價物品項目，無此物品條碼：{{resultMsg}}",
            },
        },
        // chargeCreate.html
        chargeCreate: {
            createCharge: "新增計價使用紀錄",
            searchItem: "搜尋物品",
            itemList: "{{title}}物品清單",
            remainingStock: "剩餘庫存：{{Stock}}",
            lowerSafetyStock: "已低於安全庫存",
            // component
            component: {
                QRCodePrompt: "請將條碼置於框框中央處",
            },
        },
        // chargePSWEditDialog.html
        chargePSWEditDialog: {
            editCharge: "紀錄單修改",
            use: "物品行為",
            value: "使用",
            Stock: "目前庫存",
            SafetyStock: "安全庫存",
            Withdraw: "數量({{action}})",
            WithdrawRequired: "必填選項",
            WithdrawMin: "值需要大於 0",
            oldStockText: "{{action}}前庫存",
            oldQtyText: "修改前{{action}}數量",
            QtyText: "修改後{{action}}數量",
            SafetyStockText: "安全庫存",
            StockText: "修改前庫存",
            newStockText: "修改後庫存",
            notSafety: "存量過低!",
            notEnough: "操作後庫存不可低於零！",
            stockAfter: "{{action}}後庫存",
            Price: "單位金額",
            TotalPrice: "總金額",
            Memo: "備註",
            save: "儲存",
            cancel: "取消",
            action: "使用",
            // component
            component: {
                action: "使用",
                inputError: "操作失敗，輸入有誤！",
                itemsChecked: "此物品已盤點，不可再異動"
            },
        },
    }, // end of charge

    // EPO
    epoRecord: {
        // epoRecord.html
        epoRecord: {
            prevMonth: "上個月",
            nextMonth: "下個月",
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            execute: "執行",
            dontExecute: "不執行",
            noData: "{{showDate}}目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增 ESA 資料",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                confirmDelete: "您確認要刪除此筆ESA？",
                deleteOk: "刪除",
                deleteCancel: "取消",
                deleteSuccess: "刪除成功",
                deleteFail: "刪除失敗，原因：{{statusText}}",
            },
        },
        // epo.add.html
        epoAdd: {
            createEpo: "開立 ESA",
            count: "次數",
            medicine: "藥品",
            choose: "請選擇",
            route: "途徑",
            Quantity: "數量",
            Dosage: "劑量",
            save: "儲存",
            createdTime: "建立：{{::CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{::ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            // component
            component: {
                createSuccess: "新增成功 {{count}} 筆，失敗 {{failCnt}} 筆",
                editSuccess: "修改成功",
                editFail: "修改失敗",
            },
        },
        // epo.execute.html
        epoExecute: {
            executeMedicine: "執行藥物",
            conformDontExecute: "確定不執行藥物",
            isModify: "很抱歉，您不是 ESA 的執行者，無法修改此筆資料。",
            date: "日期",
            time: "時間",
            medicine: "藥品",
            route: "途徑",
            Quantity: "開立數量",
            Dosage: "，劑量 {{::Dose}} ",
            ActualQuantity: "使用數量 ({{::QuantityUnit}})",
            QuantityRequired: "請填寫使用數量",
            QuantityMin: "值需要大於 0",
            ActualDose: "使用劑量 {{::DoseUnit}}",
            Type: "類別",
            choose: "請選擇",
            Public: "公費",
            Self: "自費",
            Memo: "備註",
            reason: "原因",
            reasonRequired: "請填寫不執行原因",
            save: "儲存",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                timeEarlier: "請注意，執行時間比建立時間({{CreatedTime}})早。",
                timeLater: "請注意，執行時間比現在時間晚。",
                executeSuccess: "執行成功",
                executeFail: "執行失敗",
            },
        },
    }, // end of EPO

    // right sidenav==========================
    // vessel Assessment Tabs and toolbar
    vesselAssessmentAllRecords: {
        // vesselAssessmentAllRecords.html
        vesselAssessmentRecord: "歷次血管通路記錄表",
        vesselAssessmentTab: "血管通路紀錄",
        vesselProblemTab: "血管通路問題",
        vesselAbnormalTab: "血管異常處置紀錄",
        // component
        component: {},
    },

    allDialysisRecords: {
        dialysisRecordHistory: "歷次透析記錄",
        totalRecord: "共 {{totalCnt}} 筆",
        numberOfTimes: "第 {{Number}}次 在 {{Location}}",
        noData: "目前還沒有透析表單",
        clickBottomRight: "您可以按右下角新增按鈕來新增歷次透析紀錄",
        serverError: "伺服器資料讀取失敗",
        createTable: "此病人無透析處方 及 血管通路 資料 是否開表？",
        cancel: "取消",
        ok: "開表",
        // component
        component: {
            confirmDelete: "確認刪除此筆透析紀錄",
            deleteRecord: "是否將此筆透析紀錄刪除",
            deleteCancel: "取消",
            deleteOk: "刪除",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            formCreateFail: "開表失敗",
            formCreateSuccess: "開表成功",
        },
    }, // end of allDialysisRecords

    // 血管通路紀錄
    vesselAssessment: {
        // vesselassessment.html
        vesselAssessment: {
            createVesselAssessment: "新增血管通路評估紀錄",
            editVesselAssessment: "修改血管通路評估紀錄",
            showDeleted: "查看己刪除血管通路評估紀錄",
            createdDate: "建立日期",
            unknown: "未知",
            pipeType: "造管種類",
            AVFistula: "自體動靜脈瘻管",
            AVGraft: "人工動靜脈瘻管",
            Permanent: "PermCath或其他長期導管",
            DoubleLumen: "其他短期導管(Double Lumen)",
            CatheterTypeRequired: "造管種類不能為空白",
            tubingposition: "造管部位",
            rightForearm: "右前臂",
            leftForearm: "左前臂",
            rightUpperArm: "右上臂",
            leftUpperArm: "左上臂",
            rightThigh: "右大腿",
            leftThigh: "左大腿",
            rightCalf: "右小腿",
            leftCalf: "左小腿",
            rightIJV: "右內頸靜脈",
            leftIJV: "左內頸靜脈",
            rightSV: "右鎖骨下靜脈",
            leftSV: "左鎖骨下靜脈",
            rightFV: "右股靜脈",
            leftFV: "左股靜脈",
            CatheterPositionRequired: "造管部位不能為空白",
            CatheterHospital: "造管醫院",
            enterCatheterHospital: "手動輸入造管醫院",
            enterCatheterHospitalRequired: "手動輸入造管醫院不能為空白",
            Memo: "備註",
            endDate: "終止日期",
            EndReason: "終止原因",
            camera: "拍照",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            confirmDelete: "刪除確認",
            deletePic: "是否將此張照片刪除？",
            cancel: "取消",
            delete: "刪除",
            // position and side
            right: "右",
            left: "左",
            forearm: "前臂",
            upperArm: "上臂",
            thigh: "大腿",
            calf: "小腿",
            IJV: "內頸靜脈",
            SV: "鎖骨下靜脈",
            FV: "股靜脈",
            // component
            component: {
                imageFail: "拍照失败，原因：{{errMessage}} 警告",
                uploadSuccess: "上傳成功",
                uploadFail: "上傳失敗，請重試！",
                editSuccess: "修改成功",
                createSuccess: "新增成功",
                editFail: "修改失敗",
                createFail: "新增失敗",
            },
        },
        vesselAssessments: {
            showDeleted: "顯示已刪除 ({{deletedItemsLength}}筆)",
            totalRecord: "共 {{length}} 筆",
            unknown: "未知",
            noData: "目前還沒有歷次血管通路評估記錄",
            clickBottomRight: "您可以按右下角新增按鈕來新增歷次血管通路評估記錄",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆血管通路評估紀錄刪除??",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {
                AVFistula: "自體動靜脈瘻管",
                AVGraft: "人工動靜脈瘻管",
                DoubleLumen: "其他短期導管(Double Lumen)",
                Permanent: "PermCath或其他長期導管",
            },
        },
    }, // end of vessel assessment

    // 血管通路問題
    vesselAssessmentProblems: {
        // vesselAssessmentProblemsList.html
        problemsList: {
            showDeleted: "顯示已刪除 ({{deletedItemsLength}}筆)",
            totalRecord: "共 {{length}} 筆",
            noData: "目前還沒有歷次血管通路問題記錄",
            clickBottomRight: "您可以按右下角新增按鈕來新增歷次血管通路問題記錄",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆血管通路問題紀錄刪除??",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {},
        },
        // vesselAssessmentProblemsDetail.html
        problemsDetail: {
            createVesselProblem: "新增血管通路問題紀錄",
            editVesselProblem: "修改血管通路問題紀錄",
            showVesselPrblem: "查看己刪除血管通路問題紀錄",
            RecordDate: "建立日期",
            BF: "血流速 <200",
            VascularSoundWeakened: "血流聲音變小",
            LackBloodFlow: "血液流速不足",
            NoBloodFlow: "無血流聲",
            Infection: "感染",
            VenousPressure: "靜脈壓 >200",
            RednessPain: "紅腫熱痛",
            NotEasyStopBleeding: "透析後不易止血",
            Other: "其他",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            confirmDelete: "刪除確認",
            cancel: "取消",
            delete: "刪除",
            Venousneedledislodgement: "穿刺針孔滲血",
            tubeappearancechange: "瘻管外形改變",
            StopBleedingOver20minutes: "止血時間 >20分鐘",
            cholesterol: "膽固醇 >300",
            Triglyceride: "三酸甘油脂 >300",
            // component
            component: {
                editSuccess: "修改成功",
                createSuccess: "新增成功",
                editFail: "修改失敗",
                createFail: "新增失敗",
            },
        },
    }, // end of vessel assessment problems

    // 血管異常處置紀錄
    abnormalVesselAssessment: {
        // abnormalvesselassessment.html
        abnormalVesselAssessment: {
            createAbnormalVessel: "新增歷次血管通路異常紀錄",
            editAbnormalVessel: "修改歷次血管通路異常紀錄",
            showDeleted: "查看己刪除歷次血管通路異常紀錄",
            Complications: "併發症",
            ComplicationsItems: "併發症項目",
            choose: "請選擇...",
            ComplicationsRequired: "併發症為必選",
            Disposal: "處置方式",
            DisposalItems: "治療處置項目",
            DisposalRequired: "治療處置為必選",
            DisposalResults: "處置結果",
            DisposalResultsRequired: "處置結果為必填",
            insertPhrase: "插入片語",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            abnormal: "異常",
            DisposalHospital: "處置醫院",
            enterDisposalHospital: "手動輸入處置醫院",
            // component
            component: {
                Complications: {
                    0: "針管凝固",
                    1: "導管出口滲液",
                    2: "血流量不足需要降低血液流速",
                    3: "穿刺點止血時間延長",
                    4: "手掌／手臂／手指 腫脹／疼痛／麻木感／冰冷",
                    5: "衝擊聲或震顫微弱／不連續／音調改變",
                    6: "靜脈壓力連續三次異常升高",
                    7: "瘻管外觀改變（詳細說明）",
                    8: "KT／V或URR不足",
                    9: "通路凝固",
                    10: "感染（菌種）",
                    11: "導管脫落",
                    12: "穿刺困難",
                    13: "其他",
                },
                Disposals: {
                    0: "血管氣球擴張術",
                    1: "血管擴創術",
                    2: "開新血管",
                    3: "其他",
                },
                editSuccess: "修改成功",
                createSuccess: "新增成功",
                editFail: "修改失敗",
                createFail: "新增失敗",
            },
        },
        // abnormalvesselassessments.html
        abnormalVesselAssessments: {
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            unknown: "未知",
            noData: "目前沒有資料",
            clickBottomRight: "您可以按右下角新增按鈕來新增歷次血管通路異常紀錄",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆歷次血管通路異常紀錄刪除？",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {},
        },
    }, // end of abnormal vessel assessment

    // 歷次透析護理問題處置
    nursingProblem: {
        // nursingProblemList.html
        nursingProblemList: {
            nursingProblemRecord: "歷次透析護理問題處置記錄表",
            showDeleted: "顯示已刪除",
            totalRecord: "共 {{Total}} 筆",
            noData: "目前還沒有透析護理問題處置記錄表",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "確認刪除此筆透析護理問題處置記錄",
            deleteRecord: "是否將此筆透析護理問題處置記錄刪除",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {
                deleteSuccess: "刪除成功",
            },
        },
        // nursingProblemItem.html
        nursingProblemItem: {
            nursingItemList: "護理問題項目列表",
            totalRecord: "共 {{length}} 筆",
            noData: "目前還沒有護理問題項目列表",
            serverError: "伺服器資料讀取失敗",
            // component
            component: {
                create: "新增",
                edit: "修改",
                nursingMeasure: "護理措施",
            },
            search: "搜尋護理問題"
        },
        // nursingProblemDetail.html
        nursingProblemDetail: {
            edit: "修改",
            showDeleted: "查看己刪除",
            nursingProblemRecord: "{{::Name}}（{{::MedicalId}}）透析護理問題處置紀錄表",
            StartDate: "開始日期：",
            nursingProblem: "護理問題：",
            editNursingProblem: "修改護理問題",
            Measures: "護理措施：",
            editMeasures: "修改護理措施",
            ResolveDate: "解決日期：",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功",
                edit: "修改",
                nursingMeasure: "護理措施",
                retrieveError: "取得護理措施失敗，請重新整理",
            },
        },
        // nursingProblemItemDetail.html
        nursingProblemItemDetail: {
            StartDate: "開始日期：",
            nursingProblem: "護理問題：",
            Measures: "護理措施：",
            ResolveDate: "解決日期：",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            ok: "OK",
            // component
            component: {
                editSuccess: "修改成功",
                createSuccess: "新增成功",
            },
        },
    }, // end of nursing problems

    // 歷次護理紀錄
    allNursingRecord: {
        // nursingRecord.html
        nursingRecord: {
            createNursingRecord: "新增護理紀錄",
            editNursingRecord: "修改護理紀錄",
            showDeleted: "查看己刪除護理紀錄",
            content: "內容",
            contentRequired: "內容不能為空白",
            insertPhrase: "插入片語",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功",
                createSuccess: "新增成功",
            },
        },
        // nursingRecords.html
        nursingRecords: {
            nursingRecord: "歷次護理記錄",
            showDeleted: "顯示已刪除",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有護理記錄單",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "確認刪除此筆護理紀錄",
            deleteRecord: "是否將此筆護理紀錄刪除",
            cancel: "取消",
            delete: "刪除",
            // component
            component: {
                deleteSuccess: "刪除成功",
            },
        },
    }, // end of all nursing record

    // 急診住院狀態查詢
    admissionConsult: {
        admissionConsult: "住院歷程",
        admissionConsults: {
            noData: "目前還沒有住院紀錄",
            serverError: "伺服器資料讀取失敗",
            totalRecord: "共 {{totalCnt}} 筆",
            AdmissionDate: "住院日期",
            DischargeDate: "出院日期",
            Diagnosis: "診斷",
            Hospitalname: "醫院名稱",
            Signature: "簽名",
            Station: "護理站",
            Ward: "床位",
            Memo: "備註"
        }
    }, // end of admission consult

    // 歷次用藥記錄
    allMedicationRecords: {
        // allMedicationRecords.html
        medicationRecord: "歷次用藥記錄",
        execute: "執行",
        dontExecute: "不執行",
        unexecuted: "未執行",
        noData: "目前還沒有歷次用藥記錄",
        serverError: "伺服器資料讀取失敗",
        // component
        component: {},
    }, // end of all medication records

    // 歷次血液透析異常狀況記錄
    apo: {
        // apo.html
        apo: {
            createApo: "新增血液透析異常紀錄",
            editApo: "修改血液透析異常紀錄",
            showDeleted: "查看己刪除血液透析異常紀錄",
            shift: "班次",
            morningShift: "白班",
            afternoonShift: "中班",
            eveningShift: "晚班",
            ward: "透析室",
            patient: "病人",
            abnormalItem: "異常項目類別",
            abnormalItemRequired: "異常項目類別為必填",
            AbnormalItemId: "異常項目子類別",
            AbnormalItemIdRequired: "異常項目子類別為必填",
            Memo: "備註",
            createdTime: "建立：{{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改：{{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            abnormal: "異常",
            // component
            component: {
                updateWard: "請更新透析室資訊再執行此項作業",
                editSuccess: "修改成功",
                createSuccess: "新增成功",
            },
        },
        // apos.html
        apos: {
            apoAbnormal: "歷次血液透析異常狀況記錄",
            showDeleted: "顯示已刪除（{{deletedItemsLength}}筆）",
            totalRecord: "共 {{length}} 筆",
            unknown: "未知",
            noData: "目前還沒有血液透析異常狀況記錄",
            clickBottomRight: "您可以按右下角新增按鈕來新增血液透析異常狀況記錄",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆血液透析異常狀況紀錄刪除?",
            no: "否",
            yes: "是",
            morningShift: "白班",
            afternoonShift: "中班",
            eveningShift: "晚班",
            // component
            component: {
                noSetting: "透析室無設定此異常項目唷～",
            },
        },
    }, // end of apo

    // EPO 年度統計表
    annualEpo: {
        // annualEpoReport.html
        annualEpoReport: "ESA 年度統計表",
        selectedYear: "請選擇年度：",
        yearAndMonth: "{{selectedYear}}年 {{month}}月",
        dialysisTimes: "透析次數",
        total: "合計",
        serverError: "伺服器資料讀取失敗",
        publicPay: "公費",
        selfPay: "自費",
        // component
        component: {
            date: "日期",
            dosage: "私人劑量",
            route: "注射途徑（IV.H）",
            doctor: "醫師",
            injector: "注射者",
            totalDosage: "累積劑量",
        },
    }, // end of annual Epo

    // 檢驗檢查
    labexam: {
        // labexam.html
        labexam: {
            labexamResult: "檢驗紀錄表",
            exportExcel: "EXCEL 匯出",
            showdeletedAndTotal: "顯示已刪除（{{deletedItemsLength}}筆）共 {{length}} 筆",
            oneMonth: "近一個月(30天)",
            twoMonth: "近兩個月(60天)",
            threeMonth: "近三個月(90天)",
            sixMonth: "近半年(180天)",
            oneYear: "近一年(365天)",
            twoYear: "近兩年(720天)",
            warning: "注意！下面長壓刪除",
            date: "日期",
            totalRecord: "共 {{length}} 筆",
            noData: "目前選擇天數尚無檢驗紀錄結果資料",
            serverError: "伺服器資料讀取失敗，請重新整理",
            confirmDelete: "刪除確認",
            deleteRecord: "是否將此筆紀錄刪除？",
            cancel: "取消",
            delete: "刪除",
            weekTable: "週檢驗",
            table: "表",
            chart: "圖",
            // component
            component: {
                tooHigh: "偏高",
                tooLow: "偏低",
                normal: "正常",
                abnormal: "異常或數值異常",
                other: "其他",
                date: "日期",
                nameAndDate: "名稱／日期"
            },
        },
        // createLabexam.html
        createLabexam: {
            createLabexam: "新增檢驗項目",
            editLabexam: "修改檢驗項目",
            showDeleted: "查看己刪除檢驗項目",
            CheckTime: "輸入時間：",
            labName: "檢驗名稱",
            labNameRequired: "檢驗名稱不能空白",
            labValue: "檢驗值",
            labValueRequired: "檢驗值不能空白",
            labValueDigit: "檢驗值為數字",
            save: "確認儲存",
            labCode: "檢驗代碼",
            NormalUpper: "參考值上限",
            NormalUpperDigit: "參考值上限為數字",
            NormalDown: "參考值下限",
            NormalDownDigit: "參考值下限為數字",
            unit: "單位",
            IsNormal: "是否在參考值內？",
            normal: "正常",
            abnormal: "不正常",
            Memo: "備註",
        },
        // updateLabexam.html
        updateLabexam: {
            createLabexam: "新增檢驗項目",
            editLabexam: "修改檢驗項目",
            showDeleted: "查看己刪除檢驗項目",
            labCode: "檢驗代碼",
            labName: "檢驗名稱",
            labNameRequired: "檢驗名稱不能空白",
            labValue: "檢驗值",
            labValueRequired: "檢驗值不能空白",
            labValueDigit: "檢驗值為數字",
            NormalUpper: "參考值上限",
            NormalUpperDigit: "參考值上限為數字",
            NormalDown: "參考值下限",
            NormalDownDigit: "參考值下限為數字",
            unit: "單位",
            IsNormal: "是否在參考值內？",
            normal: "正常",
            abnormal: "不正常",
            CheckTime: "檢驗時間",
            CheckTimeRequired: "手動輸入檢驗時間不能為空白",
            save: "儲存",
            Memo: "備註",
            // component
            component: {
                editSuccess: "修改成功",
                createSuccess: "新增成功",
                editFail: "修改失敗",
                createFail: "新增失敗"
            },
        },
        // labexamChart.html
        labexamChart: {
            checkResult: "檢驗紀錄結果",
            totalRecord: "共 {{length}} 筆",
            oneMonth: "一個月內（30天）",
            threeMonth: "三個月內（90天）",
            sixMonth: "半年（180天）",
            oneYear: "一年（365天）",
            noData: "目前沒有檢驗紀錄",
            serverError: "伺服器資料讀取失敗",
        },
    }, // end of lab exam


    // 歷次表單
    dialysisForm: {
        times: '次數',
        timesTitle: '最近幾次',
        months: '月',
        monthsTitle: '最近幾個月',
        current: '目前瀏覽的表單',
        conditionTitle: '查詢類型',
        count: '第 {{ count }} 次',
        oneMonth: '最近一個月（30天）',
        twoMonths: '最近兩個月（60天）',
        threeMonths: '最近三個月（90天）',
    },
    // end of 歷次表單
    // TODO: JESSICA 2019/3/13 病人->病人 洗->透析 標點符號全形 下方未改

    // 年度計畫表
    yearCalendarReport: {
        yearPlan: "年度計畫表",
        year: "年份:",
        exportExcel: "匯出 excel 檔",
        yearHeading: "{{selectedYear}}年",
        months: "{{month}}月",
        noData: "暫無資料",
        pending: "未執行",
        serverError: "伺服器錯誤，請重新整理",
        component: {},
    },
    // end of 年度計畫表

    // 日曆-歷次透析處方
    // monthlyDialysisRecords
    monthlyDialysisRecords: {
        // monthlyDialysisRecords.html
        monthlyDialysisRecords: {
            prescribingRecord: "歷次透析紀錄",
            mode: "模式:",
            none: "無",
            calendar: "行事曆",
            all: "全",
            dialysisRecord: "透析記錄",
            patientEvent: "病人記事",
            yearPlan: "年度計畫",

            component: {
                whatTimes: "第{{numberAll}}次",
                none: "無",
                toolTipTitle: "標題：",
                tooltipContent: "內容：",
                tooltipCreator: "建立："
            },
        },
        patientEventDialog: {
            newPatientEvent: "新增病人記事",
            updatePatientEvent: "修改病人記事",
            updateWardEvent: "修改透析室記事",
            title: "記事標題",
            allDay: "全天時段",
            startDate: "開始日期",
            startTime: "開始時間",
            endDate: "結束日期",
            endTime: "結束時間",
            repeat: "重複記事",
            everyday: "每天",
            repeatEndDate: "結束重複",
            tagColor: "標籤顏色",
            content: "記事內容",
            fillContent: "請填寫記事內容",
            created: "建立：",
            modified: "修改：",
            cancel: "取消",
            delete: "刪除記事",
            update: "修改記事",
            new: "新增記事",
            mon: "星期一",
            tue: "星期二",
            wed: "星期三",
            thurs: "星期四",
            fri: "星期五",
            sat: "星期六",
            sun: "星期日",
            component: {},
        },
    },

    // 歷次透析處方
    allPrescriptions: {
        // allPrescriptions.html
        allPrescriptions: {
            prescribingRecord: "歷次透析處方",
            HD: "HD",
            HDF: "HDF",
            SLEDDF: "SLEDD-f",
            interim: "急透析",
            component: {},
        },
        // prescriptionTabPage.html
        prescriptionTabPage: {
            prescribingRecord: "歷次透析處方",
            showDeleted: "顯示已刪除",
            totalRecord: "共 {{Total}} 筆",
            longTerm: "長期",
            temporary: "急透析",
            Item: "項目",
            StandardWeight: "乾體重",
            Dehydration: "脫水量",
            BF: "血液流速",
            Duration: "Duration",
            Frequency: "Frequency",
            Dialysate: "透析液濃度",
            HCO3: "HCO3 / Na",
            ArtificialKidney: "人工腎臟(AK)",
            DialysateTemperature: "透析液溫度",
            DialysateFlowRate: "透析液流速",
            Needle: "Needle",
            DialysisMode: "Mode",
            noData: "目前沒有{{tag}}的歷次透析處方",
            clickBottomRight: "您可以按右下角新增按鈕來新增歷次透析處方",
            serverError: "伺服器資料讀取失敗",
            confirmDelete: "確認刪除此筆透析處方",
            deleteRecord: "是否將此筆透析處方刪除",
            cancel: "取消",
            delete: "刪除",
            copy: '複製',
            // component
            component: {
                interim: "臨時",
                deleteSuccess: "刪除成功",
            },
        },
        // prescriptionDetail.html
        prescriptionDetail: {
            createPrescription: "新增透析處方",
            editPrescription: "修改透析處方",
            showDeleted: "查看己刪除透析處方",
            loadPrev: "是否帶入上一筆處方資料??",
            yes: "是",
            Type: "處方狀態",
            LongTerm: "長期",
            ShortTerm: "臨時 (臨時處方僅限今日使用)",
            InBed: "是否臥床?",
            StandardWeight: "乾體重(kg)",
            enterStandardWeight: "請輸入乾體重(Kg)",
            Dehydration: "臨時脫水量",
            enterDehydration: "請輸入臨時脫水量",
            BF: "血液流速(cc/分)",
            enterBF: "請輸入血液流速(cc/分)",
            DurationH: "Duration(小時)",
            choose: "請選擇...",
            DurationM: "Duration(分鐘)",
            Frequency: "Frequency(次/wk)",
            Anticoagulants: "抗凝劑",
            firstAnticoagulants: "請輸入初次量/一次量(U)",
            maintainAnticoagulants: "請輸入維持量(U)",
            reason: "不使用原因",
            enterReason: "請輸入不使用原因",
            otherItem: "其它項目",
            Dialysate: "透析液濃度(Ca/K)",
            HCO3: "HCO",    // 3 要下標，於 html 處理
            enterHCO3: "請輸入HCO3",
            Na: "Na",
            enterNa: "請輸入Na",
            DialysateTemperature: "透析液溫度(℃)",
            enterDialysateTemperature: "請輸入透析液溫度(℃)",
            DialysateFlowRate: "透析液流速(cc/分)",
            Route: "管路",
            NeedleArteries: "Needle A",
            NeedleVeins: "Needle V",
            ArtificialKidneys: "人工腎臟(AK)",
            mode: "Mode",
            SupplementVolume: "置換補充液",
            enterSupplementVolume: "請輸入容量或濃度",
            SupplementPosition: "置換補充液位置",
            choosePosition: "請選擇位置",
            chooseFrequency: "請選擇頻率",
            chooseDialysate: "請選擇透析液",
            chooseDialysateFlowRate: "請選擇透析液流速",
            chooseRoute: "請選擇管路",
            chooseNeedleLength: "請選擇長度",
            chooseArtificialKidneys: "請選擇人工腎臟",
            front: "前",
            back: "後",
            dialyzerSurfaceArea: "透析器表面積(m^2)",
            dialyzerSurfaceAreaPlaceHolder: "透析器表面積(m^2)",
            PBP: "PBP",
            PBPPlaceHolder: "PBP(mL/hr)",
            FluidFlowWate: "置換液流速",
            FluidFlowWatePlaceHolder: "置換液流速(mL/hr)",
            ACTControl: "ACT Control",
            ACTControlPlaceHolder: "ACT Control(秒)",
            Memo: "備註",
            enterMemo: "請輸入備註",
            createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
            save: "儲存",
            // component
            component: {
                editSuccess: "修改成功!",
                editFail: "修改失敗!",
                createSuccess: "新增成功!",
                createFail: "新增失敗, ",
                prescription: "透析處方",
                overwriteConfirm: "是否將此筆透析處方覆寫至今日透析中表頭(總覽)??",
                overwriteToday: "覆寫今日",
                dontOverwrite: "不要覆寫",
                overwriteSuccess: "覆寫成功!",
                overwriteFail: "覆寫失敗，原因 {{data}}",
                noPrevData: "沒有上一筆處方資料",
            },
        },
    }, // end of all prescription

    album: {
        album: {
            album: "相簿",
            photoByDate: "依相片日期",
            byAlbum: "依相簿",
            photofailed: "拍照失败，原因：",
            caveat: "警告",
            addPicture: "新增照片",
            errorPicture: "照片格式錯誤，請重新上傳照片",
            createOk: "新增成功",
            modifyPicture: "修改照片",
            modifyOk: "修改成功",
            delOk: "相簿刪除成功",
            delError: "相簿刪除失敗",
            trash: "垃圾桶",
            otherAlbum: "其他相簿"
        },
        photoList: {
            selected: "已選擇",
            hasPicture: "張照片",
            noPicture: "目前沒有相片資料",
            addPicture: "請按右下角按鈕新增照片",
            pictureError: "相片檔案讀取失敗，請重新整理",
            modifyContent: "修改內容",
            plsSelect: "請選擇",
            photoDescription: "照片說明",
            modifyOk: "確認修改",
            deletePhoto: "確定要刪除 {{Piclength}} 張相片嗎?",
            cancel: "取消",
            toTrash: "移到垃圾桶"
        },
        albumList: {
            selected: "已選擇",
            hasAlbum: "本相簿",
            garbage: "垃圾桶",
            noAlbum: "目前沒有相簿資料",
            addAlbum: "請按右下角按鈕新增照片，或到日期新增相片到相簿",
            albumError: "相簿檔案讀取失敗，請重新整理",
            deleteAlbum: "確定要刪除 {{Piclength}} 本相簿嗎?",
            description: "相簿一經刪除即無法復原。不過，刪除相簿後，其中的相片保留在你的相片庫中。",
            delAlbum: "確認刪除",
            cancel: "取消",
            seal: "封存",
            reduction: "還原",
            modifyContent: "修改內容",
            plsSelect: "請選擇",
            photoDescription: "照片說明",
            modify: "修改"
        },
        showPhoto: {
            addAlbumDo: "我要新建一個相簿",
            addAlbum: "新建相簿",
            cancelAddAlbum: "取消新建相簿",
            selectAlbum: "我要選擇一個相簿",
            photoDescription: "照片說明",
            photoName: "照片名稱",
            uploadOk: "確認"
        }
    },
    allDoctorNote: {
        alldoctorNote: "歷次病情摘要",
        doctorNote: "病情摘要",
        noData: "目前還沒有病情摘要",
        totalRecord: "共 {{totalCnt}} 筆",
        serverError: "伺服器資料讀取失敗",
        confirmDelete: "確認刪除此筆病情摘要",
        deleteRecord: "是否將此筆病情摘要",
        cancel: "取消",
        delete: "刪除",
        createRecord: "新增 {{!loading ? Name + '(' + MedicalId + ')' : null }} 病情摘要",
        editRecord: "修改 {{!loading ? Name + '(' + MedicalId + ')' : null }} 病情摘要",
        showDeleted: "查看 {{!loading ? Name + '(' + MedicalId + ')' : null }} 己刪除病情摘要",
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        doctorNoteTime: "建立日期",
        content: "內容"
    },
    openCamera: {
        photofailed: "拍照失败，原因：",
        caveat: "警告",
    },

    // 片語目錄 phraseIndex.html phraseButton.js
    phrase: {
        edit: "編輯",
        delete: "刪除",
        cancel: "取消",
        noDataMessage: "現在沒有資料，您可以。。。",
        addCatalog: "新增目錄",
        addPhrase: "新增片語",
        catalogName: "目錄名稱",
        enterCatalogName: "請輸入目錄名稱",
        title: "標題",
        enterPhraseTitle: "請輸入片語標題",
        phraseContent: "片語內容",
        enterPhraseContent: "請輸入片語內容",
        updateCatalog: "修改目錄",
        updatePhrase: "修改片語",
        deleteMessage: "你確定要刪除此項目嗎？",
        component: {
            phraseIndex: "片語目錄",
            personalPhrase: '個人片語',
            systemPhrase: '系統片語',
            deleteSuccess: "刪除成功!",
            createSuccess: "新增成功!",
            updateSuccess: "修改成功!",
        }
    },

    // dashboard
    dashboard: {
        outpatient: "門診",
        Hospitalization: "住院",
        person: "人",
        component: {
            patient: "病人",
            machine: "透析機",
            beds: "排床",
            shifts: "排班",
            other: "其他",
            directory: "通訊錄"
        }
    },
    // patientsBoard.html
    patientsBoard: {
        serverError: "伺服器錯誤，請重新整理",
        none: "無",
        Hospitalized: "住院－ {{bedNo}}",
        Outpatient: "門診",
        memo: "記事",
        notification: "通知",
        dialysisRecord: "透析表",
        component: {
            recordDone: "已關表",
            postDialysis: "透析後",
            dialyzing: "透析中",
            recordStart: "已開表"
        }
    },
    // shiftsBoard.html
    shiftsBoard: {
        date: "{{year}} 年 {{month}} 月",
        serverError: "伺服器錯誤，請重新整理",
    },
    // machinseDataBoard.html
    machineDataBoard: {
        dialysisFR: "透析液流速：{{dialysisFR}}",
        bloodFR: "血液流速：{{bloodFR}}",
        bloodP: "血壓：{{BPS}}/{{BPD}}",
        respiration: "脈搏/呼吸：{{Pulse}} / {{Breath}}",
        temp: "體溫：{{temp}}",
        component: {
            recordDone: "已關表",
            postDialysis: "透析後",
            dialyzing: "透析中",
            recordStart: "已開表",
            serverConnecting: "伺服器連線中..."
        }
    },
    // bedsBoard.html
    bedsBoard: {
        serverError: "伺服器錯誤，請重新整理",
    },

    // summaryContentDialog.html
    summaryContentDialog: {
        header: "{{name}} ({{medicalId}}) 透析紀錄"
    },

    // baiduEcharts.js (directive)
    baiduEcharts: {
        noData: "暫無資料"
    },

    // apdSetting.js (directive)
    apdSetting: {
        therapy: "治療方式",
        totalVol: "總治療量",
        therapyTime: "治療時間",
        fillVol: "注入量",
        lastFillVol: "最末袋注入量",
        dextrose: "最末袋葡萄糖濃度",
        patientWeight: "病人體重",
        iDrainAlarm: "0週期引流警訊",
        cycles: "週期數",
        dwellTime: "留置時間",
        comfortControl: "設定透析液溫度",
        lastManualDrain: "最末手控引流",
        ufTarget: "總脫水目標",
        alarm: "警訊",
        minDrainVol: "週期最小引流量",
        specialNotes: "備註事項",
        other: "其他",
        ok: "儲存",
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            noData: "目前暫無資料"
        },
        dialog: {
            createTitle: "APD設定－新增",
            editTitle: "APD設定－修改",
            copyTitle: "APD設定－複製",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // quantityEvaluate.js
    quantityEvaluate: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            noData: "目前暫無資料"
        },
        dialog: {
            createTitle: "透析量評估－新增",
            editTitle: "透析量評估－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // peritonitis.js
    peritonitis: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            noData: "目前暫無資料"
        },
        dialog: {
            createTitle: "腹膜炎感染－新增",
            editTitle: "腹膜炎感染－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            print: "列印",
            toExcel: "轉Excel",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            saveFail: "儲存失敗",
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            symptons: "症狀",
            occurrence: "發生原因",
            nursing_measure: "護理措施",
            treatment_result: "治療結果",
            evaluation_result: "評值結果",
            createDetailSuccess: "新增感染菌種記錄成功",
            createDetailFail: "新增感染菌種記錄失敗",
            editDetailSuccess: "修改感染菌種記錄成功",
            editDetailFail: "修改感染菌種記錄失敗",
            saveSuccess: "儲存成功"
        },
        treat: {
            createTitle: "腹膜炎感染－新增",
            editTitle: "腹膜炎感染－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // treatRecord.js
    treatRecord: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            noData: "目前無治療處方"
        },
        dialog: {
            createTitle: "治療處方－新增",
            editTitle: "治療處方－修改",
            editViewTitle: "治療處方－查閱",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            createDetailSuccess: "新增換液狀況成功",
            createDetailFail: "新增換液狀況失敗",
            editDetailSuccess: "修改換液狀況成功",
            editDetailFail: "修改換液狀況失敗",
            saveSuccess:"儲存成功",
            saveFail:"儲存失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // capdTraining.js (directive)
    capdTraining: {
        BloodPressureCtrl: "血壓控制",
        CAPDPrinciple: "CAPD原理",
        TreatmentComplications: "合併症處理方法",
        WeightMeas: "體重測量",
        BloodPressureMeas: "血壓測量",
        LiquidExchange: "換液操作",
        CatheterHandling: "導管處理",
        PointsAttention: "注意事項",
        ok: "儲存",
        component: {
            editSuccess: "修改成功",
            editFail: "修改失敗",
            createSuccess: "新增成功",
            createFail: "新增失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },
    
    // visitPhone.js
    visitPhone: {
        form:{
            RecordDate:"*日期",
            RecordTime:"*時間",
            Operational_Problems:"操作問題",
            Moisture_Control:"水分控制",
            Report_Blood_Examination:"血液檢查報告",
            Dietary_Adjustment:"飲食調整",
            Drug_Adjustment:"藥物調整",
            Dialysate:"透析液",
            Catheter_Outlet:"導管出口",
            Appointment_Date:"約診日期",
            Physiological_Change:"生理變化及處理",
            Related_Problem_Peritonitis:"腹膜炎相關問題",
            Emergency_Management:"緊急事件處理",
            Understanding_Patient_Daily:"了解病人日常生活調適問題",
            Dialysate_Reserve_Transport:"透析液儲備及運送",
            Other:"其他"
        },
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有電話訪談紀錄表",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            readTitle:"電話訪談紀錄表",
            createTitle: "電話訪談紀錄表－新增",
            editTitle: "電話訪談紀錄表－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // visitHome.js
    visitHome: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有居家訪視評估",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            createTitle: "居家訪視評估－新增",
            editTitle: "居家訪視評估－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // orderLR.js
    orderLR: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        dialog: {
            createTitle: "醫療追蹤(長)－新增",
            editTitle: "醫療追蹤(長)－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        }
    },

    // orderST.js
    orderST: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        dialog: {
            createTitle: "醫療追蹤(臨)－新增",
            editTitle: "醫療追蹤(臨)－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        }
    },

    // complication.js
    complication: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            noData: "目前暫無資料"
        },
        dialog: {
            createTitle: "併發症記錄－新增",
            editTitle: "併發症記錄－修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            toExcel: "轉Excel",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },
    // highRiskFaller.js
    highRiskFaller: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有跌倒評估",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            readTitle:"跌倒評估",
            createTitle: "跌倒評估－新增",
            editTitle: "跌倒評估－修改",
            copyTitle: "跌倒評估－複製",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // catheterInfect.js
    catheterInfect: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            noData: "目前暫無資料"
        },
        dialog: {
            createTitle: "導管出口感染-新增",
            editTitle: "導管出口感染-修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            toExcel: "轉Excel",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            saveSuccess:"儲存成功",
            saveFail: "儲存失敗",
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            symptons: "症狀",
            occurrence: "發生原因",
            nursing_measure: "護理措施",
            treatment_result: "治療結果",
            evaluation_result: "評值結果",
            createDetailSuccess: "新增感染記錄成功",
            createDetailFail: "新增感染記錄失敗",
            editDetailSuccess: "修改感染記錄成功",
            editDetailFail: "修改感染記錄失敗"
        },
        treat: {
            createTitle: "導管出口感染-新增",
            editTitle: "導管出口感染-修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },

    // frequencyImplantation.js
    frequencyImplantation: {
        dialog: {
            createTitle: "歷次植管紀錄-新增",
            editTitle: "歷次植管紀錄-修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            saveFail: "儲存失敗",
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗",
            symptons: "症狀",
            occurrence: "發生原因",
            nursing_measure: "護理措施",
            treatment_result: "治療結果",
            evaluation_result: "評值結果"
        },
        treat: {
            createTitle: "歷次植管紀錄-新增",
            editTitle: "歷次植管紀錄-修改",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗",
            noData: "目前暫無資料"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },
    // selfCare.js
    selfCare: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有自我照顧",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            readTitle:"自我照顧",
            createTitle: "自我照顧－新增",
            editTitle: "自我照顧－修改",
            copyTitle: "自我照顧－複製",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        noData: "尚未建立自我照護評估表",
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}"
    },
    // reportDialysis.js
    reportDialysis: {
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前還沒有透析模式告知書",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            createTitle: "透析模式告知書－新增",
            editTitle: "透析模式告知書－修改",
            copyTitle: "透析模式告知書－複製",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            print: "列印",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "儲存成功",
            editFail: "儲存失敗"
        }
    },
    // nursingAssessmentForm.js
    nursingAssessmentForm: {
        // 生理徵象
        signs: "生理徵象",
        posture: "姿勢",
        preDialysis: "透析前",
        BPS: "收縮",
        BPD: "舒張",
        choosePosture: "請選擇姿勢",
        lie: "臥",
        sit: "坐",
        stand: "立",
        Temperature: "體溫",
        Pulse: "心跳",
        Respiration: "呼吸",
        postDialysis: "透析後",
        vitalSignDate: "量測日期",
        vitalSignTime: "量測時間",
        bloodChart: '血壓趨勢圖',
        chartNoData: '暫無資料',
        component: {
            confirmDelete: "刪除確認",
            textContent: "您即將刪除此筆資料，點擊確認後會刪除此筆資料",
            deleteOk: "刪除",
            deleteCancel: "取消",
            deleteSuccess: "刪除成功",
            deleteFail: "刪除失敗"
        },
        Records: {
            showDeleted: "顯示已刪除 （{{deletedItemsLength}}筆）",
            totalRecord: "共 {{totalCnt}} 筆",
            noData: "目前尚未建立腹膜透析紀錄",
            serverError: "伺服器資料讀取失敗"
        },
        dialog: {
            createTitle: "腹膜透析記錄單－新增",
            editTitle: "腹膜透析記錄單－修改",
            copyTitle: "腹膜透析記錄單－複製",
            cancel: "取消",
            create: "儲存",
            edit: "儲存",
            exportEMR:"匯出電子簽章",
            exportEMRSuccess:"電子簽章匯出成功",
            exportEMRFail:"電子簽章匯出失敗",
            createSuccess: "新增成功",
            createFail: "新增失敗",
            editSuccess: "修改成功",
            editFail: "修改失敗"
        },
        createdTime: "建立: {{CreatedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        editedTime: "修改: {{ModifiedTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        exportEMRTime: "電子簽章: {{ExportEMRTime | moment: 'YYYY/MM/DD(dd) HH:mm'}}",
        doctorNoteTime: "建立日期"
    }

}; // end of translation

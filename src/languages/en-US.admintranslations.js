window.en_us_translations = {
    customMessage: {
        serverError: 'Server Error...',
        ComServerError: 'Server Error...',
        noData: 'No Data',
        existedAccount: 'Account Existed',
        dataRequired: 'Required',
        Datasuccessfully: 'Data saved',
        DatasFailure: 'Failed to save data',
        DataAddedSuccessfully: 'Data added',
        DataAddedFail: 'Failed to add new data',
        DeleteSuccess: 'Data deleted',
        EditFail: 'Edit failed',
        DataDeletedSuccess: 'Data deleted',
        DataDeleteFailed: 'Data deletion failed',
        WardNameUnfilled: 'Ward name is not filled in',
        ModulesNameUnfilled: 'Module name is not filled in',
        LeastAbnormalItems: 'Unusual item at least one',
        WardNameRepeat: 'Duplicate ward names',
        CodeDuplicate: 'Duplicate data in the code column',
        DataChangeSuccessfully: 'Data changed',
        DataReadFailure: 'Data reading failed',
        Female: 'Female',
        Male: 'Male',
        Common: 'Common',
        AccessDisable: 'Disabled',
        AccessNormal: 'General',
        AccessAdmin: 'Manager',
        RevertDataSuccess: 'Data recoveried',
        SubcategoryHasDataCantDelete: 'There are still sub-category items that cannot be deleted. Please delete the sub-category before deleting',
        CheckedRouteOrFrequency: 'Please select a suit or route'
    },
    // admin menu page admin.html
    adminmenu: {
        welcome: 'Welcome {{username}}',
        basicSetting: 'Basic Setting',
        user: 'User',
        phrase: 'Phrase',
        ward: 'Ward',
        charge: 'Charge',
        medicine: 'Medicine',
        epo: 'Special Order',
        assessment: 'Assessment',
        machineProperty: 'Property',
        labexamItem: 'Labexam Item',
        custom: 'Custom',
        info: 'Parameter Setting',
        statistic: 'Dialysis Counts',
        log: 'Log',
        contract: 'Contract',
        payment: 'Billing',
        inputoutput: 'Import / Export',
        kidit: 'Import / Export',
        medicationExport: 'Medication Export',
        labexamImport: 'Labexam Import',
        medicationImport: 'Medication Import',
        machinePropertyImport: 'Property Import',
        back: 'Back'
    }, // end of adminmenu
    // admin basicSetting page basicSetting.html
    basicSetting: {
        pageTitle: 'Basic Setting',
        hospitalName: 'Hospital Name',
        hospitalCode: 'Hospital Code',
        formTitle: 'Form Title',
        hospitalLogo: 'Hospital Logo',
        hostName: 'Host Name',
        hostNameDesc: '(One link address for each line)',
        mailSetting: 'Mail Setting',
        host: 'SMTP server',
        port: 'SMTP port',
        account: 'Account',
        password: 'password',
        enableSSL: 'SSL',
        from: 'From',
        afterUpdate: 'After update，other device have to re-login will take effect.',
        savebutton: 'Save',
        contract: 'Current Contract',
        payment: 'Newest Payment',
        SheetTemplate: 'Sheet Template',
        enlargebutton: 'Enlarge',
        SheetOther: 'Other',
        SheetName: 'Sheet Name'
    }, // end of basicSetting

    // admin user page user.html
    user: {
        pageTitle: 'User',
        totalRecord: 'Total: {{total}}',
        search: 'Search User',
        addNew: 'You can add user profiles by clicking the Add button in the bottom right corner',
        access: {
            stop: 'Stop',
            normal: 'Normal',
            admin: 'Admin'
        },
        login: {
            nologin: 'Never login',
            lastlogin: 'Last login :{{lastLoginTime | moment: \'YYYY/MM/DD (dd) HH:mm\'}} @{{lastLoginIP}}'
        },
        detailpageTitle: 'User / {{username}} User Profiles',
        detailpageTitleAdd: 'User / Add New User Profiles',
        account: 'Account',
        name: 'Name',
        passowrdEmpty: 'Keep empty if password is not changed',
        password: 'Password',
        passwordConfirm: 'Password Confirm',
        gender: 'Gender',
        employeeId: 'Employee Id',
        phone: 'Phone',
        mobile: 'Mobile',
        email: 'Email',
        accesses: 'Access',
        module: 'Module - Required',
        ward: 'Ward - Required',
        role: 'Role',
        recoverbutton: 'Recover',
        savebutton: 'Save',
        select: 'Please select......',
        afterUpdate: '@:basicSetting.afterUpdate',
        component: {
            operatingfailure: 'Operation Failed, Email Format Error!',
            dataIncomplete: 'Data Incomplete!',
            recoverSuccess: 'Recover user Success!',
            role1: 'Doctor',
            role2: 'Nurse',
            role3: 'Other'
        }
    }, // end of user

    // admin phrase page phrase.html
    phrase: {
        pageTitle: 'Phrase',
        noAdd: 'This page can not add catalogs and phrases',
        kind: 'Kind',
        catalog: 'Catalog',
        phrase: 'Phrase',
        personalPhrase: 'Personal Phrase',
        systemPhrase: 'System Phrase',
        name: 'Name',
        cont: 'Content',
        catalogName: 'Catalog Name',
        phraseName: 'Phrase Name',
        phraseCont: 'Phrase Content',
        addCatalogbutton: 'Add Catalog',
        addPhrasebutton: 'Add Phrase',
        showDelete: 'Show Deleted',
        editbutton: 'Edit',
        deletebutton: 'Delete',
        recoverbutton: 'Recoer',
        rootphrase: 'Root Phrase',
        personal: 'Personal Phrase',
        system: 'System Phrase',
        component: {
            addCatalogtitle: 'Add Catalog',
            editCatalogtitle: 'Edit Catalog',
            addPhrasetitle: 'Add Phrase',
            editPhrasetitle: 'Edit Phrase',
            operatingfailure: 'Operation Failed, Input Format Error!',
            operatingfailuretype: 'Operation Failed, Type Error!',
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this {{type}} information ? Click DELETE to Remove this {{type}} information!',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel'
        }
    }, // end of phrase

    // admin ward page ward.html
    ward: {
        pageTitle: 'Ward',
        totalRecord: 'Total: {{total}}',
        addNew: 'You can add ward information by clicking the Add button in the bottom right corner',
        bedRecord: '{{::bed}} Beds',
        detailpageTitle: 'Ward / {{wardname}} Ward Information',
        detailpageTitleAdd: 'Ward / Add New Ward Information',
        wardName: 'Ward Name',
        bedName: 'Bed No',
        bedGroup: 'bed Group / bed No',
        groupName: 'Group Name',
        errorItem: 'Abnormal Items',
        addGroupbutton: 'Add Bed Group',
        deleteGroupbutton: 'Delete Group',
        addErrorItembutton: 'Add Abnormal Item',
        applyTemplate: 'Apply Template',
        itemKind: 'Item Kind',
        enterItemKind: 'Enter ItemKind',
        kindCode: 'Kind Code',
        kindName: 'Kind Name',
        subKindCode: 'Subkind Code',
        subKindName: 'Subkind Name',
        canclebutton: 'Cancel',
        addbutton: 'Add',
        noErrorItem: 'No Abnormal Items',
        kind: 'Kind',
        code: 'Code',
        name: 'Name',
        deletebutton: 'Delete',
        savebutton: 'Save',
        recoverbutton: 'Recover',
        enterItemKindCode: 'Enter ItemKindCode',
        enterItemKindName: 'Enter ItemKindName',
        entersubItemKindCode: 'Enter subItemKindCode',
        entersubItemKindName: 'Enter subItemKindName',
        enterCode: 'Enter Code',
        enterName: 'Enter Name',
        component: {
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this group information : {{name}} ? Click DELETE to Remove this group information!',
            errorContent: 'Do you want to delete this abnormal items information : {{name}} ? Click DELETE to Remove this abnormal items!',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel',
            groupNameEmpty: 'Group item name cannot be blank.',
            selopt: '--Select--',
            opt1: 'General',
            opt2: 'Hepatitis B',
            opt3: 'Hepatitis C',
            opt4: 'Hepatitis B+C',
            opt5: 'HIV',
            opt6: 'Infection',
            opt7: 'Other'
        }
    }, // end of ward

    // admin charge page charge.html
    charge: {
        pageTitle: 'Charge',
        select: 'Select Ward:',
        totalRecord: 'Total: {{total}}',
        addNew: 'You can add charge information by clicking the Add button in the bottom right corner',
        name: 'Name',
        pcCode: 'Code',
        nowStock: 'Stock',
        safeStock: 'Safety Stock',
        detailpageTitle: 'Charge / {{chargename}} Charge Information',
        itemOverview: 'Item Overview',
        editbutton: 'Edit',
        codes: 'Code',
        price: 'Price',
        nowStocks: 'Stock',
        safeStocks: 'Safety Stock',
        purchase: 'Purchase',
        sales: 'Destroy',
        returns: 'Returns',
        inventory: 'Inventory',
        use: 'Used',
        useList: 'Used List',
        purchaseDate: 'Purchase Date {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        salesDate: 'Sales Date {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        returnsDate: 'Returns Date {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        inventoryDate: 'Inventory Date {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        useDate: 'Use Date {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        user: 'User: {{user}}',
        cnt: 'Qty({{unit}}) {{count}}',
        balance: 'Balance({{unit}}) {{count}}',
        dialopageTitle: '{{chargename}} Charge Information',
        ownWard: 'Own Ward',
        chargeName: 'Name',
        unit: 'Unit',
        orderBy: 'Order By',
        noticeMail: 'Notice Email(Enter every email please press Enter)',
        firmMail: 'Firm Email(Enter every email please press Enter)',
        deletebutton: 'Delete',
        savebutton: 'Save',
        dialopageTitle2: '{{title}} - {{action}}',
        behavior: 'Behavior',
        actionQty: '{{action}}Qty',
        nowStock2: 'Stock',
        safeStock2: 'Safety Stock',
        afterStock2: 'after {{action}} Stock',
        lowStock: 'Low Stock!',
        errorStock: 'Eerror Stock!',
        recordTime: 'Record Time(base on save time)',
        memo: 'Memo',
        dialopageTitle3: '{{title}} - {{action}} Edit',
        qty1: 'Stock Before {{action}}',
        qty2: '{{action}} Qty Before Update',
        qty3: '{{action}} Qty After Update',
        qty4: 'Stock Before Update',
        qty5: 'Stock After Update',
        component: {
            addtitle: 'New',
            edittitle: 'Edit',
            operatingfailure: 'Operation Failed, Email Format Error!',
            operatingfailureinput: 'Operation Failed, Input Format Error!',
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this charge information : {{name}} ? Click DELETE to Remove this charge information!',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel',
            DatasFailure: 'Do not allow recording before the transaction count time'
        }
    }, // end of charge

    // admin medicine page medicine.html
    medicine: {
        pageTitle: 'Medicine',
        totalRecord: 'Total: {{total}}',
        search: 'Search Medicine',
        addNew: 'You can add medicine information by clicking the Add button in the bottom right corner',
        NHICode: 'NHI Code',
        code: 'Code',
        detailpageTitle: 'Medicine / {{name}} Medicine Information',
        detailpageTitleAdd: 'Medicine / Add New Medicine Information',
        name: 'Name',
        kind: 'Category',
        custom: 'Custon Kind',
        enterCustom: 'Enter Custon Kind',
        codes: 'Code',
        NHICodes: 'NHI Code',
        qty: 'Qty(This will be automatically taken to Prescription Record Qty)',
        qtyUnit: 'Qty Unit',
        capacity: 'Capacity',
        capacityUnit: 'Capacity Unit',
        dose: 'Dose',
        doseUnit: 'Dose Unit',
        addStatistics: 'Add Statistics',
        statisticsOrder: 'Statistics Order',
        isDangerMed: 'High Risk Medication',
        memo: 'Memo',
        way: 'Way(Choose at least one)',
        method: 'Method and frequency(Choose at least one)',
        deletebutton: 'Delete',
        savebutton: 'Save',
        component: {
            MedPO: 'PO - oral',
            MedSC: 'SC - Subcutaneous injection',
            MedSL: 'SL - Sublingual',
            MedIV: 'IV - Intravenous injection',
            MedIM: 'IM - Intramuscular injection',
            MedIVD: 'IVD - Intravenous addition',
            MedTOPI: 'TOPI - Partially rubbed',
            MedEXT: 'EXT - external use',
            MedAC: 'AC - Take before meals',
            MedPC: 'PC - Take after meals',
            MedMeal: 'Meal - Taken in meal',
            MedQDAC: 'QDAC - Once daily (Half an hour before meals)',
            MedQDPC: 'QDPC - Once daily (after meals)',
            MedQN: 'QN - Once every night',
            MedQOD: 'QOD - Every other day',
            MedHS: 'HS - Half an hour before going to bed every night',
            MedTID: 'TID - 3 times a day(morning、noon、at night)',
            MedTIDAC: 'TIDAC - 3 meals a day and a half before',
            MedTIDPC: 'TIDPC - After 3 meals daily',
            MedBID: 'BID - 2 times a day(morning、at night)',
            MedBIDAC: 'BIDAC - Daily morning and evening(Half an hour before meals)',
            MedBIDPC: 'BIDPC - Daily morning and evening(After meal)',
            MedST: 'STAT - Use immediately',
            MedQ2W: 'Q2W - Every 2 weeks',
            MedQID: 'QID - 4 times a day',
            MedQD: 'QD - Once a day(Daily fixed time)',
            MedQHD: 'QHD - Once a day(after dialysis)',
            MedQW1: 'QW1 - Once a week(Monday)',
            MedQW2: 'QW2 - Once a week(Tuesday)',
            MedQW3: 'QW3 - Once a week(Wednesday)',
            MedQW4: 'QW4 - Once a week(Thursday)',
            MedQW5: 'QW5 - Once a week(Friday)',
            MedQW6: 'QW6 - Once a week(Saturday)',
            MedQW7: 'QW7 - Once a week(Sunday)',
            MedQW135: 'QW135 - 3 times a week(MON、WED、FRI)',
            MedQW1357: 'QW1357 - 4 times a week(Mon、WED、FRI、SUN)',
            MedQW246: 'QW246 - 3 times a week(TUE、THR、SAT)',
            MedQW2467: 'QW2467 - 4 times a week(TUE、THR、SAT、SUN)',
            MedPRN: 'PRN - Use when needed',
            MedTIW: 'TIW - 3 times a week',
            MedBIW: 'BIW - 2 times a week',
            MedBIW15: 'BIW15 - 2 times a week(MON、FRI)',
            MedBIW26: 'BIW26 - 2 times a week(TUE、SAT)',
            MedQW136: 'QW136 - 3 times a week(MON、WED、SAT)',
            MedQW146: 'QW146 - 3 times a week(MON、THR、SAT)',
            Qw: 'QW - Once a week',
            message1: 'The method and frequency are required, please select at least one',
            message2: 'The route is required, please select at least one',
            message3: 'Dosage (frequency) is required, please select at least one',
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this medicine information ?',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel'
        }
    }, // end of medicine

    // admin epo page epo.html
    epo: {
        pageTitle: 'Special Order',
        totalRecord: 'Total: {{total}}',
        search: 'Search Special Order Medicine',
        addNew: 'You can add special order medicine information by clicking the Add button in the bottom right corner',
        NHICode: 'NHI Code',
        internalCode: 'InternalCode',
        detailpageTitle: 'Special Order / {{name}} Medicine Information',
        detailpageTitleAdd: 'Special Order / Add New Medicine Information',
        name: 'Name',
        kind: 'Kind',
        long: 'Long',
        short: 'Short',
        NHICodes: 'NHI Codes',
        internalCodes: 'Internal Codes',
        qty: 'Qty',
        qtyUnit: 'Qty Unit',
        dose: 'Dose',
        doseUnit: 'Dose Unit',
        statisticsOrder: 'Statistics Order',
        way: 'Way',
        deletebutton: 'Delete',
        savebutton: 'Save'
    }, // end of epo

    // admin assessment page assessment.html
    assessment: {
        pageTitle: 'Assessment',
        totalRecord: 'Total: {{total}}',
        subtitle1: 'Pre Assessment',
        subtitle2: 'In Assessment',
        subtitle3: 'Post Assessment',
        addNew: 'You can add assessment information by clicking the Add button in the bottom right corner',
        detailpageTitle: 'Assessment / {{name}} Assessment Information',
        detailpageTitleAdd: 'Assessment / Add New Assessment Information',
        type: 'Assessment Type',
        name: 'Name',
        optionstitle: 'Options',
        options: 'Options (One option for each line)',
        other: 'Include Other',
        formShow: 'Show on form',
        recoverbutton: 'Recover',
        savebutton: 'Save',
        deletebutton: 'Delete',
        component: {
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this assessment information ?',
            confirmTitle: 'Delete assessment',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel'
        }
    }, // end of assessment

    // admin machineProperty page machineProperty.html
    property: {
        pageTitle: 'Property',
        totalRecord: 'Total: {{total}}',
        addNew: 'You can add property information by clicking the Add button in the bottom right corner',
        showDelete: 'Show Deleted',
        detailpageTitle: 'Property / {{name}} Property Information',
        detailpageTitleAdd: 'Property / Add New Property Information',
        detailpageTitleDelete: 'Property / Deleted {{name}} Property Information',
        propertyNumber: 'Property Number',
        brand: 'Brand',
        model: 'Model',
        serialNumber: 'Serial Number',
        bluetoothNumber: 'Bluetooth Number',
        pattern: 'Incorrect data format',
        writebutton: 'Card writing',
        notNFC: '(No NFC or NFC closed)',
        recoverbutton: 'Recover',
        deletebutton: 'Delete',
        savebutton: 'Save',
        component: {
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this property information ?',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel',
            writeCardMsg: 'The information is not complete, please confirm the correctness of "Bluetooth Number" and "Brand" or "Model"',
            confirmWrite: 'Card write prompt',
            writeTitle: 'card write',
            textWriteContent: 'Card has information : {{data}} , cover?',
            writeOk: 'Write',
            writeCancel: 'Cancel',
            writeSuccessfully: 'Write successful.',
            writeError: 'Is the card incorrect? Or please rewrite it on the card again!'
        }
    }, // end of machineProperty

    // admin labexamItem page labexamItem.html
    labexamItem: {
        pageTitle: 'Labexam Item',
        totalRecord: 'Total: {{total}}',
        addNew: 'You can add labexam item information by clicking the Add button in the bottom right corner',
        detailpageTitle: 'Labexam Item / {{name}} Labexam Item',
        detailpageTitleAdd: 'Labexam Item / Add New Labexam Item',
        name: 'Name',
        fullname: 'Full name',
        code: 'Code',
        gender: 'Gender',
        unit: 'Unit',
        lowerLimit: 'Lower Limit',
        upperLimit: 'Upper Limit',
        deletebutton: 'Delete',
        savebutton: 'Save',
        component: {
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this labexamItem information ?',
            confirmTitle: 'Delete labexamItem',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel'
        }
    }, // end of labexamItem

    // admin custom page custom.html
    custom: {
        pageTitle: 'Custom',
        nursingRecords: 'System - Nursing Phrase',
        messageNotification: 'System - Notification',
        edit: '{{name}} Edit',
        cont: 'Content',
        template: 'Vocabulary Template',
        autoImport: 'Enable auto-import function',
        savebutton: 'Save',
        saveMessage: 'Please select a phrase item first',
        Dialysis_Start_Walk: 'Walk - Weight before dialysis (For weight machine)',
        Dialysis_Start_Wheelchair: 'Wheelchair - Weight before dialysis (For weight machine)',
        Dialysis_FirstData: 'Enter the first dialysis machine data',
        Dialysis_After_BP: 'Blood pressure after dialysis',
        Dialysis_After_Weight: 'Weight after dialysis',
        Dialysis_Closed: 'Closed',
        Dialysis_Executive_Medication: 'Executive medication',
        Dialysis_Neglect_Medication: 'Neglect medication',
        Dialysis_DoctorNote_Change: 'Disease summary change',
        Dialysis_Add_Order: 'Add medication',
        Dialysis_Update_Order: 'Update medication',
        Dialysis_Delete_Medication: 'Delete medication',
        HEADER_FIRST_DATE_YYYYMMDD: 'The first dialysis machine data date',
        HEADER_FIRST_DATE_MMDD: 'The first dialysis machine data month and day',
        HEADER_FIRST_TIME_HHMM: 'The first dialysis machine data time',
        HEADER_LAST_DATE_YYYYMMDD: 'The last dialysis machine data date',
        HEADER_LAST_DATE_MMDD: 'The last dialysis machine data month and day',
        HEADER_LAST_TIME_HHMM: 'The last dialysis machine data time',
        HEADER_TARGET_TIME: 'Head target dialysis time',
        HEADER_BF: 'Head dialysis prescription BF',
        HEADER_START_BPS: 'Head start BPS',
        HEADER_START_BPD: 'Head start BPD',
        HEADER_END_BPS: 'Head end BPS',
        HEADER_END_BPD: 'Head end BPD',
        HEADER_DEHYDRATION_TARGET: 'Head target dehydration',
        HEADER_HEPARIN: 'Head dialysis prescription heparin',
        MEDICATION_ORDER_DATE_YYYYMMDD: 'Medication order date',
        MEDICATION_ORDER_DATE_MMDD: 'Medication order date month and day',
        MEDICATION_ORDER_DATE_HHMM: 'Medication order date time',
        MEDICATION_EXECUTIVE_DATE_YYYYMMDD: 'Execution date of medication',
        MEDICATION_EXECUTIVE_DATE_MMDD: 'Execution date of medication month and day',
        MEDICATION_EXECUTIVE_TIME_HHMM: 'Execution date of medication time',
        MEDICATION_NAME: 'Drug name',
        MEDICATION_ROUTE: 'Medication route',
        MEDICATION_FREQUENCY: 'Dosing frequency',
        MEDICATION_QUANITIY_UNIT: 'Medication unit',
        MEDICATION_QUANITIY: 'Quantity of medication',
        MEDICATION_MEMO: 'Execution medication note',
        MEDICATION_CREATED_NAME: 'Drug establishment staff',
        MEDICATION_MODIFIED_NAME: 'Drug modification staff',
        HEADER_DEHYDRATION: 'Actual dehydration amount',
        MACHINE_DATA_TOTAL_UF: 'Dialysis machine data Total UF',
        PATIENT_ENTRY_MODE: 'Admission method',
        DOCTOR_CHANGE_CONTENT: 'Disease summary transaction content',
        CHANGE_USER_NAME: 'Transactional disease summary personnel name',
        HEADER_SETTINGDEHYDRATION: 'Setting the amount of dehydration',
        HEADER_ENDWEIGHT: 'Head end weight',
        HEADER_BEFORE_WEIGHT: 'Head weight before washing',
        BEFORE_DOCTOR_CONTENT: 'Pre-modification summary',
        HEADER_DEVIATION: 'deviation'
    }, // end of custom

    // admin info page info.html
    info: {
        pageTitle: 'Parameter Setting',
        pairName: '{{name}} (One Item for each line)',
        prescription: 'Prescription',
        catheter: 'Catheter',
        custom: 'Other',
        bloodSetting: 'Blood Setting',
        dead: 'Dead Reason (One Item for each line)',
        customs: 'Custom (drop down and select maintained item)',
        bloodSettings: 'Blood Setting (The blood product code and the blood bag barcoode must be the same.)',
        bloodCode: 'Blood Code',
        bloodName: 'Blood Name',
        bloodCodes: 'Blood Code: {{key}}',
        bloodNames: 'Blood Name: {{value}}',
        recoverbutton: 'Recover',
        addbutton: 'Add',
        deletebutton: 'Delete',
        savebutton: 'Save',
        component: {
            anticoagulants: 'Anticoagulants',
            artificialKidneys: 'Artificial Kidneys',
            catheterHospitals: 'Catheter Hospitals',
            dialysateFlowRates: 'Dialysate Flow Rates',
            dialysates: 'Dialysates',
            frequencies: 'Frequencies',
            needleArteries: 'Needle Arteries',
            needleVeins: 'Needle Veins',
            prescriptionModes: 'Prescription Modes',
            routes: 'Routes',
            shifts: 'Shifts',
            shiftGroups: 'Shift Groups',
            bloodCollection: 'Blood Collection',
            confirmDelete: 'Confirm to Delete ?',
            textContent: 'Do you want to delete this Blood information : {{bloodName}} ? Click DELETE to Remove this Blood information!',
            deleteOk: 'Delete',
            deleteCancel: 'Cancel',
            recoverSuccess: 'Recover Info Successful!',
            EndHollowFiber: 'End Hollow Fiber',
            EndChamber: 'End Chamber'
        }
}, // end of info

    // admin statistic page statistic.html
    statistic: {
        pageTitle: 'Dialysis Counts',
        startDate: 'Start Date',
        endDate: 'End Date',
        label: 'Number of hemodialysis records'
    }, // end of statistic

    // admin log page log.html
    log: {
        pageTitle: 'Log',
        search: 'Search by user',
        search1: 'Search by patient',
        date: 'Date',
        Sdate: 'Start Date',
        Edate: 'End Date',
        sendmail: 'Send Email',
        get: 'Query',
        post: 'Add',
        put: 'Update',
        delete: 'Delete',
        resultList: 'DateTim：{{CreatedDateTime | date : \'yyyy/MM/dd HH:mm:ss\'}} ， User：{{user}} ， Source：{{functionType}}',
        addlabel: 'Added',
        updlabel: 'Modify',
        dellabel: 'Delete',
        unchangelabel: 'No change',
        detail: 'Details',
        orldata: 'Raw data',
        updatedata: 'Modified data'
    }, // end of log

    // admin contract page contract.html
    contract: {
        pageTitle: 'Contract',
        totalRecord: 'Total: {{total}}',
        detailpageTitle: 'Contract / {{name}} Information',
        number: 'Contract Number',
        name: 'Contract Name',
        range: 'Contract Range',
        state: 'Contract State',
        billingMethod: 'Payment Method',
        usage: 'Usage Amount',
        rent: 'Monthly Rent',
        invoice: 'Invoice',
        companyId: 'Company Id',
        person: 'Owner',
        phone: 'Phone',
        address: 'Address',
        start: 'Contract Start',
        end: 'Contract End',
        startend: 'Contract Start & End',
        price: 'Price'
    }, // end of contract

    // admin payment page payment.html
    payment: {
        pageTitle: 'Billing',
        totalRecord: 'Total: {{total}}',
        detailpageTitle: 'Billing / {{name}} Information',
        name: 'Payment Name',
        range: 'Payment Range',
        state: 'Payment State',
        pricingMethod: 'Payment Method',
        usage: 'Usage Amount',
        rent: 'Monthly Rent',
        price: 'Price',
        quantity: 'Quantity',
        discount: 'Discount',
        totalAmount: 'Total Amount',
        invoiceNumber: 'Invoice Number',
        postingDate: 'Posting Date',
        start: 'Start Charge',
        end: 'End Charge',
        startend: 'Charge Start & End'
    }, // end of payment

    // admin kidit page kidit.html
    kidit: {
        pageTitle: 'Import / Export',
        desc: 'Exported files opened by Excel, can only browse, can not be archived action, will lead to data distortion. For example, the medical record code is "0001234", after being saved by Excel, it will be "1234".',
        function1: 'Dialysis Records Statistics',
        startDate: 'Start Date',
        endDate: 'End Date',
        outputFormat: 'Export CSV file',
        outputDesc: 'Instructions:',
        desc1: '1. Dialysis records were obtained from patients with dialysis by date range. For example, if a patient has kidney dialysis on Mondays, Wednesdays, and Fridays, the date of dialysis exchange is 10/3 (one) to 10/5 (five), and the patient has 3 records of dialysis records',
        function2: 'Export Prescription Information',
        desc2: 'Prescription Date',
        desc3: '1. Obtain the latest prescription for dialysis patients by date range.',
        desc4: '2. Set the date of opening a prescription, if not checked, the day will actually be opened according to the patient\'s prescription.',
        desc5: '3. For example, one patient will have kidney dialysis on Mondays, Wednesdays and Fridays. The date of remittance will be 10/1 (one) to 10/5 (five). The patient will have 3 Pen dialysis records, but the prescription will crawl 10/5 (e) information.',
        function3: 'Export Patient Data',
        desc6: '1. Get all patients with renal dialysis informatio.',
        function4: 'Import Patient Data',
        select: 'Select Ward',
        desc7: '1. Please ask system engineer for content format.',
        desc8: '2. The first column of the file is the title column, and will not be imported.',
        desc9: '3. Medical records or ID card will be required.',
        desc10: '4. New patients, priority to the medical record code, then the ID card, when two do not exist then add.',
        desc11: '5. Modify the patient information, when the contents of the field value, will change, if blank, it will retain the original data.',
        desc12: '6. The system will change the basic information of the data are: name, patient category, birthday, ID number, gender, telephone, medical record number, address, blood type, status, first treatment date, ward.',
        importFormat: 'Data Import',
        inputDesc: 'Instructions:',
        function5: 'Import Prescription Data',
        patientCode: 'Patient',
        IdentId: 'Identifier Id',
        Frequency: 'Frequency',
        ModeName: 'Dialysis Method',
        result: 'Result',
        desc13: '1. Please confirm that the content is KiDiT format.',
        desc14: '2. Medical records or ID card will be required.',
        desc15: '3. The system will change the basic information of the data are: prescription date、dialysis method、blood flow、dialysate flow、number of times per week、each dialysis time、anticoagulant、initial dose、maintenance dose、dialysis machine model、calcium ion concentration、potassium ion concentration.',
        desc16: '4. Data upload button above of the data, after reading the information to confirm correct implementation of the "data upload" button to complete the import function.',
        desc20: 'The first column of the import file contains the title column',
        function6: 'Import Vessel Data',
        desc17: '3. The system will change the basic information of the data are: vessel kind, direction, vessel position, the first dialysis date of the season, use far-infrared therapy, times a week, average weekly total treatment time, use other heat treatments, treatment methods, average weekly total treatment time。',
        SeasonVesselDate: 'First Dialysis',
        CatheterType: 'Vessel Kind',
        function7: 'Export Vessel Data',
        function9: 'Export Labexam Data',
        desc18: '1. Obtain the vessel data for dialysis patients by date range',
        desc19: '1. Obtain the labexam data for dialysis patients by date range'
    }, // end of kidit

    // admin medicationExport page medicationExport.html
    medicationExport: {
        pageTitle: 'Medication Export',
        startDate: 'Start Date',
        endDate: 'End Date',
        kind: 'Kind',
        showDelete: 'Show Deleted',
        exportbutton: 'Export CSV file'
    }, // end of medicationExport

    // admin labexamImport page labexamImport.html
    labexamImport: {
        pageTitle: 'Labexam Import',
        inputDesc: 'Instructions:',
        desc1: '1. Please confirm the content format and encode it as UTF-8.',
        desc2: '2. The first column of the file is the title column, and will not be imported.',
        desc3: '3. The first three columns for a fixed field, in order: ID number, medical record number, test date, followed by the various test items.',
        desc4: '4. One of the required ID number or medical record code.',
        desc5: '5. Modify the test results, when the contents of the field value, will change, if blank, it will retain the original data.',
        desc6: '6. Data upload button at the bottom of the screen, after reading the information to confirm correct implementation of the "data upload" button to complete the import function.',
        desc7: '7. Sample file',
        download: 'Download',
        patientCode: 'Patient Code',
        labexamItem: 'Labexam Item',
        labexamResult: 'Labexam Result',
        unit: 'Unit',
        result: 'Result',
        importbutton: 'Import',
        idnumber: 'ID Number',
        labexamdate: 'Labexam Date'
    }, // end of labexamImport

    // admin medicationImport page medicationImport.html
    medicationImport: {
        pageTitle: 'Medication Import',
        inputDesc: 'Instructions:',
        desc1: '1. Please confirm the content format and encode it as UTF-8.',
        desc2: '2. The first column of the file is the title column, and will not be imported.',
        desc3: '3. Import fields are as follows: name, code, quantity, category name, health insurance code, quantity unit, capacity, capacity unit, dosage, dosage unit.',
        desc4: '4. The name of the drug, code, quantity, approach, service method (frequency) must have value. Way, service (frequency) content with the "&" symbol separated.',
        desc5: '5. Drug name and code the same as the data duplication, data duplication, the data will be imported to cover the other fields.',
        desc6: '6. Data upload button at the bottom of the screen, after reading the information to confirm correct implementation of the "data upload" button to complete the import function.',
        desc7: '7. Sample file',
        download: 'Download',
        required: '(Red is an required column)',
        name: 'Name',
        code: 'Code',
        kind: 'Kind',
        qty: 'Qty',
        press: 'Press',
        importbutton: 'Import',
        excel: {
            name: 'Name',
            codes: 'Codes',
            qty: 'Qty',
            kind: 'Kind',
            NHICodes: 'NHI Codes',
            qtyUnit: 'Unit of qty',
            capacity: 'Capacity',
            capacityUnit: 'Capacity unit',
            dose: 'Dose',
            doseUnit: 'Dose unit',
            addStatistics: 'Join to statistics',
            way: 'Way',
            method: 'method'
            }
    }, // end of medicationImport

    // admin machinePropertyImport page machinePropertyImport.html
    machinePropertyImport: {
        pageTitle: 'Property Import',
        inputDesc: 'Instructions:',
        desc1: '1. Please confirm the content format and encode it as UTF-8.',
        desc2: '2. The first column of the file is the title column, and will not be imported.',
        desc3: '3. Import field, in order: property number, brand, model, serialNumber, Bluetooth number, Memo.',
        desc4: '4. The property number must have a value. Bluetooth stick number is not allowed to repeat.',
        desc5: '5. When the property number is the same, the data is repeated, and when the data is repeated, the other fields will be overwritten with the imported data.',
        desc6: '6. Data upload button at the bottom of the screen, after reading the information to confirm correct implementation of the "data upload" button to complete the import function.',
        desc7: '7. Sample file',
        download: 'Download',
        required: '(Red is an required column)',
        propertyNumber: 'Property Number',
        brand: 'Brand',
        model: 'Model',
        bluetoothNumber: 'Bluetooth Number',
        result: 'Result',
        importbutton: 'Import',
        excel: {
            propertyNumber: 'Property Number',
            bluetoothNumber: 'Bluetooth Number',
            brand: 'Brand',
            model: 'Model',
            serialNumber: 'Serial Number'
        }
    } // end of machinePropertyImport

}; // end of translation

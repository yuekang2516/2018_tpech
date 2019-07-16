window.zh_cn_translations = {
    customMessage: {
        serverError: '伺服器资料读取失败',
        ComServerError: '伺服器错误',
        noData: '没有资料',
        existedAccount: '此帐号已存在',
        dataRequired: '必填选项',
        Datasuccessfully: '资料储存成功',
        DatasFailure: '资料储存失败',
        DataAddedSuccessfully: '资料新增成功',
        DataAddedFail: '资料新增失败',
        DeleteSuccess: '刪除成功',
        EditFail: '编辑失败',
        DataDeletedSuccess: '资料删除成功',
        DataDeleteFailed: '资料删除失败',
        WardNameUnfilled: '透析室名称未填写',
        ModulesNameUnfilled: '模组名称未填写',
        LeastAbnormalItems: '异常项目至少一项',
        WardNameRepeat: '透析室名称重复',
        CodeDuplicate: '代码栏资料重复',
        DataChangeSuccessfully: '资料变更成功',
        DataReadFailure: '资料读取失败',
        Female: '女',
        Male: '男',
        Common: '通用',
        AccessDisable: '停用',
        AccessNormal: '一般',
        AccessAdmin: '管理者',
        RevertDataSuccess: '复原资料成功',
        SubcategoryHasDataCantDelete: '仍有子类别项目存在无法删除，请删除子类别后，再删除',
        CheckedRouteOrFrequency: '请选择服法或途径'
    },
    // admin menu page admin.html
    adminmenu: {
        welcome: '{{username}} 您好',
        basicSetting: '基本设定',
        user: '使用者管理',
        phrase: '片语管理',
        ward: '透析室管理',
        charge: '计价管理',
        medicine: '药品管理',
        epo: '特殊医嘱',
        assessment: '评估项目管理',
        machineProperty: '财产管理',
        labexamItem: '检验检查项目',
        custom: '自定义动作范本',
        info: '参数设定',
        statistic: '透析人次',
        log: 'Log纪录',
        contract: '合约纪录',
        payment: '帐单纪录',
        inputoutput: '资料汇入汇出',
        kidit: 'KiDiT作业',
        medicationExport: '开药纪录 汇出',
        labexamImport: '检验检查 汇入',
        medicationImport: '药品资料 汇入',
        machinePropertyImport: '财产资料 汇入',
        back: '回前台首页'
    }, // end of adminmenu

    // admin basicSetting page basicSetting.html
    basicSetting: {
        pageTitle: '基本设定',
        hospitalName: '医院名称',
        hospitalCode: '医院代码',
        formTitle: '表单标题',
        hospitalLogo: '医院Logo',
        hostName: '网域',
        hostNameDesc: '(每一行代表一个可连线的网址)',
        mailSetting: '邮件相关设定',
        host: 'SMTP server',
        port: 'SMTP port',
        account: '帐号',
        password: '密码',
        enableSSL: 'SSL',
        from: '寄件者名称',
        afterUpdate: '更改资料后，其他装置须重新登入才会生效',
        savebutton: '储存',
        contract: '目前合约',
        payment: '最新帐单',
        SheetTemplate: '表单范本',
        enlargebutton: '放大',
        SheetOther: '其他',
        SheetName: '表單名稱'
    }, // end of basicSetting

    // admin user page user.html
    user: {
        pageTitle: '使用者管理',
        totalRecord: '共 {{total}} 笔',
        search: '搜寻使用者',
        addNew: '您可以按右下角新增按钮来新增使用者资料',
        access: {
            stop: '停用',
            normal: '一般',
            admin: '管理者'
        },
        login: {
            nologin: '未登入过',
            lastlogin: '最后登入 :{{lastLoginTime | moment: \'YYYY/MM/DD (dd) HH:mm\'}} @{{lastLoginIP}}'
        },
        detailpageTitle: '使用者管理 / {{username}} 个人资料',
        detailpageTitleAdd: '使用者管理 / 新增 个人资料',
        account: '帐号',
        name: '姓名',
        passowrdEmpty: '密码无异动请空白',
        password: '密码',
        passwordConfirm: '密码确认',
        gender: '性别',
        employeeId: '员工编号',
        phone: '电话号码',
        mobile: '手机',
        email: 'Email',
        accesses: '权限',
        module: '模组 - 必填',
        ward: '透析室 - 必填',
        role: '角色',
        recoverbutton: '复原',
        savebutton: '储存',
        select: '请选择......',
        afterUpdate: '@:basicSetting.afterUpdate',
        component: {
            operatingfailure: '操作失败, Email格式有误!',
            dataIncomplete: '资料未填写完全!',
            recoverSuccess: '恢复使用者资料成功!',
            role1: '医师',
            role2: '护理师',
            role3: '其他'
        }
    }, // end of user

    // admin phrase page phrase.html
    phrase: {
        pageTitle: '片语管理',
        noAdd: '此页无法新增目录与片语',
        kind: '类别',
        catalog: '目录',
        phrase: '片语',
        personalPhrase: '个人片语',
        systemPhrase: '系统片语',
        name: '名称',
        cont: '内容',
        catalogName: '目录名称',
        phraseName: '片语标题',
        phraseCont: '片语内容',
        addCatalogbutton: '新增目录',
        addPhrasebutton: '新增片语',
        showDelete: '显示已删除项目',
        editbutton: '编辑',
        deletebutton: '删除',
        recoverbutton: '复原',
        rootphrase: '片语目录',
        personal: '个人片语',
        system: '系统片语',
        component: {
            addCatalogtitle: '新增目录',
            editCatalogtitle: '编辑目录',
            addPhrasetitle: '新增片语',
            editPhrasetitle: '编辑片语',
            operatingfailure: '操作失败, 输入有误!',
            operatingfailuretype: '操作失败, Type异常!',
            confirmDelete: '删除确认',
            textContent: '您即将删除{{type}}，点击确认后将会删除此{{type}}项目!',
            deleteOk: '删除',
            deleteCancel: '取消'
        }
    }, // end of phrase

    // admin ward page ward.html
    ward: {
        pageTitle: '透析室管理',
        totalRecord: '共 {{total}} 笔',
        addNew: '您可以按右下角新增按钮来新增透析室资料',
        bedRecord: '共 {{::bed}} 床',
        detailpageTitle: '透析室管理 / {{wardname}} 透析室资料',
        detailpageTitleAdd: '透析室管理 / 新增 透析室资料',
        wardName: '透析室名称',
        bedName: '透析床号',
        bedGroup: '群组 / 透析床号',
        groupName: '群组名称',
        errorItem: '异常项目',
        addGroupbutton: '新增群组',
        deleteGroupbutton: '删除群组',
        addErrorItembutton: '新增异常项目',
        applyTemplate: '套用范本',
        itemKind: '项目类别',
        enterItemKind: '请输入项目类别',
        kindCode: '类别编号',
        kindName: '类别名称',
        subKindCode: '子类别编号',
        subKindName: '子类别名称',
        canclebutton: '取消',
        addbutton: '加入',
        noErrorItem: '目前没有异常项目',
        kind: '类别',
        code: '编号',
        name: '名称',
        deletebutton: '删除',
        savebutton: '储存',
        recoverbutton: '复原',
        enterItemKindCode: '请输入项目类别编号',
        enterItemKindName: '请输入项目类别名称',
        entersubItemKindCode: '请输入项目子类别编号',
        entersubItemKindName: '请输入项目子类别名称',
        enterCode: '请输入编号',
        enterName: '请输入名称',
        component: {
            confirmDelete: '删除确认',
            textContent: '您即将删除群组:{{name}}，点击确认后将会删除此群组内容!',
            errorContent: '您即将删除异常项目:{{name}}，点击确认后将会删除此异常项目内容!',
            deleteOk: '删除',
            deleteCancel: '取消',
            groupNameEmpty: '透析室群组名称不可空白.',
            selopt: '--请选择--',
            opt1: '一般',
            opt2: 'B肝',
            opt3: 'C肝',
            opt4: 'B+C肝',
            opt5: 'HIV',
            opt6: '感染',
            opt7: '其他'
        }
    }, // end of ward

    // admin charge page charge.html
    charge: {
        pageTitle: '计价管理',
        select: '请选择透析室',
        totalRecord: '共 {{total}} 笔',
        addNew: '您可以按右下角新增按钮来新增计价资料',
        name: '品项',
        pcCode: '电脑代码',
        nowStock: '现在存量',
        safeStock: '安全存量',
        detailpageTitle: '计价管理 / {{chargename}} 计价资料',
        itemOverview: '物品概况',
        editbutton: '编辑',
        codes: '电脑代码',
        price: '价格',
        nowStocks: '存量',
        safeStocks: '安全存量',
        purchase: '进货',
        sales: '销货',
        returns: '退货',
        inventory: '盘点',
        use: '使用',
        useList: '使用纪录',
        purchaseDate: '进货时间 {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        salesDate: '销货时间 {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        returnsDate: '退货时间 {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        inventoryDate: '盘点时间 {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        useDate: '使用时间 {{ CreatedTime | moment:\'YYYY/MM/DD (dd) HH:mm:ss\' }}',
        user: '使用者 {{user}}',
        cnt: '数量({{unit}}) {{count}}',
        balance: '结余({{unit}}) {{count}}',
        dialopageTitle: '{{chargename}} 计价资料',
        ownWard: '所属透析室',
        chargeName: '名称',
        unit: '单位',
        orderBy: '排序',
        noticeMail: '通知Email(输入每一个Email请按Enter)',
        firmMail: '厂商Email(输入每一个Email请按Enter)',
        deletebutton: '删除',
        savebutton: '储存',
        dialopageTitle2: '{{title}} - {{action}}',
        behavior: '物品行为',
        actionQty: '{{action}}数量',
        nowStock2: '目前库存',
        safeStock2: '安全库存',
        afterStock2: '{{action }}后库存',
        lowStock: '存量过低!',
        errorStock: '操作后库存不可低于零!',
        recordTime: '纪录时间(以储存的时间为主)',
        memo: '备注',
        dialopageTitle3: '{{title}} - {{action}} 纪录单修改',
        qty1: '{{action}}前库存',
        qty2: '修改前{{action}}数量',
        qty3: '修改后{{action}}数量',
        qty4: '修改前库存',
        qty5: '修改后库存',
        component: {
            addtitle: '新增',
            edittitle: '编辑',
            operatingfailure: '操作失败, Email格式有误!',
            operatingfailureinput: '操作失败, 输入有误!',
            confirmDelete: '删除确认',
            textContent: '您即将删除{{name}}，点击确认后将会删除此计价项目!!',
            deleteOk: '删除',
            deleteCancel: '取消',
            DatasFailure: '不允许异动盘点时间之前的记录'
        }
    }, // end of charge

    // admin medicine page medicine.html
    medicine: {
        pageTitle: '药品管理',
        totalRecord: '共 {{total}} 笔',
        search: '搜寻药品',
        addNew: '您可以按右下角新增按钮来新增药品资料',
        NHICode: '健保码',
        code: '代码',
        detailpageTitle: '药品管理 / {{name}} 药品资料',
        detailpageTitleAdd: '药品管理 / 新增 药品资料',
        name: '药品名称',
        kind: '类别名称',
        custom: '自订类别',
        enterCustom: '请输入类别名称',
        codes: '代码',
        NHICodes: '健保码',
        qty: '数量(此数量于开药时,将自动带至每次数量栏)',
        qtyUnit: '数量单位',
        capacity: '容量',
        capacityUnit: '容量单位',
        dose: '剂量',
        doseUnit: '剂量单位',
        addStatistics: '加入统计表',
        statisticsOrder: '统计表顺序',
        isDangerMed: '高危险用药',
        memo: '备注',
        way: '途径(至少选一个)',
        method: '服法(频率)(至少选一个)',
        deletebutton: '删除',
        savebutton: '储存',
        component: {
            MedPO: 'PO - 口服',
            MedSC: 'SC - 皮下注射',
            MedSL: 'SL - 舌下含服',
            MedIV: 'IV - 静脉注射',
            MedIM: 'IM - 肌肉注射',
            MedIVD: 'IVD - 静脉添加',
            MedTOPI: 'TOPI - 局部涂擦',
            MedEXT: 'EXT - 外用',
            MedAC: 'AC - 饭前服用',
            MedPC: 'PC - 饭后服用',
            MedMeal: 'Meal - 餐中服用',
            MedQDPC: 'QDPC - 每日1次(餐后)',
            MedQN: 'QN - 每晚1次',
            MedQOD: 'QOD - 每隔1日1次',
            MedHS: 'HS - 每晚睡前半小時1次',
            MedTID: 'TID - 每日3次(早、午、晚)',
            MedTIDAC: 'TIDAC - 每日3餐半小時前',
            MedTIDPC: 'TIDPC - 每日3餐后',
            MedBID: 'BID - 每日2次(早上、晚上)',
            MedBIDAC: 'BIDAC - 每日早晚(用餐半小時前)',
            MedBIDPC: 'BIDPC - 每日早晚(餐后)',
            MedST: 'STAT - 立刻使用',
            MedQ2W: 'Q2W - 每2週1次',
            MedQID: 'QID - 每日4次',
            MedQD: 'QD - 每日1次(每日固定時间)',
            MedQW1: 'QW1 - 每周1次(星期一)',
            MedQW2: 'QW2 - 每周1次(星期二)',
            MedQW3: 'QW3 - 每周1次（星期三)',
            MedQW4: 'QW4 - 每周1次(星期四)',
            MedQW5: 'QW5 - 每周1次(星期五)',
            MedQW6: 'QW6 - 每周1次(星期六)',
            MedQW7: 'QW7 - 每周1次(星期日)',
            MedQW135: 'QW135 - 每周3次(一、三、五)',
            MedQW1357: 'QW1357 - 每周4次(一、三、五、日)',
            MedQW246: 'QW246 - 每周3次(二、四、六)',
            MedQW2467: 'QW2467 - 每周4次(二、四、六、日)',
            MedPRN: 'PRN - 需要時使用',
            MedTIW: 'TIW - 每周3次',
            MedBIW: 'BIW - 每周週2次',
            MedBIW15: 'BIW15 - 每周2次(一、五)',
            MedBIW26: 'BIW26 - 每周2次(二、六)',
            MedQW136: 'QW136 - 每周3次(一、三、六)',
            MedQW146: 'QW146 - 每周3次(一、四、六)',
            Qw: 'QW - 每周1次',
            message1: '途径与服法(频率)为必填, 请至少选一个',
            message2: '途径为必填, 请至少选一个',
            message3: '服法(频率)为必填, 请至少选一个',
            confirmDelete: '删除确认',
            textContent: '请问是否要删除此笔药品资料?',
            deleteOk: '刪除',
            deleteCancel: '取消'
        }
    }, // end of medicine

    // admin epo page epo.html
    epo: {
        pageTitle: '特殊医嘱',
        totalRecord: '共 {{total}} 笔',
        search: '搜寻特殊医嘱药品',
        addNew: '您可以按右下角新增按钮来新增特殊医嘱药品资料',
        NHICode: '健保码',
        internalCode: '院内码',
        detailpageTitle: '特殊医嘱 / {{name}} 药品资料',
        detailpageTitleAdd: '特殊医嘱 / 新增 药品资料',
        name: '药品名称',
        kind: '类别名称',
        long: '长效',
        short: '短效',
        NHICodes: '健保码',
        internalCodes: '院内码',
        qty: '数量',
        qtyUnit: '数量单位',
        dose: '剂量',
        doseUnit: '剂量单位',
        statisticsOrder: '统计表顺序',
        way: '途径',
        deletebutton: '删除',
        savebutton: '储存'
    }, // end of epo

    // admin assessment page assessment.html
    assessment: {
        pageTitle: '评估项目管理',
        totalRecord: '共 {{total}} 笔',
        subtitle1: '前评估',
        subtitle2: '透析中评估',
        subtitle3: '透析後评估',
        addNew: '您可以按右下角新增按钮来新增评估项目资料',
        detailpageTitle: '评估项目管理 / {{name}} 评估项目',
        detailpageTitleAdd: '评估项目管理 / 新增 评估项目',
        type: '评估类别',
        name: '项目名称',
        optionstitle: '选项',
        options: '选项 (每一行代表一个选项)',
        other: '是否包含其他',
        formShow: '是否显示于表单',
        recoverbutton: '复原',
        savebutton: '储存',
        deletebutton: '删除',
        component: {
            confirmDelete: '删除确认',
            textContent: '请问是否要删除此笔评估项目资料?',
            confirmTitle: '删除评估项目',
            deleteOk: '删除',
            deleteCancel: '取消'
        }
    }, // end of assessment

    // admin machineProperty page machineProperty.html
    property: {
        pageTitle: '财产管理',
        totalRecord: '共 {{total}} 笔',
        addNew: '您可以按右下角新增按钮来新增财产资料',
        showDelete: '显示已删除项目',
        detailpageTitle: '财产管理 / {{name}} 财产资料',
        detailpageTitleAdd: '财产管理 / 新增 财产资料',
        detailpageTitleDelete: '财产管理 / 己删除 {{name}} 财产资料',
        propertyNumber: '财产编号',
        brand: '透析机厂牌',
        model: '透析机型号',
        serialNumber: '透析机序号',
        bluetoothNumber: '蓝芽棒编号',
        pattern: '资料格式不正确',
        writebutton: '卡片写入',
        notNFC: '(无 NFC 或 NFC 未开启)',
        recoverbutton: '复原',
        deletebutton: '删除',
        savebutton: '储存',
        component: {
            confirmDelete: '删除确认',
            textContent: '请问是否要删除此笔财产资料?',
            deleteOk: '刪除',
            deleteCancel: '取消',
            writeCardMsg: '资料不齐全, 请确认"蓝芽棒编号"与"透析机厂牌"或"透析机型号"的正确性.',
            confirmWrite: '卡片写入提示',
            writeTitle: '卡片写入',
            textWriteContent: '卡片已有资料 {{data}} , 是否确定覆盖?',
            writeOk: '写入',
            writeCancel: '取消',
            writeSuccessfully: '卡片写入成功.',
            writeError: '卡片有误? 或请靠上卡片重写一次!'
        }
    }, // end of machineProperty

    // admin labexamItem page labexamItem.html
    labexamItem: {
        pageTitle: '检验检查项目',
        totalRecord: '共 {{total}} 笔',
        addNew: '您可以按右下角新增按钮来新增检验检查项目',
        detailpageTitle: '检验检查项目 / {{name}} 资料',
        detailpageTitleAdd: '检验检查项目 / 新增 资料',
        name: '名称',
        fullname: '全名',
        code: '代码',
        gender: '性别',
        unit: '单位',
        lowerLimit: '下限值',
        upperLimit: '上限值',
        deletebutton: '删除',
        savebutton: '储存',
        component: {
            confirmDelete: '删除确认',
            textContent: '请问是否要删除此笔检验检查项目资料?',
            confirmTitle: '删除检验检查项目',
            deleteOk: '删除',
            deleteCancel: '取消'
        }
    }, // end of labexamItem

    // admin custom page custom.html
    custom: {
        pageTitle: '自定义动作范本',
        nursingRecords: '系统-护理片语',
        messageNotification: '系统-通知',
        edit: '{{name}} 编辑',
        cont: '内容',
        template: '范本词汇',
        autoImport: '是否开启自动带入功能',
        savebutton: '储存',
        saveMessage: '请先选择片语项目',
        Dialysis_Start_Walk: '步行 - 量完透析前体重 (体重机开表专用)',
        Dialysis_Start_Wheelchair: '轮椅 - 量完透析前体重 (体重机开表专用)',
        Dialysis_FirstData: '输入第一笔透析机资料',
        Dialysis_After_BP: '量完透析后血压',
        Dialysis_After_Weight: '量完透析后体重',
        Dialysis_Closed: '关表',
        Dialysis_Executive_Medication: '执行用药',
        Dialysis_Neglect_Medication: '不执行用药',
        Dialysis_DoctorNote_Change: '病情摘要异动',
        Dialysis_Add_Order: '新增药品',
        Dialysis_Update_Order: '修改药品',
        Dialysis_Delete_Medication: '删除药品',
        HEADER_FIRST_DATE_YYYYMMDD: '表头第一笔透析机资料日期',
        HEADER_FIRST_DATE_MMDD: '表头第一笔透析机资料日期的月日',
        HEADER_FIRST_TIME_HHMM: '表头第一笔透析机资料时间',
        HEADER_LAST_DATE_YYYYMMDD: '表头最后一笔透析机资料日期',
        HEADER_LAST_DATE_MMDD: '表头最后一笔透析机资料日期的月日',
        HEADER_LAST_TIME_HHMM: '表头最后一笔透析机资料时间',
        HEADER_TARGET_TIME: '表头目标透析时间',
        HEADER_BF: '表头透析处方 BF',
        HEADER_START_BPS: '表头开始血压收缩压',
        HEADER_START_BPD: '表头开始血压舒张压',
        HEADER_END_BPS: '表头结束血压收缩压',
        HEADER_END_BPD: '表头结束血压舒张压',
        HEADER_DEHYDRATION_TARGET: '表头目标脱水量',
        HEADER_HEPARIN: '表头透析处方肝素',
        MEDICATION_ORDER_DATE_YYYYMMDD: '给药的预约日期',
        MEDICATION_ORDER_DATE_MMDD: '给药的预约日期的月日',
        MEDICATION_ORDER_DATE_HHMM: '给药的预约日期的时分',
        MEDICATION_EXECUTIVE_DATE_YYYYMMDD: '用药的执行日期',
        MEDICATION_EXECUTIVE_DATE_MMDD: '用药的执行日期的月日',
        MEDICATION_EXECUTIVE_TIME_HHMM: '用药的执行日期的时分',
        MEDICATION_NAME: '药品名称',
        MEDICATION_ROUTE: '用药途径',
        MEDICATION_FREQUENCY: '用药频率',
        MEDICATION_QUANITIY_UNIT: '用药单位',
        MEDICATION_QUANITIY: '用药数量',
        MEDICATION_MEMO: '执行用药备注',
        MEDICATION_CREATED_NAME: '给药建立人员',
        MEDICATION_MODIFIED_NAME: '给药修改人员',
        HEADER_DEHYDRATION: '表头实际脱水量',
        MACHINE_DATA_TOTAL_UF: '透析机资料Total UF',
        PATIENT_ENTRY_MODE: '入院方式',
        DOCTOR_CHANGE_CONTENT: '病情摘要异动内容',
        CHANGE_USER_NAME: '异动病情摘要人员名称',
        HEADER_SETTINGDEHYDRATION: '表头设定脱水量',
        HEADER_ENDWEIGHT: '表头结束体重',
        HEADER_BEFORE_WEIGHT: '表头透析前体重',
        BEFORE_DOCTOR_CONTENT: '修改前病情摘要',
        HEADER_DEVIATION: '偏差值'
    }, // end of custom

    // admin info page info.html
    info: {
        pageTitle: '参数设定',
        pairName: '{{name}} (每行代表一个项目)',
        prescription: '处方参数',
        catheter: '造管参数',
        custom: '其他参数',
        bloodSetting: '血品设定',
        dead: '死亡原因 (每行代表一个项目)',
        customs: '自订项目 (请下拉选择要维护的项目)',
        bloodSettings: '血品设定 (血品代码需与血袋血品条码一致)',
        bloodCode: '血品代码',
        bloodName: '血品名称',
        bloodCodes: '血品代码: {{key}}',
        bloodNames: '血品名称: {{value}}',
        recoverbutton: '复原',
        addbutton: '新增',
        deletebutton: '删除',
        savebutton: '储存',
        component: {
            anticoagulants: '抗凝剂',
            artificialKidneys: '人工肾脏',
            catheterHospitals: '造管医院',
            dialysateFlowRates: '透析液流速',
            dialysates: '透析液',
            frequencies: '频率',
            needleArteries: '针动脉',
            needleVeins: '针静脉',
            prescriptionModes: '处方Mode',
            routes: '管路',
            shifts: '排班班别',
            shiftGroups: '排班组别',
            bloodCollection: '采血品项',
            confirmDelete: '删除确认',
            textContent: '您即将删除血品设定:{{bloodName}}，点击确认后将会删除此血品设定项目!',
            deleteOk: '删除',
            deleteCancel: '取消',
            recoverSuccess: '复原成功!',
            EndHollowFiber: '结束 Hollow Fiber',
            EndChamber: '结束 Chamber'
        }
    }, // end of info

    // admin statistic page statistic.html
    statistic: {
        pageTitle: '透析人次',
        startDate: '开始日期',
        endDate: '结束日期',
        label: '血液透析纪录单笔数'
    }, // end of statistic

    // admin log page log.html
    log: {
        pageTitle: 'Log纪录',
        search: '依照使用者搜尋Log紀錄',
        search1: '依照病人搜寻Log纪录',
        date: '日期',
        Sdate: '開始日期',
        Edate: '結束日期',
        sendmail: '发送邮件',
        get: '查询',
        post: '新增',
        put: '修改',
        delete: '刪除',
        resultList: '时间：{{CreatedDateTime | date : \'yyyy/MM/dd HH:mm:ss\'}} ， 使用者：{{user}} ， 来源：{{functionType}}',
        addlabel: '新增',
        updlabel: '修改',
        dellabel: '删除',
        unchangelabel: '未变动',
        detail: '详细资料',
        orldata: '原始资料',
        updatedata: '修改后资料'
    }, // end of log

    // admin contract page contract.html
    contract: {
        pageTitle: '合约纪录',
        totalRecord: '共 {{total}} 笔',
        detailpageTitle: '合约纪录 / {{name}} 资料',
        number: '合约编号',
        name: '合约名称',
        range: '授权起迄',
        state: '合约状态',
        billingMethod: '计费方式',
        usage: '用量',
        rent: '月租',
        invoice: '公司抬头',
        companyId: '统一编号',
        person: '负责人',
        phone: '联络电话',
        address: '帐单地址',
        start: '授权起始日',
        end: '授权结束日',
        startend: '授权起迄',
        price: '价格'
}, // end of contract

    // admin payment page payment.html
    payment: {
        pageTitle: '帐单纪录',
        totalRecord: '共 {{total}} 笔',
        detailpageTitle: '帐单纪录 / {{name}} 资料',
        name: '帐单名称',
        range: '计价起迄',
        state: '帐单状态',
        pricingMethod: '计费方式',
        usage: '用量',
        rent: '月租',
        price: '单价',
        quantity: '数量',
        discount: '折扣金额',
        totalAmount: '总金额',
        invoiceNumber: '发票编号',
        postingDate: '入帐日期',
        start: '计价起日',
        end: '计价迄日',
        startend: '计价起迄'
    }, // end of payment

    // admin kidit page kidit.html
    kidit: {
        pageTitle: 'KiDiT作业',
        desc: '汇出的档案由 Excel 开启时，仅可浏览，不可有存档的动作，会导致资料失真。例如病历码为 "0001234"，由 Excel 存档后，会变成 "1234"。',
        function1: '透析纪录统计表',
        startDate: '开始日期',
        endDate: '结束日期',
        outputFormat: '汇出 CSV 档',
        outputDesc: '汇出说明:',
        desc1: '1. 依日期区间取得有透析病人的透析记录。例如:有一个病人为星期一、三、五来透析，汇出透析日期为 10/1(一) ~ 10/5(五)，这个病人就会有 3 笔的透析记录资料。',
        function2: '处方资料汇出',
        desc2: '设定开立处方日期',
        desc3: '1. 依日期区间取得有透析病人的最新处方。',
        desc4: '2. 设定开立处方日期，若无勾选则会依病人处方实际开立日。',
        desc5: '3. 每一个病人只会抓取一笔处方，例如:有一个病人为星期一、三、五来透析，汇出处方日期为 10/3(一) ~ 10/5(五)，这个病人会有 3 笔的透析记录，但处方会抓取 10/5(五) 的资料。',
        function3: '病人资料汇出',
        desc6: '1. 取出所有透析的病人资料',
        function4: '病人资料汇入',
        select: '请选择透析室',
        desc7: '1. 请确认内容为 KiDiT 格式。',
        desc8: '2. 档案第一列为标题列，并不会做汇入。',
        desc9: '3. 病历码或身份证其一会必填。',
        desc10: '4. 新增病人，优先以病历码，再来是身份证，当二个都不存在则新增。',
        desc11: '5. 修改病人资料，当栏位内容有值的，才会异动，若为空白，则会保留原始资料。',
        desc12: '6. 系统会异动的基本资料有:姓名、病人类别、生日、身份证号、性别、电话、病历号、地址、血型、状态、首次治疗日期、透析室。',
        importFormat: '资料上传',
        inputDesc: '汇入说明:',
        function5: '处方资料汇入',
        patientCode: '病人',
        IdentId: '身份证号',
        Frequency: '频率',
        ModeName: '透析方式',
        result: '结果',
        desc13: '1. 请确认内容为 KiDiT 格式。',
        desc14: '2. 病历码或身份证其一为必填。',
        desc15: '3. 系统会异动的基本资料有:处方日期、透析方式、血液流速、透析液流速、每周次数、每次透析时间、抗凝剂、初剂量、维持剂量、透析机型号、钙离子浓度、钾离子浓度。',
        desc16: '4. 资料上传按钮在资料上方，看完资料确认无误后请执行"资料上传"按钮才算完成汇入功能。',
        desc20: '汇入档案第一列包含标题列',
        function6: '造管资料汇入',
        desc17: '3. 系统会异动的基本资料有:造管类别, 方向, 造管位置, 本季第一次透析日期, 是否使用远红外线治疗, 每周几次, 平均每周总治疗时间, 是否使用其他热治疗法, 治疗方法, 平均每周总治疗时间。',
        SeasonVesselDate: '本季首次透析日',
        CatheterType: '造管类别',
        function7: '造管资料汇出',
        function9: '检验检查汇出',
        desc18: '1. 依日期区间取得病患的造管资料',
        desc19: '1. 依日期区间取得病患的检验检查资料'
    }, // end of kidit

    // admin medicationExport page medicationExport.html
    medicationExport: {
        pageTitle: '开药记录 汇出',
        startDate: '开始日期',
        endDate: '结束日期',
        kind: '类别',
        showDelete: '显示己删除用药',
        exportbutton: '汇出 CSV 档'
    }, // end of medicationExport

    // admin labexamImport page labexamImport.html
    labexamImport: {
        pageTitle: '检验检查 汇入',
        inputDesc: '汇入说明:',
        desc1: '1. 请确认内容格式且编码为UTF-8。',
        desc2: '2. 档案第一列为标题列，并不会做汇入。',
        desc3: '3. 前三栏为固定栏位，依序为:身份证号、病历号、检验日期，接下来是各个检验项目。',
        desc4: '4. 身份证号或病历码其一为必填。',
        desc5: '5. 修改检验结果，当栏位内容有值的，才会异动，若为空白，则会保留原始资料。',
        desc6: '6. 资料上传按钮在画面最下方，看完资料确认无误后请执行"资料上传"按钮才算完成汇入功能。',
        desc7: '7. 范例档案',
        download: '下载',
        patientCode: '病历号',
        labexamItem: '检验项目',
        labexamResult: '检验结果',
        unit: '单位',
        result: '结果',
        importbutton: '资料上传',
        idnumber: '身份证号',
        labexamdate: '检验日期'
    }, // end of labexamImport

    // admin medicationImport page medicationImport.html
    medicationImport: {
        pageTitle: '药品资料 汇入',
        inputDesc: '汇入说明:',
        desc1: '1. 请确认内容格式且编码为UTF-8。',
        desc2: '2. 档案第一列为标题列，并不会做汇入。',
        desc3: '3. 汇入栏位，依序为:药品名称、代码、数量、类别名称、健保码、数量单位、容量、容量单位、剂量、剂量单位、加入统计表、途径、服法(频率)。',
        desc4: '4. 其中药品名称、代码、数量、途径、服法(频率)必须有值。途径、服法(频率)内容用“&”符号区隔。',
        desc5: '5. 药品名称与代码相同时视为资料重覆，资料重覆时，将以汇入的资料覆盖其他栏位。',
        desc6: '6. 资料上传按钮在画面最下方，看完资料确认无误后请执行"资料上传"按钮才算完成汇入功能。',
        desc7: '7. 范例档案',
        download: '下载',
        required: '(红色为必备栏)',
        name: '药品名称',
        code: '代码',
        kind: '类别',
        qty: '数量',
        press: '处理',
        importbutton: '资料上传',
        excel: {
            name: '药品名称',
            codes: '代码',
            qty: '数量',
            kind: '类别名称',
            NHICodes: '健保码',
            qtyUnit: '数量单位',
            capacity: '容量',
            capacityUnit: '容量单位',
            dose: '剂量',
            doseUnit: '剂量单位',
            addStatistics: '加入统计表',
            way: '途径',
            method: '服法(频率)'
            }
    }, // end of medicationImport

    // admin machinePropertyImport page machinePropertyImport.html
    machinePropertyImport: {
        pageTitle: '财产资料 汇入',
        inputDesc: '汇入说明:',
        desc1: '1. 请确认内容格式且编码为UTF-8。',
        desc2: '2. 档案第一列为标题列，并不会做汇入。',
        desc3: '3. 汇入栏位，依序为:财产编号、透析机厂牌、透析机型号、透析机序号、蓝芽棒编号、Memo。',
        desc4: '4. 其中财产编号必须有值。蓝芽棒编号不允许重覆。',
        desc5: '5. 财产编号相同时视为资料重覆，资料重覆时，将以汇入的资料覆盖其他栏位。',
        desc6: '6. 资料上传按钮在画面最下方，看完资料确认无误后请执行"资料上传"按钮才算完成汇入功能。',
        desc7: '7. 范例档案',
        download: '下载',
        required: '(红色为必备栏)',
        propertyNumber: '财产编号',
        brand: '透析机厂牌',
        model: '透析机型号',
        bluetoothNumber: '蓝芽棒编号',
        result: '结果',
        importbutton: '资料上传',
        excel: {
            propertyNumber: '财产编号',
            bluetoothNumber: '蓝芽棒编号',
            brand: '透析机厂牌',
            model: '透析机型号',
            serialNumber: '透析机序号'
        }
    } // end of machinePropertyImport

}; // end of translation

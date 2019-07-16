angular.module('app').config([
  '$urlRouterProvider',
  'stateHelperProvider',
  (
    $urlRouterProvider,
    stateHelperProvider
  ) => {
    stateHelperProvider.state({
      parent: 'summary',
      name: 'prescribingRecord',
      url: '/prescribingRecord/:listDate',
      params: {
        listDate: {
          value: moment().format('YYYY-MM-DD'),
          squash: '~'
        }
      },
      component: 'prescribingRecord'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'prescribingDetail',
      url: '/prescribingDetail/:medId/:prescribingId',
      component: 'prescribingDetail'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'medicineRecord',
      url: '/medicineRecord',
      component: 'medicineRecord'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'lastMonthPrescribing',
      url: '/lastMonthPrescribing/:setDate',
      component: 'lastMonthPrescribing'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'summary',
      name: 'customMedicine',
      url: '/customMedicine/:prescribingId',
      component: 'customMedicine'
    }, {
      keepOriginalNames: true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdPrescribingRecord',
      url: '/prescribingRecord/:listDate',
      params: {
        listDate: {
          value: moment().format('YYYY-MM-DD'),
          squash: '~'
        }
      },
      component: 'prescribingRecord'
    }, {
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdPrescribingDetail',
      url: '/prescribingDetail/:medId/:prescribingId',
      component: 'prescribingDetail'
    }, {
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdMedicineRecord',
      url: '/medicineRecord',
      component: 'medicineRecord'
    }, {
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdLastMonthPrescribing',
      url: '/lastMonthPrescribing/:setDate',
      component: 'lastMonthPrescribing'
    }, {
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'pdCustomMedicine',
      url: '/customMedicine/:prescribingId',
      component: 'customMedicine'
    },{
      keepOriginalNames:true
    }).state({
      parent: 'peritonealDialysisTabView',
      name: 'checkWholeMedicine',
      url: '/checkWholeMedicine',
      component: 'checkWholeMedicine'
    },{
      keepOriginalNames:true
    });
  }
]);

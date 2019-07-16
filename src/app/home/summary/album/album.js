// import fs from 'fs';
import album from './album.html';
import photoList from './photoList.html';
import albumList from './albumList.html';
import phtotShow from './showPhoto.html';

angular
    .module('app')
    .component('album', {
        template: album,
        controller: albumCtrl
    })
    .component('photoList', {
        template: photoList,
        controller: photoListCtrl
    })
    .component('albumList', {
        template: albumList,
        controller: albumListCtrl
    });


albumCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    '$mdToast',
    'SettingService',
    'PatientService',
    '$mdMedia',
    'showMessage',
    '$interval',
    '$sessionStorage',
    '$timeout',
    'Upload',
    'AlbumService',
    '$q',
    '$filter'
];

photoListCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    '$mdToast',
    'SettingService',
    'PatientService',
    '$mdMedia',
    'showMessage',
    '$interval',
    '$sessionStorage',
    '$timeout',
    '$http',
    'AlbumService',
    '$filter'
];

albumListCtrl.$inject = [
    '$window',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$rootScope',
    '$mdToast',
    'SettingService',
    'PatientService',
    '$mdMedia',
    'showMessage',
    '$interval',
    '$sessionStorage',
    '$timeout',
    '$http',
    '$filter',
    'AlbumService'
];

function albumCtrl($window, $state, $stateParams, $mdDialog, $rootScope, $mdToast, SettingService,
    PatientService, $mdMedia, showMessage, $interval, $sessionStorage, $timeout, Upload, AlbumService, $q,
    $filter) {
    const self = this;
    let $translate = $filter('translate');

    self.user = SettingService.getCurrentUser();
    // 預設狀態
    self.loading = true;
    self.lastAccessTime = moment();
    self.isFabOpen = false;
    // 辨識環境
    self.device = cordova.platformId === 'browser';
    // get by picture
    document.addEventListener('add_photo', self.openCamera);
    // 辨識系統別: HD/PD
    self.stateName = $state.current.name;

    let pictureSource;  // 设定图片来源
    let destinationType; // 选择返回数据的格式

    if (!self.device) {
        document.addEventListener('deviceready', onDeviceReady, false);
    }

    // Cordova准备好了可以使用了
    function onDeviceReady() {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }

    // 初始化
    self.$onInit = () => {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                self.loading = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });

        switch ($state.current.name) {
            case 'photoList':  // 相片排序
            case 'pdPhotoList':
                self.selectedIndex = 0;
                break;
            case 'albumList':   // 相簿排序
            case 'pdAlbumList':
                self.selectedIndex = 1;
                break;
            default:
                break;
        }
    };


    let previousSelectedIndex;
    self.$doCheck = function () {
        let currentSelectedIndex = self.selectedIndex && self.selectedIndex.valueOf();
        if (previousSelectedIndex !== currentSelectedIndex) {

            switch (currentSelectedIndex) {
                case 0:
                    if ($state.current.name.substr(0, 2) === "pd") {
                        self.goto('pdPhotoList');
                    } else {
                        self.goto('photoList');
                    }
                    break;
                case 1:
                    if ($state.current.name.substr(0, 2) === "pd") {
                        self.goto('pdAlbumList');
                    } else {
                        self.goto('albumList');
                    }
                    break;
                default:
                    break;
            }
            previousSelectedIndex = currentSelectedIndex;
        }
    };

    self.goto = function goto(routeName) {
        $state.go(routeName, { patientId: $stateParams.patientId }, { location: 'replace' });
    };

    function onLoadImageFail(message) {
        showMessage($translate('album.album.photofailed') + message, null, $translate('album.album.caveat'));
    }


    function onLoadImageSussess(obj) {
        Upload.urlToBlob(obj).then(
            (blob) => {
                self.Photo = blob;
                imageUpload(blob);
            }
        );
    }


    self.openDocument = (obj) => {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.SAVEDPHOTOALBUM
            });
        } else {
            imageUpload(obj);
        }
    };

    // 這是暫時解決在 android 和 web 上傳的問題
    // ios 要另外處理 clear 暫存
    self.openCamera = () => {
        if (!self.device) {
            navigator.camera.getPicture(onLoadImageSussess, onLoadImageFail, {
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.CAMERA
            });
        }
    };

    let imageUpload = (obj = null) => {
        if (self.Photo) {
            self.loading = true;
            let photoSrc = [];

            let size = {
                width: '200',
                height: '200'
            };
            // 依照比例縮小圖
            Upload.imageDimensions(self.Photo).then(
                (f) => {
                    let fSize = {};
                    // 第一個條件 當圖片有一邊大於 1000
                    if ((f.width > 1000 || f.height > 1000)) {
                        if (f.width > f.height) {
                            fSize = {
                                width: '1000'
                            };
                        } else {
                            fSize = {
                                height: '1000'
                            };
                        }
                    } else {
                        fSize = {
                            width: Math.round(f.width),
                            height: Math.round(f.height)
                        };
                    }
                    // 需求 要有 200px * 200px 的小圖
                    if (f.width > 200 && f.height > 200) {
                        Upload.resize(self.Photo, size).then((minFile) => {
                            photoSrc.push(minFile);
                        });
                    }
                    return Upload.resize(self.Photo, fSize);
                }
            ).then((resizeFile) => {
                // 大圖
                photoSrc.push(resizeFile);

                return Upload.base64DataUrl(photoSrc);

            }).then(
                (x) => {
                    self.loading = false;
                    self.addAlbum(x);
                }, (e) => {
                    self.loading = false;
                }
            );
        }
    };

    // 照片上傳
    self.addAlbum = function addAlbum(src) {
        $mdDialog.show({
            locals: {
                item: src
            },
            controller: [
                '$mdDialog',
                'item',
                DialogController
            ],
            template: phtotShow,
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: false,
            bindToController: true,
            fullscreen: true,
            controllerAs: 'vm'
        });

        function DialogController(mdDialog, item) {
            const vm = this;
            vm.showAddNewAlbum = false;
            vm.data = {};
            vm.other = $translate('album.album.otherAlbum');
            vm.title = $translate('album.album.addPicture');
            vm.loading = true;
            vm.innerWidth = Math.round($window.innerWidth * 0.8);

            // 原始圖片低於 200 * 200 原始圖和縮圖是同一張
            vm.pictureSrc = item.length === 1 ? item[0] : item[1];

            if (!vm.pictureSrc) {
                showMessage($translate('album.album.errorPicture'));
                vm.loading = false;
                mdDialog.hide();
            } else {
                AlbumService.getAlbumByPatientId($stateParams.patientId).then((q) => {
                    vm.defaultGroup = [];
                    if (q.data.length > 0) {
                        q.data.forEach((x, index) => {
                            vm.defaultGroup.push({ AlbumName: x.AlbumName, AlbumId: index });
                        });
                    }
                    vm.defaultGroup.push({ AlbumName: $translate('album.album.otherAlbum'), AlbumId: null });
                    vm.loading = false;
                }, () => {
                    vm.loading = false;
                });
            }

            // 新增相簿
            vm.addNewAlbum = () => {
                console.log('點擊 新增相簿');
                if (vm.showAddNewAlbum) {
                    // 新增相簿
                    vm.showAddNewAlbum = false;
                } else {
                    // 取消新增相簿
                    vm.showAddNewAlbum = true;
                }
            };

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                let obj = {};
                obj.PatientId = $stateParams.patientId;
                // obj.CreatedTime = new Date();
                obj.Base64File = item.length === 1 ? item[0].split(',')[1] : item[1].split(',')[1];
                obj.Base64ThumbnailFile = item[0].split(',')[1];

                // 選擇相簿
                let selectArray = vm.defaultGroup.filter(x => x.AlbumName === vm.data.AlbumName);
                // 當相簿名稱為未知相簿，(自己KEY的)
                if (vm.showAddNewAlbum && vm.newAlbum) {
                    vm.data.AlbumName = vm.newAlbum;
                    delete vm.data.AlbumId;
                    console.log('修改完相片 新增相簿', vm.data);
                } else if (!vm.showAddNewAlbum && selectArray.length > 0) {
                    vm.data = Object.assign({}, vm.data, selectArray[0]);
                    console.log('修改完相片 選相簿', vm.data);
                } else {
                    // 清空：AlbumName, AlbumId
                    delete vm.data.AlbumName;
                    delete vm.data.AlbumId;
                    console.log('修改完相片 雙無', vm.data);
                }

                console.log('修改完相片 selectArray：', selectArray);

                // if (vm.newAlbum) {
                //     vm.data.AlbumName = vm.newAlbum;
                // }

                // if (!vm.data.AlbumName) {
                //     vm.data.AlbumName = '未分類';
                // }
                let o = Object.assign({}, obj, vm.data);

                AlbumService.post(o).then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('album.album.createOk'));
                        $rootScope.$emit('albumData', AlbumService.photoData());
                    }
                });

                mdDialog.hide();
            };
        }
    };

    self.refresh = function refresh() {
        $rootScope.$emit('refresh');
    };


    self.back = function back() {
        self.selectedIndex = null;
        $window.history.go(-1);
    };

    self.$onDestroy = function $onDestroy() {
        document.removeEventListener('add_photo', self.openCamera);

        if (!self.device) {
            document.removeEventListener('deviceready', onDeviceReady, false);
        }
    };


}

function photoListCtrl($window, $state, $stateParams, $mdDialog, $rootScope, $mdToast, SettingService,
    PatientService, $mdMedia, showMessage, $interval, $sessionStorage, $timeout, $http,
    AlbumService, $filter) {
    const self = this;
    let $translate = $filter('translate');

    self.Url = SettingService.getServerUrl();
    self.user = SettingService.getCurrentUser();
    self.patientId = $stateParams.patientId;
    // 預設狀態
    self.loading = true;
    self.lastAccessTime = moment();
    // 勾選狀態
    self.delPhoto = [];         // 實際刪除筆數
    let page = 1;
    let maxpage = 0;
    let limit = 50;

    // 初始化
    self.$onInit = () => {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                infinite();
                // self.nextPage();
                self.loading = false;
                self.isError = false;
            }, () => {
                self.loading = false;
                self.isError = true;
            });
    };

    // InfiniteScroll
    let infinite = (boolean = true) => {
        self.albums = [];
        AlbumService.getByPatientId($stateParams.patientId, page, limit, boolean).then((q) => {
            console.log('相片 infinite', q);
            maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
            if (q.data.Total % limit === 0) {
                maxpage -= 1;
            }
            console.log(maxpage);
            if (q.data.Total > 0) {
                self.serviceData = q.data.Results;
                $rootScope.$emit('albumData', self.serviceData);
            } else {
                self.serviceData = null;
            }
            self.lastAccessTime = AlbumService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        page = 1;

        self.serviceData = null;

        self.loading = true;

        infinite();
    };

    // 接收此頁面的 refresh
    let refresh = $rootScope.$on('refresh', (idt, boolean = true) => {
        if (boolean) {
            // upload 結束
            self.refresh();
        } else {
            // 有圖片 upload 開始
            self.loading = !boolean;
        }
    });

    // clear listeners
    self.$onDestroy = function $onDestroy() {
        $rootScope.$$listeners.refresh = [];
        $rootScope.$$listeners.albumData = [];
    };

    // 狀態
    $rootScope.$on('albumData', (evt, data) => {
        self.serviceData = data;
        // 依照時間排序，先找修改時間，後找新增時間
        self.albums = _.chain(data)
            .sort((a, b) => {
                if (a.ModifiedTime) {
                    a.CreatedTime = a.ModifiedTime;
                } else if (b.ModifiedTime) {
                    b.CreatedTime = b.ModifiedTime;
                }
                if (a.CreatedTime < b.CreatedTime) return 1;
                return -1;
            })
            .groupBy((x) => {
                if (x.ModifiedTime) {
                    return moment(x.ModifiedTime).format('YYYY-MM-DD');
                }
                return moment(x.CreatedTime).format('YYYY-MM-DD');
            })
            .mapValues((val, key) => {
                return {
                    time: key,      // 時間
                    items: val.map((x) => {
                        let o = Object.assign({}, x);
                        o.selected = false;     // 單一照片選擇
                        return o;
                    }),
                    selected: false     // 選擇時間區間照片
                };
            }).value();
        console.log(self.albums);
    });


    // 讀取照片
    self.nextPage = () => {
        if (self.loading) {
            return;
        }
        self.loading = true;
        page += 1;
        if (page > maxpage) {
            self.loading = false;
            return;
        }
        AlbumService.getByPatientId($stateParams.patientId, page, limit).then((q) => {
            if (q.data.Total > 0) {
                self.serviceData = q.data.Results;
                $rootScope.$emit('albumData', self.serviceData);
            } else {
                self.serviceData = null;
            }
            self.lastAccessTime = AlbumService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // 單選照片，和計算勾選數目， 用Id 判斷
    self.checkPictureBox = (event, array) => {
        if (event.currentTarget.checked) {
            self.delPhoto.push(array.Id);
        } else {

            let index = self.delPhoto.indexOf(array.Id);

            if (index > -1) {
                self.delPhoto.splice(index, 1);
            }
        }

        array.selected = event.currentTarget.checked;
    };
    // 選取時間，多選照片，用Id 判斷
    self.checkTimeGroup = (event, array) => {
        // 勾選判斷
        self.albums[array.time].items.filter(x => x.Status !== 'Deleted').forEach((v) => {
            v.selected = event.currentTarget.checked;
            if (v.selected) {
                self.delPhoto.push(v.Id);
            } else {
                let index = self.delPhoto.indexOf(v.Id);

                if (index > -1 && !v.selected) {
                    self.delPhoto.splice(index, 1);
                }
            }
        });

        // 過濾重複勾選
        let x = self.delPhoto.reduce((a, b) => {
            if (a.indexOf(b) < 0) {
                a.push(b);
            }
            return a;
        }, []);

        self.delPhoto = x;
    };
    // get picture
    self.getPicture = (event, Id) => {
        $mdDialog.show({
            locals: {
                photo: Id
            },
            controller: [
                '$mdDialog',
                'photo',
                PictureController
            ],
            template: phtotShow, // 'getPicture.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function PictureController(mdDialog, photo) {
            const vm = this;
            console.log('dialog 測試 photo', photo);
            vm.showAddNewAlbum = false;
            vm.title = $translate('album.album.modifyPicture');
            vm.other = $translate('album.album.otherAlbum');
            vm.data = photo;
            vm.loading = true;
            vm.innerWidth = Math.round($window.innerWidth * 0.8);
            vm.pictureSrc = `${SettingService.getServerUrl()}/Upload/GetImage/${vm.data.FileName}`;

            AlbumService.getAlbumByPatientId($stateParams.patientId).then((q) => {
                vm.defaultGroup = [];
                vm.defaultGroup.push({ AlbumName: null, AlbumId: null });
                if (q.data.length > 0) {
                    q.data.forEach((x, index) => {
                        vm.defaultGroup.push({ AlbumName: x.AlbumName, AlbumId: x.Id });
                    });
                }
                // vm.defaultGroup.push({AlbumName: $translate('album.album.otherAlbum'), AlbumId: null });
                // vm.defaultGroup.push({ AlbumName: '不選擇', AlbumId: null });
                vm.loading = false;
            }, () => {
                vm.loading = false;
            });

            // 新增相簿
            vm.addNewAlbum = () => {
                console.log('點擊 新增相簿');
                if (vm.showAddNewAlbum) {
                    // 新增相簿
                    vm.showAddNewAlbum = false;
                } else {
                    // 取消新增相簿
                    vm.showAddNewAlbum = true;
                }
            };

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                // 選擇相簿
                let selectArray = vm.defaultGroup.filter(x => x.AlbumName === vm.data.AlbumName);
                // 當相簿名稱為未知相簿，(自己KEY的)
                if (vm.showAddNewAlbum && vm.newAlbum) {
                    vm.data.AlbumName = vm.newAlbum;
                    delete vm.data.AlbumId;
                    console.log('修改完相片 新增相簿', vm.data);
                } else if (!vm.showAddNewAlbum && selectArray.length > 0) {
                    vm.data = Object.assign({}, vm.data, selectArray[0]);
                    console.log('修改完相片 選相簿', vm.data);
                } else {
                    // 清空：AlbumName, AlbumId
                    delete vm.data.AlbumName;
                    delete vm.data.AlbumId;
                    console.log('修改完相片 雙無', vm.data);
                }

                console.log('修改完相片 selectArray：', selectArray);

                // // 當相簿名稱為未知相簿，(自己KEY的)
                // if (vm.newAlbum) {
                //     vm.data.AlbumName = vm.newAlbum;
                //     delete vm.data.AlbumId;
                // }
                // // if (selectArray.length === 0) {
                // //     delete vm.data.AlbumId;
                // // }

                // vm.data = Object.assign({}, vm.data, selectArray[0]);

                console.log('修改完相片 vm.data：', vm.data);

                AlbumService.put(vm.data).then((res) => {
                    if (res.status === 200) {
                        showMessage($translate('album.album.modifyOk'));
                        $rootScope.$emit('albumData', AlbumService.photoData());
                    }
                });

                mdDialog.hide();
            };
        }

    };

    self.delPicture = (event) => {
        $mdDialog.show({
            controller: [
                '$mdDialog',
                DelController
            ],
            templateUrl: 'delPicture.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DelController(mdDialog) {
            const vm = this;
            vm.photo = self.delPhoto;
            vm.Piclength = self.delPhoto.length;

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            vm.ok = function ok() {
                // 刪除照片 API
                AlbumService.updateStatus('Deleted', self.delPhoto).then((res) => {
                    if (res.status === 200) {
                        //  add 拿掉刪除畫面上的照片
                        for (let i = 0; i < self.serviceData.length; i += 1) {
                            let index = res.data.findIndex(x => x.Id === self.serviceData[i].Id);

                            if (index > -1) {
                                self.serviceData[i].Status = 'Deleted';
                            }
                        }
                        $rootScope.$emit('albumData', self.serviceData);
                        // 刪除完後，選擇筆數歸 0
                        self.selectPhoto = 0;
                        self.delPhoto = [];

                    }
                });

                mdDialog.hide();
            };
        }
    };

}


function albumListCtrl($window, $state, $stateParams, $mdDialog, $rootScope, $mdToast, SettingService,
    PatientService, $mdMedia, showMessage, $interval, $sessionStorage, $timeout, $http, $filter,
    AlbumService) {
    const self = this;

    let $translate = $filter('translate');

    self.Url = SettingService.getServerUrl();
    self.user = SettingService.getCurrentUser();
    self.patientId = $stateParams.patientId;

    // 預設狀態
    self.loading = true;
    self.lastAccessTime = moment();
    self.serviceData = [];          // 所有未刪除相片

    self.delPhoto = [];         // 相片選項
    self.delAlbum = [];     // 相簿選項

    // 預設狀態
    self.loading = true;
    self.lastAccessTime = moment();
    let firstLoading = () => {
        self.albums = [];

        AlbumService.getAlbumList($stateParams.patientId, 4, true).then((p) => {
            console.log('相簿 infinite', p);
            // $rootScope.$emit('albumData', p.data);
            if (p.data.length > 0) {
                self.serviceData = p.data;
            } else {
                self.serviceData = null;
            }
            self.lastAccessTime = AlbumService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });

    };

    // 使用者按右上角重整按鈕時
    self.refresh = function refresh() {
        self.serviceData = null;

        self.loading = true;

        firstLoading();
    };

    // 接收此頁面的 refresh
    let refresh = $rootScope.$on('refresh', (idt, boolean = true) => {
        if (boolean) {
            // upload 結束
            self.refresh();
        } else {
            // 有圖片 upload 開始
            self.loading = !boolean;
        }
    });

    // clear listeners
    self.$onDestroy = function $onDestroy() {
        $rootScope.$$listeners.refresh = [];
    };

    // 狀態，如果發現照片有狀態更新
    $rootScope.$on('albumData', (evt, data) => {
        if (data) {
            firstLoading();
        }
    });

    // 太慢
    // let infinite = () => {
    //     self.albums = [];
    //     AlbumService.getByPatientId($stateParams.patientId, page, limit, true).then((q) => {
    //         maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
    //         if (q.data.Total % limit === 0) {
    //             maxpage -= 1;
    //         }
    //         // console.log(maxpage);
    //         if (q.data.Total > 0) {
    //             $rootScope.$emit('albumData', q.data.Results);
    //         } else {
    //             self.serviceData = null;
    //         }
    //         AlbumService.getTrashByPatientId($stateParams.patientId, page, limit, true).then((q) => {
    //             if (q.data.Total > 0) {
    //                 self.trashData = q.data.Results;
    //                 console.log(self.trashData);
    //             } else {
    //                 // self.trashData = null;
    //             }
    //             self.lastAccessTime = AlbumService.getLastAccessTime();
    //             self.loading = false;
    //             self.isError = false; // 顯示伺服器連接失敗的訊息
    //         }, () => {
    //             self.loading = false;
    //             self.isError = true;
    //         });
    //     }, () => {
    //         self.loading = false;
    //         self.isError = true;
    //     });
    // };

    // 測試
    // let test = data.sort((a, b) => {
    //     if (a.CreatedTime < b.CreatedTime) return 1;
    //     return -1;
    // }).reduce((r, e, i) => {
    //     if (!r[e.AlbumName]) r[e.AlbumName] = {};
    //     r[e.AlbumName].album = e.AlbumName;
    //     r[e.AlbumName][i + 1] = e;
    //     return r;
    // }, {});
    // 相簿 或 相片 status
    // $rootScope.$on('albumData', (evt, data) => {
    //     self.serviceData = data;
    //     console.log(data);
    //     // 刪除完後，選擇筆數歸 0
    //     self.delPhoto = [];
    //     self.delAlbum = [];
    // });


    // 初始化
    self.$onInit = () => {
        PatientService
            .getById($stateParams.patientId)
            .then((d) => {
                self.patient = d.data;
                firstLoading();
            }, () => {
                self.loading = false;
                self.isError = true;
            });
    };
    // 重整照片
    let refesh = () => {
        AlbumService.getAlbumList($stateParams.patientId, 4, false).then((p) => {
            if (p.data.length > 0) {
                self.serviceData = p.data;
            } else {
                self.serviceData = null;
            }
            self.lastAccessTime = AlbumService.getLastAccessTime();
            self.loading = false;
            self.isError = false; // 顯示伺服器連接失敗的訊息
        }, () => {
            self.loading = false;
            self.isError = true;
        });
    };

    // 選取相簿，多選相簿
    self.checkAlbumGroup = (event, array) => {
        if (event.currentTarget.checked) {
            self.delAlbum.push(array.Id);
        } else {
            let vindex = self.delAlbum.indexOf(array.Id);

            if (vindex > -1) {
                self.delAlbum.splice(vindex, 1);
            }
        }
    };
    // 刪除相簿
    self.delAlbumFn = (event) => {
        $mdDialog.show({
            controller: [
                '$mdDialog',
                DelController
            ],
            templateUrl: 'delAlbum.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: false,
            controllerAs: 'vm'
        });

        function DelController(mdDialog) {
            const vm = this;
            vm.photo = self.delPhoto;
            vm.Piclength = self.delAlbum.length;

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };

            // 先將選取的相簿相片全部狀況改為Deleted，再將相簿刪除即可
            vm.ok = function ok() {
                let array = [];
                let delAlbumArray = self.delAlbum;

                // 刪除相簿
                AlbumService.delAlbum(delAlbumArray).then((res) => {
                    if (res.status === 200) {
                        //  add 拿掉刪除畫面上的照片
                        for (let i = 0; i < self.serviceData.length; i += 1) {
                            let index = res.data.findIndex(x => x.Id === self.serviceData[i].Id);

                            if (index > -1) {
                                delete self.serviceData[i];
                            }
                        }
                        // $rootScope.$emit('albumData', self.serviceData);
                        self.delAlbum = [];
                        showMessage($translate('album.album.delOk'));
                    }
                }, () => {
                    showMessage($translate('album.album.delError'));
                });

                mdDialog.hide();
            };
        }
    };
    // 相簿 click
    self.getAlbumPhoto = (event, arrayObj) => {
        $mdDialog.show({
            locals: {
                photo: arrayObj
            },
            controller: [
                '$mdDialog',
                'photo',
                PictureController
            ],
            templateUrl: 'viewPhoto.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: true,
            controllerAs: 'vm'
        });

        function PictureController(mdDialog, photo) {
            const vm = this;
            vm.delPhoto = [];
            let odata = [];
            vm.albumsTitle = photo ? photo.AlbumName : $translate('album.album.trash');
            vm.Url = SettingService.getServerUrl();

            let page = 1;
            let maxpage = 0;
            let limit = 10;
            vm.loading = true;


            if (vm.albumsTitle !== $translate('album.album.trash')) {
                AlbumService.getPhotoByAlbumId(photo.Id).then((q) => {
                    let data = q.data.filter(x => x.Status !== 'Deleted');
                    vm.loading = false;
                    vm.albums = _.chain(data)
                        .sort((a, b) => {
                            if (a.CreatedTime < b.CreatedTime) return 1;
                            return -1;
                        })
                        .groupBy((x) => {
                            if (x.ModifiedTime) {
                                return moment(x.ModifiedTime).format('YYYY-MM-DD');
                            }
                            return moment(x.CreatedTime).format('YYYY-MM-DD');
                        })
                        .mapValues((val, key) => {
                            return {
                                time: key,      // 時間
                                items: val.map((x) => {
                                    let o = Object.assign({}, x);
                                    o.selected = false;
                                    return o;
                                }),
                                selected: false     // 選擇
                            };
                        }).value();
                    console.log(vm.albums);
                }, () => {
                    vm.loading = false;
                });
            } else {
                AlbumService.getTrashByPatientId($stateParams.patientId, page, limit, true).then((q) => {
                    maxpage = parseInt(q.data.Total / limit) + 1; // 總頁數
                    if (q.data.Total % limit === 0) {
                        maxpage -= 1;
                    }
                    if (q.data.Total > 0) {
                        vm.bin = q.data.Results;

                        vm.albums = _.chain(q.data.Results)
                            .sort((a, b) => {
                                if (a.CreatedTime < b.CreatedTime) return 1;
                                return -1;
                            })
                            .groupBy((x) => {
                                if (x.ModifiedTime) {
                                    return moment(x.ModifiedTime).format('YYYY-MM-DD');
                                }
                                return moment(x.CreatedTime).format('YYYY-MM-DD');

                            })
                            .mapValues((val, key) => {
                                return {
                                    time: key,      // 時間
                                    items: val.map((x) => {
                                        let o = Object.assign({}, x);
                                        o.selected = false;
                                        return o;
                                    }),
                                    selected: false     // 選擇
                                };
                            }).value();
                    } else {
                        vm.bin = null;
                    }
                    vm.loading = false;
                }, () => {
                    vm.loading = false;
                });
            }

            // 讀取照片
            vm.nextPage = () => {
                if (vm.loading && vm.albumsTitle !== $translate('album.album.trash')) {
                    return;
                }
                vm.loading = true;
                page += 1;
                if (page > maxpage) {
                    vm.loading = false;
                    return;
                }
                AlbumService.getTrashByPatientId($stateParams.patientId, page, limit, true).then((q) => {
                    if (q.data.Total > 0) {
                        vm.bin = vm.bin.concat(q.data.Results);
                        vm.loading = false;
                        vm.albums = _.chain(vm.bin)
                            .sort((a, b) => {
                                if (a.CreatedTime < b.CreatedTime) return 1;
                                return -1;
                            })
                            .groupBy((x) => {
                                if (x.ModifiedTime) {
                                    return moment(x.ModifiedTime).format('YYYY-MM-DD');
                                }
                                return moment(x.CreatedTime).format('YYYY-MM-DD');

                            })
                            .mapValues((val, key) => {
                                return {
                                    time: key,      // 時間
                                    items: val.map((x) => {
                                        let o = Object.assign({}, x);
                                        o.selected = false;
                                        return o;
                                    }).sort((a, b) => {
                                        if (a.CreatedTime < b.CreatedTime) return -1;
                                        return 1;
                                    }),
                                    selected: false     // 選擇
                                };
                            }).value();
                    } else {
                        vm.bin = null;
                    }
                });
            };

            // 單選照片，和計算勾選數目， 用Id 判斷
            vm.checkPictureBox = (event, array) => {
                if (event.currentTarget.checked) {
                    vm.delPhoto.push(array.Id);
                } else {

                    let index = vm.delPhoto.indexOf(array.Id);

                    if (index > -1) {
                        vm.delPhoto.splice(index, 1);
                    }
                }

                array.selected = event.currentTarget.checked;
            };
            // 選取時間，多選照片，用Id 判斷
            vm.checkTimeGroup = (event, array) => {
                // 勾選判斷
                vm.albums[array.time].items.forEach((v) => {
                    v.selected = event.currentTarget.checked;
                    if (v.selected) {
                        vm.delPhoto.push(v.Id);
                    } else {
                        let index = vm.delPhoto.indexOf(v.Id);

                        if (index > -1 && !v.selected) {
                            vm.delPhoto.splice(index, 1);
                        }
                    }
                });

                // 過濾重複勾選
                let x = vm.delPhoto.reduce((a, b) => {
                    if (a.indexOf(b) < 0) {
                        a.push(b);
                    }
                    return a;
                }, []);

                vm.delPhoto = x;
            };

            vm.hide = function hide() {
                mdDialog.hide();
            };

            vm.cancel = function cancel() {
                mdDialog.cancel();
            };
            // 還原
            vm.restore = () => {
                // 刪除照片 API
                AlbumService.updateStatus('Normal', vm.delPhoto).then((res) => {
                    if (res.status === 200) {
                        // 畫面整理，不call API 較節省資源

                        // dialog 畫面更新
                        vm.albums = _.chain(odata)
                            .sort((a, b) => {
                                if (a.CreatedTime < b.CreatedTime) return 1;
                                return -1;
                            })
                            .groupBy((x) => {
                                if (x.ModifiedTime) {
                                    return moment(x.ModifiedTime).format('YYYY-MM-DD');
                                }
                                return moment(x.CreatedTime).format('YYYY-MM-DD');

                            })
                            .filter(x => x.Status !== 'Deleted')
                            .mapValues((val, key) => {
                                return {
                                    time: key,      // 時間
                                    items: val.map((x) => {
                                        let o = Object.assign({}, x);
                                        o.selected = false;
                                        return o;
                                    }).sort((a, b) => {
                                        if (a.CreatedTime < b.CreatedTime) return 1;
                                        return -1;
                                    }),
                                    selected: false     // 選擇
                                };
                            }).value();

                        // // 畫面更新，資料操作
                        firstLoading();

                    }
                });
                mdDialog.hide();
            };

            vm.moveGarbage = () => {
                // 刪除照片 API
                AlbumService.updateStatus('Deleted', vm.delPhoto).then((res) => {
                    if (res.status === 200) {
                        vm.delPhoto.forEach((x) => {
                            let index = odata.findIndex(v => v.Id === x);

                            if (index > -1) {
                                odata[index].Status = 'Deleted';
                            }
                        });

                        // dialog 畫面更新 等API 目前擬
                        vm.albums = _.chain(odata)
                            .sort((a, b) => {
                                if (a.CreatedTime < b.CreatedTime) return 1;
                                return -1;
                            })
                            .groupBy((x) => {
                                if (x.ModifiedTime) {
                                    return moment(x.ModifiedTime).format('YYYY-MM-DD');
                                }
                                return moment(x.CreatedTime).format('YYYY-MM-DD');

                            })
                            .filter(x => x.Status !== 'Deleted')
                            .mapValues((val, key) => {
                                return {
                                    time: key,      // 時間
                                    items: val.map((x) => {
                                        let o = Object.assign({}, x);
                                        o.selected = false;
                                        return o;
                                    }),
                                    selected: false     // 選擇
                                };
                            }).value();


                        // 畫面更新，資料操作
                        console.log(AlbumService.photoData());
                        firstLoading();
                        // $rootScope.$emit('albumData', AlbumService.photoData());

                    }
                });

                mdDialog.hide();
            };


            // get picture
            vm.getPicture = (event, Id) => {
                $mdDialog.show({
                    locals: {
                        photo: Id
                    },
                    controller: [
                        '$mdDialog',
                        'photo',
                        PictureController
                    ],
                    template: phtotShow, // 'getPicture.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    bindToController: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });

                function PictureController(mdDialog, photo) {
                    const vm = this;
                    console.log('dialog 測試 albumList', photo);
                    vm.showAddNewAlbum = false;
                    vm.title = $translate('album.album.modifyPicture');
                    vm.other = $translate('album.album.otherAlbum');
                    vm.data = photo;
                    vm.pictureSrc = `${SettingService.getServerUrl()}/Upload/GetImage/${vm.data.FileName}`;
                    vm.loading = true;
                    vm.innerWidth = Math.round($window.innerWidth * 0.8);

                    AlbumService.getAlbumByPatientId($stateParams.patientId).then((q) => {
                        vm.defaultGroup = [];
                        vm.defaultGroup.push({ AlbumName: null, AlbumId: null });
                        if (q.data.length > 0) {
                            q.data.forEach((x, index) => {
                                vm.defaultGroup.push({ AlbumName: x.AlbumName, AlbumId: x.Id });
                            });
                        }
                        // vm.defaultGroup.push({ AlbumName: $translate('album.album.otherAlbum'), AlbumId: null });
                        vm.loading = false;
                    }, () => {
                        vm.loading = false;
                    });

                    // 新增相簿
                    vm.addNewAlbum = () => {
                        console.log('點擊 新增相簿');
                        if (vm.showAddNewAlbum) {
                            // 新增相簿
                            vm.showAddNewAlbum = false;
                        } else {
                            // 取消新增相簿
                            vm.showAddNewAlbum = true;
                        }
                    };

                    vm.hide = function hide() {
                        mdDialog.hide();
                    };

                    vm.cancel = function cancel() {
                        mdDialog.cancel();
                    };

                    vm.ok = function ok() {
                        let selectArray = vm.defaultGroup.filter(x => x.AlbumName === vm.data.AlbumName);

                        // 當相簿名稱為未知相簿，(自己KEY的)
                        if (vm.showAddNewAlbum && vm.newAlbum) {
                            vm.data.AlbumName = vm.newAlbum;
                            delete vm.data.AlbumId;
                            console.log('修改完相片 新增相簿', vm.data);
                        } else if (!vm.showAddNewAlbum && selectArray.length > 0) {
                            vm.data = Object.assign({}, vm.data, selectArray[0]);
                            console.log('修改完相片 選相簿', vm.data);
                        } else {
                            // 清空：AlbumName, AlbumId
                            delete vm.data.AlbumName;
                            delete vm.data.AlbumId;
                            console.log('修改完相片 雙無', vm.data);
                        }

                        console.log('修改完相片 selectArray：', selectArray);

                        // // 當相簿名稱為未知相簿，(自己KEY的)
                        // if (vm.newAlbum) {
                        //     vm.data.AlbumName = vm.newAlbum;
                        //     delete vm.data.AlbumId;
                        // }
                        // // if (selectArray.length === 0) {
                        // //     delete vm.data.AlbumId;
                        // // }

                        // vm.data = Object.assign({}, vm.data, selectArray[0]);

                        console.log('修改完相片 vm.data：', vm.data);

                        AlbumService.put(vm.data).then((res) => {
                            if (res.status === 200) {
                                showMessage($translate('album.album.modifyOk'));
                                // 這裡先暫時做重讀一次
                                firstLoading();
                            }
                        });

                        mdDialog.hide();
                    };
                }

            };
        }

    };

}

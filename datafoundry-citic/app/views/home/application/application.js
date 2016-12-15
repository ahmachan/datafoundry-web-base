/**
 * Created by jxy on 16/8/30.
 */
angular.module('home.application', [
    {
        files: [
            'views/home/application/application.css'
        ]
    }
])
    .filter('imagefilter', function () {
        // 分类过滤器
        return function (items, condition) {
            var filtered = [];
            if (condition === undefined || condition === '') {
                return items;
            }
            if (condition.name === '') {
                return items;
            }
            angular.forEach(items, function (item) {
                if (condition.class === item.class) {
                    filtered.push(item);
                }
            });
            //console.log(filtered);
            return filtered;

        };
    })
    .controller('applicationCtrl', ['$scope', '$log', '$state', '$rootScope', 'saas', '$http', '$filter', function ($scope, $log, $state, $rootScope, saas, $http, $filter) {
        //$scope.grid = {
        //    active : 1,
        //    hotimglist :1,
        //    total : '',
        //    page : 1,
        //    size : 8,
        //
        //}
        $scope.grid = {
            page: 1,
            repertoryspage: 1,
            imagecenterpage: 1,
            size: 8,
            copytest: {},
            search: false,
            active : 1,
            hotimglist :1,
            txt : ''
        };
        ////////////SAAS,镜像切换
        $scope.changeTb = function(num){
            if(num == 1){
                $scope.grid.active = 1
            }else if(num == 2){
                $scope.grid.active = 2
            }
        }
        ////// 热门镜像排行切换
        $scope.changehotTab = function(idx){
            if(idx == 1){
                $scope.grid.hotimglist = 1
            }else if(idx == 2){
                $scope.grid.hotimglist = 2
            }
        }
        //$scope.howSaas = function(){
        //    simpleAlert.open('申请使用说明','您申请服务之后，通过创建用户自定义后端服务实例来集成自己的服务以及SaaS服务.');
        //}
        //$scope.howpushimg = function(){
        //    simpleAlert.open('拉取镜像说明','<p>11<p/><p>22<p/>');
        //}
        $scope.checkcollect = function(){
            if(!$rootScope.user){
                $state.go('login');
            }else{
                alert(1);
            }
        }
        $scope.$watch('grid.txt', function (n, o) {
            if (n == o) {
                return
            }
            if (n) {
                $scope.saas=$scope.saascopy
                var obj= {
                    category:[
                        {name:"email",obj:[]},
                        {name:"storage",obj:[]}
                    ]
                }
                var txt = n.replace(/\//g, '\\/');
                var reg = eval('/' + txt + '/i');
                angular.forEach($scope.saas.category, function (items,i) {
                    angular.forEach(items.obj, function (item,k) {
                        if (reg.test(item.name)) {
                            obj.category[i].obj.push(item);
                        }
                    })
                })
                $scope.saas=obj;
                //$scope.diyservice=arr;
            }else if(n==""){
                $scope.saas=$scope.saascopy
            }

        })
        /////创建saas服务
        $scope.createsaas = function (name) {
            if (!$rootScope.user) {
                $state.go('login', {type: 'saas', name: name});
            } else {
                $state.go('console.create_saas', {name: name});
            }
        }
        ///////部署镜像
        //$scope.deployimg = function(){
        //    if(!$rootScope.user){
        //        $state.go('login',{type : 'image',name : 'aaa'+':latest'+':registryjump'});
        //    }else{
        //        $state.go('console.service_create',{image:'aaa'+':latest'+':registryjump'});
        //    }
        //}
        var test = function(){
            saas.get({},function(data){
                //console.log('------------------',data);
            })
        }

        test();

        ///////监控翻页
        $scope.$watch('grid.imagecenterpage', function (newVal, oldVal) {
            if (newVal != oldVal) {
                if ($scope.grid.search) {
                    imagecenterrefresh(newVal, 'search');
                } else {
                    imagecenterrefresh(newVal);
                }
            }
        });
        //////镜像中心分页
        var imagecenterrefresh = function (page, type) {
            //console.log(page);
            var skip = (page - 1) * $scope.grid.size;
            if (type == 'search') {
                //console.log($scope.typeimagecenter);
                $scope.grid.search = true;
                $scope.imagecenter = $scope.grid.cenimagecopy.slice(skip, skip + $scope.grid.size);
                $scope.grid.imagecentertotal = $scope.grid.cenimagecopy.length;
                angular.forEach($scope.imagecenter, function (image, k) {
                    $http.get('/registry/api/repositories/manifests', {
                            //timeout: end.promise,
                            params: {
                                repo_name: image.name,
                                tag: 'latest'
                            }
                        })
                        .success(function (docdata) {
                            image.lasttag = docdata;
                        }).error(function (err) {
                        image.canbuid = false;
                    })

                })

            } else if (type == 'tag' || $scope.cententtype == 'type') {
                $scope.imagecenter = $scope.typeimagecenter.slice(skip, skip + $scope.grid.size);
                $scope.grid.imagecentertotal = $scope.typeimagecenter.length;
                angular.forEach($scope.imagecenter, function (image, k) {
                    $http.get('/registry/api/repositories/manifests', {
                            //timeout: end.promise,
                            params: {
                                repo_name: image.name,
                                tag: 'latest'
                            }
                        })
                        .success(function (docdata) {
                            image.lasttag = docdata;
                        }).error(function (err) {
                        image.canbuid = false;
                    })

                })
            } else {
                $scope.imagecenter = $scope.imagecentercopy.slice(skip, skip + $scope.grid.size);
                $scope.grid.imagecentertotal = $scope.imagecentercopy.length;
                angular.forEach($scope.imagecenter, function (image, k) {
                    $http.get('/registry/api/repositories/manifests', {
                            //timeout: end.promise,
                            params: {
                                repo_name: image.name,
                                tag: 'latest'
                            }
                        })
                        .success(function (docdata) {
                            image.lasttag = docdata;
                        }).error(function (err) {
                        image.canbuid = false;
                    })

                })

            }
        };

        //镜像中心搜索
        $scope.imagecenterreg = function (key, txt, event) {
            $scope.cententsearch = 'search';
            if (event) {
                if (event.keyCode == 13) {

                    if (!txt) {
                        $scope.cententsearch = false;
                        $scope.grid.search = false;
                        imagecenterrefresh(1);
                        return;
                    }
                    var imagearr = [];
                    txt = txt.replace(/\//g, '\\/');
                    var reg = eval('/' + txt + '/');
                    //console.log($scope.typeimagecenter,$scope.cententtype);
                    if ($scope.cententtype == 'type') {
                        for (var i = 0; i < $scope.typeimagecenter.length; i++) {
                            //console.log($scope.typeimagecenter[i].name);
                            if (reg.test($scope.typeimagecenter[i].name)) {
                                //console.log($scope.typeimagecenter[i].name);
                                imagearr.push($scope.typeimagecenter[i]);
                            }
                        }

                    } else {
                        for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                            //console.log($scope.imagecentercopy[i].name);
                            if (reg.test($scope.imagecentercopy[i].name)) {
                                imagearr.push($scope.imagecentercopy[i]);
                            }
                        }
                    }
                    //console.log(imagearr);
                    $scope.imagecenter = imagearr;
                    $scope.grid.cenimagecopy = angular.copy($scope.imagecenter);
                    imagecenterrefresh(1, 'search');
                }
            } else {
                if (!txt) {
                    $scope.cententsearch = false;
                    $scope.grid.search = false;
                    imagecenterrefresh(1);
                    return;
                }
                var imagearr = [];
                txt = txt.replace(/\//g, '\\/');
                var reg = eval('/' + txt + '/');
                if ($scope.cententtype == 'type') {
                    for (var i = 0; i < $scope.typeimagecenter.length; i++) {
                        if (reg.test($scope.typeimagecenter[i].name)) {
                            imagearr.push($scope.typeimagecenter[i]);
                        }
                    }
                } else {
                    for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                        if (reg.test($scope.imagecentercopy[i].name)) {
                            imagearr.push($scope.imagecentercopy[i]);
                        }
                    }
                }
                $scope.imagecenter = imagearr;
                $scope.grid.cenimagecopy = angular.copy($scope.imagecenter);
                imagecenterrefresh(1, 'search');
            }
        }
        //镜像中心
        $scope.serviceper = [{name: 'Datafoundry官方镜像', class: 'df'}, {name: 'Docker官方镜像', class: 'doc'}]

        $scope.imagecenterDF = [];

        $scope.imagecenterDoc = [];

        $http.get('/registry/api/repositories', {params: {project_id: 1}})
            .success(function (docdata) {
                angular.forEach(docdata, function (docitem, i) {
                    $scope.imagecenterDoc.push({
                        name: docitem,
                        lasttag: null,
                        canbuild: true,
                        class: 'doc'
                    });
                })
                $http.get('/registry/api/repositories', {
                        //timeout: end.promise,
                        params: {project_id: 58}
                    })
                    .success(function (dfdata) {
                        angular.forEach(dfdata, function (dfitem, k) {
                            $scope.imagecenterDF.push({
                                name: dfitem,
                                lasttag: null,
                                canbuild: true,
                                class: 'df'
                            });
                        });
                        $scope.imagecenterpoj = $scope.imagecenterDoc.concat($scope.imagecenterDF);
                        //console.log('imagecenterpoj', $scope.imagecenterpoj);
                        $scope.imagecentercopy = angular.copy($scope.imagecenterpoj);
                        $scope.grid.imagecentertotal = $scope.imagecentercopy.length
                        imagecenterrefresh(1);

                    })
            }).error(function (err) {

        })

        $scope.isComplete = '';

        $scope.selectsc = function (tp, key) {
            if (!$scope.imagecentercopy) {
                return
            }
            //console.log(key);
            $scope.cententtype = 'type'

            if (key == 'doc') {
                $scope.isComplete = {class: 'doc'};
                if ($scope.cententsearch == 'search') {
                    $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                } else {
                    $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                }

                $scope.grid.imagecentertotal = $scope.imagecenter.length;
                //console.log($scope.imagecenter);
                $scope.grid.imagecenterpage = 1
                imagecenterrefresh(1, 'tag');
            } else {
                $scope.isComplete = {class: 'df'};
                //console.log($scope.imagecenter);
                if ($scope.cententsearch == 'search') {
                    $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                } else {
                    $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                }
                $scope.grid.imagecentertotal = $scope.imagecenter.length;
                //$scope.grid.imagecentertotal = $scope.imagecenter.length;
                //imagecenterrefresh(1);
                $scope.grid.imagecenterpage = 1
                imagecenterrefresh(1, 'tag');
            }
            if (key == $scope.grid[tp]) {
                $scope.cententtype = false
                key = 'all';
                $scope.isComplete = '';
                if ($scope.cententsearch == 'search') {
                    //alert(11)
                    $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                } else {

                    $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter = angular.copy($scope.imagecenter);
                }
                //$scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                //console.log($scope.imagecenter);
                $scope.grid.imagecentertotal = $scope.imagecenter.length;
                $scope.grid.imagecenterpage = 1;
                imagecenterrefresh(1, 'tag');

            }
            $scope.grid[tp] = key;

        }


        //////////////////////////saas
        Array.prototype.unique = function () {
            this.sort(); //先排序
            var res = [this[0]];
            for (var i = 1; i < this.length; i++) {
                if (this[i] !== res[res.length - 1]) {
                    res.push(this[i]);
                }
            }
            return res;
        }
        $scope.saas = {
            category: [],
            provider: [],
        };
        $scope.searchname = {
            categoryname: '分类',
            providername: '提供者'
        }
        var loadsaas = function () {
            saas.get({}, function (res) {

                var item = res.data.results;

                var arr1 = []
                for (var i = 0; i < item.length; i++) {
                    arr1.push(item[i].category)
                    $scope.saas.provider.push(item[i].provider)
                }

                arr1 = arr1.unique();
                for (var i = 0; i < arr1.length; i++) {
                    $scope.saas.category[i] = {
                        name: '',
                        obj: []
                    };
                    $scope.saas.category[i].name = arr1[i];
                    for (var j = 0; j < item.length; j++) {
                        if (arr1[i] == item[j].category) {
                            $scope.saas.category[i].obj.push(item[j])
                        }
                    }

                }
                //console.log('$scope.saas.category', $scope.saas.category);
                $scope.saascopy=angular.copy($scope.saas);
                $scope.saas.provider = $scope.saas.provider.unique()
            })
        }
        loadsaas();

        /////////分类筛选
        $scope.clickcat = function(cat){
            $scope.searchname.categoryname = cat

        }
        ////////提供者筛选
        $scope.clickpro = function(pro){
            var thiscat;
            if($scope.searchname.categoryname == '分类'){
                thiscat = ''
            }else{
                thiscat = $scope.searchname.categoryname
            }
            $scope.searchname.providername = pro
            saas.get({category:thiscat,provider:pro},function(res){
                //console.log('-------cat',res);
            })
        }
        ///////saas搜索

        //$scope.search = function () {
        //    if (!$scope.secrets.txt) {
        //        return;
        //    }
        //    $scope.secrets.txt = $scope.secrets.txt.replace(/\//g, '\\/');
        //    $scope.secrets.txt = $scope.secrets.txt.replace(/\./g, '\\.');
        //    var reg = eval('/' + $scope.secrets.txt + '/');
        //    angular.forEach($scope.secretitems, function (item) {
        //        if (reg.test(item.metadata.name)) {
        //            $scope.scretspageitems.push(item);
        //        }
        //    });
        //};
        ////////////////部署镜像
        $scope.deployimg = function(obj){
            if(!$rootScope.user){
                $state.go('login',{type : 'image',name : obj});
            }else{
                $state.go('console.service_create',{image:obj});
            }
        }
    }]);

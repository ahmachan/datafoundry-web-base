'use strict';

angular.module('console.build', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/build/build.css'
        ]
    }
])
    .controller('BuildCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', 'BuildConfig', 'Build', 'GLOBAL', 'Confirm', 'Sort', 'Ws', function ($rootScope, $scope, $log, $state, $stateParams, BuildConfig, Build, GLOBAL, Confirm, Sort, Ws) {

        //分页
        $scope.grid = {
            page: 1,
            size: GLOBAL.size,
            txt: ''
        };

        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });

        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.items = $scope.data.slice(skip, skip + $scope.grid.size);
        };
        $scope.text='您还没有构建代码';
        $scope.buildsearch = function (event) {
            //if (event.keyCode === 13 || event === 'search') {
            console.log($scope.grid.txt);
            if (!$scope.grid.txt) {
                    $scope.data = angular.copy($scope.copydata)
                    refresh(1);
                    $scope.grid.total = $scope.copydata.length;
                    return;
                }else {
                    var iarr = [];
                    var str = $scope.grid.txt;
                    str = str.toLocaleLowerCase();
                    console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.copydata, function (item, i) {
                        console.log(item.build);
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                            if (nstr.indexOf(str) !== -1) {
                                iarr.push(item)
                            }
                        //console.log(repo.instance_data, $scope.grid.txt);
                    })
                    $scope.isQuery=false;
                    if(iarr.length===0){
                        $scope.isQuery=true;
                        $scope.text='没有查询到相关数据';
                        console.log($scope.items.length);
                    }
                    else{
                        $scope.text='您还没有任何代码构建数据，现在就创建一个吧';
                    }
                    $scope.data=angular.copy(iarr);
                    refresh(1);
                   // console.log('$scope.data', $scope.data);
                    $scope.grid.total = $scope.data.length;
                }
            //}
        }



        //获取buildConfig列表
        var loadBuildConfigs = function() {
            BuildConfig.get({namespace: $rootScope.namespace,region:$rootScope.region}, function(data){
                //$log.info('buildConfigs', data);
                data.items = Sort.sort(data.items, -1); //排序
                //$scope.copydata = angular.copy(data.items);
                $scope.data = data.items;
                $scope.grid.total = data.items.length;
                //console.log('$scope.data', $scope.data);
                refresh(1);
                loadBuilds($scope.data);
            }, function(res) {
                //todo 错误处理
            });
        };

        //根据buildConfig标签获取build列表
        var loadBuilds = function(items){
            var labelSelector = '';
            if (items.length > 0) {
                labelSelector = 'buildconfig in (';
                for (var i = 0; i < items.length; i++) {
                    labelSelector += items[i].metadata.name + ','
                }
                labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
            }
            Build.get({namespace: $rootScope.namespace, labelSelector: labelSelector,region:$rootScope.region}, function (data) {
                //$log.info("builds", data);

                $scope.resourceVersion = data.metadata.resourceVersion;
                watchBuilds(data.metadata.resourceVersion);

                fillBuildConfigs(data.items);
            });
        };

        var watchBuilds = function(resourceVersion){
            Ws.watch({
                resourceVersion: resourceVersion,
                namespace: $rootScope.namespace,
                type: 'builds',
                name: ''
            }, function(res){
                var data = JSON.parse(res.data);
                updateBuildConfigs(data);
            }, function(){
                $log.info("webSocket start");
            }, function(){
                $log.info("webSocket stop");
                var key = Ws.key($rootScope.namespace, 'builds', '');
                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                    return;
                }
                //watchBuilds($scope.resourceVersion);
            });
        };

        var updateBuildConfigs = function(data){
            if (data.type == 'ERROR') {
                $log.info("err", data.object.message);
                Ws.clear();
                //loadBuilds($scope.data.items);
                return;
            }

            $scope.resourceVersion = data.object.metadata.resourceVersion;
            if (data.type == 'ADDED') {

            } else if (data.type == "MODIFIED") {
                angular.forEach($scope.items, function(item, i){
                    if (!item.build) {
                        return;
                    }
                    if (item.build.metadata.name == data.object.metadata.name) {
                        $scope.items[i].build = data.object;
                    }
                });
              // console.log('$scope.items.build.status.phase',$scope.items);
            }
        };

        //填充buildConfig列表
        var fillBuildConfigs = function(items) {
            var buildMap = {};
            for (var i = 0; i < items.length; i++) {
                if (!items[i].metadata.labels) {
                    continue;
                }
                var label = items[i].metadata.labels.buildconfig;
                if (!buildMap[label]) {
                    buildMap[label] = items[i];
                    continue;
                }
                var st = (new Date(items[i].metadata.creationTimestamp)).getTime();
                if ((new Date(buildMap[label].metadata.creationTimestamp)).getTime() < st) {
                    buildMap[label] = items[i];
                }
            }
            angular.forEach($scope.data, function(item){
                var label = item.metadata.name;
                if (!buildMap[label]) {
                    return;
                }
                item.build= buildMap[label];
                //todo 构建类型
            });
            $scope.copydata = angular.copy($scope.data);
            console.log($scope.copydata);

        };

        loadBuildConfigs();

        $scope.refresh = function(){
            loadBuildConfigs();
            $scope.grid.page = 1;
            $state.reload();
        };


        //开始构建
        $scope.startBuild = function(idx) {
            var name = $scope.items[idx].metadata.name;
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({namespace: $rootScope.namespace, name: name,region:$rootScope.region}, buildRequest, function(){
                $log.info("build instantiate success");
                $state.go('console.build_detail', {name: name, from: 'create'})
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.stop = function(idx){
            Confirm.open("提示信息","您确定要终止本次构建吗？").then(function(){
                var build = $scope.items[idx].build;
                build.status.cancelled = true;
                //build.region=$rootScope.region
                Build.put({namespace: $rootScope.namespace, name: build.metadata.name,region:$rootScope.region}, build, function(res){
                    $log.info("stop build success");
                    $scope.items[idx].build = res;
                }, function(res){
                    if(res.data.code== 409){
                        Confirm.open("提示信息","当数据正在New的时候，构建不能停止，请等到正在构建时，再请求停止。");
                    }
                });
            });
        };

        $scope.$on('$destroy', function(){
            Ws.clear();
        });
    }]);


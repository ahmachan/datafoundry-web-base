'use strict';
angular.module('console.service', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/service/service.css'
            ]
        }
    ])
    .controller('ServiceCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Route', 'BackingServiceInstance', 'GLOBAL', 'Confirm', 'Sort', 'Ws', 'Pod',
        function ($rootScope, $scope, $log, $state, $stateParams, DeploymentConfig, ReplicationController, Route, BackingServiceInstance, GLOBAL, Confirm, Sort, Ws, Pod) {
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                //下面是在table render完成后执行的js
                //console.log($scope.data);

                //console.log('ok');
            });
            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            $scope.reload=function(){
                $state.reload();
            }
            var refresh = function (page) {
                //console.log(page);

                var skip = (page - 1) * $scope.grid.size;
                if ($scope.data.length) {
                    $scope.items = $scope.data.slice(skip, skip + $scope.grid.size);
                }else {
                    $scope.items=[];
                }
                $(document.body).animate({
                    scrollTop:0
                },200);


                //$log.info('$scope.items=-=-=-=-=-=',$scope.items);
                //$scope.grid.total = $scope.data.items.length;

            };
            $scope.text='您还没有部署服务';
            $scope.servicesearch = function (event) {
                if (true) {
                    if (!$scope.grid.txt) {
                        $scope.data = angular.copy($scope.copydata)
                        refresh(1);
                        $scope.grid.total = $scope.copydata.length;
                        //return;
                    } else {
                        var iarr = [];
                        var str = $scope.grid.txt;
                        str = str.toLocaleLowerCase();
                        console.log('$scope.copydata', $scope.copydata);
                        angular.forEach($scope.copydata, function (item, i) {
                            //console.log(item.build);
                            var nstr = item.metadata.name;
                            nstr = nstr.toLocaleLowerCase();
                            if (nstr.indexOf(str) !== -1) {
                                iarr.push(item)
                            }
                            //console.log(repo.instance_data, $scope.grid.txt);
                        })

                        if(iarr.length===0){
                            $scope.isQuery=true;
                            $scope.text='没有查询到相关数据';
                            console.log($scope.items.length);
                        }
                        else{
                            $scope.text='您还没有部署服务';
                        }
                        $scope.data = angular.copy(iarr);
                        refresh(1);
                        console.log('$scope.data', $scope.data);
                        $scope.grid.total = $scope.data.length;


                    }
                    console.log('$scope.data', $scope.data);
                    RouteList($scope.data);
                    loadBsi($scope.data);
                    refresh(1);
                    replicationcls($scope.data);
                    for (var i = 0; i < $scope.data.length; i++) {
                        loadPods($scope.data[i]);
                    }


                }
            }

            //$scope.search = function (key, txt) {
            //    if (!txt) {
            //        refresh(1);
            //        return;
            //    }
            //    $scope.items = [];
            //
            //    txt = txt.replace(/\//g, '\\/');
            //    txt = txt.replace(/\./g, '\\.');
            //    var reg = eval('/' + txt + '/');
            //    angular.forEach($scope.data.items, function(item){
            //        if (key == 'all') {
            //            if (reg.test(item.metadata.name) || (item.route && reg.test(item.route.spec.host)) || (item.metadata.labels && reg.test(item.metadata.labels.app))) {
            //                $scope.items.push(item);
            //            }
            //        } else if (key == 'metadata.name') {
            //            if (reg.test(item.metadata.name)) {
            //                $scope.items.push(item);
            //            }
            //        } else if (key == 'metadata.labels.app') {
            //            if (item.metadata.labels && reg.test(item.metadata.labels.app)) {
            //                $scope.items.push(item);
            //            }
            //        } else if (key == 'route') {
            //            if (item.route && reg.test(item.route.spec.host)) {
            //                $scope.items.push(item);
            //            }
            //        }
            //    });
            //    $scope.grid.total = $scope.items.length;
            //};
            var serviceList = function () {
                DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    $log.info('serviceList----', data);
                    data.items = Sort.sort(data.items, -1);
                    $scope.data = data.items;
                    //$scope.items = data.items;

                    RouteList(data.items);
                    loadBsi(data.items);
                    refresh(1);
                    replicationcls($scope.data);
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchRcs(data.metadata.resourceVersion);
                    $scope.grid.total = data.items.length;
                    angular.forEach(data.items, function (item, i) {
                        loadPods(data.items[i], data.items.length, i);
                    })
                    $scope.copydata = angular.copy($scope.data)
                    console.log('$scope.copydata', $scope.copydata);


                }, function (res) {
                    $log.info('serviceList', res);
                    //todo ������
                });
            }

            serviceList();
            var loadPods = function (itemarr, len, n) {
                //console.log('itemarritemarritemarritemarritemarr',itemarr)
                var labelSelector = 'deploymentconfig=' + itemarr.metadata.name;
                //console.log('onesb');
                Pod.get({
                    namespace: $scope.namespace,
                    labelSelector: labelSelector,
                    region: $rootScope.region
                }, function (res) {
                    itemarr.status.replicas = 0;
                    $scope.pods = res;
                    $scope.pods.items = res.items;
                    for (var i = 0; i < res.items.length; i++) {
                        $scope.pods.items[i].reason = res.items[i].status.phase;
                        if (res.items[i].status.reason != null && res.items[i].status.reason != "") {
                            $scope.pods.items[i].reason = res.items[i].status.reason;
                        }
                        if (res.items[i].status.containerStatuses) {
                            for (var j = 0; j < res.items[i].status.containerStatuses.length; j++) {
                                var container = res.items[i].status.containerStatuses[j];
                                if (container.state.waiting != null && container.state.waiting.reason != "") {
                                    $scope.pods.items[i].reason = container.state.waiting.reason
                                } else if (container.state.terminated != null && container.state.terminated.reason != "") {
                                    $scope.pods.items[i].reason = container.state.terminated.reason
                                } else if (container.state.terminated != null && container.state.terminated.reason == "") {
                                    if (container.state.terminated.signal != 0) {
                                        $scope.pods.items[i].reason = "Signal:%d" + container.state.terminated.signal;
                                    } else {
                                        $scope.pods.items[i].reason = "ExitCode:" + container.state.terminated.exitCode;
                                    }
                                }
                            }
                        }
                        if (res.items[i].metadata.deletionTimestamp != null) {
                            $scope.pods.items[i].reason = "Terminating"
                        }
                        if ($scope.pods.items[i].reason == 'Running') {
                            itemarr.status.replicas++;
                        }
                    }

                    //$log.info("$scope.dcdcdcdcdcdcdcdcd", itemarr.metadata.name+"------"+itemarr.status.replicas);
                }, function (res) {
                    //todo 错误处理
                    // $log.info("loadPods err", res);
                });
            };
            $scope.refresh = function () {
                //serviceList();
                $scope.running = true;
                DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    $log.info('serviceList----', data);
                    data.items = Sort.sort(data.items, -1);

                    //$scope.items = data.items;

                    RouteList(data.items);
                    loadBsi(data.items);
                    refresh(1);
                    replicationcls(data.items);
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchRcs(data.metadata.resourceVersion);
                    $scope.grid.total = data.items.length;
                    for (var i = 0; i < data.items.length; i++) {
                        loadPods(data.items[i]);
                    }
                    $scope.running = false;
                    $scope.data = data;


                }, function (res) {
                    $log.info('serviceList', res);
                    //todo ������
                });
                $scope.grid.page = 1;
            };
            //////pod数
            var replicationcls = function (items) {
                $log.info('replicationclsitems====', items)

                var labelSelector = '';
                if (items.length > 0) {
                    labelSelector = 'openshift.io/deployment-config.name in (';
                    for (var i = 0; i < items.length; i++) {
                        labelSelector += items[i].metadata.name + ','
                    }
                    labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
                }
                ReplicationController.get({
                    namespace: $rootScope.namespace,
                    labelSelector: labelSelector,
                    region: $rootScope.region
                }, function (data) {
                    $log.info("Replicationcontrollers", data);
                    $scope.rcs = data;
                    $scope.rcMap = {};
                    for (var i = 0; i < data.items.length; i++) {
                        $scope.rcMap[data.items[i].metadata.name] = data.items[i];
                    }
                    for (var i = 0; i < items.length; i++) {
                        var cTt = items[i].metadata.name + '-' + items[i].status.latestVersion;
                        items[i].rc = $scope.rcMap[cTt];
                    }
                    //isNormal(items);
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    //watchBuilds(data.metadata.resourceVersion);
                });
            }
            ////路由
            var RouteList = function (servicedata) {
                Route.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    $log.info("Route", data);
                    $scope.routeMap = {};
                    for (var i = 0; i < data.items.length; i++) {
                        $scope.routeMap[data.items[i].spec.to.name] = data.items[i];
                    }

                    for (var i = 0; i < servicedata.length; i++) {
                        if ($scope.routeMap[servicedata[i].metadata.name]) {
                            servicedata[i].route = $scope.routeMap[servicedata[i].metadata.name];
                        }
                    }
                });
            }

            var isNormal = function (servicedata) {
                //$log.info('servicedata---test',servicedata)
                for (var i = 0; i < servicedata.length; i++) {
                    //var dcspr = servicedata[i].spec.replicas;
                    //if(servicedata[i].rc){
                    //    var rcpsr = servicedata[i].rc.spec.replicas;
                    //    var rcstr = servicedata[i].rc.status.replicas;
                    //    if(rcpsr == rcstr && dcspr > 0 && rcstr == 0 || rcpsr == dcspr && rcstr == 0){
                    //        servicedata[i].ismn = '未启动';
                    //    }else if(rcstr == dcspr && dcspr > 0 && rcpsr == 0){
                    //        servicedata[i].ismn = '异常';
                    //    }else if(rcstr == dcspr && rcpsr == dcspr && dcspr > 0){
                    //        servicedata[i].ismn = '正常';
                    //    }else if(rcpsr < dcspr && dcspr == rcstr){
                    //        servicedata[i].ismn = '警告';
                    //    }
                    //}else{
                    //    if(dcspr > 0){
                    //        servicedata[i].ismn = '未启动';
                    //    }
                    //
                    //}
                    if (servicedata[i].spec.replicas == 0) {
                        servicedata[i].ismn = '未启动';
                    } else if (servicedata[i].spec.replicas != servicedata[i].status.replicas) {
                        servicedata[i].ismn = '异常';
                    } else if (servicedata[i].spec.replicas == servicedata[i].status.replicas) {
                        servicedata[i].ismn = '正常';
                    } else {
                        servicedata[i].ismn = '警告';
                    }
                }
            }

            var watchRcs = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'replicationcontrollers',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateRcs(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'replicationcontrollers', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchRcs($scope.resourceVersion);
                });
            };
            var updateRcs = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    serviceList();
                    return;
                }
                // if (data.type == 'DELETE') {
                //
                // }

                $scope.resourceVersion = data.object.metadata.resourceVersion;


                if (data.type == 'ADDED') {
                    $scope.rcs.items.shift(data.object);
                } else if (data.type == "MODIFIED") {
                    DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                        //$log.info('serviceList----', data);
                        //data.items = Sort.sort(data.items, -1);
                        //$scope.data = data;
                        //$scope.resourceVersion = data.metadata.resourceVersion;
                        //watchRcs(data.metadata.resourceVersion);
                        //$scope.grid.total = data.items.length;
                        for (var j = 0; j < data.items.length; j++) {
                            for (var k = 0; k < $scope.items.length; k++) {
                                if (data.items[j].metadata.name == $scope.items[k].metadata.name) {
                                    $scope.items[k].spec.replicas = data.items[j].spec.replicas
                                }
                            }
                        }
                        for (var i = 0; i < data.items.length; i++) {
                            loadPods(data.items[i]);
                        }

                    }, function (res) {
                        $log.info('serviceList', res);
                        //todo ������
                    });
                    //angular.forEach($scope.items, function(item, i){
                    //    if (item.rc.metadata.name == data.object.metadata.name) {
                    //        $scope.items[i].rc = data.object;
                    //        console.log('updatedata========',data);
                    //        console.log('$scope.items[i]-----------',$scope.items[i]);
                    //        isNormal($scope.items);
                    //        $scope.$apply();
                    //    }
                    //});
                    //


                }
            }
            $scope.$watch('items', function (n, o) {
                if (n == o) {
                    return;
                }
                isNormal($scope.items);
            }, true)
            $scope.startDc = function (idx) {
                $log.info('$scope.items[idx]$scope.items[idx]', $scope.items[idx])
                var thisRc = $scope.items[idx].rc;
                var thisDc = $scope.items[idx];
                if (thisDc.spec.replicas == 0) {
                    thisDc.spec.replicas = 1
                }
                thisRc.spec.replicas = thisDc.spec.replicas;
                ReplicationController.put({
                    namespace: $rootScope.namespace,
                    name: thisRc.metadata.name,
                    region: $rootScope.region
                }, thisRc, function (res) {
                    $scope.items[idx].rc = res;
                    //$log.info("$scope.data.items[idx].rc++++", $scope.items[idx]);
                    //$log.info("startDc dc success", res);

                }, function (res) {
                    //todo 错误处理
                    $log.info("startDc dc err", res);
                });
            };
            $scope.stopDc = function (idx) {
                var thisRc = $scope.items[idx].rc
                thisRc.spec.replicas = 0;
                ReplicationController.put({
                    namespace: $rootScope.namespace,
                    name: thisRc.metadata.name,
                    region: $rootScope.region
                }, thisRc, function (res) {
                    $scope.items[idx].rc.spec.replicas = res.spec.replicas;
                    $log.info("stopDc dc success", res);

                }, function (res) {
                    //todo 错误处理
                    $log.info("stopDc dc err", res);
                });
            };

            var loadBsi = function (dcs) {
                BackingServiceInstance.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region
                }, function (res) {
                    $log.info("backingServiceInstance", res);

                    var binds = [];

                    for (var i = 0; i < res.items.length; i++) {
                        if (!res.items[i].spec.binding) {
                            continue;
                        }
                        for (var j = 0; j < res.items[i].spec.binding.length; j++) {
                            binds.push(res.items[i].spec.binding[j].bind_deploymentconfig);
                        }
                    }

                    //console.log('===', binds)

                    for (var i = 0; i < dcs.length; i++) {
                        if (binds.indexOf(dcs[i].metadata.name) != -1) {
                            dcs[i].bsi = '已绑定';
                        } else {
                            dcs[i].bsi = '未绑定';
                        }
                    }

                    $scope.bsi = res;

                }, function (res) {
                    //todo 错误处理
                    $log.info("loadBsi err", res);
                });
            };

            $scope.$on('$destroy', function () {
                Ws.clear();
            });

        }]);
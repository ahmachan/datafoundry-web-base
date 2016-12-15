'use strict';
angular.module('console.resource_management', [
        {
            files: [
                'components/searchbar/searchbar.js',
            ]
        }
    ])
    .controller('resmanageCtrl', ['$log', 'Ws', 'DeploymentConfig', 'persistent', '$state', '$rootScope', '$scope', 'configmaps', 'secretskey',
        function ($log, Ws, DeploymentConfig, persistent, $state, $rootScope, $scope, configmaps, secretskey) {
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            //type=persistent_volume
            $scope.secrets = {
                page: 1,
                size: 10,
                txt: ''
            };

            if ($state.params.index) {
                console.log($state.params.index);
                $scope.check = $state.params.index
            } else {
                $scope.check = false
            }

            $scope.$watch('grid.rmpage', function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return
                }
                if (newVal !== oldVal) {
                    rmrefresh(newVal);
                }
            });

            var rmrefresh = function (page) {
                var skip = (page - 1) * $scope.grid.size;
                //console.log($scope.persistentdata);
                $scope.persistents = $scope.persistentdata.slice(skip, skip + $scope.grid.size)||[];

            };

            $scope.constantlyvolume = function () {
                $scope.grid.constantlyvolume = true;
                persistentlist('nows');
                $state.reload();
            }

            function persistentlist(nows) {
                persistent.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region
                }, function (res) {

                    DeploymentConfig.get({
                        namespace: $rootScope.namespace,
                        region: $rootScope.region
                    }, function (resdc) {
                        console.log('dc',resdc);
                        $scope.grid.constantlyvolume = false;
                        console.log(res.items, 1);
                        angular.forEach(res.items, function (volitem, i) {
                            res.items[i].arr = []
                            angular.forEach(resdc.items, function (dcitem, k) {
                                angular.forEach(dcitem.spec.template.spec.volumes, function (dcvolitem, j) {
                                    if (dcvolitem.persistentVolumeClaim && volitem.metadata.name == dcvolitem.persistentVolumeClaim.claimName) {
                                        res.items[i].arr.push(dcitem.metadata.name)
                                    }
                                })
                                //volitem.metadata.name==dcitem.spec.template.spec.volumes
                            })
                        });

                        if (res.items && res.items.length > 0) {
                            angular.forEach(res.items, function (item, i) {
                                if (item.arr.length > 0) {
                                    res.items[i].status.phase = 'band'
                                }
                                res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                            })
                            //console.log($scope.items);

                            res.items.sort(function (x, y) {
                                return x.sorttime > y.sorttime ? -1 : 1;
                            });

                            $scope.resourceVersion = res.metadata.resourceVersion;

                            if (!nows) {
                                watchPc(res.metadata.resourceVersion);
                            }
                            //物理刷新不重启ws
                            $scope.persistentdata = res.items;

                            //console.log('chijiu', res);
                        }else {
                            $scope.persistentdata=[];

                        }
                        $scope.grid.rmtotal = $scope.persistentdata.length;
                        $scope.cpoypersistents = angular.copy($scope.persistentdata)
                        $scope.grid.rmpage = 1;
                        $scope.grid.rmtxt = '';
                        rmrefresh(1);

                    })


                }, function (err) {

                });
            }

            persistentlist()

            var watchPc = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'persistentvolumeclaims',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updatePC(data);
                    //console.log(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'persistentvolumeclaims', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchPc($scope.resourceVersion);
                });
            };

            var updatePC = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    persistentlist();
                    return;
                }
                // if (data.type == 'DELETE') {
                //
                // }

                $scope.resourceVersion = data.object.metadata.resourceVersion;

                if (data.type == 'ADDED') {
                    //$scope.rcs.items.push(data.object);
                } else if (data.type == "MODIFIED") {
                    //console.log(data);
                    angular.forEach($scope.persistents.items, function (item, i) {

                        if (item.metadata.name == data.object.metadata.name) {

                            $scope.persistents.items[i] = data.object
                            //$scope.persistents.items[i].status.phase=data.object.status.phase
                            //$scope.persistents[i]=data.object;
                            $scope.$apply();
                        }
                    })
                    //console.log('ws',$scope.persistents.items);
                    //angular.forEach($scope.items, function(item, i){
                    //    if (item.rc.metadata.name == data.object.metadata.name) {
                    //        $scope.items[i].rc = data.object;
                    //        console.log('updatedata========',data);
                    //        console.log('$scope.items[i]-----------',$scope.items[i]);
                    //        //isNormal($scope.items);
                    //        $scope.$apply();
                    //    }
                    //});


                }
            }
            $scope.text='您还没有创建持久化卷';
            $scope.rmsearch = function (event) {
                if (true) {
                    if (!$scope.grid.rmtxt) {
                        $scope.persistentdata = angular.copy($scope.cpoypersistents)
                        rmrefresh(1);
                        $scope.grid.rmtotal = $scope.cpoypersistents.length;
                        return;
                    }
                    $scope.persistentdata = [];

                    var iarr = [];
                    var str = $scope.grid.rmtxt;
                    str = str.toLocaleLowerCase();
                    //console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.cpoypersistents, function (item, i) {
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
                    }
                    else{
                        $scope.text='您还没有创建持久化卷';
                    }
                    $scope.persistentdata=angular.copy(iarr);
                    rmrefresh(1);
                    //console.log('$scope.data', $scope.configdata);
                    $scope.grid.rmtotal = $scope.persistentdata.length;
                }

            };

            ////////////////  配置卷

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });

            var refresh = function (page) {
                var skip = (page - 1) * $scope.grid.size;
                $scope.configitems = $scope.configdata.slice(skip, skip + $scope.grid.size)||[];

            };

            $scope.$on('$destroy', function () {
                Ws.clear();
            });

            $scope.loadconfigmaps = function () {
                configmaps.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
                    //console.log(res);
                    if (res.items && res.items.length > 0) {
                        angular.forEach(res.items, function (item, i) {
                            res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                        })
                        //console.log($scope.items);
                        res.items.sort(function (x, y) {
                            return x.sorttime > y.sorttime ? -1 : 1;
                        });
                        if (!res.items) {
                            $scope.configdata = [];
                        } else {
                            $scope.configdata = res.items;
                        }
                        $scope.copyconfigdata = angular.copy($scope.configdata)
                        $scope.grid.total = $scope.configdata.length;
                        $scope.grid.page = 1;
                        $scope.grid.txt = '';
                        refresh(1);
                    }


                })

            }

            $scope.newreload=function(){
                $state.go('console.resource_management',{index:2},{reload:true});
               // console.log('nima');
            }
            $scope.text2='您还没有创建配置卷';
            $scope.search = function (event) {
                if (true) {
                    if (!$scope.grid.txt) {
                        $scope.configdata = angular.copy($scope.copyconfigdata)
                        refresh(1);
                        $scope.grid.total = $scope.configdata.length;
                        return;
                    }
                    $scope.configdata = [];

                    var iarr = [];
                    var str = $scope.grid.txt;
                    str = str.toLocaleLowerCase();
                    //console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.copyconfigdata, function (item, i) {
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
                        $scope.text2='没有查询到相关数据';

                    }
                    else{
                        $scope.text2='您还没有创建配置卷';
                    }
                    $scope.configdata=angular.copy(iarr);
                    refresh(1);
                    //console.log('$scope.data', $scope.configdata);
                    $scope.grid.total = $scope.configdata.length;
                }
            };

            $scope.loadconfigmaps();

            //////////////////////////密钥

            $scope.loadsecrets = function () {
                secretskey.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
                    //console.log('-------loadsecrets', res);
                    if (res.items && res.items.length > 0) {
                        angular.forEach(res.items, function (item, i) {
                            res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                        })
                        //console.log(res.items);
                        //console.log($scope.items);
                        res.items.sort(function (x, y) {
                            return x.sorttime > y.sorttime ? -1 : 1;
                        });
                        if (res.items) {
                            $scope.secretdata = res.items;
                        } else {
                            $scope.secretdata = []
                        }
                        $scope.copysecretdata = angular.copy($scope.secretdata);
                        $scope.secrets.total = $scope.secretdata.length;
                        $scope.secrets.page = 1;
                        $scope.secrets.txt = '';
                        secretrefresh(1);
                    }

                })
            }
            $scope.secretReload=function(){
                $state.go('console.resource_management',{'index':3},{reload:true})
            }
            $scope.loadsecrets();

            $scope.$watch('secrets.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    secretrefresh(newVal);
                }
            });

            var secretrefresh = function (page) {
                var skip = (page - 1) * $scope.grid.size;
                $scope.secretitems = $scope.secretdata.slice(skip, skip + $scope.secrets.size)||[];
                //$scope.secrets.total = $scope.secretitems.length;
            };
            $scope.text3=' 您还没有创建密钥';
            $scope.scretssearch = function (event) {
                if (true) {
                    if (!$scope.secrets.txt) {
                        $scope.secretdata = angular.copy($scope.copysecretdata);
                        secretrefresh(1);
                        $scope.secrets.total = $scope.secretdata.length;
                        return;
                    }
                    $scope.secretdata = [];

                    var iarr = [];
                    var str = $scope.secrets.txt;
                    str = str.toLocaleLowerCase();
                    //console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.copysecretdata, function (item, i) {
                        //console.log(item.build);
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                        if (nstr.indexOf(str) !== -1) {
                            iarr.push(item)
                        }
                        //console.log(repo.instance_data, $scope.grid.txt);
                    })
                    if(iarr.length===0){
                        $scope.text3='没有查询到相关数据';
                    }
                    else{
                        $scope.text3='您还没有创建密钥';
                    }
                    $scope.secretdata=angular.copy(iarr);
                    secretrefresh(1);
                    console.log('$scope.data', $scope.secretdata);
                    $scope.secrets.total = $scope.secretdata.length;
                }

            };
        }])